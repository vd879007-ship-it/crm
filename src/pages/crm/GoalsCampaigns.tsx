import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Target, 
  Megaphone, 
  Plus, 
  Search, 
  Filter, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Trash2, 
  Edit3, 
  User, 
  Calendar, 
  DollarSign, 
  BarChart2, 
  Share2, 
  Percent, 
  Sparkles,
  Award,
  Layers
} from 'lucide-react';
import CRMNavigation from '../../components/CRMNavigation';

export default function GoalsCampaigns() {
  const [activeTab, setActiveTab] = useState<'goals' | 'campaigns'>('goals');
  const [goals, setGoals] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals for Goals
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<any>(null);

  // Modals for Campaigns
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<any>(null);

  // Form states
  const [goalForm, setGoalForm] = useState({
    title: '',
    targetType: 'Revenue',
    targetAmount: 0,
    achievedAmount: 0,
    period: 'Q1 2026',
    startDate: '',
    endDate: '',
    assignedTo: 'Sales Team',
    status: 'In Progress',
    notes: ''
  });

  const [campaignForm, setCampaignForm] = useState({
    name: '',
    type: 'Email Blast',
    status: 'Planning',
    budget: 0,
    actualSpend: 0,
    leadsGenerated: 0,
    conversions: 0,
    revenueGenerated: 0,
    startDate: '',
    endDate: '',
    targetAudience: 'Enterprise IT Decision Makers',
    notes: ''
  });

  const fetchData = async () => {
    try {
      const [goalsRes, campaignsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/crm/goals`),
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/crm/campaigns`)
      ]);
      setGoals(Array.isArray(goalsRes.data) ? goalsRes.data : []);
      setCampaigns(Array.isArray(campaignsRes.data) ? campaignsRes.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Goal CRUD Handlers
  const handleOpenCreateGoal = () => {
    setEditingGoal(null);
    setGoalForm({
      title: '',
      targetType: 'Revenue',
      targetAmount: 0,
      achievedAmount: 0,
      period: 'Q1 2026',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
      assignedTo: 'Enterprise Sales Team',
      status: 'In Progress',
      notes: ''
    });
    setShowGoalModal(true);
  };

  const handleOpenEditGoal = (goal: any) => {
    setEditingGoal(goal);
    setGoalForm({
      title: goal.title || '',
      targetType: goal.targetType || 'Revenue',
      targetAmount: goal.targetAmount || 0,
      achievedAmount: goal.achievedAmount || 0,
      period: goal.period || 'Q1 2026',
      startDate: goal.startDate || '',
      endDate: goal.endDate || '',
      assignedTo: goal.assignedTo || 'Sales Team',
      status: goal.status || 'In Progress',
      notes: goal.notes || ''
    });
    setShowGoalModal(true);
  };

  const handleGoalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingGoal) {
        await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/crm/goals/${editingGoal.id}`, goalForm);
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/crm/goals`, goalForm);
      }
      setShowGoalModal(false);
      setEditingGoal(null);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to save sales goal');
    }
  };

  const handleDeleteGoal = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this target goal?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/crm/goals/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to delete goal');
    }
  };

  // Campaign CRUD Handlers
  const handleOpenCreateCampaign = () => {
    setEditingCampaign(null);
    setCampaignForm({
      name: '',
      type: 'Email Blast',
      status: 'Planning',
      budget: 0,
      actualSpend: 0,
      leadsGenerated: 0,
      conversions: 0,
      revenueGenerated: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      targetAudience: 'Enterprise Decision Makers',
      notes: ''
    });
    setShowCampaignModal(true);
  };

  const handleOpenEditCampaign = (camp: any) => {
    setEditingCampaign(camp);
    setCampaignForm({
      name: camp.name || '',
      type: camp.type || 'Email Blast',
      status: camp.status || 'Planning',
      budget: camp.budget || 0,
      actualSpend: camp.actualSpend || 0,
      leadsGenerated: camp.leadsGenerated || 0,
      conversions: camp.conversions || 0,
      revenueGenerated: camp.revenueGenerated || 0,
      startDate: camp.startDate || '',
      endDate: camp.endDate || '',
      targetAudience: camp.targetAudience || '',
      notes: camp.notes || ''
    });
    setShowCampaignModal(true);
  };

  const handleCampaignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCampaign) {
        await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/crm/campaigns/${editingCampaign.id}`, campaignForm);
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/crm/campaigns`, campaignForm);
      }
      setShowCampaignModal(false);
      setEditingCampaign(null);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to save campaign');
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this marketing campaign?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/crm/campaigns/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to delete campaign');
    }
  };

  // Metrics (Zero baseline)
  const totalGoalsCount = goals.length;
  const totalQuotaSum = goals.reduce((a, b) => a + (Number(b.targetAmount) || 0), 0);
  const totalAchievedSum = goals.reduce((a, b) => a + (Number(b.achievedAmount) || 0), 0);
  const overallAttainment = totalQuotaSum > 0 ? Math.round((totalAchievedSum / totalQuotaSum) * 100) : 0;

  const totalCampaignsCount = campaigns.length;
  const totalCampaignBudget = campaigns.reduce((a, b) => a + (Number(b.budget) || 0), 0);
  const totalCampaignSpend = campaigns.reduce((a, b) => a + (Number(b.actualSpend) || 0), 0);
  const totalLeadsFromCampaigns = campaigns.reduce((a, b) => a + (Number(b.leadsGenerated) || 0), 0);
  const totalRevenueFromCampaigns = campaigns.reduce((a, b) => a + (Number(b.revenueGenerated) || 0), 0);

  const filteredGoals = goals.filter(g => 
    g.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.assignedTo?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCampaigns = campaigns.filter(c =>
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.type?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <CRMNavigation />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-purple-100 text-purple-700 rounded-xl">
              <Target className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Sales Goals & Marketing Campaigns</h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Define quota objectives, measure rep attainment, and run omnichannel marketing growth campaigns with ROI attribution.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'goals' ? (
            <button
              onClick={handleOpenCreateGoal}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>+ Set Sales Goal</span>
            </button>
          ) : (
            <button
              onClick={handleOpenCreateCampaign}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>+ Launch Campaign</span>
            </button>
          )}
        </div>
      </div>

      {/* Switcher Tabs */}
      <div className="flex items-center border-b border-gray-200">
        <button
          onClick={() => setActiveTab('goals')}
          className={`px-5 py-2.5 font-bold text-xs border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'goals'
              ? 'border-purple-600 text-purple-700 bg-purple-50/50'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Sales Goals & Quotas ({totalGoalsCount})</span>
        </button>
        <button
          onClick={() => setActiveTab('campaigns')}
          className={`px-5 py-2.5 font-bold text-xs border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'campaigns'
              ? 'border-purple-600 text-purple-700 bg-purple-50/50'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>Marketing Campaigns ({totalCampaignsCount})</span>
        </button>
      </div>

      {/* GOALS TAB */}
      {activeTab === 'goals' && (
        <div className="space-y-4">
          {/* Zero-based KPI Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Total Targets Set</span>
              <p className="text-2xl font-extrabold text-gray-900 mt-1">{totalGoalsCount}</p>
              <span className="text-[10px] text-gray-400 mt-0.5 block">Active team quotas</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-purple-200 shadow-xs">
              <span className="text-[11px] font-semibold text-purple-700 uppercase tracking-wider">Total Target Quota</span>
              <p className="text-2xl font-extrabold text-purple-700 mt-1">₹{totalQuotaSum.toLocaleString()}</p>
              <span className="text-[10px] text-purple-400 mt-0.5 block">Targeted gross revenue</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs">
              <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">Achieved Revenue</span>
              <p className="text-2xl font-extrabold text-emerald-700 mt-1">₹{totalAchievedSum.toLocaleString()}</p>
              <span className="text-[10px] text-emerald-500 mt-0.5 block">Realized closed deals</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-xs">
              <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider">Attainment Rate</span>
              <p className="text-2xl font-extrabold text-blue-700 mt-1">{overallAttainment}%</p>
              <span className="text-[10px] text-blue-400 mt-0.5 block">Quota fulfillment</span>
            </div>
          </div>

          {/* Search */}
          <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-xs">
            <div className="relative max-w-md">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search goals by title, team, assignee..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Goals Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGoals.length === 0 ? (
              <div className="col-span-full bg-white rounded-xl border border-gray-200 p-12 text-center">
                <Target className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="font-bold text-gray-700 text-sm">No sales target goals configured</p>
                <p className="text-xs text-gray-400 mt-1">Set sales targets for reps, teams, and departments to track performance attainment.</p>
                <button
                  onClick={handleOpenCreateGoal}
                  className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-xs font-semibold"
                >
                  + Set First Goal
                </button>
              </div>
            ) : (
              filteredGoals.map(goal => {
                const percent = goal.targetAmount > 0 ? Math.min(100, Math.round((goal.achievedAmount / goal.targetAmount) * 100)) : 0;
                return (
                  <div key={goal.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-gray-900">{goal.title}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        goal.status === 'Achieved' ? 'bg-emerald-100 text-emerald-700' :
                        goal.status === 'At Risk' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {goal.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>Type: <strong className="text-gray-800">{goal.targetType}</strong></span>
                      <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[10px] font-semibold">{goal.period}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-gray-500">Progress</span>
                        <span className="font-bold text-purple-700">{percent}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-purple-600 to-indigo-600 h-full rounded-full transition-all"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] pt-1">
                        <span className="font-bold text-emerald-700">₹{Number(goal.achievedAmount).toLocaleString()}</span>
                        <span className="text-gray-400">Target: ₹{Number(goal.targetAmount).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="text-[11px] text-gray-500 flex items-center justify-between pt-2 border-t border-gray-100">
                      <span>Owner: <strong>{goal.assignedTo}</strong></span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditGoal(goal)}
                          className="p-1 text-gray-400 hover:text-blue-600 rounded"
                          title="Edit Goal"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteGoal(goal.id)}
                          className="p-1 text-gray-400 hover:text-red-600 rounded"
                          title="Delete Goal"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* CAMPAIGNS TAB */}
      {activeTab === 'campaigns' && (
        <div className="space-y-4">
          {/* Zero-based KPI Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Total Campaigns</span>
              <p className="text-2xl font-extrabold text-gray-900 mt-1">{totalCampaignsCount}</p>
              <span className="text-[10px] text-gray-400 mt-0.5 block">Omnichannel marketing</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-purple-200 shadow-xs">
              <span className="text-[11px] font-semibold text-purple-700 uppercase tracking-wider">Total Budget</span>
              <p className="text-2xl font-extrabold text-purple-700 mt-1">₹{totalCampaignBudget.toLocaleString()}</p>
              <span className="text-[10px] text-purple-400 mt-0.5 block">Allocated funds</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs">
              <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">Actual Spend</span>
              <p className="text-2xl font-extrabold text-amber-700 mt-1">₹{totalCampaignSpend.toLocaleString()}</p>
              <span className="text-[10px] text-amber-500 mt-0.5 block">Ad expenditure</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs">
              <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">Leads Generated</span>
              <p className="text-2xl font-extrabold text-emerald-700 mt-1">{totalLeadsFromCampaigns}</p>
              <span className="text-[10px] text-emerald-500 mt-0.5 block">Inbound opportunities</span>
            </div>
          </div>

          {/* Search */}
          <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-xs">
            <div className="relative max-w-md">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search campaigns by name, channel..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Campaigns Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Campaign Name</th>
                  <th className="py-3 px-4">Channel / Type</th>
                  <th className="py-3 px-4">Budget</th>
                  <th className="py-3 px-4">Spend</th>
                  <th className="py-3 px-4">Leads</th>
                  <th className="py-3 px-4">Conversions</th>
                  <th className="py-3 px-4">Attributed Revenue</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCampaigns.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-gray-400">
                      <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="font-bold text-gray-700 text-sm">No campaigns active</p>
                      <p className="text-xs text-gray-400 mt-0.5">Click "+ Launch Campaign" to initiate automated email blasts, webinars or ad campaigns.</p>
                      <button
                        onClick={handleOpenCreateCampaign}
                        className="mt-3 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-xs font-semibold"
                      >
                        + Launch Campaign
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredCampaigns.map(camp => (
                    <tr key={camp.id} className="hover:bg-purple-50/20">
                      <td className="py-3 px-4 font-bold text-gray-900">{camp.name}</td>
                      <td className="py-3 px-4">
                        <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-medium text-[10px] border border-purple-200">
                          {camp.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-700">₹{Number(camp.budget).toLocaleString()}</td>
                      <td className="py-3 px-4 text-amber-700 font-medium">₹{Number(camp.actualSpend).toLocaleString()}</td>
                      <td className="py-3 px-4 font-bold text-blue-700">{camp.leadsGenerated}</td>
                      <td className="py-3 px-4 text-gray-800">{camp.conversions}</td>
                      <td className="py-3 px-4 font-bold text-emerald-700">₹{Number(camp.revenueGenerated).toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          camp.status === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                          camp.status === 'Completed' ? 'bg-gray-100 text-gray-700' :
                          camp.status === 'Paused' ? 'bg-amber-100 text-amber-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {camp.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEditCampaign(camp)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                            title="Edit Campaign"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCampaign(camp.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                            title="Delete Campaign"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* GOAL MODAL (CREATE / EDIT) */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">{editingGoal ? 'Edit Sales Goal' : 'Define Sales Target Quota'}</h3>
              <button onClick={() => setShowGoalModal(false)} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
            </div>
            <form onSubmit={handleGoalSubmit} className="space-y-3 mt-4">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Goal / Quota Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q1 Enterprise Sales Target"
                  value={goalForm.title}
                  onChange={e => setGoalForm({ ...goalForm, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Target Type</label>
                  <select
                    value={goalForm.targetType}
                    onChange={e => setGoalForm({ ...goalForm, targetType: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  >
                    <option value="Revenue">Revenue (₹)</option>
                    <option value="Deals Closed">Deals Closed</option>
                    <option value="New Leads">New Leads</option>
                    <option value="Customer Retention">Customer Retention</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Period</label>
                  <input
                    type="text"
                    placeholder="e.g. Q1 2026 / Annual"
                    value={goalForm.period}
                    onChange={e => setGoalForm({ ...goalForm, period: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Target Quota (₹ / Count) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={goalForm.targetAmount}
                    onChange={e => setGoalForm({ ...goalForm, targetAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg font-bold text-purple-700 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Current Achieved Amount</label>
                  <input
                    type="number"
                    min="0"
                    value={goalForm.achievedAmount}
                    onChange={e => setGoalForm({ ...goalForm, achievedAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg font-bold text-emerald-700 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Assigned Team / Representative</label>
                  <input
                    type="text"
                    value={goalForm.assignedTo}
                    onChange={e => setGoalForm({ ...goalForm, assignedTo: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Status</label>
                  <select
                    value={goalForm.status}
                    onChange={e => setGoalForm({ ...goalForm, status: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  >
                    <option value="In Progress">In Progress</option>
                    <option value="Achieved">Achieved</option>
                    <option value="At Risk">At Risk</option>
                    <option value="Deferred">Deferred</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowGoalModal(false)}
                  className="px-4 py-2 border rounded-xl hover:bg-gray-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-xs"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CAMPAIGN MODAL (CREATE / EDIT) */}
      {showCampaignModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">{editingCampaign ? 'Edit Campaign' : 'Launch New Campaign'}</h3>
              <button onClick={() => setShowCampaignModal(false)} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
            </div>
            <form onSubmit={handleCampaignSubmit} className="space-y-3 mt-4">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Campaign Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q3 Fintech SaaS Inbound Blitz"
                  value={campaignForm.name}
                  onChange={e => setCampaignForm({ ...campaignForm, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Channel / Type</label>
                  <select
                    value={campaignForm.type}
                    onChange={e => setCampaignForm({ ...campaignForm, type: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  >
                    <option value="Email Blast">Email Blast</option>
                    <option value="LinkedIn Ads">LinkedIn Ads</option>
                    <option value="Google Search">Google Search</option>
                    <option value="Cold Outreach">Cold Outreach</option>
                    <option value="Webinar">Webinar</option>
                    <option value="Trade Show">Trade Show / Event</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Status</label>
                  <select
                    value={campaignForm.status}
                    onChange={e => setCampaignForm({ ...campaignForm, status: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  >
                    <option value="Planning">Planning</option>
                    <option value="Active">Active</option>
                    <option value="Paused">Paused</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Budget (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={campaignForm.budget}
                    onChange={e => setCampaignForm({ ...campaignForm, budget: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Actual Spend (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={campaignForm.actualSpend}
                    onChange={e => setCampaignForm({ ...campaignForm, actualSpend: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Leads Generated</label>
                  <input
                    type="number"
                    min="0"
                    value={campaignForm.leadsGenerated}
                    onChange={e => setCampaignForm({ ...campaignForm, leadsGenerated: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Conversions</label>
                  <input
                    type="number"
                    min="0"
                    value={campaignForm.conversions}
                    onChange={e => setCampaignForm({ ...campaignForm, conversions: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Revenue Attributed (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={campaignForm.revenueGenerated}
                    onChange={e => setCampaignForm({ ...campaignForm, revenueGenerated: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none font-bold text-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Target Audience</label>
                <input
                  type="text"
                  value={campaignForm.targetAudience}
                  onChange={e => setCampaignForm({ ...campaignForm, targetAudience: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowCampaignModal(false)}
                  className="px-4 py-2 border rounded-xl hover:bg-gray-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-xs"
                >
                  Save Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
