import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FileSpreadsheet, Plus, Search, Filter, CheckCircle2, Clock, 
  AlertCircle, Building2, MapPin, DollarSign, Calendar, Users, 
  Trash2, Edit3, X, Check, ArrowRight
} from 'lucide-react';

export default function JobRequisitions() {
  const [requisitions, setRequisitions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedReq, setSelectedReq] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingReq, setEditingReq] = useState<any>(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    department: 'Engineering',
    hiringManager: '',
    positionsCount: 1,
    employmentType: 'Full-time',
    location: 'Remote',
    salaryMin: 120000,
    salaryMax: 160000,
    priority: 'High',
    targetDate: '',
    description: '',
    status: 'Approved'
  });

  const handleOpenEdit = (req: any) => {
    setEditingReq(req);
    setEditFormData({
      title: req.title || '',
      department: req.department || 'Engineering',
      hiringManager: req.hiringManager || '',
      positionsCount: req.positionsCount || 1,
      employmentType: req.employmentType || 'Full-time',
      location: req.location || 'Remote',
      salaryMin: req.salaryMin || 120000,
      salaryMax: req.salaryMax || 160000,
      priority: req.priority || 'High',
      targetDate: req.targetDate || '',
      description: req.description || '',
      status: req.status || 'Approved'
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReq) return;
    try {
      const res = await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/recruitment/requisitions/${editingReq.id}`, editFormData);
      setRequisitions(requisitions.map(r => r.id === editingReq.id ? res.data : r));
      setShowEditModal(false);
      setEditingReq(null);
    } catch (err) {
      setRequisitions(requisitions.map(r => r.id === editingReq.id ? { ...r, ...editFormData } : r));
      setShowEditModal(false);
      setEditingReq(null);
    }
  };

  const [formData, setFormData] = useState({
    title: '',
    department: 'Engineering',
    hiringManager: '',
    positionsCount: 1,
    employmentType: 'Full-time',
    location: 'Remote',
    salaryMin: 120000,
    salaryMax: 160000,
    priority: 'High',
    targetDate: '',
    description: ''
  });

  const fetchRequisitions = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/recruitment/requisitions`);
      setRequisitions(res.data);
    } catch (err) {
      console.error(err);
      setRequisitions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequisitions();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/recruitment/requisitions`, formData);
      setRequisitions([res.data, ...requisitions]);
      setShowCreateModal(false);
      setFormData({
        title: '',
        department: 'Engineering',
        hiringManager: '',
        positionsCount: 1,
        employmentType: 'Full-time',
        location: 'Remote',
        salaryMin: 120000,
        salaryMax: 160000,
        priority: 'High',
        targetDate: '',
        description: ''
      });
    } catch (err) {
      console.error(err);
      const newReq = {
        id: `REQ-2026-${String(requisitions.length + 1).padStart(3, '0')}`,
        ...formData,
        filledCount: 0,
        status: 'Approved',
        createdAt: new Date().toISOString()
      };
      setRequisitions([newReq, ...requisitions]);
      setShowCreateModal(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/recruitment/requisitions/${id}`, { status: newStatus });
      setRequisitions(requisitions.map(r => r.id === id ? { ...r, status: newStatus } : r));
    } catch (err) {
      setRequisitions(requisitions.map(r => r.id === id ? { ...r, status: newStatus } : r));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this job requisition?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/recruitment/requisitions/${id}`);
      setRequisitions(requisitions.filter(r => r.id !== id));
    } catch (err) {
      setRequisitions(requisitions.filter(r => r.id !== id));
    }
  };

  const filteredRequisitions = requisitions.filter(req => {
    const matchesSearch = req.title.toLowerCase().includes(search.toLowerCase()) || 
                          req.id.toLowerCase().includes(search.toLowerCase()) ||
                          req.hiringManager?.toLowerCase().includes(search.toLowerCase());
    const matchesDept = deptFilter === 'All' || req.department === deptFilter;
    const matchesStatus = statusFilter === 'All' || req.status === statusFilter;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const totalPositions = requisitions.reduce((acc, curr) => acc + (curr.positionsCount || 1), 0);
  const totalFilled = requisitions.reduce((acc, curr) => acc + (curr.filledCount || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
            <span>Job Requisition Management</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Authorize headcount, manage hiring budgets, and monitor approval workflows
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm flex items-center justify-center transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Job Requisition
        </button>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <p className="text-xs font-medium text-gray-500">Total Requisitions</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{requisitions.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <p className="text-xs font-medium text-gray-500">Open Headcounts</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{totalPositions - totalFilled}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <p className="text-xs font-medium text-gray-500">Positions Filled</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{totalFilled} / {totalPositions}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <p className="text-xs font-medium text-gray-500">Pending Approvals</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">
            {requisitions.filter(r => r.status === 'Pending Approval').length}
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by title, code or manager..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500">Department:</span>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="text-xs font-medium border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
              <option value="Product">Product</option>
              <option value="Finance">Finance</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-medium border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All Statuses</option>
              <option value="Approved">Approved</option>
              <option value="Pending Approval">Pending Approval</option>
              <option value="On Hold">On Hold</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requisitions List */}
      <div className="space-y-4">
        {filteredRequisitions.map((req) => (
          <div
            key={req.id}
            className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs hover:border-emerald-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                  {req.id}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                  req.priority === 'Urgent' ? 'bg-red-100 text-red-700' :
                  req.priority === 'High' ? 'bg-amber-100 text-amber-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {req.priority} Priority
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                  req.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                  req.status === 'Pending Approval' ? 'bg-yellow-100 text-yellow-800' :
                  req.status === 'On Hold' ? 'bg-gray-100 text-gray-700' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  {req.status}
                </span>
              </div>

              <h3 className="text-base font-bold text-gray-900">{req.title}</h3>

              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-gray-400" />
                  {req.department}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-gray-400" />
                  Mgr: {req.hiringManager}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  {req.location}
                </span>
                <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  ${(req.salaryMin / 1000).toFixed(0)}k - ${(req.salaryMax / 1000).toFixed(0)}k
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  Target: {req.targetDate}
                </span>
              </div>

              <p className="text-xs text-gray-600 line-clamp-2 max-w-3xl">
                {req.description}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-end sm:items-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100">
              <div className="text-right sm:text-left md:text-right lg:text-left pr-2">
                <span className="text-xs text-gray-400 block">Filled Progress</span>
                <span className="text-sm font-bold text-gray-800">
                  {req.filledCount} of {req.positionsCount} hired
                </span>
              </div>

              <div className="flex items-center gap-2">
                {req.status === 'Pending Approval' ? (
                  <button
                    onClick={() => handleStatusChange(req.id, 'Approved')}
                    className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    title="Approve Requisition"
                  >
                    <Check className="w-4 h-4" />
                    <span className="hidden sm:inline">Approve</span>
                  </button>
                ) : (
                  <select
                    value={req.status}
                    onChange={(e) => handleStatusChange(req.id, e.target.value)}
                    className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-gray-50 text-gray-700"
                  >
                    <option value="Approved">Approved</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Closed">Closed</option>
                  </select>
                )}

                <button
                  onClick={() => handleOpenEdit(req)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                  title="Edit Requisition"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(req.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  title="Delete Requisition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredRequisitions.length === 0 && (
          <div className="bg-white p-12 text-center rounded-xl border border-gray-200">
            <p className="text-sm text-gray-500">No job requisitions found matching your filter criteria.</p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && editingReq && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Edit Job Requisition ({editingReq.id})</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Job Title *</label>
                <input
                  type="text"
                  required
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Department</label>
                  <select
                    value={editFormData.department}
                    onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="Product">Product</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Hiring Manager</label>
                  <input
                    type="text"
                    required
                    value={editFormData.hiringManager}
                    onChange={(e) => setEditFormData({ ...editFormData, hiringManager: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Open Positions</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editFormData.positionsCount}
                    onChange={(e) => setEditFormData({ ...editFormData, positionsCount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Min Salary ($)</label>
                  <input
                    type="number"
                    value={editFormData.salaryMin}
                    onChange={(e) => setEditFormData({ ...editFormData, salaryMin: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Max Salary ($)</label>
                  <input
                    type="number"
                    value={editFormData.salaryMax}
                    onChange={(e) => setEditFormData({ ...editFormData, salaryMax: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Priority</label>
                  <select
                    value={editFormData.priority}
                    onChange={(e) => setEditFormData({ ...editFormData, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                  >
                    <option value="Urgent">Urgent</option>
                    <option value="High">High</option>
                    <option value="Normal">Normal</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Target Fill Date</label>
                  <input
                    type="date"
                    value={editFormData.targetDate}
                    onChange={(e) => setEditFormData({ ...editFormData, targetDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                  >
                    <option value="Approved">Approved</option>
                    <option value="Pending Approval">Pending Approval</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Job Description</label>
                <textarea
                  rows={3}
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Create New Job Requisition</h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Position Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Staff Distributed Systems Engineer"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Department *</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="Product">Product</option>
                    <option value="Finance">Finance</option>
                    <option value="Human Resources">Human Resources</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Hiring Manager *</label>
                  <input
                    type="text"
                    required
                    value={formData.hiringManager}
                    onChange={(e) => setFormData({ ...formData, hiringManager: e.target.value })}
                    placeholder="e.g. Alex Chen"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Headcount Needed</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.positionsCount}
                    onChange={(e) => setFormData({ ...formData, positionsCount: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Employment Type</label>
                  <select
                    value={formData.employmentType}
                    onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Min Salary ($/yr)</label>
                  <input
                    type="number"
                    value={formData.salaryMin}
                    onChange={(e) => setFormData({ ...formData, salaryMin: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Max Salary ($/yr)</label>
                  <input
                    type="number"
                    value={formData.salaryMax}
                    onChange={(e) => setFormData({ ...formData, salaryMax: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Target Start Date</label>
                  <input
                    type="date"
                    value={formData.targetDate}
                    onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Location / Work Mode</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. San Francisco, CA (Hybrid) or Remote"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Job Description & Business Justification</label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Summarize core responsibilities, key deliverables, and hiring justification..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-sm cursor-pointer"
                >
                  Submit Requisition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
