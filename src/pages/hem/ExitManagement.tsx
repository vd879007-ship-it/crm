import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Pencil,
  Trash2,
  X,
  LogOut, CheckCircle2, Clock, AlertTriangle, Users, FileText,
  Laptop, ShieldCheck, DollarSign, Plus, RefreshCw, Sparkles,
  ChevronRight, ArrowRight, UserCheck, UserMinus, Search, Filter,
  Calendar, Video, Eye, ThumbsUp, Star, Award, RotateCcw,
  CheckSquare, FileCheck2, Building2, HelpCircle, HardDrive, Phone, Mail
} from 'lucide-react';
import HEMNavigation from '../../components/HEMNavigation';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function ExitManagement() {
  const [activeTab, setActiveTab] = useState<'resignations' | 'clearance' | 'interviews' | 'fnf'>('resignations');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Core Data State
  const [exitRecords, setExitRecords] = useState<any[]>([]);
  const [clearanceItems, setClearanceItems] = useState<any[]>([]);
  const [exitInterviews, setExitInterviews] = useState<any[]>([]);

  // Selected state for details
  const [selectedExit, setSelectedExit] = useState<any>(null);
  const [selectedExitClearance, setSelectedExitClearance] = useState<any[]>([]);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [deptFilter, setDeptFilter] = useState<string>('All');
  const [clearanceDeptFilter, setClearanceDeptFilter] = useState<string>('All');

  // Modals
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showEditExitModal, setShowEditExitModal] = useState(false);
  const [editingExit, setEditingExit] = useState<any>(null);
  const [showEditInterviewModal, setShowEditInterviewModal] = useState(false);
  const [editingInterview, setEditingInterview] = useState<any>(null);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showScheduleInterviewModal, setShowScheduleInterviewModal] = useState(false);
  const [showRecordInterviewModal, setShowRecordInterviewModal] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<any>(null);
  const [showClearanceUpdateModal, setShowClearanceUpdateModal] = useState(false);
  const [selectedClearanceItem, setSelectedClearanceItem] = useState<any>(null);

  // Default staff directory
  const defaultEmployees = [
    { id: 'EMP-101', name: 'Rajesh Kumar', dept: 'Technology & Engineering', role: 'Staff Software Architect', email: 'rajesh.kumar@company.com', phone: '+91 98112 34567', joining: '2022-02-01' },
    { id: 'EMP-102', name: 'Ananya Sharma', dept: 'Product & Design', role: 'Lead Product Manager', email: 'ananya.sharma@company.com', phone: '+91 98223 45678', joining: '2022-07-15' },
    { id: 'EMP-103', name: 'Amit Verma', dept: 'Operations & Logistics', role: 'Operations Specialist', email: 'amit.verma@company.com', phone: '+91 98451 22890', joining: '2023-04-10' },
    { id: 'EMP-104', name: 'Priya Nair', dept: 'People & Culture (HR)', role: 'HR Business Partner', email: 'priya.nair@company.com', phone: '+91 98334 56789', joining: '2023-08-01' },
    { id: 'EMP-105', name: 'Vikramaditya Rao', dept: 'Executive Management', role: 'VP Engineering & Infrastructure', email: 'vikram.rao@company.com', phone: '+91 98990 12345', joining: '2021-05-10' }
  ];

  // Forms
  const [applyForm, setApplyForm] = useState({
    employeeId: 'EMP-103',
    resignationDate: new Date().toISOString().split('T')[0],
    requestedLWD: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
    noticePeriodDays: 60,
    noticeShortfallDays: 0,
    reasonCategory: 'Career Progression',
    detailedReason: '',
    submittedBy: 'HR on Behalf',
    submittedByRemarks: 'Applied on employee behalf following mutual discussion with HRBP.'
  });

  const [revokeForm, setRevokeForm] = useState({
    revocationReason: 'Counter-offer accepted: promoted to Lead Architect with 25% compensation revision and cloud squad leadership.',
    revokedBy: 'HR on Behalf',
    counterOfferAccepted: true,
    retainedDesignation: 'Staff Software Architect'
  });

  const [statusUpdateForm, setStatusUpdateForm] = useState({
    status: 'Notice Period',
    approvedLWD: '',
    managerComments: 'Resignation accepted with regret. Transition plan initiated.'
  });

  const [scheduleInterviewForm, setScheduleInterviewForm] = useState({
    interviewerName: 'Meera Nambiar (Senior HRBP)',
    scheduledDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    scheduledTime: '15:00 IST',
    meetingLink: 'https://meet.google.com/exi-sep-exit',
    mode: 'Online Video Call'
  });

  const [recordInterviewForm, setRecordInterviewForm] = useState({
    overallExperience: 5,
    managementEffectiveness: 4,
    compensationSatisfaction: 4,
    workLifeBalance: 4,
    growthOpportunities: 4,
    primaryPullFactor: 'Better compensation and global career exposure.',
    primaryPushFactor: 'None; thrilled with team leadership.',
    recommendCompany: 'Definitely Yes',
    retentionFeedback: 'Faster track for architect certifications and mentorship.',
    confidentialNotes: 'High-caliber employee; open to boomerang rehiring.',
    sentimentTone: 'Positive / Brand Advocate'
  });

  const [clearanceUpdateForm, setClearanceUpdateForm] = useState({
    status: 'Cleared',
    recoveryNotes: 'Asset inspected and received in A+ working condition.',
    financialDeductionAmount: 0,
    clearedBy: 'Clearance Officer'
  });

  // Fetch all exit data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [recordsRes, interviewsRes] = await Promise.all([
        axios.get(`${API_BASE}/api/hem/exit/records`).catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/api/hem/exit/interviews`).catch(() => ({ data: [] }))
      ]);

      setExitRecords(recordsRes.data);
      setExitInterviews(interviewsRes.data);

      if (recordsRes.data.length > 0) {
        const first = selectedExit ? recordsRes.data.find((e: any) => e.id === selectedExit.id) || recordsRes.data[0] : recordsRes.data[0];
        setSelectedExit(first);
        loadClearanceForExit(first.id);
      } else {
        setSelectedExit(null);
        setSelectedExitClearance([]);
      }
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to load exit management data.' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadClearanceForExit = async (exitId: string) => {
    try {
      const res = await axios.get(`${API_BASE}/api/hem/exit/clearance/${exitId}`);
      setSelectedExitClearance(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const triggerSimulation = async () => {
    try {
      setRefreshing(true);
      const res = await axios.post(`${API_BASE}/api/hem/exit/simulate`);
      setMessage({ type: 'success', text: res.data.message || 'Exit management simulated successfully!' });
      await fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: 'Simulation failed.' });
      setRefreshing(false);
    }
  };

  const triggerReset = async () => {
    try {
      setRefreshing(true);
      await axios.post(`${API_BASE}/api/hem/exit/reset`);
      setMessage({ type: 'success', text: 'All exit records have been reset to 0 entries.' });
      await fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: 'Reset failed.' });
      setRefreshing(false);
    }
  };

  const getEmp = (id: string) => defaultEmployees.find(e => e.id === id) || defaultEmployees[0];

  const handleOpenEditExit = (item: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingExit({ ...item });
    setShowEditExitModal(true);
  };

  const handleUpdateExit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExit) return;
    try {
      await axios.put(`${API_BASE}/api/hem/exit/records/${editingExit.id}`, editingExit);
      setShowEditExitModal(false);
      setEditingExit(null);
      setMessage({ type: 'success', text: 'Resignation record updated successfully.' });
      await fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update resignation record.' });
    }
  };

  const handleDeleteExit = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Permanently delete this resignation/exit record?')) return;
    try {
      await axios.delete(`${API_BASE}/api/hem/exit/records/${id}`);
      setMessage({ type: 'success', text: 'Exit record deleted.' });
      await fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete exit record.' });
    }
  };

  const handleDeleteClearanceItem = async (itemId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!selectedExit) return;
    if (!window.confirm('Delete this clearance item checklist row?')) return;
    try {
      await axios.delete(`${API_BASE}/api/hem/exit/clearance/${selectedExit.id}/item/${itemId}`);
      loadClearanceForExit(selectedExit.id);
      setMessage({ type: 'success', text: 'Clearance checklist item deleted.' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete clearance item.' });
    }
  };

  const handleOpenEditInterview = (intv: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingInterview({ ...intv });
    setShowEditInterviewModal(true);
  };

  const handleUpdateInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInterview) return;
    try {
      await axios.put(`${API_BASE}/api/hem/exit/interviews/${editingInterview.id}`, editingInterview);
      setShowEditInterviewModal(false);
      setEditingInterview(null);
      setMessage({ type: 'success', text: 'Exit interview schedule updated.' });
      await fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update interview.' });
    }
  };

  const handleDeleteInterview = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Cancel and delete this exit interview?')) return;
    try {
      await axios.delete(`${API_BASE}/api/hem/exit/interviews/${id}`);
      setMessage({ type: 'success', text: 'Exit interview deleted.' });
      await fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete interview.' });
    }
  };

  // Apply Resignation (Self or On Behalf)
  const handleApplyResignation = async (e: React.FormEvent) => {
    e.preventDefault();
    const emp = getEmp(applyForm.employeeId);
    try {
      await axios.post(`${API_BASE}/api/hem/exit/apply`, {
        employeeId: emp.id,
        employeeName: emp.name,
        department: emp.dept,
        designation: emp.role,
        email: emp.email,
        phone: emp.phone,
        joiningDate: emp.joining,
        resignationDate: applyForm.resignationDate,
        requestedLWD: applyForm.requestedLWD,
        noticePeriodDays: applyForm.noticePeriodDays,
        noticeShortfallDays: applyForm.noticeShortfallDays,
        reasonCategory: applyForm.reasonCategory,
        detailedReason: applyForm.detailedReason,
        submittedBy: applyForm.submittedBy,
        submittedByRemarks: applyForm.submittedByRemarks
      });
      setShowApplyModal(false);
      setMessage({ type: 'success', text: `Resignation successfully tendered for ${emp.name}. Clearance checklist auto-initiated.` });
      fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: 'Error applying resignation.' });
    }
  };

  // Revoke Resignation
  const handleRevokeResignation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExit) return;
    try {
      const res = await axios.post(`${API_BASE}/api/hem/exit/records/${selectedExit.id}/revoke`, revokeForm);
      setShowRevokeModal(false);
      setMessage({ type: 'success', text: res.data.message });
      fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to revoke resignation.' });
    }
  };

  // Update Status
  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExit) return;
    try {
      await axios.put(`${API_BASE}/api/hem/exit/records/${selectedExit.id}/status`, {
        status: statusUpdateForm.status,
        approvedLWD: statusUpdateForm.approvedLWD || selectedExit.requestedLWD,
        managerComments: statusUpdateForm.managerComments
      });
      setShowStatusModal(false);
      setMessage({ type: 'success', text: `Separation status updated to "${statusUpdateForm.status}".` });
      fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update exit status.' });
    }
  };

  // Auto-initiate clearance manually if needed
  const handleAutoInitiateClearance = async (exitId: string) => {
    try {
      const res = await axios.post(`${API_BASE}/api/hem/exit/clearance/${exitId}/auto-initiate`);
      setMessage({ type: 'success', text: res.data.message });
      loadClearanceForExit(exitId);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to auto-initiate clearance.' });
    }
  };

  // Update Clearance Item
  const handleUpdateClearanceItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExit || !selectedClearanceItem) return;
    try {
      await axios.put(`${API_BASE}/api/hem/exit/clearance/${selectedExit.id}/item/${selectedClearanceItem.id}`, clearanceUpdateForm);
      setShowClearanceUpdateModal(false);
      setMessage({ type: 'success', text: `Clearance task "${selectedClearanceItem.itemTitle}" updated.` });
      loadClearanceForExit(selectedExit.id);
      fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update clearance task.' });
    }
  };

  // Schedule Exit Interview
  const handleScheduleInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExit) return;
    try {
      await axios.post(`${API_BASE}/api/hem/exit/interviews/schedule`, {
        exitId: selectedExit.id,
        interviewerName: scheduleInterviewForm.interviewerName,
        scheduledDate: scheduleInterviewForm.scheduledDate,
        scheduledTime: scheduleInterviewForm.scheduledTime,
        meetingLink: scheduleInterviewForm.meetingLink,
        mode: scheduleInterviewForm.mode
      });
      setShowScheduleInterviewModal(false);
      setMessage({ type: 'success', text: `Online Exit Interview scheduled with ${selectedExit.employeeName}!` });
      fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to schedule exit interview.' });
    }
  };

  // Record Interview Responses
  const handleRecordInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInterview) return;
    try {
      await axios.post(`${API_BASE}/api/hem/exit/interviews/${selectedInterview.id}/record`, recordInterviewForm);
      setShowRecordInterviewModal(false);
      setMessage({ type: 'success', text: `Exit interview responses recorded and archived for ${selectedInterview.employeeName}!` });
      fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to record interview responses.' });
    }
  };

  // Filtered Exit Records
  const filteredExits = exitRecords.filter(e => {
    if (statusFilter !== 'All' && e.status !== statusFilter) return false;
    if (deptFilter !== 'All' && e.department !== deptFilter) return false;
    if (searchQuery && !e.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) && !e.id.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Filtered Clearance Items
  const filteredClearance = selectedExitClearance.filter(c => {
    if (clearanceDeptFilter !== 'All' && c.department !== clearanceDeptFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <HEMNavigation />

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl border border-rose-900/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="p-2.5 bg-rose-500/20 rounded-2xl border border-rose-400/30 text-rose-300">
                <LogOut className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  Exit & Separation Management
                  <span className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-rose-500/30 text-rose-200 border border-rose-400/30">
                    Offboarding Hub
                  </span>
                </h1>
                <p className="text-xs text-rose-200/80">
                  Resignation workflow, apply/revoke on employee's behalf, auto-clearance checklists, asset recovery, and online exit interviews
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowApplyModal(true)}
              className="bg-rose-600 hover:bg-rose-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center shadow-lg shadow-rose-600/30 cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-1.5" /> Tend Resignation
            </button>
            <button
              onClick={triggerSimulation}
              disabled={refreshing}
              className="bg-slate-800/80 hover:bg-slate-700 text-gray-200 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border border-slate-700/60 flex items-center cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 mr-1.5 text-amber-400" />
              {refreshing ? 'Processing...' : 'Simulate Exits'}
            </button>
            <button
              onClick={triggerReset}
              disabled={refreshing}
              className="bg-slate-800/80 hover:bg-slate-700 text-gray-400 px-3 py-2 rounded-xl text-xs font-semibold transition-all border border-slate-700/60 cursor-pointer"
            >
              Reset 0
            </button>
            <button
              onClick={fetchData}
              disabled={refreshing}
              className="p-2 bg-slate-800/80 hover:bg-slate-700 rounded-xl text-gray-300 transition-colors border border-slate-700/60 cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Global Summary KPI Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 mt-6 pt-5 border-t border-rose-900/60">
          <div className="bg-slate-800/50 backdrop-blur-xs p-3 rounded-2xl border border-rose-900/40">
            <p className="text-[10px] uppercase font-bold text-rose-300/80 tracking-wider">Active Resignations</p>
            <p className="text-xl font-black text-white mt-0.5">
              {exitRecords.filter(e => e.status !== 'Relieved & Closed' && e.status !== 'Revoked').length}
            </p>
            <p className="text-[10px] text-rose-300 font-medium mt-0.5">In Notice / Clearance</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-xs p-3 rounded-2xl border border-rose-900/40">
            <p className="text-[10px] uppercase font-bold text-rose-300/80 tracking-wider">Revoked & Retained</p>
            <p className="text-xl font-black text-emerald-400 mt-0.5">
              {exitRecords.filter(e => e.status === 'Revoked').length}
            </p>
            <p className="text-[10px] text-emerald-300 font-medium mt-0.5">Counter-offer Success</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-xs p-3 rounded-2xl border border-rose-900/40">
            <p className="text-[10px] uppercase font-bold text-rose-300/80 tracking-wider">Clearance In Progress</p>
            <p className="text-xl font-black text-amber-400 mt-0.5">
              {exitRecords.filter(e => e.clearanceStatus === 'In Progress').length}
            </p>
            <p className="text-[10px] text-amber-300 font-medium mt-0.5">Hardware & KT Tasks</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-xs p-3 rounded-2xl border border-rose-900/40">
            <p className="text-[10px] uppercase font-bold text-rose-300/80 tracking-wider">Exit Interviews</p>
            <p className="text-xl font-black text-white mt-0.5">{exitInterviews.length}</p>
            <p className="text-[10px] text-indigo-300 font-medium mt-0.5">
              {exitInterviews.filter(i => i.status === 'Completed').length} Recorded
            </p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-xs p-3 rounded-2xl border border-rose-900/40">
            <p className="text-[10px] uppercase font-bold text-rose-300/80 tracking-wider">Relieved & Settled</p>
            <p className="text-xl font-black text-cyan-400 mt-0.5">
              {exitRecords.filter(e => e.status === 'Relieved & Closed').length}
            </p>
            <p className="text-[10px] text-cyan-300 font-medium mt-0.5">FnF & Relieving Issued</p>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {message && (
        <div className={`p-4 rounded-2xl flex items-center justify-between text-sm font-semibold transition-all ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 text-rose-600" />}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-xs hover:underline cursor-pointer">Dismiss</button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white p-1.5 rounded-2xl border border-gray-200 shadow-xs flex flex-wrap gap-1.5">
        {[
          { id: 'resignations', label: 'Resignation Workflow & Revocation', icon: UserMinus, badge: exitRecords.length },
          { id: 'clearance', label: 'Clearance & Asset Recovery', icon: HardDrive, badge: selectedExitClearance.length },
          { id: 'interviews', label: 'Online Exit Interviews', icon: Video, badge: exitInterviews.length },
          { id: 'fnf', label: 'Final Settlement (FnF) & Relieving', icon: FileCheck2, badge: exitRecords.filter(e => e.fnfStatus === 'Settled').length }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === tab.id ? 'bg-rose-700/80 text-white' : 'bg-gray-200/80 text-gray-700'
              }`}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: RESIGNATION WORKFLOW & REVOCATION */}
      {/* ========================================================================= */}
      {activeTab === 'resignations' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <UserMinus className="w-5 h-5 text-rose-600" />
                Resignation Cases & Separation Workflow
              </h2>
              <p className="text-xs text-gray-500">
                Manage employee resignations, notice periods, manager reviews, and apply or revoke on employee behalf.
              </p>
            </div>
            <button
              onClick={() => setShowApplyModal(true)}
              className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-1.5" /> Apply Resignation (Self / On Behalf)
            </button>
          </div>

          {/* Search & Filters */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search employee, ID, reason..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex flex-wrap gap-2 items-center w-full md:w-auto">
              <span className="text-xs font-bold text-gray-500 mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Status:
              </span>
              {['All', 'Submitted', 'Notice Period', 'Clearance In Progress', 'Relieved & Closed', 'Revoked'].map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    statusFilter === st ? 'bg-rose-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Resignations Ledger Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredExits.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setSelectedExit(item);
                  loadClearanceForExit(item.id);
                }}
                className={`bg-white rounded-3xl p-5 border transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                  selectedExit?.id === item.id ? 'border-rose-400 shadow-md ring-2 ring-rose-500/20' : 'border-gray-200 shadow-xs hover:border-rose-200'
                }`}
              >
                {item.status === 'Revoked' && (
                  <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[9px] font-black uppercase px-3 py-1 rounded-bl-xl shadow-xs">
                    Revoked & Reinstated
                  </div>
                )}
                {item.status === 'Relieved & Closed' && (
                  <div className="absolute top-0 right-0 bg-cyan-600 text-white text-[9px] font-black uppercase px-3 py-1 rounded-bl-xl shadow-xs">
                    Relieved
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{item.id}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      item.status === 'Revoked' ? 'bg-emerald-100 text-emerald-800' :
                      item.status === 'Relieved & Closed' ? 'bg-cyan-100 text-cyan-800' :
                      item.status === 'Notice Period' ? 'bg-amber-100 text-amber-800' :
                      item.status === 'Clearance In Progress' ? 'bg-indigo-100 text-indigo-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {item.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-gray-900 text-base mb-0.5">{item.employeeName}</h3>
                  <p className="text-xs text-gray-500 mb-3">{item.designation} • {item.department}</p>

                  <div className="p-3 bg-gray-50 rounded-2xl mb-3 text-xs space-y-1">
                    <div className="flex justify-between text-gray-600">
                      <span>Reason:</span>
                      <strong className="text-gray-900">{item.reasonCategory}</strong>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Submitted By:</span>
                      <span className="font-semibold text-rose-700">{item.submittedBy}</span>
                    </div>
                    <div className="flex justify-between text-gray-500 text-[11px]">
                      <span>Notice Period:</span>
                      <span>{item.noticePeriodDays} Days</span>
                    </div>
                    <div className="flex justify-between text-gray-500 text-[11px]">
                      <span>Last Working Day (LWD):</span>
                      <strong className="text-gray-900">{item.approvedLWD || item.requestedLWD}</strong>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 italic line-clamp-2 mb-3">"{item.detailedReason}"</p>

                  {/* Revocation Banner if revoked */}
                  {item.revocationDetails && (
                    <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 mb-3">
                      <strong className="block text-[11px] font-bold text-emerald-800">Reinstatement Notes:</strong>
                      <p className="text-[11px]">{item.revocationDetails.revocationReason}</p>
                    </div>
                  )}

                  {/* Clearance Progress */}
                  {item.status !== 'Revoked' && (
                    <div className="space-y-1 mb-3">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-gray-600">Clearance Progress</span>
                        <span className={item.overallClearanceProgress === 100 ? 'text-emerald-600' : 'text-rose-600'}>
                          {item.overallClearanceProgress}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${item.overallClearanceProgress === 100 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                          style={{ width: `${item.overallClearanceProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <div className="flex gap-2">
                    {item.status !== 'Revoked' && item.status !== 'Relieved & Closed' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedExit(item);
                          setShowRevokeModal(true);
                        }}
                        className="text-emerald-700 hover:text-emerald-800 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 hover:bg-emerald-100 cursor-pointer flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" /> Revoke
                      </button>
                    )}
                    {item.status !== 'Revoked' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedExit(item);
                          setStatusUpdateForm({
                            status: item.status,
                            approvedLWD: item.approvedLWD || item.requestedLWD,
                            managerComments: ''
                          });
                          setShowStatusModal(true);
                        }}
                        className="text-gray-700 hover:text-gray-900 font-bold bg-gray-100 px-2.5 py-1 rounded-lg hover:bg-gray-200 cursor-pointer"
                      >
                        Update Status
                      </button>
                    )}
                    <button
                      onClick={(e) => handleOpenEditExit(item, e)}
                      className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Edit Resignation"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteExit(item.id, e)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Exit Record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedExit(item);
                      loadClearanceForExit(item.id);
                      setActiveTab('clearance');
                    }}
                    className="text-rose-600 hover:text-rose-800 font-bold flex items-center gap-0.5 hover:underline cursor-pointer"
                  >
                    Clearance <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {filteredExits.length === 0 && !loading && (
              <div className="col-span-full bg-white rounded-3xl border border-gray-200 p-12 text-center">
                <UserMinus className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="font-bold text-gray-800 text-base">No Separation Records Found</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                  Tender a resignation for self or on behalf of an employee, or click "Simulate Exits" to populate sample cases.
                </p>
                <button
                  onClick={() => setShowApplyModal(true)}
                  className="mt-4 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl text-xs font-bold"
                >
                  Apply Resignation
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CLEARANCE & ASSET RECOVERY TRACKER */}
      {/* ========================================================================= */}
      {activeTab === 'clearance' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-rose-600" />
                Departmental Clearance & Asset Recovery Tracker
              </h2>
              <p className="text-xs text-gray-500">
                Track physical hardware return (MacBooks, monitors), access revocations, loan settlements, and KT sign-offs.
              </p>
            </div>
            {selectedExit && (
              <button
                onClick={() => handleAutoInitiateClearance(selectedExit.id)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center shadow-xs cursor-pointer"
              >
                <Sparkles className="w-4 h-4 mr-1.5" /> Auto-Initiate Full Checklist
              </button>
            )}
          </div>

          {/* Active Employee Selector Bar */}
          <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-xs flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-500">Active Separation Case:</span>
              <select
                value={selectedExit?.id || ''}
                onChange={(e) => {
                  const item = exitRecords.find(x => x.id === e.target.value);
                  setSelectedExit(item);
                  if (item) loadClearanceForExit(item.id);
                }}
                className="border border-gray-200 rounded-xl p-2 text-xs font-bold text-gray-800 bg-gray-50"
              >
                {exitRecords.map(e => (
                  <option key={e.id} value={e.id}>{e.employeeName} ({e.department}) — {e.status}</option>
                ))}
              </select>
            </div>

            {selectedExit && (
              <div className="flex items-center gap-4 text-xs">
                <span>Clearance: <strong className="text-rose-600">{selectedExit.overallClearanceProgress}% Cleared</strong></span>
                <span>LWD: <strong className="text-gray-900">{selectedExit.approvedLWD || selectedExit.requestedLWD}</strong></span>
              </div>
            )}
          </div>

          {/* Department Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {[
              'All',
              'IT & Hardware Assets',
              'Finance & Accounts',
              'Project & Department Handover',
              'Admin & HR Operations'
            ].map(d => (
              <button
                key={d}
                onClick={() => setClearanceDeptFilter(d)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  clearanceDeptFilter === d ? 'bg-slate-900 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Clearance Checklist Items Table */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-900 text-sm">
                Clearance Checklist ({filteredClearance.length} items)
              </h3>
              <span className="text-xs text-gray-500">Multi-department digital sign-offs</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100">
                  <tr>
                    <th className="p-4">Department / Stream</th>
                    <th className="p-4">Item & Description</th>
                    <th className="p-4">Asset Tag / Serial</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Recovery Remarks</th>
                    <th className="p-4">Cleared By</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredClearance.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/80">
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-700">
                          {item.department}
                        </span>
                      </td>
                      <td className="p-4">
                        <strong className="text-gray-900 block">{item.itemTitle}</strong>
                        <span className="text-[11px] text-gray-400">{item.itemType}</span>
                      </td>
                      <td className="p-4">
                        {item.assetTag ? (
                          <div className="text-[11px]">
                            <span className="font-bold text-indigo-700">{item.assetTag}</span>
                            {item.serialNumber && <span className="block text-gray-400 text-[10px]">{item.serialNumber}</span>}
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">—</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          item.status === 'Cleared' ? 'bg-emerald-100 text-emerald-800' :
                          item.status === 'Discrepancy / Damaged' ? 'bg-rose-100 text-rose-800' :
                          item.status === 'Waived' ? 'bg-gray-100 text-gray-700' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600 max-w-xs truncate">
                        {item.recoveryNotes || 'Pending physical inspection'}
                        {item.financialDeductionAmount > 0 && (
                          <span className="block text-rose-600 font-bold">Deduction: ₹{item.financialDeductionAmount}</span>
                        )}
                      </td>
                      <td className="p-4 text-gray-600">
                        {item.clearedBy ? (
                          <div>
                            <strong className="block text-gray-800">{item.clearedBy}</strong>
                            <span className="text-[10px] text-gray-400">{new Date(item.clearedAt).toLocaleDateString()}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedClearanceItem(item);
                            setClearanceUpdateForm({
                              status: item.status,
                              recoveryNotes: item.recoveryNotes || '',
                              financialDeductionAmount: item.financialDeductionAmount || 0,
                              clearedBy: 'Clearance Officer'
                            });
                            setShowClearanceUpdateModal(true);
                          }}
                          className="text-xs font-bold text-rose-600 hover:text-rose-800 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200 hover:bg-rose-100 cursor-pointer"
                        >
                          Sign-off
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredClearance.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gray-400">
                        No clearance items found for this separation case. Click "Auto-Initiate Full Checklist" above.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ONLINE EXIT INTERVIEWS */}
      {/* ========================================================================= */}
      {activeTab === 'interviews' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Video className="w-5 h-5 text-rose-600" />
                Online Exit Interviews & Survey Analytics
              </h2>
              <p className="text-xs text-gray-500">
                Schedule video exit discussions, record 5-dimension satisfaction scores, pull/push attrition factors, and confidential notes.
              </p>
            </div>
            {selectedExit && (
              <button
                onClick={() => setShowScheduleInterviewModal(true)}
                className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4 mr-1.5" /> Schedule Exit Interview
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {exitInterviews.map((intv) => (
              <div key={intv.id} className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-gray-900 text-base">{intv.employeeName}</h3>
                      <p className="text-xs text-gray-500">{intv.designation} • {intv.department}</p>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      intv.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {intv.status}
                    </span>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 text-xs space-y-1 mt-3">
                    <div className="flex justify-between text-gray-600">
                      <span>Interviewer:</span>
                      <strong className="text-gray-900">{intv.interviewerName}</strong>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Scheduled Slot:</span>
                      <span>{intv.scheduledDate} at {intv.scheduledTime}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Format:</span>
                      <span className="font-semibold text-rose-700">{intv.mode}</span>
                    </div>
                  </div>

                  {/* Interview Survey Responses */}
                  {intv.responses ? (
                    <div className="mt-4 space-y-3 border-t border-gray-100 pt-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-700">Overall Experience:</span>
                        <div className="flex items-center gap-1 text-amber-500">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3.5 h-3.5 ${star <= intv.responses.overallExperience ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-600">
                        <div>Management: <strong>{intv.responses.managementEffectiveness}/5</strong></div>
                        <div>Compensation: <strong>{intv.responses.compensationSatisfaction}/5</strong></div>
                        <div>Work-Life Balance: <strong>{intv.responses.workLifeBalance}/5</strong></div>
                        <div>Growth Scope: <strong>{intv.responses.growthOpportunities}/5</strong></div>
                      </div>

                      <div className="p-2.5 bg-rose-50/60 rounded-xl border border-rose-100 text-[11px] space-y-1">
                        <div>
                          <strong className="text-rose-900 block font-bold">Primary Pull Factor:</strong>
                          <span className="text-gray-700">{intv.responses.primaryPullFactor}</span>
                        </div>
                        <div>
                          <strong className="text-rose-900 block font-bold">Retention Feedback:</strong>
                          <span className="text-gray-700 italic">"{intv.responses.retentionFeedback}"</span>
                        </div>
                      </div>

                      {intv.responses.confidentialNotes && (
                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-700">
                          <strong className="block text-slate-900 font-bold">Confidential HR Observations:</strong>
                          <p className="italic">{intv.responses.confidentialNotes}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-100 text-xs text-amber-900 text-center my-3">
                      <Clock className="w-5 h-5 mx-auto mb-1 text-amber-600" />
                      <p className="font-bold">Interview Pending Execution</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">Meeting Link: <a href={intv.meetingLink} target="_blank" rel="noreferrer" className="text-rose-600 underline">{intv.meetingLink}</a></p>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-gray-400">Case ID: {intv.exitId}</span>
                    <button
                      onClick={(e) => handleOpenEditInterview(intv, e)}
                      className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Edit Schedule"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteInterview(intv.id, e)}
                      className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Interview"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {intv.status !== 'Completed' && (
                    <button
                      onClick={() => {
                        setSelectedInterview(intv);
                        setShowRecordInterviewModal(true);
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Record Responses
                    </button>
                  )}
                </div>
              </div>
            ))}

            {exitInterviews.length === 0 && (
              <div className="col-span-full bg-white rounded-3xl border border-gray-200 p-12 text-center">
                <Video className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="font-bold text-gray-800 text-base">No Exit Interviews Scheduled</h3>
                <p className="text-xs text-gray-500 mt-1">Schedule an online exit interview or simulate sample cases.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: FINAL SETTLEMENT (FnF) & RELIEVING */}
      {/* ========================================================================= */}
      {activeTab === 'fnf' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-emerald-600" />
                Full & Final Settlement (FnF) & Relieving Letters
              </h2>
              <p className="text-xs text-gray-500">
                Audited no-dues clearance verification, leave encashment calculations, and generation of digital relieving certificates.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {exitRecords.filter(e => e.status !== 'Revoked').map((item) => (
              <div key={item.id} className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">{item.id}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      item.fnfStatus === 'Settled' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      FnF: {item.fnfStatus}
                    </span>
                  </div>

                  <h3 className="font-bold text-gray-900 text-base">{item.employeeName}</h3>
                  <p className="text-xs text-gray-500 mb-3">{item.designation} • {item.department}</p>

                  <div className="p-3 bg-gray-50 rounded-2xl mb-3 text-xs space-y-1.5">
                    <div className="flex justify-between text-gray-600">
                      <span>Relieving Date:</span>
                      <strong className="text-gray-900">{item.approvedLWD || item.requestedLWD}</strong>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Clearance Score:</span>
                      <strong className={item.overallClearanceProgress === 100 ? 'text-emerald-600' : 'text-rose-600'}>
                        {item.overallClearanceProgress}% Complete
                      </strong>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Net Settlement Amount:</span>
                      <strong className="text-emerald-700 text-sm">₹{item.fnfAmount?.toLocaleString() || '185,000'}</strong>
                    </div>
                  </div>

                  {item.relievingLetterGenerated ? (
                    <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div>
                        <strong className="block font-bold">Relieving Certificate Issued</strong>
                        <span className="text-[10px] text-emerald-700">Digital signature verified and copy emailed to employee.</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 text-xs text-gray-600">
                      <span>Clearance must reach 100% before relieving letter dispatch.</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-xs">
                  <span className="text-[11px] text-gray-400">Notice: {item.noticePeriodDays} Days</span>
                  {item.overallClearanceProgress === 100 && !item.relievingLetterGenerated && (
                    <button
                      onClick={async () => {
                        await axios.put(`${API_BASE}/api/hem/exit/records/${item.id}/status`, {
                          status: 'Relieved & Closed'
                        });
                        setMessage({ type: 'success', text: `Relieving letter generated & separation closed for ${item.employeeName}!` });
                        fetchData();
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer"
                    >
                      Issue Relieving Certificate
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}

      {/* 1. APPLY RESIGNATION MODAL */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-3xl shadow-xl w-[580px] max-w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Tend Resignation Notice</h3>
            <p className="text-xs text-gray-500 mb-4">Register an employee exit with notice period and auto-clearance initialization.</p>

            <form onSubmit={handleApplyResignation} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block font-semibold text-gray-700 mb-1">Employee</label>
                  <select
                    value={applyForm.employeeId}
                    onChange={(e) => setApplyForm({ ...applyForm, employeeId: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl p-2.5 bg-white font-medium"
                  >
                    {defaultEmployees.map(e => (
                      <option key={e.id} value={e.id}>{e.name} — {e.role} ({e.dept})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Submission Mode</label>
                  <select
                    value={applyForm.submittedBy}
                    onChange={(e) => setApplyForm({ ...applyForm, submittedBy: e.target.value as any })}
                    className="w-full border border-gray-200 rounded-xl p-2.5 bg-white font-bold text-rose-700"
                  >
                    <option value="HR on Behalf">HR on Behalf</option>
                    <option value="Manager on Behalf">Manager on Behalf</option>
                    <option value="Employee (Self)">Employee (Self)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Resignation Date</label>
                  <input
                    type="date"
                    value={applyForm.resignationDate}
                    onChange={(e) => setApplyForm({ ...applyForm, resignationDate: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl p-2.5"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Notice Period (Days)</label>
                  <input
                    type="number"
                    value={applyForm.noticePeriodDays}
                    onChange={(e) => setApplyForm({ ...applyForm, noticePeriodDays: Number(e.target.value) })}
                    className="w-full border border-gray-200 rounded-xl p-2.5"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Requested Last Working Day</label>
                  <input
                    type="date"
                    value={applyForm.requestedLWD}
                    onChange={(e) => setApplyForm({ ...applyForm, requestedLWD: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl p-2.5"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-semibold text-gray-700 mb-1">Reason Category</label>
                  <select
                    value={applyForm.reasonCategory}
                    onChange={(e) => setApplyForm({ ...applyForm, reasonCategory: e.target.value as any })}
                    className="w-full border border-gray-200 rounded-xl p-2.5 bg-white"
                  >
                    <option value="Career Progression">Career Progression / External Opportunity</option>
                    <option value="Higher Studies">Higher Studies / MBA / Research</option>
                    <option value="Relocation">Geographical Relocation / Family</option>
                    <option value="Compensation & Role">Compensation & Role Alignment</option>
                    <option value="Health & Personal">Health & Personal Reasons</option>
                    <option value="Entrepreneurship">Entrepreneurship / Startup Venture</option>
                    <option value="Mutual Separation">Mutual Separation Agreement</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block font-semibold text-gray-700 mb-1">Detailed Explanation / Letter Text</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Enter formal resignation statement or discussion notes..."
                    value={applyForm.detailedReason}
                    onChange={(e) => setApplyForm({ ...applyForm, detailedReason: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl p-2.5"
                  ></textarea>
                </div>

                {applyForm.submittedBy !== 'Employee (Self)' && (
                  <div className="col-span-2">
                    <label className="block font-semibold text-gray-700 mb-1">HR / Manager On-Behalf Audit Remarks</label>
                    <input
                      type="text"
                      placeholder="e.g. Registered upon employee verbal request following 1-on-1 retention discussion."
                      value={applyForm.submittedByRemarks}
                      onChange={(e) => setApplyForm({ ...applyForm, submittedByRemarks: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl p-2.5"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold"
                >
                  Submit Resignation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. REVOKE RESIGNATION MODAL */}
      {showRevokeModal && selectedExit && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-3xl shadow-xl w-[520px] max-w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Revoke Resignation</h3>
            <p className="text-xs text-gray-500 mb-4">
              Reinstate <strong>{selectedExit.employeeName}</strong> to active employment and archive offboarding tasks.
            </p>

            <form onSubmit={handleRevokeResignation} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Revoked By</label>
                <select
                  value={revokeForm.revokedBy}
                  onChange={(e) => setRevokeForm({ ...revokeForm, revokedBy: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl p-2.5 bg-white font-medium"
                >
                  <option value="HR on Behalf">HR on Behalf</option>
                  <option value="Manager on Behalf">Manager on Behalf</option>
                  <option value="Employee Request">Employee Request</option>
                </select>
              </div>

              <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                <input
                  type="checkbox"
                  id="counter"
                  checked={revokeForm.counterOfferAccepted}
                  onChange={(e) => setRevokeForm({ ...revokeForm, counterOfferAccepted: e.target.checked })}
                  className="rounded text-emerald-600"
                />
                <label htmlFor="counter" className="text-emerald-950 font-bold">
                  Counter-Offer Accepted (Compensation / Role Upgrade)
                </label>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Reinstated Title / Role</label>
                <input
                  type="text"
                  value={revokeForm.retainedDesignation}
                  onChange={(e) => setRevokeForm({ ...revokeForm, retainedDesignation: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl p-2.5 font-bold text-gray-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Revocation & Retention Reason</label>
                <textarea
                  rows={3}
                  required
                  value={revokeForm.revocationReason}
                  onChange={(e) => setRevokeForm({ ...revokeForm, revocationReason: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl p-2.5"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowRevokeModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold"
                >
                  Confirm Reinstatement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. UPDATE STATUS MODAL */}
      {showStatusModal && selectedExit && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-3xl shadow-xl w-[480px] max-w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Update Separation Status</h3>
            <p className="text-xs text-gray-500 mb-4">{selectedExit.employeeName} ({selectedExit.id})</p>

            <form onSubmit={handleUpdateStatus} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">New Workflow Stage</label>
                <select
                  value={statusUpdateForm.status}
                  onChange={(e) => setStatusUpdateForm({ ...statusUpdateForm, status: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl p-2.5 bg-white font-bold"
                >
                  <option value="Notice Period">Notice Period Serving</option>
                  <option value="Clearance In Progress">Clearance In Progress</option>
                  <option value="Exit Interview Scheduled">Exit Interview Scheduled</option>
                  <option value="FnF Settlement Approved">FnF Settlement Approved</option>
                  <option value="Relieved & Closed">Relieved & Closed (Generate Letter)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Confirmed Last Working Day</label>
                <input
                  type="date"
                  value={statusUpdateForm.approvedLWD}
                  onChange={(e) => setStatusUpdateForm({ ...statusUpdateForm, approvedLWD: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl p-2.5 font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Manager / Approver Comments</label>
                <textarea
                  rows={3}
                  value={statusUpdateForm.managerComments}
                  onChange={(e) => setStatusUpdateForm({ ...statusUpdateForm, managerComments: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl p-2.5"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold"
                >
                  Save Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. CLEARANCE ITEM SIGN-OFF MODAL */}
      {showClearanceUpdateModal && selectedClearanceItem && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-3xl shadow-xl w-[500px] max-w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Clearance Item Sign-off</h3>
            <p className="text-xs text-rose-700 font-semibold mb-4">{selectedClearanceItem.itemTitle}</p>

            <form onSubmit={handleUpdateClearanceItem} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Clearance Decision</label>
                <select
                  value={clearanceUpdateForm.status}
                  onChange={(e) => setClearanceUpdateForm({ ...clearanceUpdateForm, status: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl p-2.5 bg-white font-bold"
                >
                  <option value="Cleared">Cleared (Verified & Received)</option>
                  <option value="Pending">Pending Verification</option>
                  <option value="Discrepancy / Damaged">Discrepancy / Damaged (Deduction Needed)</option>
                  <option value="Waived">Waived by HOD</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Recovery & Inspection Remarks</label>
                <textarea
                  rows={3}
                  value={clearanceUpdateForm.recoveryNotes}
                  onChange={(e) => setClearanceUpdateForm({ ...clearanceUpdateForm, recoveryNotes: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl p-2.5"
                ></textarea>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Financial Recovery Deduction (₹)</label>
                <input
                  type="number"
                  value={clearanceUpdateForm.financialDeductionAmount}
                  onChange={(e) => setClearanceUpdateForm({ ...clearanceUpdateForm, financialDeductionAmount: Number(e.target.value) })}
                  className="w-full border border-gray-200 rounded-xl p-2.5 font-bold text-rose-700"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Sign-off Officer Name</label>
                <input
                  type="text"
                  value={clearanceUpdateForm.clearedBy}
                  onChange={(e) => setClearanceUpdateForm({ ...clearanceUpdateForm, clearedBy: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl p-2.5"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowClearanceUpdateModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold"
                >
                  Save Sign-off
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. SCHEDULE INTERVIEW MODAL */}
      {showScheduleInterviewModal && selectedExit && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-3xl shadow-xl w-[500px] max-w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Schedule Online Exit Interview</h3>
            <p className="text-xs text-gray-500 mb-4">Employee: <strong>{selectedExit.employeeName}</strong></p>

            <form onSubmit={handleScheduleInterview} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Interviewer</label>
                <input
                  type="text"
                  value={scheduleInterviewForm.interviewerName}
                  onChange={(e) => setScheduleInterviewForm({ ...scheduleInterviewForm, interviewerName: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl p-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Interview Date</label>
                  <input
                    type="date"
                    value={scheduleInterviewForm.scheduledDate}
                    onChange={(e) => setScheduleInterviewForm({ ...scheduleInterviewForm, scheduledDate: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Time Slot</label>
                  <input
                    type="text"
                    value={scheduleInterviewForm.scheduledTime}
                    onChange={(e) => setScheduleInterviewForm({ ...scheduleInterviewForm, scheduledTime: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Meeting Link (Google Meet / Zoom)</label>
                <input
                  type="text"
                  value={scheduleInterviewForm.meetingLink}
                  onChange={(e) => setScheduleInterviewForm({ ...scheduleInterviewForm, meetingLink: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl p-2.5 font-bold text-indigo-700"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowScheduleInterviewModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold"
                >
                  Schedule Interview
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. RECORD INTERVIEW MODAL */}
      {showRecordInterviewModal && selectedInterview && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-3xl shadow-xl w-[580px] max-w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Record Exit Interview Responses</h3>
            <p className="text-xs text-gray-500 mb-4">Capturing feedback for <strong>{selectedInterview.employeeName}</strong></p>

            <form onSubmit={handleRecordInterview} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Overall Experience (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={recordInterviewForm.overallExperience}
                    onChange={(e) => setRecordInterviewForm({ ...recordInterviewForm, overallExperience: Number(e.target.value) })}
                    className="w-full border border-gray-200 rounded-xl p-2 font-bold text-amber-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Management & Leadership (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={recordInterviewForm.managementEffectiveness}
                    onChange={(e) => setRecordInterviewForm({ ...recordInterviewForm, managementEffectiveness: Number(e.target.value) })}
                    className="w-full border border-gray-200 rounded-xl p-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Compensation Satisfaction (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={recordInterviewForm.compensationSatisfaction}
                    onChange={(e) => setRecordInterviewForm({ ...recordInterviewForm, compensationSatisfaction: Number(e.target.value) })}
                    className="w-full border border-gray-200 rounded-xl p-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Work-Life Balance (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={recordInterviewForm.workLifeBalance}
                    onChange={(e) => setRecordInterviewForm({ ...recordInterviewForm, workLifeBalance: Number(e.target.value) })}
                    className="w-full border border-gray-200 rounded-xl p-2"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-semibold text-gray-700 mb-1">Primary Pull Factor (Attraction)</label>
                  <input
                    type="text"
                    value={recordInterviewForm.primaryPullFactor}
                    onChange={(e) => setRecordInterviewForm({ ...recordInterviewForm, primaryPullFactor: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl p-2"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-semibold text-gray-700 mb-1">Retention Feedback: What could we have done?</label>
                  <textarea
                    rows={2}
                    value={recordInterviewForm.retentionFeedback}
                    onChange={(e) => setRecordInterviewForm({ ...recordInterviewForm, retentionFeedback: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl p-2"
                  ></textarea>
                </div>

                <div className="col-span-2">
                  <label className="block font-semibold text-gray-700 mb-1">Confidential HR Interviewer Observations</label>
                  <textarea
                    rows={2}
                    value={recordInterviewForm.confidentialNotes}
                    onChange={(e) => setRecordInterviewForm({ ...recordInterviewForm, confidentialNotes: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl p-2"
                  ></textarea>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowRecordInterviewModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold"
                >
                  Save Interview
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* EDIT RESIGNATION MODAL */}
      {showEditExitModal && editingExit && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                  <Pencil className="w-5 h-5" />
                </span>
                <h3 className="text-base font-bold text-gray-900">Edit Separation Record</h3>
              </div>
              <button onClick={() => setShowEditExitModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateExit} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Reason Category</label>
                  <select
                    value={editingExit.reasonCategory}
                    onChange={(e) => setEditingExit({ ...editingExit, reasonCategory: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-rose-500 outline-none bg-white"
                  >
                    <option value="Career Progression">Career Progression</option>
                    <option value="Higher Education">Higher Education</option>
                    <option value="Personal / Relocation">Personal / Relocation</option>
                    <option value="Compensation & Growth">Compensation & Growth</option>
                    <option value="Health / Personal Reasons">Health / Personal Reasons</option>
                    <option value="Other Opportunities">Other Opportunities</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Notice Days</label>
                  <input
                    type="number"
                    value={editingExit.noticePeriodDays}
                    onChange={(e) => setEditingExit({ ...editingExit, noticePeriodDays: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-rose-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Requested LWD</label>
                  <input
                    type="date"
                    value={editingExit.requestedLWD}
                    onChange={(e) => setEditingExit({ ...editingExit, requestedLWD: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-rose-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Approved LWD</label>
                  <input
                    type="date"
                    value={editingExit.approvedLWD || ''}
                    onChange={(e) => setEditingExit({ ...editingExit, approvedLWD: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-rose-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Detailed Reason</label>
                <textarea
                  rows={3}
                  value={editingExit.detailedReason}
                  onChange={(e) => setEditingExit({ ...editingExit, detailedReason: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Submission Remarks</label>
                <input
                  type="text"
                  value={editingExit.submittedByRemarks || ''}
                  onChange={(e) => setEditingExit({ ...editingExit, submittedByRemarks: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowEditExitModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT INTERVIEW MODAL */}
      {showEditInterviewModal && editingInterview && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                  <Pencil className="w-5 h-5" />
                </span>
                <h3 className="text-base font-bold text-gray-900">Edit Exit Interview Slot</h3>
              </div>
              <button onClick={() => setShowEditInterviewModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateInterview} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Interviewer Name *</label>
                <input
                  type="text"
                  required
                  value={editingInterview.interviewerName}
                  onChange={(e) => setEditingInterview({ ...editingInterview, interviewerName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Scheduled Date *</label>
                  <input
                    type="date"
                    required
                    value={editingInterview.scheduledDate}
                    onChange={(e) => setEditingInterview({ ...editingInterview, scheduledDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-rose-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Scheduled Time *</label>
                  <input
                    type="text"
                    required
                    value={editingInterview.scheduledTime}
                    onChange={(e) => setEditingInterview({ ...editingInterview, scheduledTime: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-rose-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Meeting Link / Room</label>
                <input
                  type="text"
                  value={editingInterview.meetingLink}
                  onChange={(e) => setEditingInterview({ ...editingInterview, meetingLink: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Interview Mode</label>
                <select
                  value={editingInterview.mode}
                  onChange={(e) => setEditingInterview({ ...editingInterview, mode: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-rose-500 outline-none bg-white"
                >
                  <option value="Online Video Call">Online Video Call</option>
                  <option value="In-Person Office">In-Person Office</option>
                  <option value="Phone Call">Phone Call</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowEditInterviewModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  Save Interview
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
