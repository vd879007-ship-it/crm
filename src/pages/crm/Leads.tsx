import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, GripVertical, Trash2, Pencil } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import CRMNavigation from '../../components/CRMNavigation';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export default function Leads() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingLead, setEditingLead] = useState<any>(null);
  const [editLeadForm, setEditLeadForm] = useState({ name: '', company: '', email: '', phone: '', source: 'Website', status: 'New' });

  const handleOpenEdit = (lead: any) => {
    setEditingLead(lead);
    setEditLeadForm({
      name: lead.name,
      company: lead.company || '',
      email: lead.email || '',
      phone: lead.phone || '',
      source: lead.source || 'Website',
      status: lead.status || 'New'
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead) return;
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/crm/leads/${editingLead.id}`, editLeadForm);
      setShowEditModal(false);
      fetchLeads();
    } catch (err) {
      console.error(err);
      alert('Failed to update lead');
    }
  };
  const [newLead, setNewLead] = useState({ name: '', company: '', email: '', phone: '', source: 'Website', status: 'New' });

  const fetchLeads = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/crm/leads`);
      setLeads(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeads(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/crm/leads`, newLead);
      setShowModal(false);
      setNewLead({ name: '', company: '', email: '', phone: '', source: 'Website', status: 'New' });
      fetchLeads();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this lead?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/crm/leads/${id}`);
      fetchLeads();
    } catch (err) {
      console.error(err);
    }
  };

  const updateLeadStatus = async (id: string, status: string) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/crm/leads/${id}/status`, { status });
      fetchLeads();
    } catch (err) {
      console.error(err);
    }
  };

  const columns = ['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'];

  return (
    <div className="h-full flex flex-col space-y-4">
      <CRMNavigation />

      <div className="flex justify-between items-center mb-2">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Lead Pipeline</h2>
          <p className="text-xs text-gray-500">Track and advance prospective accounts through qualification stages</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl flex items-center font-bold text-sm shadow-sm transition-colors cursor-pointer">
          <Plus className="w-4 h-4 mr-2" /> Add Lead
        </button>
      </div>

      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-4 min-w-max h-full pb-4">
          {columns.map(col => (
            <div key={col} className="w-80 bg-gray-100/50 rounded-xl border border-gray-200 flex flex-col max-h-full">
              <div className="p-3 border-b border-gray-200 flex justify-between items-center bg-gray-50/80 rounded-t-xl">
                <h3 className="font-semibold text-gray-700">{col}</h3>
                <span className="bg-gray-200 text-gray-600 text-xs py-0.5 px-2 rounded-full font-medium">
                  {leads.filter(l => l.status === col).length}
                </span>
              </div>
              <div className="p-3 flex-1 overflow-y-auto space-y-3">
                {leads.filter(l => l.status === col).length === 0 ? (
                  <div className="h-28 flex flex-col items-center justify-center text-center p-3 border-2 border-dashed border-gray-200 rounded-lg">
                    <p className="text-xs text-gray-400 font-medium">No leads</p>
                  </div>
                ) : (
                  leads.filter(l => l.status === col).map(lead => (
                    <div key={lead.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow group relative">
                      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1 z-10 bg-white/90 p-0.5 rounded shadow-xs">
                        <select 
                          value={lead.status}
                          onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                          className="text-xs border-gray-300 rounded shadow-sm text-gray-600 bg-gray-50 py-0.5 px-1 cursor-pointer"
                        >
                          {columns.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <button
                          onClick={() => handleDelete(lead.id)}
                          title="Delete Lead"
                          className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex items-start mb-2">
                        <GripVertical className="w-4 h-4 text-gray-400 mr-1 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-gray-900 leading-tight">{lead.name}</h4>
                          {lead.company && <p className="text-xs text-blue-600 font-medium mt-1">{lead.company}</p>}
                        </div>
                      </div>
                      <div className="pl-5 mt-3 space-y-1">
                        {lead.email && <p className="text-xs text-gray-500 truncate">{lead.email}</p>}
                        {lead.phone && <p className="text-xs text-gray-500">{lead.phone}</p>}
                      </div>
                      <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center pl-5">
                        <span className="text-[10px] uppercase font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{lead.source}</span>
                        <span className="text-[10px] text-gray-400">{new Date(lead.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-[500px] max-w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Add New Lead</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input required value={newLead.name} onChange={e => setNewLead({...newLead, name: e.target.value})} className="w-full border-gray-300 rounded-lg p-2 border" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                  <input value={newLead.company} onChange={e => setNewLead({...newLead, company: e.target.value})} className="w-full border-gray-300 rounded-lg p-2 border" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={newLead.email} onChange={e => setNewLead({...newLead, email: e.target.value})} className="w-full border-gray-300 rounded-lg p-2 border" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input value={newLead.phone} onChange={e => setNewLead({...newLead, phone: e.target.value})} className="w-full border-gray-300 rounded-lg p-2 border" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                  <select value={newLead.source} onChange={e => setNewLead({...newLead, source: e.target.value})} className="w-full border-gray-300 rounded-lg p-2 border bg-white">
                    <option>Website</option><option>WhatsApp</option><option>Instagram</option>
                    <option>Facebook</option><option>Call</option><option>Form</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Initial Status</label>
                  <select value={newLead.status} onChange={e => setNewLead({...newLead, status: e.target.value})} className="w-full border-gray-300 rounded-lg p-2 border bg-white">
                    {columns.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm transition-colors">Create Lead</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
