import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  BadgeDollarSign, 
  Plus, 
  Search, 
  Filter, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Trash2, 
  Edit3, 
  FileText, 
  Building2, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Percent, 
  Printer, 
  Eye, 
  Layers, 
  DollarSign, 
  ArrowRight,
  List,
  Kanban,
  Receipt,
  Send,
  Check
} from 'lucide-react';
import CRMNavigation from '../../components/CRMNavigation';

export default function DealsQuotes() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'deals' | 'quotes'>('deals');
  const [deals, setDeals] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('All');
  const [dealViewMode, setDealViewMode] = useState<'kanban' | 'list'>('kanban');

  // Modals for Deals
  const [showDealCreateModal, setShowDealCreateModal] = useState(false);
  const [showDealEditModal, setShowDealEditModal] = useState(false);
  const [editingDeal, setEditingDeal] = useState<any>(null);

  // Modals for Quotes
  const [showQuoteCreateModal, setShowQuoteCreateModal] = useState(false);
  const [showQuoteEditModal, setShowQuoteEditModal] = useState(false);
  const [showQuotePreviewModal, setShowQuotePreviewModal] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<any>(null);

  // ERP Invoice Conversion State (Workflow 1: Sales -> Cash)
  const [convertingToInvoice, setConvertingToInvoice] = useState(false);
  const [convertedInvoiceInfo, setConvertedInvoiceInfo] = useState<any | null>(null);

  // Forms
  const [dealForm, setDealForm] = useState({
    title: '',
    company: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    value: 0,
    stage: 'Discovery',
    probability: 20,
    expectedCloseDate: '',
    assignedTo: 'Sales Rep',
    notes: ''
  });

  const [quoteForm, setQuoteForm] = useState({
    customerName: '',
    customerEmail: '',
    customerCompany: '',
    validUntil: '',
    status: 'Draft',
    items: [
      { id: '1', description: 'Enterprise License', quantity: 1, unitPrice: 0, discount: 0, tax: 0 }
    ],
    notes: 'Payment terms: 50% advance, balance upon project kickoff.',
    terms: 'Valid for 15 days from issue date.'
  });

  const fetchData = async () => {
    try {
      const [dealsRes, quotesRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/crm/deals`),
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/crm/quotes`)
      ]);
      setDeals(Array.isArray(dealsRes.data) ? dealsRes.data : []);
      setQuotes(Array.isArray(quotesRes.data) ? quotesRes.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Deal Handlers
  const handleOpenCreateDeal = () => {
    setDealForm({
      title: '',
      company: '',
      contactPerson: '',
      contactEmail: '',
      contactPhone: '',
      value: 0,
      stage: 'Discovery',
      probability: 20,
      expectedCloseDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      assignedTo: 'Sales Rep',
      notes: ''
    });
    setShowDealCreateModal(true);
  };

  const handleOpenEditDeal = (deal: any) => {
    setEditingDeal(deal);
    setDealForm({
      title: deal.title || '',
      company: deal.company || '',
      contactPerson: deal.contactPerson || '',
      contactEmail: deal.contactEmail || '',
      contactPhone: deal.contactPhone || '',
      value: deal.value || 0,
      stage: deal.stage || 'Discovery',
      probability: deal.probability || 0,
      expectedCloseDate: deal.expectedCloseDate || '',
      assignedTo: deal.assignedTo || 'Sales Rep',
      notes: deal.notes || ''
    });
    setShowDealEditModal(true);
  };

  const handleCreateDealSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/crm/deals`, dealForm);
      setShowDealCreateModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to create deal');
    }
  };

  const handleEditDealSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDeal) return;
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/crm/deals/${editingDeal.id}`, dealForm);
      setShowDealEditModal(false);
      setEditingDeal(null);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to update deal');
    }
  };

  const handleDeleteDeal = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this deal opportunity?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/crm/deals/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to delete deal');
    }
  };

  // Convert Won Deal to ERP Official Tax Invoice (Workflow 1: Sales -> Cash)
  const handleConvertDealToInvoice = async (deal: any) => {
    try {
      setConvertingToInvoice(true);
      // Mark deal as Won in CRM
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/crm/deals/${deal.id}/convert-to-invoice`);
      
      // Post to ERP Invoicing Engine
      const invRes = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/erp/invoices`, {
        customerName: deal.company || deal.contactPerson || 'Enterprise Client',
        customerEmail: deal.contactEmail || 'billing@client.com',
        customerPhone: deal.contactPhone || '',
        items: [
          {
            description: `[Sales Contract] ${deal.title}`,
            quantity: 1,
            unitPrice: Number(deal.value) || 0,
            amount: Number(deal.value) || 0
          }
        ],
        totalAmount: Number(deal.value) || 0,
        status: 'Draft',
        notes: `Generated from Won CRM Deal: ${deal.title} (Deal ID: ${deal.id})`
      });

      await fetchData();
      setConvertedInvoiceInfo({
        dealTitle: deal.title,
        customerName: deal.company || deal.contactPerson || 'Enterprise Client',
        amount: Number(deal.value) || 0,
        invoiceId: invRes.data?.invoiceNumber || invRes.data?.id || `INV-${Date.now().toString().slice(-6)}`
      });
    } catch (err) {
      console.error('Invoice conversion error:', err);
      alert('Failed to convert deal to ERP invoice');
    } finally {
      setConvertingToInvoice(false);
    }
  };

  const handleConvertQuoteToInvoice = async (quote: any) => {
    try {
      setConvertingToInvoice(true);
      const totalAmt = quote.items && quote.items.length > 0 
        ? quote.items.reduce((s: number, i: any) => s + (Number(i.quantity || 1) * Number(i.unitPrice || 0)), 0)
        : Number(quote.totalAmount || 0);

      const invRes = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/erp/invoices`, {
        customerName: quote.customerName || quote.customerCompany || 'Enterprise Client',
        customerEmail: quote.customerEmail || 'billing@client.com',
        items: (quote.items || []).map((item: any) => ({
          description: item.description || 'Sales Item',
          quantity: Number(item.quantity) || 1,
          unitPrice: Number(item.unitPrice) || 0,
          amount: (Number(item.quantity) || 1) * (Number(item.unitPrice) || 0)
        })),
        totalAmount: totalAmt,
        status: 'Draft',
        notes: `Converted from Accepted Quote #${quote.quoteNumber || quote.id}`
      });

      // Update quote status to Approved
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/crm/quotes/${quote.id}`, {
        status: 'Approved'
      });

      await fetchData();
      setConvertedInvoiceInfo({
        dealTitle: `Quote #${quote.quoteNumber || quote.id}`,
        customerName: quote.customerName,
        amount: totalAmt,
        invoiceId: invRes.data?.invoiceNumber || invRes.data?.id || `INV-${Date.now().toString().slice(-6)}`
      });
    } catch (err) {
      console.error(err);
      alert('Failed to convert quote to ERP invoice');
    } finally {
      setConvertingToInvoice(false);
    }
  };

  // Quote Handlers
  const handleOpenCreateQuote = () => {
    setQuoteForm({
      customerName: '',
      customerEmail: '',
      customerCompany: '',
      validUntil: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      status: 'Draft',
      items: [
        { id: '1', description: 'Platform Subscription', quantity: 1, unitPrice: 0, discount: 0, tax: 0 }
      ],
      notes: 'Payment terms: 50% advance, balance upon project kickoff.',
      terms: 'Valid for 15 days from issue date.'
    });
    setShowQuoteCreateModal(true);
  };

  const handleOpenEditQuote = (quote: any) => {
    setSelectedQuote(quote);
    setQuoteForm({
      customerName: quote.customerName || '',
      customerEmail: quote.customerEmail || '',
      customerCompany: quote.customerCompany || '',
      validUntil: quote.validUntil || '',
      status: quote.status || 'Draft',
      items: Array.isArray(quote.items) && quote.items.length > 0 ? quote.items : [
        { id: '1', description: 'Default Item', quantity: 1, unitPrice: 0, discount: 0, tax: 0 }
      ],
      notes: quote.notes || '',
      terms: quote.terms || ''
    });
    setShowQuoteEditModal(true);
  };

  const handleAddQuoteItem = () => {
    setQuoteForm(prev => ({
      ...prev,
      items: [
        ...prev.items,
        { id: String(Date.now()), description: '', quantity: 1, unitPrice: 0, discount: 0, tax: 0 }
      ]
    }));
  };

  const handleRemoveQuoteItem = (idx: number) => {
    setQuoteForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx)
    }));
  };

  const handleItemChange = (idx: number, field: string, value: any) => {
    setQuoteForm(prev => {
      const newItems = [...prev.items];
      newItems[idx] = { ...newItems[idx], [field]: value };
      return { ...prev, items: newItems };
    });
  };

  const calculateQuoteTotals = () => {
    let subtotal = 0;
    let taxAmount = 0;
    let discountAmount = 0;

    quoteForm.items.forEach(it => {
      const lineBase = (Number(it.quantity) || 1) * (Number(it.unitPrice) || 0);
      const lineDisc = (lineBase * (Number(it.discount) || 0)) / 100;
      const afterDisc = lineBase - lineDisc;
      const lineTax = (afterDisc * (Number(it.tax) || 0)) / 100;

      subtotal += lineBase;
      discountAmount += lineDisc;
      taxAmount += lineTax;
    });

    const total = subtotal - discountAmount + taxAmount;
    return { subtotal, discountAmount, taxAmount, total };
  };

  const handleCreateQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const totals = calculateQuoteTotals();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/crm/quotes`, {
        ...quoteForm,
        subtotal: totals.subtotal,
        discountAmount: totals.discountAmount,
        taxAmount: totals.taxAmount,
        total: totals.total
      });
      setShowQuoteCreateModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to create quote');
    }
  };

  const handleEditQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuote) return;
    const totals = calculateQuoteTotals();
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/crm/quotes/${selectedQuote.id}`, {
        ...quoteForm,
        subtotal: totals.subtotal,
        discountAmount: totals.discountAmount,
        taxAmount: totals.taxAmount,
        total: totals.total
      });
      setShowQuoteEditModal(false);
      setSelectedQuote(null);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to update quote');
    }
  };

  const handleDeleteQuote = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this quotation?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/crm/quotes/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to delete quote');
    }
  };

  const dealStages = ['Discovery', 'Qualification', 'Proposal', 'Negotiation', 'Won', 'Lost'];

  const totalDealsCount = deals.length;
  const totalPipelineValue = deals.reduce((acc, d) => acc + (Number(d.value) || 0), 0);
  const weightedPipeline = deals.reduce((acc, d) => acc + ((Number(d.value) || 0) * (Number(d.probability) || 0)) / 100, 0);
  const wonValue = deals.filter(d => d.stage === 'Won').reduce((acc, d) => acc + (Number(d.value) || 0), 0);

  const totalQuotesCount = quotes.length;
  const totalQuotesValue = quotes.reduce((acc, q) => acc + (Number(q.total) || 0), 0);
  const approvedQuotes = quotes.filter(q => q.status === 'Approved').length;

  const filteredDeals = deals.filter(d => {
    const matchesSearch = 
      d.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.contactPerson?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStage = stageFilter === 'All' || d.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  const filteredQuotes = quotes.filter(q => {
    return q.quoteNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.customerCompany?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <CRMNavigation />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-purple-100 text-purple-700 rounded-xl">
              <BadgeDollarSign className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Deals Pipeline & Quotes Generator</h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Track multi-stage sales opportunities, forecast weighted pipeline revenue, and generate formal client quotations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'deals' ? (
            <>
              <div className="bg-gray-100 p-1 rounded-xl flex items-center border border-gray-200">
                <button
                  onClick={() => setDealViewMode('kanban')}
                  className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                    dealViewMode === 'kanban' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <Kanban className="w-3.5 h-3.5" />
                  <span>Pipeline</span>
                </button>
                <button
                  onClick={() => setDealViewMode('list')}
                  className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                    dealViewMode === 'list' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  <span>Table</span>
                </button>
              </div>
              <button
                onClick={handleOpenCreateDeal}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>+ New Deal</span>
              </button>
            </>
          ) : (
            <button
              onClick={handleOpenCreateQuote}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>+ Create Quotation</span>
            </button>
          )}
        </div>
      </div>

      {/* Switcher Tabs */}
      <div className="flex items-center border-b border-gray-200">
        <button
          onClick={() => setActiveTab('deals')}
          className={`px-5 py-2.5 font-bold text-xs border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'deals'
              ? 'border-purple-600 text-purple-700 bg-purple-50/50'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Deals Pipeline ({totalDealsCount})</span>
        </button>
        <button
          onClick={() => setActiveTab('quotes')}
          className={`px-5 py-2.5 font-bold text-xs border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'quotes'
              ? 'border-purple-600 text-purple-700 bg-purple-50/50'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Quotations & Proposals ({totalQuotesCount})</span>
        </button>
      </div>

      {/* DEALS TAB */}
      {activeTab === 'deals' && (
        <div className="space-y-4">
          {/* Zero-based KPI Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Total Opportunities</span>
              <p className="text-2xl font-extrabold text-gray-900 mt-1">{totalDealsCount}</p>
              <span className="text-[10px] text-gray-400 mt-0.5 block">Active sales cycle</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-purple-200 shadow-xs">
              <span className="text-[11px] font-semibold text-purple-700 uppercase tracking-wider">Pipeline Value</span>
              <p className="text-2xl font-extrabold text-purple-700 mt-1">₹{totalPipelineValue.toLocaleString()}</p>
              <span className="text-[10px] text-purple-400 mt-0.5 block">Unweighted gross sum</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-xs">
              <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider">Weighted Forecast</span>
              <p className="text-2xl font-extrabold text-blue-700 mt-1">₹{Math.round(weightedPipeline).toLocaleString()}</p>
              <span className="text-[10px] text-blue-400 mt-0.5 block">Probability-adjusted</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs">
              <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">Closed Won</span>
              <p className="text-2xl font-extrabold text-emerald-700 mt-1">₹{wonValue.toLocaleString()}</p>
              <span className="text-[10px] text-emerald-500 mt-0.5 block">Booked enterprise revenue</span>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search deals by title, company, contact..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-gray-500 font-medium">Stage:</span>
              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="All">All Stages</option>
                {dealStages.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Kanban / Pipeline View */}
          {dealViewMode === 'kanban' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {dealStages.map(stg => {
                const stageDeals = filteredDeals.filter(d => d.stage === stg);
                const stageSum = stageDeals.reduce((a, b) => a + (Number(b.value) || 0), 0);
                return (
                  <div key={stg} className="bg-gray-50/80 rounded-xl border border-gray-200 p-2.5 flex flex-col min-h-[440px]">
                    <div className="pb-2 mb-2 border-b border-gray-200 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-xs text-gray-800">{stg}</span>
                        <div className="text-[10px] text-gray-500 font-medium">₹{stageSum.toLocaleString()}</div>
                      </div>
                      <span className="text-[10px] font-bold bg-white text-gray-700 px-1.5 py-0.5 rounded border border-gray-200">
                        {stageDeals.length}
                      </span>
                    </div>

                    <div className="space-y-2 flex-1 overflow-y-auto">
                      {stageDeals.length === 0 ? (
                        <div className="p-4 text-center text-gray-400 text-xs border border-dashed border-gray-200 rounded-lg my-auto">
                          0 Deals
                        </div>
                      ) : (
                        stageDeals.map(deal => (
                          <div
                            key={deal.id}
                            className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs hover:shadow-xs transition-all space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-gray-900 truncate" title={deal.title}>
                                {deal.title}
                              </span>
                              <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
                                {deal.probability}%
                              </span>
                            </div>

                            <div className="text-[11px] text-gray-600 flex items-center gap-1">
                              <Building2 className="w-3 h-3 text-gray-400" />
                              <span className="truncate">{deal.company}</span>
                            </div>

                            <div className="flex items-center justify-between pt-1 border-t border-gray-100 text-[11px]">
                              <span className="font-bold text-emerald-700">₹{Number(deal.value).toLocaleString()}</span>
                              <span className="text-[10px] text-gray-400">{deal.expectedCloseDate}</span>
                            </div>

                            <div className="flex items-center justify-between gap-1 pt-1.5 border-t border-gray-50">
                              <button
                                onClick={() => handleConvertDealToInvoice(deal)}
                                disabled={convertingToInvoice}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                                  deal.stage === 'Won' 
                                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                }`}
                                title="Draft Tax Invoice in ERP Invoicing"
                              >
                                <Receipt className="w-2.5 h-2.5 text-emerald-600" />
                                <span>{deal.stage === 'Won' ? 'Invoiced' : 'To Invoice'}</span>
                              </button>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleOpenEditDeal(deal)}
                                  className="p-1 text-gray-400 hover:text-blue-600 rounded cursor-pointer"
                                  title="Edit Deal"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleDeleteDeal(deal.id)}
                                  className="p-1 text-gray-400 hover:text-red-600 rounded cursor-pointer"
                                  title="Delete Deal"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Table View */
            <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4">Opportunity</th>
                    <th className="py-3 px-4">Account / Company</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">Value</th>
                    <th className="py-3 px-4">Stage</th>
                    <th className="py-3 px-4">Probability</th>
                    <th className="py-3 px-4">Expected Close</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredDeals.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-gray-400">
                        No deals logged. Click "+ New Deal" to add an opportunity.
                      </td>
                    </tr>
                  ) : (
                    filteredDeals.map(d => (
                      <tr key={d.id} className="hover:bg-purple-50/20">
                        <td className="py-3 px-4 font-bold text-gray-900">{d.title}</td>
                        <td className="py-3 px-4 text-gray-700">{d.company}</td>
                        <td className="py-3 px-4 text-gray-600">
                          <div>{d.contactPerson}</div>
                          <div className="text-[10px] text-gray-400">{d.contactEmail}</div>
                        </td>
                        <td className="py-3 px-4 font-bold text-emerald-700">₹{Number(d.value).toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700">
                            {d.stage}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-700">{d.probability}%</td>
                        <td className="py-3 px-4 text-gray-500">{d.expectedCloseDate}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleConvertDealToInvoice(d)}
                              disabled={convertingToInvoice}
                              className="px-2 py-1 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                              title="Draft Tax Invoice in ERP Invoicing"
                            >
                              <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                              <span>To Invoice</span>
                            </button>
                            <button
                              onClick={() => handleOpenEditDeal(d)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteDeal(d.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* QUOTES TAB */}
      {activeTab === 'quotes' && (
        <div className="space-y-4">
          {/* Zero-based KPI Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Total Quotes</span>
              <p className="text-2xl font-extrabold text-gray-900 mt-1">{totalQuotesCount}</p>
              <span className="text-[10px] text-gray-400 mt-0.5 block">Issued proposals</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-purple-200 shadow-xs">
              <span className="text-[11px] font-semibold text-purple-700 uppercase tracking-wider">Total Quoted Sum</span>
              <p className="text-2xl font-extrabold text-purple-700 mt-1">₹{totalQuotesValue.toLocaleString()}</p>
              <span className="text-[10px] text-purple-400 mt-0.5 block">All active proposals</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs">
              <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">Approved Quotes</span>
              <p className="text-2xl font-extrabold text-emerald-700 mt-1">{approvedQuotes}</p>
              <span className="text-[10px] text-emerald-500 mt-0.5 block">Ready for billing</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs">
              <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">Draft / Sent</span>
              <p className="text-2xl font-extrabold text-amber-700 mt-1">{totalQuotesCount - approvedQuotes}</p>
              <span className="text-[10px] text-amber-500 mt-0.5 block">Awaiting sign-off</span>
            </div>
          </div>

          {/* Search */}
          <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search quotes by ID, customer name, company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Quotes Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Quote #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Company</th>
                  <th className="py-3 px-4">Line Items</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Valid Until</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredQuotes.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-400">
                      <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="font-bold text-gray-700 text-sm">No quotations created yet</p>
                      <p className="text-xs text-gray-400 mt-0.5">Click "+ Create Quotation" to generate your first professional quote.</p>
                      <button
                        onClick={handleOpenCreateQuote}
                        className="mt-3 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-xs font-semibold"
                      >
                        + Create Quote
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredQuotes.map(q => (
                    <tr key={q.id} className="hover:bg-purple-50/20">
                      <td className="py-3 px-4 font-mono font-bold text-purple-700">{q.quoteNumber}</td>
                      <td className="py-3 px-4 font-semibold text-gray-900">{q.customerName}</td>
                      <td className="py-3 px-4 text-gray-600">{q.customerCompany || '—'}</td>
                      <td className="py-3 px-4 text-gray-500">{Array.isArray(q.items) ? q.items.length : 0} items</td>
                      <td className="py-3 px-4 font-bold text-emerald-700">₹{Number(q.total).toLocaleString()}</td>
                      <td className="py-3 px-4 text-gray-500">{q.validUntil}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          q.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                          q.status === 'Sent' ? 'bg-blue-100 text-blue-700' :
                          q.status === 'Declined' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {q.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleConvertQuoteToInvoice(q)}
                            disabled={convertingToInvoice}
                            className="px-2 py-1 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                            title="Convert Quote to ERP Official Tax Invoice"
                          >
                            <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Invoice</span>
                          </button>
                          <button
                            onClick={() => {
                              setSelectedQuote(q);
                              setShowQuotePreviewModal(true);
                            }}
                            className="p-1.5 text-purple-600 hover:bg-purple-50 rounded cursor-pointer"
                            title="Preview / Print"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEditQuote(q)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded cursor-pointer"
                            title="Edit Quote"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteQuote(q.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                            title="Delete Quote"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE DEAL MODAL */}
      {showDealCreateModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Create New Opportunity / Deal</h3>
              <button onClick={() => setShowDealCreateModal(false)} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
            </div>
            <form onSubmit={handleCreateDealSubmit} className="space-y-3 mt-4">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Deal Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q3 Cloud Transformation Contract"
                  value={dealForm.title}
                  onChange={e => setDealForm({ ...dealForm, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Company / Account *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Zenith Tech"
                    value={dealForm.company}
                    onChange={e => setDealForm({ ...dealForm, company: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Deal Value (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={dealForm.value}
                    onChange={e => setDealForm({ ...dealForm, value: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none font-bold text-emerald-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Pipeline Stage</label>
                  <select
                    value={dealForm.stage}
                    onChange={e => setDealForm({ ...dealForm, stage: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    {dealStages.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Probability (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={dealForm.probability}
                    onChange={e => setDealForm({ ...dealForm, probability: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={dealForm.contactPerson}
                    onChange={e => setDealForm({ ...dealForm, contactPerson: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Expected Close Date</label>
                  <input
                    type="date"
                    value={dealForm.expectedCloseDate}
                    onChange={e => setDealForm({ ...dealForm, expectedCloseDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Internal Notes</label>
                <textarea
                  rows={2}
                  value={dealForm.notes}
                  onChange={e => setDealForm({ ...dealForm, notes: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowDealCreateModal(false)}
                  className="px-4 py-2 border rounded-xl hover:bg-gray-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-xs"
                >
                  Create Deal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT DEAL MODAL */}
      {showDealEditModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Edit Deal</h3>
              <button onClick={() => setShowDealEditModal(false)} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
            </div>
            <form onSubmit={handleEditDealSubmit} className="space-y-3 mt-4">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Deal Title</label>
                <input
                  type="text"
                  required
                  value={dealForm.title}
                  onChange={e => setDealForm({ ...dealForm, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Company / Account</label>
                  <input
                    type="text"
                    required
                    value={dealForm.company}
                    onChange={e => setDealForm({ ...dealForm, company: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Deal Value (₹)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={dealForm.value}
                    onChange={e => setDealForm({ ...dealForm, value: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none font-bold text-emerald-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Stage</label>
                  <select
                    value={dealForm.stage}
                    onChange={e => setDealForm({ ...dealForm, stage: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    {dealStages.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Probability (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={dealForm.probability}
                    onChange={e => setDealForm({ ...dealForm, probability: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={dealForm.contactPerson}
                    onChange={e => setDealForm({ ...dealForm, contactPerson: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Expected Close</label>
                  <input
                    type="date"
                    value={dealForm.expectedCloseDate}
                    onChange={e => setDealForm({ ...dealForm, expectedCloseDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowDealEditModal(false)}
                  className="px-4 py-2 border rounded-xl hover:bg-gray-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE QUOTATION MODAL */}
      {(showQuoteCreateModal || showQuoteEditModal) && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-gray-100 max-h-[92vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">
                {showQuoteCreateModal ? 'Create Formal Quotation' : 'Edit Quotation'}
              </h3>
              <button
                onClick={() => {
                  setShowQuoteCreateModal(false);
                  setShowQuoteEditModal(false);
                }}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={showQuoteCreateModal ? handleCreateQuoteSubmit : handleEditQuoteSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Customer / Contact Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={quoteForm.customerName}
                    onChange={e => setQuoteForm({ ...quoteForm, customerName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Company / Organization</label>
                  <input
                    type="text"
                    placeholder="e.g. Acme Corp"
                    value={quoteForm.customerCompany}
                    onChange={e => setQuoteForm({ ...quoteForm, customerCompany: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Valid Until Date</label>
                  <input
                    type="date"
                    value={quoteForm.validUntil}
                    onChange={e => setQuoteForm({ ...quoteForm, validUntil: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Dynamic Line Items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-bold text-gray-800">Quotation Line Items</label>
                  <button
                    type="button"
                    onClick={handleAddQuoteItem}
                    className="text-purple-600 hover:text-purple-800 font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> + Add Line Item
                  </button>
                </div>

                <div className="space-y-2 border border-gray-200 rounded-xl p-3 bg-gray-50/50">
                  {quoteForm.items.map((item, idx) => (
                    <div key={item.id || idx} className="grid grid-cols-12 gap-2 items-center bg-white p-2 rounded-lg border border-gray-200">
                      <div className="col-span-5">
                        <input
                          type="text"
                          required
                          placeholder="Item Description"
                          value={item.description}
                          onChange={e => handleItemChange(idx, 'description', e.target.value)}
                          className="w-full px-2 py-1.5 border rounded focus:outline-none"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          min="1"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={e => handleItemChange(idx, 'quantity', e.target.value)}
                          className="w-full px-2 py-1.5 border rounded focus:outline-none"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          min="0"
                          placeholder="Unit Price"
                          value={item.unitPrice}
                          onChange={e => handleItemChange(idx, 'unitPrice', e.target.value)}
                          className="w-full px-2 py-1.5 border rounded focus:outline-none"
                        />
                      </div>
                      <div className="col-span-2 text-right font-bold text-gray-800 pr-2">
                        ₹{((Number(item.quantity) || 1) * (Number(item.unitPrice) || 0)).toLocaleString()}
                      </div>
                      <div className="col-span-1 text-center">
                        {quoteForm.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveQuoteItem(idx)}
                            className="text-red-500 hover:text-red-700"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Summary row */}
                  {(() => {
                    const totals = calculateQuoteTotals();
                    return (
                      <div className="pt-2 text-right space-y-1 text-xs pr-4 font-medium text-gray-600">
                        <div>Subtotal: ₹{totals.subtotal.toLocaleString()}</div>
                        <div className="text-emerald-700 font-bold text-sm">
                          Grand Total: ₹{totals.total.toLocaleString()}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Status</label>
                  <select
                    value={quoteForm.status}
                    onChange={e => setQuoteForm({ ...quoteForm, status: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Sent">Sent to Client</option>
                    <option value="Approved">Approved / Accepted</option>
                    <option value="Declined">Declined</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Terms & Conditions</label>
                  <input
                    type="text"
                    value={quoteForm.terms}
                    onChange={e => setQuoteForm({ ...quoteForm, terms: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowQuoteCreateModal(false);
                    setShowQuoteEditModal(false);
                  }}
                  className="px-4 py-2 border rounded-xl hover:bg-gray-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-xs"
                >
                  {showQuoteCreateModal ? 'Save & Issue Quote' : 'Update Quote'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PREVIEW / PRINT QUOTE MODAL */}
      {showQuotePreviewModal && selectedQuote && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <div>
                <span className="text-xs uppercase tracking-wider font-extrabold text-purple-700">Official Quotation</span>
                <h2 className="text-xl font-extrabold text-gray-900">{selectedQuote.quoteNumber}</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
                <button
                  onClick={() => setShowQuotePreviewModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-lg font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="py-4 grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="font-bold text-gray-400 uppercase text-[10px]">Issued To:</span>
                <p className="font-bold text-gray-900 text-sm mt-0.5">{selectedQuote.customerName}</p>
                <p className="text-gray-600">{selectedQuote.customerCompany}</p>
                <p className="text-gray-500">{selectedQuote.customerEmail}</p>
              </div>
              <div className="text-right">
                <span className="font-bold text-gray-400 uppercase text-[10px]">Quote Details:</span>
                <p className="text-gray-600 mt-0.5">Date: {new Date(selectedQuote.createdAt).toLocaleDateString()}</p>
                <p className="text-gray-600">Valid Until: {selectedQuote.validUntil}</p>
                <p className="font-bold text-purple-700">Status: {selectedQuote.status}</p>
              </div>
            </div>

            {/* Line items table */}
            <div className="border border-gray-200 rounded-xl overflow-hidden mt-3 text-xs">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Rate</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {Array.isArray(selectedQuote.items) && selectedQuote.items.map((it: any, i: number) => (
                    <tr key={i}>
                      <td className="py-2.5 px-3 font-medium text-gray-900">{it.description}</td>
                      <td className="py-2.5 px-3 text-center text-gray-600">{it.quantity}</td>
                      <td className="py-2.5 px-3 text-right text-gray-600">₹{Number(it.unitPrice).toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-gray-900">
                        ₹{(Number(it.quantity) * Number(it.unitPrice)).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-start text-xs">
              <div className="max-w-xs text-gray-500 text-[11px]">
                <p className="font-bold text-gray-700">Terms & Notes:</p>
                <p>{selectedQuote.terms}</p>
                <p className="mt-1">{selectedQuote.notes}</p>
              </div>
              <div className="text-right space-y-1">
                <div className="text-gray-500">Subtotal: ₹{Number(selectedQuote.subtotal || selectedQuote.total).toLocaleString()}</div>
                <div className="text-base font-extrabold text-emerald-700">
                  Total: ₹{Number(selectedQuote.total).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONVERTED TO ERP INVOICE SUCCESS MODAL (Workflow 1: Sales -> Cash) */}
      {convertedInvoiceInfo && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 text-xs">
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Receipt className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-gray-900">
                Official Tax Invoice Drafted in ERP!
              </h3>
              <p className="text-gray-500 text-[11px] mt-1">
                Workflow 1 (Sales → Cash): Deal converted to revenue cycle without duplicate data entry.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 my-4 space-y-2 border border-gray-100">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Invoice Number:</span>
                <span className="font-mono font-bold text-gray-900">{convertedInvoiceInfo.invoiceId}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Client / Account:</span>
                <span className="font-semibold text-gray-800">{convertedInvoiceInfo.customerName}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Opportunity Source:</span>
                <span className="font-medium text-gray-700">{convertedInvoiceInfo.dealTitle}</span>
              </div>
              <div className="flex justify-between items-center text-xs pt-2 border-t border-gray-200">
                <span className="font-bold text-gray-700">Total Billed:</span>
                <span className="text-base font-extrabold text-emerald-700">₹{convertedInvoiceInfo.amount.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  setConvertedInvoiceInfo(null);
                  navigate('/erp/invoicing');
                }}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Open in Invoicing & Send WhatsApp Bill</span>
              </button>
              <button
                type="button"
                onClick={() => setConvertedInvoiceInfo(null)}
                className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors cursor-pointer"
              >
                Close & Return to Deals
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
