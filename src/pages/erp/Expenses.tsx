import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Receipt, 
  Plus, 
  Sparkles, 
  Filter, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Building, 
  Calendar, 
  DollarSign, 
  CreditCard, 
  Send, 
  FileText, 
  ChevronRight, 
  Car, 
  Plane, 
  Users, 
  ShieldCheck, 
  Wallet, 
  ArrowRight, 
  Check, 
  Eye, 
  Printer, 
  Layers, 
  Sliders, 
  Landmark, 
  QrCode,
  Compass,
  ArrowUpRight,
  Clock,
  Briefcase,
  Coffee,
  FileCheck2,
  Lock,
  UserCheck,
  Trash2,
  Pencil
} from 'lucide-react';
import ERPNavigation from '../../components/ERPNavigation';

export default function Expenses() {
  const [activeTab, setActiveTab] = useState<'claims' | 'heads' | 'advances' | 'approvals' | 'batches'>('claims');

  // Main collections
  const [claims, setClaims] = useState<any[]>([]);
  const [claimHeads, setClaimHeads] = useState<any[]>([]);
  const [advances, setAdvances] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [approvalPolicy, setApprovalPolicy] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [showFormSelectorModal, setShowFormSelectorModal] = useState(false);
  const [activeFormType, setActiveFormType] = useState<'General' | 'TravelTour' | 'Mileage' | 'ClientEntertainment' | null>(null);
  const [selectedClaimDetail, setSelectedClaimDetail] = useState<any | null>(null);
  // Universal Edit State for Expenses
  const [showEditClaimModal, setShowEditClaimModal] = useState(false);
  const [editingClaim, setEditingClaim] = useState<any>(null);
  const [editClaimForm, setEditClaimForm] = useState({ title: '', claimCategory: '', totalAmount: 0, status: 'Draft' });

  const [showEditHeadModal, setShowEditHeadModal] = useState(false);
  const [editingHead, setEditingHead] = useState<any>(null);
  const [editHeadForm, setEditHeadForm] = useState({ name: '', code: '', monthlyLimit: 0, requiresReceipt: true, isTaxDeductible: true });

  const [showEditAdvanceModal, setShowEditAdvanceModal] = useState(false);
  const [editingAdvance, setEditingAdvance] = useState<any>(null);
  const [editAdvanceForm, setEditAdvanceForm] = useState({ purpose: '', destination: '', amountRequested: 0, status: 'Pending Approval' });

  const [showEditBatchModal, setShowEditBatchModal] = useState(false);
  const [editingBatch, setEditingBatch] = useState<any>(null);
  const [editBatchForm, setEditBatchForm] = useState({ paymentMode: 'Direct Bank Transfer', notes: '' });

  const [showHeadModal, setShowHeadModal] = useState(false);
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState<{ claimId?: string; batchId?: string } | null>(null);
  const [approvalActionModal, setApprovalActionModal] = useState<{ claim: any; action: 'Approve' | 'Reject' | 'Return' } | null>(null);
  const [approvalComment, setApprovalComment] = useState('');

  // Forms state
  const [generalForm, setGeneralForm] = useState({
    employeeId: 'EMP-101',
    employeeName: 'Rajesh Kumar',
    department: 'Technology & Engineering',
    title: '',
    claimHead: 'Office Supplies, Print & Consumables',
    merchant: '',
    invoiceNumber: '',
    expenseDate: new Date().toISOString().split('T')[0],
    totalAmount: 5000,
    taxAmount: 900,
    remarks: ''
  });

  const [travelForm, setTravelForm] = useState({
    employeeId: 'EMP-101',
    employeeName: 'Rajesh Kumar',
    department: 'Technology & Engineering',
    title: 'Client Tour & Onsite Deployment',
    claimHead: 'Air & Intercity Rail Travel',
    origin: 'Bangalore (BLR)',
    destination: 'Mumbai (BOM)',
    departureDate: new Date().toISOString().split('T')[0],
    returnDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
    transportCost: 12000,
    lodgingCost: 10000,
    perDiemCost: 4000,
    linkedAdvanceId: '',
    remarks: 'Customer executive demonstration and sprint planning'
  });

  const [mileageForm, setMileageForm] = useState({
    employeeId: 'EMP-103',
    employeeName: 'Amit Verma',
    department: 'Operations & Logistics',
    title: 'Regional Warehouse Audit Mileage',
    claimHead: 'Personal Vehicle Mileage Log',
    vehicleType: 'Car (Four-Wheeler)',
    ratePerKm: 12,
    totalKm: 250,
    startLocation: 'Central Operations Hub',
    endLocation: 'Hosur Manufacturing Facility',
    expenseDate: new Date().toISOString().split('T')[0],
    remarks: 'Monthly physical stock inspection'
  });

  const [entertainmentForm, setEntertainmentForm] = useState({
    employeeId: 'EMP-102',
    employeeName: 'Ananya Sharma',
    department: 'Product & Design',
    title: 'Enterprise Client Partnership Dinner',
    claimHead: 'Client Hospitality & Entertainment',
    clientCompany: 'Global Fintech Partners Corp',
    attendeesCount: 4,
    attendeeNames: 'Ananya Sharma, Rohan Gupta, David Miller, Alex Vance',
    businessJustification: 'Q4 Contract renewal and AI modules partnership discussion',
    merchant: 'The Leela Palace Bangalore',
    invoiceNumber: 'LEELA-INV-9941',
    expenseDate: new Date().toISOString().split('T')[0],
    totalAmount: 14500,
    taxAmount: 2610,
    remarks: 'Approved executive dinner'
  });

  const [headForm, setHeadForm] = useState({
    code: '',
    name: '',
    category: 'General Operations',
    glCode: '60900',
    maxLimit: 15000,
    receiptRequired: true,
    gstInputCreditEligible: true,
    requiresApprovalAbove: 5000,
    description: ''
  });

  const [advanceForm, setAdvanceForm] = useState({
    employeeId: 'EMP-101',
    employeeName: 'Rajesh Kumar',
    department: 'Technology & Engineering',
    tourPurpose: 'Customer Architecture Deployment',
    destination: 'New Delhi (NCR)',
    departureDate: new Date().toISOString().split('T')[0],
    returnDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    requestedAmount: 18000,
    reason: 'Onsite deployment with government client team'
  });

  const [paymentExecutionForm, setPaymentExecutionForm] = useState({
    paymentMode: 'Corporate Bank Transfer (NEFT / RTGS)',
    paymentReference: '',
    paymentAccount: 'HDFC Corporate Operating A/C - 5020001892140'
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

  const fetchData = async () => {
    try {
      const [claimsRes, headsRes, advancesRes, batchesRes, policyRes, empRes] = await Promise.all([
        axios.get(`${API_URL}/api/erp/expenses/claims`),
        axios.get(`${API_URL}/api/erp/expenses/heads`).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/api/erp/expenses/advances`).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/api/erp/expenses/batches`).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/api/erp/expenses/approval-policy`).catch(() => ({ data: null })),
        axios.get(`${API_URL}/api/hem/employees`).catch(() => ({ data: [] }))
      ]);

      setClaims(claimsRes.data || []);
      setClaimHeads(headsRes.data || []);
      setAdvances(advancesRes.data || []);
      setBatches(batchesRes.data || []);
      setApprovalPolicy(policyRes.data);
      setEmployees(empRes.data || []);

      if (empRes.data && empRes.data.length > 0) {
        const first = empRes.data[0];
        setGeneralForm(prev => ({ ...prev, employeeId: first.id, employeeName: first.name }));
        setTravelForm(prev => ({ ...prev, employeeId: first.id, employeeName: first.name }));
        setMileageForm(prev => ({ ...prev, employeeId: first.id, employeeName: first.name }));
        setEntertainmentForm(prev => ({ ...prev, employeeId: first.id, employeeName: first.name }));
        setAdvanceForm(prev => ({ ...prev, employeeId: first.id, employeeName: first.name }));
      }
    } catch (err) {
      console.error('Failed to fetch ERP expenses data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handlers
  const handleSimulateClaims = async () => {
    try {
      await axios.post(`${API_URL}/api/erp/expenses/claims/simulate`);
      fetchData();
      showToast('Sample multi-form claims loaded into ledger!');
    } catch (err) {
      console.error(err);
    }
  };

  const handleSimulateAdvances = async () => {
    try {
      await axios.post(`${API_URL}/api/erp/expenses/advances/simulate`);
      fetchData();
      showToast('Sample tour advances loaded!');
    } catch (err) {
      console.error(err);
    }
  };

  // Edit Handlers for Expenses
  const handleOpenEditClaim = (clm: any) => {
    setEditingClaim(clm);
    setEditClaimForm({
      title: clm.title || '',
      claimCategory: clm.claimCategory || 'General',
      totalAmount: clm.totalAmount || 0,
      status: clm.status || 'Draft'
    });
    setShowEditClaimModal(true);
  };

  const handleEditClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClaim) return;
    try {
      await axios.put(`${API_URL}/api/erp/expenses/claims/${editingClaim.id}`, editClaimForm);
      setShowEditClaimModal(false);
      setToastMessage('Expense claim updated successfully!');
      fetchData();
    } catch (err) {
      alert('Failed to update expense claim');
    }
  };

  const handleOpenEditHead = (hd: any) => {
    setEditingHead(hd);
    setEditHeadForm({
      name: hd.name,
      code: hd.code,
      monthlyLimit: hd.monthlyLimit || 0,
      requiresReceipt: hd.requiresReceipt ?? true,
      isTaxDeductible: hd.isTaxDeductible ?? true
    });
    setShowEditHeadModal(true);
  };

  const handleEditHeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHead) return;
    try {
      await axios.put(`${API_URL}/api/erp/expenses/heads/${editingHead.id}`, editHeadForm);
      setShowEditHeadModal(false);
      setToastMessage('Expense head updated successfully!');
      fetchData();
    } catch (err) {
      alert('Failed to update expense head');
    }
  };

  const handleOpenEditAdvance = (adv: any) => {
    setEditingAdvance(adv);
    setEditAdvanceForm({
      purpose: adv.purpose,
      destination: adv.destination || '',
      amountRequested: adv.amountRequested || 0,
      status: adv.status || 'Pending Approval'
    });
    setShowEditAdvanceModal(true);
  };

  const handleEditAdvanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdvance) return;
    try {
      await axios.put(`${API_URL}/api/erp/expenses/advances/${editingAdvance.id}`, editAdvanceForm);
      setShowEditAdvanceModal(false);
      setToastMessage('Tour advance updated successfully!');
      fetchData();
    } catch (err) {
      alert('Failed to update tour advance');
    }
  };

  const handleOpenEditBatch = (b: any) => {
    setEditingBatch(b);
    setEditBatchForm({
      paymentMode: b.paymentMode || 'Direct Bank Transfer',
      notes: b.notes || ''
    });
    setShowEditBatchModal(true);
  };

  const handleEditBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBatch) return;
    try {
      await axios.put(`${API_URL}/api/erp/expenses/batches/${editingBatch.id}`, editBatchForm);
      setShowEditBatchModal(false);
      setToastMessage('Payment batch updated successfully!');
      fetchData();
    } catch (err) {
      alert('Failed to update payment batch');
    }
  };

  const handleDeleteClaim = async (id: string) => {
    if (!window.confirm(`Are you sure you want to delete expense claim ${id}?`)) return;
    try {
      await axios.delete(`${API_URL}/api/erp/expenses/claims/${id}`);
      if (selectedClaimDetail?.id === id) setSelectedClaimDetail(null);
      fetchData();
      showToast(`Expense claim ${id} deleted successfully!`);
    } catch (err) {
      console.error(err);
      alert('Failed to delete claim');
    }
  };

  const handleDeleteHead = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this expense claim head?')) return;
    try {
      await axios.delete(`${API_URL}/api/erp/expenses/heads/${id}`);
      fetchData();
      showToast('Expense claim head deleted!');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAdvance = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this tour advance?')) return;
    try {
      await axios.delete(`${API_URL}/api/erp/expenses/advances/${id}`);
      fetchData();
      showToast('Tour advance deleted!');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteBatch = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this payment batch?')) return;
    try {
      await axios.delete(`${API_URL}/api/erp/expenses/batches/${id}`);
      fetchData();
      showToast('Payment batch deleted and claims returned to ready queue!');
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateGeneralClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/erp/expenses/claims`, {
        formType: 'General',
        ...generalForm
      });
      setActiveFormType(null);
      fetchData();
      showToast('General expense claim submitted for approval!');
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTravelClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const gross = Number(travelForm.transportCost) + Number(travelForm.lodgingCost) + Number(travelForm.perDiemCost);
      await axios.post(`${API_URL}/api/erp/expenses/claims`, {
        formType: 'TravelTour',
        employeeId: travelForm.employeeId,
        employeeName: travelForm.employeeName,
        department: travelForm.department,
        title: travelForm.title,
        claimHead: travelForm.claimHead,
        claimHeadCode: 'TRAV-AIR',
        totalAmount: gross,
        taxAmount: Math.round(gross * 0.12),
        travelDetails: {
          origin: travelForm.origin,
          destination: travelForm.destination,
          departureDate: travelForm.departureDate,
          returnDate: travelForm.returnDate,
          transportCost: travelForm.transportCost,
          lodgingCost: travelForm.lodgingCost,
          perDiemCost: travelForm.perDiemCost
        },
        linkedAdvanceId: travelForm.linkedAdvanceId || null,
        remarks: travelForm.remarks
      });
      setActiveFormType(null);
      fetchData();
      showToast('Business travel & tour expense claim submitted with advance reconciliation!');
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateMileageClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const gross = Number(mileageForm.ratePerKm) * Number(mileageForm.totalKm);
      await axios.post(`${API_URL}/api/erp/expenses/claims`, {
        formType: 'Mileage',
        employeeId: mileageForm.employeeId,
        employeeName: mileageForm.employeeName,
        department: mileageForm.department,
        title: mileageForm.title,
        claimHead: mileageForm.claimHead,
        claimHeadCode: 'MILEAGE-VEH',
        totalAmount: gross,
        taxAmount: 0,
        mileageDetails: {
          vehicleType: mileageForm.vehicleType,
          ratePerKm: mileageForm.ratePerKm,
          totalKm: mileageForm.totalKm,
          startLocation: mileageForm.startLocation,
          endLocation: mileageForm.endLocation
        },
        remarks: mileageForm.remarks
      });
      setActiveFormType(null);
      fetchData();
      showToast('Personal vehicle mileage claim logged!');
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateEntertainmentClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/erp/expenses/claims`, {
        formType: 'ClientEntertainment',
        employeeId: entertainmentForm.employeeId,
        employeeName: entertainmentForm.employeeName,
        department: entertainmentForm.department,
        title: entertainmentForm.title,
        claimHead: entertainmentForm.claimHead,
        claimHeadCode: 'CLIENT-ENT',
        totalAmount: entertainmentForm.totalAmount,
        taxAmount: entertainmentForm.taxAmount,
        merchant: entertainmentForm.merchant,
        invoiceNumber: entertainmentForm.invoiceNumber,
        expenseDate: entertainmentForm.expenseDate,
        entertainmentDetails: {
          clientCompany: entertainmentForm.clientCompany,
          attendeesCount: entertainmentForm.attendeesCount,
          attendeeNames: entertainmentForm.attendeeNames,
          businessJustification: entertainmentForm.businessJustification
        },
        remarks: entertainmentForm.remarks
      });
      setActiveFormType(null);
      fetchData();
      showToast('Client entertainment claim submitted for approval!');
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateHead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/erp/expenses/heads`, headForm);
      setShowHeadModal(false);
      fetchData();
      showToast('New expense claim head configured!');
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateAdvance = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/erp/expenses/advances`, advanceForm);
      setShowAdvanceModal(false);
      fetchData();
      showToast('Tour advance request submitted for line manager review!');
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveAdvance = async (id: string, mode: string = 'Corporate Bank Transfer (NEFT)') => {
    try {
      await axios.put(`${API_URL}/api/erp/expenses/advances/${id}/status`, {
        status: 'Disbursed',
        paymentMode: mode
      });
      fetchData();
      showToast('Tour advance approved and cash voucher disbursed!');
    } catch (err) {
      console.error(err);
    }
  };

  const handleExecuteApproval = async () => {
    if (!approvalActionModal) return;
    try {
      await axios.put(`${API_URL}/api/erp/expenses/claims/${approvalActionModal.claim.id}/status`, {
        action: approvalActionModal.action,
        comments: approvalComment || 'Approval granted per ERP expense policy'
      });
      setApprovalActionModal(null);
      setApprovalComment('');
      fetchData();
      showToast(`Claim marked as ${approvalActionModal.action}d!`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreatePaymentBatch = async () => {
    try {
      await axios.post(`${API_URL}/api/erp/expenses/batches/create`);
      fetchData();
      showToast('New batch assembled from approved payment-ready claims!');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create batch');
    }
  };

  const handleDisburseBatch = async () => {
    if (!showPayModal || !showPayModal.batchId) return;
    try {
      await axios.post(`${API_URL}/api/erp/expenses/batches/${showPayModal.batchId}/disburse`, paymentExecutionForm);
      setShowPayModal(null);
      fetchData();
      showToast('Payment batch settled across accounts! Reference UTR logged.');
    } catch (err) {
      console.error(err);
    }
  };

  const handlePaySingleClaim = async () => {
    if (!showPayModal || !showPayModal.claimId) return;
    try {
      await axios.post(`${API_URL}/api/erp/expenses/claims/${showPayModal.claimId}/pay-single`, paymentExecutionForm);
      setShowPayModal(null);
      fetchData();
      showToast('Claim paid and settled directly with chosen payment mode!');
    } catch (err) {
      console.error(err);
    }
  };

  // KPIs
  const totalClaimsValue = claims.reduce((acc, c) => acc + (c.grossAmount || 0), 0);
  const approvedPayableValue = claims.filter(c => c.status === 'Approved / Payment Ready' && c.paymentStatus === 'Unpaid').reduce((acc, c) => acc + (c.netPayable || 0), 0);
  const pendingApprovalsCount = claims.filter(c => c.status.startsWith('Pending')).length;
  const activeAdvancesValue = advances.filter(a => a.status === 'Disbursed').reduce((acc, a) => acc + (a.disbursedAmount || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top ERP Suite Navigation */}
      <ERPNavigation />

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              ERP Expense & Claims Management
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
              Operations Hub
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Multiple claim forms, tiered approval matrix, tour advances, batch payment clearing & multi-mode disbursement
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {claims.length === 0 && (
            <button
              onClick={handleSimulateClaims}
              className="px-3.5 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Simulate Sample Claims
            </button>
          )}

          <button
            onClick={() => setShowAdvanceModal(true)}
            className="px-3.5 py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5" />
            Request Tour Advance
          </button>

          <button
            onClick={() => setShowFormSelectorModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            File Expense Claim
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Claims Value</p>
            <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Receipt className="w-5 h-5" />
            </span>
          </div>
          <h3 className="text-2xl font-extrabold text-gray-900 mt-2">
            ₹{totalClaimsValue.toLocaleString('en-IN')}
          </h3>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {claims.length} total operational claims filed
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Payment Ready</p>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </span>
          </div>
          <h3 className="text-2xl font-extrabold text-emerald-600 mt-2">
            ₹{approvedPayableValue.toLocaleString('en-IN')}
          </h3>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Approved claims awaiting batch disbursement
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pending Approvals</p>
            <span className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Clock className="w-5 h-5" />
            </span>
          </div>
          <h3 className="text-2xl font-extrabold text-amber-600 mt-2">
            {pendingApprovalsCount}
          </h3>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Awaiting Manager, HOD or CFO sign-off
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active Tour Advances</p>
            <span className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <Wallet className="w-5 h-5" />
            </span>
          </div>
          <h3 className="text-2xl font-extrabold text-purple-600 mt-2">
            ₹{activeAdvancesValue.toLocaleString('en-IN')}
          </h3>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Travel advances awaiting tour reconciliation
          </p>
        </div>
      </div>

      {/* Tabs Selector Bar */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-1.5 shadow-xs overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1 min-w-max">
          {[
            { id: 'claims', label: 'Expense Claims Ledger', icon: Receipt, badge: claims.length },
            { id: 'heads', label: 'Configurable Claim Heads', icon: Sliders, badge: claimHeads.length },
            { id: 'advances', label: 'Tour Advances & Review', icon: Compass, badge: advances.length },
            { id: 'approvals', label: 'Tiered Approvals Matrix', icon: ShieldCheck, badge: pendingApprovalsCount },
            { id: 'batches', label: 'Batch Payments & Payouts', icon: CreditCard, badge: batches.length }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
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
      {/* TAB 1: EXPENSE CLAIMS LEDGER */}
      {/* ======================================================== */}
      {activeTab === 'claims' && (
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Workforce Expense Claims Registry</h3>
              <p className="text-xs text-gray-400 mt-0.5">Multi-form submissions with attached tax receipts and multi-tier approval progression</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-medium">Claims Count:</span>
              <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold font-mono">
                {claims.length} Filed
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="px-5 py-3.5 text-left">Claim ID & Date</th>
                  <th className="px-5 py-3.5 text-left">Employee & Dept</th>
                  <th className="px-5 py-3.5 text-left">Claim Title & Head</th>
                  <th className="px-5 py-3.5 text-left">Form Type</th>
                  <th className="px-5 py-3.5 text-left">Gross (Tax)</th>
                  <th className="px-5 py-3.5 text-left">Advance Adj</th>
                  <th className="px-5 py-3.5 text-left">Net Payable</th>
                  <th className="px-5 py-3.5 text-left">Approval State</th>
                  <th className="px-5 py-3.5 text-left">Payment Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {claims.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-5 py-12 text-center text-gray-400">
                      No expense claims submitted. Click "File Expense Claim" or "Simulate Sample Claims" to start.
                    </td>
                  </tr>
                ) : (
                  claims.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-mono font-bold text-gray-900">{c.id}</div>
                        <div className="text-[10px] text-gray-400">{c.expenseDate}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-gray-900">{c.employeeName}</div>
                        <div className="text-[10px] text-gray-400">{c.department}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-gray-800">{c.title}</div>
                        <div className="text-[10px] text-blue-600 font-medium">{c.claimHead}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          c.formType === 'TravelTour'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : c.formType === 'Mileage'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : c.formType === 'ClientEntertainment'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {c.formType}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-gray-800">
                        <div>₹{c.grossAmount.toLocaleString('en-IN')}</div>
                        {c.taxAmount > 0 && <span className="text-[10px] text-gray-400">GST: ₹{c.taxAmount}</span>}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-purple-700 font-semibold">
                        {c.advanceAdjusted > 0 ? `-₹${c.advanceAdjusted.toLocaleString('en-IN')}` : '-'}
                      </td>
                      <td className="px-5 py-3.5 font-mono font-extrabold text-emerald-600 text-sm">
                        ₹{c.netPayable.toLocaleString('en-IN')}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          c.status === 'Approved / Payment Ready'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : c.status.startsWith('Pending')
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : c.status === 'Paid / Settled'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          c.paymentStatus === 'Paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {c.paymentStatus}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedClaimDetail(c)}
                          className="px-2.5 py-1 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                        >
                          View Details
                        </button>
                        {c.status === 'Approved / Payment Ready' && c.paymentStatus === 'Unpaid' && (
                          <button
                            onClick={() => setShowPayModal({ claimId: c.id })}
                            className="px-2.5 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all shadow-xs cursor-pointer"
                          >
                            Pay Direct
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteClaim(c.id)}
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
      {/* TAB 2: CONFIGURABLE CLAIM HEADS */}
      {/* ======================================================== */}
      {activeTab === 'heads' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-gray-900">Configured Master Expense Heads</h3>
              <p className="text-xs text-gray-500 mt-0.5">Corporate category policies, GL account routing, limits, and receipt requirements</p>
            </div>
            <button
              onClick={() => setShowHeadModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Claim Head
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {claimHeads.map((head) => (
              <div key={head.id} className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                    GL: {head.glCode} • {head.code}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                      {head.category}
                    </span>
                    <button
                      onClick={() => handleDeleteHead(head.id)}
                      title="Delete Claim Head"
                      className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h4 className="text-sm font-bold text-gray-900">{head.name}</h4>
                <p className="text-xs text-gray-500 leading-relaxed min-h-[36px]">{head.description}</p>

                <div className="bg-gray-50/70 p-3 rounded-xl border border-gray-100 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Max Limit / Claim:</span>
                    <span className="font-mono font-bold text-gray-900">₹{head.maxLimit.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Approval Required Above:</span>
                    <span className="font-mono font-semibold text-blue-700">₹{head.requiresApprovalAbove.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Bill Receipt Mandatory:</span>
                    <span className={`font-semibold ${head.receiptRequired ? 'text-amber-600' : 'text-gray-400'}`}>
                      {head.receiptRequired ? 'Yes (Mandatory)' : 'No (Per Diem)'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">GST Input Credit:</span>
                    <span className={`font-semibold ${head.gstInputCreditEligible ? 'text-emerald-600' : 'text-gray-400'}`}>
                      {head.gstInputCreditEligible ? 'Eligible' : 'Ineligible'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: TOUR ADVANCES REQUEST & REVIEW */}
      {/* ======================================================== */}
      {activeTab === 'advances' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Business Travel & Tour Advance Register</h3>
                <p className="text-xs text-gray-400 mt-0.5">Pre-travel cash advances, manager approvals, cash vouchers and claim reconciliation</p>
              </div>
              <div className="flex items-center gap-2">
                {advances.length === 0 && (
                  <button
                    onClick={handleSimulateAdvances}
                    className="px-3.5 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Simulate Tour Advances
                  </button>
                )}
                <button
                  onClick={() => setShowAdvanceModal(true)}
                  className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Request Advance
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-xs">
                <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-[10px] tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5 text-left">Advance ID</th>
                    <th className="px-5 py-3.5 text-left">Employee & Dept</th>
                    <th className="px-5 py-3.5 text-left">Tour Purpose & Destination</th>
                    <th className="px-5 py-3.5 text-left">Travel Window</th>
                    <th className="px-5 py-3.5 text-left">Requested Amount</th>
                    <th className="px-5 py-3.5 text-left">Disbursed Voucher</th>
                    <th className="px-5 py-3.5 text-left">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {advances.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-5 py-12 text-center text-gray-400">
                        No tour advances requested. Click "Request Advance" or "Simulate Tour Advances" to add.
                      </td>
                    </tr>
                  ) : (
                    advances.map((adv) => (
                      <tr key={adv.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-3.5 font-mono font-bold text-gray-900">{adv.id}</td>
                        <td className="px-5 py-3.5">
                          <div className="font-bold text-gray-900">{adv.employeeName}</div>
                          <div className="text-[10px] text-gray-400">{adv.department}</div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="font-bold text-gray-800">{adv.tourPurpose}</div>
                          <div className="text-[10px] text-purple-600 font-semibold">{adv.destination}</div>
                        </td>
                        <td className="px-5 py-3.5 text-gray-600">
                          {adv.departureDate} to {adv.returnDate}
                        </td>
                        <td className="px-5 py-3.5 font-mono font-bold text-gray-900 text-sm">
                          ₹{adv.requestedAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="px-5 py-3.5">
                          {adv.voucherNumber ? (
                            <div>
                              <span className="font-mono text-emerald-700 font-bold">{adv.voucherNumber}</span>
                              <div className="text-[10px] text-gray-400">{adv.paymentMode}</div>
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">Unissued</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            adv.status === 'Disbursed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : adv.status === 'Reconciled in Claim'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : adv.status === 'Approved by Manager'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {adv.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right space-x-1 whitespace-nowrap">
                          {adv.status === 'Approved by Manager' && (
                            <button
                              onClick={() => handleApproveAdvance(adv.id, 'Corporate Bank Transfer (NEFT)')}
                              className="px-2.5 py-1 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-all shadow-xs cursor-pointer"
                            >
                              Disburse Advance
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteAdvance(adv.id)}
                            title="Delete Advance"
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
      {/* TAB 4: TIERED APPROVAL MATRIX */}
      {/* ======================================================== */}
      {activeTab === 'approvals' && (
        <div className="space-y-6">
          {/* Policy Structure Overview */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6 space-y-4">
            <h3 className="text-sm font-bold text-gray-900">Multi-Tier Automated Approval Matrix</h3>
            <p className="text-xs text-gray-500">Tier thresholds, SLAs and designated approving authorities</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-100 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Tier 1 Threshold</span>
                  <span className="text-[10px] font-mono bg-blue-200/60 text-blue-900 px-2 py-0.5 rounded font-bold">24h SLA</span>
                </div>
                <h4 className="text-sm font-bold text-gray-900">Claims Up to ₹10,000</h4>
                <p className="text-xs text-gray-600">Requires <strong>Direct Reporting Manager</strong> approval only.</p>
              </div>

              <div className="p-4 bg-purple-50/60 rounded-xl border border-purple-100 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700">Tier 2 Threshold</span>
                  <span className="text-[10px] font-mono bg-purple-200/60 text-purple-900 px-2 py-0.5 rounded font-bold">48h SLA</span>
                </div>
                <h4 className="text-sm font-bold text-gray-900">₹10,001 to ₹50,000</h4>
                <p className="text-xs text-gray-600">Requires <strong>Line Manager + Department Head / VP</strong> 2-level sign-off.</p>
              </div>

              <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-100 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Tier 3 Threshold</span>
                  <span className="text-[10px] font-mono bg-amber-200/60 text-amber-900 px-2 py-0.5 rounded font-bold">72h SLA</span>
                </div>
                <h4 className="text-sm font-bold text-gray-900">Above ₹50,000 / Flights</h4>
                <p className="text-xs text-gray-600">Requires <strong>Manager + HOD + Finance Director / CFO</strong> sign-off.</p>
              </div>
            </div>
          </div>

          {/* Pending Approvals Queue */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900">Pending Approvals Action Queue ({claims.filter(c => c.status.startsWith('Pending')).length})</h3>
              <p className="text-xs text-gray-400 mt-0.5">Claims currently requiring sign-off at your authorization tier</p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-xs">
                <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-[10px] tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5 text-left">Claim</th>
                    <th className="px-5 py-3.5 text-left">Employee & Dept</th>
                    <th className="px-5 py-3.5 text-left">Head & Details</th>
                    <th className="px-5 py-3.5 text-left">Amount</th>
                    <th className="px-5 py-3.5 text-left">Current Review Tier</th>
                    <th className="px-5 py-3.5 text-right">Approval Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {claims.filter(c => c.status.startsWith('Pending')).length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-gray-400">
                        No claims currently awaiting your review. All claims are up to date!
                      </td>
                    </tr>
                  ) : (
                    claims.filter(c => c.status.startsWith('Pending')).map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="font-mono font-bold text-gray-900">{c.id}</div>
                          <div className="text-[10px] text-gray-400">{c.expenseDate}</div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="font-bold text-gray-900">{c.employeeName}</div>
                          <div className="text-[10px] text-gray-400">{c.department}</div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="font-bold text-gray-800">{c.title}</div>
                          <div className="text-[10px] text-blue-600 font-medium">{c.claimHead}</div>
                        </td>
                        <td className="px-5 py-3.5 font-mono font-bold text-gray-900 text-sm">
                          ₹{c.netPayable.toLocaleString('en-IN')}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200">
                            {c.currentTier}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right space-x-1">
                          <button
                            onClick={() => setApprovalActionModal({ claim: c, action: 'Approve' })}
                            className="px-2.5 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all shadow-xs cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => setApprovalActionModal({ claim: c, action: 'Return' })}
                            className="px-2.5 py-1 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors cursor-pointer"
                          >
                            Return
                          </button>
                          <button
                            onClick={() => setApprovalActionModal({ claim: c, action: 'Reject' })}
                            className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                          >
                            Reject
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
      {/* TAB 5: BATCH PAYMENTS & MULTI-MODE SETTLEMENTS */}
      {/* ======================================================== */}
      {activeTab === 'batches' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Expense Settlement Batches & Multiple Payment Modes</h3>
                <p className="text-xs text-gray-400 mt-0.5">Bundle approved claims into clearance batches or disburse via NEFT, Corporate Cards, Petty Cash, UPI or Payroll</p>
              </div>
              <button
                onClick={handleCreatePaymentBatch}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Assemble Payment Batch ({claims.filter(c => c.status === 'Approved / Payment Ready' && c.paymentStatus === 'Unpaid').length})
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-xs">
                <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-[10px] tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5 text-left">Batch Code</th>
                    <th className="px-5 py-3.5 text-left">Batch Name & Created</th>
                    <th className="px-5 py-3.5 text-left">Claims Count</th>
                    <th className="px-5 py-3.5 text-left">Total Value</th>
                    <th className="px-5 py-3.5 text-left">Payment Mode</th>
                    <th className="px-5 py-3.5 text-left">Settlement Reference</th>
                    <th className="px-5 py-3.5 text-left">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {batches.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-5 py-12 text-center text-gray-400">
                        No clearance batches assembled yet. Approve claims and click "Assemble Payment Batch".
                      </td>
                    </tr>
                  ) : (
                    batches.map((b) => (
                      <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-3.5 font-mono font-bold text-gray-900">{b.id}</td>
                        <td className="px-5 py-3.5">
                          <div className="font-bold text-gray-900">{b.batchName}</div>
                          <div className="text-[10px] text-gray-400">{b.createdAt?.split('T')[0]}</div>
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-gray-800">
                          {b.claimCount} Claims
                        </td>
                        <td className="px-5 py-3.5 font-mono font-extrabold text-emerald-600 text-sm">
                          ₹{b.totalAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-blue-700">
                          {b.paymentMode}
                        </td>
                        <td className="px-5 py-3.5 font-mono text-gray-600">
                          {b.referenceCode ? (
                            <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold">
                              {b.referenceCode}
                            </span>
                          ) : (
                            <span className="text-gray-400 italic">Pending Release</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            b.status === 'Disbursed / Settled'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                          {b.status !== 'Disbursed / Settled' && (
                            <button
                              onClick={() => setShowPayModal({ batchId: b.id })}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-xs transition-all cursor-pointer"
                            >
                              Execute Settlement
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteBatch(b.id)}
                            title="Delete Batch"
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
      {/* MULTI-CLAIM FORM SELECTOR MODAL */}
      {/* ======================================================== */}
      {showFormSelectorModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Receipt className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Select Expense Claim Form Type</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Choose the appropriate form tailored to your expense nature</p>
                </div>
              </div>
              <button onClick={() => setShowFormSelectorModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-5">
              {/* Form 1 */}
              <div
                onClick={() => {
                  setShowFormSelectorModal(false);
                  setActiveFormType('General');
                }}
                className="p-5 border-2 border-slate-200 hover:border-blue-500 rounded-2xl transition-all cursor-pointer hover:shadow-md group space-y-2"
              >
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl w-fit group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <FileText className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-gray-900">1. General Out-of-Pocket Expense Form</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  For office supplies, software subscriptions, stationery, book purchases, and routine administrative bills.
                </p>
              </div>

              {/* Form 2 */}
              <div
                onClick={() => {
                  setShowFormSelectorModal(false);
                  setActiveFormType('TravelTour');
                }}
                className="p-5 border-2 border-slate-200 hover:border-purple-500 rounded-2xl transition-all cursor-pointer hover:shadow-md group space-y-2"
              >
                <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl w-fit group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <Plane className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-gray-900">2. Business Travel & Tour Expense Form</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  For multi-city flights, trains, hotel lodging, and per diem with automatic Tour Advance reconciliation.
                </p>
              </div>

              {/* Form 3 */}
              <div
                onClick={() => {
                  setShowFormSelectorModal(false);
                  setActiveFormType('Mileage');
                }}
                className="p-5 border-2 border-slate-200 hover:border-emerald-500 rounded-2xl transition-all cursor-pointer hover:shadow-md group space-y-2"
              >
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl w-fit group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <Car className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-gray-900">3. Personal Vehicle Mileage Log Form</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Calculate fuel allowances based on kilometers traveled (Car ₹12/KM, 2-Wheeler ₹5/KM, EV ₹8/KM).
                </p>
              </div>

              {/* Form 4 */}
              <div
                onClick={() => {
                  setShowFormSelectorModal(false);
                  setActiveFormType('ClientEntertainment');
                }}
                className="p-5 border-2 border-slate-200 hover:border-amber-500 rounded-2xl transition-all cursor-pointer hover:shadow-md group space-y-2"
              >
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl w-fit group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  <Coffee className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-gray-900">4. Client Hospitality & Entertainment Form</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Log client business dinners, attendee counts, business justification, and compliance with anti-bribery policies.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* FORM 1 MODAL: GENERAL OUT-OF-POCKET EXPENSE */}
      {/* ======================================================== */}
      {activeFormType === 'General' && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <FileText className="w-5 h-5" />
                </span>
                <h3 className="text-base font-bold text-gray-900">General Out-of-Pocket Expense Claim</h3>
              </div>
              <button onClick={() => setActiveFormType(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGeneralClaim} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Claim Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AWS Cloud Hosting Subscription / Office Stationery"
                    value={generalForm.title}
                    onChange={(e) => setGeneralForm({ ...generalForm, title: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Claim Head *</label>
                  <select
                    value={generalForm.claimHead}
                    onChange={(e) => setGeneralForm({ ...generalForm, claimHead: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    {claimHeads.map(h => (
                      <option key={h.id} value={h.name}>{h.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Expense Date *</label>
                  <input
                    type="date"
                    required
                    value={generalForm.expenseDate}
                    onChange={(e) => setGeneralForm({ ...generalForm, expenseDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Merchant / Vendor Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Amazon Web Services / PrintExpress"
                    value={generalForm.merchant}
                    onChange={(e) => setGeneralForm({ ...generalForm, merchant: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Tax Invoice No *</label>
                  <input
                    type="text"
                    required
                    placeholder="INV-2026-9921"
                    value={generalForm.invoiceNumber}
                    onChange={(e) => setGeneralForm({ ...generalForm, invoiceNumber: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Gross Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    value={generalForm.totalAmount}
                    onChange={(e) => setGeneralForm({ ...generalForm, totalAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">GST Tax Amount Included (₹)</label>
                  <input
                    type="number"
                    value={generalForm.taxAmount}
                    onChange={(e) => setGeneralForm({ ...generalForm, taxAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Remarks & Business Justification</label>
                <textarea
                  rows={2}
                  value={generalForm.remarks}
                  onChange={(e) => setGeneralForm({ ...generalForm, remarks: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setActiveFormType(null)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  Submit for Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* FORM 2 MODAL: BUSINESS TRAVEL & TOUR EXPENSE */}
      {/* ======================================================== */}
      {activeFormType === 'TravelTour' && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                  <Plane className="w-5 h-5" />
                </span>
                <h3 className="text-base font-bold text-gray-900">Business Travel & Tour Expense Form</h3>
              </div>
              <button onClick={() => setActiveFormType(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTravelClaim} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Tour Title / Purpose *</label>
                <input
                  type="text"
                  required
                  value={travelForm.title}
                  onChange={(e) => setTravelForm({ ...travelForm, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Origin City *</label>
                  <input
                    type="text"
                    required
                    value={travelForm.origin}
                    onChange={(e) => setTravelForm({ ...travelForm, origin: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Destination City *</label>
                  <input
                    type="text"
                    required
                    value={travelForm.destination}
                    onChange={(e) => setTravelForm({ ...travelForm, destination: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
              </div>

              <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-100 space-y-3">
                <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wider">Itemized Travel Cost Breakdown</h4>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600">Transport / Flight (₹)</label>
                    <input
                      type="number"
                      value={travelForm.transportCost}
                      onChange={(e) => setTravelForm({ ...travelForm, transportCost: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 border rounded-lg text-xs bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600">Hotel / Lodging (₹)</label>
                    <input
                      type="number"
                      value={travelForm.lodgingCost}
                      onChange={(e) => setTravelForm({ ...travelForm, lodgingCost: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 border rounded-lg text-xs bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600">Per Diem Allowance (₹)</label>
                    <input
                      type="number"
                      value={travelForm.perDiemCost}
                      onChange={(e) => setTravelForm({ ...travelForm, perDiemCost: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 border rounded-lg text-xs bg-white font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Reconcile with Disbursed Tour Advance (Optional)</label>
                <select
                  value={travelForm.linkedAdvanceId}
                  onChange={(e) => setTravelForm({ ...travelForm, linkedAdvanceId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-purple-500 outline-none bg-white"
                >
                  <option value="">No Advance (Direct Claim)</option>
                  {advances.filter(a => a.status === 'Disbursed').map(a => (
                    <option key={a.id} value={a.id}>
                      {a.id} - {a.tourPurpose} (Advance Disbursed: ₹{a.disbursedAmount})
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-gray-400">Selecting an advance automatically deducts it from the claim payout</span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setActiveFormType(null)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  Submit Travel Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* FORM 3 MODAL: MILEAGE & VEHICLE LOG */}
      {/* ======================================================== */}
      {activeFormType === 'Mileage' && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Car className="w-5 h-5" />
                </span>
                <h3 className="text-base font-bold text-gray-900">Personal Vehicle Mileage Log Claim</h3>
              </div>
              <button onClick={() => setActiveFormType(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMileageClaim} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Vehicle Type *</label>
                <select
                  value={mileageForm.vehicleType}
                  onChange={(e) => {
                    const type = e.target.value;
                    const rate = type.includes('Two') ? 5 : type.includes('Electric') ? 8 : 12;
                    setMileageForm({ ...mileageForm, vehicleType: type, ratePerKm: rate });
                  }}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                >
                  <option value="Car (Four-Wheeler)">Car (Four-Wheeler) - ₹12/KM</option>
                  <option value="Motorcycle (Two-Wheeler)">Motorcycle (Two-Wheeler) - ₹5/KM</option>
                  <option value="Electric Vehicle (EV)">Electric Vehicle (EV) - ₹8/KM</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Rate / KM (₹)</label>
                  <input
                    type="number"
                    readOnly
                    value={mileageForm.ratePerKm}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-gray-50 font-mono font-bold text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Total Kilometers *</label>
                  <input
                    type="number"
                    required
                    value={mileageForm.totalKm}
                    onChange={(e) => setMileageForm({ ...mileageForm, totalKm: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">From Location *</label>
                  <input
                    type="text"
                    required
                    value={mileageForm.startLocation}
                    onChange={(e) => setMileageForm({ ...mileageForm, startLocation: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">To Location *</label>
                  <input
                    type="text"
                    required
                    value={mileageForm.endLocation}
                    onChange={(e) => setMileageForm({ ...mileageForm, endLocation: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex justify-between items-center text-xs">
                <span className="font-bold text-emerald-800">Calculated Mileage Allowance:</span>
                <span className="font-extrabold text-emerald-700 font-mono text-base">
                  ₹{(mileageForm.ratePerKm * mileageForm.totalKm).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setActiveFormType(null)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  Log Mileage Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* FORM 4 MODAL: CLIENT ENTERTAINMENT & HOSPITALITY */}
      {/* ======================================================== */}
      {activeFormType === 'ClientEntertainment' && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                  <Coffee className="w-5 h-5" />
                </span>
                <h3 className="text-base font-bold text-gray-900">Client Entertainment & Hospitality Form</h3>
              </div>
              <button onClick={() => setActiveFormType(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEntertainmentClaim} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Client Organization *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Goldman Sachs India"
                    value={entertainmentForm.clientCompany}
                    onChange={(e) => setEntertainmentForm({ ...entertainmentForm, clientCompany: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Total Attendees Count *</label>
                  <input
                    type="number"
                    min={2}
                    required
                    value={entertainmentForm.attendeesCount}
                    onChange={(e) => setEntertainmentForm({ ...entertainmentForm, attendeesCount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-amber-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Attendee Names (Internal & External) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma (Athena), John Smith (Client Partner)"
                  value={entertainmentForm.attendeeNames}
                  onChange={(e) => setEntertainmentForm({ ...entertainmentForm, attendeeNames: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Business Purpose & Meeting Justification *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Business context and topics discussed during the hospitality meeting..."
                  value={entertainmentForm.businessJustification}
                  onChange={(e) => setEntertainmentForm({ ...entertainmentForm, businessJustification: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Restaurant / Venue *</label>
                  <input
                    type="text"
                    required
                    value={entertainmentForm.merchant}
                    onChange={(e) => setEntertainmentForm({ ...entertainmentForm, merchant: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Total Invoice Bill (₹) *</label>
                  <input
                    type="number"
                    required
                    value={entertainmentForm.totalAmount}
                    onChange={(e) => setEntertainmentForm({ ...entertainmentForm, totalAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-amber-500 outline-none font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setActiveFormType(null)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  Submit Hospitality Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: CLAIM DETAIL PREVIEW & AUDIT */}
      {/* ======================================================== */}
      {selectedClaimDetail && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg">
                  {selectedClaimDetail.id}
                </span>
                <span className="text-xs font-bold text-gray-900">{selectedClaimDetail.title}</span>
              </div>
              <button onClick={() => setSelectedClaimDetail(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-semibold">Employee</span>
                  <div className="font-bold text-gray-900">{selectedClaimDetail.employeeName}</div>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-semibold">Department</span>
                  <div className="font-semibold text-gray-800">{selectedClaimDetail.department}</div>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-semibold">Claim Head</span>
                  <div className="font-semibold text-blue-700">{selectedClaimDetail.claimHead}</div>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-semibold">Status</span>
                  <div className="font-bold text-emerald-700">{selectedClaimDetail.status}</div>
                </div>
              </div>

              {/* Form Specific Details */}
              {selectedClaimDetail.travelDetails && (
                <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100 space-y-1">
                  <h5 className="font-bold text-purple-900">Travel & Itinerary Details</h5>
                  <div className="grid grid-cols-2 gap-2 text-gray-700">
                    <div>Route: {selectedClaimDetail.travelDetails.origin} ➔ {selectedClaimDetail.travelDetails.destination}</div>
                    <div>Dates: {selectedClaimDetail.travelDetails.departureDate} to {selectedClaimDetail.travelDetails.returnDate}</div>
                    <div>Transport Cost: ₹{selectedClaimDetail.travelDetails.transportCost}</div>
                    <div>Hotel Lodging: ₹{selectedClaimDetail.travelDetails.lodgingCost}</div>
                  </div>
                </div>
              )}

              {selectedClaimDetail.mileageDetails && (
                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 space-y-1">
                  <h5 className="font-bold text-emerald-900">Vehicle Mileage Computation</h5>
                  <div className="grid grid-cols-2 gap-2 text-gray-700">
                    <div>Vehicle: {selectedClaimDetail.mileageDetails.vehicleType}</div>
                    <div>Distance: {selectedClaimDetail.mileageDetails.totalKm} KM @ ₹{selectedClaimDetail.mileageDetails.ratePerKm}/KM</div>
                    <div>Route: {selectedClaimDetail.mileageDetails.startLocation} to {selectedClaimDetail.mileageDetails.endLocation}</div>
                  </div>
                </div>
              )}

              {/* Financial Calculation Banner */}
              <div className="p-4 bg-slate-900 text-white rounded-xl flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-semibold">Net Payable Payout</span>
                  <div className="text-xl font-extrabold font-mono text-emerald-400">
                    ₹{selectedClaimDetail.netPayable.toLocaleString('en-IN')}
                  </div>
                  {selectedClaimDetail.advanceAdjusted > 0 && (
                    <div className="text-[10px] text-gray-400">
                      Gross: ₹{selectedClaimDetail.grossAmount} • Advance Deducted: ₹{selectedClaimDetail.advanceAdjusted}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-400 uppercase font-semibold">Payment State</span>
                  <div className="font-bold text-sm text-blue-300">{selectedClaimDetail.paymentStatus}</div>
                </div>
              </div>

              {/* Approval History Trail */}
              <div>
                <h5 className="font-bold text-gray-900 mb-2">Multi-Tier Approval Trail & Audit Logs</h5>
                <div className="space-y-2">
                  {(selectedClaimDetail.approvalHistory || []).map((step: any, idx: number) => (
                    <div key={idx} className="p-2.5 bg-gray-50 rounded-xl border border-gray-200 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-gray-800">{step.tier}</span>
                        <div className="text-[11px] text-gray-500">{step.comments}</div>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-emerald-700">{step.action}</span>
                        <div className="text-[10px] text-gray-400">{step.timestamp?.split('T')[0]}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
              <button
                onClick={() => handleDeleteClaim(selectedClaimDetail.id)}
                className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                Delete Claim
              </button>
              <button
                onClick={() => setSelectedClaimDetail(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD CLAIM HEAD */}
      {/* ======================================================== */}
      {showHeadModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Sliders className="w-5 h-5" />
                </span>
                <h3 className="text-base font-bold text-gray-900">Configure Expense Claim Head</h3>
              </div>
              <button onClick={() => setShowHeadModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateHead} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Head Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. IT-HARDWARE"
                    value={headForm.code}
                    onChange={(e) => setHeadForm({ ...headForm, code: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">GL Account Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 60850"
                    value={headForm.glCode}
                    onChange={(e) => setHeadForm({ ...headForm, glCode: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Head Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. IT Equipment & Consumables"
                  value={headForm.name}
                  onChange={(e) => setHeadForm({ ...headForm, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Max Limit / Claim (₹) *</label>
                  <input
                    type="number"
                    required
                    value={headForm.maxLimit}
                    onChange={(e) => setHeadForm({ ...headForm, maxLimit: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Approval Above (₹) *</label>
                  <input
                    type="number"
                    required
                    value={headForm.requiresApprovalAbove}
                    onChange={(e) => setHeadForm({ ...headForm, requiresApprovalAbove: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2 text-xs font-semibold text-gray-700">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={headForm.receiptRequired}
                    onChange={(e) => setHeadForm({ ...headForm, receiptRequired: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span>Receipt Mandatory</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={headForm.gstInputCreditEligible}
                    onChange={(e) => setHeadForm({ ...headForm, gstInputCreditEligible: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span>GST Credit Eligible</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowHeadModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  Save Claim Head
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: REQUEST TOUR ADVANCE */}
      {/* ======================================================== */}
      {showAdvanceModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                  <Compass className="w-5 h-5" />
                </span>
                <h3 className="text-base font-bold text-gray-900">Request Business Tour Cash Advance</h3>
              </div>
              <button onClick={() => setShowAdvanceModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAdvance} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Employee *</label>
                <select
                  value={advanceForm.employeeId}
                  onChange={(e) => {
                    const emp = employees.find(x => x.id === e.target.value);
                    setAdvanceForm({
                      ...advanceForm,
                      employeeId: e.target.value,
                      employeeName: emp?.name || '',
                      department: emp?.department || 'Engineering'
                    });
                  }}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-purple-500 outline-none bg-white"
                >
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.name} ({e.department || 'General'})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Tour Purpose *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hyderabad Fintech Expo & Partner Demos"
                  value={advanceForm.tourPurpose}
                  onChange={(e) => setAdvanceForm({ ...advanceForm, tourPurpose: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Destination City *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mumbai, New Delhi, Singapore"
                  value={advanceForm.destination}
                  onChange={(e) => setAdvanceForm({ ...advanceForm, destination: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Departure Date *</label>
                  <input
                    type="date"
                    required
                    value={advanceForm.departureDate}
                    onChange={(e) => setAdvanceForm({ ...advanceForm, departureDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Return Date *</label>
                  <input
                    type="date"
                    required
                    value={advanceForm.returnDate}
                    onChange={(e) => setAdvanceForm({ ...advanceForm, returnDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Requested Cash Advance (₹) *</label>
                <input
                  type="number"
                  required
                  value={advanceForm.requestedAmount}
                  onChange={(e) => setAdvanceForm({ ...advanceForm, requestedAmount: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-purple-500 outline-none font-mono font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAdvanceModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  Submit Advance Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: APPROVAL DECISION WITH COMMENTS */}
      {/* ======================================================== */}
      {approvalActionModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">
                Confirm {approvalActionModal.action} Claim: {approvalActionModal.claim.id}
              </h3>
              <button onClick={() => setApprovalActionModal(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
                <div><strong>Employee:</strong> {approvalActionModal.claim.employeeName}</div>
                <div><strong>Claim:</strong> {approvalActionModal.claim.title}</div>
                <div><strong>Amount:</strong> ₹{approvalActionModal.claim.netPayable.toLocaleString('en-IN')}</div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Approver Review Comments *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Enter remarks or justification for this decision..."
                  value={approvalComment}
                  onChange={(e) => setApprovalComment(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setApprovalActionModal(null)}
                className="px-4 py-2 border rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteApproval}
                className={`px-4 py-2 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                  approvalActionModal.action === 'Approve'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : approvalActionModal.action === 'Return'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                Confirm {approvalActionModal.action}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: MULTIPLE MODES OF PAYMENT DISBURSEMENT */}
      {/* ======================================================== */}
      {showPayModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <CreditCard className="w-5 h-5" />
                </span>
                <h3 className="text-base font-bold text-gray-900">
                  {showPayModal.batchId ? 'Disburse Payment Batch' : 'Direct Claim Settlement'}
                </h3>
              </div>
              <button onClick={() => setShowPayModal(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Select Payment Mode *</label>
                <select
                  value={paymentExecutionForm.paymentMode}
                  onChange={(e) => setPaymentExecutionForm({ ...paymentExecutionForm, paymentMode: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none bg-white font-semibold"
                >
                  <option value="Corporate Bank Transfer (NEFT / RTGS)">1. Corporate Bank Transfer (NEFT / RTGS)</option>
                  <option value="Corporate Credit Card (P-Card)">2. Corporate Credit Card (P-Card Settlement)</option>
                  <option value="Petty Cash Desk Voucher">3. Petty Cash Desk Voucher (Cash Handout)</option>
                  <option value="Instant UPI / VPA Transfer">4. Instant UPI / VPA Virtual Account Payout</option>
                  <option value="Payroll Reimbursement Integration">5. Next Monthly Payroll Reimbursement Credit</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Disbursement Account / Cash Ledger *</label>
                <select
                  value={paymentExecutionForm.paymentAccount}
                  onChange={(e) => setPaymentExecutionForm({ ...paymentExecutionForm, paymentAccount: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                >
                  <option value="HDFC Corporate Operating A/C - 5020001892140">HDFC Corporate Operating A/C - 5020001892140</option>
                  <option value="ICICI Bank Current A/C - 001205009841">ICICI Bank Current A/C - 001205009841</option>
                  <option value="Central Office Petty Cash Vault (Desk #4)">Central Office Petty Cash Vault (Desk #4)</option>
                  <option value="Corporate Amex P-Card #9812">Corporate Amex Commercial P-Card #9812</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Custom Reference / UTR (Optional)</label>
                <input
                  type="text"
                  placeholder="Auto-generated if left blank"
                  value={paymentExecutionForm.paymentReference}
                  onChange={(e) => setPaymentExecutionForm({ ...paymentExecutionForm, paymentReference: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                />
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 text-[11px] leading-relaxed">
                <strong>Disbursement Rule:</strong> Executing this payment will automatically update the ERP ledger, mark line claims as Settled, and generate an electronic UTR receipt for finance audit.
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowPayModal(null)}
                className="px-4 py-2 border rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={showPayModal.batchId ? handleDisburseBatch : handlePaySingleClaim}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Execute Payout
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

      {/* ================= MODAL: EDIT CLAIM ================= */}
      {showEditClaimModal && editingClaim && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-[480px] max-w-full p-6 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Edit Expense Claim</h3>
              <button onClick={() => setShowEditClaimModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleEditClaimSubmit} className="space-y-4 pt-4">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Claim Title *</label>
                <input
                  type="text"
                  required
                  value={editClaimForm.title}
                  onChange={e => setEditClaimForm({ ...editClaimForm, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 font-semibold"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={editClaimForm.claimCategory}
                    onChange={e => setEditClaimForm({ ...editClaimForm, claimCategory: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Total Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    value={editClaimForm.totalAmount}
                    onChange={e => setEditClaimForm({ ...editClaimForm, totalAmount: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-mono font-bold"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Status</label>
                <select
                  value={editClaimForm.status}
                  onChange={e => setEditClaimForm({ ...editClaimForm, status: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 bg-white font-medium"
                >
                  <option value="Draft">Draft</option>
                  <option value="Submitted / In Review">Submitted / In Review</option>
                  <option value="Approved / Payment Ready">Approved / Payment Ready</option>
                  <option value="Paid / Disbursed">Paid / Disbursed</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setShowEditClaimModal(false)} className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs cursor-pointer">Save Claim</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT EXPENSE HEAD ================= */}
      {showEditHeadModal && editingHead && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-[480px] max-w-full p-6 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Edit Expense Head</h3>
              <button onClick={() => setShowEditHeadModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleEditHeadSubmit} className="space-y-4 pt-4">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Head Name *</label>
                <input
                  type="text"
                  required
                  value={editHeadForm.name}
                  onChange={e => setEditHeadForm({ ...editHeadForm, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 font-semibold"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Category Code *</label>
                  <input
                    type="text"
                    required
                    value={editHeadForm.code}
                    onChange={e => setEditHeadForm({ ...editHeadForm, code: e.target.value.toUpperCase() })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Monthly Budget Limit (₹)</label>
                  <input
                    type="number"
                    value={editHeadForm.monthlyLimit}
                    onChange={e => setEditHeadForm({ ...editHeadForm, monthlyLimit: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-mono"
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-700">
                  <input
                    type="checkbox"
                    checked={editHeadForm.requiresReceipt}
                    onChange={e => setEditHeadForm({ ...editHeadForm, requiresReceipt: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  Requires Bill / Receipt
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-700">
                  <input
                    type="checkbox"
                    checked={editHeadForm.isTaxDeductible}
                    onChange={e => setEditHeadForm({ ...editHeadForm, isTaxDeductible: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  GST / Tax Deductible
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setShowEditHeadModal(false)} className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs cursor-pointer">Save Head</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT TOUR ADVANCE ================= */}
      {showEditAdvanceModal && editingAdvance && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-[480px] max-w-full p-6 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Edit Tour Advance Request</h3>
              <button onClick={() => setShowEditAdvanceModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleEditAdvanceSubmit} className="space-y-4 pt-4">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Tour Purpose *</label>
                <input
                  type="text"
                  required
                  value={editAdvanceForm.purpose}
                  onChange={e => setEditAdvanceForm({ ...editAdvanceForm, purpose: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 font-semibold"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Destination</label>
                  <input
                    type="text"
                    value={editAdvanceForm.destination}
                    onChange={e => setEditAdvanceForm({ ...editAdvanceForm, destination: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Amount Requested (₹) *</label>
                  <input
                    type="number"
                    required
                    value={editAdvanceForm.amountRequested}
                    onChange={e => setEditAdvanceForm({ ...editAdvanceForm, amountRequested: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-mono font-bold"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Approval Status</label>
                <select
                  value={editAdvanceForm.status}
                  onChange={e => setEditAdvanceForm({ ...editAdvanceForm, status: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 bg-white font-medium"
                >
                  <option value="Pending Approval">Pending Approval</option>
                  <option value="Approved">Approved</option>
                  <option value="Disbursed">Disbursed</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setShowEditAdvanceModal(false)} className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs cursor-pointer">Save Advance</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT PAYMENT BATCH ================= */}
      {showEditBatchModal && editingBatch && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-[480px] max-w-full p-6 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Edit Payment Batch</h3>
              <button onClick={() => setShowEditBatchModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleEditBatchSubmit} className="space-y-4 pt-4">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Disbursement Mode</label>
                <select
                  value={editBatchForm.paymentMode}
                  onChange={e => setEditBatchForm({ ...editBatchForm, paymentMode: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 bg-white font-medium"
                >
                  <option value="Direct Bank Transfer">Direct Bank Transfer</option>
                  <option value="Corporate Credit Card">Corporate Credit Card</option>
                  <option value="UPI Batch Payout">UPI Batch Payout</option>
                  <option value="Cheque Disbursement">Cheque Disbursement</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Internal Notes</label>
                <textarea
                  value={editBatchForm.notes}
                  onChange={e => setEditBatchForm({ ...editBatchForm, notes: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 h-20"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setShowEditBatchModal(false)} className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs cursor-pointer">Save Batch</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
