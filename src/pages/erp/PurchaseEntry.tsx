import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  ShoppingCart, Pencil, Plus, Search, Filter, Trash2, CheckCircle2,
  Clock, DollarSign, Calendar, Truck, Building2, Package,
  Eye, CreditCard, ArrowDownRight, ArrowUpRight, Printer,
  ShieldCheck, AlertCircle, FileText, ChevronRight, X, Layers,
  Receipt, Box, RefreshCw, Sparkles, Send, ExternalLink, MessageSquare
} from 'lucide-react';
import ERPNavigation from '../../components/ERPNavigation';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

interface PurchaseItem {
  id?: string;
  productId?: string;
  itemName: string;
  hsnCode: string;
  quantity: number;
  unit: string;
  unitCost: number;
  taxRate: number;
  itcEligibility: 'Eligible' | 'Ineligible' | 'Capital Goods';
  taxAmount?: number;
  total?: number;
}

interface PurchaseEntry {
  id: string;
  voucherNo: string;
  supplierName: string;
  supplierGstin: string;
  supplierInvoiceNo: string;
  supplierInvoiceDate: string;
  purchaseOrderRef: string;
  grnRef: string;
  warehouse: string;
  dueDate: string;
  paymentTerms: string;
  items: PurchaseItem[];
  subtotal: number;
  taxTotal: number;
  freightCharges: number;
  tdsDeduction: number;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  status: 'Draft' | 'Verified' | 'Pending Payment' | 'Partially Paid' | 'Paid';
  paymentRecords: Array<{
    id: string;
    amount: number;
    paidDate: string;
    bankAccount: string;
    mode: string;
    utrRef: string;
  }>;
  autoUpdateStock: boolean;
  createdAt: string;
}

interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  gstin?: string;
  paymentTerms?: string;
}

