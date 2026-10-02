import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FileText, Pencil, Plus, Search, Filter, Download, Printer, Trash2, CheckCircle2, ShoppingCart, ArrowDownRight, Tag,
  AlertCircle, Clock, DollarSign, Calendar, ArrowUpRight, ArrowDownLeft,
  CreditCard, RefreshCw, Send, Eye, ShieldCheck, ChevronRight, X, Building2,
  Layers, Percent, User, Receipt, MessageSquare, Truck, QrCode, Sparkles, ExternalLink, FileSpreadsheet
} from 'lucide-react';
import { Link } from 'react-router-dom';
import ERPNavigation from '../../components/ERPNavigation';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

interface InvoiceItem {
  id?: string;
  description: string;
  hsnCode: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discountPercent: number;
  taxRate: number;
  cgst?: number;
  sgst?: number;
  igst?: number;
  amount?: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceType: 'Tax Invoice' | 'Proforma Invoice' | 'Retainer Invoice' | 'Commercial Invoice';
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerGstin: string;
  billingAddress: string;
  shippingAddress: string;
  placeOfSupply: string;
  isInterState: boolean;
  invoiceDate: string;
  dueDate: string;
  paymentTerms: string;
  currency: string;
  items: InvoiceItem[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  status: 'Draft' | 'Sent' | 'Unpaid' | 'Partially Paid' | 'Paid' | 'Overdue';
  notes: string;
  terms: string;
  payments: Array<{
    id: string;
    amount: number;
    paymentDate: string;
    method: string;
    reference: string;
    notes?: string;
  }>;
  einvoice?: {
    irn: string;
    ackNo: string;
    ackDate: string;
    signedQr: string;
    status: 'ACTIVE' | 'CANCELLED';
  };
  ewaybill?: {
    ewayBillNo: string;
    validUntil: string;
    vehicleNo: string;
    transporterId: string;
    distanceKm: number;
    status: 'ACTIVE' | 'CANCELLED';
  };
  createdAt: string;
}

interface Quotation {
  id: string;
  quotationNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerGstin: string;
  billingAddress: string;
  shippingAddress: string;
  placeOfSupply: string;
  quotationDate: string;
  validUntil: string;
  paymentTerms: string;
  currency: string;
  items: InvoiceItem[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  totalAmount: number;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Rejected' | 'Converted to Invoice';
  convertedInvoiceId?: string;
  convertedInvoiceNumber?: string;
  notes?: string;
  terms?: string;
}

interface DeliveryChallan {
  id: string;
  challanNumber: string;
  challanType: string;
  consigneeName: string;
  consigneeGstin: string;
  consigneeAddress: string;
  dispatchDate: string;
  sourceWarehouse: string;
  vehicleNo: string;
  transporterName: string;
  lrNo: string;
  ewayBillNo?: string;
  items: Array<{
    id?: string;
    itemName: string;
    hsnCode: string;
    quantity: number;
    unit: string;
    rate: number;
    totalValue: number;
    batchNo?: string;
  }>;
  totalValue: number;
  status: 'Dispatched' | 'Delivered' | 'Invoiced' | 'Returned';
  convertedInvoiceId?: string;
  notes?: string;
}

interface RecurringProfile {
  id: string;
  customerName: string;
  customerEmail: string;
  planName: string;
  cycle: string;
  amount: number;
  nextBillingDate: string;
  autoInvoice: boolean;
  status: string;
}

export default function Invoicing() {
  const [activeTab, setActiveTab] = useState<'invoices' | 'salesOrders' | 'quotations' | 'deliveryChallans' | 'creditNotes' | 'priceLists' | 'pos' | 'recurring' | 'aging'>('invoices');
  const [quotations, setQuotations] = useState<any[]>([]);
  const [salesOrders, setSalesOrders] = useState<any[]>([]);
  const [creditNotes, setCreditNotes] = useState<any[]>([]);
  const [priceLists, setPriceLists] = useState<any[]>([]);

  // Sales Order Form Modal State
  // Universal CRUD State for Invoicing
  const [showEditInvoiceModal, setShowEditInvoiceModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<any>(null);
  const [editInvoiceForm, setEditInvoiceForm] = useState({
    customerName: '',
    invoiceDate: '',
    dueDate: '',
    status: 'Unpaid',
    subtotal: 0,
    taxTotal: 0,
    totalAmount: 0,
    notes: ''
  });

  const [showEditSoModal, setShowEditSoModal] = useState(false);
  const [editingSo, setEditingSo] = useState<any>(null);
  const [editSoForm, setEditSoForm] = useState({ customerName: '', expectedDeliveryDate: '', totalAmount: 0, status: 'Confirmed' });

  const [showEditQuotationModal, setShowEditQuotationModal] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState<any>(null);
  const [editQuotationForm, setEditQuotationForm] = useState({ customerName: '', validUntil: '', totalAmount: 0, status: 'Pending' });

  const [showEditDCModal, setShowEditDCModal] = useState(false);
  const [editingDC, setEditingDC] = useState<any>(null);
  const [editDCForm, setEditDCForm] = useState({ consigneeName: '', transporterName: '', vehicleNo: '', status: 'In Transit' });

  const [showEditCnModal, setShowEditCnModal] = useState(false);
  const [editingCn, setEditingCn] = useState<any>(null);
  const [editCnForm, setEditCnForm] = useState({ customerName: '', reason: '', totalAmount: 0, status: 'Issued & Reconciled' });

  const [showEditRecurringModal, setShowEditRecurringModal] = useState(false);
  const [editingRecurring, setEditingRecurring] = useState<any>(null);
  const [editRecurringForm, setEditRecurringForm] = useState({ planName: '', amount: 0, cycle: 'Monthly', nextBillingDate: '' });

  const [showPlModal, setShowPlModal] = useState(false);
  const [editingPl, setEditingPl] = useState<any>(null);
  const [plForm, setPlForm] = useState({ listName: '', discountPercentage: 10, applicableCategory: 'Corporate Accounts', effectiveFrom: '2026-04-01' });

  const [showSoModal, setShowSoModal] = useState(false);
  const [soForm, setSoForm] = useState({
    customerName: 'CloudScale Infotech Pvt Ltd',
    customerGstin: '29AABCC4491Q1Z3',
    billingAddress: 'Prestige Tech Park, Bangalore 560103',
    expectedDeliveryDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    items: [
      { itemName: 'Dell PowerEdge R750 Rack Server', quantity: 2, unitCost: 245000, taxRate: 18 }
    ]
  });

  // POS Retail Quick Billing State
  const [posCart, setPosCart] = useState<any[]>([
    { id: 'POS-01', name: 'Cat6 Shielded Patch Cable 2m', sku: 'SKU-CAB-02', price: 450, qty: 3, taxRate: 18 },
    { id: 'POS-02', name: 'Cisco SFP+ 10G Transceiver Module', sku: 'SKU-SFP-10G', price: 6500, qty: 1, taxRate: 18 }
  ]);
  const [posTenderMethod, setPosTenderMethod] = useState<'Cash' | 'UPI' | 'Card'>('UPI');
  const [posShift, setPosShift] = useState<any>({
    shiftNumber: 'SFT-2026-0925-1',
    cashierName: 'Ananya Sharma',
    openingCash: 5000,
    cashSales: 18500,
    upiSales: 34200,
    cardSales: 12400,
    totalRevenue: 65100,
    expectedDrawerCash: 22300,
    status: 'Open'
  });
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [actualDrawerCount, setActualDrawerCount] = useState(22300);
  const [posReceiptMsg, setPosReceiptMsg] = useState('');

  // Catalog items for quick POS adding
  const posCatalog = [
    { id: 'POS-01', name: 'Cat6 Shielded Patch Cable 2m', sku: 'SKU-CAB-02', price: 450, taxRate: 18 },
    { id: 'POS-02', name: 'Cisco SFP+ 10G Transceiver Module', sku: 'SKU-SFP-10G', price: 6500, taxRate: 18 },
    { id: 'POS-03', name: 'APC Smart-UPS Battery Module 1500VA', sku: 'SKU-UPS-BAT', price: 18500, taxRate: 18 },
    { id: 'POS-04', name: 'Logitech MX Master 3S Wireless Mouse', sku: 'SKU-LOG-MX3', price: 8990, taxRate: 18 },
    { id: 'POS-05', name: 'Enterprise NVMe SSD 1.92TB M.2', sku: 'SKU-SSD-192', price: 24000, taxRate: 18 }
  ];

  // Credit Note Form Modal State
  const [showCnModal, setShowCnModal] = useState(false);
  const [cnForm, setCnForm] = useState({
    originalInvoiceNo: 'INV-2026-001',
    customerName: 'CloudScale Infotech Pvt Ltd',
    customerGstin: '29AABCC4491Q1Z3',
    reason: 'Post-Sale Discount' as const,
    items: [
      { itemName: 'Special Volume Rebate on Hardware Delivery', quantity: 1, unitCost: 15000, taxRate: 18 }
    ]
  });
  const [deliveryChallans, setDeliveryChallans] = useState<DeliveryChallan[]>([]);
  const [showQuotationModal, setShowQuotationModal] = useState(false);
  const [showDCModal, setShowDCModal] = useState(false);

  const [qtnForm, setQtnForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerGstin: '29AAACT2727Q1ZB',
    billingAddress: 'Tower 4, Electronic City, Bangalore - 560100',
    placeOfSupply: '29-Karnataka',
    validUntil: '',
    paymentTerms: 'Net 15',
    notes: 'Valid for 30 calendar days.',
    items: [{ description: 'Enterprise Cloud Infrastructure Services', hsnCode: '998313', quantity: 1, unit: 'Month', unitPrice: 150000, discountPercent: 0, taxRate: 18 }]
  });

  const [dcForm, setDcForm] = useState({
    challanType: 'Supply of Goods',
    consigneeName: '',
    consigneeGstin: '29AAACT0000A1Z5',
    consigneeAddress: 'Client Project Site Hub, Bangalore',
    sourceWarehouse: 'Bangalore Central Tech Hub',
    vehicleNo: 'KA-01-MJ-8822',
    transporterName: 'BlueDart Enterprise Freight',
    lrNo: 'LR-BLR-9921',
    items: [{ itemName: 'Cisco Catalyst 9300 48-Port PoE+ Managed Switch', hsnCode: '851762', quantity: 2, unit: 'Units', rate: 185000, batchNo: 'BAT-2026-09' }]
  });
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [recurringProfiles, setRecurringProfiles] = useState<RecurringProfile[]>([]);
  const [summary, setSummary] = useState({
    totalBilled: 0,
    totalPaid: 0,
    outstandingReceivables: 0,
    overdueAmount: 0,
    totalCount: 0,
    paidCount: 0,
    overdueCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentModalInvoice, setPaymentModalInvoice] = useState<Invoice | null>(null);
  const [showRecurringModal, setShowRecurringModal] = useState(false);
  const [showEwayModal, setShowEwayModal] = useState<Invoice | null>(null);

  // E-Way Bill Form
  const [ewayForm, setEwayForm] = useState({
    transporterId: 'TRANS-BLR-001',
    vehicleNo: 'KA-01-MJ-8822',
    distanceKm: 180
  });

  // Payment Form
  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    method: 'NEFT / RTGS',
    reference: '',
    notes: ''
  });

  // Recurring Form
  const [recurringForm, setRecurringForm] = useState({
    customerName: '',
    customerEmail: '',
    planName: '',
    cycle: 'Monthly',
    amount: 50000,
    nextBillingDate: new Date().toISOString().split('T')[0],
    autoInvoice: true
  });

