import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Pencil,
  Trash2,
  UserCheck, 
  Plus, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Upload, 
  ShieldCheck, 
  Laptop, 
  Mail, 
  User, 
  Building2, 
  Calendar, 
  PenTool, 
  Eye, 
  Search, 
  Filter, 
  X,
  FileCheck,
  ChevronRight,
  ExternalLink,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import HEMNavigation from '../../components/HEMNavigation';

interface DocumentItem {
  id: string;
  name: string;
  type: string;
  status: 'Pending' | 'Submitted' | 'Verified' | 'Rejected';
  fileUrl: string | null;
  submittedAt: string | null;
  verifiedAt: string | null;
  notes?: string;
}

interface ChecklistItem {
  id: string;
  title: string;
  category: string;
  status: 'Pending' | 'Completed';
  required: boolean;
}

interface OnboardingRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  reportingManager: string;
  buddy: string;
  joiningDate: string;
  welcomeMessage: string;
  employmentType: string;
  status: 'Pre-boarding' | 'Document Verification' | 'IT Setup' | 'Orientation' | 'Completed';
  completionRate: number;
  checklist: ChecklistItem[];
  documents: DocumentItem[];
  eSignature?: {
    signerName: string;
    signatureData: string;
    signedAt: string;
    ipAddress: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export default function Onboarding() {
  const [records, setRecords] = useState<OnboardingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<OnboardingRecord | null>(null);

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingHire, setEditingHire] = useState<any>(null);
  const [showSignModal, setShowSignModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [activeDocToUpload, setActiveDocToUpload] = useState<DocumentItem | null>(null);

  // Form states
  const [newHire, setNewHire] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    department: 'Engineering',
    reportingManager: '',
    buddy: '',
    joiningDate: '',
    employmentType: 'Full-Time',
    welcomeMessage: ''
  });

  const [signatureName, setSignatureName] = useState('');
  const [uploadFileName, setUploadFileName] = useState('');

  const fetchRecords = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hem/onboarding`);
      setRecords(res.data || []);
      if (selectedRecord) {
        const updated = (res.data || []).find((r: OnboardingRecord) => r.id === selectedRecord.id);
        if (updated) setSelectedRecord(updated);
      }
    } catch (err) {
      console.error('Failed to fetch onboarding records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleOpenEditHire = (r: OnboardingRecord, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingHire({ ...r });
    setShowEditModal(true);
  };

  const handleUpdateHire = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHire) return;
    try {
      const res = await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hem/onboarding/${editingHire.id}`, editingHire);
      setShowEditModal(false);
      setEditingHire(null);
      if (selectedRecord?.id === editingHire.id) {
        setSelectedRecord(res.data);
      }
      fetchRecords();
    } catch (err) {
      console.error(err);
      alert('Failed to update onboarding record');
    }
  };

  const handleDeleteHire = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this onboarding record?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hem/onboarding/${id}`);
      if (selectedRecord?.id === id) {
        setSelectedRecord(null);
      }
      fetchRecords();
    } catch (err) {
      console.error(err);
      alert('Failed to delete onboarding record');
    }
  };

  const handleCreateNewHire = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hem/onboarding`, newHire);
      setShowCreateModal(false);
      setNewHire({
        name: '',
        email: '',
        phone: '',
        role: '',
        department: 'Engineering',
        reportingManager: '',
        buddy: '',
        joiningDate: '',
        employmentType: 'Full-Time',
        welcomeMessage: ''
      });
      fetchRecords();
      setSelectedRecord(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleTask = async (taskId: string, currentStatus: string) => {
    if (!selectedRecord) return;
    const newStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
    try {
      const res = await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hem/onboarding/${selectedRecord.id}/task`, {
        taskId,
        status: newStatus
      });
      setSelectedRecord(res.data);
      fetchRecords();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDocVerify = async (docId: string, status: 'Verified' | 'Rejected') => {
    if (!selectedRecord) return;
    try {
      const res = await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hem/onboarding/${selectedRecord.id}/document/${docId}`, {
        status,
        notes: status === 'Verified' ? 'Approved by HR Operations' : 'Document illegible or missing seal. Please re-upload.'
      });
      setSelectedRecord(res.data);
      fetchRecords();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDocUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord || !activeDocToUpload) return;
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hem/onboarding/${selectedRecord.id}/document`, {
        docId: activeDocToUpload.id,
        fileName: uploadFileName || activeDocToUpload.name,
        fileUrl: `https://storage.athenahr.io/documents/${activeDocToUpload.id}_${Date.now()}.pdf`
      });
      setSelectedRecord(res.data);
      setShowUploadModal(false);
      setUploadFileName('');
      fetchRecords();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSignAgreement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord || !signatureName) return;
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hem/onboarding/${selectedRecord.id}/sign`, {
        signerName: signatureName,
        signatureData: `SHA256_ESIGN_${Date.now()}`
      });
      setSelectedRecord(res.data);
      setShowSignModal(false);
      setSignatureName('');
      fetchRecords();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCompleteOnboarding = async (recordId: string) => {
    try {
      const res = await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hem/onboarding/${recordId}/status`, {
        status: 'Completed'
      });
      setSelectedRecord(res.data);
      fetchRecords();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSeedSample = async () => {
    try {
      const sample = {
        name: 'Aarav Patel',
        email: 'aarav.patel@athenahr.io',
        phone: '+91 98765 43210',
        role: 'Full Stack Engineer',
        department: 'Engineering',
        reportingManager: 'Vikram Malhotra',
        buddy: 'Priya Sharma (Senior Lead)',
        joiningDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
        employmentType: 'Full-Time',
        welcomeMessage: 'Excited to have you join our core engineering squad building the next-gen HRMS!'
      };
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hem/onboarding`, sample);
      fetchRecords();
      setSelectedRecord(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered records
  const filteredRecords = records.filter(r => {
    const matchesFilter = activeFilter === 'All' || r.status === activeFilter;
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // KPI computations
  const totalInFlight = records.filter(r => r.status !== 'Completed').length;
  const pendingDocsCount = records.reduce((acc, r) => acc + r.documents.filter(d => d.status === 'Submitted').length, 0);
  const signedOffersCount = records.filter(r => r.eSignature).length;
  const readyToInductCount = records.filter(r => r.status === 'Completed' || r.completionRate >= 80).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top HEM In-Module Navigation */}
      <HEMNavigation />

      {/* Hero Header & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-teal-50 text-teal-700 rounded-lg">
              <UserCheck className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold text-teal-800 uppercase tracking-wider">Digital Employee Experience</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Personalised & Paperless Onboarding</h1>
          <p className="text-sm text-gray-500 mt-1 max-w-2xl">
            Streamline pre-boarding, electronic signatures, document verification vault, and role-specific provisioning without a single sheet of paper.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {records.length === 0 && (
            <button
              onClick={handleSeedSample}
              className="px-3.5 py-2 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Simulate Candidate</span>
            </button>
          )}
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Initiate Onboarding</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">In-Flight Onboarding</p>
            <h3 className="text-3xl font-extrabold text-teal-700 mt-1">{totalInFlight}</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Active candidates in pre-hire</p>
          </div>
          <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Awaiting Verification</p>
            <h3 className="text-3xl font-extrabold text-amber-600 mt-1">{pendingDocsCount}</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Documents pending HR approval</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Paperless e-Signed</p>
            <h3 className="text-3xl font-extrabold text-indigo-600 mt-1">{signedOffersCount}</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Digital employment contracts</p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <PenTool className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Day 1 Ready</p>
            <h3 className="text-3xl font-extrabold text-emerald-600 mt-1">{readyToInductCount}</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Checklist complete for induction</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Workspace: Split into Candidate Queue & Selected Candidate Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Onboarding Queue (4 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900">Onboarding Queue</h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700">
                {filteredRecords.length} Hires
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search candidate, role, or team..."
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none transition-all"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
              {['All', 'Pre-boarding', 'Document Verification', 'IT Setup', 'Completed'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveFilter(tab)}
                  className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    activeFilter === tab
                      ? 'bg-teal-600 text-white font-bold'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Records List */}
          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {filteredRecords.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-dashed border-gray-300 text-center">
                <UserCheck className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-gray-700">No onboarding records found</h4>
                <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                  Click "+ Initiate Onboarding" to add a new hire or "Simulate Candidate" to preview the flow.
                </p>
              </div>
            ) : (
              filteredRecords.map((r) => {
                const isSelected = selectedRecord?.id === r.id;
                return (
                  <div
                    key={r.id}
                    onClick={() => setSelectedRecord(r)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-teal-50/50 border-teal-500 shadow-sm ring-1 ring-teal-500'
                        : 'bg-white border-gray-200/80 hover:border-teal-300 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">{r.name}</h4>
                        <p className="text-xs text-gray-500">{r.role} • {r.department}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          r.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                          r.status === 'Document Verification' ? 'bg-amber-100 text-amber-800' :
                          r.status === 'IT Setup' ? 'bg-blue-100 text-blue-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {r.status}
                        </span>
                        <button
                          onClick={(e) => handleOpenEditHire(r, e)}
                          className="p-1 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                          title="Edit Details"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteHire(r.id, e)}
                          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="flex justify-between items-center text-[10px] text-gray-500 mb-1">
                        <span>Digital Checklist Progress</span>
                        <span className="font-bold text-gray-800">{r.completionRate}%</span>
                      </div>
                      <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            r.completionRate === 100 ? 'bg-emerald-500' : 'bg-teal-600'
                          }`}
                          style={{ width: `${r.completionRate}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        Joining: {r.joiningDate}
                      </span>
                      <span className="flex items-center text-teal-600 font-semibold">
                        View Dossier →
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Selected Candidate Dossier & Paperless Action Workspace (7 cols) */}
        <div className="lg:col-span-7">
          {selectedRecord ? (
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden space-y-6">
              
              {/* Dossier Banner */}
              <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white p-6 relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] uppercase font-bold tracking-widest bg-white/20 text-teal-200 px-2 py-0.5 rounded">
                        ID: {selectedRecord.id}
                      </span>
                      <button
                        onClick={(e) => handleOpenEditHire(selectedRecord, e)}
                        className="px-2 py-0.5 bg-white/20 hover:bg-white/30 text-teal-100 text-[10px] font-bold rounded flex items-center gap-1 transition-colors"
                        title="Edit Candidate Details"
                      >
                        <Pencil className="w-3 h-3" /> Edit
                      </button>
                      <button
                        onClick={(e) => handleDeleteHire(selectedRecord.id, e)}
                        className="px-2 py-0.5 bg-rose-500/40 hover:bg-rose-500/60 text-rose-200 text-[10px] font-bold rounded flex items-center gap-1 transition-colors"
                        title="Delete Record"
                      >
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                      <span className="text-xs text-teal-300 font-medium">Joined {selectedRecord.joiningDate}</span>
                    </div>
                    <h2 className="text-2xl font-extrabold text-white">{selectedRecord.name}</h2>
                    <p className="text-xs text-teal-200/80 mt-0.5">
                      {selectedRecord.role} • {selectedRecord.department} ({selectedRecord.employmentType})
                    </p>
                  </div>

                  <div className="text-right flex flex-col sm:items-end">
                    <div className="text-xs text-teal-200 mb-1 font-medium">Onboarding Milestone</div>
                    <span className="text-2xl font-black text-white">{selectedRecord.completionRate}%</span>
                    <span className="text-[10px] text-teal-300">
                      {selectedRecord.checklist.filter(c => c.status === 'Completed').length}/{selectedRecord.checklist.length} Tasks Done
                    </span>
                  </div>
                </div>

                {/* Progress Strip */}
                <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden mt-4">
                  <div
                    className="bg-emerald-400 h-full transition-all duration-500 rounded-full"
                    style={{ width: `${selectedRecord.completionRate}%` }}
                  />
                </div>
              </div>

              <div className="p-6 space-y-6 pt-0">
                {/* Personalized Welcome Kit & Mentor Pairing */}
                <div className="bg-teal-50/60 p-4 rounded-2xl border border-teal-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-teal-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-teal-600" />
                      Personalised Welcome Message
                    </h4>
                    <p className="text-xs text-teal-800 mt-1 italic">
                      "{selectedRecord.welcomeMessage}"
                    </p>
                    <div className="flex flex-wrap gap-4 mt-2 text-xs text-teal-700">
                      <span><strong>Reporting Manager:</strong> {selectedRecord.reportingManager}</span>
                      <span><strong>Assigned Onboarding Buddy:</strong> {selectedRecord.buddy}</span>
                    </div>
                  </div>

                  {!selectedRecord.eSignature ? (
                    <button
                      onClick={() => setShowSignModal(true)}
                      className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <PenTool className="w-3.5 h-3.5" />
                      <span>e-Sign Agreement</span>
                    </button>
                  ) : (
                    <div className="bg-emerald-100 border border-emerald-300 text-emerald-900 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Signed by {selectedRecord.eSignature.signerName}</span>
                    </div>
                  )}
                </div>

                {/* Section 1: Paperless Document Submission Vault */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                        <FileCheck className="w-4 h-4 text-teal-600" />
                        Paperless Document Verification Vault
                      </h3>
                      <p className="text-xs text-gray-400">Zero-paper digital uploads with instant HR audit verification</p>
                    </div>
                    <span className="text-xs font-bold text-gray-500">
                      {selectedRecord.documents.filter(d => d.status === 'Verified').length}/{selectedRecord.documents.length} Verified
                    </span>
                  </div>

                  <div className="border border-gray-200/80 rounded-xl divide-y divide-gray-100 overflow-hidden">
                    {selectedRecord.documents.map((doc) => (
                      <div key={doc.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white hover:bg-gray-50/60 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg mt-0.5 ${
                            doc.status === 'Verified' ? 'bg-emerald-50 text-emerald-600' :
                            doc.status === 'Submitted' ? 'bg-blue-50 text-blue-600' :
                            doc.status === 'Rejected' ? 'bg-red-50 text-red-600' :
                            'bg-gray-100 text-gray-400'
                          }`}>
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="text-xs font-bold text-gray-800">{doc.name}</h5>
                              <span className="text-[10px] text-gray-400 uppercase font-mono">({doc.type})</span>
                            </div>
                            {doc.fileUrl && (
                              <p className="text-[11px] text-teal-600 font-mono mt-0.5 truncate max-w-xs">
                                📎 {doc.fileUrl}
                              </p>
                            )}
                            {doc.notes && (
                              <p className="text-[11px] text-red-500 mt-0.5">Note: {doc.notes}</p>
                            )}
                          </div>
                        </div>

                        {/* Status & Actions */}
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            doc.status === 'Verified' ? 'bg-emerald-100 text-emerald-800' :
                            doc.status === 'Submitted' ? 'bg-blue-100 text-blue-800' :
                            doc.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {doc.status}
                          </span>

                          {doc.status === 'Pending' || doc.status === 'Rejected' ? (
                            <button
                              onClick={() => {
                                setActiveDocToUpload(doc);
                                setShowUploadModal(true);
                              }}
                              className="px-2.5 py-1 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors flex items-center gap-1"
                            >
                              <Upload className="w-3 h-3" />
                              <span>Upload</span>
                            </button>
                          ) : doc.status === 'Submitted' ? (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleDocVerify(doc.id, 'Verified')}
                                className="px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                              >
                                Verify
                              </button>
                              <button
                                onClick={() => handleDocVerify(doc.id, 'Rejected')}
                                className="px-2.5 py-1 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-emerald-600 font-semibold flex items-center">
                              <CheckCircle2 className="w-3.5 h-3.5 mr-0.5" /> Checked
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 2: Interactive Role-Specific Checklist */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-teal-600" />
                        Role & Provisioning Checklist
                      </h3>
                      <p className="text-xs text-gray-400">Step-by-step digital readiness milestones</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {selectedRecord.checklist.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => toggleTask(task.id, task.status)}
                        className={`p-3 rounded-xl border flex items-center justify-between transition-colors cursor-pointer ${
                          task.status === 'Completed'
                            ? 'bg-emerald-50/40 border-emerald-200'
                            : 'bg-white border-gray-200 hover:border-teal-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={task.status === 'Completed'}
                            onChange={() => {}} // Handled by div click
                            className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500 cursor-pointer"
                          />
                          <div>
                            <p className={`text-xs font-bold ${
                              task.status === 'Completed' ? 'text-gray-500 line-through' : 'text-gray-800'
                            }`}>
                              {task.title}
                            </p>
                            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                              {task.category} • {task.required ? 'Mandatory' : 'Optional'}
                            </span>
                          </div>
                        </div>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          task.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {task.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Finalize Button */}
                {selectedRecord.status !== 'Completed' && (
                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                      When all documents are verified and tasks completed, finalize onboarding to sync with Staff DB.
                    </p>
                    <button
                      onClick={() => handleCompleteOnboarding(selectedRecord.id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Complete & Activate Employee</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center h-full flex flex-col items-center justify-center">
              <UserCheck className="w-12 h-12 text-gray-300 mb-3" />
              <h3 className="text-base font-bold text-gray-700">Select a Candidate from the Queue</h3>
              <p className="text-xs text-gray-400 mt-1 max-w-sm">
                Pick any new hire from the left column to view their digital document vault, execute paperless e-signatures, and track onboarding milestones.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* CREATE NEW HIRE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-gray-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-teal-50 text-teal-700 rounded-xl">
                  <UserCheck className="w-5 h-5" />
                </span>
                <h3 className="text-lg font-bold text-gray-900">Initiate Digital Onboarding</h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewHire} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newHire.name}
                    onChange={(e) => setNewHire({ ...newHire, name: e.target.value })}
                    placeholder="e.g. Ananya Roy"
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Corporate / Personal Email *</label>
                  <input
                    type="email"
                    required
                    value={newHire.email}
                    onChange={(e) => setNewHire({ ...newHire, email: e.target.value })}
                    placeholder="ananya.roy@example.com"
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Job Designation *</label>
                  <input
                    type="text"
                    required
                    value={newHire.role}
                    onChange={(e) => setNewHire({ ...newHire, role: e.target.value })}
                    placeholder="e.g. Senior Product Designer"
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Department</label>
                  <select
                    value={newHire.department}
                    onChange={(e) => setNewHire({ ...newHire, department: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none bg-white"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Product & Design">Product & Design</option>
                    <option value="Sales & Marketing">Sales & Marketing</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Finance & Legal">Finance & Legal</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Reporting Manager</label>
                  <input
                    type="text"
                    value={newHire.reportingManager}
                    onChange={(e) => setNewHire({ ...newHire, reportingManager: e.target.value })}
                    placeholder="e.g. Sandeep Mehra (VP Eng)"
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Assigned Onboarding Buddy</label>
                  <input
                    type="text"
                    value={newHire.buddy}
                    onChange={(e) => setNewHire({ ...newHire, buddy: e.target.value })}
                    placeholder="e.g. Divya Rao (Senior Engineer)"
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Joining Date *</label>
                  <input
                    type="date"
                    required
                    value={newHire.joiningDate}
                    onChange={(e) => setNewHire({ ...newHire, joiningDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Employment Type</label>
                  <select
                    value={newHire.employmentType}
                    onChange={(e) => setNewHire({ ...newHire, employmentType: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none bg-white"
                  >
                    <option value="Full-Time">Full-Time</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Contract / Consultant">Contract / Consultant</option>
                    <option value="Intern">Intern</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Personalised Welcome Message</label>
                <textarea
                  rows={2}
                  value={newHire.welcomeMessage}
                  onChange={(e) => setNewHire({ ...newHire, welcomeMessage: e.target.value })}
                  placeholder="Welcome to Athena HR! We can't wait to work alongside you..."
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  Create & Launch Onboarding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPLOAD DOCUMENT MODAL */}
      {showUploadModal && activeDocToUpload && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Upload {activeDocToUpload.name}</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDocUploadSubmit} className="space-y-4 mt-4">
              <div className="border-2 border-dashed border-teal-200 bg-teal-50/40 p-6 rounded-2xl text-center">
                <Upload className="w-8 h-8 text-teal-600 mx-auto mb-2" />
                <p className="text-xs font-bold text-gray-800">Choose file or drag & drop</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Supports PDF, PNG, JPG up to 15MB</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Document Label / File Title</label>
                <input
                  type="text"
                  value={uploadFileName}
                  onChange={(e) => setUploadFileName(e.target.value)}
                  placeholder={activeDocToUpload.name}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
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
                  Submit for HR Audit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* E-SIGN AGREEMENT MODAL */}
      {showSignModal && selectedRecord && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <PenTool className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-gray-900">Digital Paperless Signature</h3>
              </div>
              <button onClick={() => setShowSignModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSignAgreement} className="space-y-4 mt-4">
              <div className="bg-gray-50 p-4 rounded-xl text-xs text-gray-600 space-y-1.5 border border-gray-100">
                <p className="font-semibold text-gray-800">Employment Contract & Proprietary Information Agreement</p>
                <p>
                  By typing your full legal name below, you confirm that you accept the terms of employment with Athena HR, agree to the NDA terms, and execute this document electronically under the Information Technology Act.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  value={signatureName}
                  onChange={(e) => setSignatureName(e.target.value)}
                  placeholder={selectedRecord.name}
                  className="w-full px-3 py-2 border rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500 outline-none font-serif italic"
                />
              </div>

              <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 text-[11px] text-indigo-700">
                🔒 Cryptographic timestamp & audit hash will be appended automatically.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSignModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  Confirm & Legally e-Sign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ONBOARDING RECORD MODAL */}
      {showEditModal && editingHire && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-teal-50 text-teal-600 rounded-xl">
                  <Pencil className="w-5 h-5" />
                </span>
                <h3 className="text-base font-bold text-gray-900">Edit Onboarding Profile</h3>
              </div>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateHire} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={editingHire.name}
                    onChange={(e) => setEditingHire({ ...editingHire, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={editingHire.email}
                    onChange={(e) => setEditingHire({ ...editingHire, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Phone *</label>
                  <input
                    type="text"
                    required
                    value={editingHire.phone}
                    onChange={(e) => setEditingHire({ ...editingHire, phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Role / Designation *</label>
                  <input
                    type="text"
                    required
                    value={editingHire.role}
                    onChange={(e) => setEditingHire({ ...editingHire, role: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Department</label>
                  <select
                    value={editingHire.department}
                    onChange={(e) => setEditingHire({ ...editingHire, department: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none bg-white"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Product">Product</option>
                    <option value="Design">Design</option>
                    <option value="Operations">Operations</option>
                    <option value="Sales & Marketing">Sales & Marketing</option>
                    <option value="Human Resources">Human Resources</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Joining Date *</label>
                  <input
                    type="date"
                    required
                    value={editingHire.joiningDate}
                    onChange={(e) => setEditingHire({ ...editingHire, joiningDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Reporting Manager</label>
                  <input
                    type="text"
                    value={editingHire.reportingManager}
                    onChange={(e) => setEditingHire({ ...editingHire, reportingManager: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Assigned Buddy</label>
                  <input
                    type="text"
                    value={editingHire.buddy}
                    onChange={(e) => setEditingHire({ ...editingHire, buddy: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Employment Type</label>
                  <select
                    value={editingHire.employmentType}
                    onChange={(e) => setEditingHire({ ...editingHire, employmentType: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none bg-white"
                  >
                    <option value="Full-Time">Full-Time</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Contract">Contract</option>
                    <option value="Intern">Intern</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Stage Status</label>
                  <select
                    value={editingHire.status}
                    onChange={(e) => setEditingHire({ ...editingHire, status: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none bg-white"
                  >
                    <option value="Pre-boarding">Pre-boarding</option>
                    <option value="Document Verification">Document Verification</option>
                    <option value="IT Setup">IT Setup</option>
                    <option value="Orientation">Orientation</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Personalised Welcome Message</label>
                <textarea
                  rows={3}
                  value={editingHire.welcomeMessage}
                  onChange={(e) => setEditingHire({ ...editingHire, welcomeMessage: e.target.value })}
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
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
