import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  DollarSign, Pencil, 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  Building, 
  Clock, 
  Download, 
  RefreshCw, 
  Printer, 
  MessageSquare, 
  ShieldAlert, 
  Layers, 
  Scale, 
  Receipt, 
  Calendar, 
  ExternalLink,
  Search,
  Check,
  X,
  Filter,
  Trash2,
  RotateCcw,
  Sparkles,
  PieChart,
  Landmark,
  CreditCard,
  Briefcase,
  ShoppingBag,
  HardDrive,
  Activity,
  Target,
  AlertOctagon,
  BarChart3,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import OSNavigation from '../../components/OSNavigation';
import ERPNavigation from '../../components/ERPNavigation';

interface PnLData {
  grossSales: number;
  discounts: number;
  netSalesRevenue: number;
  cogs: number;
  directMaterials: number;
  inwardFreight: number;
  grossProfit: number;
  grossMarginPercent: number;
  opex: number;
  salaries: number;
  generalExpenses: number;
  ebitda: number;
  taxes: number;
  netGstLiability: number;
  netProfit: number;
  netMarginPercent: number;
}

interface BalanceSheetData {
  currentAssets: {
    cashAndBank: number;
    accountsReceivable: number;
    inventoryValuation: number;
    inputTaxCreditITC: number;
    totalCurrentAssets: number;
  };
  fixedAssets: {
    propertyAndEquipment: number;
    totalFixedAssets: number;
  };
  totalAssets: number;
  currentLiabilities: {
    accountsPayable: number;
    gstPayable: number;
    tdsPayable: number;
    totalCurrentLiabilities: number;
  };
  totalLiabilities: number;
  equity: {
    shareCapitalAndRetainedEarnings: number;
    totalEquity: number;
  };
  totalLiabilitiesAndEquity: number;
}

interface ClientInvoiceSummary {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  totalAmount: number;
  balanceDue: number;
  status: string;
  ageInDays: number;
  isOverdue15Days: boolean;
}

interface ClientOutstanding {
  clientName: string;
  clientGstin: string;
  email: string;
  phone: string;
  totalInvoiced: number;
  totalReceived: number;
  currentOutstanding: number;
  overdue15DaysAmount: number;
  has15DayAlert: boolean;
  invoices: ClientInvoiceSummary[];
}

interface FinancialEntriesData {
  invoices: any[];
  purchases: any[];
  opex: any[];
  fixedAssets: any[];
  bankCapital: any[];
  counts: {
    invoices: number;
    purchases: number;
    opex: number;
    fixedAssets: number;
    bankCapital: number;
    totalEntries: number;
  };
}

interface AccountsAlerts {
  activeAlertsCount: number;
  totalOverdue15Days: number;
  alertClients: ClientOutstanding[];
}

