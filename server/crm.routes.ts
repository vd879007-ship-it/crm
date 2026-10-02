import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// =======================
// LEADS
// =======================

router.get('/leads', async (req, res) => {
  try {
    const leads = await prisma.lead.findMany({
      include: { assignedTo: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

router.post('/leads', async (req, res) => {
  try {
    const { name, company, email, phone, source, status, score, assignedToId } = req.body;
    const newLead = await prisma.lead.create({
      data: { name, company, email, phone, source, status, score, assignedToId }
    });
    res.json(newLead);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create lead' });
  }
});

router.put('/leads/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const updatedLead = await prisma.lead.update({
      where: { id: req.params.id },
      data: { status }
    });
    res.json(updatedLead);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update lead status' });
  }
});

// =======================
// CUSTOMERS
// =======================

router.get('/customers', async (req, res) => {
  try {
    const customers = await prisma.customer.findMany({
      include: { assignedTo: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

router.post('/customers', async (req, res) => {
  try {
    const { name, company, email, phone, address, assignedToId } = req.body;
    const newCustomer = await prisma.customer.create({
      data: { name, company, email, phone, address, assignedToId }
    });
    res.json(newCustomer);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

// =======================
// SALES DOCUMENTS (Quotes, Invoices)
// =======================

router.get('/sales', async (req, res) => {
  try {
    const docs = await prisma.salesDocument.findMany({
      include: { 
        customer: { select: { name: true, company: true } },
        createdBy: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch sales documents' });
  }
});

router.post('/sales', async (req, res) => {
  try {
    const { type, customerId, createdById, totalAmount, discount, status, items } = req.body;
    const doc = await prisma.salesDocument.create({
      data: { type, customerId, createdById, totalAmount, discount, status, items: JSON.stringify(items) }
    });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create sales document' });
  }
});

// =======================
// COMMUNICATIONS LOG
// =======================

router.get('/communications', async (req, res) => {
  try {
    const logs = await prisma.communicationLog.findMany({
      include: { 
        lead: { select: { name: true } },
        customer: { select: { name: true } },
        createdBy: { select: { name: true } }
      },
      orderBy: { timestamp: 'desc' }
    });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch communications' });
  }
});

router.post('/communications', async (req, res) => {
  try {
    const { type, direction, content, leadId, customerId, createdById } = req.body;
    const log = await prisma.communicationLog.create({
      data: { type, direction, content, leadId, customerId, createdById }
    });
    res.json(log);
  } catch (err) {
    res.status(500).json({ error: 'Failed to log communication' });
  }
});

router.put('/communications/:id', async (req, res) => {
  try {
    const { type, direction, content } = req.body;
    const updated = await prisma.communicationLog.update({
      where: { id: req.params.id },
      data: {
        ...(type ? { type } : {}),
        ...(direction ? { direction } : {}),
        ...(content !== undefined ? { content } : {})
      }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update communication log' });
  }
});

router.delete('/communications/:id', async (req, res) => {
  try {
    await prisma.communicationLog.delete({ where: { id: req.params.id } });
    res.json({ message: 'Communication log deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete communication log' });
  }
});

// =======================
// CUSTOMER CRUD EXTENSIONS
// =======================

router.put('/customers/:id', async (req, res) => {
  try {
    const { name, company, email, phone, address, creditInfo } = req.body;
    const updated = await prisma.customer.update({
      where: { id: req.params.id },
      data: { name, company, email, phone, address, creditInfo }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update customer' });
  }
});

router.delete('/customers/:id', async (req, res) => {
  try {
    const customerId = req.params.id;

    // Clean up dependent child relations first to prevent foreign key errors
    await prisma.communicationLog.deleteMany({ where: { customerId } });
    await prisma.supportTicket.deleteMany({ where: { customerId } });
    await prisma.contactPerson.deleteMany({ where: { customerId } });
    
    // Find all sales documents to remove payments first
    const salesDocs = await prisma.salesDocument.findMany({ where: { customerId } });
    for (const doc of salesDocs) {
      await prisma.payment.deleteMany({ where: { salesDocumentId: doc.id } });
    }
    await prisma.salesDocument.deleteMany({ where: { customerId } });
    await prisma.task.deleteMany({ where: { customerId } });

    await prisma.customer.delete({ where: { id: customerId } });
    res.json({ message: 'Customer/Client and associated records deleted successfully' });
  } catch (err) {
    console.error('Delete customer error:', err);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
});

// =======================
// LEAD CRUD EXTENSIONS
// =======================

router.put('/leads/:id', async (req, res) => {
  try {
    const { name, company, email, phone, source, status, score } = req.body;
    const updated = await prisma.lead.update({
      where: { id: req.params.id },
      data: { name, company, email, phone, source, status, score: score !== undefined ? Number(score) : undefined }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update lead' });
  }
});

router.delete('/leads/:id', async (req, res) => {
  try {
    const leadId = req.params.id;
    await prisma.communicationLog.deleteMany({ where: { leadId } });
    await prisma.lead.delete({ where: { id: leadId } });
    res.json({ message: 'Lead deleted successfully' });
  } catch (err) {
    console.error('Delete lead error:', err);
    res.status(500).json({ error: 'Failed to delete lead' });
  }
});

// =======================
// SALES DOCUMENTS CRUD EXTENSIONS
// =======================

router.put('/sales/:id', async (req, res) => {
  try {
    const { type, totalAmount, discount, status, items } = req.body;
    const updated = await prisma.salesDocument.update({
      where: { id: req.params.id },
      data: {
        type,
        totalAmount: totalAmount !== undefined ? Number(totalAmount) : undefined,
        discount: discount !== undefined ? Number(discount) : undefined,
        status,
        items: items ? JSON.stringify(items) : undefined
      }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update sales document' });
  }
});

router.delete('/sales/:id', async (req, res) => {
  try {
    const salesDocumentId = req.params.id;
    await prisma.payment.deleteMany({ where: { salesDocumentId } });
    await prisma.salesDocument.delete({ where: { id: salesDocumentId } });
    res.json({ message: 'Sales document deleted successfully' });
  } catch (err) {
    console.error('Delete sales document error:', err);
    res.status(500).json({ error: 'Failed to delete sales document' });
  }
});

// ==========================================
// IN-MEMORY CRM EXPANSION DATA STORES (INIT 0)
// ==========================================

let supportTickets: any[] = [];
let deals: any[] = [];
let quotes: any[] = [];
let goals: any[] = [];
let campaigns: any[] = [];
let telephonyCalls: any[] = [];

// ==========================================
// 1. TICKET MANAGER (SUPPORT DESK)
// ==========================================

router.get('/tickets', (req, res) => {
  res.json(supportTickets);
});

router.post('/tickets', (req, res) => {
  try {
    const { 
      customerName, 
      customerEmail, 
      customerId, 
      subject, 
      description, 
      priority, 
      category, 
      status, 
      assignedTo, 
      slaHours 
    } = req.body;

    const newTicket = {
      id: 'tck-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      ticketNumber: 'TCK-' + (1000 + supportTickets.length + 1),
      customerId: customerId || null,
      customerName: customerName || 'Valued Customer',
      customerEmail: customerEmail || 'customer@client.com',
      subject: subject || 'New Support Ticket',
      description: description || '',
      priority: priority || 'Medium', // Low, Medium, High, Urgent
      category: category || 'Technical Support', // Technical Support, Billing & Invoicing, Feature Request, Account Access, Service Outage
      status: status || 'Open', // Open, In Progress, Resolved, Closed
      assignedTo: assignedTo || 'Unassigned Support Agent',
      slaHours: slaHours !== undefined ? Number(slaHours) : 24,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      resolutionNotes: ''
    };

    supportTickets.unshift(newTicket);
    res.status(201).json(newTicket);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create support ticket' });
  }
});

router.put('/tickets/:id', (req, res) => {
  try {
    const { id } = req.params;
    const index = supportTickets.findIndex(t => t.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const {
      customerName,
      customerEmail,
      subject,
      description,
      priority,
      category,
      status,
      assignedTo,
      slaHours,
      resolutionNotes
    } = req.body;

    supportTickets[index] = {
      ...supportTickets[index],
      ...(customerName !== undefined ? { customerName } : {}),
      ...(customerEmail !== undefined ? { customerEmail } : {}),
      ...(subject !== undefined ? { subject } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(priority !== undefined ? { priority } : {}),
      ...(category !== undefined ? { category } : {}),
      ...(status !== undefined ? { status } : {}),
      ...(assignedTo !== undefined ? { assignedTo } : {}),
      ...(slaHours !== undefined ? { slaHours: Number(slaHours) } : {}),
      ...(resolutionNotes !== undefined ? { resolutionNotes } : {}),
      updatedAt: new Date().toISOString()
    };

    res.json(supportTickets[index]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update support ticket' });
  }
});

router.delete('/tickets/:id', (req, res) => {
  try {
    const { id } = req.params;
    const initialLen = supportTickets.length;
    supportTickets = supportTickets.filter(t => t.id !== id);
    if (supportTickets.length === initialLen) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    res.json({ message: 'Ticket deleted successfully', id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete ticket' });
  }
});

// 1.1 FIELD SERVICE WORK ORDER ENDPOINTS
router.post('/tickets/:id/work-order', (req, res) => {
  const { id } = req.params;
  const ticket = supportTickets.find(t => t.id === id);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

  const {
    technicianName,
    technicianPhone,
    serviceLocation,
    scheduledDate,
    workScope,
    estimatedHours,
    status = 'Scheduled'
  } = req.body;

  ticket.workOrder = {
    orderNo: `WO-${Date.now().toString().slice(-6)}`,
    technicianName: technicianName || 'Field Specialist',
    technicianPhone: technicianPhone || '+91 98765 43210',
    serviceLocation: serviceLocation || 'Client On-Site Premise',
    scheduledDate: scheduledDate || new Date().toISOString().split('T')[0],
    workScope: workScope || ticket.description || 'On-site diagnosis & repair',
    estimatedHours: Number(estimatedHours) || 2,
    status, // Scheduled, In-Progress, Completed, Cancelled
    checkInTime: req.body.checkInTime || null,
    partsUsed: req.body.partsUsed || [],
    customerSignature: req.body.customerSignature || null,
    feedbackRating: req.body.feedbackRating || 5,
    feedbackNotes: req.body.feedbackNotes || '',
    invoiceId: null,
    updatedAt: new Date().toISOString()
  };

  ticket.status = 'In Progress';
  ticket.updatedAt = new Date().toISOString();
  res.json({ message: 'Field Service Work Order created', ticket });
});

router.post('/tickets/:id/work-order/complete', (req, res) => {
  const { id } = req.params;
  const ticket = supportTickets.find(t => t.id === id);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  if (!ticket.workOrder) return res.status(400).json({ error: 'No active work order for this ticket' });

  const { partsUsed = [], customerSignature, feedbackRating = 5, feedbackNotes = '', laborCharges = 1500 } = req.body;
  ticket.workOrder.partsUsed = partsUsed;
  ticket.workOrder.customerSignature = customerSignature || 'SIGNED_BY_CUSTOMER_DIGITALLY';
  ticket.workOrder.feedbackRating = Number(feedbackRating);
  ticket.workOrder.feedbackNotes = feedbackNotes;
  ticket.workOrder.status = 'Completed';
  ticket.status = 'Resolved';
  ticket.updatedAt = new Date().toISOString();

  res.json({
    message: 'Field Work Order successfully completed! Customer signature & feedback recorded.',
    ticket,
    laborCharges,
    partsTotal: partsUsed.reduce((sum: number, p: any) => sum + (Number(p.qty || 1) * Number(p.unitPrice || 0)), 0)
  });
});

// ==========================================
// 2. DEALS PIPELINE
// ==========================================

router.get('/deals', (req, res) => {
  res.json(deals);
});

router.post('/deals', (req, res) => {
  try {
    const {
      title,
      company,
      contactPerson,
      contactEmail,
      contactPhone,
      value,
      stage,
      probability,
      expectedCloseDate,
      assignedTo,
      notes
    } = req.body;

    const newDeal = {
      id: 'deal-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      title: title || 'New Opportunity',
      company: company || 'Enterprise Client',
      contactPerson: contactPerson || '',
      contactEmail: contactEmail || '',
      contactPhone: contactPhone || '',
      value: value !== undefined ? Number(value) : 0,
      stage: stage || 'Discovery', // Discovery, Qualification, Proposal, Negotiation, Won, Lost
      probability: probability !== undefined ? Number(probability) : 0,
      expectedCloseDate: expectedCloseDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      assignedTo: assignedTo || 'Sales Representative',
      notes: notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    deals.unshift(newDeal);
    res.status(201).json(newDeal);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create deal' });
  }
});

router.put('/deals/:id', (req, res) => {
  try {
    const { id } = req.params;
    const index = deals.findIndex(d => d.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    const {
      title,
      company,
      contactPerson,
      contactEmail,
      contactPhone,
      value,
      stage,
      probability,
      expectedCloseDate,
      assignedTo,
      notes
    } = req.body;

    deals[index] = {
      ...deals[index],
      ...(title !== undefined ? { title } : {}),
      ...(company !== undefined ? { company } : {}),
      ...(contactPerson !== undefined ? { contactPerson } : {}),
      ...(contactEmail !== undefined ? { contactEmail } : {}),
      ...(contactPhone !== undefined ? { contactPhone } : {}),
      ...(value !== undefined ? { value: Number(value) } : {}),
      ...(stage !== undefined ? { stage } : {}),
      ...(probability !== undefined ? { probability: Number(probability) } : {}),
      ...(expectedCloseDate !== undefined ? { expectedCloseDate } : {}),
      ...(assignedTo !== undefined ? { assignedTo } : {}),
      ...(notes !== undefined ? { notes } : {}),
      updatedAt: new Date().toISOString()
    };

    res.json(deals[index]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update deal' });
  }
});

router.delete('/deals/:id', (req, res) => {
  try {
    const { id } = req.params;
    const initialLen = deals.length;
    deals = deals.filter(d => d.id !== id);
    if (deals.length === initialLen) {
      return res.status(404).json({ error: 'Deal not found' });
    }
    res.json({ message: 'Deal deleted successfully', id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete deal' });
  }
});

// 2.1 CONVERT WON DEAL TO ERP INVOICE
router.post('/deals/:id/convert-to-invoice', (req, res) => {
  const { id } = req.params;
  const deal = deals.find(d => d.id === id);
  if (!deal) return res.status(404).json({ error: 'Deal not found' });

  deal.stage = 'Won';
  deal.probability = 100;
  deal.updatedAt = new Date().toISOString();

  res.json({
    message: `Deal "${deal.title}" marked as Won! Ready for billing.`,
    deal,
    invoiceDraft: {
      customerName: deal.company || deal.contactPerson || 'Enterprise Client',
      customerEmail: deal.contactEmail || 'billing@client.com',
      customerPhone: deal.contactPhone || '',
      totalAmount: deal.value,
      notes: `Generated from Won Deal: ${deal.title} (Ref: ${deal.id})`
    }
  });
});

// ==========================================
// 3. QUOTES GENERATOR
// ==========================================

router.get('/quotes', (req, res) => {
  res.json(quotes);
});

router.post('/quotes', (req, res) => {
  try {
    const {
      dealId,
      customerName,
      customerEmail,
      customerCompany,
      validUntil,
      status,
      items,
      subtotal,
      taxAmount,
      discountAmount,
      total,
      notes,
      terms
    } = req.body;

    const parsedItems = Array.isArray(items) ? items : [];
    const calculatedSubtotal = subtotal !== undefined ? Number(subtotal) : parsedItems.reduce((acc, it) => acc + ((Number(it.quantity) || 1) * (Number(it.unitPrice) || 0)), 0);
    const calculatedTax = taxAmount !== undefined ? Number(taxAmount) : 0;
    const calculatedDiscount = discountAmount !== undefined ? Number(discountAmount) : 0;
    const calculatedTotal = total !== undefined ? Number(total) : (calculatedSubtotal + calculatedTax - calculatedDiscount);

    const newQuote = {
      id: 'quote-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      quoteNumber: 'QT-' + new Date().getFullYear() + '-' + (100 + quotes.length + 1),
      dealId: dealId || null,
      customerName: customerName || 'Valued Customer',
      customerEmail: customerEmail || 'client@business.com',
      customerCompany: customerCompany || '',
      validUntil: validUntil || new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      status: status || 'Draft', // Draft, Sent, Accepted, Declined
      items: parsedItems,
      subtotal: calculatedSubtotal,
      taxAmount: calculatedTax,
      discountAmount: calculatedDiscount,
      total: calculatedTotal,
      notes: notes || 'Thank you for your business. Quotation is valid for 15 days.',
      terms: terms || 'Standard payment terms: 50% advance, balance on delivery.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    quotes.unshift(newQuote);
    res.status(201).json(newQuote);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create quote' });
  }
});

router.put('/quotes/:id', (req, res) => {
  try {
    const { id } = req.params;
    const index = quotes.findIndex(q => q.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Quote not found' });
    }

    const {
      customerName,
      customerEmail,
      customerCompany,
      validUntil,
      status,
      items,
      subtotal,
      taxAmount,
      discountAmount,
      total,
      notes,
      terms
    } = req.body;

    quotes[index] = {
      ...quotes[index],
      ...(customerName !== undefined ? { customerName } : {}),
      ...(customerEmail !== undefined ? { customerEmail } : {}),
      ...(customerCompany !== undefined ? { customerCompany } : {}),
      ...(validUntil !== undefined ? { validUntil } : {}),
      ...(status !== undefined ? { status } : {}),
      ...(items !== undefined ? { items } : {}),
      ...(subtotal !== undefined ? { subtotal: Number(subtotal) } : {}),
      ...(taxAmount !== undefined ? { taxAmount: Number(taxAmount) } : {}),
      ...(discountAmount !== undefined ? { discountAmount: Number(discountAmount) } : {}),
      ...(total !== undefined ? { total: Number(total) } : {}),
      ...(notes !== undefined ? { notes } : {}),
      ...(terms !== undefined ? { terms } : {}),
      updatedAt: new Date().toISOString()
    };

    res.json(quotes[index]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update quote' });
  }
});

router.delete('/quotes/:id', (req, res) => {
  try {
    const { id } = req.params;
    const initialLen = quotes.length;
    quotes = quotes.filter(q => q.id !== id);
    if (quotes.length === initialLen) {
      return res.status(404).json({ error: 'Quote not found' });
    }
    res.json({ message: 'Quote deleted successfully', id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete quote' });
  }
});

// ==========================================
// 4. GOALS & TARGETS
// ==========================================

router.get('/goals', (req, res) => {
  res.json(goals);
});

router.post('/goals', (req, res) => {
  try {
    const {
      title,
      targetType,
      targetAmount,
      achievedAmount,
      period,
      startDate,
      endDate,
      assignedTo,
      status,
      notes
    } = req.body;

    const newGoal = {
      id: 'goal-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      title: title || 'Sales Quota Target',
      targetType: targetType || 'Revenue', // Revenue, Deals Closed, New Leads, Customer Retention
      targetAmount: targetAmount !== undefined ? Number(targetAmount) : 0,
      achievedAmount: achievedAmount !== undefined ? Number(achievedAmount) : 0,
      period: period || 'Q1 2026',
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: endDate || new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
      assignedTo: assignedTo || 'Sales Team',
      status: status || 'In Progress', // In Progress, Achieved, At Risk, Deferred
      notes: notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    goals.unshift(newGoal);
    res.status(201).json(newGoal);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create goal' });
  }
});

router.put('/goals/:id', (req, res) => {
  try {
    const { id } = req.params;
    const index = goals.findIndex(g => g.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    const {
      title,
      targetType,
      targetAmount,
      achievedAmount,
      period,
      startDate,
      endDate,
      assignedTo,
      status,
      notes
    } = req.body;

    goals[index] = {
      ...goals[index],
      ...(title !== undefined ? { title } : {}),
      ...(targetType !== undefined ? { targetType } : {}),
      ...(targetAmount !== undefined ? { targetAmount: Number(targetAmount) } : {}),
      ...(achievedAmount !== undefined ? { achievedAmount: Number(achievedAmount) } : {}),
      ...(period !== undefined ? { period } : {}),
      ...(startDate !== undefined ? { startDate } : {}),
      ...(endDate !== undefined ? { endDate } : {}),
      ...(assignedTo !== undefined ? { assignedTo } : {}),
      ...(status !== undefined ? { status } : {}),
      ...(notes !== undefined ? { notes } : {}),
      updatedAt: new Date().toISOString()
    };

    res.json(goals[index]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update goal' });
  }
});

router.delete('/goals/:id', (req, res) => {
  try {
    const { id } = req.params;
    const initialLen = goals.length;
    goals = goals.filter(g => g.id !== id);
    if (goals.length === initialLen) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    res.json({ message: 'Goal deleted successfully', id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete goal' });
  }
});

// ==========================================
// 5. CAMPAIGNS (MARKETING ENGINE)
// ==========================================

router.get('/campaigns', (req, res) => {
  res.json(campaigns);
});

router.post('/campaigns', (req, res) => {
  try {
    const {
      name,
      type,
      status,
      budget,
      actualSpend,
      leadsGenerated,
      conversions,
      revenueGenerated,
      startDate,
      endDate,
      targetAudience,
      notes
    } = req.body;

    const newCampaign = {
      id: 'cmp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      name: name || 'Marketing Growth Campaign',
      type: type || 'Email Blast', // Email Blast, LinkedIn Ads, Google Search, Cold Outreach, Webinar, Trade Show
      status: status || 'Planning', // Planning, Active, Completed, Paused
      budget: budget !== undefined ? Number(budget) : 0,
      actualSpend: actualSpend !== undefined ? Number(actualSpend) : 0,
      leadsGenerated: leadsGenerated !== undefined ? Number(leadsGenerated) : 0,
      conversions: conversions !== undefined ? Number(conversions) : 0,
      revenueGenerated: revenueGenerated !== undefined ? Number(revenueGenerated) : 0,
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: endDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      targetAudience: targetAudience || 'Enterprise Decision Makers',
      notes: notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    campaigns.unshift(newCampaign);
    res.status(201).json(newCampaign);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create campaign' });
  }
});

router.put('/campaigns/:id', (req, res) => {
  try {
    const { id } = req.params;
    const index = campaigns.findIndex(c => c.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const {
      name,
      type,
      status,
      budget,
      actualSpend,
      leadsGenerated,
      conversions,
      revenueGenerated,
      startDate,
      endDate,
      targetAudience,
      notes
    } = req.body;

    campaigns[index] = {
      ...campaigns[index],
      ...(name !== undefined ? { name } : {}),
      ...(type !== undefined ? { type } : {}),
      ...(status !== undefined ? { status } : {}),
      ...(budget !== undefined ? { budget: Number(budget) } : {}),
      ...(actualSpend !== undefined ? { actualSpend: Number(actualSpend) } : {}),
      ...(leadsGenerated !== undefined ? { leadsGenerated: Number(leadsGenerated) } : {}),
      ...(conversions !== undefined ? { conversions: Number(conversions) } : {}),
      ...(revenueGenerated !== undefined ? { revenueGenerated: Number(revenueGenerated) } : {}),
      ...(startDate !== undefined ? { startDate } : {}),
      ...(endDate !== undefined ? { endDate } : {}),
      ...(targetAudience !== undefined ? { targetAudience } : {}),
      ...(notes !== undefined ? { notes } : {}),
      updatedAt: new Date().toISOString()
    };

    res.json(campaigns[index]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update campaign' });
  }
});

router.delete('/campaigns/:id', (req, res) => {
  try {
    const { id } = req.params;
    const initialLen = campaigns.length;
    campaigns = campaigns.filter(c => c.id !== id);
    if (campaigns.length === initialLen) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    res.json({ message: 'Campaign deleted successfully', id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete campaign' });
  }
});

// ==========================================
// 6. CLOUD TELEPHONY & CALL RECORDINGS
// ==========================================

router.get('/telephony/calls', (req, res) => {
  res.json(telephonyCalls);
});

router.post('/telephony/calls', (req, res) => {
  try {
    const {
      contactName,
      phoneNumber,
      direction,
      durationSeconds,
      status,
      agentName,
      recordingUrl,
      recordingDuration,
      hasRecording,
      transcript,
      sentiment,
      notes,
      tags
    } = req.body;

    const newCall = {
      id: 'call-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      callId: 'TEL-' + Date.now().toString().slice(-6),
      contactName: contactName || 'Customer Prospect',
      phoneNumber: phoneNumber || '+1 (555) 000-0000',
      direction: direction || 'Outbound', // Inbound, Outbound
      durationSeconds: durationSeconds !== undefined ? Number(durationSeconds) : 0,
      status: status || 'Completed', // Completed, Missed, Busy, Voicemail, Failed
      agentName: agentName || 'Support Representative',
      timestamp: new Date().toISOString(),
      recordingUrl: recordingUrl || null,
      recordingDuration: recordingDuration !== undefined ? Number(recordingDuration) : (durationSeconds || 0),
      hasRecording: hasRecording !== undefined ? Boolean(hasRecording) : true,
      transcript: Array.isArray(transcript) ? transcript : [
        { speaker: 'Agent', time: '00:03', text: 'Thank you for calling Enterprise Support. How may I assist you today?' },
        { speaker: 'Customer', time: '00:08', text: 'Hello, I wanted to inquire about the latest SLA terms and pricing details.' },
        { speaker: 'Agent', time: '00:15', text: 'Certainly! I have your account details right here. Let me walk you through the options.' }
      ],
      sentiment: sentiment || 'Positive', // Positive, Neutral, Escalation
      notes: notes || '',
      tags: Array.isArray(tags) ? tags : ['Inquiry', 'Verified']
    };

    telephonyCalls.unshift(newCall);
    res.status(201).json(newCall);
  } catch (err) {
    res.status(500).json({ error: 'Failed to log telephony call' });
  }
});

router.put('/telephony/calls/:id', (req, res) => {
  try {
    const { id } = req.params;
    const index = telephonyCalls.findIndex(c => c.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Call record not found' });
    }

    const {
      contactName,
      phoneNumber,
      direction,
      durationSeconds,
      status,
      agentName,
      notes,
      sentiment,
      tags
    } = req.body;

    telephonyCalls[index] = {
      ...telephonyCalls[index],
      ...(contactName !== undefined ? { contactName } : {}),
      ...(phoneNumber !== undefined ? { phoneNumber } : {}),
      ...(direction !== undefined ? { direction } : {}),
      ...(durationSeconds !== undefined ? { durationSeconds: Number(durationSeconds) } : {}),
      ...(status !== undefined ? { status } : {}),
      ...(agentName !== undefined ? { agentName } : {}),
      ...(notes !== undefined ? { notes } : {}),
      ...(sentiment !== undefined ? { sentiment } : {}),
      ...(tags !== undefined ? { tags } : {})
    };

    res.json(telephonyCalls[index]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update telephony call' });
  }
});

router.delete('/telephony/calls/:id', (req, res) => {
  try {
    const { id } = req.params;
    const initialLen = telephonyCalls.length;
    telephonyCalls = telephonyCalls.filter(c => c.id !== id);
    if (telephonyCalls.length === initialLen) {
      return res.status(404).json({ error: 'Call record not found' });
    }
    res.json({ message: 'Call record deleted successfully', id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete call record' });
  }
});

// Softphone Cloud Telephony Dial Session
router.post('/telephony/dial', (req, res) => {
  try {
    const { phoneNumber, contactName, agentName } = req.body;
    const session = {
      sessionId: 'sess-' + Date.now(),
      callId: 'TEL-' + Date.now().toString().slice(-6),
      phoneNumber: phoneNumber || '+1 (555) 000-0000',
      contactName: contactName || 'Prospect',
      agentName: agentName || 'Agent',
      status: 'Connected',
      codec: 'Opus HD Audio (48kHz)',
      latencyMs: 18,
      jitterMs: 1.2,
      packetLossPercent: 0,
      startTime: new Date().toISOString()
    };
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: 'Failed to initialize dial session' });
  }
});

export default router;
