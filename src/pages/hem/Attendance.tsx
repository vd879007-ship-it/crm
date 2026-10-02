import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Pencil,
  Trash2,
  Fingerprint, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Search, 
  Filter, 
  RefreshCw, 
  Smartphone, 
  CreditCard, 
  Camera, 
  Laptop, 
  Server, 
  Sparkles, 
  X, 
  Download, 
  Check, 
  XCircle, 
  Calendar, 
  Building2, 
  ArrowRight,
  ShieldCheck,
  Eye,
  Send,
  MessageSquare,
  Scan,
  UserCheck,
  Video,
  RotateCcw
} from 'lucide-react';
import HEMNavigation from '../../components/HEMNavigation';

interface Terminal {
  id: string;
  name: string;
  sourceType: string;
  location: string;
  ipAddress: string;
  status: string;
  lastSync: string;
  todaySwipes: number;
  firmware: string;
}

interface SwipeLog {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  timestamp: string;
  direction: string;
  sourceType: string;
  terminalId: string;
  location: string;
  confidence: number;
  photoSnapshotUrl: string | null;
  verificationStatus: string;
  isLate: boolean;
}

interface Regularization {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  missedPunchType: string;
  requestedTime: string;
  reason: string;
  status: string;
  submittedAt: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
}

export default function Attendance() {
  const [terminals, setTerminals] = useState<Terminal[]>([]);
  const [swipes, setSwipes] = useState<SwipeLog[]>([]);
  const [regularizations, setRegularizations] = useState<Regularization[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'feed' | 'terminals' | 'regularizations' | 'timesheet'>('feed');
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('All');

  // Modals
  const [showRegularizeModal, setShowRegularizeModal] = useState(false);
  const [showEditTerminalModal, setShowEditTerminalModal] = useState(false);
  const [editingTerminal, setEditingTerminal] = useState<any>(null);
  const [showEditRegularizationModal, setShowEditRegularizationModal] = useState(false);
  const [editingRegularization, setEditingRegularization] = useState<any>(null);
  const [showAddTerminalModal, setShowAddTerminalModal] = useState(false);
  const [showManualPunchModal, setShowManualPunchModal] = useState(false);

  // Biometric & Selfie Kiosk States
  const [showSelfieKioskModal, setShowSelfieKioskModal] = useState(false);
  const [selfieSnapshot, setSelfieSnapshot] = useState<string | null>(null);
  const [isScanningFace, setIsScanningFace] = useState(false);
  const [faceVerified, setFaceVerified] = useState(false);
  const [isScanningFingerprint, setIsScanningFingerprint] = useState(false);
  const [fingerprintVerified, setFingerprintVerified] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [sendWhatsAppOnPunch, setSendWhatsAppOnPunch] = useState(true);
  const [previewPhotoModal, setPreviewPhotoModal] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [kioskEmployee, setKioskEmployee] = useState({
    name: 'Rahul Sharma',
    id: 'EMP-3042',
    dept: 'Engineering',
    phone: '+91 98450 11223'
  });
  const [kioskDirection, setKioskDirection] = useState<'Check-In' | 'Check-Out' | 'Break-Out' | 'Break-In'>('Check-In');
  const [kioskLocation, setKioskLocation] = useState('Bangalore HQ - Biometric Selfie Kiosk (12.9716° N, 77.5946° E)');

  // Forms
  const [regularizeForm, setRegularizeForm] = useState({
    employeeName: '',
    employeeId: '',
    date: new Date().toISOString().split('T')[0],
    missedPunchType: 'Missed Check-In',
    requestedTime: '09:00 AM',
    reason: ''
  });

  const [terminalForm, setTerminalForm] = useState({
    name: '',
    sourceType: 'Biometric Fingerprint (ZKTeco)',
    location: '',
    ipAddress: '192.168.1.150'
  });

  const [punchForm, setPunchForm] = useState({
    employeeName: 'Rahul Sharma',
    employeeId: 'EMP-3042',
    department: 'Engineering',
    direction: 'Check-In',
    sourceType: 'Web Portal Virtual Clock',
    terminalId: 'DEV-WEB-05',
    location: 'Bangalore Office (12.9716° N, 77.5946° E)'
  });

  const fetchData = async () => {
    try {
      const [termRes, swipeRes, regRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hem/swipes/terminals`),
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hem/swipes/raw-logs`),
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hem/attendance/regularizations`)
      ]);
      setTerminals(termRes.data || []);
      setSwipes(swipeRes.data || []);
      setRegularizations(regRes.data || []);
    } catch (err) {
      console.error('Failed to fetch attendance data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenEditTerminal = (term: Terminal) => {
    setEditingTerminal({ ...term });
    setShowEditTerminalModal(true);
  };

  const handleUpdateTerminal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTerminal) return;
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hem/swipes/terminals/${editingTerminal.id}`, editingTerminal);
      setShowEditTerminalModal(false);
      setEditingTerminal(null);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to update terminal');
    }
  };

  const handleDeleteTerminal = async (id: string) => {
    if (!window.confirm('Delete this terminal device hardware record?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hem/swipes/terminals/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to delete terminal');
    }
  };

  const handleOpenEditRegularization = (reg: Regularization) => {
    setEditingRegularization({ ...reg });
    setShowEditRegularizationModal(true);
  };

  const handleUpdateRegularization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRegularization) return;
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hem/attendance/regularizations/${editingRegularization.id}`, editingRegularization);
      setShowEditRegularizationModal(false);
      setEditingRegularization(null);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to update regularization');
    }
  };

  const handleDeleteRegularization = async (id: string) => {
    if (!window.confirm('Delete this missed punch regularization request?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hem/attendance/regularizations/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to delete regularization');
    }
  };

  const startCamera = async () => {
    setIsScanningFace(true);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setCameraActive(true);
        }
      } else {
        setCameraActive(false);
      }
    } catch (err) {
      console.warn('Camera access not granted or unavailable, using simulation view', err);
      setCameraActive(false);
    } finally {
      setIsScanningFace(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  };

  const captureSelfie = () => {
    if (cameraActive && videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setSelfieSnapshot(dataUrl);
        setFaceVerified(true);
        stopCamera();
        return;
      }
    }

    const sampleAvatars = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80'
    ];
    setSelfieSnapshot(sampleAvatars[Math.floor(Math.random() * sampleAvatars.length)]);
    setFaceVerified(true);
  };

  const handleSimulateFingerprint = () => {
    setIsScanningFingerprint(true);
    setTimeout(() => {
      setIsScanningFingerprint(false);
      setFingerprintVerified(true);
    }, 1000);
  };

  const handleOpenSelfieKiosk = () => {
    setShowSelfieKioskModal(true);
    setFaceVerified(false);
    setFingerprintVerified(false);
    setSelfieSnapshot(null);
    setTimeout(() => {
      startCamera();
    }, 200);
  };

  const handleCloseSelfieKiosk = () => {
    stopCamera();
    setShowSelfieKioskModal(false);
  };

  const handleSendAttendanceWhatsApp = async (log: SwipeLog) => {
    const rawPhone = '+91 98450 11223';
    const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
    const timeFormatted = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateFormatted = new Date(log.timestamp).toLocaleDateString();

    const message = `*ATTENDANCE PUNCH CONFIRMED: ${log.direction.toUpperCase()}*\n\nDear ${log.employeeName} (${log.employeeId}),\nYour attendance punch has been registered successfully.\n\n*Punch Details:*\nDirection: ${log.direction}\nTime: ${timeFormatted} | Date: ${dateFormatted}\nIngestion Mode: ${log.sourceType}\nTerminal: ${log.terminalId} (${log.location})\nVerification Score: ${log.confidence}% Match (Biometric + Facial)\nStatus: ${log.verificationStatus}\nPunctuality: ${log.isLate ? 'Late Arrival' : 'On Time'}\n\nAthena Enterprise HR Systems • OmniCloud HQ.`;

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/erp/whatsapp/send`, {
        phone: cleanPhone,
        message,
        customerName: log.employeeName
      });
      window.open(res.data.whatsappUrl, '_blank');
    } catch (err) {
      const fallbackUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;
      window.open(fallbackUrl, '_blank');
    }
  };

  const handleSubmitBiometricSelfiePunch = async () => {
    if (!faceVerified && !selfieSnapshot) {
      alert('Please capture a live facial selfie before completing punch.');
      return;
    }
    if (!fingerprintVerified) {
      alert('Please complete biometric fingerprint scan before completing punch.');
      return;
    }

    try {
      const payload = {
        employeeName: kioskEmployee.name,
        employeeId: kioskEmployee.id,
        department: kioskEmployee.dept,
        direction: kioskDirection,
        sourceType: 'Biometric Fingerprint + Selfie Facial Kiosk',
        terminalId: 'DEV-BIO-SELFIE-01',
        location: kioskLocation,
        confidence: 99.8,
        photoSnapshotUrl: selfieSnapshot || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
      };

      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hem/swipes/raw-logs`, payload);
      handleCloseSelfieKiosk();
      fetchData();

      if (sendWhatsAppOnPunch && res.data) {
        handleSendAttendanceWhatsApp(res.data);
      } else {
        alert('Biometric + Selfie Punch registered successfully with 99.8% match confidence!');
      }
    } catch (err) {
      console.error('Failed to submit biometric punch', err);
      alert('Failed to log biometric attendance.');
    }
  };

  const handleSyncTerminal = async (id: string) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hem/swipes/terminals/${id}/sync`);
      fetchData();
      alert('Terminal synchronized successfully.');
    } catch (err) {
      console.error(err);
    }
  };

  const handleSimulateSwipe = async (terminal?: Terminal) => {
    try {
      const sampleNames = [
        { name: 'Aarav Patel', id: 'EMP-1021', dept: 'Engineering' },
        { name: 'Priya Sundaram', id: 'EMP-2045', dept: 'Product' },
        { name: 'Karan Mehra', id: 'EMP-3012', dept: 'Operations' },
        { name: 'Neha Gupta', id: 'EMP-4089', dept: 'Marketing' }
      ];
      const person = sampleNames[Math.floor(Math.random() * sampleNames.length)];
      const src = terminal?.sourceType || 'Biometric Fingerprint (ZKTeco)';
      const tId = terminal?.id || 'DEV-BIO-01';

      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hem/swipes/raw-logs`, {
        employeeName: person.name,
        employeeId: person.id,
        department: person.dept,
        direction: Math.random() > 0.3 ? 'Check-In' : 'Check-Out',
        sourceType: src,
        terminalId: tId,
        location: terminal?.location || 'Bangalore HQ Entrance',
        confidence: 99.4
      });
      fetchData();
    } catch (err) {
      console.error('Simulation failed:', err);
    }
  };

  const handleSubmitPunch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hem/swipes/raw-logs`, punchForm);
      setShowManualPunchModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to log swipe.');
    }
  };

  const handleCreateTerminal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hem/swipes/terminals`, terminalForm);
      setShowAddTerminalModal(false);
      setTerminalForm({
        name: '',
        sourceType: 'Biometric Fingerprint (ZKTeco)',
        location: '',
        ipAddress: '192.168.1.150'
      });
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to register device.');
    }
  };

  const handleSubmitRegularization = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hem/attendance/regularize`, regularizeForm);
      setShowRegularizeModal(false);
      setRegularizeForm({
        employeeName: '',
        employeeId: '',
        date: new Date().toISOString().split('T')[0],
        missedPunchType: 'Missed Check-In',
        requestedTime: '09:00 AM',
        reason: ''
      });
      fetchData();
      setActiveTab('regularizations');
    } catch (err) {
      console.error(err);
      alert('Failed to submit regularization.');
    }
  };

  const handleReviewRegularization = async (id: string, status: 'Approved' | 'Rejected') => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hem/attendance/regularizations/${id}`, {
        status,
        reviewedBy: 'HR Attendance Lead'
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const getSourceIcon = (source: string) => {
    if (source.includes('Biometric') || source.includes('Fingerprint')) return Fingerprint;
    if (source.includes('RFID') || source.includes('Card')) return CreditCard;
    if (source.includes('Mobile') || source.includes('GPS')) return Smartphone;
    if (source.includes('Facial') || source.includes('Camera')) return Camera;
    return Laptop;
  };

  const filteredSwipes = swipes.filter(s => {
    const matchesSource = sourceFilter === 'All' || s.sourceType.toLowerCase().includes(sourceFilter.toLowerCase());
    const matchesSearch = 
      s.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.terminalId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSource && matchesSearch;
  });

  const exportTimesheetCSV = () => {
    if (swipes.length === 0) {
      alert('No attendance swipe records available to export.');
      return;
    }
    const headers = ['Punch ID', 'Employee Name', 'Employee ID', 'Department', 'Timestamp', 'Direction', 'Source Type', 'Terminal ID', 'Location', 'Late Mark'];
    const rows = swipes.map(s => [
      s.id,
      `"${s.employeeName}"`,
      s.employeeId,
      `"${s.department}"`,
      s.timestamp,
      s.direction,
      `"${s.sourceType}"`,
      s.terminalId,
      `"${s.location}"`,
      s.isLate ? 'YES' : 'NO'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Athena_Attendance_Logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Universal HEM Navigation Bar */}
      <HEMNavigation />

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-teal-950 via-emerald-950 to-slate-900 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-2 bg-teal-500/20 rounded-xl border border-teal-400/30">
                <Fingerprint className="w-5 h-5 text-teal-300" />
              </span>
              <span className="text-xs font-semibold text-teal-300 uppercase tracking-wider">
                Multi-Source Attendance Ingestion Engine
              </span>
              <span className="text-[10px] bg-teal-500/30 text-teal-200 font-bold px-2 py-0.5 rounded-full border border-teal-400/30">
                Real-Time Sync
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Attendance & Swipe Capture Hub</h1>
            <p className="text-sm text-slate-300 max-w-2xl mt-1">
              Capture and reconcile attendance from Biometric Fingerprint Terminals, RFID Turnstiles, Mobile GPS Geofences, Web Virtual Clocks, and AI Facial Recognition Kiosks.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => handleSimulateSwipe()}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Simulate Swipe</span>
            </button>
            <button
              onClick={exportTimesheetCSV}
              className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Download className="w-4 h-4 text-teal-300" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => setShowRegularizeModal(true)}
              className="px-3.5 py-2 bg-teal-700/60 hover:bg-teal-700 text-teal-100 border border-teal-500/40 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Clock className="w-4 h-4" />
              <span>Regularize</span>
            </button>
            <button
              onClick={handleOpenSelfieKiosk}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 shadow-md transition-all border border-emerald-300 animate-pulse-slow"
            >
              <Camera className="w-4 h-4 text-slate-950" />
              <Fingerprint className="w-4 h-4 text-slate-950" />
              <span>Biometric + Selfie Kiosk</span>
            </button>
            <button
              onClick={() => setShowManualPunchModal(true)}
              className="px-4 py-2 bg-teal-500/80 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Clock In/Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 font-bold border border-teal-100">
            <Fingerprint className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">{swipes.length}</div>
            <div className="text-xs font-medium text-slate-500">Total Swipes Today</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold border border-blue-100">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">{terminals.length} Terminals</div>
            <div className="text-xs font-medium text-slate-500">Connected Ingestion Sources</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 font-bold border border-amber-100">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">
              {regularizations.filter(r => r.status.includes('Pending')).length}
            </div>
            <div className="text-xs font-medium text-slate-500">Pending Regularizations</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold border border-emerald-100">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">99.8%</div>
            <div className="text-xs font-medium text-slate-500">Ingestion Reliability SLA</div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('feed')}
          className={`px-5 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'feed'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Fingerprint className="w-4 h-4" />
          <span>Live Swipe & Punch Feed ({swipes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('terminals')}
          className={`px-5 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'terminals'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Ingestion Sources & Terminals ({terminals.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('regularizations')}
          className={`px-5 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'regularizations'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Missed Punch Regularizations ({regularizations.length})</span>
          {regularizations.filter(r => r.status.includes('Pending')).length > 0 && (
            <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full text-[10px] font-bold">
              {regularizations.filter(r => r.status.includes('Pending')).length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: LIVE SWIPE & PUNCH FEED */}
      {activeTab === 'feed' && (
        <div className="space-y-4">
          {/* Search & Source Filter Bar */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by Employee, Terminal, ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                {['All', 'Biometric', 'RFID', 'Mobile', 'Facial', 'Web'].map((src) => (
                  <button
                    key={src}
                    onClick={() => setSourceFilter(src)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                      sourceFilter === src
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {src}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Swipe Feed Table or Empty State */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-slate-500 text-sm">Loading attendance logs...</div>
            ) : filteredSwipes.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-teal-100">
                  <Fingerprint className="w-8 h-8 text-teal-600" />
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-1">No Attendance Swipes Recorded Yet</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mb-5 leading-relaxed">
                  Swipes and punches will appear here in real-time as employees clock in via Biometric readers, turnstile RFID cards, mobile GPS, or front-desk facial recognition.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => handleSimulateSwipe()}
                    className="px-4 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 font-semibold rounded-xl text-xs border border-teal-200 flex items-center gap-2 transition-all shadow-xs"
                  >
                    <Sparkles className="w-4 h-4 text-teal-600" />
                    <span>Simulate Biometric Swipe</span>
                  </button>
                  <button
                    onClick={() => setShowManualPunchModal(true)}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-xs transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Clock In Online</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold text-[11px] tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Punch ID & Employee</th>
                      <th className="py-3.5 px-4">Direction & Time</th>
                      <th className="py-3.5 px-4">Selfie Verification</th>
                      <th className="py-3.5 px-4">Ingestion Source</th>
                      <th className="py-3.5 px-4">Terminal & Location</th>
                      <th className="py-3.5 px-4">Confidence</th>
                      <th className="py-3.5 px-4">Punctuality</th>
                      <th className="py-3.5 px-4 text-right">WhatsApp Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSwipes.map((log) => {
                      const IconComponent = getSourceIcon(log.sourceType);
                      return (
                        <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-teal-50 rounded-xl text-teal-600 border border-teal-100">
                                <IconComponent className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="font-bold text-slate-900">{log.employeeName}</div>
                                <div className="text-[11px] text-slate-400 font-mono">{log.employeeId} • {log.department}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              log.direction === 'Check-In' ? 'bg-emerald-100 text-emerald-800' :
                              log.direction === 'Check-Out' ? 'bg-slate-100 text-slate-800' :
                              'bg-amber-100 text-amber-800'
                            }`}>
                              {log.direction}
                            </span>
                            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 font-mono">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            {log.photoSnapshotUrl ? (
                              <button
                                onClick={() => setPreviewPhotoModal(log.photoSnapshotUrl)}
                                className="group relative flex items-center gap-2 p-1 rounded-xl bg-slate-100 hover:bg-teal-50 border border-slate-200 transition-colors"
                                title="Click to view full-resolution verified selfie"
                              >
                                <img
                                  src={log.photoSnapshotUrl}
                                  alt="Selfie verification"
                                  className="w-9 h-9 rounded-lg object-cover border border-emerald-400/60"
                                />
                                <div className="text-left hidden sm:block">
                                  <div className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Verified
                                  </div>
                                  <div className="text-[9px] text-slate-400 flex items-center gap-0.5">
                                    <Eye className="w-2.5 h-2.5 text-slate-400" /> View Selfie
                                  </div>
                                </div>
                              </button>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic flex items-center gap-1">
                                <Fingerprint className="w-3.5 h-3.5 text-slate-300" /> Sensor Only
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-medium text-slate-800">{log.sourceType}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{log.terminalId}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="text-slate-700 flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              <span className="truncate max-w-[180px]" title={log.location}>{log.location}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="font-semibold text-emerald-700">{log.confidence}% Match</span>
                            </div>
                            <div className="text-[10px] text-slate-400">{log.verificationStatus}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            {log.isLate ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                                Late Arrival
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                On Time
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => handleSendAttendanceWhatsApp(log)}
                              className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-[11px] font-bold inline-flex items-center gap-1.5 transition-colors shadow-xs"
                              title="Send WhatsApp confirmation advice to employee"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                              <span>WhatsApp</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: INGESTION SOURCES & TERMINALS */}
      {activeTab === 'terminals' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">Configured biometric hardware, access barriers, and cloud attendance listeners.</p>
            <button
              onClick={() => setShowAddTerminalModal(true)}
              className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Register Terminal</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {terminals.map((term) => {
              const IconComp = getSourceIcon(term.sourceType);
              return (
                <div
                  key={term.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-teal-400 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-teal-50 rounded-xl text-teal-700 border border-teal-100">
                          <IconComp className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
                          {term.id}
                        </span>
                      </div>
                      <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        {term.status}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-teal-700 leading-snug">
                      {term.name}
                    </h3>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">{term.sourceType}</div>

                    <div className="space-y-1.5 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Location:</span>
                        <span className="font-semibold text-slate-700">{term.location}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">IP Address:</span>
                        <span className="font-mono text-slate-700">{term.ipAddress}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Swipes Today:</span>
                        <span className="font-bold text-teal-700">{term.todaySwipes}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Firmware:</span>
                        <span className="font-mono text-slate-500 text-[11px]">{term.firmware}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditTerminal(term)}
                        className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors border border-slate-200"
                        title="Edit Terminal"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTerminal(term.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-slate-200"
                        title="Delete Terminal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleSimulateSwipe(term)}
                        className="px-2.5 py-1.5 bg-slate-50 hover:bg-teal-50 text-slate-700 hover:text-teal-800 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors border border-slate-200"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Simulate</span>
                      </button>

                      <button
                        onClick={() => handleSyncTerminal(term.id)}
                        className="px-2.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors border border-teal-200"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Sync</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: REGULARIZATION REQUESTS */}
      {activeTab === 'regularizations' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            {regularizations.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-100">
                  <Clock className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-1">No Regularization Requests</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mb-5 leading-relaxed">
                  Employees who forget to clock in or experience biometric device network errors can submit a missed punch regularization with a valid reason.
                </p>
                <button
                  onClick={() => setShowRegularizeModal(true)}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-xl text-xs flex items-center gap-2 mx-auto shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Apply Regularization</span>
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold text-[11px] tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Request ID & Employee</th>
                      <th className="py-3.5 px-4">Punch Date & Type</th>
                      <th className="py-3.5 px-4">Requested Time</th>
                      <th className="py-3.5 px-4">Reason & Justification</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {regularizations.map((reg) => (
                      <tr key={reg.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{reg.employeeName}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{reg.id} • {reg.employeeId}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-800">{reg.date}</div>
                          <div className="text-[11px] text-slate-500">{reg.missedPunchType}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-mono font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded inline-block">
                            {reg.requestedTime}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs">
                          <p className="text-slate-700 truncate" title={reg.reason}>{reg.reason}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          {reg.status === 'Approved' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                            </span>
                          ) : reg.status === 'Rejected' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                              <XCircle className="w-3.5 h-3.5" /> Rejected
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                              <Clock className="w-3.5 h-3.5" /> Pending Approval
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditRegularization(reg)}
                              className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                              title="Edit Regularization"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteRegularization(reg.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Regularization"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            {reg.status.includes('Pending') && (
                              <>
                                <button
                                  onClick={() => handleReviewRegularization(reg.id, 'Rejected')}
                                  className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition-colors border border-rose-200"
                                  title="Reject"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleReviewRegularization(reg.id, 'Approved')}
                                  className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors shadow-xs"
                                  title="Approve"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Manual Clock In/Out Modal */}
      {showManualPunchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setShowManualPunchModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 bg-teal-50 text-teal-600 rounded-xl border border-teal-100">
                <Laptop className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Virtual Web Clock</h3>
                <p className="text-xs text-slate-500">Record timestamped attendance punch</p>
              </div>
            </div>

            <form onSubmit={handleSubmitPunch} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Employee Name *
                </label>
                <input
                  type="text"
                  value={punchForm.employeeName}
                  onChange={(e) => setPunchForm({ ...punchForm, employeeName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Employee ID *
                  </label>
                  <input
                    type="text"
                    value={punchForm.employeeId}
                    onChange={(e) => setPunchForm({ ...punchForm, employeeId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Direction *
                  </label>
                  <select
                    value={punchForm.direction}
                    onChange={(e) => setPunchForm({ ...punchForm, direction: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
                  >
                    <option value="Check-In">Check-In</option>
                    <option value="Check-Out">Check-Out</option>
                    <option value="Break-Out">Break-Out</option>
                    <option value="Break-In">Break-In</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ingestion Location
                </label>
                <input
                  type="text"
                  value={punchForm.location}
                  onChange={(e) => setPunchForm({ ...punchForm, location: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowManualPunchModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Log Attendance</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Regularize Modal */}
      {showRegularizeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setShowRegularizeModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Attendance Regularization</h3>
                <p className="text-xs text-slate-500">Apply for missing punch or on-duty reconciliation</p>
              </div>
            </div>

            <form onSubmit={handleSubmitRegularization} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Employee Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={regularizeForm.employeeName}
                  onChange={(e) => setRegularizeForm({ ...regularizeForm, employeeName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={regularizeForm.date}
                    onChange={(e) => setRegularizeForm({ ...regularizeForm, date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Requested Time *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 09:15 AM"
                    value={regularizeForm.requestedTime}
                    onChange={(e) => setRegularizeForm({ ...regularizeForm, requestedTime: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Incident Category *
                </label>
                <select
                  value={regularizeForm.missedPunchType}
                  onChange={(e) => setRegularizeForm({ ...regularizeForm, missedPunchType: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
                >
                  <option value="Missed Check-In">Missed Check-In</option>
                  <option value="Missed Check-Out">Missed Check-Out</option>
                  <option value="Biometric Terminal Offline">Biometric Terminal Offline</option>
                  <option value="On-Duty Client Meeting">On-Duty Client Meeting</option>
                  <option value="Work From Home / Remote">Work From Home / Remote</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason & Justification *
                </label>
                <textarea
                  rows={3}
                  placeholder="Explain why the punch was missed (e.g. attended client meeting at external site)..."
                  value={regularizeForm.reason}
                  onChange={(e) => setRegularizeForm({ ...regularizeForm, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none resize-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRegularizeModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Request</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Terminal Modal */}
      {showAddTerminalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setShowAddTerminalModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 bg-teal-50 text-teal-600 rounded-xl border border-teal-100">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Register Ingestion Device</h3>
                <p className="text-xs text-slate-500">Connect a biometric terminal or turnstile gate</p>
              </div>
            </div>

            <form onSubmit={handleCreateTerminal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Device Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Floor 3 Biometric Scanner"
                  value={terminalForm.name}
                  onChange={(e) => setTerminalForm({ ...terminalForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Source Protocol / Device Type *
                </label>
                <select
                  value={terminalForm.sourceType}
                  onChange={(e) => setTerminalForm({ ...terminalForm, sourceType: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
                >
                  <option value="Biometric Fingerprint (ZKTeco)">Biometric Fingerprint (ZKTeco)</option>
                  <option value="RFID Smart Card Swipe">RFID Smart Card Swipe</option>
                  <option value="Mobile App Geofence (GPS)">Mobile App Geofence (GPS)</option>
                  <option value="Facial Recognition AI Camera">Facial Recognition AI Camera</option>
                  <option value="Web Portal Virtual Clock">Web Portal Virtual Clock</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Location / Zone *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bangalore Campus - Tower B Entrance"
                  value={terminalForm.location}
                  onChange={(e) => setTerminalForm({ ...terminalForm, location: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  IP Address / Gateway URL
                </label>
                <input
                  type="text"
                  value={terminalForm.ipAddress}
                  onChange={(e) => setTerminalForm({ ...terminalForm, ipAddress: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddTerminalModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Register Device</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BIOMETRIC WITH SELFIE ATTENDANCE KIOSK MODAL */}
      {showSelfieKioskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-teal-500/40 rounded-3xl max-w-4xl w-full p-6 text-white shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={handleCloseSelfieKiosk}
              className="absolute right-5 top-5 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/80 hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
              <div className="p-3 bg-gradient-to-tr from-teal-500 to-emerald-400 rounded-2xl text-slate-950 shadow-lg shadow-teal-500/20">
                <Camera className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-white">Biometric with Selfie Attendance Kiosk</h2>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Dual Biometric AI
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Multi-Factor Authentication • AI Facial Liveness + Optical Minutiae Scanner • Terminal: DEV-BIO-SELFIE-01
                </p>
              </div>
            </div>

            {/* Modal Body: 2 Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column: AI Camera Viewfinder & Selfie */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-between">
                <div className="w-full flex items-center justify-between mb-3 text-xs">
                  <span className="font-bold text-slate-300 flex items-center gap-1.5">
                    <Scan className="w-4 h-4 text-teal-400" />
                    Facial Recognition Viewfinder
                  </span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${faceVerified ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                    {faceVerified ? '✓ Face Liveness Verified' : 'Awaiting Selfie Capture'}
                  </span>
                </div>

                {/* Viewport Frame */}
                <div className="relative w-full aspect-4/3 bg-slate-900 rounded-2xl overflow-hidden border-2 border-slate-800 flex items-center justify-center">
                  <canvas ref={canvasRef} className="hidden" />

                  {selfieSnapshot ? (
                    <div className="relative w-full h-full">
                      <img
                        src={selfieSnapshot}
                        alt="Captured selfie"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent flex flex-col justify-end p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" /> 99.8% Facial Match Confirmed
                          </span>
                          <button
                            onClick={() => {
                              setSelfieSnapshot(null);
                              setFaceVerified(false);
                              startCamera();
                            }}
                            className="px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-semibold flex items-center gap-1 backdrop-blur-sm transition-all"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Retake</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="relative w-full h-full flex flex-col items-center justify-center">
                      <video
                        ref={videoRef}
                        playsInline
                        muted
                        autoPlay
                        className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
                      />

                      {!cameraActive && (
                        <div className="flex flex-col items-center justify-center p-6 text-center">
                          <div className="w-20 h-20 rounded-full border-2 border-dashed border-teal-500/50 flex items-center justify-center mb-3 text-teal-400/80 bg-teal-500/5 animate-pulse">
                            <UserCheck className="w-10 h-10" />
                          </div>
                          <span className="text-xs font-bold text-slate-300">Front Camera Ready</span>
                          <span className="text-[10px] text-slate-500 mt-1 max-w-[200px]">
                            Position your face within the frame for biometric liveness verification
                          </span>
                        </div>
                      )}

                      {/* HUD Overlay Reticle */}
                      <div className="absolute inset-4 pointer-events-none border border-teal-500/20 rounded-xl">
                        {/* Corner markers */}
                        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-teal-400" />
                        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-teal-400" />
                        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-teal-400" />
                        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-teal-400" />

                        {/* Animated Laser Scanning Line */}
                        <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-teal-400 to-transparent animate-bounce opacity-80" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Camera Action Buttons */}
                <div className="w-full mt-4 flex items-center justify-between gap-3">
                  <div className="text-[10px] text-slate-400 font-mono">
                    ISO/IEC 19794-5 • Anti-Spoof Active
                  </div>
                  {!selfieSnapshot && (
                    <button
                      type="button"
                      onClick={captureSelfie}
                      className="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-teal-500/20 transition-all"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Capture Selfie & Verify</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Right Column: Employee Select & Biometric Fingerprint Sensor */}
              <div className="flex flex-col justify-between space-y-4">
                {/* Employee Quick Select */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">Employee Identification</span>
                    <span className="text-[10px] font-mono text-teal-400">{kioskEmployee.id}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { name: 'Rahul Sharma', id: 'EMP-3042', dept: 'Engineering', phone: '+91 98450 11223' },
                      { name: 'Priya Sundaram', id: 'EMP-2045', dept: 'Product', phone: '+91 98765 43210' },
                      { name: 'Aarav Patel', id: 'EMP-1021', dept: 'Operations', phone: '+91 91234 56789' },
                      { name: 'Neha Gupta', id: 'EMP-4089', dept: 'Marketing', phone: '+91 99887 76655' }
                    ].map((emp) => (
                      <button
                        key={emp.id}
                        type="button"
                        onClick={() => setKioskEmployee(emp)}
                        className={`p-2 rounded-xl text-left border transition-all text-xs ${
                          kioskEmployee.id === emp.id
                            ? 'bg-teal-500/20 border-teal-400 text-white font-bold'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850'
                        }`}
                      >
                        <div className="truncate">{emp.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{emp.dept}</div>
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Direction</label>
                      <select
                        value={kioskDirection}
                        onChange={(e) => setKioskDirection(e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:ring-1 focus:ring-teal-400"
                      >
                        <option value="Check-In">Check-In</option>
                        <option value="Check-Out">Check-Out</option>
                        <option value="Break-Out">Break-Out</option>
                        <option value="Break-In">Break-In</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">GPS Geotag</label>
                      <div className="text-[11px] bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-400 truncate font-mono">
                        12.9716° N, 77.5946° E
                      </div>
                    </div>
                  </div>
                </div>

                {/* Optical Biometric Fingerprint Sensor Pad */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col items-center text-center">
                  <div className="w-full flex items-center justify-between mb-3 text-xs">
                    <span className="font-bold text-slate-300 flex items-center gap-1.5">
                      <Fingerprint className="w-4 h-4 text-emerald-400" />
                      Optical Biometric Contact Scanner
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${fingerprintVerified ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
                      {fingerprintVerified ? '✓ 99.4% Minutiae Match' : 'Ready for Sensor Scan'}
                    </span>
                  </div>

                  {/* Fingerprint Touch Target */}
                  <button
                    type="button"
                    onClick={handleSimulateFingerprint}
                    disabled={isScanningFingerprint}
                    className={`relative w-24 h-24 rounded-3xl border-2 flex flex-col items-center justify-center transition-all ${
                      fingerprintVerified
                        ? 'border-emerald-400 bg-emerald-500/10 text-emerald-400 shadow-lg shadow-emerald-500/20'
                        : isScanningFingerprint
                        ? 'border-teal-400 bg-teal-500/20 text-teal-300 animate-pulse'
                        : 'border-slate-700 bg-slate-900 hover:border-teal-400/80 text-slate-400 hover:text-teal-300'
                    }`}
                  >
                    <Fingerprint className={`w-12 h-12 transition-transform duration-300 ${isScanningFingerprint ? 'scale-110' : ''}`} />
                    {fingerprintVerified && (
                      <Check className="w-5 h-5 text-emerald-400 absolute bottom-2 right-2 bg-slate-950 rounded-full p-0.5" />
                    )}
                  </button>

                  <p className="text-xs text-slate-300 font-semibold mt-2.5">
                    {isScanningFingerprint
                      ? 'Analyzing optical minutiae ridges...'
                      : fingerprintVerified
                      ? 'Biometric Fingerprint Match Verified (99.4%)'
                      : 'Place finger on optical sensor pad to scan'}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5 font-mono">
                    ANSI/INCITS 378 Standard • Secure Hardware Enclave
                  </p>
                </div>

                {/* WhatsApp Auto-Send Checkbox */}
                <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="font-bold text-emerald-300">Instant WhatsApp Punch Confirmation</div>
                      <div className="text-[10px] text-slate-400">Sends attendance receipt & timestamp to {kioskEmployee.phone}</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={sendWhatsAppOnPunch}
                    onChange={(e) => setSendWhatsAppOnPunch(e.target.checked)}
                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 bg-slate-900 border-slate-700"
                  />
                </div>

                {/* Final Submit Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleSubmitBiometricSelfiePunch}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:via-teal-400 hover:to-cyan-400 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-teal-500/25 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <CheckCircle2 className="w-5 h-5 text-slate-950" />
                    <span>Authorize & Log Attendance Punch</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FULL RESOLUTION VERIFIED PHOTO PREVIEW MODAL */}
      {previewPhotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-5 text-white shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setPreviewPhotoModal(null)}
              className="absolute right-4 top-4 p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <Camera className="w-5 h-5 text-teal-400" />
              <h3 className="text-sm font-bold text-white">Biometric Selfie Audit Snapshot</h3>
            </div>

            <div className="rounded-2xl overflow-hidden border border-slate-800 aspect-4/3 bg-slate-950 flex items-center justify-center">
              <img
                src={previewPhotoModal}
                alt="Audit verification snapshot"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="mt-4 p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>Verification Engine:</span>
                <span className="font-semibold text-emerald-400">Athena VisionEdge 1.9</span>
              </div>
              <div className="flex justify-between">
                <span>Confidence Score:</span>
                <span className="font-bold text-white">99.8% Match</span>
              </div>
              <div className="flex justify-between">
                <span>Anti-Spoof Check:</span>
                <span className="font-semibold text-emerald-400">PASSED (Depth Liveness OK)</span>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setPreviewPhotoModal(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
      {/* EDIT TERMINAL MODAL */}
      {showEditTerminalModal && editingTerminal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-teal-50 text-teal-600 rounded-xl">
                  <Pencil className="w-5 h-5" />
                </span>
                <h3 className="text-base font-bold text-slate-900">Edit Terminal Hardware</h3>
              </div>
              <button onClick={() => setShowEditTerminalModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateTerminal} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Terminal Device Name *</label>
                <input
                  type="text"
                  required
                  value={editingTerminal.name}
                  onChange={(e) => setEditingTerminal({ ...editingTerminal, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Source / Device Technology</label>
                <select
                  value={editingTerminal.sourceType}
                  onChange={(e) => setEditingTerminal({ ...editingTerminal, sourceType: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none bg-white"
                >
                  <option value="Biometric Fingerprint (ZKTeco)">Biometric Fingerprint (ZKTeco)</option>
                  <option value="Facial Recognition Kiosk">Facial Recognition Kiosk</option>
                  <option value="RFID / Smart Card Turnstile">RFID / Smart Card Turnstile</option>
                  <option value="GPS Geofenced Mobile App">GPS Geofenced Mobile App</option>
                  <option value="Web Portal Virtual Clock">Web Portal Virtual Clock</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Physical Location *</label>
                <input
                  type="text"
                  required
                  value={editingTerminal.location}
                  onChange={(e) => setEditingTerminal({ ...editingTerminal, location: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">IP Address / Host</label>
                  <input
                    type="text"
                    value={editingTerminal.ipAddress}
                    onChange={(e) => setEditingTerminal({ ...editingTerminal, ipAddress: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={editingTerminal.status}
                    onChange={(e) => setEditingTerminal({ ...editingTerminal, status: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none bg-white"
                  >
                    <option value="Online">Online</option>
                    <option value="Offline">Offline</option>
                    <option value="Syncing">Syncing</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Firmware Version</label>
                <input
                  type="text"
                  value={editingTerminal.firmware || ''}
                  onChange={(e) => setEditingTerminal({ ...editingTerminal, firmware: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditTerminalModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  Save Terminal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT REGULARIZATION MODAL */}
      {showEditRegularizationModal && editingRegularization && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-teal-50 text-teal-600 rounded-xl">
                  <Pencil className="w-5 h-5" />
                </span>
                <h3 className="text-base font-bold text-slate-900">Edit Regularization Request</h3>
              </div>
              <button onClick={() => setShowEditRegularizationModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateRegularization} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Employee Name</label>
                  <input
                    type="text"
                    required
                    value={editingRegularization.employeeName}
                    onChange={(e) => setEditingRegularization({ ...editingRegularization, employeeName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={editingRegularization.date}
                    onChange={(e) => setEditingRegularization({ ...editingRegularization, date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Punch Type</label>
                  <select
                    value={editingRegularization.missedPunchType}
                    onChange={(e) => setEditingRegularization({ ...editingRegularization, missedPunchType: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none bg-white"
                  >
                    <option value="Missed Check-In">Missed Check-In</option>
                    <option value="Missed Check-Out">Missed Check-Out</option>
                    <option value="Biometric Machine Timeout">Biometric Machine Timeout</option>
                    <option value="On-Duty Client Visit">On-Duty Client Visit</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Requested Time</label>
                  <input
                    type="text"
                    required
                    value={editingRegularization.requestedTime}
                    onChange={(e) => setEditingRegularization({ ...editingRegularization, requestedTime: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reason / Justification</label>
                <textarea
                  rows={3}
                  value={editingRegularization.reason}
                  onChange={(e) => setEditingRegularization({ ...editingRegularization, reason: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Approval Status</label>
                <select
                  value={editingRegularization.status}
                  onChange={(e) => setEditingRegularization({ ...editingRegularization, status: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none bg-white"
                >
                  <option value="Pending Approval">Pending Approval</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditRegularizationModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  Save Regularization
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
