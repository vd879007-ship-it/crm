import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Laptop, Smartphone, Monitor, Plus, CheckCircle2, Trash2, Pencil,
  Layers, DollarSign, Calendar, TrendingDown, RefreshCw, FileText,
  ShieldCheck, AlertCircle, Building2, HardDrive
} from 'lucide-react';
import ERPNavigation from '../../components/ERPNavigation';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

interface FixedAssetScheduleItem {
  id: string;
  assetName: string;
  category: 'IT Hardware' | 'Servers & Compute' | 'Office Equipment' | 'Furniture' | 'Vehicles';
  serialNumber: string;
  purchaseDate: string;
  costValue: number;
  usefulLifeYears: number;
  salvageValue: number;
  depreciationMethod: 'Straight Line (SLM)' | 'Written Down Value (WDV)';
  annualDepreciationRate: number;
  accumulatedDepreciation: number;
  netBookValue: number;
  status: 'In Active Use' | 'Fully Depreciated' | 'Disposed';
}

export default function Assets() {
  const [activeTab, setActiveTab] = useState<'fixedAssets' | 'itCustody'>('fixedAssets');
  const [assets, setAssets] = useState<any[]>([]);
  const [depreciationSchedule, setDepreciationSchedule] = useState<FixedAssetScheduleItem[]>([]);
  const [depSummary, setDepSummary] = useState({
    totalCost: 0,
    totalAccumulatedDep: 0,
    totalNetBookValue: 0
  });
  const [loading, setLoading] = useState(true);
  const [postingDep, setPostingDep] = useState(false);
  const [actionMsg, setActionMsg] = useState('');

  // Modals
  const [showModal, setShowModal] = useState(false);
  // Universal CRUD State for Assets
  const [showEditFixedAssetModal, setShowEditFixedAssetModal] = useState(false);
  const [editingFixedAsset, setEditingFixedAsset] = useState<any>(null);
  const [editFixedAssetForm, setEditFixedAssetForm] = useState({
    assetName: '',
    serialNumber: '',
    category: 'Computer & Hardware',
    costValue: 0,
    usefulLifeYears: 5,
    depreciationMethod: 'Straight Line (SLM)' as const,
    salvageValue: 0
  });

  const [showEditCustodyModal, setShowEditCustodyModal] = useState(false);
  const [editingCustodyAsset, setEditingCustodyAsset] = useState<any>(null);
  const [editCustodyForm, setEditCustodyForm] = useState({ name: '', category: '', serialNo: '', status: 'Available' });

  const [showFixedAssetModal, setShowFixedAssetModal] = useState(false);

  // Forms
  const [newAsset, setNewAsset] = useState({ name: '', category: 'Electronics', serialNo: '', status: 'Available' });
  const [fixedAssetForm, setFixedAssetForm] = useState({
    assetName: '',
    category: 'IT Hardware' as const,
    serialNumber: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    costValue: 150000,
    usefulLifeYears: 4,
    salvageValue: 15000,
    depreciationMethod: 'Straight Line (SLM)' as const,
    annualDepreciationRate: 25
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [legacyRes, schedRes] = await Promise.all([
        axios.get(`${API_BASE}/api/erp/assets`).catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/api/erp/assets/schedule`).catch(() => ({ data: { assets: [], summary: {} } }))
      ]);
      setAssets(legacyRes.data || []);
      if (schedRes.data?.assets) {
        setDepreciationSchedule(schedRes.data.assets);
        if (schedRes.data.summary) {
          setDepSummary(schedRes.data.summary);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateCustodyAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/api/erp/assets`, newAsset);
      setShowModal(false);
      setNewAsset({ name: '', category: 'Electronics', serialNo: '', status: 'Available' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateFixedAsset = (e: React.FormEvent) => {
    e.preventDefault();
    const annualDepRate = Math.round(100 / fixedAssetForm.usefulLifeYears);
    const newEntry: FixedAssetScheduleItem = {
      id: `AST-${Date.now()}`,
      assetName: fixedAssetForm.assetName,
      category: fixedAssetForm.category,
      serialNumber: fixedAssetForm.serialNumber,
      purchaseDate: fixedAssetForm.purchaseDate,
      costValue: Number(fixedAssetForm.costValue),
      usefulLifeYears: Number(fixedAssetForm.usefulLifeYears),
      salvageValue: Number(fixedAssetForm.salvageValue),
      depreciationMethod: fixedAssetForm.depreciationMethod,
      annualDepreciationRate: annualDepRate,
      accumulatedDepreciation: 0,
      netBookValue: Number(fixedAssetForm.costValue),
      status: 'In Active Use'
    };

    setDepreciationSchedule(prev => [newEntry, ...prev]);
    setDepSummary(prev => ({
      totalCost: prev.totalCost + newEntry.costValue,
      totalAccumulatedDep: prev.totalAccumulatedDep,
      totalNetBookValue: prev.totalNetBookValue + newEntry.netBookValue
    }));
    setShowFixedAssetModal(false);
    setActionMsg(`Fixed asset ${newEntry.assetName} registered in Capital Assets ledger!`);
    setTimeout(() => setActionMsg(''), 5000);
  };

  const handlePostDepreciation = async () => {
    if (!window.confirm('Calculate and Post Annual Depreciation Journal Voucher (JV)?\nThis will charge Depreciation Expense to P&L and credit Accumulated Depreciation on the Balance Sheet.')) return;
    try {
      setPostingDep(true);
      const res = await axios.post(`${API_BASE}/api/erp/assets/post-depreciation`, { fiscalYear: '2026-27' });
      setActionMsg(res.data.message || 'Depreciation posted to books successfully!');
      setTimeout(() => setActionMsg(''), 6000);
      fetchData();
    } catch (err) {
      alert('Failed to post depreciation');
    } finally {
      setPostingDep(false);
    }
  };

  // Universal CRUD Handlers for Assets
  const handleOpenEditFixedAsset = (ast: any) => {
    setEditingFixedAsset(ast);
    setEditFixedAssetForm({
      assetName: ast.assetName,
      serialNumber: ast.serialNumber,
      category: ast.category,
      costValue: ast.costValue,
      usefulLifeYears: ast.usefulLifeYears,
      depreciationMethod: ast.depreciationMethod,
      salvageValue: ast.salvageValue || 0
    });
    setShowEditFixedAssetModal(true);
  };

  const handleEditFixedAssetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(`${API_BASE}/api/erp/accounting/fixed-assets/${editingFixedAsset.id}`, editFixedAssetForm);
      setShowEditFixedAssetModal(false);
      alert('Fixed asset capitalization schedule updated successfully!');
      fetchData();
    } catch (err) {
      alert('Failed to update fixed asset');
    }
  };

  const handleDeleteFixedAsset = async (id: string, name: string) => {
    if (!confirm(`Delete fixed asset "${name}" from capital registers?`)) return;
    try {
      await axios.delete(`${API_BASE}/api/erp/accounting/fixed-assets/${id}`);
      alert(`Fixed asset "${name}" deleted!`);
      fetchData();
    } catch (err) {
      alert('Failed to delete fixed asset');
    }
  };

  const handleOpenEditCustody = (a: any) => {
    setEditingCustodyAsset(a);
    setEditCustodyForm({
      name: a.name,
      category: a.category,
      serialNo: a.serialNo,
      status: a.status
    });
    setShowEditCustodyModal(true);
  };

  const handleEditCustodySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(`${API_BASE}/api/erp/assets/${editingCustodyAsset.id}`, editCustodyForm);
      setShowEditCustodyModal(false);
      alert('Custody asset updated successfully!');
      fetchData();
    } catch (err) {
      alert('Failed to update custody asset');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this asset record?')) return;
    try {
      await axios.delete(`${API_BASE}/api/erp/assets/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (category: string) => {
    if (category.toLowerCase().includes('phone')) return <Smartphone className="w-4 h-4 text-gray-500 mr-2" />;
    if (category.toLowerCase().includes('monitor')) return <Monitor className="w-4 h-4 text-gray-500 mr-2" />;
    return <Laptop className="w-4 h-4 text-gray-500 mr-2" />;
  };

  return (
    <div className="space-y-6">
      <ERPNavigation />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-gray-200">
        <div>
          <h2 className="text-xl font-black text-gray-900">Fixed Assets &amp; Depreciation Engine</h2>
          <p className="text-xs text-gray-500">Asset capitalization, useful life, SLM/WDV depreciation schedules and double-entry books posting</p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === 'fixedAssets' ? (
            <>
              <button
                onClick={handlePostDepreciation}
                disabled={postingDep}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <TrendingDown className="w-4 h-4" /> {postingDep ? 'Posting JV...' : 'Post Depreciation JV'}
              </button>
              <button
                onClick={() => setShowFixedAssetModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" /> + Capitalize Asset
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" /> + Assign Device
            </button>
          )}
        </div>
      </div>

      {actionMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-2 text-xs font-bold">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Gross Capital Cost</span>
          <h3 className="text-2xl font-black text-gray-900 mt-1">₹{depSummary.totalCost?.toLocaleString()}</h3>
          <p className="text-xs text-gray-500 mt-1">Original purchase valuation in Capital Assets</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-rose-500 tracking-wider">Accumulated Depreciation</span>
          <h3 className="text-2xl font-black text-rose-600 mt-1">₹{depSummary.totalAccumulatedDep?.toLocaleString()}</h3>
          <p className="text-xs text-rose-600 font-medium mt-1">Total provision charged to P&amp;L</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">Net Book Value (NBV)</span>
          <h3 className="text-2xl font-black text-emerald-600 mt-1">₹{depSummary.totalNetBookValue?.toLocaleString()}</h3>
          <p className="text-xs text-emerald-600 font-medium mt-1">Carried forward to Balance Sheet</p>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-gray-200 gap-6">
        <button
          onClick={() => setActiveTab('fixedAssets')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'fixedAssets' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Building2 className="w-4 h-4" /> Fixed Assets Register &amp; Depreciation ({depreciationSchedule.length})
        </button>
        <button
          onClick={() => setActiveTab('itCustody')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'itCustody' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Laptop className="w-4 h-4" /> Employee IT Device Custody ({assets.length})
        </button>
      </div>

      {/* TAB 1: FIXED ASSETS REGISTER */}
      {activeTab === 'fixedAssets' && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-black uppercase text-gray-500 tracking-wider">
                  <th className="py-3 px-4">Asset Details &amp; S/N</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Purchase Date</th>
                  <th className="py-3 px-4 text-right">Cost Value</th>
                  <th className="py-3 px-4 text-center">Life / Method</th>
                  <th className="py-3 px-4 text-right">Accumulated Dep</th>
                  <th className="py-3 px-4 text-right">Net Book Value</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {depreciationSchedule.map(ast => (
                  <tr key={ast.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-gray-900">{ast.assetName}</p>
                      <span className="font-mono text-[10px] text-gray-400">SN: {ast.serialNumber}</span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-gray-700">{ast.category}</td>
                    <td className="py-3.5 px-4 font-mono text-gray-600">{ast.purchaseDate}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-gray-900">₹{ast.costValue?.toLocaleString()}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-bold text-gray-800">{ast.usefulLifeYears} Yrs</span>
                      <p className="text-[10px] text-gray-400">{ast.depreciationMethod}</p>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-rose-600">₹{ast.accumulatedDepreciation?.toLocaleString()}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-black text-emerald-700">₹{ast.netBookValue?.toLocaleString()}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                        {ast.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => handleOpenEditFixedAsset(ast)}
                        className="p-1 text-gray-400 hover:text-blue-600 rounded"
                        title="Edit Asset"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteFixedAsset(ast.id, ast.assetName)}
                        className="p-1 text-gray-400 hover:text-rose-600 rounded"
                        title="Delete Asset"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: IT CUSTODY */}
      {activeTab === 'itCustody' && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
          <table className="min-w-full divide-y divide-gray-200 text-xs">
            <thead className="bg-gray-50 text-[11px] font-black uppercase text-gray-500">
              <tr>
                <th className="px-6 py-3 text-left">Asset Name &amp; S/N</th>
                <th className="px-6 py-3 text-left">Category</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Assigned To</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {assets.map(a => (
                <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 flex items-center">
                    {getIcon(a.category)}
                    <div>
                      <p className="font-bold text-gray-900">{a.name}</p>
                      <p className="text-gray-400 font-mono text-[10px]">SN: {a.serialNo || 'N/A'}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-700">{a.category}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 font-bold rounded-full text-[10px] ${
                      a.status === 'Available' ? 'bg-emerald-100 text-emerald-800' :
                      a.status === 'Assigned' ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{a.assignedTo?.name || 'Unassigned / IT Pool'}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleOpenEditCustody(a)} className="text-gray-400 hover:text-blue-600 p-1.5 mr-1" title="Edit Device">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(a.id)} className="text-gray-400 hover:text-rose-600 p-1.5" title="Delete Device">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL: CAPITALIZE FIXED ASSET */}
      {showFixedAssetModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-[550px] max-w-full p-6 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-black text-gray-900">Capitalize Fixed Asset</h3>
                <p className="text-xs text-gray-500">Record capital purchase &amp; depreciation schedule</p>
              </div>
              <button onClick={() => setShowFixedAssetModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <form onSubmit={handleCreateFixedAsset} className="space-y-4 pt-4">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Asset Description *</label>
                <input
                  required
                  placeholder="e.g. Dell PowerEdge R750 Enterprise Server"
                  value={fixedAssetForm.assetName}
                  onChange={e => setFixedAssetForm({ ...fixedAssetForm, assetName: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Category *</label>
                  <select
                    value={fixedAssetForm.category}
                    onChange={e => setFixedAssetForm({ ...fixedAssetForm, category: e.target.value as any })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 bg-white font-medium"
                  >
                    <option>IT Hardware</option>
                    <option>Servers & Compute</option>
                    <option>Office Equipment</option>
                    <option>Furniture</option>
                    <option>Vehicles</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Serial Number / Tag *</label>
                  <input
                    required
                    placeholder="e.g. SRV-DL-99102"
                    value={fixedAssetForm.serialNumber}
                    onChange={e => setFixedAssetForm({ ...fixedAssetForm, serialNumber: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Purchase Date *</label>
                  <input
                    type="date"
                    required
                    value={fixedAssetForm.purchaseDate}
                    onChange={e => setFixedAssetForm({ ...fixedAssetForm, purchaseDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Cost Value (₹) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={fixedAssetForm.costValue}
                    onChange={e => setFixedAssetForm({ ...fixedAssetForm, costValue: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Useful Life (Yrs)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={fixedAssetForm.usefulLifeYears}
                    onChange={e => setFixedAssetForm({ ...fixedAssetForm, usefulLifeYears: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Salvage Value (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={fixedAssetForm.salvageValue}
                    onChange={e => setFixedAssetForm({ ...fixedAssetForm, salvageValue: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Method</label>
                  <select
                    value={fixedAssetForm.depreciationMethod}
                    onChange={e => setFixedAssetForm({ ...fixedAssetForm, depreciationMethod: e.target.value as any })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 bg-white font-medium"
                  >
                    <option>Straight Line (SLM)</option>
                    <option>Written Down Value (WDV)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowFixedAssetModal(false)}
                  className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Capitalize &amp; Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ASSIGN CUSTODY DEVICE */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-[500px] max-w-full text-xs">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Register Custody Hardware</h3>
            <form onSubmit={handleCreateCustodyAsset} className="space-y-4">
              <input required value={newAsset.name} onChange={e => setNewAsset({...newAsset, name: e.target.value})} className="w-full border-gray-300 rounded-xl p-2.5 border" placeholder="Device Name (e.g. MacBook Pro M3)" />
              <input required value={newAsset.serialNo} onChange={e => setNewAsset({...newAsset, serialNo: e.target.value})} className="w-full border-gray-300 rounded-xl p-2.5 border font-mono" placeholder="Serial Number" />
              <div className="grid grid-cols-2 gap-4">
                <select value={newAsset.category} onChange={e => setNewAsset({...newAsset, category: e.target.value})} className="w-full border-gray-300 rounded-xl p-2.5 border bg-white font-medium">
                  <option>Electronics</option><option>Furniture</option><option>Vehicle</option><option>Other</option>
                </select>
                <select value={newAsset.status} onChange={e => setNewAsset({...newAsset, status: e.target.value})} className="w-full border-gray-300 rounded-xl p-2.5 border bg-white font-medium">
                  <option>Available</option><option>Assigned</option><option>Maintenance</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-bold">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold shadow-xs">Register Device</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT FIXED ASSET ================= */}
      {showEditFixedAssetModal && editingFixedAsset && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-[500px] max-w-full p-6 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Edit Capitalized Asset</h3>
              <button onClick={() => setShowEditFixedAssetModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleEditFixedAssetSubmit} className="space-y-4 pt-4">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Asset Nomenclature / Name</label>
                <input
                  type="text"
                  required
                  value={editFixedAssetForm.assetName}
                  onChange={e => setEditFixedAssetForm({ ...editFixedAssetForm, assetName: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 font-semibold"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Serial Number</label>
                  <input
                    type="text"
                    value={editFixedAssetForm.serialNumber}
                    onChange={e => setEditFixedAssetForm({ ...editFixedAssetForm, serialNumber: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Asset Category</label>
                  <select
                    value={editFixedAssetForm.category}
                    onChange={e => setEditFixedAssetForm({ ...editFixedAssetForm, category: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 bg-white font-medium"
                  >
                    <option value="Computer & Hardware">Computer & Hardware</option>
                    <option value="Plant & Machinery">Plant & Machinery</option>
                    <option value="Office Equipment">Office Equipment</option>
                    <option value="Furniture & Fixtures">Furniture & Fixtures</option>
                    <option value="Motor Vehicles">Motor Vehicles</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Purchase / Cost Value (₹)</label>
                  <input
                    type="number"
                    value={editFixedAssetForm.costValue}
                    onChange={e => setEditFixedAssetForm({ ...editFixedAssetForm, costValue: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Useful Life (Years)</label>
                  <input
                    type="number"
                    value={editFixedAssetForm.usefulLifeYears}
                    onChange={e => setEditFixedAssetForm({ ...editFixedAssetForm, usefulLifeYears: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-mono font-bold"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Depreciation Method</label>
                  <select
                    value={editFixedAssetForm.depreciationMethod}
                    onChange={e => setEditFixedAssetForm({ ...editFixedAssetForm, depreciationMethod: e.target.value as any })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 bg-white font-semibold"
                  >
                    <option value="Straight Line (SLM)">Straight Line (SLM)</option>
                    <option value="Written Down Value (WDV)">Written Down Value (WDV)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Residual / Salvage Value (₹)</label>
                  <input
                    type="number"
                    value={editFixedAssetForm.salvageValue}
                    onChange={e => setEditFixedAssetForm({ ...editFixedAssetForm, salvageValue: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-mono"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setShowEditFixedAssetModal(false)} className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs">Save Asset Details</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT CUSTODY DEVICE ================= */}
      {showEditCustodyModal && editingCustodyAsset && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-[460px] max-w-full p-6 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Edit Device Assignment</h3>
              <button onClick={() => setShowEditCustodyModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleEditCustodySubmit} className="space-y-4 pt-4">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Device Name</label>
                <input
                  type="text"
                  required
                  value={editCustodyForm.name}
                  onChange={e => setEditCustodyForm({ ...editCustodyForm, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 font-semibold"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={editCustodyForm.category}
                    onChange={e => setEditCustodyForm({ ...editCustodyForm, category: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Status</label>
                  <select
                    value={editCustodyForm.status}
                    onChange={e => setEditCustodyForm({ ...editCustodyForm, status: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 bg-white font-bold"
                  >
                    <option value="Available">Available</option>
                    <option value="Assigned">Assigned</option>
                    <option value="Under Maintenance">Under Maintenance</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setShowEditCustodyModal(false)} className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs">Save Device</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
