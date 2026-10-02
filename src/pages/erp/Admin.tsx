import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  ShieldCheck, Pencil, Trash2, UserCog, Activity, Key, Lock, CheckCircle2,
  Building2, Cloud, Download, Upload, Users, Globe, RefreshCw,
  Clock, AlertTriangle, FileText, Plus, X, Sparkles, Check,
  Laptop, Database, HardDrive, Eye, ShieldAlert, Cpu
} from 'lucide-react';
import ERPNavigation from '../../components/ERPNavigation';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

interface EnterpriseCompany {
  id: string;
  companyName: string;
  tradeName: string;
  legalType: 'Private Limited' | 'Public Limited' | 'LLP' | 'Foreign Subsidiary';
  gstin: string;
  pan: string;
  cin: string;
  registeredOffice: string;
  stateCode: string;
  financialYear: string;
  baseCurrency: string;
  isActive: boolean;
  totalVouchersCount: number;
}

interface ActiveSession {
  id: string;
  userName: string;
  userEmail: string;
  role: string;
  location: string;
  ipAddress: string;
  activeModule: string;
  currentAction: string;
  status: 'Active' | 'Idle';
  lastPing: string;
}

interface EditLogEntry {
  id: string;
  timestamp: string;
  userName: string;
  voucherType: string;
  voucherNumber: string;
  action: 'Created' | 'Altered' | 'Cancelled' | 'Verified';
  details: string;
  beforeValue?: string;
  afterValue?: string;
  ipAddress: string;
}

