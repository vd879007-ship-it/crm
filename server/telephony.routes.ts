import { Router } from 'express';
import twilio from 'twilio';
import axios from 'axios';
import { makeOutboundPhoneCall, normalizeIndianPhoneNumber, hangupActiveCall, generateTwilioClientVoiceToken } from './services/telephonyService';
import { getFirebaseFirestore, isFirebaseConfigured } from './firebase';

const router = Router();

// In-memory cache fallback for fast access & local development
let cachedTelephonyLogs: any[] = [];

/**
 * POST /api/call - Trigger real outbound call to an Indian mobile number
 */
router.post('/call', async (req, res) => {
  try {
    const { phoneNumber, agentNumber, contactName, agentName, customMessage, callMode } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required. Please enter a valid Indian mobile number (e.g. +91 9585575354).'
      });
    }

    // Trigger Outbound Telephony Call
    const result = await makeOutboundPhoneCall({
      phoneNumber,
      agentNumber: agentNumber || '+919585575354',
      contactName: contactName || 'Prospect',
      agentName: agentName || 'CRM Representative',
      customMessage,
      callMode: callMode || 'bridge'
    });

    // Save into cache for instant UI feedback
    const logItem = {
      id: result.callId,
      callId: result.callId,
      providerCallId: result.providerCallId,
      contactName: result.contactName,
      phoneNumber: result.phoneNumber,
      direction: 'Outbound',
      durationSeconds: 0,
      status: 'initiated',
      agentName: agentName || 'CRM Agent',
      sentiment: 'Positive',
      notes: result.message,
      hasRecording: true,
      createdAt: result.timestamp
    };
    cachedTelephonyLogs.unshift(logItem);

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('API /api/call Error:', error);
    return res.status(400).json({
      success: false,
      error: error.message || 'Failed to initiate outbound telephone call.'
    });
  }
});

/**
 * POST /api/call/end - Immediately hang up / cut active phone call on carrier network
 */
