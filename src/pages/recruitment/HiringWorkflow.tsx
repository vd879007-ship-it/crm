import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  GitBranch, Plus, Search, Filter, GripVertical, 
  Sparkles, CheckCircle2, User, ArrowRight, X, Eye, 
  Mail, Award, ShieldCheck, Pencil, Trash2
} from 'lucide-react';

export default function HiringWorkflow() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [stages, setStages] = useState<string[]>([
    'Sourced', 'Applied', 'Screened', 'Interview', 'Screening', 'Offer', 'Hired'
  ]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    targetRole: '',
    currentCompany: '',
    stage: 'Sourced',
    statusNote: '',
    atsScore: 85
  });

  const handleOpenEdit = (c: any) => {
    setEditingCandidate(c);
    setEditForm({
      name: c.name || '',
      targetRole: c.targetRole || '',
      currentCompany: c.currentCompany || '',
      stage: c.stage || 'Sourced',
      statusNote: c.statusNote || '',
      atsScore: c.atsScore || 85
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCandidate) return;
    try {
      const res = await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/recruitment/sourcing/candidates/${editingCandidate.id}`, editForm);
      setCandidates(candidates.map(c => c.id === editingCandidate.id ? res.data : c));
      if (selectedCandidate?.id === editingCandidate.id) setSelectedCandidate(res.data);
      setShowEditModal(false);
    } catch (err) {
      setCandidates(candidates.map(c => c.id === editingCandidate.id ? { ...c, ...editForm } : c));
      if (selectedCandidate?.id === editingCandidate.id) setSelectedCandidate({ ...selectedCandidate, ...editForm });
      setShowEditModal(false);
    }
  };

  const handleDeleteCandidate = async (id: string) => {
    if (!confirm('Are you sure you want to remove this candidate from the ATS workflow?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/recruitment/sourcing/candidates/${id}`);
      setCandidates(candidates.filter(c => c.id !== id));
      if (selectedCandidate?.id === id) setSelectedCandidate(null);
    } catch (err) {
      setCandidates(candidates.filter(c => c.id !== id));
      if (selectedCandidate?.id === id) setSelectedCandidate(null);
    }
  };

  const fetchWorkflow = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/recruitment/workflow`);
      setCandidates(res.data.candidates || []);
      if (res.data.stages) setStages(res.data.stages);
    } catch (err) {
      console.error(err);
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflow();
  }, []);

  const handleStageChange = async (candidateId: string, newStage: string) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/recruitment/workflow/${candidateId}/stage`, { stage: newStage });
      setCandidates(candidates.map(c => c.id === candidateId ? { ...c, stage: newStage } : c));
    } catch (err) {
      setCandidates(candidates.map(c => c.id === candidateId ? { ...c, stage: newStage } : c));
    }
  };

  const filteredCandidates = candidates.filter(c => {
    const matchesSearch = c.name?.toLowerCase().includes(search.toLowerCase()) ||
                          c.targetRole?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'All' || c.targetRole === roleFilter;
    return matchesSearch && matchesRole;
  });

  const stageLabels: Record<string, { label: string, color: string }> = {
    'Sourced': { label: '1. Sourced', color: 'border-t-teal-500' },
    'Applied': { label: '2. Applied', color: 'border-t-blue-500' },
    'Screened': { label: '3. Screened', color: 'border-t-indigo-500' },
    'Interview': { label: '4. Interview', color: 'border-t-purple-500' },
    'Screening': { label: '5. Background Check', color: 'border-t-rose-500' },
    'Offer': { label: '6. Offer Extended', color: 'border-t-cyan-500' },
    'Hired': { label: '7. Hired & Ready', color: 'border-t-emerald-500' }
  };

  return (
    <div className="h-full flex flex-col space-y-4 max-w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <GitBranch className="w-6 h-6 text-fuchsia-600" />
            <span>Hiring Workflow Management</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Visual ATS Kanban pipeline with automated milestone transitions and stage velocity tracking
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-48 sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search candidate..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-fuchsia-500"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white text-gray-700"
          >
            <option value="All">All Open Roles</option>
            <option value="Senior Full Stack Engineer">Senior Full Stack Engineer</option>
            <option value="AI / ML Research Scientist">AI / ML Research Scientist</option>
            <option value="Product Marketing Manager">Product Marketing Manager</option>
            <option value="Enterprise Account Executive">Enterprise Account Executive</option>
            <option value="Senior UX/UI Designer">Senior UX/UI Designer</option>
          </select>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max h-[calc(100vh-230px)]">
          {stages.map((stage) => {
            const stageConfig = stageLabels[stage] || { label: stage, color: 'border-t-gray-400' };
            const columnCandidates = filteredCandidates.filter(c => (c.stage || 'Sourced') === stage);
            
            return (
              <div
                key={stage}
                className={`w-72 sm:w-80 bg-gray-100/70 rounded-xl border border-gray-200 border-t-4 ${stageConfig.color} flex flex-col shadow-xs`}
              >
                {/* Column Header */}
                <div className="p-3 border-b border-gray-200 bg-white/70 rounded-t-lg flex justify-between items-center">
                  <h3 className="font-bold text-xs sm:text-sm text-gray-800">{stageConfig.label}</h3>
                  <span className="bg-gray-200/80 text-gray-700 text-xs py-0.5 px-2 rounded-full font-bold">
                    {columnCandidates.length}
                  </span>
                </div>

                {/* Candidate Cards Column Body */}
                <div className="p-3 flex-1 overflow-y-auto space-y-3">
                  {columnCandidates.map((cand) => (
                    <div
                      key={cand.id}
                      className="bg-white p-4 rounded-xl border border-gray-200/90 shadow-xs hover:shadow-md hover:border-fuchsia-500/40 transition-all group relative cursor-pointer"
                      onClick={() => setSelectedCandidate(cand)}
                    >
                      {/* Top Row */}
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-1.5">
                          <GripVertical className="w-3.5 h-3.5 text-gray-300" />
                          <h4 className="font-bold text-sm text-gray-900 group-hover:text-fuchsia-700 transition-colors">
                            {cand.name}
                          </h4>
                        </div>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5 ${
                          cand.atsScore >= 90 ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
                        }`}>
                          <Sparkles className="w-2.5 h-2.5" />
                          {cand.atsScore}%
                        </span>
                      </div>

                      <p className="text-xs text-gray-600 font-semibold pl-5">
                        {cand.targetRole}
                      </p>
                      <p className="text-[11px] text-gray-400 pl-5 mt-0.5">
                        {cand.currentCompany}
                      </p>

                      <div className="pl-5 mt-3 flex flex-wrap gap-1">
                        {cand.skills?.slice(0, 3).map((sk: string) => (
                          <span key={sk} className="text-[9px] font-medium bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                            {sk}
                          </span>
                        ))}
                      </div>

                      {/* Status note */}
                      {cand.statusNote && (
                        <p className="pl-5 text-[11px] text-gray-500 italic mt-2.5 line-clamp-1 border-t border-gray-100 pt-2">
                          "{cand.statusNote}"
                        </p>
                      )}

                      {/* Stage Selector Dropdown */}
                      <div 
                        className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between pl-5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="text-[10px] text-gray-400 uppercase font-semibold">Move Stage:</span>
                        <select
                          value={cand.stage}
                          onChange={(e) => handleStageChange(cand.id, e.target.value)}
                          className="text-[11px] border border-gray-200 rounded px-1.5 py-0.5 bg-gray-50 text-gray-700 font-semibold"
                        >
                          {stages.map(st => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}

                  {columnCandidates.length === 0 && (
                    <div className="py-8 text-center text-xs text-gray-400 border border-dashed border-gray-200 rounded-lg">
                      No candidates in this stage
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Candidate Drawer / Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl p-6">
            <div className="flex justify-between items-start pb-4 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-gray-900">{selectedCandidate.name}</h3>
                      <button
                        onClick={() => handleOpenEdit(selectedCandidate)}
                        className="p-1 text-gray-400 hover:text-fuchsia-600 hover:bg-fuchsia-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit Candidate Details"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCandidate(selectedCandidate.id)}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Candidate"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  <span className="text-xs font-black bg-fuchsia-100 text-fuchsia-800 px-2 py-0.5 rounded-full">
                    {selectedCandidate.atsScore}% ATS Match
                  </span>
                </div>
                <p className="text-xs text-fuchsia-700 font-semibold mt-0.5">
                  {selectedCandidate.targetRole}
                </p>
              </div>

              <button onClick={() => setSelectedCandidate(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 mt-4 text-xs">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
                <p><strong>Current Company:</strong> {selectedCandidate.currentCompany}</p>
                <p><strong>Email:</strong> {selectedCandidate.email}</p>
                <p><strong>Sourcing Channel:</strong> {selectedCandidate.source}</p>
                <p><strong>Recruitment Stage:</strong> <span className="font-bold text-fuchsia-700">{selectedCandidate.stage}</span></p>
              </div>

              <div>
                <h4 className="font-bold text-gray-700 mb-1.5">Candidate Skills</h4>
                <div className="flex flex-wrap gap-1">
                  {selectedCandidate.skills?.map((sk: string) => (
                    <span key={sk} className="bg-fuchsia-50 text-fuchsia-700 px-2 py-0.5 rounded font-semibold text-[11px]">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-700 mb-1">Status Notes & Hiring Feedback</h4>
                <p className="p-3 bg-fuchsia-50/40 rounded-xl border border-fuchsia-100 text-gray-700 italic">
                  {selectedCandidate.statusNote || 'No specific notes recorded yet.'}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-gray-700 mb-1">Transition Pipeline Stage</h4>
                <div className="grid grid-cols-4 gap-1.5">
                  {stages.map(st => (
                    <button
                      key={st}
                      onClick={() => {
                        handleStageChange(selectedCandidate.id, st);
                        setSelectedCandidate({ ...selectedCandidate, stage: st });
                      }}
                      className={`py-1.5 px-2 rounded-lg text-center font-bold text-[10px] transition-colors cursor-pointer ${
                        selectedCandidate.stage === st 
                          ? 'bg-fuchsia-600 text-white shadow-xs' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-5 mt-5 border-t border-gray-100">
              <button
                onClick={() => setSelectedCandidate(null)}
                className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
