import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Pencil,
  BellRing, 
  Plus, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  FileClock, 
  Award, 
  FileCheck2, 
  Users, 
  Send, 
  ShieldAlert, 
  Calendar, 
  X, 
  Filter, 
  Search, 
  Sparkles,
  ArrowRight,
  Radio,
  Check,
  Trash2
} from 'lucide-react';
import HEMNavigation from '../../components/HEMNavigation';

interface AlertItem {
  id: string;
  title: string;
  description: string;
  category: 'Document Expiry' | 'Probation Review' | 'Onboarding Task' | 'Policy Overdue' | 'Attendance' | 'Custom Reminder';
  priority: 'Urgent' | 'High' | 'Normal' | 'Info';
  targetAudience: 'All Employees' | 'Admin & HR' | 'Department' | 'Specific User';
  targetDepartment: string;
  recipientName: string;
  dueDate: string;
  status: 'Active' | 'Read' | 'Dismissed' | 'Actioned';
  actionUrl: string;
  createdAt: string;
}

export default function AlertsReminders() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [audienceFilter, setAudienceFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAlert, setEditingAlert] = useState<any>(null);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);

  // Form state
  const [newAlert, setNewAlert] = useState({
    title: '',
    description: '',
    category: 'Custom Reminder' as AlertItem['category'],
    priority: 'Normal' as AlertItem['priority'],
    targetAudience: 'All Employees' as AlertItem['targetAudience'],
    targetDepartment: 'All',
    recipientName: '',
    dueDate: '',
    actionUrl: '/hem'
  });

  const [broadcast, setBroadcast] = useState({
    title: '',
    message: '',
    audience: 'All Employees',
    priority: 'High'
  });

  const fetchAlerts = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hem/alerts`);
      setAlerts(res.data || []);
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleOpenEditAlert = (item: AlertItem) => {
    setEditingAlert({ ...item });
    setShowEditModal(true);
  };

  const handleUpdateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAlert) return;
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hem/alerts/${editingAlert.id}`, editingAlert);
      setShowEditModal(false);
      setEditingAlert(null);
      fetchAlerts();
    } catch (err) {
      console.error(err);
      alert('Failed to update alert');
    }
  };

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hem/alerts`, newAlert);
      setShowCreateModal(false);
      setNewAlert({
        title: '',
        description: '',
        category: 'Custom Reminder',
        priority: 'Normal',
        targetAudience: 'All Employees',
        targetDepartment: 'All',
        recipientName: '',
        dueDate: '',
        actionUrl: '/hem'
      });
      fetchAlerts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hem/alerts/broadcast`, broadcast);
      setShowBroadcastModal(false);
      setBroadcast({
        title: '',
        message: '',
        audience: 'All Employees',
        priority: 'High'
      });
      fetchAlerts();
    } catch (err) {
      console.error(err);
    }
  };

  const updateAlertStatus = async (id: string, status: string) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hem/alerts/${id}/status`, { status });
      fetchAlerts();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteAlert = async (id: string) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hem/alerts/${id}`);
      fetchAlerts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSeedDefaults = async () => {
    const samples = [
      {
        title: 'Visa & Passport Renewal Required',
        description: 'Employee Rohit Verma work authorization visa is expiring in 25 days. Compliance review required.',
        category: 'Document Expiry',
        priority: 'Urgent',
        targetAudience: 'Admin & HR',
        targetDepartment: 'HR Operations',
        recipientName: 'Rohit Verma',
        dueDate: new Date(Date.now() + 25 * 86400000).toISOString().split('T')[0],
        actionUrl: '/hem/employees'
      },
      {
        title: '90-Day Probation Assessment Due',
        description: 'New hire Ananya Roy completes 90 days on Friday. Line manager appraisal form pending completion.',
        category: 'Probation Review',
        priority: 'High',
        targetAudience: 'Admin & HR',
        targetDepartment: 'Engineering',
        recipientName: 'Vikram Malhotra (Manager)',
        dueDate: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
        actionUrl: '/hem/performance'
      },
      {
        title: 'Mandatory POSH Policy Acknowledgment',
        description: 'Please review and electronically sign the updated FY26 POSH & Anti-Harassment policy handbook.',
        category: 'Policy Overdue',
        priority: 'High',
        targetAudience: 'All Employees',
        targetDepartment: 'All',
        recipientName: 'All Staff',
        dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        actionUrl: '/hem/policies'
      },
      {
        title: 'Upload Banking & Tax Declaration Form',
        description: 'Please upload your direct deposit information and Form 12BB tax deduction proof by end of week.',
        category: 'Onboarding Task',
        priority: 'Normal',
        targetAudience: 'All Employees',
        targetDepartment: 'Engineering',
        recipientName: 'Aarav Patel',
        dueDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
        actionUrl: '/hem/onboarding'
      }
    ];

    for (const item of samples) {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hem/alerts`, item);
    }
    fetchAlerts();
  };

  // Filtered
  const filteredAlerts = alerts.filter(a => {
    const matchesAudience = audienceFilter === 'All' || a.targetAudience === audienceFilter || a.targetAudience === 'All Employees';
    const matchesCategory = categoryFilter === 'All' || a.category === categoryFilter;
    const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          a.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          a.recipientName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesAudience && matchesCategory && matchesSearch;
  });

  const activeAlerts = alerts.filter(a => a.status === 'Active');
  const urgentCount = activeAlerts.filter(a => a.priority === 'Urgent').length;
  const docExpiryCount = activeAlerts.filter(a => a.category === 'Document Expiry').length;
  const probationCount = activeAlerts.filter(a => a.category === 'Probation Review').length;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Document Expiry': return <FileClock className="w-4 h-4 text-amber-500" />;
      case 'Probation Review': return <Award className="w-4 h-4 text-purple-500" />;
      case 'Policy Overdue': return <FileCheck2 className="w-4 h-4 text-indigo-500" />;
      case 'Attendance': return <Clock className="w-4 h-4 text-teal-500" />;
      case 'Onboarding Task': return <CheckCircle2 className="w-4 h-4 text-blue-500" />;
      default: return <BellRing className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return <span className="bg-red-100 text-red-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-red-200">URGENT</span>;
      case 'High':
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200">HIGH</span>;
      case 'Normal':
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200">STANDARD</span>;
      default:
        return <span className="bg-gray-100 text-gray-700 text-[10px] font-medium px-2 py-0.5 rounded-full">INFO</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top HEM In-Module Navigation */}
      <HEMNavigation />

      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-amber-50 text-amber-700 rounded-lg">
              <BellRing className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Workforce Pulse & Notifications</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Alerts & Reminders Hub</h1>
          <p className="text-sm text-gray-500 mt-1 max-w-2xl">
            Proactive alerts for employees and admins: document expiries, probation ends, onboarding deadlines, shift changes, and executive broadcasts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {alerts.length === 0 && (
            <button
              onClick={handleSeedDefaults}
              className="px-3.5 py-2 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Generate Sample Alerts</span>
            </button>
          )}
          <button
            onClick={() => setShowBroadcastModal(true)}
            className="px-3.5 py-2 text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Radio className="w-3.5 h-3.5 text-amber-700" />
            <span>Broadcast Alert</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Reminder</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active Reminders</p>
            <h3 className="text-3xl font-extrabold text-gray-900 mt-1">{activeAlerts.length}</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Across workforce & HR ops</p>
          </div>
          <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl">
            <BellRing className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Urgent Attention</p>
            <h3 className="text-3xl font-extrabold text-red-600 mt-1">{urgentCount}</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Immediate action required</p>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Document Expiries</p>
            <h3 className="text-3xl font-extrabold text-amber-600 mt-1">{docExpiryCount}</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Visas, IDs, and agreements</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <FileClock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Probation Endings</p>
            <h3 className="text-3xl font-extrabold text-purple-600 mt-1">{probationCount}</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Appraisal & confirmation reviews</p>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Multi-Filters */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Audience Toggle Tabs */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-xs">
          {['All', 'All Employees', 'Admin & HR', 'Department'].map((aud) => (
            <button
              key={aud}
              onClick={() => setAudienceFilter(aud)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                audienceFilter === aud
                  ? 'bg-white text-teal-900 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {aud === 'All' ? 'All Audiences' : aud}
            </button>
          ))}
        </div>

        {/* Category & Search */}
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-teal-500 outline-none"
          >
            <option value="All">All Categories</option>
            <option value="Document Expiry">Document Expiry</option>
            <option value="Probation Review">Probation Review</option>
            <option value="Policy Overdue">Policy Overdue</option>
            <option value="Onboarding Task">Onboarding Task</option>
            <option value="Attendance">Attendance</option>
            <option value="Custom Reminder">Custom Reminder</option>
          </select>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notifications..."
              className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-dashed border-gray-300 text-center">
            <BellRing className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-700">No alerts or reminders found</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              All workforce notifications are currently clear. Click "Create Reminder" or "Generate Sample Alerts" to test.
            </p>
          </div>
        ) : (
          filteredAlerts.map((item) => (
            <div
              key={item.id}
              className={`p-5 rounded-2xl border transition-all ${
                item.status === 'Actioned'
                  ? 'bg-gray-50/60 border-gray-200 opacity-60'
                  : item.priority === 'Urgent'
                  ? 'bg-red-50/30 border-red-200 shadow-xs'
                  : 'bg-white border-gray-200/80 shadow-xs hover:border-teal-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 shadow-xs mt-0.5">
                    {getCategoryIcon(item.category)}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      {getPriorityBadge(item.priority)}
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                        {item.category}
                      </span>
                      <span className="text-[11px] text-gray-400">•</span>
                      <span className="text-[11px] text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded-md">
                        Audience: {item.targetAudience}
                      </span>
                      {item.recipientName && (
                        <span className="text-[11px] text-gray-500 font-medium">
                          ({item.recipientName})
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-gray-900">{item.title}</h3>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed max-w-3xl">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Right Actions & Due Date */}
                <div className="flex flex-col sm:items-end gap-2 shrink-0 self-start sm:self-auto">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span>Target Date: <strong className="text-gray-800">{item.dueDate}</strong></span>
                  </div>

                  <div className="flex items-center gap-1.5 mt-1">
                    {item.status === 'Active' ? (
                      <>
                        <button
                          onClick={() => updateAlertStatus(item.id, 'Actioned')}
                          className="px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors flex items-center gap-1 shadow-2xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Mark Resolved</span>
                        </button>
                        <button
                          onClick={() => deleteAlert(item.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                          title="Dismiss / Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-gray-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Resolved
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CREATE ALERT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <BellRing className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-bold text-gray-900">Configure Alert or Reminder</h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAlert} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Alert Title *</label>
                <input
                  type="text"
                  required
                  value={newAlert.title}
                  onChange={(e) => setNewAlert({ ...newAlert, title: e.target.value })}
                  placeholder="e.g. Health Insurance Card Renewal Notice"
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Description / Action Required *</label>
                <textarea
                  rows={2}
                  required
                  value={newAlert.description}
                  onChange={(e) => setNewAlert({ ...newAlert, description: e.target.value })}
                  placeholder="Please submit dependents details before monthly cutoff..."
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Category</label>
                  <select
                    value={newAlert.category}
                    onChange={(e) => setNewAlert({ ...newAlert, category: e.target.value as AlertItem['category'] })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none bg-white"
                  >
                    <option value="Document Expiry">Document Expiry</option>
                    <option value="Probation Review">Probation Review</option>
                    <option value="Onboarding Task">Onboarding Task</option>
                    <option value="Policy Overdue">Policy Overdue</option>
                    <option value="Attendance">Attendance</option>
                    <option value="Custom Reminder">Custom Reminder</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Priority</label>
                  <select
                    value={newAlert.priority}
                    onChange={(e) => setNewAlert({ ...newAlert, priority: e.target.value as AlertItem['priority'] })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none bg-white"
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                    <option value="Info">Info</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Target Audience</label>
                  <select
                    value={newAlert.targetAudience}
                    onChange={(e) => setNewAlert({ ...newAlert, targetAudience: e.target.value as AlertItem['targetAudience'] })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none bg-white"
                  >
                    <option value="All Employees">All Employees</option>
                    <option value="Admin & HR">Admin & HR Only</option>
                    <option value="Department">Specific Department</option>
                    <option value="Specific User">Individual Employee</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Target Individual / Group</label>
                  <input
                    type="text"
                    value={newAlert.recipientName}
                    onChange={(e) => setNewAlert({ ...newAlert, recipientName: e.target.value })}
                    placeholder="e.g. Engineering Team / Rohit Verma"
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Target Due Date *</label>
                <input
                  type="date"
                  required
                  value={newAlert.dueDate}
                  onChange={(e) => setNewAlert({ ...newAlert, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
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
                  Schedule Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BROADCAST ALERT MODAL */}
      {showBroadcastModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-gray-900">Broadcast HR Flash Alert</h3>
              </div>
              <button onClick={() => setShowBroadcastModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBroadcast} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Headline *</label>
                <input
                  type="text"
                  required
                  value={broadcast.title}
                  onChange={(e) => setBroadcast({ ...broadcast, title: e.target.value })}
                  placeholder="e.g. Office Early Closure Due to Weather / Townhall Meeting"
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Broadcast Message Body *</label>
                <textarea
                  rows={3}
                  required
                  value={broadcast.message}
                  onChange={(e) => setBroadcast({ ...broadcast, message: e.target.value })}
                  placeholder="All team members are advised to..."
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBroadcastModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  Broadcast to All Personnel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ALERT MODAL */}
      {showEditModal && editingAlert && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-teal-50 text-teal-600 rounded-xl">
                  <Pencil className="w-5 h-5" />
                </span>
                <h3 className="text-base font-bold text-gray-900">Edit Alert / Reminder</h3>
              </div>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateAlert} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={editingAlert.title}
                  onChange={(e) => setEditingAlert({ ...editingAlert, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingAlert.description}
                  onChange={(e) => setEditingAlert({ ...editingAlert, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Category</label>
                  <select
                    value={editingAlert.category}
                    onChange={(e) => setEditingAlert({ ...editingAlert, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none bg-white"
                  >
                    <option value="Document Expiry">Document Expiry</option>
                    <option value="Probation Review">Probation Review</option>
                    <option value="Onboarding Task">Onboarding Task</option>
                    <option value="Policy Overdue">Policy Overdue</option>
                    <option value="Attendance">Attendance</option>
                    <option value="Custom Reminder">Custom Reminder</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Priority</label>
                  <select
                    value={editingAlert.priority}
                    onChange={(e) => setEditingAlert({ ...editingAlert, priority: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none bg-white"
                  >
                    <option value="Urgent">Urgent</option>
                    <option value="High">High</option>
                    <option value="Normal">Normal</option>
                    <option value="Info">Info</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Target Audience</label>
                  <select
                    value={editingAlert.targetAudience}
                    onChange={(e) => setEditingAlert({ ...editingAlert, targetAudience: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none bg-white"
                  >
                    <option value="All Employees">All Employees</option>
                    <option value="Admin & HR">Admin & HR</option>
                    <option value="Department">Department</option>
                    <option value="Specific User">Specific User</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={editingAlert.dueDate}
                    onChange={(e) => setEditingAlert({ ...editingAlert, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Recipient Name</label>
                  <input
                    type="text"
                    value={editingAlert.recipientName || ''}
                    onChange={(e) => setEditingAlert({ ...editingAlert, recipientName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Status</label>
                  <select
                    value={editingAlert.status}
                    onChange={(e) => setEditingAlert({ ...editingAlert, status: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Actioned">Actioned</option>
                    <option value="Dismissed">Dismissed</option>
                  </select>
                </div>
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
                  Save Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