router.post('/call/end', async (req, res) => {
  try {
    const { providerCallId, callId, durationSeconds } = req.body;
    console.log(`[Telephony Hangup Request] ProviderCallId: ${providerCallId} CallId: ${callId}`);

    if (providerCallId) {
      await hangupActiveCall(providerCallId);
    }

    // Update cache
    const index = cachedTelephonyLogs.findIndex(c => c.providerCallId === providerCallId || c.callId === callId);
    if (index !== -1) {
      cachedTelephonyLogs[index].status = 'completed';
      if (durationSeconds) cachedTelephonyLogs[index].durationSeconds = Number(durationSeconds);
    }

    // Update Firestore
    if (isFirebaseConfigured() && providerCallId) {
      try {
        const db = getFirebaseFirestore();
        const snap = await db.collection('telephony_calls').where('providerCallId', '==', providerCallId).limit(1).get();
        if (!snap.empty) {
          await snap.docs[0].ref.update({
            status: 'completed',
            durationSeconds: Number(durationSeconds) || 0,
            endedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
      } catch (fbErr) {
        console.warn('Firestore call end sync warning:', fbErr);
      }
    }

    return res.json({ success: true, message: 'Call disconnected successfully.' });
  } catch (err: any) {
    console.error('Hangup API error:', err);
    return res.status(500).json({ error: err.message || 'Failed to hangup call.' });
  }
});

/**
 * GET /api/call/logs - Fetch call logs from Firestore with Twilio recording sync
 */
router.get('/call/logs', async (req, res) => {
  try {
    let resultLogs: any[] = [];

    if (isFirebaseConfigured()) {
      try {
        const db = getFirebaseFirestore();
        const snap = await db.collection('telephony_calls').orderBy('createdAt', 'desc').limit(50).get();
        resultLogs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch (fbErr) {
        console.warn('Firestore call logs fetch warning:', fbErr);
      }
    }

    if (resultLogs.length === 0) {
      resultLogs = [...cachedTelephonyLogs];
    }

    // Optionally check Twilio for latest recordings to enrich logs
    const apiKey = process.env.TELEPHONY_API_KEY || process.env.TWILIO_ACCOUNT_SID;
    const apiSecret = process.env.TELEPHONY_API_SECRET || process.env.TWILIO_AUTH_TOKEN;

    if (apiKey && apiSecret && apiKey.startsWith('AC')) {
      try {
        const client = twilio(apiKey, apiSecret);
        const recordings = await client.recordings.list({ limit: 10 });
        
        recordings.forEach(rec => {
          const matchedLog = resultLogs.find(l => l.providerCallId === rec.callSid);
          if (matchedLog) {
            matchedLog.recordingUrl = `/api/call/audio/${rec.sid}`;
            matchedLog.recordingSid = rec.sid;
            matchedLog.hasRecording = true;
            matchedLog.durationSeconds = Number(rec.duration) || matchedLog.durationSeconds || 15;
          }
        });
      } catch (twErr) {
        // Silent fallback
      }
    }

    return res.json(resultLogs);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch call history' });
  }
});

/**
 * GET /api/call/recordings - Fetch all Twilio recordings list
 */
router.get('/call/recordings', async (req, res) => {
  try {
    const apiKey = process.env.TELEPHONY_API_KEY || process.env.TWILIO_ACCOUNT_SID;
    const apiSecret = process.env.TELEPHONY_API_SECRET || process.env.TWILIO_AUTH_TOKEN;

    if (!apiKey || !apiSecret || !apiKey.startsWith('AC')) {
      return res.json([]);
    }

    const client = twilio(apiKey, apiSecret);
    const recordings = await client.recordings.list({ limit: 20 });
    
    const formatted = recordings.map(rec => ({
      sid: rec.sid,
      callSid: rec.callSid,
      duration: rec.duration,
      dateCreated: rec.dateCreated,
      audioUrl: `/api/call/audio/${rec.sid}`
    }));

    return res.json(formatted);
  } catch (err: any) {
    console.error('Fetch Twilio recordings error:', err);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/call/audio/:recordingSid - Secure proxy stream to play Twilio MP3 recording directly
 */
router.get('/call/audio/:recordingSid', async (req, res) => {
  try {
    const { recordingSid } = req.params;
    const apiKey = process.env.TELEPHONY_API_KEY || process.env.TWILIO_ACCOUNT_SID;
    const apiSecret = process.env.TELEPHONY_API_SECRET || process.env.TWILIO_AUTH_TOKEN;

    if (!apiKey || !apiSecret) {
      return res.status(401).send('Telephony keys missing');
    }

    const twilioMp3Url = `https://api.twilio.com/2010-04-01/Accounts/${apiKey}/Recordings/${recordingSid}.mp3`;

    const response = await axios({
      method: 'get',
      url: twilioMp3Url,
      auth: {
        username: apiKey,
        password: apiSecret
      },
      responseType: 'stream'
    });

    res.setHeader('Content-Type', 'audio/mpeg');
    response.data.pipe(res);
  } catch (err: any) {
    console.error('Audio stream error:', err.message);
    res.status(500).send('Failed to stream audio recording');
  }
});

/**
 * POST /api/call/status - Webhook callback for telephony provider (Twilio / Exotel)
 */
router.post('/call/status', async (req, res) => {
  try {
    const { CallSid, CallStatus, CallDuration } = req.body;
    console.log(`[Telephony Webhook] CallSid: ${CallSid} Status: ${CallStatus} Duration: ${CallDuration}s`);

    const updatedStatus = (CallStatus || 'completed').toLowerCase();
    const duration = Number(CallDuration) || 0;

    // Update in-memory cache
    const index = cachedTelephonyLogs.findIndex(c => c.providerCallId === CallSid);
    if (index !== -1) {
      cachedTelephonyLogs[index].status = updatedStatus;
      cachedTelephonyLogs[index].durationSeconds = duration;
    }

    // Update in Firestore
    if (isFirebaseConfigured() && CallSid) {
      try {
        const db = getFirebaseFirestore();
        const snap = await db.collection('telephony_calls').where('providerCallId', '==', CallSid).limit(1).get();
        if (!snap.empty) {
          await snap.docs[0].ref.update({
            status: updatedStatus,
            durationSeconds: duration,
            updatedAt: new Date().toISOString()
          });
        }
      } catch (fbErr) {
        console.warn('Firestore webhook sync warning:', fbErr);
      }
    }

    res.status(200).send('<Response/>');
  } catch (err) {
    res.status(500).json({ error: 'Webhook processing error' });
  }
});

/**
 * POST /api/call/recording - Webhook callback when Twilio finishes recording the call audio
 */
router.post('/call/recording', async (req, res) => {
  try {
    const { CallSid, RecordingUrl, RecordingDuration, RecordingSid } = req.body;
    console.log(`[Twilio Recording Ready] CallSid: ${CallSid} URL: ${RecordingUrl} Duration: ${RecordingDuration}s`);

    const directAudioMp3Url = RecordingSid ? `/api/call/audio/${RecordingSid}` : (RecordingUrl ? `${RecordingUrl}.mp3` : null);

    // Update in-memory cache
    const index = cachedTelephonyLogs.findIndex(c => c.providerCallId === CallSid);
    if (index !== -1) {
      cachedTelephonyLogs[index].recordingUrl = directAudioMp3Url;
      cachedTelephonyLogs[index].hasRecording = true;
      cachedTelephonyLogs[index].recordingDuration = Number(RecordingDuration) || 0;
    }

    // Update in Firestore
    if (isFirebaseConfigured() && CallSid) {
      try {
        const db = getFirebaseFirestore();
        const snap = await db.collection('telephony_calls').where('providerCallId', '==', CallSid).limit(1).get();
        if (!snap.empty) {
          await snap.docs[0].ref.update({
            recordingUrl: directAudioMp3Url,
            recordingSid: RecordingSid,
            hasRecording: true,
            recordingDuration: Number(RecordingDuration) || 0,
            updatedAt: new Date().toISOString()
          });
        }
      } catch (fbErr) {
        console.warn('Firestore recording webhook sync warning:', fbErr);
      }
    }

    res.status(200).send('<Response/>');
  } catch (err) {
    res.status(500).json({ error: 'Recording webhook processing error' });
  }
});

/**
 * GET /api/telephony/token - Generate WebRTC Voice Client JWT token for browser microphone calling
 */
router.get('/telephony/token', (req, res) => {
  try {
    const identity = (req.query.identity as string) || 'super_admin';
    const tokenData = generateTwilioClientVoiceToken(identity);
    res.json({ success: true, ...tokenData });
  } catch (err: any) {
    console.error('Error generating Twilio voice token:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * ALL /api/telephony/voice - Outbound Call Bridge between Browser WebRTC and Customer Mobile Phone
 */
router.all('/telephony/voice', (req, res) => {
  const to = req.body.To || req.query.To;
  const fromNumber = process.env.TELEPHONY_FROM_NUMBER || '+17372508034';
  
  res.type('text/xml');

  if (to) {
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial callerId="${fromNumber}" record="record-from-answer-dual">
    <Number>${to}</Number>
  </Dial>
</Response>`);
  } else {
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="en-IN">Welcome to Athena CRM Live Telephony.</Say>
</Response>`);
  }
});

export default router;