  // Create Invoice Form
  const [invoiceForm, setInvoiceForm] = useState({
    invoiceType: 'Tax Invoice' as const,
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerGstin: '',
    billingAddress: '',
    shippingAddress: '',
    placeOfSupply: '29-Karnataka',
    isInterState: false,
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
    paymentTerms: 'Net 15',
    notes: 'Thank you for your business. For RTGS payments, please reference this invoice number.',
    terms: 'Payment due within 15 days of invoice date. 1.5% interest per month on overdue invoices.',
    items: [
      {
        description: 'Enterprise Cloud Infrastructure Services',
        hsnCode: '998313',
        quantity: 1,
        unit: 'Month',
        unitPrice: 150000,
        discountPercent: 0,
        taxRate: 18
      }
    ]
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [invRes, sumRes, recRes, qtnRes, dcRes, soRes, cnRes, plRes] = await Promise.all([
        axios.get(`${API_BASE}/api/erp/invoices`),
        axios.get(`${API_BASE}/api/erp/invoices-summary`),
        axios.get(`${API_BASE}/api/erp/billing/recurring`),
        axios.get(`${API_BASE}/api/erp/accounting/quotations`).catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/api/erp/accounting/delivery-challans`).catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/api/erp/accounting/sales-orders`).catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/api/erp/accounting/credit-notes`).catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/api/erp/accounting/price-lists`).catch(() => ({ data: [] }))
      ]);
      setInvoices(invRes.data);
      setSummary(sumRes.data);
      setRecurringProfiles(recRes.data);
      setQuotations(qtnRes.data || []);
      setDeliveryChallans(dcRes.data || []);
      setSalesOrders(soRes.data || []);
      setCreditNotes(cnRes.data || []);
      setPriceLists(plRes.data || []);
    } catch (err) {
      console.error('Failed to load invoicing data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleConvertSalesOrder = async (id: string, soNumber: string) => {
    if (!window.confirm(`Convert Sales Order ${soNumber} to an official Tax Invoice?\nThis will automatically log the sale in P&L, AR, and GSTR-1.`)) return;
    try {
      const res = await axios.post(`${API_BASE}/api/erp/accounting/sales-orders/${id}/convert-to-invoice`);
      alert(`Sales Order converted to Tax Invoice ${res.data.invoice?.invoiceNumber || ''} successfully!`);
      await fetchData();
      setActiveTab('invoices');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to convert sales order');
    }
  };

  const handleAddToCart = (item: any) => {
    setPosCart(prev => {
      const existing = prev.find(p => p.id === item.id);
      if (existing) {
        return prev.map(p => p.id === item.id ? { ...p, qty: p.qty + 1 } : p);
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const handleUpdateCartQty = (id: string, delta: number) => {
    setPosCart(prev => prev.map(p => {
      if (p.id === id) {
        const newQty = Math.max(1, p.qty + delta);
        return { ...p, qty: newQty };
      }
      return p;
    }));
  };

  const handleRemoveFromCart = (id: string) => {
    setPosCart(prev => prev.filter(p => p.id !== id));
  };

  const handlePOSCheckout = async () => {
    if (posCart.length === 0) return alert('Cart is empty');
    const taxable = posCart.reduce((a, b) => a + (b.price * b.qty), 0);
    const tax = Math.round(taxable * 0.18);
    const total = taxable + tax;

    try {
      const res = await axios.post(`${API_BASE}/api/erp/pos/checkout`, {
        items: posCart,
        tenderMethod: posTenderMethod,
        amountPaid: total
      });
      setPosReceiptMsg(`Thermal receipt ${res.data.receiptNo} generated! Paid ₹${total.toLocaleString()} via ${posTenderMethod}. Stock & journal synced.`);
      if (res.data.shift) setPosShift(res.data.shift);
      setPosCart([]);
      setTimeout(() => setPosReceiptMsg(''), 7000);
      fetchData();
    } catch (err) {
      alert('Failed to complete POS checkout');
    }
  };

  const handleCloseShiftSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE}/api/erp/pos/close-shift`, {
        actualDrawerCash: actualDrawerCount
      });
      setShowShiftModal(false);
      setPosShift(res.data.shift);
      alert(res.data.message || 'Shift closed successfully!');
    } catch (err) {
      alert('Failed to close shift');
    }
  };

  const handleOpenEditRecurring = (rec: any) => {
    setEditingRecurring(rec);
    setEditRecurringForm({
      planName: rec.planName,
      amount: rec.amount,
      cycle: rec.cycle,
      nextBillingDate: rec.nextBillingDate
    });
    setShowEditRecurringModal(true);
  };

  const handleEditRecurringSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecurring) return;
    try {
      await axios.put(`${API_BASE}/api/erp/billing/recurring/${editingRecurring.id}`, editRecurringForm);
      setShowEditRecurringModal(false);
      alert('Subscription retainer schedule updated successfully!');
      fetchData();
    } catch (err) {
      alert('Failed to update subscription retainer schedule');
    }
  };

  const handleCreateSalesOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/api/erp/accounting/sales-orders`, soForm);
      setShowSoModal(false);
      alert('Sales Order confirmed successfully!');
      fetchData();
    } catch (err) {
      alert('Failed to create sales order');
    }
  };

  const handleCreateCreditNote = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/api/erp/accounting/credit-notes`, cnForm);
      setShowCnModal(false);
      alert('Credit Note issued and adjusted against customer balance!');
      fetchData();
    } catch (err) {
      alert('Failed to issue credit note');
    }
  };

  const handleConvertQuotation = async (id: string, qtnNumber: string) => {
    if (!window.confirm(`Convert Quotation ${qtnNumber} into an official Tax Invoice? This will automatically sync into Invoices, P&L Revenue, and Accounts Receivable.`)) return;
    try {
      const res = await axios.post(`${API_BASE}/api/erp/accounting/quotations/${id}/convert-to-invoice`);
      alert(`Success! Quotation converted to Tax Invoice ${res.data.invoice.invoiceNumber}. Books and P&L updated.`);
      fetchData();
    } catch (err) {
      alert('Failed to convert quotation.');
    }
  };

  const handleConvertDC = async (id: string, dcNumber: string) => {
    if (!window.confirm(`Convert Delivery Challan ${dcNumber} into a final Tax Invoice?`)) return;
    try {
      const res = await axios.post(`${API_BASE}/api/erp/accounting/delivery-challans/${id}/convert-to-invoice`);
      alert(`Success! Delivery Challan billed into Tax Invoice ${res.data.invoice.invoiceNumber}.`);
      fetchData();
    } catch (err) {
      alert('Failed to convert delivery challan.');
    }
  };

  const handleCreateQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/api/erp/accounting/quotations`, qtnForm);
      setShowQuotationModal(false);
      fetchData();
      alert('Sales quotation issued successfully!');
    } catch (err) {
      alert('Failed to create quotation.');
    }
  };

  const handleCreateDC = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/api/erp/accounting/delivery-challans`, dcForm);
      setShowDCModal(false);
      fetchData();
      alert('Delivery challan generated successfully!');
    } catch (err) {
      alert('Failed to create delivery challan.');
    }
  };

  // Compute 15-Day Overdue Invoices
  const overdue15DaysInvoices = invoices.filter(inv => {
    if (inv.balanceDue <= 0) return false;
    const invoiceDateTs = new Date(inv.invoiceDate).getTime();
    const ageInDays = Math.floor((Date.now() - invoiceDateTs) / (1000 * 60 * 60 * 24));
    return ageInDays > 15;
  });

  const totalOverdue15DaysAmount = overdue15DaysInvoices.reduce((sum, inv) => sum + inv.balanceDue, 0);

  // Line Item Calculations for Create Form
  const addItemRow = () => {
    setInvoiceForm({
      ...invoiceForm,
      items: [
        ...invoiceForm.items,
        {
          description: '',
          hsnCode: '998311',
          quantity: 1,
          unit: 'Nos',
          unitPrice: 10000,
          discountPercent: 0,
          taxRate: 18
        }
      ]
    });
  };

  const removeItemRow = (index: number) => {
    if (invoiceForm.items.length <= 1) return;
    const updated = invoiceForm.items.filter((_, idx) => idx !== index);
    setInvoiceForm({ ...invoiceForm, items: updated });
  };

  const updateItemRow = (index: number, field: keyof InvoiceItem, value: any) => {
    const updated = [...invoiceForm.items];
    updated[index] = { ...updated[index], [field]: value };
    setInvoiceForm({ ...invoiceForm, items: updated });
  };

  const calculateFormTotals = () => {
    let subtotal = 0;
    let discountTotal = 0;
    let taxTotal = 0;

    invoiceForm.items.forEach(item => {
      const qty = Number(item.quantity) || 0;
      const rate = Number(item.unitPrice) || 0;
      const disc = Number(item.discountPercent) || 0;
      const taxRate = Number(item.taxRate) || 0;

      const raw = qty * rate;
      const discount = raw * (disc / 100);
      const taxable = raw - discount;
      const tax = taxable * (taxRate / 100);

      subtotal += raw;
      discountTotal += discount;
      taxTotal += tax;
    });

    const total = subtotal - discountTotal + taxTotal;
    return {
      subtotal: Math.round(subtotal),
      discountTotal: Math.round(discountTotal),
      taxTotal: Math.round(taxTotal),
      total: Math.round(total)
    };
  };

  // Create Invoice Handler (Single Entry Workflow: automatically adds to CRM Customer, P&L, Balance Sheet, and Outstanding Ledger)
  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/api/erp/invoices`, invoiceForm);
      setShowCreateModal(false);
      fetchData();
      alert('Tax Invoice issued! Customer profile, P&L revenue, Balance Sheet receivables, and Outstanding ledger synchronized automatically.');
    } catch (err) {
      console.error('Failed to create invoice', err);
      alert('Error creating invoice');
    }
  };

  // Delete Invoice
  // Universal CRUD Handlers
  const handleOpenEditInvoice = (inv: Invoice) => {
    setEditingInvoice(inv);
    setEditInvoiceForm({
      customerName: inv.customerName,
      invoiceDate: inv.invoiceDate,
      dueDate: inv.dueDate,
      status: inv.status,
      subtotal: inv.subtotal,
      taxTotal: inv.taxTotal,
      totalAmount: inv.totalAmount,
      notes: inv.notes || ''
    });
    setShowEditInvoiceModal(true);
  };

  const handleEditInvoiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(`${API_BASE}/api/erp/invoices/${editingInvoice.id}`, editInvoiceForm);
      setShowEditInvoiceModal(false);
      setEditingInvoice(null);
      alert('Invoice updated successfully!');
      fetchData();
    } catch (err) {
      alert('Failed to update invoice');
    }
  };

  const handleDeleteSalesOrder = async (id: string, num: string) => {
    if (!confirm(`Delete Sales Order ${num}?`)) return;
    try {
      await axios.delete(`${API_BASE}/api/erp/accounting/sales-orders/${id}`);
      alert(`Sales Order ${num} deleted!`);
      fetchData();
    } catch (err) {
      alert('Failed to delete sales order');
    }
  };

  const handleOpenEditSo = (so: any) => {
    setEditingSo(so);
    setEditSoForm({
      customerName: so.customerName,
      expectedDeliveryDate: so.expectedDeliveryDate,
      totalAmount: so.totalAmount,
      status: so.status
    });
    setShowEditSoModal(true);
  };

  const handleEditSoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(`${API_BASE}/api/erp/accounting/sales-orders/${editingSo.id}`, editSoForm);
      setShowEditSoModal(false);
      alert('Sales Order updated successfully!');
      fetchData();
    } catch (err) {
      alert('Failed to update sales order');
    }
  };

  const handleDeleteQuotation = async (id: string, num: string) => {
    if (!confirm(`Delete Quotation ${num}?`)) return;
    try {
      await axios.delete(`${API_BASE}/api/erp/accounting/quotations/${id}`);
      alert(`Quotation ${num} deleted!`);
      fetchData();
    } catch (err) {
      alert('Failed to delete quotation');
    }
  };

  const handleOpenEditQuotation = (q: any) => {
    setEditingQuotation(q);
    setEditQuotationForm({
      customerName: q.customerName,
      validUntil: q.validUntil,
      totalAmount: q.totalAmount,
      status: q.status
    });
    setShowEditQuotationModal(true);
  };

  const handleEditQuotationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(`${API_BASE}/api/erp/accounting/quotations/${editingQuotation.id}`, editQuotationForm);
      setShowEditQuotationModal(false);
      alert('Quotation updated successfully!');
      fetchData();
    } catch (err) {
      alert('Failed to update quotation');
    }
  };

  const handleDeleteDC = async (id: string, num: string) => {
    if (!confirm(`Delete Delivery Challan ${num}?`)) return;
    try {
      await axios.delete(`${API_BASE}/api/erp/accounting/delivery-challans/${id}`);
      alert(`Delivery Challan ${num} deleted!`);
      fetchData();
    } catch (err) {
      alert('Failed to delete delivery challan');
    }
  };

  const handleOpenEditDC = (dc: any) => {
    setEditingDC(dc);
    setEditDCForm({
      consigneeName: dc.consigneeName,
      transporterName: dc.transporterName,
      vehicleNo: dc.vehicleNo,
      status: dc.status
    });
    setShowEditDCModal(true);
  };

  const handleEditDCSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(`${API_BASE}/api/erp/accounting/delivery-challans/${editingDC.id}`, editDCForm);
      setShowEditDCModal(false);
      alert('Delivery Challan updated successfully!');
      fetchData();
    } catch (err) {
      alert('Failed to update delivery challan');
    }
  };

  const handleDeleteCN = async (id: string, num: string) => {
    if (!confirm(`Delete Credit Note ${num}?`)) return;
    try {
      await axios.delete(`${API_BASE}/api/erp/accounting/credit-notes/${id}`);
      alert(`Credit Note ${num} deleted!`);
      fetchData();
    } catch (err) {
      alert('Failed to delete credit note');
    }
  };

  const handleOpenEditCN = (cn: any) => {
    setEditingCn(cn);
    setEditCnForm({
      customerName: cn.customerName,
      reason: cn.reason,
      totalAmount: cn.totalAmount,
      status: cn.status
    });
    setShowEditCnModal(true);
  };

  const handleEditCnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(`${API_BASE}/api/erp/accounting/credit-notes/${editingCn.id}`, editCnForm);
      setShowEditCnModal(false);
      alert('Credit Note updated successfully!');
      fetchData();
    } catch (err) {
      alert('Failed to update credit note');
    }
  };

  const handleOpenCreatePl = () => {
    setEditingPl(null);
    setPlForm({ listName: '', discountPercentage: 10, applicableCategory: 'Corporate Accounts', effectiveFrom: '2026-04-01' });
    setShowPlModal(true);
  };

  const handleOpenEditPl = (pl: any) => {
    setEditingPl(pl);
    setPlForm({
      listName: pl.listName,
      discountPercentage: pl.discountPercentage,
      applicableCategory: pl.applicableCategory || 'Corporate Accounts',
      effectiveFrom: pl.effectiveFrom || '2026-04-01'
    });
    setShowPlModal(true);
  };

  const handleSavePlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPl) {
        await axios.put(`${API_BASE}/api/erp/accounting/price-lists/${editingPl.id}`, plForm);
        alert('Price List updated successfully!');
      } else {
        await axios.post(`${API_BASE}/api/erp/accounting/price-lists`, plForm);
        alert('Price List created successfully!');
      }
      setShowPlModal(false);
      fetchData();
    } catch (err) {
      alert('Failed to save price list');
    }
  };

  const handleDeletePl = async (id: string, name: string) => {
    if (!confirm(`Delete Price List "${name}"?`)) return;
    try {
      await axios.delete(`${API_BASE}/api/erp/accounting/price-lists/${id}`);
      alert(`Price list "${name}" deleted!`);
      fetchData();
    } catch (err) {
      alert('Failed to delete price list');
    }
  };

  const handleDeleteInvoice = async (id: string, num: string) => {
    if (!window.confirm(`Are you sure you want to delete invoice ${num}? This cannot be undone.`)) return;
    try {
      await axios.delete(`${API_BASE}/api/erp/invoices/${id}`);
      if (selectedInvoice?.id === id) setSelectedInvoice(null);
      fetchData();
    } catch (err) {
      console.error('Failed to delete invoice', err);
      alert('Error deleting invoice');
    }
  };

  // Record Payment
  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalInvoice) return;
    try {
      await axios.post(`${API_BASE}/api/erp/invoices/${paymentModalInvoice.id}/pay`, paymentForm);
      setPaymentModalInvoice(null);
      fetchData();
      alert('Payment recorded! Cash/Bank, Accounts Receivable, and Client Outstanding updated automatically.');
    } catch (err) {
      console.error('Failed to record payment', err);
      alert('Error recording payment');
    }
  };

  // Generate E-Invoice (IRN)
  const handleGenerateEInvoice = async (invoiceId: string) => {
    try {
      const res = await axios.post(`${API_BASE}/api/erp/invoices/${invoiceId}/generate-einvoice`);
      alert('Official E-Invoice 64-char IRN generated & registered with Govt NIC portal!');
      if (selectedInvoice?.id === invoiceId) {
        setSelectedInvoice(res.data.invoice);
      }
      fetchData();
    } catch (err) {
      console.error('Failed to generate E-Invoice', err);
      alert('Error generating E-Invoice');
    }
  };

  // Generate E-Way Bill
  const handleGenerateEWayBill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEwayModal) return;
    try {
      const res = await axios.post(`${API_BASE}/api/erp/invoices/${showEwayModal.id}/generate-ewaybill`, ewayForm);
      setShowEwayModal(null);
      alert('Govt 12-Digit E-Way Bill generated successfully!');
      if (selectedInvoice?.id === showEwayModal.id) {
        setSelectedInvoice(res.data.invoice);
      }
      fetchData();
    } catch (err) {
      console.error('Failed to generate E-Way Bill', err);
    }
  };

  // WhatsApp Integration Dispatcher
  const handleSendWhatsApp = async (invoice: Invoice, isOverdueNotice = false) => {
    const rawPhone = invoice.customerPhone || '+91 98450 11223';
    const cleanPhone = rawPhone.replace(/[^0-9]/g, '');

    const message = isOverdueNotice
      ? `*URGENT: PAYMENT OVERDUE REMINDER*\nDear ${invoice.customerName},\nThis is an automated reminder regarding Tax Invoice *${invoice.invoiceNumber}* for *₹${invoice.balanceDue.toLocaleString()}* which has crossed our 15-day credit period.\nInvoice Date: ${invoice.invoiceDate} | Due Date: ${invoice.dueDate}\nBank Details: HDFC Bank (A/C: 50200088991122, IFSC: HDFC0001029, UPI: omnicloud@hdfcbank)\nKindly clear the outstanding remittance today to avoid account suspension.\nAccounts Team - OmniCloud Enterprise.`
      : `*TAX INVOICE ADVICE*\nDear ${invoice.customerName},\nPlease find attached your Tax Invoice *${invoice.invoiceNumber}* for *₹${invoice.totalAmount.toLocaleString()}*.\nDue Date: ${invoice.dueDate} | Balance Due: ₹${invoice.balanceDue.toLocaleString()}\n${invoice.einvoice ? `Govt IRN: ${invoice.einvoice.irn.slice(0, 16)}...\n` : ''}Bank Transfer: HDFC Bank A/C 50200088991122 (IFSC: HDFC0001029, UPI: omnicloud@hdfcbank)\nThank you for partnering with OmniCloud Technologies!`;

    try {
      const res = await axios.post(`${API_BASE}/api/erp/whatsapp/send`, {
        phone: cleanPhone,
        message,
        customerName: invoice.customerName
      });
      window.open(res.data.whatsappUrl, '_blank');
    } catch (err) {
      const fallbackUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;
      window.open(fallbackUrl, '_blank');
    }
  };

  // Create Recurring Profile
  const handleCreateRecurring = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/api/erp/billing/recurring`, recurringForm);
      setShowRecurringModal(false);
      fetchData();
    } catch (err) {
      console.error('Failed to create recurring profile', err);
    }
  };

  const handleDeleteRecurring = async (id: string) => {
    if (!window.confirm('Delete this recurring billing schedule?')) return;
    try {
      await axios.delete(`${API_BASE}/api/erp/billing/recurring/${id}`);
      fetchData();
    } catch (err) {
      console.error('Failed to delete recurring schedule', err);
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesStatus = statusFilter === 'All' || inv.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesSearch = inv.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Partially Paid':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Overdue':
        return 'bg-rose-100 text-rose-800 border-rose-200 animate-pulse';
      case 'Sent':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <ERPNavigation />

      {/* ⚠️ AUTOMATIC 15-DAY OVERDUE ACCOUNTS ALERT BANNER */}
      {overdue15DaysInvoices.length > 0 && (
        <div className="bg-gradient-to-r from-rose-900 via-red-950 to-slate-950 text-white p-5 rounded-2xl shadow-md border border-rose-500/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-start space-x-3">
            <div className="p-2.5 bg-rose-500/20 text-rose-300 rounded-xl border border-rose-400/30 mt-0.5">
              <AlertCircle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black uppercase tracking-widest bg-rose-500 text-white px-2 py-0.5 rounded">
                  Accounts Team Action Required
                </span>
                <span className="text-xs text-rose-200 font-mono">Credit Period Exceeded &gt; 15 Days</span>
              </div>
              <h3 className="text-lg font-black text-white mt-1">
                {overdue15DaysInvoices.length} Client Invoices have Crossed the 15-Day Overdue Threshold!
              </h3>
              <p className="text-xs text-rose-200/90 mt-0.5">
                Total Overdue Capital Locked: <strong className="text-white text-sm">₹{totalOverdue15DaysAmount.toLocaleString()}</strong>. Follow-up payment reminders should be dispatched immediately.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                // Send WhatsApp alert for the first delinquent invoice
                handleSendWhatsApp(overdue15DaysInvoices[0], true);
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center shadow-sm transition-all cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 mr-1.5" /> WhatsApp Overdue Notice
            </button>
            <Link
              to="/erp/finance"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 transition-all flex items-center"
            >
              <FileText className="w-4 h-4 mr-1.5" /> View P&amp;L &amp; Balance Sheet
            </Link>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Receipt className="w-4 h-4" />
            <span>Revenue Management &amp; Tax Invoicing</span>
            <span>•</span>
            <span className="text-emerald-600 font-bold flex items-center">
              <QrCode className="w-3.5 h-3.5 mr-1" /> Govt E-Invoice &amp; E-Way Bill Enabled
            </span>
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Invoicing &amp; Billing Suite</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Single-entry unified workflow: automated tax invoices, real-time sync with P&amp;L, Balance Sheet, Client Outstanding, and WhatsApp notices.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/erp/finance"
            className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-xs transition-colors flex items-center border border-indigo-200"
          >
            <Sparkles className="w-4 h-4 mr-1.5 text-indigo-600" /> P&amp;L &amp; Balance Sheet
          </Link>
          <button
            onClick={() => setShowQuotationModal(true)}
            className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold rounded-xl text-xs transition-colors flex items-center shadow-2xs cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-1.5 text-emerald-600" /> + Quotation
          </button>
          <button
            onClick={() => setShowDCModal(true)}
            className="px-3.5 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 font-bold rounded-xl text-xs transition-colors flex items-center shadow-2xs cursor-pointer"
          >
            <Truck className="w-4 h-4 mr-1.5 text-teal-600" /> + Delivery Challan
          </button>
          <button
            onClick={() => setShowRecurringModal(true)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors flex items-center shadow-xs cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 mr-1.5 text-indigo-600" /> + Recurring Plan
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-1.5" /> + Create Tax Invoice
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Billed</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-gray-900">₹{summary.totalBilled.toLocaleString()}</h3>
            <p className="text-[11px] text-gray-500 mt-1 flex items-center">
              <span className="text-emerald-600 font-bold mr-1">✓ {summary.totalCount} Invoices</span> synced to P&amp;L
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Realized Collections</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-emerald-600">₹{summary.totalPaid.toLocaleString()}</h3>
            <p className="text-[11px] text-gray-500 mt-1">
              {summary.totalBilled > 0 ? Math.round((summary.totalPaid / summary.totalBilled) * 100) : 0}% Collection Rate
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Outstanding Receivables</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-indigo-600">₹{summary.outstandingReceivables.toLocaleString()}</h3>
            <p className="text-[11px] text-gray-500 mt-1">Synced to Balance Sheet Current Assets</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Overdue (&gt;15 Days)</span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-rose-600">₹{totalOverdue15DaysAmount.toLocaleString()}</h3>
            <p className="text-[11px] text-rose-600 font-semibold mt-1">
              {overdue15DaysInvoices.length} account(s) past 15-day limit
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('invoices')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'invoices' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <FileText className="w-4 h-4" /> Tax Invoices ({invoices.length})
        </button>
        <button
          onClick={() => setActiveTab('salesOrders')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'salesOrders' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <ShoppingCart className="w-4 h-4" /> Sales Orders ({salesOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('quotations')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'quotations' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <FileText className="w-4 h-4" /> Quotations &amp; Proformas ({quotations.length})
        </button>
        <button
          onClick={() => setActiveTab('deliveryChallans')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'deliveryChallans' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Truck className="w-4 h-4" /> Delivery Challans ({deliveryChallans.length})
        </button>
        <button
          onClick={() => setActiveTab('creditNotes')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'creditNotes' ? 'border-rose-600 text-rose-600' : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <ArrowDownRight className="w-4 h-4 text-rose-600" /> Credit Notes (Returns) ({creditNotes.length})
        </button>
        <button
          onClick={() => setActiveTab('priceLists')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'priceLists' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Layers className="w-4 h-4 text-indigo-600" /> Price Lists &amp; Credit Limits
        </button>
        <button
          onClick={() => setActiveTab('pos')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'pos' ? 'border-amber-600 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-600" /> POS Retail Quick Billing
        </button>
        <button
          onClick={() => setActiveTab('recurring')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'recurring' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <RefreshCw className="w-4 h-4" /> Recurring ({recurringProfiles.length})
        </button>
        <button
          onClick={() => setActiveTab('aging')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'aging' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Clock className="w-4 h-4" /> 15-Day Overdue ({overdue15DaysInvoices.length})
        </button>
      </div>

      {/* ================= TAB 1: INVOICES ================= */}
      {activeTab === 'invoices' && (
        <div className="space-y-4">
          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-gray-200">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search invoice # or client..."
                className="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
              {['All', 'Paid', 'Partially Paid', 'Sent', 'Overdue', 'Draft'].map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
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

          {/* Invoices Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Invoice Details</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Client &amp; GSTIN</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Compliance</th>
                  <th className="px-6 py-3.5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Amounts (₹)</th>
                  <th className="px-6 py-3.5 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3.5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 text-xs">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                      <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <p className="font-semibold text-gray-600 text-sm">No invoices found</p>
                      <p className="text-xs text-gray-400 mt-1">Create a new invoice to kickstart billing.</p>
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map(inv => {
                    const invoiceDateTs = new Date(inv.invoiceDate).getTime();
                    const ageInDays = Math.floor((Date.now() - invoiceDateTs) / (1000 * 60 * 60 * 24));
                    const isOverdue15 = inv.balanceDue > 0 && ageInDays > 15;

                    return (
                      <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="font-bold text-gray-900 block">{inv.invoiceNumber}</span>
                              <span className="text-[10px] text-gray-500">{inv.invoiceDate} • Due {inv.dueDate}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900">{inv.customerName}</div>
                          <div className="text-[11px] text-gray-500 font-mono">
                            {inv.customerGstin || 'Unregistered'} • {inv.placeOfSupply}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1 items-start">
                            {inv.einvoice ? (
                              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-purple-100 text-purple-800 border border-purple-200 flex items-center">
                                <QrCode className="w-3 h-3 mr-1" /> IRN Active
                              </span>
                            ) : (
                              <button
                                onClick={() => handleGenerateEInvoice(inv.id)}
                                className="text-[10px] text-purple-600 hover:text-purple-800 font-bold underline"
                              >
                                + Generate IRN
                              </button>
                            )}

                            {inv.ewaybill ? (
                              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200 flex items-center">
                                <Truck className="w-3 h-3 mr-1" /> EWB Active
                              </span>
                            ) : (
                              <button
                                onClick={() => setShowEwayModal(inv)}
                                className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold underline"
                              >
                                + E-Way Bill
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="font-bold text-gray-900 text-sm">₹{inv.totalAmount.toLocaleString()}</div>
                          {inv.balanceDue > 0 ? (
                            <div>
                              <span className="text-[11px] text-rose-600 font-semibold block">Due: ₹{inv.balanceDue.toLocaleString()}</span>
                              {isOverdue15 && (
                                <span className="text-[9px] font-black text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded inline-block mt-0.5">
                                  ⚠️ &gt;15d Overdue ({ageInDays}d)
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="text-[11px] text-emerald-600 font-bold">Paid in full</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusBadge(inv.status)}`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right space-x-1">
                          <button
                            onClick={() => handleSendWhatsApp(inv, isOverdue15)}
                            title="Share on WhatsApp"
                            className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setSelectedInvoice(inv)}
                            title="View / Print Tax Invoice"
                            className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEditInvoice(inv)}
                            title="Edit Invoice Details"
                            className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          {inv.balanceDue > 0 && (
                            <button
                              onClick={() => {
                                setPaymentModalInvoice(inv);
                                setPaymentForm({
                                  amount: inv.balanceDue,
                                  method: 'NEFT / RTGS',
                                  reference: '',
                                  notes: ''
                                });
                              }}
                              title="Record Payment"
                              className="p-1.5 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <CreditCard className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteInvoice(inv.id, inv.invoiceNumber)}
                            title="Delete Invoice"
                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
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

            {/* ================= TAB: SALES ORDERS ================= */}
      {activeTab === 'salesOrders' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Sales Orders Register</h3>
              <p className="text-xs text-gray-500">Record customer orders and convert directly to Tax Invoices or Delivery Challans</p>
            </div>
            <button
              onClick={() => setShowSoModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" /> + Create Sales Order
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-black uppercase text-gray-500 tracking-wider">
                    <th className="py-3 px-4">Order Number</th>
                    <th className="py-3 px-4">Customer &amp; GSTIN</th>
                    <th className="py-3 px-4">Order Date / Delivery</th>
                    <th className="py-3 px-4 text-right">Taxable Value</th>
                    <th className="py-3 px-4 text-right">Total Amount</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Conversion</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {salesOrders.map(so => (
                    <tr key={so.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600">{so.orderNumber}</td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-gray-900">{so.customerName}</p>
                        <p className="text-[10px] font-mono text-gray-400">{so.customerGstin}</p>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-gray-600">
                        {so.orderDate}
                        <p className="text-[10px] text-amber-600">Due: {so.expectedDeliveryDate}</p>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-gray-700">₹{so.subtotal?.toLocaleString()}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-gray-900">₹{so.totalAmount?.toLocaleString()}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full font-bold text-[10px] uppercase">
                          {so.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => handleConvertSalesOrder(so.id, so.orderNumber)}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-[11px] font-bold inline-flex items-center gap-1"
                        >
                          <Receipt className="w-3 h-3" /> Convert
                        </button>
                        <button
                          onClick={() => handleOpenEditSo(so)}
                          className="p-1 text-gray-400 hover:text-blue-600 rounded"
                          title="Edit Sales Order"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSalesOrder(so.id, so.orderNumber)}
                          className="p-1 text-gray-400 hover:text-rose-600 rounded"
                          title="Delete Sales Order"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {salesOrders.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-gray-400">
                        No sales orders recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB: QUOTATIONS ================= */}
      {activeTab === 'quotations' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Sales Quotations &amp; Proforma Invoices</h3>
              <p className="text-xs text-gray-500">Generate pre-sale estimates and convert into Tax Invoices upon customer approval</p>
            </div>
            <button
              onClick={() => setShowQuotationModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" /> + Create Quotation
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-black uppercase text-gray-500 tracking-wider">
                    <th className="py-3 px-4">Quotation Number</th>
                    <th className="py-3 px-4">Client Name &amp; GSTIN</th>
                    <th className="py-3 px-4">Date / Valid Until</th>
                    <th className="py-3 px-4 text-right">Taxable Value</th>
                    <th className="py-3 px-4 text-right">Total Amount</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">1-Click Conversion</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {quotations.map(q => (
                    <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600">{q.quotationNumber}</td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-gray-900">{q.customerName}</p>
                        <p className="text-[10px] font-mono text-gray-400">{q.customerGstin}</p>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-gray-600">
                        {q.date}
                        <p className="text-[10px] text-gray-400">Valid: {q.validUntil}</p>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-gray-700">₹{q.subtotal?.toLocaleString()}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-gray-900">₹{q.totalAmount?.toLocaleString()}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full font-bold text-[10px] uppercase">
                          {q.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => handleConvertQuotation(q.id, q.quotationNumber)}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-[11px] font-bold inline-flex items-center gap-1"
                        >
                          <Receipt className="w-3 h-3" /> Convert
                        </button>
                        <button
                          onClick={() => handleOpenEditQuotation(q)}
                          className="p-1 text-gray-400 hover:text-blue-600 rounded"
                          title="Edit Quotation"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuotation(q.id, q.quotationNumber)}
                          className="p-1 text-gray-400 hover:text-rose-600 rounded"
                          title="Delete Quotation"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {quotations.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-gray-400">
                        No quotations recorded. Click "+ Create Quotation" to begin.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB: DELIVERY CHALLANS ================= */}
      {activeTab === 'deliveryChallans' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Outward Delivery Challans</h3>
              <p className="text-xs text-gray-500">Track dispatches on approval, job-work, or multi-godown transit with E-Way Bill</p>
            </div>
            <button
              onClick={() => setShowDCModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" /> + Create Delivery Challan
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-black uppercase text-gray-500 tracking-wider">
                    <th className="py-3 px-4">Challan Number</th>
                    <th className="py-3 px-4">Consignee &amp; GSTIN</th>
                    <th className="py-3 px-4">Date / Dispatch Hub</th>
                    <th className="py-3 px-4">Transporter / Vehicle</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Bill to Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {deliveryChallans.map(dc => (
                    <tr key={dc.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600">{dc.challanNumber}</td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-gray-900">{dc.consigneeName}</p>
                        <p className="text-[10px] font-mono text-gray-400">{dc.consigneeGstin}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-mono text-gray-700">{dc.dispatchDate}</p>
                        <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-semibold">{dc.sourceWarehouse}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-gray-800">{dc.transporterName}</p>
                        <p className="text-[10px] font-mono text-gray-400">{dc.vehicleNo}</p>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px] uppercase">
                          {dc.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => handleConvertDC(dc.id, dc.challanNumber)}
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-[11px] font-bold inline-flex items-center gap-1"
                        >
                          <Receipt className="w-3 h-3" /> Bill
                        </button>
                        <button
                          onClick={() => handleOpenEditDC(dc)}
                          className="p-1 text-gray-400 hover:text-blue-600 rounded"
                          title="Edit Delivery Challan"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteDC(dc.id, dc.challanNumber)}
                          className="p-1 text-gray-400 hover:text-rose-600 rounded"
                          title="Delete Delivery Challan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {deliveryChallans.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-gray-400">
                        No delivery challans recorded.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB: CREDIT NOTES ================= */}
      {activeTab === 'creditNotes' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Credit Notes Register (Sales Returns &amp; Discounts)</h3>
              <p className="text-xs text-gray-500">Record customer credit adjustments under Section 34 of the CGST Act</p>
            </div>
            <button
              onClick={() => setShowCnModal(true)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" /> + Issue Credit Note
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-black uppercase text-gray-500 tracking-wider">
                    <th className="py-3 px-4">Note Number</th>
                    <th className="py-3 px-4">Original Invoice</th>
                    <th className="py-3 px-4">Customer &amp; GSTIN</th>
                    <th className="py-3 px-4">Reason / Nature</th>
                    <th className="py-3 px-4 text-right">Taxable Adjustment</th>
                    <th className="py-3 px-4 text-right">Total Credit Amount</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {creditNotes.map(cn => (
                    <tr key={cn.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-rose-600">{cn.noteNumber}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600">{cn.originalInvoiceNo}</td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-gray-900">{cn.customerName}</p>
                        <p className="text-[10px] font-mono text-gray-400">{cn.customerGstin}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded font-semibold text-[10px]">
                          {cn.reason}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-gray-700">₹{cn.subtotal?.toLocaleString()}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-rose-600">₹{cn.totalAmount?.toLocaleString()}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px] uppercase">
                          {cn.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenEditCN(cn)}
                          className="p-1 text-gray-400 hover:text-blue-600 rounded"
                          title="Edit Credit Note"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCN(cn.id, cn.noteNumber)}
                          className="p-1 text-gray-400 hover:text-rose-600 rounded"
                          title="Delete Credit Note"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {creditNotes.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-gray-400">
                        No credit notes recorded.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB: PRICE LISTS & CREDIT LIMITS ================= */}
      {activeTab === 'priceLists' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Multi-Tier Pricing Schedules &amp; Discount Rules</h3>
              <p className="text-xs text-gray-500">Configure customer category pricing tiers, bulk order discounts and validity dates</p>
            </div>
            <button
              onClick={handleOpenCreatePl}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" /> + Create Price List
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {priceLists.map(pl => (
              <div key={pl.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <h4 className="font-black text-gray-900 text-sm">{pl.listName}</h4>
                    <span className="text-[10px] text-gray-400 font-semibold">{pl.applicableCategory}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-bold rounded text-[10px]">
                      {pl.discountPercentage}% Discount Tier
                    </span>
                    <button onClick={() => handleOpenEditPl(pl)} className="p-1 text-gray-400 hover:text-blue-600 rounded">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDeletePl(pl.id, pl.listName)} className="p-1 text-gray-400 hover:text-rose-600 rounded">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mb-4">Applicable Category: {pl.applicableCategory}</p>

                <div className="space-y-2 text-xs">
                  {pl.items.map((itm: any, idx: number) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded-xl flex items-center justify-between">
                      <div>
                        <p className="font-bold text-gray-900">{itm.itemName}</p>
                        <p className="text-[10px] font-mono text-gray-400">{itm.sku}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-gray-400 line-through block">₹{itm.standardPrice?.toLocaleString()}</span>
                        <span className="font-mono font-bold text-emerald-700">₹{itm.tierPrice?.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      
      {/* ================= TAB: POS RETAIL QUICK BILLING ================= */}
      {activeTab === 'pos' && (
        <div className="space-y-6">
          {/* Shift Banner */}
          <div className="bg-gradient-to-r from-amber-900 via-slate-900 to-amber-950 p-4 rounded-2xl text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/20 text-amber-300 rounded-xl border border-amber-400/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-300 uppercase">POS Terminal • Shift {posShift.shiftNumber}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    {posShift.status}
                  </span>
                </div>
                <p className="text-xs text-gray-300">Cashier: <strong>{posShift.cashierName}</strong> • Day Revenue: <strong>₹{posShift.totalRevenue?.toLocaleString()}</strong></p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right text-xs">
                <span className="text-gray-400 block text-[10px] uppercase">Drawer Cash</span>
                <strong className="text-white font-mono text-sm">₹{posShift.expectedDrawerCash?.toLocaleString()}</strong>
              </div>
              <button
                onClick={() => setShowShiftModal(true)}
                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
              >
                Close Shift &amp; Audit
              </button>
            </div>
          </div>

          {posReceiptMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl flex items-center gap-2 text-xs font-bold">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              {posReceiptMsg}
            </div>
          )}

          {/* POS Dual Panel: Catalog + Cart */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Quick Catalog */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-gray-200 flex justify-between items-center">
                <h3 className="text-sm font-bold text-gray-900">Retail Catalog (Quick Tap)</h3>
                <span className="text-xs text-gray-400">Click item to add to bill</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {posCatalog.map(item => (
                  <div
                    key={item.id}
                    onClick={() => handleAddToCart(item)}
                    className="bg-white p-4 rounded-2xl border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <span className="font-mono text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{item.sku}</span>
                      <h4 className="font-bold text-gray-900 text-xs mt-1.5">{item.name}</h4>
                    </div>
                    <div className="mt-3 pt-2 border-t border-gray-100 flex justify-between items-center">
                      <span className="text-xs font-mono font-bold text-emerald-700">₹{item.price.toLocaleString()}</span>
                      <span className="text-[11px] font-bold text-blue-600">+ Add</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Active Ticket Cart */}
            <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <h3 className="text-sm font-bold text-gray-900">Current POS Ticket ({posCart.length} items)</h3>
                  {posCart.length > 0 && (
                    <button onClick={() => setPosCart([])} className="text-xs text-rose-600 font-bold hover:underline">
                      Clear
                    </button>
                  )}
                </div>

                <div className="mt-4 space-y-3 max-h-72 overflow-y-auto pr-1">
                  {posCart.map(p => (
                    <div key={p.id} className="flex justify-between items-center p-2.5 bg-gray-50 rounded-xl text-xs">
                      <div className="flex-1 pr-2">
                        <p className="font-bold text-gray-900">{p.name}</p>
                        <p className="text-[10px] font-mono text-gray-400">₹{p.price} × {p.qty}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center border border-gray-200 rounded-lg bg-white overflow-hidden">
                          <button onClick={() => handleUpdateCartQty(p.id, -1)} className="px-2 py-0.5 hover:bg-gray-100 font-bold">-</button>
                          <span className="px-2 font-mono font-bold">{p.qty}</span>
                          <button onClick={() => handleUpdateCartQty(p.id, 1)} className="px-2 py-0.5 hover:bg-gray-100 font-bold">+</button>
                        </div>
                        <span className="font-mono font-bold text-gray-900 w-16 text-right">
                          ₹{(p.price * p.qty).toLocaleString()}
                        </span>
                        <button onClick={() => handleRemoveFromCart(p.id)} className="text-gray-400 hover:text-rose-600 p-1">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {posCart.length === 0 && (
                    <div className="py-12 text-center text-gray-400 text-xs">
                      Ticket is empty. Tap items on the left to start billing.
                    </div>
                  )}
                </div>
              </div>

              {/* Checkout Footer */}
              {posCart.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                  {(() => {
                    const taxable = posCart.reduce((a, b) => a + (b.price * b.qty), 0);
                    const gst = Math.round(taxable * 0.18);
                    const grandTotal = taxable + gst;
                    return (
                      <>
                        <div className="space-y-1.5 text-xs">
                          <div className="flex justify-between text-gray-500">
                            <span>Subtotal Taxable:</span>
                            <span className="font-mono">₹{taxable.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-gray-500">
                            <span>GST @ 18% (CGST 9% + SGST 9%):</span>
                            <span className="font-mono">₹{gst.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-base font-black text-gray-900 pt-2 border-t border-dashed border-gray-200">
                            <span>Payable Amount:</span>
                            <span className="font-mono text-emerald-700">₹{grandTotal.toLocaleString()}</span>
                          </div>
                        </div>

                        {/* Tender Options */}
                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 mb-1.5">Payment Method</label>
                          <div className="grid grid-cols-3 gap-2">
                            {(['UPI', 'Cash', 'Card'] as const).map(m => (
                              <button
                                key={m}
                                type="button"
                                onClick={() => setPosTenderMethod(m)}
                                className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                                  posTenderMethod === m ? 'bg-blue-600 text-white border-blue-600 shadow-xs' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                                }`}
                              >
                                {m === 'UPI' ? '⚡ UPI QR' : m === 'Cash' ? '💵 Cash' : '💳 Card'}
                              </button>
                            ))}
                          </div>
                        </div>

                        <button
                          onClick={handlePOSCheckout}
                          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Charge ₹{grandTotal.toLocaleString()} &amp; Print Slip
                        </button>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: RECURRING BILLING ================= */}
      {activeTab === 'recurring' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200">
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Automated Subscription &amp; Retainer Schedules</h3>
              <p className="text-xs text-gray-500">Scheduled invoices auto-generate on the configured cycle and sync into P&amp;L revenue.</p>
            </div>
            <button
              onClick={() => setShowRecurringModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Retainer Plan
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recurringProfiles.map(rec => (
              <div key={rec.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {rec.cycle} Retainer
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditRecurring(rec)}
                        className="text-gray-400 hover:text-blue-600 p-1 cursor-pointer"
                        title="Edit Retainer Plan"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteRecurring(rec.id)}
                        className="text-gray-400 hover:text-rose-600 p-1 cursor-pointer"
                        title="Delete Retainer Plan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <h4 className="font-bold text-gray-900 text-sm">{rec.planName}</h4>
                  <p className="text-xs text-gray-500 mt-1">{rec.customerName}</p>
                  <p className="text-[11px] text-gray-400 font-mono">{rec.customerEmail}</p>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                    <div>
                      <span className="text-[10px] text-gray-400 block uppercase font-bold">Billing Amount</span>
                      <strong className="text-gray-900 text-base">₹{rec.amount.toLocaleString()}</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 block uppercase font-bold">Next Run</span>
                      <strong className="text-indigo-600">{rec.nextBillingDate}</strong>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="flex items-center text-emerald-600 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Auto-Invoice Active
                  </span>
                  <span className="text-gray-400">ID: {rec.id}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 3: 15-DAY OVERDUE & AGING ================= */}
      {activeTab === 'aging' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm">
              <span className="text-xs font-bold text-emerald-700 uppercase">Within Credit Period (0 - 15 Days)</span>
              <h3 className="text-2xl font-black text-gray-900 mt-1">
                ₹{invoices.filter(i => {
                  if (i.balanceDue <= 0) return false;
                  const ageInDays = Math.floor((Date.now() - new Date(i.invoiceDate).getTime()) / (1000 * 60 * 60 * 24));
                  return ageInDays <= 15;
                }).reduce((a, b) => a + b.balanceDue, 0).toLocaleString()}
              </h3>
              <p className="text-xs text-gray-500 mt-1">Regular accounts in standard credit window</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm">
              <span className="text-xs font-bold text-rose-700 uppercase">Accounts Alert (&gt;15 Days Overdue)</span>
              <h3 className="text-2xl font-black text-rose-600 mt-1">
                ₹{totalOverdue15DaysAmount.toLocaleString()}
              </h3>
              <p className="text-xs text-rose-600 font-bold mt-1">
                {overdue15DaysInvoices.length} Invoices requiring accounts follow-up
              </p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-indigo-100 shadow-sm">
              <span className="text-xs font-bold text-indigo-700 uppercase">Unified Ledger Impact</span>
              <h3 className="text-2xl font-black text-indigo-600 mt-1">
                ₹{summary.totalPaid.toLocaleString()}
              </h3>
              <p className="text-xs text-gray-500 mt-1">Realized into Balance Sheet Cash &amp; Bank</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Client-by-Client Outstanding &amp; Overdue Ledger</h3>
                <p className="text-xs text-gray-500">Includes 1-click WhatsApp reminder notice button for each account.</p>
              </div>
              <Link
                to="/erp/finance"
                className="text-xs font-bold text-blue-600 hover:underline flex items-center"
              >
                Open Full Financial Statements Suite <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            <div className="divide-y divide-gray-100">
              {invoices.filter(i => i.balanceDue > 0).map(i => {
                const invoiceDateTs = new Date(i.invoiceDate).getTime();
                const ageInDays = Math.floor((Date.now() - invoiceDateTs) / (1000 * 60 * 60 * 24));
                const isOverdue15 = ageInDays > 15;

                return (
                  <div key={i.id} className="py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <strong className="text-gray-900 font-bold text-sm">{i.customerName}</strong>
                        {isOverdue15 && (
                          <span className="text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300 px-2 py-0.5 rounded-full flex items-center">
                            <AlertCircle className="w-3 h-3 mr-1" /> 15-Day Overdue ({ageInDays} Days Old)
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {i.invoiceNumber} • Billed: ₹{i.totalAmount.toLocaleString()} • Due on <strong className="text-gray-700">{i.dueDate}</strong>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <strong className={`font-mono text-base font-black ${isOverdue15 ? 'text-rose-600' : 'text-gray-900'}`}>
                          ₹{i.balanceDue.toLocaleString()}
                        </strong>
                        <span className="text-[10px] text-gray-400 block font-mono">Outstanding</span>
                      </div>
                      <button
                        onClick={() => handleSendWhatsApp(i, isOverdue15)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center shadow-xs cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5 mr-1.5" /> WhatsApp Notice
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: CREATE TAX INVOICE ================= */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-[850px] max-w-full max-h-[92vh] overflow-y-auto p-6 md:p-8">
            <div className="flex justify-between items-start mb-6 pb-4 border-b border-gray-100">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">New Billing Document</span>
                <h3 className="text-xl font-black text-gray-900">Generate Professional Tax Invoice</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Entering customer details here automatically updates CRM, P&amp;L, Balance Sheet, and Client Outstanding.
                </p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-6">
              {/* Basic Meta */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Invoice Document Type</label>
                  <select
                    value={invoiceForm.invoiceType}
                    onChange={e => setInvoiceForm({ ...invoiceForm, invoiceType: e.target.value as any })}
                    className="w-full text-xs border border-gray-300 rounded-xl p-2.5 bg-white font-medium"
                  >
                    <option>Tax Invoice</option>
                    <option>Proforma Invoice</option>
                    <option>Retainer Invoice</option>
                    <option>Commercial Invoice</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Invoice Date</label>
                  <input
                    type="date"
                    required
                    value={invoiceForm.invoiceDate}
                    onChange={e => setInvoiceForm({ ...invoiceForm, invoiceDate: e.target.value })}
                    className="w-full text-xs border border-gray-300 rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={invoiceForm.dueDate}
                    onChange={e => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                    className="w-full text-xs border border-gray-300 rounded-xl p-2.5"
                  />
                </div>
              </div>

              {/* Customer Information */}
              <div className="bg-slate-50 p-4 rounded-2xl space-y-3 border border-slate-100">
                <h4 className="font-bold text-xs text-gray-700 uppercase">Customer &amp; GST Details (Auto-Synced to CRM)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <input
                      required
                      placeholder="Customer / Company Name *"
                      value={invoiceForm.customerName}
                      onChange={e => setInvoiceForm({ ...invoiceForm, customerName: e.target.value })}
                      className="w-full text-xs border border-gray-300 rounded-xl p-2.5 bg-white font-medium"
                    />
                  </div>
                  <div>
                    <input
                      placeholder="GSTIN (e.g. 29AAACT2727Q1ZB)"
                      value={invoiceForm.customerGstin}
                      onChange={e => setInvoiceForm({ ...invoiceForm, customerGstin: e.target.value })}
                      className="w-full text-xs border border-gray-300 rounded-xl p-2.5 bg-white font-mono"
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      placeholder="Billing Email Address"
                      value={invoiceForm.customerEmail}
                      onChange={e => setInvoiceForm({ ...invoiceForm, customerEmail: e.target.value })}
                      className="w-full text-xs border border-gray-300 rounded-xl p-2.5 bg-white"
                    />
                  </div>
                  <div>
                    <input
                      placeholder="Billing Phone Number (for WhatsApp Alerts)"
                      value={invoiceForm.customerPhone}
                      onChange={e => setInvoiceForm({ ...invoiceForm, customerPhone: e.target.value })}
                      className="w-full text-xs border border-gray-300 rounded-xl p-2.5 bg-white font-mono"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <input
                      placeholder="Full Billing Address"
                      value={invoiceForm.billingAddress}
                      onChange={e => setInvoiceForm({ ...invoiceForm, billingAddress: e.target.value })}
                      className="w-full text-xs border border-gray-300 rounded-xl p-2.5 bg-white"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-1">
                  <label className="flex items-center text-xs font-semibold text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={invoiceForm.isInterState}
                      onChange={e => setInvoiceForm({ ...invoiceForm, isInterState: e.target.checked })}
                      className="mr-2 rounded text-blue-600 focus:ring-blue-500"
                    />
                    Inter-State Supply (Apply IGST instead of CGST + SGST)
                  </label>
                  <span className="text-[11px] text-gray-400 font-mono">Place of Supply: {invoiceForm.placeOfSupply}</span>
                </div>
              </div>

              {/* Line Items */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold text-xs text-gray-700 uppercase">Itemized Line Entries</h4>
                  <button
                    type="button"
                    onClick={addItemRow}
                    className="text-xs text-blue-600 font-bold hover:underline flex items-center cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Entry
                  </button>
                </div>

                <div className="space-y-2">
                  {invoiceForm.items.map((item, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded-xl border border-gray-200 grid grid-cols-12 gap-2 items-center text-xs">
                      <div className="col-span-4">
                        <input
                          required
                          placeholder="Item Description"
                          value={item.description}
                          onChange={e => updateItemRow(idx, 'description', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg p-2 bg-white text-xs"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          placeholder="HSN/SAC"
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
                          placeholder="Rate (₹)"
                          value={item.unitPrice}
                          onChange={e => updateItemRow(idx, 'unitPrice', e.target.value)}
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
                          className="text-gray-400 hover:text-rose-600 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Calculations Box */}
              {(() => {
                const totals = calculateFormTotals();
                return (
                  <div className="bg-slate-900 text-white p-5 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-xs space-y-1 text-gray-300">
                      <div>Taxable Subtotal: <strong className="text-white">₹{totals.subtotal.toLocaleString()}</strong></div>
                      <div>Total GST ({invoiceForm.isInterState ? 'IGST' : 'CGST + SGST'}): <strong className="text-emerald-400">₹{totals.taxTotal.toLocaleString()}</strong></div>
                      {totals.discountTotal > 0 && (
                        <div>Discounts Applied: <span className="text-rose-400">- ₹{totals.discountTotal.toLocaleString()}</span></div>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-400 uppercase font-bold block">Total Invoice Value (INR)</span>
                      <strong className="text-2xl font-black text-white">₹{totals.total.toLocaleString()}</strong>
                    </div>
                  </div>
                );
              })()}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  Create &amp; Issue Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: PRINTABLE TAX INVOICE PREVIEW ================= */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-[860px] max-w-full max-h-[92vh] overflow-y-auto p-6 md:p-10 flex flex-col justify-between">
            <div>
              {/* Action Toolbar */}
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100 print:hidden">
                <div className="flex items-center space-x-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusBadge(selectedInvoice.status)}`}>
                    {selectedInvoice.status}
                  </span>
                  <span className="text-xs text-gray-500 font-mono">ID: {selectedInvoice.id}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const inv = selectedInvoice;
                      setSelectedInvoice(null);
                      handleOpenEditInvoice(inv);
                    }}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center shadow-xs cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5 mr-1.5" /> Edit Invoice
                  </button>
                  <button
                    onClick={() => handleSendWhatsApp(selectedInvoice)}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center shadow-xs cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5 mr-1.5" /> WhatsApp
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center shadow-xs cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 mr-1.5" /> Print
                  </button>
                  <button
                    onClick={() => {
                      alert(`Downloading PDF for invoice ${selectedInvoice.invoiceNumber}...`);
                    }}
                    className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold flex items-center shadow-xs cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 mr-1.5" /> Download PDF
                  </button>
                  <button
                    onClick={() => setSelectedInvoice(null)}
                    className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Printable Invoice Sheet */}
              <div className="border border-gray-200 rounded-2xl p-8 space-y-6 bg-white text-gray-800">
                {/* Letterhead */}
                <div className="flex justify-between items-start pb-6 border-b border-gray-200">
                  <div>
                    <div className="flex items-center space-x-2">
                      <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-lg">
                        Ω
                      </div>
                      <div>
                        <h2 className="text-lg font-black text-gray-900 leading-tight">OmniCloud Enterprise Technologies Pvt Ltd</h2>
                        <p className="text-[11px] text-gray-500">Cloud Architecture &amp; Enterprise Software Systems</p>
                      </div>
                    </div>
                    <div className="text-[10px] text-gray-500 mt-3 space-y-0.5 font-mono">
                      <div>GSTIN: <strong>29AAFCO1029Q1Z4</strong> | PAN: AAFCO1029Q</div>
                      <div>Plot 42, Electronic City Phase 1, Bangalore, Karnataka - 560100</div>
                      <div>contact@omnicloud.enterprise.in | +91 80 4499 8800</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs uppercase font-bold tracking-widest text-blue-600 block">TAX INVOICE</span>
                    <h3 className="text-xl font-black text-gray-900 font-mono mt-0.5">{selectedInvoice.invoiceNumber}</h3>
                    <div className="text-[11px] text-gray-500 mt-2 space-y-0.5 font-mono">
                      <div>Date: <strong>{selectedInvoice.invoiceDate}</strong></div>
                      <div>Due Date: <strong>{selectedInvoice.dueDate}</strong></div>
                      <div>Place of Supply: <strong>{selectedInvoice.placeOfSupply}</strong></div>
                    </div>
                  </div>
                </div>

                {/* E-Invoice & E-Way Bill Box */}
                {(selectedInvoice.einvoice || selectedInvoice.ewaybill) && (
                  <div className="bg-purple-50/70 border border-purple-200 p-4 rounded-xl text-xs space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-purple-900 flex items-center">
                        <QrCode className="w-4 h-4 mr-1.5 text-purple-700" /> Govt E-Invoice &amp; NIC E-Way Bill Verification
                      </span>
                      <span className="text-[10px] bg-purple-200 text-purple-900 px-2 py-0.5 rounded font-bold font-mono">
                        GST E-INVOICE ACTIVE
                      </span>
                    </div>

                    {selectedInvoice.einvoice && (
                      <div className="text-[11px] space-y-0.5 font-mono text-purple-950">
                        <div>IRN (64-Char Hash): <strong className="break-all">{selectedInvoice.einvoice.irn}</strong></div>
                        <div className="flex gap-4">
                          <span>Ack No: <strong>{selectedInvoice.einvoice.ackNo}</strong></span>
                          <span>Ack Date: <strong>{selectedInvoice.einvoice.ackDate}</strong></span>
                        </div>
                      </div>
                    )}

                    {selectedInvoice.ewaybill && (
                      <div className="pt-2 border-t border-purple-200 text-[11px] flex justify-between font-mono text-indigo-950">
                        <span>E-Way Bill #: <strong>{selectedInvoice.ewaybill.ewayBillNo}</strong></span>
                        <span>Vehicle #: <strong>{selectedInvoice.ewaybill.vehicleNo}</strong></span>
                        <span>Valid Until: <strong>{selectedInvoice.ewaybill.validUntil}</strong></span>
                      </div>
                    )}
                  </div>
                )}

                {/* Bill To & Ship To */}
                <div className="grid grid-cols-2 gap-6 text-xs bg-slate-50 p-4 rounded-xl">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Billed To (Client):</span>
                    <strong className="text-sm font-bold text-gray-900 block">{selectedInvoice.customerName}</strong>
                    <p className="text-gray-600 mt-1">{selectedInvoice.billingAddress}</p>
                    <div className="mt-2 font-mono text-[11px] text-gray-700">
                      GSTIN: <strong>{selectedInvoice.customerGstin || 'Unregistered'}</strong>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Payment &amp; Terms:</span>
                    <div>Payment Terms: <strong>{selectedInvoice.paymentTerms}</strong></div>
                    <div>Currency: <strong>{selectedInvoice.currency} (INR)</strong></div>
                    <div className="mt-2 text-gray-500 italic">{selectedInvoice.terms}</div>
                  </div>
                </div>

                {/* Items Table */}
                <table className="min-w-full text-xs divide-y divide-gray-200">
                  <thead>
                    <tr className="bg-gray-100/70 text-gray-600 uppercase text-[10px] tracking-wider">
                      <th className="py-2.5 px-3 text-left">#</th>
                      <th className="py-2.5 px-3 text-left">Item Description</th>
                      <th className="py-2.5 px-3 text-center">HSN/SAC</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Unit Rate</th>
                      <th className="py-2.5 px-3 text-right">GST Rate</th>
                      <th className="py-2.5 px-3 text-right">Total Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {selectedInvoice.items.map((itm, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-3 px-3 text-gray-400 font-mono">{idx + 1}</td>
                        <td className="py-3 px-3 font-medium text-gray-900">{itm.description}</td>
                        <td className="py-3 px-3 text-center font-mono text-gray-500">{itm.hsnCode}</td>
                        <td className="py-3 px-3 text-center">{itm.quantity} {itm.unit}</td>
                        <td className="py-3 px-3 text-right font-mono">₹{itm.unitPrice.toLocaleString()}</td>
                        <td className="py-3 px-3 text-right font-mono text-gray-600">{itm.taxRate}%</td>
                        <td className="py-3 px-3 text-right font-bold text-gray-900 font-mono">₹{itm.amount?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Totals Section */}
                <div className="flex justify-between items-start pt-4 border-t border-gray-200 text-xs">
                  <div className="w-1/2 space-y-2">
                    <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-[11px] text-gray-700">
                      <span className="font-bold text-blue-900 block mb-1">Bank Remittance Instructions:</span>
                      <div>Bank Name: <strong>HDFC Bank Ltd</strong></div>
                      <div>A/C Name: <strong>OmniCloud Enterprise Tech Pvt Ltd</strong></div>
                      <div>A/C Number: <strong>50200088991122</strong></div>
                      <div>IFSC Code: <strong>HDFC0001029</strong></div>
                      <div>UPI VPA: <strong>omnicloud@hdfcbank</strong></div>
                    </div>
                    {selectedInvoice.notes && (
                      <p className="text-gray-500 italic text-[11px]">{selectedInvoice.notes}</p>
                    )}
                  </div>

                  <div className="w-72 space-y-1.5 text-right font-mono text-xs">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal:</span>
                      <strong>₹{selectedInvoice.subtotal.toLocaleString()}</strong>
                    </div>
                    {selectedInvoice.discountTotal > 0 && (
                      <div className="flex justify-between text-rose-600">
                        <span>Discount:</span>
                        <strong>- ₹{selectedInvoice.discountTotal.toLocaleString()}</strong>
                      </div>
                    )}
                    <div className="flex justify-between text-gray-600">
                      <span>GST ({selectedInvoice.isInterState ? 'IGST' : 'CGST + SGST'}):</span>
                      <strong>₹{selectedInvoice.taxTotal.toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between text-base font-black text-gray-900 border-t border-gray-200 pt-2">
                      <span>Total:</span>
                      <strong>₹{selectedInvoice.totalAmount.toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between text-emerald-600">
                      <span>Paid to Date:</span>
                      <strong>₹{selectedInvoice.paidAmount.toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-rose-600 border-t border-dashed border-gray-200 pt-1">
                      <span>Balance Due:</span>
                      <strong>₹{selectedInvoice.balanceDue.toLocaleString()}</strong>
                    </div>
                  </div>
                </div>

                {/* Signatory */}
                <div className="pt-8 flex justify-between items-end border-t border-gray-200 text-xs text-gray-500">
                  <div>
                    <span className="font-mono text-[10px]">Computer generated invoice. No physical signature required.</span>
                  </div>
                  <div className="text-right">
                    <div className="h-10 border-b border-gray-300 w-44 mb-1"></div>
                    <span className="font-bold text-gray-700">Authorized Signatory</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-between items-center pt-4 border-t border-gray-100 print:hidden">
              <div className="flex items-center gap-2">
                {!selectedInvoice.einvoice && (
                  <button
                    onClick={() => handleGenerateEInvoice(selectedInvoice.id)}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center shadow-xs cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5 mr-1" /> + Generate IRN
                  </button>
                )}
                {!selectedInvoice.ewaybill && (
                  <button
                    onClick={() => setShowEwayModal(selectedInvoice)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center shadow-xs cursor-pointer"
                  >
                    <Truck className="w-3.5 h-3.5 mr-1" /> + E-Way Bill
                  </button>
                )}
                <button
                  onClick={() => handleDeleteInvoice(selectedInvoice.id, selectedInvoice.invoiceNumber)}
                  className="text-xs text-rose-600 font-bold hover:underline flex items-center ml-2 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                </button>
              </div>

              <div className="flex gap-2">
                {selectedInvoice.balanceDue > 0 && (
                  <button
                    onClick={() => {
                      setPaymentModalInvoice(selectedInvoice);
                      setPaymentForm({
                        amount: selectedInvoice.balanceDue,
                        method: 'NEFT / RTGS',
                        reference: '',
                        notes: ''
                      });
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Record Payment
                  </button>
                )}
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: RECORD PAYMENT ================= */}
      {paymentModalInvoice && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-[480px] max-w-full p-6">
            <h3 className="text-lg font-black text-gray-900 mb-1">Record Payment Receipt</h3>
            <p className="text-xs text-gray-500 mb-4">
              Invoice <strong className="text-gray-900">{paymentModalInvoice.invoiceNumber}</strong> • Balance Due: ₹{paymentModalInvoice.balanceDue.toLocaleString()}
            </p>

            <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Amount Received (₹)</label>
                <input
                  type="number"
                  required
                  max={paymentModalInvoice.balanceDue}
                  value={paymentForm.amount}
                  onChange={e => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 font-bold text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Payment Method</label>
                <select
                  value={paymentForm.method}
                  onChange={e => setPaymentForm({ ...paymentForm, method: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 bg-white font-medium"
                >
                  <option>NEFT / RTGS</option>
                  <option>UPI / QR Code</option>
                  <option>Credit Card</option>
                  <option>Cheque</option>
                  <option>Cash</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Transaction UTR / Reference No</label>
                <input
                  required
                  placeholder="e.g. HDFC-UTR-908123"
                  value={paymentForm.reference}
                  onChange={e => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Notes</label>
                <input
                  placeholder="Optional remarks"
                  value={paymentForm.notes}
                  onChange={e => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setPaymentModalInvoice(null)}
                  className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Confirm &amp; Reconcile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: GENERATE E-WAY BILL ================= */}
      {showEwayModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-[500px] max-w-full p-6">
            <h3 className="text-lg font-black text-gray-900 mb-1">Generate Govt E-Way Bill</h3>
            <p className="text-xs text-gray-500 mb-4">
              Invoice <strong className="text-gray-900">{showEwayModal.invoiceNumber}</strong> • Client: {showEwayModal.customerName}
            </p>

            <form onSubmit={handleGenerateEWayBill} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Transporter ID / Name</label>
                <input
                  required
                  value={ewayForm.transporterId}
                  onChange={e => setEwayForm({ ...ewayForm, transporterId: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 font-mono"
                  placeholder="e.g. TRANS-BLR-001 / Blue Dart"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Vehicle Registration Number</label>
                <input
                  required
                  value={ewayForm.vehicleNo}
                  onChange={e => setEwayForm({ ...ewayForm, vehicleNo: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 font-mono uppercase"
                  placeholder="KA-01-MJ-8822"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Distance (in Kilometers)</label>
                <input
                  type="number"
                  required
                  value={ewayForm.distanceKm}
                  onChange={e => setEwayForm({ ...ewayForm, distanceKm: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 font-bold"
                  placeholder="180"
                />
                <span className="text-[10px] text-gray-400 mt-1 block">Valid until 1 day per 200 km travelled.</span>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEwayModal(null)}
                  className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Generate E-Way Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: NEW RECURRING SCHEDULE ================= */}
      {showRecurringModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-[500px] max-w-full p-6">
            <h3 className="text-lg font-black text-gray-900 mb-1">Add Recurring Retainer Plan</h3>
            <p className="text-xs text-gray-500 mb-4">Set up an automated billing schedule for customer contracts.</p>

            <form onSubmit={handleCreateRecurring} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Customer / Client Name *</label>
                <input
                  required
                  placeholder="e.g. Infosys BPM Operations"
                  value={recurringForm.customerName}
                  onChange={e => setRecurringForm({ ...recurringForm, customerName: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Plan / Retainer Description *</label>
                <input
                  required
                  placeholder="e.g. Dedicated 24/7 SRE SLA Retainer"
                  value={recurringForm.planName}
                  onChange={e => setRecurringForm({ ...recurringForm, planName: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Billing Cycle</label>
                  <select
                    value={recurringForm.cycle}
                    onChange={e => setRecurringForm({ ...recurringForm, cycle: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 bg-white font-medium"
                  >
                    <option>Monthly</option>
                    <option>Quarterly</option>
                    <option>Annual</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Amount per Cycle (₹)</label>
                  <input
                    type="number"
                    required
                    value={recurringForm.amount}
                    onChange={e => setRecurringForm({ ...recurringForm, amount: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Next Billing Date</label>
                <input
                  type="date"
                  required
                  value={recurringForm.nextBillingDate}
                  onChange={e => setRecurringForm({ ...recurringForm, nextBillingDate: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowRecurringModal(false)}
                  className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: CREATE SALES ORDER ================= */}
      {showSoModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-[650px] max-w-full p-6">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-black text-gray-900">Record Sales Order (SO)</h3>
                <p className="text-xs text-gray-500">Confirmed customer order tracking prior to dispatch or billing</p>
              </div>
              <button onClick={() => setShowSoModal(false)} className="p-1 rounded-full hover:bg-gray-100 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSalesOrder} className="space-y-3.5 pt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Customer Legal Name *</label>
                  <input
                    required
                    value={soForm.customerName}
                    onChange={e => setSoForm({ ...soForm, customerName: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Customer GSTIN</label>
                  <input
                    value={soForm.customerGstin}
                    onChange={e => setSoForm({ ...soForm, customerGstin: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Expected Delivery Date</label>
                  <input
                    type="date"
                    value={soForm.expectedDeliveryDate}
                    onChange={e => setSoForm({ ...soForm, expectedDeliveryDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Billing / Shipping Address</label>
                  <input
                    value={soForm.billingAddress}
                    onChange={e => setSoForm({ ...soForm, billingAddress: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setShowSoModal(false)} className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs">Confirm Sales Order</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ISSUE CREDIT NOTE ================= */}
      {showCnModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-[650px] max-w-full p-6">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-black text-gray-900">Issue Credit Note</h3>
                <p className="text-xs text-gray-500">Record customer sales returns or post-sale trade discounts</p>
              </div>
              <button onClick={() => setShowCnModal(false)} className="p-1 rounded-full hover:bg-gray-100 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCreditNote} className="space-y-3.5 pt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Original Invoice Number *</label>
                  <input
                    required
                    value={cnForm.originalInvoiceNo}
                    onChange={e => setCnForm({ ...cnForm, originalInvoiceNo: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Credit Reason *</label>
                  <select
                    value={cnForm.reason}
                    onChange={e => setCnForm({ ...cnForm, reason: e.target.value as any })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 bg-white font-medium"
                  >
                    <option value="Post-Sale Discount">Post-Sale Discount</option>
                    <option value="Sales Return">Sales Return</option>
                    <option value="Deficiency of Service">Deficiency of Service</option>
                    <option value="Correction">Correction</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setShowCnModal(false)} className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs">Issue Credit Note</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: CLOSE SHIFT AUDIT ================= */}
      {showShiftModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-[480px] max-w-full p-6 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-black text-gray-900">Close Cashier Shift &amp; Drawer Audit</h3>
                <p className="text-xs text-gray-500">Compare physical cash in drawer against system tally</p>
              </div>
              <button onClick={() => setShowShiftModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <form onSubmit={handleCloseShiftSubmit} className="space-y-4 pt-4">
              <div className="bg-slate-50 p-3.5 rounded-2xl space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Opening Float:</span>
                  <span className="font-mono font-bold">₹{posShift.openingCash?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Cash Sales Today:</span>
                  <span className="font-mono font-bold text-emerald-700">+₹{posShift.cashSales?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Cash Paid Out (Expenses):</span>
                  <span className="font-mono font-bold text-rose-700">-₹{posShift.cashExpenses?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-900 font-bold border-t border-gray-200 pt-2">
                  <span>Expected Cash in Drawer:</span>
                  <span className="font-mono text-blue-700">₹{posShift.expectedDrawerCash?.toLocaleString()}</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Actual Physical Cash Counted (₹) *</label>
                <input
                  type="number"
                  required
                  value={actualDrawerCount}
                  onChange={e => setActualDrawerCount(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-xl p-2.5 font-mono font-bold text-sm"
                />
              </div>

              {actualDrawerCount !== posShift.expectedDrawerCash && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 font-bold">
                  ⚠️ Discrepancy Variance: ₹{(actualDrawerCount - posShift.expectedDrawerCash).toLocaleString()}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowShiftModal(false)}
                  className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Verify &amp; Close Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT INVOICE ================= */}
      {showEditInvoiceModal && editingInvoice && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-[520px] max-w-full p-6 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Edit Invoice {editingInvoice.invoiceNumber}</h3>
              <button onClick={() => setShowEditInvoiceModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleEditInvoiceSubmit} className="space-y-4 pt-4">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Customer Name</label>
                <input
                  type="text"
                  required
                  value={editInvoiceForm.customerName}
                  onChange={e => setEditInvoiceForm({ ...editInvoiceForm, customerName: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 font-semibold"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Invoice Date</label>
                  <input
                    type="date"
                    value={editInvoiceForm.invoiceDate}
                    onChange={e => setEditInvoiceForm({ ...editInvoiceForm, invoiceDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={editInvoiceForm.dueDate}
                    onChange={e => setEditInvoiceForm({ ...editInvoiceForm, dueDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Status</label>
                  <select
                    value={editInvoiceForm.status}
                    onChange={e => setEditInvoiceForm({ ...editInvoiceForm, status: e.target.value as any })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 bg-white font-bold"
                  >
                    <option value="Unpaid">Unpaid</option>
                    <option value="Paid">Paid</option>
                    <option value="Partially Paid">Partially Paid</option>
                    <option value="Overdue">Overdue</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Total Amount (₹)</label>
                  <input
                    type="number"
                    value={editInvoiceForm.totalAmount}
                    onChange={e => setEditInvoiceForm({ ...editInvoiceForm, totalAmount: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-mono font-bold"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Notes / Terms</label>
                <textarea
                  rows={2}
                  value={editInvoiceForm.notes}
                  onChange={e => setEditInvoiceForm({ ...editInvoiceForm, notes: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setShowEditInvoiceModal(false)} className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT SALES ORDER ================= */}
      {showEditSoModal && editingSo && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-[480px] max-w-full p-6 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Edit Sales Order {editingSo.orderNumber}</h3>
              <button onClick={() => setShowEditSoModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleEditSoSubmit} className="space-y-4 pt-4">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Customer Name</label>
                <input
                  type="text"
                  required
                  value={editSoForm.customerName}
                  onChange={e => setEditSoForm({ ...editSoForm, customerName: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 font-semibold"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Expected Delivery Date</label>
                  <input
                    type="date"
                    value={editSoForm.expectedDeliveryDate}
                    onChange={e => setEditSoForm({ ...editSoForm, expectedDeliveryDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Status</label>
                  <select
                    value={editSoForm.status}
                    onChange={e => setEditSoForm({ ...editSoForm, status: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 bg-white font-bold"
                  >
                    <option value="Confirmed">Confirmed</option>
                    <option value="Processing">Processing</option>
                    <option value="Delivered & Invoiced">Delivered & Invoiced</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Total Amount (₹)</label>
                <input
                  type="number"
                  value={editSoForm.totalAmount}
                  onChange={e => setEditSoForm({ ...editSoForm, totalAmount: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 font-mono font-bold"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setShowEditSoModal(false)} className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs">Save Order</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT QUOTATION ================= */}
      {showEditQuotationModal && editingQuotation && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-[480px] max-w-full p-6 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Edit Quotation {editingQuotation.quotationNumber}</h3>
              <button onClick={() => setShowEditQuotationModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleEditQuotationSubmit} className="space-y-4 pt-4">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Customer Name</label>
                <input
                  type="text"
                  required
                  value={editQuotationForm.customerName}
                  onChange={e => setEditQuotationForm({ ...editQuotationForm, customerName: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 font-semibold"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Valid Until Date</label>
                  <input
                    type="date"
                    value={editQuotationForm.validUntil}
                    onChange={e => setEditQuotationForm({ ...editQuotationForm, validUntil: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Status</label>
                  <select
                    value={editQuotationForm.status}
                    onChange={e => setEditQuotationForm({ ...editQuotationForm, status: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 bg-white font-bold"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Total Amount (₹)</label>
                <input
                  type="number"
                  value={editQuotationForm.totalAmount}
                  onChange={e => setEditQuotationForm({ ...editQuotationForm, totalAmount: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 font-mono font-bold"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setShowEditQuotationModal(false)} className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs">Save Quotation</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT DELIVERY CHALLAN ================= */}
      {showEditDCModal && editingDC && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-[480px] max-w-full p-6 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Edit Delivery Challan {editingDC.challanNumber}</h3>
              <button onClick={() => setShowEditDCModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleEditDCSubmit} className="space-y-4 pt-4">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Consignee Name</label>
                <input
                  type="text"
                  required
                  value={editDCForm.consigneeName}
                  onChange={e => setEditDCForm({ ...editDCForm, consigneeName: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 font-semibold"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Transporter Name</label>
                  <input
                    type="text"
                    value={editDCForm.transporterName}
                    onChange={e => setEditDCForm({ ...editDCForm, transporterName: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Vehicle Number</label>
                  <input
                    type="text"
                    value={editDCForm.vehicleNo}
                    onChange={e => setEditDCForm({ ...editDCForm, vehicleNo: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Status</label>
                <select
                  value={editDCForm.status}
                  onChange={e => setEditDCForm({ ...editDCForm, status: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 bg-white font-bold"
                >
                  <option value="Dispatched">Dispatched</option>
                  <option value="In Transit">In Transit</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setShowEditDCModal(false)} className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs">Save Challan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT CREDIT NOTE ================= */}
      {showEditCnModal && editingCn && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-[480px] max-w-full p-6 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Edit Credit Note {editingCn.noteNumber}</h3>
              <button onClick={() => setShowEditCnModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleEditCnSubmit} className="space-y-4 pt-4">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Customer Name</label>
                <input
                  type="text"
                  required
                  value={editCnForm.customerName}
                  onChange={e => setEditCnForm({ ...editCnForm, customerName: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 font-semibold"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Adjustment Reason</label>
                  <input
                    type="text"
                    value={editCnForm.reason}
                    onChange={e => setEditCnForm({ ...editCnForm, reason: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Total Amount (₹)</label>
                  <input
                    type="number"
                    value={editCnForm.totalAmount}
                    onChange={e => setEditCnForm({ ...editCnForm, totalAmount: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-mono font-bold"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setShowEditCnModal(false)} className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs">Save Credit Note</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: CREATE / EDIT PRICE LIST ================= */}
      {showPlModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-[480px] max-w-full p-6 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">{editingPl ? 'Edit Price List' : 'Create New Price List Tier'}</h3>
              <button onClick={() => setShowPlModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleSavePlSubmit} className="space-y-4 pt-4">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Price List Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VIP Enterprise Discount"
                  value={plForm.listName}
                  onChange={e => setPlForm({ ...plForm, listName: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 font-semibold"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Discount Percentage (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={plForm.discountPercentage}
                    onChange={e => setPlForm({ ...plForm, discountPercentage: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Applicable Category</label>
                  <input
                    type="text"
                    value={plForm.applicableCategory}
                    onChange={e => setPlForm({ ...plForm, applicableCategory: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Effective Validity Date</label>
                <input
                  type="date"
                  value={plForm.effectiveFrom}
                  onChange={e => setPlForm({ ...plForm, effectiveFrom: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 font-mono"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setShowPlModal(false)} className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs">
                  {editingPl ? 'Update Price List' : 'Save Price List'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT RECURRING SUBSCRIPTION ================= */}
      {showEditRecurringModal && editingRecurring && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-[480px] max-w-full p-6 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Edit Retainer Schedule</h3>
              <button onClick={() => setShowEditRecurringModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleEditRecurringSubmit} className="space-y-4 pt-4">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Plan / Retainer Name *</label>
                <input
                  type="text"
                  required
                  value={editRecurringForm.planName}
                  onChange={e => setEditRecurringForm({ ...editRecurringForm, planName: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 font-semibold"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Billing Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    value={editRecurringForm.amount}
                    onChange={e => setEditRecurringForm({ ...editRecurringForm, amount: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Billing Cycle</label>
                  <select
                    value={editRecurringForm.cycle}
                    onChange={e => setEditRecurringForm({ ...editRecurringForm, cycle: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 bg-white font-medium"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Half-Yearly">Half-Yearly</option>
                    <option value="Annual">Annual</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Next Billing Date</label>
                <input
                  type="date"
                  required
                  value={editRecurringForm.nextBillingDate}
                  onChange={e => setEditRecurringForm({ ...editRecurringForm, nextBillingDate: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 font-mono"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setShowEditRecurringModal(false)} className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs cursor-pointer">Update Retainer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
