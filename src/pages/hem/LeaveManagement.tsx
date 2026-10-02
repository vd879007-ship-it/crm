import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  CalendarCheck, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Sparkles, 
  X, 
  Download, 
  Check, 
  Settings2, 
  FileText, 
  ShieldCheck, 
  UserCheck, 
  ArrowRight,
  Eye,
  Info,
  CalendarDays,
  Pencil,
  Trash2
} from 'lucide-react';
import HEMNavigation from '../../components/HEMNavigation';

interface LeaveType {
  id: string;
  name: string;
  code: string;
  quota: number;
  accrualFrequency: string;
  carryForwardLimit: number;
  encashable: boolean;
  minNoticeDays: number;
  maxConsecutiveDays: number;
  docRequiredAfterDays: number;
  gender: string;
  color: string;
  description: string;
}

interface LeaveRequest {
  id: string;
  employeeName: string;
  employeeId: string;
  department: string;
  leaveTypeId: string;
  leaveTypeName: string;
  leaveTypeCode: string;
  startDate: string;
  endDate: string;
  daysCount: number;
  isHalfDay: boolean;
  halfDayType: string;
  reason: string;
  attachmentUrl: string | null;
  status: string;
  appliedAt: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewerNotes: string;
}

export default function LeaveManagement() {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'requests' | 'schemes' | 'ledger' | 'calendar'>('requests');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showAddTypeModal, setShowAddTypeModal] = useState(false);
  const [reviewingRequest, setReviewingRequest] = useState<LeaveRequest | null>(null);
  const [showEditRequestModal, setShowEditRequestModal] = useState(false);
  const [editingRequest, setEditingRequest] = useState<any>(null);
  const [editRequestForm, setEditRequestForm] = useState({ startDate: '', endDate: '', reason: '', status: 'Pending Manager Approval' });

  const [showEditTypeModal, setShowEditTypeModal] = useState(false);
  const [editingType, setEditingType] = useState<any>(null);
  const [editTypeForm, setEditTypeForm] = useState({ name: '', code: '', quota: 12, carryForwardLimit: 6, encashable: true });

  const handleOpenEditRequest = (req: any) => {
    setEditingRequest(req);
    setEditRequestForm({
      startDate: req.startDate,
      endDate: req.endDate,
      reason: req.reason,
      status: req.status
    });
    setShowEditRequestModal(true);
  };

  const handleEditRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRequest) return;
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hem/leaves/requests/${editingRequest.id}`, editRequestForm);
      setShowEditRequestModal(false);
      fetchLeaveData();
    } catch (err) {
      alert('Failed to update leave request');
    }
  };

  const handleDeleteRequest = async (id: string) => {
    if (!confirm('Are you sure you want to delete this leave request?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hem/leaves/requests/${id}`);
      fetchLeaveData();
    } catch (err) {
      alert('Failed to delete leave request');
    }
  };

  const handleOpenEditType = (type: any) => {
    setEditingType(type);
    setEditTypeForm({
      name: type.name,
      code: type.code,
      quota: type.quota,
      carryForwardLimit: type.carryForwardLimit,
      encashable: type.encashable
    });
    setShowEditTypeModal(true);
  };

  const handleEditTypeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingType) return;
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hem/leaves/types/${editingType.id}`, editTypeForm);
      setShowEditTypeModal(false);
      fetchLeaveData();
    } catch (err) {
      alert('Failed to update leave scheme');
    }
  };

  const handleDeleteType = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the "${name}" leave scheme?`)) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hem/leaves/types/${id}`);
      fetchLeaveData();
    } catch (err) {
      alert('Failed to delete leave scheme');
    }
  };

  // Forms
  const [applyForm, setApplyForm] = useState({
    employeeName: '',
    employeeId: '',
    department: 'Engineering',
    leaveTypeId: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    isHalfDay: false,
    halfDayType: 'First Half',
    reason: ''
  });

  const [typeForm, setTypeForm] = useState({
    name: '',
    code: '',
    quota: 12,
    accrualFrequency: 'Monthly (1.0 day/mo)',
    carryForwardLimit: 6,
    encashable: true,
    minNoticeDays: 2,
    maxConsecutiveDays: 7,
    docRequiredAfterDays: 0,
    gender: 'All',
    color: 'emerald',
    description: ''
  });

  const fetchLeaveData = async () => {
    try {
      const [typeRes, reqRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hem/leaves/types`),
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hem/leaves/requests`)
      ]);
      setLeaveTypes(typeRes.data || []);
      if (typeRes.data && typeRes.data.length > 0) {
        setApplyForm(prev => ({ ...prev, leaveTypeId: typeRes.data[0].id }));
      }
      setRequests(reqRes.data || []);
    } catch (err) {
      console.error('Failed to load leave data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveData();
  }, []);

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selType = leaveTypes.find(t => t.id === applyForm.leaveTypeId) || leaveTypes[0];
      const payload = {
        ...applyForm,
        leaveTypeCode: selType?.code || 'PL',
        daysCount: applyForm.isHalfDay ? 0.5 : 1
      };
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hem/leaves/requests`, payload);
      setShowApplyModal(false);
      setApplyForm({
        employeeName: '',
        employeeId: '',
        department: 'Engineering',
        leaveTypeId: leaveTypes[0]?.id || '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        isHalfDay: false,
        halfDayType: 'First Half',
        reason: ''
      });
      fetchLeaveData();
      setActiveTab('requests');
    } catch (err) {
      console.error(err);
      alert('Failed to submit leave application.');
    }
  };

  const handleSimulateLeave = async () => {
    try {
      const sampleNames = [
        { name: 'Kavita Krishnan', id: 'EMP-2091', dept: 'Product & Design' },
        { name: 'Sameer Joshi', id: 'EMP-1402', dept: 'Engineering' },
        { name: 'Deepa Nair', id: 'EMP-3882', dept: 'Marketing' }
      ];
      const person = sampleNames[Math.floor(Math.random() * sampleNames.length)];
      const sampleType = leaveTypes[Math.floor(Math.random() * leaveTypes.length)] || leaveTypes[0];

      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hem/leaves/requests`, {
        employeeName: person.name,
        employeeId: person.id,
        department: person.dept,
        leaveTypeId: sampleType.id,
        leaveTypeCode: sampleType.code,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
        daysCount: 2,
        isHalfDay: false,
        reason: 'Attending family celebration and personal travel.'
      });
      fetchLeaveData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateLeaveType = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hem/leaves/types`, typeForm);
      setShowAddTypeModal(false);
      setTypeForm({
        name: '',
        code: '',
        quota: 12,
        accrualFrequency: 'Monthly (1.0 day/mo)',
        carryForwardLimit: 6,
        encashable: true,
        minNoticeDays: 2,
        maxConsecutiveDays: 7,
        docRequiredAfterDays: 0,
        gender: 'All',
        color: 'emerald',
        description: ''
      });
      fetchLeaveData();
      setActiveTab('schemes');
    } catch (err) {
      console.error(err);
      alert('Failed to create custom leave scheme.');
    }
  };

  const handleReviewRequest = async (id: string, newStatus: 'Approved' | 'Rejected', notes: string = '') => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hem/leaves/requests/${id}/status`, {
        status: newStatus,
        reviewerNotes: notes || (newStatus === 'Approved' ? 'Authorized by Manager' : 'Declined due to project deliverable')
      });
      setReviewingRequest(null);
      fetchLeaveData();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredRequests = requests.filter(r => {
    const matchesStatus = statusFilter === 'All' || r.status.toLowerCase().includes(statusFilter.toLowerCase());
    const matchesSearch = 
      r.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.leaveTypeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Universal HEM Navigation Bar */}
      <HEMNavigation />

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-2 bg-emerald-500/20 rounded-xl border border-emerald-400/30">
                <CalendarCheck className="w-5 h-5 text-emerald-300" />
              </span>
              <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">
                Enterprise Time-Off & Quota Engine
              </span>
              <span className="text-[10px] bg-emerald-500/30 text-emerald-200 font-bold px-2 py-0.5 rounded-full border border-emerald-400/30">
                Fully Customizable
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Customizable Leave Management</h1>
            <p className="text-sm text-slate-300 max-w-2xl mt-1">
              Configure custom leave policies, automated monthly/annual accruals, carry-forward ceilings, encashment parameters, and multi-tier approval workflows with real-time balance tracking.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleSimulateLeave}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Simulate Request</span>
            </button>
            <button
              onClick={() => setShowAddTypeModal(true)}
              className="px-3.5 py-2 bg-emerald-700/60 hover:bg-emerald-700 text-emerald-100 border border-emerald-500/40 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Settings2 className="w-4 h-4" />
              <span>New Leave Scheme</span>
            </button>
            <button
              onClick={() => setShowApplyModal(true)}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Apply for Leave</span>
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
              {requests.filter(r => r.status.includes('Pending')).length}
            </div>
            <div className="text-xs font-medium text-slate-500">Pending Approvals</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold border border-emerald-100">
            <Settings2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">{leaveTypes.length} Schemes</div>
            <div className="text-xs font-medium text-slate-500">Configured Leave Policies</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 font-bold border border-teal-100">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">
              {requests.filter(r => r.status === 'Approved').length}
            </div>
            <div className="text-xs font-medium text-slate-500">Approved Applications</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold border border-blue-100">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">&lt; 4 Hours</div>
            <div className="text-xs font-medium text-slate-500">Average Turnaround SLA</div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-5 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'requests'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>Leave Applications & Approvals ({requests.length})</span>
          {requests.filter(r => r.status.includes('Pending')).length > 0 && (
            <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full text-[10px] font-bold">
              {requests.filter(r => r.status.includes('Pending')).length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('schemes')}
          className={`px-5 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'schemes'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Settings2 className="w-4 h-4" />
          <span>Customizable Leave Schemes ({leaveTypes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('calendar')}
          className={`px-5 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'calendar'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          <span>Team Leave Schedule Calendar</span>
        </button>
      </div>

      {/* TAB 1: LEAVE APPLICATIONS */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by Employee, Leave Type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-1.5">
                {['All', 'Pending', 'Approved', 'Rejected'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                      statusFilter === status
                        ? 'bg-emerald-600 text-white shadow-xs'
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
              <div className="p-12 text-center text-slate-500 text-sm">Loading leave applications...</div>
            ) : filteredRequests.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                  <CalendarCheck className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-1">No Leave Applications Found</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mb-5 leading-relaxed">
                  Employees can apply for annual privilege leave, casual leave, sick days, or maternity leaves with automated balance validation.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={handleSimulateLeave}
                    className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold rounded-xl text-xs border border-emerald-200 flex items-center gap-2 transition-all shadow-xs"
                  >
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>Simulate Sample Request</span>
                  </button>
                  <button
                    onClick={() => setShowApplyModal(true)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-xs transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Apply for Leave</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold text-[11px] tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Request ID & Employee</th>
                      <th className="py-3.5 px-4">Leave Type</th>
                      <th className="py-3.5 px-4">Duration & Days</th>
                      <th className="py-3.5 px-4">Reason</th>
                      <th className="py-3.5 px-4">Approval Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{req.employeeName}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{req.id} • {req.employeeId}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                            {req.leaveTypeName} ({req.leaveTypeCode})
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-slate-800">
                            {req.startDate} {req.startDate !== req.endDate ? `to ${req.endDate}` : ''}
                          </div>
                          <div className="text-[11px] text-emerald-700 font-bold">
                            {req.daysCount} {req.daysCount === 1 ? 'day' : 'days'} {req.isHalfDay && `(${req.halfDayType})`}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs">
                          <p className="text-slate-700 truncate" title={req.reason}>{req.reason}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          {req.status === 'Approved' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                            </span>
                          ) : req.status === 'Rejected' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                              <XCircle className="w-3.5 h-3.5" /> Rejected
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                              <Clock className="w-3.5 h-3.5" /> Pending Review
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditRequest(req)}
                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="Edit Leave Request"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteRequest(req.id)}
                              className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Leave Request"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            {req.status.includes('Pending') ? (
                              <>
                                <button
                                  onClick={() => handleReviewRequest(req.id, 'Rejected')}
                                  className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition-colors border border-rose-200"
                                  title="Reject Leave"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleReviewRequest(req.id, 'Approved')}
                                  className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors shadow-xs"
                                  title="Approve Leave"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => setReviewingRequest(req)}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium"
                              >
                                View Log
                              </button>
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

      {/* TAB 2: CUSTOMIZABLE LEAVE SCHEMES */}
      {activeTab === 'schemes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">Corporate time-off schemes configured with statutory accrual and carry-over parameters.</p>
            <button
              onClick={() => setShowAddTypeModal(true)}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Custom Scheme</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {leaveTypes.map((type) => (
              <div
                key={type.id}
                className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-400 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 font-mono">
                      {type.code}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {type.gender} Applicability
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 leading-snug">
                    {type.name}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1 mb-4">
                    {type.description}
                  </p>

                  <div className="space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Annual Quota:</span>
                      <span className="font-bold text-slate-800">{type.quota} Days</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Accrual Cycle:</span>
                      <span className="font-semibold text-slate-700">{type.accrualFrequency}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Carry Forward Limit:</span>
                      <span className="font-semibold text-slate-700">Max {type.carryForwardLimit} Days</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Encashment Allowed:</span>
                      <span className={`font-semibold ${type.encashable ? 'text-emerald-700' : 'text-slate-500'}`}>
                        {type.encashable ? 'Yes (Statutory Encashable)' : 'No'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Min. Advance Notice:</span>
                      <span className="font-semibold text-slate-700">{type.minNoticeDays} Days</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Max Consecutive Days:</span>
                      <span className="font-semibold text-slate-700">{type.maxConsecutiveDays} Days</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Doc required: {type.docRequiredAfterDays > 0 ? `> ${type.docRequiredAfterDays} days` : 'Not mandatory'}
                  </span>
                  <button
                    onClick={() => {
                      setApplyForm(prev => ({ ...prev, leaveTypeId: type.id }));
                      setShowApplyModal(true);
                    }}
                    className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold transition-colors"
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CALENDAR */}
      {activeTab === 'calendar' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-800">Team Leave Schedule - September 2026</h3>
              <p className="text-xs text-slate-500">Scheduled absences and overlap coverage</p>
            </div>
            <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-semibold border border-emerald-200">
              {requests.filter(r => r.status === 'Approved').length} Active Leaves
            </span>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <div key={day} className="font-bold text-slate-400 py-2 border-b border-slate-100 uppercase text-[10px]">
                {day}
              </div>
            ))}
            {Array.from({ length: 30 }).map((_, i) => {
              const dayNum = i + 1;
              const hasLeave = requests.some(r => r.status === 'Approved');
              return (
                <div key={i} className="h-20 p-1.5 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col justify-between text-left">
                  <span className="text-[11px] font-bold text-slate-600">{dayNum}</span>
                  {hasLeave && (dayNum === 24 || dayNum === 25) && (
                    <div className="bg-emerald-100 text-emerald-800 text-[10px] p-1 rounded font-medium truncate">
                      Priya (PL)
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setShowApplyModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Apply for Time Off</h3>
                <p className="text-xs text-slate-500">Submit leave request for manager endorsement</p>
              </div>
            </div>

            <form onSubmit={handleApplyLeave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Employee Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={applyForm.employeeName}
                    onChange={(e) => setApplyForm({ ...applyForm, employeeName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Employee ID *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. EMP-1042"
                    value={applyForm.employeeId}
                    onChange={(e) => setApplyForm({ ...applyForm, employeeId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Leave Scheme *
                </label>
                <select
                  value={applyForm.leaveTypeId}
                  onChange={(e) => setApplyForm({ ...applyForm, leaveTypeId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  required
                >
                  {leaveTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} (Quota: {t.quota}d)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={applyForm.startDate}
                    onChange={(e) => setApplyForm({ ...applyForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={applyForm.endDate}
                    onChange={(e) => setApplyForm({ ...applyForm, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={applyForm.isHalfDay}
                    onChange={(e) => setApplyForm({ ...applyForm, isHalfDay: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Half Day Leave</span>
                </label>

                {applyForm.isHalfDay && (
                  <select
                    value={applyForm.halfDayType}
                    onChange={(e) => setApplyForm({ ...applyForm, halfDayType: e.target.value })}
                    className="px-2 py-1 border border-slate-200 rounded-lg text-xs bg-white"
                  >
                    <option value="First Half">First Half (Morning)</option>
                    <option value="Second Half">Second Half (Afternoon)</option>
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason & Purpose *
                </label>
                <textarea
                  rows={3}
                  placeholder="Detail the reason for your time-off request..."
                  value={applyForm.reason}
                  onChange={(e) => setApplyForm({ ...applyForm, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <CalendarCheck className="w-4 h-4" />
                  <span>Submit Application</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Custom Leave Scheme Modal */}
      {showAddTypeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddTypeModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
                <Settings2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Create Custom Leave Scheme</h3>
                <p className="text-xs text-slate-500">Configure quotas, accrual intervals, and rules</p>
              </div>
            </div>

            <form onSubmit={handleCreateLeaveType} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Scheme Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sabbatical Study Leave"
                    value={typeForm.name}
                    onChange={(e) => setTypeForm({ ...typeForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Code *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SAB"
                    value={typeForm.code}
                    onChange={(e) => setTypeForm({ ...typeForm, code: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono uppercase"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Annual Quota (Days) *
                  </label>
                  <input
                    type="number"
                    value={typeForm.quota}
                    onChange={(e) => setTypeForm({ ...typeForm, quota: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Accrual Frequency *
                  </label>
                  <select
                    value={typeForm.accrualFrequency}
                    onChange={(e) => setTypeForm({ ...typeForm, accrualFrequency: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  >
                    <option value="Monthly (1.0 day/mo)">Monthly (1.0 day/mo)</option>
                    <option value="Monthly (1.5 days/mo)">Monthly (1.5 days/mo)</option>
                    <option value="Annual Quota upfront">Annual Quota upfront</option>
                    <option value="Event Based (Childbirth/Emergency)">Event Based (Childbirth/Emergency)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Carry Forward Limit
                  </label>
                  <input
                    type="number"
                    value={typeForm.carryForwardLimit}
                    onChange={(e) => setTypeForm({ ...typeForm, carryForwardLimit: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Gender Applicability
                  </label>
                  <select
                    value={typeForm.gender}
                    onChange={(e) => setTypeForm({ ...typeForm, gender: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  >
                    <option value="All">All Employees</option>
                    <option value="Female">Female Only</option>
                    <option value="Male">Male Only</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={typeForm.encashable}
                    onChange={(e) => setTypeForm({ ...typeForm, encashable: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Encashment Permitted (Salary Cash-Out)</span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Scheme Policy Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Explain eligibility, restrictions, and documentation guidelines..."
                  value={typeForm.description}
                  onChange={(e) => setTypeForm({ ...typeForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddTypeModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Save Leave Scheme</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setReviewingRequest(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                  {reviewingRequest.id}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">{reviewingRequest.leaveTypeName}</h3>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-600 mb-5">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Employee:</span>
                  <span className="font-bold text-slate-800">{reviewingRequest.employeeName} ({reviewingRequest.employeeId})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Date Range:</span>
                  <span className="font-bold text-slate-800">{reviewingRequest.startDate} to {reviewingRequest.endDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Count:</span>
                  <span className="font-bold text-emerald-700">{reviewingRequest.daysCount} Days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status:</span>
                  <span className="font-bold text-slate-800">{reviewingRequest.status}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold mb-1">Reason:</span>
                <p className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 text-slate-700">
                  {reviewingRequest.reason}
                </p>
              </div>

              {reviewingRequest.reviewerNotes && (
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold mb-1">Reviewer Remarks:</span>
                  <p className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 text-slate-700">
                    {reviewingRequest.reviewerNotes}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setReviewingRequest(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT LEAVE REQUEST ================= */}
      {showEditRequestModal && editingRequest && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-[480px] max-w-full text-xs">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-gray-900">Edit Leave Application</h3>
              <button onClick={() => setShowEditRequestModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleEditRequestSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={editRequestForm.startDate}
                    onChange={e => setEditRequestForm({...editRequestForm, startDate: e.target.value})}
                    className="w-full border-gray-300 rounded-xl p-2.5 border"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">End Date *</label>
                  <input
                    type="date"
                    required
                    value={editRequestForm.endDate}
                    onChange={e => setEditRequestForm({...editRequestForm, endDate: e.target.value})}
                    className="w-full border-gray-300 rounded-xl p-2.5 border"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Reason / Purpose *</label>
                <textarea
                  required
                  value={editRequestForm.reason}
                  onChange={e => setEditRequestForm({...editRequestForm, reason: e.target.value})}
                  className="w-full border-gray-300 rounded-xl p-2.5 border"
                  rows={3}
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Status</label>
                <select
                  value={editRequestForm.status}
                  onChange={e => setEditRequestForm({...editRequestForm, status: e.target.value})}
                  className="w-full border-gray-300 rounded-xl p-2.5 border bg-white font-medium"
                >
                  <option value="Pending Manager Approval">Pending Manager Approval</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setShowEditRequestModal(false)} className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs cursor-pointer">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT LEAVE SCHEME ================= */}
      {showEditTypeModal && editingType && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-[480px] max-w-full text-xs">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-gray-900">Edit Leave Scheme</h3>
              <button onClick={() => setShowEditTypeModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleEditTypeSubmit} className="space-y-4">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Scheme Name *</label>
                <input
                  required
                  value={editTypeForm.name}
                  onChange={e => setEditTypeForm({...editTypeForm, name: e.target.value})}
                  className="w-full border-gray-300 rounded-xl p-2.5 border font-semibold"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Scheme Code *</label>
                  <input
                    required
                    value={editTypeForm.code}
                    onChange={e => setEditTypeForm({...editTypeForm, code: e.target.value.toUpperCase()})}
                    className="w-full border-gray-300 rounded-xl p-2.5 border font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Annual Quota (Days) *</label>
                  <input
                    type="number"
                    required
                    value={editTypeForm.quota}
                    onChange={e => setEditTypeForm({...editTypeForm, quota: Number(e.target.value)})}
                    className="w-full border-gray-300 rounded-xl p-2.5 border font-mono font-bold"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Carry Forward Limit</label>
                  <input
                    type="number"
                    value={editTypeForm.carryForwardLimit}
                    onChange={e => setEditTypeForm({...editTypeForm, carryForwardLimit: Number(e.target.value)})}
                    className="w-full border-gray-300 rounded-xl p-2.5 border font-mono"
                  />
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 font-bold text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editTypeForm.encashable}
                      onChange={e => setEditTypeForm({...editTypeForm, encashable: e.target.checked})}
                      className="rounded text-emerald-600"
                    />
                    Encashable at FY End
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setShowEditTypeModal(false)} className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs cursor-pointer">Save Scheme</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
