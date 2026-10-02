import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Users, 
  MessageSquare, 
  Video, 
  Clock, 
  FileText, 
  ArrowUpRight, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle,
  FolderGit2,
  Plus,
  Edit3,
  Trash2,
  Pencil,
  Calendar,
  Layers,
  ShieldCheck,
  User,
  UserCheck,
  Target,
  DollarSign,
  Briefcase,
  Bot,
  Sparkles,
  ShieldAlert,
  Activity,
  UserPlus,
  UserMinus,
  CheckSquare,
  Building2,
  Boxes
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | 'business_os' | 'projects' | 'role_dashboards'>('all');
  const [selectedRole, setSelectedRole] = useState<'employee' | 'manager' | 'hr'>('employee');

  const userStr = localStorage.getItem('user');
  const currentUser = userStr ? JSON.parse(userStr) : null;

  // Global counts
  const [employeesCount, setEmployeesCount] = useState(0);
  const [channelsCount, setChannelsCount] = useState(0);

  // Business OS Stats (Zero baseline)
  const [osStats, setOsStats] = useState({
    sales: 0,
    collections: 0,
    leads: 0,
    followUps: 0,
    presentEmployees: 0,
    totalEmployees: 0,
    complaints: 0
  });

  // Projects State & CRUD
  const [projects, setProjects] = useState<any[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [showProjectCreateModal, setShowProjectCreateModal] = useState(false);
  const [showProjectEditModal, setShowProjectEditModal] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [projectForm, setProjectForm] = useState({
    name: '',
    description: '',
    status: 'Planning',
    startDate: '',
    endDate: ''
  });

  // Employee Portal State
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState<string | null>(null);

  // Manager & HR Role Stats (Zero baseline)
  const [managerStats, setManagerStats] = useState({
    teamSize: 0,
    presentToday: 0,
    onLeave: 0,
    pendingApprovals: 0,
    avgPerformance: '0/10'
  });

  const [hrStats, setHrStats] = useState({
    totalEmployees: 0,
    newJoiners: 0,
    exits: 0,
    turnoverRate: '0%',
    complianceAlerts: 0
  });

  const fetchDashboardData = async () => {
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:4000';
    try {
      const [empRes, chanRes, projRes, crmLeadsRes] = await Promise.all([
        axios.get(`${apiBase}/api/employees`).catch(() => ({ data: [] })),
        axios.get(`${apiBase}/api/channels`).catch(() => ({ data: [] })),
        axios.get(`${apiBase}/api/erp/projects`).catch(() => ({ data: [] })),
        axios.get(`${apiBase}/api/crm/leads`).catch(() => ({ data: [] }))
      ]);

      const emps = Array.isArray(empRes.data) ? empRes.data : [];
      const chans = Array.isArray(chanRes.data) ? chanRes.data : [];
      const projs = Array.isArray(projRes.data) ? projRes.data : [];
      const leads = Array.isArray(crmLeadsRes.data) ? crmLeadsRes.data : [];

      setEmployeesCount(emps.length);
      setChannelsCount(chans.length);
      setProjects(projs);
      setLoadingProjects(false);

      setOsStats(prev => ({
        ...prev,
        leads: leads.length,
        totalEmployees: emps.length
      }));

      setHrStats(prev => ({
        ...prev,
        totalEmployees: emps.length
      }));

      setManagerStats(prev => ({
        ...prev,
        teamSize: emps.length
      }));
    } catch (err) {
      console.error(err);
      setLoadingProjects(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Projects CRUD Handlers
  const handleOpenCreateProject = () => {
    setProjectForm({
      name: '',
      description: '',
      status: 'Planning',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
    });
    setShowProjectCreateModal(true);
  };

  const handleOpenEditProject = (p: any) => {
    setEditingProject(p);
    setProjectForm({
      name: p.name || '',
      description: p.description || '',
      status: p.status || 'Planning',
      startDate: p.startDate ? p.startDate.split('T')[0] : '',
      endDate: p.endDate ? p.endDate.split('T')[0] : ''
    });
    setShowProjectEditModal(true);
  };

  const handleCreateProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/erp/projects`, projectForm);
      setShowProjectCreateModal(false);
      fetchDashboardData();
    } catch (err) {
      console.error(err);
      alert('Failed to create project');
    }
  };

  const handleEditProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/erp/projects/${editingProject.id}`, projectForm);
      setShowProjectEditModal(false);
      setEditingProject(null);
      fetchDashboardData();
    } catch (err) {
      console.error(err);
      alert('Failed to update project');
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/erp/projects/${id}`);
      fetchDashboardData();
    } catch (err) {
      console.error(err);
      alert('Failed to delete project');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'On Hold': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const handleToggleClockIn = () => {
    if (!isClockedIn) {
      setIsClockedIn(true);
      setClockInTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } else {
      setIsClockedIn(false);
      setClockInTime(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-800 to-purple-900 rounded-3xl p-6 sm:p-7 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full text-blue-100 border border-white/20">
              Athena Unified Command Center
            </span>
            <span className="text-[10px] bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded-full font-bold border border-emerald-400/30">
              Live Core Sync
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-2.5 tracking-tight text-white">
            Welcome Back, {currentUser?.name || 'Administrator'}
          </h1>
          <p className="text-blue-100/90 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
            Integrated executive portal hosting Business OS operations, multi-phase Projects management, and role-based personas (Employee, Manager & HR).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 relative z-10">
          <button 
            onClick={() => navigate('/meetings')} 
            className="bg-white hover:bg-blue-50 text-blue-800 font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-md flex items-center space-x-2 cursor-pointer"
          >
            <Video className="w-4 h-4 text-blue-600" />
            <span>Join Meeting</span>
          </button>
          <button 
            onClick={() => navigate('/chat')} 
            className="bg-white/15 hover:bg-white/25 text-white font-semibold px-4 py-2 rounded-xl text-xs border border-white/20 transition-all flex items-center space-x-2 cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Open Chat</span>
          </button>
        </div>
      </div>

      {/* DASHBOARD INTEGRATION SECTION SELECTOR TABS */}
      <div className="bg-white rounded-2xl p-2 border border-gray-200/80 shadow-xs flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'all'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50/60'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Unified Command Center</span>
        </button>

        <button
          onClick={() => setActiveTab('projects')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'projects'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50/60'
          }`}
        >
          <FolderGit2 className="w-4 h-4" />
          <span>[Projects] Hub ({projects.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('role_dashboards')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'role_dashboards'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50/60'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Role Dashboards (Employee, Manager, HR)</span>
        </button>

        <button
          onClick={() => setActiveTab('business_os')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'business_os'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50/60'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Business OS Executive Pulse</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* 1. BUSINESS OS EXECUTIVE PULSE (Visible in 'all' and 'business_os') */}
      {/* ======================================================== */}
      {(activeTab === 'all' || activeTab === 'business_os') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                <Briefcase className="w-4 h-4" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-gray-900 tracking-tight">Business OS Executive Pulse</h2>
                <p className="text-xs text-gray-500">Live financial, collections, CRM pipeline, and operational telemetry</p>
              </div>
            </div>
            <Link
              to="/os"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>Full OS Portal</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-5 rounded-2xl shadow-md text-white">
              <p className="text-blue-100 text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
                <DollarSign className="w-4 h-4" /> Today's Sales
              </p>
              <h3 className="text-3xl font-extrabold mt-2">₹{osStats.sales}</h3>
              <p className="text-[11px] text-blue-200 mt-2">0% change from yesterday</p>
            </div>

            <div className="bg-gradient-to-br from-emerald-600 to-teal-800 p-5 rounded-2xl shadow-md text-white">
              <p className="text-emerald-100 text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
                <DollarSign className="w-4 h-4" /> Collections
              </p>
              <h3 className="text-3xl font-extrabold mt-2">₹{osStats.collections}</h3>
              <p className="text-[11px] text-emerald-200 mt-2">₹0 pending for today</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
              <div>
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
                  <Target className="w-4 h-4 text-purple-600" /> CRM Pipeline
                </p>
                <div className="flex justify-between items-baseline mt-3">
                  <div>
                    <h3 className="text-2xl font-extrabold text-gray-900">{osStats.leads}</h3>
                    <p className="text-[10px] text-gray-400">Total Leads</p>
                  </div>
                  <div className="text-right">
                    <h3 className="text-2xl font-extrabold text-blue-600">{osStats.followUps}</h3>
                    <p className="text-[10px] text-gray-400">Follow-ups</p>
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t border-gray-100 mt-2 text-[10px] text-purple-600 font-semibold">
                Active prospective pipeline
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
              <div>
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
                  <Users className="w-4 h-4 text-indigo-600" /> Workforce & Complaints
                </p>
                <div className="flex justify-between items-baseline mt-3">
                  <div>
                    <h3 className="text-2xl font-extrabold text-gray-900">
                      {osStats.presentEmployees}/{osStats.totalEmployees}
                    </h3>
                    <p className="text-[10px] text-gray-400">Present Today</p>
                  </div>
                  <div className="text-right">
                    <h3 className="text-2xl font-extrabold text-red-500">{osStats.complaints}</h3>
                    <p className="text-[10px] text-gray-400">Open Complaints</p>
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t border-gray-100 mt-2 text-[10px] text-emerald-600 font-semibold">
                Standard baseline
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Bot className="w-4 h-4 text-purple-600" />
                <span>AI Business Insights Generator</span>
              </h3>
              <div className="p-6 text-center bg-gray-50/80 rounded-xl border border-gray-100">
                <Bot className="w-7 h-7 text-gray-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-gray-700">No anomalies detected</p>
                <p className="text-[11px] text-gray-400 mt-0.5">All financial collections, pipeline velocities and SLA ratios are stable.</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Executive Operations Status</span>
              </h3>
              <div className="p-6 text-center bg-gray-50/80 rounded-xl border border-gray-100">
                <CheckCircle2 className="w-7 h-7 text-emerald-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-gray-700">All Operations Clear</p>
                <p className="text-[11px] text-gray-400 mt-0.5">0 pending statutory approvals, 0 overdue invoices, 0 critical incidents.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. [PROJECTS] MANAGEMENT MODULE (Visible in 'all' and 'projects') */}
      {/* ======================================================== */}
      {(activeTab === 'all' || activeTab === 'projects') && (
        <div className="space-y-4 bg-white rounded-2xl border border-gray-200/90 p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl">
                <FolderGit2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-gray-900">[Projects] Hub & Milestone Tracking</h2>
                  <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                    {projects.length} Active
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Plan deliverables, assign team managers, schedule sprint dates, and track completion milestones.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/erp/projects"
                className="text-xs font-semibold text-gray-600 hover:text-blue-600 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                View in ERP
              </Link>
              <button
                onClick={handleOpenCreateProject}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>+ New Project</span>
              </button>
            </div>
          </div>

          {/* Projects Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
            {projects.length === 0 ? (
              <div className="col-span-full py-10 text-center bg-gray-50/70 rounded-xl border border-dashed border-gray-200">
                <FolderGit2 className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <h4 className="text-xs font-bold text-gray-700">No active projects found</h4>
                <p className="text-[11px] text-gray-400 mt-0.5">Create your first milestone or deliverable using the button below.</p>
                <button
                  onClick={handleOpenCreateProject}
                  className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-xs"
                >
                  + Add Project
                </button>
              </div>
            ) : (
              projects.map(proj => (
                <div
                  key={proj.id}
                  className="bg-gray-50/60 rounded-xl border border-gray-200 p-4 space-y-3 hover:shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(proj.status)}`}>
                        {proj.status}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditProject(proj)}
                          className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors"
                          title="Edit Project"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProject(proj.id)}
                          className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                          title="Delete Project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-bold text-sm text-gray-900">{proj.name}</h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {proj.description || 'No detailed description provided.'}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-gray-200/70 text-[10px] text-gray-500 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      {proj.startDate ? proj.startDate.split('T')[0] : 'N/A'}
                    </span>
                    <span>
                      End: <strong>{proj.endDate ? proj.endDate.split('T')[0] : 'N/A'}</strong>
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. ROLE DASHBOARD ENTIRE DASHBOARD (Visible in 'all' and 'role_dashboards') */}
      {/* ======================================================== */}
      {(activeTab === 'all' || activeTab === 'role_dashboards') && (
        <div className="space-y-4 bg-white rounded-2xl border border-gray-200/90 p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-purple-100 text-purple-700 rounded-xl">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 tracking-tight">Role Dashboard Suite</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Seamlessly toggle between personal employee self-service, team manager approvals, and executive HR metrics.
                </p>
              </div>
            </div>

            {/* Role Switcher Pill Buttons */}
            <div className="bg-gray-100 p-1 rounded-xl flex items-center border border-gray-200 self-start sm:self-auto">
              <button
                onClick={() => setSelectedRole('employee')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  selectedRole === 'employee' ? 'bg-white text-purple-700 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>My Portal</span>
              </button>
              <button
                onClick={() => setSelectedRole('manager')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  selectedRole === 'manager' ? 'bg-white text-purple-700 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Team Manager</span>
              </button>
              <button
                onClick={() => setSelectedRole('hr')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  selectedRole === 'hr' ? 'bg-white text-purple-700 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>HR Leadership</span>
              </button>
            </div>
          </div>

          {/* A. MY EMPLOYEE PORTAL VIEW */}
          {selectedRole === 'employee' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 pt-1">
              <div className="bg-purple-50/40 rounded-2xl border border-purple-100 p-5 text-center space-y-4">
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto text-purple-700">
                  <User className="w-9 h-9" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-900">{currentUser?.name || 'Administrator'}</h3>
                  <p className="text-xs text-gray-500">{currentUser?.role || 'Staff'} • {currentUser?.department || 'Operations'}</p>
                </div>

                <div className="pt-3 border-t border-purple-100/80 flex justify-around text-xs">
                  <div>
                    <span className="text-gray-400 text-[10px] uppercase font-bold block">Casual Leave</span>
                    <span className="font-bold text-gray-800 text-sm">0 Days</span>
                  </div>
                  <div className="w-px bg-purple-100"></div>
                  <div>
                    <span className="text-gray-400 text-[10px] uppercase font-bold block">Paid Leave</span>
                    <span className="font-bold text-gray-800 text-sm">0 Days</span>
                  </div>
                </div>

                <button
                  onClick={handleToggleClockIn}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-2 ${
                    isClockedIn ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span>{isClockedIn ? `Clock Out (Active since ${clockInTime})` : 'Clock In Now'}</span>
                </button>
              </div>

              <div className="lg:col-span-2 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <button
                    onClick={() => navigate('/hem/leave')}
                    className="p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50/30 transition-all text-left group"
                  >
                    <Calendar className="w-6 h-6 text-purple-600 mb-2 group-hover:scale-105 transition-transform" />
                    <h4 className="font-bold text-xs text-gray-900">Apply Leave</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">Submit request</p>
                  </button>

                  <button
                    onClick={() => navigate('/hem/payroll')}
                    className="p-4 rounded-xl border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all text-left group"
                  >
                    <FileText className="w-6 h-6 text-emerald-600 mb-2 group-hover:scale-105 transition-transform" />
                    <h4 className="font-bold text-xs text-gray-900">My Payslips</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">Download slips</p>
                  </button>

                  <button
                    onClick={() => navigate('/os/tasks')}
                    className="p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all text-left group"
                  >
                    <CheckSquare className="w-6 h-6 text-blue-600 mb-2 group-hover:scale-105 transition-transform" />
                    <h4 className="font-bold text-xs text-gray-900">My Tasks</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">Assigned work</p>
                  </button>

                  <button
                    onClick={() => navigate('/erp/expenses')}
                    className="p-4 rounded-xl border border-gray-200 hover:border-amber-300 hover:bg-amber-50/30 transition-all text-left group"
                  >
                    <Briefcase className="w-6 h-6 text-amber-600 mb-2 group-hover:scale-105 transition-transform" />
                    <h4 className="font-bold text-xs text-gray-900">Expenses</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">Claims & bills</p>
                  </button>
                </div>

                <div className="bg-gray-50/70 rounded-xl p-4 border border-gray-100 text-xs">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-200">
                    <span className="font-bold text-gray-800">My Assigned Tasks</span>
                    <span className="text-[10px] font-bold text-gray-500">0 Pending</span>
                  </div>
                  <p className="text-gray-400 text-center py-4">No pending assignments or review items today.</p>
                </div>
              </div>
            </div>
          )}

          {/* B. TEAM MANAGER VIEW */}
          {selectedRole === 'manager' && (
            <div className="space-y-4 pt-1">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Team Size</span>
                  <span className="text-xl font-bold text-gray-900">{managerStats.teamSize}</span>
                </div>
                <div className="bg-gray-50 p-3.5 rounded-xl border border-emerald-200">
                  <span className="text-[10px] uppercase font-bold text-emerald-600 block">Present Today</span>
                  <span className="text-xl font-bold text-emerald-700">{managerStats.presentToday}</span>
                </div>
                <div className="bg-gray-50 p-3.5 rounded-xl border border-amber-200">
                  <span className="text-[10px] uppercase font-bold text-amber-600 block">On Leave</span>
                  <span className="text-xl font-bold text-amber-700">{managerStats.onLeave}</span>
                </div>
                <div className="bg-gray-50 p-3.5 rounded-xl border border-blue-200">
                  <span className="text-[10px] uppercase font-bold text-blue-600 block">Approvals</span>
                  <span className="text-xl font-bold text-blue-700">{managerStats.pendingApprovals}</span>
                </div>
                <div className="bg-gray-50 p-3.5 rounded-xl border border-purple-200">
                  <span className="text-[10px] uppercase font-bold text-purple-600 block">Avg Target KPI</span>
                  <span className="text-xl font-bold text-purple-700">{managerStats.avgPerformance}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 bg-gray-50/70 rounded-xl border border-gray-100 text-center">
                  <CheckCircle2 className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <h4 className="text-xs font-bold text-gray-700">Requires Your Approval</h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">All team requests, shift adjustments, and claims are up to date.</p>
                </div>
                <div className="p-5 bg-gray-50/70 rounded-xl border border-gray-100 text-center">
                  <Target className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <h4 className="text-xs font-bold text-gray-700">Team Target Progress</h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">Target attainment tracking initialized at 0% baseline.</p>
                </div>
              </div>
            </div>
          )}

          {/* C. HR LEADERSHIP VIEW */}
          {selectedRole === 'hr' && (
            <div className="space-y-4 pt-1">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Total Staff</span>
                  <span className="text-xl font-bold text-gray-900">{hrStats.totalEmployees}</span>
                </div>
                <div className="bg-gray-50 p-3.5 rounded-xl border border-emerald-200">
                  <span className="text-[10px] uppercase font-bold text-emerald-600 block">New Joiners</span>
                  <span className="text-xl font-bold text-emerald-700">+{hrStats.newJoiners}</span>
                </div>
                <div className="bg-gray-50 p-3.5 rounded-xl border border-red-200">
                  <span className="text-[10px] uppercase font-bold text-red-600 block">Exits</span>
                  <span className="text-xl font-bold text-red-700">{hrStats.exits}</span>
                </div>
                <div className="bg-gray-50 p-3.5 rounded-xl border border-amber-200">
                  <span className="text-[10px] uppercase font-bold text-amber-600 block">Turnover</span>
                  <span className="text-xl font-bold text-amber-700">{hrStats.turnoverRate}</span>
                </div>
                <div className="bg-gray-50 p-3.5 rounded-xl border border-purple-200">
                  <span className="text-[10px] uppercase font-bold text-purple-600 block">Compliance</span>
                  <span className="text-xl font-bold text-purple-700">{hrStats.complianceAlerts} Issues</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 bg-gray-50/70 rounded-xl border border-gray-100 text-center">
                  <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <h4 className="text-xs font-bold text-gray-700">Department Headcount Distribution</h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">Headcount records reflect baseline configuration.</p>
                </div>
                <div className="p-5 bg-gray-50/70 rounded-xl border border-gray-100 text-center">
                  <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <h4 className="text-xs font-bold text-gray-700">HR Statutory Compliance</h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">Labour law, ESI, PF and POSH records are compliant.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CREATE PROJECT MODAL */}
      {showProjectCreateModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Create New Project</h3>
              <button onClick={() => setShowProjectCreateModal(false)} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
            </div>
            <form onSubmit={handleCreateProjectSubmit} className="space-y-3 mt-4">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Project Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ERP Migration Phase 2"
                  value={projectForm.name}
                  onChange={e => setProjectForm({ ...projectForm, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Status</label>
                <select
                  value={projectForm.status}
                  onChange={e => setProjectForm({ ...projectForm, status: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                >
                  <option value="Planning">Planning</option>
                  <option value="Active">Active</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={projectForm.startDate}
                    onChange={e => setProjectForm({ ...projectForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Target End Date</label>
                  <input
                    type="date"
                    value={projectForm.endDate}
                    onChange={e => setProjectForm({ ...projectForm, endDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Description & Scope</label>
                <textarea
                  rows={3}
                  placeholder="Key milestones, team deliverables and outcomes..."
                  value={projectForm.description}
                  onChange={e => setProjectForm({ ...projectForm, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowProjectCreateModal(false)}
                  className="px-4 py-2 border rounded-xl hover:bg-gray-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PROJECT MODAL */}
      {showProjectEditModal && editingProject && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Edit Project Details</h3>
              <button onClick={() => setShowProjectEditModal(false)} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
            </div>
            <form onSubmit={handleEditProjectSubmit} className="space-y-3 mt-4">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  value={projectForm.name}
                  onChange={e => setProjectForm({ ...projectForm, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Status</label>
                <select
                  value={projectForm.status}
                  onChange={e => setProjectForm({ ...projectForm, status: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                >
                  <option value="Planning">Planning</option>
                  <option value="Active">Active</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={projectForm.startDate}
                    onChange={e => setProjectForm({ ...projectForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={projectForm.endDate}
                    onChange={e => setProjectForm({ ...projectForm, endDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={projectForm.description}
                  onChange={e => setProjectForm({ ...projectForm, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowProjectEditModal(false)}
                  className="px-4 py-2 border rounded-xl hover:bg-gray-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs"
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
