import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ShieldCheck, AlertTriangle, CheckCircle2, Clock, Pencil, Trash2, 
  FileCheck2, Plus, Search, Filter, X, Eye, 
  Download, Building, UserCheck, AlertCircle, FileText
} from 'lucide-react';

export default function BackgroundScreening() {
  const [screenings, setScreenings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [showInitiateModal, setShowInitiateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingScreening, setEditingScreening] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    candidateName: '',
    position: '',
    department: 'Engineering',
    provider: 'Checkr Enterprise',
    packageType: 'Comprehensive Verification',
    status: 'In Progress',
    notes: ''
  });

  const handleOpenEdit = (s: any) => {
    setEditingScreening(s);
    setEditForm({
      candidateName: s.candidateName || '',
      position: s.position || '',
      department: s.department || 'Engineering',
      provider: s.provider || 'Checkr Enterprise',
      packageType: s.packageType || 'Comprehensive Verification',
      status: s.status || 'In Progress',
      notes: s.notes || ''
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingScreening) return;
    try {
      const res = await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/recruitment/screening/${editingScreening.id}`, editForm);
      setScreenings(screenings.map(s => s.id === editingScreening.id ? res.data : s));
      setShowEditModal(false);
    } catch (err) {
      setScreenings(screenings.map(s => s.id === editingScreening.id ? { ...s, ...editForm } : s));
      setShowEditModal(false);
    }
  };

  const handleDeleteScreening = async (id: string) => {
    if (!confirm('Are you sure you want to delete this background screening record?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/recruitment/screening/${id}`);
      setScreenings(screenings.filter(s => s.id !== id));
      if (selectedReport?.id === id) setSelectedReport(null);
    } catch (err) {
      setScreenings(screenings.filter(s => s.id !== id));
      if (selectedReport?.id === id) setSelectedReport(null);
    }
  };

  const [initiateForm, setInitiateForm] = useState({
    candidateName: '',
    position: 'Senior Full Stack Engineer',
    department: 'Engineering',
    provider: 'Checkr Enterprise',
    packageType: 'Comprehensive Verification',
    notes: 'Candidate consented to pre-employment background screening.'
  });

  const fetchScreenings = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/recruitment/screening`);
      setScreenings(res.data);
    } catch (err) {
      console.error(err);
      setScreenings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScreenings();
  }, []);

  const handleInitiateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/recruitment/screening`, initiateForm);
      setScreenings([res.data, ...screenings]);
      setShowInitiateModal(false);
      setInitiateForm({
        candidateName: '',
        position: 'Senior Full Stack Engineer',
        department: 'Engineering',
        provider: 'Checkr Enterprise',
        packageType: 'Comprehensive Verification',
        notes: 'Candidate consented to pre-employment background screening.'
      });
    } catch (err) {
      const mockItem = {
        id: `BGC-2026-${String(screenings.length + 86).padStart(3, '0')}`,
        ...initiateForm,
        submittedDate: new Date().toISOString().split('T')[0],
        completedDate: null,
        status: 'In Progress',
        checks: [
          { name: 'SSN & Identity Trace', status: 'Passed', detail: 'Identity verified' },
          { name: 'National Criminal History', status: 'Passed', detail: 'No records found' },
          { name: 'Prior Employment (Past 5 Years)', status: 'In Progress', detail: 'HR outreach active' },
          { name: 'Highest Degree Credential', status: 'In Progress', detail: 'University registry query dispatched' },
          { name: 'Professional Reference Checks', status: 'Pending', detail: 'Reference forms pending response' },
          { name: 'Standard 10-Panel Drug Screen', status: 'Pending', detail: 'Appointment scheduled' }
        ]
      };
      setScreenings([mockItem, ...screenings]);
      setShowInitiateModal(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/recruitment/screening/${id}/status`, { status });
      setScreenings(screenings.map(s => s.id === id ? { ...s, status } : s));
      if (selectedReport?.id === id) {
        setSelectedReport({ ...selectedReport, status });
      }
    } catch (err) {
      setScreenings(screenings.map(s => s.id === id ? { ...s, status } : s));
      if (selectedReport?.id === id) {
        setSelectedReport({ ...selectedReport, status });
      }
    }
  };

  const filteredScreenings = screenings.filter(s => {
    const matchesSearch = s.candidateName?.toLowerCase().includes(search.toLowerCase()) ||
                          s.position?.toLowerCase().includes(search.toLowerCase()) ||
                          s.id?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-rose-600" />
            <span>Background Screening & Compliance</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            FCRA-compliant pre-employment verification: identity, criminal records, education & employment history
          </p>
        </div>

        <button
          onClick={() => setShowInitiateModal(true)}
          className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm flex items-center justify-center transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-2" />
          Initiate Background Check
        </button>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <p className="text-xs font-medium text-gray-500">Total Checks</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{screenings.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <p className="text-xs font-medium text-gray-500">Cleared & Verified</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            {screenings.filter(s => s.status === 'Verified').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <p className="text-xs font-medium text-gray-500">In Progress</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {screenings.filter(s => s.status === 'In Progress').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <p className="text-xs font-medium text-gray-500">Flagged For Review</p>
          <p className="text-2xl font-bold text-red-600 mt-1">
            {screenings.filter(s => s.status === 'Flagged').length}
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search candidate or case ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <span className="text-xs text-gray-500 font-medium">Verification Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white text-gray-700"
          >
            <option value="All">All Statuses</option>
            <option value="Verified">Verified (Clear)</option>
            <option value="In Progress">In Progress</option>
            <option value="Flagged">Flagged (Action Needed)</option>
          </select>
        </div>
      </div>

      {/* Verification List */}
      <div className="space-y-4">
        {filteredScreenings.map((s) => {
          const clearedChecks = s.checks?.filter((c: any) => c.status === 'Passed').length || 0;
          const totalChecks = s.checks?.length || 6;
          return (
            <div
              key={s.id}
              className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs hover:border-rose-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                    {s.id}
                  </span>
                  <span className="text-xs font-semibold text-gray-500 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded">
                    {s.provider}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1 ${
                    s.status === 'Verified' ? 'bg-emerald-100 text-emerald-800' :
                    s.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {s.status === 'Verified' ? <CheckCircle2 className="w-3 h-3" /> :
                     s.status === 'In Progress' ? <Clock className="w-3 h-3" /> :
                     <AlertCircle className="w-3 h-3" />}
                    {s.status}
                  </span>
                </div>

                <div className="flex items-baseline gap-2">
                  <h3 className="text-base font-bold text-gray-900">{s.candidateName}</h3>
                  <span className="text-xs text-rose-700 font-semibold">• {s.position}</span>
                </div>

                <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                  <span>Package: <strong className="text-gray-700">{s.packageType}</strong></span>
                  <span>Submitted: {s.submittedDate}</span>
                  {s.completedDate && <span>Completed: {s.completedDate}</span>}
                </div>

                <p className="text-xs text-gray-600 italic bg-gray-50 p-2.5 rounded-lg border border-gray-100 max-w-2xl">
                  {s.notes}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-end sm:items-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100">
                <div className="text-right sm:text-left md:text-right lg:text-left">
                  <span className="text-xs text-gray-400 block">Checks Cleared</span>
                  <span className="text-sm font-bold text-gray-800">
                    {clearedChecks} of {totalChecks} Passed
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(s)}
                    className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    title="Edit Screening Details"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteScreening(s.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                    title="Delete Screening Record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSelectedReport(s)}
                    className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Report</span>
                </button>
                </div>
              </div>
            </div>
          );
        })}
        {filteredScreenings.length === 0 && (
          <div className="bg-white p-12 text-center rounded-xl border border-gray-200">
            <p className="text-sm text-gray-500">No background screening records found. Click 'Initiate Background Check' to start screening.</p>
          </div>
        )}
      </div>

      {/* Edit Screening Modal */}
      {showEditModal && editingScreening && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Edit Verification Case ({editingScreening.id})</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Candidate Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.candidateName}
                    onChange={(e) => setEditForm({ ...editForm, candidateName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Target Position</label>
                  <input
                    type="text"
                    required
                    value={editForm.position}
                    onChange={(e) => setEditForm({ ...editForm, position: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Screening Vendor</label>
                  <select
                    value={editForm.provider}
                    onChange={(e) => setEditForm({ ...editForm, provider: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                  >
                    <option value="Checkr Enterprise">Checkr Enterprise</option>
                    <option value="Sterling Identity">Sterling Identity</option>
                    <option value="First Advantage">First Advantage</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                  >
                    <option value="In Progress">In Progress</option>
                    <option value="Verified">Verified</option>
                    <option value="Discrepancy Flagged">Discrepancy Flagged</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Screening Notes</label>
                <textarea
                  rows={3}
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold shadow-sm"
                >
                  Save Verification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Verification Detailed Report Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start pb-4 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-gray-900">{selectedReport.candidateName}</h3>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase ${
                    selectedReport.status === 'Verified' ? 'bg-emerald-100 text-emerald-800' :
                    selectedReport.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {selectedReport.status}
                  </span>
                </div>
                <p className="text-xs text-rose-700 font-semibold mt-0.5">
                  Position: {selectedReport.position} • {selectedReport.department}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Report ID: {selectedReport.id} • Screening Provider: {selectedReport.provider}
                </p>
              </div>

              <button onClick={() => setSelectedReport(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Checks itemized list */}
            <div className="space-y-3 mt-5">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Verification Components</h4>
              
              {selectedReport.checks?.map((chk: any) => (
                <div key={chk.name} className="p-3 rounded-xl border border-gray-100 bg-gray-50/70 flex items-start justify-between gap-3">
                  <div>
                    <span className="font-bold text-xs text-gray-800 block">{chk.name}</span>
                    <span className="text-[11px] text-gray-500 mt-0.5 block">{chk.detail}</span>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase flex-shrink-0 ${
                    chk.status === 'Passed' ? 'bg-emerald-100 text-emerald-800' :
                    chk.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                    chk.status === 'Pending' ? 'bg-gray-100 text-gray-600' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {chk.status}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-5 p-3.5 bg-rose-50/40 rounded-xl border border-rose-100">
              <h4 className="text-xs font-bold text-rose-900 mb-1">Auditor & Investigator Notes</h4>
              <p className="text-xs text-gray-700">{selectedReport.notes}</p>
            </div>

            <div className="flex flex-wrap justify-between items-center gap-3 pt-6 mt-6 border-t border-gray-100">
              <button
                onClick={() => alert(`Downloading signed verification audit certificate for ${selectedReport.candidateName}`)}
                className="px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-700 flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Download Compliance PDF
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => handleUpdateStatus(selectedReport.id, 'Flagged')}
                  className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Flag Discrepancy
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedReport.id, 'Verified')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  Authorize & Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Initiate Check Modal */}
      {showInitiateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-rose-600" />
                <span>Initiate Background Screening</span>
              </h3>
              <button onClick={() => setShowInitiateModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInitiateSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Candidate Full Name *</label>
                <input
                  type="text"
                  required
                  value={initiateForm.candidateName}
                  onChange={e => setInitiateForm({ ...initiateForm, candidateName: e.target.value })}
                  placeholder="e.g. Devon Martinez"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Position Title</label>
                  <input
                    type="text"
                    value={initiateForm.position}
                    onChange={e => setInitiateForm({ ...initiateForm, position: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Department</label>
                  <select
                    value={initiateForm.department}
                    onChange={e => setInitiateForm({ ...initiateForm, department: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="Product">Product</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Screening Partner</label>
                  <select
                    value={initiateForm.provider}
                    onChange={e => setInitiateForm({ ...initiateForm, provider: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="Checkr Enterprise">Checkr Enterprise</option>
                    <option value="Sterling Talent Solutions">Sterling Talent Solutions</option>
                    <option value="First Advantage">First Advantage</option>
                    <option value="Internal HR Verification">Internal HR Verification</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Verification Package</label>
                  <select
                    value={initiateForm.packageType}
                    onChange={e => setInitiateForm({ ...initiateForm, packageType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="Comprehensive Verification">Comprehensive (6 Checks)</option>
                    <option value="Standard Executive Check">Standard Executive (4 Checks)</option>
                    <option value="Financial Services Premium">Financial Services Premium</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Candidate Consent & Instructions</label>
                <textarea
                  rows={3}
                  value={initiateForm.notes}
                  onChange={e => setInitiateForm({ ...initiateForm, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowInitiateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold shadow-sm"
                >
                  Dispatch Screening Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
