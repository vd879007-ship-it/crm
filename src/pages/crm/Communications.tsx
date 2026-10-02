import { useState, useEffect } from 'react';
import axios from 'axios';
import { MessageCircle, Mail, Phone, Send, Pencil, Trash2, X } from 'lucide-react';
import CRMNavigation from '../../components/CRMNavigation';

export default function Communications() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [leads, setLeads] = useState<any[]>([]);

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingLog, setEditingLog] = useState<any>(null);
  const [editLogForm, setEditLogForm] = useState({
    type: 'WhatsApp',
    direction: 'Outbound',
    content: ''
  });

  const userStr = localStorage.getItem('user');
  const currentUser = userStr ? JSON.parse(userStr) : null;

  const [newLog, setNewLog] = useState({ 
    type: 'WhatsApp', 
    direction: 'Outbound', 
    content: '', 
    leadId: '' 
  });

  const fetchData = async () => {
    try {
      const [logsRes, leadsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/crm/communications`),
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/crm/leads`)
      ]);
      setLogs(logsRes.data);
      setLeads(leadsRes.data);
      if (leadsRes.data.length > 0) {
        setNewLog(prev => ({ ...prev, leadId: leadsRes.data[0].id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/crm/communications`, {
        ...newLog,
        createdById: currentUser?.id
      });
      setShowModal(false);
      setNewLog(prev => ({ ...prev, content: '' }));
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const openEditModal = (log: any) => {
    setEditingLog(log);
    setEditLogForm({
      type: log.type || 'WhatsApp',
      direction: log.direction || 'Outbound',
      content: log.content || ''
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLog) return;
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/crm/communications/${editingLog.id}`, editLogForm);
      setShowEditModal(false);
      setEditingLog(null);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to update communication log');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this communication log?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/crm/communications/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to delete communication log');
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'WhatsApp': return <MessageCircle className="w-5 h-5 text-green-500" />;
      case 'Email': return <Mail className="w-5 h-5 text-blue-500" />;
      case 'Call': return <Phone className="w-5 h-5 text-amber-500" />;
      default: return <MessageCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <CRMNavigation />

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Communication Logs</h2>
          <p className="text-xs text-gray-500">Omnichannel history across WhatsApp, Email, Phone Calls and SMS</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl flex items-center font-bold text-sm shadow-sm transition-colors cursor-pointer">
          <Send className="w-4 h-4 mr-2" /> Log Message
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
        <div className="divide-y divide-gray-100 max-h-[70vh] overflow-y-auto">
          {logs.length === 0 ? (
            <p className="p-8 text-center text-gray-500">No communications logged yet.</p>
          ) : (
            logs.map(log => (
              <div key={log.id} className="p-4 hover:bg-gray-50 transition-colors flex items-start space-x-4 group">
                <div className="p-2 bg-gray-100 rounded-full">
                  {getIcon(log.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-gray-900">
                      {log.direction} {log.type} {log.lead?.name ? `with ${log.lead.name}` : ''}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleString()}</span>
                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity ml-2">
                        <button
                          onClick={() => openEditModal(log)}
                          className="p-1 hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded transition-colors"
                          title="Edit log"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(log.id)}
                          className="p-1 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded transition-colors"
                          title="Delete log"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mt-1 bg-white border border-gray-200 p-3 rounded-lg shadow-xs">
                    {log.content}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">Logged by {log.createdBy?.name || 'System'}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-[500px] max-w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Log Communication</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select value={newLog.type} onChange={e => setNewLog({...newLog, type: e.target.value})} className="w-full border-gray-300 rounded-lg p-2 border bg-white">
                    <option>WhatsApp</option><option>Email</option><option>SMS</option><option>Call</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Direction</label>
                  <select value={newLog.direction} onChange={e => setNewLog({...newLog, direction: e.target.value})} className="w-full border-gray-300 rounded-lg p-2 border bg-white">
                    <option>Outbound</option><option>Inbound</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lead / Contact</label>
                  <select value={newLog.leadId} onChange={e => setNewLog({...newLog, leadId: e.target.value})} className="w-full border-gray-300 rounded-lg p-2 border bg-white">
                    <option value="">-- Select Lead --</option>
                    {leads.map(l => <option key={l.id} value={l.id}>{l.name} {l.company ? `(${l.company})` : ''}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message Content / Notes</label>
                  <textarea required rows={4} value={newLog.content} onChange={e => setNewLog({...newLog, content: e.target.value})} className="w-full border-gray-300 rounded-lg p-2 border" placeholder="Enter message sent or call notes..."></textarea>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm transition-colors">Save Log</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingLog && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-[500px] max-w-full relative">
            <button
              onClick={() => { setShowEditModal(false); setEditingLog(null); }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Edit Communication Log</h3>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={editLogForm.type}
                    onChange={e => setEditLogForm({...editLogForm, type: e.target.value})}
                    className="w-full border-gray-300 rounded-lg p-2 border bg-white"
                  >
                    <option>WhatsApp</option><option>Email</option><option>SMS</option><option>Call</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Direction</label>
                  <select
                    value={editLogForm.direction}
                    onChange={e => setEditLogForm({...editLogForm, direction: e.target.value})}
                    className="w-full border-gray-300 rounded-lg p-2 border bg-white"
                  >
                    <option>Outbound</option><option>Inbound</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message Content / Notes</label>
                  <textarea
                    required
                    rows={4}
                    value={editLogForm.content}
                    onChange={e => setEditLogForm({...editLogForm, content: e.target.value})}
                    className="w-full border-gray-300 rounded-lg p-2 border"
                    placeholder="Enter updated message content or call notes..."
                  ></textarea>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setEditingLog(null); }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm transition-colors"
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
