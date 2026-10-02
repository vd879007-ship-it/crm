import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Pencil,
  Trash2,
  FileCheck2, 
  Plus, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ShieldCheck, 
  PenTool, 
  Download, 
  Users, 
  Bell, 
  Search, 
  Filter, 
  X, 
  ExternalLink, 
  Sparkles,
  BookOpen,
  ArrowRight,
  Send,
  Eye,
  Check,
  Calendar,
  Save,
  Sliders,
  Shield,
  AlertTriangle
} from 'lucide-react';
import HEMNavigation from '../../components/HEMNavigation';

interface AcknowledgmentRecord {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  department: string;
  acknowledgedAt: string;
  eSignature: string;
  ipAddress: string;
}

interface PolicyItem {
  id: string;
  code: string;
  title: string;
  category: string;
  version: string;
  publishedDate: string;
  effectiveDate: string;
  gracePeriodDays: number;
  mandatory: boolean;
  targetAudience: string;
  summary: string;
  content: string;
  pdfUrl?: string;
  acknowledgments: AcknowledgmentRecord[];
}

export default function Policies() {
  const [policies, setPolicies] = useState<PolicyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'catalog' | 'audit' | 'rules'>('catalog');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showEditPolicyModal, setShowEditPolicyModal] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<any>(null);
  const [showEditHolidayModal, setShowEditHolidayModal] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<any>(null);
  const [selectedPolicyForRead, setSelectedPolicyForRead] = useState<PolicyItem | null>(null);
  const [selectedPolicyForAudit, setSelectedPolicyForAudit] = useState<PolicyItem | null>(null);
  const [showAddHolidayModal, setShowAddHolidayModal] = useState(false);

  // Attendance & Deduction Rules State
  const [attendanceRules, setAttendanceRules] = useState<any>({
    lateArrivalRules: {
      gracePeriodMinutes: 15,
      lateMarkThresholdMinutes: 16,
      lateMarksAllowedPerMonth: 3,
      penaltyType: '0.5 Day Leave Deduction or LOP',
      deductFromLeaveType: 'CL',
      deductLossOfPayIfZeroBalance: true
    },
    earlyDepartureRules: {
      allowedEarlyMins: 15,
      penaltyThresholdMins: 30,
      penaltyAction: 'Mark as Half Day'
    },
    workHoursThresholds: {
      minimumHoursForFullDay: 8.0,
      minimumHoursForHalfDay: 4.5,
      mandatoryCoreHoursStart: '11:00',
      mandatoryCoreHoursEnd: '16:00'
    },
    missedPunchPolicy: {
      maxRegularizationsPerMonth: 3,
      requiresManagerApproval: true,
      mustApplyWithinDays: 3
    },
    workWeekConfig: {
      workDaysPerWeek: 5,
      weeklyOffPattern: 'Sunday & Saturday Off (5-Day Week)',
      crossMidnightNightShiftRollover: true
    },
    holidayCalendar: []
  });

  const [newHoliday, setNewHoliday] = useState({
    date: new Date().toISOString().split('T')[0],
    name: '',
    type: 'National Mandatory',
    state: 'Pan-India'
  });

  // Acknowledgment Form
  const [hasReadAgreement, setHasReadAgreement] = useState(false);
  const [eSignName, setESignName] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Policy Form
  const [newPolicy, setNewPolicy] = useState({
    code: '',
    title: '',
    category: 'Ethics & Conduct',
    version: 'v1.0',
    effectiveDate: new Date().toISOString().split('T')[0],
    gracePeriodDays: 14,
    mandatory: true,
    targetAudience: 'All Employees',
    summary: '',
    content: ''
  });

  const currentUserStr = localStorage.getItem('user');
  const currentUser = currentUserStr ? JSON.parse(currentUserStr) : { name: 'Current User', email: 'user@athenahr.io', department: 'General' };

  const fetchPolicies = async () => {
    try {
      const [res, rulesRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hem/policies`),
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hem/policies/rules`).catch(() => ({ data: null }))
      ]);
      setPolicies(res.data || []);
      if (rulesRes && rulesRes.data) {
        setAttendanceRules(rulesRes.data);
      }
      if (selectedPolicyForRead) {
        const updated = (res.data || []).find((p: PolicyItem) => p.id === selectedPolicyForRead.id);
        if (updated) setSelectedPolicyForRead(updated);
      }
      if (selectedPolicyForAudit) {
        const updated = (res.data || []).find((p: PolicyItem) => p.id === selectedPolicyForAudit.id);
        if (updated) setSelectedPolicyForAudit(updated);
      }
    } catch (err) {
      console.error('Failed to fetch policies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const handleOpenEditPolicy = (p: PolicyItem) => {
    setEditingPolicy({ ...p });
    setShowEditPolicyModal(true);
  };

  const handleUpdatePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPolicy) return;
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hem/policies/${editingPolicy.id}`, editingPolicy);
      setShowEditPolicyModal(false);
      setEditingPolicy(null);
      fetchPolicies();
      showToast('Policy updated successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to update policy');
    }
  };

  const handleDeletePolicy = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this policy?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hem/policies/${id}`);
      fetchPolicies();
      showToast('Policy deleted successfully');
    } catch (err) {
      console.error(err);
      alert('Failed to delete policy');
    }
  };

  const handleOpenEditHoliday = (h: any) => {
    setEditingHoliday({ ...h });
    setShowEditHolidayModal(true);
  };

  const handleUpdateHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHoliday) return;
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hem/policies/holidays/${editingHoliday.id}`, editingHoliday);
      setShowEditHolidayModal(false);
      setEditingHoliday(null);
      fetchPolicies();
      showToast('Holiday updated successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to update holiday');
    }
  };

  const handleDeleteHoliday = async (id: string) => {
    if (!window.confirm('Delete this official holiday from calendar?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hem/policies/holidays/${id}`);
      fetchPolicies();
      showToast('Holiday removed');
    } catch (err) {
      console.error(err);
      alert('Failed to delete holiday');
    }
  };

  const handlePublishPolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hem/policies`, newPolicy);
      setShowPublishModal(false);
      setNewPolicy({
        code: '',
        title: '',
        category: 'Ethics & Conduct',
        version: 'v1.0',
        effectiveDate: new Date().toISOString().split('T')[0],
        gracePeriodDays: 14,
        mandatory: true,
        targetAudience: 'All Employees',
        summary: '',
        content: ''
      });
      fetchPolicies();
      showToast('Policy published successfully to workforce!');
    } catch (err) {
      console.error(err);
    }
  };

  const handleAcknowledge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPolicyForRead || !hasReadAgreement || !eSignName) return;

    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hem/policies/${selectedPolicyForRead.id}/acknowledge`, {
        userId: currentUser.id || 'USR-CURRENT',
        userName: eSignName,
        userEmail: currentUser.email || 'user@athenahr.io',
        department: currentUser.department || 'General',
        eSignature: `DIGITAL_VERIFIED_${eSignName.toUpperCase()}_${Date.now()}`
      });
      setSelectedPolicyForRead(null);
      setHasReadAgreement(false);
      setESignName('');
      fetchPolicies();
      showToast('Policy acknowledged and cryptographically signed!');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to acknowledge policy');
    }
  };

  const handleRemindPending = async (policyId: string) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hem/policies/${policyId}/remind`);
      showToast('Reminders dispatched to pending staff!');
    } catch (err) {
      console.error(err);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSeedDefaults = async () => {
    const samples = [
      {
        code: 'POL-ETH-001',
        title: 'Code of Business Conduct & Ethics',
        category: 'Ethics & Conduct',
        version: 'v2.1',
        effectiveDate: '2026-01-01',
        gracePeriodDays: 14,
        mandatory: true,
        targetAudience: 'All Employees',
        summary: 'Defines corporate values, anti-corruption, confidentiality, conflict of interest, and fair competition expectations.',
        content: `1. PRINCIPLES OF INTEGRITY
