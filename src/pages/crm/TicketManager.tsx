import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LifeBuoy, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  Edit3, 
  Trash2, 
  User, 
  Tag, 
  MessageSquare, 
  ExternalLink,
  Kanban,
  List,
  ShieldCheck,
  ChevronRight,
  Wrench,
  MapPin,
  Star,
  FileCheck,
  Receipt
} from 'lucide-react';
import CRMNavigation from '../../components/CRMNavigation';

export default function TicketManager() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTicket, setEditingTicket] = useState<any>(null);

  // Field Service Work Order Modal State
  const [showWorkOrderModal, setShowWorkOrderModal] = useState(false);
  const [selectedTicketForWO, setSelectedTicketForWO] = useState<any>(null);
  const [workOrderSubmitting, setWorkOrderSubmitting] = useState(false);
  const [workOrderForm, setWorkOrderForm] = useState({
    technicianName: 'Rajesh Kumar (Field Specialist)',
    technicianPhone: '+91 98765 43210',
    serviceLocation: 'Client On-Site Premise',
    scheduledDate: new Date().toISOString().split('T')[0],
    workScope: 'On-site diagnosis, hardware replacement & performance validation',
    estimatedHours: 2,
    status: 'Scheduled',
    checkInTime: null as string | null,
    partsUsed: [
      { partName: 'Replacement Sensor Module', qty: 1, unitPrice: 1250 }
    ],
    customerSignature: 'Customer Authorized On-Site',
    feedbackRating: 5,
    feedbackNotes: 'Work completed promptly and device working smoothly.',
    laborCharges: 1500
  });

  // Form State
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    subject: '',
    description: '',
    priority: 'Medium',
    category: 'Technical Support',
    status: 'Open',
    assignedTo: 'Support Agent',
    slaHours: 24,
    resolutionNotes: ''
  });

  const fetchTickets = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/crm/tickets`);
      setTickets(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleOpenCreate = () => {
    setFormData({
      customerName: '',
      customerEmail: '',
      subject: '',
      description: '',
      priority: 'Medium',
      category: 'Technical Support',
      status: 'Open',
      assignedTo: 'Support Agent',
      slaHours: 24,
      resolutionNotes: ''
    });
    setShowCreateModal(true);
  };

  const handleOpenEdit = (ticket: any) => {
    setEditingTicket(ticket);
    setFormData({
      customerName: ticket.customerName || '',
      customerEmail: ticket.customerEmail || '',
      subject: ticket.subject || '',
      description: ticket.description || '',
      priority: ticket.priority || 'Medium',
      category: ticket.category || 'Technical Support',
      status: ticket.status || 'Open',
      assignedTo: ticket.assignedTo || 'Support Agent',
      slaHours: ticket.slaHours || 24,
      resolutionNotes: ticket.resolutionNotes || ''
    });
    setShowEditModal(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/crm/tickets`, formData);
      setShowCreateModal(false);
      fetchTickets();
    } catch (err) {
      console.error(err);
      alert('Failed to create ticket');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTicket) return;
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/crm/tickets/${editingTicket.id}`, formData);
      setShowEditModal(false);
      setEditingTicket(null);
      fetchTickets();
    } catch (err) {
      console.error(err);
      alert('Failed to update ticket');
    }
  };

  const handleDeleteTicket = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this support ticket?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/crm/tickets/${id}`);
      fetchTickets();
    } catch (err) {
      console.error(err);
      alert('Failed to delete ticket');
    }
  };

  const handleQuickStatusChange = async (ticket: any, newStatus: string) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/crm/tickets/${ticket.id}`, {
        status: newStatus
      });
      fetchTickets();
    } catch (err) {
      console.error(err);
    }
  };

  // Field Service Work Order Handlers
  const handleOpenWorkOrder = (ticket: any) => {
    setSelectedTicketForWO(ticket);
    const existing = ticket.workOrder;
    if (existing) {
      setWorkOrderForm({
        technicianName: existing.technicianName || 'Rajesh Kumar (Field Specialist)',
        technicianPhone: existing.technicianPhone || '+91 98765 43210',
        serviceLocation: existing.serviceLocation || 'Client On-Site Premise',
        scheduledDate: existing.scheduledDate || new Date().toISOString().split('T')[0],
        workScope: existing.workScope || ticket.description || 'On-site diagnosis & repair',
        estimatedHours: existing.estimatedHours || 2,
        status: existing.status || 'Scheduled',
        checkInTime: existing.checkInTime || null,
        partsUsed: existing.partsUsed && existing.partsUsed.length > 0 ? existing.partsUsed : [
          { partName: 'Replacement Sensor Module', qty: 1, unitPrice: 1250 }
        ],
        customerSignature: existing.customerSignature || 'Customer Authorized On-Site',
        feedbackRating: existing.feedbackRating || 5,
        feedbackNotes: existing.feedbackNotes || 'Work completed promptly and device working smoothly.',
        laborCharges: 1500
      });
    } else {
      setWorkOrderForm({
        technicianName: 'Rajesh Kumar (Field Specialist)',
        technicianPhone: '+91 98765 43210',
        serviceLocation: `${ticket.customerName} On-Site Premise`,
        scheduledDate: new Date().toISOString().split('T')[0],
        workScope: ticket.subject ? `On-site repair for: ${ticket.subject}` : 'On-site diagnosis, hardware replacement & validation',
        estimatedHours: 2,
        status: 'Scheduled',
        checkInTime: null,
        partsUsed: [
          { partName: 'Replacement Component / Spare', qty: 1, unitPrice: 1200 }
        ],
        customerSignature: 'Customer Authorized On-Site',
        feedbackRating: 5,
        feedbackNotes: 'Work completed promptly and device working smoothly.',
        laborCharges: 1500
      });
    }
    setShowWorkOrderModal(true);
  };

  const handleCheckInWorkOrder = () => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setWorkOrderForm(prev => ({
      ...prev,
      status: 'In-Progress',
      checkInTime: now
    }));
  };

  const handleAddPart = () => {
    setWorkOrderForm(prev => ({
      ...prev,
      partsUsed: [...prev.partsUsed, { partName: 'Additional Spare Part', qty: 1, unitPrice: 500 }]
    }));
  };

  const handleRemovePart = (index: number) => {
    setWorkOrderForm(prev => ({
      ...prev,
      partsUsed: prev.partsUsed.filter((_, i) => i !== index)
    }));
  };

  const handleSaveWorkOrderSchedule = async () => {
    if (!selectedTicketForWO) return;
    setWorkOrderSubmitting(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/crm/tickets/${selectedTicketForWO.id}/work-order`, {
        technicianName: workOrderForm.technicianName,
        technicianPhone: workOrderForm.technicianPhone,
        serviceLocation: workOrderForm.serviceLocation,
        scheduledDate: workOrderForm.scheduledDate,
        workScope: workOrderForm.workScope,
        estimatedHours: workOrderForm.estimatedHours,
        status: workOrderForm.status,
        checkInTime: workOrderForm.checkInTime,
        partsUsed: workOrderForm.partsUsed,
        customerSignature: workOrderForm.customerSignature,
        feedbackRating: workOrderForm.feedbackRating,
        feedbackNotes: workOrderForm.feedbackNotes
      });
      await fetchTickets();
      alert(`Field Service Work Order assigned to ${workOrderForm.technicianName}!`);
      setShowWorkOrderModal(false);
    } catch (err) {
      console.error(err);
      alert('Failed to save Field Service Work Order');
    } finally {
      setWorkOrderSubmitting(false);
    }
  };

  const handleCompleteWorkOrder = async () => {
    if (!selectedTicketForWO) return;
    setWorkOrderSubmitting(true);
    try {
      // First ensure work order is created/updated
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/crm/tickets/${selectedTicketForWO.id}/work-order`, {
        ...workOrderForm,
        status: 'In-Progress'
      });

      // Complete work order & record parts and signature
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/crm/tickets/${selectedTicketForWO.id}/work-order/complete`, {
        partsUsed: workOrderForm.partsUsed,
        customerSignature: workOrderForm.customerSignature,
        feedbackRating: workOrderForm.feedbackRating,
        feedbackNotes: workOrderForm.feedbackNotes,
        laborCharges: workOrderForm.laborCharges
      });

      const partsTotal = workOrderForm.partsUsed.reduce((sum, p) => sum + (Number(p.qty || 1) * Number(p.unitPrice || 0)), 0);
      const invoiceTotal = partsTotal + Number(workOrderForm.laborCharges || 0);

      // Create draft invoice in ERP
      try {
        await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/erp/invoices`, {
          customerName: selectedTicketForWO.customerName,
          customerEmail: selectedTicketForWO.customerEmail,
          items: [
            ...workOrderForm.partsUsed.map(p => ({
              description: `[Field Service Part] ${p.partName}`,
              quantity: p.qty,
              unitPrice: p.unitPrice,
              amount: p.qty * p.unitPrice
            })),
            {
              description: `[Field Service Labor] ${workOrderForm.workScope}`,
              quantity: 1,
              unitPrice: workOrderForm.laborCharges,
              amount: workOrderForm.laborCharges
            }
          ],
          totalAmount: invoiceTotal,
          status: 'Draft',
          notes: `Field Work Order completed for Ticket #${selectedTicketForWO.ticketNumber || selectedTicketForWO.id}. Feedback: ${workOrderForm.feedbackRating} Stars.`
        });
      } catch (invErr) {
        console.warn('Auto invoice creation notification:', invErr);
      }

      await fetchTickets();
      alert(`Job Completed! Field Work Order marked as Resolved. Total: ₹${invoiceTotal.toLocaleString()} draft invoice created in ERP Invoicing.`);
      setShowWorkOrderModal(false);
    } catch (err) {
      console.error(err);
      alert('Failed to complete Field Service Work Order');
    } finally {
      setWorkOrderSubmitting(false);
    }
  };

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = 
      t.ticketNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.customerEmail?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || t.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const countTotal = tickets.length;
  const countOpen = tickets.filter(t => t.status === 'Open').length;
  const countInProgress = tickets.filter(t => t.status === 'In Progress').length;
  const countResolved = tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length;
  const countUrgent = tickets.filter(t => t.priority === 'Urgent').length;

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return 'bg-red-500/10 text-red-700 border-red-200';
      case 'High':
        return 'bg-amber-500/10 text-amber-700 border-amber-200';
      case 'Medium':
        return 'bg-blue-500/10 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-500/10 text-slate-700 border-slate-200';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Open':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'In Progress':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Resolved':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Closed':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const kanbanColumns = ['Open', 'In Progress', 'Resolved', 'Closed'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <CRMNavigation />

      {/* Header and Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-purple-100 text-purple-700 rounded-xl">
              <LifeBuoy className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Customer Support & Ticket Manager</h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Resolve customer inquiries, handle technical escalations, and track SLA response benchmarks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-gray-100 p-1 rounded-xl flex items-center border border-gray-200">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                viewMode === 'list' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                viewMode === 'kanban' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
          </div>

          <button
            onClick={handleOpenCreate}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create Ticket</span>
          </button>
        </div>
      </div>

      {/* KPI Cards (Zero-based metrics) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Total Tickets</span>
          <p className="text-2xl font-extrabold text-gray-900 mt-1">{countTotal}</p>
          <span className="text-[10px] text-gray-400 mt-1 block">Live queue size</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-purple-200/60 shadow-xs">
          <span className="text-[11px] font-semibold text-purple-600 uppercase tracking-wider flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" /> Open
          </span>
          <p className="text-2xl font-extrabold text-purple-700 mt-1">{countOpen}</p>
          <span className="text-[10px] text-purple-400 mt-1 block">Awaiting response</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200/60 shadow-xs">
          <span className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> In Progress
          </span>
          <p className="text-2xl font-extrabold text-amber-700 mt-1">{countInProgress}</p>
          <span className="text-[10px] text-amber-500 mt-1 block">Under investigation</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200/60 shadow-xs">
          <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
          </span>
          <p className="text-2xl font-extrabold text-emerald-700 mt-1">{countResolved}</p>
          <span className="text-[10px] text-emerald-500 mt-1 block">Completed cases</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-red-200/60 shadow-xs">
          <span className="text-[11px] font-semibold text-red-600 uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> Urgent SLA
          </span>
          <p className="text-2xl font-extrabold text-red-700 mt-1">{countUrgent}</p>
          <span className="text-[10px] text-red-400 mt-1 block">High priority</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tickets by ID, subject, customer, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-gray-500 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-[11px] text-gray-500 font-medium">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="All">All Priorities</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main View Area */}
      {viewMode === 'list' ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 text-gray-600 font-semibold border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Ticket</th>
                  <th className="py-3 px-4">Subject & Description</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assignee & SLA</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center">
                      <LifeBuoy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm font-bold text-gray-700">No support tickets found</p>
                      <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                        There are currently 0 tickets matching your criteria. Create a ticket to start tracking customer issues and SLAs.
                      </p>
                      <button
                        onClick={handleOpenCreate}
                        className="mt-4 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all shadow-xs"
                      >
                        + Create First Ticket
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-purple-50/30 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-purple-700 bg-purple-50 px-2 py-1 rounded border border-purple-200">
                          {ticket.ticketNumber}
                        </span>
                        <div className="text-[10px] text-gray-400 mt-1">
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-bold text-gray-900 truncate" title={ticket.subject}>
                          {ticket.subject}
                        </div>
                        <div className="text-gray-500 text-[11px] truncate mt-0.5" title={ticket.description}>
                          {ticket.description || 'No detailed description provided.'}
                        </div>
                        {ticket.workOrder && (
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 ${
                              ticket.workOrder.status === 'Completed' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}>
                              <Wrench className="w-2.5 h-2.5" />
                              {ticket.workOrder.orderNo} ({ticket.workOrder.status})
                            </span>
                            {ticket.workOrder.technicianName && (
                              <span className="text-[10px] text-gray-500 font-medium">Tech: {ticket.workOrder.technicianName.split(' ')[0]}</span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-semibold text-gray-800">{ticket.customerName}</div>
                        <div className="text-[11px] text-gray-400">{ticket.customerEmail}</div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-[10px] font-medium border border-gray-200">
                          <Tag className="w-3 h-3 text-gray-400" />
                          {ticket.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getPriorityBadge(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <select
                          value={ticket.status}
                          onChange={(e) => handleQuickStatusChange(ticket, e.target.value)}
                          className={`text-[11px] font-bold rounded-lg px-2 py-1 border cursor-pointer focus:outline-none ${getStatusBadge(ticket.status)}`}
                        >
                          <option value="Open">Open</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-gray-700 font-medium">
                          <User className="w-3.5 h-3.5 text-gray-400" />
                          <span>{ticket.assignedTo}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-0.5">
                          <Clock className="w-3 h-3 text-purple-500" />
                          <span>SLA: {ticket.slaHours}h target</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenWorkOrder(ticket)}
                            className="px-2 py-1 text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors flex items-center gap-1 text-[11px] font-bold cursor-pointer"
                            title="Dispatch Field Service Tech & Work Order"
                          >
                            <Wrench className="w-3 h-3 text-purple-600" />
                            <span>{ticket.workOrder ? 'Work Order' : 'Field WO'}</span>
                          </button>
                          <button
                            onClick={() => handleOpenEdit(ticket)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Ticket"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTicket(ticket.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Ticket"
                          >
                            <Trash2 className="w-4 h-4" />
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
      ) : (
        /* Kanban View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kanbanColumns.map((colStatus) => {
            const colTickets = filteredTickets.filter(t => t.status === colStatus);
            return (
              <div key={colStatus} className="bg-gray-50/80 rounded-xl border border-gray-200/80 p-3 flex flex-col min-h-[420px]">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-gray-800">{colStatus}</span>
                    <span className="text-[10px] font-bold bg-white text-gray-600 px-2 py-0.5 rounded-full border border-gray-200">
                      {colTickets.length}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setFormData(prev => ({ ...prev, status: colStatus }));
                      setShowCreateModal(true);
                    }}
                    className="p-1 text-gray-400 hover:text-purple-600 rounded transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2 flex-1 overflow-y-auto">
                  {colTickets.length === 0 ? (
                    <div className="p-6 text-center text-gray-400 text-xs border border-dashed border-gray-200 rounded-lg my-auto">
                      No tickets in {colStatus}
                    </div>
                  ) : (
                    colTickets.map(ticket => (
                      <div
                        key={ticket.id}
                        className="bg-white p-3 rounded-lg border border-gray-200/90 shadow-2xs hover:shadow-xs transition-all space-y-2 group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
                            {ticket.ticketNumber}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${getPriorityBadge(ticket.priority)}`}>
                            {ticket.priority}
                          </span>
                        </div>

                        <div>
                          <h4 className="font-bold text-xs text-gray-900 group-hover:text-purple-700 transition-colors">
                            {ticket.subject}
                          </h4>
                          <p className="text-[11px] text-gray-500 line-clamp-2 mt-0.5">
                            {ticket.description || 'No description provided.'}
                          </p>
                          {ticket.workOrder && (
                            <div className="mt-1.5 flex items-center gap-1">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold flex items-center gap-1 ${
                                ticket.workOrder.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                <Wrench className="w-2.5 h-2.5" />
                                {ticket.workOrder.orderNo}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-500">
                          <span className="font-medium text-gray-700 truncate max-w-[100px]">
                            {ticket.customerName}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleOpenWorkOrder(ticket)}
                              className="p-1 text-purple-600 hover:bg-purple-50 rounded"
                              title="Field Work Order"
                            >
                              <Wrench className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleOpenEdit(ticket)}
                              className="p-1 text-gray-400 hover:text-blue-600 rounded"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteTicket(ticket.id)}
                              className="p-1 text-gray-400 hover:text-red-600 rounded"
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
      )}

      {/* CREATE TICKET MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-100 text-purple-700 rounded-lg">
                  <LifeBuoy className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-gray-900">Create Support Ticket</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Customer / Client Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acme Corp / Jane Doe"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Customer Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. jane@acmecorp.com"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Ticket Subject / Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unable to access billing dashboard"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="Technical Support">Technical Support</option>
                    <option value="Billing & Invoicing">Billing & Invoicing</option>
                    <option value="Feature Request">Feature Request</option>
                    <option value="Account Access">Account Access</option>
                    <option value="Service Outage">Service Outage</option>
                    <option value="Hardware / Device">Hardware / Device</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Assigned Support Agent</label>
                  <input
                    type="text"
                    placeholder="e.g. Alex Johnson (Tier 2)"
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">SLA Target (Hours)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.slaHours}
                    onChange={(e) => setFormData({ ...formData, slaHours: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Detailed Description & Steps to Reproduce</label>
                <textarea
                  rows={4}
                  placeholder="Describe the problem, error codes, and impact..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-all shadow-xs"
                >
                  Save & Open Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT TICKET MODAL */}
      {showEditModal && editingTicket && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Edit Support Ticket</h3>
                  <span className="font-mono text-xs text-purple-700 font-bold">{editingTicket.ticketNumber}</span>
                </div>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Customer / Client Name</label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Customer Email</label>
                  <input
                    type="email"
                    required
                    value={formData.customerEmail}
                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="Technical Support">Technical Support</option>
                    <option value="Billing & Invoicing">Billing & Invoicing</option>
                    <option value="Feature Request">Feature Request</option>
                    <option value="Account Access">Account Access</option>
                    <option value="Service Outage">Service Outage</option>
                    <option value="Hardware / Device">Hardware / Device</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none font-bold text-purple-700"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Assigned Agent</label>
                  <input
                    type="text"
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">SLA Target (Hours)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.slaHours}
                    onChange={(e) => setFormData({ ...formData, slaHours: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-emerald-800 mb-1">Resolution Summary / Internal Notes</label>
                <textarea
                  rows={2}
                  placeholder="Notes regarding fix, patch deployed, or client confirmation..."
                  value={formData.resolutionNotes}
                  onChange={(e) => setFormData({ ...formData, resolutionNotes: e.target.value })}
                  className="w-full px-3 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-emerald-50/30"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-all shadow-xs"
                >
                  Update Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FIELD SERVICE WORK ORDER MODAL */}
      {showWorkOrderModal && selectedTicketForWO && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-purple-100 text-purple-700 rounded-xl">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-gray-900">
                      Field Service Work Order
                    </h3>
                    <span className="font-mono text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-bold border border-purple-200">
                      {selectedTicketForWO.workOrder?.orderNo || 'NEW WO'}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      workOrderForm.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {workOrderForm.status}
                    </span>
                  </div>
                  <p className="text-gray-500 text-[11px] mt-0.5">
                    Ticket #{selectedTicketForWO.ticketNumber} • Customer: {selectedTicketForWO.customerName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowWorkOrderModal(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-base cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 mt-4">
              {/* Dispatch & Check-in Header Banner */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-purple-900 font-bold text-xs flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-purple-600" />
                    <span>On-Site Premise: {workOrderForm.serviceLocation}</span>
                  </div>
                  <div className="text-gray-500 text-[11px] mt-0.5">
                    Scheduled: <span className="font-semibold text-gray-700">{workOrderForm.scheduledDate}</span> • Duration: <span className="font-semibold text-gray-700">{workOrderForm.estimatedHours} hrs</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {workOrderForm.checkInTime ? (
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg font-bold text-[11px] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Checked In: {workOrderForm.checkInTime}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleCheckInWorkOrder}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-xs transition-colors shadow-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Clock className="w-3.5 h-3.5" /> Technician Check-in
                    </button>
                  )}
                </div>
              </div>

              {/* Technician & Schedule Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Assigned Field Technician</label>
                  <input
                    type="text"
                    value={workOrderForm.technicianName}
                    onChange={(e) => setWorkOrderForm({ ...workOrderForm, technicianName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    placeholder="Technician Full Name"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Technician Mobile / Radio</label>
                  <input
                    type="text"
                    value={workOrderForm.technicianPhone}
                    onChange={(e) => setWorkOrderForm({ ...workOrderForm, technicianPhone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    placeholder="+91 98765 00000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Scheduled Date</label>
                  <input
                    type="date"
                    value={workOrderForm.scheduledDate}
                    onChange={(e) => setWorkOrderForm({ ...workOrderForm, scheduledDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Estimated Hours</label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={workOrderForm.estimatedHours}
                    onChange={(e) => setWorkOrderForm({ ...workOrderForm, estimatedHours: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Labor / Service Fee (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={workOrderForm.laborCharges}
                    onChange={(e) => setWorkOrderForm({ ...workOrderForm, laborCharges: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none font-bold text-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Service Location / Address</label>
                <input
                  type="text"
                  value={workOrderForm.serviceLocation}
                  onChange={(e) => setWorkOrderForm({ ...workOrderForm, serviceLocation: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Work Scope & Diagnostic Plan</label>
                <textarea
                  rows={2}
                  value={workOrderForm.workScope}
                  onChange={(e) => setWorkOrderForm({ ...workOrderForm, workScope: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              {/* Spare Parts Consumed Section */}
              <div className="border border-gray-200 rounded-xl p-3.5 bg-gray-50/50">
                <div className="flex items-center justify-between mb-2.5">
                  <div>
                    <h4 className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5 text-blue-600" />
                      <span>Parts Consumed (Inventory Deduction)</span>
                    </h4>
                    <p className="text-[10px] text-gray-400">Materials installed or replaced on customer site</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddPart}
                    className="px-2.5 py-1 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg font-bold text-[11px] text-gray-700 shadow-2xs flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3 text-blue-600" /> Add Spare Part
                  </button>
                </div>

                <div className="space-y-2">
                  {workOrderForm.partsUsed.map((part, pIdx) => (
                    <div key={pIdx} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-200">
                      <input
                        type="text"
                        placeholder="Part Description / Model"
                        value={part.partName}
                        onChange={(e) => {
                          const updated = [...workOrderForm.partsUsed];
                          updated[pIdx].partName = e.target.value;
                          setWorkOrderForm({ ...workOrderForm, partsUsed: updated });
                        }}
                        className="flex-1 px-2.5 py-1.5 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none"
                      />
                      <div className="w-20">
                        <input
                          type="number"
                          placeholder="Qty"
                          min="1"
                          value={part.qty}
                          onChange={(e) => {
                            const updated = [...workOrderForm.partsUsed];
                            updated[pIdx].qty = Number(e.target.value);
                            setWorkOrderForm({ ...workOrderForm, partsUsed: updated });
                          }}
                          className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs text-center"
                        />
                      </div>
                      <div className="w-28">
                        <input
                          type="number"
                          placeholder="Unit Price ₹"
                          min="0"
                          value={part.unitPrice}
                          onChange={(e) => {
                            const updated = [...workOrderForm.partsUsed];
                            updated[pIdx].unitPrice = Number(e.target.value);
                            setWorkOrderForm({ ...workOrderForm, partsUsed: updated });
                          }}
                          className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs text-right"
                        />
                      </div>
                      <div className="w-24 text-right font-bold text-gray-700 text-xs">
                        ₹{(part.qty * part.unitPrice).toLocaleString()}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemovePart(pIdx)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-2 text-xs font-bold text-gray-700">
                  Parts Subtotal: ₹{workOrderForm.partsUsed.reduce((sum, p) => sum + (p.qty * p.unitPrice), 0).toLocaleString()}
                </div>
              </div>

              {/* Customer Sign-off & Quality Rating */}
              <div className="border border-purple-100 rounded-xl p-3.5 bg-purple-50/30 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Customer Digital Signature Sign-Off</label>
                  <input
                    type="text"
                    value={workOrderForm.customerSignature}
                    onChange={(e) => setWorkOrderForm({ ...workOrderForm, customerSignature: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none bg-white font-medium"
                    placeholder="Signature Name or Token"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Confirmed on device screen during on-site visit</p>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Customer CSAT Rating</label>
                  <div className="flex items-center gap-1.5 py-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setWorkOrderForm({ ...workOrderForm, feedbackRating: star })}
                        className="p-1 cursor-pointer"
                      >
                        <Star className={`w-5 h-5 ${star <= workOrderForm.feedbackRating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-gray-700 ml-2">({workOrderForm.feedbackRating} / 5 Stars)</span>
                  </div>
                  <input
                    type="text"
                    value={workOrderForm.feedbackNotes}
                    onChange={(e) => setWorkOrderForm({ ...workOrderForm, feedbackNotes: e.target.value })}
                    placeholder="Customer comments on service..."
                    className="w-full px-3 py-1.5 border rounded-lg text-xs mt-1 bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Total Calculation Summary */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-900">Total Work Order Billing</span>
                  <p className="text-[10px] text-emerald-700">Parts + Service Labor Charges</p>
                </div>
                <div className="text-lg font-extrabold text-emerald-800">
                  ₹{(
                    workOrderForm.partsUsed.reduce((sum, p) => sum + (p.qty * p.unitPrice), 0) + 
                    Number(workOrderForm.laborCharges || 0)
                  ).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-4">
              <button
                type="button"
                onClick={() => setShowWorkOrderModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold cursor-pointer"
              >
                Close
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={workOrderSubmitting}
                  onClick={handleSaveWorkOrderSchedule}
                  className="px-4 py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 rounded-xl font-bold transition-all cursor-pointer"
                >
                  Save & Dispatch Tech
                </button>
                <button
                  type="button"
                  disabled={workOrderSubmitting}
                  onClick={handleCompleteWorkOrder}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Receipt className="w-4 h-4" />
                  Complete Job & Generate Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
