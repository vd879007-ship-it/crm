import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Compass, Plus, Search, Filter, Globe, Users, ExternalLink, Pencil, Trash2, 
  Tag, Briefcase, Mail, Phone, DollarSign, Sparkles, CheckCircle2, 
  X, ArrowRight, BarChart2
} from 'lucide-react';

export default function CandidateSourcing() {
  const [channels, setChannels] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [channelFilter, setChannelFilter] = useState('All');
  const [showAddCandidateModal, setShowAddCandidateModal] = useState(false);
  const [showAddCampaignModal, setShowAddCampaignModal] = useState(false);
  const [showEditCandidateModal, setShowEditCandidateModal] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<any>(null);
  const [editCandidateForm, setEditCandidateForm] = useState({
    name: '',
    email: '',
    phone: '',
    currentRole: '',
    currentCompany: '',
    experienceYears: 4,
    source: 'LinkedIn Recruiter',
    skills: '',
    notes: '',
    requisitionId: 'REQ-2026-001',
    stage: 'Sourced'
  });

  const [showEditCampaignModal, setShowEditCampaignModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<any>(null);
  const [editCampaignForm, setEditCampaignForm] = useState({
    name: '',
    requisitionId: 'REQ-2026-001',
    channels: ['LinkedIn Recruiter'],
    budget: 3000,
    startDate: '',
    endDate: '',
    status: 'Active'
  });

  const handleOpenEditCandidate = (c: any) => {
    setEditingCandidate(c);
    setEditCandidateForm({
      name: c.name || '',
      email: c.email || '',
      phone: c.phone || '',
      currentRole: c.currentRole || '',
      currentCompany: c.currentCompany || '',
      experienceYears: c.experienceYears || 4,
      source: c.source || 'LinkedIn Recruiter',
      skills: Array.isArray(c.skills) ? c.skills.join(', ') : (c.skills || ''),
      notes: c.statusNote || c.notes || '',
      requisitionId: c.requisitionId || 'REQ-2026-001',
      stage: c.stage || 'Sourced'
    });
    setShowEditCandidateModal(true);
  };

  const handleEditCandidateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCandidate) return;
    const payload = {
      ...editCandidateForm,
      skills: editCandidateForm.skills.split(',').map(s => s.trim())
    };
    try {
      const res = await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/recruitment/sourcing/candidates/${editingCandidate.id}`, payload);
      setCandidates(candidates.map(c => c.id === editingCandidate.id ? res.data : c));
      setShowEditCandidateModal(false);
    } catch (err) {
      setCandidates(candidates.map(c => c.id === editingCandidate.id ? { ...c, ...payload } : c));
      setShowEditCandidateModal(false);
    }
  };

  const handleDeleteCandidate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this candidate?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/recruitment/sourcing/candidates/${id}`);
      setCandidates(candidates.filter(c => c.id !== id));
    } catch (err) {
      setCandidates(candidates.filter(c => c.id !== id));
    }
  };

  const handleOpenEditCampaign = (cmp: any) => {
    setEditingCampaign(cmp);
    setEditCampaignForm({
      name: cmp.name || '',
      requisitionId: cmp.requisitionId || 'REQ-2026-001',
      channels: cmp.channels || ['LinkedIn Recruiter'],
      budget: cmp.budget || 3000,
      startDate: cmp.startDate || '',
      endDate: cmp.endDate || '',
      status: cmp.status || 'Active'
    });
    setShowEditCampaignModal(true);
  };

  const handleEditCampaignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCampaign) return;
    try {
      const res = await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/recruitment/sourcing/campaigns/${editingCampaign.id}`, editCampaignForm);
      setCampaigns(campaigns.map(c => c.id === editingCampaign.id ? res.data : c));
      setShowEditCampaignModal(false);
    } catch (err) {
      setCampaigns(campaigns.map(c => c.id === editingCampaign.id ? { ...c, ...editCampaignForm } : c));
      setShowEditCampaignModal(false);
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!confirm('Delete this sourcing campaign?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/recruitment/sourcing/campaigns/${id}`);
      setCampaigns(campaigns.filter(c => c.id !== id));
    } catch (err) {
      setCampaigns(campaigns.filter(c => c.id !== id));
    }
  };

  const [newCandidate, setNewCandidate] = useState({
    name: '',
    email: '',
    phone: '',
    currentRole: '',
    currentCompany: '',
    experienceYears: 4,
    source: 'LinkedIn Recruiter',
    skills: 'React, TypeScript, Node.js',
    notes: '',
    requisitionId: 'REQ-2026-001'
  });

  const [newCampaign, setNewCampaign] = useState({
    name: '',
    requisitionId: 'REQ-2026-001',
    channels: ['LinkedIn Recruiter'],
    budget: 3000,
    startDate: '2026-10-01',
    endDate: '2026-11-15'
  });

  const fetchData = async () => {
    try {
      const [chRes, cmpRes, candRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/recruitment/sourcing/channels`),
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/recruitment/sourcing/campaigns`),
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/recruitment/resumes`)
      ]);
      setChannels(chRes.data);
      setCampaigns(cmpRes.data);
      setCandidates(candRes.data);
    } catch (err) {
      console.error(err);
      setChannels([
        { id: 'SC-1', name: 'LinkedIn Recruiter', type: 'Job Board', candidatesCount: 0, costSpent: 0, hiredCount: 0, efficiencyScore: 0 },
        { id: 'SC-2', name: 'Employee Referrals', type: 'Internal', candidatesCount: 0, costSpent: 0, hiredCount: 0, efficiencyScore: 0 },
        { id: 'SC-3', name: 'Indeed Sponsored', type: 'Job Board', candidatesCount: 0, costSpent: 0, hiredCount: 0, efficiencyScore: 0 },
        { id: 'SC-4', name: 'GitHub & Outbound Sourcing', type: 'Outbound', candidatesCount: 0, costSpent: 0, hiredCount: 0, efficiencyScore: 0 },
        { id: 'SC-5', name: 'Campus & Tech Talks', type: 'Events', candidatesCount: 0, costSpent: 0, hiredCount: 0, efficiencyScore: 0 }
      ]);
      setCampaigns([]);
      setCandidates([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/recruitment/sourcing/candidates`, {
        ...newCandidate,
        skills: newCandidate.skills.split(',').map(s => s.trim())
      });
      setCandidates([res.data, ...candidates]);
      setShowAddCandidateModal(false);
      setNewCandidate({
        name: '',
        email: '',
        phone: '',
        currentRole: '',
        currentCompany: '',
        experienceYears: 4,
        source: 'LinkedIn Recruiter',
        skills: 'React, TypeScript, Node.js',
        notes: '',
        requisitionId: 'REQ-2026-001'
      });
    } catch (err) {
      console.error(err);
      const mockCan = {
        id: `CAN-${String(candidates.length + 1).padStart(3, '0')}`,
        ...newCandidate,
        skills: newCandidate.skills.split(',').map(s => s.trim()),
        stage: 'Sourced'
      };
      setCandidates([mockCan, ...candidates]);
      setShowAddCandidateModal(false);
    }
  };

  const handleAddCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/recruitment/sourcing/campaigns`, newCampaign);
      setCampaigns([res.data, ...campaigns]);
      setShowAddCampaignModal(false);
    } catch (err) {
      const mockCmp = {
        id: `CMP-${Math.floor(100 + Math.random() * 900)}`,
        ...newCampaign,
        spent: 0,
        leadsGenerated: 0,
        qualifiedLeads: 0,
        status: 'Active'
      };
      setCampaigns([mockCmp, ...campaigns]);
      setShowAddCampaignModal(false);
    }
  };

  const filteredCandidates = candidates.filter(c => {
    const matchesSearch = c.name?.toLowerCase().includes(search.toLowerCase()) ||
                          c.currentCompany?.toLowerCase().includes(search.toLowerCase()) ||
                          c.skills?.some((sk: string) => sk.toLowerCase().includes(search.toLowerCase()));
    const matchesChannel = channelFilter === 'All' || c.source === channelFilter;
    return matchesSearch && matchesChannel;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Compass className="w-6 h-6 text-teal-600" />
            <span>Candidate Sourcing Hub</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Omni-channel talent acquisition across LinkedIn, Referrals, Inbound Portals & Outbound Sourcing
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowAddCampaignModal(true)}
            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3.5 py-2 rounded-xl font-semibold text-sm shadow-xs flex items-center transition-all cursor-pointer"
          >
            <BarChart2 className="w-4 h-4 mr-1.5 text-teal-600" />
            Launch Campaign
          </button>
          <button
            onClick={() => setShowAddCandidateModal(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-sm flex items-center transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Sourced Talent
          </button>
        </div>
      </div>

      {/* Sourcing Channel Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {channels.map((ch) => (
          <div key={ch.id} className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs hover:border-teal-500/40 transition-all">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold text-gray-800 line-clamp-1">{ch.name}</span>
              <span className="text-[10px] font-semibold bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded">
                {ch.efficiencyScore}% Eff.
              </span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-xl font-black text-gray-900">{ch.candidatesCount}</span>
              <span className="text-xs font-semibold text-emerald-600">{ch.hiredCount} Hires</span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">${ch.costSpent} spent</p>
          </div>
        ))}
      </div>

      {/* Sourcing Campaigns Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-base font-bold text-gray-900">Active Sourcing Campaigns</h3>
            <p className="text-xs text-gray-500">Targeted recruitment marketing drives and budget utilization</p>
          </div>
          <button 
            onClick={() => setShowAddCampaignModal(true)}
            className="text-xs font-bold text-teal-600 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> New Campaign
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {campaigns.length === 0 ? (
            <div className="p-8 text-center bg-gray-50/70 rounded-xl border border-gray-100 col-span-2">
              <p className="text-xs font-bold text-gray-600">No active sourcing campaigns</p>
              <p className="text-[11px] text-gray-400 mt-1">Click 'Launch Campaign' above to begin a sourcing drive.</p>
            </div>
          ) : (
            campaigns.map((cmp) => {
              const budgetPct = Math.min(100, Math.round((cmp.spent / cmp.budget) * 100));
              return (
                <div key={cmp.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-sm text-gray-900">{cmp.name}</h4>
                        <span className="text-xs font-mono text-teal-700 font-semibold">{cmp.requisitionId}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full uppercase">
                          {cmp.status}
                        </span>
                        <button
                          onClick={() => handleOpenEditCampaign(cmp)}
                          className="p-1 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded transition-colors"
                          title="Edit Campaign"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCampaign(cmp.id)}
                          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete Campaign"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {cmp.channels?.map((c: string) => (
                        <span key={c} className="text-[10px] bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded-md font-medium">
                          {c}
                        </span>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
                      <div>
                        <span className="text-gray-400 block">Total Sourced</span>
                        <span className="font-bold text-gray-900 text-sm">{cmp.leadsGenerated} leads</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block">Qualified Ratio</span>
                        <span className="font-bold text-teal-700 text-sm">{cmp.qualifiedLeads} verified</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-200/60">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Budget Spent: ${cmp.spent}</span>
                      <span className="font-bold text-gray-700">${cmp.budget}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div className="bg-teal-600 h-2 rounded-full" style={{ width: `${budgetPct}%` }} />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Sourced Talent Pool Directory */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search talent by skill, company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-xs text-gray-500 font-medium">Channel:</span>
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="text-xs border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white text-gray-700"
            >
              <option value="All">All Channels</option>
              <option value="LinkedIn Recruiter">LinkedIn Recruiter</option>
              <option value="Employee Referrals">Employee Referrals</option>
              <option value="Indeed Sponsored">Indeed Sponsored</option>
              <option value="GitHub & Outbound Sourcing">GitHub & Outbound</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50/80 text-gray-500 font-semibold border-b border-gray-200 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Candidate & Current Role</th>
                <th className="py-3 px-4">Target Position</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4">Experience</th>
                <th className="py-3 px-4">Skills Extracted</th>
                <th className="py-3 px-4">ATS Stage</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCandidates.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-gray-900 text-sm">{c.name}</div>
                    <div className="text-gray-500 text-[11px]">{c.currentRole} • {c.currentCompany}</div>
                    <div className="text-gray-400 text-[10px] mt-0.5">{c.email}</div>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-gray-800">
                    {c.targetRole}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="bg-teal-50 text-teal-700 font-semibold px-2 py-0.5 rounded-full text-[10px]">
                      {c.source}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-gray-600 font-medium">
                    {c.experienceYears} Years
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {c.skills?.slice(0, 3).map((sk: string) => (
                        <span key={sk} className="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded text-[10px]">
                          {sk}
                        </span>
                      ))}
                      {c.skills?.length > 3 && (
                        <span className="text-[10px] text-gray-400 font-semibold">+{c.skills.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      c.stage === 'Hired' ? 'bg-emerald-100 text-emerald-800' :
                      c.stage === 'Offer' ? 'bg-purple-100 text-purple-800' :
                      c.stage === 'Interview' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {c.stage || 'Sourced'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEditCandidate(c)}
                        className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit Candidate Profile"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCandidate(c.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Candidate"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => alert(`Candidate ${c.name} pushed to ATS Pipeline!`)}
                      className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold rounded-lg text-[11px] transition-colors cursor-pointer"
                    >
                      Push to Pipeline
                    </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCandidates.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-gray-400">
                    No sourced candidates found. Click 'Add Sourced Talent' to add candidates.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Sourced Candidate Modal */}
      {showEditCandidateModal && editingCandidate && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Edit Sourced Candidate ({editingCandidate.id})</h3>
              <button onClick={() => setShowEditCandidateModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditCandidateSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editCandidateForm.name}
                    onChange={(e) => setEditCandidateForm({ ...editCandidateForm, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={editCandidateForm.email}
                    onChange={(e) => setEditCandidateForm({ ...editCandidateForm, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Current Role</label>
                  <input
                    type="text"
                    value={editCandidateForm.currentRole}
                    onChange={(e) => setEditCandidateForm({ ...editCandidateForm, currentRole: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Current Company</label>
                  <input
                    type="text"
                    value={editCandidateForm.currentCompany}
                    onChange={(e) => setEditCandidateForm({ ...editCandidateForm, currentCompany: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Source Channel</label>
                  <select
                    value={editCandidateForm.source}
                    onChange={(e) => setEditCandidateForm({ ...editCandidateForm, source: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                  >
                    <option value="LinkedIn Recruiter">LinkedIn Recruiter</option>
                    <option value="Employee Referrals">Employee Referrals</option>
                    <option value="Indeed Sponsored">Indeed Sponsored</option>
                    <option value="GitHub & Outbound Sourcing">GitHub & Outbound</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Pipeline Stage</label>
                  <select
                    value={editCandidateForm.stage}
                    onChange={(e) => setEditCandidateForm({ ...editCandidateForm, stage: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                  >
                    <option value="Sourced">Sourced</option>
                    <option value="Applied">Applied</option>
                    <option value="Screened">Screened</option>
                    <option value="Interview">Interview</option>
                    <option value="Screening">Screening</option>
                    <option value="Offer">Offer</option>
                    <option value="Hired">Hired</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Skills (comma separated)</label>
                <input
                  type="text"
                  value={editCandidateForm.skills}
                  onChange={(e) => setEditCandidateForm({ ...editCandidateForm, skills: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowEditCandidateModal(false)}
                  className="px-4 py-2 border rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-bold shadow-sm"
                >
                  Save Candidate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Campaign Modal */}
      {showEditCampaignModal && editingCampaign && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Edit Campaign ({editingCampaign.id})</h3>
              <button onClick={() => setShowEditCampaignModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditCampaignSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Campaign Title</label>
                <input
                  type="text"
                  required
                  value={editCampaignForm.name}
                  onChange={(e) => setEditCampaignForm({ ...editCampaignForm, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Allocated Budget ($)</label>
                  <input
                    type="number"
                    value={editCampaignForm.budget}
                    onChange={(e) => setEditCampaignForm({ ...editCampaignForm, budget: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
                  <select
                    value={editCampaignForm.status}
                    onChange={(e) => setEditCampaignForm({ ...editCampaignForm, status: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                    <option value="Paused">Paused</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowEditCampaignModal(false)}
                  className="px-4 py-2 border rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-bold shadow-sm"
                >
                  Save Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Sourced Candidate Modal */}
      {showAddCandidateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Add Sourced Candidate</h3>
              <button onClick={() => setShowAddCandidateModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCandidate} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newCandidate.name}
                    onChange={e => setNewCandidate({ ...newCandidate, name: e.target.value })}
                    placeholder="Candidate name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={newCandidate.email}
                    onChange={e => setNewCandidate({ ...newCandidate, email: e.target.value })}
                    placeholder="candidate@company.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Current Company</label>
                  <input
                    type="text"
                    value={newCandidate.currentCompany}
                    onChange={e => setNewCandidate({ ...newCandidate, currentCompany: e.target.value })}
                    placeholder="e.g. Google, Microsoft, Startup"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Current Role</label>
                  <input
                    type="text"
                    value={newCandidate.currentRole}
                    onChange={e => setNewCandidate({ ...newCandidate, currentRole: e.target.value })}
                    placeholder="e.g. Senior Backend Engineer"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Source Channel</label>
                  <select
                    value={newCandidate.source}
                    onChange={e => setNewCandidate({ ...newCandidate, source: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="LinkedIn Recruiter">LinkedIn Recruiter</option>
                    <option value="Employee Referrals">Employee Referrals</option>
                    <option value="Indeed Sponsored">Indeed Sponsored</option>
                    <option value="GitHub & Outbound Sourcing">GitHub & Outbound Sourcing</option>
                    <option value="Direct Outreach">Direct Outreach</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Years of Experience</label>
                  <input
                    type="number"
                    value={newCandidate.experienceYears}
                    onChange={e => setNewCandidate({ ...newCandidate, experienceYears: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Key Skills (Comma separated)</label>
                <input
                  type="text"
                  value={newCandidate.skills}
                  onChange={e => setNewCandidate({ ...newCandidate, skills: e.target.value })}
                  placeholder="React, Python, AWS, Docker"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Recruiter Notes / Outreach Status</label>
                <textarea
                  rows={3}
                  value={newCandidate.notes}
                  onChange={e => setNewCandidate({ ...newCandidate, notes: e.target.value })}
                  placeholder="Notes from initial outreach message or referral endorsement..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddCandidateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-bold shadow-sm"
                >
                  Add Candidate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Campaign Modal */}
      {showAddCampaignModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Launch Sourcing Campaign</h3>
              <button onClick={() => setShowAddCampaignModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCampaign} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Campaign Name *</label>
                <input
                  type="text"
                  required
                  value={newCampaign.name}
                  onChange={e => setNewCampaign({ ...newCampaign, name: e.target.value })}
                  placeholder="e.g. Q4 Data Engineers Surge"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Requisition Code</label>
                  <input
                    type="text"
                    value={newCampaign.requisitionId}
                    onChange={e => setNewCampaign({ ...newCampaign, requisitionId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Budget Allocation ($)</label>
                  <input
                    type="number"
                    value={newCampaign.budget}
                    onChange={e => setNewCampaign({ ...newCampaign, budget: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddCampaignModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-bold shadow-sm"
                >
                  Start Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
