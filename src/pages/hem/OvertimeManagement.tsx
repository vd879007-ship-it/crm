import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Pencil,
  Trash2,
  Timer, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  X, 
  Download, 
  Check, 
  Settings2, 
  FileText, 
  ShieldCheck, 
  ArrowRight,
  TrendingUp,
  Percent,
  Calendar
} from 'lucide-react';
import HEMNavigation from '../../components/HEMNavigation';

interface OvertimePolicy {
  standardWorkdayMultiplier: number;
  weekendWorkMultiplier: number;
  publicHolidayMultiplier: number;
  minimumThresholdMins: number;
  maxMonthlyCapHours: number;
  preApprovalRequired: boolean;
  payoutOption: string;
}

interface OvertimeClaim {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string;
  hoursClaimed: number;
  dayType: string;
  rateMultiplier: number;
  projectTask: string;
  reason: string;
  preferredSettlement: string;
  status: string;
  submittedAt: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
  notes: string;
}

export default function OvertimeManagement() {
  const [policy, setPolicy] = useState<OvertimePolicy>({
    standardWorkdayMultiplier: 1.5,
    weekendWorkMultiplier: 2.0,
    publicHolidayMultiplier: 2.5,
    minimumThresholdMins: 60,
    maxMonthlyCapHours: 35,
    preApprovalRequired: true,
    payoutOption: 'Choice of Cash Payout or Comp-Off Credit'
  });
  const [claims, setClaims] = useState<OvertimeClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'claims' | 'policy' | 'ledger'>('claims');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showEditClaimModal, setShowEditClaimModal] = useState(false);
  const [editingClaim, setEditingClaim] = useState<any>(null);
  const [showPolicyModal, setShowPolicyModal] = useState(false);

  // Forms
  const [claimForm, setClaimForm] = useState({
    employeeName: '',
    employeeId: '',
    department: 'Engineering',
    date: new Date().toISOString().split('T')[0],
    hoursClaimed: 2.5,
    dayType: 'Standard Workday',
    projectTask: 'Production Release & Security Patch',
    reason: 'Critical go-live support beyond scheduled shift window',
    preferredSettlement: 'Payroll Cash Payout'
  });

  const [policyForm, setPolicyForm] = useState<OvertimePolicy>(policy);

  const fetchOvertimeData = async () => {
    try {
      const [polRes, clmRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hem/overtime/policy`),
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hem/overtime/claims`)
      ]);
      setPolicy(polRes.data || policy);
      setPolicyForm(polRes.data || policy);
      setClaims(clmRes.data || []);
    } catch (err) {
      console.error('Failed to load overtime data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOvertimeData();
  }, []);

  const handleOpenEditClaim = (c: OvertimeClaim) => {
    setEditingClaim({ ...c });
    setShowEditClaimModal(true);
  };

  const handleUpdateClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClaim) return;
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hem/overtime/claims/${editingClaim.id}`, editingClaim);
      setShowEditClaimModal(false);
      setEditingClaim(null);
      fetchOvertimeData();
    } catch (err) {
      console.error(err);
      alert('Failed to update overtime claim.');
    }
  };

  const handleDeleteClaim = async (id: string) => {
    if (!window.confirm('Delete this overtime claim entry?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hem/overtime/claims/${id}`);
      fetchOvertimeData();
    } catch (err) {
      console.error(err);
      alert('Failed to delete claim');
    }
  };

  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hem/overtime/claims`, claimForm);
      setShowClaimModal(false);
      setClaimForm({
        employeeName: '',
        employeeId: '',
        department: 'Engineering',
        date: new Date().toISOString().split('T')[0],
        hoursClaimed: 2.5,
        dayType: 'Standard Workday',
        projectTask: 'Production Release & Security Patch',
        reason: 'Critical go-live support beyond scheduled shift window',
        preferredSettlement: 'Payroll Cash Payout'
      });
      fetchOvertimeData();
      setActiveTab('claims');
    } catch (err) {
      console.error(err);
      alert('Failed to submit overtime claim.');
    }
  };

  const handleSimulateClaim = async () => {
    try {
      const sampleNames = [
        { name: 'Nikhil Rathi', id: 'EMP-1204', dept: 'Cloud Infrastructure' },
        { name: 'Divya Sundar', id: 'EMP-2389', dept: 'Backend Engineering' },
        { name: 'Rohan Deshmukh', id: 'EMP-3041', dept: 'Quality Assurance' }
      ];
      const person = sampleNames[Math.floor(Math.random() * sampleNames.length)];
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hem/overtime/claims`, {
        employeeName: person.name,
        employeeId: person.id,
        department: person.dept,
        date: new Date().toISOString().split('T')[0],
        hoursClaimed: (Math.random() > 0.5 ? 2.0 : 3.5),
        dayType: Math.random() > 0.4 ? 'Standard Workday' : 'Weekend',
        projectTask: 'Core Banking API Migration',
        reason: 'Late-night zero-downtime database schema migration.',
        preferredSettlement: Math.random() > 0.5 ? 'Payroll Cash Payout' : 'Comp-Off Credit'
      });
      fetchOvertimeData();
      setActiveTab('claims');
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdatePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hem/overtime/policy`, policyForm);
      setShowPolicyModal(false);
      fetchOvertimeData();
      alert('Overtime policy settings updated.');
    } catch (err) {
      console.error(err);
      alert('Failed to update policy.');
    }
  };

  const handleReviewClaim = async (id: string, newStatus: 'Approved' | 'Rejected') => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hem/overtime/claims/${id}/status`, {
        status: newStatus,
        reviewedBy: 'Project Delivery Head',
        notes: newStatus === 'Approved' ? 'Verified against punch logs' : 'Unscheduled overtime exceeding budget'
      });
      fetchOvertimeData();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredClaims = claims.filter(c => {
    const matchesStatus = statusFilter === 'All' || c.status.toLowerCase().includes(statusFilter.toLowerCase());
    const matchesSearch = 
      c.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.projectTask.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalApprovedHours = claims
    .filter(c => c.status === 'Approved')
    .reduce((sum, c) => sum + c.hoursClaimed, 0);

  const exportOTLedgerCSV = () => {
    if (claims.length === 0) {
      alert('No overtime records available to export.');
      return;
    }
    const headers = ['Claim ID', 'Employee Name', 'Employee ID', 'Department', 'Date', 'Hours', 'Day Type', 'Multiplier', 'Settlement', 'Status'];
    const rows = claims.map(c => [
      c.id,
      `"${c.employeeName}"`,
      c.employeeId,
      `"${c.department}"`,
      c.date,
      c.hoursClaimed,
      c.dayType,
      `${c.rateMultiplier}x`,
      `"${c.preferredSettlement}"`,
      c.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Athena_Overtime_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Universal HEM Navigation Bar */}
      <HEMNavigation />

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-950 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-2 bg-amber-500/20 rounded-xl border border-amber-400/30">
                <Timer className="w-5 h-5 text-amber-300" />
              </span>
              <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider">
                Overtime & Compensatory Rate Engine
              </span>
              <span className="text-[10px] bg-amber-500/30 text-amber-200 font-bold px-2 py-0.5 rounded-full border border-amber-400/30">
                Statutory Multipliers
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Overtime Management & Policies</h1>
            <p className="text-sm text-slate-300 max-w-2xl mt-1">
              Automated reconciliation of hours beyond shifts, statutory overtime multipliers (1.5x, 2.0x, 2.5x), pre-approval controls, and cash payout or comp-off credits.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleSimulateClaim}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Simulate Claim</span>
            </button>
            <button
              onClick={exportOTLedgerCSV}
              className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Download className="w-4 h-4 text-amber-300" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => setShowPolicyModal(true)}
              className="px-3.5 py-2 bg-amber-700/60 hover:bg-amber-700 text-amber-100 border border-amber-500/40 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Settings2 className="w-4 h-4" />
              <span>Edit Multipliers</span>
            </button>
            <button
              onClick={() => setShowClaimModal(true)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Submit OT Claim</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 font-bold border border-amber-100">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">
              {claims.filter(c => c.status.includes('Pending')).length}
            </div>
            <div className="text-xs font-medium text-slate-500">Pending OT Approvals</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold border border-emerald-100">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">{totalApprovedHours} Hours</div>
            <div className="text-xs font-medium text-slate-500">Approved Overtime This Month</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold border border-blue-100">
            <Percent className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">{policy.standardWorkdayMultiplier}x / {policy.weekendWorkMultiplier}x</div>
            <div className="text-xs font-medium text-slate-500">Workday / Weekend Rates</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 font-bold border border-purple-100">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">Max {policy.maxMonthlyCapHours}h</div>
            <div className="text-xs font-medium text-slate-500">Monthly Overtime Cap</div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('claims')}
          className={`px-5 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'claims'
              ? 'border-amber-600 text-amber-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Timer className="w-4 h-4" />
          <span>Overtime Claims & Endorsements ({claims.length})</span>
          {claims.filter(c => c.status.includes('Pending')).length > 0 && (
            <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full text-[10px] font-bold">
              {claims.filter(c => c.status.includes('Pending')).length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('policy')}
          className={`px-5 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'policy'
              ? 'border-amber-600 text-amber-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Settings2 className="w-4 h-4" />
          <span>Configurable Overtime Multipliers & Rules</span>
        </button>
      </div>

      {/* TAB 1: OVERTIME CLAIMS */}
      {activeTab === 'claims' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by Employee, Project, ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center gap-1.5">
                {['All', 'Pending', 'Approved', 'Rejected'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                      statusFilter === status
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-slate-500 text-sm">Loading overtime claims...</div>
            ) : filteredClaims.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-100">
                  <Timer className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-1">No Overtime Claims Filed</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mb-5 leading-relaxed">
                  Employees working beyond scheduled shift hours for system rollouts, incident triage, or weekend maintenance can submit claims with multiplier compensation.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={handleSimulateClaim}
                    className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold rounded-xl text-xs border border-amber-200 flex items-center gap-2 transition-all shadow-xs"
                  >
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>Simulate Sample OT Claim</span>
                  </button>
                  <button
                    onClick={() => setShowClaimModal(true)}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Submit Overtime Claim</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold text-[11px] tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Claim ID & Employee</th>
                      <th className="py-3.5 px-4">Date & Day Type</th>
                      <th className="py-3.5 px-4">Hours & Multiplier</th>
                      <th className="py-3.5 px-4">Project & Reason</th>
                      <th className="py-3.5 px-4">Settlement Mode</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredClaims.map((claim) => (
                      <tr key={claim.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{claim.employeeName}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{claim.id} • {claim.employeeId}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-800">{claim.date}</div>
                          <div className="text-[11px] text-slate-500">{claim.dayType}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-amber-800">{claim.hoursClaimed} Hours</div>
                          <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">
                            {claim.rateMultiplier}x Rate
                          </span>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="font-semibold text-slate-800 truncate">{claim.projectTask}</div>
                          <div className="text-[11px] text-slate-500 truncate" title={claim.reason}>{claim.reason}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                            {claim.preferredSettlement}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          {claim.status === 'Approved' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                            </span>
                          ) : claim.status === 'Rejected' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                              <XCircle className="w-3.5 h-3.5" /> Rejected
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                              <Clock className="w-3.5 h-3.5" /> Pending Endorsement
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditClaim(claim)}
                              className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Edit Claim"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteClaim(claim.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Claim"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            {claim.status.includes('Pending') && (
                              <>
                                <button
                                  onClick={() => handleReviewClaim(claim.id, 'Rejected')}
                                  className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition-colors border border-rose-200"
                                  title="Reject Claim"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleReviewClaim(claim.id, 'Approved')}
                                  className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors shadow-xs"
                                  title="Approve Claim"
                                >
                                  <Check className="w-3.5 h-3.5" />
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

      {/* TAB 2: OVERTIME POLICY */}
      {activeTab === 'policy' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
            <div>
              <h3 className="font-bold text-base text-slate-800">Statutory & Corporate Overtime Multipliers</h3>
              <p className="text-xs text-slate-500">Define hourly wage multipliers for weekdays, weekends, and holidays.</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Standard Workday</span>
                <div className="text-2xl font-bold text-slate-900 mt-1">{policy.standardWorkdayMultiplier}x</div>
                <p className="text-[11px] text-slate-500 mt-1">1.5x of hourly basic pay for hours beyond 9.0h shift</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Weekend / Rest Day</span>
                <div className="text-2xl font-bold text-slate-900 mt-1">{policy.weekendWorkMultiplier}x</div>
                <p className="text-[11px] text-slate-500 mt-1">Double pay (2.0x) or option of full Comp-Off credit</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Public Holiday</span>
                <div className="text-2xl font-bold text-slate-900 mt-1">{policy.publicHolidayMultiplier}x</div>
                <p className="text-[11px] text-slate-500 mt-1">2.5x statutory multiplier for declared holidays</p>
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-100 text-xs text-slate-700">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div>
                  <div className="font-bold text-slate-900">Minimum Qualifying Overtime Threshold</div>
                  <div className="text-slate-500 text-[11px]">Employee must work continuous minutes past shift end before OT logs begin</div>
                </div>
                <span className="font-bold text-slate-800">{policy.minimumThresholdMins} Minutes</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div>
                  <div className="font-bold text-slate-900">Maximum Monthly Cap</div>
                  <div className="text-slate-500 text-[11px]">Upper threshold of billable OT hours per calendar month per employee</div>
                </div>
                <span className="font-bold text-slate-800">{policy.maxMonthlyCapHours} Hours</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div>
                  <div className="font-bold text-slate-900">Manager Pre-Approval Mandatory</div>
                  <div className="text-slate-500 text-[11px]">Requires supervisor pre-authorization prior to OT shift commencement</div>
                </div>
                <span className="font-bold text-emerald-700">{policy.preApprovalRequired ? 'Enabled' : 'Disabled'}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowPolicyModal(true)}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Settings2 className="w-4 h-4" />
                <span>Modify Policy Rules</span>
              </button>
            </div>
          </div>

          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-amber-950">Statutory Labour Compliance Note</h4>
              <p className="text-xs text-amber-800/90 leading-relaxed mt-2">
                Under the Factories Act and Shops & Establishment Acts, overtime work exceeding 9 hours in any day or 48 hours in any week must be compensated at not less than twice the regular rate of wages.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-amber-200/80 text-[11px] text-amber-700">
              Audit log synchronized with monthly payroll ledger.
            </div>
          </div>
        </div>
      )}

      {/* Submit Claim Modal */}
      {showClaimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setShowClaimModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
                <Timer className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Submit Overtime Claim</h3>
                <p className="text-xs text-slate-500">Record billable hours worked outside scheduled shift</p>
              </div>
            </div>

            <form onSubmit={handleSubmitClaim} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Employee Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Divya Sundar"
                    value={claimForm.employeeName}
                    onChange={(e) => setClaimForm({ ...claimForm, employeeName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Employee ID *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. EMP-2389"
                    value={claimForm.employeeId}
                    onChange={(e) => setClaimForm({ ...claimForm, employeeId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={claimForm.date}
                    onChange={(e) => setClaimForm({ ...claimForm, date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Hours Claimed *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={claimForm.hoursClaimed}
                    onChange={(e) => setClaimForm({ ...claimForm, hoursClaimed: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Day Classification
                  </label>
                  <select
                    value={claimForm.dayType}
                    onChange={(e) => setClaimForm({ ...claimForm, dayType: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                  >
                    <option value="Standard Workday">Standard Workday (1.5x)</option>
                    <option value="Weekend">Weekend / Off Day (2.0x)</option>
                    <option value="Public Holiday">Public Holiday (2.5x)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Project / Task Code *
                  </label>
                  <input
                    type="text"
                    value={claimForm.projectTask}
                    onChange={(e) => setClaimForm({ ...claimForm, projectTask: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Settlement Preference
                  </label>
                  <select
                    value={claimForm.preferredSettlement}
                    onChange={(e) => setClaimForm({ ...claimForm, preferredSettlement: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                  >
                    <option value="Payroll Cash Payout">Payroll Cash Payout</option>
                    <option value="Comp-Off Credit">Credit as Comp-Off Leave</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason & Business Justification *
                </label>
                <textarea
                  rows={2}
                  value={claimForm.reason}
                  onChange={(e) => setClaimForm({ ...claimForm, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none resize-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowClaimModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Timer className="w-4 h-4" />
                  <span>Submit Claim</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Policy Modal */}
      {showPolicyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setShowPolicyModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
                <Settings2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Update Overtime Policies</h3>
                <p className="text-xs text-slate-500">Configure rate multipliers and qualifying hours</p>
              </div>
            </div>

            <form onSubmit={handleUpdatePolicy} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Workday (x)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={policyForm.standardWorkdayMultiplier}
                    onChange={(e) => setPolicyForm({ ...policyForm, standardWorkdayMultiplier: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Weekend (x)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={policyForm.weekendWorkMultiplier}
                    onChange={(e) => setPolicyForm({ ...policyForm, weekendWorkMultiplier: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Holiday (x)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={policyForm.publicHolidayMultiplier}
                    onChange={(e) => setPolicyForm({ ...policyForm, publicHolidayMultiplier: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Threshold (Mins)
                  </label>
                  <input
                    type="number"
                    value={policyForm.minimumThresholdMins}
                    onChange={(e) => setPolicyForm({ ...policyForm, minimumThresholdMins: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Monthly Cap (Hrs)
                  </label>
                  <input
                    type="number"
                    value={policyForm.maxMonthlyCapHours}
                    onChange={(e) => setPolicyForm({ ...policyForm, maxMonthlyCapHours: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPolicyModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  Save Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* EDIT OVERTIME CLAIM MODAL */}
      {showEditClaimModal && editingClaim && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                  <Pencil className="w-5 h-5" />
                </span>
                <h3 className="text-base font-bold text-slate-900">Edit Overtime Claim</h3>
              </div>
              <button onClick={() => setShowEditClaimModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateClaim} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Employee Name</label>
                  <input
                    type="text"
                    required
                    value={editingClaim.employeeName}
                    onChange={(e) => setEditingClaim({ ...editingClaim, employeeName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    required
                    value={editingClaim.department}
                    onChange={(e) => setEditingClaim({ ...editingClaim, department: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={editingClaim.date}
                    onChange={(e) => setEditingClaim({ ...editingClaim, date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Hours Claimed</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={editingClaim.hoursClaimed}
                    onChange={(e) => setEditingClaim({ ...editingClaim, hoursClaimed: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Day Type</label>
                  <select
                    value={editingClaim.dayType}
                    onChange={(e) => setEditingClaim({ ...editingClaim, dayType: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-amber-500 outline-none bg-white"
                  >
                    <option value="Standard Workday">Standard Workday (1.5x)</option>
                    <option value="Weekend">Weekend (2.0x)</option>
                    <option value="Public Holiday">Public Holiday (2.5x)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Project / Task Details</label>
                <input
                  type="text"
                  required
                  value={editingClaim.projectTask}
                  onChange={(e) => setEditingClaim({ ...editingClaim, projectTask: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Justification Reason</label>
                <textarea
                  rows={2}
                  value={editingClaim.reason}
                  onChange={(e) => setEditingClaim({ ...editingClaim, reason: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Settlement</label>
                  <select
                    value={editingClaim.preferredSettlement}
                    onChange={(e) => setEditingClaim({ ...editingClaim, preferredSettlement: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-amber-500 outline-none bg-white"
                  >
                    <option value="Payroll Cash Payout">Payroll Cash Payout</option>
                    <option value="Compensatory Off Credit">Compensatory Off Credit</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Claim Status</label>
                  <select
                    value={editingClaim.status}
                    onChange={(e) => setEditingClaim({ ...editingClaim, status: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-amber-500 outline-none bg-white"
                  >
                    <option value="Pending Endorsement">Pending Endorsement</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditClaimModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  Save Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
