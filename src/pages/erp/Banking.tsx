import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Landmark, ArrowRightLeft, Pencil, Trash2, ArrowUpRight, ArrowDownRight, RefreshCw, CheckCircle2,
  Clock, AlertTriangle, Send, Plus, Search, Filter, ShieldCheck,
  CreditCard, FileText, Check, X, Sparkles, Building2, ExternalLink
} from 'lucide-react';
import ERPNavigation from '../../components/ERPNavigation';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

interface BankAccount {
  id: string;
  accountName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountType: 'Current' | 'Savings' | 'Overdraft' | 'Cash';
  bookBalance: number;
  bankStatementBalance: number;
  unreconciledAmount: number;
  connectedApiStatus: 'Connected' | 'Disconnected' | 'Manual';
  lastSyncedAt: string;
}

interface BankReconciliationItem {
  id: string;
  accountId: string;
  date: string;
  valueDate: string;
  description: string;
  referenceNo: string;
  chequeNo?: string;
  debitAmount: number;
  creditAmount: number;
  status: 'MATCHED' | 'UNCLEARED_CHEQUE' | 'PENDING_BANK_DEBIT' | 'PENDING_BOOK_ENTRY';
  reconciledOn?: string;
  matchedVoucherNo?: string;
}

export default function Banking() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [reconciliationItems, setReconciliationItems] = useState<BankReconciliationItem[]>([]);
  const [summary, setSummary] = useState({
    totalBookBalance: 0,
    totalBankBalance: 0,
    totalUnreconciled: 0,
    matchedCount: 0,
    pendingCount: 0
  });

  const [activeTab, setActiveTab] = useState<'brs' | 'connected' | 'accounts' | 'cheques' | 'contra'>('brs');
  const [selectedAccountId, setSelectedAccountId] = useState('BNK-01');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState('');

  // Cheque Register State
  const [cheques, setCheques] = useState<any[]>([]);
  // Universal CRUD State for Banking
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<any>(null);
  const [accountForm, setAccountForm] = useState({
    accountName: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    accountType: 'Current' as const,
    bookBalance: 0,
    bankStatementBalance: 0
  });

  const [showEditChequeModal, setShowEditChequeModal] = useState(false);
  const [editingCheque, setEditingCheque] = useState<any>(null);
  const [editChequeForm, setEditChequeForm] = useState({ chequeNumber: '', payeeName: '', amount: 0, status: 'Uncleared' });

  const [showEditContraModal, setShowEditContraModal] = useState(false);
  const [editingContra, setEditingContra] = useState<any>(null);
  const [editContraForm, setEditContraForm] = useState({ fromAccount: '', toAccount: '', amount: 0, narration: '' });

  const [showChequeModal, setShowChequeModal] = useState(false);
  const [chequeForm, setChequeForm] = useState({
    chequeNumber: '',
    bankAccount: 'HDFC Corporate Operating A/C',
    payeeName: 'Schneider Electric India Pvt Ltd',
    issueDate: new Date().toISOString().split('T')[0],
    amount: 50000
  });

  // Contra Voucher State
  const [contraEntries, setContraEntries] = useState<any[]>([]);
  const [showContraModal, setShowContraModal] = useState(false);
  const [contraForm, setContraForm] = useState({
    fromAccount: 'Cash-in-Hand',
    toAccount: 'HDFC Corporate Operating A/C',
    amount: 25000,
    narration: 'Daily cash collections deposit to bank account',
    referenceNo: 'DEP-SLIP-4881'
  });

  // Connected Payout Modal
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutForm, setPayoutForm] = useState({
    beneficiaryName: 'Dell Technologies Enterprise India Pvt Ltd',
    accountNumber: '91800291029192',
    ifsc: 'HDFC0000053',
    amount: 150000,
    remarks: 'Invoice Settlement INV-2026-061',
    accountId: 'BNK-01'
  });
  const [submittingPayout, setSubmittingPayout] = useState(false);

  const fetchBankingData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/api/erp/banking/overview`);
      if (res.data) {
        setAccounts(res.data.accounts || []);
        setReconciliationItems(res.data.reconciliationItems || []);
        if (res.data.summary) setSummary(res.data.summary);
      }
      try {
        const [chqRes, ctrRes] = await Promise.all([
          axios.get(`${API_BASE}/api/erp/banking/cheques`),
          axios.get(`${API_BASE}/api/erp/banking/contra`)
        ]);
        setCheques(chqRes.data || []);
        setContraEntries(ctrRes.data || []);
      } catch (errExtra) {
        console.error('Failed to load cheques or contra vouchers', errExtra);
      }
    } catch (err) {
      console.error('Failed to load banking data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBankingData();
  }, []);

  const handleReconcileItem = async (id: string) => {
    try {
      await axios.post(`${API_BASE}/api/erp/banking/reconcile`, { id });
      setActionSuccess('Bank item reconciled against book ledger!');
      setTimeout(() => setActionSuccess(''), 4000);
      fetchBankingData();
    } catch (err) {
      alert('Failed to reconcile item');
    }
  };

  const handleAutoMatch = async () => {
    try {
      const res = await axios.post(`${API_BASE}/api/erp/banking/auto-match`);
      setActionSuccess(res.data.message || 'Auto-matched bank transactions!');
      setTimeout(() => setActionSuccess(''), 5000);
      fetchBankingData();
    } catch (err) {
      alert('Failed to run auto-match');
    }
  };

  // Universal CRUD Handlers for Banking
  const handleOpenCreateAccount = () => {
    setEditingAccount(null);
    setAccountForm({
      accountName: '',
      bankName: '',
      accountNumber: '',
      ifscCode: '',
      accountType: 'Current',
      bookBalance: 0,
      bankStatementBalance: 0
    });
    setShowAccountModal(true);
  };

  const handleOpenEditAccount = (acc: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingAccount(acc);
    setAccountForm({
      accountName: acc.accountName,
      bankName: acc.bankName,
      accountNumber: acc.accountNumber,
      ifscCode: acc.ifscCode,
      accountType: acc.accountType,
      bookBalance: acc.bookBalance,
      bankStatementBalance: acc.bankStatementBalance
    });
    setShowAccountModal(true);
  };

  const handleSaveAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAccount) {
        await axios.put(`${API_BASE}/api/erp/accounting/bank-accounts/${editingAccount.id}`, accountForm);
        alert('Bank account updated successfully!');
      } else {
        await axios.post(`${API_BASE}/api/erp/accounting/bank-accounts`, accountForm);
        alert('Bank account created successfully!');
      }
      setShowAccountModal(false);
      fetchBankingData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save bank account');
    }
  };

  const handleDeleteAccount = async (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Delete bank account "${name}"?`)) return;
    try {
      await axios.delete(`${API_BASE}/api/erp/accounting/bank-accounts/${id}`);
      alert(`Bank account "${name}" deleted!`);
      fetchBankingData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete bank account');
    }
  };

  const handleOpenEditCheque = (chq: any) => {
    setEditingCheque(chq);
    setEditChequeForm({
      chequeNumber: chq.chequeNumber,
      payeeName: chq.payeeName,
      amount: chq.amount,
      status: chq.status || 'Uncleared'
    });
    setShowEditChequeModal(true);
  };

  const handleEditChequeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(`${API_BASE}/api/erp/accounting/cheques/${editingCheque.id}`, editChequeForm);
      setShowEditChequeModal(false);
      alert('Cheque record updated successfully!');
      fetchBankingData();
    } catch (err) {
      alert('Failed to update cheque record');
    }
  };

  const handleDeleteCheque = async (id: string, num: string) => {
    if (!confirm(`Delete Cheque "${num}"?`)) return;
    try {
      await axios.delete(`${API_BASE}/api/erp/accounting/cheques/${id}`);
      alert(`Cheque "${num}" deleted!`);
      fetchBankingData();
    } catch (err) {
      alert('Failed to delete cheque');
    }
  };

  const handleOpenEditContra = (ctr: any) => {
    setEditingContra(ctr);
    setEditContraForm({
      fromAccount: ctr.fromAccount,
      toAccount: ctr.toAccount,
      amount: ctr.amount,
      narration: ctr.narration
    });
    setShowEditContraModal(true);
  };

  const handleEditContraSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(`${API_BASE}/api/erp/accounting/contra/${editingContra.id}`, editContraForm);
      setShowEditContraModal(false);
      alert('Contra voucher updated successfully!');
      fetchBankingData();
    } catch (err) {
      alert('Failed to update contra voucher');
    }
  };

  const handleDeleteContra = async (id: string, num: string) => {
    if (!confirm(`Delete Contra Voucher "${num}"?`)) return;
    try {
      await axios.delete(`${API_BASE}/api/erp/accounting/contra/${id}`);
      alert(`Contra voucher "${num}" deleted!`);
      fetchBankingData();
    } catch (err) {
      alert('Failed to delete contra voucher');
    }
  };

  const handleIssueCheque = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/api/erp/banking/cheques`, chequeForm);
      setShowChequeModal(false);
      setActionSuccess('Cheque issued and recorded in Cheque Register!');
      setTimeout(() => setActionSuccess(''), 5000);
      fetchBankingData();
    } catch (err) {
      alert('Failed to issue cheque');
    }
  };

  const handleRecordContra = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/api/erp/banking/contra`, contraForm);
      setShowContraModal(false);
      setActionSuccess('Contra voucher posted! Fund transfer updated in books and day book.');
      setTimeout(() => setActionSuccess(''), 5000);
      fetchBankingData();
    } catch (err) {
      alert('Failed to record contra voucher');
    }
  };

  const handleConnectedPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmittingPayout(true);
      const res = await axios.post(`${API_BASE}/api/erp/banking/connected-payout`, payoutForm);
      setShowPayoutModal(false);
      setActionSuccess(res.data.message || 'Connected bank payout executed!');
      setTimeout(() => setActionSuccess(''), 6000);
      fetchBankingData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to process connected payout');
    } finally {
      setSubmittingPayout(false);
    }
  };

  const filteredItems = reconciliationItems.filter(item => {
    const matchesAccount = selectedAccountId === 'ALL' || item.accountId === selectedAccountId;
    const matchesStatus = filterStatus === 'ALL' || item.status === filterStatus;
    return matchesAccount && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <ERPNavigation />

      {/* Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Landmark className="w-7 h-7 text-blue-600" /> Banking &amp; Bank Reconciliation (BRS)
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Connected Open Banking API, real-time statement feeds, and Bank Reconciliation Statement (BRS) engine.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleAutoMatch}
            className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" /> Auto-Match BRS Records
          </button>
          <button
            onClick={() => setShowPayoutModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
          >
            <Send className="w-4 h-4" /> Connected Instant Payout
          </button>
        </div>
      </div>

      {/* Notification Banner */}
      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center justify-between text-xs font-semibold shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess('')} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Book Ledger Balance</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">
              ₹{summary.totalBookBalance.toLocaleString()}
            </h3>
            <p className="text-[11px] text-gray-400 mt-1">Total company books cash &amp; bank</p>
          </div>
          <div className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Bank Statement Balance</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">
              ₹{summary.totalBankBalance.toLocaleString()}
            </h3>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">Live bank passbook total</p>
          </div>
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl">
            <Landmark className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Unreconciled Variance</p>
            <h3 className="text-2xl font-black text-amber-600 mt-1">
              ₹{summary.totalUnreconciled.toLocaleString()}
            </h3>
            <p className="text-[11px] text-amber-600 font-semibold mt-1">
              {summary.pendingCount} uncleared cheque / items
            </p>
          </div>
          <div className="p-3.5 bg-amber-50 text-amber-600 rounded-2xl">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Connected Bank Feeds</p>
            <h3 className="text-2xl font-black text-indigo-600 mt-1">HDFC &amp; ICICI</h3>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live API Sync Active
            </p>
          </div>
          <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-2xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Bank Accounts Grid */}
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Corporate Bank Accounts &amp; Cash Desks</h4>
        <button
          onClick={handleOpenCreateAccount}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" /> Add Bank Account
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {accounts.map(acc => (
          <div
            key={acc.id}
            onClick={() => setSelectedAccountId(acc.id)}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              selectedAccountId === acc.id
                ? 'bg-blue-50/50 border-blue-400 shadow-sm'
                : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-700">{acc.bankName}</span>
              <div className="flex items-center gap-1.5">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  acc.connectedApiStatus === 'Connected'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {acc.connectedApiStatus}
                </span>
                <button
                  onClick={(e) => handleOpenEditAccount(acc, e)}
                  className="p-1 text-gray-400 hover:text-blue-600 rounded cursor-pointer"
                  title="Edit Bank Account"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => handleDeleteAccount(acc.id, acc.accountName, e)}
                  className="p-1 text-gray-400 hover:text-rose-600 rounded cursor-pointer"
                  title="Delete Bank Account"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <h4 className="text-sm font-black text-gray-900">{acc.accountName}</h4>
            <p className="text-xs font-mono text-gray-500 mt-0.5">A/C: {acc.accountNumber} • IFSC: {acc.ifscCode}</p>

            <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center text-xs">
              <div>
                <span className="text-gray-400 text-[10px] block">Books Balance:</span>
                <span className="font-mono font-bold text-gray-900">₹{acc.bookBalance.toLocaleString()}</span>
              </div>
              <div className="text-right">
                <span className="text-gray-400 text-[10px] block">Bank Statement:</span>
                <span className="font-mono font-bold text-emerald-700">₹{acc.bankStatementBalance.toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-gray-200 gap-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('brs')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'brs' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <FileText className="w-4 h-4" /> Bank Reconciliation (BRS)
        </button>
        <button
          onClick={() => setActiveTab('cheques')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'cheques' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <CreditCard className="w-4 h-4 text-emerald-600" /> Cheque Register ({cheques.length})
        </button>
        <button
          onClick={() => setActiveTab('contra')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'contra' ? 'border-amber-600 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <ArrowRightLeft className="w-4 h-4 text-amber-600" /> Contra Transfers ({contraEntries.length})
        </button>
        <button
          onClick={() => setActiveTab('connected')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'connected' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Send className="w-4 h-4 text-indigo-600" /> Connected Payouts &amp; APIs
        </button>
      </div>

      {/* ================= TAB 1: BRS ================= */}
      {activeTab === 'brs' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mr-2">Filter Status:</span>
              {[
                { id: 'ALL', label: 'All Items' },
                { id: 'MATCHED', label: 'Reconciled (Matched)' },
                { id: 'UNCLEARED_CHEQUE', label: 'Uncleared Cheques' },
                { id: 'PENDING_BOOK_ENTRY', label: 'Pending Book Entry' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilterStatus(f.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    filterStatus === f.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <button
              onClick={fetchBankingData}
              className="px-3.5 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-lg flex items-center gap-1.5 border border-gray-200"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Re-sync Statement Feed
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-black uppercase text-gray-500 tracking-wider">
                    <th className="py-3 px-4">Date / Value Date</th>
                    <th className="py-3 px-4">Description &amp; Narration</th>
                    <th className="py-3 px-4">Ref / Cheque No</th>
                    <th className="py-3 px-4 text-right">Debit (Outflow)</th>
                    <th className="py-3 px-4 text-right">Credit (Inflow)</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">BRS Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {filteredItems.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-mono">
                        <p className="font-bold text-gray-800">{item.date}</p>
                        <p className="text-[10px] text-gray-400">Val: {item.valueDate}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-gray-900">{item.description}</p>
                        {item.matchedVoucherNo && (
                          <span className="text-[10px] text-blue-600 font-mono">
                            Matched Voucher: {item.matchedVoucherNo}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-gray-600">
                        {item.referenceNo}
                        {item.chequeNo && <span className="block text-[10px] text-amber-600">Chq: {item.chequeNo}</span>}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-rose-600">
                        {item.debitAmount > 0 ? `₹${item.debitAmount.toLocaleString()}` : '-'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600">
                        {item.creditAmount > 0 ? `₹${item.creditAmount.toLocaleString()}` : '-'}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          item.status === 'MATCHED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'UNCLEARED_CHEQUE'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {item.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {item.status === 'MATCHED' ? (
                          <span className="text-[11px] text-emerald-700 font-bold flex items-center justify-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Reconciled
                          </span>
                        ) : (
                          <button
                            onClick={() => handleReconcileItem(item.id)}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                          >
                            Reconcile
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredItems.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-gray-400 text-xs">
                        No bank reconciliation records matching filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: CONNECTED BANKING ================= */}
      {activeTab === 'connected' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-6 rounded-3xl shadow-sm relative overflow-hidden">
            <div className="relative z-10 max-w-2xl">
              <span className="px-3 py-1 bg-blue-500/30 text-blue-200 border border-blue-400/30 rounded-full text-xs font-semibold">
                Open Banking 2.0 API Gateway
              </span>
              <h3 className="text-xl font-bold mt-2">Direct Connected Banking &amp; Vendor Payouts</h3>
              <p className="text-xs text-blue-200 mt-1">
                Disburse vendor payments and invoice settlements directly from your ERP without logging into net banking.
                Equipped with automatic UTR generation, 2-factor verification, and instant ledger entry.
              </p>
              <button
                onClick={() => setShowPayoutModal(true)}
                className="mt-4 px-4 py-2 bg-white text-blue-900 hover:bg-blue-50 rounded-xl text-xs font-bold shadow-sm inline-flex items-center gap-2"
              >
                <Send className="w-4 h-4 text-blue-900" /> Disburse Vendor Payment Now
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <h4 className="font-bold text-gray-900 text-sm mb-1">Corporate Banking Integration Protocols</h4>
              <p className="text-xs text-gray-500 mb-4">Supported direct-to-bank settlement channels</p>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold text-gray-800">HDFC Corporate E-CMS API</span>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">Active</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <Building2 className="w-4 h-4 text-indigo-600" />
                    <span className="font-semibold text-gray-800">ICICI Corporate Connected Banking</span>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">Active</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                    <span className="font-semibold text-gray-800">RazorpayX Corporate Payout Gateway</span>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">Ready</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <h4 className="font-bold text-gray-900 text-sm mb-1">Real-Time Payout Audit &amp; Controls</h4>
              <p className="text-xs text-gray-500 mb-4">Automated guardrails and compliance safety checks</p>
              <div className="space-y-3 text-xs text-gray-700">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Dual maker-checker authorization for disbursements exceeding ₹5,00,000.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Automatic vendor bank account penny-drop verification before major transfers.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Instant debit entry creation in General Ledger with official UTR reference.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      
      {/* ================= TAB: CHEQUE REGISTER ================= */}
      {activeTab === 'cheques' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-gray-200">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Cheque Management &amp; Book Register</h3>
              <p className="text-xs text-gray-500">Track outward cheques issued, bank clearance status, transit time, and dishonour safeguards</p>
            </div>
            <button
              onClick={() => setShowChequeModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" /> + Issue Cheque
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-black uppercase text-gray-500 tracking-wider">
                    <th className="py-3 px-4">Cheque Number</th>
                    <th className="py-3 px-4">Payee / Beneficiary</th>
                    <th className="py-3 px-4">Drawn On Account</th>
                    <th className="py-3 px-4">Issue Date</th>
                    <th className="py-3 px-4 text-right">Amount (₹)</th>
                    <th className="py-3 px-4 text-center">Clearance Status</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {cheques.map((c: any) => (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600">{c.chequeNumber}</td>
                      <td className="py-3.5 px-4 font-bold text-gray-900">{c.payeeName}</td>
                      <td className="py-3.5 px-4 text-gray-600">{c.bankAccount}</td>
                      <td className="py-3.5 px-4 font-mono text-gray-600">{c.issueDate}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-black text-gray-900">₹{c.amount?.toLocaleString()}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          c.status.includes('Cleared') ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenEditCheque(c)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                          title="Edit Cheque"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCheque(c.id, c.chequeNumber)}
                          className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Cheque"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {cheques.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-gray-400">
                        No cheques recorded yet. Click "+ Issue Cheque" to begin.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB: CONTRA FUND TRANSFERS ================= */}
      {activeTab === 'contra' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-gray-200">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Contra Entries (Cash-to-Bank &amp; Bank-to-Bank Transfers)</h3>
              <p className="text-xs text-gray-500">Record cash deposits, cash withdrawals, and inter-bank account fund transfers</p>
            </div>
            <button
              onClick={() => setShowContraModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" /> + Record Contra Voucher
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-black uppercase text-gray-500 tracking-wider">
                    <th className="py-3 px-4">Voucher No</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">From Account (Credit)</th>
                    <th className="py-3 px-4">To Account (Debit)</th>
                    <th className="py-3 px-4">Narration / Memo</th>
                    <th className="py-3 px-4 text-right">Transfer Amount (₹)</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {contraEntries.map((ctr: any) => (
                    <tr key={ctr.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">{ctr.voucherNo}</td>
                      <td className="py-3.5 px-4 font-mono text-gray-600">{ctr.date}</td>
                      <td className="py-3.5 px-4 font-bold text-gray-900">{ctr.fromAccount}</td>
                      <td className="py-3.5 px-4 font-bold text-gray-900">{ctr.toAccount}</td>
                      <td className="py-3.5 px-4 text-gray-500 italic">{ctr.narration}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-black text-gray-900">₹{ctr.amount?.toLocaleString()}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                          {ctr.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenEditContra(ctr)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                          title="Edit Contra Transfer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteContra(ctr.id, ctr.voucherNo)}
                          className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Contra Voucher"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {contraEntries.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-400">
                        No contra vouchers recorded. Click "+ Record Contra Voucher" to execute an internal transfer.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: CONNECTED PAYOUT ================= */}
      {showPayoutModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-[550px] max-w-full p-6">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-black text-gray-900">Execute Connected Bank Payout</h3>
                <p className="text-xs text-gray-500">Instant direct API transfer to vendor beneficiary</p>
              </div>
              <button onClick={() => setShowPayoutModal(false)} className="p-1 rounded-full hover:bg-gray-100 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConnectedPayout} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Source Corporate Bank Account *</label>
                <select
                  value={payoutForm.accountId}
                  onChange={e => setPayoutForm({ ...payoutForm, accountId: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 bg-white font-medium"
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.accountName} - Avail: ₹{acc.bookBalance.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Beneficiary Legal Name *</label>
                <input
                  required
                  value={payoutForm.beneficiaryName}
                  onChange={e => setPayoutForm({ ...payoutForm, beneficiaryName: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Account Number *</label>
                  <input
                    required
                    value={payoutForm.accountNumber}
                    onChange={e => setPayoutForm({ ...payoutForm, accountNumber: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Bank IFSC Code *</label>
                  <input
                    required
                    value={payoutForm.ifsc}
                    onChange={e => setPayoutForm({ ...payoutForm, ifsc: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Disbursement Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={payoutForm.amount}
                    onChange={e => setPayoutForm({ ...payoutForm, amount: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-mono font-bold text-blue-700"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Payment Remarks</label>
                  <input
                    value={payoutForm.remarks}
                    onChange={e => setPayoutForm({ ...payoutForm, remarks: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowPayoutModal(false)}
                  className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPayout}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs flex items-center gap-2"
                >
                  <Send className="w-4 h-4" /> {submittingPayout ? 'Processing API...' : 'Authorize & Disburse Payout'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ================= MODAL: ISSUE CHEQUE ================= */}
      {showChequeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-[500px] max-w-full p-6">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-black text-gray-900">Issue Corporate Cheque</h3>
                <p className="text-xs text-gray-500">Record cheque disbursement against supplier or expenses</p>
              </div>
              <button onClick={() => setShowChequeModal(false)} className="p-1 rounded-full hover:bg-gray-100 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleIssueCheque} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Cheque Number *</label>
                <input
                  required
                  placeholder="e.g. 449103"
                  value={chequeForm.chequeNumber}
                  onChange={e => setChequeForm({ ...chequeForm, chequeNumber: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Payee Legal Name *</label>
                <input
                  required
                  value={chequeForm.payeeName}
                  onChange={e => setChequeForm({ ...chequeForm, payeeName: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Drawn on Bank Account *</label>
                <select
                  value={chequeForm.bankAccount}
                  onChange={e => setChequeForm({ ...chequeForm, bankAccount: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 bg-white font-medium"
                >
                  <option value="HDFC Corporate Operating A/C">HDFC Corporate Operating A/C</option>
                  <option value="ICICI Current A/C">ICICI Current A/C</option>
                  <option value="Axis Escrow Project A/C">Axis Escrow Project A/C</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Cheque Date *</label>
                  <input
                    type="date"
                    required
                    value={chequeForm.issueDate}
                    onChange={e => setChequeForm({ ...chequeForm, issueDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={chequeForm.amount}
                    onChange={e => setChequeForm({ ...chequeForm, amount: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowChequeModal(false)}
                  className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Issue &amp; Log Cheque
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: RECORD CONTRA VOUCHER ================= */}
      {showContraModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-[500px] max-w-full p-6">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-black text-gray-900">Record Contra Voucher</h3>
                <p className="text-xs text-gray-500">Internal fund transfer between Cash and Bank</p>
              </div>
              <button onClick={() => setShowContraModal(false)} className="p-1 rounded-full hover:bg-gray-100 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordContra} className="space-y-4 pt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Source Account (Credit) *</label>
                  <select
                    value={contraForm.fromAccount}
                    onChange={e => setContraForm({ ...contraForm, fromAccount: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 bg-white font-medium"
                  >
                    <option value="Cash-in-Hand">Cash-in-Hand</option>
                    <option value="HDFC Corporate Operating A/C">HDFC Corporate Operating A/C</option>
                    <option value="ICICI Current A/C">ICICI Current A/C</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Destination Account (Debit) *</label>
                  <select
                    value={contraForm.toAccount}
                    onChange={e => setContraForm({ ...contraForm, toAccount: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 bg-white font-medium"
                  >
                    <option value="HDFC Corporate Operating A/C">HDFC Corporate Operating A/C</option>
                    <option value="Cash-in-Hand">Cash-in-Hand</option>
                    <option value="ICICI Current A/C">ICICI Current A/C</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Transfer Amount (₹) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={contraForm.amount}
                    onChange={e => setContraForm({ ...contraForm, amount: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Deposit Slip / Ref No</label>
                  <input
                    value={contraForm.referenceNo}
                    onChange={e => setContraForm({ ...contraForm, referenceNo: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Narration / Transfer Memo</label>
                <input
                  value={contraForm.narration}
                  onChange={e => setContraForm({ ...contraForm, narration: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowContraModal(false)}
                  className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Post Contra Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: CREATE / EDIT BANK ACCOUNT ================= */}
      {showAccountModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-[480px] max-w-full p-6 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">{editingAccount ? 'Edit Bank Account' : 'Add New Bank Account'}</h3>
              <button onClick={() => setShowAccountModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleSaveAccountSubmit} className="space-y-4 pt-4">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Account Display Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ICICI Treasury Operating Account"
                  value={accountForm.accountName}
                  onChange={e => setAccountForm({ ...accountForm, accountName: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 font-semibold"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Bank Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ICICI Bank Ltd"
                    value={accountForm.bankName}
                    onChange={e => setAccountForm({ ...accountForm, bankName: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Account Type</label>
                  <select
                    value={accountForm.accountType}
                    onChange={e => setAccountForm({ ...accountForm, accountType: e.target.value as any })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 bg-white font-bold"
                  >
                    <option value="Current">Current</option>
                    <option value="Savings">Savings</option>
                    <option value="Overdraft">Overdraft</option>
                    <option value="Cash">Cash Desk</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Account Number</label>
                  <input
                    type="text"
                    required
                    value={accountForm.accountNumber}
                    onChange={e => setAccountForm({ ...accountForm, accountNumber: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">IFSC Code</label>
                  <input
                    type="text"
                    required
                    value={accountForm.ifscCode}
                    onChange={e => setAccountForm({ ...accountForm, ifscCode: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-mono uppercase"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Book Balance (₹)</label>
                  <input
                    type="number"
                    value={accountForm.bookBalance}
                    onChange={e => setAccountForm({ ...accountForm, bookBalance: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Bank Statement Balance (₹)</label>
                  <input
                    type="number"
                    value={accountForm.bankStatementBalance}
                    onChange={e => setAccountForm({ ...accountForm, bankStatementBalance: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-mono font-bold"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setShowAccountModal(false)} className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs">
                  {editingAccount ? 'Update Account' : 'Save Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT CHEQUE ================= */}
      {showEditChequeModal && editingCheque && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-[480px] max-w-full p-6 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Edit Cheque {editingCheque.chequeNumber}</h3>
              <button onClick={() => setShowEditChequeModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleEditChequeSubmit} className="space-y-4 pt-4">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Payee Name</label>
                <input
                  type="text"
                  required
                  value={editChequeForm.payeeName}
                  onChange={e => setEditChequeForm({ ...editChequeForm, payeeName: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 font-semibold"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    value={editChequeForm.amount}
                    onChange={e => setEditChequeForm({ ...editChequeForm, amount: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Status</label>
                  <select
                    value={editChequeForm.status}
                    onChange={e => setEditChequeForm({ ...editChequeForm, status: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 bg-white font-bold"
                  >
                    <option value="Uncleared">Uncleared</option>
                    <option value="CLEARED">CLEARED</option>
                    <option value="Dishonoured">Dishonoured</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setShowEditChequeModal(false)} className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs">Save Cheque</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT CONTRA ================= */}
      {showEditContraModal && editingContra && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-[480px] max-w-full p-6 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Edit Contra Voucher {editingContra.voucherNo}</h3>
              <button onClick={() => setShowEditContraModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleEditContraSubmit} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">From Account</label>
                  <input
                    type="text"
                    value={editContraForm.fromAccount}
                    onChange={e => setEditContraForm({ ...editContraForm, fromAccount: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">To Account</label>
                  <input
                    type="text"
                    value={editContraForm.toAccount}
                    onChange={e => setEditContraForm({ ...editContraForm, toAccount: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  value={editContraForm.amount}
                  onChange={e => setEditContraForm({ ...editContraForm, amount: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 font-mono font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Narration</label>
                <textarea
                  rows={2}
                  value={editContraForm.narration}
                  onChange={e => setEditContraForm({ ...editContraForm, narration: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setShowEditContraModal(false)} className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs">Save Contra</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
