import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Pencil,
  Trash2,
  FileSpreadsheet, 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  Sparkles, 
  Eye, 
  X, 
  Clock, 
  Calendar, 
  Check, 
  XCircle, 
  ShieldCheck, 
  BookOpen, 
  ArrowRight,
  ExternalLink,
  Send,
  Building2,
  Users
} from 'lucide-react';
import HRNavigation from '../../components/HRNavigation';

interface CompanyForm {
  id: string;
  name: string;
  category: string;
  description: string;
  format: string;
  pdfUrl: string;
}

interface FormSubmission {
  id: string;
  formId: string;
  formName: string;
  employeeName: string;
  department: string;
  submissionDate: string;
  data: Record<string, any>;
  status: string; // Pending Review, Approved, Rejected
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
}

export default function CompanyPoliciesForms() {
  const [forms, setForms] = useState<CompanyForm[]>([]);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'forms' | 'policies' | 'submissions'>('forms');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showEditSubmissionModal, setShowEditSubmissionModal] = useState(false);
  const [editingSubmission, setEditingSubmission] = useState<any>(null);
  const [selectedFormForSubmit, setSelectedFormForSubmit] = useState<string>('FRM-01');
  const [reviewingSubmission, setReviewingSubmission] = useState<FormSubmission | null>(null);

  // Form State
  const [submitFormData, setSubmitFormData] = useState({
    employeeName: '',
    department: 'Engineering',
    formId: 'FRM-01',
    purposeOrNotes: '',
    claimAmount: '',
    dependentName: '',
    destination: ''
  });

  const companyPolicies = [
    {
      id: 'POL-01',
      title: 'Code of Business Conduct & Ethics Policy',
      category: 'Governance & Ethics',
      version: 'v3.2',
      effectiveDate: 'Jan 2026',
      readTime: '8 min read',
      description: 'Guiding principles regarding conflict of interest, gift policies, data privacy, and workplace integrity.'
    },
    {
      id: 'POL-02',
      title: 'POSH & Anti-Harassment Workplace Charter',
      category: 'Statutory Compliance',
      version: 'v4.0',
      effectiveDate: 'Mar 2026',
      readTime: '6 min read',
      description: 'Zero-tolerance policy on sexual harassment, Internal Complaints Committee (ICC) framework, and investigation procedures.'
    },
    {
      id: 'POL-03',
      title: 'Global Travel, Food & Incidentals Reimbursement Policy',
      category: 'Finance & Operations',
      version: 'v2.5',
      effectiveDate: 'Jun 2026',
      readTime: '5 min read',
      description: 'Eligibility tiers for flights, hotel tariffs, daily allowances, client entertainment expense, and claim timelines.'
    },
    {
      id: 'POL-04',
      title: 'Hybrid Workplace, IT Security & BYOD Policy',
      category: 'Technology & InfoSec',
      version: 'v3.0',
      effectiveDate: 'Aug 2026',
      readTime: '7 min read',
      description: 'Standards for remote workstations, VPN requirements, endpoint encryption, and confidential company asset handling.'
    },
    {
      id: 'POL-05',
      title: 'Comprehensive Annual, Sick & Parental Leave Policy',
      category: 'People Operations',
      version: 'v2.8',
      effectiveDate: 'Jan 2026',
      readTime: '5 min read',
      description: 'Paid time off (PTO) accrual rules, maternity (26 weeks) / paternity benefits, casual leave, and encashment terms.'
    }
  ];

  const fetchFormsAndSubmissions = async () => {
    try {
      const [formsRes, subRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hr/forms`),
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hr/forms/submissions`)
      ]);
      setForms(formsRes.data || []);
      setSubmissions(subRes.data || []);
    } catch (err) {
      console.error('Failed to fetch company forms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFormsAndSubmissions();
  }, []);

  const handleOpenEditSubmission = (sub: FormSubmission) => {
    setEditingSubmission({
      ...sub,
      purposeOrNotes: sub.data?.purposeOrNotes || '',
      claimAmount: sub.data?.claimAmount || '',
      dependentName: sub.data?.dependentName || '',
      destination: sub.data?.destination || ''
    });
    setShowEditSubmissionModal(true);
  };

  const handleUpdateSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubmission) return;
    try {
      const updatedData = {
        ...editingSubmission.data,
        purposeOrNotes: editingSubmission.purposeOrNotes,
        claimAmount: editingSubmission.claimAmount,
        dependentName: editingSubmission.dependentName,
        destination: editingSubmission.destination
      };
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hr/forms/submissions/${editingSubmission.id}`, {
        employeeName: editingSubmission.employeeName,
        department: editingSubmission.department,
        status: editingSubmission.status,
        data: updatedData
      });
      setShowEditSubmissionModal(false);
      setEditingSubmission(null);
      fetchFormsAndSubmissions();
    } catch (err) {
      console.error(err);
      alert('Failed to update submission');
    }
  };

  const handleDeleteSubmission = async (id: string) => {
    if (!window.confirm('Delete this form submission record?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hr/forms/submissions/${id}`);
      fetchFormsAndSubmissions();
    } catch (err) {
      console.error(err);
      alert('Failed to delete submission');
    }
  };

  const handleOpenSubmit = (formId?: string) => {
    if (formId) {
      setSelectedFormForSubmit(formId);
      setSubmitFormData(prev => ({ ...prev, formId }));
    }
    setShowSubmitModal(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formDef = forms.find(f => f.id === submitFormData.formId) || forms[0];
      const payload = {
        formId: formDef?.id || 'FRM-01',
        formName: formDef?.name || 'Standard Form',
        employeeName: submitFormData.employeeName || 'Anonymous Employee',
        department: submitFormData.department,
        submissionData: {
          notes: submitFormData.purposeOrNotes,
          claimAmount: submitFormData.claimAmount,
          dependentName: submitFormData.dependentName,
          destination: submitFormData.destination
        }
      };

      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hr/forms/submissions`, payload);
      setShowSubmitModal(false);
      setSubmitFormData({
        employeeName: '',
        department: 'Engineering',
        formId: 'FRM-01',
        purposeOrNotes: '',
        claimAmount: '',
        dependentName: '',
        destination: ''
      });
      fetchFormsAndSubmissions();
      setActiveTab('submissions');
    } catch (err) {
      console.error('Failed to submit form:', err);
      alert('Failed to submit request form.');
    }
  };

  const handleSimulateSubmission = async (formIdOverride?: string) => {
    try {
      const formDef = forms.find(f => f.id === formIdOverride) || forms[0];
      const sample = {
        formId: formDef?.id || 'FRM-01',
        formName: formDef?.name || 'Form 12BB Declaration',
        employeeName: 'Pooja Iyer',
        department: 'Product Management',
        submissionData: {
          notes: 'Investment declarations for HRA, LIC premium, and NPS Section 80CCD deductions.',
          claimAmount: '1,50,000'
        }
      };
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hr/forms/submissions`, sample);
      fetchFormsAndSubmissions();
      setActiveTab('submissions');
    } catch (err) {
      console.error('Simulation failed:', err);
    }
  };

  const handleUpdateStatus = async (submissionId: string, newStatus: 'Approved' | 'Rejected') => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hr/forms/submissions/${submissionId}/status`, {
        status: newStatus,
        reviewedBy: 'People Operations Lead'
      });
      setReviewingSubmission(null);
      fetchFormsAndSubmissions();
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Failed to update submission status.');
    }
  };

  const filteredSubmissions = submissions.filter(s => {
    const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
    const matchesSearch = 
      s.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.formName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Universal HR Navigation Bar */}
      <HRNavigation />

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-2 bg-blue-500/20 rounded-xl border border-blue-400/30">
                <FileSpreadsheet className="w-5 h-5 text-blue-300" />
              </span>
              <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider">
                Corporate Governance & Self-Service
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                Statutory Verified
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Company Policies & Standard Forms</h1>
            <p className="text-sm text-slate-300 max-w-2xl mt-1">
              Access standard company governance policies, download statutory templates (Form 12BB, NOC, Reimbursements), and review employee digital form requests in one central hub.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleSimulateSubmission()}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Simulate Request</span>
            </button>
            <button
              onClick={() => handleOpenSubmit()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Submit Form Request</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold border border-blue-100">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">{forms.length}</div>
            <div className="text-xs font-medium text-slate-500">Standard Company Forms</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold border border-indigo-100">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">{companyPolicies.length}</div>
            <div className="text-xs font-medium text-slate-500">Official Policy Handbooks</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 font-bold border border-amber-100">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">
              {submissions.filter(s => s.status === 'Pending Review').length}
            </div>
            <div className="text-xs font-medium text-slate-500">Pending Review Requests</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold border border-emerald-100">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">
              {submissions.filter(s => s.status === 'Approved').length}
            </div>
            <div className="text-xs font-medium text-slate-500">Approved Submissions</div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('forms')}
          className={`px-5 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'forms'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Standard Fillable Forms ({forms.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('policies')}
          className={`px-5 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'policies'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Official Company Policies ({companyPolicies.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('submissions')}
          className={`px-5 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'submissions'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Employee Submissions Tracker ({submissions.length})</span>
          {submissions.filter(s => s.status === 'Pending Review').length > 0 && (
            <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full text-[10px] font-bold">
              {submissions.filter(s => s.status === 'Pending Review').length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: STANDARD FORMS */}
      {activeTab === 'forms' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {forms.map((form) => (
            <div
              key={form.id}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-blue-400 hover:shadow-sm transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                    {form.category}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{form.id}</span>
                </div>

                <h3 className="font-bold text-sm text-slate-800 group-hover:text-blue-700 leading-snug mb-1.5">
                  {form.name}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  {form.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => alert(`Downloading statutory PDF template for ${form.name}`)}
                  className="text-xs text-slate-500 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Template PDF</span>
                </button>
                <button
                  onClick={() => handleOpenSubmit(form.id)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors"
                >
                  <span>Fill & Submit</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: COMPANY POLICIES */}
      {activeTab === 'policies' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {companyPolicies.map((pol) => (
              <div
                key={pol.id}
                className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-blue-400 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      {pol.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">{pol.version} • {pol.effectiveDate}</span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-800 mb-1.5 leading-snug">
                    {pol.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">
                    {pol.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {pol.readTime}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => alert(`Opening policy document: ${pol.title}`)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Read Policy</span>
                    </button>
                    <button
                      onClick={() => alert(`Policy acknowledged: ${pol.title}`)}
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors border border-emerald-200"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Acknowledge</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: EMPLOYEE SUBMISSIONS TRACKER */}
      {activeTab === 'submissions' && (
        <div className="space-y-4">
          {/* Submissions Filter Bar */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by Employee, Form Name, ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center gap-2">
                {['All', 'Pending Review', 'Approved', 'Rejected'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                      statusFilter === status
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Submissions Table or Empty State */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-slate-500 text-sm">Loading employee requests...</div>
            ) : filteredSubmissions.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
                  <FileSpreadsheet className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-1">No Form Submissions Yet</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mb-5 leading-relaxed">
                  Employees can submit tax declarations (Form 12BB), travel claims, NOC applications, and dependent medical additions directly through this self-service portal.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => handleSimulateSubmission()}
                    className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-xl text-xs border border-blue-200 flex items-center gap-2 transition-all shadow-xs"
                  >
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>Simulate Sample Submission</span>
                  </button>
                  <button
                    onClick={() => handleOpenSubmit()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-xs transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Submit New Request</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold text-[11px] tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Submission ID & Form</th>
                      <th className="py-3.5 px-4">Employee & Dept</th>
                      <th className="py-3.5 px-4">Date</th>
                      <th className="py-3.5 px-4">Review Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSubmissions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 rounded-xl text-blue-600 border border-blue-100">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">{sub.formName}</div>
                              <div className="text-[11px] text-slate-400 font-mono">{sub.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-800">{sub.employeeName}</div>
                          <div className="text-[11px] text-slate-400">{sub.department}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {sub.submissionDate}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          {sub.status === 'Approved' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Approved
                            </span>
                          ) : sub.status === 'Rejected' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                              <XCircle className="w-3 h-3 text-rose-600" />
                              Rejected
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                              <Clock className="w-3 h-3 text-amber-600" />
                              Pending Review
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEditSubmission(sub)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-slate-200"
                              title="Edit Submission"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteSubmission(sub.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-slate-200"
                              title="Delete Submission"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setReviewingSubmission(sub)}
                              className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg text-xs flex items-center gap-1 transition-colors border border-blue-200"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Review</span>
                            </button>
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

      {/* Submit Form Request Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowSubmitModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Submit HR Request Form</h3>
                <p className="text-xs text-slate-500">Provide details for statutory or administrative processing</p>
              </div>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Form Type *
                </label>
                <select
                  value={submitFormData.formId}
                  onChange={(e) => setSubmitFormData({ ...submitFormData, formId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  required
                >
                  {forms.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Employee Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Priya Sharma"
                    value={submitFormData.employeeName}
                    onChange={(e) => setSubmitFormData({ ...submitFormData, employeeName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Department *
                  </label>
                  <select
                    value={submitFormData.department}
                    onChange={(e) => setSubmitFormData({ ...submitFormData, department: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Product & Design">Product & Design</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales & Growth">Sales & Growth</option>
                    <option value="People & Culture">People & Culture</option>
                    <option value="Finance & Legal">Finance & Legal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Declaration / Expense Amount / Specific Details
                </label>
                <input
                  type="text"
                  placeholder="e.g. Total Claim ₹18,400 or Spouse Name for Mediclaim"
                  value={submitFormData.claimAmount}
                  onChange={(e) => setSubmitFormData({ ...submitFormData, claimAmount: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Justification / Purpose / Notes *
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe your request or provide itemized expense / declaration details..."
                  value={submitFormData.purposeOrNotes}
                  onChange={(e) => setSubmitFormData({ ...submitFormData, purposeOrNotes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Request</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Submission Modal */}
      {reviewingSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setReviewingSubmission(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                  {reviewingSubmission.id}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">{reviewingSubmission.formName}</h3>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-600 mb-5">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Employee</span>
                  <span className="font-bold text-slate-800">{reviewingSubmission.employeeName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Department</span>
                  <span className="font-bold text-slate-800">{reviewingSubmission.department}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Submission Date</span>
                  <span className="font-bold text-slate-800">{reviewingSubmission.submissionDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Current Status</span>
                  <span className="font-bold text-slate-800">{reviewingSubmission.status}</span>
                </div>
              </div>

              {reviewingSubmission.data?.claimAmount && (
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold mb-1">Declared / Claimed Amount</span>
                  <div className="p-2.5 bg-blue-50/50 border border-blue-100 rounded-xl text-blue-900 font-semibold">
                    {reviewingSubmission.data.claimAmount}
                  </div>
                </div>
              )}

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold mb-1">Employee Notes / Submission Data</span>
                <p className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {reviewingSubmission.data?.notes || 'No extra notes provided.'}
                </p>
              </div>

              {reviewingSubmission.reviewedBy && (
                <div className="text-[11px] text-slate-400 pt-1">
                  Reviewed by <span className="font-semibold text-slate-600">{reviewingSubmission.reviewedBy}</span> on {new Date(reviewingSubmission.reviewedAt || '').toLocaleDateString()}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                onClick={() => setReviewingSubmission(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleUpdateStatus(reviewingSubmission.id, 'Rejected')}
                  className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-rose-200"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject</span>
                </button>
                <button
                  onClick={() => handleUpdateStatus(reviewingSubmission.id, 'Approved')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve Request</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* EDIT SUBMISSION MODAL */}
      {showEditSubmissionModal && editingSubmission && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Pencil className="w-5 h-5" />
                </span>
                <h3 className="text-base font-bold text-slate-900">Edit Form Submission</h3>
              </div>
              <button onClick={() => setShowEditSubmissionModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmission} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Employee Name *</label>
                  <input
                    type="text"
                    required
                    value={editingSubmission.employeeName}
                    onChange={(e) => setEditingSubmission({ ...editingSubmission, employeeName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                  <select
                    value={editingSubmission.department}
                    onChange={(e) => setEditingSubmission({ ...editingSubmission, department: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Product">Product</option>
                    <option value="Design">Design</option>
                    <option value="Operations">Operations</option>
                    <option value="Sales">Sales</option>
                    <option value="Human Resources">Human Resources</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Purpose / Notes / Justification</label>
                <textarea
                  rows={2}
                  value={editingSubmission.purposeOrNotes}
                  onChange={(e) => setEditingSubmission({ ...editingSubmission, purposeOrNotes: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Claim Amount</label>
                  <input
                    type="text"
                    value={editingSubmission.claimAmount}
                    onChange={(e) => setEditingSubmission({ ...editingSubmission, claimAmount: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Dependent / Nominee</label>
                  <input
                    type="text"
                    value={editingSubmission.dependentName}
                    onChange={(e) => setEditingSubmission({ ...editingSubmission, dependentName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Destination</label>
                  <input
                    type="text"
                    value={editingSubmission.destination}
                    onChange={(e) => setEditingSubmission({ ...editingSubmission, destination: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Approval Status</label>
                <select
                  value={editingSubmission.status}
                  onChange={(e) => setEditingSubmission({ ...editingSubmission, status: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="Pending Review">Pending Review</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditSubmissionModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  Save Submission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
