import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Pencil,
  Megaphone, 
  Plus, 
  Search, 
  Filter, 
  Radio, 
  Mail, 
  MessageSquare, 
  Bell, 
  Calendar, 
  User, 
  Trash2, 
  Send, 
  CheckCircle2, 
  Sparkles,
  X,
  FileText
} from 'lucide-react';
import HRNavigation from '../../components/HRNavigation';

interface CommunicationRecord {
  id: string;
  title: string;
  category: string;
  targetAudience: string;
  channels: string[];
  content: string;
  priority: 'Urgent' | 'High' | 'Normal';
  authorName: string;
  publishDate: string;
  attachments?: string[];
  readCount: number;
  createdAt: string;
}

export default function EmployeeCommunication() {
  const [communications, setCommunications] = useState<CommunicationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingComm, setEditingComm] = useState<any>(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Corporate Announcement',
    targetAudience: 'All Employees',
    channels: ['In-App Bulletin', 'Email Broadcast'],
    content: '',
    priority: 'Normal' as CommunicationRecord['priority'],
    authorName: 'HR Leadership'
  });

  const categories = [
    'All',
    'Corporate Announcement',
    'Policy Circular',
    'Executive Townhall',
    'Urgent Notice',
    'Health & Safety'
  ];

  const fetchCommunications = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hr/communications`);
      setCommunications(res.data || []);
    } catch (err) {
      console.error('Failed to fetch communications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunications();
  }, []);

  const handleOpenEdit = (comm: CommunicationRecord) => {
    setEditingComm({ ...comm });
    setShowEditModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingComm) return;
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hr/communications/${editingComm.id}`, editingComm);
      setShowEditModal(false);
      setEditingComm(null);
      fetchCommunications();
    } catch (err) {
      console.error(err);
      alert('Failed to update announcement');
    }
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hr/communications`, formData);
      setShowModal(false);
      setFormData({
        title: '',
        category: 'Corporate Announcement',
        targetAudience: 'All Employees',
        channels: ['In-App Bulletin', 'Email Broadcast'],
        content: '',
        priority: 'Normal',
        authorName: 'HR Leadership'
      });
      fetchCommunications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Archive this announcement?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hr/communications/${id}`);
      fetchCommunications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSeedSample = async () => {
    const samples = [
      {
        title: 'Quarterly All-Hands Townhall with CEO & Founders',
        category: 'Executive Townhall',
        targetAudience: 'All Employees',
        channels: ['In-App Bulletin', 'Email Broadcast', 'Calendar Invite'],
        content: 'Join us this Friday at 4:30 PM IST for our Q3 Business Performance review, roadmap reveal, and live Q&A session. High-tea will be served at the cafeteria.',
        priority: 'High',
        authorName: 'Anil Kapoor (CEO Office)'
      },
      {
        title: 'Annual Health & Wellness Checkup Camp',
        category: 'Health & Safety',
        targetAudience: 'All Employees',
        channels: ['In-App Bulletin', 'Email Broadcast'],
        content: 'Complimentary comprehensive health screenings, eye tests, and dental consultations will take place across campus next Tuesday.',
        priority: 'Normal',
        authorName: 'Employee Wellbeing Committee'
      },
      {
        title: 'Emergency IT Network Maintenance Window',
        category: 'Urgent Notice',
        targetAudience: 'Engineering & IT',
        channels: ['In-App Bulletin', 'SMS Alert', 'Email Broadcast'],
        content: 'VPN and internal CI/CD servers will undergo core firewall upgrades tonight from 11:00 PM to 01:00 AM IST. Please commit and push your work in advance.',
        priority: 'Urgent',
        authorName: 'DevOps & Infrastructure Team'
      }
    ];

    for (const s of samples) {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hr/communications`, s);
    }
    fetchCommunications();
  };

  const filteredComms = communications.filter(c => {
    const matchesCat = categoryFilter === 'All' || c.category === categoryFilter;
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.authorName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top HR Navigation */}
      <HRNavigation />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-amber-50 text-amber-700 rounded-lg">
              <Megaphone className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Internal Communication & Broadcasts</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Employee Communication & Circulars</h1>
          <p className="text-sm text-gray-500 mt-1 max-w-2xl">
            Publish synchronized announcements, policy circulars, executive townhalls, and urgent alerts across email, in-app bulletin boards, and SMS.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {communications.length === 0 && (
            <button
              onClick={handleSeedSample}
              className="px-3.5 py-2 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Simulate Circulars</span>
            </button>
          )}
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Post New Announcement</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Categories & Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto scrollbar-none text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
                categoryFilter === cat
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search circulars and notices..."
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 outline-none"
          />
        </div>
      </div>

      {/* Circulars Feed */}
      <div className="space-y-4">
        {filteredComms.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-dashed border-gray-300 text-center">
            <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-700">No active circulars or notices</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              Click "+ Post New Announcement" or "Simulate Circulars" to broadcast company updates.
            </p>
          </div>
        ) : (
          filteredComms.map((comm) => (
            <div
              key={comm.id}
              className={`p-6 rounded-2xl border transition-all ${
                comm.priority === 'Urgent'
                  ? 'bg-red-50/40 border-red-200 shadow-xs'
                  : 'bg-white border-gray-200/80 shadow-xs hover:border-amber-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                      comm.priority === 'Urgent' ? 'bg-red-100 text-red-800 border border-red-200' :
                      comm.priority === 'High' ? 'bg-amber-100 text-amber-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {comm.priority}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                      {comm.category}
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500 font-medium">Audience: <strong>{comm.targetAudience}</strong></span>
                  </div>

                  <h3 className="text-base font-bold text-gray-900">{comm.title}</h3>
                  <p className="text-xs text-gray-600 mt-2 leading-relaxed whitespace-pre-line max-w-4xl">
                    {comm.content}
                  </p>
                </div>

                <div className="flex items-center gap-1 self-end sm:self-start">
                  <button
                    onClick={() => handleOpenEdit(comm)}
                    className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors"
                    title="Edit Notice"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(comm.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    title="Archive Notice"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Bottom Metadata */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between text-[11px] text-gray-400 gap-2">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-gray-600 font-medium">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    Published by: {comm.authorName}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    {comm.publishDate}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Channels:</span>
                  {comm.channels.map((ch) => (
                    <span key={ch} className="bg-gray-100 text-gray-700 text-[10px] font-medium px-2 py-0.5 rounded-md">
                      {ch}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* POST ANNOUNCEMENT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-gray-900">Broadcast Company Notice</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePost} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Headline / Subject *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Annual Company Offsite & Strategy Summit 2026"
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-amber-500 outline-none bg-white"
                  >
                    <option value="Corporate Announcement">Corporate Announcement</option>
                    <option value="Policy Circular">Policy Circular</option>
                    <option value="Executive Townhall">Executive Townhall</option>
                    <option value="Urgent Notice">Urgent Notice</option>
                    <option value="Health & Safety">Health & Safety</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as CommunicationRecord['priority'] })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-amber-500 outline-none bg-white"
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Target Audience</label>
                  <select
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-amber-500 outline-none bg-white"
                  >
                    <option value="All Employees">All Employees</option>
                    <option value="Engineering & IT">Engineering & IT</option>
                    <option value="Product & Design">Product & Design</option>
                    <option value="Sales & Marketing">Sales & Marketing</option>
                    <option value="Leadership Team">Leadership Team</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Author / Sign-off Name</label>
                  <input
                    type="text"
                    value={formData.authorName}
                    onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                    placeholder="e.g. Chief People Officer"
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Notice Body *</label>
                <textarea
                  rows={4}
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Detailed announcement content and instructions for team members..."
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  Publish & Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ANNOUNCEMENT MODAL */}
      {showEditModal && editingComm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                  <Pencil className="w-5 h-5" />
                </span>
                <h3 className="text-base font-bold text-gray-900">Edit Company Announcement</h3>
              </div>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Headline / Subject *</label>
                <input
                  type="text"
                  required
                  value={editingComm.title}
                  onChange={(e) => setEditingComm({ ...editingComm, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Category</label>
                  <select
                    value={editingComm.category}
                    onChange={(e) => setEditingComm({ ...editingComm, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-amber-500 outline-none bg-white"
                  >
                    {categories.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Urgency Priority</label>
                  <select
                    value={editingComm.priority}
                    onChange={(e) => setEditingComm({ ...editingComm, priority: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-amber-500 outline-none bg-white"
                  >
                    <option value="Normal">Normal Notification</option>
                    <option value="High">High Visibility</option>
                    <option value="Urgent">Urgent / Action Required</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Target Audience</label>
                  <input
                    type="text"
                    value={editingComm.targetAudience}
                    onChange={(e) => setEditingComm({ ...editingComm, targetAudience: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Author / Office</label>
                  <input
                    type="text"
                    value={editingComm.authorName}
                    onChange={(e) => setEditingComm({ ...editingComm, authorName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Message Content *</label>
                <textarea
                  rows={4}
                  required
                  value={editingComm.content}
                  onChange={(e) => setEditingComm({ ...editingComm, content: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                />
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
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
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