All employees must act with utmost honesty, fairness, and accountability. Bribery, kickbacks, or facilitation payments are strictly prohibited.

2. CONFLICT OF INTEREST
Employees must avoid situations where personal interests conflict with Athena HR business obligations. Any outside employment or directorships must be formally disclosed.

3. CONFIDENTIALITY & DATA SECURITY
All proprietary code, customer information, compensation data, and business strategies are strictly confidential and must not be disclosed to third parties without prior written approval.

4. REPORTING & NON-RETALIATION
Athena HR maintains a zero-tolerance policy for retaliation against anyone reporting ethical concerns in good faith via the Whistleblower portal.`
      },
      {
        code: 'POL-SAF-002',
        title: 'POSH (Prevention of Sexual Harassment) Policy',
        category: 'Workplace Safety & POSH',
        version: 'v3.0',
        effectiveDate: '2026-01-01',
        gracePeriodDays: 7,
        mandatory: true,
        targetAudience: 'All Employees',
        summary: 'Zero-tolerance guidelines for gender harassment, statutory redressal mechanisms, and internal committee (IC) contacts.',
        content: `1. COMMITMENT TO A SAFE WORKPLACE
Athena HR is committed to providing a work environment free of sexual harassment, discrimination, or intimidation.

2. SCOPE & DEFINITION
This policy applies to all employees, contractors, interns, and visitors across physical offices, remote communications, offsite company events, and messaging platforms.

3. INTERNAL COMPLAINTS COMMITTEE (ICC)
Any grievance may be lodged in confidence directly with the Internal Committee at posh-committee@athenahr.io. All inquiries are conducted with strict confidentiality and concluded within statutory timelines.`
      },
      {
        code: 'POL-IT-003',
        title: 'Information Security & Acceptable Device Usage',
        category: 'IT & Security',
        version: 'v2.0',
        effectiveDate: '2026-02-15',
        gracePeriodDays: 10,
        mandatory: true,
        targetAudience: 'All Employees',
        summary: 'Mandatory password rotation, multi-factor authentication (MFA), laptop disk encryption, and data protection rules.',
        content: `1. PASSWORDS & ACCESS CONTROLS
MFA is mandatory on all corporate SSO accounts. Passwords must be at least 14 characters and never shared or written down.

2. COMPANY HARDWARE
Laptops must maintain Full Disk Encryption (BitLocker/FileVault). Personal storage devices (USBs) cannot be connected to corporate workstations without IT exemption.

3. ARTIFICIAL INTELLIGENCE & CODE USAGE
Proprietary company source code or customer data must never be pasted into public, unapproved AI models.`
      },
      {
        code: 'POL-REM-004',
        title: 'Hybrid & Remote Work Guidelines',
        category: 'Remote Work',
        version: 'v1.5',
        effectiveDate: '2026-03-01',
        gracePeriodDays: 21,
        mandatory: false,
        targetAudience: 'All Employees',
        summary: 'Framework for working from home, core collaboration hours (10 AM - 5 PM IST), ergonomic allowances, and availability.',
        content: `1. CORE COLLABORATION HOURS
