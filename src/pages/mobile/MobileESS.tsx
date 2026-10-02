import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Smartphone, MapPin, Camera, Clock, DollarSign, Calendar,
  CheckCircle2, AlertTriangle, FileText, ChevronRight, ArrowLeft,
  User, ShieldCheck, Award, ThumbsUp, Send, Download,
  UploadCloud, RefreshCw, X, Receipt, CheckSquare, Sparkles,
  Fingerprint, Briefcase, Bell, Eye, Compass, LogOut, RotateCcw, Plus, Trash2
} from 'lucide-react';
import { Link } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function MobileESS() {
  const [activeTab, setActiveTab] = useState<'home' | 'punch' | 'leaves' | 'payslip' | 'expenses' | 'approvals'>('home');
  const [simulatedDevice, setSimulatedDevice] = useState<'iphone' | 'fullscreen'>('iphone');
  const [currentTime, setCurrentTime] = useState<string>('');
  const [punchStatus, setPunchStatus] = useState<'OUT' | 'IN'>('OUT');
  const [lastPunchTime, setLastPunchTime] = useState<string>('09:14 AM');
  const [hoursWorkedToday, setHoursWorkedToday] = useState<string>('5h 42m');
  const [notification, setNotification] = useState<string | null>(null);

  // Profile data
  const employee = {
    id: 'EMP-101',
    name: 'Rajesh Kumar',
    role: 'Staff Software Architect',
    dept: 'Technology & Engineering',
    avatar: 'RK',
    netSalary: 145000,
    leaves: { cl: 8, sl: 5, pl: 14 }
  };

  // State for Mobile Punch
  const [geofenceVerified, setGeofenceVerified] = useState(true);
  const [currentCoords, setCurrentCoords] = useState({ lat: 12.9716, lng: 77.5946, label: 'Main Tech Campus (Tower B)' });
  const [isPunching, setIsPunching] = useState(false);
  const [selfieCaptured, setSelfieCaptured] = useState(false);

  // State for Leaves
  const [leaveType, setLeaveType] = useState('Casual Leave');
  const [leaveDays, setLeaveDays] = useState(1);
  const [leaveReason, setLeaveReason] = useState('');
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveHistory, setLeaveHistory] = useState([
    { id: 'LV-1', type: 'Casual Leave', dates: '24 Sep - 25 Sep 2026', status: 'Approved', days: 2 },
    { id: 'LV-2', type: 'Sick Leave', dates: '10 Aug 2026', status: 'Approved', days: 1 }
  ]);

  // State for Expenses
  const [expenseAmount, setExpenseAmount] = useState('1850');
  const [expenseMerchant, setExpenseMerchant] = useState('Uber Technologies');
  const [expenseCategory, setExpenseCategory] = useState('Local Travel');
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseClaims, setExpenseClaims] = useState([
    { id: 'EXP-M-01', merchant: 'Uber Technologies', category: 'Conveyance', amount: 840, status: 'Settled' },
    { id: 'EXP-M-02', merchant: 'Blue Tokai Coffee', category: 'Client Hospitality', amount: 1450, status: 'Approved' }
  ]);

  // Manager Approvals Queue
  const [approvalsQueue, setApprovalsQueue] = useState([
    { id: 'AP-1', type: 'Leave Request', staff: 'Ananya Sharma', details: 'Privilege Leave (3 Days) for family travel', date: '28 Sep 2026' },
    { id: 'AP-2', type: 'Expense Claim', staff: 'Amit Verma', details: '₹3,400 Regional Client Travel Airfare', date: '22 Sep 2026' },
    { id: 'AP-3', type: 'Shift Swap', staff: 'Vikram Malhotra', details: 'Night Shift swap with Rohan Deshmukh', date: '26 Sep 2026' }
  ]);

  // Clock updater
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // 1-Tap Geofenced Punch
  const handleTogglePunch = () => {
    setIsPunching(true);
    setTimeout(() => {
      setIsPunching(false);
      if (punchStatus === 'OUT') {
        setPunchStatus('IN');
        setLastPunchTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        setNotification('Mobile Geofence Verified: Punched IN at Main Tech Campus.');
      } else {
        setPunchStatus('OUT');
        setLastPunchTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        setNotification('Mobile Geofence Verified: Punched OUT. Day summary logged.');
      }
      setTimeout(() => setNotification(null), 4000);
    }, 1200);
  };

  // Submit Leave
  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    setLeaveHistory([
      { id: `LV-${Date.now().toString().slice(-4)}`, type: leaveType, dates: '28 Sep 2026', status: 'Pending Review', days: leaveDays },
      ...leaveHistory
    ]);
    setShowLeaveModal(false);
    setNotification(`Leave request for ${leaveDays} day(s) submitted for approval.`);
    setTimeout(() => setNotification(null), 4000);
  };

  // Cancel / Delete Leave
  const handleCancelLeave = (id: string) => {
    if (!window.confirm('Cancel and delete this leave application?')) return;
    setLeaveHistory(leaveHistory.filter((lh) => lh.id !== id));
    setNotification('Leave request cancelled and removed.');
    setTimeout(() => setNotification(null), 3000);
  };

  // Submit Expense
  const handleApplyExpense = (e: React.FormEvent) => {
    e.preventDefault();
    setExpenseClaims([
      { id: `EXP-${Date.now().toString().slice(-4)}`, merchant: expenseMerchant, category: expenseCategory, amount: Number(expenseAmount), status: 'Submitted' },
      ...expenseClaims
    ]);
    setShowExpenseModal(false);
    setNotification(`Expense claim of ₹${expenseAmount} submitted for reimbursement.`);
    setTimeout(() => setNotification(null), 4000);
  };

  // Delete Expense
  const handleDeleteExpense = (id: string) => {
    if (!window.confirm('Delete this expense claim?')) return;
    setExpenseClaims(expenseClaims.filter((ec) => ec.id !== id));
    setNotification('Expense claim removed.');
    setTimeout(() => setNotification(null), 3000);
  };

  // Approval action
  const handleApprovalAction = (id: string, action: 'Approved' | 'Rejected') => {
    setApprovalsQueue(approvalsQueue.filter(a => a.id !== id));
    setNotification(`Request ${id} ${action} successfully.`);
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-2 sm:p-6 flex flex-col items-center justify-start">
      {/* Top Controller Bar (Desktop mode selector) */}
      <div className="w-full max-w-5xl mb-4 flex items-center justify-between bg-slate-900/90 backdrop-blur-md p-3 rounded-2xl border border-slate-800 text-xs">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-gray-400 hover:text-white flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Exit to Desktop Hub
          </Link>
          <span className="text-gray-600">|</span>
          <span className="flex items-center gap-1.5 font-bold text-emerald-400">
            <Smartphone className="w-4 h-4" /> Athena Mobile ESS (iOS & Android)
          </span>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
            Capacitor 8 Native Engine
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSimulatedDevice(simulatedDevice === 'iphone' ? 'fullscreen' : 'iphone')}
            className="px-3 py-1.5 rounded-xl font-bold bg-slate-800 hover:bg-slate-700 text-gray-200 transition-colors cursor-pointer border border-slate-700"
          >
            {simulatedDevice === 'iphone' ? 'Expand Full Viewport' : 'Simulate iPhone Bezel'}
          </button>
        </div>
      </div>

      {/* Mobile Shell Frame */}
      <div
        className={`w-full transition-all duration-300 ${
          simulatedDevice === 'iphone'
            ? 'max-w-[420px] rounded-[48px] border-[10px] border-slate-800 shadow-2xl overflow-hidden ring-4 ring-slate-900 bg-slate-900 min-h-[840px] relative flex flex-col'
            : 'max-w-2xl bg-slate-900 rounded-3xl border border-slate-800 p-4 min-h-[800px] flex flex-col'
        }`}
      >
        {/* iPhone Speaker Notch / Dynamic Island */}
        {simulatedDevice === 'iphone' && (
          <div className="w-full pt-3 pb-1 flex justify-center bg-slate-900 sticky top-0 z-40">
            <div className="w-28 h-4 bg-black rounded-full flex items-center justify-between px-3">
              <span className="w-2 h-2 rounded-full bg-slate-800"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-950/80 border border-indigo-500/30"></span>
            </div>
          </div>
        )}

        {/* Mobile Header Bar */}
        <div className="p-4 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between sticky top-6 z-30">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-rose-600 flex items-center justify-center font-black text-sm text-white shadow-md">
              {employee.avatar}
            </div>
            <div>
              <h2 className="font-bold text-sm text-white leading-tight">{employee.name}</h2>
              <span className="text-[10px] text-gray-400 block">{employee.role}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
              <ShieldCheck className="w-3 h-3" /> Secure
            </div>
            <button className="p-2 rounded-full bg-slate-800 text-gray-300 relative">
              <Bell className="w-4 h-4" />
              {approvalsQueue.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1 right-1"></span>
              )}
            </button>
          </div>
        </div>

        {/* In-App Toast Notification */}
        {notification && (
          <div className="mx-4 mt-2 p-2.5 rounded-xl bg-indigo-600/90 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-2 shadow-lg animate-fade-in z-30">
            <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
            <span>{notification}</span>
          </div>
        )}

        {/* Scrollable Mobile Viewport Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24 text-xs">
          {/* ==================== 1. MOBILE HOME ==================== */}
          {activeTab === 'home' && (
            <div className="space-y-4">
              {/* Geofence Attendance Quick Punch Card */}
              <div className="p-4 rounded-3xl bg-gradient-to-br from-indigo-900/90 via-slate-900 to-slate-900 border border-indigo-700/40 shadow-xl relative overflow-hidden">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">Live Mobile Punch</span>
                    <h3 className="text-xl font-black text-white font-mono mt-0.5">{currentTime}</h3>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    punchStatus === 'IN' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-700 text-gray-300'
                  }`}>
                    {punchStatus === 'IN' ? '● PUNCHEED IN' : '○ PUNCHED OUT'}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-gray-300 mb-4 bg-slate-800/60 p-2.5 rounded-2xl border border-slate-700/50">
                  <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                  <span className="truncate">{currentCoords.label}</span>
                  <span className="text-emerald-400 font-bold ml-auto text-[10px]">Verified</span>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleTogglePunch}
                    disabled={isPunching}
                    className={`flex-1 py-3 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
                      punchStatus === 'OUT'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white'
                        : 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white'
                    }`}
                  >
                    {isPunching ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Fingerprint className="w-4 h-4" />
                    )}
                    {punchStatus === 'OUT' ? '1-Tap Clock IN' : '1-Tap Clock OUT'}
                  </button>
                  <button
                    onClick={() => setActiveTab('punch')}
                    className="p-3 bg-slate-800 hover:bg-slate-700 rounded-2xl text-gray-300 transition-colors"
                    title="Camera Selfie Punch"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Quick ESS Metric Tiles */}
              <div className="grid grid-cols-2 gap-3">
                <div
                  onClick={() => setActiveTab('leaves')}
                  className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-center text-gray-400 mb-1">
                    <span className="text-[10px] font-bold uppercase">Leave Quota</span>
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  </div>
                  <p className="text-lg font-black text-white">{employee.leaves.pl} Days</p>
                  <span className="text-[10px] text-emerald-400 font-medium">+8 CL / 5 SL</span>
                </div>

                <div
                  onClick={() => setActiveTab('payslip')}
                  className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-center text-gray-400 mb-1">
                    <span className="text-[10px] font-bold uppercase">Net Salary</span>
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <p className="text-lg font-black text-white">₹{(employee.netSalary / 1000).toFixed(0)}k</p>
                  <span className="text-[10px] text-gray-400 font-medium">Sep 2026 Ready</span>
                </div>
              </div>

              {/* Quick Action Dock Grid */}
              <div className="bg-slate-800/40 p-4 rounded-3xl border border-slate-800/80 space-y-3">
                <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider block">Self-Service Actions</span>
                <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                  <button
                    onClick={() => { setActiveTab('leaves'); setShowLeaveModal(true); }}
                    className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 flex flex-col items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Calendar className="w-5 h-5 text-indigo-400" />
                    <span>Apply Leave</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab('expenses'); setShowExpenseModal(true); }}
                    className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 flex flex-col items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Receipt className="w-5 h-5 text-emerald-400" />
                    <span>Claim Bill</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('payslip')}
                    className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 flex flex-col items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-5 h-5 text-amber-400" />
                    <span>Payslip</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('approvals')}
                    className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 flex flex-col items-center gap-1.5 transition-colors cursor-pointer relative"
                  >
                    <CheckSquare className="w-5 h-5 text-rose-400" />
                    <span>Approvals</span>
                    {approvalsQueue.length > 0 && (
                      <span className="absolute top-1 right-2 text-[9px] font-black bg-rose-600 px-1 rounded-full">
                        {approvalsQueue.length}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Today's Schedule & 1-on-1 Pulse */}
              <div className="p-4 rounded-3xl bg-slate-800/50 border border-slate-800 space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-200">Today's Agenda & Syncs</span>
                  <span className="text-[10px] text-indigo-400 font-bold">2 Meetings</span>
                </div>
                <div className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <strong className="block text-white">1-on-1 Bi-Weekly Sync</strong>
                    <span className="text-[10px] text-gray-400">with Vikramaditya Rao (VP Engg)</span>
                  </div>
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg">14:30</span>
                </div>
                <div className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <strong className="block text-white">Architecture Review Sprint</strong>
                    <span className="text-[10px] text-gray-400">Cloud Mesh Migration</span>
                  </div>
                  <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-lg">16:00</span>
                </div>
              </div>
            </div>
          )}

          {/* ==================== 2. MOBILE PUNCH & ATTENDANCE ==================== */}
          {activeTab === 'punch' && (
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-500" />
                Geofenced Biometric Selfie Punch
              </h3>

              {/* Simulated Camera Viewfinder */}
              <div className="relative w-full h-64 rounded-3xl bg-slate-950 border-2 border-indigo-500/50 overflow-hidden flex flex-col items-center justify-center shadow-inner">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-950/40 via-transparent to-transparent"></div>
                <div className="w-36 h-48 border-2 border-dashed border-emerald-400 rounded-3xl flex flex-col items-center justify-center p-2 text-center relative z-10">
                  <User className="w-16 h-16 text-slate-600 mb-1" />
                  <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider">Face Frame</span>
                </div>

                <div className="absolute bottom-3 left-4 right-4 bg-slate-900/90 backdrop-blur-md p-2 rounded-xl text-[10px] flex justify-between items-center text-gray-300">
                  <span>GPS: 12.9716° N, 77.5946° E</span>
                  <span className="text-emerald-400 font-bold">Accuracy: 4.2m</span>
                </div>
              </div>

              <button
                onClick={handleTogglePunch}
                disabled={isPunching}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg"
              >
                <Camera className="w-4 h-4" />
                {punchStatus === 'OUT' ? 'Capture Selfie & Clock IN' : 'Capture Selfie & Clock OUT'}
              </button>

              {/* Today's Punch History Timeline */}
              <div className="p-4 bg-slate-800/40 rounded-3xl border border-slate-800 space-y-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Today's Punch Timeline</span>
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-[11px] p-2 bg-slate-900 rounded-xl">
                    <span className="text-emerald-400 font-bold">✓ Check IN</span>
                    <span className="text-gray-300">{lastPunchTime}</span>
                    <span className="text-gray-500 text-[10px]">Office Geofence</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] p-2 bg-slate-900/50 rounded-xl text-gray-500">
                    <span>— Total Logged</span>
                    <span className="text-indigo-300 font-bold">{hoursWorkedToday}</span>
                    <span className="text-[10px]">Target: 8h 00m</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== 3. MOBILE LEAVES ==================== */}
          {activeTab === 'leaves' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-sm text-white">Leave Quota & Requests</h3>
                <button
                  onClick={() => setShowLeaveModal(true)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold text-white shadow-xs cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Apply
                </button>
              </div>

              {/* Balance Cards */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-3 rounded-2xl bg-indigo-950/60 border border-indigo-800/60 text-center">
                  <span className="text-[9px] font-bold uppercase text-indigo-300 block">Casual</span>
                  <strong className="text-lg font-black text-white">{employee.leaves.cl}</strong>
                  <span className="text-[9px] text-gray-400 block">Available</span>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-800/60 text-center">
                  <span className="text-[9px] font-bold uppercase text-emerald-300 block">Sick</span>
                  <strong className="text-lg font-black text-white">{employee.leaves.sl}</strong>
                  <span className="text-[9px] text-gray-400 block">Available</span>
                </div>
                <div className="p-3 rounded-2xl bg-purple-950/60 border border-purple-800/60 text-center">
                  <span className="text-[9px] font-bold uppercase text-purple-300 block">Privilege</span>
                  <strong className="text-lg font-black text-white">{employee.leaves.pl}</strong>
                  <span className="text-[9px] text-gray-400 block">Available</span>
                </div>
              </div>

              {/* History */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase text-gray-400">Past Requests</span>
                {leaveHistory.map((lh) => (
                  <div key={lh.id} className="p-3 rounded-2xl bg-slate-800/60 border border-slate-800 flex justify-between items-center">
                    <div>
                      <strong className="block text-white text-xs">{lh.type} ({lh.days}d)</strong>
                      <span className="text-[10px] text-gray-400">{lh.dates}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        lh.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {lh.status}
                      </span>
                      <button
                        onClick={() => handleCancelLeave(lh.id)}
                        title="Cancel / Delete Request"
                        className="p-1 rounded-lg text-gray-400 hover:text-red-400 hover:bg-slate-700/60 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== 4. MOBILE PAYSLIPS ==================== */}
          {activeTab === 'payslip' && (
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-white flex items-center justify-between">
                <span>Monthly Compensation</span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg">
                  Sep 2026 Disbursed
                </span>
              </h3>

              {/* Payslip Card */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-900 border border-emerald-800/40 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-300">Net Take-Home Pay</span>
                    <h4 className="text-2xl font-black text-white mt-0.5">₹{employee.netSalary.toLocaleString()}</h4>
                  </div>
                  <button
                    onClick={() => {
                      setNotification('Downloading PDF Payslip to device downloads...');
                      setTimeout(() => setNotification(null), 3000);
                    }}
                    className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800 text-[11px]">
                  <div className="flex justify-between text-gray-300">
                    <span>Basic Salary</span>
                    <strong className="text-white">₹145,000</strong>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>House Rent Allowance (HRA)</span>
                    <strong className="text-white">₹72,500</strong>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Special & Performance Allowance</span>
                    <strong className="text-white">₹48,000</strong>
                  </div>
                  <div className="flex justify-between text-rose-400 border-t border-slate-800 pt-1">
                    <span>Statutory Deductions (EPF + TDS)</span>
                    <strong>- ₹32,400</strong>
                  </div>
                </div>
              </div>

              {/* FBP & Tax Investment Quick Upload */}
              <div className="p-4 rounded-3xl bg-slate-800/40 border border-slate-800 space-y-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Tax Proofs & FBP Declarations</span>
                <p className="text-[11px] text-gray-300">Submit rent receipts, Section 80C mutual funds, or meal wallet claims.</p>
                <button
                  onClick={() => {
                    setNotification('Mobile camera triggered: snap investment receipt.');
                    setTimeout(() => setNotification(null), 3000);
                  }}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded-xl font-bold flex items-center justify-center gap-1.5 border border-indigo-500/30"
                >
                  <UploadCloud className="w-4 h-4" /> Snap Investment Proof
                </button>
              </div>
            </div>
          )}

          {/* ==================== 5. MOBILE EXPENSES ==================== */}
          {activeTab === 'expenses' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-sm text-white">Out-of-Pocket Claims</h3>
                <button
                  onClick={() => setShowExpenseModal(true)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-bold text-white shadow-xs cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Snap Bill
                </button>
              </div>

              <div className="space-y-2">
                {expenseClaims.map((ec) => (
                  <div key={ec.id} className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-800 flex justify-between items-center">
                    <div>
                      <strong className="block text-white text-xs">{ec.merchant}</strong>
                      <span className="text-[10px] text-gray-400">{ec.category} • {ec.id}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <strong className="block text-white text-xs font-bold">₹{ec.amount}</strong>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          ec.status === 'Settled' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-blue-500/20 text-blue-300'
                        }`}>
                          {ec.status}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteExpense(ec.id)}
                        title="Delete Claim"
                        className="p-1 rounded-lg text-gray-400 hover:text-red-400 hover:bg-slate-700/60 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== 6. MANAGER APPROVALS ==================== */}
          {activeTab === 'approvals' && (
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-white flex items-center justify-between">
                <span>Manager Approvals Dock</span>
                <span className="text-[10px] font-bold bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full">
                  {approvalsQueue.length} Pending
                </span>
              </h3>

              <div className="space-y-3">
                {approvalsQueue.map((ap) => (
                  <div key={ap.id} className="p-4 rounded-2xl bg-slate-800/70 border border-slate-800 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <strong className="text-white block text-xs">{ap.staff}</strong>
                        <span className="text-[10px] text-indigo-400 font-bold">{ap.type}</span>
                      </div>
                      <span className="text-[10px] text-gray-400">{ap.date}</span>
                    </div>

                    <p className="text-[11px] text-gray-300">{ap.details}</p>

                    <div className="flex gap-2 pt-2 border-t border-slate-800">
                      <button
                        onClick={() => handleApprovalAction(ap.id, 'Approved')}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        ✓ Approve
                      </button>
                      <button
                        onClick={() => handleApprovalAction(ap.id, 'Rejected')}
                        className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        ✕ Reject
                      </button>
                    </div>
                  </div>
                ))}

                {approvalsQueue.length === 0 && (
                  <div className="p-8 text-center bg-slate-800/30 rounded-3xl border border-slate-800 text-gray-400">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                    <p className="font-bold text-xs">All Caught Up!</p>
                    <p className="text-[10px] text-gray-500 mt-1">No pending team approvals in queue.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Mobile Sticky Bottom Navigation Dock */}
        <div className="p-2 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 flex justify-around items-center sticky bottom-0 z-40">
          <button
            onClick={() => setActiveTab('home')}
            className={`p-2 rounded-2xl flex flex-col items-center gap-1 text-[9px] font-bold cursor-pointer transition-colors ${
              activeTab === 'home' ? 'text-indigo-400' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Home</span>
          </button>

          <button
            onClick={() => setActiveTab('punch')}
            className={`p-2 rounded-2xl flex flex-col items-center gap-1 text-[9px] font-bold cursor-pointer transition-colors ${
              activeTab === 'punch' ? 'text-indigo-400' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Fingerprint className="w-4 h-4" />
            <span>Punch</span>
          </button>

          <button
            onClick={() => setActiveTab('leaves')}
            className={`p-2 rounded-2xl flex flex-col items-center gap-1 text-[9px] font-bold cursor-pointer transition-colors ${
              activeTab === 'leaves' ? 'text-indigo-400' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Leaves</span>
          </button>

          <button
            onClick={() => setActiveTab('payslip')}
            className={`p-2 rounded-2xl flex flex-col items-center gap-1 text-[9px] font-bold cursor-pointer transition-colors ${
              activeTab === 'payslip' ? 'text-indigo-400' : 'text-gray-400 hover:text-white'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Payslip</span>
          </button>

          <button
            onClick={() => setActiveTab('approvals')}
            className={`p-2 rounded-2xl flex flex-col items-center gap-1 text-[9px] font-bold cursor-pointer transition-colors relative ${
              activeTab === 'approvals' ? 'text-indigo-400' : 'text-gray-400 hover:text-white'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>Approvals</span>
            {approvalsQueue.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1 right-2"></span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Leave Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl w-[360px] max-w-full text-xs">
            <h3 className="font-bold text-white text-sm mb-3">Quick Mobile Leave</h3>
            <form onSubmit={handleApplyLeave} className="space-y-3">
              <div>
                <label className="block text-gray-400 mb-1">Leave Type</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-white"
                >
                  <option value="Casual Leave">Casual Leave (8 available)</option>
                  <option value="Sick Leave">Sick Leave (5 available)</option>
                  <option value="Privilege Leave">Privilege Leave (14 available)</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Number of Days</label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={leaveDays}
                  onChange={(e) => setLeaveDays(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Reason</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Urgent personal work"
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLeaveModal(false)}
                  className="px-3 py-1.5 bg-slate-800 text-gray-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold"
                >
                  Apply Leave
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl w-[360px] max-w-full text-xs">
            <h3 className="font-bold text-white text-sm mb-3">Snap & Claim Expense</h3>
            <form onSubmit={handleApplyExpense} className="space-y-3">
              <div>
                <label className="block text-gray-400 mb-1">Merchant / Vendor</label>
                <input
                  type="text"
                  required
                  value={expenseMerchant}
                  onChange={(e) => setExpenseMerchant(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Claim Amount (₹)</label>
                <input
                  type="number"
                  required
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Category</label>
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-white"
                >
                  <option value="Local Travel">Conveyance & Taxi</option>
                  <option value="Meals & Food">Meals & Food</option>
                  <option value="Client Hospitality">Client Hospitality</option>
                  <option value="Office Supplies">Tech Peripherals</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="px-3 py-1.5 bg-slate-800 text-gray-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold"
                >
                  Submit Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
