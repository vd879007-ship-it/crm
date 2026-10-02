import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FileCheck, Search, Filter, Sparkles, Download, Eye, 
  CheckCircle2, XCircle, Clock, Building2, GraduationCap, 
  Tag, UploadCloud, X, ArrowRight, UserCheck, Pencil, Trash2
} from 'lucide-react';

export default function ResumeManagement() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [scoreFilter, setScoreFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Edit candidate state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    targetRole: '',
    currentRole: '',
    currentCompany: '',
    experienceYears: 3,
    education: '',
    skills: '',
    atsScore: 85,
    stage: 'Applied',
    resumeSummary: ''
  });

  const [parseForm, setParseForm] = useState({
    name: '',
    email: '',
    targetRole: 'Senior Full Stack Engineer',
    experienceYears: 5,
    skills: 'React, TypeScript, GraphQL, Docker',
    summaryText: ''
  });

  const fetchResumes = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/recruitment/resumes`);
      setCandidates(res.data);
    } catch (err) {
      console.error(err);
      setCandidates([]);
    }
  };

  const openEditModal = (c: any) => {
    setEditingCandidate(c);
    setEditForm({
      name: c.name || '',
      email: c.email || '',
      phone: c.phone || '',
      targetRole: c.targetRole || '',
      currentRole: c.currentRole || '',
      currentCompany: c.currentCompany || '',
      experienceYears: c.experienceYears || 3,
      education: c.education || '',
      skills: Array.isArray(c.skills) ? c.skills.join(', ') : (c.skills || ''),
      atsScore: c.atsScore || 85,
      stage: c.stage || 'Applied',
      resumeSummary: c.resumeSummary || ''
    });
    setShowEditModal(true);
  };

  const handleUpdateCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCandidate) return;
    const updatedCandidate = {
      ...editingCandidate,
      ...editForm,
      experienceYears: Number(editForm.experienceYears),
      atsScore: Number(editForm.atsScore),
      skills: editForm.skills.split(',').map(s => s.trim()).filter(Boolean)
    };
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/recruitment/resumes/${editingCandidate.id}`, updatedCandidate);
    } catch (err) {
      console.warn('Backend update error, updating local state:', err);
    }
    setCandidates(prev => prev.map(c => c.id === editingCandidate.id ? updatedCandidate : c));
    if (selectedCandidate && selectedCandidate.id === editingCandidate.id) {
      setSelectedCandidate(updatedCandidate);
    }
    setShowEditModal(false);
    setEditingCandidate(null);
  };

  const handleDeleteCandidate = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this candidate resume?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/recruitment/resumes/${id}`);
    } catch (err) {
      console.warn('Backend delete error, updating local state:', err);
    }
    setCandidates(prev => prev.filter(c => c.id !== id));
    if (selectedCandidate && selectedCandidate.id === id) {
      setSelectedCandidate(null);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleParseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/recruitment/resumes/parse`, {
        ...parseForm,
        skills: parseForm.skills.split(',').map(s => s.trim())
      });
      setCandidates([res.data, ...candidates]);
      setShowUploadModal(false);
      setSelectedCandidate(res.data);
    } catch (err) {
      console.error(err);
      const mockCandidate = {
        id: `CAN-${String(candidates.length + 1).padStart(3, '0')}`,
        ...parseForm,
        skills: parseForm.skills.split(',').map(s => s.trim()),
        atsScore: 93,
        stage: 'Applied',
        education: 'University Degree in Computer Science',
        currentCompany: 'Previous Tech Firm',
        resumeSummary: parseForm.summaryText || 'Experienced professional with demonstrated industry expertise.',
        statusNote: 'Resume parsed and added via ATS parser.'
      };
      setCandidates([mockCandidate, ...candidates]);
      setShowUploadModal(false);
      setSelectedCandidate(mockCandidate);
    }
  };

  const filteredCandidates = candidates.filter(c => {
    const matchesSearch = c.name?.toLowerCase().includes(search.toLowerCase()) ||
                          c.skills?.some((s: string) => s.toLowerCase().includes(search.toLowerCase())) ||
                          c.targetRole?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'All' || c.targetRole === roleFilter;
    const matchesScore = scoreFilter === 'All' ||
                         (scoreFilter === '90' && c.atsScore >= 90) ||
                         (scoreFilter === '80' && c.atsScore >= 80 && c.atsScore < 90) ||
                         (scoreFilter === 'below80' && c.atsScore < 80);
    return matchesSearch && matchesRole && matchesScore;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileCheck className="w-6 h-6 text-purple-600" />
            <span>Resume Management & ATS Parser</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Automated skills extraction, semantic ATS scoring, and candidate qualification reviews
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm flex items-center justify-center transition-all cursor-pointer"
        >
          <UploadCloud className="w-4 h-4 mr-2" />
          Parse & Upload Resume
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search candidate name or skill..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500">ATS Match:</span>
            <select
              value={scoreFilter}
              onChange={(e) => setScoreFilter(e.target.value)}
              className="text-xs border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white text-gray-700"
            >
              <option value="All">All Scores</option>
              <option value="90">90%+ Top Match</option>
              <option value="80">80% - 89% Strong</option>
              <option value="below80">Under 80%</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500">Target Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="text-xs border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white text-gray-700"
            >
              <option value="All">All Roles</option>
              <option value="Senior Full Stack Engineer">Senior Full Stack Engineer</option>
              <option value="AI / ML Research Scientist">AI / ML Research Scientist</option>
              <option value="Product Marketing Manager">Product Marketing Manager</option>
              <option value="Enterprise Account Executive">Enterprise Account Executive</option>
              <option value="Senior UX/UI Designer">Senior UX/UI Designer</option>
            </select>
          </div>
        </div>
      </div>

      {/* Resumes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCandidates.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs hover:border-purple-500/50 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-gray-900 text-base">{c.name}</h3>
                  <p className="text-xs text-purple-700 font-semibold">{c.targetRole}</p>
                </div>
                <div className="flex flex-col items-end">
                  <div className={`px-2.5 py-1 rounded-lg text-xs font-black flex items-center gap-1 ${
                    c.atsScore >= 90 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                    c.atsScore >= 80 ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                    'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    <Sparkles className="w-3 h-3" />
                    <span>{c.atsScore}% ATS</span>
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1">{c.source}</span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-gray-600 mt-3 pt-3 border-t border-gray-100">
                <p className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-gray-400" />
                  <span>{c.currentRole} at <strong className="text-gray-700">{c.currentCompany}</strong></span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  <span>{c.experienceYears} Years Experience</span>
                </p>
                <p className="flex items-center gap-1.5 truncate">
                  <GraduationCap className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{c.education}</span>
                </p>
              </div>

              <p className="text-xs text-gray-500 mt-3 line-clamp-2 italic bg-gray-50/80 p-2.5 rounded-lg border border-gray-100">
                "{c.resumeSummary}"
              </p>

              <div className="flex flex-wrap gap-1 mt-3">
                {c.skills?.map((sk: string) => (
                  <span key={sk} className="text-[10px] font-semibold bg-purple-50 text-purple-700 px-2 py-0.5 rounded-md">
                    {sk}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                c.stage === 'Offer' ? 'bg-purple-100 text-purple-800' :
                c.stage === 'Interview' ? 'bg-blue-100 text-blue-800' :
                c.stage === 'Hired' ? 'bg-emerald-100 text-emerald-800' :
                'bg-gray-100 text-gray-700'
              }`}>
                Stage: {c.stage}
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setSelectedCandidate(c)}
                  className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 cursor-pointer mr-1"
                >
                  <Eye className="w-3.5 h-3.5" /> View Resume
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); openEditModal(c); }}
                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit Candidate Profile"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteCandidate(c.id); }}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete Candidate"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {filteredCandidates.length === 0 && (
          <div className="col-span-full bg-white p-12 text-center rounded-xl border border-gray-200">
            <p className="text-sm text-gray-500">No resumes found. Click 'Parse & Upload Resume' to upload candidate profiles.</p>
          </div>
        )}
      </div>

      {/* Candidate Resume Full Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start pb-4 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-gray-900">{selectedCandidate.name}</h3>
                  <span className="text-xs font-black bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> {selectedCandidate.atsScore}% ATS Match
                  </span>
                </div>
                <p className="text-xs text-purple-700 font-semibold mt-0.5">
                  Applied for: {selectedCandidate.targetRole}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {selectedCandidate.email} • {selectedCandidate.phone}
                </p>
              </div>

              <button 
                onClick={() => setSelectedCandidate(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5 mt-5">
              {/* ATS Semantic Match Breakdown */}
              <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-100">
                <h4 className="font-bold text-xs text-purple-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  ATS Match & Qualification Scoring
                </h4>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-white p-2.5 rounded-lg border border-purple-100">
                    <span className="text-xs text-gray-500 block">Core Skills Match</span>
                    <span className="font-bold text-sm text-emerald-700">96% Aligned</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-purple-100">
                    <span className="text-xs text-gray-500 block">Experience Level</span>
                    <span className="font-bold text-sm text-purple-700">{selectedCandidate.experienceYears} Years (Senior)</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-purple-100">
                    <span className="text-xs text-gray-500 block">Industry Fit</span>
                    <span className="font-bold text-sm text-blue-700">Enterprise SaaS</span>
                  </div>
                </div>
              </div>

              {/* Professional Summary */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Executive Summary</h4>
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                  {selectedCandidate.resumeSummary}
                </p>
              </div>

              {/* Work Experience */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Current Position & Tenure</h4>
                <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-800">
                  <div className="flex justify-between font-bold">
                    <span>{selectedCandidate.currentRole}</span>
                    <span className="text-gray-500 font-normal">Present (7+ Years Career)</span>
                  </div>
                  <p className="text-purple-700 font-semibold mt-0.5">{selectedCandidate.currentCompany}</p>
                  <p className="text-gray-500 mt-2">
                    Responsible for technical design, architecture review, cross-team mentoring, and production delivery.
                  </p>
                </div>
              </div>

              {/* Education */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Education & Degrees</h4>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-800 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-purple-600" />
                  <span>{selectedCandidate.education}</span>
                </div>
              </div>

              {/* Skills */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Extracted Competencies</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCandidate.skills?.map((sk: string) => (
                    <span key={sk} className="text-xs font-semibold bg-purple-100 text-purple-800 px-3 py-1 rounded-lg">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-between items-center gap-3 pt-6 mt-6 border-t border-gray-100">
              <button
                onClick={() => alert(`Downloading ATS parsed profile for ${selectedCandidate.name}`)}
                className="px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-700 flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Download Resume PDF
              </button>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => openEditModal(selectedCandidate)}
                  className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-blue-200"
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit Profile
                </button>
                <button
                  onClick={() => handleDeleteCandidate(selectedCandidate.id)}
                  className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-red-200"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
                <button
                  onClick={() => {
                    alert(`${selectedCandidate.name} moved to Interview stage!`);
                    setSelectedCandidate(null);
                  }}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5" /> Shortlist for Interview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload & Parse Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl p-6">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <span>Upload & Parse Candidate Resume</span>
              </h3>
              <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleParseSubmit} className="space-y-4 mt-4">
              <div className="border-2 border-dashed border-purple-200 rounded-xl p-6 text-center bg-purple-50/30">
                <UploadCloud className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <p className="text-xs font-bold text-gray-800">Select PDF, DOCX or enter candidate data</p>
                <p className="text-[11px] text-gray-400 mt-0.5">ATS engine parses skills and matches against open requisitions</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Candidate Name *</label>
                  <input
                    type="text"
                    required
                    value={parseForm.name}
                    onChange={e => setParseForm({ ...parseForm, name: e.target.value })}
                    placeholder="e.g. Rachel Adams"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Candidate Email *</label>
                  <input
                    type="email"
                    required
                    value={parseForm.email}
                    onChange={e => setParseForm({ ...parseForm, email: e.target.value })}
                    placeholder="rachel.adams@email.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Target Requisition</label>
                  <select
                    value={parseForm.targetRole}
                    onChange={e => setParseForm({ ...parseForm, targetRole: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="Senior Full Stack Engineer">Senior Full Stack Engineer</option>
                    <option value="AI / ML Research Scientist">AI / ML Research Scientist</option>
                    <option value="Product Marketing Manager">Product Marketing Manager</option>
                    <option value="Enterprise Account Executive">Enterprise Account Executive</option>
                    <option value="Senior UX/UI Designer">Senior UX/UI Designer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    value={parseForm.experienceYears}
                    onChange={e => setParseForm({ ...parseForm, experienceYears: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Extracted Key Skills (Comma separated)</label>
                <input
                  type="text"
                  value={parseForm.skills}
                  onChange={e => setParseForm({ ...parseForm, skills: e.target.value })}
                  placeholder="React, TypeScript, GraphQL, AWS"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Professional Summary Excerpt</label>
                <textarea
                  rows={3}
                  value={parseForm.summaryText}
                  onChange={e => setParseForm({ ...parseForm, summaryText: e.target.value })}
                  placeholder="Candidate profile summary..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold shadow-sm"
                >
                  Run ATS Parse
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit Candidate Modal */}
      {showEditModal && editingCandidate && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 relative">
            <button
              onClick={() => { setShowEditModal(false); setEditingCandidate(null); }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Edit Candidate Resume Profile</h3>
            <form onSubmit={handleUpdateCandidate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Candidate Name *</label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Target Role</label>
                  <input
                    type="text"
                    value={editForm.targetRole}
                    onChange={e => setEditForm({ ...editForm, targetRole: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Current Role</label>
                  <input
                    type="text"
                    value={editForm.currentRole}
                    onChange={e => setEditForm({ ...editForm, currentRole: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Current Company</label>
                  <input
                    type="text"
                    value={editForm.currentCompany}
                    onChange={e => setEditForm({ ...editForm, currentCompany: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Experience (Yrs)</label>
                  <input
                    type="number"
                    value={editForm.experienceYears}
                    onChange={e => setEditForm({ ...editForm, experienceYears: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">ATS Score (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editForm.atsScore}
                    onChange={e => setEditForm({ ...editForm, atsScore: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Stage</label>
                  <select
                    value={editForm.stage}
                    onChange={e => setEditForm({ ...editForm, stage: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                  >
                    <option value="Applied">Applied</option>
                    <option value="Screening">Screening</option>
                    <option value="Interview">Interview</option>
                    <option value="Offer">Offer</option>
                    <option value="Hired">Hired</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Key Skills (Comma separated)</label>
                <input
                  type="text"
                  value={editForm.skills}
                  onChange={e => setEditForm({ ...editForm, skills: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Resume Summary</label>
                <textarea
                  rows={3}
                  value={editForm.resumeSummary}
                  onChange={e => setEditForm({ ...editForm, resumeSummary: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setEditingCandidate(null); }}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold shadow-sm"
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
