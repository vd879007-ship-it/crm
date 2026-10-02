import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Award, Plus, Search, Filter, CheckCircle2, Clock, Pencil, Trash2, 
  DollarSign, Calendar, Eye, Download, Send, X, FileText, 
  Building2, UserCheck, ShieldCheck
} from 'lucide-react';

export default function OfferLetters() {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState<any>(null);
  const [editOfferForm, setEditOfferForm] = useState({
    candidateName: '',
    requisitionId: 'REQ-2026-001',
    positionTitle: 'Senior Full Stack Engineer',
    department: 'Engineering',
    hiringManager: 'Alex Chen',
    baseSalary: 165000,
    signOnBonus: 15000,
    annualBonusPercentage: 10,
    equityShares: 8000,
    startDate: '',
    expirationDate: '',
    benefitsSummary: '',
    status: 'Sent'
  });

  const handleOpenEdit = (o: any) => {
    setEditingOffer(o);
    setEditOfferForm({
      candidateName: o.candidateName || '',
      requisitionId: o.requisitionId || 'REQ-2026-001',
      positionTitle: o.positionTitle || 'Senior Full Stack Engineer',
      department: o.department || 'Engineering',
      hiringManager: o.hiringManager || 'Alex Chen',
      baseSalary: o.baseSalary || 165000,
      signOnBonus: o.signOnBonus || 0,
      annualBonusPercentage: o.annualBonusPercentage || 10,
      equityShares: o.equityShares || 5000,
      startDate: o.startDate || '',
      expirationDate: o.expirationDate || '',
      benefitsSummary: o.benefitsSummary || '',
      status: o.status || 'Sent'
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOffer) return;
    try {
      const res = await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/recruitment/offers/${editingOffer.id}`, editOfferForm);
      setOffers(offers.map(o => o.id === editingOffer.id ? res.data : o));
      setShowEditModal(false);
    } catch (err) {
      setOffers(offers.map(o => o.id === editingOffer.id ? { ...o, ...editOfferForm } : o));
      setShowEditModal(false);
    }
  };

  const handleDeleteOffer = async (id: string) => {
    if (!confirm('Are you sure you want to delete this offer letter?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/recruitment/offers/${id}`);
      setOffers(offers.filter(o => o.id !== id));
      if (selectedOffer?.id === id) setSelectedOffer(null);
    } catch (err) {
      setOffers(offers.filter(o => o.id !== id));
      if (selectedOffer?.id === id) setSelectedOffer(null);
    }
  };

  const [createForm, setCreateForm] = useState({
    candidateName: '',
    requisitionId: 'REQ-2026-001',
    positionTitle: 'Senior Full Stack Engineer',
    department: 'Engineering',
    hiringManager: 'Alex Chen',
    baseSalary: 165000,
    signOnBonus: 15000,
    annualBonusPercentage: 10,
    equityShares: 8000,
    startDate: '2026-10-15',
    expirationDate: '2026-10-05',
    benefitsSummary: 'Tier 1 Comprehensive PPO Healthcare, 401(k) 6% Match, Unlimited PTO, $4,000 Annual Learning Budget, Home Office Setup Allowance.'
  });

  const fetchOffers = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/recruitment/offers`);
      setOffers(res.data);
    } catch (err) {
      console.error(err);
      setOffers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/recruitment/offers`, createForm);
      setOffers([res.data, ...offers]);
      setShowCreateModal(false);
      setSelectedOffer(res.data);
    } catch (err) {
      const mockOffer = {
        id: `OFF-2026-${String(offers.length + 45).padStart(3, '0')}`,
        ...createForm,
        status: 'Sent',
        createdDate: new Date().toISOString().split('T')[0],
        eSignatureTrackingId: `DS-${Math.floor(1000000 + Math.random() * 9000000)}`,
        signedDate: null
      };
      setOffers([mockOffer, ...offers]);
      setShowCreateModal(false);
      setSelectedOffer(mockOffer);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/recruitment/offers/${id}/status`, { status });
      setOffers(offers.map(o => o.id === id ? { ...o, status, signedDate: status === 'Accepted' ? new Date().toISOString().split('T')[0] : o.signedDate } : o));
      if (selectedOffer?.id === id) {
        setSelectedOffer({ ...selectedOffer, status, signedDate: status === 'Accepted' ? new Date().toISOString().split('T')[0] : selectedOffer.signedDate });
      }
    } catch (err) {
      setOffers(offers.map(o => o.id === id ? { ...o, status, signedDate: status === 'Accepted' ? new Date().toISOString().split('T')[0] : o.signedDate } : o));
      if (selectedOffer?.id === id) {
        setSelectedOffer({ ...selectedOffer, status, signedDate: status === 'Accepted' ? new Date().toISOString().split('T')[0] : selectedOffer.signedDate });
      }
    }
  };

  const filteredOffers = offers.filter(o => {
    const matchesSearch = o.candidateName?.toLowerCase().includes(search.toLowerCase()) ||
                          o.positionTitle?.toLowerCase().includes(search.toLowerCase()) ||
                          o.id?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Award className="w-6 h-6 text-cyan-600" />
            <span>Offer Letter & Compensation Management</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Generate formal employment offers, track e-signatures, and calculate total compensation packages
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm flex items-center justify-center transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-2" />
          Generate New Offer
        </button>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <p className="text-xs font-medium text-gray-500">Offers Extended</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{offers.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <p className="text-xs font-medium text-gray-500">Accepted & Signed</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            {offers.filter(o => o.status === 'Accepted').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <p className="text-xs font-medium text-gray-500">Awaiting Signature</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {offers.filter(o => o.status === 'Sent').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <p className="text-xs font-medium text-gray-500">Acceptance Rate</p>
          <p className="text-2xl font-bold text-cyan-700 mt-1">
            {offers.length > 0 ? Math.round((offers.filter(o => o.status === 'Accepted').length / offers.length) * 100) : 0}%
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search candidate or position..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <span className="text-xs text-gray-500 font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white text-gray-700"
          >
            <option value="All">All Statuses</option>
            <option value="Sent">Sent (Out for Signature)</option>
            <option value="Accepted">Accepted & Signed</option>
            <option value="Draft">Draft</option>
            <option value="Declined">Declined</option>
          </select>
        </div>
      </div>

      {/* Offers Cards */}
      <div className="space-y-4">
        {filteredOffers.map((o) => {
          const totalFirstYear = o.baseSalary + (o.signOnBonus || 0) + (o.baseSalary * (o.annualBonusPercentage || 0) / 100);
          return (
            <div
              key={o.id}
              className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs hover:border-cyan-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                    {o.id}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1 ${
                    o.status === 'Accepted' ? 'bg-emerald-100 text-emerald-800' :
                    o.status === 'Sent' ? 'bg-blue-100 text-blue-800' :
                    o.status === 'Draft' ? 'bg-gray-100 text-gray-700' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {o.status === 'Accepted' && <CheckCircle2 className="w-3 h-3" />}
                    {o.status === 'Sent' && <Clock className="w-3 h-3" />}
                    {o.status}
                  </span>
                  {o.eSignatureTrackingId && (
                    <span className="text-[10px] text-gray-400 font-mono">DocuSign: {o.eSignatureTrackingId}</span>
                  )}
                </div>

                <div className="flex items-baseline gap-2">
                  <h3 className="text-base font-bold text-gray-900">{o.candidateName}</h3>
                  <span className="text-xs text-cyan-700 font-semibold">• {o.positionTitle}</span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
                  <span className="font-bold text-emerald-700 text-sm">
                    ${(o.baseSalary / 1000).toFixed(0)}k Base
                  </span>
                  {o.signOnBonus > 0 && (
                    <span className="text-gray-500">
                      +${(o.signOnBonus / 1000).toFixed(0)}k Signing Bonus
                    </span>
                  )}
                  {o.annualBonusPercentage > 0 && (
                    <span className="text-gray-500">
                      +{o.annualBonusPercentage}% Incentive
                    </span>
                  )}
                  {o.equityShares > 0 && (
                    <span className="text-purple-700 font-semibold">
                      {o.equityShares?.toLocaleString()} ISO Shares
                    </span>
                  )}
                  <span className="text-gray-400">
                    Est. Year 1 Total: <strong>${Math.round(totalFirstYear).toLocaleString()}</strong>
                  </span>
                </div>

                <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                  <span>Start Date: <strong>{o.startDate}</strong></span>
                  <span>Offer Expiry: <strong>{o.expirationDate}</strong></span>
                  <span>Hiring Mgr: <strong>{o.hiringManager}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100">
                <button
                  onClick={() => handleOpenEdit(o)}
                  className="p-2 text-gray-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-xl transition-colors cursor-pointer"
                  title="Edit Offer Details"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteOffer(o.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                  title="Delete Offer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedOffer(o)}
                  className="px-3.5 py-2 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Official Letter</span>
                </button>

                {o.status !== 'Accepted' && (
                  <button
                    onClick={() => handleStatusChange(o.id, 'Accepted')}
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                    title="Mark Candidate as Accepted"
                  >
                    Accept
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {filteredOffers.length === 0 && (
          <div className="bg-white p-12 text-center rounded-xl border border-gray-200">
            <p className="text-sm text-gray-500">No offer letters found. Click 'Generate New Offer' to create a candidate offer.</p>
          </div>
        )}
      </div>

      {/* Edit Offer Modal */}
      {showEditModal && editingOffer && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Edit Offer Package ({editingOffer.id})</h3>
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
                    value={editOfferForm.candidateName}
                    onChange={(e) => setEditOfferForm({ ...editOfferForm, candidateName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Position Title</label>
                  <input
                    type="text"
                    required
                    value={editOfferForm.positionTitle}
                    onChange={(e) => setEditOfferForm({ ...editOfferForm, positionTitle: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Base Salary ($)</label>
                  <input
                    type="number"
                    value={editOfferForm.baseSalary}
                    onChange={(e) => setEditOfferForm({ ...editOfferForm, baseSalary: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Sign-on Bonus ($)</label>
                  <input
                    type="number"
                    value={editOfferForm.signOnBonus}
                    onChange={(e) => setEditOfferForm({ ...editOfferForm, signOnBonus: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Equity Shares</label>
                  <input
                    type="number"
                    value={editOfferForm.equityShares}
                    onChange={(e) => setEditOfferForm({ ...editOfferForm, equityShares: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={editOfferForm.startDate}
                    onChange={(e) => setEditOfferForm({ ...editOfferForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Offer Expiration Date</label>
                  <input
                    type="date"
                    value={editOfferForm.expirationDate}
                    onChange={(e) => setEditOfferForm({ ...editOfferForm, expirationDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Offer Status</label>
                <select
                  value={editOfferForm.status}
                  onChange={(e) => setEditOfferForm({ ...editOfferForm, status: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                >
                  <option value="Draft">Draft</option>
                  <option value="Sent">Sent</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Declined">Declined</option>
                </select>
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
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-sm font-bold shadow-sm"
                >
                  Save Offer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Branded Offer Letter Document Modal */}
      {selectedOffer && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto p-8 relative font-serif">
            {/* Action Bar Header */}
            <div className="flex justify-between items-center pb-4 mb-6 border-b border-gray-200 font-sans">
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                selectedOffer.status === 'Accepted' ? 'bg-emerald-100 text-emerald-800' :
                selectedOffer.status === 'Sent' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-700'
              }`}>
                Offer Status: {selectedOffer.status}
              </span>

              <button 
                onClick={() => setSelectedOffer(null)}
                className="text-gray-400 hover:text-gray-600 p-1 font-sans"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Letter Content */}
            <div className="space-y-6 text-gray-800 leading-relaxed text-sm">
              {/* Header Letterhead */}
              <div className="flex justify-between items-start border-b border-gray-300 pb-5">
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-blue-900 font-sans">ATHENA HR ENTERPRISE</h1>
                  <p className="text-xs text-gray-500 font-sans">Global Talent & Human Capital Operations</p>
                  <p className="text-xs text-gray-400 font-sans">100 Innovation Way, Suite 400 • San Francisco, CA</p>
                </div>
                <div className="text-right text-xs text-gray-500 font-sans">
                  <p>Date: {selectedOffer.createdDate}</p>
                  <p className="font-mono text-gray-400">Offer Ref: {selectedOffer.id}</p>
                </div>
              </div>

              {/* Salutation */}
              <div>
                <p className="font-sans font-bold text-gray-900">PRIVATE & CONFIDENTIAL</p>
                <p className="mt-2">Dear {selectedOffer.candidateName},</p>
                <p className="mt-2">
                  On behalf of <strong>Athena HR</strong>, we are delighted to offer you the full-time position of <strong>{selectedOffer.positionTitle}</strong> in the {selectedOffer.department} Department, reporting directly to {selectedOffer.hiringManager}.
                </p>
              </div>

              {/* Key Terms Table */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 font-sans text-xs">
                <h4 className="font-bold text-gray-900 uppercase tracking-wider mb-3 text-[11px]">
                  Summary of Compensation & Benefits
                </h4>
                <div className="grid grid-cols-2 gap-y-2.5">
                  <span className="text-gray-500">Annual Base Salary:</span>
                  <span className="font-bold text-gray-900">${selectedOffer.baseSalary?.toLocaleString()} USD per annum</span>

                  <span className="text-gray-500">Signing Bonus:</span>
                  <span className="font-bold text-gray-900">${selectedOffer.signOnBonus?.toLocaleString()} USD</span>

                  <span className="text-gray-500">Performance Incentive:</span>
                  <span className="font-bold text-gray-900">{selectedOffer.annualBonusPercentage}% Target Annual Bonus</span>

                  <span className="text-gray-500">Equity Incentive:</span>
                  <span className="font-bold text-purple-700">{selectedOffer.equityShares?.toLocaleString()} Stock Options (4-year vesting, 1-year cliff)</span>

                  <span className="text-gray-500">Anticipated Start Date:</span>
                  <span className="font-bold text-gray-900">{selectedOffer.startDate}</span>

                  <span className="text-gray-500">Offer Expiration Date:</span>
                  <span className="font-bold text-red-600">{selectedOffer.expirationDate}</span>
                </div>
              </div>

              <div>
                <h4 className="font-sans font-bold text-gray-900 text-xs uppercase tracking-wider mb-1">
                  Health & Comprehensive Benefits
                </h4>
                <p className="text-xs text-gray-600 font-sans">
                  {selectedOffer.benefitsSummary}
                </p>
              </div>

              {/* Signatures */}
              <div className="pt-6 border-t border-gray-200 grid grid-cols-2 gap-8 font-sans">
                <div>
                  <p className="text-xs text-gray-400">Authorized Company Signatory:</p>
                  <p className="font-bold text-sm text-gray-900 mt-3 font-serif italic text-blue-900">Marcus Vance</p>
                  <div className="w-48 h-0.5 bg-gray-300 mt-1" />
                  <p className="text-[11px] text-gray-500 mt-1">Marcus Vance, VP Human Resources</p>
                </div>

                <div>
                  <p className="text-xs text-gray-400">Candidate Acceptance:</p>
                  {selectedOffer.status === 'Accepted' ? (
                    <div className="mt-2">
                      <p className="font-bold text-sm text-emerald-800 font-serif italic">{selectedOffer.candidateName}</p>
                      <div className="w-48 h-0.5 bg-emerald-500 mt-1" />
                      <p className="text-[10px] text-emerald-700 mt-1 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Signed on {selectedOffer.signedDate || '2026-09-12'}
                      </p>
                    </div>
                  ) : (
                    <div className="mt-4">
                      <div className="w-48 h-0.5 bg-gray-300" />
                      <p className="text-[11px] text-gray-400 mt-1">Pending Candidate Signature</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex flex-wrap justify-between items-center gap-3 pt-6 mt-8 border-t border-gray-200 font-sans">
              <button
                onClick={() => alert(`Downloading signed offer letter PDF for ${selectedOffer.candidateName}`)}
                className="px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-700 flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Download Official PDF
              </button>

              <div className="flex gap-2">
                {selectedOffer.status !== 'Accepted' && (
                  <button
                    onClick={() => {
                      alert(`Sent DocuSign invitation to ${selectedOffer.candidateName}!`);
                      handleStatusChange(selectedOffer.id, 'Sent');
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" /> Send via DocuSign
                  </button>
                )}

                {selectedOffer.status !== 'Accepted' && (
                  <button
                    onClick={() => handleStatusChange(selectedOffer.id, 'Accepted')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Mark as Accepted
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Offer Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-cyan-600" />
                <span>Generate Official Offer Letter</span>
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Candidate Name *</label>
                  <input
                    type="text"
                    required
                    value={createForm.candidateName}
                    onChange={e => setCreateForm({ ...createForm, candidateName: e.target.value })}
                    placeholder="e.g. Devon Martinez"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Position Title *</label>
                  <input
                    type="text"
                    required
                    value={createForm.positionTitle}
                    onChange={e => setCreateForm({ ...createForm, positionTitle: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Department</label>
                  <select
                    value={createForm.department}
                    onChange={e => setCreateForm({ ...createForm, department: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
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
                    value={createForm.hiringManager}
                    onChange={e => setCreateForm({ ...createForm, hiringManager: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Base Salary ($/yr) *</label>
                  <input
                    type="number"
                    required
                    value={createForm.baseSalary}
                    onChange={e => setCreateForm({ ...createForm, baseSalary: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Signing Bonus ($)</label>
                  <input
                    type="number"
                    value={createForm.signOnBonus}
                    onChange={e => setCreateForm({ ...createForm, signOnBonus: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Equity Shares (ISO)</label>
                  <input
                    type="number"
                    value={createForm.equityShares}
                    onChange={e => setCreateForm({ ...createForm, equityShares: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Target Start Date</label>
                  <input
                    type="date"
                    required
                    value={createForm.startDate}
                    onChange={e => setCreateForm({ ...createForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Offer Expiration Date</label>
                  <input
                    type="date"
                    required
                    value={createForm.expirationDate}
                    onChange={e => setCreateForm({ ...createForm, expirationDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Benefits & Perks Summary</label>
                <textarea
                  rows={3}
                  value={createForm.benefitsSummary}
                  onChange={e => setCreateForm({ ...createForm, benefitsSummary: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-sm font-bold shadow-sm"
                >
                  Create & Preview Offer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
