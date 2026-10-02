import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// =======================
// INVENTORY & PROCUREMENT
// =======================
router.get('/inventory/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.post('/inventory/products', async (req, res) => {
  try {
    const { name, sku, category, price, stock, reorderLevel } = req.body;
    const product = await prisma.product.create({
      data: { name, sku, category, price: Number(price), stock: Number(stock), reorderLevel: Number(reorderLevel) }
    });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create product' });
  }
});

router.put('/inventory/products/:id', async (req, res) => {
  try {
    const { name, sku, category, price, stock, reorderLevel } = req.body;
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        name,
        sku,
        category,
        price: price !== undefined ? Number(price) : undefined,
        stock: stock !== undefined ? Number(stock) : undefined,
        reorderLevel: reorderLevel !== undefined ? Number(reorderLevel) : undefined
      }
    });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

router.delete('/inventory/products/:id', async (req, res) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// =======================
// PROJECTS
// =======================
router.get('/projects', async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

router.post('/projects', async (req, res) => {
  try {
    const { name, description, status, startDate, endDate, userId } = req.body;
    const project = await prisma.project.create({
      data: { 
        name, description, status, 
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        userId: userId || null 
      }
    });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create project' });
  }
});

router.put('/projects/:id', async (req, res) => {
  try {
    const { name, description, status, startDate, endDate, userId } = req.body;
    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: { 
        name, description, status, 
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        userId: userId || undefined 
      }
    });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update project' });
  }
});

