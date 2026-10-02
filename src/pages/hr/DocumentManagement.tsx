import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Pencil,
  FolderLock, 
  Plus, 
  Search, 
  Filter, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Eye, 
  ExternalLink, 
  ShieldCheck, 
  Clock, 
  Calendar, 
  X, 
  Sparkles,
  Download
} from 'lucide-react';
import HRNavigation from '../../components/HRNavigation';

interface DocumentRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  category: string;
  title: string;
  documentNumber: string;
  uploadDate: string;
  expiryDate: string;
  fileUrl: string;
  verified: boolean;
  verifiedBy: string | null;
  verifiedAt: string | null;
  notes: string;
}

export default function DocumentManagement() {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [verifiedFilter, setVerifiedFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDoc, setEditingDoc] = useState<any>(null);
  const [selectedDoc, setSelectedDoc] = useState<DocumentRecord | null>(null);

  // Form
  const [formData, setFormData] = useState({
    employeeName: '',
    category: 'Identification & KYC',
    title: '',
    documentNumber: '',
    expiryDate: '',
    notes: ''
  });

  const categories = [
    'All',
    'Identification & KYC',
    'Educational Credentials',
    'Employment Contract',
    'Visa & Work Permit',
    'Medical & Insurance',
    'Appraisal & Increment'
  ];

  const fetchDocuments = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hr/documents`);
      setDocuments(res.data || []);
    } catch (err) {
      console.error('Failed to fetch documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleOpenEdit = (doc: DocumentRecord) => {
    setEditingDoc({ ...doc });
    setShowEditModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoc) return;
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hr/documents/${editingDoc.id}`, editingDoc);
      setShowEditModal(false);
      setEditingDoc(null);
      fetchDocuments();
    } catch (err) {
      console.error(err);
      alert('Failed to update document metadata');
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hr/documents`, {
        ...formData,
        fileUrl: `https://storage.athenahr.io/vault/${formData.category.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.pdf`
      });
      setShowUploadModal(false);
      setFormData({
        employeeName: '',
        category: 'Identification & KYC',
        title: '',
        documentNumber: '',
        expiryDate: '',
        notes: ''
      });
      fetchDocuments();
    } catch (err) {
      console.error(err);
    }
  };

  const handleVerify = async (id: string, verified: boolean) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hr/documents/${id}/verify`, {
        verified,
        verifiedBy: 'HR Compliance Officer',
        notes: verified ? 'Officially validated with original records' : 'Verification pending resubmission'
      });
      fetchDocuments();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this record from the vault?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hr/documents/${id}`);
      fetchDocuments();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSeedSample = async () => {
    const samples = [
      {
        employeeName: 'Aditi Deshmukh',
        category: 'Identification & KYC',
        title: 'Permanent Account Number (PAN Card)',
        documentNumber: 'ABCDE1234F',
        expiryDate: '',
        notes: 'Original verified against income tax database'
      },
      {
        employeeName: 'Karan Mehra',
        category: 'Visa & Work Permit',
        title: 'Singapore Employment Pass / Visa',
        documentNumber: 'SG-EP-998822',
        expiryDate: new Date(Date.now() + 45 * 86400000).toISOString().split('T')[0],
        notes: 'Requires renewal application by month end'
      },
      {
        employeeName: 'Aarav Patel',
        category: 'Employment Contract',
        title: 'Signed Intellectual Property & Non-Disclosure Agreement',
        documentNumber: 'NDA-ATH-2025-081',
        expiryDate: '2028-12-31',
        notes: 'Digitally executed via DocuSign'
      }
    ];

    for (const item of samples) {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hr/documents`, item);
    }
    fetchDocuments();
  };

  const filteredDocs = documents.filter(doc => {
    const matchesCat = activeCategory === 'All' || doc.category === activeCategory;
    const matchesVerified = verifiedFilter === 'All' || 
                            (verifiedFilter === 'Verified' && doc.verified) || 
                            (verifiedFilter === 'Pending' && !doc.verified);
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.documentNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesVerified && matchesSearch;
  });

  const verifiedCount = documents.filter(d => d.verified).length;
  const pendingCount = documents.filter(d => !d.verified).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top HR Navigation */}
      <HRNavigation />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-teal-50 text-teal-700 rounded-lg">
              <FolderLock className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold text-teal-800 uppercase tracking-wider">Enterprise Document Vault</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Personnel Document Management</h1>
          <p className="text-sm text-gray-500 mt-1 max-w-2xl">
            Centralized digital archival of employee KYC proofs, degree certificates, employment contracts, visas, and appraisal records with statutory audit compliance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {documents.length === 0 && (
            <button
              onClick={handleSeedSample}
              className="px-3.5 py-2 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Simulate Vault Files</span>
            </button>
          )}
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Archived Documents</p>
            <h3 className="text-3xl font-extrabold text-gray-900 mt-1">{documents.length}</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Secure cloud records</p>
          </div>
          <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl">
            <FolderLock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Verified Records</p>
            <h3 className="text-3xl font-extrabold text-emerald-600 mt-1">{verifiedCount}</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Audited by HR compliance</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Awaiting Audit</p>
            <h3 className="text-3xl font-extrabold text-amber-600 mt-1">{pendingCount}</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Requires HR physical verification</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Categories Tracked</p>
            <h3 className="text-3xl font-extrabold text-indigo-600 mt-1">6</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">KYC, Contracts, Visas & Degrees</p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <FileText className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Control Bar: Categories & Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto scrollbar-none text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
                activeCategory === cat
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={verifiedFilter}
            onChange={(e) => setVerifiedFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-teal-500 outline-none"
          >
            <option value="All">All Verification States</option>
            <option value="Verified">Verified Only</option>
            <option value="Pending">Pending Audit</option>
          </select>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents or staff..."
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Document Records Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.length === 0 ? (
          <div className="col-span-3 bg-white p-12 rounded-2xl border border-dashed border-gray-300 text-center">
            <FolderLock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-700">No documents in vault</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              Click "+ Upload Document" or "Simulate Vault Files" to populate personnel files.
            </p>
          </div>
        ) : (
          filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs hover:border-teal-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700">
                    {doc.category}
                  </span>
                  {doc.verified ? (
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Verified
                    </span>
                  ) : (
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-600" />
                      Pending Audit
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-bold text-gray-900 leading-snug">{doc.title}</h4>
                <p className="text-xs text-gray-500 mt-1 font-medium">Employee: <strong className="text-gray-800">{doc.employeeName}</strong></p>

                {doc.documentNumber && (
                  <p className="text-[11px] font-mono text-gray-600 mt-1 bg-gray-50 px-2 py-1 rounded-lg inline-block">
                    Ref: {doc.documentNumber}
                  </p>
                )}

                {doc.expiryDate && (
                  <p className="text-[11px] text-amber-700 font-semibold mt-2 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Expires: {doc.expiryDate}
                  </p>
                )}

                {doc.notes && (
                  <p className="text-[11px] text-gray-400 mt-2 italic">Note: {doc.notes}</p>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview File</span>
                </a>

                <div className="flex items-center gap-1.5">
                  {!doc.verified ? (
                    <button
                      onClick={() => handleVerify(doc.id, true)}
                      className="px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                    >
                      Verify
                    </button>
                  ) : (
                    <button
                      onClick={() => handleVerify(doc.id, false)}
                      className="px-2.5 py-1 text-xs font-medium text-gray-500 hover:text-gray-700 rounded-lg transition-colors"
                    >
                      Unverify
                    </button>
                  )}
                  <button
                    onClick={() => handleOpenEdit(doc)}
                    className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                    title="Edit Metadata"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Document"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* UPLOAD DOCUMENT MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <FolderLock className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-bold text-gray-900">Archive Document to Personnel Vault</h3>
              </div>
              <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Employee Name *</label>
                <input
                  type="text"
                  required
                  value={formData.employeeName}
                  onChange={(e) => setFormData({ ...formData, employeeName: e.target.value })}
                  placeholder="e.g. Aditi Deshmukh"
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none bg-white"
                  >
                    <option value="Identification & KYC">Identification & KYC</option>
                    <option value="Educational Credentials">Educational Credentials</option>
                    <option value="Employment Contract">Employment Contract</option>
                    <option value="Visa & Work Permit">Visa & Work Permit</option>
                    <option value="Medical & Insurance">Medical & Insurance</option>
                    <option value="Appraisal & Increment">Appraisal & Increment</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Document Reference No.</label>
                  <input
                    type="text"
                    value={formData.documentNumber}
                    onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
                    placeholder="e.g. PAN-982173 or PASSPORT-Z"
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Document Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Master of Science Degree Certificate"
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Expiration Date (Optional)</label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Internal HR Notes</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Verification notes or special remarks..."
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  Deposit to Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT DOCUMENT MODAL */}
      {showEditModal && editingDoc && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-teal-50 text-teal-600 rounded-xl">
                  <Pencil className="w-5 h-5" />
                </span>
                <h3 className="text-base font-bold text-gray-900">Edit Vault Document Record</h3>
              </div>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Employee Name *</label>
                <input
                  type="text"
                  required
                  value={editingDoc.employeeName}
                  onChange={(e) => setEditingDoc({ ...editingDoc, employeeName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Category</label>
                  <select
                    value={editingDoc.category}
                    onChange={(e) => setEditingDoc({ ...editingDoc, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none bg-white"
                  >
                    {categories.filter(c => c !== 'All').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Document Reference No.</label>
                  <input
                    type="text"
                    value={editingDoc.documentNumber || ''}
                    onChange={(e) => setEditingDoc({ ...editingDoc, documentNumber: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Document Title *</label>
                <input
                  type="text"
                  required
                  value={editingDoc.title}
                  onChange={(e) => setEditingDoc({ ...editingDoc, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Expiry Date (Optional)</label>
                  <input
                    type="date"
                    value={editingDoc.expiryDate || ''}
                    onChange={(e) => setEditingDoc({ ...editingDoc, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Verification Status</label>
                  <select
                    value={editingDoc.verified ? 'Verified' : 'Pending'}
                    onChange={(e) => setEditingDoc({ ...editingDoc, verified: e.target.value === 'Verified' })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none bg-white"
                  >
                    <option value="Pending">Pending Audit</option>
                    <option value="Verified">Verified Official</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">HR Compliance Notes</label>
                <textarea
                  rows={2}
                  value={editingDoc.notes || ''}
                  onChange={(e) => setEditingDoc({ ...editingDoc, notes: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
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

    </div>
  );
}
