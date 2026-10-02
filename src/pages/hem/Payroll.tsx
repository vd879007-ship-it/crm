import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  DollarSign, 
  FileText, 
  Download, 
  Building, 
  CreditCard, 
  ShieldCheck, 
  PieChart, 
  Landmark, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Eye, 
  RefreshCw, 
  Printer, 
  FileSpreadsheet, 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  Receipt, 
  Sliders, 
  Sparkles, 
  Filter, 
  X, 
  ChevronRight, 
  Lock, 
  Check,
  Calendar,
  Layers,
  TrendingUp,
  Percent,
  Copy,
  ExternalLink,
  Trash2,
  Pencil,
  Fingerprint
} from 'lucide-react';
import HEMNavigation from '../../components/HEMNavigation';

export default function Payroll() {
  const [activeTab, setActiveTab] = useState<
    'payrun' | 'structure' | 'loans' | 'reimbursements' | 'fbp' | 'compliance' | 'reports' | 'jv' | 'disbursement'
  >('payrun');

  // Main state collections
  const [payslips, setPayslips] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [structures, setStructures] = useState<any[]>([]);
  const [componentsMaster, setComponentsMaster] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [reimbursements, setReimbursements] = useState<any[]>([]);
  const [fbpData, setFbpData] = useState<{ catalog: any[]; declarations: any[] }>({ catalog: [], declarations: [] });
  const [statutorySummary, setStatutorySummary] = useState<any>(null);
  const [statutorySlabs, setStatutorySlabs] = useState<any>(null);
  const [jvData, setJvData] = useState<any>(null);
  const [disbursements, setDisbursements] = useState<any[]>([]);
  const [varianceReport, setVarianceReport] = useState<any>(null);
  const [reportSubTab, setReportSubTab] = useState<'variance' | 'register' | 'bank_advice'>('variance');

  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [editingStructure, setEditingStructure] = useState<any | null>(null);
  const [editingLoan, setEditingLoan] = useState<any | null>(null);
  const [editingReimbursement, setEditingReimbursement] = useState<any | null>(null);
  const [showEditPayslipModal, setShowEditPayslipModal] = useState(false);
  const [editingPayslip, setEditingPayslip] = useState<any | null>(null);
  const [editPayslipForm, setEditPayslipForm] = useState({
    baseSalary: 0,
    allowances: 0,
    incentives: 0,
    deductions: 0,
    reimbursements: 0
  });

  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState<any | null>(null);
  const [showStructureModal, setShowStructureModal] = useState(false);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [showReimbursementModal, setShowReimbursementModal] = useState(false);
  const [showFBPModal, setShowFBPModal] = useState(false);
  const [ecrModalData, setEcrModalData] = useState<any | null>(null);
  const [form24QData, setForm24QData] = useState<any | null>(null);

  // Forms State
  const [payslipForm, setPayslipForm] = useState({
    userId: '',
    employeeName: '',
    department: 'Technology & Engineering',
    designation: 'Software Engineer',
    month: 'September 2026',
    baseSalary: 75000,
    allowances: 25000,
    incentives: 5000,
    overtimePay: 0,
    deductions: 0,
    loansAdvances: 0,
    reimbursements: 0,
    pan: 'ABCDE1234F',
    uan: '100987654321',
    bankName: 'HDFC Bank',
    accountNumber: '501004892019',
    ifscCode: 'HDFC0001234',
    taxRegime: 'New Regime (Sec 115BAC)'
  });

  const [structureForm, setStructureForm] = useState({
    code: '',
    name: '',
    description: '',
    applicableBands: 'L1 to L3 Engineering',
    basicPercent: 40,
    hraPercentOfBasic: 50,
    daPercentOfBasic: 0,
    conveyanceFixed: 1600,
    medicalFixed: 1250,
    specialAllowanceBalancing: true,
    pfOptIn: true,
    esiApplicableIfEligible: true,
    ptApplicable: true
  });

  const [loanForm, setLoanForm] = useState({
    employeeId: '',
    employeeName: '',
    department: 'Technology & Engineering',
    type: 'Emergency Medical Loan',
    principal: 50000,
    interestRate: 0,
    tenureMonths: 10,
    reason: 'Family urgent medical assistance'
  });

  const [reimbursementForm, setReimbursementForm] = useState({
    employeeId: '',
    employeeName: '',
    department: 'Technology & Engineering',
    category: 'Broadband & High-Speed Mobile Data',
    expenseDate: new Date().toISOString().split('T')[0],
    billNumber: '',
    billAmount: 2200,
    taxExempt: true,
    remarks: 'Monthly WFH broadband allowance'
  });

  const [fbpForm, setFbpForm] = useState({
    employeeId: '',
    employeeName: '',
    financialYear: '2026-27',
    annualFlexiPool: 120000,
    allocations: {
      nps: 10000,
      meal: 2600,
      fuel: 1800,
      phone: 1500,
      books: 1000,
      wellness: 800
    }
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

  const fetchData = async () => {
    try {
      const [
        payRes, empRes, structRes, compRes, loansRes, rmbRes, fbpRes, statRes, slabsRes, jvRes, disbRes, varRes
      ] = await Promise.all([
        axios.get(`${API_URL}/api/hem/payroll`),
        axios.get(`${API_URL}/api/hem/employees`).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/api/hem/payroll/structures`).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/api/hem/payroll/components`).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/api/hem/payroll/loans`).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/api/hem/payroll/reimbursements`).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/api/hem/payroll/fbp`).catch(() => ({ data: { catalog: [], declarations: [] } })),
        axios.get(`${API_URL}/api/hem/payroll/statutory/summary`).catch(() => ({ data: null })),
        axios.get(`${API_URL}/api/hem/payroll/statutory/slabs`).catch(() => ({ data: null })),
        axios.get(`${API_URL}/api/hem/payroll/jv`).catch(() => ({ data: null })),
        axios.get(`${API_URL}/api/hem/payroll/disbursements`).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/api/hem/payroll/reports/variance`).catch(() => ({ data: null }))
      ]);

      setPayslips(payRes.data || []);
      setEmployees(empRes.data || []);
      setStructures(structRes.data || []);
      setComponentsMaster(compRes.data || []);
      setLoans(loansRes.data || []);
      setReimbursements(rmbRes.data || []);
      setFbpData(fbpRes.data || { catalog: [], declarations: [] });
      setStatutorySummary(statRes.data);
      setStatutorySlabs(slabsRes.data);
      setJvData(jvRes.data);
      setDisbursements(disbRes.data || []);
      setVarianceReport(varRes.data);

      if (empRes.data && empRes.data.length > 0) {
        const first = empRes.data[0];
        setPayslipForm(prev => ({
          ...prev,
          userId: first.id,
          employeeName: first.name,
          baseSalary: first.employeeDetail?.baseSalary || 75000
        }));
        setLoanForm(prev => ({ ...prev, employeeId: first.id, employeeName: first.name }));
        setReimbursementForm(prev => ({ ...prev, employeeId: first.id, employeeName: first.name }));
        setFbpForm(prev => ({ ...prev, employeeId: first.id, employeeName: first.name }));
      }
    } catch (err) {
      console.error('Failed to fetch payroll data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handlers
  const handleGeneratePayslip = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/hem/payroll/generate`, payslipForm);
      setShowGenerateModal(false);
      fetchData();
      showToast('Payslip generated and calculated successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to generate payslip');
    }
  };

  const [syncingAttendance, setSyncingAttendance] = useState(false);

  const handleSyncLiveAttendance = async () => {
    try {
      setSyncingAttendance(true);
      const res = await axios.post(`${API_URL}/api/hem/payroll/sync-live-attendance`, {
        month: 'September 2026'
      });
      await fetchData();
      showToast(res.data?.message || 'Auto-synced with biometric attendance, approved leaves, LOP and OT hours!');
    } catch (err) {
      console.error(err);
      alert('Failed to sync live attendance into payroll');
    } finally {
      setSyncingAttendance(false);
    }
  };

  const handleSimulatePayRun = async () => {
    try {
      await axios.post(`${API_URL}/api/hem/payroll/simulate-payrun`);
      fetchData();
      showToast('Simulated September 2026 workforce pay run generated!');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDistributePayslip = async (id: string) => {
    try {
      await axios.put(`${API_URL}/api/hem/payroll/${id}/distribute`);
      fetchData();
      showToast('Payslip published to ESS & sent via corporate email!');
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkDistribute = async () => {
    try {
      await axios.post(`${API_URL}/api/hem/payroll/bulk-distribute`);
      fetchData();
      showToast('All employee payslips distributed to Email & ESS portal!');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePayslip = async (id: string) => {
    if (!window.confirm(`Are you sure you want to delete payslip ${id}?`)) return;
    try {
      await axios.delete(`${API_URL}/api/hem/payroll/${id}`);
      if (selectedPayslip?.id === id) setSelectedPayslip(null);
      fetchData();
      showToast(`Payslip ${id} deleted successfully!`);
    } catch (err) {
      console.error(err);
      alert('Failed to delete payslip');
    }
  };

  const handleClearAllPayslips = async () => {
    if (!window.confirm('Are you sure you want to clear all payslips in this cycle?')) return;
    try {
      await axios.delete(`${API_URL}/api/hem/payroll`);
      setSelectedPayslip(null);
      fetchData();
      showToast('All payslips in cycle cleared successfully!');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteStructure = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this salary structure?')) return;
    try {
      await axios.delete(`${API_URL}/api/hem/payroll/structures/${id}`);
      fetchData();
      showToast('Salary structure removed!');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteLoan = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this loan record?')) return;
    try {
      await axios.delete(`${API_URL}/api/hem/payroll/loans/${id}`);
      fetchData();
      showToast('Loan record removed!');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteReimbursement = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this reimbursement claim?')) return;
    try {
      await axios.delete(`${API_URL}/api/hem/payroll/reimbursements/${id}`);
      fetchData();
      showToast('Reimbursement claim deleted!');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteFBPDeclaration = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this FBP declaration?')) return;
    try {
      await axios.delete(`${API_URL}/api/hem/payroll/fbp/declarations/${id}`);
      fetchData();
      showToast('FBP declaration deleted!');
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenCreateStructure = () => {
    setEditingStructure(null);
    setStructureForm({
      code: '',
      name: '',
      description: '',
      applicableBands: 'L1 to L3 Engineering',
      basicPercent: 40,
      hraPercentOfBasic: 50,
      daPercentOfBasic: 0,
      conveyanceFixed: 1600,
      medicalFixed: 1250,
      specialAllowanceBalancing: true,
      pfOptIn: true,
      esiApplicableIfEligible: true,
      ptApplicable: true
    });
    setShowStructureModal(true);
  };

  const handleOpenEditStructure = (s: any) => {
    setEditingStructure(s);
    setStructureForm({
      code: s.code || '',
      name: s.name || '',
      description: s.description || '',
      applicableBands: Array.isArray(s.applicableBands) ? s.applicableBands.join(', ') : (s.applicableBands || ''),
      basicPercent: s.basicPercent ?? 40,
      hraPercentOfBasic: s.hraPercentOfBasic ?? 50,
      daPercentOfBasic: s.daPercentOfBasic ?? 0,
      conveyanceFixed: s.conveyanceFixed ?? 1600,
      medicalFixed: s.medicalFixed ?? 1250,
      specialAllowanceBalancing: s.specialAllowanceBalancing ?? true,
      pfOptIn: s.pfOptIn ?? true,
      esiApplicableIfEligible: s.esiApplicableIfEligible ?? true,
      ptApplicable: s.ptApplicable ?? true
    });
    setShowStructureModal(true);
  };

  const handleOpenCreateLoan = () => {
    setEditingLoan(null);
    setLoanForm({
      employeeId: '',
      employeeName: '',
      department: 'Technology & Engineering',
      type: 'Emergency Medical Loan',
      principal: 50000,
      interestRate: 0,
      tenureMonths: 10,
      reason: 'Family urgent medical assistance'
    });
    setShowLoanModal(true);
  };

  const handleOpenEditLoan = (l: any) => {
    setEditingLoan(l);
    setLoanForm({
      employeeId: l.employeeId || '',
      employeeName: l.employeeName || '',
      department: l.department || 'Technology & Engineering',
      type: l.type || 'Emergency Medical Loan',
      principal: l.principal || 50000,
      interestRate: l.interestRate ?? 0,
      tenureMonths: l.tenureMonths || 10,
      reason: l.reason || ''
    });
    setShowLoanModal(true);
  };

  const handleOpenCreateReimbursement = () => {
    setEditingReimbursement(null);
    setReimbursementForm({
      employeeId: '',
      employeeName: '',
      department: 'Technology & Engineering',
      category: 'Broadband & High-Speed Mobile Data',
      expenseDate: new Date().toISOString().split('T')[0],
      billNumber: '',
      billAmount: 2200,
      taxExempt: true,
      remarks: 'Monthly WFH broadband allowance'
    });
    setShowReimbursementModal(true);
  };

  const handleOpenEditReimbursement = (r: any) => {
    setEditingReimbursement(r);
    setReimbursementForm({
      employeeId: r.employeeId || '',
      employeeName: r.employeeName || '',
      department: r.department || 'Technology & Engineering',
      category: r.category || 'Broadband & High-Speed Mobile Data',
      expenseDate: r.expenseDate ? r.expenseDate.split('T')[0] : new Date().toISOString().split('T')[0],
      billNumber: r.billNumber || '',
      billAmount: r.billAmount || 2200,
      taxExempt: r.taxExempt ?? true,
      remarks: r.remarks || ''
    });
    setShowReimbursementModal(true);
  };

  const handleOpenEditPayslip = (p: any) => {
    setEditingPayslip(p);
    setEditPayslipForm({
      baseSalary: p.baseSalary || 0,
      allowances: p.allowances || 0,
      incentives: p.incentives || 0,
      deductions: p.deductions || 0,
      reimbursements: p.reimbursements || 0
    });
    setShowEditPayslipModal(true);
  };

  const handleSaveEditPayslip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPayslip) return;
    try {
      const gross = Number(editPayslipForm.baseSalary) + Number(editPayslipForm.allowances) + Number(editPayslipForm.incentives) + Number(editPayslipForm.reimbursements);
      const netSalary = gross - Number(editPayslipForm.deductions);
      await axios.put(`${API_URL}/api/hem/payroll/${editingPayslip.id}`, {
        ...editPayslipForm,
        grossSalary: gross,
        netSalary: netSalary
      });
      setShowEditPayslipModal(false);
      fetchData();
      showToast('Payslip financials updated successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to update payslip');
    }
  };

  const handleSaveStructure = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...structureForm,
        applicableBands: typeof structureForm.applicableBands === 'string' ? structureForm.applicableBands.split(',').map(s => s.trim()) : structureForm.applicableBands
      };
      if (editingStructure) {
        await axios.put(`${API_URL}/api/hem/payroll/structures/${editingStructure.id}`, payload);
        showToast('Salary structure updated successfully!');
      } else {
        await axios.post(`${API_URL}/api/hem/payroll/structures`, payload);
        showToast('New salary structure template configured!');
      }
      setShowStructureModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to save structure');
    }
  };

  const handleCreateLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingLoan) {
        await axios.put(`${API_URL}/api/hem/payroll/loans/${editingLoan.id}`, loanForm);
        showToast('Loan record updated successfully!');
      } else {
        await axios.post(`${API_URL}/api/hem/payroll/loans`, loanForm);
        showToast('Loan / Salary advance approved and added to recovery schedule!');
      }
      setShowLoanModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to save loan');
    }
  };

  const handleSimulateLoans = async () => {
    try {
      await axios.post(`${API_URL}/api/hem/payroll/loans/simulate`);
      fetchData();
      showToast('Sample staff loans and EMI schedules loaded!');
    } catch (err) {
      console.error(err);
    }
  };

  const handleRepayLoanEMI = async (id: string) => {
    try {
      await axios.post(`${API_URL}/api/hem/payroll/loans/${id}/repay`, {});
      fetchData();
      showToast('Monthly EMI recovery logged!');
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateReimbursement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingReimbursement) {
        await axios.put(`${API_URL}/api/hem/payroll/reimbursements/${editingReimbursement.id}`, reimbursementForm);
        showToast('Reimbursement claim updated successfully!');
      } else {
        await axios.post(`${API_URL}/api/hem/payroll/reimbursements`, reimbursementForm);
        showToast('Reimbursement claim submitted and verified for pay run!');
      }
      setShowReimbursementModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to save reimbursement');
    }
  };

  const handleSimulateReimbursements = async () => {
    try {
      await axios.post(`${API_URL}/api/hem/payroll/reimbursements/simulate`);
      fetchData();
      showToast('Sample reimbursement claims verified and added!');
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateFBPDeclaration = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/hem/payroll/fbp/declare`, fbpForm);
      setShowFBPModal(false);
      fetchData();
      showToast('Flexible Benefit Plan declaration updated!');
    } catch (err) {
      console.error(err);
    }
  };

  const handleSimulateFBP = async () => {
    try {
      await axios.post(`${API_URL}/api/hem/payroll/fbp/simulate`);
      fetchData();
      showToast('Sample FBP declarations loaded!');
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateECR = async () => {
    try {
      const res = await axios.post(`${API_URL}/api/hem/payroll/statutory/ecr-generate`);
      setEcrModalData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerate24Q = async () => {
    try {
      const res = await axios.post(`${API_URL}/api/hem/payroll/statutory/24q-summary`);
      setForm24QData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostJV = async () => {
    try {
      await axios.post(`${API_URL}/api/hem/payroll/jv/post`);
      fetchData();
      showToast('Payroll Journal Voucher posted to ERP General Ledger!');
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateDisbursementBatch = async () => {
    try {
      await axios.post(`${API_URL}/api/hem/payroll/disbursements/create-batch`);
      fetchData();
      showToast('Bank disbursement batch generated from finalized payroll!');
    } catch (err) {
      console.error(err);
    }
  };

  const handleProcessDisbursement = async (id: string) => {
    try {
      await axios.post(`${API_URL}/api/hem/payroll/disbursements/${id}/process`);
      fetchData();
      showToast('Disbursement completed via Bank Gateway. UTR generated!');
    } catch (err) {
      console.error(err);
    }
  };

  // Aggregated KPIs
  const totalNetDisbursed = payslips.reduce((acc, p) => acc + (p.netSalary || 0), 0);
  const totalGrossPayroll = payslips.reduce((acc, p) => acc + (p.earnings?.totalGrossEarnings || p.baseSalary || 0), 0);
  const totalStatutoryPayable = statutorySummary?.grandTotalStatutoryPayable || 0;
  const activeLoansCount = loans.filter(l => l.status === 'Active / In-Repayment').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top HEM In-Module Navigation */}
      <HEMNavigation />

      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Payroll & Total Rewards Engine
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-100 text-teal-800">
              Enterprise Grade
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            End-to-end salary structures, loan advances, tax-exempt claims, statutory compliance, accounts JV & bank disbursement
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {activeTab === 'payrun' && (
            <>
              <button
                onClick={handleSyncLiveAttendance}
                disabled={syncingAttendance}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                title="Auto-fetch Biometric Swipes, Approved Leaves, LOP and OT into payroll"
              >
                <Fingerprint className="w-3.5 h-3.5 text-emerald-100" />
                <span>{syncingAttendance ? 'Syncing Swipes...' : 'Auto-Sync Live Attendance'}</span>
              </button>
              {payslips.length === 0 && (
                <button
                  onClick={handleSimulatePayRun}
                  className="px-3.5 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Simulate Full Pay Run
                </button>
              )}
              {payslips.length > 0 && (
                <>
                  <button
                    onClick={handleClearAllPayslips}
                    className="px-3 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="Clear all payslips in this cycle"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear Cycle
                  </button>
                  <button
                    onClick={handleBulkDistribute}
                    className="px-3.5 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Bulk Distribute All
                  </button>
                </>
              )}
              <button
                onClick={() => setShowGenerateModal(true)}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Generate Payslip
              </button>
            </>
          )}

          {activeTab === 'structure' && (
            <button
              onClick={handleOpenCreateStructure}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Configure Salary Structure
            </button>
          )}

          {activeTab === 'loans' && (
            <>
              {loans.length === 0 && (
                <button
                  onClick={handleSimulateLoans}
                  className="px-3.5 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Simulate Staff Loans
                </button>
              )}
              <button
                onClick={handleOpenCreateLoan}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Grant Loan / Advance
              </button>
            </>
          )}

          {activeTab === 'reimbursements' && (
            <>
              {reimbursements.length === 0 && (
                <button
                  onClick={handleSimulateReimbursements}
                  className="px-3.5 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Simulate Claims
                </button>
              )}
              <button
                onClick={handleOpenCreateReimbursement}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Submit Claim
              </button>
            </>
          )}

          {activeTab === 'fbp' && (
            <>
              {fbpData.declarations.length === 0 && (
                <button
                  onClick={handleSimulateFBP}
                  className="px-3.5 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Simulate Declarations
                </button>
              )}
              <button
                onClick={() => setShowFBPModal(true)}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                New Flexi Declaration
              </button>
            </>
          )}

          {activeTab === 'disbursement' && (
            <button
              onClick={handleCreateDisbursementBatch}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              Create Bank Batch
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Net Payout</p>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </span>
          </div>
          <h3 className="text-2xl font-extrabold text-gray-900 mt-2">
            ₹{totalNetDisbursed.toLocaleString('en-IN')}
          </h3>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {payslips.length} payslips finalized for cycle
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Gross Payroll Cost</p>
            <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Building className="w-5 h-5" />
            </span>
          </div>
          <h3 className="text-2xl font-extrabold text-gray-900 mt-2">
            ₹{totalGrossPayroll.toLocaleString('en-IN')}
          </h3>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Total wages + employer statutory additions
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Statutory Dues</p>
            <span className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </span>
          </div>
          <h3 className="text-2xl font-extrabold text-amber-600 mt-2">
            ₹{totalStatutoryPayable.toLocaleString('en-IN')}
          </h3>
          <p className="text-[11px] text-gray-400 mt-0.5">
            EPF, ESI, PT & TDS monthly remittance
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active Loans & Adv</p>
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Wallet className="w-5 h-5" />
            </span>
          </div>
          <h3 className="text-2xl font-extrabold text-indigo-600 mt-2">
            {activeLoansCount}
          </h3>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Automated monthly payroll EMI recoveries
          </p>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-1.5 shadow-xs overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1 min-w-max">
          {[
            { id: 'payrun', label: 'Payslips & Pay Run', icon: DollarSign, badge: payslips.length },
            { id: 'structure', label: 'Salary Structure', icon: Sliders, badge: structures.length },
            { id: 'loans', label: 'Loans & Advances', icon: Wallet, badge: loans.length },
            { id: 'reimbursements', label: 'Reimbursements', icon: Receipt, badge: reimbursements.length },
            { id: 'fbp', label: 'Flexible Benefits (FBP)', icon: Percent, badge: fbpData.declarations.length },
            { id: 'compliance', label: 'Statutory Compliance', icon: ShieldCheck, badge: null },
            { id: 'reports', label: 'Payroll Reports', icon: FileSpreadsheet, badge: null },
            { id: 'jv', label: 'Accounts JV', icon: Landmark, badge: jvData?.isBalanced ? 'Balanced' : null },
            { id: 'disbursement', label: 'Payout & Disbursement', icon: CreditCard, badge: disbursements.length }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/70'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge !== null && tab.badge !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: PAYSLIPS & PAY RUN LEDGER */}
      {/* ======================================================== */}
      {activeTab === 'payrun' && (
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Workforce Monthly Salary Register & Payslips</h3>
              <p className="text-xs text-gray-400 mt-0.5">Pay cycle September 2026 • Itemized earnings, deductions and digital distribution</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-medium">Cycle:</span>
              <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold font-mono">
                Sep 2026
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="px-5 py-3.5 text-left">Payslip Code</th>
                  <th className="px-5 py-3.5 text-left">Employee & Role</th>
                  <th className="px-5 py-3.5 text-left">Gross Earnings</th>
                  <th className="px-5 py-3.5 text-left">Deductions</th>
                  <th className="px-5 py-3.5 text-left">Reimbursements</th>
                  <th className="px-5 py-3.5 text-left">Net Payable</th>
                  <th className="px-5 py-3.5 text-left">Distribution</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {payslips.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center text-gray-400">
                      No payslips found for this cycle. Click "Simulate Full Pay Run" or "Generate Payslip" to initiate.
                    </td>
                  </tr>
                ) : (
                  payslips.map((p) => {
                    const gross = p.earnings?.totalGrossEarnings || (p.baseSalary + (p.allowances || 0));
                    const totalDed = p.deductions?.totalDeductions || (p.deductions + (p.loansAdvances || 0));
                    const rmb = p.reimbursements || 0;
                    return (
                      <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-3.5 font-mono font-bold text-gray-900">
                          {p.id}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="font-bold text-gray-900">{p.employeeName || p.user?.name || 'Staff Member'}</div>
                          <div className="text-[11px] text-gray-400">{p.department || 'Department'} • {p.designation || 'Specialist'}</div>
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-gray-800 font-mono">
                          ₹{gross.toLocaleString('en-IN')}
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-rose-600 font-mono">
                          -₹{totalDed.toLocaleString('en-IN')}
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-blue-600 font-mono">
                          +₹{rmb.toLocaleString('en-IN')}
                        </td>
                        <td className="px-5 py-3.5 font-extrabold text-emerald-600 font-mono text-sm">
                          ₹{p.netSalary.toLocaleString('en-IN')}
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              p.distributionStatus === 'Distributed via Email & ESS'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {p.distributionStatus || 'Pending'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => setSelectedPayslip(p)}
                            className="px-2.5 py-1 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors cursor-pointer"
                          >
                            View Payslip
                          </button>
                          <button
                            onClick={() => handleDistributePayslip(p.id)}
                            className="px-2.5 py-1 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                          >
                            Distribute
                          </button>
                          <button
                            onClick={() => handleOpenEditPayslip(p)}
                            title="Edit Payslip Financials"
                            className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer inline-flex items-center"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeletePayslip(p.id)}
                            title="Delete Payslip"
                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer inline-flex items-center"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* ======================================================== */}
      {/* TAB 2: CONFIGURABLE SALARY STRUCTURE */}
      {/* ======================================================== */}
      {activeTab === 'structure' && (
        <div className="space-y-6">
          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {structures.map((s) => (
              <div key={s.id} className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div>
                    <span className="text-[10px] font-mono font-bold bg-teal-50 text-teal-700 px-2 py-0.5 rounded">
                      {s.code}
                    </span>
                    <h4 className="text-base font-bold text-gray-900 mt-1">{s.name}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                      Active Structure
                    </span>
                    <button
                      onClick={() => handleOpenEditStructure(s)}
                      title="Edit Structure"
                      className="p-1 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteStructure(s.id)}
                      title="Delete Structure"
                      className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-gray-500 leading-relaxed">{s.description}</p>

                <div className="bg-gray-50/70 p-3 rounded-xl border border-gray-100 space-y-2 text-xs">
                  <div className="flex justify-between font-medium">
                    <span className="text-gray-600">Basic Pay Formula:</span>
                    <span className="font-bold text-gray-900">{s.basicPercent}% of CTC</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span className="text-gray-600">HRA Percentage:</span>
                    <span className="font-bold text-gray-900">{s.hraPercentOfBasic}% of Basic</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span className="text-gray-600">Fixed Allowances:</span>
                    <span className="font-bold text-gray-900">Conveyance ₹{s.conveyanceFixed} • Medical ₹{s.medicalFixed}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span className="text-gray-600">Special Allowance:</span>
                    <span className="font-bold text-teal-700">Dynamic Balancing Figure</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span className="text-gray-600">Statutory Deductions:</span>
                    <span className="font-bold text-gray-900">EPF 12% • ESI 0.75% • PT ₹200</span>
                  </div>
                </div>

                <div>
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Applicable Grades & Bands</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(s.applicableBands || []).map((band: string, idx: number) => (
                      <span key={idx} className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                        {band}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Master Components Catalog */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900">Master Salary Components Catalog</h3>
              <p className="text-xs text-gray-400 mt-0.5">Earnings, deductions and statutory employer matches</p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-xs">
                <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-[10px] tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5 text-left">Code</th>
                    <th className="px-5 py-3.5 text-left">Component Name</th>
                    <th className="px-5 py-3.5 text-left">Type</th>
                    <th className="px-5 py-3.5 text-left">Calculation Mode</th>
                    <th className="px-5 py-3.5 text-left">Statutory Applicability</th>
                    <th className="px-5 py-3.5 text-left">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {componentsMaster.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3.5 font-mono font-bold text-gray-900">
                        {c.code}
                      </td>
                      <td className="px-5 py-3.5 font-bold text-gray-900">
                        {c.name}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            c.type === 'earning'
                              ? 'bg-emerald-50 text-emerald-700'
                              : c.type === 'deduction'
                              ? 'bg-rose-50 text-rose-700'
                              : 'bg-indigo-50 text-indigo-700'
                          }`}
                        >
                          {c.type === 'earning' ? 'Earning' : c.type === 'deduction' ? 'Deduction' : 'Employer Match'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-gray-600">
                        {c.calcType}
                      </td>
                      <td className="px-5 py-3.5 space-x-1">
                        {c.isPFApplicable && (
                          <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded">
                            PF
                          </span>
                        )}
                        {c.isESIApplicable && (
                          <span className="bg-purple-50 text-purple-700 text-[10px] font-bold px-1.5 py-0.5 rounded">
                            ESI
                          </span>
                        )}
                        {c.isTaxable && (
                          <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-1.5 py-0.5 rounded">
                            Taxable
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-gray-500">
                        {c.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: LOANS AND SALARY ADVANCES */}
      {/* ======================================================== */}
      {activeTab === 'loans' && (
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Staff Loan & Salary Advance Amortization Ledger</h3>
              <p className="text-xs text-gray-400 mt-0.5">Disbursed loans, interest rates, tenure and automatic monthly payroll EMI deductions</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="px-5 py-3.5 text-left">Loan ID</th>
                  <th className="px-5 py-3.5 text-left">Employee</th>
                  <th className="px-5 py-3.5 text-left">Loan Type</th>
                  <th className="px-5 py-3.5 text-left">Principal</th>
                  <th className="px-5 py-3.5 text-left">Monthly EMI</th>
                  <th className="px-5 py-3.5 text-left">Repayment Progress</th>
                  <th className="px-5 py-3.5 text-left">Remaining</th>
                  <th className="px-5 py-3.5 text-left">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {loans.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-5 py-12 text-center text-gray-400">
                      No active loans or salary advances found. Click "Simulate Staff Loans" or "Grant Loan" to create one.
                    </td>
                  </tr>
                ) : (
                  loans.map((l) => {
                    const percentRepaid = l.principal > 0 ? Math.round((l.totalRepaid / l.principal) * 100) : 0;
                    return (
                      <tr key={l.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-3.5 font-mono font-bold text-gray-900">
                          {l.id}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="font-bold text-gray-900">{l.employeeName}</div>
                          <div className="text-[10px] text-gray-400">{l.department}</div>
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-gray-700">
                          {l.type}
                        </td>
                        <td className="px-5 py-3.5 font-bold font-mono text-gray-900">
                          ₹{l.principal.toLocaleString('en-IN')}
                        </td>
                        <td className="px-5 py-3.5 font-bold font-mono text-indigo-700">
                          ₹{l.monthlyEMI.toLocaleString('en-IN')}
                        </td>
                        <td className="px-5 py-3.5 min-w-[140px]">
                          <div className="flex items-center justify-between text-[10px] font-semibold text-gray-500 mb-1">
                            <span>{percentRepaid}% Repaid</span>
                            <span>₹{l.totalRepaid.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-teal-500 h-full rounded-full transition-all" style={{ width: `${percentRepaid}%` }}></div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 font-bold font-mono text-rose-600">
                          ₹{l.remainingBalance.toLocaleString('en-IN')}
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              l.status === 'Fully Repaid'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-blue-50 text-blue-700'
                            }`}
                          >
                            {l.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right space-x-1 whitespace-nowrap">
                          {l.remainingBalance > 0 && (
                            <button
                              onClick={() => handleRepayLoanEMI(l.id)}
                              className="px-2.5 py-1 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors cursor-pointer"
                            >
                              Recover EMI
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenEditLoan(l)}
                            title="Edit Loan"
                            className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer inline-flex items-center"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteLoan(l.id)}
                            title="Delete Loan"
                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer inline-flex items-center"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* ======================================================== */}
      {/* TAB 4: PAYROLL REIMBURSEMENTS */}
      {/* ======================================================== */}
      {activeTab === 'reimbursements' && (
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Employee Expense Reimbursement & Claims Hub</h3>
              <p className="text-xs text-gray-400 mt-0.5">Tax-exempt business expenses reimbursed through monthly payroll disbursement</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="px-5 py-3.5 text-left">Claim ID</th>
                  <th className="px-5 py-3.5 text-left">Employee</th>
                  <th className="px-5 py-3.5 text-left">Expense Category</th>
                  <th className="px-5 py-3.5 text-left">Bill Details</th>
                  <th className="px-5 py-3.5 text-left">Claimed Amount</th>
                  <th className="px-5 py-3.5 text-left">Approved Amount</th>
                  <th className="px-5 py-3.5 text-left">Tax Exemption</th>
                  <th className="px-5 py-3.5 text-left">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {reimbursements.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-5 py-12 text-center text-gray-400">
                      No reimbursement claims submitted. Click "Simulate Claims" or "Submit Claim" to get started.
                    </td>
                  </tr>
                ) : (
                  reimbursements.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3.5 font-mono font-bold text-gray-900">
                        {r.id}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-gray-900">{r.employeeName}</div>
                        <div className="text-[10px] text-gray-400">{r.department}</div>
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-gray-800">
                        {r.category}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-mono text-gray-900">{r.billNumber}</div>
                        <div className="text-[10px] text-gray-400">{r.expenseDate}</div>
                      </td>
                      <td className="px-5 py-3.5 font-mono font-medium text-gray-600">
                        ₹{r.billAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="px-5 py-3.5 font-mono font-bold text-emerald-600">
                        ₹{r.approvedAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="px-5 py-3.5">
                        {r.taxExempt ? (
                          <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Tax-Exempt
                          </span>
                        ) : (
                          <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Taxable
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {r.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleOpenEditReimbursement(r)}
                          title="Edit Claim"
                          className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer inline-flex items-center"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteReimbursement(r.id)}
                          title="Delete Claim"
                          className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer inline-flex items-center"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: FLEXIBLE BENEFIT PLANS (FBP) */}
      {/* ======================================================== */}
      {activeTab === 'fbp' && (
        <div className="space-y-6">
          {/* FBP Basket Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {fbpData.catalog.map((c) => (
              <div key={c.code} className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold bg-teal-50 text-teal-700 px-2 py-0.5 rounded">
                    {c.code}
                  </span>
                  <span className="text-[11px] font-mono font-bold text-gray-900">
                    Max: ₹{c.monthlyMax.toLocaleString('en-IN')}/mo
                  </span>
                </div>
                <h4 className="text-sm font-bold text-gray-900">{c.name}</h4>
                <p className="text-xs text-gray-500 leading-relaxed">{c.taxExemptionClause}</p>
              </div>
            ))}
          </div>

          {/* Employee Declarations Table */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Employee FBP Flexi Basket Declarations</h3>
                <p className="text-xs text-gray-400 mt-0.5">Annual tax-saving allocations across NPS, Meal, Fuel, Device & Learning</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-xs">
                <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-[10px] tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5 text-left">Declaration ID</th>
                    <th className="px-5 py-3.5 text-left">Employee</th>
                    <th className="px-5 py-3.5 text-left">Financial Year</th>
                    <th className="px-5 py-3.5 text-left">Annual Flexi Pool</th>
                    <th className="px-5 py-3.5 text-left">Declared Amount</th>
                    <th className="px-5 py-3.5 text-left">Monthly Tax Saved</th>
                    <th className="px-5 py-3.5 text-left">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {fbpData.declarations.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-5 py-12 text-center text-gray-400">
                        No FBP declarations recorded. Click "Simulate Declarations" or "New Flexi Declaration" to add.
                      </td>
                    </tr>
                  ) : (
                    fbpData.declarations.map((d) => (
                      <tr key={d.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-3.5 font-mono font-bold text-gray-900">
                          {d.id}
                        </td>
                        <td className="px-5 py-3.5 font-bold text-gray-900">
                          {d.employeeName}
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-gray-600 font-mono">
                          {d.financialYear}
                        </td>
                        <td className="px-5 py-3.5 font-bold font-mono text-gray-900">
                          ₹{d.annualFlexiPool.toLocaleString('en-IN')}
                        </td>
                        <td className="px-5 py-3.5 font-bold font-mono text-teal-700">
                          ₹{d.totalDeclared.toLocaleString('en-IN')}
                        </td>
                        <td className="px-5 py-3.5 font-bold font-mono text-emerald-600">
                          ~₹{d.monthlyTaxSavingEstimated.toLocaleString('en-IN')} / mo
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {d.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right whitespace-nowrap">
                          <button
                            onClick={() => handleDeleteFBPDeclaration(d.id)}
                            title="Delete Declaration"
                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer inline-flex items-center"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 6: STATUTORY COMPLIANCE */}
      {/* ======================================================== */}
      {activeTab === 'compliance' && (
        <div className="space-y-6">
          {/* Statutory Action Bar */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 bg-teal-50 text-teal-700 rounded-xl">
                  <ShieldCheck className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Statutory Compliance & Remittance Center</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Generate EPFO ECR challans, quarterly 24Q TDS summaries and verify multi-state compliance slabs
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleGenerateECR}
                className="px-3.5 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Generate EPFO ECR File
              </button>
              <button
                onClick={handleGenerate24Q}
                className="px-3.5 py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                Form 24Q Summary
              </button>
            </div>
          </div>

          {/* Breakdown Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* EPF Card */}
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-blue-600" />
                  <h4 className="text-sm font-bold text-gray-900">Employees' Provident Fund (EPF)</h4>
                </div>
                <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                  12% + 12%
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Employee Share (12%):</span>
                  <span className="font-mono font-bold text-gray-900">₹{(statutorySummary?.epfLiability?.employeeShare || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Employer EPS Share (8.33%):</span>
                  <span className="font-mono font-bold text-gray-900">₹{(statutorySummary?.epfLiability?.employerEPSShare || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Employer EPF Share (3.67%):</span>
                  <span className="font-mono font-bold text-gray-900">₹{(statutorySummary?.epfLiability?.employerEPFShare || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">EDLI & Admin (1.0%):</span>
                  <span className="font-mono font-bold text-gray-900">₹{((statutorySummary?.epfLiability?.edliShare || 0) + (statutorySummary?.epfLiability?.adminCharges || 0)).toLocaleString('en-IN')}</span>
                </div>
                <div className="pt-2 border-t border-gray-100 flex justify-between text-sm font-extrabold text-blue-700">
                  <span>Total EPF Remittance:</span>
                  <span>₹{(statutorySummary?.epfLiability?.totalPayable || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* ESI Card */}
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <h4 className="text-sm font-bold text-gray-900">Employees' State Insurance (ESI)</h4>
                </div>
                <span className="text-[10px] font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">
                  0.75% + 3.25%
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Employee Share (0.75%):</span>
                  <span className="font-mono font-bold text-gray-900">₹{(statutorySummary?.esiLiability?.employeeShare || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Employer Share (3.25%):</span>
                  <span className="font-mono font-bold text-gray-900">₹{(statutorySummary?.esiLiability?.employerShare || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-gray-400 text-[11px]">
                  <span>Eligibility Threshold:</span>
                  <span>Gross ≤ ₹21,000</span>
                </div>
                <div className="pt-2 border-t border-gray-100 flex justify-between text-sm font-extrabold text-purple-700">
                  <span>Total ESI Remittance:</span>
                  <span>₹{(statutorySummary?.esiLiability?.totalPayable || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* PT & TDS Card */}
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-amber-600" />
                  <h4 className="text-sm font-bold text-gray-900">PT & TDS Remittance</h4>
                </div>
                <span className="text-[10px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
                  Municipal & Central
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Professional Tax (PT):</span>
                  <span className="font-mono font-bold text-gray-900">₹{(statutorySummary?.ptLiability?.totalPayable || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Income Tax (TDS Sec 192):</span>
                  <span className="font-mono font-bold text-gray-900">₹{(statutorySummary?.tdsLiability?.totalPayable || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-gray-400 text-[11px]">
                  <span>TDS Challan Type:</span>
                  <span>ITNS 281</span>
                </div>
                <div className="pt-2 border-t border-gray-100 flex justify-between text-sm font-extrabold text-amber-700">
                  <span>Total PT + TDS Remittance:</span>
                  <span>₹{((statutorySummary?.ptLiability?.totalPayable || 0) + (statutorySummary?.tdsLiability?.totalPayable || 0)).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Slabs Reference Matrix */}
          {statutorySlabs && (
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-5 space-y-4">
              <h4 className="text-sm font-bold text-gray-900">Statutory Tax & Deduction Slabs (FY 2026-27 Reference)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <h5 className="font-bold text-slate-800">New Tax Regime (Section 115BAC - Default)</h5>
                  <p className="text-gray-500">Standard Deduction: ₹75,000</p>
                  <ul className="list-disc pl-4 space-y-1 text-gray-600">
                    {statutorySlabs.incomeTaxRegimes?.newRegime?.slabs?.map((slab: string, i: number) => (
                      <li key={i}>{slab}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <h5 className="font-bold text-slate-800">Professional Tax (PT) State Slabs</h5>
                  <ul className="space-y-1 text-gray-600">
                    {statutorySlabs.pt?.states?.map((st: any, i: number) => (
                      <li key={i} className="flex justify-between">
                        <strong className="text-gray-700">{st.state}:</strong>
                        <span>{st.slab}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 7: PAYROLL REPORTS */}
      {/* ======================================================== */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          {/* Sub Tab Controls */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setReportSubTab('variance')}
              className={`px-4 py-2.5 font-bold text-xs uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                reportSubTab === 'variance' ? 'text-teal-700 border-teal-600' : 'text-gray-400 border-transparent hover:text-gray-700'
              }`}
            >
              Month-on-Month Variance Report
            </button>
            <button
              onClick={() => setReportSubTab('register')}
              className={`px-4 py-2.5 font-bold text-xs uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                reportSubTab === 'register' ? 'text-teal-700 border-teal-600' : 'text-gray-400 border-transparent hover:text-gray-700'
              }`}
            >
              Tabular Salary Register
            </button>
            <button
              onClick={() => setReportSubTab('bank_advice')}
              className={`px-4 py-2.5 font-bold text-xs uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                reportSubTab === 'bank_advice' ? 'text-teal-700 border-teal-600' : 'text-gray-400 border-transparent hover:text-gray-700'
              }`}
            >
              Bank Payment Transfer Advice
            </button>
          </div>

          {/* Variance Report */}
          {reportSubTab === 'variance' && (
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Payroll Variance Analysis</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Month-on-month compensation movement and root cause variance drivers</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-teal-50 text-teal-700 rounded-lg text-xs font-bold font-mono">
                    Sep 2026 vs Aug 2026
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-xs text-gray-500 font-semibold">August 2026 Net Payout</span>
                  <h4 className="text-xl font-bold font-mono text-gray-800 mt-1">
                    ₹{(varianceReport?.previousNetPayout || 0).toLocaleString('en-IN')}
                  </h4>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-xs text-gray-500 font-semibold">September 2026 Net Payout</span>
                  <h4 className="text-xl font-bold font-mono text-teal-700 mt-1">
                    ₹{(varianceReport?.currentNetPayout || 0).toLocaleString('en-IN')}
                  </h4>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-xs text-gray-500 font-semibold">Net Movement & % Delta</span>
                  <h4 className="text-xl font-bold font-mono text-emerald-600 mt-1 flex items-center gap-1">
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                    +₹{(varianceReport?.netVariance || 0).toLocaleString('en-IN')} ({varianceReport?.percentageChange || 0}%)
                  </h4>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Key Variance Drivers</h4>
                <div className="space-y-2">
                  {(varianceReport?.varianceDrivers || []).map((v: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-slate-50/70 rounded-xl border border-slate-200 text-xs">
                      <span className="font-semibold text-gray-800">{v.reason}</span>
                      <span className={`font-mono font-bold ${v.impact.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {v.impact}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tabular Salary Register */}
          {reportSubTab === 'register' && (
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Comprehensive Salary Register</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Component-wise payroll sheet with earnings and statutory deductions</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-xs">
                  <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-[10px] tracking-wider">
                    <tr>
                      <th className="px-4 py-3 text-left">Emp Code</th>
                      <th className="px-4 py-3 text-left">Employee Name</th>
                      <th className="px-4 py-3 text-left">Basic</th>
                      <th className="px-4 py-3 text-left">HRA</th>
                      <th className="px-4 py-3 text-left">Spl Allow</th>
                      <th className="px-4 py-3 text-left">OT / Inc</th>
                      <th className="px-4 py-3 text-left">Gross</th>
                      <th className="px-4 py-3 text-left">EPF</th>
                      <th className="px-4 py-3 text-left">ESI</th>
                      <th className="px-4 py-3 text-left">PT</th>
                      <th className="px-4 py-3 text-left">TDS</th>
                      <th className="px-4 py-3 text-left">Loan EMI</th>
                      <th className="px-4 py-3 text-left">Reimb</th>
                      <th className="px-4 py-3 text-left">Net Salary</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {payslips.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-gray-900">{p.userId}</td>
                        <td className="px-4 py-3 font-semibold text-gray-900">{p.employeeName}</td>
                        <td className="px-4 py-3 font-mono">₹{(p.earnings?.basic || 0).toLocaleString('en-IN')}</td>
                        <td className="px-4 py-3 font-mono">₹{(p.earnings?.hra || 0).toLocaleString('en-IN')}</td>
                        <td className="px-4 py-3 font-mono">₹{(p.earnings?.specialAllowance || 0).toLocaleString('en-IN')}</td>
                        <td className="px-4 py-3 font-mono">₹{((p.earnings?.overtimePay || 0) + (p.earnings?.incentives || 0)).toLocaleString('en-IN')}</td>
                        <td className="px-4 py-3 font-mono font-bold text-gray-900">₹{(p.earnings?.totalGrossEarnings || 0).toLocaleString('en-IN')}</td>
                        <td className="px-4 py-3 font-mono text-rose-600">₹{(p.deductions?.epf || 0).toLocaleString('en-IN')}</td>
                        <td className="px-4 py-3 font-mono text-rose-600">₹{(p.deductions?.esi || 0).toLocaleString('en-IN')}</td>
                        <td className="px-4 py-3 font-mono text-rose-600">₹{(p.deductions?.professionalTax || 0).toLocaleString('en-IN')}</td>
                        <td className="px-4 py-3 font-mono text-rose-600">₹{(p.deductions?.tds || 0).toLocaleString('en-IN')}</td>
                        <td className="px-4 py-3 font-mono text-amber-600">₹{(p.deductions?.loanEMI || 0).toLocaleString('en-IN')}</td>
                        <td className="px-4 py-3 font-mono text-blue-600">₹{(p.reimbursements || 0).toLocaleString('en-IN')}</td>
                        <td className="px-4 py-3 font-mono font-extrabold text-emerald-600">₹{(p.netSalary || 0).toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Bank Payment Advice */}
          {reportSubTab === 'bank_advice' && (
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Bank Transfer Payment Advice</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Corporate Net Banking upload format for automated NEFT batch clearing</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-xs">
                  <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-[10px] tracking-wider">
                    <tr>
                      <th className="px-5 py-3.5 text-left">Beneficiary Name</th>
                      <th className="px-5 py-3.5 text-left">Bank Name</th>
                      <th className="px-5 py-3.5 text-left">Account Number</th>
                      <th className="px-5 py-3.5 text-left">IFSC Code</th>
                      <th className="px-5 py-3.5 text-left">Amount</th>
                      <th className="px-5 py-3.5 text-left">Payment Mode</th>
                      <th className="px-5 py-3.5 text-left">Narration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {payslips.map((p, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-3.5 font-bold text-gray-900">{p.employeeName}</td>
                        <td className="px-5 py-3.5 text-gray-700">{p.bankName}</td>
                        <td className="px-5 py-3.5 font-mono text-gray-900">{p.accountNumber}</td>
                        <td className="px-5 py-3.5 font-mono text-gray-600">{p.ifscCode}</td>
                        <td className="px-5 py-3.5 font-mono font-extrabold text-emerald-600">₹{(p.netSalary || 0).toLocaleString('en-IN')}</td>
                        <td className="px-5 py-3.5"><span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded">NEFT</span></td>
                        <td className="px-5 py-3.5 text-gray-400 font-mono text-[11px]">SALARY SEP 2026 {p.userId}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 8: ACCOUNTS JV (JOURNAL VOUCHER) */}
      {/* ======================================================== */}
      {activeTab === 'jv' && (
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold bg-teal-50 text-teal-700 px-2.5 py-1 rounded-lg">
                  {jvData?.voucherNumber || 'JV-PAY-2026-09'}
                </span>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                  jvData?.status === 'Posted to ERP GL'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {jvData?.status || 'Draft'}
                </span>
              </div>
              <h3 className="text-base font-bold text-gray-900 mt-2">Payroll Accounting Journal Voucher (JV)</h3>
              <p className="text-xs text-gray-500 mt-0.5">Automated balanced double-entry accounting for ERP General Ledger</p>
            </div>

            <div className="flex items-center gap-3">
              {jvData?.status !== 'Posted to ERP GL' && (
                <button
                  onClick={handlePostJV}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Post to ERP General Ledger
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="px-5 py-3.5 text-left">GL Code</th>
                  <th className="px-5 py-3.5 text-left">General Ledger Account Name</th>
                  <th className="px-5 py-3.5 text-left">Cost Center</th>
                  <th className="px-5 py-3.5 text-left">Description</th>
                  <th className="px-5 py-3.5 text-right">Debit (₹)</th>
                  <th className="px-5 py-3.5 text-right">Credit (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {(jvData?.lineItems || []).map((item: any, idx: number) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-gray-900">{item.glCode}</td>
                    <td className="px-5 py-3.5 font-bold text-gray-900">{item.accountName}</td>
                    <td className="px-5 py-3.5 text-gray-600">{item.costCenter}</td>
                    <td className="px-5 py-3.5 text-gray-500">{item.description}</td>
                    <td className="px-5 py-3.5 font-mono font-bold text-right text-gray-900">
                      {item.debit > 0 ? `₹${item.debit.toLocaleString('en-IN')}` : '-'}
                    </td>
                    <td className="px-5 py-3.5 font-mono font-bold text-right text-gray-900">
                      {item.credit > 0 ? `₹${item.credit.toLocaleString('en-IN')}` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 font-bold text-gray-900 border-t-2 border-gray-200">
                <tr>
                  <td colSpan={4} className="px-5 py-4 text-right uppercase text-[11px] tracking-wider">
                    Voucher Total (Balanced):
                  </td>
                  <td className="px-5 py-4 text-right font-mono text-sm text-teal-700">
                    ₹{(jvData?.totalDebit || 0).toLocaleString('en-IN')}
                  </td>
                  <td className="px-5 py-4 text-right font-mono text-sm text-teal-700">
                    ₹{(jvData?.totalCredit || 0).toLocaleString('en-IN')}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 9: PAYOUT AND DISBURSEMENT */}
      {/* ======================================================== */}
      {activeTab === 'disbursement' && (
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Corporate Bank Transfer & Payout Gateway Batches</h3>
              <p className="text-xs text-gray-400 mt-0.5">Automated batch execution, UTR transaction matching and settlement tracking</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="px-5 py-3.5 text-left">Batch ID</th>
                  <th className="px-5 py-3.5 text-left">Batch Name & Month</th>
                  <th className="px-5 py-3.5 text-left">Corporate Account</th>
                  <th className="px-5 py-3.5 text-left">Staff Count</th>
                  <th className="px-5 py-3.5 text-left">Total Amount</th>
                  <th className="px-5 py-3.5 text-left">UTR / Reference</th>
                  <th className="px-5 py-3.5 text-left">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {disbursements.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center text-gray-400">
                      No disbursement batches created. Click "Create Bank Batch" above to bundle the finalized payroll.
                    </td>
                  </tr>
                ) : (
                  disbursements.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3.5 font-mono font-bold text-gray-900">
                        {b.id}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-gray-900">{b.batchName}</div>
                        <div className="text-[10px] text-gray-400">{b.month}</div>
                      </td>
                      <td className="px-5 py-3.5 text-gray-700 font-mono">
                        {b.corporateAccount}
                      </td>
                      <td className="px-5 py-3.5 font-bold text-gray-900">
                        {b.totalEmployees} Employees
                      </td>
                      <td className="px-5 py-3.5 font-mono font-extrabold text-emerald-600 text-sm">
                        ₹{b.totalAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-gray-600">
                        {b.utrNumber ? (
                          <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold">
                            {b.utrNumber}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">Pending Gateway Release</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            b.status === 'Disbursed & Settled'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {b.status !== 'Disbursed & Settled' && (
                          <button
                            onClick={() => handleProcessDisbursement(b.id)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-xs transition-all cursor-pointer"
                          >
                            Disburse via Gateway
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* DETAILED VISUAL PAYSLIP MODAL */}
      {/* ======================================================== */}
      {selectedPayslip && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 max-h-[95vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-teal-50 text-teal-700 rounded-xl">
                  <Building className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-gray-900 tracking-tight">Athena Technologies Private Limited</h3>
                  <p className="text-xs text-gray-500 font-medium">Monthly Confidential Salary Statement • {selectedPayslip.month}</p>
                </div>
              </div>
              <button onClick={() => setSelectedPayslip(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Payslip Sheet */}
            <div className="flex-1 overflow-y-auto py-4 space-y-5 text-xs text-gray-700">
              {/* Employee Summary Card */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-semibold">Employee Name</span>
                  <div className="font-bold text-gray-900">{selectedPayslip.employeeName}</div>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-semibold">Employee ID</span>
                  <div className="font-mono font-bold text-gray-900">{selectedPayslip.userId}</div>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-semibold">Department</span>
                  <div className="font-medium text-gray-800">{selectedPayslip.department}</div>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-semibold">Designation</span>
                  <div className="font-medium text-gray-800">{selectedPayslip.designation}</div>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-semibold">Permanent A/C (PAN)</span>
                  <div className="font-mono font-bold text-gray-900">{selectedPayslip.pan}</div>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-semibold">Provident Fund (UAN)</span>
                  <div className="font-mono font-bold text-gray-900">{selectedPayslip.uan}</div>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-semibold">Bank & Account</span>
                  <div className="font-mono text-gray-800">{selectedPayslip.bankName} - {selectedPayslip.accountNumber}</div>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-semibold">Income Tax Regime</span>
                  <div className="font-bold text-teal-700">{selectedPayslip.taxRegime}</div>
                </div>
              </div>

              {/* Attendance Strip */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs font-medium">
                <div>Total Days: <strong>30</strong></div>
                <div>Working Days: <strong>22</strong></div>
                <div>Paid Days: <strong>22</strong></div>
                <div>Loss of Pay: <strong className="text-rose-600">0</strong></div>
                <div>Overtime Hours: <strong className="text-teal-700">{selectedPayslip.attendance?.overtimeHours || 0} hrs</strong></div>
              </div>

              {/* Earnings & Deductions Tables */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Earnings Table */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-emerald-50/70 px-4 py-2 border-b border-gray-200 font-bold text-emerald-800 flex justify-between">
                    <span>Earnings (Components)</span>
                    <span>Amount (₹)</span>
                  </div>
                  <div className="p-3 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Basic Salary</span>
                      <span className="font-mono font-semibold">₹{(selectedPayslip.earnings?.basic || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">House Rent Allowance (HRA)</span>
                      <span className="font-mono font-semibold">₹{(selectedPayslip.earnings?.hra || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Special Allowance</span>
                      <span className="font-mono font-semibold">₹{(selectedPayslip.earnings?.specialAllowance || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Conveyance Allowance</span>
                      <span className="font-mono font-semibold">₹{(selectedPayslip.earnings?.conveyance || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Medical Allowance</span>
                      <span className="font-mono font-semibold">₹{(selectedPayslip.earnings?.medical || 0).toLocaleString('en-IN')}</span>
                    </div>
                    {selectedPayslip.earnings?.overtimePay > 0 && (
                      <div className="flex justify-between text-indigo-700">
                        <span>Overtime Pay</span>
                        <span className="font-mono font-semibold">₹{(selectedPayslip.earnings?.overtimePay || 0).toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    {selectedPayslip.earnings?.incentives > 0 && (
                      <div className="flex justify-between text-indigo-700">
                        <span>Performance Incentive</span>
                        <span className="font-mono font-semibold">₹{(selectedPayslip.earnings?.incentives || 0).toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-gray-200 flex justify-between font-bold text-gray-900">
                      <span>Total Gross Earnings</span>
                      <span className="font-mono text-emerald-700">₹{(selectedPayslip.earnings?.totalGrossEarnings || 0).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* Deductions Table */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-rose-50/70 px-4 py-2 border-b border-gray-200 font-bold text-rose-800 flex justify-between">
                    <span>Deductions & Recoveries</span>
                    <span>Amount (₹)</span>
                  </div>
                  <div className="p-3 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Employee Provident Fund (EPF 12%)</span>
                      <span className="font-mono font-semibold text-rose-600">₹{(selectedPayslip.deductions?.epf || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Employee State Insurance (ESI 0.75%)</span>
                      <span className="font-mono font-semibold text-rose-600">₹{(selectedPayslip.deductions?.esi || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Professional Tax (PT)</span>
                      <span className="font-mono font-semibold text-rose-600">₹{(selectedPayslip.deductions?.professionalTax || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Income Tax (TDS Sec 192)</span>
                      <span className="font-mono font-semibold text-rose-600">₹{(selectedPayslip.deductions?.tds || 0).toLocaleString('en-IN')}</span>
                    </div>
                    {selectedPayslip.deductions?.loanEMI > 0 && (
                      <div className="flex justify-between text-amber-700">
                        <span>Staff Loan EMI Recovery</span>
                        <span className="font-mono font-semibold">₹{(selectedPayslip.deductions?.loanEMI || 0).toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-gray-200 flex justify-between font-bold text-gray-900">
                      <span>Total Deductions</span>
                      <span className="font-mono text-rose-600">₹{(selectedPayslip.deductions?.totalDeductions || 0).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Net Salary Banner */}
              <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Net Salary Take-Home</span>
                  <div className="text-2xl font-extrabold text-emerald-700 font-mono">
                    ₹{selectedPayslip.netSalary.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[11px] text-emerald-600 italic mt-0.5">
                    ({selectedPayslip.netSalaryWords || 'Rupees Only'})
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-white/80 px-3 py-1.5 rounded-xl border border-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Electronically Signed & Verified</span>
                  </div>
                  <div className="text-[10px] text-gray-400 font-mono mt-1">{selectedPayslip.digitalSignature}</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
              <button
                onClick={() => handleDeletePayslip(selectedPayslip.id)}
                className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                Delete Payslip
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  Print / Save PDF
                </button>
                <button
                  onClick={() => {
                    handleDistributePayslip(selectedPayslip.id);
                    setSelectedPayslip(null);
                  }}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  Email to Employee
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: GENERATE PAYSLIP */}
      {/* ======================================================== */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-teal-50 text-teal-600 rounded-xl">
                  <DollarSign className="w-5 h-5" />
                </span>
                <h3 className="text-base font-bold text-gray-900">Generate Monthly Payslip</h3>
              </div>
              <button onClick={() => setShowGenerateModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGeneratePayslip} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Employee *</label>
                  <select
                    value={payslipForm.userId}
                    onChange={(e) => {
                      const emp = employees.find(x => x.id === e.target.value);
                      setPayslipForm({
                        ...payslipForm,
                        userId: e.target.value,
                        employeeName: emp?.name || '',
                        baseSalary: emp?.employeeDetail?.baseSalary || 75000
                      });
                    }}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none bg-white"
                  >
                    {employees.map(e => (
                      <option key={e.id} value={e.id}>{e.name} ({e.department || 'General'})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Payroll Cycle Month *</label>
                  <input
                    type="text"
                    required
                    value={payslipForm.month}
                    onChange={(e) => setPayslipForm({ ...payslipForm, month: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Base Salary (₹) *</label>
                  <input
                    type="number"
                    required
                    value={payslipForm.baseSalary}
                    onChange={(e) => setPayslipForm({ ...payslipForm, baseSalary: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Allowances (₹)</label>
                  <input
                    type="number"
                    value={payslipForm.allowances}
                    onChange={(e) => setPayslipForm({ ...payslipForm, allowances: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Performance Incentives (₹)</label>
                  <input
                    type="number"
                    value={payslipForm.incentives}
                    onChange={(e) => setPayslipForm({ ...payslipForm, incentives: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Overtime Pay (₹)</label>
                  <input
                    type="number"
                    value={payslipForm.overtimePay}
                    onChange={(e) => setPayslipForm({ ...payslipForm, overtimePay: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Loan EMI Deductions (₹)</label>
                  <input
                    type="number"
                    value={payslipForm.loansAdvances}
                    onChange={(e) => setPayslipForm({ ...payslipForm, loansAdvances: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  Calculate & Finalize
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: CONFIGURE SALARY STRUCTURE */}
      {/* ======================================================== */}
      {showStructureModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-teal-50 text-teal-600 rounded-xl">
                  <Sliders className="w-5 h-5" />
                </span>
                <h3 className="text-base font-bold text-gray-900">{editingStructure ? "Edit Salary Structure Template" : "Create Salary Structure Template"}</h3>
              </div>
              <button onClick={() => setShowStructureModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStructure} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Structure Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ENG-ADVANCED"
                    value={structureForm.code}
                    onChange={(e) => setStructureForm({ ...structureForm, code: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Structure Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lead Engineer Compensation"
                    value={structureForm.name}
                    onChange={(e) => setStructureForm({ ...structureForm, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={structureForm.description}
                  onChange={(e) => setStructureForm({ ...structureForm, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Basic (% of CTC)</label>
                  <input
                    type="number"
                    value={structureForm.basicPercent}
                    onChange={(e) => setStructureForm({ ...structureForm, basicPercent: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">HRA (% of Basic)</label>
                  <input
                    type="number"
                    value={structureForm.hraPercentOfBasic}
                    onChange={(e) => setStructureForm({ ...structureForm, hraPercentOfBasic: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Conveyance (Fixed ₹)</label>
                  <input
                    type="number"
                    value={structureForm.conveyanceFixed}
                    onChange={(e) => setStructureForm({ ...structureForm, conveyanceFixed: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Applicable Bands (Comma Separated)</label>
                <input
                  type="text"
                  value={structureForm.applicableBands}
                  onChange={(e) => setStructureForm({ ...structureForm, applicableBands: e.target.value })}
                  placeholder="L3, L4, Senior Specialist, Tech Lead"
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowStructureModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  Save Structure Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: APPLY FOR LOAN / ADVANCE */}
      {/* ======================================================== */}
      {showLoanModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-teal-50 text-teal-600 rounded-xl">
                  <Wallet className="w-5 h-5" />
                </span>
                <h3 className="text-base font-bold text-gray-900">{editingLoan ? "Edit Staff Loan / Advance" : "Grant Staff Loan / Salary Advance"}</h3>
              </div>
              <button onClick={() => setShowLoanModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLoan} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Employee *</label>
                <select
                  value={loanForm.employeeId}
                  onChange={(e) => {
                    const emp = employees.find(x => x.id === e.target.value);
                    setLoanForm({
                      ...loanForm,
                      employeeId: e.target.value,
                      employeeName: emp?.name || '',
                      department: emp?.department || 'Engineering'
                    });
                  }}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none bg-white"
                >
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.name} ({e.department || 'General'})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Loan / Advance Type *</label>
                <select
                  value={loanForm.type}
                  onChange={(e) => setLoanForm({ ...loanForm, type: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none bg-white"
                >
                  <option value="Emergency Medical Loan">Emergency Medical Loan (0% Interest)</option>
                  <option value="Festival Advance (Zero Interest)">Festival Advance (Zero Interest)</option>
                  <option value="Laptop & Tech Grant Loan">Laptop & Tech Grant Loan</option>
                  <option value="Home Relocation Assistance">Home Relocation Assistance</option>
                  <option value="General Salary Advance">General Salary Advance (1-3 Mo)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Principal Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    value={loanForm.principal}
                    onChange={(e) => setLoanForm({ ...loanForm, principal: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Tenure (Months) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={36}
                    value={loanForm.tenureMonths}
                    onChange={(e) => setLoanForm({ ...loanForm, tenureMonths: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Reason / Purpose</label>
                <input
                  type="text"
                  value={loanForm.reason}
                  onChange={(e) => setLoanForm({ ...loanForm, reason: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex justify-between text-xs font-medium">
                <span className="text-gray-600">Calculated Monthly EMI:</span>
                <span className="font-bold text-indigo-700 font-mono">
                  ₹{Math.round(loanForm.principal / (loanForm.tenureMonths || 1)).toLocaleString('en-IN')} / mo
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowLoanModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  Approve & Disburse
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: SUBMIT REIMBURSEMENT CLAIM */}
      {/* ======================================================== */}
      {showReimbursementModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-teal-50 text-teal-600 rounded-xl">
                  <Receipt className="w-5 h-5" />
                </span>
                <h3 className="text-base font-bold text-gray-900">{editingReimbursement ? "Edit Reimbursement Claim" : "Submit Reimbursement Claim"}</h3>
              </div>
              <button onClick={() => setShowReimbursementModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReimbursement} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Employee *</label>
                <select
                  value={reimbursementForm.employeeId}
                  onChange={(e) => {
                    const emp = employees.find(x => x.id === e.target.value);
                    setReimbursementForm({
                      ...reimbursementForm,
                      employeeId: e.target.value,
                      employeeName: emp?.name || '',
                      department: emp?.department || 'Engineering'
                    });
                  }}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none bg-white"
                >
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.name} ({e.department || 'General'})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Expense Category *</label>
                <select
                  value={reimbursementForm.category}
                  onChange={(e) => setReimbursementForm({ ...reimbursementForm, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none bg-white"
                >
                  <option value="Broadband & High-Speed Mobile Data">Broadband & Mobile Data</option>
                  <option value="AWS Cloud Certification & Books">Upskilling & Certifications</option>
                  <option value="Client Dinner & Partner Hospitality">Client Entertainment & Dinner</option>
                  <option value="Fuel, Cab & Travel Per Diem">Fuel & Local Conveyance</option>
                  <option value="Executive Health Checkup">Preventative Health Checkup</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Bill / Invoice No *</label>
                  <input
                    type="text"
                    required
                    placeholder="INV-12345"
                    value={reimbursementForm.billNumber}
                    onChange={(e) => setReimbursementForm({ ...reimbursementForm, billNumber: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    value={reimbursementForm.billAmount}
                    onChange={(e) => setReimbursementForm({ ...reimbursementForm, billAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="taxExemptCheck"
                  checked={reimbursementForm.taxExempt}
                  onChange={(e) => setReimbursementForm({ ...reimbursementForm, taxExempt: e.target.checked })}
                  className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500 cursor-pointer"
                />
                <label htmlFor="taxExemptCheck" className="text-xs font-bold text-gray-700 cursor-pointer">
                  Claim is fully tax-exempt against legitimate GST invoice
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowReimbursementModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  Verify & Submit Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: NEW FBP DECLARATION */}
      {/* ======================================================== */}
      {showFBPModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-teal-50 text-teal-600 rounded-xl">
                  <Percent className="w-5 h-5" />
                </span>
                <h3 className="text-base font-bold text-gray-900">Declare Flexible Benefits Basket (FBP)</h3>
              </div>
              <button onClick={() => setShowFBPModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFBPDeclaration} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Employee *</label>
                <select
                  value={fbpForm.employeeId}
                  onChange={(e) => {
                    const emp = employees.find(x => x.id === e.target.value);
                    setFbpForm({
                      ...fbpForm,
                      employeeId: e.target.value,
                      employeeName: emp?.name || ''
                    });
                  }}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none bg-white"
                >
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.name} ({e.department || 'General'})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Annual Flexi Pool Entitlement (₹) *</label>
                <input
                  type="number"
                  value={fbpForm.annualFlexiPool}
                  onChange={(e) => setFbpForm({ ...fbpForm, annualFlexiPool: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none font-mono"
                />
              </div>

              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Monthly Allocations</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600">NPS Tier 1 (₹/mo)</label>
                    <input
                      type="number"
                      value={fbpForm.allocations.nps}
                      onChange={(e) => setFbpForm({ ...fbpForm, allocations: { ...fbpForm.allocations, nps: Number(e.target.value) } })}
                      className="w-full px-2 py-1.5 border rounded-lg text-xs bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600">Meal Card (Max ₹2,600)</label>
                    <input
                      type="number"
                      value={fbpForm.allocations.meal}
                      onChange={(e) => setFbpForm({ ...fbpForm, allocations: { ...fbpForm.allocations, meal: Number(e.target.value) } })}
                      className="w-full px-2 py-1.5 border rounded-lg text-xs bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600">Fuel & Motor Allowance</label>
                    <input
                      type="number"
                      value={fbpForm.allocations.fuel}
                      onChange={(e) => setFbpForm({ ...fbpForm, allocations: { ...fbpForm.allocations, fuel: Number(e.target.value) } })}
                      className="w-full px-2 py-1.5 border rounded-lg text-xs bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600">Telephone / Broadband</label>
                    <input
                      type="number"
                      value={fbpForm.allocations.phone}
                      onChange={(e) => setFbpForm({ ...fbpForm, allocations: { ...fbpForm.allocations, phone: Number(e.target.value) } })}
                      className="w-full px-2 py-1.5 border rounded-lg text-xs bg-white font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowFBPModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  Save Declaration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: EPFO ECR CHALLAN TEXT */}
      {/* ======================================================== */}
      {ecrModalData && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Landmark className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Generated EPFO Electronic Challan cum Return (ECR)</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Establishment: {ecrModalData.establishmentId} • {ecrModalData.totalMembers} Members</p>
                </div>
              </div>
              <button onClick={() => setEcrModalData(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
              <pre className="bg-gray-900 text-emerald-400 p-4 rounded-xl text-[11px] font-mono whitespace-pre-wrap leading-relaxed">
                {ecrModalData.rawText || 'No active members with PF eligible wages'}
              </pre>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
              <span className="text-[11px] text-gray-400">Ready for EPFO Unified Portal monthly upload</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(ecrModalData.rawText);
                  showToast('ECR raw file content copied to clipboard!');
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-4 h-4" />
                Copy ECR Text
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: FORM 24Q SUMMARY */}
      {/* ======================================================== */}
      {form24QData && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                  <FileText className="w-5 h-5" />
                </span>
                <h3 className="text-base font-bold text-gray-900">Form 24Q TDS Quarterly Statement</h3>
              </div>
              <button onClick={() => setForm24QData(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100 space-y-2">
                <div className="flex justify-between font-medium">
                  <span className="text-gray-600">Deductor TAN:</span>
                  <span className="font-mono font-bold text-gray-900">{form24QData.tan}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-gray-600">Company Name:</span>
                  <span className="font-bold text-gray-900">{form24QData.deductor}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-gray-600">Quarter:</span>
                  <span className="font-mono font-bold text-purple-700">{form24QData.quarter}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-gray-600">Total Deductees:</span>
                  <span className="font-bold text-gray-900">{form24QData.totalDeductees} Employees</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-gray-600">Quarterly TDS Deposited:</span>
                  <span className="font-mono font-extrabold text-emerald-700">₹{(form24QData.totalTdsDeposited || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-gray-600">Challan BSR Code:</span>
                  <span className="font-mono text-gray-900">{form24QData.challanBSRCode}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setForm24QData(null)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Close Summary
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold z-50 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: EDIT PAYSLIP FINANCIALS */}
      {/* ======================================================== */}
      {showEditPayslipModal && editingPayslip && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-teal-50 text-teal-600 rounded-xl">
                  <Pencil className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Edit Payslip Financials</h3>
                  <p className="text-xs text-gray-500">{editingPayslip.employeeName} • {editingPayslip.month}</p>
                </div>
              </div>
              <button onClick={() => setShowEditPayslipModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditPayslip} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Base Salary (₹)</label>
                  <input
                    type="number"
                    required
                    value={editPayslipForm.baseSalary}
                    onChange={(e) => setEditPayslipForm({ ...editPayslipForm, baseSalary: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Allowances (₹)</label>
                  <input
                    type="number"
                    value={editPayslipForm.allowances}
                    onChange={(e) => setEditPayslipForm({ ...editPayslipForm, allowances: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Incentives / Bonus (₹)</label>
                  <input
                    type="number"
                    value={editPayslipForm.incentives}
                    onChange={(e) => setEditPayslipForm({ ...editPayslipForm, incentives: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Reimbursements (₹)</label>
                  <input
                    type="number"
                    value={editPayslipForm.reimbursements}
                    onChange={(e) => setEditPayslipForm({ ...editPayslipForm, reimbursements: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-rose-700 mb-1">Total Statutory & Tax Deductions (₹)</label>
                <input
                  type="number"
                  value={editPayslipForm.deductions}
                  onChange={(e) => setEditPayslipForm({ ...editPayslipForm, deductions: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-rose-200 bg-rose-50/40 rounded-xl font-mono font-bold text-rose-700"
                />
              </div>

              <div className="p-3 bg-teal-50/70 border border-teal-100 rounded-xl flex justify-between items-center font-bold">
                <span className="text-teal-800">Recalculated Net Pay:</span>
                <span className="text-sm font-mono text-teal-900">
                  ₹{(
                    Number(editPayslipForm.baseSalary) +
                    Number(editPayslipForm.allowances) +
                    Number(editPayslipForm.incentives) +
                    Number(editPayslipForm.reimbursements) -
                    Number(editPayslipForm.deductions)
                  ).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowEditPayslipModal(false)}
                  className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Save &amp; Recalculate Payslip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