Team members are requested to remain reachable during team core hours between 10:00 AM and 5:00 PM local time for syncs and sprints.

2. ERGONOMIC & HIGH-SPEED INTERNET
Employees are eligible for home workspace reimbursement. Stable broadband with minimum 50 Mbps is required for video calls.`
      }
    ];

    for (const p of samples) {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hem/policies`, p);
    }
    fetchPolicies();
    showToast('Standard policy library loaded!');
  };

  // Filtered
  const filteredPolicies = policies.filter(p => {
    const matchesCat = categoryFilter === 'All' || p.category === categoryFilter;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Aggregates
  const totalPolicies = policies.length;
  const mandatoryPolicies = policies.filter(p => p.mandatory).length;
  const totalSignoffs = policies.reduce((acc, p) => acc + p.acknowledgments.length, 0);
  const avgCompliance = totalPolicies === 0 ? 0 : Math.round((totalSignoffs / (totalPolicies * 5 || 1)) * 100);

  const isUserAcknowledged = (policy: PolicyItem) => {
    return policy.acknowledgments.some(a => a.userId === currentUser.id || a.userEmail === currentUser.email);
  };

  const handleSaveRules = async () => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hem/policies/rules`, attendanceRules);
      showToast('Attendance & deduction policy rules saved successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to save attendance policy rules.');
    }
  };

  const handleAddHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hem/policies/holidays`, newHoliday);
      setShowAddHolidayModal(false);
      setNewHoliday({
        date: new Date().toISOString().split('T')[0],
        name: '',
        type: 'National Mandatory',
        state: 'Pan-India'
      });
      fetchPolicies();
      showToast('New holiday added to organization calendar!');
    } catch (err) {
      console.error(err);
      alert('Failed to add holiday.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top HEM In-Module Navigation */}
      <HEMNavigation />

      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-indigo-50 text-indigo-700 rounded-lg">
              <FileCheck2 className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider">Compliance & Governance</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Policies & Acknowledgment Hub</h1>
          <p className="text-sm text-gray-500 mt-1 max-w-2xl">
            Publish version-controlled company handbooks, enforce digital read-and-sign acknowledgments, and track organizational compliance with full audit trails.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {policies.length === 0 && (
            <button
              onClick={handleSeedDefaults}
              className="px-3.5 py-2 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Load Policy Library</span>
            </button>
          )}
          <button
            onClick={() => setShowPublishModal(true)}
            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Publish New Policy</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Published Policies</p>
            <h3 className="text-3xl font-extrabold text-gray-900 mt-1">{totalPolicies}</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Active company handbooks</p>
          </div>
          <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Mandatory Sign-offs</p>
            <h3 className="text-3xl font-extrabold text-amber-600 mt-1">{mandatoryPolicies}</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Statutory & POSH mandates</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total e-Signatures</p>
            <h3 className="text-3xl font-extrabold text-indigo-600 mt-1">{totalSignoffs}</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Verified employee sign-offs</p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <PenTool className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Workforce Compliance</p>
            <h3 className="text-3xl font-extrabold text-emerald-600 mt-1">{avgCompliance}%</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Average acknowledgment rate</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs between Catalog, Audit Matrix & Attendance Rules */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`px-5 py-3 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 border-b-2 ${
            activeTab === 'catalog'
              ? 'text-teal-700 border-teal-600'
              : 'text-gray-400 border-transparent hover:text-gray-700'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Policy Document Catalog ({filteredPolicies.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-5 py-3 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 border-b-2 ${
            activeTab === 'audit'
              ? 'text-teal-700 border-teal-600'
              : 'text-gray-400 border-transparent hover:text-gray-700'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Compliance Audit Matrix</span>
        </button>
        <button
          onClick={() => setActiveTab('rules')}
          className={`px-5 py-3 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 border-b-2 ${
            activeTab === 'rules'
              ? 'text-teal-700 border-teal-600'
              : 'text-gray-400 border-transparent hover:text-gray-700'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Attendance, Deduction & Holiday Rules</span>
        </button>
      </div>

      {/* Control Bar: Category & Search */}
      {activeTab === 'catalog' && (
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto scrollbar-none text-xs">
            {['All', 'Ethics & Conduct', 'Workplace Safety & POSH', 'IT & Security', 'Remote Work'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
                  categoryFilter === cat
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search code, title, or keywords..."
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>
        </div>
      )}

      {/* TAB 1: POLICY CATALOG */}
      {activeTab === 'catalog' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPolicies.length === 0 ? (
            <div className="col-span-2 bg-white p-12 rounded-2xl border border-dashed border-gray-300 text-center">
              <FileCheck2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-700">No published policies found</h3>
              <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                Click "+ Publish New Policy" or "Load Policy Library" to establish your organizational guidelines.
              </p>
            </div>
          ) : (
            filteredPolicies.map((p) => {
              const acknowledged = isUserAcknowledged(p);
              return (
                <div
                  key={p.id}
                  className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs hover:border-teal-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                          {p.code}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-700">
                          {p.version}
                        </span>
                        {p.mandatory && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-red-100 text-red-800">
                            MANDATORY
                          </span>
                        )}
                      </div>

                      {/* Personal Status Badge */}
                      {acknowledged ? (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Acknowledged</span>
                        </span>
                      ) : (
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>Action Required</span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-gray-900 mt-1">{p.title}</h3>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">
                      {p.summary}
                    </p>

                    <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between text-[11px] text-gray-400 gap-2">
                      <span>Effective: <strong className="text-gray-700">{p.effectiveDate}</strong></span>
                      <span>Audience: <strong className="text-teal-700">{p.targetAudience}</strong></span>
                      <span>Sign-offs: <strong className="text-indigo-600 font-bold">{p.acknowledgments.length} Employees</strong></span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedPolicyForAudit(p)}
                      className="text-xs font-semibold text-gray-600 hover:text-gray-900 flex items-center gap-1"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Audit Trail</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditPolicy(p)}
                        className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-colors"
                        title="Edit Policy"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePolicy(p.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        title="Delete Policy"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRemindPending(p.id)}
                        className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors"
                        title="Send Reminder to Pending Staff"
                      >
                        <Bell className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          setSelectedPolicyForRead(p);
                          setHasReadAgreement(false);
                          setESignName(currentUser.name || '');
                        }}
                        className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 ${
                          acknowledged
                            ? 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                            : 'bg-teal-600 hover:bg-teal-700 text-white'
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{acknowledged ? 'Review Policy' : 'Read & Acknowledge'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: COMPLIANCE AUDIT MATRIX */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Workforce Compliance Ledger</h3>
              <p className="text-xs text-gray-400 mt-0.5">Real-time tracking of policy sign-offs and legal audit logs</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="px-5 py-3.5 text-left">Policy & Code</th>
                  <th className="px-5 py-3.5 text-left">Category</th>
                  <th className="px-5 py-3.5 text-left">Mandatory</th>
                  <th className="px-5 py-3.5 text-left">Signed Count</th>
                  <th className="px-5 py-3.5 text-left">Audience</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {policies.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-gray-400">
                      No policies available for audit tracking.
                    </td>
                  </tr>
                ) : (
                  policies.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-gray-900">{p.title}</div>
                        <div className="text-[10px] text-gray-400 font-mono">{p.code} • {p.version}</div>
                      </td>
                      <td className="px-5 py-3.5 text-gray-600 font-medium">
                        {p.category}
                      </td>
                      <td className="px-5 py-3.5">
                        {p.mandatory ? (
                          <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Mandatory
                          </span>
                        ) : (
                          <span className="bg-gray-100 text-gray-600 text-[10px] font-medium px-2 py-0.5 rounded-full">
                            Advisory
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 font-bold text-indigo-700">
                        {p.acknowledgments.length} Employees
                      </td>
                      <td className="px-5 py-3.5 text-gray-600">
                        {p.targetAudience}
                      </td>
                      <td className="px-5 py-3.5 text-right space-x-2">
                        <button
                          onClick={() => handleRemindPending(p.id)}
                          className="px-2.5 py-1 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors"
                        >
                          Discharge Reminders
                        </button>
                        <button
                          onClick={() => setSelectedPolicyForAudit(p)}
                          className="px-2.5 py-1 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors"
                        >
                          View Signatures
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* HIGHLY CONFIGURABLE POLICIES & ATTENDANCE RULES TAB */}
      {activeTab === 'rules' && (
        <div className="space-y-6">
          {/* Header Action Bar */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 bg-teal-50 text-teal-700 rounded-xl">
                  <Sliders className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Configurable Attendance & Deduction Policy Rules</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Define enterprise grace windows, late arrival penalties, shift cutoffs, regularization constraints, and statutory holiday calendars
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSaveRules}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                Save Policy Configurations
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* CARD 1: Late Arrival & Grace Period Penalties */}
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <h4 className="text-sm font-bold text-gray-900">Late Arrival & Grace Period Rules</h4>
                </div>
                <span className="text-[10px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
                  Automated Deduction
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Grace Period (Minutes)</label>
                  <input
                    type="number"
                    value={attendanceRules?.lateArrivalRules?.gracePeriodMinutes ?? 15}
                    onChange={(e) => setAttendanceRules({
                      ...attendanceRules,
                      lateArrivalRules: {
                        ...attendanceRules.lateArrivalRules,
                        gracePeriodMinutes: Number(e.target.value)
                      }
                    })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                  <span className="text-[10px] text-gray-400">Punches within this buffer are not marked late</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Late Mark Threshold (Minutes)</label>
                  <input
                    type="number"
                    value={attendanceRules?.lateArrivalRules?.lateMarkThresholdMinutes ?? 16}
                    onChange={(e) => setAttendanceRules({
                      ...attendanceRules,
                      lateArrivalRules: {
                        ...attendanceRules.lateArrivalRules,
                        lateMarkThresholdMinutes: Number(e.target.value)
                      }
                    })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                  <span className="text-[10px] text-gray-400">Minutes past shift start triggering a late mark</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Allowed Late Marks / Month</label>
                  <input
                    type="number"
                    value={attendanceRules?.lateArrivalRules?.lateMarksAllowedPerMonth ?? 3}
                    onChange={(e) => setAttendanceRules({
                      ...attendanceRules,
                      lateArrivalRules: {
                        ...attendanceRules.lateArrivalRules,
                        lateMarksAllowedPerMonth: Number(e.target.value)
                      }
                    })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                  <span className="text-[10px] text-gray-400">Allowed before penalty applies</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Penalty on Exceeding</label>
                  <select
                    value={attendanceRules?.lateArrivalRules?.penaltyType ?? '0.5 Day Leave Deduction or LOP'}
                    onChange={(e) => setAttendanceRules({
                      ...attendanceRules,
                      lateArrivalRules: {
                        ...attendanceRules.lateArrivalRules,
                        penaltyType: e.target.value
                      }
                    })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none bg-white"
                  >
                    <option value="0.5 Day Leave Deduction or LOP">0.5 Day Leave Deduction or LOP</option>
                    <option value="1.0 Day Leave Deduction">1.0 Day Leave Deduction</option>
                    <option value="Warning Letter Only">Warning Letter Only</option>
                    <option value="Half Day Pay Loss">Half Day Pay Loss</option>
                  </select>
                  <span className="text-[10px] text-gray-400">Automated payroll/leave ledger action</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Deduct From Leave Type</label>
                  <select
                    value={attendanceRules?.lateArrivalRules?.deductFromLeaveType ?? 'CL'}
                    onChange={(e) => setAttendanceRules({
                      ...attendanceRules,
                      lateArrivalRules: {
                        ...attendanceRules.lateArrivalRules,
                        deductFromLeaveType: e.target.value
                      }
                    })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none bg-white"
                  >
                    <option value="CL">Casual Leave (CL)</option>
                    <option value="PL">Privilege Leave (PL)</option>
                    <option value="Comp-Off">Compensatory Off</option>
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-700">
                    <input
                      type="checkbox"
                      checked={attendanceRules?.lateArrivalRules?.deductLossOfPayIfZeroBalance ?? true}
                      onChange={(e) => setAttendanceRules({
                        ...attendanceRules,
                        lateArrivalRules: {
                          ...attendanceRules.lateArrivalRules,
                          deductLossOfPayIfZeroBalance: e.target.checked
                        }
                      })}
                      className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
                    />
                    <span>Convert to LOP (Loss of Pay) if balance is 0</span>
                  </label>
                </div>
              </div>
            </div>

            {/* CARD 2: Early Departure Rules */}
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <h4 className="text-sm font-bold text-gray-900">Early Departure Policies</h4>
                </div>
                <span className="text-[10px] font-bold bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full">
                  Discipline Guard
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Permitted Early Exit (Mins)</label>
                  <input
                    type="number"
                    value={attendanceRules?.earlyDepartureRules?.allowedEarlyMins ?? 15}
                    onChange={(e) => setAttendanceRules({
                      ...attendanceRules,
                      earlyDepartureRules: {
                        ...attendanceRules.earlyDepartureRules,
                        allowedEarlyMins: Number(e.target.value)
                      }
                    })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                  <span className="text-[10px] text-gray-400">Exit within this window is excused</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Penalty Threshold (Mins)</label>
                  <input
                    type="number"
                    value={attendanceRules?.earlyDepartureRules?.penaltyThresholdMins ?? 30}
                    onChange={(e) => setAttendanceRules({
                      ...attendanceRules,
                      earlyDepartureRules: {
                        ...attendanceRules.earlyDepartureRules,
                        penaltyThresholdMins: Number(e.target.value)
                      }
                    })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                  <span className="text-[10px] text-gray-400">Departure before this triggers penalty</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Early Exit Penalty Action</label>
                <select
                  value={attendanceRules?.earlyDepartureRules?.penaltyAction ?? 'Mark as Half Day'}
                  onChange={(e) => setAttendanceRules({
                    ...attendanceRules,
                    earlyDepartureRules: {
                      ...attendanceRules.earlyDepartureRules,
                      penaltyAction: e.target.value
                    }
                  })}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none bg-white"
                >
                  <option value="Mark as Half Day">Mark as Half Day (0.5 Day)</option>
                  <option value="Deduct 1 hour OT balance">Deduct 1 hour from Overtime balance</option>
                  <option value="Flag for Line Manager Justification">Flag for Line Manager Justification</option>
                  <option value="Deduct 0.5 Day Casual Leave">Deduct 0.5 Day Casual Leave</option>
                </select>
              </div>

              <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-100 text-rose-800 text-[11px] leading-relaxed">
                <strong>Policy Clause:</strong> Unauthorized early departures exceeding threshold without prior gate-pass or manager email approval will automatically convert the workday to Half-Day status in the payroll ledger.
              </div>
            </div>

            {/* CARD 3: Work Hours Thresholds */}
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <h4 className="text-sm font-bold text-gray-900">Work Hours & Half-Day / Full-Day Thresholds</h4>
                </div>
                <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">
                  Daily Crediting
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Full Day Minimum (Hours)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={attendanceRules?.workHoursThresholds?.minimumHoursForFullDay ?? 8.0}
                    onChange={(e) => setAttendanceRules({
                      ...attendanceRules,
                      workHoursThresholds: {
                        ...attendanceRules.workHoursThresholds,
                        minimumHoursForFullDay: Number(e.target.value)
                      }
                    })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                  <span className="text-[10px] text-gray-400">Cumulative active duration required for full credit</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Half Day Minimum (Hours)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={attendanceRules?.workHoursThresholds?.minimumHoursForHalfDay ?? 4.5}
                    onChange={(e) => setAttendanceRules({
                      ...attendanceRules,
                      workHoursThresholds: {
                        ...attendanceRules.workHoursThresholds,
                        minimumHoursForHalfDay: Number(e.target.value)
                      }
                    })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                  <span className="text-[10px] text-gray-400">Duration below this marks employee Absent</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Core Hours Start</label>
                  <input
                    type="time"
                    value={attendanceRules?.workHoursThresholds?.mandatoryCoreHoursStart ?? '11:00'}
                    onChange={(e) => setAttendanceRules({
                      ...attendanceRules,
                      workHoursThresholds: {
                        ...attendanceRules.workHoursThresholds,
                        mandatoryCoreHoursStart: e.target.value
                      }
                    })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Core Hours End</label>
                  <input
                    type="time"
                    value={attendanceRules?.workHoursThresholds?.mandatoryCoreHoursEnd ?? '16:00'}
                    onChange={(e) => setAttendanceRules({
                      ...attendanceRules,
                      workHoursThresholds: {
                        ...attendanceRules.workHoursThresholds,
                        mandatoryCoreHoursEnd: e.target.value
                      }
                    })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* CARD 4: Regularization & Work Week Config */}
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-teal-600" />
                  <h4 className="text-sm font-bold text-gray-900">Regularization & Work Week Structure</h4>
                </div>
                <span className="text-[10px] font-bold bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full">
                  Workflow Governance
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Max Regularizations / Month</label>
                  <input
                    type="number"
                    value={attendanceRules?.missedPunchPolicy?.maxRegularizationsPerMonth ?? 3}
                    onChange={(e) => setAttendanceRules({
                      ...attendanceRules,
                      missedPunchPolicy: {
                        ...attendanceRules.missedPunchPolicy,
                        maxRegularizationsPerMonth: Number(e.target.value)
                      }
                    })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                  <span className="text-[10px] text-gray-400">Limit on missed swipe adjustments</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Submission Window (Days)</label>
                  <input
                    type="number"
                    value={attendanceRules?.missedPunchPolicy?.mustApplyWithinDays ?? 3}
                    onChange={(e) => setAttendanceRules({
                      ...attendanceRules,
                      missedPunchPolicy: {
                        ...attendanceRules.missedPunchPolicy,
                        mustApplyWithinDays: Number(e.target.value)
                      }
                    })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                  <span className="text-[10px] text-gray-400">Cutoff days to apply post occurrence</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Weekly Off Schedule</label>
                  <select
                    value={attendanceRules?.workWeekConfig?.weeklyOffPattern ?? 'Sunday & Saturday Off (5-Day Week)'}
                    onChange={(e) => setAttendanceRules({
                      ...attendanceRules,
                      workWeekConfig: {
                        ...attendanceRules.workWeekConfig,
                        weeklyOffPattern: e.target.value
                      }
                    })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none bg-white"
                  >
                    <option value="Sunday & Saturday Off (5-Day Week)">5-Day Week (Sat & Sun Off)</option>
                    <option value="Sunday Only Off (6-Day Week)">6-Day Week (Sun Off Only)</option>
                    <option value="2nd & 4th Saturday Off">Alternate Saturdays (2nd & 4th Off)</option>
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-700">
                    <input
                      type="checkbox"
                      checked={attendanceRules?.workWeekConfig?.crossMidnightNightShiftRollover ?? true}
                      onChange={(e) => setAttendanceRules({
                        ...attendanceRules,
                        workWeekConfig: {
                          ...attendanceRules.workWeekConfig,
                          crossMidnightNightShiftRollover: e.target.checked
                        }
                      })}
                      className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
                    />
                    <span>Night shift rollover across midnight</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 5: Statutory & Regional Holiday Calendar */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-teal-600" />
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Statutory & Regional Holiday Calendar (2026)</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Automated non-working days for payroll crediting and shift planning</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddHolidayModal(true)}
                className="px-3.5 py-1.5 bg-teal-50 text-teal-700 hover:bg-teal-100 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Official Holiday
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-xs">
                <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-[10px] tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5 text-left">Date</th>
                    <th className="px-5 py-3.5 text-left">Holiday Name</th>
                    <th className="px-5 py-3.5 text-left">Classification</th>
                    <th className="px-5 py-3.5 text-left">Applicable Territory</th>
                    <th className="px-5 py-3.5 text-center">Day of Week</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {(attendanceRules?.holidayCalendar || []).length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-8 text-center text-gray-400">
                        No holidays configured in calendar. Click "Add Official Holiday" to schedule.
                      </td>
                    </tr>
                  ) : (
                    (attendanceRules?.holidayCalendar || []).map((h: any, idx: number) => {
                      const dayName = new Date(h.date).toLocaleDateString('en-US', { weekday: 'long' });
                      return (
                        <tr key={h.id || idx} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-5 py-3.5 font-mono font-bold text-gray-900">
                            {h.date}
                          </td>
                          <td className="px-5 py-3.5 font-bold text-gray-900">
                            {h.name}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              h.type === 'National Mandatory'
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : h.type === 'Festival Mandatory'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}>
                              {h.type}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-gray-600 font-medium">
                            {h.state || 'Pan-India'}
                          </td>
                          <td className="px-5 py-3.5 text-center text-gray-500 font-medium">
                            {dayName}
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleOpenEditHoliday(h)}
                                className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                                title="Edit Holiday"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteHoliday(h.id)}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete Holiday"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* POLICY READER & DIGITAL ACKNOWLEDGMENT MODAL */}
      {selectedPolicyForRead && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold bg-teal-50 text-teal-700 px-2 py-0.5 rounded">
                    {selectedPolicyForRead.code}
                  </span>
                  <span className="text-[10px] font-bold bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                    {selectedPolicyForRead.version}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mt-1">{selectedPolicyForRead.title}</h3>
              </div>
              <button onClick={() => setSelectedPolicyForRead(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Policy Body */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs text-gray-700 leading-relaxed pr-2">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-gray-600 italic">
                {selectedPolicyForRead.summary}
              </div>

              <div className="whitespace-pre-line font-sans bg-slate-50/70 p-4 rounded-xl border border-slate-200">
                {selectedPolicyForRead.content}
              </div>
            </div>

            {/* Digital Sign-off Section */}
            {!isUserAcknowledged(selectedPolicyForRead) ? (
              <form onSubmit={handleAcknowledge} className="pt-4 border-t border-gray-100 space-y-3">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={hasReadAgreement}
                    onChange={(e) => setHasReadAgreement(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500 cursor-pointer"
                  />
                  <span className="text-xs text-gray-700 font-medium leading-tight">
                    I solemnly declare that I have thoroughly read, understood, and agreed to adhere to all terms stipulated in this policy document.
                  </span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Electronic Signature (Full Legal Name) *</label>
                    <input
                      type="text"
                      required
                      value={eSignName}
                      onChange={(e) => setESignName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-3 py-2 border rounded-xl text-xs font-serif italic font-semibold focus:ring-2 focus:ring-teal-500 outline-none"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      disabled={!hasReadAgreement || !eSignName.trim()}
                      className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <PenTool className="w-3.5 h-3.5" />
                      <span>Legally Sign & Acknowledge</span>
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-emerald-800 font-bold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>You acknowledged this policy on {selectedPolicyForRead.acknowledgments.find(a => a.userId === currentUser.id || a.userEmail === currentUser.email)?.acknowledgedAt.split('T')[0]}</span>
                </div>
                <button
                  onClick={() => setSelectedPolicyForRead(null)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* POLICY AUDIT TRAIL MODAL */}
      {selectedPolicyForAudit && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-900">Compliance Audit: {selectedPolicyForAudit.title}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{selectedPolicyForAudit.code} • {selectedPolicyForAudit.acknowledgments.length} Total Signatures</p>
              </div>
              <button onClick={() => setSelectedPolicyForAudit(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-2">
              {selectedPolicyForAudit.acknowledgments.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-xs">
                  No staff signatures registered yet for this policy.
                </div>
              ) : (
                selectedPolicyForAudit.acknowledgments.map((ack) => (
                  <div key={ack.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-bold text-gray-900">{ack.userName}</h5>
                      <p className="text-[10px] text-gray-400">{ack.userEmail} • {ack.department}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                        VERIFIED
                      </span>
                      <p className="text-[10px] text-gray-400 mt-0.5">{ack.acknowledgedAt.split('T')[0]}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setSelectedPolicyForAudit(null)}
                className="px-4 py-2 border rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PUBLISH POLICY MODAL */}
      {showPublishModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-bold text-gray-900">Publish New Policy Document</h3>
              </div>
              <button onClick={() => setShowPublishModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePublishPolicy} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Policy Title *</label>
                  <input
                    type="text"
                    required
                    value={newPolicy.title}
                    onChange={(e) => setNewPolicy({ ...newPolicy, title: e.target.value })}
                    placeholder="e.g. Anti-Bribery & Corruption Policy"
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Policy Code *</label>
                  <input
                    type="text"
                    required
                    value={newPolicy.code}
                    onChange={(e) => setNewPolicy({ ...newPolicy, code: e.target.value })}
                    placeholder="POL-GOV-005"
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Category</label>
                  <select
                    value={newPolicy.category}
                    onChange={(e) => setNewPolicy({ ...newPolicy, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none bg-white"
                  >
                    <option value="Ethics & Conduct">Ethics & Conduct</option>
                    <option value="Workplace Safety & POSH">Workplace Safety & POSH</option>
                    <option value="IT & Security">IT & Security</option>
                    <option value="Remote Work">Remote Work</option>
                    <option value="Leaves & Benefits">Leaves & Benefits</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Version</label>
                  <input
                    type="text"
                    value={newPolicy.version}
                    onChange={(e) => setNewPolicy({ ...newPolicy, version: e.target.value })}
                    placeholder="v1.0"
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Effective Date</label>
                  <input
                    type="date"
                    value={newPolicy.effectiveDate}
                    onChange={(e) => setNewPolicy({ ...newPolicy, effectiveDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Grace Period (Days)</label>
                  <input
                    type="number"
                    value={newPolicy.gracePeriodDays}
                    onChange={(e) => setNewPolicy({ ...newPolicy, gracePeriodDays: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Target Audience</label>
                  <select
                    value={newPolicy.targetAudience}
                    onChange={(e) => setNewPolicy({ ...newPolicy, targetAudience: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none bg-white"
                  >
                    <option value="All Employees">All Employees</option>
                    <option value="Engineering & IT">Engineering & IT</option>
                    <option value="Sales & Customer Facing">Sales & Customer Facing</option>
                    <option value="People & Operations">People & Operations</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Executive Summary *</label>
                <textarea
                  rows={2}
                  required
                  value={newPolicy.summary}
                  onChange={(e) => setNewPolicy({ ...newPolicy, summary: e.target.value })}
                  placeholder="Concise overview of the policy scope and obligations..."
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Full Policy Clauses & Text *</label>
                <textarea
                  rows={5}
                  required
                  value={newPolicy.content}
                  onChange={(e) => setNewPolicy({ ...newPolicy, content: e.target.value })}
                  placeholder="1. Purpose\n2. Scope\n3. Statutory Obligations\n4. Redressal Mechanism..."
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none font-mono text-[11px]"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="mandatoryCheck"
                  checked={newPolicy.mandatory}
                  onChange={(e) => setNewPolicy({ ...newPolicy, mandatory: e.target.checked })}
                  className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500 cursor-pointer"
                />
                <label htmlFor="mandatoryCheck" className="text-xs font-bold text-gray-700 cursor-pointer">
                  Require Mandatory Electronic Sign-off from all target employees
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowPublishModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  Publish & Broadcast to Workforce
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD OFFICIAL HOLIDAY MODAL */}
      {showAddHolidayModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-teal-50 text-teal-600 rounded-xl">
                  <Calendar className="w-5 h-5" />
                </span>
                <h3 className="text-base font-bold text-gray-900">Add Statutory / Regional Holiday</h3>
              </div>
              <button onClick={() => setShowAddHolidayModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddHoliday} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Holiday Date *</label>
                <input
                  type="date"
                  required
                  value={newHoliday.date}
                  onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Holiday Title / Festival Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Independence Day, Diwali, Eid..."
                  value={newHoliday.name}
                  onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Holiday Classification *</label>
                <select
                  value={newHoliday.type}
                  onChange={(e) => setNewHoliday({ ...newHoliday, type: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none bg-white"
                >
                  <option value="National Mandatory">National Mandatory Holiday</option>
                  <option value="Festival Mandatory">Festival Mandatory Holiday</option>
                  <option value="Statutory Holiday">Statutory Labour Holiday</option>
                  <option value="Restricted / Optional">Restricted / Optional Holiday</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Applicable Territory / Region</label>
                <input
                  type="text"
                  placeholder="Pan-India or specific state (e.g. Maharashtra, Karnataka)"
                  value={newHoliday.state}
                  onChange={(e) => setNewHoliday({ ...newHoliday, state: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddHolidayModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  Add to Calendar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT POLICY MODAL */}
      {showEditPolicyModal && editingPolicy && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-teal-50 text-teal-600 rounded-xl">
                  <Pencil className="w-5 h-5" />
                </span>
                <h3 className="text-base font-bold text-gray-900">Edit Workforce Policy</h3>
              </div>
              <button onClick={() => setShowEditPolicyModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdatePolicy} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Policy Code *</label>
                  <input
                    type="text"
                    required
                    value={editingPolicy.code}
                    onChange={(e) => setEditingPolicy({ ...editingPolicy, code: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Version *</label>
                  <input
                    type="text"
                    required
                    value={editingPolicy.version}
                    onChange={(e) => setEditingPolicy({ ...editingPolicy, version: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Policy Title *</label>
                <input
                  type="text"
                  required
                  value={editingPolicy.title}
                  onChange={(e) => setEditingPolicy({ ...editingPolicy, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Category</label>
                  <select
                    value={editingPolicy.category}
                    onChange={(e) => setEditingPolicy({ ...editingPolicy, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none bg-white"
                  >
                    <option value="Ethics & Conduct">Ethics & Conduct</option>
                    <option value="Workplace Safety & POSH">Workplace Safety & POSH</option>
                    <option value="IT & Security">IT & Security</option>
                    <option value="Remote Work">Remote Work</option>
                    <option value="Leave & Benefits">Leave & Benefits</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Effective Date</label>
                  <input
                    type="date"
                    value={editingPolicy.effectiveDate}
                    onChange={(e) => setEditingPolicy({ ...editingPolicy, effectiveDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Grace Period (Days)</label>
                  <input
                    type="number"
                    value={editingPolicy.gracePeriodDays}
                    onChange={(e) => setEditingPolicy({ ...editingPolicy, gracePeriodDays: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Target Audience</label>
                  <input
                    type="text"
                    value={editingPolicy.targetAudience}
                    onChange={(e) => setEditingPolicy({ ...editingPolicy, targetAudience: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Summary</label>
                <textarea
                  rows={2}
                  value={editingPolicy.summary}
                  onChange={(e) => setEditingPolicy({ ...editingPolicy, summary: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Policy Content / Clauses</label>
                <textarea
                  rows={4}
                  value={editingPolicy.content}
                  onChange={(e) => setEditingPolicy({ ...editingPolicy, content: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none font-mono text-[11px]"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="editMandatory"
                  checked={editingPolicy.mandatory}
                  onChange={(e) => setEditingPolicy({ ...editingPolicy, mandatory: e.target.checked })}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <label htmlFor="editMandatory" className="text-xs font-semibold text-gray-700">
                  Mandatory sign-off required by all employees
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowEditPolicyModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT HOLIDAY MODAL */}
      {showEditHolidayModal && editingHoliday && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-teal-50 text-teal-600 rounded-xl">
                  <Pencil className="w-5 h-5" />
                </span>
                <h3 className="text-base font-bold text-gray-900">Edit Official Holiday</h3>
              </div>
              <button onClick={() => setShowEditHolidayModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateHoliday} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Holiday Date *</label>
                <input
                  type="date"
                  required
                  value={editingHoliday.date}
                  onChange={(e) => setEditingHoliday({ ...editingHoliday, date: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Holiday Title *</label>
                <input
                  type="text"
                  required
                  value={editingHoliday.name}
                  onChange={(e) => setEditingHoliday({ ...editingHoliday, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Classification *</label>
                <select
                  value={editingHoliday.type}
                  onChange={(e) => setEditingHoliday({ ...editingHoliday, type: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none bg-white"
                >
                  <option value="National Mandatory">National Mandatory Holiday</option>
                  <option value="Festival Mandatory">Festival Mandatory Holiday</option>
                  <option value="Statutory Holiday">Statutory Labour Holiday</option>
                  <option value="Restricted / Optional">Restricted / Optional Holiday</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Applicable Territory / Region</label>
                <input
                  type="text"
                  value={editingHoliday.state}
                  onChange={(e) => setEditingHoliday({ ...editingHoliday, state: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowEditHolidayModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  Save Holiday
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FLOATING TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold z-50 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
