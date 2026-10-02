import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, FileText, CheckCircle, Clock, Trash2, Pencil } from 'lucide-react';
import CRMNavigation from '../../components/CRMNavigation';

export default function Sales() {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSale, setEditingSale] = useState<any>(null);
  const [editSaleForm, setEditSaleForm] = useState({ type: 'Quotation', customerId: '', totalAmount: 0, discount: 0, status: 'Draft' });

  const handleOpenEdit = (doc: any) => {
    setEditingSale(doc);
    setEditSaleForm({
      type: doc.type,
      customerId: doc.customerId || (customers[0]?.id || ''),
      totalAmount: doc.totalAmount || 0,
      discount: doc.discount || 0,
      status: doc.status || 'Draft'
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSale) return;
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/crm/sales/${editingSale.id}`, editSaleForm);
      setShowEditModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to update sales document');
    }
  };
  const [customers, setCustomers] = useState<any[]>([]);
  
  const userStr = localStorage.getItem('user');
  const currentUser = userStr ? JSON.parse(userStr) : null;

  const [newSale, setNewSale] = useState({ 
    type: 'Quotation', 
    customerId: '', 
    totalAmount: 0, 
    discount: 0, 
    status: 'Draft',
    items: [{ desc: '', price: 0 }]
  });

  const fetchData = async () => {
    try {
      const [salesRes, custRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/crm/sales`),
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/crm/customers`)
      ]);
      setSales(salesRes.data);
      setCustomers(custRes.data);
      if (custRes.data.length > 0) {
        setNewSale(prev => ({ ...prev, customerId: custRes.data[0].id }));
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
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/crm/sales`, {
        ...newSale,
        createdById: currentUser?.id
      });
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this sales document?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/crm/sales/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <CRMNavigation />

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Sales & Billing Documents</h2>
          <p className="text-xs text-gray-500">Generate quotations, estimates, purchase agreements and invoices</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl flex items-center font-bold text-sm shadow-sm transition-colors cursor-pointer">
          <Plus className="w-4 h-4 mr-2" /> Create Document
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sales.map(doc => (
              <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-900">{doc.type}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {doc.customer?.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                  ${doc.totalAmount.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    doc.status === 'Paid' || doc.status === 'Accepted' ? 'bg-green-100 text-green-800' : 
                    doc.status === 'Draft' ? 'bg-gray-100 text-gray-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {doc.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(doc.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <button
                    onClick={() => handleDelete(doc.id)}
                    title="Delete Document"
                    className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {sales.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                  No sales documents found. Click "Create Document" above to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-[500px] max-w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Create Sales Document</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
                  <select value={newSale.type} onChange={e => setNewSale({...newSale, type: e.target.value})} className="w-full border-gray-300 rounded-lg p-2 border bg-white">
                    <option>Quotation</option>
                    <option>Estimate</option>
                    <option>SalesOrder</option>
                    <option>Invoice</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                  <select value={newSale.customerId} onChange={e => setNewSale({...newSale, customerId: e.target.value})} className="w-full border-gray-300 rounded-lg p-2 border bg-white">
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount ($)</label>
                  <input type="number" required value={newSale.totalAmount} onChange={e => setNewSale({...newSale, totalAmount: Number(e.target.value)})} className="w-full border-gray-300 rounded-lg p-2 border" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select value={newSale.status} onChange={e => setNewSale({...newSale, status: e.target.value})} className="w-full border-gray-300 rounded-lg p-2 border bg-white">
                    <option>Draft</option><option>Sent</option><option>Accepted</option><option>Paid</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm transition-colors">Generate Document</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