export default function Finance() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'pnl' | 'balanceSheet' | 'trialBalance' | 'cashFlow' | 'vouchers' | 'ims' | 'costCentres' | 'budgets' | 'ratios' | 'dayBook' | 'exceptions' | 'gstr1' | 'gstr3b' | 'outstanding' | 'ledger' | 'manage'>('pnl');
  const [financialEntries, setFinancialEntries] = useState<FinancialEntriesData | null>(null);

  // GSTR-1 and GSTR-3B State
  const [gstr1Data, setGstr1Data] = useState<any>(null);
  const [gstr3bData, setGstr3bData] = useState<any>(null);
  const [gstr1Section, setGstr1Section] = useState<'4A' | '5A' | '7' | '12' | '13'>('4A');
  const [gstr3bSimulated, setGstr3bSimulated] = useState(false);

  // Trial Balance & Cash Flow State
  const [trialBalanceData, setTrialBalanceData] = useState<any>(null);
  const [cashFlowData, setCashFlowData] = useState<any>(null);

  // Manage Entries Filters & State
  const [manageFilter, setManageFilter] = useState<'all' | 'REVENUE' | 'COGS' | 'OPEX' | 'FIXED_ASSET' | 'BANK_CAPITAL'>('all');
  const [manageSearch, setManageSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Universal Add Financial Entry Modal State
  const [showAddEntryModal, setShowAddEntryModal] = useState(false);
  const [entryForm, setEntryForm] = useState({
    entryType: 'REVENUE' as 'REVENUE' | 'COGS' | 'OPEX' | 'FIXED_ASSET' | 'BANK_CAPITAL',
    title: '',
    partyName: '',
    category: 'Sales & Services',
    amount: 0,
    taxRate: 18,
    freightCharges: 0,
    discount: 0,
    date: new Date().toISOString().split('T')[0],
    isPaid: true,
    notes: '',
    paymentMode: 'Bank Transfer (NEFT/RTGS)'
  });
  const [submittingEntry, setSubmittingEntry] = useState(false);

  // Reset to Zero Modal State
  const [showResetModal, setShowResetModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [pnl, setPnl] = useState<PnLData | null>(null);
  const [balanceSheet, setBalanceSheet] = useState<BalanceSheetData | null>(null);
  const [clientOutstanding, setClientOutstanding] = useState<ClientOutstanding[]>([]);
  const [accountsAlerts, setAccountsAlerts] = useState<AccountsAlerts>({ activeAlertsCount: 0, totalOverdue15Days: 0, alertClients: [] });
  const [loading, setLoading] = useState(true);

  // Financial Options & Controls
  const [periodFilter, setPeriodFilter] = useState<'FY 2026-27' | 'Q2 FY 2026-27' | 'September 2026' | 'YTD Cumulative'>('FY 2026-27');
  const [accountingBasis, setAccountingBasis] = useState<'accrual' | 'cash'>('accrual');
  const [showAccountCodes, setShowAccountCodes] = useState(false);
  const [asOfDateFilter, setAsOfDateFilter] = useState('30 Sep 2026 (Current Quarter)');
  
  // Modals & Filters
  const [showModal, setShowModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState<{ invoiceId: string; invoiceNumber: string; clientName: string; balanceDue: number } | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState('NEFT / RTGS');
  const [paymentRef, setPaymentRef] = useState('');
  const [searchClient, setSearchClient] = useState('');
  const [outstandingFilter, setOutstandingFilter] = useState<'all' | 'overdue15'>('all');
  
  // WhatsApp dispatch modal state
  const [showWhatsAppModal, setShowWhatsAppModal] = useState<{ client: ClientOutstanding; invoice?: ClientInvoiceSummary } | null>(null);
  // Universal CRUD State for Finance
  const [showEditVoucherModal, setShowEditVoucherModal] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<any>(null);
  const [editVoucherForm, setEditVoucherForm] = useState({ narration: '', voucherDate: '', referenceNumber: '' });

  const [showEditCostCentreModal, setShowEditCostCentreModal] = useState(false);
  const [editingCostCentre, setEditingCostCentre] = useState<any>(null);
  const [editCostCentreForm, setEditCostCentreForm] = useState({ name: '', code: '', category: 'Department', manager: '', allocatedBudget: 0 });

  const [showEditBudgetModal, setShowEditBudgetModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<any>(null);
  const [editBudgetForm, setEditBudgetForm] = useState({ category: '', allocatedBudget: 0 });

  const [showEditEntryModal, setShowEditEntryModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<any>(null);
  const [editEntryForm, setEditEntryForm] = useState({ title: '', amount: 0, category: '', subCategory: '' });

  // Generic Double-Entry Voucher Engine State
  const [genericVouchers, setGenericVouchers] = useState<any[]>([]);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [voucherFilterType, setVoucherFilterType] = useState('All');
  const [voucherForm, setVoucherForm] = useState({
    voucherType: 'Journal' as const,
    voucherDate: new Date().toISOString().split('T')[0],
    referenceNumber: 'JRN-REF-001',
    narration: 'Being monthly cloud infrastructure adjustment',
    lines: [
      { ledgerId: 'LED-09', ledgerName: 'Salaries, Utilities & Cloud Hosting', debit: 25000, credit: 0, costCenter: 'Core Cloud Engineering' },
      { ledgerId: 'LED-05', ledgerName: 'HDFC Corporate Operating A/C', debit: 0, credit: 25000, costCenter: '' }
    ]
  });

  // GST IMS (Invoice Management System) Inbox State
  const [imsInboxItems, setImsInboxItems] = useState<any[]>([]);
  const [imsStats, setImsStats] = useState<any>({ totalCount: 0, acceptedCount: 0, rejectedCount: 0, pendingCount: 0, totalITCClaimable: 0 });
  const [imsFilterAction, setImsFilterAction] = useState('All');

  // Tally Prime Cloud: Cost Centres, Budgets, Ratios, Day Book, Exception Reports
  const [costCentres, setCostCentres] = useState<any[]>([]);
  const [showCostCentreModal, setShowCostCentreModal] = useState(false);
  const [costCentreForm, setCostCentreForm] = useState({
    name: 'Cloud Infrastructure & SRE Hub',
    category: 'Department',
    budget: 1200000
  });

  const [budgets, setBudgets] = useState<any[]>([]);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [budgetForm, setBudgetForm] = useState({
    category: 'Enterprise Cloud R&D',
    allocatedBudget: 1500000,
    fiscalPeriod: 'FY 2026-27'
  });

  const [financialRatios, setFinancialRatios] = useState<any>(null);
  const [dayBookEntries, setDayBookEntries] = useState<any[]>([]);
  const [dayBookTypeFilter, setDayBookTypeFilter] = useState('All');
  const [exceptionReports, setExceptionReports] = useState<any>(null);

  const [customWhatsAppMsg, setCustomWhatsAppMsg] = useState('');
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false);

  const [newTx, setNewTx] = useState({ type: 'Income', amount: 0, category: 'Sales', description: '' });

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

  const exportPnLCSV = () => {
    if (!pnl) return;
    const rows = [
      ['PROFIT & LOSS STATEMENT (INCOME STATEMENT)'],
      ['Reporting Entity', 'OmniCloud Technologies Pvt Ltd'],
      ['Financial Reporting Period', periodFilter],
      ['Accounting Method', accountingBasis === 'accrual' ? 'Accrual Basis (GAAP / Ind-AS)' : 'Cash Basis (Collections & Disbursements)'],
      ['Reporting Currency', 'INR (₹)'],
      ['Generated On', new Date().toLocaleString()],
      [''],
      ['Ind-AS Code', 'Particulars / Account Line Item', 'Amount (INR ₹)'],
      ['REV-01', 'Gross Sales Revenue & Invoiced Services', pnl.grossSales],
      ['REV-02', 'Less: Trade Discounts & Customer Rebates', -pnl.discounts],
      ['REV-NET', 'Net Sales Revenue (A)', pnl.netSalesRevenue],
      ['COGS-01', 'Direct Raw Materials & Hardware Purchases', pnl.directMaterials],
      ['COGS-02', 'Inward Freight & Logistics', pnl.inwardFreight],
      ['COGS-TOT', 'Total Cost of Goods Sold (B)', pnl.cogs],
      ['GP-TOT', 'GROSS PROFIT (C = A - B)', pnl.grossProfit],
      ['GP-PCT', 'Gross Profit Margin (%)', `${pnl.grossMarginPercent}%`],
      ['OPEX-01', 'Employee Salaries & Payroll Disbursement', pnl.salaries],
      ['OPEX-02', 'General Administrative & Cloud Hosting Infrastructure', pnl.generalExpenses],
      ['OPEX-TOT', 'Total Operating Expenses (D)', pnl.opex],
      ['EBITDA', 'OPERATING PROFIT (EBITDA) (E = C - D)', pnl.ebitda],
      ['TAX-01', 'Provision for Corporate Income Tax (~22%)', pnl.taxes],
      ['TAX-02', 'Net Output GST Liability (Output - ITC)', pnl.netGstLiability],
      ['NPAT', 'NET PROFIT AFTER TAX (NPAT)', pnl.netProfit],
      ['NPAT-PCT', 'Net Profit Margin (%)', `${pnl.netMarginPercent}%`]
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.map(cell => `"${cell}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PnL_Statement_${periodFilter.replace(/[^a-zA-Z0-9]/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportBalanceSheetCSV = () => {
    if (!balanceSheet) return;
    const rows = [
      ['CLASSIFIED BALANCE SHEET (STATEMENT OF FINANCIAL POSITION)'],
      ['Reporting Entity', 'OmniCloud Technologies Pvt Ltd'],
      ['As of Reporting Date', asOfDateFilter],
      ['Statutory Standard', 'Schedule III Ind-AS / Companies Act 2013'],
      ['Reporting Currency', 'INR (₹)'],
      ['Generated On', new Date().toLocaleString()],
      [''],
      ['Ind-AS Code', 'Classification & Account Line Item', 'Amount (INR ₹)'],
      ['AST-CA-01', 'Cash & Bank Balances (HDFC Operating A/C)', balanceSheet.currentAssets.cashAndBank],
      ['AST-CA-02', 'Accounts Receivable (Trade Debtors)', balanceSheet.currentAssets.accountsReceivable],
      ['AST-CA-03', 'Inventories & Finished Goods Valuation', balanceSheet.currentAssets.inventoryValuation],
      ['AST-CA-04', 'Input Tax Credit (GST ITC Pool Balance)', balanceSheet.currentAssets.inputTaxCreditITC],
      ['AST-CA-TOT', 'Total Current Assets', balanceSheet.currentAssets.totalCurrentAssets],
      ['AST-NCA-01', 'Property, Plant & Cloud Server Hardware', balanceSheet.fixedAssets.propertyAndEquipment],
      ['AST-NCA-TOT', 'Total Fixed & Non-Current Assets', balanceSheet.fixedAssets.totalFixedAssets],
      ['AST-TOT', 'TOTAL ASSETS', balanceSheet.totalAssets],
      [''],
      ['LIA-CL-01', 'Accounts Payable (Trade Creditors & Suppliers)', balanceSheet.currentLiabilities.accountsPayable],
      ['LIA-CL-02', 'Statutory Output GST Payable to Govt', balanceSheet.currentLiabilities.gstPayable],
      ['LIA-CL-03', 'TDS Withholding Tax Payable', balanceSheet.currentLiabilities.tdsPayable],
      ['LIA-CL-TOT', 'Total Current Liabilities', balanceSheet.currentLiabilities.totalCurrentLiabilities],
      ['EQ-01', 'Paid-Up Share Capital & Retained Earnings', balanceSheet.equity.shareCapitalAndRetainedEarnings],
      ['EQ-TOT', 'Total Shareholder Equity & Reserves', balanceSheet.equity.totalEquity],
      ['LIA-EQ-TOT', 'TOTAL LIABILITIES & SHAREHOLDER EQUITY', balanceSheet.totalLiabilitiesAndEquity],
      ['AUDIT-STATUS', 'Audit Reconciliation Status', balanceSheet.totalAssets === balanceSheet.totalLiabilitiesAndEquity ? 'BALANCED & AUDITED' : 'DISCREPANCY DETECTED']
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.map(cell => `"${cell}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Balance_Sheet_IndAS_${asOfDateFilter.replace(/[^a-zA-Z0-9]/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [txRes, finRes, entriesRes] = await Promise.all([
        axios.get(`${API_BASE}/api/os/finance`),
        axios.get(`${API_BASE}/api/erp/financials/overview`),
        axios.get(`${API_BASE}/api/erp/financials/entries`)
      ]);
      setTransactions(txRes.data || []);
      if (finRes.data) {
        setPnl(finRes.data.pnl);
        setBalanceSheet(finRes.data.balanceSheet);
        setClientOutstanding(finRes.data.clientOutstanding || []);
        setAccountsAlerts(finRes.data.accountsAlerts || { activeAlertsCount: 0, totalOverdue15Days: 0, alertClients: [] });
      }
      if (entriesRes.data) {
        setFinancialEntries(entriesRes.data);
      }

      try {
        const [g1Res, g3Res, tbRes, cfRes] = await Promise.all([
          axios.get(`${API_BASE}/api/erp/accounting/gst/gstr1`),
          axios.get(`${API_BASE}/api/erp/accounting/gst/gstr3b`),
          axios.get(`${API_BASE}/api/erp/financials/trial-balance`),
          axios.get(`${API_BASE}/api/erp/financials/cash-flow`)
        ]);
        setGstr1Data(g1Res.data);
        setGstr3bData(g3Res.data);
        setTrialBalanceData(tbRes.data);
        setCashFlowData(cfRes.data);

        // Fetch Cost Centres, Budgets, Ratios, Day Book & Exceptions
        try {
          const [ccRes, bgtRes, ratRes, dbRes, excRes] = await Promise.all([
            axios.get(`${API_BASE}/api/erp/accounting/cost-centres`),
            axios.get(`${API_BASE}/api/erp/accounting/budgets`),
            axios.get(`${API_BASE}/api/erp/accounting/financial-ratios`),
            axios.get(`${API_BASE}/api/erp/accounting/day-book`),
            axios.get(`${API_BASE}/api/erp/accounting/exception-reports`)
          ]);
          setCostCentres(ccRes.data || []);
          setBudgets(bgtRes.data || []);
          setFinancialRatios(ratRes.data);
          setDayBookEntries(dbRes.data || []);
          setExceptionReports(excRes.data);

          // Fetch Double-Entry Vouchers & GST IMS
          try {
            const [vchRes, imsRes] = await Promise.all([
              axios.get(`${API_BASE}/api/erp/accounting/vouchers`),
              axios.get(`${API_BASE}/api/erp/gst/ims`)
            ]);
            setGenericVouchers(vchRes.data.vouchers || []);
            if (imsRes.data) {
              setImsInboxItems(imsRes.data.items || []);
              setImsStats(imsRes.data.stats || {});
            }
          } catch (e2) {
            console.error('Failed to load vouchers or IMS data', e2);
          }
        } catch (e) {
          console.error('Failed to load enterprise Tally finance features', e);
        }
      } catch (errGst) {
        console.error('Failed to fetch GSTR/Financials data', errGst);
      }
    } catch (err) {
      console.error('Error fetching financial records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDownloadGstr1Json = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/erp/accounting/gst/gstr1-json`);
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `GSTR1_${res.data.gstin || '29AAACT2727Q1ZB'}_${res.data.fp || '092026'}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to export GSTR-1 JSON');
    }
  };

  const handleAddVoucherLine = () => {
    setVoucherForm(prev => ({
      ...prev,
      lines: [...prev.lines, { ledgerId: 'LED-01', ledgerName: 'New Account Ledger', debit: 0, credit: 0, costCenter: '' }]
    }));
  };

  const handleRemoveVoucherLine = (idx: number) => {
    if (voucherForm.lines.length <= 2) return alert('A double-entry voucher must contain at least 2 lines (1 Debit and 1 Credit)');
    setVoucherForm(prev => ({
      ...prev,
      lines: prev.lines.filter((_, i) => i !== idx)
    }));
  };

  const handlePostVoucherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const totalDr = voucherForm.lines.reduce((a, b) => a + Number(b.debit || 0), 0);
    const totalCr = voucherForm.lines.reduce((a, b) => a + Number(b.credit || 0), 0);
    if (Math.abs(totalDr - totalCr) > 0.01) {
      return alert(`Double-entry imbalance! Total Debit (₹${totalDr.toLocaleString()}) must equal Total Credit (₹${totalCr.toLocaleString()}). Variance: ₹${Math.abs(totalDr - totalCr).toLocaleString()}.`);
    }

    try {
      const res = await axios.post(`${API_BASE}/api/erp/accounting/vouchers`, voucherForm);
      setShowVoucherModal(false);
      alert(`Voucher ${res.data.voucher?.voucherNumber} posted successfully! Double-entry ledger verified.`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to post double-entry voucher');
    }
  };

  const handleIMSAction = async (id: string, action: 'Accept' | 'Reject' | 'Pending') => {
    try {
      const res = await axios.post(`${API_BASE}/api/erp/gst/ims/${id}/action`, { action });
      alert(res.data.message || `IMS action updated to ${action}!`);
      fetchData();
    } catch (err) {
      alert('Failed to update IMS action');
    }
  };

  // Universal CRUD Handlers for Finance
  const handleOpenEditVoucher = (v: any) => {
    setEditingVoucher(v);
    setEditVoucherForm({
      narration: v.narration || '',
      voucherDate: v.voucherDate || '',
      referenceNumber: v.referenceNumber || ''
    });
    setShowEditVoucherModal(true);
  };

  const handleEditVoucherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(`${API_BASE}/api/erp/accounting/vouchers/${editingVoucher.id}`, editVoucherForm);
      setShowEditVoucherModal(false);
      alert('Voucher updated successfully!');
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update voucher');
    }
  };

  const handleDeleteVoucher = async (id: string, num: string) => {
    if (!confirm(`Delete Double-Entry Voucher "${num}"?`)) return;
    try {
      await axios.delete(`${API_BASE}/api/erp/accounting/vouchers/${id}`);
      alert(`Voucher "${num}" deleted!`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete voucher');
    }
  };

  const handleOpenEditCostCentre = (cc: any) => {
    setEditingCostCentre(cc);
    setEditCostCentreForm({
      name: cc.name,
      code: cc.code,
      category: cc.category || 'Department',
      manager: cc.manager || '',
      allocatedBudget: cc.allocatedBudget || 0
    });
    setShowEditCostCentreModal(true);
  };

  const handleEditCostCentreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(`${API_BASE}/api/erp/accounting/cost-centres/${editingCostCentre.id}`, editCostCentreForm);
      setShowEditCostCentreModal(false);
      alert('Cost Centre updated successfully!');
      fetchData();
    } catch (err) {
      alert('Failed to update cost centre');
    }
  };

  const handleDeleteCostCentre = async (id: string, name: string) => {
    if (!confirm(`Delete Cost Centre "${name}"?`)) return;
    try {
      await axios.delete(`${API_BASE}/api/erp/accounting/cost-centres/${id}`);
      alert(`Cost Centre "${name}" deleted!`);
      fetchData();
    } catch (err) {
      alert('Failed to delete cost centre');
    }
  };

  const handleOpenEditBudget = (b: any) => {
    setEditingBudget(b);
    setEditBudgetForm({
      category: b.category,
      allocatedBudget: b.allocatedBudget || 0
    });
    setShowEditBudgetModal(true);
  };

  const handleEditBudgetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(`${API_BASE}/api/erp/accounting/budgets/${editingBudget.id}`, editBudgetForm);
      setShowEditBudgetModal(false);
      alert('Budget allocation updated successfully!');
      fetchData();
    } catch (err) {
      alert('Failed to update budget');
    }
  };

  const handleDeleteBudget = async (id: string, cat: string) => {
    if (!confirm(`Delete budget plan for "${cat}"?`)) return;
    try {
      await axios.delete(`${API_BASE}/api/erp/accounting/budgets/${id}`);
      alert(`Budget plan for "${cat}" deleted!`);
      fetchData();
    } catch (err) {
      alert('Failed to delete budget');
    }
  };

  const handleOpenEditEntry = (entry: any) => {
    setEditingEntry(entry);
    setEditEntryForm({
      title: entry.title,
      amount: entry.amount,
      category: entry.category || '',
      subCategory: entry.subCategory || ''
    });
    setShowEditEntryModal(true);
  };

  const handleEditEntrySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // First delete old entry, then recreate with new fields
      await axios.delete(`${API_BASE}/api/erp/accounting/custom-entry/${editingEntry.type}/${editingEntry.id}`);
      await axios.post(`${API_BASE}/api/erp/accounting/custom-entry`, {
        type: editingEntry.type,
        ...editEntryForm
      });
      setShowEditEntryModal(false);
      alert('Statement entry updated and financials recalculated!');
      fetchData();
    } catch (err) {
      alert('Failed to update statement entry');
    }
  };

  const handleCreateCostCentre = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/api/erp/accounting/cost-centres`, costCentreForm);
      setShowCostCentreModal(false);
      alert('Cost Centre registered successfully!');
      fetchData();
    } catch (err) {
      alert('Failed to create Cost Centre');
    }
  };

  const handleCreateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/api/erp/accounting/budgets`, budgetForm);
      setShowBudgetModal(false);
      alert('Budget variance target allocated successfully!');
      fetchData();
    } catch (err) {
      alert('Failed to allocate Budget');
    }
  };

  const handleSimulateChallan = () => {
    setGstr3bSimulated(true);
    const cashTotal = gstr3bData?.table6_1_payment?.paidInCash || 0;
    alert(`PMT-06 GST Payment Challan generated for ₹${cashTotal.toLocaleString()}!\nNet cash liability has been routed to the corporate banking gateway for e-payment verification.`);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/api/os/finance`, newTx);
      setShowModal(false);
      setNewTx({ type: 'Income', amount: 0, category: 'Sales', description: '' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entryForm.title.trim()) {
      alert('Please enter a description or item title');
      return;
    }
    if (entryForm.amount <= 0) {
      alert('Please enter a valid amount greater than ₹0');
      return;
    }
    setSubmittingEntry(true);
    try {
      await axios.post(`${API_BASE}/api/erp/financials/quick-entry`, entryForm);
      setShowAddEntryModal(false);
      setEntryForm({
        entryType: 'REVENUE',
        title: '',
        partyName: '',
        category: 'Sales & Services',
        amount: 0,
        taxRate: 18,
        freightCharges: 0,
        discount: 0,
        date: new Date().toISOString().split('T')[0],
        isPaid: true,
        notes: '',
        paymentMode: 'Bank Transfer (NEFT/RTGS)'
      });
      await fetchData();
    } catch (err: any) {
      console.error('Failed to record financial entry:', err);
      alert(err?.response?.data?.error || 'Failed to record entry');
    } finally {
      setSubmittingEntry(false);
    }
  };

  const handleDeleteEntry = async (type: string, id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This will recalculate P&L and Balance Sheet immediately.`)) {
      return;
    }
    setDeletingId(id);
    try {
      await axios.delete(`${API_BASE}/api/erp/financials/entries/${type.toLowerCase()}/${id}`);
      await fetchData();
    } catch (err) {
      console.error('Failed to delete entry:', err);
      alert('Failed to delete financial entry');
    } finally {
      setDeletingId(null);
    }
  };

  const handleResetAllToZero = async () => {
    setIsResetting(true);
    try {
      await axios.post(`${API_BASE}/api/erp/financials/reset-to-zero`);
      setShowResetModal(false);
      await fetchData();
    } catch (err) {
      console.error('Failed to reset financial books:', err);
      alert('Failed to reset books to zero');
    } finally {
      setIsResetting(false);
    }
  };

  const allEntriesList = useMemo(() => {
    if (!financialEntries) return [];
    const list: Array<{
      id: string;
      type: 'REVENUE' | 'COGS' | 'OPEX' | 'FIXED_ASSET' | 'BANK_CAPITAL';
      title: string;
      party: string;
      category: string;
      date: string;
      amount: number;
      tax: number;
      status: string;
    }> = [];

    (financialEntries.invoices || []).forEach(inv => {
      list.push({
        id: inv.id,
        type: 'REVENUE',
        title: inv.items?.[0]?.description || `Tax Invoice #${inv.invoiceNumber}`,
        party: inv.customerName || 'Client Customer',
        category: 'Revenue / Sales',
        date: inv.invoiceDate || inv.createdAt?.split('T')[0] || '',
        amount: inv.totalAmount || inv.subtotal || 0,
        tax: inv.taxTotal || 0,
        status: inv.status || 'Sent'
      });
    });

    (financialEntries.purchases || []).forEach(pur => {
      list.push({
        id: pur.id,
        type: 'COGS',
        title: pur.items?.[0]?.itemName || `Purchase Voucher #${pur.voucherNo}`,
        party: pur.supplierName || 'Vendor Supplier',
        category: 'COGS / Direct Material',
        date: pur.supplierInvoiceDate || pur.createdAt?.split('T')[0] || '',
        amount: pur.totalAmount || pur.subtotal || 0,
        tax: pur.taxTotal || 0,
        status: pur.status || 'Pending Payment'
      });
    });

    (financialEntries.opex || []).forEach(op => {
      list.push({
        id: op.id,
        type: 'OPEX',
        title: op.title,
        party: op.payee || 'Service Provider / Employee',
        category: `OPEX - ${op.category}`,
        date: op.date || op.createdAt?.split('T')[0] || '',
        amount: op.totalAmount || op.amount || 0,
        tax: op.taxAmount || 0,
        status: op.status || 'Paid'
      });
    });

    (financialEntries.fixedAssets || []).forEach(fa => {
      list.push({
        id: fa.id,
        type: 'FIXED_ASSET',
        title: fa.assetName,
        party: fa.location || 'Head Office',
        category: `Fixed Asset - ${fa.category}`,
        date: fa.acquisitionDate || fa.createdAt?.split('T')[0] || '',
        amount: fa.currentBookValue || fa.acquisitionCost || 0,
        tax: 0,
        status: 'Capitalized'
      });
    });

    (financialEntries.bankCapital || []).forEach(bc => {
      list.push({
        id: bc.id,
        type: 'BANK_CAPITAL',
        title: bc.title,
        party: bc.accountName || 'Bank Account',
        category: `Capital - ${bc.category}`,
        date: bc.date || bc.createdAt?.split('T')[0] || '',
        amount: bc.amount || 0,
        tax: 0,
        status: 'Liquid Funds'
      });
    });

    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [financialEntries]);

  const filteredEntriesList = useMemo(() => {
    return allEntriesList.filter(item => {
      if (manageFilter !== 'all' && item.type !== manageFilter) return false;
      if (manageSearch.trim()) {
        const q = manageSearch.toLowerCase();
        const match =
          item.title.toLowerCase().includes(q) ||
          item.party.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.status.toLowerCase().includes(q) ||
          item.amount.toString().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [allEntriesList, manageFilter, manageSearch]);

  const handleSettlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showPaymentModal) return;
    try {
      await axios.post(`${API_BASE}/api/erp/invoices/${showPaymentModal.invoiceId}/pay`, {
        amount: paymentAmount,
        method: paymentMethod,
        reference: paymentRef || `NEFT-${Date.now().toString().slice(-6)}`,
        notes: `Settled via Client Outstanding Portal`
      });
      setShowPaymentModal(null);
      fetchData();
      alert(`Payment of ₹${paymentAmount.toLocaleString()} recorded successfully! P&L and Balance Sheet updated.`);
    } catch (err) {
      console.error('Failed to record payment', err);
      alert('Failed to record payment.');
    }
  };

  const openWhatsAppModal = (client: ClientOutstanding, invoice?: ClientInvoiceSummary) => {
    const rawPhone = client.phone || '+91 98450 11223';
    const invInfo = invoice 
      ? `Tax Invoice *${invoice.invoiceNumber}* for *₹${invoice.balanceDue.toLocaleString()}* (Age: ${invoice.ageInDays} days)`
      : `total pending balance of *₹${client.currentOutstanding.toLocaleString()}*`;

    const templateMsg = `*URGENT: ACCOUNTS TEAM OVERDUE PAYMENT ADVICE*\n\nDear Accounts Team / ${client.clientName},\n\nThis is an automated formal notice regarding ${invInfo} which has exceeded our standard 15-day enterprise credit threshold.\n\n*Bank Settlement Details:*\nBank: HDFC Bank Ltd\nA/C No: 50200088991122\nIFSC: HDFC0001029\nUPI ID: omnicloud@hdfcbank\n\nKindly remit the balance today and share the UTR reference number to prevent credit hold.\n\nThank you,\nFinance & Accounts Department\nOmniCloud Technologies Pvt Ltd`;

    setShowWhatsAppModal({ client, invoice });
    setCustomWhatsAppMsg(templateMsg);
  };

  const handleDispatchWhatsApp = async () => {
    if (!showWhatsAppModal) return;
    setSendingWhatsApp(true);
    const rawPhone = showWhatsAppModal.client.phone || '+91 98450 11223';
    const cleanPhone = rawPhone.replace(/[^0-9]/g, '');

    try {
      const res = await axios.post(`${API_BASE}/api/erp/whatsapp/send`, {
        phone: cleanPhone,
        message: customWhatsAppMsg,
        customerName: showWhatsAppModal.client.clientName
      });
      window.open(res.data.whatsappUrl, '_blank');
      setShowWhatsAppModal(null);
    } catch (err) {
      const fallbackUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(customWhatsAppMsg)}`;
      window.open(fallbackUrl, '_blank');
      setShowWhatsAppModal(null);
    } finally {
      setSendingWhatsApp(false);
    }
  };

  const filteredClients = clientOutstanding.filter(c => {
    const matchesSearch = c.clientName.toLowerCase().includes(searchClient.toLowerCase()) || 
                          c.clientGstin.toLowerCase().includes(searchClient.toLowerCase());
    const matchesOverdue = outstandingFilter === 'all' ? true : c.has15DayAlert;
    return matchesSearch && matchesOverdue;
  });

  const totalInvoicedAll = clientOutstanding.reduce((acc, c) => acc + c.totalInvoiced, 0);
  const totalReceivedAll = clientOutstanding.reduce((acc, c) => acc + c.totalReceived, 0);
  const totalOutstandingAll = clientOutstanding.reduce((acc, c) => acc + c.currentOutstanding, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {location.pathname.startsWith('/erp') ? <ERPNavigation /> : <OSNavigation />}

      {/* Top Banner: Single Entry Real-Time Pipeline Notice */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-blue-800/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 bg-blue-500/20 text-blue-300 rounded-lg border border-blue-400/30">
                <Scale className="w-4 h-4" />
              </span>
              <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider">
                Enterprise Financial Engine & Real-Time Books
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-400/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Single-Entry Unified Sync Active
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Finance, P&L, Balance Sheet & Ledger</h1>
            <p className="text-xs text-blue-200/80 max-w-3xl mt-1">
              Data entered once across Invoices, Purchases, and CRM automatically synchronizes directly into the Profit & Loss statement, Balance Sheet, and Client Outstanding ledgers in real time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowAddEntryModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all"
              title="Add a new Revenue Invoice, COGS Purchase, Operating Expense, Fixed Asset, or Bank Capital"
            >
              <Plus className="w-4 h-4" />
              <span>Add Financial Entry</span>
            </button>
            <button
              onClick={() => setShowResetModal(true)}
              className="px-3.5 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-400/40 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
              title="Reset all books and entries to strictly ₹0.00"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-300" />
              <span>Reset to ₹0.00</span>
            </button>
            <button
              onClick={() => fetchData()}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Books</span>
            </button>
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 text-blue-300" />
              <span>Print Statement</span>
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Journal Tx</span>
            </button>
          </div>
        </div>
      </div>

      {/* AUTOMATIC 15-DAY OVERDUE ACCOUNTS TEAM ALERT BANNER */}
      {accountsAlerts.activeAlertsCount > 0 && (
        <div className="bg-rose-50 border-2 border-rose-400/70 rounded-2xl p-5 shadow-sm text-slate-800 relative overflow-hidden animate-pulse-slow">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-3 bg-rose-600 text-white rounded-xl shadow-xs">
                <ShieldAlert className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-rose-700 bg-rose-200/80 px-2 py-0.5 rounded-full border border-rose-300">
                    ACCOUNTS TEAM ACTION REQUIRED • 15+ DAYS OVERDUE
                  </span>
                  <span className="text-xs text-rose-600 font-semibold">
                    {accountsAlerts.activeAlertsCount} Client{accountsAlerts.activeAlertsCount > 1 ? 's' : ''} Exceeded Credit Window
                  </span>
                </div>
                <h3 className="text-lg font-black text-rose-950 mt-1">
                  ₹{accountsAlerts.totalOverdue15Days.toLocaleString()} in Overdue Receivables Exceeding 15 Days
                </h3>
                <p className="text-xs text-rose-800 mt-0.5">
                  The automated credit monitoring rule flagged {accountsAlerts.activeAlertsCount} customer accounts that have uncollected balances older than 15 calendar days.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => {
                  setActiveTab('outstanding');
                  setOutstandingFilter('overdue15');
                }}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Review {accountsAlerts.activeAlertsCount} Overdue Clients</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Navigation Tabs */}
      <div className="flex items-center space-x-1 border-b border-gray-200 pb-1">
        <button
          onClick={() => setActiveTab('pnl')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
            activeTab === 'pnl'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Profit & Loss Statement (P&L)</span>
        </button>
        <button
          onClick={() => setActiveTab('balanceSheet')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
            activeTab === 'balanceSheet'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Balance Sheet</span>
        </button>
        <button
          onClick={() => setActiveTab('trialBalance')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'trialBalance'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Trial Balance</span>
        </button>
        <button
          onClick={() => setActiveTab('cashFlow')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'cashFlow'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Landmark className="w-4 h-4" />
          <span>Cash Flow</span>
        </button>
        <button
          onClick={() => setActiveTab('vouchers')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'vouchers'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Double-Entry Vouchers ({genericVouchers.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('ims')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'ims'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-emerald-400" />
          <span>GST IMS Inbox ({imsInboxItems.length})</span>
          {imsStats.pendingCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping ml-1" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('costCentres')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'costCentres'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Cost Centres ({costCentres.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('budgets')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'budgets'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Budgets &amp; Variance</span>
        </button>
        <button
          onClick={() => setActiveTab('ratios')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'ratios'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Financial Ratios</span>
        </button>
        <button
          onClick={() => setActiveTab('dayBook')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'dayBook'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Day Book ({dayBookEntries.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('exceptions')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'exceptions'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <AlertOctagon className="w-4 h-4" />
          <span>Exception Reports</span>
          {exceptionReports?.summary?.totalAlerts > 0 && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping ml-1" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('gstr1')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'gstr1'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <FileText className="w-4 h-4 text-emerald-400" />
          <span>GSTR-1 Outward Return</span>
        </button>
        <button
          onClick={() => setActiveTab('gstr3b')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'gstr3b'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-indigo-400" />
          <span>GSTR-3B Monthly Return &amp; Offset</span>
        </button>
        <button
          onClick={() => setActiveTab('outstanding')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all relative ${
            activeTab === 'outstanding'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Client Outstanding Statements</span>
          {accountsAlerts.activeAlertsCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping absolute top-2 right-2" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('ledger')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'ledger'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>General Ledger & Journal</span>
        </button>
        <button
          onClick={() => setActiveTab('manage')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'manage'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Manage Entries (Add & Delete)</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            activeTab === 'manage' ? 'bg-white/25 text-white' : 'bg-blue-100 text-blue-800'
          }`}>
            {allEntriesList.length}
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: PROFIT & LOSS STATEMENT (P&L)                                     */}
      {/* ========================================================================= */}
      {activeTab === 'pnl' && (
        <div className="space-y-6">
          {pnl && pnl.grossSales === 0 && pnl.cogs === 0 && pnl.opex === 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-blue-900 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-100 rounded-xl text-blue-700">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-blue-950">Clean Slate Books (All Values Currently ₹0.00)</h4>
                  <p className="text-[11px] text-blue-800 mt-0.5">
                    Profit & Loss is initialized to zero. Add your first sales revenue, material purchase, or operating expense to begin financial reporting.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEntryForm(prev => ({ ...prev, entryType: 'REVENUE', category: 'Sales & Services' }));
                    setShowAddEntryModal(true);
                  }}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-all whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Revenue</span>
                </button>
                <button
                  onClick={() => {
                    setEntryForm(prev => ({ ...prev, entryType: 'OPEX', category: 'General & Admin' }));
                    setShowAddEntryModal(true);
                  }}
                  className="px-3.5 py-2 bg-white hover:bg-blue-50 text-blue-700 border border-blue-300 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-all whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Expense</span>
                </button>
              </div>
            </div>
          )}
          {/* Key Executive KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Net Sales Revenue</span>
              <div className="text-2xl font-black text-gray-900 mt-1">
                ₹{pnl ? pnl.netSalesRevenue.toLocaleString() : '0'}
              </div>
              <div className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5" /> Gross: ₹{pnl ? pnl.grossSales.toLocaleString() : '0'}
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Cost of Goods Sold (COGS)</span>
              <div className="text-2xl font-black text-red-600 mt-1">
                ₹{pnl ? pnl.cogs.toLocaleString() : '0'}
              </div>
              <div className="text-xs text-gray-500 font-medium mt-1">
                Direct Materials + Inward Freight
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Gross Profit</span>
              <div className="text-2xl font-black text-blue-700 mt-1">
                ₹{pnl ? pnl.grossProfit.toLocaleString() : '0'}
              </div>
              <div className="text-xs text-blue-600 font-semibold mt-1">
                Gross Margin: {pnl ? pnl.grossMarginPercent : 0}%
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Net Profit After Tax</span>
              <div className={`text-2xl font-black mt-1 ${pnl && pnl.netProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                ₹{pnl ? pnl.netProfit.toLocaleString() : '0'}
              </div>
              <div className="text-xs text-emerald-600 font-semibold mt-1">
                Net Margin: {pnl ? pnl.netMarginPercent : 0}%
              </div>
            </div>
          </div>

          {/* Formatted Audit-Ready P&L Table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            {/* Interactive Options Toolbar */}
            <div className="p-5 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/80">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-gray-900">Profit & Loss Statement (Income Statement)</h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full border border-blue-200">
                    GAAP / Ind-AS
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Reporting Period: <strong className="text-gray-700">{periodFilter}</strong> • Method: <strong className="text-gray-700">{accountingBasis === 'accrual' ? 'Accrual Basis' : 'Cash Basis'}</strong> • Currency: INR (₹)
                </p>
              </div>

              {/* Options & Export Controls */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Period Option */}
                <select
                  value={periodFilter}
                  onChange={(e) => setPeriodFilter(e.target.value as any)}
                  className="px-2.5 py-1.5 bg-white border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  title="Select Financial Reporting Period"
                >
                  <option value="FY 2026-27">FY 2026-27 (Current FY)</option>
                  <option value="Q2 FY 2026-27">Q2 (Jul - Sep 2026)</option>
                  <option value="September 2026">September 2026 (Month)</option>
                  <option value="YTD Cumulative">YTD Cumulative</option>
                </select>

                {/* Accounting Basis Option */}
                <button
                  type="button"
                  onClick={() => setAccountingBasis(accountingBasis === 'accrual' ? 'cash' : 'accrual')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    accountingBasis === 'accrual'
                      ? 'bg-blue-50 border-blue-300 text-blue-800'
                      : 'bg-amber-50 border-amber-300 text-amber-800'
                  }`}
                  title="Toggle between Accrual (Ind-AS) and Cash Basis"
                >
                  Basis: {accountingBasis === 'accrual' ? 'Accrual' : 'Cash'}
                </button>

                {/* Ind-AS Schedule III Codes Toggle */}
                <button
                  type="button"
                  onClick={() => setShowAccountCodes(!showAccountCodes)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    showAccountCodes
                      ? 'bg-indigo-600 text-white border-indigo-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                  title="Show or hide Schedule III statutory disclosure codes"
                >
                  {showAccountCodes ? '✓ Codes Active' : 'Show Ind-AS Codes'}
                </button>

                {/* Export CSV Option */}
                <button
                  type="button"
                  onClick={exportPnLCSV}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                  title="Download complete P&L statement as CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>

                {/* Print Option */}
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                  title="Print P&L Statement"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Print</span>
                </button>
              </div>
            </div>

            <div className="divide-y divide-gray-100 text-sm">
              {/* REVENUE SECTION */}
              <div className="p-4 bg-slate-50/70 font-bold text-slate-800 flex justify-between items-center text-xs tracking-wider uppercase">
                <span>1. Revenue from Operations</span>
                <span>Amount (INR ₹)</span>
              </div>
              <div className="px-6 py-3 flex justify-between items-center text-gray-700 hover:bg-gray-50/60">
                <span className="pl-4 flex items-center">
                  {showAccountCodes && <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-mono mr-2 border border-slate-200">[REV-01]</span>}
                  Gross Sales & Invoiced Services
                </span>
                <span className="font-semibold">₹{pnl?.grossSales.toLocaleString()}</span>
              </div>
              <div className="px-6 py-3 flex justify-between items-center text-gray-700 hover:bg-gray-50/60">
                <span className="pl-4 text-red-600 flex items-center">
                  {showAccountCodes && <span className="px-1.5 py-0.5 bg-red-50 text-red-700 rounded text-[10px] font-mono mr-2 border border-red-200">[REV-02]</span>}
                  Less: Trade Discounts & Rebates
                </span>
                <span className="font-semibold text-red-600">(₹{pnl?.discounts.toLocaleString()})</span>
              </div>
              <div className="px-6 py-3.5 flex justify-between items-center font-bold text-slate-900 bg-blue-50/30">
                <span className="flex items-center">
                  {showAccountCodes && <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded text-[10px] font-mono mr-2 border border-blue-200">[REV-NET]</span>}
                  Net Sales Revenue (A)
                </span>
                <span className="text-blue-900 font-black">₹{pnl?.netSalesRevenue.toLocaleString()}</span>
              </div>

              {/* COGS SECTION */}
              <div className="p-4 bg-slate-50/70 font-bold text-slate-800 flex justify-between items-center text-xs tracking-wider uppercase">
                <span>2. Cost of Goods Sold (COGS)</span>
                <span>Amount (INR ₹)</span>
              </div>
              <div className="px-6 py-3 flex justify-between items-center text-gray-700 hover:bg-gray-50/60">
                <span className="pl-4 flex items-center">
                  {showAccountCodes && <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-mono mr-2 border border-slate-200">[COGS-01]</span>}
                  Direct Raw Material & Hardware Purchases
                </span>
                <span className="font-semibold">₹{pnl?.directMaterials.toLocaleString()}</span>
              </div>
              <div className="px-6 py-3 flex justify-between items-center text-gray-700 hover:bg-gray-50/60">
                <span className="pl-4 flex items-center">
                  {showAccountCodes && <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-mono mr-2 border border-slate-200">[COGS-02]</span>}
                  Inward Freight & Logistics
                </span>
                <span className="font-semibold">₹{pnl?.inwardFreight.toLocaleString()}</span>
              </div>
              <div className="px-6 py-3.5 flex justify-between items-center font-bold text-slate-900 bg-red-50/30">
                <span className="flex items-center">
                  {showAccountCodes && <span className="px-1.5 py-0.5 bg-red-100 text-red-800 rounded text-[10px] font-mono mr-2 border border-red-200">[COGS-TOT]</span>}
                  Total Cost of Goods Sold (B)
                </span>
                <span className="text-red-700 font-black">₹{pnl?.cogs.toLocaleString()}</span>
              </div>

              {/* GROSS PROFIT */}
              <div className="px-6 py-4 flex justify-between items-center font-black text-base bg-emerald-50 text-emerald-950 border-y border-emerald-200">
                <span className="flex items-center">
                  {showAccountCodes && <span className="px-1.5 py-0.5 bg-emerald-200 text-emerald-900 rounded text-[10px] font-mono mr-2 border border-emerald-300">[GP-TOT]</span>}
                  GROSS PROFIT (C = A - B)
                </span>
                <span>₹{pnl?.grossProfit.toLocaleString()} ({pnl?.grossMarginPercent}%)</span>
              </div>

              {/* OPERATING EXPENSES */}
              <div className="p-4 bg-slate-50/70 font-bold text-slate-800 flex justify-between items-center text-xs tracking-wider uppercase">
                <span>3. Operating Expenses (OPEX)</span>
                <span>Amount (INR ₹)</span>
              </div>
              <div className="px-6 py-3 flex justify-between items-center text-gray-700 hover:bg-gray-50/60">
                <span className="pl-4 flex items-center">
                  {showAccountCodes && <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-mono mr-2 border border-slate-200">[OPEX-01]</span>}
                  Employee Salaries & Payroll Disbursement
                </span>
                <span className="font-semibold">₹{pnl?.salaries.toLocaleString()}</span>
              </div>
              <div className="px-6 py-3 flex justify-between items-center text-gray-700 hover:bg-gray-50/60">
                <span className="pl-4 flex items-center">
                  {showAccountCodes && <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-mono mr-2 border border-slate-200">[OPEX-02]</span>}
                  General Administrative & Cloud Hosting Infrastructure
                </span>
                <span className="font-semibold">₹{pnl?.generalExpenses.toLocaleString()}</span>
              </div>
              <div className="px-6 py-3.5 flex justify-between items-center font-bold text-slate-900 bg-gray-50">
                <span className="flex items-center">
                  {showAccountCodes && <span className="px-1.5 py-0.5 bg-slate-200 text-slate-800 rounded text-[10px] font-mono mr-2">[OPEX-TOT]</span>}
                  Total Operating Expenses (D)
                </span>
                <span className="text-red-700 font-bold">₹{pnl?.opex.toLocaleString()}</span>
              </div>

              {/* EBITDA */}
              <div className="px-6 py-3.5 flex justify-between items-center font-bold text-slate-900 bg-blue-50/40">
                <span className="flex items-center">
                  {showAccountCodes && <span className="px-1.5 py-0.5 bg-blue-200 text-blue-900 rounded text-[10px] font-mono mr-2">[EBITDA]</span>}
                  OPERATING INCOME (EBITDA) (E = C - D)
                </span>
                <span className="text-blue-900 font-black">₹{pnl?.ebitda.toLocaleString()}</span>
              </div>

              {/* TAXES */}
              <div className="p-4 bg-slate-50/70 font-bold text-slate-800 flex justify-between items-center text-xs tracking-wider uppercase">
                <span>4. Taxes & Statutory Dues</span>
                <span>Amount (INR ₹)</span>
              </div>
              <div className="px-6 py-3 flex justify-between items-center text-gray-700 hover:bg-gray-50/60">
                <span className="pl-4 flex items-center">
                  {showAccountCodes && <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-mono mr-2 border border-slate-200">[TAX-01]</span>}
                  Provision for Corporate Income Tax (~22%)
                </span>
                <span className="font-semibold">₹{pnl?.taxes.toLocaleString()}</span>
              </div>
              <div className="px-6 py-3 flex justify-between items-center text-gray-700 hover:bg-gray-50/60">
                <span className="pl-4 flex items-center">
                  {showAccountCodes && <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-mono mr-2 border border-slate-200">[TAX-02]</span>}
                  Net Output GST Payable (Output GST - ITC Input)
                </span>
                <span className="font-semibold">₹{pnl?.netGstLiability.toLocaleString()}</span>
              </div>

              {/* NET PROFIT */}
              <div className="px-6 py-5 flex justify-between items-center font-black text-lg bg-emerald-100/70 text-emerald-950 border-t-2 border-emerald-500">
                <span>NET PROFIT AFTER TAX (NPAT)</span>
                <span className="text-2xl text-emerald-900 font-black">
                  ₹{pnl?.netProfit.toLocaleString()} ({pnl?.netMarginPercent}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: BALANCE SHEET                                                     */}
      {/* ========================================================================= */}
      {activeTab === 'balanceSheet' && (
        <div className="space-y-6">
          {balanceSheet && balanceSheet.totalAssets === 0 && balanceSheet.totalLiabilities === 0 && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-indigo-900 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-100 rounded-xl text-indigo-700">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-indigo-950">Zero-Balance Position (Clean Slate ₹0.00)</h4>
                  <p className="text-[11px] text-indigo-800 mt-0.5">
                    Assets, liabilities, and shareholder equity are initialized to zero. Record bank capital, equipment acquisitions, or supplier purchases to balance the sheet.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEntryForm(prev => ({ ...prev, entryType: 'BANK_CAPITAL', category: 'Share Capital' }));
                    setShowAddEntryModal(true);
                  }}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-all whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Bank Capital</span>
                </button>
                <button
                  onClick={() => {
                    setEntryForm(prev => ({ ...prev, entryType: 'FIXED_ASSET', category: 'Computer & IT Hardware' }));
                    setShowAddEntryModal(true);
                  }}
                  className="px-3.5 py-2 bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-300 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-all whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Fixed Asset</span>
                </button>
              </div>
            </div>
          )}
          {/* Balance Verification Ribbon */}
          <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-emerald-900">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold text-sm">Audited Books in Balance:</span>
                <span className="text-xs text-emerald-800 ml-2">
                  Total Assets (₹{balanceSheet?.totalAssets.toLocaleString()}) = Total Liabilities & Equity (₹{balanceSheet?.totalLiabilitiesAndEquity.toLocaleString()})
                </span>
              </div>
            </div>
            <span className="text-xs font-bold uppercase tracking-wider bg-emerald-200 text-emerald-900 px-2.5 py-1 rounded-full self-start md:self-auto">
              Balanced Ind-AS Schedule III
            </span>
          </div>

          {/* Interactive Balance Sheet Options Toolbar */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Balance Sheet Audit & Statement Options</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Statutory Framework: <strong className="text-gray-700">Schedule III Companies Act 2013</strong> • Currency: INR (₹)
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* As Of Date Option */}
              <select
                value={asOfDateFilter}
                onChange={(e) => setAsOfDateFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                title="Select Balance Sheet As-Of Reporting Date"
              >
                <option value="30 Sep 2026 (Current Quarter)">As of 30 Sep 2026 (Current Q2)</option>
                <option value="30 Jun 2026 (Q1 Ended)">As of 30 Jun 2026 (Q1 Ended)</option>
                <option value="31 Mar 2026 (Opening Balances)">As of 31 Mar 2026 (FY Opening)</option>
              </select>

              {/* Codes Toggle */}
              <button
                type="button"
                onClick={() => setShowAccountCodes(!showAccountCodes)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  showAccountCodes
                    ? 'bg-indigo-600 text-white border-indigo-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
                title="Show or hide Ind-AS Account Codes"
              >
                {showAccountCodes ? '✓ Ind-AS Codes Active' : 'Show Account Codes'}
              </button>

              {/* Export Balance Sheet CSV */}
              <button
                type="button"
                onClick={exportBalanceSheetCSV}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                title="Export classified Balance Sheet as CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>

              {/* Print Statement */}
              <button
                type="button"
                onClick={() => window.print()}
                className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                title="Print Balance Sheet"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Print</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ASSETS COLUMN */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
              <div className="p-4 bg-slate-800 text-white font-bold flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-blue-400" /> ASSETS
                </span>
                <span className="text-xs text-blue-300 font-mono">INR (₹)</span>
              </div>

              <div className="divide-y divide-gray-100 text-sm">
                {/* Current Assets */}
                <div className="p-3 bg-gray-50 font-bold text-xs text-gray-700 uppercase tracking-wider">
                  I. Current Assets
                </div>
                <div className="px-5 py-3 flex justify-between items-center text-gray-700">
                  <span className="flex items-center">
                    {showAccountCodes && <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-mono mr-2 border border-blue-200">[AST-CA-01]</span>}
                    Cash & Bank Balances (HDFC Operating)
                  </span>
                  <span className="font-semibold">₹{balanceSheet?.currentAssets.cashAndBank.toLocaleString()}</span>
                </div>
                <div className="px-5 py-3 flex justify-between items-center text-gray-700">
                  <span className="flex items-center">
                    {showAccountCodes && <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-mono mr-2 border border-blue-200">[AST-CA-02]</span>}
                    Accounts Receivable (Trade Debtors)
                  </span>
                  <span className="font-semibold text-blue-700">₹{balanceSheet?.currentAssets.accountsReceivable.toLocaleString()}</span>
                </div>
                <div className="px-5 py-3 flex justify-between items-center text-gray-700">
                  <span className="flex items-center">
                    {showAccountCodes && <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-mono mr-2 border border-blue-200">[AST-CA-03]</span>}
                    Inventories & Finished Goods
                  </span>
                  <span className="font-semibold">₹{balanceSheet?.currentAssets.inventoryValuation.toLocaleString()}</span>
                </div>
                <div className="px-5 py-3 flex justify-between items-center text-gray-700">
                  <span className="flex items-center">
                    {showAccountCodes && <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-mono mr-2 border border-blue-200">[AST-CA-04]</span>}
                    Input Tax Credit (GST ITC Pool)
                  </span>
                  <span className="font-semibold">₹{balanceSheet?.currentAssets.inputTaxCreditITC.toLocaleString()}</span>
                </div>
                <div className="px-5 py-3 flex justify-between items-center bg-gray-50/80 font-bold text-gray-900">
                  <span className="flex items-center">
                    {showAccountCodes && <span className="px-1.5 py-0.5 bg-blue-200 text-blue-900 rounded text-[10px] font-mono mr-2">[AST-CA-TOT]</span>}
                    Total Current Assets
                  </span>
                  <span className="text-blue-900">₹{balanceSheet?.currentAssets.totalCurrentAssets.toLocaleString()}</span>
                </div>

                {/* Non-Current / Fixed Assets */}
                <div className="p-3 bg-gray-50 font-bold text-xs text-gray-700 uppercase tracking-wider">
                  II. Non-Current / Fixed Assets
                </div>
                <div className="px-5 py-3 flex justify-between items-center text-gray-700">
                  <span className="flex items-center">
                    {showAccountCodes && <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-mono mr-2 border border-blue-200">[AST-NCA-01]</span>}
                    Property, Plant & Cloud Server Hardware
                  </span>
                  <span className="font-semibold">₹{balanceSheet?.fixedAssets.propertyAndEquipment.toLocaleString()}</span>
                </div>
                <div className="px-5 py-3 flex justify-between items-center bg-gray-50/80 font-bold text-gray-900">
                  <span className="flex items-center">
                    {showAccountCodes && <span className="px-1.5 py-0.5 bg-blue-200 text-blue-900 rounded text-[10px] font-mono mr-2">[AST-NCA-TOT]</span>}
                    Total Fixed Assets
                  </span>
                  <span className="text-blue-900">₹{balanceSheet?.fixedAssets.totalFixedAssets.toLocaleString()}</span>
                </div>

                {/* TOTAL ASSETS */}
                <div className="px-5 py-4 flex justify-between items-center font-black text-base bg-blue-50 text-blue-950 border-t-2 border-blue-600">
                  <span className="flex items-center">
                    {showAccountCodes && <span className="px-1.5 py-0.5 bg-blue-600 text-white rounded text-[10px] font-mono mr-2">[AST-TOT]</span>}
                    TOTAL ASSETS
                  </span>
                  <span className="text-xl font-black text-blue-900">₹{balanceSheet?.totalAssets.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* LIABILITIES & EQUITY COLUMN */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
              <div className="p-4 bg-slate-800 text-white font-bold flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-emerald-400" /> LIABILITIES & EQUITY
                </span>
                <span className="text-xs text-emerald-300 font-mono">INR (₹)</span>
              </div>

              <div className="divide-y divide-gray-100 text-sm">
                {/* Current Liabilities */}
                <div className="p-3 bg-gray-50 font-bold text-xs text-gray-700 uppercase tracking-wider">
                  I. Current Liabilities
                </div>
                <div className="px-5 py-3 flex justify-between items-center text-gray-700">
                  <span className="flex items-center">
                    {showAccountCodes && <span className="px-1.5 py-0.5 bg-rose-50 text-rose-700 rounded text-[10px] font-mono mr-2 border border-rose-200">[LIA-CL-01]</span>}
                    Accounts Payable (Trade Creditors)
                  </span>
                  <span className="font-semibold text-rose-700">₹{balanceSheet?.currentLiabilities.accountsPayable.toLocaleString()}</span>
                </div>
                <div className="px-5 py-3 flex justify-between items-center text-gray-700">
                  <span className="flex items-center">
                    {showAccountCodes && <span className="px-1.5 py-0.5 bg-rose-50 text-rose-700 rounded text-[10px] font-mono mr-2 border border-rose-200">[LIA-CL-02]</span>}
                    Statutory GST Payable to Govt
                  </span>
                  <span className="font-semibold">₹{balanceSheet?.currentLiabilities.gstPayable.toLocaleString()}</span>
                </div>
                <div className="px-5 py-3 flex justify-between items-center text-gray-700">
                  <span className="flex items-center">
                    {showAccountCodes && <span className="px-1.5 py-0.5 bg-rose-50 text-rose-700 rounded text-[10px] font-mono mr-2 border border-rose-200">[LIA-CL-03]</span>}
                    TDS Withholding Payable
                  </span>
                  <span className="font-semibold">₹{balanceSheet?.currentLiabilities.tdsPayable.toLocaleString()}</span>
                </div>
                <div className="px-5 py-3 flex justify-between items-center bg-gray-50/80 font-bold text-gray-900">
                  <span className="flex items-center">
                    {showAccountCodes && <span className="px-1.5 py-0.5 bg-rose-200 text-rose-900 rounded text-[10px] font-mono mr-2">[LIA-CL-TOT]</span>}
                    Total Current Liabilities
                  </span>
                  <span className="text-rose-900">₹{balanceSheet?.currentLiabilities.totalCurrentLiabilities.toLocaleString()}</span>
                </div>

                {/* Shareholder Equity */}
                <div className="p-3 bg-gray-50 font-bold text-xs text-gray-700 uppercase tracking-wider">
                  II. Shareholder's Equity & Reserves
                </div>
                <div className="px-5 py-3 flex justify-between items-center text-gray-700">
                  <span className="flex items-center">
                    {showAccountCodes && <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-800 rounded text-[10px] font-mono mr-2 border border-emerald-200">[EQ-01]</span>}
                    Paid-Up Share Capital & Retained Earnings
                  </span>
                  <span className="font-semibold">₹{balanceSheet?.equity.shareCapitalAndRetainedEarnings.toLocaleString()}</span>
                </div>
                <div className="px-5 py-3 flex justify-between items-center bg-gray-50/80 font-bold text-gray-900">
                  <span className="flex items-center">
                    {showAccountCodes && <span className="px-1.5 py-0.5 bg-emerald-200 text-emerald-950 rounded text-[10px] font-mono mr-2">[EQ-TOT]</span>}
                    Total Shareholder Equity
                  </span>
                  <span className="text-emerald-900">₹{balanceSheet?.equity.totalEquity.toLocaleString()}</span>
                </div>

                {/* TOTAL LIABILITIES & EQUITY */}
                <div className="px-5 py-4 flex justify-between items-center font-black text-base bg-emerald-50 text-emerald-950 border-t-2 border-emerald-600">
                  <span className="flex items-center">
                    {showAccountCodes && <span className="px-1.5 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-mono mr-2">[LIA-EQ-TOT]</span>}
                    TOTAL LIABILITIES & EQUITY
                  </span>
                  <span className="text-xl font-black text-emerald-900">₹{balanceSheet?.totalLiabilitiesAndEquity.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      
      
      {/* ========================================================================= */}
      {/* TAB: TRIAL BALANCE (DEBITS VS CREDITS)                                   */}
      {/* ========================================================================= */}
      {activeTab === 'trialBalance' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-black uppercase rounded-full">
                  General Ledger Audit
                </span>
                <span className="text-xs font-semibold text-gray-500">As of: {trialBalanceData?.asOfDate || new Date().toISOString().split('T')[0]}</span>
              </div>
              <h3 className="text-xl font-black text-gray-900 mt-1">Classified Trial Balance</h3>
              <p className="text-xs text-gray-500">Summary of all debit and credit ledger balances verified against double-entry accounting rules.</p>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {trialBalanceData?.isBalanced ? 'Balanced & Reconciled' : 'Discrepancy Detected'}
              </span>
            </div>
          </div>

          {/* Trial Balance Table */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-black uppercase text-gray-500 tracking-wider">
                    <th className="py-3 px-4">Account Code</th>
                    <th className="py-3 px-4">Ledger Particulars</th>
                    <th className="py-3 px-4">Account Group</th>
                    <th className="py-3 px-4 text-right">Debit Balance (₹)</th>
                    <th className="py-3 px-4 text-right">Credit Balance (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {(trialBalanceData?.rows || []).map((row: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-gray-500">{row.code}</td>
                      <td className="py-3 px-4 font-bold text-gray-900">{row.ledgerName}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-semibold">
                          {row.group}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-blue-700">
                        {row.debit > 0 ? `₹${row.debit.toLocaleString()}` : '-'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                        {row.credit > 0 ? `₹${row.credit.toLocaleString()}` : '-'}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-900 text-white font-black text-xs">
                    <td colSpan={3} className="py-4 px-4 text-right uppercase tracking-wider text-slate-300">
                      TOTAL TRIAL BALANCE
                    </td>
                    <td className="py-4 px-4 text-right font-mono text-sm text-blue-300">
                      ₹{(trialBalanceData?.totalDebit || 0).toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-right font-mono text-sm text-emerald-300">
                      ₹{(trialBalanceData?.totalCredit || 0).toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: CASH FLOW STATEMENT                                                 */}
      {/* ========================================================================= */}
      {activeTab === 'cashFlow' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
            <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-800 text-[10px] font-black uppercase rounded-full">
              Ind-AS 7 Cash Flow
            </span>
            <h3 className="text-xl font-black text-gray-900 mt-1">Cash Flow Statement</h3>
            <p className="text-xs text-gray-500">Period: {cashFlowData?.period || 'FY 2026-2027'} • Breakdown across Operating, Investing, and Financing activities.</p>
          </div>

          {/* 4 Cash KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Opening Cash Balance</span>
              <p className="text-2xl font-black text-gray-900 mt-1">
                ₹{(cashFlowData?.openingCashBalance || 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Operating Cash Flow</span>
              <p className="text-2xl font-black text-emerald-600 mt-1">
                ₹{(cashFlowData?.operatingActivities?.netCashFromOperations || 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Net Change in Cash</span>
              <p className="text-2xl font-black text-blue-600 mt-1">
                ₹{(cashFlowData?.netChangeInCash || 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">Closing Cash &amp; Bank</span>
              <p className="text-2xl font-black text-indigo-700 mt-1">
                ₹{(cashFlowData?.closingCashBalance || 0).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Structured Cash Flow Table */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-black uppercase text-gray-500">
                  <th className="py-3 px-4">Cash Flow Classification &amp; Line Items</th>
                  <th className="py-3 px-4 text-right">Amount (INR ₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {/* 1. Operating */}
                <tr className="bg-blue-50/40 font-bold text-blue-900">
                  <td className="py-3 px-4">1. CASH FLOWS FROM OPERATING ACTIVITIES</td>
                  <td className="py-3 px-4 text-right font-mono"></td>
                </tr>
                <tr>
                  <td className="py-2.5 px-6 text-gray-700">Cash receipts from customers and debtors</td>
                  <td className="py-2.5 px-4 text-right font-mono text-emerald-700 font-bold">
                    +₹{(cashFlowData?.operatingActivities?.cashFromCustomers || 0).toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-6 text-gray-700">Cash paid to suppliers and vendors for direct materials</td>
                  <td className="py-2.5 px-4 text-right font-mono text-rose-600 font-semibold">
                    ₹{(cashFlowData?.operatingActivities?.cashPaidToSuppliers || 0).toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-6 text-gray-700">Cash paid for salaries, hosting and operating overheads</td>
                  <td className="py-2.5 px-4 text-right font-mono text-rose-600 font-semibold">
                    ₹{(cashFlowData?.operatingActivities?.cashPaidForExpenses || 0).toLocaleString()}
                  </td>
                </tr>
                <tr className="bg-gray-50 font-bold">
                  <td className="py-2.5 px-4 text-gray-900">Net Cash Generated from Operating Activities (A)</td>
                  <td className="py-2.5 px-4 text-right font-mono text-emerald-700 font-black">
                    ₹{(cashFlowData?.operatingActivities?.netCashFromOperations || 0).toLocaleString()}
                  </td>
                </tr>

                {/* 2. Investing */}
                <tr className="bg-purple-50/40 font-bold text-purple-900">
                  <td className="py-3 px-4">2. CASH FLOWS FROM INVESTING ACTIVITIES</td>
                  <td className="py-3 px-4 text-right font-mono"></td>
                </tr>
                <tr>
                  <td className="py-2.5 px-6 text-gray-700">Purchase of server infrastructure &amp; physical hardware assets</td>
                  <td className="py-2.5 px-4 text-right font-mono text-rose-600 font-semibold">
                    ₹{(cashFlowData?.investingActivities?.hardwareAndAssetPurchases || 0).toLocaleString()}
                  </td>
                </tr>
                <tr className="bg-gray-50 font-bold">
                  <td className="py-2.5 px-4 text-gray-900">Net Cash Used in Investing Activities (B)</td>
                  <td className="py-2.5 px-4 text-right font-mono text-rose-600 font-black">
                    ₹{(cashFlowData?.investingActivities?.netCashFromInvesting || 0).toLocaleString()}
                  </td>
                </tr>

                {/* 3. Financing */}
                <tr className="bg-emerald-50/40 font-bold text-emerald-900">
                  <td className="py-3 px-4">3. CASH FLOWS FROM FINANCING ACTIVITIES</td>
                  <td className="py-3 px-4 text-right font-mono"></td>
                </tr>
                <tr>
                  <td className="py-2.5 px-6 text-gray-700">Proceeds from issuance of share capital / owner equity</td>
                  <td className="py-2.5 px-4 text-right font-mono text-emerald-700 font-bold">
                    +₹{(cashFlowData?.financingActivities?.shareCapitalReceived || 0).toLocaleString()}
                  </td>
                </tr>
                <tr className="bg-gray-50 font-bold">
                  <td className="py-2.5 px-4 text-gray-900">Net Cash Generated from Financing Activities (C)</td>
                  <td className="py-2.5 px-4 text-right font-mono text-emerald-700 font-black">
                    ₹{(cashFlowData?.financingActivities?.netCashFromFinancing || 0).toLocaleString()}
                  </td>
                </tr>

                {/* Net change */}
                <tr className="bg-blue-600 text-white font-black text-xs">
                  <td className="py-3.5 px-4">NET INCREASE IN CASH &amp; CASH EQUIVALENTS (A + B + C)</td>
                  <td className="py-3.5 px-4 text-right font-mono text-sm">
                    ₹{(cashFlowData?.netChangeInCash || 0).toLocaleString()}
                  </td>
                </tr>
                <tr className="bg-slate-900 text-white font-bold text-xs">
                  <td className="py-3.5 px-4">CASH &amp; CASH EQUIVALENTS AT END OF PERIOD</td>
                  <td className="py-3.5 px-4 text-right font-mono text-sm text-emerald-300">
                    ₹{(cashFlowData?.closingCashBalance || 0).toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: GSTR-1 OUTWARD SUPPLIES RETURN                                       */}
      {/* ========================================================================= */}
      {activeTab === 'gstr1' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase rounded-full">
                  Statutory Return
                </span>
                <span className="text-xs font-mono font-bold text-gray-500">GSTIN: {gstr1Data?.gstin || '29AAACT2727Q1ZB'}</span>
              </div>
              <h3 className="text-xl font-black text-gray-900 mt-1">Form GSTR-1: Outward Supplies of Goods &amp; Services</h3>
              <p className="text-xs text-gray-500">
                Tax Period: {gstr1Data?.returnPeriod || 'September 2026'} • Legal Name: {gstr1Data?.legalName || 'Antigravity Operations Global Private Limited'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleDownloadGstr1Json}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4" /> Download Official GSTN JSON
              </button>
            </div>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Total Invoices</span>
              <p className="text-2xl font-black text-gray-900 mt-1">{gstr1Data?.summary?.totalInvoices || 0}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">B2B: {gstr1Data?.summary?.b2bCount || 0} • B2C: {(gstr1Data?.summary?.b2cLargeCount || 0) + (gstr1Data?.summary?.b2cSmallCount || 0)}</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Total Taxable Value</span>
              <p className="text-2xl font-black text-gray-900 mt-1">₹{(gstr1Data?.summary?.totalTaxableValue || 0).toLocaleString()}</p>
              <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Auto-computed from verified sales</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Total GST Liability</span>
              <p className="text-2xl font-black text-emerald-600 mt-1">₹{(gstr1Data?.summary?.totalTax || 0).toLocaleString()}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">IGST + CGST + SGST</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Portal Validation</span>
              <div className="flex items-center gap-1.5 mt-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span className="text-sm font-bold text-emerald-700">Schema Ready</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-0.5">Compliant with GST Portal Offline Tool v3.1</p>
            </div>
          </div>

          {/* Section Navigation Tabs */}
          <div className="flex border-b border-gray-200 gap-2 overflow-x-auto pb-1">
            {[
              { id: '4A', label: `Table 4A: B2B Invoices (${gstr1Data?.table4_b2b?.length || 0})` },
              { id: '5A', label: `Table 5A: B2C Large (${gstr1Data?.table5_b2cLarge?.length || 0})` },
              { id: '7', label: `Table 7: B2C Small (${gstr1Data?.table7_b2cSmall?.length || 0})` },
              { id: '12', label: `Table 12: HSN Summary (${gstr1Data?.table12_hsnSummary?.length || 0})` },
              { id: '13', label: `Table 13: Documents Summary (${gstr1Data?.table13_docSummary?.length || 0})` }
            ].map(sec => (
              <button
                key={sec.id}
                onClick={() => setGstr1Section(sec.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  gstr1Section === sec.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {sec.label}
              </button>
            ))}
          </div>

          {/* Section 4A: B2B Invoices */}
          {gstr1Section === '4A' && (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider">
                  Table 4A - Taxable Outward Supplies to Registered Persons (B2B Regular)
                </h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-200 text-[11px] font-black uppercase text-gray-500">
                      <th className="py-3 px-4">Customer Name &amp; GSTIN</th>
                      <th className="py-3 px-4">Invoice No / Date</th>
                      <th className="py-3 px-4 text-right">Invoice Value</th>
                      <th className="py-3 px-4 text-right">Taxable Value</th>
                      <th className="py-3 px-4 text-center">Rate</th>
                      <th className="py-3 px-4 text-right">IGST</th>
                      <th className="py-3 px-4 text-right">CGST</th>
                      <th className="py-3 px-4 text-right">SGST</th>
                      <th className="py-3 px-4 text-center">POS / Reverse Chg</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs">
                    {(gstr1Data?.table4_b2b || []).map((b: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4">
                          <p className="font-bold text-gray-900">{b.customerName}</p>
                          <p className="text-[10px] font-mono text-gray-500">{b.gstin}</p>
                        </td>
                        <td className="py-3 px-4 font-mono">
                          <p className="font-bold text-gray-800">{b.invoiceNumber}</p>
                          <p className="text-[10px] text-gray-400 font-sans">{b.invoiceDate}</p>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-gray-900">
                          ₹{b.invoiceValue?.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-semibold text-gray-700">
                          ₹{b.taxableValue?.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-semibold">{b.rate}%</td>
                        <td className="py-3 px-4 text-right font-mono text-gray-700">₹{b.igst?.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right font-mono text-gray-700">₹{b.cgst?.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right font-mono text-gray-700">₹{b.sgst?.toLocaleString()}</td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-mono font-semibold">
                            {b.pos}
                          </span>
                          <span className="text-[10px] text-gray-400 ml-1">RC: {b.reverseCharge}</span>
                        </td>
                      </tr>
                    ))}
                    {(!gstr1Data?.table4_b2b || gstr1Data.table4_b2b.length === 0) && (
                      <tr>
                        <td colSpan={9} className="py-8 text-center text-gray-400 text-xs">
                          No B2B invoices recorded for this period.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section 5A: B2C Large */}
          {gstr1Section === '5A' && (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider">
                  Table 5A - B2C Large Invoices (Inter-State Outward Supplies &gt; ₹2.5 Lakhs)
                </h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-200 text-[11px] font-black uppercase text-gray-500">
                      <th className="py-3 px-4">Place of Supply (POS)</th>
                      <th className="py-3 px-4">Invoice No</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4 text-right">Invoice Value</th>
                      <th className="py-3 px-4 text-center">Rate</th>
                      <th className="py-3 px-4 text-right">Taxable Value</th>
                      <th className="py-3 px-4 text-right">Integrated Tax (IGST)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs">
                    {(gstr1Data?.table5_b2cLarge || []).map((c: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-bold text-gray-900">{c.pos}</td>
                        <td className="py-3 px-4 font-mono font-bold text-blue-600">{c.invoiceNumber}</td>
                        <td className="py-3 px-4 text-gray-600">{c.invoiceDate}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-gray-900">₹{c.invoiceValue?.toLocaleString()}</td>
                        <td className="py-3 px-4 text-center font-mono">{c.rate}%</td>
                        <td className="py-3 px-4 text-right font-mono font-semibold text-gray-700">₹{c.taxableValue?.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-indigo-700">₹{c.igst?.toLocaleString()}</td>
                      </tr>
                    ))}
                    {(!gstr1Data?.table5_b2cLarge || gstr1Data.table5_b2cLarge.length === 0) && (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-gray-400 text-xs">
                          No B2C Large invoices (&gt; ₹2.5 Lakhs interstate) for this tax period.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section 7: B2C Small */}
          {gstr1Section === '7' && (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider">
                  Table 7 - B2C Small Supplies (Net of Debit / Credit Notes)
                </h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-200 text-[11px] font-black uppercase text-gray-500">
                      <th className="py-3 px-4">Supply Type</th>
                      <th className="py-3 px-4">Place of Supply (POS)</th>
                      <th className="py-3 px-4 text-center">Rate</th>
                      <th className="py-3 px-4 text-right">Taxable Value</th>
                      <th className="py-3 px-4 text-right">IGST</th>
                      <th className="py-3 px-4 text-right">CGST</th>
                      <th className="py-3 px-4 text-right">SGST</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs">
                    {(gstr1Data?.table7_b2cSmall || []).map((s: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-bold text-gray-900">{s.supplyType}</td>
                        <td className="py-3 px-4 text-gray-700">{s.pos}</td>
                        <td className="py-3 px-4 text-center font-mono">{s.rate}%</td>
                        <td className="py-3 px-4 text-right font-mono font-semibold text-gray-800">₹{s.taxableValue?.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right font-mono text-gray-700">₹{s.igst?.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right font-mono text-gray-700">₹{s.cgst?.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right font-mono text-gray-700">₹{s.sgst?.toLocaleString()}</td>
                      </tr>
                    ))}
                    {(!gstr1Data?.table7_b2cSmall || gstr1Data.table7_b2cSmall.length === 0) && (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-gray-400 text-xs">
                          No B2C Small supplies for this tax period.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section 12: HSN Summary */}
          {gstr1Section === '12' && (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider">
                  Table 12 - HSN/SAC Summary of Outward Supplies
                </h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-200 text-[11px] font-black uppercase text-gray-500">
                      <th className="py-3 px-4">HSN / SAC Code</th>
                      <th className="py-3 px-4">Description</th>
                      <th className="py-3 px-4 text-center">UQC</th>
                      <th className="py-3 px-4 text-right">Total Qty</th>
                      <th className="py-3 px-4 text-right">Total Value</th>
                      <th className="py-3 px-4 text-right">Taxable Value</th>
                      <th className="py-3 px-4 text-right">IGST</th>
                      <th className="py-3 px-4 text-right">CGST</th>
                      <th className="py-3 px-4 text-right">SGST</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs">
                    {(gstr1Data?.table12_hsnSummary || []).map((h: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-blue-600">{h.hsnCode}</td>
                        <td className="py-3 px-4 font-medium text-gray-900">{h.description}</td>
                        <td className="py-3 px-4 text-center font-mono text-gray-500">{h.uqc}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold">{h.totalQuantity}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-gray-900">₹{h.totalValue?.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right font-mono font-semibold text-gray-700">₹{h.taxableValue?.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right font-mono text-gray-700">₹{h.integratedTax?.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right font-mono text-gray-700">₹{h.centralTax?.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right font-mono text-gray-700">₹{h.stateTax?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section 13: Documents Summary */}
          {gstr1Section === '13' && (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider">
                  Table 13 - Documents Issued during the Tax Period
                </h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-200 text-[11px] font-black uppercase text-gray-500">
                      <th className="py-3 px-4">Nature of Document</th>
                      <th className="py-3 px-4 font-mono">From Serial No</th>
                      <th className="py-3 px-4 font-mono">To Serial No</th>
                      <th className="py-3 px-4 text-right">Total Issued</th>
                      <th className="py-3 px-4 text-right">Cancelled</th>
                      <th className="py-3 px-4 text-right">Net Issued</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs">
                    {(gstr1Data?.table13_docSummary || []).map((d: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-bold text-gray-900">{d.docNature}</td>
                        <td className="py-3 px-4 font-mono text-gray-700">{d.fromSerial}</td>
                        <td className="py-3 px-4 font-mono text-gray-700">{d.toSerial}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-gray-900">{d.totalNumber}</td>
                        <td className="py-3 px-4 text-right font-mono text-red-600">{d.cancelled}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">{d.netIssued}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: GSTR-3B MONTHLY RETURN & OFFSET SIMULATOR                           */}
      {/* ========================================================================= */}
      {activeTab === 'gstr3b' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-800 text-[10px] font-black uppercase rounded-full">
                  Monthly Summary Return
                </span>
                <span className="text-xs font-mono font-bold text-gray-500">GSTIN: {gstr3bData?.gstin || '29AAACT2727Q1ZB'}</span>
              </div>
              <h3 className="text-xl font-black text-gray-900 mt-1">Form GSTR-3B: Monthly Tax Return &amp; ITC Offset</h3>
              <p className="text-xs text-gray-500">
                Period: {gstr3bData?.returnPeriod || 'September 2026'} • Rule 88A Tax Ledger Offset Simulation Engine
              </p>
            </div>

            <button
              onClick={handleSimulateChallan}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" /> Simulate PMT-06 GST Payment Challan
            </button>
          </div>

          {/* 4 Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Table 3.1 Output Tax</span>
              <p className="text-2xl font-black text-gray-900 mt-1">
                ₹{(gstr3bData?.table3_1?.totalTax || 0).toLocaleString()}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">IGST: ₹{(gstr3bData?.table3_1?.integratedTax || 0).toLocaleString()}</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Table 4 Eligible ITC</span>
              <p className="text-2xl font-black text-emerald-600 mt-1">
                ₹{(gstr3bData?.table4_itc?.netItcAvailable || 0).toLocaleString()}
              </p>
              <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Input Tax Credit from Purchases</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">Paid via ITC Ledger</span>
              <p className="text-2xl font-black text-indigo-600 mt-1">
                ₹{(gstr3bData?.table6_1_payment?.paidThroughItc || 0).toLocaleString()}
              </p>
              <p className="text-[10px] text-indigo-600 font-semibold mt-0.5">Credit ledger auto-offset</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">Net Cash Tax to Pay</span>
              <p className="text-2xl font-black text-rose-600 mt-1">
                ₹{(gstr3bData?.table6_1_payment?.paidInCash || 0).toLocaleString()}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">Electronic Cash Ledger Debit</p>
            </div>
          </div>

          {/* Table 3.1: Details of Outward Supplies */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider">
                3.1 Details of Outward Supplies and Inward Supplies Liable to Reverse Charge
              </h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-200 text-[11px] font-black uppercase text-gray-500">
                    <th className="py-3 px-4">Nature of Supplies</th>
                    <th className="py-3 px-4 text-right">Total Taxable Value</th>
                    <th className="py-3 px-4 text-right">Integrated Tax (IGST)</th>
                    <th className="py-3 px-4 text-right">Central Tax (CGST)</th>
                    <th className="py-3 px-4 text-right">State / UT Tax (SGST)</th>
                    <th className="py-3 px-4 text-right">Cess</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  <tr className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-bold text-gray-900">
                      (a) Outward taxable supplies (other than zero rated, nil rated and exempted)
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-gray-900">
                      ₹{(gstr3bData?.table3_1?.outwardTaxableSupplies || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-blue-700">
                      ₹{(gstr3bData?.table3_1?.integratedTax || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-purple-700">
                      ₹{(gstr3bData?.table3_1?.centralTax || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-purple-700">
                      ₹{(gstr3bData?.table3_1?.stateTax || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-gray-400">₹0</td>
                  </tr>
                  <tr className="text-gray-500">
                    <td className="py-2.5 px-4">(b) Outward taxable supplies (zero rated)</td>
                    <td className="py-2.5 px-4 text-right font-mono">₹0</td>
                    <td className="py-2.5 px-4 text-right font-mono">₹0</td>
                    <td className="py-2.5 px-4 text-right font-mono">₹0</td>
                    <td className="py-2.5 px-4 text-right font-mono">₹0</td>
                    <td className="py-2.5 px-4 text-right font-mono">₹0</td>
                  </tr>
                  <tr className="text-gray-500">
                    <td className="py-2.5 px-4">(c) Other outward supplies (Nil rated, exempted)</td>
                    <td className="py-2.5 px-4 text-right font-mono">₹0</td>
                    <td className="py-2.5 px-4 text-right font-mono">₹0</td>
                    <td className="py-2.5 px-4 text-right font-mono">₹0</td>
                    <td className="py-2.5 px-4 text-right font-mono">₹0</td>
                    <td className="py-2.5 px-4 text-right font-mono">₹0</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Table 4: Eligible Input Tax Credit (ITC) */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider">
                4. Eligible Input Tax Credit (ITC)
              </h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-200 text-[11px] font-black uppercase text-gray-500">
                    <th className="py-3 px-4">Details</th>
                    <th className="py-3 px-4 text-right">Integrated Tax (IGST)</th>
                    <th className="py-3 px-4 text-right">Central Tax (CGST)</th>
                    <th className="py-3 px-4 text-right">State / UT Tax (SGST)</th>
                    <th className="py-3 px-4 text-right">Cess</th>
                    <th className="py-3 px-4 text-right">Total ITC Available</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  <tr className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-bold text-gray-900">
                      (A) (5) All other ITC (Inward supplies from registered vendors)
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-700">
                      ₹{(gstr3bData?.table4_itc?.allOtherItc?.integratedTax || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-700">
                      ₹{(gstr3bData?.table4_itc?.allOtherItc?.centralTax || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-700">
                      ₹{(gstr3bData?.table4_itc?.allOtherItc?.stateTax || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-gray-400">₹0</td>
                    <td className="py-3.5 px-4 text-right font-mono font-black text-emerald-800 text-sm">
                      ₹{(gstr3bData?.table4_itc?.netItcAvailable || 0).toLocaleString()}
                    </td>
                  </tr>
                  <tr className="text-gray-500">
                    <td className="py-2.5 px-4">(B) ITC Reversed (Rule 42/43)</td>
                    <td className="py-2.5 px-4 text-right font-mono">₹0</td>
                    <td className="py-2.5 px-4 text-right font-mono">₹0</td>
                    <td className="py-2.5 px-4 text-right font-mono">₹0</td>
                    <td className="py-2.5 px-4 text-right font-mono">₹0</td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold">₹0</td>
                  </tr>
                  <tr className="bg-emerald-50/50 font-bold">
                    <td className="py-3 px-4 text-emerald-900">(C) Net ITC Available (A) - (B)</td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-800">
                      ₹{(gstr3bData?.table4_itc?.allOtherItc?.integratedTax || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-800">
                      ₹{(gstr3bData?.table4_itc?.allOtherItc?.centralTax || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-800">
                      ₹{(gstr3bData?.table4_itc?.allOtherItc?.stateTax || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-gray-400">₹0</td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-900 font-black">
                      ₹{(gstr3bData?.table4_itc?.netItcAvailable || 0).toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Table 6.1: Payment of Tax & Offset Simulator */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider">
                  6.1 Payment of Tax (Rule 88A Electronic Credit &amp; Cash Ledger Utilization)
                </h4>
                <p className="text-[11px] text-gray-500">Order of utilization: IGST credit first against IGST, then CGST/SGST.</p>
              </div>
              <span className="px-2.5 py-1 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-lg uppercase">
                Auto-Offset Simulated
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-200 text-[11px] font-black uppercase text-gray-500">
                    <th className="py-3 px-4">Tax Head</th>
                    <th className="py-3 px-4 text-right">Tax Payable</th>
                    <th className="py-3 px-4 text-right">Paid via ITC (Credit Ledger)</th>
                    <th className="py-3 px-4 text-right">Tax Paid in Cash (Net Payable)</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-gray-900">Integrated Tax (IGST)</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-gray-800">
                      ₹{(gstr3bData?.table3_1?.integratedTax || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-emerald-700">
                      ₹{(gstr3bData?.table4_itc?.allOtherItc?.integratedTax || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-black text-rose-600">
                      ₹{(gstr3bData?.table6_1_payment?.breakdown?.igstCash || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-bold rounded text-[10px]">
                        Cash Offset Required
                      </span>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-gray-900">Central Tax (CGST)</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-gray-800">
                      ₹{(gstr3bData?.table3_1?.centralTax || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-emerald-700">
                      ₹{(gstr3bData?.table4_itc?.allOtherItc?.centralTax || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-black text-rose-600">
                      ₹{(gstr3bData?.table6_1_payment?.breakdown?.cgstCash || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-bold rounded text-[10px]">
                        Cash Offset Required
                      </span>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-gray-900">State / UT Tax (SGST)</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-gray-800">
                      ₹{(gstr3bData?.table3_1?.stateTax || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-emerald-700">
                      ₹{(gstr3bData?.table4_itc?.allOtherItc?.stateTax || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-black text-rose-600">
                      ₹{(gstr3bData?.table6_1_payment?.breakdown?.sgstCash || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-bold rounded text-[10px]">
                        Cash Offset Required
                      </span>
                    </td>
                  </tr>

                  <tr className="bg-slate-50 font-black text-xs border-t-2 border-slate-200">
                    <td className="py-3.5 px-4 text-gray-900">TOTAL STATUTORY TAX PAYMENT</td>
                    <td className="py-3.5 px-4 text-right font-mono text-gray-900 text-sm">
                      ₹{(gstr3bData?.table6_1_payment?.taxPayable || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-emerald-700 text-sm">
                      ₹{(gstr3bData?.table6_1_payment?.paidThroughItc || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-rose-600 text-sm">
                      ₹{(gstr3bData?.table6_1_payment?.paidInCash || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={handleSimulateChallan}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold shadow-xs"
                      >
                        Generate Challan
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: CLIENT OUTSTANDING STATEMENTS & 15-DAY OVERDUE ENGINE             */}
      {/* ========================================================================= */}
      {activeTab === 'outstanding' && (
        <div className="space-y-6">
          {/* Summary KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Total Invoiced (All Clients)</span>
              <div className="text-2xl font-black text-gray-900 mt-1">
                ₹{totalInvoicedAll.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500 mt-1">Cumulative B2B & Retail Billings</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Total Collections Received</span>
              <div className="text-2xl font-black text-emerald-600 mt-1">
                ₹{totalReceivedAll.toLocaleString()}
              </div>
              <div className="text-xs text-emerald-600 font-semibold mt-1">Realized into Bank Accounts</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Current Accounts Receivable</span>
              <div className="text-2xl font-black text-blue-700 mt-1">
                ₹{totalOutstandingAll.toLocaleString()}
              </div>
              <div className="text-xs text-blue-600 font-semibold mt-1">Active Balance Due</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border-2 border-rose-300 shadow-xs bg-rose-50/40">
              <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">15+ Days Overdue (Locked)</span>
              <div className="text-2xl font-black text-rose-700 mt-1">
                ₹{accountsAlerts.totalOverdue15Days.toLocaleString()}
              </div>
              <div className="text-xs text-rose-600 font-bold mt-1">
                {accountsAlerts.activeAlertsCount} Clients Requiring Followup
              </div>
            </div>
          </div>

          {/* Filtering and Search Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200">
            <div className="flex items-center gap-2 w-full sm:w-80 relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3" />
              <input
                type="text"
                placeholder="Search client name or GSTIN..."
                value={searchClient}
                onChange={(e) => setSearchClient(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setOutstandingFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  outstandingFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All Clients ({clientOutstanding.length})
              </button>
              <button
                onClick={() => setOutstandingFilter('overdue15')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  outstandingFilter === 'overdue15'
                    ? 'bg-rose-600 text-white'
                    : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>15+ Days Overdue ({accountsAlerts.activeAlertsCount})</span>
              </button>
            </div>
          </div>

          {/* Client Outstanding Detailed Cards */}
          <div className="space-y-4">
            {filteredClients.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 text-gray-500">
                <Receipt className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                <p className="font-bold text-gray-700">No client outstanding records matching filter</p>
                <p className="text-xs text-gray-400 mt-1">All client accounts are settled or within the 15-day grace period.</p>
              </div>
            ) : (
              filteredClients.map((client, idx) => (
                <div 
                  key={idx} 
                  className={`bg-white rounded-2xl border transition-all shadow-xs overflow-hidden ${
                    client.has15DayAlert ? 'border-rose-400/80 ring-1 ring-rose-300/40' : 'border-gray-200'
                  }`}
                >
                  {/* Client Summary Header */}
                  <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/70 border-b border-gray-200">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-gray-900">{client.clientName}</h3>
                        {client.has15DayAlert && (
                          <span className="px-2.5 py-0.5 bg-rose-600 text-white text-[10px] font-black rounded-full uppercase tracking-wider flex items-center gap-1 animate-pulse">
                            <AlertTriangle className="w-3 h-3" /> 15+ Days Overdue: Action Required
                          </span>
                        )}
                        <span className="text-xs text-gray-500 font-mono">GSTIN: {client.clientGstin}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Phone: {client.phone} • Email: {client.email}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-gray-500 uppercase">Invoiced</span>
                        <p className="text-xs font-bold text-gray-800">₹{client.totalInvoiced.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-emerald-600 uppercase">Received</span>
                        <p className="text-xs font-bold text-emerald-700">₹{client.totalReceived.toLocaleString()}</p>
                      </div>
                      <div className="text-right pl-3 border-l border-gray-300">
                        <span className="text-[10px] font-bold text-rose-700 uppercase">Outstanding Due</span>
                        <p className="text-base font-black text-rose-700">₹{client.currentOutstanding.toLocaleString()}</p>
                      </div>

                      {/* WhatsApp Reminder Dispatch */}
                      <button
                        onClick={() => openWhatsAppModal(client)}
                        className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-all"
                        title="Send Overdue Statement via WhatsApp"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>WhatsApp Notice</span>
                      </button>
                    </div>
                  </div>

                  {/* Itemized Invoices Table */}
                  <div className="p-4 overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="text-gray-500 border-b border-gray-100 uppercase tracking-wider font-semibold">
                          <th className="pb-2">Invoice #</th>
                          <th className="pb-2">Invoice Date</th>
                          <th className="pb-2">Due Date</th>
                          <th className="pb-2">Total Amount</th>
                          <th className="pb-2">Balance Due</th>
                          <th className="pb-2">Credit Age</th>
                          <th className="pb-2">15-Day Alert Status</th>
                          <th className="pb-2 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {client.invoices.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="py-3 text-center text-gray-400">
                              No pending invoices for this client.
                            </td>
                          </tr>
                        ) : (
                          client.invoices.map((inv) => (
                            <tr key={inv.id} className="hover:bg-gray-50/80 transition-colors">
                              <td className="py-2.5 font-bold text-blue-700">{inv.invoiceNumber}</td>
                              <td className="py-2.5 text-gray-600">{inv.invoiceDate}</td>
                              <td className="py-2.5 text-gray-600">{inv.dueDate}</td>
                              <td className="py-2.5 font-semibold text-gray-800">₹{inv.totalAmount.toLocaleString()}</td>
                              <td className="py-2.5 font-black text-rose-700">₹{inv.balanceDue.toLocaleString()}</td>
                              <td className="py-2.5">
                                <span className={`font-bold ${inv.ageInDays > 15 ? 'text-rose-700' : 'text-gray-600'}`}>
                                  {inv.ageInDays} Days Old
                                </span>
                              </td>
                              <td className="py-2.5">
                                {inv.isOverdue15Days ? (
                                  <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded-full font-bold text-[10px] border border-rose-300">
                                    🚨 Crosses 15 Days
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full font-medium text-[10px]">
                                    Within 15 Days Grace
                                  </span>
                                )}
                              </td>
                              <td className="py-2.5 text-right space-x-1.5">
                                <button
                                  onClick={() => openWhatsAppModal(client, inv)}
                                  className="px-2 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg font-bold text-[10px] inline-flex items-center gap-1"
                                  title="Send WhatsApp Reminder for this specific invoice"
                                >
                                  <MessageSquare className="w-3 h-3" />
                                  <span>WhatsApp</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setShowPaymentModal({
                                      invoiceId: inv.id,
                                      invoiceNumber: inv.invoiceNumber,
                                      clientName: client.clientName,
                                      balanceDue: inv.balanceDue
                                    });
                                    setPaymentAmount(inv.balanceDue);
                                    setPaymentRef(`NEFT-${Date.now().toString().slice(-6)}`);
                                  }}
                                  className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-[10px] inline-flex items-center gap-1 shadow-xs"
                                >
                                  <DollarSign className="w-3 h-3" />
                                  <span>Settle</span>
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: GENERAL LEDGER & TRANSACTIONS                                     */}
      {/* ========================================================================= */}
      {activeTab === 'ledger' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-xs border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/70">
              <h3 className="text-sm font-bold text-gray-800">Double-Entry Journal & Manual Transactions</h3>
              <button 
                onClick={() => setShowModal(true)} 
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-xl flex items-center font-bold text-xs shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4 mr-1" /> New Entry
              </button>
            </div>

            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <DollarSign className="w-8 h-8 text-gray-300 mb-2" />
                        <p className="font-semibold text-gray-600">No journal transactions recorded</p>
                        <p className="text-xs text-gray-400 mt-1">Click "New Entry" to add manual adjustments or capital contributions.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  transactions.map(t => (
                    <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(t.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-bold rounded-full ${
                          t.type === 'Income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {t.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{t.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        ₹{t.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate max-w-xs">{t.description}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: MANAGE ENTRIES (ADD & DELETE)                                      */}
      {/* ========================================================================= */}

      
      {/* ================= TAB: DOUBLE-ENTRY VOUCHER ENGINE ================= */}
      {activeTab === 'vouchers' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-gray-200">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-gray-900">Double-Entry Accounting Voucher Engine</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Total Debit = Total Credit (Strictly Balanced)
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">Every financial document decomposes into balanced journal lines. The journal is the financial truth.</p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={voucherFilterType}
                onChange={e => setVoucherFilterType(e.target.value)}
                className="text-xs border border-gray-300 rounded-xl p-2 bg-white font-semibold"
              >
                <option value="All">All Vouchers ({genericVouchers.length})</option>
                <option value="Sales">Sales</option>
                <option value="Purchase">Purchase</option>
                <option value="Receipt">Receipt</option>
                <option value="Payment">Payment</option>
                <option value="Contra">Contra</option>
                <option value="Journal">Journal</option>
                <option value="Depreciation">Depreciation</option>
              </select>
              <button
                onClick={() => setShowVoucherModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" /> + Post Double-Entry JV
              </button>
            </div>
          </div>

          {/* Vouchers Multi-Line Display */}
          <div className="space-y-4">
            {genericVouchers
              .filter(v => voucherFilterType === 'All' || v.voucherType === voucherFilterType)
              .map(v => (
                <div key={v.id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 border-b border-gray-100 gap-2">
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        v.voucherType === 'Sales' ? 'bg-emerald-100 text-emerald-800' :
                        v.voucherType === 'Purchase' ? 'bg-amber-100 text-amber-800' :
                        v.voucherType === 'Receipt' ? 'bg-blue-100 text-blue-800' :
                        v.voucherType === 'Payment' ? 'bg-rose-100 text-rose-800' :
                        v.voucherType === 'Depreciation' ? 'bg-indigo-100 text-indigo-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {v.voucherType}
                      </span>
                      <strong className="text-sm font-mono text-gray-900">{v.voucherNumber}</strong>
                      <span className="text-xs text-gray-400 font-mono">• Date: {v.voucherDate}</span>
                      {v.referenceNumber && (
                        <span className="text-xs text-gray-500 font-mono bg-slate-100 px-2 py-0.5 rounded">Ref: {v.referenceNumber}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-xs font-bold font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl">
                        Balanced: ₹{v.totalDebit?.toLocaleString()} Dr = ₹{v.totalCredit?.toLocaleString()} Cr
                      </div>
                      <button
                        onClick={() => handleOpenEditVoucher(v)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg"
                        title="Edit Voucher Details"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteVoucher(v.id, v.voucherNumber)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg"
                        title="Delete Voucher"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 italic mt-2.5 mb-3">{v.narration}</p>

                  <div className="overflow-x-auto bg-slate-50/70 rounded-xl p-2 border border-slate-100">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="text-[10px] uppercase font-bold text-gray-400 border-b border-gray-200/60 pb-1">
                          <th className="py-1 px-3">Ledger Particulars</th>
                          <th className="py-1 px-3">Cost Center / Ref</th>
                          <th className="py-1 px-3 text-right">Debit (Dr ₹)</th>
                          <th className="py-1 px-3 text-right">Credit (Cr ₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {v.lines?.map((line: any) => (
                          <tr key={line.id}>
                            <td className="py-1.5 px-3 font-semibold text-gray-900">{line.ledgerName}</td>
                            <td className="py-1.5 px-3 text-gray-500 font-mono text-[11px]">{line.costCenter || line.billReference || '-'}</td>
                            <td className="py-1.5 px-3 text-right font-mono font-bold text-gray-900">
                              {line.debit > 0 ? `₹${line.debit.toLocaleString()}` : '-'}
                            </td>
                            <td className="py-1.5 px-3 text-right font-mono font-bold text-gray-900">
                              {line.credit > 0 ? `₹${line.credit.toLocaleString()}` : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ================= TAB: GST IMS (INVOICE MANAGEMENT SYSTEM) INBOX ================= */}
      {activeTab === 'ims' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <h3 className="text-sm font-bold text-gray-900">GST Invoice Management System (IMS) Recipient Inbox</h3>
            <p className="text-xs text-gray-500">Take statutory recipient action (Accept, Reject, Pending) on supplier outward invoices to determine GSTR-2B ITC eligibility</p>
          </div>

          {/* IMS KPI Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Total Portal Invoices</span>
              <strong className="text-2xl font-black text-gray-900">{imsStats.totalCount} Documents</strong>
            </div>
            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
              <span className="text-[10px] uppercase font-bold text-emerald-700 block">Accepted &amp; ITC Eligible</span>
              <strong className="text-2xl font-black text-emerald-900">{imsStats.acceptedCount} Invoices</strong>
              <p className="text-[10px] text-emerald-700 mt-1 font-bold">ITC: ₹{imsStats.totalITCClaimable?.toLocaleString()}</p>
            </div>
            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200">
              <span className="text-[10px] uppercase font-bold text-amber-700 block">Pending Inspection</span>
              <strong className="text-2xl font-black text-amber-900">{imsStats.pendingCount} Invoices</strong>
            </div>
            <div className="bg-rose-50 p-4 rounded-2xl border border-rose-200">
              <span className="text-[10px] uppercase font-bold text-rose-700 block">Rejected / Disputed</span>
              <strong className="text-2xl font-black text-rose-900">{imsStats.rejectedCount} Invoices</strong>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-black uppercase text-gray-500 tracking-wider">
                    <th className="py-3 px-4">Supplier &amp; GSTIN</th>
                    <th className="py-3 px-4">Invoice No / Date</th>
                    <th className="py-3 px-4 text-right">Taxable Value</th>
                    <th className="py-3 px-4 text-right">Tax Amount</th>
                    <th className="py-3 px-4 text-right">Invoice Value</th>
                    <th className="py-3 px-4 text-center">Books Match Status</th>
                    <th className="py-3 px-4 text-center">Action in IMS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {imsInboxItems.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4">
                        <strong className="text-gray-900 block">{item.supplierName}</strong>
                        <span className="font-mono text-[10px] text-gray-400">{item.supplierGstin}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        <span className="font-bold text-blue-600 block">{item.invoiceNumber}</span>
                        <span className="text-gray-400 text-[10px]">{item.invoiceDate}</span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-gray-700">₹{item.taxableValue?.toLocaleString()}</td>
                      <td className="py-3.5 px-4 text-right font-mono text-gray-600">
                        ₹{(item.cgst + item.sgst + item.igst)?.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-black text-gray-900">₹{item.invoiceValue?.toLocaleString()}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          item.matchStatus.includes('Matched') ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {item.matchStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex justify-center gap-1.5">
                          <button
                            onClick={() => handleIMSAction(item.id, 'Accept')}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                              item.userAction === 'Accept' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                            }`}
                          >
                            ✓ Accept
                          </button>
                          <button
                            onClick={() => handleIMSAction(item.id, 'Pending')}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                              item.userAction === 'Pending' ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                            }`}
                          >
                            ⏳ Pending
                          </button>
                          <button
                            onClick={() => handleIMSAction(item.id, 'Reject')}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                              item.userAction === 'Reject' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                            }`}
                          >
                            ✕ Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB: COST CENTRES ================= */}
      {activeTab === 'costCentres' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-gray-200">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Cost Centres &amp; Profitability Units</h3>
              <p className="text-xs text-gray-500">Allocate revenue, direct expenditure, and department budgets for multidimensional P&amp;L reporting</p>
            </div>
            <button
              onClick={() => setShowCostCentreModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" /> + Create Cost Centre
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {costCentres.map((cc: any) => {
              const netProfit = (cc.allocatedRevenue || 0) - (cc.allocatedExpenses || 0);
              const isProfit = netProfit >= 0;
              return (
                <div key={cc.id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                        {cc.category}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-gray-500">Budget: ₹{cc.budget?.toLocaleString()}</span>
                        <button
                          onClick={() => handleOpenEditCostCentre(cc)}
                          className="p-1 text-gray-400 hover:text-blue-600 rounded cursor-pointer"
                          title="Edit Cost Centre"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCostCentre(cc.id, cc.name)}
                          className="p-1 text-gray-400 hover:text-rose-600 rounded cursor-pointer"
                          title="Delete Cost Centre"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <h4 className="text-base font-black text-gray-900">{cc.name}</h4>

                    <div className="mt-4 grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-gray-500 block">Revenue</span>
                        <strong className="font-mono text-emerald-700 font-bold">₹{cc.allocatedRevenue?.toLocaleString()}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-gray-500 block">Expenses</span>
                        <strong className="font-mono text-rose-700 font-bold">₹{cc.allocatedExpenses?.toLocaleString()}</strong>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-gray-500 block">Net Contribution</span>
                        <strong className={`font-mono font-black ${isProfit ? 'text-emerald-700' : 'text-rose-700'}`}>
                          ₹{netProfit.toLocaleString()}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                    <span className="text-gray-400">Budget Utilization: {Math.round(((cc.allocatedExpenses || 0) / (cc.budget || 1)) * 100)}%</span>
                    <span className={`font-bold ${isProfit ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {isProfit ? 'Profitable Unit' : 'Over-Allocated'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= TAB: BUDGETS & VARIANCE ================= */}
      {activeTab === 'budgets' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-gray-200">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Budgets vs Actuals Variance Register</h3>
              <p className="text-xs text-gray-500">Monitor expenditure discipline across fiscal periods and prevent organizational cost overruns</p>
            </div>
            <button
              onClick={() => setShowBudgetModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" /> + Allocate Budget
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-black uppercase text-gray-500 tracking-wider">
                    <th className="py-3 px-4">Expense Category / Project</th>
                    <th className="py-3 px-4">Fiscal Period</th>
                    <th className="py-3 px-4 text-right">Allocated Budget</th>
                    <th className="py-3 px-4 text-right">Actual Spent</th>
                    <th className="py-3 px-4 text-right">Remaining Balance</th>
                    <th className="py-3 px-4 text-center">Variance %</th>
                    <th className="py-3 px-4 text-center">Utilization</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {budgets.map((b: any) => {
                    const pct = Math.min(100, Math.round((b.actualSpent / b.allocatedBudget) * 100));
                    const isOver = b.actualSpent > b.allocatedBudget;
                    return (
                      <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-gray-900">{b.category}</td>
                        <td className="py-3.5 px-4 font-mono text-gray-600">{b.fiscalPeriod}</td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-gray-900">₹{b.allocatedBudget?.toLocaleString()}</td>
                        <td className="py-3.5 px-4 text-right font-mono font-semibold text-rose-700">₹{b.actualSpent?.toLocaleString()}</td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-700">₹{b.remainingBudget?.toLocaleString()}</td>
                        <td className="py-3.5 px-4 text-center font-mono">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isOver ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {b.variancePercent > 0 ? `+${b.variancePercent}%` : `${b.variancePercent}%`}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="w-28 mx-auto bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-2 rounded-full ${isOver ? 'bg-rose-600' : 'bg-blue-600'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center space-x-1 whitespace-nowrap">
                          <button
                            onClick={() => handleOpenEditBudget(b)}
                            className="p-1 text-gray-400 hover:text-blue-600 rounded cursor-pointer"
                            title="Edit Budget"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteBudget(b.id, b.category)}
                            className="p-1 text-gray-400 hover:text-rose-600 rounded cursor-pointer"
                            title="Delete Budget"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB: FINANCIAL RATIOS ================= */}
      {activeTab === 'ratios' && financialRatios && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <h3 className="text-sm font-bold text-gray-900">Balance Sheet &amp; P&amp;L Ratio Analysis</h3>
            <p className="text-xs text-gray-500">Automated corporate solvency, liquidity, and operational profitability metrics grounded in real-time books</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Liquidity Ratio</span>
              <h4 className="text-sm font-black text-gray-900 mt-1">Current Ratio</h4>
              <p className="text-3xl font-black font-mono text-blue-600 mt-2">{financialRatios.currentRatio}:1</p>
              <p className="text-xs text-gray-500 mt-2">Benchmark: 2.0:1 • Current Assets to Current Liabilities solvency</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Acid-Test Liquidity</span>
              <h4 className="text-sm font-black text-gray-900 mt-1">Quick Ratio</h4>
              <p className="text-3xl font-black font-mono text-indigo-600 mt-2">{financialRatios.quickRatio}:1</p>
              <p className="text-xs text-gray-500 mt-2">Benchmark: 1.0:1 • (Current Assets - Inventory) vs Liabilities</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Capital Structure</span>
              <h4 className="text-sm font-black text-gray-900 mt-1">Debt-to-Equity Ratio</h4>
              <p className="text-3xl font-black font-mono text-purple-600 mt-2">{financialRatios.debtToEquity}:1</p>
              <p className="text-xs text-gray-500 mt-2">Low financial leverage &amp; strong equity reserve solvency</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Profitability</span>
              <h4 className="text-sm font-black text-gray-900 mt-1">Net Profit Margin</h4>
              <p className="text-3xl font-black font-mono text-emerald-600 mt-2">{financialRatios.netProfitMargin}%</p>
              <p className="text-xs text-gray-500 mt-2">Post-tax net bottomline conversion from total invoiced sales</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Return Metric</span>
              <h4 className="text-sm font-black text-gray-900 mt-1">Return on Equity (ROE)</h4>
              <p className="text-3xl font-black font-mono text-teal-600 mt-2">{financialRatios.roe}%</p>
              <p className="text-xs text-gray-500 mt-2">Shareholder capital efficiency and net asset yield</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Working Capital</span>
              <h4 className="text-sm font-black text-gray-900 mt-1">Net Working Capital</h4>
              <p className="text-3xl font-black font-mono text-blue-700 mt-2">₹{financialRatios.workingCapital?.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-2">Operating liquidity buffer available for trade operations</p>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB: DAY BOOK REGISTER ================= */}
      {activeTab === 'dayBook' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-gray-200">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Chronological Day Book (Daily Voucher Register)</h3>
              <p className="text-xs text-gray-500">Complete audit trail of all transactions: Sales, Purchases, Receipts, Payments, Contras and Journals</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-500">Filter Voucher:</span>
              <select
                value={dayBookTypeFilter}
                onChange={e => setDayBookTypeFilter(e.target.value)}
                className="text-xs border border-gray-300 rounded-xl p-2 bg-white font-bold"
              >
                <option value="All">All Vouchers ({dayBookEntries.length})</option>
                <option value="Sales">Sales Vouchers</option>
                <option value="Purchase">Purchase Bills</option>
                <option value="Receipt">Receipts</option>
                <option value="Payment">Payments</option>
                <option value="Contra">Contra Entries</option>
                <option value="Journal">Journal Entries</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-black uppercase text-gray-500 tracking-wider">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Voucher No</th>
                    <th className="py-3 px-4">Voucher Type</th>
                    <th className="py-3 px-4">Debit Account</th>
                    <th className="py-3 px-4">Credit Account</th>
                    <th className="py-3 px-4">Narration / Memo</th>
                    <th className="py-3 px-4 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {dayBookEntries
                    .filter(v => dayBookTypeFilter === 'All' || v.voucherType === dayBookTypeFilter)
                    .map((v: any) => (
                      <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-gray-600">{v.date}</td>
                        <td className="py-3.5 px-4 font-mono font-bold text-blue-600">{v.voucherNo}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            v.voucherType === 'Sales' ? 'bg-emerald-100 text-emerald-800' :
                            v.voucherType === 'Purchase' ? 'bg-amber-100 text-amber-800' :
                            v.voucherType === 'Receipt' ? 'bg-blue-100 text-blue-800' :
                            v.voucherType === 'Payment' ? 'bg-rose-100 text-rose-800' :
                            v.voucherType === 'Contra' ? 'bg-purple-100 text-purple-800' :
                            'bg-slate-100 text-slate-800'
                          }`}>
                            {v.voucherType}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-gray-900">{v.debitAccount}</td>
                        <td className="py-3.5 px-4 font-bold text-gray-900">{v.creditAccount}</td>
                        <td className="py-3.5 px-4 text-gray-500 italic">{v.narration}</td>
                        <td className="py-3.5 px-4 text-right font-mono font-black text-gray-900">₹{v.amount?.toLocaleString()}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB: EXCEPTION REPORTS ================= */}
      {activeTab === 'exceptions' && exceptionReports && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <h3 className="text-sm font-bold text-gray-900">Accounting Exception Reports &amp; Audit Trail</h3>
            <p className="text-xs text-gray-500">Automated statutory exception scanner detecting negative balances, missing tax credentials, and reconciliation variances</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl">
              <span className="text-[10px] uppercase font-bold text-rose-700 block">Negative Cash/Bank</span>
              <strong className="text-2xl font-black text-rose-900">{exceptionReports.summary.negativeCashAccounts} Accounts</strong>
            </div>
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl">
              <span className="text-[10px] uppercase font-bold text-amber-700 block">Missing GSTIN Vouchers</span>
              <strong className="text-2xl font-black text-amber-900">{exceptionReports.summary.missingGstinVouchers} Invoices</strong>
            </div>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl">
              <span className="text-[10px] uppercase font-bold text-blue-700 block">Unmatched Bank Entries</span>
              <strong className="text-2xl font-black text-blue-900">{exceptionReports.summary.unreconciledBankEntries} Entries</strong>
            </div>
            <div className="bg-purple-50 border border-purple-200 p-4 rounded-2xl">
              <span className="text-[10px] uppercase font-bold text-purple-700 block">Critical Overdue (&gt;90d)</span>
              <strong className="text-2xl font-black text-purple-900">{exceptionReports.summary.criticalOverdueDebtors} Debtors</strong>
            </div>
          </div>

          {/* Missing GSTINs Table */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-gray-100 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h4 className="text-sm font-bold text-gray-900">Vouchers with Missing / Incomplete Party GSTIN</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-black uppercase text-gray-500 tracking-wider">
                    <th className="py-3 px-4">Invoice / Voucher</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Party Name</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {exceptionReports.missingGstinVouchers?.map((v: any) => (
                    <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-amber-700">{v.invoiceNumber}</td>
                      <td className="py-3 px-4 font-mono text-gray-600">{v.date}</td>
                      <td className="py-3 px-4 font-bold text-gray-900">{v.customerName}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-gray-900">₹{v.totalAmount?.toLocaleString()}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-semibold text-[10px]">
                          Unregistered / B2C
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

            {activeTab === 'manage' && (
        <div className="space-y-6">
          {/* Header & Quick Action Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-400/30">
                  REAL-TIME CRUD LEDGER
                </span>
                <span className="text-xs text-blue-200">
                  {allEntriesList.length} Active Financial Line Items
                </span>
              </div>
              <h2 className="text-xl font-bold tracking-tight mt-1">Manage Financial Entries (Add & Delete)</h2>
              <p className="text-xs text-blue-200/80 mt-1 max-w-2xl">
                Add, review, and delete any individual revenue invoice, purchase order, operating expense, capital asset, or bank balance. Every change recalculates Profit & Loss and Balance Sheet in real time.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setShowAddEntryModal(true)}
                className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Financial Entry</span>
              </button>
              <button
                onClick={() => setShowResetModal(true)}
                className="px-4 py-2.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-400/40 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
              >
                <RotateCcw className="w-4 h-4 text-rose-300" />
                <span>Reset All to ₹0.00</span>
              </button>
            </div>
          </div>

          {/* KPI Breakdown Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Total Entries</span>
              <div className="text-xl font-black text-gray-900 mt-1">{allEntriesList.length}</div>
              <span className="text-[11px] text-gray-500">Live records</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Revenue Invoices</span>
              <div className="text-xl font-black text-emerald-700 mt-1">
                ₹{pnl ? pnl.grossSales.toLocaleString() : '0'}
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold">{financialEntries?.counts?.invoices || 0} entries</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs">
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">COGS Purchases</span>
              <div className="text-xl font-black text-amber-700 mt-1">
                ₹{pnl ? pnl.cogs.toLocaleString() : '0'}
              </div>
              <span className="text-[11px] text-amber-600 font-semibold">{financialEntries?.counts?.purchases || 0} entries</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-rose-200 shadow-xs">
              <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">OPEX Expenses</span>
              <div className="text-xl font-black text-rose-700 mt-1">
                ₹{pnl ? pnl.opex.toLocaleString() : '0'}
              </div>
              <span className="text-[11px] text-rose-600 font-semibold">{financialEntries?.counts?.opex || 0} entries</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-purple-200 shadow-xs">
              <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">Fixed Assets</span>
              <div className="text-xl font-black text-purple-700 mt-1">
                ₹{balanceSheet ? balanceSheet.fixedAssets.totalFixedAssets.toLocaleString() : '0'}
              </div>
              <span className="text-[11px] text-purple-600 font-semibold">{financialEntries?.counts?.fixedAssets || 0} assets</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-cyan-200 shadow-xs">
              <span className="text-[10px] font-bold text-cyan-700 uppercase tracking-wider block">Bank Capital</span>
              <div className="text-xl font-black text-cyan-700 mt-1">
                ₹{(financialEntries?.bankCapital || []).reduce((acc: number, c: any) => acc + (Number(c.amount) || 0), 0).toLocaleString()}
              </div>
              <span className="text-[11px] text-cyan-600 font-semibold">{financialEntries?.counts?.bankCapital || 0} entries</span>
            </div>
          </div>

          {/* Filter Bar & Search */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setManageFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  manageFilter === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Entries ({allEntriesList.length})
              </button>
              <button
                onClick={() => setManageFilter('REVENUE')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  manageFilter === 'REVENUE'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                Revenue ({financialEntries?.counts?.invoices || 0})
              </button>
              <button
                onClick={() => setManageFilter('COGS')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  manageFilter === 'COGS'
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                COGS / Purchases ({financialEntries?.counts?.purchases || 0})
              </button>
              <button
                onClick={() => setManageFilter('OPEX')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  manageFilter === 'OPEX'
                    ? 'bg-rose-600 text-white'
                    : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
                }`}
              >
                OPEX ({financialEntries?.counts?.opex || 0})
              </button>
              <button
                onClick={() => setManageFilter('FIXED_ASSET')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  manageFilter === 'FIXED_ASSET'
                    ? 'bg-purple-600 text-white'
                    : 'bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200'
                }`}
              >
                Fixed Assets ({financialEntries?.counts?.fixedAssets || 0})
              </button>
              <button
                onClick={() => setManageFilter('BANK_CAPITAL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  manageFilter === 'BANK_CAPITAL'
                    ? 'bg-cyan-600 text-white'
                    : 'bg-cyan-50 text-cyan-800 hover:bg-cyan-100 border border-cyan-200'
                }`}
              >
                Bank Capital ({financialEntries?.counts?.bankCapital || 0})
              </button>
            </div>

            {/* Search Box */}
            <div className="relative min-w-[260px]">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={manageSearch}
                onChange={(e) => setManageSearch(e.target.value)}
                placeholder="Search description, party, category..."
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              {manageSearch && (
                <button
                  onClick={() => setManageSearch('')}
                  className="absolute right-2.5 top-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Entries Data Table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-5 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">Description / Title</th>
                  <th className="px-5 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">Party / Counterparty</th>
                  <th className="px-5 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-5 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-5 py-3 text-right text-[11px] font-bold text-gray-500 uppercase tracking-wider">Amount (₹)</th>
                  <th className="px-5 py-3 text-center text-[11px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-center text-[11px] font-bold text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEntriesList.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-16 text-center">
                      <div className="max-w-md mx-auto flex flex-col items-center">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                          <Sparkles className="w-6 h-6" />
                        </div>
                        <h3 className="text-base font-bold text-gray-900">
                          {allEntriesList.length === 0 ? 'All Financial Books are at ₹0.00' : 'No matching entries found'}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1 text-center">
                          {allEntriesList.length === 0
                            ? 'There are currently zero entries. Both Profit & Loss and Balance Sheet statements are clean slate ₹0.00. Click below to add your first financial entry.'
                            : 'Try adjusting your search criteria or filter pills above.'}
                        </p>
                        {allEntriesList.length === 0 && (
                          <button
                            onClick={() => setShowAddEntryModal(true)}
                            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Add Your First Financial Entry</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredEntriesList.map((entry) => {
                    const badgeConfig = {
                      REVENUE: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200', label: 'Revenue' },
                      COGS: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', label: 'COGS' },
                      OPEX: { bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200', label: 'OPEX' },
                      FIXED_ASSET: { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200', label: 'Fixed Asset' },
                      BANK_CAPITAL: { bg: 'bg-cyan-50', text: 'text-cyan-800', border: 'border-cyan-200', label: 'Capital' }
                    }[entry.type];

                    return (
                      <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border ${badgeConfig.bg} ${badgeConfig.text} ${badgeConfig.border}`}>
                            {badgeConfig.label}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="text-xs font-bold text-gray-900 max-w-xs truncate" title={entry.title}>
                            {entry.title}
                          </div>
                          <div className="text-[10px] text-gray-400 font-mono mt-0.5">{entry.id}</div>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <div className="text-xs font-semibold text-gray-800">{entry.party}</div>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span className="text-xs text-gray-600">{entry.category}</span>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap text-xs text-gray-500 font-medium">
                          {entry.date}
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap text-right">
                          <div className="text-xs font-black text-gray-900">
                            ₹{entry.amount.toLocaleString()}
                          </div>
                          {entry.tax > 0 && (
                            <div className="text-[10px] text-gray-400">Tax: ₹{entry.tax.toLocaleString()}</div>
                          )}
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap text-center">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                            entry.status === 'Paid' || entry.status === 'Capitalized' || entry.status === 'Liquid Funds'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {entry.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap text-center space-x-1">
                          <button
                            onClick={() => handleOpenEditEntry(entry)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-flex items-center justify-center"
                            title="Edit this entry and recalculate statements"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteEntry(entry.type, entry.id, entry.title)}
                            disabled={deletingId === entry.id}
                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors inline-flex items-center justify-center"
                            title="Delete this entry and recalculate statements"
                          >
                            <Trash2 className={`w-4 h-4 ${deletingId === entry.id ? 'animate-spin text-rose-500' : ''}`} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* WHATSAPP ADVICE MODAL */}
      {showWhatsAppModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-emerald-200 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setShowWhatsAppModal(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">WhatsApp Overdue Payment Advice</h3>
                <p className="text-xs text-gray-500">Direct integration with WhatsApp Web & CRM Dispatch Log</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Recipient Customer</label>
                <div className="p-2.5 bg-gray-50 rounded-xl text-xs font-bold text-gray-800 border border-gray-200">
                  {showWhatsAppModal.client.clientName} ({showWhatsAppModal.client.phone})
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Message Text Preview (Automated Template)</label>
                <textarea
                  rows={8}
                  value={customWhatsAppMsg}
                  onChange={(e) => setCustomWhatsAppMsg(e.target.value)}
                  className="w-full p-3 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono bg-slate-50"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                ⚡ Dispatches directly via WhatsApp and logs communication event in CRM client timeline.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowWhatsAppModal(null)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDispatchWhatsApp}
                  disabled={sendingWhatsApp}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{sendingWhatsApp ? 'Dispatching...' : 'Dispatch WhatsApp Notice'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SETTLE PAYMENT MODAL */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setShowPaymentModal(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Settle Outstanding Payment</h3>
                <p className="text-xs text-gray-500">Record remittance against {showPaymentModal.invoiceNumber}</p>
              </div>
            </div>

            <form onSubmit={handleSettlePayment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Client</label>
                <div className="p-2.5 bg-gray-50 rounded-xl text-xs font-bold text-gray-800 border border-gray-200">
                  {showPaymentModal.clientName}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Payment Amount (₹) • Balance: ₹{showPaymentModal.balanceDue.toLocaleString()}
                </label>
                <input
                  type="number"
                  max={showPaymentModal.balanceDue}
                  min={1}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                >
                  <option value="NEFT / RTGS">NEFT / RTGS Bank Transfer</option>
                  <option value="IMPS Immediate Payment">IMPS Immediate Payment</option>
                  <option value="UPI / QR Code Payment">UPI / QR Code Payment</option>
                  <option value="Cheque / Demand Draft">Cheque / Demand Draft</option>
                  <option value="Credit / Debit Card">Credit / Debit Card</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">UTR / Transaction Reference No.</label>
                <input
                  type="text"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  placeholder="e.g. UTR-HDFC-9912048821"
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(null)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirm Settlement</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD JOURNAL TX MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-[500px] max-w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Record General Ledger Transaction</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Type</label>
                  <select 
                    value={newTx.type} 
                    onChange={e => setNewTx({...newTx, type: e.target.value})} 
                    className="w-full border-gray-300 rounded-xl p-2 border bg-white text-xs"
                  >
                    <option>Income</option>
                    <option>Expense</option>
                    <option>Receivable</option>
                    <option>Payable</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Amount (₹)</label>
                  <input 
                    type="number" 
                    required 
                    value={newTx.amount} 
                    onChange={e => setNewTx({...newTx, amount: Number(e.target.value)})} 
                    className="w-full border-gray-300 rounded-xl p-2 border text-xs" 
                    placeholder="Amount (₹)" 
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
                  <input 
                    required 
                    value={newTx.category} 
                    onChange={e => setNewTx({...newTx, category: e.target.value})} 
                    className="w-full border-gray-300 rounded-xl p-2 border text-xs" 
                    placeholder="Category (e.g. Consulting Revenue, Office Supplies, Cloud Infrastructure)" 
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Description / Notes</label>
                  <textarea 
                    value={newTx.description} 
                    onChange={e => setNewTx({...newTx, description: e.target.value})} 
                    className="w-full border-gray-300 rounded-xl p-2 border text-xs" 
                    placeholder="Description / Reference details" 
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UNIVERSAL ADD FINANCIAL ENTRY MODAL */}
      {showAddEntryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-200 relative animate-in fade-in zoom-in-95 duration-150 my-8">
            <button
              onClick={() => setShowAddEntryModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-xl shadow-xs">
                <Plus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Add Financial Entry to Ledger</h3>
                <p className="text-xs text-gray-500">Adds transaction directly into P&L and Balance Sheet calculations</p>
              </div>
            </div>

            {/* Entry Type Selector Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 p-1 bg-gray-100 rounded-xl mb-4 text-xs font-bold">
              <button
                type="button"
                onClick={() => setEntryForm(prev => ({ ...prev, entryType: 'REVENUE', category: 'Sales Revenue' }))}
                className={`py-2 rounded-lg transition-all text-center ${
                  entryForm.entryType === 'REVENUE' ? 'bg-white text-emerald-800 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Revenue
              </button>
              <button
                type="button"
                onClick={() => setEntryForm(prev => ({ ...prev, entryType: 'COGS', category: 'Direct Materials' }))}
                className={`py-2 rounded-lg transition-all text-center ${
                  entryForm.entryType === 'COGS' ? 'bg-white text-amber-800 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                COGS
              </button>
              <button
                type="button"
                onClick={() => setEntryForm(prev => ({ ...prev, entryType: 'OPEX', category: 'Salaries & Payroll' }))}
                className={`py-2 rounded-lg transition-all text-center ${
                  entryForm.entryType === 'OPEX' ? 'bg-white text-rose-800 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                OPEX
              </button>
              <button
                type="button"
                onClick={() => setEntryForm(prev => ({ ...prev, entryType: 'FIXED_ASSET', category: 'Computer & IT Hardware' }))}
                className={`py-2 rounded-lg transition-all text-center ${
                  entryForm.entryType === 'FIXED_ASSET' ? 'bg-white text-purple-800 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Fixed Asset
              </button>
              <button
                type="button"
                onClick={() => setEntryForm(prev => ({ ...prev, entryType: 'BANK_CAPITAL', category: 'Share Capital' }))}
                className={`py-2 rounded-lg transition-all text-center ${
                  entryForm.entryType === 'BANK_CAPITAL' ? 'bg-white text-cyan-800 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Capital
              </button>
            </div>

            <form onSubmit={handleAddEntry} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {entryForm.entryType === 'REVENUE' && 'Service Description / Invoice Item'}
                  {entryForm.entryType === 'COGS' && 'Raw Material / Goods Description'}
                  {entryForm.entryType === 'OPEX' && 'Expense Description (e.g., September Engineering Salaries)'}
                  {entryForm.entryType === 'FIXED_ASSET' && 'Asset Name (e.g., Dell PowerEdge Rack Server)'}
                  {entryForm.entryType === 'BANK_CAPITAL' && 'Capital Entry Description (e.g., Founder Equity Seed Infusion)'}
                </label>
                <input
                  type="text"
                  required
                  value={entryForm.title}
                  onChange={(e) => setEntryForm({ ...entryForm, title: e.target.value })}
                  placeholder="Enter title or description"
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {entryForm.entryType === 'REVENUE' && 'Customer / Client Name'}
                    {entryForm.entryType === 'COGS' && 'Vendor / Supplier Name'}
                    {entryForm.entryType === 'OPEX' && 'Payee / Employee / Beneficiary'}
                    {entryForm.entryType === 'FIXED_ASSET' && 'Location / Assigned Department'}
                    {entryForm.entryType === 'BANK_CAPITAL' && 'Deposit Bank Account'}
                  </label>
                  <input
                    type="text"
                    required
                    value={entryForm.partyName}
                    onChange={(e) => setEntryForm({ ...entryForm, partyName: e.target.value })}
                    placeholder={
                      entryForm.entryType === 'REVENUE' ? 'e.g. Tata Consultancy' :
                      entryForm.entryType === 'COGS' ? 'e.g. Dell Technologies' :
                      entryForm.entryType === 'OPEX' ? 'e.g. Employee Payroll / Landlord' :
                      entryForm.entryType === 'FIXED_ASSET' ? 'e.g. Bangalore Tech Center' :
                      'e.g. HDFC Operating Account'
                    }
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Classification / Category</label>
                  {entryForm.entryType === 'OPEX' ? (
                    <select
                      value={entryForm.category}
                      onChange={(e) => setEntryForm({ ...entryForm, category: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium"
                    >
                      <option value="Salaries & Payroll">Salaries & Payroll (Direct OPEX)</option>
                      <option value="Office Rent & Lease">Office Rent & Facilities</option>
                      <option value="Cloud Infrastructure & Hosting">Cloud Infrastructure & AWS/GCP</option>
                      <option value="Electricity & Utilities">Electricity & Utilities</option>
                      <option value="Sales & Marketing">Marketing, Advertising & Branding</option>
                      <option value="Legal & Accounting Audit">Legal, Secretarial & Audit</option>
                      <option value="Consulting & Contractors">Contractors & Specialized Consulting</option>
                      <option value="Office Supplies & Admin">General Administrative & Supplies</option>
                    </select>
                  ) : entryForm.entryType === 'FIXED_ASSET' ? (
                    <select
                      value={entryForm.category}
                      onChange={(e) => setEntryForm({ ...entryForm, category: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium"
                    >
                      <option value="Computer & IT Hardware">Computer & IT Hardware</option>
                      <option value="Servers & Networking">Enterprise Servers & Networking</option>
                      <option value="Office Furniture & Fixtures">Office Furniture & Ergonomic Desks</option>
                      <option value="Plant & Machinery">Plant & Heavy Machinery</option>
                      <option value="Vehicles">Corporate Fleet & Vehicles</option>
                      <option value="Leasehold Improvements">Leasehold Improvements</option>
                    </select>
                  ) : entryForm.entryType === 'BANK_CAPITAL' ? (
                    <select
                      value={entryForm.category}
                      onChange={(e) => setEntryForm({ ...entryForm, category: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium"
                    >
                      <option value="Share Capital">Paid-Up Share Capital</option>
                      <option value="Founder Equity">Founder Opening Capital</option>
                      <option value="Investor Funding">Investor Seed / Venture Capital</option>
                      <option value="Bank Opening Balance">Opening Bank Balance</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={entryForm.category}
                      onChange={(e) => setEntryForm({ ...entryForm, category: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={entryForm.amount}
                    onChange={(e) => setEntryForm({ ...entryForm, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">GST Tax Rate</label>
                  <select
                    value={entryForm.taxRate}
                    onChange={(e) => setEntryForm({ ...entryForm, taxRate: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  >
                    <option value={0}>0% (Exempt / Nil)</option>
                    <option value={5}>5% GST</option>
                    <option value={12}>12% GST</option>
                    <option value={18}>18% Standard GST</option>
                    <option value={28}>28% GST</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Transaction Date</label>
                  <input
                    type="date"
                    required
                    value={entryForm.date}
                    onChange={(e) => setEntryForm({ ...entryForm, date: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {entryForm.entryType === 'COGS' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Inward Freight / Logistics (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={entryForm.freightCharges}
                    onChange={(e) => setEntryForm({ ...entryForm, freightCharges: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="0"
                  />
                </div>
              )}

              {/* Payment Settlement Status */}
              {(entryForm.entryType === 'REVENUE' || entryForm.entryType === 'COGS' || entryForm.entryType === 'OPEX') && (
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-gray-800">Immediate Settlement</span>
                      <p className="text-[11px] text-gray-500">
                        {entryForm.isPaid 
                          ? 'Settled immediately (Impacts Cash & Bank balance in Balance Sheet)'
                          : 'Unsettled / On Credit (Creates Accounts Receivable or Payable)'}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={entryForm.isPaid}
                        onChange={(e) => setEntryForm({ ...entryForm, isPaid: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                </div>
              )}

              {/* Real-time Calculation Summary */}
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs flex items-center justify-between text-blue-900 font-semibold">
                <span>Calculated Line Total:</span>
                <span className="text-sm font-black text-blue-950">
                  ₹{(
                    entryForm.amount + 
                    Math.round(entryForm.amount * (entryForm.taxRate / 100)) + 
                    (entryForm.entryType === 'COGS' ? entryForm.freightCharges : 0)
                  ).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddEntryModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingEntry}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span>{submittingEntry ? 'Recording...' : 'Record Entry & Update Books'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM RESET ALL TO ZERO MODAL */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-rose-200 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setShowResetModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-rose-100 text-rose-700 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Reset Books to Strictly ₹0.00?</h3>
                <p className="text-xs text-rose-600 font-semibold">Irreversible Clean Slate Action</p>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              This will permanently delete all entered Revenue Invoices, Purchase Entries, Operating Expenses, Fixed Capital Assets, and Bank Capital accounts.
            </p>
            <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-[11px] text-rose-900">
              ✓ Profit & Loss statement will read ₹0.00 across all revenue, COGS, and expense lines.<br />
              ✓ Balance Sheet will balance at ₹0.00 Total Assets and ₹0.00 Total Liabilities & Equity.<br />
              ✓ Client outstanding balances and overdue alerts will be cleared.
            </div>

            <div className="flex justify-end gap-2 mt-5 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50"
              >
                Keep Existing Data
              </button>
              <button
                type="button"
                onClick={handleResetAllToZero}
                disabled={isResetting}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isResetting ? 'Resetting Books...' : 'Confirm Reset to ₹0.00'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT VOUCHER ================= */}
      {showEditVoucherModal && editingVoucher && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-[480px] max-w-full p-6 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Edit Voucher {editingVoucher.voucherNumber}</h3>
              <button onClick={() => setShowEditVoucherModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleEditVoucherSubmit} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Voucher Date</label>
                  <input
                    type="date"
                    value={editVoucherForm.voucherDate}
                    onChange={e => setEditVoucherForm({ ...editVoucherForm, voucherDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Reference Number</label>
                  <input
                    type="text"
                    value={editVoucherForm.referenceNumber}
                    onChange={e => setEditVoucherForm({ ...editVoucherForm, referenceNumber: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Narration</label>
                <textarea
                  rows={2}
                  value={editVoucherForm.narration}
                  onChange={e => setEditVoucherForm({ ...editVoucherForm, narration: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setShowEditVoucherModal(false)} className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs">Update Voucher</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT COST CENTRE ================= */}
      {showEditCostCentreModal && editingCostCentre && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-[480px] max-w-full p-6 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Edit Cost Centre</h3>
              <button onClick={() => setShowEditCostCentreModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleEditCostCentreSubmit} className="space-y-4 pt-4">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Cost Centre Name</label>
                <input
                  type="text"
                  required
                  value={editCostCentreForm.name}
                  onChange={e => setEditCostCentreForm({ ...editCostCentreForm, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 font-semibold"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Category</label>
                  <select
                    value={editCostCentreForm.category}
                    onChange={e => setEditCostCentreForm({ ...editCostCentreForm, category: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 bg-white font-medium"
                  >
                    <option value="Department">Department</option>
                    <option value="Project">Project</option>
                    <option value="Business Unit">Business Unit</option>
                    <option value="Branch">Branch</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Lead Manager</label>
                  <input
                    type="text"
                    value={editCostCentreForm.manager}
                    onChange={e => setEditCostCentreForm({ ...editCostCentreForm, manager: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Annual Budget Allocation (₹)</label>
                <input
                  type="number"
                  value={editCostCentreForm.allocatedBudget}
                  onChange={e => setEditCostCentreForm({ ...editCostCentreForm, allocatedBudget: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 font-mono font-bold"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setShowEditCostCentreModal(false)} className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs">Save Cost Centre</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT BUDGET ================= */}
      {showEditBudgetModal && editingBudget && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-[460px] max-w-full p-6 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Edit Budget Plan</h3>
              <button onClick={() => setShowEditBudgetModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleEditBudgetSubmit} className="space-y-4 pt-4">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Expense Category Head</label>
                <input
                  type="text"
                  required
                  value={editBudgetForm.category}
                  onChange={e => setEditBudgetForm({ ...editBudgetForm, category: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 font-semibold"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Monthly Budget Allocation (₹)</label>
                <input
                  type="number"
                  required
                  value={editBudgetForm.allocatedBudget}
                  onChange={e => setEditBudgetForm({ ...editBudgetForm, allocatedBudget: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 font-mono font-bold"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setShowEditBudgetModal(false)} className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs">Save Budget</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT CUSTOM STATEMENT ENTRY ================= */}
      {showEditEntryModal && editingEntry && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-[480px] max-w-full p-6 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Edit Financial Statement Entry</h3>
              <button onClick={() => setShowEditEntryModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleEditEntrySubmit} className="space-y-4 pt-4">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Item Title / Particulars *</label>
                <input
                  type="text"
                  required
                  value={editEntryForm.title}
                  onChange={e => setEditEntryForm({ ...editEntryForm, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 font-semibold"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    value={editEntryForm.amount}
                    onChange={e => setEditEntryForm({ ...editEntryForm, amount: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={editEntryForm.category}
                    onChange={e => setEditEntryForm({ ...editEntryForm, category: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setShowEditEntryModal(false)} className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs">Update &amp; Recalculate</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
