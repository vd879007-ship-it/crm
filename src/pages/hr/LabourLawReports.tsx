import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Scale, 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  Calendar, 
  Clock, 
  Building2, 
  ShieldCheck, 
  Sparkles, 
  X, 
  FileSpreadsheet, 
  Eye, 
  Info,
  HelpCircle,
  FileCheck2,
  Pencil,
  Trash2
} from 'lucide-react';
import HRNavigation from '../../components/HRNavigation';

interface StatutoryReport {
  id: string;
  actType: string;
  period: string;
  state: string;
  complianceStatus: string;
  generatedDate: string;
  filingDeadline: string;
  recordsAudited: number;
  fileDownloadUrl: string;
  comments: string;
  createdAt: string;
}

export default function LabourLawReports() {
  const [reports, setReports] = useState<StatutoryReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedActFilter, setSelectedActFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<StatutoryReport | null>(null);

  // Edit State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingReport, setEditingReport] = useState<StatutoryReport | null>(null);
  const [editForm, setEditForm] = useState({
    actType: '',
    period: '',
    state: '',
    recordsAudited: 0,
    filingDeadline: '',
    complianceStatus: 'Compliant & Audit Ready',
    comments: ''
  });

  // Form State
  const [formData, setFormData] = useState({
    actType: "Employees' Provident Fund (EPFO / ECR)",
    period: 'September 2026',
    state: 'All States / Pan-India',
    comments: ''
  });

  const statutoryActsList = [
    {
      name: "Employees' Provident Fund (EPFO / ECR)",
      code: 'EPF Act, 1952',
      periodicity: 'Monthly (15th)',
      description: 'Electronic Challan cum Return (ECR), Form 12A, Form 5 & 10 member reconciliation.'
    },
    {
      name: "Employees' State Insurance (ESIC Form 6)",
      code: 'ESI Act, 1948',
      periodicity: 'Monthly (15th) & Half-Yearly',
      description: 'Monthly contribution challans and Form 6 half-yearly register of covered employees.'
    },
    {
      name: 'Payment of Gratuity Act 1972 Compliance',
      code: 'Gratuity Act, 1972',
      periodicity: 'Annual / Actuarial',
      description: 'Actuarial liability valuation, Form F nomination register, and continuous service audits.'
    },
    {
      name: 'Minimum Wages & Muster Roll Register (Form I/II)',
      code: 'Min. Wages Act, 1948',
      periodicity: 'Monthly & Annual',
      description: 'Wage slip register, overtime register Form IV, and wage ceiling benchmark audits.'
    },
    {
      name: 'Payment of Bonus Act (Form A, B & C)',
      code: 'Bonus Act, 1965',
      periodicity: 'Annual (Form D by Nov 30)',
      description: 'Computation of allocable surplus, bonus entitlement register, and Form C dispatch summary.'
    },
    {
      name: 'Maternity Benefit Act 1961 Compliance Register',
      code: 'Maternity Act, 1961',
      periodicity: 'Continuous / Annual',
      description: 'Muster roll of female employees, benefit disbursement log, and creche facility audit.'
    },
    {
      name: 'POSH Act 2013 - Annual Committee Report',
      code: 'POSH Act, 2013',
      periodicity: 'Annual (Jan 31)',
      description: 'Internal Committee (IC) composition, complaints redressal register, and District Officer report.'
    },
    {
      name: 'State Professional Tax (PT Form 5 / Return)',
      code: 'State PT Acts',
      periodicity: 'Monthly (20th)',
      description: 'State-wise monthly PT deduction challan and certificate of deduction records.'
    }
  ];

  const fetchReports = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hr/labour-law-reports`);
      setReports(res.data || []);
    } catch (err) {
      console.error('Failed to fetch statutory reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hr/labour-law-reports/generate`, formData);
      setShowGenerateModal(false);
      setFormData({
        actType: "Employees' Provident Fund (EPFO / ECR)",
        period: 'September 2026',
        state: 'All States / Pan-India',
        comments: ''
      });
      fetchReports();
    } catch (err) {
      console.error('Failed to generate report:', err);
      alert('Failed to generate statutory report.');
    }
  };

  const handleSimulateReport = async (actOverride?: string) => {
    try {
      const sample = {
        actType: actOverride || "Employees' Provident Fund (EPFO / ECR)",
        period: 'September 2026',
        state: 'Pan-India / All Locations',
        comments: 'Automated statutory reconciliation generated for monthly compliance auditing.'
      };
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hr/labour-law-reports/generate`, sample);
      fetchReports();
    } catch (err) {
      console.error('Simulation failed:', err);
    }
  };

  const openEditModal = (report: StatutoryReport) => {
    setEditingReport(report);
    setEditForm({
      actType: report.actType || '',
      period: report.period || '',
      state: report.state || '',
      recordsAudited: report.recordsAudited || 0,
      filingDeadline: report.filingDeadline || '',
      complianceStatus: report.complianceStatus || 'Compliant & Audit Ready',
      comments: report.comments || ''
    });
    setShowEditModal(true);
  };

  const handleUpdateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReport) return;
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hr/labour-law-reports/${editingReport.id}`, {
        ...editForm,
        recordsAudited: Number(editForm.recordsAudited)
      });
      setShowEditModal(false);
      setEditingReport(null);
      fetchReports();
    } catch (err) {
      console.error(err);
      alert('Failed to update statutory report');
    }
  };

  const handleDeleteReport = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this statutory report?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hr/labour-law-reports/${id}`);
      fetchReports();
    } catch (err) {
      console.error(err);
      alert('Failed to delete statutory report');
    }
  };

  const filteredReports = reports.filter(r => {
    const matchesAct = selectedActFilter === 'All' || r.actType.toLowerCase().includes(selectedActFilter.toLowerCase());
    const matchesSearch = 
      r.actType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.period.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesAct && matchesSearch;
  });

  const exportComplianceRegisterCSV = () => {
    if (reports.length === 0) {
      alert('No statutory filings available to export.');
      return;
    }
    const headers = ['Report ID', 'Statutory Act', 'Period', 'Jurisdiction/State', 'Status', 'Generated Date', 'Filing Deadline', 'Audited Records'];
    const rows = reports.map(r => [
      r.id,
      `"${r.actType.replace(/"/g, '""')}"`,
      r.period,
      `"${r.state}"`,
      r.complianceStatus,
      r.generatedDate,
      r.filingDeadline,
      r.recordsAudited
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AthenaHR_Statutory_Compliance_Register_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Universal HR Navigation Bar */}
      <HRNavigation />

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-2 bg-blue-500/20 rounded-xl border border-blue-400/30">
                <Scale className="w-5 h-5 text-blue-300" />
              </span>
              <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider">
                Corporate Governance & Statutory Framework
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                100% Audit Ready
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Extensive Labour & Law Reports</h1>
            <p className="text-sm text-slate-300 max-w-2xl mt-1">
              Automate statutory labor law returns and compliance registers for EPFO, ESIC, Gratuity, Minimum Wages, Bonus, POSH, and state professional taxes with verified audit trails.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleSimulateReport()}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
              title="Generate a sample statutory filing immediately"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Simulate Sample Filing</span>
            </button>
            <button
              onClick={exportComplianceRegisterCSV}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Download className="w-4 h-4 text-blue-300" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => setShowGenerateModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Generate Statutory Return</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold border border-blue-100">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">{reports.length}</div>
            <div className="text-xs font-medium text-slate-500">Total Statutory Filings</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold border border-emerald-100">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">
              {reports.filter(r => r.complianceStatus.includes('Compliant')).length}
            </div>
            <div className="text-xs font-medium text-slate-500">Audit-Ready Filings</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 font-bold border border-purple-100">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">September 2026</div>
            <div className="text-xs font-medium text-slate-500">Active Filing Period</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 font-bold border border-amber-100">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">8 Primary Acts</div>
            <div className="text-xs font-medium text-slate-500">Statutory Frameworks</div>
          </div>
        </div>
      </div>

      {/* Statutory Compliance Calendar & Mandatory Acts Overview */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-800 text-sm">Statutory Labour Law Calendar & Acts Framework</h3>
          </div>
          <span className="text-xs text-slate-500">Click any act to quick-generate</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {statutoryActsList.map((act, index) => (
            <div 
              key={index}
              onClick={() => handleSimulateReport(act.name)}
              className="p-3.5 rounded-xl border border-slate-200/70 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/40 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className="text-[11px] font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded">
                    {act.code}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {act.periodicity}
                  </span>
                </div>
                <h4 className="font-semibold text-xs text-slate-800 group-hover:text-blue-700 leading-snug">
                  {act.name}
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {act.description}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-blue-600 font-medium group-hover:translate-x-0.5 transition-transform">
                <span>Generate Return</span>
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reports by ID, Act, Period..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Act Category Filter */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {['All', 'EPFO', 'ESIC', 'Gratuity', 'Minimum Wages', 'Bonus', 'POSH', 'PT'].map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedActFilter(filter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  selectedActFilter === filter
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reports Table or Empty State */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-sm">Loading statutory returns...</div>
        ) : filteredReports.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
              <Scale className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">No Labour Law Reports Generated Yet</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mb-5 leading-relaxed">
              Maintain statutory compliance with zero legal exposure. Generate Electronic Challan Returns (ECR), Form 6, Gratuity liability, or POSH registers with full audit trail.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => handleSimulateReport()}
                className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-xl text-xs border border-blue-200 flex items-center gap-2 transition-all shadow-xs"
              >
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Simulate Sample EPFO Return</span>
              </button>
              <button
                onClick={() => setShowGenerateModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-xs transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Return</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold text-[11px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Report ID & Act</th>
                  <th className="py-3.5 px-4">Period & State</th>
                  <th className="py-3.5 px-4">Records Audited</th>
                  <th className="py-3.5 px-4">Filing Deadline</th>
                  <th className="py-3.5 px-4">Compliance Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-xl text-blue-600 border border-blue-100">
                          <FileCheck2 className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{report.actType}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{report.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">{report.period}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        {report.state}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800">{report.recordsAudited}</span>
                      <span className="text-[11px] text-slate-500 ml-1">employees</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 text-slate-700 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {report.filingDeadline}
                      </div>
                      <div className="text-[10px] text-slate-400">Generated: {report.generatedDate}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {report.complianceStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedReport(report)}
                          className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-blue-600 rounded-lg transition-colors"
                          title="View filing details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(report)}
                          className="p-1.5 hover:bg-blue-50 text-slate-500 hover:text-blue-600 rounded-lg transition-colors"
                          title="Edit Statutory Report"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteReport(report.id)}
                          className="p-1.5 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-lg transition-colors"
                          title="Delete Statutory Report"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <a
                          href={report.fileDownloadUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => {
                            e.preventDefault();
                            alert(`Downloading simulated statutory return packet for ${report.actType} (${report.period})`);
                          }}
                          className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg text-xs flex items-center gap-1 transition-colors border border-blue-200"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Generate Statutory Return Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setShowGenerateModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Generate Statutory Return</h3>
                <p className="text-xs text-slate-500">Compile statutory labor compliance report and audit pack</p>
              </div>
            </div>

            <form onSubmit={handleGenerateReport} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Statutory Act & Scheme *
                </label>
                <select
                  value={formData.actType}
                  onChange={(e) => setFormData({ ...formData, actType: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  required
                >
                  {statutoryActsList.map((act) => (
                    <option key={act.code} value={act.name}>
                      {act.name} ({act.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Filing Period *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. September 2026"
                    value={formData.period}
                    onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Applicable Jurisdiction / State *
                  </label>
                  <select
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                    required
                  >
                    <option value="All States / Pan-India">All States / Pan-India</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Delhi NCR">Delhi NCR</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Telangana">Telangana</option>
                    <option value="Haryana">Haryana</option>
                    <option value="West Bengal">West Bengal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Auditor Remarks & Compliance Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Reconciled against biometric punch logs and monthly payroll ledger."
                  value={formData.comments}
                  onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                />
              </div>

              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-blue-800">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  The generator will reconcile active employee records, calculate statutory contribution obligations, and format the official ECR / Form packet for portal upload.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Generate Report</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setSelectedReport(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                  {selectedReport.id}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">{selectedReport.actType}</h3>
              </div>
            </div>

            <div className="space-y-3.5 text-xs text-slate-600 mb-5">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Filing Period</span>
                  <span className="font-bold text-slate-800">{selectedReport.period}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Jurisdiction</span>
                  <span className="font-bold text-slate-800">{selectedReport.state}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Statutory Deadline</span>
                  <span className="font-bold text-slate-800">{selectedReport.filingDeadline}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Audited Headcount</span>
                  <span className="font-bold text-slate-800">{selectedReport.recordsAudited} Employees</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold mb-1">Status</span>
                <span className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full font-semibold border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  {selectedReport.complianceStatus}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold mb-1">Auditor Remarks</span>
                <p className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 text-slate-700 leading-relaxed">
                  {selectedReport.comments}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                onClick={() => alert(`Downloading statutory PDF & Challan packet for ${selectedReport.id}`)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Download Filing Packet</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Statutory Return Modal */}
      {showEditModal && editingReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => { setShowEditModal(false); setEditingReport(null); }}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Edit Statutory Return & Filing</h3>
                <p className="text-xs text-slate-500">Update compliance parameters and records audited</p>
              </div>
            </div>

            <form onSubmit={handleUpdateReport} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Labour Act / Return Type</label>
                <input
                  type="text"
                  required
                  value={editForm.actType}
                  onChange={e => setEditForm({ ...editForm, actType: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Filing Period</label>
                  <input
                    type="text"
                    required
                    value={editForm.period}
                    onChange={e => setEditForm({ ...editForm, period: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">State / Jurisdiction</label>
                  <input
                    type="text"
                    required
                    value={editForm.state}
                    onChange={e => setEditForm({ ...editForm, state: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Audited Headcount</label>
                  <input
                    type="number"
                    required
                    value={editForm.recordsAudited}
                    onChange={e => setEditForm({ ...editForm, recordsAudited: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Compliance Status</label>
                  <select
                    value={editForm.complianceStatus}
                    onChange={e => setEditForm({ ...editForm, complianceStatus: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value="Compliant & Audit Ready">Compliant & Audit Ready</option>
                    <option value="Filing In Progress">Filing In Progress</option>
                    <option value="Pending Challan Verification">Pending Challan Verification</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Statutory Deadline</label>
                <input
                  type="date"
                  value={editForm.filingDeadline}
                  onChange={e => setEditForm({ ...editForm, filingDeadline: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Auditor Remarks / Notes</label>
                <textarea
                  rows={3}
                  value={editForm.comments}
                  onChange={e => setEditForm({ ...editForm, comments: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setEditingReport(null); }}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
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