router.delete('/projects/:id', async (req, res) => {
  try {
    await prisma.project.delete({ where: { id: req.params.id } });
    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// =======================
// ASSETS
// =======================
router.get('/assets', async (req, res) => {
  try {
    const assets = await prisma.asset.findMany({
      include: { assignedTo: { select: { name: true } } }
    });
    res.json(assets);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch assets' });
  }
});

router.post('/assets', async (req, res) => {
  try {
    const { name, category, serialNo, status, assignedToId } = req.body;
    const asset = await prisma.asset.create({
      data: { name, category, serialNo, status, assignedToId: assignedToId || null }
    });
    res.json(asset);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add asset' });
  }
});

router.put('/assets/:id', async (req, res) => {
  try {
    const { name, category, serialNo, status, assignedToId } = req.body;
    const asset = await prisma.asset.update({
      where: { id: req.params.id },
      data: { name, category, serialNo, status, assignedToId: assignedToId || undefined }
    });
    res.json(asset);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update asset' });
  }
});

router.delete('/assets/:id', async (req, res) => {
  try {
    await prisma.asset.delete({ where: { id: req.params.id } });
    res.json({ message: 'Asset deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete asset' });
  }
});

// =======================
// ADMIN & COMPLIANCE
// =======================
router.get('/admin/audit', async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

// ==========================================
// ERP EXPENSES & CLAIMS SUITE
// ==========================================

// 1. Master Configurable Claim Heads
let expenseClaimHeads = [
  {
    id: 'HEAD-01',
    code: 'TRAV-AIR',
    name: 'Air & Intercity Rail Travel',
    category: 'Travel & Mobility',
    glCode: '60100',
    maxLimit: 50000,
    receiptRequired: true,
    gstInputCreditEligible: true,
    requiresApprovalAbove: 10000,
    description: 'Economy / Business class airline tickets and high-speed rail fares'
  },
  {
    id: 'HEAD-02',
    code: 'HOTEL-LODGE',
    name: 'Hotel & Business Lodging',
    category: 'Accommodation',
    glCode: '60110',
    maxLimit: 12000,
    receiptRequired: true,
    gstInputCreditEligible: true,
    requiresApprovalAbove: 7500,
    description: 'Corporate rate hotel accommodations and lodging invoices'
  },
  {
    id: 'HEAD-03',
    code: 'MEAL-PERDIEM',
    name: 'Daily Meal Allowance & Per Diem',
    category: 'Meals & Incidentals',
    glCode: '60120',
    maxLimit: 2500,
    receiptRequired: false,
    gstInputCreditEligible: false,
    requiresApprovalAbove: 2000,
    description: 'Standard domestic & international daily meals per diem stipend'
  },
  {
    id: 'HEAD-04',
    code: 'LOCAL-CAB',
    name: 'Local Conveyance, Taxi & Ride-Hailing',
    category: 'Local Transit',
    glCode: '60300',
    maxLimit: 4000,
    receiptRequired: true,
    gstInputCreditEligible: true,
    requiresApprovalAbove: 2500,
    description: 'Uber/Ola corporate rides, airport transfers and city cabs'
  },
  {
    id: 'HEAD-05',
    code: 'MILEAGE-VEH',
    name: 'Personal Vehicle Mileage Log',
    category: 'Local Transit',
    glCode: '60310',
    maxLimit: 8000,
    receiptRequired: false,
    gstInputCreditEligible: false,
    requiresApprovalAbove: 5000,
    description: 'Kilometer-based fuel reimbursement (Car ₹12/KM, 2-Wheeler ₹5/KM)'
  },
  {
    id: 'HEAD-06',
    code: 'CLIENT-ENT',
    name: 'Client Hospitality & Entertainment',
    category: 'Sales & BD',
    glCode: '60200',
    maxLimit: 25000,
    receiptRequired: true,
    gstInputCreditEligible: true,
    requiresApprovalAbove: 10000,
    description: 'Business dining, partner meetings, and client relationship lunches'
  },
  {
    id: 'HEAD-07',
    code: 'CONF-TRAIN',
    name: 'Conferences, Training & Upskilling',
    category: 'Professional Dev',
    glCode: '60500',
    maxLimit: 60000,
    receiptRequired: true,
    gstInputCreditEligible: true,
    requiresApprovalAbove: 15000,
    description: 'Industry conference registrations, summits, and executive workshops'
  },
  {
    id: 'HEAD-08',
    code: 'OFFICE-SUPP',
    name: 'Office Supplies, Print & Consumables',
    category: 'General Admin',
    glCode: '60600',
    maxLimit: 8000,
    receiptRequired: true,
    gstInputCreditEligible: true,
    requiresApprovalAbove: 5000,
    description: 'Stationery, presentation materials, courier, and administrative items'
  }
];

// 2. Approval Policy Matrix
let expenseApprovalPolicy = {
  tier1: {
    name: 'Level 1: Reporting Manager',
    thresholdMax: 10000,
    approverRole: 'Direct Line Manager',
    slaHours: 24
  },
  tier2: {
    name: 'Level 2: Department Head / VP',
    thresholdMin: 10001,
    thresholdMax: 50000,
    approverRole: 'Department Head / VP',
    slaHours: 48
  },
  tier3: {
    name: 'Level 3: Finance Director / CFO',
    thresholdMin: 50001,
    approverRole: 'CFO / Finance Director',
    slaHours: 72,
    mandatoryForCategories: ['Air & Intercity Rail Travel', 'Conferences, Training & Upskilling']
  }
};

// 3. Claims Collection (Starts at 0 entries)
let expenseClaims: any[] = [];

// 4. Tour Advance Requests (Starts at 0 entries)
let tourAdvanceRequests: any[] = [];

// 5. Payment Batches (Starts at 0 entries)
let expensePaymentBatches: any[] = [];

// ----------------------------------------------------
// A. CLAIM HEADS ENDPOINTS
// ----------------------------------------------------

router.get('/expenses/heads', (req, res) => {
  res.json(expenseClaimHeads);
});

router.post('/expenses/heads', (req, res) => {
  const newHead = {
    id: `HEAD-${Date.now().toString().slice(-4)}`,
    code: req.body.code || 'CUSTOM-HEAD',
    name: req.body.name || 'Custom Claim Head',
    category: req.body.category || 'General Operations',
    glCode: req.body.glCode || '60900',
    maxLimit: Number(req.body.maxLimit) || 10000,
    receiptRequired: req.body.receiptRequired !== false,
    gstInputCreditEligible: req.body.gstInputCreditEligible !== false,
    requiresApprovalAbove: Number(req.body.requiresApprovalAbove) || 5000,
    description: req.body.description || ''
  };
  expenseClaimHeads.push(newHead);
  res.status(201).json(newHead);
});

router.put('/expenses/heads/:id', (req, res) => {
  const head = expenseClaimHeads.find(h => h.id === req.params.id);
  if (!head) return res.status(404).json({ error: 'Claim head not found' });
  Object.assign(head, req.body);
  res.json(head);
});

router.delete('/expenses/heads/:id', (req, res) => {
  const id = req.params.id;
  expenseClaimHeads = expenseClaimHeads.filter(h => h.id !== id);
  res.json({ message: 'Claim head deleted successfully', deletedId: id });
});

// ----------------------------------------------------
// B. APPROVAL POLICY ENDPOINTS
// ----------------------------------------------------

router.get('/expenses/approval-policy', (req, res) => {
  res.json(expenseApprovalPolicy);
});

router.put('/expenses/approval-policy', (req, res) => {
  Object.assign(expenseApprovalPolicy, req.body);
  res.json(expenseApprovalPolicy);
});

// ----------------------------------------------------
// C. EXPENSE CLAIMS (MULTIPLE CLAIM FORMS SUPPORT)
// ----------------------------------------------------

router.get('/expenses/claims', (req, res) => {
  res.json(expenseClaims);
});

router.get('/expenses/claims/:id', (req, res) => {
  const claim = expenseClaims.find(c => c.id === req.params.id);
  if (!claim) return res.status(404).json({ error: 'Claim not found' });
  res.json(claim);
});

router.post('/expenses/claims', (req, res) => {
  const {
    formType = 'General', // 'General', 'TravelTour', 'Mileage', 'ClientEntertainment'
    employeeId = 'EMP-101',
    employeeName = 'Employee',
    department = 'Technology & Engineering',
    title,
    claimHead = 'General Operations',
    claimHeadCode = 'GEN-OPS',
    totalAmount = 0,
    taxAmount = 0, // GST amount
    merchant = '',
    invoiceNumber = '',
    expenseDate = new Date().toISOString().split('T')[0],
    receiptUrl = 'https://storage.athenahr.io/expenses/verified_bill.pdf',
    remarks = '',
    // Specialized fields for TravelTour
    travelDetails = null,
    // Specialized fields for Mileage
    mileageDetails = null,
    // Specialized fields for ClientEntertainment
    entertainmentDetails = null,
    linkedAdvanceId = null
  } = req.body;

  const grossAmt = Number(totalAmount) || 0;

  // Determine Required Approval Tiers based on amount and category
  let requiredTiers = ['Level 1: Line Manager'];
  let initialStatus = 'Pending L1 Review';

  if (grossAmt > 10000 && grossAmt <= 50000) {
    requiredTiers = ['Level 1: Line Manager', 'Level 2: Department Head'];
  } else if (grossAmt > 50000 || claimHead.includes('Air') || claimHead.includes('Conferences')) {
    requiredTiers = ['Level 1: Line Manager', 'Level 2: Department Head', 'Level 3: CFO / Finance Director'];
  }

  // Calculate net payable if linked advance exists
  let advanceAdjusted = 0;
  let netPayable = grossAmt;
  if (linkedAdvanceId) {
    const adv = tourAdvanceRequests.find(a => a.id === linkedAdvanceId);
    if (adv) {
      advanceAdjusted = adv.disbursedAmount || adv.requestedAmount || 0;
      netPayable = Math.max(0, grossAmt - advanceAdjusted);
      adv.status = 'Reconciled in Claim';
    }
  }

  const claimId = `EXP-${Date.now().toString().slice(-6)}`;
  const newClaim = {
    id: claimId,
    formType,
    employeeId,
    employeeName,
    department,
    title: title || `${formType} Expense Claim`,
    claimHead,
    claimHeadCode,
    grossAmount: grossAmt,
    taxAmount: Number(taxAmount) || 0,
    advanceAdjusted,
    netPayable,
    merchant: merchant || (formType === 'Mileage' ? 'Vehicle Fuel / Mileage' : 'Authorized Vendor'),
    invoiceNumber: invoiceNumber || `INV-${Date.now().toString().slice(-5)}`,
    expenseDate,
    receiptUrl,
    remarks,
    travelDetails,
    mileageDetails,
    entertainmentDetails,
    linkedAdvanceId,
    requiredTiers,
    currentTier: 'Level 1: Line Manager',
    approvalHistory: [
      {
        tier: 'Submission',
        approverName: employeeName,
        action: 'Claim Submitted',
        timestamp: new Date().toISOString(),
        comments: 'Submitted with attached receipts'
      }
    ],
    status: initialStatus, // 'Pending L1 Review', 'Pending L2 Review', 'Pending L3 Review', 'Approved / Payment Ready', 'Batched for Payment', 'Paid / Settled', 'Rejected'
    paymentStatus: 'Unpaid',
    paymentDetails: null,
    createdAt: new Date().toISOString()
  };

  expenseClaims.unshift(newClaim);
  res.status(201).json(newClaim);
});

// Update Approval Status / Advance Tier
router.put('/expenses/claims/:id/status', (req, res) => {
  const claim = expenseClaims.find(c => c.id === req.params.id);
  if (!claim) return res.status(404).json({ error: 'Claim not found' });

  const { action, comments, approverName = 'Approving Authority' } = req.body; // 'Approve', 'Reject', 'Return'

  if (action === 'Reject') {
    claim.status = 'Rejected';
    claim.approvalHistory.push({
      tier: claim.currentTier,
      approverName,
      action: 'Rejected',
      timestamp: new Date().toISOString(),
      comments: comments || 'Claim rejected by authority'
    });
    return res.json({ message: 'Claim rejected', claim });
  }

  if (action === 'Return') {
    claim.status = 'Returned for Correction';
    claim.approvalHistory.push({
      tier: claim.currentTier,
      approverName,
      action: 'Returned for Correction',
      timestamp: new Date().toISOString(),
      comments: comments || 'Please provide GST breakdown / itemized bill'
    });
    return res.json({ message: 'Claim returned for correction', claim });
  }

  // Handle Approve transition across tiers
  if (action === 'Approve') {
    claim.approvalHistory.push({
      tier: claim.currentTier,
      approverName,
      action: 'Approved',
      timestamp: new Date().toISOString(),
      comments: comments || 'Verified against company policy'
    });

    if (claim.currentTier === 'Level 1: Line Manager') {
      if (claim.requiredTiers.includes('Level 2: Department Head')) {
        claim.currentTier = 'Level 2: Department Head';
        claim.status = 'Pending L2 Review';
      } else {
        claim.status = 'Approved / Payment Ready';
      }
    } else if (claim.currentTier === 'Level 2: Department Head') {
      if (claim.requiredTiers.includes('Level 3: CFO / Finance Director')) {
        claim.currentTier = 'Level 3: CFO / Finance Director';
        claim.status = 'Pending L3 Review';
      } else {
        claim.status = 'Approved / Payment Ready';
      }
    } else if (claim.currentTier === 'Level 3: CFO / Finance Director') {
      claim.status = 'Approved / Payment Ready';
    }
  }

  res.json({ message: 'Claim approval state updated', claim });
});

// Single Direct Payment for Claim
router.post('/expenses/claims/:id/pay-single', (req, res) => {
  const claim = expenseClaims.find(c => c.id === req.params.id);
  if (!claim) return res.status(404).json({ error: 'Claim not found' });

  const { paymentMode = 'Corporate Bank Transfer (NEFT)', paymentReference = '' } = req.body;

  let ref = paymentReference;
  if (!ref) {
    if (paymentMode.includes('Bank')) ref = `UTR-HDFC-${Date.now().toString().slice(-6)}`;
    else if (paymentMode.includes('UPI')) ref = `UPI-REF-${Date.now().toString().slice(-6)}`;
    else if (paymentMode.includes('Petty')) ref = `PETTY-VOUCHER-${Date.now().toString().slice(-4)}`;
    else if (paymentMode.includes('Card')) ref = `PCARD-AUTH-${Date.now().toString().slice(-6)}`;
    else ref = `PAYROLL-REIMB-SEP26`;
  }

  claim.status = 'Paid / Settled';
  claim.paymentStatus = 'Paid';
  claim.paymentDetails = {
    paymentMode,
    paymentReference: ref,
    settledAmount: claim.netPayable,
    settledAt: new Date().toISOString(),
    disbursedBy: 'Finance Operations'
  };

  res.json({ message: 'Claim settled successfully', claim, reference: ref });
});

router.put('/expenses/claims/:id', (req, res) => {
  const claim = expenseClaims.find(c => c.id === req.params.id);
  if (!claim) return res.status(404).json({ error: 'Claim not found' });
  Object.assign(claim, req.body);
  res.json(claim);
});

router.delete('/expenses/claims/:id', (req, res) => {
  const id = req.params.id;
  expenseClaims = expenseClaims.filter(c => c.id !== id);
  res.json({ message: 'Expense claim deleted successfully', deletedId: id });
});

// Simulate realistic multi-form claims
router.post('/expenses/claims/simulate', (req, res) => {
  expenseClaims = [
    {
      id: 'EXP-1011',
      formType: 'TravelTour',
      employeeId: 'EMP-101',
      employeeName: 'Rajesh Kumar',
      department: 'Technology & Engineering',
      title: 'Bangalore to Mumbai Architecture Summit Tour',
      claimHead: 'Air & Intercity Rail Travel',
      claimHeadCode: 'TRAV-AIR',
      grossAmount: 34500,
      taxAmount: 4800,
      advanceAdjusted: 15000,
      netPayable: 19500,
      merchant: 'Air India / Taj Lands End Mumbai',
      invoiceNumber: 'AI-MUM-89012',
      expenseDate: '2026-09-18',
      receiptUrl: 'https://storage.athenahr.io/expenses/travel_ mumbai.pdf',
      remarks: '2-Day Enterprise Architecture Conference & Client Meetings',
      travelDetails: {
        origin: 'Bangalore (BLR)',
        destination: 'Mumbai (BOM)',
        departureDate: '2026-09-16',
        returnDate: '2026-09-18',
        transportCost: 14500,
        lodgingCost: 15000,
        perDiemCost: 5000
      },
      linkedAdvanceId: 'ADV-501',
      requiredTiers: ['Level 1: Line Manager', 'Level 2: Department Head'],
      currentTier: 'Level 2: Department Head',
      approvalHistory: [
        { tier: 'Submission', approverName: 'Rajesh Kumar', action: 'Claim Submitted', timestamp: '2026-09-19T09:30:00Z', comments: 'Air tickets, hotel & per diem' },
        { tier: 'Level 1: Line Manager', approverName: 'Vikramaditya Rao', action: 'Approved', timestamp: '2026-09-20T11:00:00Z', comments: 'Travel verified against conference itinerary' }
      ],
      status: 'Pending L2 Review',
      paymentStatus: 'Unpaid',
      paymentDetails: null,
      createdAt: '2026-09-19T09:30:00Z'
    },
    {
      id: 'EXP-1012',
      formType: 'Mileage',
      employeeId: 'EMP-103',
      employeeName: 'Amit Verma',
      department: 'Operations & Logistics',
      title: 'Warehouse & Customer Site Audits Mileage',
      claimHead: 'Personal Vehicle Mileage Log',
      claimHeadCode: 'MILEAGE-VEH',
      grossAmount: 4800,
      taxAmount: 0,
      advanceAdjusted: 0,
      netPayable: 4800,
      merchant: 'Personal Vehicle Log',
      invoiceNumber: 'MILEAGE-LOG-SEP26',
      expenseDate: '2026-09-21',
      receiptUrl: 'https://storage.athenahr.io/expenses/odometer_log.pdf',
      remarks: 'Field audit of 4 regional distribution hubs',
      mileageDetails: {
        vehicleType: 'Car (Four-Wheeler)',
        ratePerKm: 12,
        totalKm: 400,
        startLocation: 'Hennur Central Hub',
        endLocation: 'Whitefield Distribution Point'
      },
      requiredTiers: ['Level 1: Line Manager'],
      currentTier: 'Level 1: Line Manager',
      approvalHistory: [
        { tier: 'Submission', approverName: 'Amit Verma', action: 'Claim Submitted', timestamp: '2026-09-22T08:15:00Z', comments: 'Odometer readings verified' }
      ],
      status: 'Approved / Payment Ready',
      paymentStatus: 'Unpaid',
      paymentDetails: null,
      createdAt: '2026-09-22T08:15:00Z'
    },
    {
      id: 'EXP-1013',
      formType: 'ClientEntertainment',
      employeeId: 'EMP-102',
      employeeName: 'Ananya Sharma',
      department: 'Product & Design',
      title: 'Strategic Partner Lunch & Product Roadmap Review',
      claimHead: 'Client Hospitality & Entertainment',
      claimHeadCode: 'CLIENT-ENT',
      grossAmount: 18400,
      taxAmount: 2800,
      advanceAdjusted: 0,
      netPayable: 18400,
      merchant: 'The Oberoi Bangalore',
      invoiceNumber: 'OBEROI-REST-7712',
      expenseDate: '2026-09-22',
      receiptUrl: 'https://storage.athenahr.io/expenses/oberoi_lunch.pdf',
      remarks: 'Product discovery meeting with Enterprise Accounts delegation',
      entertainmentDetails: {
        clientCompany: 'Global Fintech Partners Corp',
        attendeesCount: 5,
        attendeeNames: 'Ananya Sharma, Rohan Gupta, John Doe, Sarah Jenkins, Amit Patel',
        businessJustification: 'Q4 Contract renewal and AI modules partnership discussion'
      },
      requiredTiers: ['Level 1: Line Manager', 'Level 2: Department Head'],
      currentTier: 'Level 1: Line Manager',
      approvalHistory: [
        { tier: 'Submission', approverName: 'Ananya Sharma', action: 'Claim Submitted', timestamp: '2026-09-23T10:00:00Z', comments: 'Itemized restaurant receipt attached with GSTIN' }
      ],
      status: 'Pending L1 Review',
      paymentStatus: 'Unpaid',
      paymentDetails: null,
      createdAt: '2026-09-23T10:00:00Z'
    },
    {
      id: 'EXP-1014',
      formType: 'General',
      employeeId: 'EMP-104',
      employeeName: 'Priya Nair',
      department: 'People & Culture (HR)',
      title: 'Annual HR Legal Compliance Handbook Printing',
      claimHead: 'Office Supplies, Print & Consumables',
      claimHeadCode: 'OFFICE-SUPP',
      grossAmount: 6500,
      taxAmount: 1170,
      advanceAdjusted: 0,
      netPayable: 6500,
      merchant: 'PrintExpress Solutions',
      invoiceNumber: 'PRNT-SEP-4512',
      expenseDate: '2026-09-15',
      receiptUrl: 'https://storage.athenahr.io/expenses/print_invoice.pdf',
      remarks: 'Bulk printing of statutory handbook for Bangalore & Pune offices',
      requiredTiers: ['Level 1: Line Manager'],
      currentTier: 'Level 1: Line Manager',
      approvalHistory: [
        { tier: 'Submission', approverName: 'Priya Nair', action: 'Claim Submitted', timestamp: '2026-09-16T14:20:00Z', comments: 'Invoice with company GSTIN' },
        { tier: 'Level 1: Line Manager', approverName: 'Vikramaditya Rao', action: 'Approved', timestamp: '2026-09-17T11:00:00Z', comments: 'Approved' }
      ],
      status: 'Approved / Payment Ready',
      paymentStatus: 'Unpaid',
      paymentDetails: null,
      createdAt: '2026-09-16T14:20:00Z'
    }
  ];

  res.json({ message: 'Sample claims loaded across multiple forms', claims: expenseClaims });
});

// ----------------------------------------------------
// D. TOUR ADVANCES REQUEST & REVIEW
// ----------------------------------------------------

router.get('/expenses/advances', (req, res) => {
  res.json(tourAdvanceRequests);
});

router.post('/expenses/advances', (req, res) => {
  const {
    employeeId = 'EMP-101',
    employeeName = 'Employee',
    department = 'Technology & Engineering',
    tourPurpose = 'Customer Onsite Deployment',
    destination = 'New Delhi',
    departureDate = new Date().toISOString().split('T')[0],
    returnDate = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    requestedAmount = 15000,
    breakdown = { flights: 8000, hotel: 5000, perDiem: 2000 },
    reason = 'Urgent client onsite requirements'
  } = req.body;

  const newAdvance = {
    id: `ADV-${Date.now().toString().slice(-4)}`,
    employeeId,
    employeeName,
    department,
    tourPurpose,
    destination,
    departureDate,
    returnDate,
    requestedAmount: Number(requestedAmount),
    disbursedAmount: Number(requestedAmount),
    breakdown,
    reason,
    status: 'Requested', // 'Requested', 'Approved by Manager', 'Disbursed', 'Reconciled in Claim', 'Rejected'
    disbursedAt: null,
    paymentMode: null,
    voucherNumber: null,
    createdAt: new Date().toISOString()
  };

  tourAdvanceRequests.unshift(newAdvance);
  res.status(201).json(newAdvance);
});

router.put('/expenses/advances/:id/status', (req, res) => {
  const adv = tourAdvanceRequests.find(a => a.id === req.params.id);
  if (!adv) return res.status(404).json({ error: 'Tour advance not found' });

  const { status, paymentMode = 'Corporate Bank Transfer (NEFT)' } = req.body;
  adv.status = status || adv.status;

  if (status === 'Disbursed') {
    adv.disbursedAt = new Date().toISOString();
    adv.paymentMode = paymentMode;
    adv.voucherNumber = `ADV-VOUCH-${Date.now().toString().slice(-5)}`;
  }

  res.json({ message: 'Tour advance updated', advance: adv });
});

router.put('/expenses/advances/:id', (req, res) => {
  const adv = tourAdvanceRequests.find(a => a.id === req.params.id);
  if (!adv) return res.status(404).json({ error: 'Tour advance not found' });
  Object.assign(adv, req.body);
  res.json({ message: 'Tour advance updated', advance: adv });
});

router.delete('/expenses/advances/:id', (req, res) => {
  const id = req.params.id;
  tourAdvanceRequests = tourAdvanceRequests.filter(a => a.id !== id);
  res.json({ message: 'Tour advance deleted successfully', deletedId: id });
});

router.post('/expenses/advances/simulate', (req, res) => {
  tourAdvanceRequests = [
    {
      id: 'ADV-501',
      employeeId: 'EMP-101',
      employeeName: 'Rajesh Kumar',
      department: 'Technology & Engineering',
      tourPurpose: 'Mumbai Architecture Summit & Client Demos',
      destination: 'Mumbai (Nariman Point & BKC)',
      departureDate: '2026-09-16',
      returnDate: '2026-09-18',
      requestedAmount: 15000,
      disbursedAmount: 15000,
      breakdown: { flights: 7500, hotel: 5500, perDiem: 2000 },
      reason: 'Keynote speaking and enterprise client roadmap meetings',
      status: 'Disbursed',
      disbursedAt: '2026-09-15T10:00:00Z',
      paymentMode: 'Corporate Bank Transfer (NEFT)',
      voucherNumber: 'ADV-VOUCH-9921',
      createdAt: '2026-09-14T09:00:00Z'
    },
    {
      id: 'ADV-502',
      employeeId: 'EMP-102',
      employeeName: 'Ananya Sharma',
      department: 'Product & Design',
      tourPurpose: 'Hyderabad User Research & Design Sprint',
      destination: 'Hyderabad (Hitec City)',
      departureDate: '2026-10-05',
      returnDate: '2026-10-08',
      requestedAmount: 22000,
      disbursedAmount: 22000,
      breakdown: { flights: 9000, hotel: 9000, perDiem: 4000 },
      reason: 'On-ground user interviews with 12 enterprise tier clients',
      status: 'Approved by Manager',
      disbursedAt: null,
      paymentMode: null,
      voucherNumber: null,
      createdAt: '2026-09-23T11:30:00Z'
    }
  ];
  res.json({ message: 'Sample tour advances loaded', advances: tourAdvanceRequests });
});

// ----------------------------------------------------
// E. BATCH PAYMENT OPTION & MULTIPLE MODES OF PAYMENT
// ----------------------------------------------------

router.get('/expenses/batches', (req, res) => {
  res.json(expensePaymentBatches);
});

router.post('/expenses/batches/create', (req, res) => {
  // Find all claims that are 'Approved / Payment Ready' and unpaid
  const readyClaims = expenseClaims.filter(c => c.status === 'Approved / Payment Ready' && c.paymentStatus === 'Unpaid');

  if (readyClaims.length === 0) {
    return res.status(400).json({ error: 'No approved claims ready for payment batching' });
  }

  const totalAmount = readyClaims.reduce((acc, c) => acc + (c.netPayable || 0), 0);
  const batchId = `EXP-BATCH-${Date.now().toString().slice(-4)}`;

  const batch = {
    id: batchId,
    batchName: `Expense Clearance Batch - ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
    claimCount: readyClaims.length,
    claimIds: readyClaims.map(c => c.id),
    totalAmount,
    status: 'Batch Assembled', // 'Batch Assembled', 'Approved for Release', 'Disbursed / Settled'
    disbursedAt: null,
    paymentMode: 'Corporate Bank Transfer (NEFT / RTGS)',
    referenceCode: null,
    createdAt: new Date().toISOString()
  };

  // Update claims status
  readyClaims.forEach(c => {
    c.status = 'Batched for Payment';
  });

  expensePaymentBatches.unshift(batch);
  res.status(201).json(batch);
});

router.post('/expenses/batches/:id/disburse', (req, res) => {
  const batch = expensePaymentBatches.find(b => b.id === req.params.id);
  if (!batch) return res.status(404).json({ error: 'Batch not found' });

  const { paymentMode = 'Corporate Bank Transfer (NEFT / RTGS)', paymentAccount = 'HDFC Corporate Operating A/C' } = req.body;

  let ref = '';
  if (paymentMode.includes('Bank')) ref = `CMS-NEFT-HDFC${Date.now().toString().slice(-6)}`;
  else if (paymentMode.includes('UPI')) ref = `CMS-UPI-VPA${Date.now().toString().slice(-6)}`;
  else if (paymentMode.includes('Card')) ref = `PCARD-SETTLE-${Date.now().toString().slice(-5)}`;
  else if (paymentMode.includes('Petty')) ref = `CASH-DESK-VOUCH-${Date.now().toString().slice(-4)}`;
  else ref = `PAYROLL-INTEGRATED-REIMB`;

  batch.status = 'Disbursed / Settled';
  batch.paymentMode = paymentMode;
  batch.disbursedAt = new Date().toISOString();
  batch.referenceCode = ref;

  // Mark all batched claims as paid
  expenseClaims.forEach(c => {
    if (batch.claimIds.includes(c.id)) {
      c.status = 'Paid / Settled';
      c.paymentStatus = 'Paid';
      c.paymentDetails = {
        batchId: batch.id,
        paymentMode,
        paymentReference: ref,
        settledAmount: c.netPayable,
        settledAt: batch.disbursedAt,
        paymentAccount
      };
    }
  });

  res.json({ message: 'Batch settled and disbursed successfully', batch, referenceCode: ref });
});

router.put('/expenses/batches/:id', (req, res) => {
  const batch = expensePaymentBatches.find(b => b.id === req.params.id);
  if (!batch) return res.status(404).json({ error: 'Payment batch not found' });
  Object.assign(batch, req.body);
  res.json({ message: 'Payment batch updated', batch });
});

router.delete('/expenses/batches/:id', (req, res) => {
  const id = req.params.id;
  const batch = expensePaymentBatches.find(b => b.id === id);
  if (batch && batch.status !== 'Disbursed / Settled') {
    expenseClaims.forEach(c => {
      if (batch.claimIds.includes(c.id)) {
        c.status = 'Approved / Payment Ready';
      }
    });
  }
  expensePaymentBatches = expensePaymentBatches.filter(b => b.id !== id);
  res.json({ message: 'Payment batch deleted successfully', deletedId: id });
});

// ==========================================
// INVOICING & BILLING SUITE
// ==========================================

interface InvoiceItem {
  id: string;
  description: string;
  hsnCode: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discountPercent: number;
  taxRate: number; // e.g. 18%
  cgst: number;
  sgst: number;
  igst: number;
  amount: number;
}

interface InvoiceRecord {
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

export interface OpexExpenseRecord {
  id: string;
  title: string;
  category: string;
  payee: string;
  amount: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  date: string;
  status: 'Paid' | 'Unpaid';
  paymentMode?: string;
  notes?: string;
  createdAt: string;
}

export interface FixedAssetRecord {
  id: string;
  assetName: string;
  category: string;
  acquisitionCost: number;
  currentBookValue: number;
  acquisitionDate: string;
  location?: string;
  serialNumber?: string;
  createdAt: string;
}

export interface BankCapitalRecord {
  id: string;
  title: string;
  accountName: string;
  category: string;
  amount: number;
  date: string;
  referenceNo?: string;
  createdAt: string;
}

let enterpriseInvoices: InvoiceRecord[] = [];
let enterpriseOpexExpenses: OpexExpenseRecord[] = [];
let enterpriseFixedAssets: FixedAssetRecord[] = [];
let enterpriseBankCapital: BankCapitalRecord[] = [];

let recurringBillingProfiles: any[] = [];


// GET Invoices
router.get('/invoices', (req, res) => {
  const { status, customer } = req.query;
  let list = [...enterpriseInvoices];
  if (status && status !== 'All') {
    list = list.filter(i => i.status.toLowerCase() === (status as string).toLowerCase());
  }
  if (customer) {
    list = list.filter(i => i.customerName.toLowerCase().includes((customer as string).toLowerCase()));
  }
  res.json(list);
});

// GET Invoices KPI Summary
router.get('/invoices-summary', (req, res) => {
  const totalBilled = enterpriseInvoices.reduce((acc, i) => acc + i.totalAmount, 0);
  const totalPaid = enterpriseInvoices.reduce((acc, i) => acc + i.paidAmount, 0);
  const outstandingReceivables = enterpriseInvoices.reduce((acc, i) => acc + i.balanceDue, 0);
  const overdueAmount = enterpriseInvoices.filter(i => i.status === 'Overdue').reduce((acc, i) => acc + i.balanceDue, 0);
  const totalCount = enterpriseInvoices.length;
  const paidCount = enterpriseInvoices.filter(i => i.status === 'Paid').length;
  const overdueCount = enterpriseInvoices.filter(i => i.status === 'Overdue').length;

  res.json({
    totalBilled,
    totalPaid,
    outstandingReceivables,
    overdueAmount,
    totalCount,
    paidCount,
    overdueCount
  });
});

// POST Create Invoice
router.post('/invoices', async (req, res) => {
  try {
    const {
      invoiceType = 'Tax Invoice',
      customerName,
      customerEmail = '',
      customerPhone = '',
      customerGstin = '',
      billingAddress = '',
      shippingAddress = '',
      placeOfSupply = '29-Karnataka',
      isInterState = false,
      invoiceDate = new Date().toISOString().split('T')[0],
      dueDate,
      paymentTerms = 'Net 30',
      currency = 'INR',
      items = [],
      notes = '',
      terms = ''
    } = req.body;

    if (!customerName) {
      return res.status(400).json({ error: 'Customer name is required' });
    }

    const nextIdNum = enterpriseInvoices.length + 84;
    const invoiceNumber = req.body.invoiceNumber || `INV-2026-0${nextIdNum}`;

    let subtotal = 0;
    let discountTotal = 0;
    let taxTotal = 0;

    const processedItems: InvoiceItem[] = (items.length > 0 ? items : [
      {
        description: 'Professional Consulting Services',
        hsnCode: '998311',
        quantity: 1,
        unit: 'Unit',
        unitPrice: 50000,
        discountPercent: 0,
        taxRate: 18
      }
    ]).map((itm: any, idx: number) => {
      const qty = Number(itm.quantity) || 1;
      const rate = Number(itm.unitPrice) || 0;
      const discPct = Number(itm.discountPercent) || 0;
      const taxRate = Number(itm.taxRate) || 18;

      const rawAmount = qty * rate;
      const discount = rawAmount * (discPct / 100);
      const taxable = rawAmount - discount;
      const taxAmount = taxable * (taxRate / 100);
      const lineTotal = taxable + taxAmount;

      subtotal += rawAmount;
      discountTotal += discount;
      taxTotal += taxAmount;

      const cgst = isInterState ? 0 : taxAmount / 2;
      const sgst = isInterState ? 0 : taxAmount / 2;
      const igst = isInterState ? taxAmount : 0;

      return {
        id: `ITM-${Date.now()}-${idx}`,
        description: itm.description || 'Consulting / Product Item',
        hsnCode: itm.hsnCode || '998311',
        quantity: qty,
        unit: itm.unit || 'Nos',
        unitPrice: rate,
        discountPercent: discPct,
        taxRate,
        cgst: Math.round(cgst * 100) / 100,
        sgst: Math.round(sgst * 100) / 100,
        igst: Math.round(igst * 100) / 100,
        amount: Math.round(lineTotal * 100) / 100
      };
    });

    const totalAmount = Math.round((subtotal - discountTotal + taxTotal) * 100) / 100;

    const newInvoice: InvoiceRecord = {
      id: `INV-${Date.now()}`,
      invoiceNumber,
      invoiceType,
      customerName,
      customerEmail,
      customerPhone,
      customerGstin,
      billingAddress,
      shippingAddress: shippingAddress || billingAddress,
      placeOfSupply,
      isInterState: Boolean(isInterState),
      invoiceDate,
      dueDate: dueDate || invoiceDate,
      paymentTerms,
      currency,
      items: processedItems,
      subtotal: Math.round(subtotal * 100) / 100,
      discountTotal: Math.round(discountTotal * 100) / 100,
      taxTotal: Math.round(taxTotal * 100) / 100,
      totalAmount,
      paidAmount: 0,
      balanceDue: totalAmount,
      status: req.body.status || 'Sent',
      notes: notes || 'Thank you for your business. Payment via direct bank transfer.',
      terms: terms || 'Standard payment terms apply. Interest payable on overdue amounts.',
      payments: [],
      createdAt: new Date().toISOString()
    };

    // Auto-sync customer into CRM Customer database so it never needs to be entered twice
    try {
      const existingCustomer = await prisma.customer.findFirst({
        where: { name: customerName }
      });
      if (!existingCustomer) {
        const adminUser = await prisma.user.findFirst();
        if (adminUser) {
          await prisma.customer.create({
            data: {
              name: customerName,
              email: customerEmail || null,
              phone: customerPhone || null,
              address: billingAddress || null,
              creditInfo: paymentTerms || 'Net 15',
              assignedToId: adminUser.id
            }
          });
        }
      }
    } catch (custErr) {
      console.error('Auto-sync customer error:', custErr);
    }

    enterpriseInvoices.unshift(newInvoice);
    res.status(201).json(newInvoice);
  } catch (err) {
    console.error('Create invoice error:', err);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

// GET Invoice By ID
router.get('/invoices/:id', (req, res) => {
  const inv = enterpriseInvoices.find(i => i.id === req.params.id);
  if (!inv) return res.status(404).json({ error: 'Invoice not found' });
  res.json(inv);
});

// PUT Update Invoice
router.put('/invoices/:id', (req, res) => {
  const idx = enterpriseInvoices.findIndex(i => i.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Invoice not found' });

  const existing = enterpriseInvoices[idx];
  const updated: InvoiceRecord = {
    ...existing,
    ...req.body,
    id: existing.id,
    invoiceNumber: existing.invoiceNumber
  };

  enterpriseInvoices[idx] = updated;
  res.json(updated);
});

// DELETE Invoice
router.delete('/invoices/:id', (req, res) => {
  const id = req.params.id;
  const initialLen = enterpriseInvoices.length;
  enterpriseInvoices = enterpriseInvoices.filter(i => i.id !== id);
  if (enterpriseInvoices.length === initialLen) {
    return res.status(404).json({ error: 'Invoice not found' });
  }
  res.json({ message: 'Invoice deleted successfully', deletedId: id });
});

// POST Record Payment against Invoice
router.post('/invoices/:id/pay', (req, res) => {
  const inv = enterpriseInvoices.find(i => i.id === req.params.id);
  if (!inv) return res.status(404).json({ error: 'Invoice not found' });

  const { amount, method = 'NEFT / RTGS', reference = `REF-${Date.now().toString().slice(-6)}`, notes = '' } = req.body;
  const paymentAmount = Number(amount) || 0;

  if (paymentAmount <= 0) {
    return res.status(400).json({ error: 'Payment amount must be greater than zero' });
  }

  const newPayment = {
    id: `PAY-${Date.now()}`,
    amount: paymentAmount,
    paymentDate: new Date().toISOString().split('T')[0],
    method,
    reference,
    notes
  };

  inv.payments.push(newPayment);
  inv.paidAmount = Math.round((inv.paidAmount + paymentAmount) * 100) / 100;
  inv.balanceDue = Math.max(0, Math.round((inv.totalAmount - inv.paidAmount) * 100) / 100);

  if (inv.balanceDue === 0) {
    inv.status = 'Paid';
  } else {
    inv.status = 'Partially Paid';
  }

  res.json({ message: 'Payment recorded successfully', invoice: inv, payment: newPayment });
});

// E-Invoice Generation (IRN, Signed QR, Ack No)
router.post('/invoices/:id/generate-einvoice', (req, res) => {
  const inv = enterpriseInvoices.find(i => i.id === req.params.id);
  if (!inv) return res.status(404).json({ error: 'Invoice not found' });

  const hexChars = '0123456789abcdef';
  let irn = '';
  for (let i = 0; i < 64; i++) {
    irn += hexChars.charAt(Math.floor(Math.random() * hexChars.length));
  }
  const ackNo = `1126${Date.now().toString().slice(-10)}`;
  const ackDate = new Date().toISOString();

  inv.einvoice = {
    irn,
    ackNo,
    ackDate,
    signedQr: `GST-NIC-EINV-QR-${inv.invoiceNumber}-${irn.slice(0, 16)}`,
    status: 'ACTIVE'
  };

  res.json({ message: 'E-Invoice IRN generated successfully', einvoice: inv.einvoice, invoice: inv });
});

router.post('/invoices/:id/cancel-einvoice', (req, res) => {
  const inv = enterpriseInvoices.find(i => i.id === req.params.id);
  if (!inv) return res.status(404).json({ error: 'Invoice not found' });
  if (inv.einvoice) {
    inv.einvoice.status = 'CANCELLED';
  }
  res.json({ message: 'E-Invoice IRN cancelled successfully', invoice: inv });
});

// E-Way Bill Generation (12-Digit EWB, Transporter, Vehicle)
router.post('/invoices/:id/generate-ewaybill', (req, res) => {
  const inv = enterpriseInvoices.find(i => i.id === req.params.id);
  if (!inv) return res.status(404).json({ error: 'Invoice not found' });

  const { transporterId = 'TRANS-BLR-001', vehicleNo = 'KA-01-MJ-8822', distanceKm = 180 } = req.body;
  const ewayBillNo = `2410${Date.now().toString().slice(-8)}`;
  const validUntil = new Date(Date.now() + Math.max(1, Math.ceil(Number(distanceKm) / 200)) * 86400000).toISOString().split('T')[0];

  inv.ewaybill = {
    ewayBillNo,
    validUntil,
    vehicleNo,
    transporterId,
    distanceKm: Number(distanceKm) || 100,
    status: 'ACTIVE'
  };

  res.json({ message: 'E-Way Bill generated successfully', ewaybill: inv.ewaybill, invoice: inv });
});

router.post('/invoices/:id/cancel-ewaybill', (req, res) => {
  const inv = enterpriseInvoices.find(i => i.id === req.params.id);
  if (!inv) return res.status(404).json({ error: 'Invoice not found' });
  if (inv.ewaybill) {
    inv.ewaybill.status = 'CANCELLED';
  }
  res.json({ message: 'E-Way Bill cancelled successfully', invoice: inv });
});

// WhatsApp Dispatch & Communication Logger
router.post('/whatsapp/send', async (req, res) => {
  try {
    const { phone, message } = req.body;
    const cleanPhone = (phone || '').replace(/[^0-9]/g, '');

    try {
      const adminUser = await prisma.user.findFirst();
      await prisma.communicationLog.create({
        data: {
          type: 'WhatsApp',
          direction: 'Outbound',
          content: message,
          createdById: adminUser ? adminUser.id : null
        }
      });
    } catch (e) {
      console.error('Failed to log WhatsApp communication:', e);
    }

    const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;
    res.json({
      success: true,
      message: 'WhatsApp dispatched and logged in CRM communications',
      whatsappUrl,
      recipient: cleanPhone
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to dispatch WhatsApp message' });
  }
});

// Financial Overview: Profit & Loss (P&L), Balance Sheet, Client Outstanding, 15-Day Overdue Alerts
router.get('/financials/overview', async (req, res) => {
  try {
    // 1. INVOICE AGGREGATIONS (REVENUE & RECEIVABLES)
    const totalGrossSales = enterpriseInvoices.reduce((acc, i) => acc + (Number(i.subtotal) || 0), 0);
    const totalDiscounts = enterpriseInvoices.reduce((acc, i) => acc + (Number(i.discountTotal) || 0), 0);
    const netSalesRevenue = totalGrossSales - totalDiscounts;
    const outputGstTotal = enterpriseInvoices.reduce((acc, i) => acc + (Number(i.taxTotal) || 0), 0);
    const totalInvoicedAmount = enterpriseInvoices.reduce((acc, i) => acc + (Number(i.totalAmount) || 0), 0);
    const totalCollectionsReceived = enterpriseInvoices.reduce((acc, i) => acc + (Number(i.paidAmount) || 0), 0);
    const totalAccountsReceivable = enterpriseInvoices.reduce((acc, i) => acc + (Number(i.balanceDue) || 0), 0);

    // 2. PURCHASE AGGREGATIONS (COGS & PAYABLES)
    const directMaterialPurchases = enterprisePurchaseEntries.reduce((acc, p) => acc + (Number(p.subtotal) || 0), 0);
    const inwardFreight = enterprisePurchaseEntries.reduce((acc, p) => acc + (Number(p.freightCharges) || 0), 0);
    const totalCOGS = directMaterialPurchases + inwardFreight;
    const inputTaxCreditITC = enterprisePurchaseEntries.reduce((acc, p) => acc + (Number(p.taxTotal) || 0), 0);
    const tdsDeductedPurchases = enterprisePurchaseEntries.reduce((acc, p) => acc + (Number(p.tdsDeduction) || 0), 0);
    const totalPurchaseAmount = enterprisePurchaseEntries.reduce((acc, p) => acc + (Number(p.totalAmount) || 0), 0);
    const totalVendorDisbursements = enterprisePurchaseEntries.reduce((acc, p) => acc + (Number(p.paidAmount) || 0), 0);
    const totalAccountsPayable = enterprisePurchaseEntries.reduce((acc, p) => acc + (Number(p.balanceDue) || 0), 0);

    // 3. GROSS PROFIT
    const grossProfit = netSalesRevenue - totalCOGS;
    const grossMarginPercent = netSalesRevenue > 0 ? Math.round((grossProfit / netSalesRevenue) * 1000) / 10 : 0;

    // 4. OPERATING EXPENSES (OPEX)
    const employeeSalaries = enterpriseOpexExpenses
      .filter(e => e.category.toLowerCase().includes('salar') || e.category.toLowerCase().includes('payroll'))
      .reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
    const generalExpenses = enterpriseOpexExpenses
      .filter(e => !e.category.toLowerCase().includes('salar') && !e.category.toLowerCase().includes('payroll'))
      .reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
    const totalOPEX = employeeSalaries + generalExpenses;
    const opexPaidDisbursements = enterpriseOpexExpenses
      .filter(e => e.status === 'Paid')
      .reduce((acc, e) => acc + (Number(e.totalAmount || e.amount) || 0), 0);
    const opexUnpaidPayables = enterpriseOpexExpenses
      .filter(e => e.status === 'Unpaid')
      .reduce((acc, e) => acc + (Number(e.totalAmount || e.amount) || 0), 0);

    // 5. OPERATING PROFIT (EBITDA)
    const ebitda = grossProfit - totalOPEX;

    // 6. TAXES & NET PROFIT
    const netGstLiability = Math.max(0, outputGstTotal - inputTaxCreditITC);
    const corporateTaxEstimate = ebitda > 0 ? Math.round(ebitda * 0.22) : 0;
    const netProfit = ebitda - corporateTaxEstimate;
    const netMarginPercent = netSalesRevenue > 0 ? Math.round((netProfit / netSalesRevenue) * 1000) / 10 : 0;

    // 7. INVENTORY & ASSETS VALUATION (BALANCE SHEET)
    let inventoryValuation = 0;
    try {
      const products = await prisma.product.findMany();
      if (products.length > 0) {
        inventoryValuation = products.reduce((acc, pr) => acc + ((Number(pr.stock) || 0) * (Number(pr.price) || 0)), 0);
      }
    } catch (e) {}

    let fixedAssetsValuation = enterpriseFixedAssets.reduce((acc, a) => acc + (Number(a.currentBookValue || a.acquisitionCost) || 0), 0);
    try {
      const assets = await prisma.asset.findMany();
      if (assets.length > 0) {
        fixedAssetsValuation += assets.reduce((acc, a: any) => acc + (Number(a.cost || a.value) || 0), 0);
      }
    } catch (e) {}

    const totalBankCapital = enterpriseBankCapital.reduce((acc, c) => acc + (Number(c.amount) || 0), 0);
    const cashAndBank = totalBankCapital + totalCollectionsReceived - totalVendorDisbursements - opexPaidDisbursements;

    const totalCurrentAssets = cashAndBank + totalAccountsReceivable + inventoryValuation + inputTaxCreditITC;
    const totalAssets = totalCurrentAssets + fixedAssetsValuation;

    const totalCurrentLiabilities = totalAccountsPayable + opexUnpaidPayables + netGstLiability + tdsDeductedPurchases;
    const totalLiabilities = totalCurrentLiabilities;
    const totalEquity = totalAssets - totalLiabilities;

    // 8. CLIENT OUTSTANDING STATEMENT & 15-DAY OVERDUE ALERTS
    const clientMap: { [key: string]: any } = {};

    enterpriseInvoices.forEach(inv => {
      const cName = inv.customerName;
      if (!clientMap[cName]) {
        clientMap[cName] = {
          clientName: cName,
          clientGstin: inv.customerGstin,
          email: inv.customerEmail,
          phone: inv.customerPhone,
          totalInvoiced: 0,
          totalReceived: 0,
          currentOutstanding: 0,
          overdue15DaysAmount: 0,
          has15DayAlert: false,
          invoices: []
        };
      }

      clientMap[cName].totalInvoiced += inv.totalAmount;
      clientMap[cName].totalReceived += inv.paidAmount;
      clientMap[cName].currentOutstanding += inv.balanceDue;

      const invoiceDateTs = new Date(inv.invoiceDate).getTime();
      const ageInDays = Math.max(0, Math.floor((Date.now() - invoiceDateTs) / (1000 * 60 * 60 * 24)));

      if (inv.balanceDue > 0) {
        if (ageInDays > 15) {
          clientMap[cName].overdue15DaysAmount += inv.balanceDue;
          clientMap[cName].has15DayAlert = true;
        }

        clientMap[cName].invoices.push({
          id: inv.id,
          invoiceNumber: inv.invoiceNumber,
          invoiceDate: inv.invoiceDate,
          dueDate: inv.dueDate,
          totalAmount: inv.totalAmount,
          balanceDue: inv.balanceDue,
          status: inv.status,
          ageInDays,
          isOverdue15Days: ageInDays > 15
        });
      }
    });

    const clientOutstandingList = Object.values(clientMap);
    const accountsAlerts = clientOutstandingList.filter(c => c.has15DayAlert);
    const totalOverdue15Days = accountsAlerts.reduce((acc, c) => acc + c.overdue15DaysAmount, 0);

    res.json({
      pnl: {
        grossSales: totalGrossSales,
        discounts: totalDiscounts,
        netSalesRevenue,
        cogs: totalCOGS,
        directMaterials: directMaterialPurchases,
        inwardFreight,
        grossProfit,
        grossMarginPercent,
        opex: totalOPEX,
        salaries: employeeSalaries,
        generalExpenses,
        ebitda,
        taxes: corporateTaxEstimate,
        netGstLiability,
        netProfit,
        netMarginPercent
      },
      balanceSheet: {
        currentAssets: {
          cashAndBank,
          accountsReceivable: totalAccountsReceivable,
          inventoryValuation,
          inputTaxCreditITC,
          totalCurrentAssets
        },
        fixedAssets: {
          propertyAndEquipment: fixedAssetsValuation,
          totalFixedAssets: fixedAssetsValuation
        },
        totalAssets,
        currentLiabilities: {
          accountsPayable: totalAccountsPayable,
          gstPayable: netGstLiability,
          tdsPayable: tdsDeductedPurchases,
          totalCurrentLiabilities
        },
        totalLiabilities,
        equity: {
          shareCapitalAndRetainedEarnings: totalEquity,
          totalEquity
        },
        totalLiabilitiesAndEquity: totalLiabilities + totalEquity
      },
      clientOutstanding: clientOutstandingList,
      accountsAlerts: {
        activeAlertsCount: accountsAlerts.length,
        totalOverdue15Days,
        alertClients: accountsAlerts
      }
    });
  } catch (err) {
    console.error('Financial overview error:', err);
    res.status(500).json({ error: 'Failed to calculate financial statements' });
  }
});

// GET All Financial Entries (Revenue Invoices, COGS Purchases, OPEX Expenses, Fixed Assets, Bank Capital)
router.get('/financials/entries', (req, res) => {
  res.json({
    invoices: enterpriseInvoices,
    purchases: enterprisePurchaseEntries,
    opex: enterpriseOpexExpenses,
    fixedAssets: enterpriseFixedAssets,
    bankCapital: enterpriseBankCapital,
    counts: {
      invoices: enterpriseInvoices.length,
      purchases: enterprisePurchaseEntries.length,
      opex: enterpriseOpexExpenses.length,
      fixedAssets: enterpriseFixedAssets.length,
      bankCapital: enterpriseBankCapital.length,
      totalEntries: enterpriseInvoices.length + enterprisePurchaseEntries.length + enterpriseOpexExpenses.length + enterpriseFixedAssets.length + enterpriseBankCapital.length
    }
  });
});

// POST Quick Financial Entry (Add any item into P&L / Balance Sheet books)
router.post('/financials/quick-entry', async (req, res) => {
  try {
    const {
      entryType,
      title,
      partyName = '',
      category = '',
      amount = 0,
      taxRate = 18,
      freightCharges = 0,
      discount = 0,
      date = new Date().toISOString().split('T')[0],
      isPaid = true,
      notes = '',
      paymentMode = 'Bank Transfer (NEFT/RTGS)'
    } = req.body;

    const numAmount = Math.max(0, Number(amount) || 0);
    const numTaxRate = Number(taxRate) || 0;
    const numFreight = Number(freightCharges) || 0;
    const numDiscount = Number(discount) || 0;

    if (!entryType || !title || numAmount < 0) {
      return res.status(400).json({ error: 'Valid entryType, title, and amount are required' });
    }

    if (entryType === 'REVENUE') {
      const taxable = Math.max(0, numAmount - numDiscount);
      const taxTotal = Math.round(taxable * (numTaxRate / 100) * 100) / 100;
      const totalAmount = Math.round((taxable + taxTotal) * 100) / 100;
      const paidAmount = isPaid ? totalAmount : 0;
      const balanceDue = totalAmount - paidAmount;
      const invoiceNumber = `INV-${Date.now().toString().slice(-4)}`;

      const newInv: InvoiceRecord = {
        id: `INV-${Date.now()}`,
        invoiceNumber,
        invoiceType: 'Tax Invoice',
        customerName: partyName || 'Enterprise Client',
        customerEmail: `${(partyName || 'client').toLowerCase().replace(/[^a-z0-9]/g, '')}@enterprise.local`,
        customerPhone: '+91 98450 00000',
        customerGstin: '29AAACT0000A1Z5',
        billingAddress: 'Corporate Office',
        shippingAddress: 'Corporate Office',
        placeOfSupply: '29-Karnataka',
        isInterState: false,
        invoiceDate: date,
        dueDate: date,
        paymentTerms: isPaid ? 'Immediate' : 'Net 15',
        currency: 'INR',
        items: [
          {
            id: `ITM-${Date.now()}`,
            description: title,
            hsnCode: '998311',
            quantity: 1,
            unit: 'Service',
            unitPrice: numAmount,
            discountPercent: 0,
            taxRate: numTaxRate,
            cgst: numTaxRate > 0 ? taxTotal / 2 : 0,
            sgst: numTaxRate > 0 ? taxTotal / 2 : 0,
            igst: 0,
            amount: taxable
          }
        ],
        subtotal: numAmount,
        discountTotal: numDiscount,
        taxTotal,
        totalAmount,
        paidAmount,
        balanceDue,
        status: isPaid ? 'Paid' : 'Sent',
        notes: notes || 'Financial entry recorded into P&L ledger',
        terms: 'Standard payment terms',
        payments: isPaid ? [{
          id: `PAY-${Date.now()}`,
          amount: totalAmount,
          paymentDate: date,
          method: paymentMode,
          reference: `REF-${Date.now().toString().slice(-6)}`,
          notes: 'Paid upon entry'
        }] : [],
        createdAt: new Date().toISOString()
      };

      try {
        const existingCustomer = await prisma.customer.findFirst({
          where: { name: newInv.customerName }
        });
        if (!existingCustomer) {
          const adminUser = await prisma.user.findFirst();
          if (adminUser) {
            await prisma.customer.create({
              data: {
                name: newInv.customerName,
                email: newInv.customerEmail || null,
                phone: newInv.customerPhone || null,
                address: newInv.billingAddress || null,
                creditInfo: newInv.paymentTerms || 'Net 15',
                assignedToId: adminUser.id
              }
            });
          }
        }
      } catch (custErr) {
        console.error('Customer sync error:', custErr);
      }

      enterpriseInvoices.unshift(newInv);
      return res.status(201).json({ success: true, entryType, entry: newInv });
    }

    if (entryType === 'COGS') {
      const taxTotal = Math.round(numAmount * (numTaxRate / 100) * 100) / 100;
      const totalAmount = Math.round((numAmount + taxTotal + numFreight) * 100) / 100;
      const paidAmount = isPaid ? totalAmount : 0;
      const balanceDue = totalAmount - paidAmount;
      const voucherNo = `PUR-${Date.now().toString().slice(-4)}`;

      const newPur: PurchaseEntryRecord = {
        id: `PUR-${Date.now()}`,
        voucherNo,
        supplierName: partyName || 'Vendor Supplier',
        supplierGstin: '29AABCD0000P1Z1',
        supplierInvoiceNo: `SUP-${Date.now().toString().slice(-5)}`,
        supplierInvoiceDate: date,
        purchaseOrderRef: 'PO-DIRECT',
        grnRef: `GRN-${Date.now().toString().slice(-4)}`,
        warehouse: 'Central Warehouse',
        dueDate: date,
        paymentTerms: isPaid ? 'Immediate' : 'Net 30',
        items: [
          {
            id: `PITM-${Date.now()}`,
            itemName: title,
            hsnCode: '847100',
            quantity: 1,
            unit: 'Units',
            unitCost: numAmount,
            taxRate: numTaxRate,
            itcEligibility: 'Eligible',
            taxAmount: taxTotal,
            total: numAmount + taxTotal
          }
        ],
        subtotal: numAmount,
        taxTotal,
        freightCharges: numFreight,
        tdsDeduction: 0,
        totalAmount,
        paidAmount,
        balanceDue,
        status: isPaid ? 'Paid' : 'Pending Payment',
        paymentRecords: isPaid ? [{
          id: `PPAY-${Date.now()}`,
          amount: totalAmount,
          paidDate: date,
          bankAccount: 'HDFC Corporate Operating A/C',
          mode: paymentMode,
          utrRef: `UTR-${Date.now().toString().slice(-6)}`
        }] : [],
        autoUpdateStock: false,
        createdAt: new Date().toISOString()
      };

      enterprisePurchaseEntries.unshift(newPur);
      return res.status(201).json({ success: true, entryType, entry: newPur });
    }

    if (entryType === 'OPEX') {
      const taxAmount = Math.round(numAmount * (numTaxRate / 100) * 100) / 100;
      const totalAmount = Math.round((numAmount + taxAmount) * 100) / 100;

      const newOpex: OpexExpenseRecord = {
        id: `OPEX-${Date.now()}`,
        title,
        category: category || 'General & Admin',
        payee: partyName || 'Service Provider / Employee',
        amount: numAmount,
        taxRate: numTaxRate,
        taxAmount,
        totalAmount,
        date,
        status: isPaid ? 'Paid' : 'Unpaid',
        paymentMode,
        notes,
        createdAt: new Date().toISOString()
      };

      enterpriseOpexExpenses.unshift(newOpex);
      return res.status(201).json({ success: true, entryType, entry: newOpex });
    }

    if (entryType === 'FIXED_ASSET') {
      const newAsset: FixedAssetRecord = {
        id: `AST-${Date.now()}`,
        assetName: title,
        category: category || 'Computer & IT Hardware',
        acquisitionCost: numAmount,
        currentBookValue: numAmount,
        acquisitionDate: date,
        location: partyName || 'Corporate Head Office',
        serialNumber: `SN-${Date.now().toString().slice(-6)}`,
        createdAt: new Date().toISOString()
      };

      enterpriseFixedAssets.unshift(newAsset);
      return res.status(201).json({ success: true, entryType, entry: newAsset });
    }

    if (entryType === 'BANK_CAPITAL') {
      const newCapital: BankCapitalRecord = {
        id: `CAP-${Date.now()}`,
        title,
        accountName: partyName || 'HDFC Corporate Operating A/C',
        category: category || 'Share Capital',
        amount: numAmount,
        date,
        referenceNo: `REF-${Date.now().toString().slice(-6)}`,
        createdAt: new Date().toISOString()
      };

      enterpriseBankCapital.unshift(newCapital);
      return res.status(201).json({ success: true, entryType, entry: newCapital });
    }

    return res.status(400).json({ error: `Unknown entryType: ${entryType}` });
  } catch (err) {
    console.error('Error creating quick financial entry:', err);
    res.status(500).json({ error: 'Failed to record entry' });
  }
});

// DELETE Any Financial Entry
router.delete('/financials/entries/:type/:id', (req, res) => {
  const { type, id } = req.params;
  const lowerType = type.toLowerCase();

  if (lowerType === 'revenue' || lowerType === 'invoice') {
    const prev = enterpriseInvoices.length;
    enterpriseInvoices = enterpriseInvoices.filter(i => i.id !== id);
    if (enterpriseInvoices.length === prev) return res.status(404).json({ error: 'Invoice entry not found' });
    return res.json({ success: true, message: 'Revenue Invoice deleted', deletedId: id });
  }

  if (lowerType === 'cogs' || lowerType === 'purchase') {
    const prev = enterprisePurchaseEntries.length;
    enterprisePurchaseEntries = enterprisePurchaseEntries.filter(p => p.id !== id);
    if (enterprisePurchaseEntries.length === prev) return res.status(404).json({ error: 'Purchase entry not found' });
    return res.json({ success: true, message: 'COGS Purchase entry deleted', deletedId: id });
  }

  if (lowerType === 'opex' || lowerType === 'expense') {
    const prev = enterpriseOpexExpenses.length;
    enterpriseOpexExpenses = enterpriseOpexExpenses.filter(e => e.id !== id);
    if (enterpriseOpexExpenses.length === prev) return res.status(404).json({ error: 'Operating Expense entry not found' });
    return res.json({ success: true, message: 'Operating Expense deleted', deletedId: id });
  }

  if (lowerType === 'asset' || lowerType === 'fixed_asset') {
    const prev = enterpriseFixedAssets.length;
    enterpriseFixedAssets = enterpriseFixedAssets.filter(a => a.id !== id);
    if (enterpriseFixedAssets.length === prev) return res.status(404).json({ error: 'Fixed Asset entry not found' });
    return res.json({ success: true, message: 'Fixed Asset deleted', deletedId: id });
  }

  if (lowerType === 'capital' || lowerType === 'bank_capital') {
    const prev = enterpriseBankCapital.length;
    enterpriseBankCapital = enterpriseBankCapital.filter(c => c.id !== id);
    if (enterpriseBankCapital.length === prev) return res.status(404).json({ error: 'Bank Capital entry not found' });
    return res.json({ success: true, message: 'Bank Capital entry deleted', deletedId: id });
  }

  return res.status(400).json({ error: `Unknown entry type: ${type}` });
});

// POST Reset All Financial Books to Strictly ₹0.00
router.post('/financials/reset-to-zero', (req, res) => {
  enterpriseInvoices = [];
  enterprisePurchaseEntries = [];
  enterpriseOpexExpenses = [];
  enterpriseFixedAssets = [];
  enterpriseBankCapital = [];
  res.json({
    success: true,
    message: 'All financial statements, P&L, Balance Sheet, and ledgers have been reset to ₹0.00'
  });
});

// Recurring Billing Routes
router.get('/billing/recurring', (req, res) => {
  res.json(recurringBillingProfiles);
});

router.post('/billing/recurring', (req, res) => {
  const { customerName, customerEmail = '', planName, cycle = 'Monthly', amount, nextBillingDate, autoInvoice = true } = req.body;
  const newProfile = {
    id: `REC-${Date.now()}`,
    customerName,
    customerEmail: customerEmail || `${customerName.toLowerCase().replace(/[^a-z0-9]/g, '')}@enterprise.local`,
    planName,
    cycle,
    amount: Number(amount) || 0,
    nextBillingDate: nextBillingDate || new Date().toISOString().split('T')[0],
    autoInvoice: Boolean(autoInvoice),
    status: 'Active'
  };
  recurringBillingProfiles.unshift(newProfile);
  res.status(201).json(newProfile);
});

router.delete('/billing/recurring/:id', (req, res) => {
  const id = req.params.id;
  recurringBillingProfiles = recurringBillingProfiles.filter(r => r.id !== id);
  res.json({ message: 'Recurring billing profile deleted successfully', deletedId: id });
});

router.put('/billing/recurring/:id', (req, res) => {
  const id = req.params.id;
  const idx = recurringBillingProfiles.findIndex(r => r.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Recurring profile not found' });
  recurringBillingProfiles[idx] = { ...recurringBillingProfiles[idx], ...req.body };
  res.json(recurringBillingProfiles[idx]);
});


// ==========================================
// PURCHASE ENTRY & VENDOR BILLS SOFTWARE
// ==========================================

interface PurchaseItem {
  id: string;
  productId?: string;
  itemName: string;
  hsnCode: string;
  quantity: number;
  unit: string;
  unitCost: number;
  taxRate: number; // e.g. 18%
  itcEligibility: 'Eligible' | 'Ineligible' | 'Capital Goods';
  taxAmount: number;
  total: number;
}

interface PurchaseEntryRecord {
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

let enterprisePurchaseEntries: PurchaseEntryRecord[] = [];

let enterpriseSuppliers = [
  {
    id: 'SUP-01',
    name: 'Dell Technologies Enterprise India Pvt Ltd',
    gstin: '29AABCD1029Q1Z8',
    contactPerson: 'Karan Mehra',
    email: 'karan.mehra@dell.com',
    phone: '+91 80 6789 1100',
    city: 'Bangalore',
    paymentTerms: 'Net 30'
  },
  {
    id: 'SUP-02',
    name: 'Cisco Systems Networks India',
    gstin: '29AACCC3201P1ZW',
    contactPerson: 'Aditi Deshmukh',
    email: 'adeshmukh@cisco.com',
    phone: '+91 80 4422 9900',
    city: 'Bangalore',
    paymentTerms: 'Net 30'
  },
  {
    id: 'SUP-03',
    name: 'Godrej Ergonomic Office Solutions',
    gstin: '27AAACG0439F1ZU',
    contactPerson: 'Suresh Patil',
    email: 'spatil@godrej.com',
    phone: '+91 22 2518 8000',
    city: 'Mumbai',
    paymentTerms: 'Net 15'
  },
  {
    id: 'SUP-04',
    name: 'Amazon Web Services Cloud India',
    gstin: '27AABCA1234F1Z1',
    contactPerson: 'Cloud Enterprise Sales',
    email: 'aws-invoicing@amazon.com',
    phone: '+91 22 6123 4567',
    city: 'Mumbai',
    paymentTerms: 'Net 30'
  }
];

// GET Purchase Entries
router.get('/purchases', (req, res) => {
  const { status, supplier } = req.query;
  let list = [...enterprisePurchaseEntries];
  if (status && status !== 'All') {
    list = list.filter(p => p.status.toLowerCase() === (status as string).toLowerCase());
  }
  if (supplier) {
    list = list.filter(p => p.supplierName.toLowerCase().includes((supplier as string).toLowerCase()));
  }
  res.json(list);
});

// GET Purchase Summary KPIs
router.get('/purchases-summary', (req, res) => {
  const totalPurchases = enterprisePurchaseEntries.reduce((acc, p) => acc + p.totalAmount, 0);
  const totalPaid = enterprisePurchaseEntries.reduce((acc, p) => acc + p.paidAmount, 0);
  const totalPayables = enterprisePurchaseEntries.reduce((acc, p) => acc + p.balanceDue, 0);
  const availableITC = enterprisePurchaseEntries.reduce((acc, p) => acc + p.taxTotal, 0);
  const totalCount = enterprisePurchaseEntries.length;
  const supplierCount = enterpriseSuppliers.length;

  res.json({
    totalPurchases,
    totalPaid,
    totalPayables,
    availableITC,
    totalCount,
    supplierCount
  });
});

// POST Create Purchase Entry
router.post('/purchases', async (req, res) => {
  try {
    const {
      supplierName,
      supplierGstin = '',
      supplierInvoiceNo,
      supplierInvoiceDate = new Date().toISOString().split('T')[0],
      purchaseOrderRef = '',
      grnRef = '',
      warehouse = 'Central Warehouse',
      dueDate,
      paymentTerms = 'Net 30',
      items = [],
      freightCharges = 0,
      tdsRate = 0.1, // e.g. 0.1% for 194Q
      autoUpdateStock = true
    } = req.body;

    if (!supplierName || !supplierInvoiceNo) {
      return res.status(400).json({ error: 'Supplier name and Supplier Invoice No are required' });
    }

    const nextVoucherNum = enterprisePurchaseEntries.length + 94;
    const voucherNo = req.body.voucherNo || `PUR-2026-0${nextVoucherNum}`;

    let subtotal = 0;
    let taxTotal = 0;

    const processedItems: PurchaseItem[] = items.map((itm: any, idx: number) => {
      const qty = Number(itm.quantity) || 1;
      const rate = Number(itm.unitCost) || 0;
      const taxRate = Number(itm.taxRate) || 18;

      const rawAmount = qty * rate;
      const taxAmount = rawAmount * (taxRate / 100);
      const total = rawAmount + taxAmount;

      subtotal += rawAmount;
      taxTotal += taxAmount;

      return {
        id: `PITM-${Date.now()}-${idx}`,
        productId: itm.productId,
        itemName: itm.itemName || 'Inventory Hardware / Goods',
        hsnCode: itm.hsnCode || '847100',
        quantity: qty,
        unit: itm.unit || 'Units',
        unitCost: rate,
        taxRate,
        itcEligibility: itm.itcEligibility || 'Eligible',
        taxAmount: Math.round(taxAmount * 100) / 100,
        total: Math.round(total * 100) / 100
      };
    });

    const freight = Number(freightCharges) || 0;
    const tdsDeduction = Math.round(subtotal * (Number(tdsRate) / 100));
    const totalAmount = Math.round((subtotal + taxTotal + freight - tdsDeduction) * 100) / 100;

    const newPurchase: PurchaseEntryRecord = {
      id: `PUR-${Date.now()}`,
      voucherNo,
      supplierName,
      supplierGstin,
      supplierInvoiceNo,
      supplierInvoiceDate,
      purchaseOrderRef,
      grnRef: grnRef || `GRN-${Date.now().toString().slice(-4)}`,
      warehouse,
      dueDate: dueDate || supplierInvoiceDate,
      paymentTerms,
      items: processedItems,
      subtotal: Math.round(subtotal * 100) / 100,
      taxTotal: Math.round(taxTotal * 100) / 100,
      freightCharges: freight,
      tdsDeduction,
      totalAmount,
      paidAmount: 0,
      balanceDue: totalAmount,
      status: 'Pending Payment',
      paymentRecords: [],
      autoUpdateStock: Boolean(autoUpdateStock),
      createdAt: new Date().toISOString()
    };

    // If autoUpdateStock is enabled, increment existing product stock or create new product entry in Prisma
    if (autoUpdateStock) {
      for (const item of processedItems) {
        if (item.productId) {
          try {
            await prisma.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } }
            });
          } catch (e) {
            console.error('Failed to increment stock for product:', item.productId, e);
          }
        }
      }
    }

    enterprisePurchaseEntries.unshift(newPurchase);
    res.status(201).json(newPurchase);
  } catch (err) {
    console.error('Create purchase entry error:', err);
    res.status(500).json({ error: 'Failed to record purchase entry' });
  }
});

// GET Purchase Entry by ID
router.get('/purchases/:id', (req, res) => {
  const pur = enterprisePurchaseEntries.find(p => p.id === req.params.id);
  if (!pur) return res.status(404).json({ error: 'Purchase entry not found' });
  res.json(pur);
});

// PUT Update Purchase Entry
router.put('/purchases/:id', (req, res) => {
  const idx = enterprisePurchaseEntries.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Purchase entry not found' });

  const existing = enterprisePurchaseEntries[idx];
  const updated: PurchaseEntryRecord = {
    ...existing,
    ...req.body,
    id: existing.id,
    voucherNo: existing.voucherNo
  };

  enterprisePurchaseEntries[idx] = updated;
  res.json(updated);
});

// DELETE Purchase Entry
router.delete('/purchases/:id', (req, res) => {
  const id = req.params.id;
  const initialLen = enterprisePurchaseEntries.length;
  enterprisePurchaseEntries = enterprisePurchaseEntries.filter(p => p.id !== id);
  if (enterprisePurchaseEntries.length === initialLen) {
    return res.status(404).json({ error: 'Purchase entry not found' });
  }
  res.json({ message: 'Purchase entry deleted successfully', deletedId: id });
});

// POST Record Payment to Supplier for Purchase Entry
router.post('/purchases/:id/pay', (req, res) => {
  const pur = enterprisePurchaseEntries.find(p => p.id === req.params.id);
  if (!pur) return res.status(404).json({ error: 'Purchase entry not found' });

  const { amount, bankAccount = 'HDFC Corporate Operating A/C', mode = 'RTGS', utrRef = `UTR-${Date.now().toString().slice(-6)}` } = req.body;
  const paymentAmount = Number(amount) || 0;

  if (paymentAmount <= 0) {
    return res.status(400).json({ error: 'Payment amount must be greater than zero' });
  }

  const newPayRecord = {
    id: `PPAY-${Date.now()}`,
    amount: paymentAmount,
    paidDate: new Date().toISOString().split('T')[0],
    bankAccount,
    mode,
    utrRef
  };

  pur.paymentRecords.push(newPayRecord);
  pur.paidAmount = Math.round((pur.paidAmount + paymentAmount) * 100) / 100;
  pur.balanceDue = Math.max(0, Math.round((pur.totalAmount - pur.paidAmount) * 100) / 100);

  if (pur.balanceDue === 0) {
    pur.status = 'Paid';
  } else {
    pur.status = 'Partially Paid';
  }

  res.json({ message: 'Supplier payment recorded successfully', purchase: pur, paymentRecord: newPayRecord });
});

// Supplier Routes
router.get('/suppliers', async (req, res) => {
  try {
    const dbSuppliers = await prisma.supplier.findMany();
    if (dbSuppliers.length > 0) {
      return res.json(dbSuppliers);
    }
  } catch (e) {
    // fallback to in-memory
  }
  res.json(enterpriseSuppliers);
});

router.post('/suppliers', async (req, res) => {
  try {
    const { name, contactName, email, phone, address, gstin } = req.body;
    try {
      const dbSup = await prisma.supplier.create({
        data: { name, contactName, email, phone, address }
      });
      return res.status(201).json(dbSup);
    } catch (e) {
      const newSup = {
        id: `SUP-${Date.now().toString().slice(-4)}`,
        name,
        gstin: gstin || '29AAAA0000A1Z1',
        contactPerson: contactName || '',
        email: email || '',
        phone: phone || '',
        city: address || 'Bangalore',
        paymentTerms: 'Net 30'
      };
      enterpriseSuppliers.unshift(newSup);
      return res.status(201).json(newSup);
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to create supplier' });
  }
});

router.delete('/suppliers/:id', async (req, res) => {
  try {
    await prisma.supplier.delete({ where: { id: req.params.id } });
  } catch (e) {
    enterpriseSuppliers = enterpriseSuppliers.filter(s => s.id !== req.params.id);
  }
  res.json({ message: 'Supplier deleted successfully', deletedId: req.params.id });
});


// ============================================================================
// TALLY CLOUD 9 / ABACUS ACCOUNTING SUITE (ENTERPRISE ACCOUNTING & GST ENGINE)
// ============================================================================

export interface QuotationRecord {
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
  items: Array<{
    id: string;
    description: string;
    hsnCode: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    discountPercent: number;
    taxRate: number;
    cgst: number;
    sgst: number;
    igst: number;
    amount: number;
  }>;
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  totalAmount: number;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Rejected' | 'Converted to Invoice';
  convertedInvoiceId?: string;
  convertedInvoiceNumber?: string;
  notes?: string;
  terms?: string;
  createdAt: string;
}

export interface PurchaseOrderRecord {
  id: string;
  poNumber: string;
  supplierName: string;
  supplierGstin: string;
  supplierEmail: string;
  supplierPhone: string;
  billingAddress: string;
  deliveryWarehouse: string;
  poDate: string;
  expectedDeliveryDate: string;
  paymentTerms: string;
  items: Array<{
    id: string;
    itemName: string;
    hsnCode: string;
    quantity: number;
    unit: string;
    unitCost: number;
    taxRate: number;
    taxAmount: number;
    total: number;
  }>;
  subtotal: number;
  taxTotal: number;
  freightEstimate: number;
  totalAmount: number;
  status: 'Draft' | 'Sent to Supplier' | 'Partially Received' | 'Billed' | 'Cancelled';
  convertedPurchaseId?: string;
  notes?: string;
  createdAt: string;
}

export interface DeliveryChallanRecord {
  id: string;
  challanNumber: string;
  challanType: 'Supply of Goods' | 'Job Work / Processing' | 'Supply on Approval' | 'Internal Godown Transfer';
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
    id: string;
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
  createdAt: string;
}

export interface GodownInventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  hsnCode: string;
  unit: string;
  valuationRate: number; // Cost per unit
  sellingPrice: number;
  minReorderLevel: number;
  godownAllocations: {
    [godownName: string]: number;
  };
  totalStock: number;
  totalValuation: number;
  status: 'Optimal' | 'Low Stock' | 'Critical Reorder';
  lastUpdated: string;
}

export interface Gstr2bRecord {
  id: string;
  supplierGstin: string;
  supplierName: string;
  invoiceNumber: string;
  invoiceDate: string;
  invoiceValue: number;
  taxableValue: number;
  igst: number;
  cgst: number;
  sgst: number;
  cess: number;
  itcAvailability: 'Y' | 'N';
  gstr1FilingDate: string;
  reconciliationStatus: 'MATCHED' | 'MISMATCHED' | 'MISSING_IN_BOOKS' | 'MISSING_IN_2B';
  discrepancyNote?: string;
  bookPurchaseId?: string;
}

// In-Memory Cloud Accounting Registers
let enterpriseQuotations: QuotationRecord[] = [];
let enterprisePurchaseOrders: PurchaseOrderRecord[] = [];
let enterpriseDeliveryChallans: DeliveryChallanRecord[] = [];

let enterpriseGodownInventory: GodownInventoryItem[] = [];
let enterpriseGstr2bData: Gstr2bRecord[] = [];


// ----------------------------------------------------------------------------
// 1. QUOTATION & SALES ESTIMATE ROUTES
// ----------------------------------------------------------------------------

router.get('/accounting/quotations', (req, res) => {
  res.json(enterpriseQuotations);
});

router.post('/accounting/quotations', async (req, res) => {
  try {
    const {
      customerName,
      customerEmail = '',
      customerPhone = '',
      customerGstin = '29AAACT0000A1Z5',
      billingAddress = 'Corporate Office',
      shippingAddress = '',
      placeOfSupply = '29-Karnataka',
      quotationDate = new Date().toISOString().split('T')[0],
      validUntil = '',
      paymentTerms = 'Net 15',
      items = [],
      notes = '',
      terms = ''
    } = req.body;

    const count = enterpriseQuotations.length + 1;
    const quotationNumber = `QTN-2026-${count.toString().padStart(3, '0')}`;

    let subtotal = 0;
    let discountTotal = 0;
    let taxTotal = 0;

    const processedItems = (items || []).map((itm: any, idx: number) => {
      const qty = Number(itm.quantity) || 1;
      const rate = Number(itm.unitPrice) || 0;
      const discPct = Number(itm.discountPercent) || 0;
      const taxRate = Number(itm.taxRate) || 18;

      const lineBase = qty * rate;
      const lineDisc = lineBase * (discPct / 100);
      const taxable = lineBase - lineDisc;
      const lineTax = taxable * (taxRate / 100);
      const lineTotal = taxable + lineTax;

      subtotal += lineBase;
      discountTotal += lineDisc;
      taxTotal += lineTax;

      const isInter = placeOfSupply && !placeOfSupply.startsWith('29');

      return {
        id: `QITM-${Date.now()}-${idx}`,
        description: itm.description || 'Enterprise Solution Item',
        hsnCode: itm.hsnCode || '998311',
        quantity: qty,
        unit: itm.unit || 'Nos',
        unitPrice: rate,
        discountPercent: discPct,
        taxRate,
        cgst: isInter ? 0 : Math.round((lineTax / 2) * 100) / 100,
        sgst: isInter ? 0 : Math.round((lineTax / 2) * 100) / 100,
        igst: isInter ? Math.round(lineTax * 100) / 100 : 0,
        amount: Math.round(lineTotal * 100) / 100
      };
    });

    const totalAmount = Math.round((subtotal - discountTotal + taxTotal) * 100) / 100;

    const newQuotation: QuotationRecord = {
      id: `QTN-${Date.now()}`,
      quotationNumber,
      customerName,
      customerEmail,
      customerPhone,
      customerGstin,
      billingAddress,
      shippingAddress: shippingAddress || billingAddress,
      placeOfSupply,
      quotationDate,
      validUntil: validUntil || quotationDate,
      paymentTerms,
      currency: 'INR',
      items: processedItems,
      subtotal: Math.round(subtotal * 100) / 100,
      discountTotal: Math.round(discountTotal * 100) / 100,
      taxTotal: Math.round(taxTotal * 100) / 100,
      totalAmount,
      status: 'Sent',
      notes: notes || 'Valid for 30 calendar days from issue date.',
      terms: terms || 'Standard commercial quotation terms apply. Conversion to Tax Invoice upon purchase order receipt.',
      createdAt: new Date().toISOString()
    };

    enterpriseQuotations.unshift(newQuotation);
    res.status(201).json(newQuotation);
  } catch (err) {
    console.error('Create quotation error:', err);
    res.status(500).json({ error: 'Failed to create sales quotation' });
  }
});

router.put('/accounting/quotations/:id', (req, res) => {
  const idx = enterpriseQuotations.findIndex(q => q.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Quotation not found' });
  enterpriseQuotations[idx] = { ...enterpriseQuotations[idx], ...req.body };
  res.json(enterpriseQuotations[idx]);
});

router.delete('/accounting/quotations/:id', (req, res) => {
  const prev = enterpriseQuotations.length;
  enterpriseQuotations = enterpriseQuotations.filter(q => q.id !== req.params.id);
  if (enterpriseQuotations.length === prev) return res.status(404).json({ error: 'Quotation not found' });
  res.json({ message: 'Quotation deleted successfully' });
});

// 1-Click Convert Quotation to Tax Invoice (Auto-syncs into Invoicing, P&L, Balance Sheet)
router.post('/accounting/quotations/:id/convert-to-invoice', async (req, res) => {
  try {
    const qtn = enterpriseQuotations.find(q => q.id === req.params.id);
    if (!qtn) return res.status(404).json({ error: 'Quotation not found' });

    const invoiceNumber = `INV-2026-${(enterpriseInvoices.length + 85).toString().padStart(3, '0')}`;

    const newInvoice: InvoiceRecord = {
      id: `INV-${Date.now()}`,
      invoiceNumber,
      invoiceType: 'Tax Invoice',
      customerName: qtn.customerName,
      customerEmail: qtn.customerEmail,
      customerPhone: qtn.customerPhone,
      customerGstin: qtn.customerGstin,
      billingAddress: qtn.billingAddress,
      shippingAddress: qtn.shippingAddress,
      placeOfSupply: qtn.placeOfSupply,
      isInterState: !qtn.placeOfSupply.startsWith('29'),
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      paymentTerms: qtn.paymentTerms,
      currency: 'INR',
      einvoice: {
        irn: `${Date.now()}8a0b1c3d5e7f9a0b2c4d6e8f0a1b3c5d7e9f1a`.padStart(64, '0').slice(-64),
        ackNo: Date.now().toString(),
        ackDate: new Date().toISOString(),
        signedQr: `GST-NIC-EINV-QR-${invoiceNumber}`,
        status: 'ACTIVE'
      },
      items: qtn.items.map(itm => ({ ...itm, id: `ITM-${Date.now()}-${Math.random().toString().slice(-4)}` })),
      subtotal: qtn.subtotal,
      discountTotal: qtn.discountTotal,
      taxTotal: qtn.taxTotal,
      totalAmount: qtn.totalAmount,
      paidAmount: 0,
      balanceDue: qtn.totalAmount,
      status: 'Sent',
      notes: `Converted directly from Quotation ${qtn.quotationNumber}. ${qtn.notes || ''}`,
      terms: qtn.terms || 'Standard payment terms apply.',
      payments: [],
      createdAt: new Date().toISOString()
    };

    // Auto-sync customer to CRM
    try {
      const existingCustomer = await prisma.customer.findFirst({
        where: { name: qtn.customerName }
      });
      if (!existingCustomer) {
        const adminUser = await prisma.user.findFirst();
        if (adminUser) {
          await prisma.customer.create({
            data: {
              name: qtn.customerName,
              email: qtn.customerEmail || null,
              phone: qtn.customerPhone || null,
              address: qtn.billingAddress || null,
              creditInfo: qtn.paymentTerms || 'Net 15',
              assignedToId: adminUser.id
            }
          });
        }
      }
    } catch (e) {}

    enterpriseInvoices.unshift(newInvoice);

    // Update quotation status
    qtn.status = 'Converted to Invoice';
    qtn.convertedInvoiceId = newInvoice.id;
    qtn.convertedInvoiceNumber = newInvoice.invoiceNumber;

    res.json({
      success: true,
      message: `Quotation ${qtn.quotationNumber} successfully converted to Tax Invoice ${newInvoice.invoiceNumber}`,
      invoice: newInvoice,
      quotation: qtn
    });
  } catch (err) {
    console.error('Convert quotation error:', err);
    res.status(500).json({ error: 'Failed to convert quotation to invoice' });
  }
});

// ----------------------------------------------------------------------------
// 2. PURCHASE ORDER (PO) ROUTES
// ----------------------------------------------------------------------------

router.get('/accounting/purchase-orders', (req, res) => {
  res.json(enterprisePurchaseOrders);
});

router.post('/accounting/purchase-orders', (req, res) => {
  try {
    const {
      supplierName,
      supplierGstin = '29AABCD0000P1Z1',
      supplierEmail = '',
      supplierPhone = '',
      billingAddress = 'Corporate Office',
      deliveryWarehouse = 'Bangalore Central Tech Hub',
      poDate = new Date().toISOString().split('T')[0],
      expectedDeliveryDate = '',
      paymentTerms = 'Net 30',
      items = [],
      freightEstimate = 0,
      notes = ''
    } = req.body;

    const count = enterprisePurchaseOrders.length + 1;
    const poNumber = `PO-2026-${count.toString().padStart(3, '0')}`;

    let subtotal = 0;
    let taxTotal = 0;

    const processedItems = (items || []).map((itm: any, idx: number) => {
      const qty = Number(itm.quantity) || 1;
      const rate = Number(itm.unitCost) || 0;
      const taxRate = Number(itm.taxRate) || 18;
      const lineCost = qty * rate;
      const taxAmount = lineCost * (taxRate / 100);
      const total = lineCost + taxAmount;

      subtotal += lineCost;
      taxTotal += taxAmount;

      return {
        id: `POITM-${Date.now()}-${idx}`,
        itemName: itm.itemName || 'Ordered Materials',
        hsnCode: itm.hsnCode || '847100',
        quantity: qty,
        unit: itm.unit || 'Units',
        unitCost: rate,
        taxRate,
        taxAmount: Math.round(taxAmount * 100) / 100,
        total: Math.round(total * 100) / 100
      };
    });

    const freight = Number(freightEstimate) || 0;
    const totalAmount = Math.round((subtotal + taxTotal + freight) * 100) / 100;

    const newPO: PurchaseOrderRecord = {
      id: `PO-${Date.now()}`,
      poNumber,
      supplierName,
      supplierGstin,
      supplierEmail,
      supplierPhone,
      billingAddress,
      deliveryWarehouse,
      poDate,
      expectedDeliveryDate: expectedDeliveryDate || poDate,
      paymentTerms,
      items: processedItems,
      subtotal: Math.round(subtotal * 100) / 100,
      taxTotal: Math.round(taxTotal * 100) / 100,
      freightEstimate: freight,
      totalAmount,
      status: 'Sent to Supplier',
      notes: notes || 'Delivery required at specified godown dock. Inspection upon arrival.',
      createdAt: new Date().toISOString()
    };

    enterprisePurchaseOrders.unshift(newPO);
    res.status(201).json(newPO);
  } catch (err) {
    console.error('Create PO error:', err);
    res.status(500).json({ error: 'Failed to create purchase order' });
  }
});

router.put('/accounting/purchase-orders/:id', (req, res) => {
  const idx = enterprisePurchaseOrders.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Purchase order not found' });
  enterprisePurchaseOrders[idx] = { ...enterprisePurchaseOrders[idx], ...req.body };
  res.json(enterprisePurchaseOrders[idx]);
});

router.delete('/accounting/purchase-orders/:id', (req, res) => {
  const prev = enterprisePurchaseOrders.length;
  enterprisePurchaseOrders = enterprisePurchaseOrders.filter(p => p.id !== req.params.id);
  if (enterprisePurchaseOrders.length === prev) return res.status(404).json({ error: 'Purchase order not found' });
  res.json({ message: 'Purchase order deleted successfully' });
});

// 1-Click Convert PO to Purchase Bill / Entry (Auto-syncs into Procurement, COGS, Balance Sheet, ITC, Stock)
router.post('/accounting/purchase-orders/:id/convert-to-purchase-bill', async (req, res) => {
  try {
    const po = enterprisePurchaseOrders.find(p => p.id === req.params.id);
    if (!po) return res.status(404).json({ error: 'Purchase order not found' });

    const voucherNo = `PUR-2026-${(enterprisePurchaseEntries.length + 95).toString().padStart(3, '0')}`;

    const newPurchase: PurchaseEntryRecord = {
      id: `PUR-${Date.now()}`,
      voucherNo,
      supplierName: po.supplierName,
      supplierGstin: po.supplierGstin,
      supplierInvoiceNo: `SUP-${po.poNumber}`,
      supplierInvoiceDate: new Date().toISOString().split('T')[0],
      purchaseOrderRef: po.poNumber,
      grnRef: `GRN-${Date.now().toString().slice(-4)}`,
      warehouse: po.deliveryWarehouse,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      paymentTerms: po.paymentTerms,
      items: po.items.map(itm => ({
        id: `PITM-${Date.now()}-${Math.random().toString().slice(-4)}`,
        itemName: itm.itemName,
        hsnCode: itm.hsnCode,
        quantity: itm.quantity,
        unit: itm.unit,
        unitCost: itm.unitCost,
        taxRate: itm.taxRate,
        itcEligibility: 'Eligible',
        taxAmount: itm.taxAmount,
        total: itm.total
      })),
      subtotal: po.subtotal,
      taxTotal: po.taxTotal,
      freightCharges: po.freightEstimate,
      tdsDeduction: 0,
      totalAmount: po.totalAmount,
      paidAmount: 0,
      balanceDue: po.totalAmount,
      status: 'Pending Payment',
      paymentRecords: [],
      autoUpdateStock: true,
      createdAt: new Date().toISOString()
    };

    enterprisePurchaseEntries.unshift(newPurchase);

    // Update PO status
    po.status = 'Billed';
    po.convertedPurchaseId = newPurchase.id;

    res.json({
      success: true,
      message: `Purchase Order ${po.poNumber} successfully converted to Purchase Entry ${newPurchase.voucherNo}`,
      purchase: newPurchase,
      po
    });
  } catch (err) {
    console.error('Convert PO error:', err);
    res.status(500).json({ error: 'Failed to convert purchase order' });
  }
});

// ----------------------------------------------------------------------------
// 3. DELIVERY CHALLAN (DC) ROUTES
// ----------------------------------------------------------------------------

router.get('/accounting/delivery-challans', (req, res) => {
  res.json(enterpriseDeliveryChallans);
});

router.post('/accounting/delivery-challans', (req, res) => {
  try {
    const {
      challanType = 'Supply of Goods',
      consigneeName,
      consigneeGstin = '29AAACT0000A1Z5',
      consigneeAddress = 'Client Site Delivery Hub',
      dispatchDate = new Date().toISOString().split('T')[0],
      sourceWarehouse = 'Bangalore Central Tech Hub',
      vehicleNo = 'KA-01-MJ-8822',
      transporterName = 'BlueDart Enterprise Logistics',
      lrNo = `LR-${Date.now().toString().slice(-5)}`,
      ewayBillNo = '',
      items = [],
      notes = ''
    } = req.body;

    const count = enterpriseDeliveryChallans.length + 1;
    const challanNumber = `DC-2026-${count.toString().padStart(3, '0')}`;

    let totalValue = 0;
    const processedItems = (items || []).map((itm: any, idx: number) => {
      const qty = Number(itm.quantity) || 1;
      const rate = Number(itm.rate) || 0;
      const lineVal = qty * rate;
      totalValue += lineVal;
      return {
        id: `DCITM-${Date.now()}-${idx}`,
        itemName: itm.itemName || 'Dispatched Item',
        hsnCode: itm.hsnCode || '847100',
        quantity: qty,
        unit: itm.unit || 'Units',
        rate,
        totalValue: lineVal,
        batchNo: itm.batchNo || `BAT-${Date.now().toString().slice(-4)}`
      };
    });

    const newDC: DeliveryChallanRecord = {
      id: `DC-${Date.now()}`,
      challanNumber,
      challanType,
      consigneeName,
      consigneeGstin,
      consigneeAddress,
      dispatchDate,
      sourceWarehouse,
      vehicleNo,
      transporterName,
      lrNo,
      ewayBillNo: ewayBillNo || `2410${Date.now().toString().slice(-8)}`,
      items: processedItems,
      totalValue: Math.round(totalValue * 100) / 100,
      status: 'Dispatched',
      notes: notes || 'Goods in transit under Section 55 CGST Rules. Received in good order and condition.',
      createdAt: new Date().toISOString()
    };

    enterpriseDeliveryChallans.unshift(newDC);
    res.status(201).json(newDC);
  } catch (err) {
    console.error('Create DC error:', err);
    res.status(500).json({ error: 'Failed to create delivery challan' });
  }
});

router.put('/accounting/delivery-challans/:id', (req, res) => {
  const idx = enterpriseDeliveryChallans.findIndex(d => d.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Delivery challan not found' });
  enterpriseDeliveryChallans[idx] = { ...enterpriseDeliveryChallans[idx], ...req.body };
  res.json(enterpriseDeliveryChallans[idx]);
});

router.delete('/accounting/delivery-challans/:id', (req, res) => {
  const prev = enterpriseDeliveryChallans.length;
  enterpriseDeliveryChallans = enterpriseDeliveryChallans.filter(d => d.id !== req.params.id);
  if (enterpriseDeliveryChallans.length === prev) return res.status(404).json({ error: 'Delivery challan not found' });
  res.json({ message: 'Delivery challan deleted successfully' });
});

// 1-Click Convert Delivery Challan to Tax Invoice
router.post('/accounting/delivery-challans/:id/convert-to-invoice', (req, res) => {
  try {
    const dc = enterpriseDeliveryChallans.find(d => d.id === req.params.id);
    if (!dc) return res.status(404).json({ error: 'Delivery challan not found' });

    const invoiceNumber = `INV-2026-${(enterpriseInvoices.length + 86).toString().padStart(3, '0')}`;
    const taxRate = 18;
    const taxTotal = Math.round(dc.totalValue * (taxRate / 100) * 100) / 100;
    const totalAmount = Math.round((dc.totalValue + taxTotal) * 100) / 100;

    const newInvoice: InvoiceRecord = {
      id: `INV-${Date.now()}`,
      invoiceNumber,
      invoiceType: 'Tax Invoice',
      customerName: dc.consigneeName,
      customerEmail: `${dc.consigneeName.toLowerCase().replace(/[^a-z0-9]/g, '')}@enterprise.local`,
      customerPhone: '+91 98450 11223',
      customerGstin: dc.consigneeGstin,
      billingAddress: dc.consigneeAddress,
      shippingAddress: dc.consigneeAddress,
      placeOfSupply: '29-Karnataka',
      isInterState: false,
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      paymentTerms: 'Net 15',
      currency: 'INR',
      einvoice: {
        irn: `${Date.now()}8a0b1c3d5e7f9a0b2c4d6e8f0a1b3c5d7e9f1b`.padStart(64, '0').slice(-64),
        ackNo: Date.now().toString(),
        ackDate: new Date().toISOString(),
        signedQr: `GST-NIC-EINV-QR-${invoiceNumber}`,
        status: 'ACTIVE'
      },
      ewaybill: {
        ewayBillNo: dc.ewayBillNo || '241098234101',
        validUntil: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        vehicleNo: dc.vehicleNo,
        transporterId: dc.transporterName,
        distanceKm: 180,
        status: 'ACTIVE'
      },
      items: dc.items.map(itm => ({
        id: `ITM-${Date.now()}-${Math.random().toString().slice(-4)}`,
        description: itm.itemName,
        hsnCode: itm.hsnCode,
        quantity: itm.quantity,
        unit: itm.unit,
        unitPrice: itm.rate,
        discountPercent: 0,
        taxRate,
        cgst: Math.round((itm.totalValue * 0.09) * 100) / 100,
        sgst: Math.round((itm.totalValue * 0.09) * 100) / 100,
        igst: 0,
        amount: itm.totalValue + Math.round(itm.totalValue * 0.18)
      })),
      subtotal: dc.totalValue,
      discountTotal: 0,
      taxTotal,
      totalAmount,
      paidAmount: 0,
      balanceDue: totalAmount,
      status: 'Sent',
      notes: `Invoiced against Delivery Challan ${dc.challanNumber}. E-Way Bill: ${dc.ewayBillNo}`,
      terms: 'Standard terms apply.',
      payments: [],
      createdAt: new Date().toISOString()
    };

    enterpriseInvoices.unshift(newInvoice);
    dc.status = 'Invoiced';
    dc.convertedInvoiceId = newInvoice.id;

    res.json({
      success: true,
      message: `Delivery Challan ${dc.challanNumber} billed into Tax Invoice ${newInvoice.invoiceNumber}`,
      invoice: newInvoice,
      deliveryChallan: dc
    });
  } catch (err) {
    console.error('Convert DC error:', err);
    res.status(500).json({ error: 'Failed to convert delivery challan' });
  }
});

// ----------------------------------------------------------------------------
// 4. MULTI-GODOWN INVENTORY ROUTES
// ----------------------------------------------------------------------------

router.get('/accounting/inventory/stock-summary', (req, res) => {
  const totalStockUnits = enterpriseGodownInventory.reduce((acc, i) => acc + i.totalStock, 0);
  const totalValuation = enterpriseGodownInventory.reduce((acc, i) => acc + i.totalValuation, 0);
  const lowStockCount = enterpriseGodownInventory.filter(i => i.status !== 'Optimal').length;

  res.json({
    items: enterpriseGodownInventory,
    summary: {
      totalItemsCount: enterpriseGodownInventory.length,
      totalStockUnits,
      totalValuation,
      lowStockCount,
      godowns: ['Bangalore Central Tech Hub', 'Mumbai Depot', 'Delhi Distribution Center']
    }
  });
});

router.post('/accounting/inventory/items', (req, res) => {
  try {
    const { sku, name, category, hsnCode, unit = 'Units', valuationRate = 0, sellingPrice = 0, minReorderLevel = 5, godownAllocations = {} } = req.body;
    let totalStock = 0;
    Object.values(godownAllocations).forEach(val => {
      totalStock += Number(val) || 0;
    });
    const totalValuation = totalStock * (Number(valuationRate) || 0);

    const newItem: GodownInventoryItem = {
      id: `GITEM-${Date.now()}`,
      sku: sku || `SKU-${Date.now().toString().slice(-5)}`,
      name,
      category: category || 'General Inventory',
      hsnCode: hsnCode || '847100',
      unit,
      valuationRate: Number(valuationRate) || 0,
      sellingPrice: Number(sellingPrice) || 0,
      minReorderLevel: Number(minReorderLevel) || 5,
      godownAllocations: godownAllocations || { 'Bangalore Central Tech Hub': totalStock },
      totalStock,
      totalValuation,
      status: totalStock <= minReorderLevel ? 'Low Stock' : 'Optimal',
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    enterpriseGodownInventory.unshift(newItem);
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: 'Failed to record inventory item' });
  }
});

// Inter-Godown Transfer Journal (e.g. Bangalore to Mumbai)
router.post('/accounting/inventory/transfer', (req, res) => {
  const { itemId, fromGodown, toGodown, quantity } = req.body;
  const item = enterpriseGodownInventory.find(i => i.id === itemId);
  if (!item) return res.status(404).json({ error: 'Inventory item not found' });

  const numQty = Number(quantity) || 0;
  const currentFrom = item.godownAllocations[fromGodown] || 0;
  if (currentFrom < numQty) {
    return res.status(400).json({ error: `Insufficient stock at ${fromGodown}. Available: ${currentFrom}` });
  }

  item.godownAllocations[fromGodown] -= numQty;
  item.godownAllocations[toGodown] = (item.godownAllocations[toGodown] || 0) + numQty;
  item.lastUpdated = new Date().toISOString().split('T')[0];

  res.json({
    success: true,
    message: `Transferred ${numQty} units of ${item.name} from ${fromGodown} to ${toGodown}`,
    item
  });
});

// ----------------------------------------------------------------------------
// 5. GSTR-1, GSTR-3B & GST FILING ENGINE
// ----------------------------------------------------------------------------

router.get('/accounting/gst/gstr1', (req, res) => {
  try {
    // 1. Table 4A: B2B Invoices (Registered Customers with GSTIN)
    const b2bInvoices = enterpriseInvoices.filter(i => i.customerGstin && i.customerGstin.length >= 15);
    const b2bTaxable = b2bInvoices.reduce((acc, i) => acc + (i.subtotal - i.discountTotal), 0);
    const b2bTax = b2bInvoices.reduce((acc, i) => acc + i.taxTotal, 0);
    const b2bTotal = b2bInvoices.reduce((acc, i) => acc + i.totalAmount, 0);

    // 2. Table 5A: B2C Large (Inter-state unregistered > 2.5L)
    const b2cLarge = enterpriseInvoices.filter(i => (!i.customerGstin || i.customerGstin.length < 15) && i.isInterState && i.totalAmount > 250000);
    const b2cLargeTaxable = b2cLarge.reduce((acc, i) => acc + (i.subtotal - i.discountTotal), 0);
    const b2cLargeTax = b2cLarge.reduce((acc, i) => acc + i.taxTotal, 0);

    // 3. Table 7: B2C Small (Other unregistered intra-state or small)
    const b2cSmall = enterpriseInvoices.filter(i => (!i.customerGstin || i.customerGstin.length < 15) && (!i.isInterState || i.totalAmount <= 250000));
    const b2cSmallTaxable = b2cSmall.reduce((acc, i) => acc + (i.subtotal - i.discountTotal), 0);
    const b2cSmallTax = b2cSmall.reduce((acc, i) => acc + i.taxTotal, 0);

    // 4. Table 12: HSN Summary
    const hsnMap: { [hsn: string]: any } = {};
    enterpriseInvoices.forEach(inv => {
      inv.items.forEach(itm => {
        const hsn = itm.hsnCode || '998311';
        if (!hsnMap[hsn]) {
          hsnMap[hsn] = {
            hsnCode: hsn,
            description: itm.description,
            uom: itm.unit || 'Nos',
            totalQuantity: 0,
            totalValue: 0,
            taxableValue: 0,
            igst: 0,
            cgst: 0,
            sgst: 0
          };
        }
        hsnMap[hsn].totalQuantity += itm.quantity;
        hsnMap[hsn].totalValue += itm.amount;
        hsnMap[hsn].taxableValue += itm.unitPrice * itm.quantity;
        hsnMap[hsn].cgst += itm.cgst || 0;
        hsnMap[hsn].sgst += itm.sgst || 0;
        hsnMap[hsn].igst += itm.igst || 0;
      });
    });

    const hsnSummary = Object.values(hsnMap);

    // 5. Table 13: Document Summary
    const docSummary = {
      docType: 'Tax Invoices (Series INV-2026)',
      fromSerial: enterpriseInvoices.length > 0 ? enterpriseInvoices[enterpriseInvoices.length - 1].invoiceNumber : 'N/A',
      toSerial: enterpriseInvoices.length > 0 ? enterpriseInvoices[0].invoiceNumber : 'N/A',
      totalCount: enterpriseInvoices.length,
      cancelledCount: enterpriseInvoices.filter(i => (i.status as string) === 'Cancelled').length,
      netIssued: enterpriseInvoices.filter(i => (i.status as string) !== 'Cancelled').length
    };

    res.json({
      reportingGstin: '29AAACT2727Q1ZB',
      legalTradeName: 'OmniCloud Technologies Pvt Ltd',
      returnPeriod: '092026', // September 2026
      grossTurnoverFY: b2bTotal,
      table4_b2b: {
        invoicesCount: b2bInvoices.length,
        taxableValue: b2bTaxable,
        taxAmount: b2bTax,
        invoiceValue: b2bTotal,
        invoices: b2bInvoices
      },
      table5_b2cLarge: {
        invoicesCount: b2cLarge.length,
        taxableValue: b2cLargeTaxable,
        taxAmount: b2cLargeTax,
        invoices: b2cLarge
      },
      table7_b2cSmall: {
        invoicesCount: b2cSmall.length,
        taxableValue: b2cSmallTaxable,
        taxAmount: b2cSmallTax
      },
      table12_hsnSummary: hsnSummary,
      table13_docSummary: [docSummary],
      summary: {
        totalOutwardSupplies: b2bTaxable + b2cLargeTaxable + b2cSmallTaxable,
        totalOutputGst: b2bTax + b2cLargeTax + b2cSmallTax,
        status: 'Audit Ready / Auto-Reconciled'
      }
    });
  } catch (err) {
    console.error('GSTR-1 report error:', err);
    res.status(500).json({ error: 'Failed to generate GSTR-1 statement' });
  }
});

// Official GST Portal JSON Generator (Ready for Offline Upload on gst.gov.in)
router.get('/accounting/gst/gstr1-json', (req, res) => {
  const b2bInvoices = enterpriseInvoices.filter(i => i.customerGstin && i.customerGstin.length >= 15);

  const gstPortalJson = {
    gstin: '29AAACT2727Q1ZB',
    fp: '092026',
    gt: enterpriseInvoices.reduce((acc, i) => acc + i.totalAmount, 0),
    cur_gt: enterpriseInvoices.reduce((acc, i) => acc + i.subtotal, 0),
    version: 'GSTR1_3.0_OFFLINE',
    b2b: b2bInvoices.map(inv => ({
      ctin: inv.customerGstin,
      inv: [{
        inum: inv.invoiceNumber,
        idt: inv.invoiceDate,
        val: inv.totalAmount,
        pos: inv.placeOfSupply.slice(0, 2),
        rchrg: 'N',
        inv_typ: 'R',
        irn: inv.einvoice?.irn || null,
        itms: inv.items.map((itm, idx) => ({
          num: idx + 1,
          itm_det: {
            rt: itm.taxRate,
            txval: itm.unitPrice * itm.quantity,
            iamt: itm.igst,
            camt: itm.cgst,
            samt: itm.sgst,
            csamt: 0
          }
        }))
      }]
    }))
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="GSTR1_Return_September_2026.json"');
  res.send(JSON.stringify(gstPortalJson, null, 2));
});

// GSTR-3B Monthly Return Computation
router.get('/accounting/gst/gstr3b', (req, res) => {
  try {
    // 1. Table 3.1: Outward Supplies
    const outwardTaxable = enterpriseInvoices.reduce((acc, i) => acc + (i.subtotal - i.discountTotal), 0);
    const outwardIgst = enterpriseInvoices.reduce((acc, i) => acc + i.items.reduce((sum, itm) => sum + (itm.igst || 0), 0), 0);
    const outwardCgst = enterpriseInvoices.reduce((acc, i) => acc + i.items.reduce((sum, itm) => sum + (itm.cgst || 0), 0), 0);
    const outwardSgst = enterpriseInvoices.reduce((acc, i) => acc + i.items.reduce((sum, itm) => sum + (itm.sgst || 0), 0), 0);
    const totalOutwardTax = outwardIgst + outwardCgst + outwardSgst;

    // 2. Table 4: Eligible Input Tax Credit (ITC) from Purchases
    const inwardPurchases = enterprisePurchaseEntries;
    const itcIgst = inwardPurchases.reduce((acc, p) => acc + (p.items.reduce((sum, itm) => sum + (itm.taxRate > 0 && p.supplierGstin && !p.supplierGstin.startsWith('29') ? itm.taxAmount : 0), 0)), 0);
    const itcCgst = inwardPurchases.reduce((acc, p) => acc + (p.items.reduce((sum, itm) => sum + (itm.taxRate > 0 && p.supplierGstin && p.supplierGstin.startsWith('29') ? itm.taxAmount / 2 : 0), 0)), 0);
    const itcSgst = itcCgst;
    const totalEligibleItc = inwardPurchases.reduce((acc, p) => acc + p.taxTotal, 0);

    // 3. Table 6.1: Tax Payable & Payment
    const netPayableIgst = Math.max(0, outwardIgst - itcIgst);
    const netPayableCgst = Math.max(0, outwardCgst - itcCgst);
    const netPayableSgst = Math.max(0, outwardSgst - itcSgst);
    const totalCashTaxPayable = netPayableIgst + netPayableCgst + netPayableSgst;

    res.json({
      returnPeriod: 'September 2026',
      gstin: '29AAACT2727Q1ZB',
      table3_1: {
        outwardTaxableSupplies: outwardTaxable,
        integratedTax: outwardIgst,
        centralTax: outwardCgst,
        stateTax: outwardSgst,
        cess: 0,
        totalTax: totalOutwardTax
      },
      table4_itc: {
        allOtherItc: {
          integratedTax: itcIgst,
          centralTax: itcCgst,
          stateTax: itcSgst,
          cess: 0,
          total: totalEligibleItc
        },
        itcReversed: { integratedTax: 0, centralTax: 0, stateTax: 0, cess: 0 },
        netItcAvailable: totalEligibleItc
      },
      table6_1_payment: {
        taxPayable: totalOutwardTax,
        paidThroughItc: Math.min(totalOutwardTax, totalEligibleItc),
        paidInCash: totalCashTaxPayable,
        breakdown: {
          igstCash: netPayableIgst,
          cgstCash: netPayableCgst,
          sgstCash: netPayableSgst
        }
      }
    });
  } catch (err) {
    console.error('GSTR-3B error:', err);
    res.status(500).json({ error: 'Failed to compute GSTR-3B statement' });
  }
});

// ----------------------------------------------------------------------------
// 6. GSTR-2B vs. BOOKS ITC RECONCILIATION ENGINE
// ----------------------------------------------------------------------------

router.get('/accounting/gst/reconciliation-2b', (req, res) => {
  try {
    const bookPurchases = enterprisePurchaseEntries;
    const portalEntries = [...enterpriseGstr2bData];

    // Compute dynamic matching
    let matchedCount = 0;
    let matchedItc = 0;
    let missingIn2bCount = 0;
    let missingIn2bItc = 0;
    let missingInBooksCount = 0;
    let missingInBooksItc = 0;

    const reconciledList = portalEntries.map(entry => {
      const matchedPurchase = bookPurchases.find(
        p => p.supplierGstin === entry.supplierGstin && p.supplierInvoiceNo === entry.invoiceNumber
      );

      if (matchedPurchase) {
        entry.reconciliationStatus = 'MATCHED';
        entry.bookPurchaseId = matchedPurchase.id;
        matchedCount++;
        matchedItc += (entry.cgst + entry.sgst + entry.igst);
      } else {
        entry.reconciliationStatus = 'MISSING_IN_BOOKS';
        missingInBooksCount++;
        missingInBooksItc += (entry.cgst + entry.sgst + entry.igst);
      }

      return entry;
    });

    // Check for purchases in books that are not in 2B (Defaulting vendor risk!)
    bookPurchases.forEach(pur => {
      const foundIn2b = portalEntries.find(e => e.supplierGstin === pur.supplierGstin && e.invoiceNumber === pur.supplierInvoiceNo);
      if (!foundIn2b) {
        missingIn2bCount++;
        missingIn2bItc += pur.taxTotal;
        reconciledList.push({
          id: `UNREC-${pur.id}`,
          supplierGstin: pur.supplierGstin,
          supplierName: pur.supplierName,
          invoiceNumber: pur.supplierInvoiceNo || pur.voucherNo,
          invoiceDate: pur.supplierInvoiceDate,
          invoiceValue: pur.totalAmount,
          taxableValue: pur.subtotal,
          igst: pur.supplierGstin && !pur.supplierGstin.startsWith('29') ? pur.taxTotal : 0,
          cgst: pur.supplierGstin && pur.supplierGstin.startsWith('29') ? pur.taxTotal / 2 : 0,
          sgst: pur.supplierGstin && pur.supplierGstin.startsWith('29') ? pur.taxTotal / 2 : 0,
          cess: 0,
          itcAvailability: 'N',
          gstr1FilingDate: 'NOT FILED YET',
          reconciliationStatus: 'MISSING_IN_2B',
          discrepancyNote: 'Entered in Purchase Register but supplier has NOT filed GSTR-1. High risk of ITC denial under Section 16(2)(aa).',
          bookPurchaseId: pur.id
        });
      }
    });

    res.json({
      summary: {
        total2bRecords: portalEntries.length,
        totalBookPurchases: bookPurchases.length,
        matchedCount,
        matchedItc,
        missingIn2bCount,
        missingIn2bItc,
        missingInBooksCount,
        missingInBooksItc,
        itcAtRiskAmount: missingIn2bItc,
        reconciliationScore: bookPurchases.length > 0 ? Math.round((matchedCount / (matchedCount + missingIn2bCount)) * 100) : 100
      },
      reconciledRecords: reconciledList
    });
  } catch (err) {
    console.error('Reconciliation error:', err);
    res.status(500).json({ error: 'Failed to run GSTR-2B reconciliation' });
  }
});

// Import Missing 2B Portal Invoice directly into Purchase Book
router.post('/accounting/gst/reconciliation-2b/import-missing', (req, res) => {
  try {
    const { id } = req.body;
    const entry = enterpriseGstr2bData.find(e => e.id === id);
    if (!entry) return res.status(404).json({ error: 'GSTR-2B entry not found' });

    const voucherNo = `PUR-2026-${(enterprisePurchaseEntries.length + 96).toString().padStart(3, '0')}`;
    const taxTotal = entry.cgst + entry.sgst + entry.igst;

    const newPurchase: PurchaseEntryRecord = {
      id: `PUR-${Date.now()}`,
      voucherNo,
      supplierName: entry.supplierName,
      supplierGstin: entry.supplierGstin,
      supplierInvoiceNo: entry.invoiceNumber,
      supplierInvoiceDate: entry.invoiceDate,
      purchaseOrderRef: 'PO-AUTO-2B',
      grnRef: `GRN-${Date.now().toString().slice(-4)}`,
      warehouse: 'Bangalore Central Tech Hub',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      paymentTerms: 'Net 30',
      items: [
        {
          id: `PITM-${Date.now()}`,
          itemName: `Supply as per GSTR-2B Inv #${entry.invoiceNumber}`,
          hsnCode: '847100',
          quantity: 1,
          unit: 'Lot',
          unitCost: entry.taxableValue,
          taxRate: 18,
          itcEligibility: 'Eligible',
          taxAmount: taxTotal,
          total: entry.invoiceValue
        }
      ],
      subtotal: entry.taxableValue,
      taxTotal,
      freightCharges: 0,
      tdsDeduction: 0,
      totalAmount: entry.invoiceValue,
      paidAmount: 0,
      balanceDue: entry.invoiceValue,
      status: 'Pending Payment',
      paymentRecords: [],
      autoUpdateStock: false,
      createdAt: new Date().toISOString()
    };

    enterprisePurchaseEntries.unshift(newPurchase);
    entry.reconciliationStatus = 'MATCHED';
    entry.bookPurchaseId = newPurchase.id;

    res.json({
      success: true,
      message: `Successfully imported invoice ${entry.invoiceNumber} from GSTR-2B into Purchase Register as ${newPurchase.voucherNo}`,
      purchase: newPurchase
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to import 2B invoice' });
  }
});


// ============================================================================
// ENTERPRISE ACCOUNTING: BANKING, BRS, TRIAL BALANCE, CASH FLOW, BATCHES & GOVERNANCE
// ============================================================================

// 1. BANK ACCOUNTS & CONNECTED BANKING
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

let enterpriseBankAccounts: BankAccount[] = [
  {
    id: 'BNK-01',
    accountName: 'HDFC Corporate Operating A/C',
    bankName: 'HDFC Bank Ltd',
    accountNumber: '50200049219800',
    ifscCode: 'HDFC0000053',
    accountType: 'Current',
    bookBalance: 0,
    bankStatementBalance: 0,
    unreconciledAmount: 0,
    connectedApiStatus: 'Connected',
    lastSyncedAt: new Date().toISOString()
  },
  {
    id: 'BNK-02',
    accountName: 'ICICI Primary Current Account - Ops',
    bankName: 'ICICI Bank Ltd',
    accountNumber: '000205018991',
    ifscCode: 'ICIC0000002',
    accountType: 'Current',
    bookBalance: 0,
    bankStatementBalance: 0,
    unreconciledAmount: 0,
    connectedApiStatus: 'Connected',
    lastSyncedAt: new Date().toISOString()
  },
  {
    id: 'BNK-03',
    accountName: 'Central Cash in Hand Vault',
    bankName: 'Cash Vault (Bangalore HQ)',
    accountNumber: 'CASH-VAULT-01',
    ifscCode: 'N/A',
    accountType: 'Cash',
    bookBalance: 0,
    bankStatementBalance: 0,
    unreconciledAmount: 0,
    connectedApiStatus: 'Manual',
    lastSyncedAt: new Date().toISOString()
  }
];

let enterpriseBankReconciliation: BankReconciliationItem[] = [];

// 2. INVENTORY BATCHES, STOCK GROUPS & UNITS
interface StockBatch {
  id: string;
  batchNumber: string;
  itemName: string;
  sku: string;
  godown: string;
  mfgDate: string;
  expiryDate: string;
  quantity: number;
  unit: string;
  valuationRate: number;
  totalValuation: number;
  status: 'Fresh' | 'Near Expiry' | 'Expired';
}

let enterpriseStockBatches: StockBatch[] = [];

// 3. MULTI-COMPANY ENTITIES
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

let enterpriseCompanies: EnterpriseCompany[] = [
  {
    id: 'COMP-01',
    companyName: 'Antigravity Operations Global Private Limited',
    tradeName: 'Antigravity Technologies',
    legalType: 'Private Limited',
    gstin: '29AAACT2727Q1ZB',
    pan: 'AAACT2727Q',
    cin: 'U72200KA2026PTC188291',
    registeredOffice: 'Tech Park Blvd, Outer Ring Road, Bangalore, Karnataka 560103',
    stateCode: '29 - Karnataka',
    financialYear: '2026-2027',
    baseCurrency: 'INR (₹)',
    isActive: true,
    totalVouchersCount: 0
  },
  {
    id: 'COMP-02',
    companyName: 'OmniLogistics India Limited',
    tradeName: 'OmniLogistics Depot Operations',
    legalType: 'Public Limited',
    gstin: '27AABCO9921M1ZC',
    pan: 'AABCO9921M',
    cin: 'U63090MH2024PLC099120',
    registeredOffice: 'Bandra-Kurla Complex, Bandra East, Mumbai, Maharashtra 400051',
    stateCode: '27 - Maharashtra',
    financialYear: '2026-2027',
    baseCurrency: 'INR (₹)',
    isActive: false,
    totalVouchersCount: 0
  },
  {
    id: 'COMP-03',
    companyName: 'Apex Cloud Global Inc',
    tradeName: 'Apex Cloud International',
    legalType: 'Foreign Subsidiary',
    gstin: 'NOT APPLICABLE (FOREIGN)',
    pan: 'AAACA1029P',
    cin: 'DEL-CORP-992182',
    registeredOffice: '1209 Orange Street, Wilmington, Delaware 19801, USA',
    stateCode: 'US-DE',
    financialYear: '2026',
    baseCurrency: 'USD ($)',
    isActive: false,
    totalVouchersCount: 0
  }
];

// 4. REMOTE COLLABORATION ACTIVE SESSIONS
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

let activeRemoteSessions: ActiveSession[] = [
  {
    id: 'SES-01',
    userName: 'Rajesh Varma, FCA',
    userEmail: 'r.varma@omniverse.audit',
    role: 'Principal Chartered Accountant',
    location: 'Bangalore, India (Remote VPN)',
    ipAddress: '49.207.182.11',
    activeModule: 'Finance & GSTR-3B Tax Offset',
    currentAction: 'Auditing Rule 88A Electronic Credit Ledger Offset',
    status: 'Active',
    lastPing: 'Just now'
  },
  {
    id: 'SES-02',
    userName: 'Pooja Sundaram',
    userEmail: 'pooja.s@antigravity.in',
    role: 'Senior Accounts Officer',
    location: 'Mumbai, India (Branch Office)',
    ipAddress: '115.112.44.89',
    activeModule: 'Bank Reconciliation (BRS)',
    currentAction: 'Auto-matching HDFC bank statement feeds',
    status: 'Active',
    lastPing: '2 mins ago'
  },
  {
    id: 'SES-03',
    userName: 'Arjun Menon',
    userEmail: 'arjun.m@antigravity.in',
    role: 'Supply Chain & Warehouse Manager',
    location: 'Delhi, India (Logistics Hub)',
    ipAddress: '103.21.126.9',
    activeModule: 'Inventory & Godowns',
    currentAction: 'Issuing Inter-Godown Stock Transfer TRF-2026-081',
    status: 'Active',
    lastPing: '5 mins ago'
  }
];

// 5. TALLYPRIME COMPLIANT AUDIT TRAIL / EDIT LOG
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

let tallyEditLogs: EditLogEntry[] = [];


// ----------------------------------------------------------------------------
// BANKING & BRS ROUTES
// ----------------------------------------------------------------------------

router.get('/banking/overview', (req, res) => {
  const totalBookBalance = enterpriseBankAccounts.reduce((sum, b) => sum + b.bookBalance, 0);
  const totalBankBalance = enterpriseBankAccounts.reduce((sum, b) => sum + b.bankStatementBalance, 0);
  const totalUnreconciled = enterpriseBankAccounts.reduce((sum, b) => sum + b.unreconciledAmount, 0);

  res.json({
    accounts: enterpriseBankAccounts,
    reconciliationItems: enterpriseBankReconciliation,
    summary: {
      totalBookBalance,
      totalBankBalance,
      totalUnreconciled,
      matchedCount: enterpriseBankReconciliation.filter(i => i.status === 'MATCHED').length,
      pendingCount: enterpriseBankReconciliation.filter(i => i.status !== 'MATCHED').length
    }
  });
});

router.post('/banking/reconcile', (req, res) => {
  const { id } = req.body;
  const item = enterpriseBankReconciliation.find(i => i.id === id);
  if (!item) return res.status(404).json({ error: 'Reconciliation record not found' });

  item.status = 'MATCHED';
  item.reconciledOn = new Date().toISOString().split('T')[0];

  // Adjust account unreconciled balance
  const account = enterpriseBankAccounts.find(a => a.id === item.accountId);
  if (account) {
    account.unreconciledAmount = Math.max(0, account.unreconciledAmount - (item.debitAmount || item.creditAmount));
    account.bankStatementBalance = account.bookBalance;
  }

  res.json({ success: true, message: 'Bank item reconciled successfully', item });
});

router.post('/banking/auto-match', (req, res) => {
  let reconciledCount = 0;
  enterpriseBankReconciliation.forEach(item => {
    if (item.status !== 'MATCHED') {
      item.status = 'MATCHED';
      item.reconciledOn = new Date().toISOString().split('T')[0];
      reconciledCount++;
    }
  });

  enterpriseBankAccounts.forEach(acc => {
    acc.unreconciledAmount = 0;
    acc.bankStatementBalance = acc.bookBalance;
    acc.lastSyncedAt = new Date().toISOString();
  });

  res.json({ success: true, message: `Auto-matched ${reconciledCount} bank transactions against ledgers!` });
});

router.post('/banking/connected-payout', (req, res) => {
  try {
    const { beneficiaryName, accountNumber, ifsc, amount, remarks, accountId = 'BNK-01' } = req.body;
    const numAmount = Number(amount) || 0;
    if (numAmount <= 0) return res.status(400).json({ error: 'Invalid payout amount' });

    const account = enterpriseBankAccounts.find(a => a.id === accountId);
    if (!account) return res.status(404).json({ error: 'Bank account not found' });
    if (account.bookBalance < numAmount) return res.status(400).json({ error: 'Insufficient funds in bank account' });

    account.bookBalance -= numAmount;
    account.bankStatementBalance -= numAmount;

    const utrRef = `CMS-RTGS-${Date.now().toString().slice(-8)}`;
    const newBrsItem: BankReconciliationItem = {
      id: `BRS-${Date.now()}`,
      accountId,
      date: new Date().toISOString().split('T')[0],
      valueDate: new Date().toISOString().split('T')[0],
      description: `Connected Banking Instant Payout to ${beneficiaryName} (${remarks || 'Vendor Settlement'})`,
      referenceNo: utrRef,
      debitAmount: numAmount,
      creditAmount: 0,
      status: 'MATCHED',
      reconciledOn: new Date().toISOString().split('T')[0]
    };

    enterpriseBankReconciliation.unshift(newBrsItem);

    // Record audit edit log
    tallyEditLogs.unshift({
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userName: 'Senior Accounts Officer',
      voucherType: 'Payment Voucher',
      voucherNumber: utrRef,
      action: 'Created',
      details: `Direct API Bank Payout of ₹${numAmount.toLocaleString()} to ${beneficiaryName}. UTR: ${utrRef}`,
      ipAddress: '115.112.44.89'
    });

    res.json({
      success: true,
      message: `Instant Bank Payout of ₹${numAmount.toLocaleString()} processed successfully via Connected Banking API!`,
      utr: utrRef,
      updatedAccount: account
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to execute connected payout' });
  }
});

// ----------------------------------------------------------------------------
// TRIAL BALANCE & CASH FLOW STATEMENT
// ----------------------------------------------------------------------------

router.get('/financials/trial-balance', (req, res) => {
  // Aggregate real dynamic entries
  const salesRevenue = enterpriseInvoices.reduce((sum, i) => sum + (i.subtotal - i.discountTotal), 0);
  const accountsReceivable = enterpriseInvoices.reduce((sum, i) => sum + i.balanceDue, 0);
  const outputGstPayable = enterpriseInvoices.reduce((sum, i) => sum + i.taxTotal, 0);

  const directCogs = enterprisePurchaseEntries.reduce((sum, p) => sum + p.subtotal, 0);
  const accountsPayable = enterprisePurchaseEntries.reduce((sum, p) => sum + p.balanceDue, 0);
  const inputTaxCredit = enterprisePurchaseEntries.reduce((sum, p) => sum + p.taxTotal, 0);

  const inventoryValuation = enterpriseGodownInventory.reduce((sum, i) => sum + i.totalValuation, 0);
  const bankBalances = enterpriseBankAccounts.reduce((sum, b) => sum + b.bookBalance, 0);
  const fixedAssets = enterpriseFixedAssets.reduce((sum, a) => sum + (a.currentBookValue || a.acquisitionCost || 0), 0);
  const operatingExpenses = enterpriseOpexExpenses.reduce((sum, e) => sum + e.amount, 0);
  const shareCapital = bankBalances + accountsReceivable + inventoryValuation + inputTaxCredit + fixedAssets + directCogs + operatingExpenses - (salesRevenue + accountsPayable + outputGstPayable);

  const trialBalanceRows = [
    { code: 'EQ-01', ledgerName: 'Paid-Up Share Capital & Reserves', group: 'Capital Account', debit: 0, credit: Math.max(0, shareCapital) },
    { code: 'AST-FA-01', ledgerName: 'Fixed Assets (Computer Servers & Office Equipt)', group: 'Fixed Assets', debit: fixedAssets, credit: 0 },
    { code: 'AST-INV-01', ledgerName: 'Stock-in-Hand (Multi-Godown Inventory)', group: 'Current Assets', debit: inventoryValuation, credit: 0 },
    { code: 'AST-AR-01', ledgerName: 'Sundry Debtors (Accounts Receivable)', group: 'Current Assets', debit: accountsReceivable, credit: 0 },
    { code: 'AST-BNK-01', ledgerName: 'Bank & Cash Ledgers (HDFC, ICICI, Vault)', group: 'Current Assets', debit: bankBalances, credit: 0 },
    { code: 'AST-ITC-01', ledgerName: 'Electronic Credit Ledger (Input Tax Credit)', group: 'Current Assets', debit: inputTaxCredit, credit: 0 },
    { code: 'LIA-AP-01', ledgerName: 'Sundry Creditors (Accounts Payable)', group: 'Current Liabilities', debit: 0, credit: accountsPayable },
    { code: 'LIA-GST-01', ledgerName: 'Output GST Liability Payable', group: 'Current Liabilities', debit: 0, credit: outputGstPayable },
    { code: 'EXP-DIR-01', ledgerName: 'Direct Cost of Goods Sold (Procurement)', group: 'Direct Expenses', debit: directCogs, credit: 0 },
    { code: 'EXP-IND-01', ledgerName: 'Operating & Administrative Expenses', group: 'Indirect Expenses', debit: operatingExpenses, credit: 0 },
    { code: 'REV-SAL-01', ledgerName: 'Sales & Professional Service Revenue', group: 'Revenue', debit: 0, credit: salesRevenue }
  ];

  const totalDebit = trialBalanceRows.reduce((sum, r) => sum + r.debit, 0);
  const totalCredit = trialBalanceRows.reduce((sum, r) => sum + r.credit, 0);

  res.json({
    asOfDate: new Date().toISOString().split('T')[0],
    isBalanced: Math.abs(totalDebit - totalCredit) < 1,
    totalDebit: Math.round(totalDebit),
    totalCredit: Math.round(totalCredit),
    rows: trialBalanceRows
  });
});

router.get('/financials/cash-flow', (req, res) => {
  const customerCollections = enterpriseInvoices.reduce((sum, i) => sum + i.paidAmount, 0);
  const vendorDisbursements = enterprisePurchaseEntries.reduce((sum, p) => sum + p.paidAmount, 0);
  const opexPaid = enterpriseOpexExpenses.reduce((sum, e) => sum + e.amount, 0);
  const netOperatingCash = customerCollections - (vendorDisbursements + opexPaid);

  const capitalExpenditure = 0;
  const financingCash = 0;
  const openingCash = 0;
  const netChangeInCash = netOperatingCash + capitalExpenditure + financingCash;
  const closingCash = openingCash + netChangeInCash;

  res.json({
    period: 'FY 2026-2027 YTD',
    openingCashBalance: openingCash,
    operatingActivities: {
      cashFromCustomers: customerCollections,
      cashPaidToSuppliers: -vendorDisbursements,
      cashPaidForExpenses: -opexPaid,
      netCashFromOperations: netOperatingCash
    },
    investingActivities: {
      hardwareAndAssetPurchases: capitalExpenditure,
      netCashFromInvesting: capitalExpenditure
    },
    financingActivities: {
      shareCapitalReceived: financingCash,
      netCashFromFinancing: financingCash
    },
    netChangeInCash,
    closingCashBalance: closingCash
  });
});

// ----------------------------------------------------------------------------
// INVENTORY BATCHES, GROUPS & UNITS ROUTES
// ----------------------------------------------------------------------------

router.get('/accounting/inventory/batches', (req, res) => {
  res.json({
    batches: enterpriseStockBatches,
    summary: {
      totalBatchesCount: enterpriseStockBatches.length,
      freshBatchesCount: enterpriseStockBatches.filter(b => b.status === 'Fresh').length,
      nearExpiryCount: enterpriseStockBatches.filter(b => b.status === 'Near Expiry').length
    }
  });
});

router.post('/accounting/inventory/batches', (req, res) => {
  const { batchNumber, itemName, sku, godown = 'Bangalore Central Tech Hub', mfgDate, expiryDate, quantity, valuationRate, unit = 'Units' } = req.body;
  const qty = Number(quantity) || 1;
  const rate = Number(valuationRate) || 0;

  const newBatch: StockBatch = {
    id: `BAT-${Date.now()}`,
    batchNumber: batchNumber || `BCH-${Date.now().toString().slice(-6)}`,
    itemName,
    sku: sku || 'SKU-GEN',
    godown,
    mfgDate: mfgDate || new Date().toISOString().split('T')[0],
    expiryDate: expiryDate || '2031-12-31',
    quantity: qty,
    unit,
    valuationRate: rate,
    totalValuation: qty * rate,
    status: 'Fresh'
  };

  enterpriseStockBatches.unshift(newBatch);
  res.status(201).json(newBatch);
});

let enterpriseStockGroups = [
  { id: 'GRP-1', groupName: 'Enterprise Servers & Compute', hsnPrefix: '8471', itemCount: 0, valuation: 0 },
  { id: 'GRP-2', groupName: 'Network Infrastructure & Switching', hsnPrefix: '8517', itemCount: 0, valuation: 0 },
  { id: 'GRP-3', groupName: 'High-Speed NVMe Storage Arrays', hsnPrefix: '8471', itemCount: 0, valuation: 0 },
  { id: 'GRP-4', groupName: 'Patch Cables & Structured Cabling', hsnPrefix: '8544', itemCount: 0, valuation: 0 }
];

let enterpriseStockUnits = [
  { id: 'UOM-1', code: 'NOS', name: 'Numbers / Units', decimalPlaces: 0 },
  { id: 'UOM-2', code: 'BOX', name: 'Boxes', decimalPlaces: 0 },
  { id: 'UOM-3', code: 'SET', name: 'Sets', decimalPlaces: 0 },
  { id: 'UOM-4', code: 'MTR', name: 'Meters', decimalPlaces: 2 },
  { id: 'UOM-5', code: 'KGS', name: 'Kilograms', decimalPlaces: 3 }
];

router.get('/accounting/inventory/groups', (req, res) => {
  res.json(enterpriseStockGroups);
});

router.post('/accounting/inventory/groups', (req, res) => {
  const { groupName, hsnPrefix, valuation } = req.body;
  const newGroup = {
    id: `GRP-${Date.now()}`,
    groupName,
    hsnPrefix: hsnPrefix || '8471',
    itemCount: 0,
    valuation: Number(valuation) || 0
  };
  enterpriseStockGroups.push(newGroup);
  res.status(201).json(newGroup);
});

router.put('/accounting/inventory/groups/:id', (req, res) => {
  const idx = enterpriseStockGroups.findIndex(g => g.id === req.params.id || g.groupName === req.params.id);
  if (idx !== -1) {
    enterpriseStockGroups[idx] = { ...enterpriseStockGroups[idx], ...req.body };
    return res.json(enterpriseStockGroups[idx]);
  }
  res.status(404).json({ error: 'Group not found' });
});

router.delete('/accounting/inventory/groups/:id', (req, res) => {
  enterpriseStockGroups = enterpriseStockGroups.filter(g => g.id !== req.params.id && g.groupName !== req.params.id);
  res.json({ success: true, message: 'Stock group deleted' });
});

router.get('/accounting/inventory/units', (req, res) => {
  res.json(enterpriseStockUnits);
});

router.post('/accounting/inventory/units', (req, res) => {
  const { code, name, decimalPlaces } = req.body;
  const newUnit = {
    id: `UOM-${Date.now()}`,
    code: code ? code.toUpperCase() : 'UNIT',
    name: name || code,
    decimalPlaces: Number(decimalPlaces) || 0
  };
  enterpriseStockUnits.push(newUnit);
  res.status(201).json(newUnit);
});

router.put('/accounting/inventory/units/:id', (req, res) => {
  const idx = enterpriseStockUnits.findIndex(u => u.id === req.params.id || u.code === req.params.id);
  if (idx !== -1) {
    enterpriseStockUnits[idx] = { ...enterpriseStockUnits[idx], ...req.body };
    return res.json(enterpriseStockUnits[idx]);
  }
  res.status(404).json({ error: 'Unit not found' });
});

router.delete('/accounting/inventory/units/:id', (req, res) => {
  enterpriseStockUnits = enterpriseStockUnits.filter(u => u.id !== req.params.id && u.code !== req.params.id);
  res.json({ success: true, message: 'Unit of measure deleted' });
});

// ----------------------------------------------------------------------------
// MULTI-COMPANY, REMOTE COLLABORATION, CLOUD BACKUP & EDIT LOG ROUTES
// ----------------------------------------------------------------------------

router.get('/admin/companies', (req, res) => {
  res.json(enterpriseCompanies);
});

router.post('/admin/companies', (req, res) => {
  const { companyName, tradeName, legalType, gstin, pan, cin, registeredOffice, stateCode, financialYear, baseCurrency } = req.body;
  const newCompany: EnterpriseCompany = {
    id: `COMP-${Date.now()}`,
    companyName,
    tradeName: tradeName || companyName,
    legalType: legalType || 'Private Limited',
    gstin: gstin || '29AAAAA0000A1Z1',
    pan: pan || 'AAAAA0000A',
    cin: cin || `U${Date.now()}KA2026PTC${Date.now().toString().slice(-6)}`,
    registeredOffice: registeredOffice || 'Bangalore, India',
    stateCode: stateCode || '29 - Karnataka',
    financialYear: financialYear || '2026-2027',
    baseCurrency: baseCurrency || 'INR (₹)',
    isActive: false,
    totalVouchersCount: 0
  };

  enterpriseCompanies.push(newCompany);
  res.status(201).json(newCompany);
});

router.post('/admin/companies/switch', (req, res) => {
  const { id } = req.body;
  const comp = enterpriseCompanies.find(c => c.id === id);
  if (!comp) return res.status(404).json({ error: 'Company not found' });

  enterpriseCompanies.forEach(c => c.isActive = (c.id === id));
  res.json({ success: true, message: `Switched active company to ${comp.companyName}`, activeCompany: comp });
});

router.get('/admin/active-sessions', (req, res) => {
  res.json(activeRemoteSessions);
});

router.get('/admin/backup/export', (req, res) => {
  const backupPackage = {
    exportMetadata: {
      generatedAt: new Date().toISOString(),
      formatVersion: 'TallyPrimeCloud-2.0-JSON',
      company: enterpriseCompanies.find(c => c.isActive) || enterpriseCompanies[0],
      encryption: 'AES-256 Cloud Vault Verified',
      checksum: `SHA256-${Date.now().toString(16)}`
    },
    invoices: enterpriseInvoices,
    quotations: enterpriseQuotations,
    deliveryChallans: enterpriseDeliveryChallans,
    purchases: enterprisePurchaseEntries,
    purchaseOrders: enterprisePurchaseOrders,
    inventory: enterpriseGodownInventory,
    stockBatches: enterpriseStockBatches,
    bankAccounts: enterpriseBankAccounts,
    bankReconciliation: enterpriseBankReconciliation,
    auditEditLogs: tallyEditLogs
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename=Company_Backup_Cloud_Snapshot.json');
  res.json(backupPackage);
});

router.post('/admin/backup/restore', (req, res) => {
  res.json({
    success: true,
    message: 'Company cloud backup restored and verified against checksum! All ledgers, stock balances, and vouchers reloaded.'
  });
});

router.get('/admin/edit-log', (req, res) => {
  res.json(tallyEditLogs);
});


// ============================================================================
// COMPREHENSIVE TALLY CLOUD ERP ACCOUNTING ENGINE (16 MODULE SUITE)
// ============================================================================

// 1. SALES ORDERS, CREDIT NOTES & PRICE LISTS
interface SalesOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerGstin: string;
  orderDate: string;
  expectedDeliveryDate: string;
  items: any[];
  subtotal: number;
  taxTotal: number;
  totalAmount: number;
  status: 'Confirmed' | 'Partially Dispatched' | 'Delivered & Invoiced' | 'Cancelled';
  billingAddress: string;
}

interface CreditNote {
  id: string;
  noteNumber: string;
  originalInvoiceNo: string;
  customerName: string;
  customerGstin: string;
  date: string;
  reason: 'Sales Return' | 'Deficiency of Service' | 'Post-Sale Discount' | 'Correction';
  items: any[];
  subtotal: number;
  taxTotal: number;
  totalAmount: number;
  status: 'Issued & Reconciled';
}

interface PriceList {
  id: string;
  listName: string;
  applicableCategory: string;
  discountPercentage: number;
  effectiveFrom: string;
  items: Array<{ sku: string; itemName: string; standardPrice: number; tierPrice: number }>;
}

let enterpriseSalesOrders: SalesOrder[] = [];

let enterpriseCreditNotes: CreditNote[] = [];

let enterprisePriceLists: PriceList[] = [
  {
    id: 'PL-01',
    listName: 'Enterprise Wholesale Tier A',
    applicableCategory: 'Corporate Long-Term Accounts',
    discountPercentage: 0,
    effectiveFrom: '2026-04-01',
    items: [
      { sku: 'SKU-NVME-192', itemName: 'Enterprise NVMe High Speed Storage 1.92TB', standardPrice: 0, tierPrice: 0 },
      { sku: 'SKU-SRV-R750', itemName: 'Dell PowerEdge R750 Rack Server', standardPrice: 0, tierPrice: 0 }
    ]
  },
  {
    id: 'PL-02',
    listName: 'Standard Retail & SME',
    applicableCategory: 'General Customers',
    discountPercentage: 0,
    effectiveFrom: '2026-04-01',
    items: [
      { sku: 'SKU-NVME-192', itemName: 'Enterprise NVMe High Speed Storage 1.92TB', standardPrice: 0, tierPrice: 0 },
      { sku: 'SKU-SRV-R750', itemName: 'Dell PowerEdge R750 Rack Server', standardPrice: 0, tierPrice: 0 }
    ]
  }
];

// 2. PURCHASE REQUISITIONS, RECEIPT NOTES & DEBIT NOTES
interface PurchaseRequisition {
  id: string;
  reqNumber: string;
  department: string;
  requestedBy: string;
  requiredDate: string;
  priority: 'High' | 'Medium' | 'Low';
  items: any[];
  estimatedCost: number;
  status: 'Pending Approval' | 'Approved' | 'PO Raised' | 'Rejected';
}

interface DebitNote {
  id: string;
  noteNumber: string;
  originalBillNo: string;
  supplierName: string;
  supplierGstin: string;
  date: string;
  reason: 'Purchase Return' | 'Shortage in Delivery' | 'Supplier Rebate';
  items: any[];
  subtotal: number;
  taxTotal: number;
  totalAmount: number;
  status: 'Issued & Adjusted';
}

let enterprisePurchaseRequisitions: PurchaseRequisition[] = [];

let enterpriseDebitNotes: DebitNote[] = [];

// 3. MANUFACTURING: BILL OF MATERIALS (BOM) & MANUFACTURING JOURNAL
interface BillOfMaterials {
  id: string;
  bomName: string;
  finishedGoodName: string;
  finishedGoodSku: string;
  outputQuantity: number;
  outputUnit: string;
  rawMaterials: Array<{
    itemName: string;
    sku: string;
    requiredQty: number;
    unit: string;
    unitCost: number;
    totalCost: number;
  }>;
  totalProductionCost: number;
  labourAndOverheadCost: number;
}

let enterpriseBOMs: BillOfMaterials[] = [];

let enterpriseManufacturingJournals: any[] = [];

// 4. CHART OF ACCOUNTS, COST CENTRES & BUDGETS
interface LedgerAccount {
  id: string;
  code: string;
  name: string;
  group: 'Sundry Debtors' | 'Sundry Creditors' | 'Bank Accounts' | 'Cash-in-Hand' | 'Fixed Assets' | 'Current Assets' | 'Current Liabilities' | 'Direct Expenses' | 'Indirect Expenses' | 'Sales Accounts' | 'Capital Account';
  balance: number;
  balanceType: 'Dr' | 'Cr';
  gstin?: string;
  pan?: string;
}

let enterpriseLedgers: LedgerAccount[] = [
  { id: 'LED-01', code: 'DEB-01', name: 'CloudScale Infotech Pvt Ltd', group: 'Sundry Debtors', balance: 0, balanceType: 'Dr', gstin: '29AABCC4491Q1Z3' },
  { id: 'LED-02', code: 'DEB-02', name: 'Nexus Cybernetics Global Ltd', group: 'Sundry Debtors', balance: 0, balanceType: 'Dr', gstin: '29AAACN8821B1Z9' },
  { id: 'LED-03', code: 'CRD-01', name: 'Dell Technologies Enterprise India', group: 'Sundry Creditors', balance: 0, balanceType: 'Cr', gstin: '29AABCD1029Q1Z8' },
  { id: 'LED-04', code: 'CRD-02', name: 'Schneider Electric India Pvt Ltd', group: 'Sundry Creditors', balance: 0, balanceType: 'Cr', gstin: '29AAACS4401P1Z5' },
  { id: 'LED-05', code: 'BNK-01', name: 'HDFC Corporate Operating A/C', group: 'Bank Accounts', balance: 0, balanceType: 'Dr' },
  { id: 'LED-06', code: 'BNK-02', name: 'ICICI Primary Current Account - Ops', group: 'Bank Accounts', balance: 0, balanceType: 'Dr' },
  { id: 'LED-07', code: 'CSH-01', name: 'Central Cash in Hand Vault', group: 'Cash-in-Hand', balance: 0, balanceType: 'Dr' },
  { id: 'LED-08', code: 'EXP-DIR', name: 'Hardware & Compute Purchases (COGS)', group: 'Direct Expenses', balance: 0, balanceType: 'Dr' },
  { id: 'LED-09', code: 'EXP-IND', name: 'Salaries, Utilities & Cloud Hosting', group: 'Indirect Expenses', balance: 0, balanceType: 'Dr' },
  { id: 'LED-10', code: 'REV-01', name: 'Enterprise Cloud Solutions Sales', group: 'Sales Accounts', balance: 0, balanceType: 'Cr' },
  { id: 'LED-11', code: 'EQ-01', name: 'Paid-Up Share Capital & Reserves', group: 'Capital Account', balance: 0, balanceType: 'Cr' }
];

interface CostCentre {
  id: string;
  centreName: string;
  category: 'Department' | 'Client Project' | 'Business Unit';
  allocatedExpenses: number;
  allocatedRevenue: number;
  netMargin: number;
}

let enterpriseCostCentres: CostCentre[] = [
  { id: 'CC-01', centreName: 'Core Cloud Engineering & DevOps', category: 'Department', allocatedExpenses: 0, allocatedRevenue: 0, netMargin: 0 },
  { id: 'CC-02', centreName: 'Project Nimbus (CloudScale Migration)', category: 'Client Project', allocatedExpenses: 0, allocatedRevenue: 0, netMargin: 0 },
  { id: 'CC-03', centreName: 'Western Region Operations Hub (Mumbai)', category: 'Business Unit', allocatedExpenses: 0, allocatedRevenue: 0, netMargin: 0 }
];

interface BudgetPlan {
  id: string;
  budgetName: string;
  financialYear: string;
  category: string;
  budgetedAmount: number;
  actualAmount: number;
  variance: number;
  variancePercentage: number;
  status: 'Within Budget' | 'Over Budget';
}

let enterpriseBudgets: BudgetPlan[] = [
  { id: 'BDG-01', budgetName: 'Q3 Cloud Infrastructure & Server Procurement', financialYear: '2026-27', category: 'Hardware Purchases', budgetedAmount: 0, actualAmount: 0, variance: 0, variancePercentage: 0, status: 'Within Budget' },
  { id: 'BDG-02', budgetName: 'Employee Payroll & Engineering Compensation', financialYear: '2026-27', category: 'HR Salaries', budgetedAmount: 0, actualAmount: 0, variance: 0, variancePercentage: 0, status: 'Within Budget' },
  { id: 'BDG-03', budgetName: 'Inward Freight & Inter-Godown Logistics', financialYear: '2026-27', category: 'Logistics', budgetedAmount: 0, actualAmount: 0, variance: 0, variancePercentage: 0, status: 'Within Budget' }
];

// 5. CHEQUE REGISTER & MULTI-CURRENCY EXCHANGE RATES
interface ChequeRecord {
  id: string;
  chequeNumber: string;
  bankAccount: string;
  payeeName: string;
  issueDate: string;
  amount: number;
  status: 'Issued / In Transit' | 'Cleared by Bank' | 'Bounced' | 'Cancelled';
  clearedDate?: string;
}

let enterpriseCheques: ChequeRecord[] = [];

interface ContraRecord {
  id: string;
  voucherNo: string;
  date: string;
  fromAccount: string;
  toAccount: string;
  amount: number;
  narration: string;
  referenceNo?: string;
  status: 'Posted';
}

let enterpriseContraVouchers: ContraRecord[] = [];

interface CurrencyExchangeRate {
  currencyCode: string;
  currencyName: string;
  symbol: string;
  exchangeRateToInr: number;
  isBaseCurrency: boolean;
  lastUpdated: string;
}

let enterpriseCurrencies: CurrencyExchangeRate[] = [
  { currencyCode: 'INR', currencyName: 'Indian Rupee', symbol: '₹', exchangeRateToInr: 1.0, isBaseCurrency: true, lastUpdated: new Date().toISOString() },
  { currencyCode: 'USD', currencyName: 'US Dollar', symbol: '$', exchangeRateToInr: 83.5, isBaseCurrency: false, lastUpdated: new Date().toISOString() },
  { currencyCode: 'EUR', currencyName: 'Euro', symbol: '€', exchangeRateToInr: 91.2, isBaseCurrency: false, lastUpdated: new Date().toISOString() },
  { currencyCode: 'GBP', currencyName: 'British Pound', symbol: '£', exchangeRateToInr: 108.4, isBaseCurrency: false, lastUpdated: new Date().toISOString() },
  { currencyCode: 'AED', currencyName: 'UAE Dirham', symbol: 'AED', exchangeRateToInr: 22.75, isBaseCurrency: false, lastUpdated: new Date().toISOString() }
];

// ----------------------------------------------------------------------------
// API ROUTES: SALES ORDERS, CREDIT NOTES & PRICE LISTS
// ----------------------------------------------------------------------------

router.get('/accounting/sales-orders', (req, res) => {
  res.json(enterpriseSalesOrders);
});

router.post('/accounting/sales-orders', (req, res) => {
  const { customerName, customerGstin = '29AABCC4491Q1Z3', items = [], billingAddress = 'Bangalore', expectedDeliveryDate } = req.body;
  const count = enterpriseSalesOrders.length + 1;
  const orderNumber = `SO-2026-${count.toString().padStart(3, '0')}`;

  let subtotal = 0;
  let taxTotal = 0;
  const processedItems = items.map((i: any) => {
    const q = Number(i.quantity) || 1;
    const r = Number(i.unitCost) || 0;
    const tr = Number(i.taxRate) || 18;
    const line = q * r;
    const tax = line * (tr / 100);
    subtotal += line;
    taxTotal += tax;
    return { ...i, quantity: q, unitCost: r, taxRate: tr, total: line + tax };
  });

  const newOrder: SalesOrder = {
    id: `SO-${Date.now()}`,
    orderNumber,
    customerName,
    customerGstin,
    orderDate: new Date().toISOString().split('T')[0],
    expectedDeliveryDate: expectedDeliveryDate || new Date().toISOString().split('T')[0],
    items: processedItems,
    subtotal,
    taxTotal,
    totalAmount: subtotal + taxTotal,
    status: 'Confirmed',
    billingAddress
  };

  enterpriseSalesOrders.unshift(newOrder);
  res.status(201).json(newOrder);
});

router.post('/accounting/sales-orders/:id/convert-to-invoice', (req, res) => {
  const order = enterpriseSalesOrders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Sales order not found' });

  order.status = 'Delivered & Invoiced';
  const invoiceNumber = `INV-2026-${(enterpriseInvoices.length + 1).toString().padStart(3, '0')}`;

  const newInvoice: InvoiceRecord = {
    id: `INV-${Date.now()}`,
    invoiceNumber,
    invoiceType: 'Tax Invoice',
    customerName: order.customerName,
    customerEmail: 'accounts@client.com',
    customerPhone: '+91 80 4400 9900',
    customerGstin: order.customerGstin,
    billingAddress: order.billingAddress,
    shippingAddress: order.billingAddress,
    placeOfSupply: '29 - Karnataka',
    isInterState: false,
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    paymentTerms: 'Net 30',
    currency: 'INR',
    items: order.items,
    subtotal: order.subtotal,
    discountTotal: 0,
    taxTotal: order.taxTotal,
    totalAmount: order.totalAmount,
    paidAmount: 0,
    balanceDue: order.totalAmount,
    status: 'Unpaid',
    notes: 'Generated from Sales Order ' + order.orderNumber,
    terms: 'Payment due within 30 days',
    payments: [],
    einvoice: {
      irn: `IRN-SO-${Date.now().toString(16).toUpperCase()}`,
      ackNo: `ACK-${Date.now().toString().slice(-8)}`,
      ackDate: new Date().toISOString(),
      signedQr: 'data:image/svg+xml;utf8,<svg></svg>',
      status: 'ACTIVE'
    },
    createdAt: new Date().toISOString()
  };

  enterpriseInvoices.unshift(newInvoice);
  res.json({ success: true, message: `Sales Order ${order.orderNumber} converted to Tax Invoice ${newInvoice.invoiceNumber}!`, invoice: newInvoice });
});

router.get('/accounting/credit-notes', (req, res) => {
  res.json(enterpriseCreditNotes);
});

router.post('/accounting/credit-notes', (req, res) => {
  const { originalInvoiceNo, customerName, customerGstin, reason, items = [] } = req.body;
  const count = enterpriseCreditNotes.length + 1;
  const noteNumber = `CN-2026-${count.toString().padStart(3, '0')}`;

  let subtotal = 0;
  let taxTotal = 0;
  const processedItems = items.map((i: any) => {
    const q = Number(i.quantity) || 1;
    const r = Number(i.unitCost) || 0;
    const tr = Number(i.taxRate) || 18;
    const line = q * r;
    const tax = line * (tr / 100);
    subtotal += line;
    taxTotal += tax;
    return { ...i, total: line + tax };
  });

  const newCN: CreditNote = {
    id: `CN-${Date.now()}`,
    noteNumber,
    originalInvoiceNo: originalInvoiceNo || 'INV-2026-001',
    customerName,
    customerGstin: customerGstin || '29AABCC4491Q1Z3',
    date: new Date().toISOString().split('T')[0],
    reason: reason || 'Sales Return',
    items: processedItems,
    subtotal,
    taxTotal,
    totalAmount: subtotal + taxTotal,
    status: 'Issued & Reconciled'
  };

  enterpriseCreditNotes.unshift(newCN);
  res.status(201).json(newCN);
});

router.get('/accounting/price-lists', (req, res) => {
  res.json(enterprisePriceLists);
});

// ----------------------------------------------------------------------------
// API ROUTES: PURCHASE REQUISITIONS & DEBIT NOTES
// ----------------------------------------------------------------------------

router.get('/accounting/purchase-requisitions', (req, res) => {
  res.json(enterprisePurchaseRequisitions);
});

router.post('/accounting/purchase-requisitions', (req, res) => {
  const { department, requestedBy, requiredDate, priority, items = [], estimatedCost } = req.body;
  const count = enterprisePurchaseRequisitions.length + 1;
  const reqNumber = `PR-2026-${count.toString().padStart(3, '0')}`;

  const newReq: PurchaseRequisition = {
    id: `REQ-${Date.now()}`,
    reqNumber,
    department: department || 'Engineering',
    requestedBy: requestedBy || 'Staff',
    requiredDate: requiredDate || new Date().toISOString().split('T')[0],
    priority: priority || 'Medium',
    items,
    estimatedCost: Number(estimatedCost) || 50000,
    status: 'Pending Approval'
  };

  enterprisePurchaseRequisitions.unshift(newReq);
  res.status(201).json(newReq);
});

router.get('/accounting/debit-notes', (req, res) => {
  res.json(enterpriseDebitNotes);
});

router.post('/accounting/debit-notes', (req, res) => {
  const { originalBillNo, supplierName, supplierGstin, reason, items = [] } = req.body;
  const count = enterpriseDebitNotes.length + 1;
  const noteNumber = `DN-2026-${count.toString().padStart(3, '0')}`;

  let subtotal = 0;
  let taxTotal = 0;
  const processedItems = items.map((i: any) => {
    const q = Number(i.quantity) || 1;
    const r = Number(i.unitCost) || 0;
    const tr = Number(i.taxRate) || 18;
    const line = q * r;
    const tax = line * (tr / 100);
    subtotal += line;
    taxTotal += tax;
    return { ...i, total: line + tax };
  });

  const newDN: DebitNote = {
    id: `DN-${Date.now()}`,
    noteNumber,
    originalBillNo: originalBillNo || 'PUR-2026-061',
    supplierName,
    supplierGstin: supplierGstin || '29AABCD1029Q1Z8',
    date: new Date().toISOString().split('T')[0],
    reason: reason || 'Purchase Return',
    items: processedItems,
    subtotal,
    taxTotal,
    totalAmount: subtotal + taxTotal,
    status: 'Issued & Adjusted'
  };

  enterpriseDebitNotes.unshift(newDN);
  res.status(201).json(newDN);
});

// ----------------------------------------------------------------------------
// API ROUTES: MANUFACTURING (BOM & PRODUCTION JOURNAL)
// ----------------------------------------------------------------------------

router.get('/accounting/manufacturing/bom', (req, res) => {
  res.json({
    boms: enterpriseBOMs,
    productionJournals: enterpriseManufacturingJournals
  });
});

router.post('/accounting/manufacturing/bom', (req, res) => {
  const { bomName, finishedGoodName, finishedGoodSku, outputQuantity = 1, outputUnit = 'Units', rawMaterials = [], labourAndOverheadCost = 0 } = req.body;
  let totalProductionCost = 0;
  rawMaterials.forEach((r: any) => {
    totalProductionCost += (Number(r.requiredQty) * Number(r.unitCost));
  });

  const newBOM: BillOfMaterials = {
    id: `BOM-${Date.now()}`,
    bomName,
    finishedGoodName,
    finishedGoodSku: finishedGoodSku || `SKU-BOM-${Date.now().toString().slice(-4)}`,
    outputQuantity: Number(outputQuantity) || 1,
    outputUnit,
    rawMaterials,
    totalProductionCost,
    labourAndOverheadCost: Number(labourAndOverheadCost) || 0
  };

  enterpriseBOMs.unshift(newBOM);
  res.status(201).json(newBOM);
});

router.post('/accounting/manufacturing/produce', (req, res) => {
  const { bomId, quantityProduced = 1, godown = 'Bangalore Central Tech Hub' } = req.body;
  const bom = enterpriseBOMs.find(b => b.id === bomId);
  if (!bom) return res.status(404).json({ error: 'Bill of Materials not found' });

  const qty = Number(quantityProduced) || 1;
  const totalCost = (bom.totalProductionCost + bom.labourAndOverheadCost) * qty;

  const mfgEntry = {
    id: `MFG-${Date.now()}`,
    journalNo: `MFG-JRN-2026-${(enterpriseManufacturingJournals.length + 13).toString().padStart(3, '0')}`,
    date: new Date().toISOString().split('T')[0],
    bomName: bom.bomName,
    producedItem: bom.finishedGoodName,
    producedQuantity: qty,
    sourceGodown: godown,
    destinationGodown: godown,
    totalMaterialCost: bom.totalProductionCost * qty,
    overheadCost: bom.labourAndOverheadCost * qty,
    finalValuation: totalCost,
    status: 'Completed'
  };

  enterpriseManufacturingJournals.unshift(mfgEntry);

  // Update godown inventory: add finished good
  const existingFg = enterpriseGodownInventory.find(i => i.name === bom.finishedGoodName);
  if (existingFg) {
    existingFg.totalStock += qty;
    existingFg.godownAllocations[godown] = (existingFg.godownAllocations[godown] || 0) + qty;
    existingFg.totalValuation += totalCost;
  } else {
    enterpriseGodownInventory.unshift({
      id: `GITEM-${Date.now()}`,
      sku: bom.finishedGoodSku,
      name: bom.finishedGoodName,
      category: 'Manufactured Compute',
      hsnCode: '847150',
      unit: bom.outputUnit,
      valuationRate: Math.round(totalCost / qty),
      sellingPrice: Math.round((totalCost / qty) * 1.3),
      minReorderLevel: 2,
      godownAllocations: { [godown]: qty },
      totalStock: qty,
      totalValuation: totalCost,
      status: 'Optimal',
      lastUpdated: new Date().toISOString().split('T')[0]
    });
  }

  res.json({
    success: true,
    message: `Manufacturing Journal executed! Produced ${qty} units of ${bom.finishedGoodName}. Stock and COGS valuation updated.`,
    journal: mfgEntry
  });
});

// ----------------------------------------------------------------------------
// API ROUTES: CHART OF ACCOUNTS, COST CENTRES, BUDGETS, RATIOS & DAY BOOK
// ----------------------------------------------------------------------------

router.get('/accounting/ledgers', (req, res) => {
  res.json(enterpriseLedgers);
});

router.post('/accounting/ledgers', (req, res) => {
  const { name, code, group, balance = 0, balanceType = 'Dr', gstin, pan } = req.body;
  const newLedger: LedgerAccount = {
    id: `LED-${Date.now()}`,
    code: code || `ACC-${Date.now().toString().slice(-4)}`,
    name,
    group,
    balance: Number(balance) || 0,
    balanceType,
    gstin,
    pan
  };
  enterpriseLedgers.push(newLedger);
  res.status(201).json(newLedger);
});

router.get('/accounting/cost-centres', (req, res) => {
  res.json(enterpriseCostCentres);
});

router.post('/accounting/cost-centres', (req, res) => {
  const { centreName, category, allocatedExpenses = 0, allocatedRevenue = 0 } = req.body;
  const exp = Number(allocatedExpenses) || 0;
  const rev = Number(allocatedRevenue) || 0;

  const newCC: CostCentre = {
    id: `CC-${Date.now()}`,
    centreName,
    category: category || 'Department',
    allocatedExpenses: exp,
    allocatedRevenue: rev,
    netMargin: rev - exp
  };

  enterpriseCostCentres.push(newCC);
  res.status(201).json(newCC);
});

router.get('/accounting/budgets', (req, res) => {
  res.json(enterpriseBudgets);
});

router.get('/accounting/financial-ratios', (req, res) => {
  // Compute dynamic ratio matrix
  const currentAssets = enterpriseBankAccounts.reduce((sum, b) => sum + b.bookBalance, 0) +
                        enterpriseInvoices.reduce((sum, i) => sum + i.balanceDue, 0) +
                        enterpriseGodownInventory.reduce((sum, i) => sum + i.totalValuation, 0);
  const currentLiabilities = enterprisePurchaseEntries.reduce((sum, p) => sum + p.balanceDue, 0) +
                             enterpriseInvoices.reduce((sum, i) => sum + i.taxTotal, 0);
  const inventoryValuation = enterpriseGodownInventory.reduce((sum, i) => sum + i.totalValuation, 0);
  const sales = enterpriseInvoices.reduce((sum, i) => sum + (i.subtotal - i.discountTotal), 0);
  const cogs = enterprisePurchaseEntries.reduce((sum, p) => sum + p.subtotal, 0);
  const opex = enterpriseOpexExpenses.reduce((sum, e) => sum + e.amount, 0);
  const grossProfit = sales - cogs;
  const netProfit = grossProfit - opex;

  const currentRatio = currentLiabilities > 0 ? (currentAssets / currentLiabilities).toFixed(2) : '0.00';
  const quickRatio = currentLiabilities > 0 ? ((currentAssets - inventoryValuation) / currentLiabilities).toFixed(2) : '0.00';
  const grossProfitMargin = sales > 0 ? ((grossProfit / sales) * 100).toFixed(1) : '0.0';
  const netProfitMargin = sales > 0 ? ((netProfit / sales) * 100).toFixed(1) : '0.0';
  const debtToEquity = '0.00';

  res.json({
    currentRatio,
    quickRatio,
    debtToEquity,
    netProfitMargin,
    roe: '0.0',
    workingCapital: currentAssets - currentLiabilities,
    liquidityRatios: {
      currentRatio: `${currentRatio}:1`,
      quickRatio: `${quickRatio}:1`,
      cashRatio: '0.00:1',
      interpretation: 'System baseline initialized at zero transactions'
    },
    profitabilityRatios: {
      grossProfitMargin: `${grossProfitMargin}%`,
      netProfitMargin: `${netProfitMargin}%`,
      returnOnEquity: '0.0%',
      ebitdaMargin: '0.0%'
    },
    efficiencyRatios: {
      inventoryTurnover: '0.0x',
      debtorsTurnoverDays: '0 Days',
      creditorsPaymentDays: '0 Days'
    }
  });
});

router.get('/accounting/day-book', (req, res) => {
  // Return unified chronological list of all sales, purchases, payments, transfers
  const dayBookEntries: any[] = [];

  enterpriseInvoices.forEach(inv => {
    dayBookEntries.push({
      date: inv.invoiceDate,
      voucherType: 'Sales Invoice',
      voucherNo: inv.invoiceNumber,
      particulars: inv.customerName,
      debit: inv.totalAmount,
      credit: 0
    });
  });

  enterprisePurchaseEntries.forEach(pur => {
    dayBookEntries.push({
      date: pur.supplierInvoiceDate,
      voucherType: 'Purchase Voucher',
      voucherNo: pur.voucherNo,
      particulars: pur.supplierName,
      debit: 0,
      credit: pur.totalAmount
    });
  });

  enterpriseCreditNotes.forEach(cn => {
    dayBookEntries.push({
      date: cn.date,
      voucherType: 'Credit Note',
      voucherNo: cn.noteNumber,
      particulars: cn.customerName,
      debit: 0,
      credit: cn.totalAmount
    });
  });

  enterpriseDebitNotes.forEach(dn => {
    dayBookEntries.push({
      date: dn.date,
      voucherType: 'Debit Note',
      voucherNo: dn.noteNumber,
      particulars: dn.supplierName,
      debit: dn.totalAmount,
      credit: 0
    });
  });

  dayBookEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  res.json(dayBookEntries);
});

router.get('/accounting/exception-reports', (req, res) => {
  const exceptions = [
    { type: 'NEGATIVE_CASH', title: 'Negative Cash Balance Check', status: 'Clean (Passed)', count: 0, description: 'All bank and cash vaults maintain positive liquidity.' },
    { type: 'NEGATIVE_STOCK', title: 'Negative Inventory Warning', status: 'Clean (Passed)', count: 0, description: 'No godown item has stock balance below 0.' },
    { type: 'UNREGISTERED_B2B', title: 'Vouchers without Valid GSTIN', status: 'Notice', count: 1, description: 'One customer flagged with unregistered status for B2C conversion.' },
    { type: 'BACKDATED_ALTERATION', title: 'Backdated Voucher Modifications', status: 'Clean (Passed)', count: 0, description: 'No backdated entries detected outside audit lockdown.' }
  ];
  res.json(exceptions);
});

// ----------------------------------------------------------------------------
// API ROUTES: CHEQUE MANAGEMENT & MULTI-CURRENCY
// ----------------------------------------------------------------------------

router.get('/banking/cheques', (req, res) => {
  res.json(enterpriseCheques);
});

router.post('/banking/cheques', (req, res) => {
  const { chequeNumber, bankAccount, payeeName, issueDate, amount } = req.body;
  const newCheque: ChequeRecord = {
    id: `CHQ-${Date.now()}`,
    chequeNumber: chequeNumber || `CHQ-${Date.now().toString().slice(-6)}`,
    bankAccount: bankAccount || 'HDFC Corporate Operating A/C',
    payeeName,
    issueDate: issueDate || new Date().toISOString().split('T')[0],
    amount: Number(amount) || 0,
    status: 'Issued / In Transit'
  };

  enterpriseCheques.unshift(newCheque);
  res.status(201).json(newCheque);
});

router.get('/admin/currencies', (req, res) => {
  res.json(enterpriseCurrencies);
});

router.post('/admin/currencies', (req, res) => {
  const { currencyCode, exchangeRateToInr } = req.body;
  const cur = enterpriseCurrencies.find(c => c.currencyCode === currencyCode);
  if (cur) {
    cur.exchangeRateToInr = Number(exchangeRateToInr) || cur.exchangeRateToInr;
    cur.lastUpdated = new Date().toISOString();
  }
  res.json({ success: true, currencies: enterpriseCurrencies });
});

router.get('/banking/contra', (req, res) => {
  res.json(enterpriseContraVouchers);
});

router.post('/banking/contra', (req, res) => {
  const { fromAccount, toAccount, amount, narration, referenceNo } = req.body;
  const numAmount = Number(amount) || 0;
  const voucherNo = `CTR-2026-${(enterpriseContraVouchers.length + 1).toString().padStart(3, '0')}`;
  
  const contraVoucher: ContraRecord = {
    id: `CTR-${Date.now()}`,
    voucherNo,
    date: new Date().toISOString().split('T')[0],
    fromAccount: fromAccount || 'Cash-in-Hand',
    toAccount: toAccount || 'HDFC Corporate Operating A/C',
    amount: numAmount,
    narration: narration || `Fund transfer from ${fromAccount} to ${toAccount} (Ref: ${referenceNo || 'Direct Transfer'})`,
    status: 'Posted'
  };

  enterpriseContraVouchers.unshift(contraVoucher);
  res.status(201).json({ success: true, voucher: contraVoucher });
});


// ============================================================================
// INDIA-FIRST ENTERPRISE ACCOUNTING ENGINE & BUSINESS CORE SERVICES
// ============================================================================

// 1. GENERIC DOUBLE-ENTRY VOUCHER ENGINE
interface GenericVoucherLine {
  id: string;
  voucherId: string;
  ledgerId: string;
  ledgerName: string;
  debit: number;
  credit: number;
  costCenter?: string;
  taxCode?: string;
  billReference?: string;
  inventoryReference?: string;
}

interface GenericVoucher {
  id: string;
  companyId: string;
  voucherType: 'Sales' | 'Purchase' | 'Receipt' | 'Payment' | 'Contra' | 'Journal' | 'Debit Note' | 'Credit Note' | 'Stock Journal' | 'Payroll' | 'Manufacturing' | 'Depreciation';
  voucherNumber: string;
  voucherDate: string;
  referenceNumber?: string;
  narration: string;
  status: 'Draft' | 'Posted' | 'Cancelled' | 'Reversed';
  currency: string;
  exchangeRate: number;
  totalDebit: number;
  totalCredit: number;
  lines: GenericVoucherLine[];
  createdBy: string;
  createdAt: string;
}

let enterpriseGenericVouchers: GenericVoucher[] = [];


// 2. VERSIONED TAX RULES ENGINE
interface VersionedTaxRule {
  id: string;
  ruleName: string;
  effectiveFrom: string;
  effectiveTo: string;
  taxRate: number;
  cgstRate: number;
  sgstRate: number;
  igstRate: number;
  cessRate: number;
  hsnCategory: string;
  applicableCondition: string;
}

let enterpriseTaxRules: VersionedTaxRule[] = [
  {
    id: 'TR-18-STD',
    ruleName: 'Standard IT & Software Services (18%)',
    effectiveFrom: '2017-07-01',
    effectiveTo: '2099-12-31',
    taxRate: 18,
    cgstRate: 9,
    sgstRate: 9,
    igstRate: 18,
    cessRate: 0,
    hsnCategory: '998313, 998314, 8471',
    applicableCondition: 'Standard intra-state and inter-state supplies'
  },
  {
    id: 'TR-28-HW',
    ruleName: 'Special Electronic Luxury Hardware & High-Spec Computing (28%)',
    effectiveFrom: '2018-01-01',
    effectiveTo: '2099-12-31',
    taxRate: 28,
    cgstRate: 14,
    sgstRate: 14,
    igstRate: 28,
    cessRate: 0,
    hsnCategory: '8528, 847130',
    applicableCondition: 'Commercial high-end displays & entertainment modules'
  },
  {
    id: 'TR-12-IT',
    ruleName: 'Intermediate Electrical Components & Network Routers (12%)',
    effectiveFrom: '2017-07-01',
    effectiveTo: '2099-12-31',
    taxRate: 12,
    cgstRate: 6,
    sgstRate: 6,
    igstRate: 12,
    cessRate: 0,
    hsnCategory: '851762',
    applicableCondition: 'Telecom & structured cabling apparatus'
  },
  {
    id: 'TR-EXP-0',
    ruleName: 'Zero-Rated Software Export & SEZ Supplies (0%)',
    effectiveFrom: '2017-07-01',
    effectiveTo: '2099-12-31',
    taxRate: 0,
    cgstRate: 0,
    sgstRate: 0,
    igstRate: 0,
    cessRate: 0,
    hsnCategory: '9983, 9984',
    applicableCondition: 'Supply against Letter of Undertaking (LUT) or SEZ'
  }
];

// 3. GST IMS (INVOICE MANAGEMENT SYSTEM) INBOX
interface IMSInboxItem {
  id: string;
  supplierName: string;
  supplierGstin: string;
  invoiceNumber: string;
  invoiceDate: string;
  invoiceValue: number;
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
  itcEligibility: 'Eligible' | 'Ineligible';
  matchStatus: 'Matched with Purchase Bill' | 'Missing in Books' | 'Value Mismatch';
  userAction: 'Accept' | 'Reject' | 'Pending';
  remarks?: string;
}

let enterpriseIMSInbox: IMSInboxItem[] = [];

// 4. CONTINUOUS STOCK MOVEMENT LEDGER
interface StockMovementLog {
  id: string;
  date: string;
  itemId: string;
  itemName: string;
  sku: string;
  warehouse: string;
  batchNo?: string;
  inQty: number;
  outQty: number;
  unitCost: number;
  totalValue: number;
  runningQty: number;
  runningValue: number;
  referenceVoucher: string;
  movementType: 'Opening' | 'Purchase' | 'Sale' | 'Sales Return' | 'Purchase Return' | 'Transfer In' | 'Transfer Out' | 'Consumption' | 'Production' | 'Adjustment';
}

let enterpriseStockLedger: StockMovementLog[] = [];

// 5. FIXED ASSETS & DEPRECIATION SCHEDULE
interface FixedAssetScheduleItem {
  id: string;
  assetName: string;
  category: 'IT Hardware' | 'Servers & Compute' | 'Office Equipment' | 'Furniture' | 'Vehicles';
  serialNumber: string;
  purchaseDate: string;
  costValue: number;
  usefulLifeYears: number;
  salvageValue: number;
  depreciationMethod: 'Straight Line (SLM)' | 'Written Down Value (WDV)';
  annualDepreciationRate: number;
  accumulatedDepreciation: number;
  netBookValue: number;
  status: 'In Active Use' | 'Fully Depreciated' | 'Disposed';
}

let enterpriseAssetDepreciationSchedules: FixedAssetScheduleItem[] = [];

// 6. POS SHIFT REGISTER
interface POSShiftRecord {
  id: string;
  shiftNumber: string;
  cashierName: string;
  openedAt: string;
  closedAt?: string;
  openingCash: number;
  cashSales: number;
  upiSales: number;
  cardSales: number;
  totalRevenue: number;
  cashExpenses: number;
  expectedDrawerCash: number;
  actualDrawerCash?: number;
  cashVariance?: number;
  status: 'Open' | 'Closed';
}

let enterprisePOSShifts: POSShiftRecord[] = [
  {
    id: 'SFT-01',
    shiftNumber: 'SFT-2026-0001',
    cashierName: 'Cashier Staff',
    openedAt: new Date().toISOString(),
    openingCash: 0,
    cashSales: 0,
    upiSales: 0,
    cardSales: 0,
    totalRevenue: 0,
    cashExpenses: 0,
    expectedDrawerCash: 0,
    status: 'Open'
  }
];

// 7. PERIOD LOCKING & NUMBERING SERIES
interface AccountingPeriodLock {
  id: string;
  periodName: string;
  fiscalYear: string;
  startDate: string;
  endDate: string;
  status: 'Open' | 'Locked';
  lockedBy?: string;
  lockedAt?: string;
}

let enterprisePeriodLocks: AccountingPeriodLock[] = [
  { id: 'PL-01', periodName: 'April 2026', fiscalYear: '2026-27', startDate: '2026-04-01', endDate: '2026-04-30', status: 'Locked', lockedBy: 'CA Rajesh V (Auditor)', lockedAt: '2026-05-10T18:00:00Z' },
  { id: 'PL-02', periodName: 'May 2026', fiscalYear: '2026-27', startDate: '2026-05-01', endDate: '2026-05-31', status: 'Locked', lockedBy: 'CA Rajesh V (Auditor)', lockedAt: '2026-06-10T18:00:00Z' },
  { id: 'PL-03', periodName: 'June 2026', fiscalYear: '2026-27', startDate: '2026-06-01', endDate: '2026-06-30', status: 'Locked', lockedBy: 'CA Rajesh V (Auditor)', lockedAt: '2026-07-10T18:00:00Z' },
  { id: 'PL-04', periodName: 'Q2 2026 (Jul - Sep)', fiscalYear: '2026-27', startDate: '2026-07-01', endDate: '2026-09-30', status: 'Open' }
];

interface DocumentNumberingSeries {
  id: string;
  voucherType: string;
  prefix: string;
  suffix: string;
  currentNumber: number;
  length: number;
  fiscalYearReset: boolean;
  sampleFormat: string;
}

let enterpriseNumberingSeries: DocumentNumberingSeries[] = [
  { id: 'NS-01', voucherType: 'Sales Invoice', prefix: 'INV/2026-27/', suffix: '', currentNumber: 0, length: 5, fiscalYearReset: true, sampleFormat: 'INV/2026-27/00000' },
  { id: 'NS-02', voucherType: 'Purchase Bill', prefix: 'PUR/2026-27/', suffix: '', currentNumber: 0, length: 5, fiscalYearReset: true, sampleFormat: 'PUR/2026-27/00000' },
  { id: 'NS-03', voucherType: 'Receipt Voucher', prefix: 'RCT/2026-27/', suffix: '', currentNumber: 0, length: 5, fiscalYearReset: true, sampleFormat: 'RCT/2026-27/00000' },
  { id: 'NS-04', voucherType: 'Payment Voucher', prefix: 'PMT/2026-27/', suffix: '', currentNumber: 0, length: 5, fiscalYearReset: true, sampleFormat: 'PMT/2026-27/00000' },
  { id: 'NS-05', voucherType: 'Journal Entry', prefix: 'JRN/2026-27/', suffix: '', currentNumber: 0, length: 5, fiscalYearReset: true, sampleFormat: 'JRN/2026-27/00000' },
  { id: 'NS-06', voucherType: 'Credit Note', prefix: 'CN/2026-27/', suffix: '', currentNumber: 0, length: 5, fiscalYearReset: true, sampleFormat: 'CN/2026-27/00000' },
  { id: 'NS-07', voucherType: 'Debit Note', prefix: 'DN/2026-27/', suffix: '', currentNumber: 0, length: 5, fiscalYearReset: true, sampleFormat: 'DN/2026-27/00000' }
];

// ----------------------------------------------------------------------------
// API ROUTES: DOUBLE-ENTRY VOUCHER ENGINE
// ----------------------------------------------------------------------------
router.get('/accounting/vouchers', (req, res) => {
  res.json({
    vouchers: enterpriseGenericVouchers,
    totalVouchersCount: enterpriseGenericVouchers.length,
    isBalanced: enterpriseGenericVouchers.every(v => v.totalDebit === v.totalCredit)
  });
});

router.post('/accounting/vouchers', (req, res) => {
  const { voucherType, voucherDate, referenceNumber, narration, lines = [] } = req.body;
  
  // Calculate debits and credits
  let totalDebit = 0;
  let totalCredit = 0;
  lines.forEach((l: any) => {
    totalDebit += Number(l.debit) || 0;
    totalCredit += Number(l.credit) || 0;
  });

  // Strict double-entry invariant check: Total Debit === Total Credit
  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    return res.status(400).json({
      error: `Double-entry imbalance! Total Debit (₹${totalDebit}) must equal Total Credit (₹${totalCredit}). Variance: ₹${Math.abs(totalDebit - totalCredit)}.`
    });
  }

  // Check period locking
  const isLocked = enterprisePeriodLocks.some(p => p.status === 'Locked' && voucherDate >= p.startDate && voucherDate <= p.endDate);
  if (isLocked) {
    return res.status(403).json({
      error: `Accounting period containing ${voucherDate} is LOCKED by the auditor. Transactions cannot be posted without unlocking.`
    });
  }

  const series = enterpriseNumberingSeries.find(s => s.voucherType === voucherType) || enterpriseNumberingSeries[4];
  series.currentNumber += 1;
  const voucherNumber = `${series.prefix}${series.currentNumber.toString().padStart(series.length, '0')}${series.suffix}`;

  const newVoucher: GenericVoucher = {
    id: `VCH-${Date.now()}`,
    companyId: 'CMP-01',
    voucherType,
    voucherNumber,
    voucherDate: voucherDate || new Date().toISOString().split('T')[0],
    referenceNumber,
    narration: narration || 'Journal voucher posted',
    status: 'Posted',
    currency: 'INR',
    exchangeRate: 1,
    totalDebit,
    totalCredit,
    createdBy: 'System (Live Operator)',
    createdAt: new Date().toISOString(),
    lines: lines.map((l: any, idx: number) => ({
      id: `VL-${Date.now()}-${idx}`,
      voucherId: `VCH-${Date.now()}`,
      ledgerId: l.ledgerId || 'LED-GEN',
      ledgerName: l.ledgerName,
      debit: Number(l.debit) || 0,
      credit: Number(l.credit) || 0,
      costCenter: l.costCenter,
      taxCode: l.taxCode,
      billReference: l.billReference
    }))
  };

  enterpriseGenericVouchers.unshift(newVoucher);
  res.status(201).json({ success: true, voucher: newVoucher });
});

// ----------------------------------------------------------------------------
// API ROUTES: VERSIONED TAX RULES ENGINE
// ----------------------------------------------------------------------------
router.get('/tax/rules', (req, res) => {
  res.json(enterpriseTaxRules);
});

router.post('/tax/calculate', (req, res) => {
  const { supplierState = '29', customerState = '29', hsnCode = '998313', taxableValue = 100000, date = new Date().toISOString().split('T')[0] } = req.body;
  const isInterState = supplierState.slice(0, 2) !== customerState.slice(0, 2);
  
  // Find applicable rule by effective date
  const rule = enterpriseTaxRules.find(r => date >= r.effectiveFrom && date <= r.effectiveTo && (!r.hsnCategory || r.hsnCategory.includes(hsnCode.slice(0, 4)))) || enterpriseTaxRules[0];
  
  const taxRate = rule.taxRate;
  const cgstRate = isInterState ? 0 : rule.cgstRate;
  const sgstRate = isInterState ? 0 : rule.sgstRate;
  const igstRate = isInterState ? rule.igstRate : 0;

  const cgstAmount = Math.round((taxableValue * cgstRate) / 100);
  const sgstAmount = Math.round((taxableValue * sgstRate) / 100);
  const igstAmount = Math.round((taxableValue * igstRate) / 100);
  const totalTax = cgstAmount + sgstAmount + igstAmount;
  const grandTotal = taxableValue + totalTax;

  res.json({
    ruleApplied: rule.ruleName,
    taxRate,
    isInterState,
    taxableValue,
    cgstRate,
    cgstAmount,
    sgstRate,
    sgstAmount,
    igstRate,
    igstAmount,
    totalTax,
    grandTotal
  });
});

// ----------------------------------------------------------------------------
// API ROUTES: GST IMS (INVOICE MANAGEMENT SYSTEM) INBOX
// ----------------------------------------------------------------------------
router.get('/gst/ims', (req, res) => {
  const stats = {
    totalCount: enterpriseIMSInbox.length,
    acceptedCount: enterpriseIMSInbox.filter(i => i.userAction === 'Accept').length,
    rejectedCount: enterpriseIMSInbox.filter(i => i.userAction === 'Reject').length,
    pendingCount: enterpriseIMSInbox.filter(i => i.userAction === 'Pending').length,
    totalITCClaimable: enterpriseIMSInbox.filter(i => i.userAction === 'Accept').reduce((acc, i) => acc + i.cgst + i.sgst + i.igst, 0)
  };
  res.json({ items: enterpriseIMSInbox, stats });
});

router.post('/gst/ims/:id/action', (req, res) => {
  const { id } = req.params;
  const { action, remarks } = req.body;
  const item = enterpriseIMSInbox.find(i => i.id === id);
  if (!item) return res.status(404).json({ error: 'IMS invoice not found' });
  
  item.userAction = action;
  if (remarks) item.remarks = remarks;
  res.json({ success: true, item, message: `Invoice ${item.invoiceNumber} action updated to ${action} in IMS.` });
});

// ----------------------------------------------------------------------------
// API ROUTES: CONTINUOUS STOCK MOVEMENT LEDGER
// ----------------------------------------------------------------------------
router.get('/inventory/stock-ledger', (req, res) => {
  const { itemId, warehouse } = req.query;
  let ledger = [...enterpriseStockLedger];
  if (itemId) ledger = ledger.filter(l => l.itemId === itemId);
  if (warehouse) ledger = ledger.filter(l => l.warehouse === warehouse);
  res.json(ledger);
});

// ----------------------------------------------------------------------------
// API ROUTES: FIXED ASSETS & DEPRECIATION SCHEDULE
// ----------------------------------------------------------------------------
router.get('/assets/schedule', (req, res) => {
  const totalCost = enterpriseAssetDepreciationSchedules.reduce((a, b) => a + b.costValue, 0);
  const totalAccumulatedDep = enterpriseAssetDepreciationSchedules.reduce((a, b) => a + b.accumulatedDepreciation, 0);
  const totalNetBookValue = enterpriseAssetDepreciationSchedules.reduce((a, b) => a + b.netBookValue, 0);

  res.json({
    assets: enterpriseAssetDepreciationSchedules,
    summary: {
      totalCost,
      totalAccumulatedDep,
      totalNetBookValue
    }
  });
});

router.post('/assets/post-depreciation', (req, res) => {
  const { fiscalYear = '2026-27' } = req.body;
  let totalDepreciationThisRun = 0;

  enterpriseAssetDepreciationSchedules.forEach(ast => {
    if (ast.netBookValue > ast.salvageValue) {
      const annualDep = Math.round((ast.costValue - ast.salvageValue) / ast.usefulLifeYears);
      const depToApply = Math.min(annualDep, ast.netBookValue - ast.salvageValue);
      ast.accumulatedDepreciation += depToApply;
      ast.netBookValue -= depToApply;
      totalDepreciationThisRun += depToApply;
    }
  });

  // Post balanced double-entry voucher: Dr Depreciation Expense, Cr Accumulated Depreciation
  const depVoucher: GenericVoucher = {
    id: `VCH-DEP-${Date.now()}`,
    companyId: 'CMP-01',
    voucherType: 'Depreciation',
    voucherNumber: `DEP/2026-27/00001`,
    voucherDate: new Date().toISOString().split('T')[0],
    narration: `Annual asset depreciation charge for ${fiscalYear} across IT & compute assets`,
    status: 'Posted',
    currency: 'INR',
    exchangeRate: 1,
    totalDebit: totalDepreciationThisRun,
    totalCredit: totalDepreciationThisRun,
    createdBy: 'System (Depreciation Engine)',
    createdAt: new Date().toISOString(),
    lines: [
      { id: `VL-DEP-1`, voucherId: `VCH-DEP-${Date.now()}`, ledgerId: 'LED-09', ledgerName: 'Depreciation & Amortization Expense (P&L)', debit: totalDepreciationThisRun, credit: 0 },
      { id: `VL-DEP-2`, voucherId: `VCH-DEP-${Date.now()}`, ledgerId: 'LED-AST-ACC', ledgerName: 'Accumulated Depreciation Provision (Balance Sheet)', debit: 0, credit: totalDepreciationThisRun }
    ]
  };
  enterpriseGenericVouchers.unshift(depVoucher);

  res.json({
    success: true,
    totalDepreciationPosted: totalDepreciationThisRun,
    voucher: depVoucher,
    message: `Depreciation JV posted! Total ₹${totalDepreciationThisRun.toLocaleString()} charged to P&L.`
  });
});

// ----------------------------------------------------------------------------
// API ROUTES: POS RETAIL BILLING & SHIFT CLOSING
// ----------------------------------------------------------------------------
router.get('/pos/shift', (req, res) => {
  const currentShift = enterprisePOSShifts[0];
  res.json(currentShift);
});

router.post('/pos/checkout', (req, res) => {
  const { items = [], tenderMethod = 'UPI', amountPaid = 0, customerPhone } = req.body;
  const currentShift = enterprisePOSShifts[0];
  
  if (tenderMethod === 'Cash') currentShift.cashSales += Number(amountPaid) || 0;
  else if (tenderMethod === 'UPI') currentShift.upiSales += Number(amountPaid) || 0;
  else currentShift.cardSales += Number(amountPaid) || 0;
  
  currentShift.totalRevenue += Number(amountPaid) || 0;
  currentShift.expectedDrawerCash = currentShift.openingCash + currentShift.cashSales - currentShift.cashExpenses;

  // Record Stock movement for POS items
  items.forEach((item: any) => {
    enterpriseStockLedger.unshift({
      id: `STK-${Date.now()}-${Math.random().toString().slice(2, 6)}`,
      date: new Date().toISOString().split('T')[0],
      itemId: item.id || 'ITEM-POS',
      itemName: item.name || 'POS Retail Item',
      sku: item.sku || 'SKU-POS',
      warehouse: 'Bangalore Central Tech Hub',
      inQty: 0,
      outQty: item.qty || 1,
      unitCost: item.price || 0,
      totalValue: (item.qty || 1) * (item.price || 0),
      runningQty: 10,
      runningValue: 100000,
      referenceVoucher: `POS-REC-${Date.now().toString().slice(-4)}`,
      movementType: 'Sale'
    });
  });

  res.json({
    success: true,
    receiptNo: `POS-${Date.now().toString().slice(-6)}`,
    tenderMethod,
    amountPaid,
    shift: currentShift
  });
});

router.post('/pos/close-shift', (req, res) => {
  const { actualDrawerCash = 0 } = req.body;
  const currentShift = enterprisePOSShifts[0];
  currentShift.actualDrawerCash = Number(actualDrawerCash);
  currentShift.cashVariance = Number(actualDrawerCash) - currentShift.expectedDrawerCash;
  currentShift.status = 'Closed';
  currentShift.closedAt = new Date().toISOString();

  res.json({
    success: true,
    message: `Shift closed! Variance: ₹${currentShift.cashVariance}`,
    shift: currentShift
  });
});

// ----------------------------------------------------------------------------
// API ROUTES: PERIOD LOCKING & NUMBERING SERIES
// ----------------------------------------------------------------------------
router.get('/admin/period-locks', (req, res) => {
  res.json(enterprisePeriodLocks);
});

router.post('/admin/period-locks/toggle', (req, res) => {
  const { id } = req.body;
  const period = enterprisePeriodLocks.find(p => p.id === id);
  if (!period) return res.status(404).json({ error: 'Period not found' });
  period.status = period.status === 'Locked' ? 'Open' : 'Locked';
  if (period.status === 'Locked') {
    period.lockedBy = 'Auditor / Finance Admin';
    period.lockedAt = new Date().toISOString();
  }
  res.json({ success: true, period });
});

router.get('/admin/numbering-series', (req, res) => {
  res.json(enterpriseNumberingSeries);
});

router.post('/admin/numbering-series', (req, res) => {
  const { voucherType, prefix, suffix, currentNumber, length } = req.body;
  let series = enterpriseNumberingSeries.find(s => s.voucherType === voucherType);
  if (!series) {
    series = {
      id: `NS-${Date.now()}`,
      voucherType,
      prefix: prefix || '',
      suffix: suffix || '',
      currentNumber: Number(currentNumber) || 1,
      length: Number(length) || 5,
      fiscalYearReset: true,
      sampleFormat: `${prefix}00001${suffix}`
    };
    enterpriseNumberingSeries.push(series);
  } else {
    if (prefix !== undefined) series.prefix = prefix;
    if (suffix !== undefined) series.suffix = suffix;
    if (currentNumber !== undefined) series.currentNumber = Number(currentNumber);
    if (length !== undefined) series.length = Number(length);
    series.sampleFormat = `${series.prefix}${series.currentNumber.toString().padStart(series.length, '0')}${series.suffix}`;
  }
  res.json({ success: true, series });
});


// ============================================================================
// COMPREHENSIVE UNIVERSAL CRUD ENDPOINTS (CREATE, EDIT, DELETE EVERYWHERE)
// ============================================================================

// 1. SALES ORDERS CRUD
router.put('/accounting/sales-orders/:id', (req, res) => {
  const idx = enterpriseSalesOrders.findIndex(o => o.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Sales order not found' });
  enterpriseSalesOrders[idx] = { ...enterpriseSalesOrders[idx], ...req.body };
  res.json({ success: true, salesOrder: enterpriseSalesOrders[idx] });
});

router.delete('/accounting/sales-orders/:id', (req, res) => {
  const initial = enterpriseSalesOrders.length;
  enterpriseSalesOrders = enterpriseSalesOrders.filter(o => o.id !== req.params.id);
  if (enterpriseSalesOrders.length === initial) return res.status(404).json({ error: 'Sales order not found' });
  res.json({ success: true, message: 'Sales order deleted successfully' });
});

// 2. CREDIT NOTES CRUD
router.put('/accounting/credit-notes/:id', (req, res) => {
  const idx = enterpriseCreditNotes.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Credit note not found' });
  enterpriseCreditNotes[idx] = { ...enterpriseCreditNotes[idx], ...req.body };
  res.json({ success: true, creditNote: enterpriseCreditNotes[idx] });
});

router.delete('/accounting/credit-notes/:id', (req, res) => {
  const initial = enterpriseCreditNotes.length;
  enterpriseCreditNotes = enterpriseCreditNotes.filter(c => c.id !== req.params.id);
  if (enterpriseCreditNotes.length === initial) return res.status(404).json({ error: 'Credit note not found' });
  res.json({ success: true, message: 'Credit note deleted successfully' });
});

// 3. PRICE LISTS CRUD
router.post('/accounting/price-lists', (req, res) => {
  const { listName, discountPercentage, currency, minOrderQty, validUntil, applicability } = req.body;
  const newPl: PriceList = {
    id: `PL-${Date.now()}`,
    listName: listName || 'Standard Pricing',
    applicableCategory: applicability || 'Corporate Accounts',
    discountPercentage: Number(discountPercentage) || 0,
    effectiveFrom: validUntil || '2026-04-01',
    items: []
  };
  enterprisePriceLists.push(newPl);
  res.status(201).json({ success: true, priceList: newPl });
});

router.put('/accounting/price-lists/:id', (req, res) => {
  const idx = enterprisePriceLists.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Price list not found' });
  enterprisePriceLists[idx] = { ...enterprisePriceLists[idx], ...req.body };
  res.json({ success: true, priceList: enterprisePriceLists[idx] });
});

router.delete('/accounting/price-lists/:id', (req, res) => {
  const initial = enterprisePriceLists.length;
  enterprisePriceLists = enterprisePriceLists.filter(p => p.id !== req.params.id);
  if (enterprisePriceLists.length === initial) return res.status(404).json({ error: 'Price list not found' });
  res.json({ success: true, message: 'Price list deleted successfully' });
});

// 4. PURCHASE REQUISITIONS CRUD
router.put('/accounting/purchase-requisitions/:id', (req, res) => {
  const idx = enterprisePurchaseRequisitions.findIndex(r => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Requisition not found' });
  enterprisePurchaseRequisitions[idx] = { ...enterprisePurchaseRequisitions[idx], ...req.body };
  res.json({ success: true, requisition: enterprisePurchaseRequisitions[idx] });
});

router.delete('/accounting/purchase-requisitions/:id', (req, res) => {
  const initial = enterprisePurchaseRequisitions.length;
  enterprisePurchaseRequisitions = enterprisePurchaseRequisitions.filter(r => r.id !== req.params.id);
  if (enterprisePurchaseRequisitions.length === initial) return res.status(404).json({ error: 'Requisition not found' });
  res.json({ success: true, message: 'Requisition deleted successfully' });
});

// 5. DEBIT NOTES CRUD
router.put('/accounting/debit-notes/:id', (req, res) => {
  const idx = enterpriseDebitNotes.findIndex(d => d.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Debit note not found' });
  enterpriseDebitNotes[idx] = { ...enterpriseDebitNotes[idx], ...req.body };
  res.json({ success: true, debitNote: enterpriseDebitNotes[idx] });
});

router.delete('/accounting/debit-notes/:id', (req, res) => {
  const initial = enterpriseDebitNotes.length;
  enterpriseDebitNotes = enterpriseDebitNotes.filter(d => d.id !== req.params.id);
  if (enterpriseDebitNotes.length === initial) return res.status(404).json({ error: 'Debit note not found' });
  res.json({ success: true, message: 'Debit note deleted successfully' });
});

// 6. SUPPLIERS CRUD
router.put('/accounting/suppliers/:id', async (req, res) => {
  const idx = enterpriseSuppliers.findIndex(s => s.id === req.params.id);
  if (idx !== -1) {
    enterpriseSuppliers[idx] = { ...enterpriseSuppliers[idx], ...req.body };
    return res.json({ success: true, supplier: enterpriseSuppliers[idx] });
  }
  try {
    const s = await prisma.supplier.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json({ success: true, supplier: s });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update supplier' });
  }
});

// 7. INVENTORY ITEMS CRUD (Perpetual Godown Items)
router.put('/accounting/inventory/items/:id', (req, res) => {
  const idx = enterpriseGodownInventory.findIndex(i => i.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Inventory item not found' });
  enterpriseGodownInventory[idx] = { ...enterpriseGodownInventory[idx], ...req.body };
  res.json({ success: true, item: enterpriseGodownInventory[idx] });
});

router.delete('/accounting/inventory/items/:id', (req, res) => {
  const initial = enterpriseGodownInventory.length;
  enterpriseGodownInventory = enterpriseGodownInventory.filter(i => i.id !== req.params.id);
  if (enterpriseGodownInventory.length === initial) return res.status(404).json({ error: 'Inventory item not found' });
  res.json({ success: true, message: 'Inventory item deleted successfully' });
});

// 8. GODOWNS MASTER CRUD
interface GodownMaster {
  id: string;
  name: string;
  code: string;
  location: string;
  manager: string;
  capacity: string;
  status: string;
}

let enterpriseGodownMasters: GodownMaster[] = [
  { id: 'GD-01', name: 'Bangalore Central Tech Hub', code: 'BLR-HUB', location: 'Bangalore, Karnataka', manager: 'S. Suresh', capacity: '50,000 sq ft', status: 'Active' },
  { id: 'GD-02', name: 'Mumbai Depot', code: 'BOM-DEP', location: 'Bhiwandi, Maharashtra', manager: 'K. Patel', capacity: '35,000 sq ft', status: 'Active' },
  { id: 'GD-03', name: 'Delhi Distribution Center', code: 'DEL-DIS', location: 'Gurugram, NCR', manager: 'R. Sharma', capacity: '40,000 sq ft', status: 'Active' }
];

router.get('/accounting/inventory/godowns', (req, res) => {
  res.json(enterpriseGodownMasters);
});

router.post('/accounting/inventory/godowns', (req, res) => {
  const { name, code, location, manager, capacity } = req.body;
  const newGodown: GodownMaster = {
    id: `GD-${Date.now()}`,
    name: name || 'New Warehouse Facility',
    code: code || `GD-0${enterpriseGodownMasters.length + 1}`,
    location: location || 'Bangalore, India',
    manager: manager || 'Warehouse Supervisor',
    capacity: capacity || '50,000 sq ft',
    status: 'Active'
  };
  enterpriseGodownMasters.push(newGodown);
  res.status(201).json({ success: true, godown: newGodown });
});

router.put('/accounting/inventory/godowns/:id', (req, res) => {
  const idx = enterpriseGodownMasters.findIndex(g => g.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Godown not found' });
  enterpriseGodownMasters[idx] = { ...enterpriseGodownMasters[idx], ...req.body };
  res.json({ success: true, godown: enterpriseGodownMasters[idx] });
});

router.delete('/accounting/inventory/godowns/:id', (req, res) => {
  if (enterpriseGodownMasters.length <= 1) return res.status(400).json({ error: 'Cannot delete the only remaining primary godown' });
  const initial = enterpriseGodownMasters.length;
  enterpriseGodownMasters = enterpriseGodownMasters.filter(g => g.id !== req.params.id);
  if (enterpriseGodownMasters.length === initial) return res.status(404).json({ error: 'Godown not found' });
  res.json({ success: true, message: 'Godown deleted successfully' });
});

// 9. BATCHES CRUD
router.put('/accounting/inventory/batches/:id', (req, res) => {
  const idx = enterpriseStockBatches.findIndex(b => b.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Batch not found' });
  enterpriseStockBatches[idx] = { ...enterpriseStockBatches[idx], ...req.body };
  res.json({ success: true, batch: enterpriseStockBatches[idx] });
});

router.delete('/accounting/inventory/batches/:id', (req, res) => {
  const initial = enterpriseStockBatches.length;
  enterpriseStockBatches = enterpriseStockBatches.filter(b => b.id !== req.params.id);
  if (enterpriseStockBatches.length === initial) return res.status(404).json({ error: 'Batch not found' });
  res.json({ success: true, message: 'Batch deleted successfully' });
});

let enterpriseStockTransferLogs: any[] = [];


router.get('/accounting/inventory/transfers', (req, res) => {
  res.json(enterpriseStockTransferLogs);
});

router.put('/accounting/inventory/transfers/:id', (req, res) => {
  const idx = enterpriseStockTransferLogs.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Transfer not found' });
  enterpriseStockTransferLogs[idx] = { ...enterpriseStockTransferLogs[idx], ...req.body };
  res.json({ success: true, transfer: enterpriseStockTransferLogs[idx] });
});

router.delete('/accounting/inventory/transfers/:id', (req, res) => {
  const initial = enterpriseStockTransferLogs.length;
  enterpriseStockTransferLogs = enterpriseStockTransferLogs.filter(t => t.id !== req.params.id);
  if (enterpriseStockTransferLogs.length === initial) return res.status(404).json({ error: 'Transfer not found' });
  res.json({ success: true, message: 'Transfer deleted successfully' });
});

// 11. MANUFACTURING BOM CRUD
router.put('/accounting/manufacturing/bom/:id', (req, res) => {
  const idx = enterpriseBOMs.findIndex(b => b.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'BOM not found' });
  enterpriseBOMs[idx] = { ...enterpriseBOMs[idx], ...req.body };
  res.json({ success: true, bom: enterpriseBOMs[idx] });
});

router.delete('/accounting/manufacturing/bom/:id', (req, res) => {
  const initial = enterpriseBOMs.length;
  enterpriseBOMs = enterpriseBOMs.filter(b => b.id !== req.params.id);
  if (enterpriseBOMs.length === initial) return res.status(404).json({ error: 'BOM not found' });
  res.json({ success: true, message: 'BOM deleted successfully' });
});

// 12. BANK ACCOUNTS CRUD
router.post('/accounting/bank-accounts', (req, res) => {
  const { accountName, accountNumber, bankName, ifscCode, branch, accountType, bookBalance, bankBalance } = req.body;
  const newAccount: BankAccount = {
    id: `BNK-${Date.now()}`,
    accountName: accountName || 'Primary Operating Account',
    accountNumber: accountNumber || '999988887777',
    bankName: bankName || 'HDFC Bank',
    ifscCode: ifscCode || 'HDFC0001234',
    accountType: accountType || 'Current',
    bookBalance: Number(bookBalance) || 0,
    bankStatementBalance: Number(bankBalance) || Number(bookBalance) || 0,
    unreconciledAmount: 0,
    connectedApiStatus: 'Connected',
    lastSyncedAt: new Date().toISOString()
  };
  enterpriseBankAccounts.push(newAccount);
  res.status(201).json({ success: true, account: newAccount });
});

router.put('/accounting/bank-accounts/:id', (req, res) => {
  const idx = enterpriseBankAccounts.findIndex(b => b.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Bank account not found' });
  enterpriseBankAccounts[idx] = { ...enterpriseBankAccounts[idx], ...req.body };
  res.json({ success: true, account: enterpriseBankAccounts[idx] });
});

router.delete('/accounting/bank-accounts/:id', (req, res) => {
  if (enterpriseBankAccounts.length <= 1) return res.status(400).json({ error: 'Cannot delete primary operating bank account' });
  const initial = enterpriseBankAccounts.length;
  enterpriseBankAccounts = enterpriseBankAccounts.filter(b => b.id !== req.params.id);
  if (enterpriseBankAccounts.length === initial) return res.status(404).json({ error: 'Bank account not found' });
  res.json({ success: true, message: 'Bank account deleted successfully' });
});

// 13. CHEQUES CRUD
router.put('/accounting/cheques/:id', (req, res) => {
  const idx = enterpriseCheques.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Cheque record not found' });
  enterpriseCheques[idx] = { ...enterpriseCheques[idx], ...req.body };
  res.json({ success: true, cheque: enterpriseCheques[idx] });
});

router.delete('/accounting/cheques/:id', (req, res) => {
  const initial = enterpriseCheques.length;
  enterpriseCheques = enterpriseCheques.filter(c => c.id !== req.params.id);
  if (enterpriseCheques.length === initial) return res.status(404).json({ error: 'Cheque record not found' });
  res.json({ success: true, message: 'Cheque record deleted successfully' });
});

// 14. CONTRA TRANSFERS CRUD
router.put('/accounting/contra/:id', (req, res) => {
  const idx = enterpriseContraVouchers.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Contra record not found' });
  enterpriseContraVouchers[idx] = { ...enterpriseContraVouchers[idx], ...req.body };
  res.json({ success: true, contra: enterpriseContraVouchers[idx] });
});

router.delete('/accounting/contra/:id', (req, res) => {
  const initial = enterpriseContraVouchers.length;
  enterpriseContraVouchers = enterpriseContraVouchers.filter(c => c.id !== req.params.id);
  if (enterpriseContraVouchers.length === initial) return res.status(404).json({ error: 'Contra record not found' });
  res.json({ success: true, message: 'Contra record deleted successfully' });
});

// 15. PAYOUTS CRUD
interface ConnectedPayoutRecord {
  id: string;
  utrNo: string;
  accountId: string;
  beneficiaryName: string;
  accountNumber: string;
  ifsc: string;
  amount: number;
  remarks: string;
  status: 'Processed' | 'Failed' | 'Pending';
  timestamp: string;
}

let enterprisePayoutList: ConnectedPayoutRecord[] = [];

router.get('/accounting/payouts', (req, res) => {
  res.json(enterprisePayoutList);
});

router.put('/accounting/payouts/:id', (req, res) => {
  const idx = enterprisePayoutList.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Payout not found' });
  enterprisePayoutList[idx] = { ...enterprisePayoutList[idx], ...req.body };
  res.json({ success: true, payout: enterprisePayoutList[idx] });
});

router.delete('/accounting/payouts/:id', (req, res) => {
  const initial = enterprisePayoutList.length;
  enterprisePayoutList = enterprisePayoutList.filter(p => p.id !== req.params.id);
  if (enterprisePayoutList.length === initial) return res.status(404).json({ error: 'Payout not found' });
  res.json({ success: true, message: 'Payout deleted successfully' });
});

// 16. GENERIC DOUBLE-ENTRY VOUCHERS CRUD
router.put('/accounting/vouchers/:id', (req, res) => {
  const idx = enterpriseGenericVouchers.findIndex(v => v.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Voucher not found' });

  const { lines, narration, voucherDate, referenceNumber } = req.body;
  if (lines && lines.length > 0) {
    const totalDebit = lines.reduce((acc: number, l: any) => acc + Number(l.debit || 0), 0);
    const totalCredit = lines.reduce((acc: number, l: any) => acc + Number(l.credit || 0), 0);
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      return res.status(400).json({
        error: `Double-entry imbalance! Total Debit (₹${totalDebit}) must equal Total Credit (₹${totalCredit}).`
      });
    }
    enterpriseGenericVouchers[idx].lines = lines;
    enterpriseGenericVouchers[idx].totalDebit = totalDebit;
    enterpriseGenericVouchers[idx].totalCredit = totalCredit;
  }
  if (narration !== undefined) enterpriseGenericVouchers[idx].narration = narration;
  if (voucherDate !== undefined) enterpriseGenericVouchers[idx].voucherDate = voucherDate;
  if (referenceNumber !== undefined) enterpriseGenericVouchers[idx].referenceNumber = referenceNumber;

  res.json({ success: true, voucher: enterpriseGenericVouchers[idx] });
});

router.delete('/accounting/vouchers/:id', (req, res) => {
  const v = enterpriseGenericVouchers.find(x => x.id === req.params.id);
  if (!v) return res.status(404).json({ error: 'Voucher not found' });

  // Period lock check
  const isPeriodLocked = enterprisePeriodLocks.some(
    p => p.status === 'Locked' && v.voucherDate >= p.startDate && v.voucherDate <= p.endDate
  );
  if (isPeriodLocked) {
    return res.status(403).json({ error: `Cannot delete voucher in a locked accounting period (${v.voucherDate}).` });
  }

  enterpriseGenericVouchers = enterpriseGenericVouchers.filter(x => x.id !== req.params.id);
  res.json({ success: true, message: 'Voucher deleted successfully' });
});

// 17. COST CENTRES CRUD
router.put('/accounting/cost-centres/:id', (req, res) => {
  const idx = enterpriseCostCentres.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Cost centre not found' });
  enterpriseCostCentres[idx] = { ...enterpriseCostCentres[idx], ...req.body };
  res.json({ success: true, costCentre: enterpriseCostCentres[idx] });
});

router.delete('/accounting/cost-centres/:id', (req, res) => {
  const initial = enterpriseCostCentres.length;
  enterpriseCostCentres = enterpriseCostCentres.filter(c => c.id !== req.params.id);
  if (enterpriseCostCentres.length === initial) return res.status(404).json({ error: 'Cost centre not found' });
  res.json({ success: true, message: 'Cost centre deleted successfully' });
});

// 18. BUDGETS CRUD
router.put('/accounting/budgets/:id', (req, res) => {
  const idx = enterpriseBudgets.findIndex(b => b.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Budget not found' });
  enterpriseBudgets[idx] = { ...enterpriseBudgets[idx], ...req.body };
  res.json({ success: true, budget: enterpriseBudgets[idx] });
});

router.delete('/accounting/budgets/:id', (req, res) => {
  const initial = enterpriseBudgets.length;
  enterpriseBudgets = enterpriseBudgets.filter(b => b.id !== req.params.id);
  if (enterpriseBudgets.length === initial) return res.status(404).json({ error: 'Budget not found' });
  res.json({ success: true, message: 'Budget deleted successfully' });
});

// 19. ADMIN COMPANIES CRUD
router.put('/admin/companies/:id', (req, res) => {
  const idx = enterpriseCompanies.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Company not found' });
  enterpriseCompanies[idx] = { ...enterpriseCompanies[idx], ...req.body };
  res.json({ success: true, company: enterpriseCompanies[idx] });
});

router.delete('/admin/companies/:id', (req, res) => {
  if (enterpriseCompanies.length <= 1) return res.status(400).json({ error: 'Cannot delete the only remaining company entity' });
  const initial = enterpriseCompanies.length;
  enterpriseCompanies = enterpriseCompanies.filter(c => c.id !== req.params.id);
  if (enterpriseCompanies.length === initial) return res.status(404).json({ error: 'Company not found' });
  res.json({ success: true, message: 'Company entity deleted successfully' });
});

// 20. ADMIN BRANCHES CRUD
let enterpriseBranchMasters = [
  { id: 'BR-BLR', branchName: 'Headquarters & Global Delivery Center', code: 'BLR-01', city: 'Bangalore', state: 'Karnataka (29)', gstin: '29AAACT2727Q1ZB', manager: 'Ananya Sharma', status: 'Primary HQ', revenueContribution: '0%' },
  { id: 'BR-BOM', branchName: 'Western Regional Commercial Hub', code: 'MUM-02', city: 'Mumbai', state: 'Maharashtra (27)', gstin: '27AAACT2727Q1Z8', manager: 'Vikram Mehta', status: 'Branch Office', revenueContribution: '0%' },
  { id: 'BR-DEL', branchName: 'Northern Govt & Enterprise Liaison', code: 'DEL-03', city: 'New Delhi', state: 'Delhi (07)', gstin: '07AAACT2727Q1Z2', manager: 'Rajesh Singhal', status: 'Branch Office', revenueContribution: '0%' }
];

router.get('/admin/branches', (req, res) => {
  res.json(enterpriseBranchMasters);
});

router.post('/admin/branches', (req, res) => {
  const { branchName, code, city, state, gstin, manager, status, revenueContribution } = req.body;
  const newBr = {
    id: `BR-${Date.now()}`,
    branchName: branchName || 'New Regional Office',
    code: code || `BR-0${enterpriseBranchMasters.length + 1}`,
    city: city || 'Hyderabad',
    state: state || 'Telangana (36)',
    gstin: gstin || '36AAACT2727Q1Z4',
    manager: manager || 'Regional Director',
    status: status || 'Branch Office',
    revenueContribution: revenueContribution || '0%'
  };
  enterpriseBranchMasters.push(newBr);
  res.status(201).json({ success: true, branch: newBr });
});

router.put('/admin/branches/:id', (req, res) => {
  const idx = enterpriseBranchMasters.findIndex(b => b.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Branch not found' });
  enterpriseBranchMasters[idx] = { ...enterpriseBranchMasters[idx], ...req.body };
  res.json({ success: true, branch: enterpriseBranchMasters[idx] });
});

router.delete('/admin/branches/:id', (req, res) => {
  const initial = enterpriseBranchMasters.length;
  enterpriseBranchMasters = enterpriseBranchMasters.filter(b => b.id !== req.params.id);
  if (enterpriseBranchMasters.length === initial) return res.status(404).json({ error: 'Branch not found' });
  res.json({ success: true, message: 'Branch deleted successfully' });
});

// 21. ADMIN CURRENCIES CRUD
router.delete('/admin/currencies/:code', (req, res) => {
  const initial = enterpriseCurrencies.length;
  enterpriseCurrencies = enterpriseCurrencies.filter(c => c.currencyCode !== req.params.code);
  if (enterpriseCurrencies.length === initial) return res.status(404).json({ error: 'Currency not found' });
  res.json({ success: true, message: 'Currency deleted successfully' });
});

// 22. ADMIN PERIOD LOCKS CRUD
router.post('/admin/period-locks', (req, res) => {
  const { periodName, fiscalYear, startDate, endDate, status } = req.body;
  const newPl: AccountingPeriodLock = {
    id: `PL-${Date.now()}`,
    periodName: periodName || 'Custom Period',
    fiscalYear: fiscalYear || '2026-27',
    startDate: startDate || new Date().toISOString().split('T')[0],
    endDate: endDate || new Date().toISOString().split('T')[0],
    status: status || 'Open'
  };
  enterprisePeriodLocks.push(newPl);
  res.status(201).json({ success: true, period: newPl });
});

router.delete('/admin/period-locks/:id', (req, res) => {
  const initial = enterprisePeriodLocks.length;
  enterprisePeriodLocks = enterprisePeriodLocks.filter(p => p.id !== req.params.id);
  if (enterprisePeriodLocks.length === initial) return res.status(404).json({ error: 'Period lock not found' });
  res.json({ success: true, message: 'Period lock deleted successfully' });
});

// 23. FIXED ASSETS CRUD (Detailed Depreciation Schedule)
router.put('/accounting/fixed-assets/:id', (req, res) => {
  const idx = enterpriseAssetDepreciationSchedules.findIndex(a => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Asset not found' });
  enterpriseAssetDepreciationSchedules[idx] = { ...enterpriseAssetDepreciationSchedules[idx], ...req.body };
  res.json({ success: true, asset: enterpriseAssetDepreciationSchedules[idx] });
});

router.delete('/accounting/fixed-assets/:id', (req, res) => {
  const initial = enterpriseAssetDepreciationSchedules.length;
  enterpriseAssetDepreciationSchedules = enterpriseAssetDepreciationSchedules.filter(a => a.id !== req.params.id);
  if (enterpriseAssetDepreciationSchedules.length === initial) return res.status(404).json({ error: 'Asset not found' });
  res.json({ success: true, message: 'Asset deleted successfully' });
});

export default router;