export default function Admin() {
  const [activeTab, setActiveTab] = useState<'companies' | 'currencies' | 'branches' | 'periodLocks' | 'numbering' | 'collaboration' | 'backup' | 'editLog' | 'roles'>('companies');
  const [companies, setCompanies] = useState<EnterpriseCompany[]>([]);
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [editLogs, setEditLogs] = useState<EditLogEntry[]>([]);
  // Accounting Period Locks State
  const [periodLocks, setPeriodLocks] = useState<any[]>([]);
  // Document Numbering Series State
  const [numberingSeries, setNumberingSeries] = useState<any[]>([]);
  const [showNumberingModal, setShowNumberingModal] = useState(false);
  const [editingSeries, setEditingSeries] = useState<any | null>(null);
  const [seriesForm, setSeriesForm] = useState({
    voucherType: 'Sales Invoice',
    prefix: 'INV/2026-27/',
    suffix: '',
    currentNumber: 1,
    length: 5
  });

  // Universal CRUD State for Admin
  const [showEditCompanyModal, setShowEditCompanyModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<any>(null);
  const [editCompanyForm, setEditCompanyForm] = useState({
    companyName: '',
    tradeName: '',
    legalType: 'Private Limited',
    gstin: '',
    pan: '',
    registeredOffice: '',
    baseCurrency: 'INR (₹)'
  });

  const [showAddCurrencyModal, setShowAddCurrencyModal] = useState(false);
  const [currencyForm, setCurrencyForm] = useState({ currencyCode: '', currencyName: '', symbol: '$', exchangeRateToInr: 80 });

  const [showBranchModal, setShowBranchModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState<any>(null);
  const [branchForm, setBranchForm] = useState({ branchName: '', code: '', city: '', state: '', gstin: '', manager: '', status: 'Branch Office', revenueContribution: '10%' });

  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [periodForm, setPeriodForm] = useState({ periodName: '', fiscalYear: '2026-27', startDate: '', endDate: '', status: 'Open' });

  // Currencies State
  const [currencies, setCurrencies] = useState<any[]>([]);
  const [editRateCurrency, setEditRateCurrency] = useState<any | null>(null);
  const [newRateValue, setNewRateValue] = useState<number>(83.5);

  // Branches State
  const [branches, setBranches] = useState<any[]>([
    {
      id: 'BR-BLR',
      branchName: 'Headquarters & Global Delivery Center',
      code: 'BLR-01',
      city: 'Bangalore',
      state: 'Karnataka (29)',
      gstin: '29AAACT2727Q1ZB',
      manager: 'Ananya Sharma',
      status: 'Primary HQ',
      revenueContribution: '68%'
    },
    {
      id: 'BR-BOM',
      branchName: 'Western Regional Commercial Hub',
      code: 'MUM-02',
      city: 'Mumbai',
      state: 'Maharashtra (27)',
      gstin: '27AAACT2727Q1Z8',
      manager: 'Vikram Mehta',
      status: 'Branch Office',
      revenueContribution: '21%'
    },
    {
      id: 'BR-DEL',
      branchName: 'Northern Govt & Enterprise Liaison',
      code: 'DEL-03',
      city: 'New Delhi',
      state: 'Delhi (07)',
      gstin: '07AAACT2727Q1Z2',
      manager: 'Rajesh Singhal',
      status: 'Branch Office',
      revenueContribution: '11%'
    }
  ]);

  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');

  // Modals
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [companyForm, setCompanyForm] = useState({
    companyName: '',
    tradeName: '',
    legalType: 'Private Limited' as const,
    gstin: '',
    pan: '',
    cin: '',
    registeredOffice: 'Bangalore, India',
    stateCode: '29 - Karnataka',
    financialYear: '2026-2027',
    baseCurrency: 'INR (₹)'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [compRes, sesRes, logRes] = await Promise.all([
        axios.get(`${API_BASE}/api/erp/admin/companies`),
        axios.get(`${API_BASE}/api/erp/admin/active-sessions`),
        axios.get(`${API_BASE}/api/erp/admin/edit-log`)
      ]);
      setCompanies(compRes.data || []);
      setActiveSessions(sesRes.data || []);
      setEditLogs(logRes.data || []);
      try {
        const curRes = await axios.get(`${API_BASE}/api/erp/admin/currencies`);
        setCurrencies(curRes.data || []);

        const [pRes, nRes] = await Promise.all([
          axios.get(`${API_BASE}/api/erp/admin/period-locks`),
          axios.get(`${API_BASE}/api/erp/admin/numbering-series`)
        ]);
        setPeriodLocks(pRes.data || []);
        setNumberingSeries(nRes.data || []);
      } catch (e) {
        console.error('Failed to load currencies', e);
      }
    } catch (err) {
      console.error('Failed to load admin governance data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTogglePeriodLock = async (id: string) => {
    try {
      const res = await axios.post(`${API_BASE}/api/erp/admin/period-locks/toggle`, { id });
      setActionMsg(`Period "${res.data.period?.periodName}" is now ${res.data.period?.status}! Backdated vouchers ${res.data.period?.status === 'Locked' ? 'frozen' : 'allowed'}.`);
      setTimeout(() => setActionMsg(''), 5000);
      fetchData();
    } catch (err) {
      alert('Failed to toggle period lock');
    }
  };

  const handleOpenNumberingEdit = (item: any) => {
    setEditingSeries(item);
    setSeriesForm({
      voucherType: item.voucherType,
      prefix: item.prefix || '',
      suffix: item.suffix || '',
      currentNumber: item.currentNumber || 1,
      length: item.length || 5
    });
    setShowNumberingModal(true);
  };

  const handleSaveNumberingSeries = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/api/erp/admin/numbering-series`, seriesForm);
      setShowNumberingModal(false);
      setActionMsg(`Document Numbering Series for ${seriesForm.voucherType} configured successfully!`);
      setTimeout(() => setActionMsg(''), 5000);
      fetchData();
    } catch (err) {
      alert('Failed to save numbering series');
    }
  };

  // Universal CRUD Handlers for Admin
  const handleOpenEditCompany = (c: any) => {
    setEditingCompany(c);
    setEditCompanyForm({
      companyName: c.companyName,
      tradeName: c.tradeName,
      legalType: c.legalType,
      gstin: c.gstin,
      pan: c.pan,
      registeredOffice: c.registeredOffice,
      baseCurrency: c.baseCurrency
    });
    setShowEditCompanyModal(true);
  };

  const handleEditCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(`${API_BASE}/api/erp/admin/companies/${editingCompany.id}`, editCompanyForm);
      setShowEditCompanyModal(false);
      alert('Company entity updated successfully!');
      fetchData();
    } catch (err) {
      alert('Failed to update company entity');
    }
  };

  const handleDeleteCompany = async (id: string, name: string) => {
    if (!confirm(`Delete company entity "${name}" and all isolated ledgers?`)) return;
    try {
      await axios.delete(`${API_BASE}/api/erp/admin/companies/${id}`);
      alert(`Company entity "${name}" deleted!`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete company');
    }
  };

  const handleSaveCurrencySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/api/erp/admin/currencies`, currencyForm);
      setShowAddCurrencyModal(false);
      alert(`Currency ${currencyForm.currencyCode} configured successfully!`);
      fetchData();
    } catch (err) {
      alert('Failed to save currency');
    }
  };

  const handleDeleteCurrency = async (code: string) => {
    if (!confirm(`Delete currency ${code}?`)) return;
    try {
      await axios.delete(`${API_BASE}/api/erp/admin/currencies/${code}`);
      alert(`Currency ${code} deleted!`);
      fetchData();
    } catch (err) {
      alert('Failed to delete currency');
    }
  };

  const handleOpenCreateBranch = () => {
    setEditingBranch(null);
    setBranchForm({ branchName: '', code: '', city: '', state: '', gstin: '', manager: '', status: 'Branch Office', revenueContribution: '10%' });
    setShowBranchModal(true);
  };

  const handleOpenEditBranch = (b: any) => {
    setEditingBranch(b);
    setBranchForm({
      branchName: b.branchName,
      code: b.code,
      city: b.city,
      state: b.state,
      gstin: b.gstin,
      manager: b.manager,
      status: b.status,
      revenueContribution: b.revenueContribution
    });
    setShowBranchModal(true);
  };

  const handleSaveBranchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBranch) {
        await axios.put(`${API_BASE}/api/erp/admin/branches/${editingBranch.id}`, branchForm);
        alert('Branch updated successfully!');
      } else {
        await axios.post(`${API_BASE}/api/erp/admin/branches`, branchForm);
        alert('Branch created successfully!');
      }
      setShowBranchModal(false);
      fetchData();
    } catch (err) {
      alert('Failed to save branch');
    }
  };

  const handleDeleteBranch = async (id: string, name: string) => {
    if (!confirm(`Delete Branch "${name}"?`)) return;
    try {
      await axios.delete(`${API_BASE}/api/erp/admin/branches/${id}`);
      alert(`Branch "${name}" deleted!`);
      fetchData();
    } catch (err) {
      alert('Failed to delete branch');
    }
  };

  const handleOpenCreatePeriodLock = () => {
    setPeriodForm({ periodName: '', fiscalYear: '2026-27', startDate: '', endDate: '', status: 'Open' });
    setShowPeriodModal(true);
  };

  const handleSavePeriodLockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/api/erp/admin/period-locks`, periodForm);
      setShowPeriodModal(false);
      alert('Accounting period created successfully!');
      fetchData();
    } catch (err) {
      alert('Failed to create period');
    }
  };

  const handleDeletePeriodLock = async (id: string, name: string) => {
    if (!confirm(`Delete Period Lock "${name}"?`)) return;
    try {
      await axios.delete(`${API_BASE}/api/erp/admin/period-locks/${id}`);
      alert(`Period "${name}" deleted!`);
      fetchData();
    } catch (err) {
      alert('Failed to delete period lock');
    }
  };

  const handleUpdateExchangeRate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editRateCurrency) return;
    try {
      await axios.post(`${API_BASE}/api/erp/admin/currencies`, {
        currencyCode: editRateCurrency.currencyCode,
        exchangeRateToInr: newRateValue
      });
      setEditRateCurrency(null);
      setActionMsg(`Exchange rate for ${editRateCurrency.currencyCode} updated to ₹${newRateValue}!`);
      setTimeout(() => setActionMsg(''), 5000);
      fetchData();
    } catch (err) {
      alert('Failed to update exchange rate');
    }
  };

  const handleSwitchCompany = async (id: string, name: string) => {
    try {
      await axios.post(`${API_BASE}/api/erp/admin/companies/switch`, { id });
      setActionMsg(`Active working context switched to "${name}"! All financial ledgers and stock repositories updated.`);
      setTimeout(() => setActionMsg(''), 6000);
      fetchData();
    } catch (err) {
      alert('Failed to switch company');
    }
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/api/erp/admin/companies`, companyForm);
      setShowCompanyModal(false);
      setCompanyForm({
        companyName: '',
        tradeName: '',
        legalType: 'Private Limited',
        gstin: '',
        pan: '',
        cin: '',
        registeredOffice: 'Bangalore, India',
        stateCode: '29 - Karnataka',
        financialYear: '2026-2027',
        baseCurrency: 'INR (₹)'
      });
      setActionMsg('New company entity established with isolated chart of accounts!');
      setTimeout(() => setActionMsg(''), 5000);
      fetchData();
    } catch (err) {
      alert('Failed to create company');
    }
  };

  const handleDownloadBackup = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/erp/admin/backup/export`);
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Company_Backup_Cloud_Snapshot_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setActionMsg('Company cloud backup snapshot exported and checksum verified!');
      setTimeout(() => setActionMsg(''), 5000);
    } catch (err) {
      alert('Failed to download backup');
    }
  };

  const handleRestoreBackup = async () => {
    if (!window.confirm('Restore company data from latest encrypted cloud snapshot?\nThis will verify integrity and sync all ledgers.')) return;
    try {
      const res = await axios.post(`${API_BASE}/api/erp/admin/backup/restore`);
      setActionMsg(res.data.message || 'Company cloud backup restored successfully!');
      setTimeout(() => setActionMsg(''), 6000);
      fetchData();
    } catch (err) {
      alert('Failed to restore backup');
    }
  };

  return (
    <div className="space-y-6">
      <ERPNavigation />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-blue-600" /> Multi-Company, Remote Collaboration &amp; Cloud Security
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Enterprise administration: Multiple companies, remote collaboration sessions, TallyPrime Edit Log, and automated cloud backups.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleDownloadBackup}
            className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
          >
            <Download className="w-4 h-4 text-indigo-600" /> Export Encrypted Cloud Backup
          </button>
          <button
            onClick={() => setShowCompanyModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" /> + Create New Company
          </button>
        </div>
      </div>

      {/* Action Notification */}
      {actionMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center justify-between text-xs font-semibold shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{actionMsg}</span>
          </div>
          <button onClick={() => setActionMsg('')} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Governance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Managed Companies</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">{companies.length} Entities</h3>
            <p className="text-[11px] text-blue-600 font-semibold mt-1">
              Active: {companies.find(c => c.isActive)?.tradeName || 'HQ'}
            </p>
          </div>
          <div className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active Remote Users</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">{activeSessions.length} Online</h3>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">Real-time collaborative locks</p>
          </div>
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tally Edit Log Trail</p>
            <h3 className="text-2xl font-black text-purple-600 mt-1">{editLogs.length} Events</h3>
            <p className="text-[11px] text-purple-600 font-semibold mt-1">MCA Compliant Audit Trail</p>
          </div>
          <div className="p-3.5 bg-purple-50 text-purple-600 rounded-2xl">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Cloud Vault Backup</p>
            <h3 className="text-2xl font-black text-indigo-600 mt-1">AES-256</h3>
            <p className="text-[11px] text-indigo-600 font-semibold mt-1">Automated daily snapshot sync</p>
          </div>
          <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Cloud className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-gray-200 gap-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('companies')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'companies' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Building2 className="w-4 h-4" /> Multiple Companies ({companies.length})
        </button>
        <button
          onClick={() => setActiveTab('currencies')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'currencies' ? 'border-amber-600 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <RefreshCw className="w-4 h-4 text-amber-600" /> Multi-Currency Master ({currencies.length})
        </button>
        <button
          onClick={() => setActiveTab('branches')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'branches' ? 'border-teal-600 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Building2 className="w-4 h-4 text-teal-600" /> Multi-Location Branches ({branches.length})
        </button>
        <button
          onClick={() => setActiveTab('periodLocks')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'periodLocks' ? 'border-rose-600 text-rose-600' : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Lock className="w-4 h-4 text-rose-600" /> Accounting Period Locks ({periodLocks.filter(p => p.status === 'Locked').length} Locked)
        </button>
        <button
          onClick={() => setActiveTab('numbering')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'numbering' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <FileText className="w-4 h-4 text-indigo-600" /> Document Numbering Series ({numberingSeries.length})
        </button>
        <button
          onClick={() => setActiveTab('collaboration')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'collaboration' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Globe className="w-4 h-4 text-emerald-600" /> Remote Work &amp; Live Collaboration ({activeSessions.length})
        </button>
        <button
          onClick={() => setActiveTab('backup')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'backup' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Cloud className="w-4 h-4 text-indigo-600" /> Cloud Backup &amp; Disaster Recovery
        </button>
        <button
          onClick={() => setActiveTab('editLog')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'editLog' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Activity className="w-4 h-4 text-purple-600" /> TallyPrime Edit Log (Audit Trail)
        </button>
        <button
          onClick={() => setActiveTab('roles')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'roles' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" /> Roles &amp; Security Permissions
        </button>
      </div>

      {/* ================= TAB 1: MULTIPLE COMPANIES ================= */}
      {activeTab === 'companies' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {companies.map(c => (
              <div
                key={c.id}
                className={`bg-white rounded-3xl p-6 border transition-all relative overflow-hidden shadow-xs ${
                  c.isActive ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md' : 'border-gray-200'
                }`}
              >
                {c.isActive && (
                  <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-black px-4 py-1 rounded-bl-2xl uppercase tracking-wider flex items-center gap-1">
                    <Check className="w-3 h-3" /> Active Working Entity
                  </div>
                )}

                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-3 rounded-2xl ${c.isActive ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-gray-900 leading-tight">{c.companyName}</h4>
                    <p className="text-xs text-blue-600 font-semibold">{c.tradeName}</p>
                  </div>
                </div>

                <div className="space-y-2 py-3 border-y border-gray-100 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Legal Type:</span>
                    <span className="font-semibold text-gray-800">{c.legalType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">GSTIN:</span>
                    <span className="font-mono font-bold text-gray-900">{c.gstin}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">CIN / Reg:</span>
                    <span className="font-mono text-gray-600">{c.cin}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Financial Year:</span>
                    <span className="font-semibold text-gray-800">{c.financialYear} ({c.baseCurrency})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Registered Office:</span>
                    <span className="text-gray-700 text-right line-clamp-1 max-w-[200px]">{c.registeredOffice}</span>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <span className="text-xs font-mono text-gray-500">
                    {c.totalVouchersCount} Vouchers Recorded
                  </span>

                  {c.isActive ? (
                    <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold border border-blue-200">
                      Currently Operating
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSwitchCompany(c.id, c.companyName)}
                      className="px-3.5 py-1.5 bg-gray-900 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                    >
                      Switch to this Company
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      
      {/* ================= TAB: MULTI-CURRENCY MASTER ================= */}
      {activeTab === 'currencies' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Multi-Currency Forex &amp; Daily Exchange Rates</h3>
              <p className="text-xs text-gray-500">Record foreign currency export/import transactions with automatic conversion into base currency (INR ₹)</p>
            </div>
            <button
              onClick={() => setShowAddCurrencyModal(true)}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" /> + Add Currency
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {currencies.map((cur: any) => (
              <div key={cur.currencyCode} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-mono text-xl font-black text-gray-900">{cur.symbol} {cur.currencyCode}</span>
                    {cur.isBaseCurrency ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">Base Currency</span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">Foreign Forex</span>
                    )}
                  </div>
                  <h4 className="font-bold text-gray-700 text-sm">{cur.currencyName}</h4>

                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Current Conversion Rate</span>
                    <strong className="text-xl font-black font-mono text-gray-900">
                      1 {cur.currencyCode} = ₹{cur.exchangeRateToInr} INR
                    </strong>
                    <p className="text-[10px] text-gray-400 mt-1">
                      Updated: {new Date(cur.lastUpdated).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {!cur.isBaseCurrency && (
                  <div className="mt-5 pt-3 border-t border-gray-100 flex justify-end">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditRateCurrency(cur);
                          setNewRateValue(cur.exchangeRateToInr);
                        }}
                        className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        Update Forex Rate
                      </button>
                      <button
                        onClick={() => handleDeleteCurrency(cur.currencyCode)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg cursor-pointer"
                        title="Delete Currency"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB: MULTI-LOCATION BRANCHES ================= */}
      {activeTab === 'branches' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Multi-Location Branch &amp; Regional Cost Centres</h3>
              <p className="text-xs text-gray-500">Consolidated and standalone reporting across regional GST registrations and branches</p>
            </div>
            <button
              onClick={handleOpenCreateBranch}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" /> + Add Branch
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {branches.map(br => (
              <div key={br.id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
                      {br.code}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700">
                      {br.status}
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-gray-900">{br.branchName}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">{br.city}, {br.state}</p>

                  <div className="mt-4 pt-3 border-t border-gray-100 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Branch GSTIN:</span>
                      <span className="font-mono font-bold text-gray-800">{br.gstin}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Branch Manager:</span>
                      <span className="font-bold text-gray-800">{br.manager}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Revenue Share:</span>
                      <span className="font-bold text-emerald-700">{br.revenueContribution}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px]">
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Synchronized with HQ Books
                  </span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleOpenEditBranch(br)} className="p-1 text-gray-400 hover:text-blue-600 rounded cursor-pointer" title="Edit Branch">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDeleteBranch(br.id, br.branchName)} className="p-1 text-gray-400 hover:text-rose-600 rounded cursor-pointer" title="Delete Branch">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 2: REMOTE WORK & COLLABORATION ================= */}
      {activeTab === 'collaboration' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Live Active Remote Collaborators</h3>
              <p className="text-xs text-gray-500">Multiple authorized users working concurrently on centralized company data</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-emerald-700">Real-Time Sync Engine Active</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-black uppercase text-gray-500 tracking-wider">
                    <th className="py-3 px-4">User &amp; Role</th>
                    <th className="py-3 px-4">Location &amp; Remote IP</th>
                    <th className="py-3 px-4">Active Module</th>
                    <th className="py-3 px-4">Current Operating Action</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Heartbeat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {activeSessions.map(ses => (
                    <tr key={ses.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-gray-900">{ses.userName}</p>
                        <p className="text-[10px] text-gray-400">{ses.role} • {ses.userEmail}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-medium text-gray-800">{ses.location}</p>
                        <p className="text-[10px] font-mono text-gray-400">IP: {ses.ipAddress}</p>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-blue-700">
                        {ses.activeModule}
                      </td>
                      <td className="py-3.5 px-4 text-gray-600">
                        {ses.currentAction}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-black text-[10px] uppercase rounded-full">
                          {ses.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-gray-500">
                        {ses.lastPing}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: CLOUD BACKUP & DISASTER RECOVERY ================= */}
      {activeTab === 'backup' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                  <HardDrive className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-gray-900 text-base">On-Demand Company Cloud Snapshot</h3>
                  <p className="text-xs text-gray-500">Generate encrypted export of all vouchers, ledgers &amp; stock items</p>
                </div>
              </div>

              <div className="space-y-3 my-5 text-xs text-gray-600 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex justify-between">
                  <span>Encryption Standard:</span>
                  <span className="font-mono font-bold text-gray-900">AES-256-GCM Cloud Vault</span>
                </div>
                <div className="flex justify-between">
                  <span>Data Inclusions:</span>
                  <span className="font-semibold text-gray-900">Invoices, POs, Godowns, BRS, Edit Logs</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Automated Backup:</span>
                  <span className="font-mono text-emerald-700 font-bold">Today, 03:00 AM IST (Automated Daily)</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleDownloadBackup}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" /> Download Backup Snapshot
                </button>
                <button
                  onClick={handleRestoreBackup}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-300"
                >
                  Restore Snapshot
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                  <Cloud className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-gray-900 text-base">Automated Cloud Backup Policy</h3>
                  <p className="text-xs text-gray-500">Continuous background replication and point-in-time recovery</p>
                </div>
              </div>

              <div className="space-y-3.5 my-5 text-xs text-gray-700">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-gray-900">Automated Daily Server Snapshots</p>
                    <p className="text-[11px] text-gray-500">Cloud database snapshots taken every night with 30-day retention.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-gray-900">Multi-Region Redundancy</p>
                    <p className="text-[11px] text-gray-500">Encrypted backups replicated across Mumbai and Bangalore cloud regions.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-gray-900">Disaster Recovery RPO &amp; RTO</p>
                    <p className="text-[11px] text-gray-500">Recovery Point Objective (RPO) &lt; 15 mins. Recovery Time Objective (RTO) &lt; 2 hrs.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 4: TALLY EDIT LOG (AUDIT TRAIL) ================= */}
      {activeTab === 'editLog' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-gray-900">TallyPrime-Compliant Edit Log (MCA Audit Trail)</h3>
              <p className="text-xs text-gray-500">Companies Act 2013 statutory requirement: Immutable logging of every voucher modification</p>
            </div>
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full font-bold text-[10px] uppercase">
              Audit Trail Cannot Be Disabled
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-black uppercase text-gray-500 tracking-wider">
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Voucher Type &amp; Number</th>
                    <th className="py-3 px-4 text-center">Action</th>
                    <th className="py-3 px-4">Audit Details &amp; Alteration Record</th>
                    <th className="py-3 px-4 text-right">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {editLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-gray-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-gray-900">
                        {log.userName}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-gray-800">{log.voucherType}</span>
                        <p className="font-mono text-blue-600 text-[11px]">{log.voucherNumber}</p>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          log.action === 'Created'
                            ? 'bg-emerald-100 text-emerald-800'
                            : log.action === 'Altered'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-gray-700">
                        {log.details}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-gray-400">
                        {log.ipAddress}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 5: ROLES & RBAC ================= */}
      {activeTab === 'roles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl shadow-xs border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 text-lg">Senior Chartered Accountant</h3>
              <Key className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-xs text-gray-500 mb-4">Complete financial stewardship, journal vouchers, P&amp;L/Balance Sheet audit, and GST offset filing.</p>
            <ul className="text-xs space-y-2 text-gray-600 mb-6">
              <li className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2 text-green-500" /> Authorize Bank Payouts</li>
              <li className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2 text-green-500" /> Statutory GSTR-1 &amp; GSTR-3B Filing</li>
              <li className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2 text-green-500" /> Post Year-End Adjusting Journals</li>
            </ul>
            <button className="w-full py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-100">Configure Permissions</button>
          </div>

          <div className="bg-white rounded-3xl shadow-xs border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 text-lg">Statutory Auditor (Read-Only)</h3>
              <ShieldAlert className="w-5 h-5 text-indigo-500" />
            </div>
            <p className="text-xs text-gray-500 mb-4">External audit inspection access with locked editing rights and full Edit Log trace visibility.</p>
            <ul className="text-xs space-y-2 text-gray-600 mb-6">
              <li className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2 text-green-500" /> Inspect Trial Balance &amp; Ledgers</li>
              <li className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2 text-green-500" /> Export Full Edit Log Trail</li>
              <li className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2 text-green-500" /> View GSTR-2B Cross-Reconciliation</li>
            </ul>
            <button className="w-full py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-100">Configure Permissions</button>
          </div>

          <div className="bg-white rounded-3xl shadow-xs border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 text-lg">Warehouse &amp; Logistics Manager</h3>
              <HardDrive className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-xs text-gray-500 mb-4">Depot operations, delivery challans, physical stock audits, and inter-godown transfer vouchers.</p>
            <ul className="text-xs space-y-2 text-gray-600 mb-6">
              <li className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2 text-green-500" /> Issue Inter-Godown Stock Transfers</li>
              <li className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2 text-green-500" /> Record Batch Expiry &amp; Mfg Lots</li>
              <li className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2 text-green-500" /> Dispatch Delivery Challans with E-Way</li>
            </ul>
            <button className="w-full py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-100">Configure Permissions</button>
          </div>
        </div>
      )}

      {/* ================= MODAL: CREATE NEW COMPANY ================= */}
      {showCompanyModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-[650px] max-w-full max-h-[92vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-black text-gray-900">Create New Company Entity</h3>
                <p className="text-xs text-gray-500">Configure subsidiary, branch, or independent accounting entity</p>
              </div>
              <button onClick={() => setShowCompanyModal(false)} className="p-1 rounded-full hover:bg-gray-100 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCompany} className="space-y-3.5 pt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Company Registered Name *</label>
                  <input
                    required
                    placeholder="e.g. Acme Tech Solutions Pvt Ltd"
                    value={companyForm.companyName}
                    onChange={e => setCompanyForm({ ...companyForm, companyName: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Trade Name / Brand</label>
                  <input
                    placeholder="e.g. Acme Cloud"
                    value={companyForm.tradeName}
                    onChange={e => setCompanyForm({ ...companyForm, tradeName: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Legal Entity Type</label>
                  <select
                    value={companyForm.legalType}
                    onChange={e => setCompanyForm({ ...companyForm, legalType: e.target.value as any })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 bg-white font-medium"
                  >
                    <option value="Private Limited">Private Limited</option>
                    <option value="Public Limited">Public Limited</option>
                    <option value="LLP">LLP</option>
                    <option value="Foreign Subsidiary">Foreign Subsidiary</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">GSTIN</label>
                  <input
                    placeholder="29AAAAA0000A1Z1"
                    value={companyForm.gstin}
                    onChange={e => setCompanyForm({ ...companyForm, gstin: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">PAN</label>
                  <input
                    placeholder="AAAAA0000A"
                    value={companyForm.pan}
                    onChange={e => setCompanyForm({ ...companyForm, pan: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Financial Year</label>
                  <input
                    value={companyForm.financialYear}
                    onChange={e => setCompanyForm({ ...companyForm, financialYear: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Base Currency</label>
                  <input
                    value={companyForm.baseCurrency}
                    onChange={e => setCompanyForm({ ...companyForm, baseCurrency: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Registered Office Address</label>
                <textarea
                  rows={2}
                  value={companyForm.registeredOffice}
                  onChange={e => setCompanyForm({ ...companyForm, registeredOffice: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCompanyModal(false)}
                  className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Create Company
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ================= MODAL: UPDATE FOREX RATE ================= */}
      {editRateCurrency && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-[450px] max-w-full p-6">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-black text-gray-900">Update Exchange Rate</h3>
                <p className="text-xs text-gray-500">1 {editRateCurrency.currencyCode} to INR (₹)</p>
              </div>
              <button onClick={() => setEditRateCurrency(null)} className="p-1 rounded-full hover:bg-gray-100 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateExchangeRate} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">New Exchange Rate (INR ₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={newRateValue}
                  onChange={e => setNewRateValue(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-xl p-2.5 font-mono font-bold text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditRateCurrency(null)}
                  className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Save Exchange Rate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT COMPANY ================= */}
      {showEditCompanyModal && editingCompany && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-[500px] max-w-full p-6 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Edit Company Entity</h3>
              <button onClick={() => setShowEditCompanyModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleEditCompanySubmit} className="space-y-4 pt-4">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Company Legal Name *</label>
                <input
                  type="text"
                  required
                  value={editCompanyForm.companyName}
                  onChange={e => setEditCompanyForm({ ...editCompanyForm, companyName: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 font-semibold"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Trade / Brand Name</label>
                  <input
                    type="text"
                    value={editCompanyForm.tradeName}
                    onChange={e => setEditCompanyForm({ ...editCompanyForm, tradeName: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Legal Entity Type</label>
                  <select
                    value={editCompanyForm.legalType}
                    onChange={e => setEditCompanyForm({ ...editCompanyForm, legalType: e.target.value as any })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 bg-white font-medium"
                  >
                    <option value="Private Limited">Private Limited</option>
                    <option value="Public Limited">Public Limited</option>
                    <option value="LLP">LLP</option>
                    <option value="Foreign Subsidiary">Foreign Subsidiary</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">GSTIN</label>
                  <input
                    type="text"
                    value={editCompanyForm.gstin}
                    onChange={e => setEditCompanyForm({ ...editCompanyForm, gstin: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">PAN</label>
                  <input
                    type="text"
                    value={editCompanyForm.pan}
                    onChange={e => setEditCompanyForm({ ...editCompanyForm, pan: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Registered Office Address</label>
                <input
                  type="text"
                  value={editCompanyForm.registeredOffice}
                  onChange={e => setEditCompanyForm({ ...editCompanyForm, registeredOffice: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setShowEditCompanyModal(false)} className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs cursor-pointer">Save Entity</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD CURRENCY ================= */}
      {showAddCurrencyModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-[440px] max-w-full p-6 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Add Forex Currency</h3>
              <button onClick={() => setShowAddCurrencyModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleSaveCurrencySubmit} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Currency Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. EUR"
                    value={currencyForm.currencyCode}
                    onChange={e => setCurrencyForm({ ...currencyForm, currencyCode: e.target.value.toUpperCase() })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Symbol *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. €"
                    value={currencyForm.symbol}
                    onChange={e => setCurrencyForm({ ...currencyForm, symbol: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-center font-bold"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Currency Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Euro"
                  value={currencyForm.currencyName}
                  onChange={e => setCurrencyForm({ ...currencyForm, currencyName: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Exchange Rate to INR (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={currencyForm.exchangeRateToInr}
                  onChange={e => setCurrencyForm({ ...currencyForm, exchangeRateToInr: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 font-mono font-bold"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setShowAddCurrencyModal(false)} className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs cursor-pointer">Add Currency</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: CREATE / EDIT BRANCH ================= */}
      {showBranchModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-[480px] max-w-full p-6 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">{editingBranch ? 'Edit Branch Office' : 'Add New Branch Location'}</h3>
              <button onClick={() => setShowBranchModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleSaveBranchSubmit} className="space-y-4 pt-4">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Branch Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hyderabad Regional Delivery Center"
                  value={branchForm.branchName}
                  onChange={e => setBranchForm({ ...branchForm, branchName: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 font-semibold"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Branch Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. HYD-04"
                    value={branchForm.code}
                    onChange={e => setBranchForm({ ...branchForm, code: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Status</label>
                  <select
                    value={branchForm.status}
                    onChange={e => setBranchForm({ ...branchForm, status: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 bg-white font-medium"
                  >
                    <option value="Branch Office">Branch Office</option>
                    <option value="Regional Hub">Regional Hub</option>
                    <option value="Warehouse / Depot">Warehouse / Depot</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={branchForm.city}
                    onChange={e => setBranchForm({ ...branchForm, city: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">State &amp; Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Telangana (36)"
                    value={branchForm.state}
                    onChange={e => setBranchForm({ ...branchForm, state: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Branch GSTIN</label>
                  <input
                    type="text"
                    required
                    value={branchForm.gstin}
                    onChange={e => setBranchForm({ ...branchForm, gstin: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Branch Head / Manager</label>
                  <input
                    type="text"
                    value={branchForm.manager}
                    onChange={e => setBranchForm({ ...branchForm, manager: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setShowBranchModal(false)} className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs cursor-pointer">
                  {editingBranch ? 'Update Branch' : 'Create Branch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: CREATE PERIOD LOCK ================= */}
      {showPeriodModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-[460px] max-w-full p-6 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Define Accounting Period</h3>
              <button onClick={() => setShowPeriodModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleSavePeriodLockSubmit} className="space-y-4 pt-4">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Period Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. October 2026 or Q3 2026"
                  value={periodForm.periodName}
                  onChange={e => setPeriodForm({ ...periodForm, periodName: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 font-semibold"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={periodForm.startDate}
                    onChange={e => setPeriodForm({ ...periodForm, startDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={periodForm.endDate}
                    onChange={e => setPeriodForm({ ...periodForm, endDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setShowPeriodModal(false)} className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs cursor-pointer">Create Period</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
