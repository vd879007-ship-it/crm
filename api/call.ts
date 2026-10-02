import type { VercelRequest, VercelResponse } from '@vercel/node';
import twilio from 'twilio';

// Normalizes Indian phone numbers into standard E.164 format (+91XXXXXXXXXX)
function normalizeIndianPhoneNumber(rawNumber: string): { valid: boolean; formatted: string; error?: string } {
  if (!rawNumber || typeof rawNumber !== 'string') {
    return { valid: false, formatted: '', error: 'Phone number is required.' };
  }

  let cleaned = rawNumber.replace(/[\s\-\(\)\.]/g, '').trim();

  if (cleaned.startsWith('+91')) {
    const digits = cleaned.substring(3);
    if (/^[6789]\d{9}$/.test(digits)) {
      return { valid: true, formatted: `+91${digits}` };
    }
  }

  if (cleaned.startsWith('91') && cleaned.length === 12) {
    const digits = cleaned.substring(2);
    if (/^[6789]\d{9}$/.test(digits)) {
      return { valid: true, formatted: `+91${digits}` };
    }
  }

  if (cleaned.startsWith('0') && cleaned.length === 11) {
    const digits = cleaned.substring(1);
    if (/^[6789]\d{9}$/.test(digits)) {
      return { valid: true, formatted: `+91${digits}` };
    }
  }

  if (/^[6789]\d{9}$/.test(cleaned)) {
    return { valid: true, formatted: `+91${cleaned}` };
  }

  return {
    valid: false,
    formatted: cleaned,
    error: 'Invalid Indian mobile number. Must be a valid 10-digit number starting with 6, 7, 8, or 9 (e.g. +91 9876543210).'
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { phoneNumber, contactName, agentName, customMessage } = req.body || {};

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required.'
      });
    }

    const validation = normalizeIndianPhoneNumber(phoneNumber);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.error
      });
    }

    const targetNumber = validation.formatted;
    const apiKey = process.env.TELEPHONY_API_KEY || process.env.TWILIO_ACCOUNT_SID;
    const apiSecret = process.env.TELEPHONY_API_SECRET || process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TELEPHONY_FROM_NUMBER || process.env.TWILIO_FROM_NUMBER;

    let providerCallId = '';
    let mode = 'TEST_SIMULATION';
    let message = '';

    if (apiKey && apiSecret && fromNumber && apiKey.startsWith('AC')) {
      mode = 'LIVE_PSTN';
      const client = twilio(apiKey, apiSecret);

      const twimlVoiceResponse = `
        <Response>
          <Pause length="1"/>
          <Say language="en-IN">
            ${customMessage || `Hello from Athena CRM. This is a real outbound phone call from ${agentName || 'your CRM team'} to your mobile phone number ${targetNumber}.`}
          </Say>
          <Pause length="2"/>
        </Response>
      `.trim();

      const call = await client.calls.create({
        to: targetNumber,
        from: fromNumber,
        twiml: twimlVoiceResponse
      });

      providerCallId = call.sid;
      message = `Real outbound call initiated to ${targetNumber} via Telephony Gateway. Mobile phone is ringing.`;
    } else {
      providerCallId = `SIM_PSTN_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      message = `[DEMO SIMULATION] Outbound call simulated to Indian mobile ${targetNumber}. Configure TELEPHONY_API_KEY in .env for live telecom ringing.`;
    }

    return res.status(200).json({
      success: true,
      callId: `call_${Date.now()}`,
      providerCallId,
      phoneNumber: targetNumber,
      contactName: contactName || 'Prospect',
      status: 'initiated',
      mode,
      message,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    console.error('Vercel /api/call error:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to place outbound call'
    });
  }
}
