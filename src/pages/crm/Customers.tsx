import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, User, Building, MapPin, Mail, Phone, Trash2, Edit3, X, AlertTriangle } from 'lucide-react';
import CRMNavigation from '../../components/CRMNavigation';

export default function Customers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [newCust, setNewCust] = useState({ name: '', company: '', email: '', phone: '', address: '' });
  const [editingCust, setEditingCust] = useState<any | null>(null);

  const fetchCustomers = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/crm/customers`);
      setCustomers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCustomers(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/crm/customers`, newCust);
      setShowModal(false);
      setNewCust({ name: '', company: '', email: '', phone: '', address: '' });
      fetchCustomers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCust) return;
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/crm/customers/${editingCust.id}`, editingCust);
      setShowEditModal(false);
      setEditingCust(null);
      fetchCustomers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/crm/customers/${id}`);
      setDeleteConfirmId(null);
      fetchCustomers();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <CRMNavigation />

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Customer Directory</h2>
          <p className="text-xs text-gray-500">Manage client relationships, enterprise accounts and contacts</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl flex items-center font-bold text-sm shadow-sm transition-colors cursor-pointer">
          <Plus className="w-4 h-4 mr-2" /> Add Customer
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {customers.map(c => (
          <div key={c.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow relative group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                  {c.name.substring(0, 1)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{c.name}</h3>
                  <p className="text-xs text-gray-500 flex items-center mt-0.5">
                    <Building className="w-3 h-3 mr-1" /> {c.company || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => { setEditingCust(c); setShowEditModal(true); }}
                  title="Edit Customer"
                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteConfirmId(c.id)}
                  title="Delete Customer"
                  className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="space-y-2 mt-4 text-sm text-gray-600">
              {c.email && <div className="flex items-center"><Mail className="w-4 h-4 mr-2 text-gray-400" /> {c.email}</div>}
              {c.phone && <div className="flex items-center"><Phone className="w-4 h-4 mr-2 text-gray-400" /> {c.phone}</div>}
              {c.address && <div className="flex items-center"><MapPin className="w-4 h-4 mr-2 text-gray-400" /> <span className="truncate">{c.address}</span></div>}
            </div>

            {/* Inline Delete Confirmation */}
            {deleteConfirmId === c.id && (
              <div className="absolute inset-0 bg-white/95 backdrop-blur-xs rounded-xl p-4 flex flex-col justify-center items-center text-center z-10 animate-in fade-in">
                <AlertTriangle className="w-8 h-8 text-rose-500 mb-2" />
                <p className="text-xs font-bold text-gray-900">Delete {c.name}?</p>
                <p className="text-[11px] text-gray-500 mb-3">This client record and linked data will be removed.</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDeleteConfirmId(null)}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Confirm Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {customers.length === 0 && !loading && (
          <div className="col-span-full bg-white rounded-xl shadow-xs border border-gray-100 p-12 text-center">
            <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-semibold text-sm">No customers in directory.</p>
            <p className="text-xs text-gray-400 mt-1">Click "Add Customer" above to register your first client.</p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-[500px] max-w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Add New Customer</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input required value={newCust.name} onChange={e => setNewCust({...newCust, name: e.target.value})} className="w-full border-gray-300 rounded-lg p-2 border" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                  <input value={newCust.company} onChange={e => setNewCust({...newCust, company: e.target.value})} className="w-full border-gray-300 rounded-lg p-2 border" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={newCust.email} onChange={e => setNewCust({...newCust, email: e.target.value})} className="w-full border-gray-300 rounded-lg p-2 border" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input value={newCust.phone} onChange={e => setNewCust({...newCust, phone: e.target.value})} className="w-full border-gray-300 rounded-lg p-2 border" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input value={newCust.address} onChange={e => setNewCust({...newCust, address: e.target.value})} className="w-full border-gray-300 rounded-lg p-2 border" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium shadow-sm transition-colors cursor-pointer">Create Customer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingCust && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-[500px] max-w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Edit Customer</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input required value={editingCust.name || ''} onChange={e => setEditingCust({...editingCust, name: e.target.value})} className="w-full border-gray-300 rounded-lg p-2 border" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                  <input value={editingCust.company || ''} onChange={e => setEditingCust({...editingCust, company: e.target.value})} className="w-full border-gray-300 rounded-lg p-2 border" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={editingCust.email || ''} onChange={e => setEditingCust({...editingCust, email: e.target.value})} className="w-full border-gray-300 rounded-lg p-2 border" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input value={editingCust.phone || ''} onChange={e => setEditingCust({...editingCust, phone: e.target.value})} className="w-full border-gray-300 rounded-lg p-2 border" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input value={editingCust.address || ''} onChange={e => setEditingCust({...editingCust, address: e.target.value})} className="w-full border-gray-300 rounded-lg p-2 border" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm transition-colors cursor-pointer">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
