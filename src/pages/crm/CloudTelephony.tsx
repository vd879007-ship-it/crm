import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  PhoneForwarded, 
  PhoneCall, 
  PhoneOff, 
  PhoneIncoming, 
  PhoneOutgoing, 
  Mic, 
  MicOff, 
  Pause, 
  Play, 
  Volume2, 
  VolumeX, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Download, 
  FileText, 
  User, 
  Activity, 
  Radio, 
  Sparkles,
  RotateCcw,
  FastForward,
  Headphones,
  Tag,
  Flame
} from 'lucide-react';
import { Device } from '@twilio/voice-sdk';
import CRMNavigation from '../../components/CRMNavigation';
import { 
  saveCallRecordToFirebase, 
  updateCallRecordingInFirebase, 
  subscribeToCallRecords, 
  type TelephonyCallRecord 
} from '../../firebase/firebase';

export default function CloudTelephony() {
  const [calls, setCalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [directionFilter, setDirectionFilter] = useState('All');
  const [isFirebaseSynced, setIsFirebaseSynced] = useState(false);

  // Softphone Dialer State
  const [dialNumber, setDialNumber] = useState('8870370740');
  const [agentPhoneNumber, setAgentPhoneNumber] = useState('9585575354');
  const [callerName, setCallerName] = useState('Customer Prospect');
  const [isCalling, setIsCalling] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [callStatusMessage, setCallStatusMessage] = useState('');
  const [callError, setCallError] = useState('');
  const [activeProviderCallId, setActiveProviderCallId] = useState('');
  const [activeCallId, setActiveCallId] = useState('');
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const [isDeviceReady, setIsDeviceReady] = useState(false);
  
  const callTimerRef = useRef<any>(null);
  const twilioDeviceRef = useRef<any>(null);
  const activeTwilioCallRef = useRef<any>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Audio Recording Player State
  const [selectedCallForPlayback, setSelectedCallForPlayback] = useState<any>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [audioCurrentTime, setAudioCurrentTime] = useState<number>(0);
  const [audioTotalDuration, setAudioTotalDuration] = useState<number>(0);
  const audioIntervalRef = useRef<any>(null);

  // Modals
  const [showLogCallModal, setShowLogCallModal] = useState(false);
  const [showEditCallModal, setShowEditCallModal] = useState(false);
  const [editingCall, setEditingCall] = useState<any>(null);

  // Forms
  const [callFormData, setCallFormData] = useState({
    contactName: '',
    phoneNumber: '',
    direction: 'Outbound',
    durationSeconds: 60,
    status: 'Completed',
    agentName: 'Support Rep',
    sentiment: 'Positive',
    notes: '',
    tags: 'Inquiry, Pricing'
  });

  const fetchCalls = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/call/logs`);
      if (Array.isArray(res.data) && res.data.length > 0) {
        setCalls(res.data);
      }
    } catch (err) {
      try {
        const fallback = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/crm/telephony/calls`);
        setCalls(Array.isArray(fallback.data) ? fallback.data : []);
      } catch (e) {
        console.error(e);
      }
    } finally {
      setLoading(false);
    }
  };

  // Initialize Firebase Real-time Firestore Sync & Twilio Voice Device
  useEffect(() => {
    fetchCalls();

    // 1. Subscribe to real-time Firebase Firestore call records and recordings
    const unsubscribeFirebase = subscribeToCallRecords((firebaseCalls) => {
      if (firebaseCalls && firebaseCalls.length > 0) {
        setCalls(firebaseCalls);
        setIsFirebaseSynced(true);
        setLoading(false);
      }
    });

    const initTwilioDevice = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/telephony/token`);
        if (res.data && res.data.token) {
          const device = new Device(res.data.token, {
            logLevel: 1
          });

          device.on('registered', () => {
            console.log('Twilio Voice WebRTC Device registered and ready');
            setIsDeviceReady(true);
          });

          device.on('error', (twErr) => {
            console.warn('Twilio Device warning:', twErr.message);
          });

          await device.register();
          twilioDeviceRef.current = device;
        }
      } catch (err) {
        console.warn('Twilio WebRTC Device token setup note (using server carrier bridge fallback):', err);
      }
    };

    initTwilioDevice();

    return () => {
      if (twilioDeviceRef.current) {
        try {
          twilioDeviceRef.current.destroy();
        } catch (e) {}
      }
    };
  }, []);

  // Softphone Call Timer
  useEffect(() => {
    if (isCalling) {
      callTimerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
      setCallDuration(0);
    }
    return () => {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    };
  }, [isCalling]);

  // Audio Player Progress Simulator
  useEffect(() => {
    if (isPlayingAudio) {
      audioIntervalRef.current = setInterval(() => {
        setPlaybackProgress(prev => {
          if (prev >= 100) {
            setIsPlayingAudio(false);
            return 0;
          }
          return prev + 2 * playbackSpeed;
        });
      }, 500);
    } else {
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    }
    return () => {
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    };
  }, [isPlayingAudio, playbackSpeed]);

  const handleDialPadPress = (val: string) => {
    setDialNumber(prev => prev + val);
    setCallError('');
  };

  const handleStartCall = async () => {
    setCallError('');
    setCallStatusMessage('');
    if (!dialNumber) {
      setCallError('Please enter a valid Customer Indian mobile number (e.g. 8870370740).');
      return;
    }
    if (!agentPhoneNumber) {
      setCallError('Please enter your Agent Indian mobile number (e.g. 9585575354).');
      return;
    }

    setIsConnecting(true);

    try {
      // Request microphone permission if needed
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach(t => t.stop());
        }
      } catch (micErr) {
        console.warn('Microphone permission info:', micErr);
      }

      // Format Customer Indian phone number
      let formattedCustomerNumber = dialNumber.replace(/[\s\-\(\)]/g, '');
      if (!formattedCustomerNumber.startsWith('+91')) {
        if (formattedCustomerNumber.startsWith('91') && formattedCustomerNumber.length === 12) {
          formattedCustomerNumber = `+${formattedCustomerNumber}`;
        } else if (formattedCustomerNumber.startsWith('0') && formattedCustomerNumber.length === 11) {
          formattedCustomerNumber = `+91${formattedCustomerNumber.slice(1)}`;
        } else {
          formattedCustomerNumber = `+91${formattedCustomerNumber}`;
        }
      }

      // Format Agent Indian phone number
      let formattedAgentNumber = agentPhoneNumber.replace(/[\s\-\(\)]/g, '');
      if (!formattedAgentNumber.startsWith('+91')) {
        if (formattedAgentNumber.startsWith('91') && formattedAgentNumber.length === 12) {
          formattedAgentNumber = `+${formattedAgentNumber}`;
        } else if (formattedAgentNumber.startsWith('0') && formattedAgentNumber.length === 11) {
          formattedAgentNumber = `+91${formattedAgentNumber.slice(1)}`;
        } else {
          formattedAgentNumber = `+91${formattedAgentNumber}`;
        }
      }

      // 2. Trigger Twilio Outbound Call Bridge
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/call`, {
        phoneNumber: formattedCustomerNumber,
        agentNumber: formattedAgentNumber,
        contactName: callerName || 'Customer Prospect',
        agentName: 'Super Admin',
        callMode: 'bridge'
      });

      if (res.data && res.data.success) {
        setIsCalling(true);
        setActiveProviderCallId(res.data.providerCallId || '');
        setActiveCallId(res.data.callId || '');
        setCallStatusMessage(res.data.message || `Two-Way Outbound Bridge initiated! Connecting ${formattedAgentNumber} with ${formattedCustomerNumber}`);
        
        // Save Call Record into Firebase Firestore
        await saveCallRecordToFirebase({
          callId: res.data.callId,
          providerCallId: res.data.providerCallId,
          contactName: callerName || 'Customer Prospect',
          phoneNumber: formattedCustomerNumber,
          direction: 'Outbound',
          durationSeconds: 0,
          status: 'initiated',
          agentName: 'Super Admin',
          sentiment: 'Positive',
          notes: res.data.message || `Outbound phone call to ${formattedCustomerNumber}`,
          hasRecording: true,
          timestamp: new Date().toISOString()
        });

        fetchCalls();
      }
    } catch (err: any) {
      console.error('Call initiation error:', err);
      const errMsg = err.response?.data?.error || err.message || 'Failed to place call to mobile network.';
      setCallError(errMsg);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    if (activeTwilioCallRef.current) {
      activeTwilioCallRef.current.mute(nextMuted);
    }
    setIsMuted(nextMuted);
  };

  const handleEndCall = async () => {
    setIsCalling(false);
    setCallStatusMessage('Call disconnected.');
    const recordedDuration = callDuration || 5;

    // Disconnect active Twilio WebRTC client call if active
    if (activeTwilioCallRef.current) {
      try {
        activeTwilioCallRef.current.disconnect();
      } catch (e) {}
      activeTwilioCallRef.current = null;
    }
    
    try {
      // 1. Send hangup command to Twilio to immediately cut the call on the mobile phone
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/call/end`, {
        providerCallId: activeProviderCallId,
        callId: activeCallId,
        durationSeconds: recordedDuration
      });

      // 2. Update Call Duration and Status in Firebase Firestore
      if (activeProviderCallId || activeCallId) {
        await updateCallRecordingInFirebase(
          activeProviderCallId || activeCallId,
          '',
          undefined,
          recordedDuration
        );
      }

      // 3. Also log the record in local DB / fallback
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/crm/telephony/calls`, {
        contactName: callerName || 'Customer Prospect',
        phoneNumber: dialNumber || '+91 8870370740',
        direction: 'Outbound',
        durationSeconds: recordedDuration,
        status: 'Completed',
        agentName: 'Super Admin',
        sentiment: 'Positive',
        notes: `Outbound two-way bridge call to ${dialNumber}. Duration: ${recordedDuration}s.`,
        tags: ['Two-Way Bridge', 'Call Recording', 'Firebase Synced']
      });
      
      setActiveProviderCallId('');
      setActiveCallId('');
      
      // Auto-fetch updated logs with Twilio recording
      setTimeout(() => {
        fetchCalls();
      }, 2000);
    } catch (err) {
      console.error('Error disconnecting call:', err);
    }
  };

  const handleOpenLogCall = () => {
    setCallFormData({
      contactName: '',
      phoneNumber: '',
      direction: 'Outbound',
      durationSeconds: 45,
      status: 'Completed',
      agentName: 'Support Rep',
      sentiment: 'Positive',
      notes: '',
      tags: 'Inbound, Support'
    });
    setShowLogCallModal(true);
  };

  const handleOpenEditCall = (call: any) => {
    setEditingCall(call);
    setCallFormData({
      contactName: call.contactName || '',
      phoneNumber: call.phoneNumber || '',
      direction: call.direction || 'Outbound',
      durationSeconds: call.durationSeconds || 0,
      status: call.status || 'Completed',
      agentName: call.agentName || '',
      sentiment: call.sentiment || 'Positive',
      notes: call.notes || '',
      tags: Array.isArray(call.tags) ? call.tags.join(', ') : ''
    });
    setShowEditCallModal(true);
  };

  const handleLogCallSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 1. Save to Firebase Firestore
      await saveCallRecordToFirebase({
        contactName: callFormData.contactName,
        phoneNumber: callFormData.phoneNumber,
        direction: callFormData.direction as any,
        durationSeconds: Number(callFormData.durationSeconds) || 0,
        status: callFormData.status as any,
        agentName: callFormData.agentName,
        sentiment: callFormData.sentiment,
        notes: callFormData.notes,
        tags: callFormData.tags.split(',').map(t => t.trim()).filter(Boolean),
        hasRecording: false,
        timestamp: new Date().toISOString()
      });

      // 2. Also save to backend
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/crm/telephony/calls`, {
        ...callFormData,
        tags: callFormData.tags.split(',').map(t => t.trim()).filter(Boolean)
      });

      setShowLogCallModal(false);
      fetchCalls();
    } catch (err) {
      console.error(err);
      alert('Failed to log call');
    }
  };

  const handleEditCallSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCall) return;
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/crm/telephony/calls/${editingCall.id}`, {
        ...callFormData,
        tags: callFormData.tags.split(',').map(t => t.trim()).filter(Boolean)
      });
      setShowEditCallModal(false);
      setEditingCall(null);
      fetchCalls();
    } catch (err) {
      console.error(err);
      alert('Failed to update call record');
    }
  };

  const handleDeleteCall = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this telephony recording and call record?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/crm/telephony/calls/${id}`);
      if (selectedCallForPlayback?.id === id) {
        setSelectedCallForPlayback(null);
        setIsPlayingAudio(false);
      }
      fetchCalls();
    } catch (err) {
      console.error(err);
      alert('Failed to delete call');
    }
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const rem = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  // Metrics (Zero baseline)
  const totalCallsCount = calls.length;
  const inboundCount = calls.filter(c => c.direction === 'Inbound').length;
  const outboundCount = calls.filter(c => c.direction === 'Outbound').length;
  const recordingsCount = calls.filter(c => c.hasRecording).length;
  const avgDuration = totalCallsCount > 0 ? Math.round(calls.reduce((a, b) => a + (Number(b.durationSeconds) || 0), 0) / totalCallsCount) : 0;

  const filteredCalls = calls.filter(c => {
    const matchesSearch = 
      c.contactName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phoneNumber?.includes(searchQuery) ||
      c.callId?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDir = directionFilter === 'All' || c.direction === directionFilter;
    return matchesSearch && matchesDir;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <CRMNavigation />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-purple-100 text-purple-700 rounded-xl">
              <PhoneForwarded className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Cloud Telephony & Call Recordings</h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Browser softphone dialer, WebRTC SIP trunking, call recording playback with audio waveforms and AI transcripts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] font-bold text-amber-900 shadow-xs">
            <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500 animate-pulse" />
            <span>Firebase Firestore Sync: Active</span>
          </div>

          <button
            onClick={handleOpenLogCall}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ Log Call Record</span>
          </button>
        </div>
      </div>

      {/* Zero-based KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Total Calls</span>
          <p className="text-2xl font-extrabold text-gray-900 mt-1">{totalCallsCount}</p>
          <span className="text-[10px] text-gray-400 mt-0.5 block">Omnichannel volume</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-xs">
          <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider flex items-center gap-1">
            <PhoneIncoming className="w-3.5 h-3.5" /> Inbound
          </span>
          <p className="text-2xl font-extrabold text-blue-700 mt-1">{inboundCount}</p>
          <span className="text-[10px] text-blue-400 mt-0.5 block">Client calls received</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-purple-200 shadow-xs">
          <span className="text-[11px] font-semibold text-purple-700 uppercase tracking-wider flex items-center gap-1">
            <PhoneOutgoing className="w-3.5 h-3.5" /> Outbound
          </span>
          <p className="text-2xl font-extrabold text-purple-700 mt-1">{outboundCount}</p>
          <span className="text-[10px] text-purple-400 mt-0.5 block">Agent placed calls</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs">
          <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
            <Headphones className="w-3.5 h-3.5" /> Recordings
          </span>
          <p className="text-2xl font-extrabold text-emerald-700 mt-1">{recordingsCount}</p>
          <span className="text-[10px] text-emerald-500 mt-0.5 block">Audio archives</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs">
          <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Avg Duration
          </span>
          <p className="text-2xl font-extrabold text-amber-700 mt-1">{avgDuration}s</p>
          <span className="text-[10px] text-amber-500 mt-0.5 block">Call handle time</span>
        </div>
      </div>

      {/* Main Telephony Layout: Dialer on Left, Call Logs + Recording Player on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SOFTPHONE DIALER KEYPAD (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h3 className="font-bold text-gray-900 text-sm">Cloud Softphone</h3>
            </div>
            <span className="text-[10px] font-mono font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-200">
              PSTN Cellular Outbound
            </span>
          </div>

          {/* Error Banner */}
          {callError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold flex items-start gap-1.5">
              <span>⚠️</span>
              <span>{callError}</span>
            </div>
          )}

          {/* Success Status Banner */}
          {callStatusMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-start gap-1.5">
              <span>📞</span>
              <span>{callStatusMessage}</span>
            </div>
          )}

          {/* Active Call HUD Banner */}
          {isCalling ? (
            <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-4 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-1">
                  <Activity className="w-3 h-3 animate-spin" /> Live Two-Way Bridge
                </span>
                <span className="font-mono text-sm font-bold text-purple-200">
                  {formatSeconds(callDuration)}
                </span>
              </div>
              <div>
                <p className="font-bold text-sm text-white">{callerName || 'Customer Prospect'}</p>
                <div className="flex items-center justify-between text-xs text-purple-300 font-mono mt-0.5">
                  <span>Agent: +91 {agentPhoneNumber}</span>
                  <span>↔</span>
                  <span>Customer: +91 {dialNumber}</span>
                </div>
              </div>

              {/* In-Call Controls */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-[10px] text-center">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-2 rounded-lg font-bold flex flex-col items-center gap-1 transition-all ${
                    isMuted ? 'bg-red-500/30 text-red-200' : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  {isMuted ? <MicOff className="w-4 h-4 text-red-400" /> : <Mic className="w-4 h-4" />}
                  <span>{isMuted ? 'Muted' : 'Mute'}</span>
                </button>
                <button
                  onClick={() => setIsOnHold(!isOnHold)}
                  className={`p-2 rounded-lg font-bold flex flex-col items-center gap-1 transition-all ${
                    isOnHold ? 'bg-amber-500/30 text-amber-200' : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  <Pause className="w-4 h-4" />
                  <span>{isOnHold ? 'Held' : 'Hold'}</span>
                </button>
                <button
                  onClick={handleEndCall}
                  className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold flex flex-col items-center gap-1 transition-all shadow-md active:scale-95"
                >
                  <PhoneOff className="w-4 h-4" />
                  <span>End Call</span>
                </button>
              </div>
            </div>
          ) : (
            /* Input fields when idle */
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Customer / Contact Name
                </label>
                <input
                  type="text"
                  placeholder="Customer Prospect Name"
                  value={callerName}
                  onChange={e => setCallerName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1 flex items-center justify-between">
                  <span>Customer Phone (Recipient)</span>
                  <span className="text-[10px] text-purple-600 font-normal">Target Phone</span>
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-2.5 flex items-center gap-1 text-xs font-bold text-gray-500 pointer-events-none">
                    <span>🇮🇳</span>
                    <span>+91</span>
                  </div>
                  <input
                    type="text"
                    placeholder="88703 70740"
                    value={dialNumber.replace(/^\+91/, '')}
                    onChange={e => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setDialNumber(val);
                      setCallError('');
                    }}
                    className="w-full pl-14 pr-10 py-2 text-sm font-mono font-bold text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-center tracking-wider"
                  />
                  {dialNumber && (
                    <button
                      onClick={() => setDialNumber(dialNumber.slice(0, -1))}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 font-bold text-xs"
                    >
                      ⌫
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1 flex items-center justify-between">
                  <span>Your Agent Mobile (Twilio rings here first)</span>
                  <span className="text-[10px] text-emerald-600 font-semibold">Your Mobile</span>
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-2.5 flex items-center gap-1 text-xs font-bold text-gray-500 pointer-events-none">
                    <span>🇮🇳</span>
                    <span>+91</span>
                  </div>
                  <input
                    type="text"
                    placeholder="95855 75354"
                    value={agentPhoneNumber.replace(/^\+91/, '')}
                    onChange={e => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setAgentPhoneNumber(val);
                    }}
                    className="w-full pl-14 pr-3 py-1.5 text-xs font-mono font-bold text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-center tracking-wider"
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1 leading-tight">
                  💡 When you click <strong>Call Now</strong>, Twilio rings your mobile first. As soon as you pick up, it connects the customer and records the conversation.
                </p>
              </div>
            </div>
          )}

          {/* Keypad Buttons */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { num: '1', sub: '' },
              { num: '2', sub: 'ABC' },
              { num: '3', sub: 'DEF' },
              { num: '4', sub: 'GHI' },
              { num: '5', sub: 'JKL' },
              { num: '6', sub: 'MNO' },
              { num: '7', sub: 'PQRS' },
              { num: '8', sub: 'TUV' },
              { num: '9', sub: 'WXYZ' },
              { num: '*', sub: '' },
              { num: '0', sub: '+' },
              { num: '#', sub: '' }
            ].map(btn => (
              <button
                key={btn.num}
                type="button"
                onClick={() => handleDialPadPress(btn.num)}
                className="py-2.5 px-2 rounded-xl bg-gray-50 hover:bg-purple-50 hover:border-purple-300 border border-gray-200 transition-all flex flex-col items-center justify-center active:scale-95 cursor-pointer"
              >
                <span className="text-base font-extrabold text-gray-800">{btn.num}</span>
                {btn.sub && <span className="text-[9px] font-semibold text-gray-400">{btn.sub}</span>}
              </button>
            ))}
          </div>

          {/* Dial / Action Button */}
          {!isCalling && (
            <button
              onClick={handleStartCall}
              disabled={isConnecting}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer text-sm active:scale-98"
            >
              {isConnecting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Connecting Two-Way Phone Bridge...</span>
                </>
              ) : (
                <>
                  <PhoneCall className="w-4 h-4" />
                  <span>📞 Call Now (Two-Way Live Voice)</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* RIGHT AREA: CALL LOGS & RECORDING AUDIO PLAYER (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* AUDIO RECORDING PLAYER SECTION (Active when a call is selected or sample) */}
          {selectedCallForPlayback && (
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white p-5 rounded-2xl shadow-md border border-purple-500/20 space-y-4">
              {/* Hidden HTML5 Audio Element for real playback */}
              {selectedCallForPlayback.recordingUrl && (
                <audio
                  ref={audioPlayerRef}
                  src={
                    selectedCallForPlayback.recordingUrl.startsWith('http')
                      ? selectedCallForPlayback.recordingUrl
                      : `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}${selectedCallForPlayback.recordingUrl}`
                  }
                  onTimeUpdate={(e) => {
                    const curr = e.currentTarget.currentTime;
                    const dur = e.currentTarget.duration || selectedCallForPlayback.durationSeconds || 1;
                    setAudioCurrentTime(curr);
                    setAudioTotalDuration(dur);
                    setPlaybackProgress((curr / dur) * 100);
                  }}
                  onEnded={() => {
                    setIsPlayingAudio(false);
                    setPlaybackProgress(0);
                  }}
                  onLoadedMetadata={(e) => {
                    setAudioTotalDuration(e.currentTarget.duration);
                  }}
                />
              )}

              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-purple-500/20 text-purple-300 rounded-lg">
                    <Headphones className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">Call Recording & Audio Playback</h4>
                    <p className="text-xs text-purple-200">
                      {selectedCallForPlayback.contactName} • {selectedCallForPlayback.phoneNumber}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {selectedCallForPlayback.recordingUrl && (
                    <a
                      href={
                        selectedCallForPlayback.recordingUrl.startsWith('http')
                          ? selectedCallForPlayback.recordingUrl
                          : `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}${selectedCallForPlayback.recordingUrl}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      download={`call_${selectedCallForPlayback.providerCallId || 'recording'}.mp3`}
                      className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white text-[11px] rounded-lg font-bold flex items-center gap-1 transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download MP3</span>
                    </a>
                  )}
                  <button
                    onClick={() => {
                      if (audioPlayerRef.current) {
                        audioPlayerRef.current.pause();
                      }
                      setSelectedCallForPlayback(null);
                      setIsPlayingAudio(false);
                    }}
                    className="text-gray-400 hover:text-white text-xs font-bold px-2 py-1"
                  >
                    ✕ Close
                  </button>
                </div>
              </div>

              {/* Dynamic Waveform Simulation */}
              <div 
                className="bg-black/30 p-3 rounded-xl border border-white/10 flex items-center gap-1 h-16 justify-center overflow-hidden cursor-pointer"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  const pct = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
                  setPlaybackProgress(pct);
                  if (audioPlayerRef.current && audioTotalDuration) {
                    audioPlayerRef.current.currentTime = (pct / 100) * audioTotalDuration;
                  }
                }}
              >
                {[
                  12, 24, 38, 48, 20, 60, 80, 45, 30, 70, 90, 55, 35, 65, 85, 40,
                  25, 75, 95, 50, 30, 60, 40, 20, 55, 85, 65, 35, 20, 45, 70, 30,
                  15, 40, 60, 80, 50, 25, 65, 85, 45, 20, 55, 75, 35, 15, 30, 20
                ].map((height, i) => {
                  const isActive = (i / 48) * 100 <= playbackProgress;
                  return (
                    <div
                      key={i}
                      className={`w-1 rounded-full transition-all duration-150 ${
                        isActive
                          ? 'bg-purple-400 shadow-sm shadow-purple-500'
                          : 'bg-white/20'
                      }`}
                      style={{
                        height: isPlayingAudio ? `${Math.max(8, (height * (0.8 + Math.random() * 0.4)))}%` : `${height}%`
                      }}
                    />
                  );
                })}
              </div>

              {/* Audio Controls */}
              <div className="flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (audioPlayerRef.current) {
                        if (isPlayingAudio) {
                          audioPlayerRef.current.pause();
                          setIsPlayingAudio(false);
                        } else {
                          audioPlayerRef.current.play().catch(console.error);
                          setIsPlayingAudio(true);
                        }
                      } else {
                        setIsPlayingAudio(!isPlayingAudio);
                      }
                    }}
                    className="p-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-full transition-all shadow-sm active:scale-95"
                  >
                    {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                  </button>
                  <button
                    onClick={() => {
                      setPlaybackProgress(0);
                      if (audioPlayerRef.current) audioPlayerRef.current.currentTime = 0;
                    }}
                    className="p-2 hover:bg-white/10 text-gray-300 rounded-lg transition-colors"
                    title="Rewind to start"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono text-purple-200">
                    {formatSeconds(Math.round(audioCurrentTime || ((selectedCallForPlayback.durationSeconds || 30) * playbackProgress) / 100))} / {formatSeconds(Math.round(audioTotalDuration || selectedCallForPlayback.durationSeconds || 30))}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-[10px]">Speed:</span>
                  {[1, 1.25, 1.5].map(spd => (
                    <button
                      key={spd}
                      onClick={() => {
                        setPlaybackSpeed(spd);
                        if (audioPlayerRef.current) audioPlayerRef.current.playbackRate = spd;
                      }}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        playbackSpeed === spd ? 'bg-purple-600 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Speech Summary */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-2 text-xs">
                <div className="flex items-center justify-between text-[11px] font-bold text-purple-300 pb-1 border-b border-white/10">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Stereo Call Audio & Analysis
                  </span>
                  <span className="text-[10px] text-emerald-400 font-normal">Dual Track Recording: Active</span>
                </div>
                <p className="text-gray-300 text-[11px]">
                  {selectedCallForPlayback.notes || `Two-way telephone conversation between Agent and ${selectedCallForPlayback.contactName} (${selectedCallForPlayback.phoneNumber}).`}
                </p>
              </div>
            </div>
          )}

          {/* CALL LOGS & HISTORY */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden space-y-3 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-600" />
                <span>Call Logs & Telephony Records</span>
              </h3>

              <div className="flex items-center gap-2">
                <div className="relative min-w-[200px]">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search logs by number, contact..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-2.5 py-1 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <select
                  value={directionFilter}
                  onChange={e => setDirectionFilter(e.target.value)}
                  className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 focus:outline-none"
                >
                  <option value="All">All Directions</option>
                  <option value="Inbound">Inbound</option>
                  <option value="Outbound">Outbound</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                  <tr>
                    <th className="py-2.5 px-3">Call ID / Time</th>
                    <th className="py-2.5 px-3">Contact</th>
                    <th className="py-2.5 px-3">Direction</th>
                    <th className="py-2.5 px-3">Duration</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Agent</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredCalls.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-400">
                        <PhoneCall className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p className="font-bold text-gray-700 text-sm">No call recordings or logs found</p>
                        <p className="text-xs text-gray-400 mt-0.5">Use the Cloud Softphone dialer on the left or click "+ Log Call Record" to log interactions.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredCalls.map(c => (
                      <tr key={c.id} className="hover:bg-purple-50/20">
                        <td className="py-2.5 px-3">
                          <span className="font-mono font-bold text-purple-700 text-[11px]">{c.callId}</span>
                          <div className="text-[10px] text-gray-400">{new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-gray-900">{c.contactName}</div>
                          <div className="font-mono text-[10px] text-gray-500">{c.phoneNumber}</div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            c.direction === 'Inbound' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                          }`}>
                            {c.direction === 'Inbound' ? <PhoneIncoming className="w-3 h-3" /> : <PhoneOutgoing className="w-3 h-3" />}
                            {c.direction}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono font-medium text-gray-700">{formatSeconds(c.durationSeconds)}</td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            c.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                            c.status === 'Missed' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-gray-600">{c.agentName}</td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {c.hasRecording && (
                              <button
                                onClick={() => {
                                  setSelectedCallForPlayback(c);
                                  setIsPlayingAudio(true);
                                  setPlaybackProgress(0);
                                }}
                                className="p-1.5 text-purple-600 hover:bg-purple-50 rounded"
                                title="Listen to Recording"
                              >
                                <Play className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => handleOpenEditCall(c)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                              title="Edit Call Log"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteCall(c.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                              title="Delete Call"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* LOG CALL MODAL */}
      {showLogCallModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Log Telephony Call Record</h3>
              <button onClick={() => setShowLogCallModal(false)} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
            </div>
            <form onSubmit={handleLogCallSubmit} className="space-y-3 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Contact Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah Jenkins"
                    value={callFormData.contactName}
                    onChange={e => setCallFormData({ ...callFormData, contactName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="+1 (555) 234-5678"
                    value={callFormData.phoneNumber}
                    onChange={e => setCallFormData({ ...callFormData, phoneNumber: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Direction</label>
                  <select
                    value={callFormData.direction}
                    onChange={e => setCallFormData({ ...callFormData, direction: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  >
                    <option value="Outbound">Outbound</option>
                    <option value="Inbound">Inbound</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Duration (sec)</label>
                  <input
                    type="number"
                    min="0"
                    value={callFormData.durationSeconds}
                    onChange={e => setCallFormData({ ...callFormData, durationSeconds: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Outcome</label>
                  <select
                    value={callFormData.status}
                    onChange={e => setCallFormData({ ...callFormData, status: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  >
                    <option value="Completed">Completed</option>
                    <option value="Missed">Missed</option>
                    <option value="Busy">Busy</option>
                    <option value="Voicemail">Voicemail</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Agent Representative</label>
                  <input
                    type="text"
                    value={callFormData.agentName}
                    onChange={e => setCallFormData({ ...callFormData, agentName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Sentiment</label>
                  <select
                    value={callFormData.sentiment}
                    onChange={e => setCallFormData({ ...callFormData, sentiment: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  >
                    <option value="Positive">Positive</option>
                    <option value="Neutral">Neutral</option>
                    <option value="Escalation">Escalation</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Call Notes & Summary</label>
                <textarea
                  rows={3}
                  placeholder="Summary of conversation, key points discussed..."
                  value={callFormData.notes}
                  onChange={e => setCallFormData({ ...callFormData, notes: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowLogCallModal(false)}
                  className="px-4 py-2 border rounded-xl hover:bg-gray-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-xs"
                >
                  Save Call Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT CALL MODAL */}
      {showEditCallModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Edit Call Record Details</h3>
              <button onClick={() => setShowEditCallModal(false)} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
            </div>
            <form onSubmit={handleEditCallSubmit} className="space-y-3 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Contact Name</label>
                  <input
                    type="text"
                    required
                    value={callFormData.contactName}
                    onChange={e => setCallFormData({ ...callFormData, contactName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={callFormData.phoneNumber}
                    onChange={e => setCallFormData({ ...callFormData, phoneNumber: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Direction</label>
                  <select
                    value={callFormData.direction}
                    onChange={e => setCallFormData({ ...callFormData, direction: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  >
                    <option value="Outbound">Outbound</option>
                    <option value="Inbound">Inbound</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Duration (sec)</label>
                  <input
                    type="number"
                    min="0"
                    value={callFormData.durationSeconds}
                    onChange={e => setCallFormData({ ...callFormData, durationSeconds: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Outcome</label>
                  <select
                    value={callFormData.status}
                    onChange={e => setCallFormData({ ...callFormData, status: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  >
                    <option value="Completed">Completed</option>
                    <option value="Missed">Missed</option>
                    <option value="Busy">Busy</option>
                    <option value="Voicemail">Voicemail</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Call Notes & Resolution</label>
                <textarea
                  rows={3}
                  value={callFormData.notes}
                  onChange={e => setCallFormData({ ...callFormData, notes: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowEditCallModal(false)}
                  className="px-4 py-2 border rounded-xl hover:bg-gray-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
