import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Mail, MessageSquare, Send, Calendar, Clock, Video, 
  FileText, CheckCircle2, User, Plus, X, Search, Sparkles, Pencil, Trash2
} from 'lucide-react';

export default function CandidateCommunications() {
  const [communications, setCommunications] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'history' | 'templates'>('history');
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [showAddTemplateModal, setShowAddTemplateModal] = useState(false);
  const [showEditTemplateModal, setShowEditTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [templateForm, setTemplateForm] = useState({
    title: '',
    type: 'Interview Invitation',
    subject: '',
    body: ''
  });

  const handleOpenAddTemplate = () => {
    setTemplateForm({
      title: '',
      type: 'Interview Invitation',
      subject: '',
      body: ''
    });
    setShowAddTemplateModal(true);
  };

  const handleAddTemplateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/recruitment/communications/templates`, templateForm);
      setTemplates([...templates, res.data]);
      setShowAddTemplateModal(false);
    } catch (err) {
      const mock = { id: `TPL-${Date.now()}`, ...templateForm };
      setTemplates([...templates, mock]);
      setShowAddTemplateModal(false);
    }
  };

  const handleOpenEditTemplate = (tpl: any) => {
    setEditingTemplate(tpl);
    setTemplateForm({
      title: tpl.title || '',
      type: tpl.type || 'Interview Invitation',
      subject: tpl.subject || '',
      body: tpl.body || ''
    });
    setShowEditTemplateModal(true);
  };

  const handleEditTemplateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate) return;
    try {
      const res = await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/recruitment/communications/templates/${editingTemplate.id}`, templateForm);
      setTemplates(templates.map(t => t.id === editingTemplate.id ? res.data : t));
      setShowEditTemplateModal(false);
    } catch (err) {
      setTemplates(templates.map(t => t.id === editingTemplate.id ? { ...t, ...templateForm } : t));
      setShowEditTemplateModal(false);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/recruitment/communications/templates/${id}`);
      setTemplates(templates.filter(t => t.id !== id));
    } catch (err) {
      setTemplates(templates.filter(t => t.id !== id));
    }
  };

  const handleDeleteComm = async (id: string) => {
    if (!confirm('Delete this communication record?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/recruitment/communications/${id}`);
      setCommunications(communications.filter(c => c.id !== id));
    } catch (err) {
      setCommunications(communications.filter(c => c.id !== id));
    }
  };

  const [composeForm, setComposeForm] = useState({
    candidateName: 'Devon Martinez',
    candidateEmail: 'devon.martinez@techmail.com',
    type: 'Email',
    subject: '',
    content: '',
    sender: 'Athena HR Talent Team'
  });

  const [scheduleForm, setScheduleForm] = useState({
    candidateName: 'Devon Martinez',
    candidateEmail: 'devon.martinez@techmail.com',
    role: 'Senior Full Stack Engineer',
    interviewType: 'Technical Architecture Panel',
    date: '2026-10-02',
    time: '14:00',
    duration: '60 minutes',
    interviewers: 'Alex Chen (Lead), Michael Torres (Staff Eng)',
    platform: 'Google Meet'
  });

  const fetchData = async () => {
    try {
      const [commRes, tplRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/recruitment/communications`),
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/recruitment/communications/templates`)
      ]);
      setCommunications(commRes.data);
      setTemplates(tplRes.data);
    } catch (err) {
      console.error(err);
      setCommunications([]);
      setTemplates([
        {
          id: 'TPL-1',
          title: 'Round 1 Initial Recruiter Screen',
          type: 'Interview Invitation',
          subject: 'Athena HR: Initial Conversation for {{job_title}}',
          body: 'Hi {{candidate_name}},\n\nThank you for applying for the {{job_title}} role at Athena HR. We were very impressed by your background and would love to schedule a 30-minute introductory call to learn more about your goals and share details about our team.\n\nPlease select a convenient time from my calendar link: https://meet.athenahr.io/recruiter-screen\n\nBest regards,\nTalent Acquisition Team'
        },
        {
          id: 'TPL-2',
          title: 'Technical Panel Interview',
          type: 'Interview Invitation',
          subject: 'Athena HR: Technical Architecture Panel - {{candidate_name}}',
          body: 'Hi {{candidate_name}},\n\nCongratulations on moving forward! For the next stage, we have scheduled a 60-minute technical session covering architecture and system design.\n\nMeeting link: https://meet.google.com/ath-tech-panel\n\nFeel free to reach out with any questions prior to the session.'
        },
        {
          id: 'TPL-3',
          title: 'Pre-Employment Background Check Request',
          type: 'Verification',
          subject: 'Action Required: Background Screening Authorization - Athena HR',
          body: 'Dear {{candidate_name}},\n\nAs we prepare for the final stages of the hiring process for {{job_title}}, we require pre-employment background screening through our verification partner.\n\nPlease complete the secure verification portal link within 3 business days: https://verify.checkr.com/auth-athena-hr\n\nThank you,\nAthena HR Compliance'
        },
        {
          id: 'TPL-4',
          title: 'Formal Offer Letter Announcement',
          type: 'Offer',
          subject: 'Athena HR: Official Job Offer for {{job_title}}',
          body: 'Dear {{candidate_name}},\n\nWe are overjoyed to formally extend an offer to join Athena HR as our {{job_title}}! Enclosed is your formal offer package detailing compensation, equity, healthcare benefits, and initial start date.\n\nPlease review and sign electronically via DocuSign.\n\nWelcome to the team!'
        },
        {
          id: 'TPL-5',
          title: 'Polite Application Rejection',
          type: 'Rejection',
          subject: 'Your application with Athena HR for {{job_title}}',
          body: 'Dear {{candidate_name}},\n\nThank you for your time and interest in the {{job_title}} position at Athena HR. While your qualifications and experience are impressive, we have chosen to proceed with another candidate whose background more closely aligns with our immediate technical requirements.\n\nWe will retain your profile in our talent network for future openings that match your skillset.'
        }
      ]);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApplyTemplate = (tpl: any) => {
    setSelectedTemplate(tpl);
    const resolvedSubject = tpl.subject
      .replace('{{candidate_name}}', composeForm.candidateName)
      .replace('{{job_title}}', 'Senior Full Stack Engineer');
    const resolvedBody = tpl.body
      .replace(/{{candidate_name}}/g, composeForm.candidateName)
      .replace(/{{job_title}}/g, 'Senior Full Stack Engineer');

    setComposeForm({
      ...composeForm,
      subject: resolvedSubject,
      content: resolvedBody
    });
    setShowComposeModal(true);
  };

  const handleSendComm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/recruitment/communications`, composeForm);
      setCommunications([res.data, ...communications]);
      setShowComposeModal(false);
    } catch (err) {
      const mock = {
        id: `COMM-${String(communications.length + 1).padStart(3, '0')}`,
        ...composeForm,
        status: 'Delivered',
        sentAt: new Date().toISOString()
      };
      setCommunications([mock, ...communications]);
      setShowComposeModal(false);
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const mockComm = {
      id: `COMM-${String(communications.length + 1).padStart(3, '0')}`,
      candidateName: scheduleForm.candidateName,
      candidateEmail: scheduleForm.candidateEmail,
      type: 'Interview Invitation',
      subject: `Calendar Invite: ${scheduleForm.interviewType} - ${scheduleForm.candidateName}`,
      content: `Interview Confirmed!\nType: ${scheduleForm.interviewType}\nDate: ${scheduleForm.date} at ${scheduleForm.time}\nDuration: ${scheduleForm.duration}\nPanel: ${scheduleForm.interviewers}\nVideo Link: https://meet.google.com/ath-${Math.random().toString(36).substring(7)}`,
      sender: 'Athena HR Scheduling Assistant',
      status: 'Delivered',
      sentAt: new Date().toISOString()
    };
    setCommunications([mockComm, ...communications]);
    setShowScheduleModal(false);
    alert(`Interview successfully scheduled! Calendar invitation sent to ${scheduleForm.candidateEmail}.`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Mail className="w-6 h-6 text-amber-600" />
            <span>Candidate Communication & Interview Hub</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Standardized outreach templates, real-time message tracking, and calendar scheduling
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowScheduleModal(true)}
            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3.5 py-2 rounded-xl font-semibold text-sm shadow-xs flex items-center transition-all cursor-pointer"
          >
            <Calendar className="w-4 h-4 mr-1.5 text-amber-600" />
            Schedule Interview
          </button>
          <button
            onClick={() => {
              setComposeForm({
                candidateName: 'Devon Martinez',
                candidateEmail: 'devon.martinez@techmail.com',
                type: 'Email',
                subject: '',
                content: '',
                sender: 'Athena HR Talent Team'
              });
              setShowComposeModal(true);
            }}
            className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-sm flex items-center transition-all cursor-pointer"
          >
            <Send className="w-4 h-4 mr-1.5" />
            Compose Message
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('history')}
          className={`py-3 px-6 text-sm font-bold flex items-center gap-2 border-b-2 cursor-pointer transition-colors ${
            activeTab === 'history'
              ? 'border-amber-600 text-amber-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Communication Logs ({communications.length})
        </button>

        <button
          onClick={() => setActiveTab('templates')}
          className={`py-3 px-6 text-sm font-bold flex items-center gap-2 border-b-2 cursor-pointer transition-colors ${
            activeTab === 'templates'
              ? 'border-amber-600 text-amber-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <FileText className="w-4 h-4" />
          Standardized Email Templates ({templates.length})
        </button>
      </div>

      {/* Tab 1: Communication Log */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {communications.map((comm) => (
            <div key={comm.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                    {comm.candidateName?.substring(0, 2) || 'CA'}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900">{comm.candidateName}</h4>
                    <p className="text-[11px] text-gray-500">{comm.candidateEmail}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="font-semibold bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[10px]">
                    {comm.type}
                  </span>
                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-bold">
                    {comm.status}
                  </span>
                  <span className="text-gray-400">
                    {new Date(comm.sentAt).toLocaleDateString()} at {new Date(comm.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              <div className="mt-3">
                <h5 className="font-bold text-xs text-gray-800 mb-1">{comm.subject}</h5>
                <p className="text-xs text-gray-600 whitespace-pre-line leading-relaxed bg-gray-50/60 p-3 rounded-lg border border-gray-100 font-sans">
                  {comm.content}
                </p>
              </div>

              <div className="mt-3 flex justify-between items-center text-[11px] text-gray-400">
                <span>Sent by: <strong className="text-gray-600">{comm.sender}</strong></span>
                <button
                  onClick={() => {
                    setComposeForm({
                      candidateName: comm.candidateName,
                      candidateEmail: comm.candidateEmail,
                      type: 'Email',
                      subject: `Re: ${comm.subject}`,
                      content: `\n\n--- On ${new Date(comm.sentAt).toLocaleDateString()} ${comm.sender} wrote:\n${comm.content}`,
                      sender: 'Athena HR Talent Team'
                    });
                    setShowComposeModal(true);
                  }}
                  className="font-bold text-amber-600 hover:text-amber-700 cursor-pointer"
                >
                  Reply to Candidate →
                </button>
              </div>
            </div>
          ))}
          {communications.length === 0 && (
            <div className="bg-white p-12 text-center rounded-xl border border-gray-200">
              <p className="text-sm text-gray-500">No communication logs recorded yet. Click 'Compose Message' or 'Schedule Interview' above.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Templates */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((tpl) => (
            <div key={tpl.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                    {tpl.type}
                  </span>
                  <span className="text-xs font-mono text-gray-400">{tpl.id}</span>
                </div>

                <h4 className="font-bold text-base text-gray-900 mt-2">{tpl.title}</h4>
                <p className="text-xs text-gray-500 font-medium mt-1">
                  Subject: <span className="text-gray-700 font-semibold">{tpl.subject}</span>
                </p>

                <div className="mt-3 p-3 bg-gray-50 rounded-lg text-xs text-gray-600 whitespace-pre-line font-mono text-[11px] max-h-36 overflow-y-auto">
                  {tpl.body}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEditTemplate(tpl)}
                    className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                    title="Edit Template"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteTemplate(tpl.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete Template"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleApplyTemplate(tpl)}
                    className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" /> Use Template
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Template Modal */}
      {showAddTemplateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Create Email / Message Template</h3>
              <button onClick={() => setShowAddTemplateModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddTemplateSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Template Name</label>
                <input
                  type="text"
                  required
                  value={templateForm.title}
                  onChange={e => setTemplateForm({ ...templateForm, title: e.target.value })}
                  placeholder="e.g. Stage 2 Technical Assessment"
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
                  <select
                    value={templateForm.type}
                    onChange={e => setTemplateForm({ ...templateForm, type: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                  >
                    <option value="Interview Invitation">Interview Invitation</option>
                    <option value="Verification">Verification</option>
                    <option value="Offer">Offer</option>
                    <option value="Rejection">Rejection</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Email Subject</label>
                  <input
                    type="text"
                    required
                    value={templateForm.subject}
                    onChange={e => setTemplateForm({ ...templateForm, subject: e.target.value })}
                    placeholder="e.g. Next steps with Athena HR"
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Body Text</label>
                <textarea
                  rows={5}
                  required
                  value={templateForm.body}
                  onChange={e => setTemplateForm({ ...templateForm, body: e.target.value })}
                  placeholder="Supports placeholders: {{candidate_name}}, {{job_title}}, etc."
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddTemplateModal(false)}
                  className="px-4 py-2 border rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-bold shadow-sm"
                >
                  Create Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Template Modal */}
      {showEditTemplateModal && editingTemplate && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Edit Template ({editingTemplate.id})</h3>
              <button onClick={() => setShowEditTemplateModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditTemplateSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Template Name</label>
                <input
                  type="text"
                  required
                  value={templateForm.title}
                  onChange={e => setTemplateForm({ ...templateForm, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
                  <select
                    value={templateForm.type}
                    onChange={e => setTemplateForm({ ...templateForm, type: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                  >
                    <option value="Interview Invitation">Interview Invitation</option>
                    <option value="Verification">Verification</option>
                    <option value="Offer">Offer</option>
                    <option value="Rejection">Rejection</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Email Subject</label>
                  <input
                    type="text"
                    required
                    value={templateForm.subject}
                    onChange={e => setTemplateForm({ ...templateForm, subject: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Body Text</label>
                <textarea
                  rows={5}
                  required
                  value={templateForm.body}
                  onChange={e => setTemplateForm({ ...templateForm, body: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowEditTemplateModal(false)}
                  className="px-4 py-2 border rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-bold shadow-sm"
                >
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Compose Message Modal */}
      {showComposeModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Send className="w-5 h-5 text-amber-600" />
                <span>Compose Candidate Message</span>
              </h3>
              <button onClick={() => setShowComposeModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendComm} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Candidate Name</label>
                  <input
                    type="text"
                    required
                    value={composeForm.candidateName}
                    onChange={e => setComposeForm({ ...composeForm, candidateName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Candidate Email</label>
                  <input
                    type="email"
                    required
                    value={composeForm.candidateEmail}
                    onChange={e => setComposeForm({ ...composeForm, candidateEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Communication Channel</label>
                  <select
                    value={composeForm.type}
                    onChange={e => setComposeForm({ ...composeForm, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="Email">Email</option>
                    <option value="SMS">SMS / WhatsApp</option>
                    <option value="Portal Message">Portal Message</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Sender Signature</label>
                  <input
                    type="text"
                    value={composeForm.sender}
                    onChange={e => setComposeForm({ ...composeForm, sender: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={composeForm.subject}
                  onChange={e => setComposeForm({ ...composeForm, subject: e.target.value })}
                  placeholder="e.g. Athena HR: Next steps in your application"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Message Content</label>
                <textarea
                  rows={6}
                  required
                  value={composeForm.content}
                  onChange={e => setComposeForm({ ...composeForm, content: e.target.value })}
                  placeholder="Type message or apply a template..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowComposeModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-bold shadow-sm"
                >
                  Send Communication
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Interview Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-600" />
                <span>Schedule Candidate Interview</span>
              </h3>
              <button onClick={() => setShowScheduleModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Candidate Name</label>
                  <input
                    type="text"
                    required
                    value={scheduleForm.candidateName}
                    onChange={e => setScheduleForm({ ...scheduleForm, candidateName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Candidate Email</label>
                  <input
                    type="email"
                    required
                    value={scheduleForm.candidateEmail}
                    onChange={e => setScheduleForm({ ...scheduleForm, candidateEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Interview Round</label>
                  <select
                    value={scheduleForm.interviewType}
                    onChange={e => setScheduleForm({ ...scheduleForm, interviewType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="Initial Recruiter Screen (30m)">Initial Recruiter Screen (30m)</option>
                    <option value="Technical Architecture Panel">Technical Architecture Panel</option>
                    <option value="Live Coding Session">Live Coding Session</option>
                    <option value="Product & Culture Alignment">Product & Culture Alignment</option>
                    <option value="Executive Final Presentation">Executive Final Presentation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Video Provider</label>
                  <select
                    value={scheduleForm.platform}
                    onChange={e => setScheduleForm({ ...scheduleForm, platform: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="Google Meet">Google Meet (Auto-generated)</option>
                    <option value="Microsoft Teams">Microsoft Teams</option>
                    <option value="Zoom Meeting">Zoom</option>
                    <option value="Onsite In-Person">Onsite In-Person</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={scheduleForm.date}
                    onChange={e => setScheduleForm({ ...scheduleForm, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Time</label>
                  <input
                    type="time"
                    required
                    value={scheduleForm.time}
                    onChange={e => setScheduleForm({ ...scheduleForm, time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Duration</label>
                  <select
                    value={scheduleForm.duration}
                    onChange={e => setScheduleForm({ ...scheduleForm, duration: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="30 minutes">30 min</option>
                    <option value="45 minutes">45 min</option>
                    <option value="60 minutes">60 min</option>
                    <option value="90 minutes">90 min</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Interview Panel Members</label>
                <input
                  type="text"
                  value={scheduleForm.interviewers}
                  onChange={e => setScheduleForm({ ...scheduleForm, interviewers: e.target.value })}
                  placeholder="e.g. Alex Chen, Marcus Vance"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-bold shadow-sm"
                >
                  Send Calendar Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