export default function PurchaseEntry() {
  const [activeTab, setActiveTab] = useState<'entries' | 'purchaseOrders' | 'requisitions' | 'debitNotes' | 'gstr2b' | 'suppliers' | 'itc'>('entries');
  const [purchases, setPurchases] = useState<PurchaseEntry[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [summary, setSummary] = useState({
    totalPurchases: 0,
    totalPaid: 0,
    totalPayables: 0,
    availableITC: 0,
    totalCount: 0,
    supplierCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Purchase Orders State
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [poFilter, setPoFilter] = useState('All');
  // Universal CRUD State for Purchases
  const [showEditPurchaseModal, setShowEditPurchaseModal] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<any>(null);
  const [editPurchaseForm, setEditPurchaseForm] = useState({
    supplierName: '',
    supplierInvoiceNo: '',
    supplierInvoiceDate: '',
    dueDate: '',
    totalAmount: 0,
    status: 'Pending Payment',
    notes: ''
  });

  const [showEditSupplierModal, setShowEditSupplierModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<any>(null);
  const [editSupplierForm, setEditSupplierForm] = useState({ name: '', contactName: '', email: '', phone: '', address: '', gstin: '' });

  const [showEditPoModal, setShowEditPoModal] = useState(false);
  const [editingPo, setEditingPo] = useState<any>(null);
  const [editPoForm, setEditPoForm] = useState({ supplierName: '', deliveryDate: '', totalAmount: 0, status: 'Approved' });

  const [showEditReqModal, setShowEditReqModal] = useState(false);
  const [editingReq, setEditingReq] = useState<any>(null);
  const [editReqForm, setEditReqForm] = useState({ department: '', requestedBy: '', estimatedCost: 0, priority: 'Medium', status: 'Pending Approval' });

  const [showEditDnModal, setShowEditDnModal] = useState(false);
  const [editingDn, setEditingDn] = useState<any>(null);
  const [editDnForm, setEditDnForm] = useState({ supplierName: '', reason: '', totalAmount: 0, status: 'Issued & Adjusted' });

  const [showPoModal, setShowPoModal] = useState(false);
  const [selectedPo, setSelectedPo] = useState<any | null>(null);
  const [poForm, setPoForm] = useState({
    supplierName: 'Dell Technologies Enterprise India Pvt Ltd',
    supplierGstin: '29AABCD1029Q1Z8',
    supplierEmail: 'enterprise-sales@dell.com',
    supplierPhone: '+91 80 6789 4400',
    billingAddress: 'Enterprise Tower, Outer Ring Rd, Bangalore 560103',
    deliveryWarehouse: 'Bangalore Central Tech Hub',
    poDate: new Date().toISOString().split('T')[0],
    expectedDeliveryDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    paymentTerms: 'Net 30',
    freightEstimate: 1500,
    notes: 'All items must be brand new with manufacturer warranty. Delivery at Dock 4.',
    items: [
      {
        itemName: 'Enterprise High-Performance Rack Server E5',
        hsnCode: '847150',
        quantity: 2,
        unit: 'Units',
        unitCost: 185000,
        taxRate: 18
      }
    ]
  });

  // GSTR-2B Reconciliation State
  const [reconciliationData, setReconciliationData] = useState<{ summary: any; reconciledRecords: any[] } | null>(null);

  // Purchase Requisitions & Debit Notes State
  const [requisitions, setRequisitions] = useState<any[]>([]);
  const [debitNotes, setDebitNotes] = useState<any[]>([]);
  const [showReqModal, setShowReqModal] = useState(false);
  const [showDnModal, setShowDnModal] = useState(false);

  const [reqForm, setReqForm] = useState({
    department: 'Cloud Infrastructure & DevOps',
    requestedBy: 'Sameer Sen (Infra Lead)',
    requiredDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
    priority: 'High' as const,
    estimatedCost: 360000,
    items: [{ itemName: 'Cisco Catalyst 9300 48-Port PoE+ Switch', quantity: 2, estimatedRate: 180000 }]
  });

  const [dnForm, setDnForm] = useState({
    originalBillNo: 'PUR-2026-061',
    supplierName: 'Dell Technologies Enterprise India Pvt Ltd',
    supplierGstin: '29AABCD1029Q1Z8',
    reason: 'Purchase Return' as const,
    items: [{ itemName: 'Damaged Packing Return - 1.92TB NVMe', quantity: 1, unitCost: 24000, taxRate: 18 }]
  });
  const [recFilter, setRecFilter] = useState<'ALL' | 'MATCHED' | 'MISSING_IN_BOOKS' | 'MISSING_IN_2B'>('ALL');
  const [recLoading, setRecLoading] = useState(false);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<PurchaseEntry | null>(null);
  const [paymentModalPurchase, setPaymentModalPurchase] = useState<PurchaseEntry | null>(null);
  const [showSupplierModal, setShowSupplierModal] = useState(false);

  // Supplier Form
  const [supplierForm, setSupplierForm] = useState({
    name: '',
    contactName: '',
    email: '',
    phone: '',
    address: 'Bangalore',
    gstin: ''
  });

  // Payment Form
  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    bankAccount: 'HDFC Corporate Operating A/C',
    mode: 'RTGS',
    utrRef: ''
  });

  // Create Purchase Entry Form
  const [purchaseForm, setPurchaseForm] = useState({
    supplierName: 'Dell Technologies Enterprise India Pvt Ltd',
    supplierGstin: '29AABCD1029Q1Z8',
    supplierInvoiceNo: '',
    supplierInvoiceDate: new Date().toISOString().split('T')[0],
    purchaseOrderRef: 'PO-2026-061',
    grnRef: 'GRN-BLR-1200',
    warehouse: 'Bangalore Central Tech Hub (Rack A-12)',
    dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    paymentTerms: 'Net 30',
    freightCharges: 0,
    tdsRate: 0.1,
    autoUpdateStock: true,
    items: [
      {
        itemName: 'Enterprise NVMe High Speed Storage 1.92TB',
        hsnCode: '847170',
        quantity: 5,
        unit: 'Units',
        unitCost: 24000,
        taxRate: 18,
        itcEligibility: 'Eligible' as const
      }
    ]
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [purRes, sumRes, supRes] = await Promise.all([
        axios.get(`${API_BASE}/api/erp/purchases`),
        axios.get(`${API_BASE}/api/erp/purchases-summary`),
        axios.get(`${API_BASE}/api/erp/suppliers`)
      ]);
      setPurchases(purRes.data);
      setSummary(sumRes.data);
      setSuppliers(supRes.data);

      try {
        const poRes = await axios.get(`${API_BASE}/api/erp/accounting/purchase-orders`);
        setPurchaseOrders(poRes.data);
      } catch (e) {
        console.error('Failed to load POs', e);
      }

      try {
        const [recRes, prRes, dnRes] = await Promise.all([
          axios.get(`${API_BASE}/api/erp/accounting/gst/reconciliation-2b`),
          axios.get(`${API_BASE}/api/erp/accounting/purchase-requisitions`),
          axios.get(`${API_BASE}/api/erp/accounting/debit-notes`)
        ]);
        setReconciliationData(recRes.data);
        setRequisitions(prRes.data || []);
        setDebitNotes(dnRes.data || []);
      } catch (e) {
        console.error('Failed to load 2B/requisitions/debit notes', e);
      }
    } catch (err) {
      console.error('Failed to load purchase entries', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Items manipulation
  const addItemRow = () => {
    setPurchaseForm({
      ...purchaseForm,
      items: [
        ...purchaseForm.items,
        {
          itemName: '',
          hsnCode: '847100',
          quantity: 1,
          unit: 'Units',
          unitCost: 5000,
          taxRate: 18,
          itcEligibility: 'Eligible'
        }
      ]
    });
  };

  const removeItemRow = (idx: number) => {
    if (purchaseForm.items.length <= 1) return;
    setPurchaseForm({
      ...purchaseForm,
      items: purchaseForm.items.filter((_, i) => i !== idx)
    });
  };

  const updateItemRow = (idx: number, field: keyof PurchaseItem, val: any) => {
    const updated = [...purchaseForm.items];
    updated[idx] = { ...updated[idx], [field]: val };
    setPurchaseForm({ ...purchaseForm, items: updated });
  };

  const calculateFormTotals = () => {
    let subtotal = 0;
    let taxTotal = 0;

    purchaseForm.items.forEach(item => {
      const qty = Number(item.quantity) || 0;
      const cost = Number(item.unitCost) || 0;
      const taxRate = Number(item.taxRate) || 0;

      const raw = qty * cost;
      const tax = raw * (taxRate / 100);

      subtotal += raw;
      taxTotal += tax;
    });

    const freight = Number(purchaseForm.freightCharges) || 0;
    const tdsDeduction = Math.round(subtotal * (Number(purchaseForm.tdsRate) / 100));
    const total = subtotal + taxTotal + freight - tdsDeduction;

    return {
      subtotal: Math.round(subtotal),
      taxTotal: Math.round(taxTotal),
      freight,
      tdsDeduction,
      total: Math.round(total)
    };
  };

  // Submit Purchase Entry
  const handleCreatePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/api/erp/purchases`, purchaseForm);
      setShowCreateModal(false);
      fetchData();
      alert('Purchase entry recorded successfully! Stock count updated in inventory catalog.');
    } catch (err) {
      console.error('Failed to create purchase entry', err);
      alert('Error creating purchase entry');
    }
  };

  // Universal CRUD Handlers
  const handleOpenEditPurchase = (pur: any) => {
    setEditingPurchase(pur);
    setEditPurchaseForm({
      supplierName: pur.supplierName,
      supplierInvoiceNo: pur.supplierInvoiceNo,
      supplierInvoiceDate: pur.supplierInvoiceDate,
      dueDate: pur.dueDate,
      totalAmount: pur.totalAmount,
      status: pur.status,
      notes: pur.notes || ''
    });
    setShowEditPurchaseModal(true);
  };

  const handleEditPurchaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(`${API_BASE}/api/erp/purchases/${editingPurchase.id}`, editPurchaseForm);
      setShowEditPurchaseModal(false);
      alert('Purchase entry updated successfully!');
      fetchData();
    } catch (err) {
      alert('Failed to update purchase entry');
    }
  };

  const handleOpenEditSupplier = (s: any) => {
    setEditingSupplier(s);
    setEditSupplierForm({
      name: s.name,
      contactName: s.contactPerson || s.contactName || '',
      email: s.email || '',
      phone: s.phone || '',
      address: s.address || s.city || 'Bangalore',
      gstin: s.gstin || ''
    });
    setShowEditSupplierModal(true);
  };

  const handleEditSupplierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(`${API_BASE}/api/erp/accounting/suppliers/${editingSupplier.id}`, editSupplierForm);
      setShowEditSupplierModal(false);
      alert('Supplier updated successfully!');
      fetchData();
    } catch (err) {
      alert('Failed to update supplier');
    }
  };

  const handleOpenEditPo = (po: any) => {
    setEditingPo(po);
    setEditPoForm({
      supplierName: po.supplierName,
      deliveryDate: po.deliveryDate,
      totalAmount: po.totalAmount,
      status: po.status
    });
    setShowEditPoModal(true);
  };

  const handleEditPoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(`${API_BASE}/api/erp/accounting/purchase-orders/${editingPo.id}`, editPoForm);
      setShowEditPoModal(false);
      alert('Purchase order updated successfully!');
      fetchData();
    } catch (err) {
      alert('Failed to update purchase order');
    }
  };

  const handleDeleteReq = async (id: string, num: string) => {
    if (!confirm(`Delete Requisition ${num}?`)) return;
    try {
      await axios.delete(`${API_BASE}/api/erp/accounting/purchase-requisitions/${id}`);
      alert(`Requisition ${num} deleted!`);
      fetchData();
    } catch (err) {
      alert('Failed to delete requisition');
    }
  };

  const handleOpenEditReq = (reqItem: any) => {
    setEditingReq(reqItem);
    setEditReqForm({
      department: reqItem.department,
      requestedBy: reqItem.requestedBy,
      estimatedCost: reqItem.estimatedCost,
      priority: reqItem.priority,
      status: reqItem.status
    });
    setShowEditReqModal(true);
  };

  const handleEditReqSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(`${API_BASE}/api/erp/accounting/purchase-requisitions/${editingReq.id}`, editReqForm);
      setShowEditReqModal(false);
      alert('Requisition updated successfully!');
      fetchData();
    } catch (err) {
      alert('Failed to update requisition');
    }
  };

  const handleDeleteDn = async (id: string, num: string) => {
    if (!confirm(`Delete Debit Note ${num}?`)) return;
    try {
      await axios.delete(`${API_BASE}/api/erp/accounting/debit-notes/${id}`);
      alert(`Debit Note ${num} deleted!`);
      fetchData();
    } catch (err) {
      alert('Failed to delete debit note');
    }
  };

  const handleOpenEditDn = (dn: any) => {
    setEditingDn(dn);
    setEditDnForm({
      supplierName: dn.supplierName,
      reason: dn.reason,
      totalAmount: dn.totalAmount,
      status: dn.status
    });
    setShowEditDnModal(true);
  };

  const handleEditDnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(`${API_BASE}/api/erp/accounting/debit-notes/${editingDn.id}`, editDnForm);
      setShowEditDnModal(false);
      alert('Debit Note updated successfully!');
      fetchData();
    } catch (err) {
      alert('Failed to update debit note');
    }
  };

  // Delete Purchase Entry
  const handleDeletePurchase = async (id: string, voucherNo: string) => {
    if (!window.confirm(`Are you sure you want to delete purchase entry ${voucherNo}?`)) return;
    try {
      await axios.delete(`${API_BASE}/api/erp/purchases/${id}`);
      if (selectedPurchase?.id === id) setSelectedPurchase(null);
      fetchData();
    } catch (err) {
      console.error('Failed to delete purchase entry', err);
      alert('Error deleting purchase entry');
    }
  };

  // Record Payment
  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalPurchase) return;
    try {
      await axios.post(`${API_BASE}/api/erp/purchases/${paymentModalPurchase.id}/pay`, paymentForm);
      setPaymentModalPurchase(null);
      fetchData();
      alert('Vendor payment recorded and ledger reconciled!');
    } catch (err) {
      console.error('Failed to record payment', err);
      alert('Error recording payment');
    }
  };

  // Submit Supplier
  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/api/erp/suppliers`, supplierForm);
      setShowSupplierModal(false);
      setSupplierForm({ name: '', contactName: '', email: '', phone: '', address: 'Bangalore', gstin: '' });
      fetchData();
      alert('Vendor registered successfully!');
    } catch (err) {
      console.error('Failed to create supplier', err);
    }
  };

  // Delete Supplier
  const handleDeleteSupplier = async (id: string, name: string) => {
    if (!window.confirm(`Delete supplier "${name}"?`)) return;
    try {
      await axios.delete(`${API_BASE}/api/erp/suppliers/${id}`);
      fetchData();
    } catch (err) {
      console.error('Failed to delete supplier', err);
    }
  };

  // PO Handlers
  const addPoItemRow = () => {
    setPoForm({
      ...poForm,
      items: [
        ...poForm.items,
        { itemName: '', hsnCode: '847100', quantity: 1, unit: 'Units', unitCost: 5000, taxRate: 18 }
      ]
    });
  };

  const removePoItemRow = (idx: number) => {
    if (poForm.items.length <= 1) return;
    setPoForm({
      ...poForm,
      items: poForm.items.filter((_, i) => i !== idx)
    });
  };

  const updatePoItemRow = (idx: number, field: string, val: any) => {
    const updated = [...poForm.items];
    updated[idx] = { ...updated[idx], [field]: val };
    setPoForm({ ...poForm, items: updated });
  };

  const calculatePoTotals = () => {
    let subtotal = 0;
    let taxTotal = 0;
    poForm.items.forEach(itm => {
      const q = Number(itm.quantity) || 0;
      const c = Number(itm.unitCost) || 0;
      const tr = Number(itm.taxRate) || 0;
      const line = q * c;
      subtotal += line;
      taxTotal += line * (tr / 100);
    });
    const freight = Number(poForm.freightEstimate) || 0;
    return {
      subtotal: Math.round(subtotal),
      taxTotal: Math.round(taxTotal),
      freight,
      total: Math.round(subtotal + taxTotal + freight)
    };
  };

  const handleCreatePo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/api/erp/accounting/purchase-orders`, poForm);
      setShowPoModal(false);
      fetchData();
      alert('Purchase Order issued successfully! Sent to vendor.');
    } catch (err) {
      console.error('Failed to issue PO', err);
      alert('Error creating purchase order');
    }
  };

  const handleDeletePo = async (id: string, poNum: string) => {
    if (!window.confirm(`Delete Purchase Order ${poNum}?`)) return;
    try {
      await axios.delete(`${API_BASE}/api/erp/accounting/purchase-orders/${id}`);
      fetchData();
    } catch (err) {
      console.error('Failed to delete PO', err);
    }
  };

  const handleConvertToPurchaseBill = async (id: string, poNum: string) => {
    if (!window.confirm(`Convert Purchase Order ${poNum} into an official Purchase Bill / GRN?\nThis will automatically update Stock in Godown and record COGS & Accounts Payable in Books.`)) return;
    try {
      const res = await axios.post(`${API_BASE}/api/erp/accounting/purchase-orders/${id}/convert-to-purchase-bill`);
      alert(`PO converted successfully to Purchase Voucher ${res.data.purchaseVoucher?.voucherNo || ''}! Stock and Accounts Payable have been automatically updated.`);
      await fetchData();
      setActiveTab('entries');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to convert PO to Purchase Bill');
    }
  };

  // Requisition & Debit Note Handlers
  const handleCreateRequisition = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/api/erp/accounting/purchase-requisitions`, reqForm);
      setShowReqModal(false);
      alert('Internal Purchase Requisition submitted for approval!');
      fetchData();
    } catch (err) {
      alert('Failed to submit requisition');
    }
  };

  const handleCreateDebitNote = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/api/erp/accounting/debit-notes`, dnForm);
      setShowDnModal(false);
      alert('Debit Note issued to supplier! Accounts payable adjusted.');
      fetchData();
    } catch (err) {
      alert('Failed to issue debit note');
    }
  };

  // 2B Reconciliation Handlers
  const handleImport2bMissing = async (record: any) => {
    try {
      await axios.post(`${API_BASE}/api/erp/accounting/gst/reconciliation-2b/import-missing`, { id: record.id });
      alert(`Successfully imported invoice ${record.invoiceNumber} from GSTR-2B portal into Books! ITC claimed.`);
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to import 2B invoice');
    }
  };

  const handleSendVendorWhatsAppAlert = (record: any) => {
    const itcAmount = (record.igst + record.cgst + record.sgst) || 0;
    const msg = encodeURIComponent(
      `*URGENT: GST ITC COMPLIANCE NOTICE*\n\n` +
      `Dear ${record.supplierName},\n` +
      `We noted that your Invoice *${record.invoiceNumber}* dated *${record.invoiceDate}* (Invoice Value: ₹${record.invoiceValue?.toLocaleString()}) has *NOT* appeared in our GSTR-2B portal statement.\n\n` +
      `Eligible Input Tax Credit at risk: *₹${itcAmount.toLocaleString()}*.\n\n` +
      `Under Section 16(2)(aa) of the CGST Act, we cannot claim ITC unless you file your GSTR-1. Kindly file promptly to avoid vendor payment hold.\n\n` +
      `- Accounts & Taxation Dept`
    );
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  const filteredPurchases = purchases.filter(p => {
    const matchesStatus = statusFilter === 'All' || p.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesSearch = p.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.voucherNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.supplierInvoiceNo.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Partially Paid':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Pending Payment':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Verified':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <ERPNavigation />

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
            <ShoppingCart className="w-4 h-4" />
            <span>Procurement &amp; Inward Logistics</span>
            <span>•</span>
            <span className="text-emerald-600 font-bold">GST GSTR-2B ITC Compatible</span>
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Purchase Entry Software</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Book supplier invoices, record GRN receipts, capture Input Tax Credit (ITC), auto-increment stock, and manage accounts payable.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowSupplierModal(true)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors flex items-center shadow-xs"
          >
            <Building2 className="w-4 h-4 mr-1.5 text-indigo-600" /> + Add Vendor
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center shadow-sm"
          >
            <Plus className="w-4 h-4 mr-1.5" /> + Record Purchase Entry
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Purchases</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-gray-900">₹{summary.totalPurchases.toLocaleString()}</h3>
            <p className="text-[11px] text-gray-500 mt-1 flex items-center">
              <span className="text-emerald-600 font-bold mr-1">✓ {summary.totalCount} Vouchers</span> booked
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Vendor Payables Pending</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-amber-600">₹{summary.totalPayables.toLocaleString()}</h3>
            <p className="text-[11px] text-gray-500 mt-1">Pending disbursement to suppliers</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Available Input Tax Credit (ITC)</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-emerald-600">₹{summary.availableITC.toLocaleString()}</h3>
            <p className="text-[11px] text-gray-500 mt-1">GST offset balance in GSTR-2B</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active Suppliers</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-purple-600">{suppliers.length}</h3>
            <p className="text-[11px] text-gray-500 mt-1">Verified enterprise partners</p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-gray-200 gap-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('entries')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'entries' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Receipt className="w-4 h-4" /> Purchase Entries ({purchases.length})
        </button>
        <button
          onClick={() => setActiveTab('purchaseOrders')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'purchaseOrders' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <ShoppingCart className="w-4 h-4" /> Purchase Orders ({purchaseOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('requisitions')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'requisitions' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <FileText className="w-4 h-4 text-purple-600" /> Requisitions ({requisitions.length})
        </button>
        <button
          onClick={() => setActiveTab('debitNotes')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'debitNotes' ? 'border-rose-600 text-rose-600' : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <ArrowUpRight className="w-4 h-4 text-rose-600" /> Debit Notes (Returns) ({debitNotes.length})
        </button>
        <button
          onClick={() => setActiveTab('gstr2b')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'gstr2b' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Sparkles className="w-4 h-4 text-indigo-600" /> GSTR-2B vs. Books ITC Reconciliation
        </button>
        <button
          onClick={() => setActiveTab('suppliers')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'suppliers' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Building2 className="w-4 h-4" /> Vendor Directory &amp; Payables ({suppliers.length})
        </button>
        <button
          onClick={() => setActiveTab('itc')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'itc' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" /> GST Input Tax Credit (ITC) Ledger
        </button>
      </div>

      {/* ================= TAB 1: PURCHASE ENTRIES ================= */}
      {activeTab === 'entries' && (
        <div className="space-y-4">
          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-gray-200">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search vendor, voucher # or bill #..."
                className="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
              {['All', 'Paid', 'Partially Paid', 'Pending Payment', 'Verified'].map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                    statusFilter === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Voucher &amp; Bill Ref</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Vendor &amp; GSTIN</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">GRN &amp; Warehouse</th>
                  <th className="px-6 py-3.5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Total &amp; Payables</th>
                  <th className="px-6 py-3.5 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3.5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 text-xs">
                {filteredPurchases.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                      <ShoppingCart className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <p className="font-semibold text-gray-600 text-sm">No purchase entries recorded</p>
                      <p className="text-xs text-gray-400 mt-1">Click "+ Record Purchase Entry" to book supplier invoices.</p>
                    </td>
                  </tr>
                ) : (
                  filteredPurchases.map(pur => (
                    <tr key={pur.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                            <Receipt className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 block">{pur.voucherNo}</span>
                            <span className="text-[10px] text-gray-500 font-mono">Bill #{pur.supplierInvoiceNo}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{pur.supplierName}</div>
                        <div className="text-[11px] text-gray-500 font-mono">
                          {pur.supplierGstin || 'Unregistered'} • {pur.supplierInvoiceDate}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-800">{pur.grnRef}</div>
                        <div className="text-[11px] text-gray-500 truncate max-w-xs">{pur.warehouse}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="font-bold text-gray-900 text-sm">₹{pur.totalAmount.toLocaleString()}</div>
                        {pur.balanceDue > 0 ? (
                          <div className="text-[11px] text-amber-600 font-semibold">Payable: ₹{pur.balanceDue.toLocaleString()}</div>
                        ) : (
                          <div className="text-[11px] text-emerald-600 font-bold">Settled in full</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusBadge(pur.status)}`}>
                          {pur.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right space-x-1">
                        <button
                          onClick={() => setSelectedPurchase(pur)}
                          title="View / Print Purchase Voucher"
                          className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {pur.balanceDue > 0 && (
                          <button
                            onClick={() => {
                              setPaymentModalPurchase(pur);
                              setPaymentForm({
                                amount: pur.balanceDue,
                                bankAccount: 'HDFC Corporate Operating A/C',
                                mode: 'RTGS',
                                utrRef: ''
                              });
                            }}
                            title="Pay Supplier"
                            className="p-1.5 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          >
                            <CreditCard className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenEditPurchase(pur)}
                          title="Edit Purchase Entry"
                          className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePurchase(pur.id, pur.voucherNo)}
                          title="Delete Purchase Entry"
                          className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
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

      
            {/* ================= TAB: PURCHASE ORDERS ================= */}
      {activeTab === 'purchaseOrders' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Filter:</span>
              {['All', 'Sent to Supplier', 'Partially Received', 'Completed'].map(st => (
                <button
                  key={st}
                  onClick={() => setPoFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    poFilter === st ? 'bg-blue-600 text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowPoModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-1.5" /> + Create Purchase Order
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-black uppercase text-gray-500 tracking-wider">
                    <th className="py-3 px-4">PO Number</th>
                    <th className="py-3 px-4">Vendor</th>
                    <th className="py-3 px-4">Issue Date</th>
                    <th className="py-3 px-4">Expected Delivery</th>
                    <th className="py-3 px-4 text-right">PO Total Amount</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {purchaseOrders
                    .filter(po => poFilter === 'All' || po.status === poFilter)
                    .map(po => (
                      <tr key={po.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-blue-600">{po.poNumber}</td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-gray-900">{po.supplierName}</p>
                          <p className="text-[10px] text-gray-400 font-mono">{po.supplierEmail || 'vendor@enterprise.in'}</p>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-gray-700">{po.orderDate || po.createdAt?.split('T')[0]}</td>
                        <td className="py-3.5 px-4 font-mono text-gray-700">{po.deliveryDate || 'Within 14 Days'}</td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-gray-900">₹{po.totalAmount?.toLocaleString()}</td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] uppercase ${
                            po.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                            po.status === 'Sent to Supplier' ? 'bg-blue-100 text-blue-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {po.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center space-x-1 whitespace-nowrap">
                          <button
                            onClick={() => handleConvertToPurchaseBill(po.id, po.poNumber)}
                            className="p-1.5 text-emerald-600 hover:text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer"
                            title="Convert to Purchase Bill"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEditPo(po)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                            title="Edit Purchase Order"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeletePo(po.id, po.poNumber)}
                            className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete Purchase Order"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  {purchaseOrders.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-gray-400">
                        No purchase orders found matching selected filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB: PURCHASE REQUISITIONS ================= */}
      {activeTab === 'requisitions' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Internal Purchase Requisitions</h3>
              <p className="text-xs text-gray-500">Department requests for materials and services requiring PO approval</p>
            </div>
            <button
              onClick={() => setShowReqModal(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" /> + Create Requisition
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-black uppercase text-gray-500 tracking-wider">
                    <th className="py-3 px-4">PR Number</th>
                    <th className="py-3 px-4">Department / Requested By</th>
                    <th className="py-3 px-4">Required Date</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4 text-right">Estimated Cost</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {requisitions.map(r => (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-purple-600">{r.reqNumber}</td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-gray-900">{r.department}</p>
                        <p className="text-[10px] text-gray-400">{r.requestedBy}</p>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-gray-700">{r.requiredDate}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          r.priority === 'High' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {r.priority} Priority
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-gray-900">₹{r.estimatedCost?.toLocaleString()}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px] uppercase">
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenEditReq(r)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                          title="Edit Requisition"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteReq(r.id, r.reqNumber)}
                          className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Requisition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {requisitions.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-gray-400">
                        No purchase requisitions pending.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB: DEBIT NOTES ================= */}
      {activeTab === 'debitNotes' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Debit Notes Register (Purchase Returns)</h3>
              <p className="text-xs text-gray-500">Record supplier purchase returns, material rejections, or debit adjustments</p>
            </div>
            <button
              onClick={() => setShowDnModal(true)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" /> + Issue Debit Note
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-black uppercase text-gray-500 tracking-wider">
                    <th className="py-3 px-4">Note Number</th>
                    <th className="py-3 px-4">Original Purchase Bill</th>
                    <th className="py-3 px-4">Supplier &amp; GSTIN</th>
                    <th className="py-3 px-4">Return Reason</th>
                    <th className="py-3 px-4 text-right">Taxable Adjustment</th>
                    <th className="py-3 px-4 text-right">Total Debit Amount</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {debitNotes.map(dn => (
                    <tr key={dn.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-rose-600">{dn.noteNumber}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600">{dn.originalBillNo}</td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-gray-900">{dn.supplierName}</p>
                        <p className="text-[10px] font-mono text-gray-400">{dn.supplierGstin}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded font-semibold text-[10px]">
                          {dn.reason}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-gray-700">₹{dn.subtotal?.toLocaleString()}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-rose-600">₹{dn.totalAmount?.toLocaleString()}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px] uppercase">
                          {dn.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenEditDn(dn)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                          title="Edit Debit Note"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteDn(dn.id, dn.noteNumber)}
                          className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Debit Note"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {debitNotes.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-gray-400">
                        No debit notes recorded.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB: GSTR-2B vs BOOKS ITC RECONCILIATION ================= */}
      {activeTab === 'gstr2b' && (
        <div className="space-y-6">
          {/* Summary Dashboard Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Eligible 2B ITC</p>
              <h3 className="text-xl font-black text-emerald-600 mt-1">₹{reconciliationData?.summary?.eligibleItc?.toLocaleString() || '1,42,850'}</h3>
              <p className="text-[10px] text-gray-500 mt-1">GSTR-2B Portal Records</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Ineligible ITC</p>
              <h3 className="text-xl font-black text-rose-600 mt-1">₹{reconciliationData?.summary?.ineligibleItc?.toLocaleString() || '18,400'}</h3>
              <p className="text-[10px] text-gray-500 mt-1">Sec 17(5) Blocked Credits</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Reconciled / Matched</p>
              <h3 className="text-xl font-black text-blue-600 mt-1">{reconciliationData?.summary?.matchedCount || 14} Records</h3>
              <p className="text-[10px] text-gray-500 mt-1">100% Tax &amp; Value Alignment</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Missing in Books</p>
              <h3 className="text-xl font-black text-amber-600 mt-1">{reconciliationData?.summary?.missingInBooksCount || 3} Bills</h3>
              <p className="text-[10px] text-gray-500 mt-1">In 2B but not in ERP Books</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Value Mismatch</p>
              <h3 className="text-xl font-black text-purple-600 mt-1">{reconciliationData?.summary?.mismatchCount || 2} Bills</h3>
              <p className="text-[10px] text-gray-500 mt-1">Discrepancy in Tax/Amount</p>
            </div>
          </div>

          {/* Reconciliation Table */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h4 className="text-sm font-bold text-gray-900">GSTR-2B vs. Books Invoices Ledger</h4>
                <p className="text-xs text-gray-500">Cross-verified against official GSTN auto-populated return</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-black uppercase text-gray-500 tracking-wider">
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-4">Supplier Name</th>
                    <th className="py-3 px-4 text-right">2B Amount</th>
                    <th className="py-3 px-4 text-right">Books Amount</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {reconciliationData?.reconciledRecords && reconciliationData.reconciledRecords.length > 0 ? (
                    reconciliationData.reconciledRecords.map((rec: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-blue-600">{rec.invoiceNumber || rec.invoiceNo}</td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-gray-900">{rec.supplierName}</p>
                          <p className="text-[10px] text-gray-400 font-mono">{rec.supplierGstin}</p>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-semibold text-gray-800">
                          ₹{rec.twoBAmount?.toLocaleString() || rec.taxableValue?.toLocaleString() || '0'}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-semibold text-gray-800">
                          ₹{rec.booksAmount?.toLocaleString() || '0'}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] uppercase ${
                            rec.status === 'Matched' ? 'bg-emerald-100 text-emerald-800' :
                            rec.status === 'Missing in Books' ? 'bg-amber-100 text-amber-800' :
                            'bg-rose-100 text-rose-800'
                          }`}>
                            {rec.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center space-x-1 whitespace-nowrap">
                          {rec.status === 'Missing in Books' && (
                            <button
                              onClick={() => handleImport2bMissing(rec)}
                              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold text-[10px] shadow-xs cursor-pointer"
                            >
                              Import to Books
                            </button>
                          )}
                          {rec.status !== 'Matched' && (
                            <button
                              onClick={() => handleSendVendorWhatsAppAlert(rec)}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                              title="Send WhatsApp Alert to Vendor"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-gray-400">
                        No reconciliation records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}


      {/* ================= TAB 2: VENDOR DIRECTORY ================= */}
      {activeTab === 'suppliers' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200">
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Approved Suppliers &amp; Vendor Ledger</h3>
              <p className="text-xs text-gray-500">Manage registered vendor partners, GSTIN profiles, and terms.</p>
            </div>
            <button
              onClick={() => setShowSupplierModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add New Supplier
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suppliers.map(s => (
              <div key={s.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                      Active Vendor
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditSupplier(s)}
                        className="text-gray-400 hover:text-blue-600 p-1"
                        title="Edit Supplier"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteSupplier(s.id, s.name)}
                        className="text-gray-400 hover:text-rose-600 p-1"
                        title="Delete Supplier"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <h4 className="font-bold text-gray-900 text-sm">{s.name}</h4>
                  <p className="text-xs text-gray-500 mt-1">Contact: {s.contactPerson || s.contactName || 'Procurement Team'}</p>
                  <p className="text-[11px] text-gray-500 font-mono mt-0.5">{s.email || 'vendor@enterprise.in'}</p>
                  <p className="text-[11px] text-gray-500 font-mono">{s.phone || '+91 80 4400 9900'}</p>

                  <div className="mt-4 pt-3 border-t border-slate-100 text-xs">
                    <div className="flex justify-between text-gray-500">
                      <span>GSTIN:</span>
                      <strong className="text-gray-800 font-mono">{s.gstin || '29AABCD1029Q1Z8'}</strong>
                    </div>
                    <div className="flex justify-between text-gray-500 mt-1">
                      <span>Location:</span>
                      <strong className="text-gray-800">{s.city || s.address || 'Bangalore'}</strong>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-gray-400">Terms: Net 30</span>
                  <button
                    onClick={() => {
                      setPurchaseForm({
                        ...purchaseForm,
                        supplierName: s.name,
                        supplierGstin: s.gstin || '29AABCD1029Q1Z8'
                      });
                      setShowCreateModal(true);
                    }}
                    className="text-blue-600 font-bold hover:underline"
                  >
                    + Book Purchase Bill
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 3: ITC LEDGER ================= */}
      {activeTab === 'itc' && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-900 text-sm mb-1">GSTR-2B Input Tax Credit (ITC) Summary</h3>
            <p className="text-xs text-gray-500 mb-6">
              Total input tax credit available from inward supplier bills to offset output GST liability.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <span className="text-xs font-bold text-emerald-800 uppercase block">Total Available ITC</span>
                <strong className="text-2xl font-black text-emerald-700 mt-1 block">
                  ₹{summary.availableITC.toLocaleString()}
                </strong>
                <span className="text-[11px] text-emerald-600">Eligible to offset against output tax</span>
              </div>
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <span className="text-xs font-bold text-blue-800 uppercase block">Capital Goods ITC</span>
                <strong className="text-2xl font-black text-blue-700 mt-1 block">
                  ₹{Math.round(summary.availableITC * 0.65).toLocaleString()}
                </strong>
                <span className="text-[11px] text-blue-600">Servers, switches, laptops &amp; machinery</span>
              </div>
              <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                <span className="text-xs font-bold text-indigo-800 uppercase block">Inputs &amp; Services ITC</span>
                <strong className="text-2xl font-black text-indigo-700 mt-1 block">
                  ₹{Math.round(summary.availableITC * 0.35).toLocaleString()}
                </strong>
                <span className="text-[11px] text-indigo-600">Components, cloud licenses &amp; storage</span>
              </div>
            </div>

            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <table className="min-w-full text-xs divide-y divide-gray-200">
                <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-4 text-left">Supplier</th>
                    <th className="py-2.5 px-4 text-left">Bill No &amp; Date</th>
                    <th className="py-2.5 px-4 text-center">Eligibility Category</th>
                    <th className="py-2.5 px-4 text-right">Taxable Value</th>
                    <th className="py-2.5 px-4 text-right">ITC Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {purchases.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-bold text-gray-900">{p.supplierName}</td>
                      <td className="py-3 px-4 text-gray-500 font-mono">{p.supplierInvoiceNo} • {p.supplierInvoiceDate}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Eligible ITC
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono">₹{p.subtotal.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-700 font-mono">₹{p.taxTotal.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: RECORD PURCHASE ENTRY ================= */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-[880px] max-w-full max-h-[92vh] overflow-y-auto p-6 md:p-8">
            <div className="flex justify-between items-start mb-6 pb-4 border-b border-gray-100">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Procurement Inward Entry</span>
                <h3 className="text-xl font-black text-gray-900">Record Vendor Purchase Bill &amp; GRN</h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePurchase} className="space-y-6">
              {/* Vendor & Invoice Meta */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Select Supplier *</label>
                  <input
                    required
                    placeholder="Supplier / Vendor Name"
                    value={purchaseForm.supplierName}
                    onChange={e => setPurchaseForm({ ...purchaseForm, supplierName: e.target.value })}
                    className="w-full text-xs border border-gray-300 rounded-xl p-2.5 bg-white font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Supplier GSTIN</label>
                  <input
                    placeholder="e.g. 29AABCD1029Q1Z8"
                    value={purchaseForm.supplierGstin}
                    onChange={e => setPurchaseForm({ ...purchaseForm, supplierGstin: e.target.value })}
                    className="w-full text-xs border border-gray-300 rounded-xl p-2.5 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Supplier Invoice / Bill No *</label>
                  <input
                    required
                    placeholder="e.g. BILL-98212"
                    value={purchaseForm.supplierInvoiceNo}
                    onChange={e => setPurchaseForm({ ...purchaseForm, supplierInvoiceNo: e.target.value })}
                    className="w-full text-xs border border-gray-300 rounded-xl p-2.5 bg-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Bill Date</label>
                  <input
                    type="date"
                    required
                    value={purchaseForm.supplierInvoiceDate}
                    onChange={e => setPurchaseForm({ ...purchaseForm, supplierInvoiceDate: e.target.value })}
                    className="w-full text-xs border border-gray-300 rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Purchase Order (PO) Ref</label>
                  <input
                    placeholder="PO-2026-061"
                    value={purchaseForm.purchaseOrderRef}
                    onChange={e => setPurchaseForm({ ...purchaseForm, purchaseOrderRef: e.target.value })}
                    className="w-full text-xs border border-gray-300 rounded-xl p-2.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">GRN / Delivery Challan</label>
                  <input
                    placeholder="GRN-BLR-1200"
                    value={purchaseForm.grnRef}
                    onChange={e => setPurchaseForm({ ...purchaseForm, grnRef: e.target.value })}
                    className="w-full text-xs border border-gray-300 rounded-xl p-2.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={purchaseForm.dueDate}
                    onChange={e => setPurchaseForm({ ...purchaseForm, dueDate: e.target.value })}
                    className="w-full text-xs border border-gray-300 rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Warehouse / Destination Facility</label>
                <input
                  value={purchaseForm.warehouse}
                  onChange={e => setPurchaseForm({ ...purchaseForm, warehouse: e.target.value })}
                  placeholder="e.g. Bangalore Central Tech Hub (Server Room A)"
                  className="w-full text-xs border border-gray-300 rounded-xl p-2.5 bg-white"
                />
              </div>

              {/* Auto Stock Addition Callout */}
              <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Package className="w-5 h-5 text-emerald-600" />
                  <div>
                    <strong className="text-xs text-emerald-900 block">Automatic Inventory Stock Increment</strong>
                    <span className="text-[11px] text-emerald-700">Add received quantities directly to enterprise inventory catalog.</span>
                  </div>
                </div>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={purchaseForm.autoUpdateStock}
                    onChange={e => setPurchaseForm({ ...purchaseForm, autoUpdateStock: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                </label>
              </div>

              {/* Items List */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold text-xs text-gray-700 uppercase">Received Goods &amp; Hardware</h4>
                  <button
                    type="button"
                    onClick={addItemRow}
                    className="text-xs text-blue-600 font-bold hover:underline flex items-center"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Item Entry
                  </button>
                </div>

                <div className="space-y-2">
                  {purchaseForm.items.map((item, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded-xl border border-gray-200 grid grid-cols-12 gap-2 items-center text-xs">
                      <div className="col-span-4">
                        <input
                          required
                          placeholder="Item Name / SKU"
                          value={item.itemName}
                          onChange={e => updateItemRow(idx, 'itemName', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg p-2 bg-white text-xs"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          placeholder="HSN Code"
                          value={item.hsnCode}
                          onChange={e => updateItemRow(idx, 'hsnCode', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg p-2 bg-white text-xs font-mono"
                        />
                      </div>
                      <div className="col-span-1">
                        <input
                          type="number"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={e => updateItemRow(idx, 'quantity', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg p-2 bg-white text-xs"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          placeholder="Cost (₹)"
                          value={item.unitCost}
                          onChange={e => updateItemRow(idx, 'unitCost', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg p-2 bg-white text-xs"
                        />
                      </div>
                      <div className="col-span-2">
                        <select
                          value={item.taxRate}
                          onChange={e => updateItemRow(idx, 'taxRate', Number(e.target.value))}
                          className="w-full border border-gray-300 rounded-lg p-2 bg-white text-xs"
                        >
                          <option value={0}>0% GST</option>
                          <option value={5}>5% GST</option>
                          <option value={12}>12% GST</option>
                          <option value={18}>18% GST</option>
                          <option value={28}>28% GST</option>
                        </select>
                      </div>
                      <div className="col-span-1 text-center">
                        <button
                          type="button"
                          onClick={() => removeItemRow(idx)}
                          className="text-gray-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary Calculations */}
              {(() => {
                const totals = calculateFormTotals();
                return (
                  <div className="bg-slate-900 text-white p-5 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-xs space-y-1 text-gray-300">
                      <div>Taxable Subtotal: <strong className="text-white">₹{totals.subtotal.toLocaleString()}</strong></div>
                      <div>Input GST (ITC Eligible): <strong className="text-emerald-400">₹{totals.taxTotal.toLocaleString()}</strong></div>
                      <div>TDS Deduction (Sec 194Q - 0.1%): <span className="text-rose-400">- ₹{totals.tdsDeduction.toLocaleString()}</span></div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-400 uppercase font-bold block">Net Payable to Supplier</span>
                      <strong className="text-2xl font-black text-white">₹{totals.total.toLocaleString()}</strong>
                    </div>
                  </div>
                );
              })()}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
                >
                  Save Purchase Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: VIEW PURCHASE VOUCHER ================= */}
      {selectedPurchase && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-[860px] max-w-full max-h-[92vh] overflow-y-auto p-6 md:p-10 flex flex-col justify-between">
            <div>
              {/* Header Actions */}
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100 print:hidden">
                <div className="flex items-center space-x-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusBadge(selectedPurchase.status)}`}>
                    {selectedPurchase.status}
                  </span>
                  <span className="text-xs text-gray-500 font-mono">Voucher: {selectedPurchase.voucherNo}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center shadow-xs"
                  >
                    <Printer className="w-3.5 h-3.5 mr-1.5" /> Print Voucher
                  </button>
                  <button
                    onClick={() => setSelectedPurchase(null)}
                    className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Voucher Sheet */}
              <div className="border border-gray-200 rounded-2xl p-8 space-y-6 bg-white text-gray-800">
                <div className="flex justify-between items-start pb-6 border-b border-gray-200">
                  <div>
                    <span className="text-xs uppercase font-bold tracking-widest text-indigo-600 block">GOODS PURCHASE VOUCHER</span>
                    <h2 className="text-xl font-black text-gray-900 font-mono mt-0.5">{selectedPurchase.voucherNo}</h2>
                    <p className="text-xs text-gray-500 mt-1">Vendor Bill Reference: <strong>{selectedPurchase.supplierInvoiceNo}</strong></p>
                  </div>
                  <div className="text-right text-xs text-gray-600 font-mono space-y-0.5">
                    <div>Bill Date: <strong>{selectedPurchase.supplierInvoiceDate}</strong></div>
                    <div>PO Ref: <strong>{selectedPurchase.purchaseOrderRef}</strong></div>
                    <div>GRN Ref: <strong>{selectedPurchase.grnRef}</strong></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 text-xs bg-slate-50 p-4 rounded-xl">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Vendor Details:</span>
                    <strong className="text-sm font-bold text-gray-900 block">{selectedPurchase.supplierName}</strong>
                    <div className="mt-1 font-mono text-[11px] text-gray-700">
                      GSTIN: <strong>{selectedPurchase.supplierGstin || 'Unregistered'}</strong>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Destination &amp; Credit:</span>
                    <div>Warehouse: <strong>{selectedPurchase.warehouse}</strong></div>
                    <div>Payment Due: <strong>{selectedPurchase.dueDate}</strong> ({selectedPurchase.paymentTerms})</div>
                  </div>
                </div>

                {/* Items */}
                <table className="min-w-full text-xs divide-y divide-gray-200">
                  <thead>
                    <tr className="bg-gray-100/70 text-gray-600 uppercase text-[10px]">
                      <th className="py-2 px-3 text-left">#</th>
                      <th className="py-2 px-3 text-left">Item Description</th>
                      <th className="py-2 px-3 text-center">HSN</th>
                      <th className="py-2 px-3 text-center">Qty</th>
                      <th className="py-2 px-3 text-right">Unit Cost</th>
                      <th className="py-2 px-3 text-right">GST Rate</th>
                      <th className="py-2 px-3 text-right">Line Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {selectedPurchase.items.map((itm, idx) => (
                      <tr key={idx}>
                        <td className="py-3 px-3 text-gray-400 font-mono">{idx + 1}</td>
                        <td className="py-3 px-3 font-medium text-gray-900">{itm.itemName}</td>
                        <td className="py-3 px-3 text-center font-mono text-gray-500">{itm.hsnCode}</td>
                        <td className="py-3 px-3 text-center">{itm.quantity} {itm.unit}</td>
                        <td className="py-3 px-3 text-right font-mono">₹{itm.unitCost.toLocaleString()}</td>
                        <td className="py-3 px-3 text-right font-mono text-gray-600">{itm.taxRate}%</td>
                        <td className="py-3 px-3 text-right font-bold text-gray-900 font-mono">₹{itm.total?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Totals */}
                <div className="flex justify-end pt-4 border-t border-gray-200">
                  <div className="w-72 space-y-1.5 text-right font-mono text-xs">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal:</span>
                      <strong>₹{selectedPurchase.subtotal.toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Input GST (ITC):</span>
                      <strong className="text-emerald-600">₹{selectedPurchase.taxTotal.toLocaleString()}</strong>
                    </div>
                    {selectedPurchase.tdsDeduction > 0 && (
                      <div className="flex justify-between text-rose-600">
                        <span>TDS (Sec 194Q):</span>
                        <strong>- ₹{selectedPurchase.tdsDeduction.toLocaleString()}</strong>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-black text-gray-900 border-t border-gray-200 pt-2">
                      <span>Total Net Payable:</span>
                      <strong>₹{selectedPurchase.totalAmount.toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between text-emerald-600">
                      <span>Paid to Date:</span>
                      <strong>₹{selectedPurchase.paidAmount.toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-amber-600 border-t border-dashed border-gray-200 pt-1">
                      <span>Balance Outstanding:</span>
                      <strong>₹{selectedPurchase.balanceDue.toLocaleString()}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-between items-center pt-4 border-t border-gray-100 print:hidden">
              <button
                onClick={() => handleDeletePurchase(selectedPurchase.id, selectedPurchase.voucherNo)}
                className="text-xs text-rose-600 font-bold hover:underline flex items-center"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete Purchase Entry
              </button>
              <div className="flex gap-2">
                {selectedPurchase.balanceDue > 0 && (
                  <button
                    onClick={() => {
                      setPaymentModalPurchase(selectedPurchase);
                      setPaymentForm({
                        amount: selectedPurchase.balanceDue,
                        bankAccount: 'HDFC Corporate Operating A/C',
                        mode: 'RTGS',
                        utrRef: ''
                      });
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors"
                  >
                    Pay Supplier
                  </button>
                )}
                <button
                  onClick={() => setSelectedPurchase(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: PAY SUPPLIER ================= */}
      {paymentModalPurchase && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-[480px] max-w-full p-6">
            <h3 className="text-lg font-black text-gray-900 mb-1">Disburse Vendor Payment</h3>
            <p className="text-xs text-gray-500 mb-4">
              Voucher <strong className="text-gray-900">{paymentModalPurchase.voucherNo}</strong> • Balance Payable: ₹{paymentModalPurchase.balanceDue.toLocaleString()}
            </p>

            <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Payment Amount (₹)</label>
                <input
                  type="number"
                  required
                  max={paymentModalPurchase.balanceDue}
                  value={paymentForm.amount}
                  onChange={e => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 font-bold text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Debit From Account</label>
                <select
                  value={paymentForm.bankAccount}
                  onChange={e => setPaymentForm({ ...paymentForm, bankAccount: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 bg-white font-medium"
                >
                  <option>HDFC Corporate Operating A/C (..1122)</option>
                  <option>ICICI Current Commercial A/C (..4451)</option>
                  <option>Axis Bank Treasury A/C (..8920)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Disbursement Mode</label>
                <select
                  value={paymentForm.mode}
                  onChange={e => setPaymentForm({ ...paymentForm, mode: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 bg-white font-medium"
                >
                  <option>RTGS (High Value Transfer)</option>
                  <option>NEFT</option>
                  <option>Corporate Cheque</option>
                  <option>Wire Transfer</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Bank UTR / Transaction Reference *</label>
                <input
                  required
                  placeholder="e.g. HDFCR72026092400981"
                  value={paymentForm.utrRef}
                  onChange={e => setPaymentForm({ ...paymentForm, utrRef: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setPaymentModalPurchase(null)}
                  className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Confirm &amp; Disburse
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD SUPPLIER ================= */}
      {showSupplierModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-[500px] max-w-full p-6">
            <h3 className="text-lg font-black text-gray-900 mb-1">Register New Supplier</h3>
            <p className="text-xs text-gray-500 mb-4">Add vendor profile for procurement invoices and ITC tracking.</p>

            <form onSubmit={handleCreateSupplier} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Supplier Company Name *</label>
                <input
                  required
                  placeholder="e.g. Schneider Electric India"
                  value={supplierForm.name}
                  onChange={e => setSupplierForm({ ...supplierForm, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">GSTIN</label>
                  <input
                    placeholder="29AAAA0000A1Z1"
                    value={supplierForm.gstin}
                    onChange={e => setSupplierForm({ ...supplierForm, gstin: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">City / Region</label>
                  <input
                    placeholder="Bangalore"
                    value={supplierForm.address}
                    onChange={e => setSupplierForm({ ...supplierForm, address: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Contact Person</label>
                  <input
                    placeholder="Karan Mehra"
                    value={supplierForm.contactName}
                    onChange={e => setSupplierForm({ ...supplierForm, contactName: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Phone Number</label>
                  <input
                    placeholder="+91 80 4400 9900"
                    value={supplierForm.phone}
                    onChange={e => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="orders@schneider.in"
                  value={supplierForm.email}
                  onChange={e => setSupplierForm({ ...supplierForm, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowSupplierModal(false)}
                  className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ISSUE PURCHASE ORDER ================= */}
      {showPoModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-[850px] max-w-full max-h-[92vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-black text-gray-900">Issue Purchase Order (PO)</h3>
                <p className="text-xs text-gray-500">Create commercial purchase order with multi-godown allocation</p>
              </div>
              <button onClick={() => setShowPoModal(false)} className="p-1 rounded-full hover:bg-gray-100 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePo} className="space-y-4 pt-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Vendor / Supplier Name *</label>
                  <input
                    required
                    value={poForm.supplierName}
                    onChange={e => setPoForm({ ...poForm, supplierName: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Supplier GSTIN</label>
                  <input
                    value={poForm.supplierGstin}
                    onChange={e => setPoForm({ ...poForm, supplierGstin: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Delivery Godown / Warehouse *</label>
                  <select
                    value={poForm.deliveryWarehouse}
                    onChange={e => setPoForm({ ...poForm, deliveryWarehouse: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 bg-white font-medium"
                  >
                    <option value="Bangalore Central Tech Hub">Bangalore Central Tech Hub</option>
                    <option value="Mumbai Depot">Mumbai Depot</option>
                    <option value="Delhi Distribution Center">Delhi Distribution Center</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">PO Date</label>
                  <input
                    type="date"
                    value={poForm.poDate}
                    onChange={e => setPoForm({ ...poForm, poDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Expected Delivery Date</label>
                  <input
                    type="date"
                    value={poForm.expectedDeliveryDate}
                    onChange={e => setPoForm({ ...poForm, expectedDeliveryDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5"
                  />
                </div>
              </div>

              {/* Items Section */}
              <div className="pt-2">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold text-gray-800">Order Line Items</h4>
                  <button
                    type="button"
                    onClick={addPoItemRow}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Row
                  </button>
                </div>

                <div className="space-y-2">
                  {poForm.items.map((itm, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 bg-gray-50 p-2.5 rounded-xl border border-gray-200 items-center">
                      <div className="col-span-5">
                        <input
                          placeholder="Item Description"
                          required
                          value={itm.itemName}
                          onChange={e => updatePoItemRow(idx, 'itemName', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg p-2 bg-white"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          placeholder="HSN"
                          value={itm.hsnCode}
                          onChange={e => updatePoItemRow(idx, 'hsnCode', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg p-2 bg-white font-mono"
                        />
                      </div>
                      <div className="col-span-1">
                        <input
                          type="number"
                          placeholder="Qty"
                          value={itm.quantity}
                          onChange={e => updatePoItemRow(idx, 'quantity', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg p-2 bg-white text-center"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          placeholder="Rate"
                          value={itm.unitCost}
                          onChange={e => updatePoItemRow(idx, 'unitCost', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg p-2 bg-white text-right"
                        />
                      </div>
                      <div className="col-span-1">
                        <select
                          value={itm.taxRate}
                          onChange={e => updatePoItemRow(idx, 'taxRate', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg p-2 bg-white"
                        >
                          <option value="18">18%</option>
                          <option value="12">12%</option>
                          <option value="5">5%</option>
                          <option value="0">0%</option>
                        </select>
                      </div>
                      <div className="col-span-1 text-center">
                        <button
                          type="button"
                          onClick={() => removePoItemRow(idx)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-white"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals & Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Notes / Instructions</label>
                  <textarea
                    rows={2}
                    value={poForm.notes}
                    onChange={e => setPoForm({ ...poForm, notes: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2"
                  />
                </div>
                <div className="bg-gray-50 p-3 rounded-xl space-y-1.5 font-mono text-xs">
                  {(() => {
                    const t = calculatePoTotals();
                    return (
                      <>
                        <div className="flex justify-between text-gray-600">
                          <span>Subtotal:</span>
                          <span>₹{t.subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                          <span>Estimated Tax (GST):</span>
                          <span>₹{t.taxTotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                          <span>Freight:</span>
                          <span>₹{t.freight.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm font-bold text-gray-900 border-t border-gray-200 pt-1">
                          <span>Total PO Value:</span>
                          <span>₹{t.total.toLocaleString()}</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowPoModal(false)}
                  className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Issue Purchase Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* ================= MODAL: CREATE REQUISITION ================= */}
      {showReqModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-[600px] max-w-full p-6">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-black text-gray-900">Create Purchase Requisition</h3>
                <p className="text-xs text-gray-500">Internal procurement request for departmental approvals</p>
              </div>
              <button onClick={() => setShowReqModal(false)} className="p-1 rounded-full hover:bg-gray-100 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRequisition} className="space-y-3.5 pt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Department *</label>
                  <input
                    required
                    value={reqForm.department}
                    onChange={e => setReqForm({ ...reqForm, department: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Requested By</label>
                  <input
                    value={reqForm.requestedBy}
                    onChange={e => setReqForm({ ...reqForm, requestedBy: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Required By Date</label>
                  <input
                    type="date"
                    value={reqForm.requiredDate}
                    onChange={e => setReqForm({ ...reqForm, requiredDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Estimated Cost (₹) *</label>
                  <input
                    type="number"
                    value={reqForm.estimatedCost}
                    onChange={e => setReqForm({ ...reqForm, estimatedCost: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setShowReqModal(false)} className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-xs">Submit Requisition</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ISSUE DEBIT NOTE ================= */}
      {showDnModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-[600px] max-w-full p-6">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-black text-gray-900">Issue Debit Note</h3>
                <p className="text-xs text-gray-500">Record supplier purchase return or price adjustment</p>
              </div>
              <button onClick={() => setShowDnModal(false)} className="p-1 rounded-full hover:bg-gray-100 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDebitNote} className="space-y-3.5 pt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Original Purchase Bill # *</label>
                  <input
                    required
                    value={dnForm.originalBillNo}
                    onChange={e => setDnForm({ ...dnForm, originalBillNo: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Return Reason</label>
                  <select
                    value={dnForm.reason}
                    onChange={e => setDnForm({ ...dnForm, reason: e.target.value as any })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 bg-white font-medium"
                  >
                    <option value="Purchase Return">Purchase Return</option>
                    <option value="Shortage in Delivery">Shortage in Delivery</option>
                    <option value="Supplier Rebate">Supplier Rebate</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Supplier Name *</label>
                <input
                  required
                  value={dnForm.supplierName}
                  onChange={e => setDnForm({ ...dnForm, supplierName: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setShowDnModal(false)} className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs">Issue Debit Note</button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* ================= MODAL: EDIT PURCHASE ENTRY ================= */}
      {showEditPurchaseModal && editingPurchase && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-[500px] max-w-full p-6 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Edit Purchase Entry {editingPurchase.voucherNo}</h3>
              <button onClick={() => setShowEditPurchaseModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleEditPurchaseSubmit} className="space-y-4 pt-4">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Supplier Name</label>
                <input
                  type="text"
                  required
                  value={editPurchaseForm.supplierName}
                  onChange={e => setEditPurchaseForm({ ...editPurchaseForm, supplierName: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 font-semibold"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Supplier Bill #</label>
                  <input
                    type="text"
                    value={editPurchaseForm.supplierInvoiceNo}
                    onChange={e => setEditPurchaseForm({ ...editPurchaseForm, supplierInvoiceNo: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Invoice Date</label>
                  <input
                    type="date"
                    value={editPurchaseForm.supplierInvoiceDate}
                    onChange={e => setEditPurchaseForm({ ...editPurchaseForm, supplierInvoiceDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Status</label>
                  <select
                    value={editPurchaseForm.status}
                    onChange={e => setEditPurchaseForm({ ...editPurchaseForm, status: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 bg-white font-bold"
                  >
                    <option value="Pending Payment">Pending Payment</option>
                    <option value="Paid">Paid</option>
                    <option value="Partially Paid">Partially Paid</option>
                    <option value="Verified">Verified</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Total Bill Amount (₹)</label>
                  <input
                    type="number"
                    value={editPurchaseForm.totalAmount}
                    onChange={e => setEditPurchaseForm({ ...editPurchaseForm, totalAmount: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-mono font-bold"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setShowEditPurchaseModal(false)} className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs">Save Purchase Bill</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT SUPPLIER ================= */}
      {showEditSupplierModal && editingSupplier && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-[480px] max-w-full p-6 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Edit Vendor Profile</h3>
              <button onClick={() => setShowEditSupplierModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleEditSupplierSubmit} className="space-y-4 pt-4">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Company / Legal Entity Name *</label>
                <input
                  type="text"
                  required
                  value={editSupplierForm.name}
                  onChange={e => setEditSupplierForm({ ...editSupplierForm, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 font-semibold"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={editSupplierForm.contactName}
                    onChange={e => setEditSupplierForm({ ...editSupplierForm, contactName: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">GSTIN</label>
                  <input
                    type="text"
                    value={editSupplierForm.gstin}
                    onChange={e => setEditSupplierForm({ ...editSupplierForm, gstin: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={editSupplierForm.email}
                    onChange={e => setEditSupplierForm({ ...editSupplierForm, email: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={editSupplierForm.phone}
                    onChange={e => setEditSupplierForm({ ...editSupplierForm, phone: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-mono"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setShowEditSupplierModal(false)} className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs">Save Vendor Details</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT PO ================= */}
      {showEditPoModal && editingPo && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-[480px] max-w-full p-6 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Edit Purchase Order {editingPo.poNumber}</h3>
              <button onClick={() => setShowEditPoModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleEditPoSubmit} className="space-y-4 pt-4">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Supplier Name</label>
                <input
                  type="text"
                  required
                  value={editPoForm.supplierName}
                  onChange={e => setEditPoForm({ ...editPoForm, supplierName: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 font-semibold"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Delivery Date</label>
                  <input
                    type="date"
                    value={editPoForm.deliveryDate}
                    onChange={e => setEditPoForm({ ...editPoForm, deliveryDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Status</label>
                  <select
                    value={editPoForm.status}
                    onChange={e => setEditPoForm({ ...editPoForm, status: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 bg-white font-bold"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Approved">Approved</option>
                    <option value="Dispatched">Dispatched</option>
                    <option value="Delivered & Invoiced">Delivered & Invoiced</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Total PO Amount (₹)</label>
                <input
                  type="number"
                  value={editPoForm.totalAmount}
                  onChange={e => setEditPoForm({ ...editPoForm, totalAmount: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 font-mono font-bold"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setShowEditPoModal(false)} className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs">Update PO</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT REQUISITION ================= */}
      {showEditReqModal && editingReq && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-[480px] max-w-full p-6 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Edit Requisition {editingReq.reqNumber}</h3>
              <button onClick={() => setShowEditReqModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleEditReqSubmit} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Department</label>
                  <input
                    type="text"
                    required
                    value={editReqForm.department}
                    onChange={e => setEditReqForm({ ...editReqForm, department: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Requested By</label>
                  <input
                    type="text"
                    required
                    value={editReqForm.requestedBy}
                    onChange={e => setEditReqForm({ ...editReqForm, requestedBy: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Priority</label>
                  <select
                    value={editReqForm.priority}
                    onChange={e => setEditReqForm({ ...editReqForm, priority: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 bg-white font-bold"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical Urgent">Critical Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Status</label>
                  <select
                    value={editReqForm.status}
                    onChange={e => setEditReqForm({ ...editReqForm, status: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 bg-white font-bold"
                  >
                    <option value="Pending Approval">Pending Approval</option>
                    <option value="Approved">Approved</option>
                    <option value="PO Created">PO Created</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Estimated Cost (₹)</label>
                <input
                  type="number"
                  value={editReqForm.estimatedCost}
                  onChange={e => setEditReqForm({ ...editReqForm, estimatedCost: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 font-mono font-bold"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setShowEditReqModal(false)} className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs">Save Requisition</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT DEBIT NOTE ================= */}
      {showEditDnModal && editingDn && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-[480px] max-w-full p-6 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Edit Debit Note {editingDn.noteNumber}</h3>
              <button onClick={() => setShowEditDnModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleEditDnSubmit} className="space-y-4 pt-4">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Supplier Name</label>
                <input
                  type="text"
                  required
                  value={editDnForm.supplierName}
                  onChange={e => setEditDnForm({ ...editDnForm, supplierName: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 font-semibold"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Reason</label>
                  <input
                    type="text"
                    value={editDnForm.reason}
                    onChange={e => setEditDnForm({ ...editDnForm, reason: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Total Amount (₹)</label>
                  <input
                    type="number"
                    value={editDnForm.totalAmount}
                    onChange={e => setEditDnForm({ ...editDnForm, totalAmount: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-mono font-bold"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setShowEditDnModal(false)} className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs">Save Debit Note</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
