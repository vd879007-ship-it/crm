import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Mail, 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  CheckCircle2, 
  Download, 
  Sparkles, 
  Eye, 
  X, 
  Copy, 
  Send, 
  UserCheck, 
  Calendar, 
  Briefcase, 
  ArrowRight,
  Printer,
  History,
  Pencil,
  Trash2
} from 'lucide-react';
import HRNavigation from '../../components/HRNavigation';

interface LetterTemplate {
  id: string;
  name: string;
  type: string;
  variables: string[];
  body: string;
}

interface LetterRecord {
  id: string;
  templateId: string;
  templateName: string;
  employeeId: string;
  employeeName: string;
  generatedDate: string;
  content: string;
  pdfUrl: string;
  status: string;
  createdAt: string;
}

export default function LetterMailMerge() {
  const [templates, setTemplates] = useState<LetterTemplate[]>([]);
  const [history, setHistory] = useState<LetterRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('All');

  // Modals
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [previewLetter, setPreviewLetter] = useState<LetterRecord | null>(null);

  // Template CRUD State
  const [showCreateTemplateModal, setShowCreateTemplateModal] = useState(false);
  const [createTemplateForm, setCreateTemplateForm] = useState({
    name: '',
    type: 'Appointment',
    body: 'Dear {{employee_name}},\n\nWe are pleased to inform you that...\n\nSincerely,\nHR Operations',
    variables: '{{employee_name}}, {{designation}}, {{department}}'
  });

  const [showEditTemplateModal, setShowEditTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<LetterTemplate | null>(null);
  const [editTemplateForm, setEditTemplateForm] = useState({
    name: '',
    type: 'Appointment',
    body: '',
    variables: ''
  });

  // Letter Record CRUD State
  const [showEditLetterModal, setShowEditLetterModal] = useState(false);
  const [editingLetter, setEditingLetter] = useState<LetterRecord | null>(null);
  const [editLetterForm, setEditLetterForm] = useState({
    templateName: '',
    employeeName: '',
    employeeId: '',
    generatedDate: '',
    status: 'Dispatched & Archived',
    content: ''
  });

  // Form State
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [formData, setFormData] = useState({
    employeeName: '',
    employeeId: '',
    designation: 'Senior Software Engineer',
    department: 'Engineering',
    joining_date: new Date().toISOString().split('T')[0],
    effective_date: new Date().toISOString().split('T')[0],
    relieving_date: new Date().toISOString().split('T')[0],
    ctc: '18,50,000',
    previous_ctc: '15,00,000',
    revised_ctc: '18,50,000',
    work_location: 'Bangalore Tech Campus'
  });

  const fetchTemplatesAndHistory = async () => {
    try {
      const [tplRes, histRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hr/letters/templates`),
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hr/letters/history`)
      ]);
      setTemplates(tplRes.data || []);
      if (tplRes.data && tplRes.data.length > 0) {
        setSelectedTemplateId(tplRes.data[0].id);
      }
      setHistory(histRes.data || []);
    } catch (err) {
      console.error('Failed to load letter merge data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplatesAndHistory();
  }, []);

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const vars = createTemplateForm.variables.split(',').map(v => v.trim()).filter(Boolean);
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hr/letters/templates`, {
        name: createTemplateForm.name,
        type: createTemplateForm.type,
        body: createTemplateForm.body,
        variables: vars
      });
      setShowCreateTemplateModal(false);
      setCreateTemplateForm({
        name: '',
        type: 'Appointment',
        body: 'Dear {{employee_name}},\n\nWe are pleased to inform you that...\n\nSincerely,\nHR Operations',
        variables: '{{employee_name}}, {{designation}}, {{department}}'
      });
      fetchTemplatesAndHistory();
    } catch (err) {
      console.error(err);
      alert('Failed to create letter template');
    }
  };

  const openEditTemplateModal = (tpl: LetterTemplate) => {
    setEditingTemplate(tpl);
    setEditTemplateForm({
      name: tpl.name || '',
      type: tpl.type || 'General',
      body: tpl.body || '',
      variables: tpl.variables?.join(', ') || ''
    });
    setShowEditTemplateModal(true);
  };

  const handleUpdateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate) return;
    try {
      const vars = editTemplateForm.variables.split(',').map(v => v.trim()).filter(Boolean);
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hr/letters/templates/${editingTemplate.id}`, {
        name: editTemplateForm.name,
        type: editTemplateForm.type,
        body: editTemplateForm.body,
        variables: vars
      });
      setShowEditTemplateModal(false);
      setEditingTemplate(null);
      fetchTemplatesAndHistory();
    } catch (err) {
      console.error(err);
      alert('Failed to update letter template');
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this letter template?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hr/letters/templates/${id}`);
      fetchTemplatesAndHistory();
    } catch (err) {
      console.error(err);
      alert('Failed to delete letter template');
    }
  };

  const openEditLetterModal = (item: LetterRecord) => {
    setEditingLetter(item);
    setEditLetterForm({
      templateName: item.templateName || '',
      employeeName: item.employeeName || '',
      employeeId: item.employeeId || '',
      generatedDate: item.generatedDate || '',
      status: item.status || 'Dispatched & Archived',
      content: item.content || ''
    });
    setShowEditLetterModal(true);
  };

  const handleUpdateLetter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLetter) return;
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hr/letters/history/${editingLetter.id}`, editLetterForm);
      setShowEditLetterModal(false);
      setEditingLetter(null);
      fetchTemplatesAndHistory();
    } catch (err) {
      console.error(err);
      alert('Failed to update letter record');
    }
  };

  const handleDeleteLetter = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this letter from history?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hr/letters/history/${id}`);
      fetchTemplatesAndHistory();
    } catch (err) {
      console.error(err);
      alert('Failed to delete letter record');
    }
  };

  const handleOpenGenerateForTemplate = (tplId: string) => {
    setSelectedTemplateId(tplId);
    setShowGenerateModal(true);
  };

  const handleGenerateLetter = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        templateId: selectedTemplateId,
        employeeName: formData.employeeName || 'Aditi Sharma',
        employeeId: formData.employeeId || 'EMP-3042',
        designation: formData.designation,
        department: formData.department,
        customVariables: {
          '{{joining_date}}': formData.joining_date,
          '{{effective_date}}': formData.effective_date,
          '{{relieving_date}}': formData.relieving_date,
          '{{ctc}}': formData.ctc,
          '{{previous_ctc}}': formData.previous_ctc,
          '{{revised_ctc}}': formData.revised_ctc,
          '{{work_location}}': formData.work_location
        }
      };

      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hr/letters/generate`, payload);
      setShowGenerateModal(false);
      setFormData({
        employeeName: '',
        employeeId: '',
        designation: 'Senior Software Engineer',
        department: 'Engineering',
        joining_date: new Date().toISOString().split('T')[0],
        effective_date: new Date().toISOString().split('T')[0],
        relieving_date: new Date().toISOString().split('T')[0],
        ctc: '18,50,000',
        previous_ctc: '15,00,000',
        revised_ctc: '18,50,000',
        work_location: 'Bangalore Tech Campus'
      });
      fetchTemplatesAndHistory();
    } catch (err) {
      console.error('Failed to generate letter:', err);
      alert('Failed to generate letter.');
    }
  };

  const handleSimulateLetter = async (tplId?: string) => {
    try {
      const template = templates.find(t => t.id === tplId) || templates[0];
      const payload = {
        templateId: template?.id || 'TPL-LET-1',
        employeeName: 'Rahul Verma',
        employeeId: 'EMP-1092',
        designation: 'Senior Full Stack Lead',
        department: 'Engineering',
        customVariables: {
          '{{joining_date}}': '2026-10-01',
          '{{effective_date}}': '2026-10-01',
          '{{ctc}}': '24,00,000',
          '{{work_location}}': 'Bangalore HQ'
        }
      };
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hr/letters/generate`, payload);
      fetchTemplatesAndHistory();
    } catch (err) {
      console.error('Simulation failed:', err);
    }
  };

  const activeTemplate = templates.find(t => t.id === selectedTemplateId) || templates[0];

  const getLivePreviewText = () => {
    if (!activeTemplate) return '';
    let text = activeTemplate.body;
    const rep: Record<string, string> = {
      '{{employee_name}}': formData.employeeName || '[Employee Name]',
      '{{designation}}': formData.designation || '[Designation]',
      '{{department}}': formData.department || '[Department]',
      '{{joining_date}}': formData.joining_date || '[Joining Date]',
      '{{effective_date}}': formData.effective_date || '[Effective Date]',
      '{{relieving_date}}': formData.relieving_date || '[Relieving Date]',
      '{{ctc}}': formData.ctc || '[CTC]',
      '{{previous_ctc}}': formData.previous_ctc || '[Previous CTC]',
      '{{revised_ctc}}': formData.revised_ctc || '[Revised CTC]',
      '{{work_location}}': formData.work_location || '[Work Location]'
    };

    Object.keys(rep).forEach(k => {
      text = text.replaceAll(k, rep[k]);
    });
    return text;
  };

  const filteredHistory = history.filter(item => {
    const matchesFilter = selectedTypeFilter === 'All' || item.templateName.toLowerCase().includes(selectedTypeFilter.toLowerCase());
    const matchesSearch = 
      item.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.templateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Universal HR Navigation Bar */}
      <HRNavigation />

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-2 bg-blue-500/20 rounded-xl border border-blue-400/30">
                <Mail className="w-5 h-5 text-blue-300" />
              </span>
              <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider">
                Automated HR Communication Engine
              </span>
              <span className="text-[10px] bg-blue-500/30 text-blue-200 font-bold px-2 py-0.5 rounded-full border border-blue-400/30">
                Dynamic Variables
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Letters & Mail Merge Engine</h1>
            <p className="text-sm text-slate-300 max-w-2xl mt-1">
              Generate standardized employment letters, offer annexures, confirmation slips, increment revisions, and relieving certificates with instantaneous field merging and digital archival.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleSimulateLetter()}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Simulate Sample Issuance</span>
            </button>
            <button
              onClick={() => {
                if (templates.length > 0) handleOpenGenerateForTemplate(templates[0].id);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Issue New Letter</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold border border-blue-100">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">{history.length}</div>
            <div className="text-xs font-medium text-slate-500">Letters Issued & Merged</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold border border-indigo-100">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">{templates.length}</div>
            <div className="text-xs font-medium text-slate-500">Standard Templates</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold border border-emerald-100">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">100%</div>
            <div className="text-xs font-medium text-slate-500">Signature & Dispatch Rate</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 font-bold border border-purple-100">
            <History className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">&lt; 2s</div>
            <div className="text-xs font-medium text-slate-500">Instant Merge Speed</div>
          </div>
        </div>
      </div>

      {/* Available Letter Templates Suite */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-800 text-sm">Enterprise Letter Template Library</h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500">Select any template to populate & merge</span>
            <button
              onClick={() => setShowCreateTemplateModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Template</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              className="p-4 rounded-xl border border-slate-200/80 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/30 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                    {tpl.type}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-400 font-mono mr-1">{tpl.id}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); openEditTemplateModal(tpl); }}
                      className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Edit Template"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteTemplate(tpl.id); }}
                      className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete Template"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h4 className="font-bold text-slate-800 text-xs mb-2 group-hover:text-blue-700 leading-snug">
                  {tpl.name}
                </h4>

                <div className="space-y-1 mb-3">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase">Merge Tokens:</div>
                  <div className="flex flex-wrap gap-1">
                    {tpl.variables.slice(0, 4).map((v, i) => (
                      <span key={i} className="text-[10px] font-mono bg-white text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                        {v}
                      </span>
                    ))}
                    {tpl.variables.length > 4 && (
                      <span className="text-[10px] font-mono text-slate-400">+{tpl.variables.length - 4} more</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200/70 flex items-center justify-between">
                <button
                  onClick={() => handleSimulateLetter(tpl.id)}
                  className="text-[11px] text-slate-500 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Simulate</span>
                </button>
                <button
                  onClick={() => handleOpenGenerateForTemplate(tpl.id)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors"
                >
                  <span>Merge</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter and Search Bar for History */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Employee, Letter ID, or Type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {['All', 'Appointment', 'Confirmation', 'Increment', 'Relieving'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedTypeFilter(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  selectedTypeFilter === type
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Letter Issuance History Table or Empty State */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-sm">Loading letter generation history...</div>
        ) : filteredHistory.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
              <Mail className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">No Letters Issued Yet</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mb-5 leading-relaxed">
              Standardize all company correspondence. Use our mail merge engine to issue verified appointment, increment, confirmation, and relieving certificates with one click.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => handleSimulateLetter()}
                className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-xl text-xs border border-blue-200 flex items-center gap-2 transition-all shadow-xs"
              >
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Simulate Sample Offer Letter</span>
              </button>
              <button
                onClick={() => {
                  if (templates.length > 0) handleOpenGenerateForTemplate(templates[0].id);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-xs transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Create & Merge Letter</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold text-[11px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Letter ID & Template</th>
                  <th className="py-3.5 px-4">Recipient Employee</th>
                  <th className="py-3.5 px-4">Issue Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-xl text-blue-600 border border-blue-100">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{item.templateName}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{item.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{item.employeeName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{item.employeeId}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {item.generatedDate}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setPreviewLetter(item)}
                          className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs flex items-center gap-1 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Preview</span>
                        </button>
                        <button
                          onClick={() => alert(`Downloading signed PDF for ${item.id} (${item.employeeName})`)}
                          className="px-2 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg text-xs flex items-center gap-1 transition-colors border border-blue-200"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </button>
                        <button
                          onClick={() => openEditLetterModal(item)}
                          className="p-1.5 bg-slate-50 hover:bg-blue-50 text-slate-500 hover:text-blue-600 rounded-lg transition-colors border border-slate-200"
                          title="Edit Letter Record"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteLetter(item.id)}
                          className="p-1.5 bg-slate-50 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-lg transition-colors border border-slate-200"
                          title="Delete Letter Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Generate & Mail Merge Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowGenerateModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Generate Letter via Mail Merge</h3>
                <p className="text-xs text-slate-500">Map employee profile fields and compile digital letter</p>
              </div>
            </div>

            <form onSubmit={handleGenerateLetter} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Letter Template *
                </label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  required
                >
                  {templates.map((tpl) => (
                    <option key={tpl.id} value={tpl.id}>
                      {tpl.name} ({tpl.type})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Employee Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Aditi Sharma"
                    value={formData.employeeName}
                    onChange={(e) => setFormData({ ...formData, employeeName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Employee Code / ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. EMP-4012"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Designation *
                  </label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Department *
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Annual CTC (₹)
                  </label>
                  <input
                    type="text"
                    value={formData.ctc}
                    onChange={(e) => setFormData({ ...formData, ctc: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Work Location
                  </label>
                  <input
                    type="text"
                    value={formData.work_location}
                    onChange={(e) => setFormData({ ...formData, work_location: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Live Preview Box */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-blue-600" />
                    Live Merged Letter Preview:
                  </span>
                  <span className="text-[10px] text-slate-400">Tokens are dynamically substituted</span>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] text-slate-700 whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed">
                  {getLivePreviewText()}
                </div>
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
                  <Send className="w-4 h-4" />
                  <span>Issue & Dispatch Letter</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Letter Modal */}
      {previewLetter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setPreviewLetter(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-between gap-3 mb-5 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                    {previewLetter.id}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1">{previewLetter.templateName}</h3>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-semibold text-slate-800">{previewLetter.employeeName}</div>
                <div className="text-[10px] text-slate-400">Issued: {previewLetter.generatedDate}</div>
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200/80 font-serif text-xs text-slate-800 whitespace-pre-wrap leading-relaxed mb-5 shadow-inner">
              {previewLetter.content}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Digitally sealed and archived
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewLetter(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Close
                </button>
                <button
                  onClick={() => alert(`Printing/Downloading PDF copy of letter ${previewLetter.id}`)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print / PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Template Modal */}
      {showCreateTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowCreateTemplateModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-slate-900 mb-4">Create Enterprise Letter Template</h3>
            <form onSubmit={handleCreateTemplate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Template Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Intern Certificate of Completion"
                  value={createTemplateForm.name}
                  onChange={e => setCreateTemplateForm({ ...createTemplateForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Category / Type</label>
                  <select
                    value={createTemplateForm.type}
                    onChange={e => setCreateTemplateForm({ ...createTemplateForm, type: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value="Appointment">Appointment</option>
                    <option value="Confirmation">Confirmation</option>
                    <option value="Increment">Increment</option>
                    <option value="Relieving">Relieving</option>
                    <option value="General">General HR</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Merge Tokens</label>
                  <input
                    type="text"
                    placeholder="e.g. {{employee_name}}, {{designation}}"
                    value={createTemplateForm.variables}
                    onChange={e => setCreateTemplateForm({ ...createTemplateForm, variables: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Template Body (Markdown / Plain Text)</label>
                <textarea
                  rows={8}
                  required
                  value={createTemplateForm.body}
                  onChange={e => setCreateTemplateForm({ ...createTemplateForm, body: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateTemplateModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Template Modal */}
      {showEditTemplateModal && editingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => { setShowEditTemplateModal(false); setEditingTemplate(null); }}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-slate-900 mb-4">Edit Letter Template</h3>
            <form onSubmit={handleUpdateTemplate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Template Name</label>
                <input
                  type="text"
                  required
                  value={editTemplateForm.name}
                  onChange={e => setEditTemplateForm({ ...editTemplateForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Category / Type</label>
                  <select
                    value={editTemplateForm.type}
                    onChange={e => setEditTemplateForm({ ...editTemplateForm, type: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value="Appointment">Appointment</option>
                    <option value="Confirmation">Confirmation</option>
                    <option value="Increment">Increment</option>
                    <option value="Relieving">Relieving</option>
                    <option value="General">General HR</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Merge Tokens</label>
                  <input
                    type="text"
                    value={editTemplateForm.variables}
                    onChange={e => setEditTemplateForm({ ...editTemplateForm, variables: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Template Body</label>
                <textarea
                  rows={8}
                  required
                  value={editTemplateForm.body}
                  onChange={e => setEditTemplateForm({ ...editTemplateForm, body: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setShowEditTemplateModal(false); setEditingTemplate(null); }}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Letter Modal */}
      {showEditLetterModal && editingLetter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => { setShowEditLetterModal(false); setEditingLetter(null); }}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-slate-900 mb-4">Edit Letter Record</h3>
            <form onSubmit={handleUpdateLetter} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Employee Name</label>
                  <input
                    type="text"
                    required
                    value={editLetterForm.employeeName}
                    onChange={e => setEditLetterForm({ ...editLetterForm, employeeName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Employee ID</label>
                  <input
                    type="text"
                    required
                    value={editLetterForm.employeeId}
                    onChange={e => setEditLetterForm({ ...editLetterForm, employeeId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Template Name</label>
                  <input
                    type="text"
                    value={editLetterForm.templateName}
                    onChange={e => setEditLetterForm({ ...editLetterForm, templateName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Status</label>
                  <select
                    value={editLetterForm.status}
                    onChange={e => setEditLetterForm({ ...editLetterForm, status: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value="Dispatched & Archived">Dispatched & Archived</option>
                    <option value="Signed by Candidate">Signed by Candidate</option>
                    <option value="Draft / Pending Sign">Draft / Pending Sign</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Letter Content</label>
                <textarea
                  rows={8}
                  required
                  value={editLetterForm.content}
                  onChange={e => setEditLetterForm({ ...editLetterForm, content: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setShowEditLetterModal(false); setEditingLetter(null); }}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-xs"
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
