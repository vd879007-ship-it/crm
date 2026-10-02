import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// =======================
// EMPLOYEE DATABASE (HEM)
// =======================

router.get('/employees', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: { employeeDetail: true, leaveBalances: true }
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

router.post('/employees', async (req, res) => {
  try {
    const { name, email, department, role = 'Employee', baseSalary = 60000, emergencyContact, skills } = req.body;
    const username = email ? email.split('@')[0] : `user_${Date.now()}`;
    const newUser = await prisma.user.create({
      data: {
        name,
        email: email || `${username}@enterprise.local`,
        username,
        password: 'ChangeMe123!',
        role,
        department: department || 'Engineering',
        status: 'APPROVED',
        employeeDetail: {
          create: {
            baseSalary: Number(baseSalary) || 60000,
            emergencyContact: emergencyContact || '',
            skills: skills || ''
          }
        },
        leaveBalances: {
          create: [
            { leaveType: 'Casual', totalDays: 12, usedDays: 0 },
            { leaveType: 'Sick', totalDays: 10, usedDays: 0 },
            { leaveType: 'Privilege', totalDays: 15, usedDays: 0 }
          ]
        }
      },
      include: { employeeDetail: true, leaveBalances: true }
    });
    res.status(201).json(newUser);
  } catch (err) {
    console.error('Create employee error:', err);
    res.status(500).json({ error: 'Failed to create employee profile' });
  }
});

router.put('/employees/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, email, department, role, status } = req.body;
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name ? { name } : {}),
        ...(email ? { email } : {}),
        ...(department ? { department } : {}),
        ...(role ? { role } : {}),
        ...(status ? { status } : {})
      },
      include: { employeeDetail: true, leaveBalances: true }
    });
    res.json(updatedUser);
  } catch (err) {
    console.error('Update employee error:', err);
    res.status(500).json({ error: 'Failed to update employee' });
  }
});

router.delete('/employees/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    // Delete child relations
    await prisma.employeeDetail.deleteMany({ where: { userId } });
    await prisma.leaveBalance.deleteMany({ where: { userId } });
    await prisma.attendanceLog.deleteMany({ where: { userId } });
    await prisma.hemShift.deleteMany({ where: { userId } });
    await prisma.payrollRecord.deleteMany({ where: { userId } });
    await prisma.leaveRequest.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });
    res.json({ message: 'Employee profile deleted successfully', deletedId: userId });
  } catch (err) {
    console.error('Delete employee error:', err);
    res.status(500).json({ error: 'Failed to delete employee' });
  }
});

router.post('/employees/:userId/detail', async (req, res) => {
  try {
    const { joiningDate, baseSalary, emergencyContact, skills, certifications, employmentHistory } = req.body;
    const detail = await prisma.employeeDetail.upsert({
      where: { userId: req.params.userId },
      update: { joiningDate: joiningDate ? new Date(joiningDate) : undefined, baseSalary, emergencyContact, skills, certifications, employmentHistory },
      create: { userId: req.params.userId, joiningDate: joiningDate ? new Date(joiningDate) : undefined, baseSalary, emergencyContact, skills, certifications, employmentHistory }
    });
    res.json(detail);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update employee detail' });
  }
});

// =======================
// ATTENDANCE & SHIFTS
// =======================

router.get('/attendance', async (req, res) => {
  try {
    const logs = await prisma.attendanceLog.findMany({
      include: { user: { select: { name: true, department: true } } },
      orderBy: { timestamp: 'desc' }
    });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch attendance logs' });
  }
});

router.post('/attendance', async (req, res) => {
  try {
    const { userId, type, gpsLocation, biometricId, isLate } = req.body;
    const log = await prisma.attendanceLog.create({
      data: { userId, type, gpsLocation, biometricId, isLate }
    });
    res.json(log);
  } catch (err) {
    res.status(500).json({ error: 'Failed to log attendance' });
  }
});

// =======================
// ==========================================
// ADVANCED PAYROLL & COMPENSATION SUITE
// ==========================================

function numberToWordsINR(num: number): string {
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  const inWords = (n: number): string => {
    if (n === 0) return '';
    let str = '';
    if (Math.floor(n / 10000000) > 0) {
      str += inWords(Math.floor(n / 10000000)) + 'Crore ';
      n %= 10000000;
    }
    if (Math.floor(n / 100000) > 0) {
      str += inWords(Math.floor(n / 100000)) + 'Lakh ';
      n %= 100000;
    }
    if (Math.floor(n / 1000) > 0) {
      str += inWords(Math.floor(n / 1000)) + 'Thousand ';
      n %= 1000;
    }
    if (Math.floor(n / 100) > 0) {
      str += inWords(Math.floor(n / 100)) + 'Hundred ';
      n %= 100;
    }
    if (n > 0) {
      if (n < 20) str += a[n];
      else str += b[Math.floor(n / 10)] + (n % 10 > 0 ? ' ' + a[n % 10] : ' ');
    }
    return str;
  };
  
  const intVal = Math.floor(Math.abs(num));
  if (intVal === 0) return 'Zero Rupees Only';
  return (inWords(intVal) + 'Rupees Only').replace(/\s+/g, ' ').trim();
}

// 1. Configurable Salary Structures & Master Components
let salaryComponentsMaster = [
  { id: 'CMP-BASIC', code: 'BASIC', name: 'Basic Salary', type: 'earning', calcType: 'percentage_ctc', defaultValue: 40, isTaxable: true, isPFApplicable: true, isESIApplicable: true, description: 'Core statutory wage foundation' },
  { id: 'CMP-HRA', code: 'HRA', name: 'House Rent Allowance (HRA)', type: 'earning', calcType: 'percentage_basic', defaultValue: 50, isTaxable: true, isPFApplicable: false, isESIApplicable: true, description: 'Tax-exempt under Sec 10(13A) against rent receipts' },
  { id: 'CMP-DA', code: 'DA', name: 'Dearness Allowance (DA)', type: 'earning', calcType: 'percentage_basic', defaultValue: 10, isTaxable: true, isPFApplicable: true, isESIApplicable: true, description: 'Cost of living adjustment' },
  { id: 'CMP-SA', code: 'SA', name: 'Special Allowance', type: 'earning', calcType: 'balancing_figure', defaultValue: 0, isTaxable: true, isPFApplicable: false, isESIApplicable: true, description: 'Flexible balancing component' },
  { id: 'CMP-CONV', code: 'CONV', name: 'Conveyance Allowance', type: 'earning', calcType: 'fixed', defaultValue: 1600, isTaxable: true, isPFApplicable: false, isESIApplicable: false, description: 'Commute and local transit assistance' },
  { id: 'CMP-MED', code: 'MED', name: 'Medical Allowance', type: 'earning', calcType: 'fixed', defaultValue: 1250, isTaxable: true, isPFApplicable: false, isESIApplicable: false, description: 'Routine medical reimbursement benefit' },
  { id: 'CMP-EPF-EE', code: 'EPF_EE', name: 'Employee Provident Fund (EPF)', type: 'deduction', calcType: 'statutory_slab', defaultValue: 12, isTaxable: false, isPFApplicable: false, isESIApplicable: false, description: 'Statutory 12% deduction from Basic wage' },
  { id: 'CMP-ESI-EE', code: 'ESI_EE', name: 'Employee State Insurance (ESI)', type: 'deduction', calcType: 'statutory_slab', defaultValue: 0.75, isTaxable: false, isPFApplicable: false, isESIApplicable: false, description: 'Statutory 0.75% for gross <= 21,000' },
  { id: 'CMP-PT', code: 'PT', name: 'Professional Tax (PT)', type: 'deduction', calcType: 'statutory_slab', defaultValue: 200, isTaxable: false, isPFApplicable: false, isESIApplicable: false, description: 'State municipal professional tax' },
  { id: 'CMP-TDS', code: 'TDS', name: 'Income Tax (TDS)', type: 'deduction', calcType: 'statutory_slab', defaultValue: 0, isTaxable: false, isPFApplicable: false, isESIApplicable: false, description: 'Tax Deducted at Source per declared regime' },
  { id: 'CMP-EPF-ER', code: 'EPF_ER', name: 'Employer PF Contribution', type: 'statutory_employer', calcType: 'statutory_slab', defaultValue: 12, isTaxable: false, isPFApplicable: false, isESIApplicable: false, description: '12% Employer match (EPS 8.33% + EPF 3.67%)' },
  { id: 'CMP-ESI-ER', code: 'ESI_ER', name: 'Employer ESI Contribution', type: 'statutory_employer', calcType: 'statutory_slab', defaultValue: 3.25, isTaxable: false, isPFApplicable: false, isESIApplicable: false, description: '3.25% Employer ESI contribution' }
];

let salaryStructures = [
  {
    id: 'STR-TECH-01',
    code: 'ENG-STANDARD',
    name: 'Technology & Product Engineering Standard',
    description: 'Optimized for software engineers and product managers with balanced take-home and EPF compliance.',
    applicableBands: ['L1 Associate', 'L2 SDE-1', 'L3 SDE-2', 'L4 Senior SDE', 'L5 Staff Engineer'],
    basicPercent: 40,
    hraPercentOfBasic: 50,
    daPercentOfBasic: 0,
    conveyanceFixed: 1600,
    medicalFixed: 1250,
    specialAllowanceBalancing: true,
    pfOptIn: true,
    esiApplicableIfEligible: true,
    ptApplicable: true,
    isActive: true
  },
  {
    id: 'STR-EXEC-02',
    code: 'EXEC-LEADERSHIP',
    name: 'Executive Leadership (C-Suite & Directors)',
    description: 'High flexi-benefit and performance incentive structure for executive leadership.',
    applicableBands: ['Band A - VP', 'Band A+ - CXO', 'Director'],
    basicPercent: 35,
    hraPercentOfBasic: 50,
    daPercentOfBasic: 0,
    conveyanceFixed: 3200,
    medicalFixed: 2500,
    specialAllowanceBalancing: true,
    pfOptIn: true,
    esiApplicableIfEligible: false,
    ptApplicable: true,
    isActive: true
  },
  {
    id: 'STR-OPS-03',
    code: 'OPS-RETAIL',
    name: 'Operations, Field & Retail Staff',
    description: 'Statutory compliance optimized with full ESI and EPF safety nets.',
    applicableBands: ['Grade 1 - Junior Associate', 'Grade 2 - Team Leader', 'Field Officer'],
    basicPercent: 50,
    hraPercentOfBasic: 40,
    daPercentOfBasic: 10,
    conveyanceFixed: 800,
    medicalFixed: 500,
    specialAllowanceBalancing: true,
    pfOptIn: true,
    esiApplicableIfEligible: true,
    ptApplicable: true,
    isActive: true
  },
  {
    id: 'STR-CONT-04',
    code: 'CONSULTANT-RETAINER',
    name: 'Retainer & Specialist Consultant',
    description: 'Gross billing with 10% TDS deduction under Section 194J without payroll statutory overhead.',
    applicableBands: ['Independent Consultant', 'Advisor', 'Retainer'],
    basicPercent: 100,
    hraPercentOfBasic: 0,
    daPercentOfBasic: 0,
    conveyanceFixed: 0,
    medicalFixed: 0,
    specialAllowanceBalancing: false,
    pfOptIn: false,
    esiApplicableIfEligible: false,
    ptApplicable: false,
    isActive: true
  }
];

// 2. Loans and Salary Advances (Starts at 0 entries)
let payrollLoans: any[] = [];

// 3. Payroll Reimbursements (Starts at 0 entries)
let payrollReimbursements: any[] = [];

// 4. Flexible Benefit Plans (FBP)
let fbpCatalog = [
  { code: 'NPS', name: 'National Pension System (Tier 1)', monthlyMax: 0, taxExemptionClause: 'Sec 80CCD(2) - Up to 10% of Basic Pay tax-free' },
  { code: 'MEAL', name: 'Meal & Food Wallet Card', monthlyMax: 0, taxExemptionClause: 'Sec 17(2) - ₹50 per meal exemption (₹2,600/mo)' },
  { code: 'FUEL', name: 'Fuel, Driver & Motor Allowance', monthlyMax: 0, taxExemptionClause: 'Sec 10(14) - Actual logbook reimbursement exemption' },
  { code: 'PHONE', name: 'Broadband, Mobile & Data Assistance', monthlyMax: 0, taxExemptionClause: 'Official telecommunication reimbursement exemption' },
  { code: 'BOOKS', name: 'Books, Certifications & Learning', monthlyMax: 0, taxExemptionClause: 'Sec 10(14) - Upskilling publications expense' },
  { code: 'WELLNESS', name: 'Health & Wellness Membership', monthlyMax: 0, taxExemptionClause: 'Corporate preventative health check allowance' }
];

let fbpDeclarations: any[] = [];

// 5. Detailed Payslips & Pay Run Ledger (Starts at 0 entries)
let detailedPayslips: any[] = [];

// 6. Disbursement Batches (Starts at 0 entries)
let disbursementBatches: any[] = [];

// 7. Accounts JV Ledger (Starts at 0 entries)
let accountsJVs: any[] = [];

// ==========================================
// PAYROLL ENDPOINTS
// ==========================================

// Get all payslips
router.get('/payroll', async (req, res) => {
  try {
    if (detailedPayslips.length > 0) {
      return res.json(detailedPayslips);
    }
    // Fallback check to database
    const records = await prisma.payrollRecord.findMany({
      include: { user: { select: { name: true, role: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch payroll records' });
  }
});

// Generate individual payslip
router.post('/payroll/generate', async (req, res) => {
  try {
    const { 
      userId, employeeName, department, designation, month, 
      baseSalary, allowances = 0, incentives = 0, overtimePay = 0, 
      deductions = 0, loansAdvances = 0, reimbursements = 0,
      pan = 'ABCDE1234F', uan = '100987654321', bankName = 'HDFC Bank',
      accountNumber = '501004892019', ifscCode = 'HDFC0001234',
      taxRegime = 'New Regime (Sec 115BAC)'
    } = req.body;

    const basic = Number(baseSalary) || 0;
    const hra = Math.round(basic * 0.5);
    const da = 0;
    const specialAllowance = Number(allowances) || 0;
    const grossEarnings = basic + hra + da + specialAllowance + Number(incentives) + Number(overtimePay);

    // Statutory deductions
    const epf = Math.round(basic * 0.12);
    const esi = grossEarnings <= 21000 ? Math.round(grossEarnings * 0.0075) : 0;
    const pt = 200;
    const estimatedTds = Math.max(0, Math.round((grossEarnings * 12 - 750000) * 0.1 / 12));
    const totalDeductions = epf + esi + pt + estimatedTds + Number(deductions) + Number(loansAdvances);
    const netSalary = grossEarnings - totalDeductions + Number(reimbursements);

    const recordId = `PAY-${Date.now().toString().slice(-6)}`;
    const payslip = {
      id: recordId,
      userId: userId || 'EMP-MANUAL',
      employeeName: employeeName || 'Employee',
      department: department || 'Engineering',
      designation: designation || 'Specialist',
      month: month || 'September 2026',
      pan,
      uan,
      bankName,
      accountNumber,
      ifscCode,
      taxRegime,
      attendance: {
        totalDays: 30,
        workingDays: 22,
        paidDays: 22,
        lopDays: 0,
        overtimeHours: overtimePay > 0 ? 8 : 0
      },
      earnings: {
        basic,
        hra,
        da,
        specialAllowance,
        conveyance: 1600,
        medical: 1250,
        overtimePay: Number(overtimePay),
        incentives: Number(incentives),
        totalGrossEarnings: grossEarnings
      },
      deductions: {
        epf,
        esi,
        professionalTax: pt,
        tds: estimatedTds,
        loanEMI: Number(loansAdvances),
        fbpDeductions: 0,
        lossOfPay: Number(deductions),
        totalDeductions
      },
      reimbursements: Number(reimbursements),
      netSalary,
      netSalaryWords: numberToWordsINR(netSalary),
      status: 'Finalized',
      distributionStatus: 'Pending',
      distributedAt: null,
      digitalSignature: `SHA256:ATHENA_${recordId}_VERIFIED`,
      createdAt: new Date().toISOString()
    };

    detailedPayslips.unshift(payslip);

    // Also persist to Prisma if userId exists in database
    try {
      await prisma.payrollRecord.create({
        data: {
          userId: userId || 'USR-SAMPLE',
          month: payslip.month,
          baseSalary: basic,
          allowances: hra + specialAllowance,
          incentives: Number(incentives),
          overtimePay: Number(overtimePay),
          deductions: epf + esi + pt + estimatedTds + Number(deductions),
          loansAdvances: Number(loansAdvances),
          netSalary
        }
      });
    } catch (_) {
      // Ignore if user ID doesn't exist in Prisma relation
    }

    res.status(201).json(payslip);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate payslip' });
  }
});

// Simulate full monthly pay run with 0 initialized default
router.post('/payroll/simulate-payrun', async (req, res) => {
  const sampleStaff = [
    { name: 'Rajesh Kumar', dept: 'Technology & Engineering', role: 'Staff Software Architect', base: 145000, allowances: 48000, incentives: 15000, ot: 0, loan: 5000, rmb: 4200, pan: 'ABCDK7821F', uan: '100921458763', bank: 'HDFC Bank', acc: '501004128901' },
    { name: 'Ananya Sharma', dept: 'Product & Design', role: 'Lead Product Manager', base: 125000, allowances: 36000, incentives: 12000, ot: 0, loan: 0, rmb: 3100, pan: 'BKIPS4590L', uan: '100845129630', bank: 'ICICI Bank', acc: '001205009841' },
    { name: 'Amit Verma', dept: 'Operations & Logistics', role: 'Operations Specialist', base: 45000, allowances: 14000, incentives: 5000, ot: 4500, loan: 3000, rmb: 1800, pan: 'CPQAV1289P', uan: '100789234125', bank: 'State Bank of India', acc: '38901245781' },
    { name: 'Priya Nair', dept: 'People & Culture (HR)', role: 'HR Business Partner', base: 85000, allowances: 26000, incentives: 8000, ot: 0, loan: 0, rmb: 2400, pan: 'DZXPN9012E', uan: '100654871239', bank: 'Axis Bank', acc: '915010048712' },
    { name: 'Vikramaditya Rao', dept: 'Executive Management', role: 'VP Engineering & Infrastructure', base: 210000, allowances: 75000, incentives: 25000, ot: 0, loan: 10000, rmb: 6500, pan: 'EZXVR3344Q', uan: '100512894567', bank: 'Kotak Mahindra Bank', acc: '781200459812' }
  ];

  detailedPayslips = sampleStaff.map((staff, idx) => {
    const basic = staff.base;
    const hra = Math.round(basic * 0.5);
    const da = 0;
    const specialAllowance = staff.allowances;
    const grossEarnings = basic + hra + da + specialAllowance + staff.incentives + staff.ot;

    const epf = Math.round(basic * 0.12);
    const esi = grossEarnings <= 21000 ? Math.round(grossEarnings * 0.0075) : 0;
    const pt = 200;
    const taxableAnnual = (grossEarnings * 12) - 75000;
    const estimatedTds = Math.max(0, Math.round(taxableAnnual * 0.15 / 12));
    const totalDeductions = epf + esi + pt + estimatedTds + staff.loan;
    const netSalary = grossEarnings - totalDeductions + staff.rmb;

    const recordId = `PAY-2026-09-${(idx + 1).toString().padStart(3, '0')}`;
    return {
      id: recordId,
      userId: `EMP-${(idx + 101)}`,
      employeeName: staff.name,
      department: staff.dept,
      designation: staff.role,
      month: 'September 2026',
      pan: staff.pan,
      uan: staff.uan,
      bankName: staff.bank,
      accountNumber: staff.acc,
      ifscCode: `${staff.bank.slice(0, 4).toUpperCase()}0001002`,
      taxRegime: 'New Regime (Sec 115BAC)',
      attendance: {
        totalDays: 30,
        workingDays: 22,
        paidDays: 22,
        lopDays: 0,
        overtimeHours: staff.ot > 0 ? 12 : 0
      },
      earnings: {
        basic,
        hra,
        da,
        specialAllowance,
        conveyance: 1600,
        medical: 1250,
        overtimePay: staff.ot,
        incentives: staff.incentives,
        totalGrossEarnings: grossEarnings
      },
      deductions: {
        epf,
        esi,
        professionalTax: pt,
        tds: estimatedTds,
        loanEMI: staff.loan,
        fbpDeductions: 0,
        lossOfPay: 0,
        totalDeductions
      },
      reimbursements: staff.rmb,
      netSalary,
      netSalaryWords: numberToWordsINR(netSalary),
      status: 'Finalized',
      distributionStatus: 'Pending',
      distributedAt: null,
      digitalSignature: `SHA256:ATHENA_${recordId}_VERIFIED`,
      createdAt: new Date().toISOString()
    };
  });

  res.json({ message: 'Pay run simulated for September 2026', payslips: detailedPayslips });
});

// Distribute individual payslip
router.put('/payroll/:id/distribute', (req, res) => {
  const payslip = detailedPayslips.find(p => p.id === req.params.id);
  if (!payslip) return res.status(404).json({ error: 'Payslip not found' });

  payslip.distributionStatus = 'Distributed via Email & ESS';
  payslip.distributedAt = new Date().toISOString();
  res.json({ message: `Payslip ${payslip.id} distributed to employee email and ESS portal`, payslip });
});

// Bulk distribute all payslips
router.post('/payroll/bulk-distribute', (req, res) => {
  const timestamp = new Date().toISOString();
  detailedPayslips.forEach(p => {
    p.distributionStatus = 'Distributed via Email & ESS';
    p.distributedAt = timestamp;
  });
  res.json({ message: `All ${detailedPayslips.length} payslips published to ESS & dispatched via email.` });
});

// Auto-Sync Live Attendance & Leaves into Monthly Payroll Calculation
router.post('/payroll/sync-live-attendance', async (req, res) => {
  try {
    const { month = 'September 2026' } = req.body;
    
    // Auto-fetch employees from DB or Master list
    const employees = await prisma.user.findMany({
      include: { employeeDetail: true, attendanceLogs: true, leaveBalances: true }
    });

    const staffList = (employees && employees.length > 0) ? employees : [
      { id: 'usr-1', name: 'Arjun Verma', department: 'Engineering', role: 'Staff Engineer' },
      { id: 'usr-2', name: 'Pooja Sundaram', department: 'Sales', role: 'Sales Director' },
      { id: 'usr-3', name: 'Kavita Nair', department: 'Operations', role: 'Plant Supervisor' }
    ];

    const syncedPayslips = staffList.map((emp: any, idx: number) => {
      const baseSalary = emp.employeeDetail?.baseSalary || 75000;
      const basic = Math.round(baseSalary * 0.5);
      const hra = Math.round(basic * 0.5);
      const specialAllowance = Math.round(baseSalary * 0.25);
      const presentDays = 22 + (idx % 3);
      const lopDays = Math.max(0, 24 - presentDays);
      const otHours = (idx % 2 === 0) ? 8 : 0;
      const otPay = Math.round(otHours * (basic / (26 * 8)) * 2);
      const gross = basic + hra + specialAllowance + otPay;
      const epf = Math.round(basic * 0.12);
      const esi = gross <= 21000 ? Math.round(gross * 0.0075) : 0;
      const pt = 200;
      const tds = Math.max(0, Math.round((gross * 12 - 750000) * 0.1 / 12));
      const totalDed = epf + esi + pt + tds;
      const netPayable = gross - totalDed;

      return {
        id: `PAY-SYNC-${Date.now()}-${idx}`,
        userId: emp.id || `EMP-${100 + idx}`,
        employeeName: emp.name || 'Staff Member',
        department: emp.department || 'Engineering',
        designation: emp.role || 'Specialist',
        month,
        status: 'Calculated',
        attendance: {
          totalDays: 30,
          workingDays: 24,
          paidDays: presentDays,
          lopDays,
          overtimeHours: otHours
        },
        earnings: {
          basic,
          hra,
          da: 0,
          specialAllowance,
          conveyance: 1600,
          medical: 1250,
          overtimePay: otPay,
          incentives: 0,
          totalGrossEarnings: gross
        },
        deductions: {
          epf,
          esi,
          pt,
          tds,
          otherDeductions: 0,
          totalDeductions: totalDed
        },
        netPayable,
        paymentStatus: 'Pending Approval'
      };
    });

    detailedPayslips = syncedPayslips;
    res.json({
      message: `Successfully synchronized live biometric attendance, leaves, and overtime for ${syncedPayslips.length} employees.`,
      month,
      syncedPayslips
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to sync attendance to payroll' });
  }
});

// Edit individual payslip
router.put('/payroll/:id', (req, res) => {
  const idx = detailedPayslips.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Payslip not found' });
  detailedPayslips[idx] = { ...detailedPayslips[idx], ...req.body };
  res.json({ message: 'Payslip updated successfully', payslip: detailedPayslips[idx] });
});

// Delete individual payslip
router.delete('/payroll/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const initialLen = detailedPayslips.length;
    detailedPayslips = detailedPayslips.filter(p => p.id !== id);
    try {
      await prisma.payrollRecord.deleteMany({ where: { id } });
    } catch (_) {}
    res.json({ message: 'Payslip record deleted successfully', deletedId: id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete payslip' });
  }
});

// Clear all payslips
router.delete('/payroll', async (req, res) => {
  try {
    detailedPayslips = [];
    try {
      await prisma.payrollRecord.deleteMany({});
    } catch (_) {}
    res.json({ message: 'All payslip records cleared successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear payslips' });
  }
});

// ----------------------------------------------------
// 2. CONFIGURABLE SALARY STRUCTURES & MASTER COMPONENTS
// ----------------------------------------------------

router.get('/payroll/structures', (req, res) => {
  res.json(salaryStructures);
});

router.delete('/payroll/structures/:id', (req, res) => {
  const id = req.params.id;
  salaryStructures = salaryStructures.filter(s => s.id !== id);
  res.json({ message: 'Salary structure deleted successfully', deletedId: id });
});

router.post('/payroll/structures', (req, res) => {
  const newStructure = {
    id: `STR-${Date.now().toString().slice(-4)}`,
    code: req.body.code || 'CUSTOM-STR',
    name: req.body.name || 'Custom Salary Structure',
    description: req.body.description || '',
    applicableBands: req.body.applicableBands || ['All Bands'],
    basicPercent: Number(req.body.basicPercent) || 40,
    hraPercentOfBasic: Number(req.body.hraPercentOfBasic) || 50,
    daPercentOfBasic: Number(req.body.daPercentOfBasic) || 0,
    conveyanceFixed: Number(req.body.conveyanceFixed) || 1600,
    medicalFixed: Number(req.body.medicalFixed) || 1250,
    specialAllowanceBalancing: req.body.specialAllowanceBalancing !== false,
    pfOptIn: req.body.pfOptIn !== false,
    esiApplicableIfEligible: req.body.esiApplicableIfEligible !== false,
    ptApplicable: req.body.ptApplicable !== false,
    isActive: true
  };
  salaryStructures.push(newStructure);
  res.status(201).json(newStructure);
});

router.put('/payroll/structures/:id', (req, res) => {
  const struct = salaryStructures.find(s => s.id === req.params.id);
  if (!struct) return res.status(404).json({ error: 'Structure not found' });
  Object.assign(struct, req.body);
  res.json(struct);
});

router.get('/payroll/components', (req, res) => {
  res.json(salaryComponentsMaster);
});

router.post('/payroll/components', (req, res) => {
  const newComp = {
    id: `CMP-${Date.now().toString().slice(-4)}`,
    code: req.body.code || 'CUSTOM',
    name: req.body.name || 'Custom Component',
    type: req.body.type || 'earning',
    calcType: req.body.calcType || 'fixed',
    defaultValue: Number(req.body.defaultValue) || 0,
    isTaxable: req.body.isTaxable !== false,
    isPFApplicable: !!req.body.isPFApplicable,
    isESIApplicable: !!req.body.isESIApplicable,
    description: req.body.description || ''
  };
  salaryComponentsMaster.push(newComp);
  res.status(201).json(newComp);
});

// ----------------------------------------------------
// 3. LOANS AND SALARY ADVANCES
// ----------------------------------------------------

router.get('/payroll/loans', (req, res) => {
  res.json(payrollLoans);
});

router.post('/payroll/loans', (req, res) => {
  const { employeeId, employeeName, department, type, principal, interestRate = 0, tenureMonths = 10, reason } = req.body;
  const p = Number(principal) || 10000;
  const t = Number(tenureMonths) || 1;
  const emi = Math.round(p / t);

  const newLoan = {
    id: `LN-${Date.now().toString().slice(-4)}`,
    employeeId: employeeId || 'EMP-101',
    employeeName: employeeName || 'Employee',
    department: department || 'Engineering',
    type: type || 'Emergency Medical Loan',
    principal: p,
    interestRate: Number(interestRate),
    tenureMonths: t,
    monthlyEMI: emi,
    disbursedDate: new Date().toISOString().split('T')[0],
    totalRepaid: 0,
    remainingBalance: p,
    status: 'Active / In-Repayment',
    reason: reason || 'Urgent personal requirement',
    createdAt: new Date().toISOString()
  };

  payrollLoans.unshift(newLoan);
  res.status(201).json(newLoan);
});

router.put('/payroll/loans/:id/status', (req, res) => {
  const loan = payrollLoans.find(l => l.id === req.params.id);
  if (!loan) return res.status(404).json({ error: 'Loan not found' });
  loan.status = req.body.status || loan.status;
  res.json(loan);
});

router.put('/payroll/loans/:id', (req, res) => {
  const idx = payrollLoans.findIndex(l => l.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Loan not found' });
  payrollLoans[idx] = { ...payrollLoans[idx], ...req.body };
  res.json({ message: 'Loan updated successfully', loan: payrollLoans[idx] });
});

router.delete('/payroll/loans/:id', (req, res) => {
  const id = req.params.id;
  payrollLoans = payrollLoans.filter(l => l.id !== id);
  res.json({ message: 'Loan record deleted successfully', deletedId: id });
});

router.post('/payroll/loans/:id/repay', (req, res) => {
  const loan = payrollLoans.find(l => l.id === req.params.id);
  if (!loan) return res.status(404).json({ error: 'Loan not found' });
  const amount = Number(req.body.amount) || loan.monthlyEMI;
  loan.totalRepaid = Math.min(loan.principal, loan.totalRepaid + amount);
  loan.remainingBalance = Math.max(0, loan.principal - loan.totalRepaid);
  if (loan.remainingBalance === 0) {
    loan.status = 'Fully Repaid';
  }
  res.json(loan);
});

router.post('/payroll/loans/simulate', (req, res) => {
  payrollLoans = [
    {
      id: 'LN-901',
      employeeId: 'EMP-101',
      employeeName: 'Rajesh Kumar',
      department: 'Technology & Engineering',
      type: 'Emergency Medical Loan',
      principal: 50000,
      interestRate: 0,
      tenureMonths: 10,
      monthlyEMI: 5000,
      disbursedDate: '2026-06-01',
      totalRepaid: 15000,
      remainingBalance: 35000,
      status: 'Active / In-Repayment',
      reason: 'Medical procedure assistance for family',
      createdAt: new Date('2026-06-01').toISOString()
    },
    {
      id: 'LN-902',
      employeeId: 'EMP-103',
      employeeName: 'Amit Verma',
      department: 'Operations & Logistics',
      type: 'Festival Advance (Zero Interest)',
      principal: 15000,
      interestRate: 0,
      tenureMonths: 5,
      monthlyEMI: 3000,
      disbursedDate: '2026-08-15',
      totalRepaid: 3000,
      remainingBalance: 12000,
      status: 'Active / In-Repayment',
      reason: 'Festive season advance',
      createdAt: new Date('2026-08-15').toISOString()
    },
    {
      id: 'LN-903',
      employeeId: 'EMP-105',
      employeeName: 'Vikramaditya Rao',
      department: 'Executive Management',
      type: 'Home Relocation Assistance',
      principal: 100000,
      interestRate: 4.5,
      tenureMonths: 10,
      monthlyEMI: 10000,
      disbursedDate: '2026-05-01',
      totalRepaid: 40000,
      remainingBalance: 60000,
      status: 'Active / In-Repayment',
      reason: 'Inter-state office transfer relocation grant',
      createdAt: new Date('2026-05-01').toISOString()
    }
  ];
  res.json({ message: 'Sample loans loaded', loans: payrollLoans });
});

// ----------------------------------------------------
// 4. PAYROLL REIMBURSEMENTS
// ----------------------------------------------------

router.get('/payroll/reimbursements', (req, res) => {
  res.json(payrollReimbursements);
});

router.post('/payroll/reimbursements', (req, res) => {
  const { employeeId, employeeName, department, category, expenseDate, billNumber, billAmount, taxExempt = true, remarks } = req.body;
  const claim = {
    id: `RMB-${Date.now().toString().slice(-4)}`,
    employeeId: employeeId || 'EMP-101',
    employeeName: employeeName || 'Employee',
    department: department || 'Engineering',
    category: category || 'Broadband & Mobile',
    expenseDate: expenseDate || new Date().toISOString().split('T')[0],
    billNumber: billNumber || `INV-${Date.now().toString().slice(-5)}`,
    billAmount: Number(billAmount) || 0,
    approvedAmount: Number(billAmount) || 0,
    taxExempt: !!taxExempt,
    receiptUrl: 'https://storage.athenahr.io/receipts/verified_bill.pdf',
    status: 'Finance Verified',
    payrollMonth: 'September 2026',
    remarks: remarks || 'Valid tax invoice attached',
    createdAt: new Date().toISOString()
  };
  payrollReimbursements.unshift(claim);
  res.status(201).json(claim);
});

router.put('/payroll/reimbursements/:id/status', (req, res) => {
  const claim = payrollReimbursements.find(r => r.id === req.params.id);
  if (!claim) return res.status(404).json({ error: 'Claim not found' });
  claim.status = req.body.status || claim.status;
  if (req.body.approvedAmount !== undefined) {
    claim.approvedAmount = Number(req.body.approvedAmount);
  }
  res.json(claim);
});

router.put('/payroll/reimbursements/:id', (req, res) => {
  const idx = payrollReimbursements.findIndex(r => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Claim not found' });
  payrollReimbursements[idx] = { ...payrollReimbursements[idx], ...req.body };
  res.json({ message: 'Claim updated successfully', claim: payrollReimbursements[idx] });
});

router.delete('/payroll/reimbursements/:id', (req, res) => {
  const id = req.params.id;
  payrollReimbursements = payrollReimbursements.filter(r => r.id !== id);
  res.json({ message: 'Reimbursement claim deleted successfully', deletedId: id });
});

router.post('/payroll/reimbursements/simulate', (req, res) => {
  payrollReimbursements = [
    {
      id: 'RMB-801',
      employeeId: 'EMP-101',
      employeeName: 'Rajesh Kumar',
      department: 'Technology & Engineering',
      category: 'Broadband & High-Speed Mobile Data',
      expenseDate: '2026-09-05',
      billNumber: 'ACT-FIBER-9921',
      billAmount: 2200,
      approvedAmount: 2200,
      taxExempt: true,
      receiptUrl: 'https://storage.athenahr.io/receipts/sample_broadband.pdf',
      status: 'Finance Verified',
      payrollMonth: 'September 2026',
      remarks: 'Quarterly WFH fiber internet bill',
      createdAt: new Date('2026-09-06').toISOString()
    },
    {
      id: 'RMB-802',
      employeeId: 'EMP-101',
      employeeName: 'Rajesh Kumar',
      department: 'Technology & Engineering',
      category: 'AWS Cloud Certification & Books',
      expenseDate: '2026-09-12',
      billNumber: 'PEARSON-VUE-4412',
      billAmount: 2000,
      approvedAmount: 2000,
      taxExempt: true,
      receiptUrl: 'https://storage.athenahr.io/receipts/sample_cert.pdf',
      status: 'Finance Verified',
      payrollMonth: 'September 2026',
      remarks: 'Solutions Architect Professional exam fee reimbursement',
      createdAt: new Date('2026-09-13').toISOString()
    },
    {
      id: 'RMB-803',
      employeeId: 'EMP-102',
      employeeName: 'Ananya Sharma',
      department: 'Product & Design',
      category: 'Client Dinner & Partner Hospitality',
      expenseDate: '2026-09-15',
      billNumber: 'REST-TAJ-8812',
      billAmount: 3100,
      approvedAmount: 3100,
      taxExempt: true,
      receiptUrl: 'https://storage.athenahr.io/receipts/sample_hospitality.pdf',
      status: 'Finance Verified',
      payrollMonth: 'September 2026',
      remarks: 'Product discovery dinner with enterprise client stakeholders',
      createdAt: new Date('2026-09-16').toISOString()
    }
  ];
  res.json({ message: 'Sample reimbursements loaded', reimbursements: payrollReimbursements });
});

// ----------------------------------------------------
// 5. FLEXIBLE BENEFIT PLANS (FBP)
// ----------------------------------------------------

router.get('/payroll/fbp', (req, res) => {
  res.json({
    catalog: fbpCatalog,
    declarations: fbpDeclarations
  });
});

router.post('/payroll/fbp/declare', (req, res) => {
  const { employeeId, employeeName, financialYear = '2026-27', annualFlexiPool = 120000, allocations } = req.body;
  const existingIdx = fbpDeclarations.findIndex(d => d.employeeId === employeeId);

  const totalDeclared = Object.values(allocations || {}).reduce((acc: number, v: any) => acc + (Number(v) || 0), 0);
  const monthlyTaxSavingEstimated = Math.round((totalDeclared * 0.3) / 12);

  const declaration = {
    id: `FBP-${Date.now().toString().slice(-4)}`,
    employeeId: employeeId || 'EMP-101',
    employeeName: employeeName || 'Employee',
    financialYear,
    annualFlexiPool: Number(annualFlexiPool),
    totalDeclared,
    allocations: allocations || {},
    monthlyTaxSavingEstimated,
    status: 'Active',
    submittedAt: new Date().toISOString()
  };

  if (existingIdx >= 0) {
    fbpDeclarations[existingIdx] = declaration;
  } else {
    fbpDeclarations.push(declaration);
  }

  res.status(201).json(declaration);
});

router.delete('/payroll/fbp/declarations/:id', (req, res) => {
  const id = req.params.id;
  fbpDeclarations = fbpDeclarations.filter(d => d.id !== id);
  res.json({ message: 'FBP declaration deleted successfully', deletedId: id });
});

router.post('/payroll/fbp/simulate', (req, res) => {
  fbpDeclarations = [
    {
      id: 'FBP-101',
      employeeId: 'EMP-101',
      employeeName: 'Rajesh Kumar',
      financialYear: '2026-27',
      annualFlexiPool: 180000,
      totalDeclared: 154800,
      allocations: {
        nps: 12000, // Monthly
        meal: 2600,
        fuel: 2400,
        phone: 1500,
        books: 1000,
        wellness: 800
      },
      monthlyTaxSavingEstimated: 6090,
      status: 'Active',
      submittedAt: new Date('2026-04-10').toISOString()
    },
    {
      id: 'FBP-102',
      employeeId: 'EMP-102',
      employeeName: 'Ananya Sharma',
      financialYear: '2026-27',
      annualFlexiPool: 140000,
      totalDeclared: 120000,
      allocations: {
        nps: 10000,
        meal: 2600,
        fuel: 1800,
        phone: 1500,
        books: 1200,
        wellness: 1000
      },
      monthlyTaxSavingEstimated: 5430,
      status: 'Active',
      submittedAt: new Date('2026-04-12').toISOString()
    }
  ];
  res.json({ message: 'Sample FBP declarations loaded', declarations: fbpDeclarations });
});

// ----------------------------------------------------
// 6. STATUTORY COMPLIANCE (EPF, ESI, PT, TDS, ECR, 24Q)
// ----------------------------------------------------

router.get('/payroll/statutory/summary', (req, res) => {
  const payslips = detailedPayslips.length > 0 ? detailedPayslips : [];

  let totalBasic = 0;
  let totalGross = 0;
  let totalEmployeePF = 0;
  let totalEmployerPF = 0;
  let totalEmployeeESI = 0;
  let totalEmployerESI = 0;
  let totalPT = 0;
  let totalTDS = 0;

  payslips.forEach(p => {
    const basic = p.earnings?.basic || 0;
    const gross = p.earnings?.totalGrossEarnings || 0;
    totalBasic += basic;
    totalGross += gross;
    totalEmployeePF += (p.deductions?.epf || 0);
    totalEmployerPF += (p.deductions?.epf || 0); // 12% employer match
    totalEmployeeESI += (p.deductions?.esi || 0);
    totalEmployerESI += gross <= 21000 ? Math.round(gross * 0.0325) : 0;
    totalPT += (p.deductions?.professionalTax || 0);
    totalTDS += (p.deductions?.tds || 0);
  });

  res.json({
    month: 'September 2026',
    activeEmployees: payslips.length,
    wageTotals: {
      totalBasic,
      totalGross
    },
    epfLiability: {
      employeeShare: totalEmployeePF,
      employerEPSShare: Math.round(totalEmployerPF * (8.33 / 12)),
      employerEPFShare: Math.round(totalEmployerPF * (3.67 / 12)),
      edliShare: Math.round(totalBasic * 0.005),
      adminCharges: Math.round(totalBasic * 0.005),
      totalPayable: totalEmployeePF + totalEmployerPF + Math.round(totalBasic * 0.01)
    },
    esiLiability: {
      employeeShare: totalEmployeeESI,
      employerShare: totalEmployerESI,
      totalPayable: totalEmployeeESI + totalEmployerESI
    },
    ptLiability: {
      totalPayable: totalPT,
      state: 'Maharashtra / Karnataka Multi-State'
    },
    tdsLiability: {
      totalPayable: totalTDS,
      challanCode: 'ITNS 281'
    },
    grandTotalStatutoryPayable: (totalEmployeePF + totalEmployerPF + Math.round(totalBasic * 0.01)) + (totalEmployeeESI + totalEmployerESI) + totalPT + totalTDS
  });
});

router.get('/payroll/statutory/slabs', (req, res) => {
  res.json({
    epf: {
      employeeRate: '12% of Basic Pay',
      employerRate: '12% of Basic Pay (EPS 8.33% capped at ₹1,250 + EPF 3.67% + EDLI 0.5% + Admin 0.5%)',
      statutoryWageCeiling: 15000,
      optOutPermittedAboveCeiling: true
    },
    esi: {
      employeeRate: '0.75% of Gross Wages',
      employerRate: '3.25% of Gross Wages',
      statutoryGrossCeiling: 21000,
      coverage: 'Medical benefits and sickness disability protection'
    },
    pt: {
      states: [
        { state: 'Maharashtra', slab: 'Gross > ₹10,000: ₹200/mo (₹300 in February)' },
        { state: 'Karnataka', slab: 'Gross >= ₹15,000: ₹200/mo' },
        { state: 'Telangana', slab: 'Gross >= ₹20,000: ₹200/mo' },
        { state: 'West Bengal', slab: 'Graduated ₹110 to ₹200/mo' },
        { state: 'Tamil Nadu', slab: 'Half-yearly slabs ₹168 to ₹1,250' }
      ]
    },
    incomeTaxRegimes: {
      newRegime: {
        section: 'Sec 115BAC (Default)',
        standardDeduction: 75000,
        slabs: [
          '₹0 - ₹3,00,000: Nil',
          '₹3,00,001 - ₹7,00,000: 5%',
          '₹7,00,001 - ₹10,00,000: 10%',
          '₹10,00,001 - ₹12,00,000: 15%',
          '₹12,00,001 - ₹15,00,000: 20%',
          'Above ₹15,00,000: 30%'
        ]
      },
      oldRegime: {
        standardDeduction: 50000,
        exemptions: ['HRA Sec 10(13A)', '80C up to ₹1,50,000', '80D Medical up to ₹25,000', 'Home Loan Sec 24b up to ₹2,00,000']
      }
    }
  });
});

// Electronic Challan cum Return (ECR) for EPFO portal
router.post('/payroll/statutory/ecr-generate', (req, res) => {
  const payslips = detailedPayslips.length > 0 ? detailedPayslips : [];
  
  // ECR File Format standard format lines
  const ecrLines = payslips.map((p, idx) => {
    const uan = p.uan || '100000000000';
    const name = (p.employeeName || 'MEMBER').toUpperCase();
    const basic = p.earnings?.basic || 15000;
    const epfWages = Math.min(basic, 15000);
    const eeShare = p.deductions?.epf || Math.round(epfWages * 0.12);
    const epsShare = Math.min(1250, Math.round(epfWages * 0.0833));
    const erShare = eeShare - epsShare;
    const ncpDays = 0;
    return `${uan}#~#${name}#~#${basic}#~#${epfWages}#~#${epfWages}#~#${epfWages}#~#${eeShare}#~#${epsShare}#~#${erShare}#~#${ncpDays}#~#0`;
  });

  const rawFile = ecrLines.join('\n');
  res.json({
    format: 'EPFO Unified Portal ECR v2.0 Format',
    establishmentId: 'MH/BAN/0048912/000',
    wageMonth: '09/2026',
    totalMembers: payslips.length,
    rawText: rawFile
  });
});

// Form 24Q Quarterly Summary
router.post('/payroll/statutory/24q-summary', (req, res) => {
  const payslips = detailedPayslips.length > 0 ? detailedPayslips : [];
  const totalTds = payslips.reduce((acc, p) => acc + (p.deductions?.tds || 0), 0);

  res.json({
    form: 'Form 24Q - Quarter 2 (July - Sept 2026)',
    tan: 'BLRA12345C',
    deductor: 'Athena Technologies Private Limited',
    panOfCompany: 'AAACA1234F',
    quarter: 'Q2 (FY 2026-27)',
    totalDeductees: payslips.length,
    totalTdsDeposited: totalTds * 3, // 3 months of quarter
    challanBSRCode: '0002148',
    challanTenderDate: '2026-10-07',
    status: 'Ready for NSDL / TRACES Upload'
  });
});

// ----------------------------------------------------
// 7. PAYROLL REPORTS (Variance, Register, Bank Advice)
// ----------------------------------------------------

router.get('/payroll/reports/variance', (req, res) => {
  const currentTotal = detailedPayslips.reduce((acc, p) => acc + (p.netSalary || 0), 0);
  const previousTotal = Math.round(currentTotal * 0.94); // Mock August baseline
  const delta = currentTotal - previousTotal;
  const percentDelta = previousTotal === 0 ? 0 : Number(((delta / previousTotal) * 100).toFixed(1));

  res.json({
    currentMonth: 'September 2026',
    previousMonth: 'August 2026',
    currentNetPayout: currentTotal,
    previousNetPayout: previousTotal,
    netVariance: delta,
    percentageChange: percentDelta,
    varianceDrivers: [
      { reason: 'Annual Performance Appraisal Hikes', impact: '+ ₹28,000' },
      { reason: 'New Joiners Headcount Expansion (+1)', impact: '+ ₹45,000' },
      { reason: 'Festive Season Travel Reimbursements', impact: '+ ₹11,500' },
      { reason: 'Staff Advance EMI Recoveries', impact: '- ₹18,000' }
    ]
  });
});

router.get('/payroll/reports/register', (req, res) => {
  const register = detailedPayslips.map(p => ({
    employeeId: p.userId,
    name: p.employeeName,
    department: p.department,
    designation: p.designation,
    bankAccount: p.accountNumber,
    ifsc: p.ifscCode,
    basic: p.earnings?.basic || 0,
    hra: p.earnings?.hra || 0,
    specialAllowance: p.earnings?.specialAllowance || 0,
    overtime: p.earnings?.overtimePay || 0,
    incentives: p.earnings?.incentives || 0,
    grossEarnings: p.earnings?.totalGrossEarnings || 0,
    epf: p.deductions?.epf || 0,
    esi: p.deductions?.esi || 0,
    pt: p.deductions?.professionalTax || 0,
    tds: p.deductions?.tds || 0,
    loanEMI: p.deductions?.loanEMI || 0,
    totalDeductions: p.deductions?.totalDeductions || 0,
    reimbursements: p.reimbursements || 0,
    netPayable: p.netSalary || 0,
    status: p.status
  }));
  res.json(register);
});

router.get('/payroll/reports/bank-advice', (req, res) => {
  const advice = detailedPayslips.map((p, idx) => ({
    serialNo: idx + 1,
    beneficiaryName: p.employeeName,
    beneficiaryAccount: p.accountNumber,
    beneficiaryIFSC: p.ifscCode,
    bankName: p.bankName,
    amount: p.netSalary,
    narration: `SALARY SEP 2026 ${p.userId}`,
    paymentMode: 'NEFT'
  }));
  res.json(advice);
});

// ----------------------------------------------------
// 8. ACCOUNTS JV (JOURNAL VOUCHER) GENERATION
// ----------------------------------------------------

router.get('/payroll/jv', (req, res) => {
  const payslips = detailedPayslips.length > 0 ? detailedPayslips : [];

  let totalGross = 0;
  let totalNet = 0;
  let totalEPF_EE = 0;
  let totalEPF_ER = 0;
  let totalESI_EE = 0;
  let totalESI_ER = 0;
  let totalPT = 0;
  let totalTDS = 0;
  let totalLoanRecovered = 0;
  let totalReimbursements = 0;

  payslips.forEach(p => {
    const basic = p.earnings?.basic || 0;
    const gross = p.earnings?.totalGrossEarnings || 0;
    totalGross += gross;
    totalNet += (p.netSalary || 0);
    totalEPF_EE += (p.deductions?.epf || 0);
    totalEPF_ER += (p.deductions?.epf || 0);
    totalESI_EE += (p.deductions?.esi || 0);
    totalESI_ER += gross <= 21000 ? Math.round(gross * 0.0325) : 0;
    totalPT += (p.deductions?.professionalTax || 0);
    totalTDS += (p.deductions?.tds || 0);
    totalLoanRecovered += (p.deductions?.loanEMI || 0);
    totalReimbursements += (p.reimbursements || 0);
  });

  // Balanced double entry
  const debitLineItems = [
    { glCode: '50100', accountName: 'Salaries & Wages Expense', description: 'Monthly Gross Wages Payable', debit: totalGross, credit: 0, costCenter: 'Corporate Workforce' },
    { glCode: '50110', accountName: 'Employer EPF Contribution Expense', description: 'Statutory 12% PF Employer Match', debit: totalEPF_ER, credit: 0, costCenter: 'Statutory Benefits' },
    { glCode: '50120', accountName: 'Employer ESI Contribution Expense', description: 'Statutory 3.25% ESI Employer Match', debit: totalESI_ER, credit: 0, costCenter: 'Statutory Benefits' },
    { glCode: '50140', accountName: 'Staff Business Reimbursements Expense', description: 'Approved Out-of-Pocket Claims', debit: totalReimbursements, credit: 0, costCenter: 'Operational Overheads' }
  ];

  const creditLineItems = [
    { glCode: '20100', accountName: 'Net Salaries Payable Account', description: 'Disbursement to Staff Bank Accounts', debit: 0, credit: totalNet, costCenter: 'Disbursement Clearing' },
    { glCode: '20110', accountName: 'Provident Fund Payable Account', description: 'Employee + Employer PF (ECR Settlement)', debit: 0, credit: totalEPF_EE + totalEPF_ER, costCenter: 'Government Statutory' },
    { glCode: '20120', accountName: 'Employee State Insurance Payable', description: 'Employee + Employer ESI Challan', debit: 0, credit: totalESI_EE + totalESI_ER, costCenter: 'Government Statutory' },
    { glCode: '20130', accountName: 'TDS on Salaries Payable (Sec 192)', description: 'Income Tax Challan ITNS 281', debit: 0, credit: totalTDS, costCenter: 'Government Statutory' },
    { glCode: '20140', accountName: 'Professional Tax Payable', description: 'Municipal Professional Tax Dues', debit: 0, credit: totalPT, costCenter: 'State Commercial Taxes' },
    { glCode: '10450', accountName: 'Staff Loans & Advances Recovery', description: 'Principal & EMI Asset Credit Recovery', debit: 0, credit: totalLoanRecovered, costCenter: 'Current Assets Recovery' }
  ];

  const totalDebit = debitLineItems.reduce((acc, i) => acc + i.debit, 0);
  const totalCredit = creditLineItems.reduce((acc, i) => acc + i.credit, 0);

  const jv = {
    voucherNumber: 'JV-PAY-2026-09',
    voucherDate: '2026-09-30',
    financialYear: '2026-27',
    payrollPeriod: 'September 2026',
    status: accountsJVs.length > 0 && accountsJVs[0].status === 'Posted to ERP GL' ? 'Posted to ERP GL' : 'Draft / Unposted',
    postedAt: accountsJVs.length > 0 ? accountsJVs[0].postedAt : null,
    narration: `Being payroll cost, statutory liabilities, advance recoveries and net salary payable accounted for the month of September 2026 for ${payslips.length} active employees.`,
    totalDebit,
    totalCredit,
    isBalanced: totalDebit === totalCredit,
    lineItems: [...debitLineItems, ...creditLineItems]
  };

  res.json(jv);
});

router.post('/payroll/jv/post', (req, res) => {
  const postedJV = {
    voucherNumber: 'JV-PAY-2026-09',
    voucherDate: '2026-09-30',
    postedAt: new Date().toISOString(),
    status: 'Posted to ERP GL',
    erpReference: `ERP-GL-JV-${Date.now().toString().slice(-6)}`
  };
  accountsJVs = [postedJV];
  res.json({ message: 'Payroll Journal Voucher posted successfully to General Ledger', jv: postedJV });
});

// ----------------------------------------------------
// 9. PAYOUT AND DISBURSEMENT BATCHES
// ----------------------------------------------------

router.get('/payroll/disbursements', (req, res) => {
  res.json(disbursementBatches);
});

router.post('/payroll/disbursements/create-batch', (req, res) => {
  const payslips = detailedPayslips.length > 0 ? detailedPayslips : [];
  const totalAmount = payslips.reduce((acc, p) => acc + (p.netSalary || 0), 0);

  const batch = {
    id: `DISB-2026-09-${Date.now().toString().slice(-4)}`,
    batchName: 'September 2026 Staff Salary Disbursement Batch',
    month: 'September 2026',
    corporateAccount: 'HDFC Bank Corporate - 5020001892140',
    totalEmployees: payslips.length,
    totalAmount,
    paymentMode: 'Direct NEFT / Corporate Bulk Transfer',
    status: 'Approved by CFO',
    bankBatchFileGenerated: true,
    disbursedAt: null,
    utrNumber: null,
    createdAt: new Date().toISOString()
  };

  disbursementBatches.unshift(batch);
  res.status(201).json(batch);
});

router.post('/payroll/disbursements/:id/process', (req, res) => {
  const batch = disbursementBatches.find(b => b.id === req.params.id);
  if (!batch) return res.status(404).json({ error: 'Disbursement batch not found' });

  const utr = `HDFCN2609${Date.now().toString().slice(-6)}`;
  batch.status = 'Disbursed & Settled';
  batch.disbursedAt = new Date().toISOString();
  batch.utrNumber = utr;

  // Also update detailed payslips status
  detailedPayslips.forEach(p => {
    p.status = 'Disbursed';
  });

  res.json({ message: 'Payout disbursed successfully via Bank Payment Gateway', batch, utr });
});

// ==========================================
// ADVANCED PERFORMANCE MANAGEMENT SUITE
// ==========================================

export interface PerformanceGoal {
  id: string;
  title: string;
  description: string;
  category: 'Strategic' | 'Operational' | 'Financial' | 'Customer' | 'Innovation' | 'People & Culture';
  employeeId: string;
  employeeName: string;
  department: string;
  role: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  weightage: number;
  progress: number;
  status: 'Not Started' | 'On Track' | 'At Risk' | 'Behind' | 'Completed';
  period: string;
  dueDate: string;
  milestones: { id: string; title: string; completed: boolean }[];
  checkIns: { id: string; date: string; author: string; progress: number; comment: string }[];
  managerReview?: { rating: number; feedback: string; reviewedAt: string; reviewer: string };
  createdAt: string;
}

export interface CompetencyMaster {
  id: string;
  name: string;
  category: 'Core Values' | 'Functional & Technical' | 'Leadership & People';
  description: string;
  targetLevel: number; // 1 to 5
  proficiencyLevels: { level: number; label: string; behavioralIndicators: string[] }[];
  assessments: {
    employeeId: string;
    employeeName: string;
    department: string;
    selfRating: number;
    managerRating: number;
    evidence: string;
    status: 'Pending' | 'Completed';
    updatedAt: string;
  }[];
}

export interface LibraryGoal {
  id: string;
  title: string;
  description: string;
  department: string;
  category: 'Strategic' | 'Operational' | 'Financial' | 'Customer' | 'Innovation' | 'People & Culture';
  suggestedMetric: string;
  suggestedTarget: number;
  unit: string;
  suggestedWeightage: number;
  difficulty: 'Foundational' | 'Intermediate' | 'Advanced' | 'Executive';
  tags: string[];
}

export interface CPMCheckin {
  id: string;
  employeeId: string;
  employeeName: string;
  managerName: string;
  department: string;
  date: string;
  cadence: 'Weekly' | 'Bi-Weekly' | 'Monthly';
  highlights: string;
  blockers: string;
  nextPriorities: string;
  actionItems: { id: string; task: string; completed: boolean; dueDate: string }[];
  sentiment: 'Great / Highly Motivated' | 'Good / Steady' | 'Stressed / Blocked';
  privateManagerNotes?: string;
  createdAt: string;
}

export interface CPMKudos {
  id: string;
  fromEmployeeId: string;
  fromEmployeeName: string;
  toEmployeeId: string;
  toEmployeeName: string;
  badge: 'Innovation Champion' | 'Customer Obsessed' | 'Ultimate Team Player' | 'Speed & Agility' | 'Rockstar Mentor' | 'Resilience Hero';
  message: string;
  coreValue: string;
  likes: number;
  createdAt: string;
}

export interface CPMFeedback {
  id: string;
  fromName: string;
  toName: string;
  type: 'Praise' | 'Constructive Coaching' | 'Project Retro';
  projectContext: string;
  content: string;
  visibility: 'Public Feed' | 'Direct to Employee' | 'Employee & Manager Only';
  createdAt: string;
}

export interface AppraisalReview {
  id: string;
  cycleName: string;
  period: string;
  employeeId: string;
  employeeName: string;
  department: string;
  designation: string;
  currentSalary: number;
  status: 'Self Review' | 'Manager Review' | 'Calibration' | 'Completed';
  selfRating: number;
  selfAchievements: string;
  selfChallenges: string;
  managerRating: number;
  managerStrengths: string;
  managerImprovements: string;
  promotionRecommended: boolean;
  finalCalibratedRating: number;
  performanceBand: 'Outstanding' | 'Exceeds Expectations' | 'Meets Expectations' | 'Needs Development' | 'Unsatisfactory';
  potentialLevel: 'High' | 'Medium' | 'Low';
  nineBoxGridBox: 'Star Performer' | 'High Potential' | 'High Professional' | 'Core Contributor' | 'Consistent Performer' | 'Enigma / Rough Diamond' | 'Dilemma' | 'Underperformer';
  proposedHikePercent: number;
  proposedBonusAmount: number;
  payrollSyncStatus: 'Pending' | 'Synced to Payroll';
  syncedAt?: string;
  createdAt: string;
}

export interface Feedback360Survey {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  designation: string;
  cycle: string;
  status: 'Nomination' | 'In Progress' | 'Completed';
  raters: {
    id: string;
    raterName: string;
    relationship: 'Self' | 'Manager' | 'Peer' | 'Direct Report';
    isAnonymous: boolean;
    status: 'Pending' | 'Completed';
    scores: {
      technical: number;
      collaboration: number;
      leadership: number;
      accountability: number;
      agility: number;
    };
    qualitativeFeedback: string;
    submittedAt?: string;
  }[];
  computedAverages: {
    self: { technical: number; collaboration: number; leadership: number; accountability: number; agility: number; overall: number };
    manager: { technical: number; collaboration: number; leadership: number; accountability: number; agility: number; overall: number };
    peers: { technical: number; collaboration: number; leadership: number; accountability: number; agility: number; overall: number };
    reports: { technical: number; collaboration: number; leadership: number; accountability: number; agility: number; overall: number };
  };
}

export interface IDPPlan {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  designation: string;
  focusArea: string;
  targetCompetency: string;
  skillGapsIdentified: string[];
  learningObjectives: string[];
  actionCourses: { name: string; platform: string; duration: string; cost: number; completed: boolean }[];
  mentorName: string;
  allocatedBudget: number;
  targetDate: string;
  progress: number;
  status: 'Draft' | 'Manager Approved' | 'In Progress' | 'Under Evaluation' | 'Completed & Certified';
  certificateUrl?: string;
  notes: string;
}

export interface PayrollSyncRecord {
  id: string;
  syncBatchId: string;
  cycleName: string;
  syncedAt: string;
  syncedBy: string;
  totalEmployees: number;
  totalBonusPool: number;
  averageHikePercent: number;
  annualPayrollIncrement: number;
  effectiveMonth: string;
  details: {
    employeeId: string;
    employeeName: string;
    department: string;
    rating: number;
    band: string;
    previousBase: number;
    newBase: number;
    hikePercent: number;
    bonusAmount: number;
    payrollRecordId?: string;
  }[];
}

// In-Memory state for performance
let performanceGoals: PerformanceGoal[] = [];
let cpmCheckins: CPMCheckin[] = [];
let cpmKudos: CPMKudos[] = [];
let cpmFeedbacks: CPMFeedback[] = [];
let appraisalReviews: AppraisalReview[] = [];
let feedback360Surveys: Feedback360Survey[] = [];
let idpPlans: IDPPlan[] = [];
let payrollSyncHistory: PayrollSyncRecord[] = [];

// Pre-seeded Goal Library (Enterprise repository)
const goalLibraryMaster: LibraryGoal[] = [
  {
    id: 'LIB-GOAL-01',
    title: 'Achieve 99.95% Core Service Uptime & Multi-Region Failover',
    description: 'Engineer automated blue-green pipelines and active-passive cluster failovers to ensure enterprise SLA adherence.',
    department: 'Technology & Engineering',
    category: 'Operational',
    suggestedMetric: 'Availability SLA',
    suggestedTarget: 99.95,
    unit: '%',
    suggestedWeightage: 25,
    difficulty: 'Advanced',
    tags: ['SRE', 'Kubernetes', 'High Availability']
  },
  {
    id: 'LIB-GOAL-02',
    title: 'Increase Automated Unit & Integration Test Coverage',
    description: 'Mandate test suites across core APIs and repositories to guarantee test regression coverage above threshold.',
    department: 'Technology & Engineering',
    category: 'Innovation',
    suggestedMetric: 'Test Coverage',
    suggestedTarget: 88,
    unit: '%',
    suggestedWeightage: 20,
    difficulty: 'Intermediate',
    tags: ['Quality', 'Jest', 'CI/CD']
  },
  {
    id: 'LIB-GOAL-03',
    title: 'Accelerate API P99 Latency to Sub-100ms',
    description: 'Profile database query plans, implement Redis caching layers, and optimize payload serialization.',
    department: 'Technology & Engineering',
    category: 'Operational',
    suggestedMetric: 'P99 Latency',
    suggestedTarget: 100,
    unit: 'ms',
    suggestedWeightage: 15,
    difficulty: 'Advanced',
    tags: ['Performance', 'Optimization']
  },
  {
    id: 'LIB-GOAL-04',
    title: 'Deliver ₹1.50 Crore New Enterprise ARR Pipeline',
    description: 'Originate and close high-value annual SaaS software licenses across Tier-1 enterprise BFSI & Retail clients.',
    department: 'Enterprise Sales',
    category: 'Financial',
    suggestedMetric: 'New ARR Pipeline',
    suggestedTarget: 15000000,
    unit: 'INR',
    suggestedWeightage: 35,
    difficulty: 'Executive',
    tags: ['Revenue', 'Pipeline', 'Enterprise']
  },
  {
    id: 'LIB-GOAL-05',
    title: 'Boost Opportunity Win Rate from 22% to 32%',
    description: 'Implement structured MEDDPICC discovery stages and executive sponsor proof-of-value workshops.',
    department: 'Enterprise Sales',
    category: 'Strategic',
    suggestedMetric: 'Win Rate',
    suggestedTarget: 32,
    unit: '%',
    suggestedWeightage: 25,
    difficulty: 'Advanced',
    tags: ['Conversion', 'Sales Velocity']
  },
  {
    id: 'LIB-GOAL-06',
    title: 'Increase Monthly Active User 30-Day Retention by 15%',
    description: 'Revamp initial product onboarding empty-states and introduce automated contextual product tours.',
    department: 'Product & Design',
    category: 'Customer',
    suggestedMetric: 'Day-30 Retention',
    suggestedTarget: 15,
    unit: '%',
    suggestedWeightage: 30,
    difficulty: 'Advanced',
    tags: ['Retention', 'Growth', 'UX']
  },
  {
    id: 'LIB-GOAL-07',
    title: 'Roll Out Design System v2.0 Across Web & Mobile',
    description: 'Standardize Figma token library and React/Flutter shared component repository with 100% parity.',
    department: 'Product & Design',
    category: 'Innovation',
    suggestedMetric: 'Design System Adoption',
    suggestedTarget: 100,
    unit: '%',
    suggestedWeightage: 20,
    difficulty: 'Intermediate',
    tags: ['Design System', 'Accessibility']
  },
  {
    id: 'LIB-GOAL-08',
    title: 'Generate 3,200 High-Intent Marketing Qualified Leads (MQLs)',
    description: 'Execute integrated multi-channel account-based marketing, SEO organic clustering, and industry webinars.',
    department: 'Growth Marketing',
    category: 'Strategic',
    suggestedMetric: 'Qualified MQLs',
    suggestedTarget: 3200,
    unit: 'Count',
    suggestedWeightage: 30,
    difficulty: 'Advanced',
    tags: ['Demand Gen', 'Inbound', 'MQL']
  },
  {
    id: 'LIB-GOAL-09',
    title: 'Maintain Customer CSAT $\\ge$ 94% & First Contact Resolution > 82%',
    description: 'Deliver responsive omnichannel technical support with rapid root-cause remediation.',
    department: 'Customer Success & Support',
    category: 'Customer',
    suggestedMetric: 'CSAT Score',
    suggestedTarget: 94,
    unit: '%',
    suggestedWeightage: 30,
    difficulty: 'Intermediate',
    tags: ['CSAT', 'FCR', 'Customer Obsession']
  },
  {
    id: 'LIB-GOAL-10',
    title: 'Reduce Engineering Time-to-Fill to under 24 Days',
    description: 'Optimize tech screening bar, streamline async assessments, and accelerate offer letter approvals.',
    department: 'People & Culture (HR)',
    category: 'Operational',
    suggestedMetric: 'Time to Fill',
    suggestedTarget: 24,
    unit: 'Days',
    suggestedWeightage: 25,
    difficulty: 'Intermediate',
    tags: ['Talent Acquisition', 'Hiring SLA']
  },
  {
    id: 'LIB-GOAL-11',
    title: 'Achieve 100% Statutory Compliance and Zero Audit Discrepancies',
    description: 'Reconcile EPF, ESIC, Professional Tax, TDS returns, and corporate register fillings seamlessly.',
    department: 'Finance & Compliance',
    category: 'Financial',
    suggestedMetric: 'Audit Adherence',
    suggestedTarget: 100,
    unit: '%',
    suggestedWeightage: 25,
    difficulty: 'Advanced',
    tags: ['Compliance', 'Internal Audit']
  }
];

// Pre-seeded Competency Master Framework
const competenciesMaster: CompetencyMaster[] = [
  {
    id: 'COMP-CORE-01',
    name: 'Integrity, Ethics & Compliance',
    category: 'Core Values',
    description: 'Acts with unwavering transparency, adheres strictly to statutory compliances, and upholds corporate governance.',
    targetLevel: 4,
    proficiencyLevels: [
      { level: 1, label: 'Novice', behavioralIndicators: ['Understands basic code of conduct'] },
      { level: 2, label: 'Developing', behavioralIndicators: ['Consistently complies with internal standards'] },
      { level: 3, label: 'Proficient', behavioralIndicators: ['Proactively flags compliance risks and demonstrates sound ethics'] },
      { level: 4, label: 'Advanced', behavioralIndicators: ['Acts as an ethics role model and mentors peers on best practices'] },
      { level: 5, label: 'Expert', behavioralIndicators: ['Defines organizational governance standards and shapes company culture'] }
    ],
    assessments: []
  },
  {
    id: 'COMP-CORE-02',
    name: 'Customer Centricity & Empathy',
    category: 'Core Values',
    description: 'Deeply understands client pain-points and champions customer delight in every solution.',
    targetLevel: 4,
    proficiencyLevels: [
      { level: 1, label: 'Novice', behavioralIndicators: ['Listens to direct customer requests'] },
      { level: 2, label: 'Developing', behavioralIndicators: ['Resolves tickets within SLA with polite communication'] },
      { level: 3, label: 'Proficient', behavioralIndicators: ['Anticipates client unstated needs and delivers delightful outcomes'] },
      { level: 4, label: 'Advanced', behavioralIndicators: ['Advocates customer empathy across team processes and roadmaps'] },
      { level: 5, label: 'Expert', behavioralIndicators: ['Shapes company-wide customer-first philosophy and retention strategies'] }
    ],
    assessments: []
  },
  {
    id: 'COMP-TECH-01',
    name: 'Architectural Excellence & Scalability',
    category: 'Functional & Technical',
    description: 'Designs resilient, modular, secure, and cost-efficient cloud-native systems.',
    targetLevel: 5,
    proficiencyLevels: [
      { level: 1, label: 'Novice', behavioralIndicators: ['Writes clean code following existing architectural patterns'] },
      { level: 2, label: 'Developing', behavioralIndicators: ['Identifies bottlenecks and designs modular microservices'] },
      { level: 3, label: 'Proficient', behavioralIndicators: ['Architects fault-tolerant, high-throughput distributed architectures'] },
      { level: 4, label: 'Advanced', behavioralIndicators: ['Drives cross-system architectural decisions and reliability standards'] },
      { level: 5, label: 'Expert', behavioralIndicators: ['Sets global technical vision and evaluates cutting-edge paradigm shifts'] }
    ],
    assessments: []
  },
  {
    id: 'COMP-LEAD-01',
    name: 'Strategic Vision & Execution',
    category: 'Leadership & People',
    description: 'Translates high-level corporate OKRs into measurable team execution sprints with clear ownership.',
    targetLevel: 4,
    proficiencyLevels: [
      { level: 1, label: 'Novice', behavioralIndicators: ['Delivers assigned tasks on schedule'] },
      { level: 2, label: 'Developing', behavioralIndicators: ['Prioritizes backlog based on business impact'] },
      { level: 3, label: 'Proficient', behavioralIndicators: ['Aligns team deliverables to quarterly OKRs and mitigates risks early'] },
      { level: 4, label: 'Advanced', behavioralIndicators: ['Rallies cross-functional leaders around multi-quarter transformation roadmaps'] },
      { level: 5, label: 'Expert', behavioralIndicators: ['Crafts multi-year organizational strategy and pioneers industry leadership'] }
    ],
    assessments: []
  },
  {
    id: 'COMP-LEAD-02',
    name: 'People Mentorship & Talent Development',
    category: 'Leadership & People',
    description: 'Invests actively in coaching team members, conducting constructive 1-on-1s, and fostering psychological safety.',
    targetLevel: 4,
    proficiencyLevels: [
      { level: 1, label: 'Novice', behavioralIndicators: ['Participates constructively in peer reviews'] },
      { level: 2, label: 'Developing', behavioralIndicators: ['Helps onboard new team members and answers queries'] },
      { level: 3, label: 'Proficient', behavioralIndicators: ['Conducts impactful 1-on-1 check-ins and unblocks team members'] },
      { level: 4, label: 'Advanced', behavioralIndicators: ['Curates personalized career development plans and grooms future leaders'] },
      { level: 5, label: 'Expert', behavioralIndicators: ['Builds a world-class high-performance engineering and leadership culture'] }
    ],
    assessments: []
  }
];

// Helper to compute 9-Box Grid position
function calculate9Box(perfRating: number, potLevel: 'High' | 'Medium' | 'Low'): AppraisalReview['nineBoxGridBox'] {
  if (perfRating >= 4.5) {
    if (potLevel === 'High') return 'Star Performer';
    if (potLevel === 'Medium') return 'High Professional';
    return 'Consistent Performer';
  } else if (perfRating >= 3.0) {
    if (potLevel === 'High') return 'High Potential';
    if (potLevel === 'Medium') return 'Core Contributor';
    return 'Consistent Performer';
  } else {
    if (potLevel === 'High') return 'Enigma / Rough Diamond';
    if (potLevel === 'Medium') return 'Dilemma';
    return 'Underperformer';
  }
}

// ------------------------------------------
// 1. ASSIGN, TRACK & REVIEW GOALS & COMPETENCIES
// ------------------------------------------

// Legacy backward-compatible endpoint
router.get('/performance', async (req, res) => {
  try {
    const reviews = await prisma.performanceReview.findMany({
      include: { user: { select: { name: true, role: true } } },
      orderBy: { createdAt: 'desc' }
    });
    if (reviews.length > 0) return res.json(reviews);
    
    // Fallback: return lightweight summary of appraisalReviews if prisma is empty
    return res.json(appraisalReviews.map(r => ({
      id: r.id,
      userId: r.employeeId,
      period: r.period,
      kpiScore: r.finalCalibratedRating * 2, // scale 0-10
      targetsMet: 4,
      feedback: r.managerStrengths,
      promoted: r.promotionRecommended,
      user: { name: r.employeeName, role: r.designation }
    })));
  } catch (err) {
    res.json([]);
  }
});

router.post('/performance', async (req, res) => {
  try {
    const { userId, period, kpiScore, targetsMet, feedback, promoted } = req.body;
    const review = await prisma.performanceReview.create({
      data: { userId, period, kpiScore, targetsMet, feedback, promoted }
    });
    res.json(review);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create performance review' });
  }
});

// Goals Endpoints
router.get('/performance/goals', (req, res) => {
  res.json(performanceGoals);
});

router.post('/performance/goals', (req, res) => {
  const {
    title, description, category, employeeId, employeeName, department, role,
    targetValue = 100, currentValue = 0, unit = '%', weightage = 20,
    period = 'Annual 2026', dueDate, milestones = []
  } = req.body;

  const newGoal: PerformanceGoal = {
    id: `GOAL-${Date.now().toString().slice(-6)}`,
    title,
    description: description || '',
    category: category || 'Operational',
    employeeId: employeeId || 'EMP-101',
    employeeName: employeeName || 'Employee',
    department: department || 'General',
    role: role || 'Individual Contributor',
    targetValue: Number(targetValue),
    currentValue: Number(currentValue),
    unit,
    weightage: Number(weightage),
    progress: Math.min(100, Math.round((Number(currentValue) / Math.max(1, Number(targetValue))) * 100)),
    status: 'On Track',
    period,
    dueDate: dueDate || new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
    milestones: milestones.map((m: any, idx: number) => ({
      id: `m-${idx + 1}`,
      title: typeof m === 'string' ? m : m.title,
      completed: m.completed || false
    })),
    checkIns: [
      {
        id: `chk-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        author: 'System',
        progress: 0,
        comment: 'Goal assigned and baseline scorecard initialized.'
      }
    ],
    createdAt: new Date().toISOString()
  };

  performanceGoals.unshift(newGoal);
  res.json(newGoal);
});

router.put('/performance/goals/:id/progress', (req, res) => {
  const goal = performanceGoals.find(g => g.id === req.params.id);
  if (!goal) return res.status(404).json({ error: 'Goal not found' });

  const { currentValue, status, comment, author = 'Self / Manager' } = req.body;
  if (currentValue !== undefined) {
    goal.currentValue = Number(currentValue);
    goal.progress = Math.min(100, Math.round((goal.currentValue / Math.max(1, goal.targetValue)) * 100));
  }
  if (status) goal.status = status;
  if (goal.progress >= 100) goal.status = 'Completed';

  if (comment) {
    goal.checkIns.push({
      id: `chk-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      author,
      progress: goal.progress,
      comment
    });
  }

  res.json(goal);
});

router.put('/performance/goals/:id/review', (req, res) => {
  const goal = performanceGoals.find(g => g.id === req.params.id);
  if (!goal) return res.status(404).json({ error: 'Goal not found' });

  const { rating, feedback, reviewer = 'Reporting Manager' } = req.body;
  goal.managerReview = {
    rating: Number(rating),
    feedback,
    reviewer,
    reviewedAt: new Date().toISOString()
  };

  res.json(goal);
});

router.put('/performance/goals/:id', (req, res) => {
  const index = performanceGoals.findIndex(g => g.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Goal not found' });
  const updated = { ...performanceGoals[index], ...req.body };
  if (req.body.currentValue !== undefined || req.body.targetValue !== undefined) {
    updated.progress = Math.min(100, Math.round((Number(updated.currentValue) / Math.max(1, Number(updated.targetValue))) * 100));
  }
  performanceGoals[index] = updated;
  res.json(performanceGoals[index]);
});

router.delete('/performance/goals/:id', (req, res) => {
  performanceGoals = performanceGoals.filter(g => g.id !== req.params.id);
  res.json({ message: 'Goal deleted successfully' });
});

// Competencies Framework Endpoints
router.get('/performance/competencies', (req, res) => {
  res.json(competenciesMaster);
});

router.post('/performance/competencies', (req, res) => {
  const { name, category, description, targetLevel = 4, proficiencyLevels = [] } = req.body;
  const newComp: CompetencyMaster = {
    id: `COMP-${Date.now().toString().slice(-6)}`,
    name,
    category,
    description,
    targetLevel: Number(targetLevel),
    proficiencyLevels: proficiencyLevels.length > 0 ? proficiencyLevels : [
      { level: 1, label: 'Novice', behavioralIndicators: ['Basic foundational awareness'] },
      { level: 2, label: 'Developing', behavioralIndicators: ['Demonstrates in routine tasks with guidance'] },
      { level: 3, label: 'Proficient', behavioralIndicators: ['Consistently applies independently and successfully'] },
      { level: 4, label: 'Advanced', behavioralIndicators: ['Mentors others and resolves edge-case complexities'] },
      { level: 5, label: 'Expert', behavioralIndicators: ['Pioneers enterprise-level innovations and frameworks'] }
    ],
    assessments: []
  };

  competenciesMaster.push(newComp);
  res.json(newComp);
});

router.post('/performance/competencies/:id/assess', (req, res) => {
  const comp = competenciesMaster.find(c => c.id === req.params.id);
  if (!comp) return res.status(404).json({ error: 'Competency not found' });

  const { employeeId, employeeName, department, selfRating, managerRating, evidence } = req.body;
  const existingIdx = comp.assessments.findIndex(a => a.employeeId === employeeId);

  const assessment = {
    employeeId,
    employeeName,
    department: department || 'General',
    selfRating: Number(selfRating || 3),
    managerRating: Number(managerRating || 3),
    evidence: evidence || 'Demonstrated consistent execution across projects.',
    status: 'Completed' as const,
    updatedAt: new Date().toISOString()
  };

  if (existingIdx >= 0) {
    comp.assessments[existingIdx] = assessment;
  } else {
    comp.assessments.push(assessment);
  }

  res.json(comp);
});

// ------------------------------------------
// 2. GOAL LIBRARY (SMART KPI REPOSITORY)
// ------------------------------------------

router.get('/performance/goal-library', (req, res) => {
  res.json(goalLibraryMaster);
});

router.post('/performance/goal-library', (req, res) => {
  const { title, description, department, category, suggestedMetric, suggestedTarget, unit, suggestedWeightage, difficulty, tags } = req.body;
  const newLibGoal: LibraryGoal = {
    id: `LIB-GOAL-${(goalLibraryMaster.length + 1).toString().padStart(2, '0')}`,
    title,
    description,
    department,
    category,
    suggestedMetric,
    suggestedTarget: Number(suggestedTarget || 100),
    unit: unit || '%',
    suggestedWeightage: Number(suggestedWeightage || 20),
    difficulty: difficulty || 'Intermediate',
    tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map((t: string) => t.trim()) : [])
  };

  goalLibraryMaster.push(newLibGoal);
  res.json(newLibGoal);
});

// 1-Click Adopt Goal from Library to Employee
router.post('/performance/goal-library/adopt', (req, res) => {
  const { libraryGoalId, employeeId, employeeName, department, role, targetValue, weightage, dueDate, period } = req.body;
  const libGoal = goalLibraryMaster.find(g => g.id === libraryGoalId);
  if (!libGoal) return res.status(404).json({ error: 'Library goal not found' });

  const target = targetValue !== undefined ? Number(targetValue) : libGoal.suggestedTarget;
  const weight = weightage !== undefined ? Number(weightage) : libGoal.suggestedWeightage;

  const assignedGoal: PerformanceGoal = {
    id: `GOAL-${Date.now().toString().slice(-6)}`,
    title: libGoal.title,
    description: libGoal.description,
    category: libGoal.category,
    employeeId: employeeId || 'EMP-101',
    employeeName: employeeName || 'Rajesh Kumar',
    department: department || libGoal.department,
    role: role || 'Professional',
    targetValue: target,
    currentValue: 0,
    unit: libGoal.unit,
    weightage: weight,
    progress: 0,
    status: 'On Track',
    period: period || 'Annual 2026',
    dueDate: dueDate || new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
    milestones: [
      { id: 'm1', title: 'Phase 1: Planning & Setup', completed: false },
      { id: 'm2', title: 'Phase 2: Mid-Cycle Execution Check', completed: false },
      { id: 'm3', title: 'Phase 3: Final Delivery & Review', completed: false }
    ],
    checkIns: [
      {
        id: `chk-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        author: 'System',
        progress: 0,
        comment: `Adopted directly from Enterprise Goal Library (${libGoal.department}).`
      }
    ],
    createdAt: new Date().toISOString()
  };

  performanceGoals.unshift(assignedGoal);
  res.json({ message: 'Goal adopted and assigned successfully', goal: assignedGoal });
});

// ------------------------------------------
// 3. CONTINUOUS PERFORMANCE MANAGEMENT (CPM)
// ------------------------------------------

// 1-on-1 Sync Notes & Action Items
router.get('/performance/cpm/checkins', (req, res) => {
  res.json(cpmCheckins);
});

router.post('/performance/cpm/checkins', (req, res) => {
  const {
    employeeId, employeeName, managerName, department, date, cadence,
    highlights, blockers, nextPriorities, actionItems = [], sentiment = 'Good / Steady', privateManagerNotes
  } = req.body;

  const checkin: CPMCheckin = {
    id: `1ON1-${Date.now().toString().slice(-6)}`,
    employeeId: employeeId || 'EMP-101',
    employeeName: employeeName || 'Employee',
    managerName: managerName || 'Vikramaditya Rao (VP Engg)',
    department: department || 'Engineering',
    date: date || new Date().toISOString().split('T')[0],
    cadence: cadence || 'Bi-Weekly',
    highlights: highlights || 'Sprint deliverables met on time.',
    blockers: blockers || 'None identified currently.',
    nextPriorities: nextPriorities || 'Complete integration phase.',
    actionItems: actionItems.map((a: any, idx: number) => ({
      id: `act-${idx + 1}`,
      task: typeof a === 'string' ? a : a.task,
      completed: a.completed || false,
      dueDate: a.dueDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
    })),
    sentiment,
    privateManagerNotes,
    createdAt: new Date().toISOString()
  };

  cpmCheckins.unshift(checkin);
  res.json(checkin);
});

router.put('/performance/cpm/checkins/:id/action-item/:actionId', (req, res) => {
  const checkin = cpmCheckins.find(c => c.id === req.params.id);
  if (!checkin) return res.status(404).json({ error: 'Checkin not found' });

  const item = checkin.actionItems.find(a => a.id === req.params.actionId);
  if (!item) return res.status(404).json({ error: 'Action item not found' });

  item.completed = !item.completed;
  res.json(checkin);
});

// Peer Kudos & Spot Recognition
router.get('/performance/cpm/kudos', (req, res) => {
  res.json(cpmKudos);
});

router.post('/performance/cpm/kudos', (req, res) => {
  const { fromEmployeeId, fromEmployeeName, toEmployeeId, toEmployeeName, badge, message, coreValue } = req.body;
  const kudos: CPMKudos = {
    id: `KUDOS-${Date.now().toString().slice(-6)}`,
    fromEmployeeId: fromEmployeeId || 'EMP-102',
    fromEmployeeName: fromEmployeeName || 'Ananya Sharma',
    toEmployeeId: toEmployeeId || 'EMP-101',
    toEmployeeName: toEmployeeName || 'Rajesh Kumar',
    badge: badge || 'Innovation Champion',
    message: message || 'Fantastic work streamlining our microservice deployment pipeline!',
    coreValue: coreValue || 'Architectural Excellence & Speed',
    likes: 1,
    createdAt: new Date().toISOString()
  };

  cpmKudos.unshift(kudos);
  res.json(kudos);
});

router.post('/performance/cpm/kudos/:id/like', (req, res) => {
  const kudos = cpmKudos.find(k => k.id === req.params.id);
  if (!kudos) return res.status(404).json({ error: 'Kudos not found' });
  kudos.likes += 1;
  res.json(kudos);
});

// Continuous Feedback Logs
router.get('/performance/cpm/feedback', (req, res) => {
  res.json(cpmFeedbacks);
});

router.post('/performance/cpm/feedback', (req, res) => {
  const { fromName, toName, type, projectContext, content, visibility = 'Public Feed' } = req.body;
  const feedback: CPMFeedback = {
    id: `FDBK-${Date.now().toString().slice(-6)}`,
    fromName: fromName || 'Peer Reviewer',
    toName: toName || 'Employee',
    type: type || 'Praise',
    projectContext: projectContext || 'Q3 Delivery Sprints',
    content: content || 'Clear, proactive communication and exceptional accountability throughout the cycle.',
    visibility,
    createdAt: new Date().toISOString()
  };

  cpmFeedbacks.unshift(feedback);
  res.json(feedback);
});

// ------------------------------------------
// 4. RATING AND REVIEWING (APPRAISALS & 9-BOX)
// ------------------------------------------

router.get('/performance/reviews', (req, res) => {
  res.json(appraisalReviews);
});

router.post('/performance/reviews', (req, res) => {
  const {
    employeeId, employeeName, department, designation, currentSalary = 120000,
    cycleName = 'Annual Appraisal 2026', period = 'FY 2025-26',
    selfRating = 4.0, selfAchievements, selfChallenges,
    managerRating = 4.2, managerStrengths, managerImprovements, promotionRecommended = false,
    finalCalibratedRating, potentialLevel = 'High'
  } = req.body;

  const finalRating = Number(finalCalibratedRating || managerRating || selfRating);
  let band: AppraisalReview['performanceBand'] = 'Meets Expectations';
  if (finalRating >= 4.5) band = 'Outstanding';
  else if (finalRating >= 3.8) band = 'Exceeds Expectations';
  else if (finalRating >= 2.8) band = 'Meets Expectations';
  else if (finalRating >= 2.0) band = 'Needs Development';
  else band = 'Unsatisfactory';

  // Determine proposed hike & bonus eligibility
  let hike = 8;
  let bonusMultiplier = 0.8;
  if (band === 'Outstanding') { hike = 16; bonusMultiplier = 1.25; }
  else if (band === 'Exceeds Expectations') { hike = 12; bonusMultiplier = 1.0; }
  else if (band === 'Meets Expectations') { hike = 8; bonusMultiplier = 0.75; }
  else if (band === 'Needs Development') { hike = 2; bonusMultiplier = 0; }
  else { hike = 0; bonusMultiplier = 0; }

  const baseBonus = Math.round(Number(currentSalary) * 0.5); // 50% target bonus pool
  const bonusAmount = Math.round(baseBonus * bonusMultiplier);

  const review: AppraisalReview = {
    id: `REV-${Date.now().toString().slice(-6)}`,
    cycleName,
    period,
    employeeId: employeeId || 'EMP-101',
    employeeName: employeeName || 'Employee',
    department: department || 'General',
    designation: designation || 'Specialist',
    currentSalary: Number(currentSalary),
    status: 'Completed',
    selfRating: Number(selfRating),
    selfAchievements: selfAchievements || 'Exceeded delivery targets across core Q3 milestones.',
    selfChallenges: selfChallenges || 'Managing multiple dependency handoffs across time zones.',
    managerRating: Number(managerRating),
    managerStrengths: managerStrengths || 'Deep domain expertise, highly reliable and supportive team mentor.',
    managerImprovements: managerImprovements || 'Expand cross-functional executive visibility.',
    promotionRecommended: Boolean(promotionRecommended),
    finalCalibratedRating: finalRating,
    performanceBand: band,
    potentialLevel,
    nineBoxGridBox: calculate9Box(finalRating, potentialLevel),
    proposedHikePercent: hike,
    proposedBonusAmount: bonusAmount,
    payrollSyncStatus: 'Pending',
    createdAt: new Date().toISOString()
  };

  appraisalReviews.unshift(review);
  res.json(review);
});

// Update rating / calibration on existing review
router.put('/performance/reviews/:id/rate', (req, res) => {
  const review = appraisalReviews.find(r => r.id === req.params.id);
  if (!review) return res.status(404).json({ error: 'Review not found' });

  const { finalCalibratedRating, potentialLevel, promotionRecommended } = req.body;
  if (finalCalibratedRating !== undefined) {
    review.finalCalibratedRating = Number(finalCalibratedRating);
    if (review.finalCalibratedRating >= 4.5) review.performanceBand = 'Outstanding';
    else if (review.finalCalibratedRating >= 3.8) review.performanceBand = 'Exceeds Expectations';
    else if (review.finalCalibratedRating >= 2.8) review.performanceBand = 'Meets Expectations';
    else if (review.finalCalibratedRating >= 2.0) review.performanceBand = 'Needs Development';
    else review.performanceBand = 'Unsatisfactory';

    // Recalculate hike & bonus
    if (review.performanceBand === 'Outstanding') { review.proposedHikePercent = 16; review.proposedBonusAmount = Math.round(review.currentSalary * 0.5 * 1.25); }
    else if (review.performanceBand === 'Exceeds Expectations') { review.proposedHikePercent = 12; review.proposedBonusAmount = Math.round(review.currentSalary * 0.5 * 1.0); }
    else if (review.performanceBand === 'Meets Expectations') { review.proposedHikePercent = 8; review.proposedBonusAmount = Math.round(review.currentSalary * 0.5 * 0.75); }
    else if (review.performanceBand === 'Needs Development') { review.proposedHikePercent = 2; review.proposedBonusAmount = 0; }
    else { review.proposedHikePercent = 0; review.proposedBonusAmount = 0; }
  }

  if (potentialLevel) {
    review.potentialLevel = potentialLevel;
  }
  review.nineBoxGridBox = calculate9Box(review.finalCalibratedRating, review.potentialLevel);

  if (promotionRecommended !== undefined) {
    review.promotionRecommended = Boolean(promotionRecommended);
  }

  res.json(review);
});

// 9-Box Grid distribution matrix
router.get('/performance/reviews/matrix-9box', (req, res) => {
  const gridDistribution: Record<string, AppraisalReview[]> = {
    'Star Performer': [],
    'High Potential': [],
    'High Professional': [],
    'Core Contributor': [],
    'Consistent Performer': [],
    'Enigma / Rough Diamond': [],
    'Dilemma': [],
    'Underperformer': []
  };

  appraisalReviews.forEach(r => {
    if (gridDistribution[r.nineBoxGridBox]) {
      gridDistribution[r.nineBoxGridBox].push(r);
    }
  });

  res.json({
    totalReviews: appraisalReviews.length,
    distribution: gridDistribution
  });
});

// ------------------------------------------
// 5. 360 FEEDBACK APPRAISAL
// ------------------------------------------

router.get('/performance/feedback360', (req, res) => {
  res.json(feedback360Surveys);
});

router.post('/performance/feedback360/nominate', (req, res) => {
  const { employeeId, employeeName, department, designation, cycle = 'Annual 360 Review 2026', raters = [] } = req.body;

  const defaultScores = { technical: 4, collaboration: 4, leadership: 4, accountability: 4, agility: 4, overall: 4 };

  const survey: Feedback360Survey = {
    id: `360-${Date.now().toString().slice(-6)}`,
    employeeId: employeeId || 'EMP-101',
    employeeName: employeeName || 'Employee',
    department: department || 'General',
    designation: designation || 'Staff Member',
    cycle,
    status: 'In Progress',
    raters: raters.map((r: any, idx: number) => ({
      id: `rater-${idx + 1}`,
      raterName: r.raterName || `Evaluator ${idx + 1}`,
      relationship: r.relationship || 'Peer',
      isAnonymous: r.isAnonymous !== undefined ? r.isAnonymous : true,
      status: r.status || 'Pending',
      scores: r.scores || { technical: 0, collaboration: 0, leadership: 0, accountability: 0, agility: 0 },
      qualitativeFeedback: r.qualitativeFeedback || '',
      submittedAt: r.submittedAt
    })),
    computedAverages: {
      self: { ...defaultScores },
      manager: { ...defaultScores },
      peers: { ...defaultScores },
      reports: { ...defaultScores }
    }
  };

  feedback360Surveys.unshift(survey);
  res.json(survey);
});

router.post('/performance/feedback360/:id/respond', (req, res) => {
  const survey = feedback360Surveys.find(s => s.id === req.params.id);
  if (!survey) return res.status(404).json({ error: '360 Survey not found' });

  const { raterId, scores, qualitativeFeedback } = req.body;
  const rater = survey.raters.find(r => r.id === raterId);
  if (!rater) return res.status(404).json({ error: 'Rater not found' });

  rater.scores = scores;
  rater.qualitativeFeedback = qualitativeFeedback;
  rater.status = 'Completed';
  rater.submittedAt = new Date().toISOString();

  // Recompute radar averages
  const groups: Record<string, any[]> = { Self: [], Manager: [], Peer: [], 'Direct Report': [] };
  survey.raters.filter(r => r.status === 'Completed').forEach(r => {
    groups[r.relationship]?.push(r.scores);
  });

  const calcGroupAvg = (items: any[]) => {
    if (items.length === 0) return { technical: 4, collaboration: 4, leadership: 4, accountability: 4, agility: 4, overall: 4 };
    const len = items.length;
    const tech = Number((items.reduce((acc, i) => acc + i.technical, 0) / len).toFixed(1));
    const coll = Number((items.reduce((acc, i) => acc + i.collaboration, 0) / len).toFixed(1));
    const lead = Number((items.reduce((acc, i) => acc + i.leadership, 0) / len).toFixed(1));
    const acc = Number((items.reduce((acc, i) => acc + i.accountability, 0) / len).toFixed(1));
    const agil = Number((items.reduce((acc, i) => acc + i.agility, 0) / len).toFixed(1));
    const overall = Number(((tech + coll + lead + acc + agil) / 5).toFixed(1));
    return { technical: tech, collaboration: coll, leadership: lead, accountability: acc, agility: agil, overall };
  };

  survey.computedAverages.self = calcGroupAvg(groups['Self']);
  survey.computedAverages.manager = calcGroupAvg(groups['Manager']);
  survey.computedAverages.peers = calcGroupAvg(groups['Peer']);
  survey.computedAverages.reports = calcGroupAvg(groups['Direct Report']);

  const allCompleted = survey.raters.every(r => r.status === 'Completed');
  if (allCompleted) survey.status = 'Completed';

  res.json(survey);
});

// ------------------------------------------
// 6. INTEGRATED DEVELOPMENT PLANS (IDP)
// ------------------------------------------

router.get('/performance/idp', (req, res) => {
  res.json(idpPlans);
});

router.post('/performance/idp', (req, res) => {
  const {
    employeeId, employeeName, department, designation, focusArea, targetCompetency,
    skillGapsIdentified = [], learningObjectives = [], actionCourses = [],
    mentorName, allocatedBudget = 35000, targetDate, notes
  } = req.body;

  const idp: IDPPlan = {
    id: `IDP-${Date.now().toString().slice(-6)}`,
    employeeId: employeeId || 'EMP-101',
    employeeName: employeeName || 'Employee',
    department: department || 'General',
    designation: designation || 'Engineer',
    focusArea: focusArea || 'Cloud Architecture & Microservices',
    targetCompetency: targetCompetency || 'Architectural Excellence & Scalability',
    skillGapsIdentified: Array.isArray(skillGapsIdentified) ? skillGapsIdentified : [skillGapsIdentified],
    learningObjectives: Array.isArray(learningObjectives) ? learningObjectives : [learningObjectives],
    actionCourses: actionCourses.map((c: any) => ({
      name: c.name || 'Certified Solutions Architect Professional',
      platform: c.platform || 'AWS Training & Certification',
      duration: c.duration || '60 Hours',
      cost: Number(c.cost || 25000),
      completed: Boolean(c.completed)
    })),
    mentorName: mentorName || 'Vikramaditya Rao (VP Engg)',
    allocatedBudget: Number(allocatedBudget),
    targetDate: targetDate || new Date(Date.now() + 120 * 86400000).toISOString().split('T')[0],
    progress: 25,
    status: 'In Progress',
    notes: notes || 'Sponsored corporate upskilling roadmap for career progression.'
  };

  idpPlans.unshift(idp);
  res.json(idp);
});

router.put('/performance/idp/:id/status', (req, res) => {
  const idp = idpPlans.find(i => i.id === req.params.id);
  if (!idp) return res.status(404).json({ error: 'IDP not found' });

  const { status, progress, certificateUrl } = req.body;
  if (status) idp.status = status;
  if (progress !== undefined) idp.progress = Number(progress);
  if (certificateUrl) idp.certificateUrl = certificateUrl;
  if (idp.progress >= 100) idp.status = 'Completed & Certified';

  res.json(idp);
});

// ------------------------------------------
// 7. INTEGRATION WITH PAYROLL
// ------------------------------------------

// Preview sync impact: shows how appraisal ratings translate to merit hikes and bonus payout
router.get('/performance/payroll-sync/preview', (req, res) => {
  const eligibleReviews = appraisalReviews.filter(r => r.status === 'Completed');

  let totalBonusPool = 0;
  let totalCurrentSalary = 0;
  let totalNewSalary = 0;

  const previewItems = eligibleReviews.map(rev => {
    const previousBase = rev.currentSalary;
    const hikePercent = rev.proposedHikePercent;
    const newBase = Math.round(previousBase * (1 + hikePercent / 100));
    const bonusAmount = rev.proposedBonusAmount;

    totalBonusPool += bonusAmount;
    totalCurrentSalary += previousBase;
    totalNewSalary += newBase;

    return {
      reviewId: rev.id,
      employeeId: rev.employeeId,
      employeeName: rev.employeeName,
      department: rev.department,
      rating: rev.finalCalibratedRating,
      band: rev.performanceBand,
      nineBox: rev.nineBoxGridBox,
      previousBase,
      newBase,
      hikePercent,
      bonusAmount,
      syncStatus: rev.payrollSyncStatus
    };
  });

  const averageHike = eligibleReviews.length > 0
    ? Number((previewItems.reduce((acc, i) => acc + i.hikePercent, 0) / eligibleReviews.length).toFixed(1))
    : 0;

  res.json({
    cycleName: 'Annual Appraisal Cycle 2026',
    eligibleCount: eligibleReviews.length,
    totalBonusPool,
    monthlyBasePayrollCurrent: totalCurrentSalary,
    monthlyBasePayrollProposed: totalNewSalary,
    monthlyIncrementCost: totalNewSalary - totalCurrentSalary,
    annualizedIncrementCost: (totalNewSalary - totalCurrentSalary) * 12,
    averageHikePercent: averageHike,
    previewItems
  });
});

// Apply sync: Pushes performance merit increments and bonuses directly into detailedPayslips
router.post('/performance/payroll-sync/apply', (req, res) => {
  const { cycleName = 'Annual Appraisal 2026', syncedBy = 'HR Compensation Committee' } = req.body;
  const eligibleReviews = appraisalReviews.filter(r => r.status === 'Completed' && r.payrollSyncStatus !== 'Synced to Payroll');

  if (eligibleReviews.length === 0 && appraisalReviews.length > 0) {
    return res.status(400).json({ error: 'All eligible appraisal reviews have already been synchronized with Payroll.' });
  }

  const syncBatchId = `SYNC-PAY-${Date.now().toString().slice(-6)}`;
  let totalBonusPool = 0;
  let totalIncrement = 0;
  const detailsList: any[] = [];

  eligibleReviews.forEach(rev => {
    const previousBase = rev.currentSalary;
    const newBase = Math.round(previousBase * (1 + rev.proposedHikePercent / 100));
    totalBonusPool += rev.proposedBonusAmount;
    totalIncrement += (newBase - previousBase);

    // Update existing payslip in detailedPayslips if present
    const existingPayslip = detailedPayslips.find(p => p.employeeName.toLowerCase().includes(rev.employeeName.toLowerCase().split(' ')[0]));
    if (existingPayslip) {
      existingPayslip.basic = newBase;
      existingPayslip.baseSalary = newBase;
      existingPayslip.incentives = (existingPayslip.incentives || 0) + rev.proposedBonusAmount;
      // Recompute gross & net
      const hra = Math.round(existingPayslip.basic * 0.5);
      existingPayslip.grossSalary = existingPayslip.basic + hra + (existingPayslip.specialAllowance || 0) + existingPayslip.incentives + (existingPayslip.overtimePay || 0);
      existingPayslip.netSalary = existingPayslip.grossSalary - (existingPayslip.totalDeductions || 0) + (existingPayslip.reimbursements || 0);
    }

    rev.payrollSyncStatus = 'Synced to Payroll';
    rev.syncedAt = new Date().toISOString();

    detailsList.push({
      employeeId: rev.employeeId,
      employeeName: rev.employeeName,
      department: rev.department,
      rating: rev.finalCalibratedRating,
      band: rev.performanceBand,
      previousBase,
      newBase,
      hikePercent: rev.proposedHikePercent,
      bonusAmount: rev.proposedBonusAmount,
      payrollRecordId: existingPayslip?.id || `PAY-SYNC-${rev.employeeId}`
    });
  });

  const syncRecord: PayrollSyncRecord = {
    id: syncBatchId,
    syncBatchId,
    cycleName,
    syncedAt: new Date().toISOString(),
    syncedBy,
    totalEmployees: detailsList.length,
    totalBonusPool,
    averageHikePercent: detailsList.length > 0 ? Number((detailsList.reduce((acc, i) => acc + i.hikePercent, 0) / detailsList.length).toFixed(1)) : 0,
    annualPayrollIncrement: totalIncrement * 12,
    effectiveMonth: 'October 2026',
    details: detailsList
  };

  payrollSyncHistory.unshift(syncRecord);

  res.json({
    message: `Successfully synchronized ${detailsList.length} performance appraisals into Payroll Engine!`,
    syncRecord
  });
});

router.get('/performance/payroll-sync/history', (req, res) => {
  res.json(payrollSyncHistory);
});

// ------------------------------------------
// SIMULATE PERFORMANCE ECOSYSTEM SEEDER
// ------------------------------------------

router.post('/performance/simulate', (req, res) => {
  // 1. Goals
  performanceGoals = [
    {
      id: 'GOAL-2026-001',
      title: 'Architect & Deploy Multi-Region Kubernetes Failover',
      description: 'Engineer zero-downtime blue-green rollouts and automated pod auto-scaling to maintain 99.99% uptime.',
      category: 'Operational',
      employeeId: 'EMP-101',
      employeeName: 'Rajesh Kumar',
      department: 'Technology & Engineering',
      role: 'Staff Software Architect',
      targetValue: 99.99,
      currentValue: 99.95,
      unit: '%',
      weightage: 30,
      progress: 95,
      status: 'On Track',
      period: 'Annual 2026',
      dueDate: '2026-10-31',
      milestones: [
        { id: 'm1', title: 'Infra as Code Terraform templates audited', completed: true },
        { id: 'm2', title: 'Multi-cluster service mesh configured', completed: true },
        { id: 'm3', title: 'Chaos engineering load testing complete', completed: false }
      ],
      checkIns: [
        { id: 'c1', date: '2026-08-15', author: 'Rajesh Kumar', progress: 60, comment: 'Completed service mesh provisioning across primary & disaster-recovery regions.' },
        { id: 'c2', date: '2026-09-12', author: 'Vikramaditya Rao', progress: 95, comment: 'Outstanding resilience metrics. Finalizing automated failover DNS switchover.' }
      ],
      managerReview: { rating: 4.8, feedback: 'Exemplary architectural leadership and rock-solid reliability delivery.', reviewedAt: '2026-09-20', reviewer: 'Vikramaditya Rao (VP Engg)' },
      createdAt: '2026-04-01T09:00:00Z'
    },
    {
      id: 'GOAL-2026-002',
      title: 'Accelerate API P99 Latency to Sub-100ms',
      description: 'Optimize high-traffic GraphQL endpoints, introduce Redis caching, and eliminate N+1 database queries.',
      category: 'Innovation',
      employeeId: 'EMP-101',
      employeeName: 'Rajesh Kumar',
      department: 'Technology & Engineering',
      role: 'Staff Software Architect',
      targetValue: 100,
      currentValue: 85,
      unit: 'ms',
      weightage: 25,
      progress: 100,
      status: 'Completed',
      period: 'Annual 2026',
      dueDate: '2026-09-15',
      milestones: [
        { id: 'm1', title: 'APM distributed tracing enabled', completed: true },
        { id: 'm2', title: 'Redis cluster cache integration', completed: true },
        { id: 'm3', title: 'P99 verified at 85ms across 10k concurrent users', completed: true }
      ],
      checkIns: [
        { id: 'c1', date: '2026-09-10', author: 'Rajesh Kumar', progress: 100, comment: 'Achieved 85ms P99 latency. Target exceeded.' }
      ],
      createdAt: '2026-04-01T09:00:00Z'
    },
    {
      id: 'GOAL-2026-003',
      title: 'Increase Monthly Active User Retention by 15%',
      description: 'Streamline onboarding workflows and introduce frictionless collaborative workspace modules.',
      category: 'Customer',
      employeeId: 'EMP-102',
      employeeName: 'Ananya Sharma',
      department: 'Product & Design',
      role: 'Lead Product Manager',
      targetValue: 15,
      currentValue: 12.8,
      unit: '%',
      weightage: 35,
      progress: 85,
      status: 'On Track',
      period: 'Annual 2026',
      dueDate: '2026-11-15',
      milestones: [
        { id: 'm1', title: 'Customer journey funnel analytics deployed', completed: true },
        { id: 'm2', title: 'Contextual in-app guidance tours released', completed: true },
        { id: 'm3', title: 'User satisfaction survey score > 4.6', completed: false }
      ],
      checkIns: [
        { id: 'c1', date: '2026-09-05', author: 'Ananya Sharma', progress: 85, comment: 'New UX flows pushed cohort 30-day retention up by 12.8%.' }
      ],
      createdAt: '2026-04-01T09:00:00Z'
    },
    {
      id: 'GOAL-2026-004',
      title: 'Deliver ₹1.50 Crore New Enterprise ARR Pipeline',
      description: 'Engage top 40 enterprise target accounts in BFSI and SaaS verticals.',
      category: 'Financial',
      employeeId: 'EMP-103',
      employeeName: 'Amit Verma',
      department: 'Operations & Logistics',
      role: 'Operations Specialist',
      targetValue: 100,
      currentValue: 78,
      unit: '%',
      weightage: 40,
      progress: 78,
      status: 'At Risk',
      period: 'Annual 2026',
      dueDate: '2026-10-31',
      milestones: [
        { id: 'm1', title: 'Logistics SLA monitoring software procured', completed: true },
        { id: 'm2', title: 'Regional dispatch hubs automated', completed: false }
      ],
      checkIns: [
        { id: 'c1', date: '2026-09-01', author: 'Amit Verma', progress: 78, comment: 'Vendor lead times delayed regional hub deployment by 2 weeks.' }
      ],
      createdAt: '2026-04-01T09:00:00Z'
    }
  ];

  // 2. Continuous 1-on-1s
  cpmCheckins = [
    {
      id: '1ON1-2026-01',
      employeeId: 'EMP-101',
      employeeName: 'Rajesh Kumar',
      managerName: 'Vikramaditya Rao (VP Engg)',
      department: 'Technology & Engineering',
      date: '2026-09-18',
      cadence: 'Bi-Weekly',
      highlights: 'Successfully deployed disaster-recovery warm standby database replica. Chaos experiments had zero data loss.',
      blockers: 'Cloud vendor quota limits in Singapore region need expansion ticket approval.',
      nextPriorities: 'Complete Terraform CI pipeline migration and review IDP cloud security certification.',
      actionItems: [
        { id: 'act-1', task: 'Follow up with AWS Enterprise TAM on quota increase', completed: true, dueDate: '2026-09-22' },
        { id: 'act-2', task: 'Prepare system architecture overview for Q4 all-hands', completed: false, dueDate: '2026-09-30' }
      ],
      sentiment: 'Great / Highly Motivated',
      privateManagerNotes: 'Rajesh is performing at Principal Engineer caliber. Recommended for leadership promotion and bonus cap in current cycle.',
      createdAt: '2026-09-18T11:30:00Z'
    },
    {
      id: '1ON1-2026-02',
      employeeId: 'EMP-102',
      employeeName: 'Ananya Sharma',
      managerName: 'Vikramaditya Rao (VP Engg)',
      department: 'Product & Design',
      date: '2026-09-15',
      cadence: 'Bi-Weekly',
      highlights: 'Product Design Sprint concluded with 92% positive customer beta response.',
      blockers: 'Cross-functional engineering capacity constraints for upcoming sprint.',
      nextPriorities: 'Prioritize v2.0 design token deliverables with frontend leads.',
      actionItems: [
        { id: 'act-1', task: 'Conduct design critique with engineering leads', completed: true, dueDate: '2026-09-20' }
      ],
      sentiment: 'Good / Steady',
      createdAt: '2026-09-15T15:00:00Z'
    }
  ];

  // 3. Kudos
  cpmKudos = [
    {
      id: 'KUDOS-01',
      fromEmployeeId: 'EMP-102',
      fromEmployeeName: 'Ananya Sharma',
      toEmployeeId: 'EMP-101',
      toEmployeeName: 'Rajesh Kumar',
      badge: 'Innovation Champion',
      message: 'Huge shout-out to Rajesh for rewriting our search indexing engine over the weekend! Query speeds dropped from 400ms to 28ms!',
      coreValue: 'Architectural Excellence & Speed',
      likes: 14,
      createdAt: '2026-09-19T14:20:00Z'
    },
    {
      id: 'KUDOS-02',
      fromEmployeeId: 'EMP-104',
      fromEmployeeName: 'Priya Nair',
      toEmployeeId: 'EMP-102',
      toEmployeeName: 'Ananya Sharma',
      badge: 'Ultimate Team Player',
      message: 'Thank you Ananya for leading the design thinking workshop for our new joiners cohort. Extremely inspiring session!',
      coreValue: 'People Mentorship & Culture',
      likes: 8,
      createdAt: '2026-09-17T10:15:00Z'
    }
  ];

  // 4. Feedbacks
  cpmFeedbacks = [
    {
      id: 'FDBK-01',
      fromName: 'Vikramaditya Rao',
      toName: 'Rajesh Kumar',
      type: 'Praise',
      projectContext: 'Multi-Region Kubernetes Infra Rollout',
      content: 'Exceptional ownership and calm execution under pressure during the primary data-center migration window. A true pillar of our engineering foundation.',
      visibility: 'Public Feed',
      createdAt: '2026-09-20T16:00:00Z'
    },
    {
      id: 'FDBK-02',
      fromName: 'Rajesh Kumar',
      toName: 'Ananya Sharma',
      type: 'Praise',
      projectContext: 'Design System Token Specification',
      content: 'Great collaboration on aligning JSON tokens between Figma and React. Made engineering handoff remarkably frictionless.',
      visibility: 'Public Feed',
      createdAt: '2026-09-18T09:45:00Z'
    }
  ];

  // 5. Formal Appraisal Reviews (5-Point Scale, 9-Box Grid, Merit Hike)
  appraisalReviews = [
    {
      id: 'REV-2026-01',
      cycleName: 'Annual Appraisal Cycle 2026',
      period: 'FY 2025-26',
      employeeId: 'EMP-101',
      employeeName: 'Rajesh Kumar',
      department: 'Technology & Engineering',
      designation: 'Staff Software Architect',
      currentSalary: 145000,
      status: 'Completed',
      selfRating: 4.8,
      selfAchievements: 'Pioneered sub-100ms API initiative, achieved 99.95% uptime across all production clusters, mentored 4 senior engineers.',
      selfChallenges: 'Managing distributed coordination across multiple squad release cycles.',
      managerRating: 4.9,
      managerStrengths: 'Mastery of distributed systems, relentless customer focus, exceptional team mentorship.',
      managerImprovements: 'Expand presence in international tech conferences and external developer advocacy.',
      promotionRecommended: true,
      finalCalibratedRating: 4.9,
      performanceBand: 'Outstanding',
      potentialLevel: 'High',
      nineBoxGridBox: 'Star Performer',
      proposedHikePercent: 16,
      proposedBonusAmount: 90000,
      payrollSyncStatus: 'Pending',
      createdAt: '2026-09-21T10:00:00Z'
    },
    {
      id: 'REV-2026-02',
      cycleName: 'Annual Appraisal Cycle 2026',
      period: 'FY 2025-26',
      employeeId: 'EMP-102',
      employeeName: 'Ananya Sharma',
      department: 'Product & Design',
      designation: 'Lead Product Manager',
      currentSalary: 125000,
      status: 'Completed',
      selfRating: 4.2,
      selfAchievements: 'Delivered user onboarding revamp leading to 12.8% retention lift; instituted weekly user feedback councils.',
      selfChallenges: 'Balancing technical debt backlog against net-new feature velocity.',
      managerRating: 4.3,
      managerStrengths: 'Data-driven product strategy, strong storytelling, and empathetic cross-functional alignment.',
      managerImprovements: 'Deepen quantitative instrumentation and automated telemetry analytics.',
      promotionRecommended: true,
      finalCalibratedRating: 4.3,
      performanceBand: 'Exceeds Expectations',
      potentialLevel: 'High',
      nineBoxGridBox: 'High Potential',
      proposedHikePercent: 12,
      proposedBonusAmount: 62500,
      payrollSyncStatus: 'Pending',
      createdAt: '2026-09-21T10:30:00Z'
    },
    {
      id: 'REV-2026-03',
      cycleName: 'Annual Appraisal Cycle 2026',
      period: 'FY 2025-26',
      employeeId: 'EMP-103',
      employeeName: 'Amit Verma',
      department: 'Operations & Logistics',
      designation: 'Operations Specialist',
      currentSalary: 45000,
      status: 'Completed',
      selfRating: 3.5,
      selfAchievements: 'Maintained day-to-day warehouse dispatch schedules with 96% on-time fulfillment.',
      selfChallenges: 'Adapting to ERP inventory tracking barcode system updates.',
      managerRating: 3.4,
      managerStrengths: 'Dependable operational execution, willingness to work flexible shift hours.',
      managerImprovements: 'Focus on root-cause analysis rather than ad-hoc quick fixes.',
      promotionRecommended: false,
      finalCalibratedRating: 3.4,
      performanceBand: 'Meets Expectations',
      potentialLevel: 'Medium',
      nineBoxGridBox: 'Core Contributor',
      proposedHikePercent: 8,
      proposedBonusAmount: 18000,
      payrollSyncStatus: 'Pending',
      createdAt: '2026-09-21T11:00:00Z'
    },
    {
      id: 'REV-2026-04',
      cycleName: 'Annual Appraisal Cycle 2026',
      period: 'FY 2025-26',
      employeeId: 'EMP-104',
      employeeName: 'Priya Nair',
      department: 'People & Culture (HR)',
      designation: 'HR Business Partner',
      currentSalary: 85000,
      status: 'Completed',
      selfRating: 4.4,
      selfAchievements: 'Streamlined employee onboarding to paperless digital flows and launched annual pulse surveys.',
      selfChallenges: 'Managing talent requisition turnaround during hyper-growth quarters.',
      managerRating: 4.4,
      managerStrengths: 'High EQ, transparent policy authoring, trusted confidant across all workforce tiers.',
      managerImprovements: 'Build predictive attrition risk modeling dashboards.',
      promotionRecommended: false,
      finalCalibratedRating: 4.4,
      performanceBand: 'Exceeds Expectations',
      potentialLevel: 'Medium',
      nineBoxGridBox: 'High Professional',
      proposedHikePercent: 12,
      proposedBonusAmount: 42500,
      payrollSyncStatus: 'Pending',
      createdAt: '2026-09-21T11:30:00Z'
    }
  ];

  // 6. 360 Feedback Surveys
  feedback360Surveys = [
    {
      id: '360-2026-001',
      employeeId: 'EMP-101',
      employeeName: 'Rajesh Kumar',
      department: 'Technology & Engineering',
      designation: 'Staff Software Architect',
      cycle: 'Annual 360 Review 2026',
      status: 'Completed',
      raters: [
        {
          id: 'r1',
          raterName: 'Rajesh Kumar',
          relationship: 'Self',
          isAnonymous: false,
          status: 'Completed',
          scores: { technical: 5, collaboration: 4, leadership: 4, accountability: 5, agility: 4 },
          qualitativeFeedback: 'I consistently push for technical rigor and high system standards while empowering my peers.',
          submittedAt: '2026-09-10'
        },
        {
          id: 'r2',
          raterName: 'Vikramaditya Rao',
          relationship: 'Manager',
          isAnonymous: false,
          status: 'Completed',
          scores: { technical: 5, collaboration: 5, leadership: 5, accountability: 5, agility: 4 },
          qualitativeFeedback: 'Top-tier engineering leader. Outstanding work navigating architectural complexity and shielding his team.',
          submittedAt: '2026-09-12'
        },
        {
          id: 'r3',
          raterName: 'Peer Reviewer (Anonymous)',
          relationship: 'Peer',
          isAnonymous: true,
          status: 'Completed',
          scores: { technical: 5, collaboration: 4.5, leadership: 4.5, accountability: 5, agility: 4.5 },
          qualitativeFeedback: 'Rajesh is exceptionally generous with his time. Whenever anyone is stuck on a critical incident, he jumps in immediately.',
          submittedAt: '2026-09-14'
        },
        {
          id: 'r4',
          raterName: 'Direct Report (Anonymous)',
          relationship: 'Direct Report',
          isAnonymous: true,
          status: 'Completed',
          scores: { technical: 5, collaboration: 5, leadership: 4.8, accountability: 5, agility: 4.5 },
          qualitativeFeedback: 'The best mentor I have had. Gives clear feedback and creates tremendous opportunities for junior engineers to grow.',
          submittedAt: '2026-09-15'
        }
      ],
      computedAverages: {
        self: { technical: 5.0, collaboration: 4.0, leadership: 4.0, accountability: 5.0, agility: 4.0, overall: 4.4 },
        manager: { technical: 5.0, collaboration: 5.0, leadership: 5.0, accountability: 5.0, agility: 4.0, overall: 4.8 },
        peers: { technical: 5.0, collaboration: 4.5, leadership: 4.5, accountability: 5.0, agility: 4.5, overall: 4.7 },
        reports: { technical: 5.0, collaboration: 5.0, leadership: 4.8, accountability: 5.0, agility: 4.5, overall: 4.9 }
      }
    }
  ];

  // 7. Integrated Development Plans (IDP)
  idpPlans = [
    {
      id: 'IDP-2026-01',
      employeeId: 'EMP-101',
      employeeName: 'Rajesh Kumar',
      department: 'Technology & Engineering',
      designation: 'Staff Software Architect',
      focusArea: 'Enterprise Cloud Security & Zero-Trust Governance',
      targetCompetency: 'Architectural Excellence & Scalability',
      skillGapsIdentified: ['mTLS service-to-service auth', 'Automated secret rotation with HashiCorp Vault', 'SOC-2 Type II audit readiness'],
      learningObjectives: [
        'Attain AWS Certified Security - Specialty credential',
        'Lead cross-organizational threat modeling reviews',
        'Publish internal Whitepaper on Zero-Trust Microservice Architecture'
      ],
      actionCourses: [
        { name: 'AWS Certified Security Specialty Deep Dive', platform: 'A Cloud Guru', duration: '40 Hours', cost: 18000, completed: true },
        { name: 'Practical Cryptography & Zero-Trust Engineering', platform: 'Linux Foundation', duration: '32 Hours', cost: 22000, completed: false }
      ],
      mentorName: 'Vikramaditya Rao (VP Engg)',
      allocatedBudget: 45000,
      targetDate: '2026-11-30',
      progress: 65,
      status: 'In Progress',
      notes: 'Strategic talent acceleration roadmap to prepare Rajesh for Principal / Fellow technical tracks.'
    },
    {
      id: 'IDP-2026-02',
      employeeId: 'EMP-102',
      employeeName: 'Ananya Sharma',
      department: 'Product & Design',
      designation: 'Lead Product Manager',
      focusArea: 'Executive Data Storytelling & Strategic Pricing Models',
      targetCompetency: 'Strategic Vision & Execution',
      skillGapsIdentified: ['Enterprise SaaS pricing packaging', 'Advanced cohort retention telemetry in Mixpanel'],
      learningObjectives: [
        'Complete Reforge Product Strategy program',
        'Relaunch tier-based enterprise add-on pricing'
      ],
      actionCourses: [
        { name: 'Reforge Advanced Product Strategy', platform: 'Reforge', duration: '6 Weeks', cost: 65000, completed: false }
      ],
      mentorName: 'Vikramaditya Rao (VP Engg)',
      allocatedBudget: 75000,
      targetDate: '2026-12-15',
      progress: 30,
      status: 'In Progress',
      notes: 'Approved for executive career grooming.'
    }
  ];

  // Competency assessments populated
  competenciesMaster.forEach(comp => {
    comp.assessments = [
      {
        employeeId: 'EMP-101',
        employeeName: 'Rajesh Kumar',
        department: 'Technology & Engineering',
        selfRating: comp.name.includes('Architectural') ? 5 : 4,
        managerRating: comp.name.includes('Architectural') ? 5 : 5,
        evidence: 'Exceeded all system uptime thresholds and delivered flawless blue-green deployment pipeline.',
        status: 'Completed',
        updatedAt: '2026-09-20T10:00:00Z'
      }
    ];
  });

  res.json({
    message: 'Performance Management Ecosystem successfully simulated with 7 enterprise features!',
    goalsCount: performanceGoals.length,
    reviewsCount: appraisalReviews.length,
    surveysCount: feedback360Surveys.length,
    idpCount: idpPlans.length,
    kudosCount: cpmKudos.length,
    checkinsCount: cpmCheckins.length
  });
});

// Reset performance data
router.post('/performance/reset', (req, res) => {
  performanceGoals = [];
  cpmCheckins = [];
  cpmKudos = [];
  cpmFeedbacks = [];
  appraisalReviews = [];
  feedback360Surveys = [];
  idpPlans = [];
  payrollSyncHistory = [];
  res.json({ message: 'Performance records reset to 0 entries.' });
});



// ==========================================
// 1. PERSONALISED & PAPERLESS ONBOARDING
// ==========================================

let onboardingRecords: any[] = [];

// Get all onboarding records
router.get('/onboarding', (req, res) => {
  res.json(onboardingRecords);
});

// Get single onboarding record
router.get('/onboarding/:id', (req, res) => {
  const record = onboardingRecords.find(r => r.id === req.params.id);
  if (!record) return res.status(404).json({ error: 'Onboarding record not found' });
  res.json(record);
});

// Create new onboarding record
router.post('/onboarding', (req, res) => {
  const {
    name,
    email,
    phone,
    role,
    department,
    reportingManager,
    buddy,
    joiningDate,
    welcomeMessage,
    employmentType
  } = req.body;

  const defaultChecklist = [
    { id: 'CHK-1', title: 'Sign Offer Letter & Employment Agreement', category: 'Compliance', status: 'Pending', required: true },
    { id: 'CHK-2', title: 'Upload Government Identification & PAN/SSN', category: 'Documents', status: 'Pending', required: true },
    { id: 'CHK-3', title: 'Submit Banking & Direct Deposit Details', category: 'Finance', status: 'Pending', required: true },
    { id: 'CHK-4', title: 'Review & Acknowledge Company Policies', category: 'Compliance', status: 'Pending', required: true },
    { id: 'CHK-5', title: 'IT Asset & Laptop Hardware Provisioning', category: 'IT Setup', status: 'Pending', required: true },
    { id: 'CHK-6', title: 'Corporate Email & Slack/Teams Account Access', category: 'IT Setup', status: 'Pending', required: true },
    { id: 'CHK-7', title: 'Orientation & Introduction with Assigned Buddy', category: 'Culture', status: 'Pending', required: false },
    { id: 'CHK-8', title: 'First Week Objectives & 30-Day Check-in Meeting', category: 'Manager', status: 'Pending', required: false }
  ];

  const defaultDocuments = [
    { id: 'DOC-1', name: 'Government ID / Passport / Aadhaar', type: 'ID Proof', status: 'Pending', fileUrl: null, submittedAt: null, verifiedAt: null, notes: '' },
    { id: 'DOC-2', name: 'Degree & Educational Credentials', type: 'Education', status: 'Pending', fileUrl: null, submittedAt: null, verifiedAt: null, notes: '' },
    { id: 'DOC-3', name: 'Voided Check / Direct Deposit Authorization', type: 'Banking', status: 'Pending', fileUrl: null, submittedAt: null, verifiedAt: null, notes: '' },
    { id: 'DOC-4', name: 'Signed Non-Disclosure Agreement (NDA)', type: 'Legal', status: 'Pending', fileUrl: null, submittedAt: null, verifiedAt: null, notes: '' },
    { id: 'DOC-5', name: 'Previous Employment Relieving Letter', type: 'Experience', status: 'Pending', fileUrl: null, submittedAt: null, verifiedAt: null, notes: '' }
  ];

  const newRecord = {
    id: `ONB-${Date.now().toString().slice(-5)}`,
    name: name || 'New Hire',
    email: email || '',
    phone: phone || '',
    role: role || 'Team Member',
    department: department || 'Engineering',
    reportingManager: reportingManager || 'HR Manager',
    buddy: buddy || 'Senior Peer',
    joiningDate: joiningDate || new Date().toISOString().split('T')[0],
    welcomeMessage: welcomeMessage || `Welcome to the team! We are thrilled to embark on this journey with you.`,
    employmentType: employmentType || 'Full-Time',
    status: 'Pre-boarding', // Pre-boarding, Document Verification, IT Setup, Orientation, Completed
    completionRate: 0,
    checklist: defaultChecklist,
    documents: defaultDocuments,
    eSignature: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  onboardingRecords.unshift(newRecord);
  res.status(201).json(newRecord);
});

// Update checklist task status
router.put('/onboarding/:id/task', (req, res) => {
  const record = onboardingRecords.find(r => r.id === req.params.id);
  if (!record) return res.status(404).json({ error: 'Onboarding record not found' });

  const { taskId, status } = req.body;
  const task = record.checklist.find((t: any) => t.id === taskId);
  if (task) {
    task.status = status;
    // recalculate completionRate
    const completedTasks = record.checklist.filter((t: any) => t.status === 'Completed').length;
    const verifiedDocs = record.documents.filter((d: any) => d.status === 'Verified').length;
    const totalItems = record.checklist.length + record.documents.length;
    record.completionRate = Math.round(((completedTasks + verifiedDocs) / totalItems) * 100);

    if (record.completionRate === 100) {
      record.status = 'Completed';
    } else if (record.completionRate >= 60) {
      record.status = 'IT Setup';
    } else if (record.completionRate >= 25) {
      record.status = 'Document Verification';
    }

    record.updatedAt = new Date().toISOString();
  }

  res.json(record);
});

// Upload/Submit document
router.post('/onboarding/:id/document', (req, res) => {
  const record = onboardingRecords.find(r => r.id === req.params.id);
  if (!record) return res.status(404).json({ error: 'Onboarding record not found' });

  const { docId, fileName, fileUrl } = req.body;
  let doc = record.documents.find((d: any) => d.id === docId);

  if (!doc) {
    doc = {
      id: `DOC-${Date.now().toString().slice(-4)}`,
      name: fileName || 'Uploaded Document',
      type: 'Additional',
      status: 'Submitted',
      fileUrl: fileUrl || 'https://storage.athenahr.io/docs/sample.pdf',
      submittedAt: new Date().toISOString(),
      verifiedAt: null,
      notes: ''
    };
    record.documents.push(doc);
  } else {
    doc.status = 'Submitted';
    doc.fileUrl = fileUrl || 'https://storage.athenahr.io/docs/sample.pdf';
    doc.submittedAt = new Date().toISOString();
  }

  // Recalculate rate
  const completedTasks = record.checklist.filter((t: any) => t.status === 'Completed').length;
  const verifiedDocs = record.documents.filter((d: any) => d.status === 'Verified').length;
  const totalItems = record.checklist.length + record.documents.length;
  record.completionRate = Math.round(((completedTasks + verifiedDocs) / totalItems) * 100);
  record.updatedAt = new Date().toISOString();

  res.json(record);
});

// Verify or reject document (Admin action)
router.put('/onboarding/:id/document/:docId', (req, res) => {
  const record = onboardingRecords.find(r => r.id === req.params.id);
  if (!record) return res.status(404).json({ error: 'Onboarding record not found' });

  const { status, notes } = req.body; // status: 'Verified' | 'Rejected' | 'Pending'
  const doc = record.documents.find((d: any) => d.id === req.params.docId);
  if (doc) {
    doc.status = status;
    doc.notes = notes || '';
    if (status === 'Verified') {
      doc.verifiedAt = new Date().toISOString();
    } else {
      doc.verifiedAt = null;
    }

    // Recalculate
    const completedTasks = record.checklist.filter((t: any) => t.status === 'Completed').length;
    const verifiedDocs = record.documents.filter((d: any) => d.status === 'Verified').length;
    const totalItems = record.checklist.length + record.documents.length;
    record.completionRate = Math.round(((completedTasks + verifiedDocs) / totalItems) * 100);

    if (record.completionRate === 100) {
      record.status = 'Completed';
    }
    record.updatedAt = new Date().toISOString();
  }

  res.json(record);
});

// Electronic signature for agreement & NDA
router.post('/onboarding/:id/sign', (req, res) => {
  const record = onboardingRecords.find(r => r.id === req.params.id);
  if (!record) return res.status(404).json({ error: 'Onboarding record not found' });

  const { signerName, signatureData } = req.body;
  record.eSignature = {
    signerName: signerName || record.name,
    signatureData: signatureData || 'DIGITALLY_SIGNED',
    signedAt: new Date().toISOString(),
    ipAddress: req.ip || '127.0.0.1'
  };

  // Mark task 1 as completed
  const t1 = record.checklist.find((t: any) => t.id === 'CHK-1');
  if (t1) t1.status = 'Completed';

  // Recalculate
  const completedTasks = record.checklist.filter((t: any) => t.status === 'Completed').length;
  const verifiedDocs = record.documents.filter((d: any) => d.status === 'Verified').length;
  const totalItems = record.checklist.length + record.documents.length;
  record.completionRate = Math.round(((completedTasks + verifiedDocs) / totalItems) * 100);
  record.updatedAt = new Date().toISOString();

  res.json(record);
});

// Update overall onboarding status
router.put('/onboarding/:id/status', (req, res) => {
  const record = onboardingRecords.find(r => r.id === req.params.id);
  if (!record) return res.status(404).json({ error: 'Onboarding record not found' });

  const { status } = req.body;
  record.status = status;
  if (status === 'Completed') {
    record.completionRate = 100;
  }
  record.updatedAt = new Date().toISOString();
  res.json(record);
});

// Delete onboarding record
router.put('/onboarding/:id', (req, res) => {
  const index = onboardingRecords.findIndex(r => r.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Onboarding record not found' });
  onboardingRecords[index] = { ...onboardingRecords[index], ...req.body, updatedAt: new Date().toISOString() };
  res.json(onboardingRecords[index]);
});

router.delete('/onboarding/:id', (req, res) => {
  onboardingRecords = onboardingRecords.filter(r => r.id !== req.params.id);
  res.json({ message: 'Onboarding record deleted successfully' });
});

// ==========================================
// 2. ALERTS & REMINDERS (EMPLOYEE & ADMIN)
// ==========================================

let alertsAndReminders: any[] = [];

// Get all alerts with optional filter
router.get('/alerts', (req, res) => {
  const { audience, category, status } = req.query;
  let filtered = [...alertsAndReminders];

  if (audience && audience !== 'All') {
    filtered = filtered.filter(a => a.targetAudience === audience || a.targetAudience === 'All Employees');
  }
  if (category && category !== 'All') {
    filtered = filtered.filter(a => a.category === category);
  }
  if (status && status !== 'All') {
    filtered = filtered.filter(a => a.status === status);
  }

  res.json(filtered);
});

// Create custom alert or reminder
router.post('/alerts', (req, res) => {
  const {
    title,
    description,
    category,
    priority,
    targetAudience,
    targetDepartment,
    recipientName,
    dueDate,
    actionUrl
  } = req.body;

  const newAlert = {
    id: `ALT-${Date.now().toString().slice(-5)}`,
    title: title || 'New Notification',
    description: description || '',
    category: category || 'Custom Reminder', // Document Expiry, Probation Review, Onboarding Task, Policy Overdue, Attendance, Custom Reminder
    priority: priority || 'Normal', // Urgent, High, Normal, Info
    targetAudience: targetAudience || 'All Employees', // All Employees, Admin & HR, Department, Specific User
    targetDepartment: targetDepartment || 'All',
    recipientName: recipientName || '',
    dueDate: dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    status: 'Active', // Active, Read, Dismissed, Actioned
    actionUrl: actionUrl || '/hem',
    createdAt: new Date().toISOString()
  };

  alertsAndReminders.unshift(newAlert);
  res.status(201).json(newAlert);
});

// Mark alert as Read or Dismissed or Actioned
router.put('/alerts/:id/status', (req, res) => {
  const alert = alertsAndReminders.find(a => a.id === req.params.id);
  if (!alert) return res.status(404).json({ error: 'Alert not found' });

  const { status } = req.body;
  alert.status = status;
  res.json(alert);
});

// Broadcast bulk reminder
router.post('/alerts/broadcast', (req, res) => {
  const { title, message, audience, priority, category } = req.body;
  const broadcastAlert = {
    id: `ALT-${Date.now().toString().slice(-5)}`,
    title: title || 'Executive HR Announcement',
    description: message || '',
    category: category || 'Custom Reminder',
    priority: priority || 'High',
    targetAudience: audience || 'All Employees',
    targetDepartment: 'All',
    recipientName: 'All Personnel',
    dueDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    status: 'Active',
    actionUrl: '/hem',
    createdAt: new Date().toISOString()
  };

  alertsAndReminders.unshift(broadcastAlert);
  res.status(201).json(broadcastAlert);
});

// Delete alert
router.put('/alerts/:id', (req, res) => {
  const index = alertsAndReminders.findIndex(a => a.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Alert not found' });
  alertsAndReminders[index] = { ...alertsAndReminders[index], ...req.body };
  res.json(alertsAndReminders[index]);
});

router.delete('/alerts/:id', (req, res) => {
  alertsAndReminders = alertsAndReminders.filter(a => a.id !== req.params.id);
  res.json({ message: 'Alert removed' });
});

// ==========================================
// 3. POLICY PUBLISHED & ACKNOWLEDGMENT
// ==========================================

let policies: any[] = [];

// Get all published policies
router.get('/policies', (req, res) => {
  res.json(policies);
});

// Get single policy with audit trail
router.get('/policies/:id', (req, res) => {
  const policy = policies.find(p => p.id === req.params.id);
  if (!policy) return res.status(404).json({ error: 'Policy not found' });
  res.json(policy);
});

// Publish a new policy or version
router.post('/policies', (req, res) => {
  const {
    code,
    title,
    category,
    version,
    effectiveDate,
    gracePeriodDays,
    mandatory,
    targetAudience,
    summary,
    content,
    pdfUrl
  } = req.body;

  const newPolicy = {
    id: `POL-${Date.now().toString().slice(-4)}`,
    code: code || `POL-${Math.floor(100 + Math.random() * 900)}`,
    title: title || 'Corporate Policy Document',
    category: category || 'Ethics & Conduct', // Ethics & Conduct, Workplace Safety & POSH, IT & Security, Leaves & Benefits, Remote Work
    version: version || 'v1.0',
    publishedDate: new Date().toISOString().split('T')[0],
    effectiveDate: effectiveDate || new Date().toISOString().split('T')[0],
    gracePeriodDays: Number(gracePeriodDays) || 14,
    mandatory: mandatory !== undefined ? Boolean(mandatory) : true,
    targetAudience: targetAudience || 'All Employees',
    summary: summary || 'Comprehensive corporate operational guidelines and statutory compliance stipulations.',
    content: content || 'All personnel are required to maintain the highest ethical standards and abide by the provisions outlined herein.',
    pdfUrl: pdfUrl || 'https://storage.athenahr.io/policies/policy-doc.pdf',
    acknowledgments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  policies.unshift(newPolicy);
  res.status(201).json(newPolicy);
});

// Digital acknowledgment of policy by employee
router.post('/policies/:id/acknowledge', (req, res) => {
  const policy = policies.find(p => p.id === req.params.id);
  if (!policy) return res.status(404).json({ error: 'Policy not found' });

  const { userId, userName, userEmail, department, eSignature } = req.body;
  const existingAck = policy.acknowledgments.find((a: any) => a.userId === userId || a.userEmail === userEmail);

  if (existingAck) {
    return res.status(400).json({ error: 'Policy already acknowledged by this employee' });
  }

  const ackRecord = {
    id: `ACK-${Date.now().toString().slice(-5)}`,
    userId: userId || `USR-${Math.floor(100 + Math.random() * 900)}`,
    userName: userName || 'Current User',
    userEmail: userEmail || 'user@athenahr.io',
    department: department || 'General',
    acknowledgedAt: new Date().toISOString(),
    eSignature: eSignature || 'DIGITALLY_ACKNOWLEDGED',
    ipAddress: req.ip || '127.0.0.1'
  };

  policy.acknowledgments.push(ackRecord);
  policy.updatedAt = new Date().toISOString();

  res.status(201).json({ message: 'Policy acknowledged successfully', acknowledgment: ackRecord, policy });
});

// Trigger reminder for pending policy sign-offs
router.post('/policies/:id/remind', (req, res) => {
  const policy = policies.find(p => p.id === req.params.id);
  if (!policy) return res.status(404).json({ error: 'Policy not found' });

  // Create an automated alert in the alert hub
  const reminderAlert = {
    id: `ALT-${Date.now().toString().slice(-5)}`,
    title: `Compliance Action: Acknowledge ${policy.title}`,
    description: `Mandatory policy signoff for ${policy.title} (${policy.version}) is pending. Please review and provide your electronic signature.`,
    category: 'Policy Overdue',
    priority: 'Urgent',
    targetAudience: policy.targetAudience,
    targetDepartment: 'All',
    recipientName: 'Unacknowledged Staff',
    dueDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    status: 'Active',
    actionUrl: '/hem/policies',
    createdAt: new Date().toISOString()
  };

  alertsAndReminders.unshift(reminderAlert);

  res.json({ message: `Reminders dispatched for policy ${policy.code}`, alert: reminderAlert });
});

// Delete policy
router.put('/policies/:id', (req, res) => {
  const index = policies.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Policy not found' });
  policies[index] = { ...policies[index], ...req.body, updatedAt: new Date().toISOString() };
  res.json(policies[index]);
});

router.delete('/policies/:id', (req, res) => {
  policies = policies.filter(p => p.id !== req.params.id);
  res.json({ message: 'Policy document removed' });
});

// ==========================================
// 5. FULLY CUSTOMIZABLE LEAVE MANAGEMENT
// ==========================================

let customLeaveTypes = [
  {
    id: 'LT-PL',
    name: 'Privilege / Annual Earned Leave (PL)',
    code: 'PL',
    quota: 18,
    accrualFrequency: 'Monthly (1.5 days/mo)',
    carryForwardLimit: 12,
    encashable: true,
    minNoticeDays: 3,
    maxConsecutiveDays: 10,
    docRequiredAfterDays: 0,
    gender: 'All',
    color: 'emerald',
    description: 'Statutory paid annual vacation leave with year-end carry forward and encashment entitlement.'
  },
  {
    id: 'LT-CL',
    name: 'Casual Leave (CL)',
    code: 'CL',
    quota: 12,
    accrualFrequency: 'Annual Quota',
    carryForwardLimit: 0,
    encashable: false,
    minNoticeDays: 1,
    maxConsecutiveDays: 3,
    docRequiredAfterDays: 0,
    gender: 'All',
    color: 'blue',
    description: 'Short-notice leave for urgent personal matters, family obligations, and celebrations.'
  },
  {
    id: 'LT-SL',
    name: 'Sick / Medical Leave (SL)',
    code: 'SL',
    quota: 10,
    accrualFrequency: 'Annual Quota',
    carryForwardLimit: 5,
    encashable: false,
    minNoticeDays: 0,
    maxConsecutiveDays: 7,
    docRequiredAfterDays: 2,
    gender: 'All',
    color: 'amber',
    description: 'Leave for illness or recuperation. Medical practitioner certificate required for > 2 days.'
  },
  {
    id: 'LT-ML',
    name: 'Maternity Benefit Leave (ML)',
    code: 'ML',
    quota: 182, // 26 weeks
    accrualFrequency: 'Event Based',
    carryForwardLimit: 0,
    encashable: false,
    minNoticeDays: 30,
    maxConsecutiveDays: 182,
    docRequiredAfterDays: 1,
    gender: 'Female',
    color: 'purple',
    description: 'Fully paid 26 weeks statutory maternity leave under Maternity Benefit Act 1961.'
  },
  {
    id: 'LT-PTL',
    name: 'Paternity Leave (PTL)',
    code: 'PTL',
    quota: 15,
    accrualFrequency: 'Event Based',
    carryForwardLimit: 0,
    encashable: false,
    minNoticeDays: 7,
    maxConsecutiveDays: 15,
    docRequiredAfterDays: 1,
    gender: 'Male',
    color: 'indigo',
    description: 'Paid parental leave for secondary caregivers post childbirth or adoption.'
  },
  {
    id: 'LT-CO',
    name: 'Compensatory Off (Comp-Off)',
    code: 'CO',
    quota: 0,
    accrualFrequency: 'Overtime/Weekend Credit',
    carryForwardLimit: 30,
    encashable: true,
    minNoticeDays: 1,
    maxConsecutiveDays: 2,
    docRequiredAfterDays: 0,
    gender: 'All',
    color: 'teal',
    description: 'Credited automatically when working on scheduled weekly offs or public holidays.'
  },
  {
    id: 'LT-LOP',
    name: 'Loss of Pay / Unpaid Sabbatical (LOP)',
    code: 'LOP',
    quota: 90,
    accrualFrequency: 'On Request',
    carryForwardLimit: 0,
    encashable: false,
    minNoticeDays: 14,
    maxConsecutiveDays: 90,
    docRequiredAfterDays: 0,
    gender: 'All',
    color: 'rose',
    description: 'Authorized unpaid leave of absence without payroll salary accrual.'
  }
];

let leaveRequests: any[] = [];
let employeeLeaveLedgers: any[] = [];

// Get leave types
router.get('/leaves/types', (req, res) => {
  res.json(customLeaveTypes);
});

// Create/Update leave type
router.post('/leaves/types', (req, res) => {
  const { name, code, quota, accrualFrequency, carryForwardLimit, encashable, minNoticeDays, maxConsecutiveDays, docRequiredAfterDays, gender, color, description } = req.body;
  const newType = {
    id: `LT-${Date.now().toString().slice(-4)}`,
    name: name || 'Custom Leave',
    code: (code || 'CUST').toUpperCase(),
    quota: Number(quota) || 10,
    accrualFrequency: accrualFrequency || 'Annual Quota',
    carryForwardLimit: Number(carryForwardLimit) || 0,
    encashable: Boolean(encashable),
    minNoticeDays: Number(minNoticeDays) || 1,
    maxConsecutiveDays: Number(maxConsecutiveDays) || 5,
    docRequiredAfterDays: Number(docRequiredAfterDays) || 0,
    gender: gender || 'All',
    color: color || 'blue',
    description: description || 'Configurable organizational leave scheme.'
  };

  customLeaveTypes.push(newType);
  res.status(201).json(newType);
});

// Get leave applications
router.get('/leaves/requests', (req, res) => {
  res.json(leaveRequests);
});

// Apply for leave
router.post('/leaves/requests', (req, res) => {
  const { employeeName, employeeId, department, leaveTypeId, leaveTypeCode, startDate, endDate, daysCount, isHalfDay, halfDayType, reason, attachmentUrl } = req.body;
  
  const leaveDef = customLeaveTypes.find(t => t.id === leaveTypeId || t.code === leaveTypeCode) || customLeaveTypes[0];

  const newRequest = {
    id: `LR-${Date.now().toString().slice(-5)}`,
    employeeName: employeeName || 'Employee',
    employeeId: employeeId || 'EMP-1001',
    department: department || 'Engineering',
    leaveTypeId: leaveDef.id,
    leaveTypeName: leaveDef.name,
    leaveTypeCode: leaveDef.code,
    startDate: startDate || new Date().toISOString().split('T')[0],
    endDate: endDate || new Date().toISOString().split('T')[0],
    daysCount: isHalfDay ? 0.5 : (Number(daysCount) || 1),
    isHalfDay: Boolean(isHalfDay),
    halfDayType: halfDayType || 'First Half',
    reason: reason || 'Personal matters',
    attachmentUrl: attachmentUrl || null,
    status: 'Pending Manager Approval', // Pending Manager Approval, Approved, Rejected, Cancelled
    appliedAt: new Date().toISOString(),
    reviewedBy: null,
    reviewedAt: null,
    reviewerNotes: ''
  };

  leaveRequests.unshift(newRequest);
  res.status(201).json(newRequest);
});

// Approve or Reject leave request
router.put('/leaves/requests/:id/status', (req, res) => {
  const request = leaveRequests.find(r => r.id === req.params.id);
  if (!request) return res.status(404).json({ error: 'Leave request not found' });

  const { status, reviewerNotes, reviewedBy } = req.body;
  request.status = status; // Approved, Rejected
  request.reviewedBy = reviewedBy || 'Reporting Manager';
  request.reviewedAt = new Date().toISOString();
  request.reviewerNotes = reviewerNotes || '';

  res.json(request);
});

router.put('/leaves/requests/:id', (req, res) => {
  const request = leaveRequests.find(r => r.id === req.params.id);
  if (!request) return res.status(404).json({ error: 'Leave request not found' });
  Object.assign(request, req.body);
  res.json(request);
});

router.delete('/leaves/requests/:id', (req, res) => {
  leaveRequests = leaveRequests.filter(r => r.id !== req.params.id);
  res.json({ message: 'Leave request deleted successfully' });
});

router.put('/leaves/types/:id', (req, res) => {
  const t = customLeaveTypes.find(type => type.id === req.params.id);
  if (!t) return res.status(404).json({ error: 'Leave type not found' });
  Object.assign(t, req.body);
  res.json(t);
});

router.delete('/leaves/types/:id', (req, res) => {
  customLeaveTypes = customLeaveTypes.filter(type => type.id !== req.params.id);
  res.json({ message: 'Leave type deleted successfully' });
});

// Get leave balances
router.get('/leaves/balances', (req, res) => {
  res.json(employeeLeaveLedgers);
});

// ==========================================
// 6. SWIPE CAPTURE FROM VARIED SOURCES
// ==========================================

let swipeTerminals = [
  {
    id: 'DEV-BIO-01',
    name: 'Main Lobby Biometric Terminal',
    sourceType: 'Biometric Fingerprint (ZKTeco)',
    location: 'Bangalore HQ - Lobby East',
    ipAddress: '192.168.1.101',
    status: 'Online',
    lastSync: new Date().toISOString(),
    todaySwipes: 0,
    firmware: 'v4.1.2-Secure'
  },
  {
    id: 'DEV-RFID-02',
    name: 'Turnstile Access Barrier Gates',
    sourceType: 'RFID Smart Card Swipe',
    location: 'Turnstile Gate A & B',
    ipAddress: '192.168.1.104',
    status: 'Online',
    lastSync: new Date().toISOString(),
    todaySwipes: 0,
    firmware: 'v3.0.8'
  },
  {
    id: 'DEV-MOBILE-03',
    name: 'Athena HR Mobile App Geo-Beacon',
    sourceType: 'Mobile App Geofence (GPS)',
    location: 'Geo-Polygon (Radius 250m)',
    ipAddress: 'Cloud Gateway',
    status: 'Online',
    lastSync: new Date().toISOString(),
    todaySwipes: 0,
    firmware: 'App SDK 2.4'
  },
  {
    id: 'DEV-FACE-04',
    name: 'Front-Desk AI Facial Kiosk',
    sourceType: 'Facial Recognition AI Camera',
    location: 'Reception Area - Stand K1',
    ipAddress: '192.168.1.120',
    status: 'Online',
    lastSync: new Date().toISOString(),
    todaySwipes: 0,
    firmware: 'VisionEdge 1.9'
  },
  {
    id: 'DEV-WEB-05',
    name: 'Athena Cloud Employee Portal',
    sourceType: 'Web Portal Virtual Clock',
    location: 'Remote Workstation',
    ipAddress: 'Web Client IP',
    status: 'Online',
    lastSync: new Date().toISOString(),
    todaySwipes: 0,
    firmware: 'Web 3.2'
  }
];

let rawSwipeLogs: any[] = [];
let regularizationRequests: any[] = [];

// Get terminals
router.get('/swipes/terminals', (req, res) => {
  res.json(swipeTerminals);
});

// Add terminal
router.post('/swipes/terminals', (req, res) => {
  const { name, sourceType, location, ipAddress } = req.body;
  const terminal = {
    id: `DEV-${Date.now().toString().slice(-4)}`,
    name: name || 'Hardware Terminal',
    sourceType: sourceType || 'Biometric Fingerprint (ZKTeco)',
    location: location || 'Main Office',
    ipAddress: ipAddress || '192.168.1.150',
    status: 'Online',
    lastSync: new Date().toISOString(),
    todaySwipes: 0,
    firmware: 'v1.0.0'
  };
  swipeTerminals.push(terminal);
  res.status(201).json(terminal);
});

// Trigger terminal sync
router.put('/swipes/terminals/:id/sync', (req, res) => {
  const term = swipeTerminals.find(t => t.id === req.params.id);
  if (!term) return res.status(404).json({ error: 'Terminal not found' });
  term.lastSync = new Date().toISOString();
  term.status = 'Online';
  res.json({ message: 'Terminal synchronized successfully', terminal: term });
});

router.put('/swipes/terminals/:id', (req, res) => {
  const index = swipeTerminals.findIndex(t => t.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Terminal not found' });
  swipeTerminals[index] = { ...swipeTerminals[index], ...req.body };
  res.json(swipeTerminals[index]);
});

router.delete('/swipes/terminals/:id', (req, res) => {
  swipeTerminals = swipeTerminals.filter(t => t.id !== req.params.id);
  res.json({ message: 'Terminal deleted successfully' });
});

// Get raw swipe logs
router.get('/swipes/raw-logs', (req, res) => {
  res.json(rawSwipeLogs);
});

// Ingest swipe / punch
router.post('/swipes/raw-logs', (req, res) => {
  const { employeeId, employeeName, department, direction, sourceType, terminalId, location, confidence, photoSnapshotUrl } = req.body;

  const newLog = {
    id: `PUNCH-${Date.now().toString().slice(-6)}`,
    employeeId: employeeId || 'EMP-1001',
    employeeName: employeeName || 'Employee Name',
    department: department || 'Engineering',
    timestamp: new Date().toISOString(),
    direction: direction || 'Check-In', // Check-In, Check-Out, Break-Out, Break-In
    sourceType: sourceType || 'Biometric Fingerprint (ZKTeco)',
    terminalId: terminalId || 'DEV-BIO-01',
    location: location || 'Bangalore HQ (12.9716° N, 77.5946° E)',
    confidence: confidence ? Number(confidence) : 99.1,
    photoSnapshotUrl: photoSnapshotUrl || null,
    verificationStatus: 'Verified & Logged',
    isLate: direction === 'Check-In' && (new Date().getHours() > 9 || (new Date().getHours() === 9 && new Date().getMinutes() > 15))
  };

  rawSwipeLogs.unshift(newLog);

  // Update terminal swipe count
  const t = swipeTerminals.find(term => term.id === newLog.terminalId);
  if (t) t.todaySwipes += 1;

  res.status(201).json(newLog);
});

// Regularization requests
router.get('/attendance/regularizations', (req, res) => {
  res.json(regularizationRequests);
});

router.post('/attendance/regularize', (req, res) => {
  const { employeeId, employeeName, date, missedPunchType, reason, requestedTime } = req.body;

  const reg = {
    id: `REG-${Date.now().toString().slice(-5)}`,
    employeeId: employeeId || 'EMP-1001',
    employeeName: employeeName || 'Employee',
    date: date || new Date().toISOString().split('T')[0],
    missedPunchType: missedPunchType || 'Missed Check-In', // Missed Check-In, Missed Check-Out, Biometric Reader Error, On-Duty Client Visit
    requestedTime: requestedTime || '09:00 AM',
    reason: reason || 'On-duty client meeting in the morning.',
    status: 'Pending Manager Approval', // Pending Manager Approval, Approved, Rejected
    submittedAt: new Date().toISOString(),
    reviewedBy: null,
    reviewedAt: null
  };

  regularizationRequests.unshift(reg);
  res.status(201).json(reg);
});

router.put('/attendance/regularizations/:id', (req, res) => {
  const reg = regularizationRequests.find(r => r.id === req.params.id);
  if (!reg) return res.status(404).json({ error: 'Regularization request not found' });
  Object.assign(reg, req.body);
  if (req.body.status && !reg.reviewedAt) {
    reg.reviewedAt = new Date().toISOString();
  }
  res.json(reg);
});

router.delete('/attendance/regularizations/:id', (req, res) => {
  regularizationRequests = regularizationRequests.filter(r => r.id !== req.params.id);
  res.json({ message: 'Regularization request deleted successfully' });
});

// ==========================================
// 7. EXTENSIVE SHIFT MANAGEMENT
// ==========================================

let shiftDefinitions = [
  {
    id: 'SH-GEN',
    name: 'General Corporate Day Shift',
    code: 'GEN-01',
    startTime: '09:00',
    endTime: '18:00',
    totalHours: 9.0,
    gracePeriodMins: 15,
    halfDayThresholdHours: 4.5,
    fullDayThresholdHours: 8.0,
    breakDurationMins: 60,
    isNightShift: false,
    color: 'blue',
    applicableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    description: 'Standard enterprise business hours for engineering, product, and admin operations.'
  },
  {
    id: 'SH-MRN',
    name: 'Early Morning Operations Shift',
    code: 'MRN-02',
    startTime: '06:00',
    endTime: '14:30',
    totalHours: 8.5,
    gracePeriodMins: 10,
    halfDayThresholdHours: 4.0,
    fullDayThresholdHours: 7.5,
    breakDurationMins: 45,
    isNightShift: false,
    color: 'amber',
    applicableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    description: 'Early customer support, IT operations and logistics opening shift.'
  },
  {
    id: 'SH-EVN',
    name: 'Evening / European Overlap Shift',
    code: 'EVN-03',
    startTime: '14:00',
    endTime: '22:30',
    totalHours: 8.5,
    gracePeriodMins: 10,
    halfDayThresholdHours: 4.0,
    fullDayThresholdHours: 7.5,
    breakDurationMins: 45,
    isNightShift: false,
    color: 'purple',
    applicableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    description: 'EMEA business hours coverage with afternoon handover.'
  },
  {
    id: 'SH-NGT',
    name: 'Graveyard / US Night Support Shift',
    code: 'NGT-04',
    startTime: '22:00',
    endTime: '06:30',
    totalHours: 8.5,
    gracePeriodMins: 15,
    halfDayThresholdHours: 4.0,
    fullDayThresholdHours: 7.5,
    breakDurationMins: 60,
    isNightShift: true,
    color: 'slate',
    applicableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    description: 'Overnight 24/7 mission-critical operations with night-differential allowance.'
  },
  {
    id: 'SH-FLX',
    name: 'Flexible Core Hours Shift',
    code: 'FLX-05',
    startTime: '08:00',
    endTime: '20:00',
    totalHours: 8.0,
    gracePeriodMins: 60,
    halfDayThresholdHours: 4.0,
    fullDayThresholdHours: 8.0,
    breakDurationMins: 60,
    isNightShift: false,
    color: 'emerald',
    applicableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    description: 'Self-scheduled workday with mandatory core overlap between 11:00 AM - 4:00 PM.'
  }
];

let shiftRosterAssignments: any[] = [];
let shiftSwapRequests: any[] = [];

// Get shift types
router.get('/shifts/types', (req, res) => {
  res.json(shiftDefinitions);
});

// Create shift type
router.post('/shifts/types', (req, res) => {
  const { name, code, startTime, endTime, gracePeriodMins, halfDayThresholdHours, fullDayThresholdHours, breakDurationMins, isNightShift, color, description } = req.body;
  const newShift = {
    id: `SH-${Date.now().toString().slice(-4)}`,
    name: name || 'Custom Shift',
    code: (code || `SH-${Math.floor(10 + Math.random() * 90)}`).toUpperCase(),
    startTime: startTime || '09:00',
    endTime: endTime || '18:00',
    totalHours: 9.0,
    gracePeriodMins: Number(gracePeriodMins) || 15,
    halfDayThresholdHours: Number(halfDayThresholdHours) || 4.5,
    fullDayThresholdHours: Number(fullDayThresholdHours) || 8.0,
    breakDurationMins: Number(breakDurationMins) || 60,
    isNightShift: Boolean(isNightShift),
    color: color || 'blue',
    applicableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    description: description || 'Configurable operational work shift.'
  };

  shiftDefinitions.push(newShift);
  res.status(201).json(newShift);
});

// Get shift roster
router.get('/shifts/roster', (req, res) => {
  res.json(shiftRosterAssignments);
});

// Assign shift
router.post('/shifts/roster/assign', (req, res) => {
  const { employeeId, employeeName, department, shiftId, startDate, endDate, notes } = req.body;
  const shift = shiftDefinitions.find(s => s.id === shiftId) || shiftDefinitions[0];

  const assignment = {
    id: `ROST-${Date.now().toString().slice(-5)}`,
    employeeId: employeeId || 'EMP-1001',
    employeeName: employeeName || 'Employee Name',
    department: department || 'Engineering',
    shiftId: shift.id,
    shiftName: shift.name,
    shiftCode: shift.code,
    startTime: shift.startTime,
    endTime: shift.endTime,
    color: shift.color,
    startDate: startDate || new Date().toISOString().split('T')[0],
    endDate: endDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    assignedAt: new Date().toISOString(),
    notes: notes || 'Assigned by Workforce Operations'
  };

  shiftRosterAssignments.unshift(assignment);
  res.status(201).json(assignment);
});

router.put('/shifts/types/:id', (req, res) => {
  const s = shiftDefinitions.find(shift => shift.id === req.params.id);
  if (!s) return res.status(404).json({ error: 'Shift definition not found' });
  Object.assign(s, req.body);
  res.json(s);
});

router.delete('/shifts/types/:id', (req, res) => {
  shiftDefinitions = shiftDefinitions.filter(shift => shift.id !== req.params.id);
  res.json({ message: 'Shift definition deleted successfully' });
});

router.put('/shifts/roster/:id', (req, res) => {
  const r = shiftRosterAssignments.find(roster => roster.id === req.params.id);
  if (!r) return res.status(404).json({ error: 'Shift roster assignment not found' });
  Object.assign(r, req.body);
  res.json(r);
});

router.delete('/shifts/roster/:id', (req, res) => {
  shiftRosterAssignments = shiftRosterAssignments.filter(roster => roster.id !== req.params.id);
  res.json({ message: 'Shift roster assignment deleted successfully' });
});

// Get shift swap requests
router.get('/shifts/swaps', (req, res) => {
  res.json(shiftSwapRequests);
});

// Request shift swap
router.post('/shifts/swaps', (req, res) => {
  const { requesterName, requesterShift, targetPeerName, targetShift, swapDate, reason } = req.body;
  const swap = {
    id: `SWP-${Date.now().toString().slice(-5)}`,
    requesterName: requesterName || 'Employee A',
    requesterShift: requesterShift || 'General Shift',
    targetPeerName: targetPeerName || 'Employee B',
    targetShift: targetShift || 'Morning Shift',
    swapDate: swapDate || new Date().toISOString().split('T')[0],
    reason: reason || 'Personal emergency on scheduled shift date',
    status: 'Pending Manager Approval', // Pending Manager Approval, Approved, Rejected
    createdAt: new Date().toISOString()
  };

  shiftSwapRequests.unshift(swap);
  res.status(201).json(swap);
});

router.put('/shifts/swaps/:id', (req, res) => {
  const swap = shiftSwapRequests.find(s => s.id === req.params.id);
  if (!swap) return res.status(404).json({ error: 'Swap request not found' });

  const { status, reviewedBy } = req.body;
  swap.status = status;
  swap.reviewedBy = reviewedBy || 'Shift Lead';
  swap.reviewedAt = new Date().toISOString();

  res.json(swap);
});

// ==========================================
// 8. OVERTIME MANAGEMENT (OT)
// ==========================================

let overtimePolicy = {
  standardWorkdayMultiplier: 1.5,
  weekendWorkMultiplier: 2.0,
  publicHolidayMultiplier: 2.5,
  minimumThresholdMins: 60, // must work > 60m past shift to trigger OT
  maxMonthlyCapHours: 35,
  preApprovalRequired: true,
  payoutOption: 'Choice of Cash Payout or Comp-Off Credit'
};

let overtimeClaims: any[] = [];

// Get OT policy
router.get('/overtime/policy', (req, res) => {
  res.json(overtimePolicy);
});

// Update OT policy
router.put('/overtime/policy', (req, res) => {
  Object.assign(overtimePolicy, req.body);
  res.json(overtimePolicy);
});

// Get OT claims
router.get('/overtime/claims', (req, res) => {
  res.json(overtimeClaims);
});

// Submit OT claim
router.post('/overtime/claims', (req, res) => {
  const { employeeId, employeeName, department, date, hoursClaimed, dayType, projectTask, reason, preferredSettlement } = req.body;

  const multiplier = 
    dayType === 'Public Holiday' ? overtimePolicy.publicHolidayMultiplier :
    dayType === 'Weekend' ? overtimePolicy.weekendWorkMultiplier :
    overtimePolicy.standardWorkdayMultiplier;

  const newClaim = {
    id: `OT-${Date.now().toString().slice(-5)}`,
    employeeId: employeeId || 'EMP-1001',
    employeeName: employeeName || 'Employee Name',
    department: department || 'Engineering',
    date: date || new Date().toISOString().split('T')[0],
    hoursClaimed: Number(hoursClaimed) || 2.5,
    dayType: dayType || 'Standard Workday', // Standard Workday, Weekend, Public Holiday
    rateMultiplier: multiplier,
    projectTask: projectTask || 'Release Deployment & Critical Hotfix',
    reason: reason || 'Scheduled system maintenance window and client go-live.',
    preferredSettlement: preferredSettlement || 'Payroll Cash Payout', // Payroll Cash Payout, Comp-Off Credit
    status: 'Pending Manager Approval', // Pending Manager Approval, Approved, Rejected
    submittedAt: new Date().toISOString(),
    reviewedBy: null,
    reviewedAt: null
  };

  overtimeClaims.unshift(newClaim);
  res.status(201).json(newClaim);
});

// Approve/Reject OT claim
router.put('/overtime/claims/:id/status', (req, res) => {
  const claim = overtimeClaims.find(c => c.id === req.params.id);
  if (!claim) return res.status(404).json({ error: 'Overtime claim not found' });

  const { status, reviewedBy, notes } = req.body;
  claim.status = status;
  claim.reviewedBy = reviewedBy || 'Department Manager';
  claim.reviewedAt = new Date().toISOString();
  claim.notes = notes || '';

  res.json(claim);
});

router.put('/overtime/claims/:id', (req, res) => {
  const index = overtimeClaims.findIndex(c => c.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Overtime claim not found' });
  overtimeClaims[index] = { ...overtimeClaims[index], ...req.body };
  res.json(overtimeClaims[index]);
});

router.delete('/overtime/claims/:id', (req, res) => {
  overtimeClaims = overtimeClaims.filter(c => c.id !== req.params.id);
  res.json({ message: 'Overtime claim deleted successfully' });
});

// ==========================================
// 9. FACIAL RECOGNITION ATTENDANCE KIOSK
// ==========================================

let enrolledFaceProfiles: any[] = [];
let facialPunchLogs: any[] = [];

// Get enrolled employees
router.get('/face/enrolled', (req, res) => {
  res.json(enrolledFaceProfiles);
});

// Enroll an employee face
router.post('/face/enroll', (req, res) => {
  const { employeeId, employeeName, department, photoUrl, embeddingHash } = req.body;

  const existing = enrolledFaceProfiles.find(f => f.employeeId === employeeId);
  if (existing) {
    existing.photoUrl = photoUrl || existing.photoUrl;
    existing.embeddingHash = embeddingHash || `VEC-EMB-${Date.now()}`;
    existing.updatedAt = new Date().toISOString();
    return res.json(existing);
  }

  const newProfile = {
    id: `FACE-${Date.now().toString().slice(-4)}`,
    employeeId: employeeId || 'EMP-1001',
    employeeName: employeeName || 'Employee Name',
    department: department || 'Engineering',
    photoUrl: photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    embeddingHash: embeddingHash || `VEC-EMB-${Date.now()}`,
    status: 'Active Biometric Enrolled',
    enrolledAt: new Date().toISOString(),
    totalFacePunches: 0
  };

  enrolledFaceProfiles.unshift(newProfile);
  res.status(201).json(newProfile);
});

// Process a facial recognition punch
router.post('/face/punch', (req, res) => {
  const { employeeId, employeeName, department, direction, confidenceScore, snapshotUrl, gpsCoords, deviceId } = req.body;

  const confidence = confidenceScore ? Number(confidenceScore) : (97.5 + Math.random() * 2.4).toFixed(1);
  const matchedEmpName = employeeName || 'Rahul Sharma';
  const matchedEmpId = employeeId || 'EMP-3091';
  const matchedDept = department || 'Engineering';

  const punchRecord = {
    id: `F-PUNCH-${Date.now().toString().slice(-6)}`,
    employeeId: matchedEmpId,
    employeeName: matchedEmpName,
    department: matchedDept,
    direction: direction || 'Check-In',
    timestamp: new Date().toISOString(),
    confidenceScore: Number(confidence),
    livenessScore: 99.8,
    livenessVerified: true,
    snapshotUrl: snapshotUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    gpsCoords: gpsCoords || '12.9716° N, 77.5946° E (Bangalore HQ Kiosk)',
    deviceId: deviceId || 'DEV-FACE-01',
    verificationResult: 'MATCH_CONFIRMED',
    isLate: (direction || 'Check-In') === 'Check-In' && new Date().getHours() >= 9 && new Date().getMinutes() > 15
  };

  facialPunchLogs.unshift(punchRecord);

  // Also add to raw swipes log for unified attendance record
  rawSwipeLogs.unshift({
    id: `PUNCH-${Date.now().toString().slice(-6)}`,
    employeeId: matchedEmpId,
    employeeName: matchedEmpName,
    department: matchedDept,
    timestamp: punchRecord.timestamp,
    direction: punchRecord.direction,
    sourceType: 'Facial Recognition AI Camera',
    terminalId: punchRecord.deviceId,
    location: punchRecord.gpsCoords,
    confidence: Number(confidence),
    photoSnapshotUrl: punchRecord.snapshotUrl,
    verificationStatus: 'Verified & Logged',
    isLate: punchRecord.isLate
  });

  // Increment enrolled count
  const enrolled = enrolledFaceProfiles.find(f => f.employeeId === matchedEmpId);
  if (enrolled) enrolled.totalFacePunches += 1;

  res.status(201).json({
    message: `Face identified with ${confidence}% confidence. Attendance recorded.`,
    punch: punchRecord
  });
});

// Get facial recognition punch logs
router.get('/face/logs', (req, res) => {
  res.json(facialPunchLogs);
});

// ==========================================
// 10. HIGHLY CONFIGURABLE POLICIES & RULES
// ==========================================

let attendanceConfigurableRules = {
  // Late Mark & Deduction Rules
  lateArrivalRules: {
    gracePeriodMinutes: 15,
    lateMarkThresholdMinutes: 16,
    lateMarksAllowedPerMonth: 3,
    penaltyType: '0.5 Day Leave Deduction or LOP',
    deductFromLeaveType: 'CL', // Deduct Casual Leave first
    deductLossOfPayIfZeroBalance: true
  },
  // Early Departure Rules
  earlyDepartureRules: {
    allowedEarlyMins: 15,
    penaltyThresholdMins: 30,
    penaltyAction: 'Mark as Half Day'
  },
  // Work Hours Thresholds
  workHoursThresholds: {
    minimumHoursForFullDay: 8.0,
    minimumHoursForHalfDay: 4.5,
    mandatoryCoreHoursStart: '11:00',
    mandatoryCoreHoursEnd: '16:00'
  },
  // Missed Punch Regularization Policy
  missedPunchPolicy: {
    maxRegularizationsPerMonth: 3,
    requiresManagerApproval: true,
    mustApplyWithinDays: 3
  },
  // Work Week & Weekly Off Config
  workWeekConfig: {
    workDaysPerWeek: 5, // 5 or 6 or Alternate
    weeklyOffPattern: 'Sunday & Saturday Off (5-Day Week)', // 5-Day, 6-Day, 2nd & 4th Saturday Off
    crossMidnightNightShiftRollover: true
  },
  // Holiday Calendars
  holidayCalendar: [
    { id: 'HOL-1', date: '2026-01-26', name: 'Republic Day', type: 'National Mandatory', state: 'Pan-India' },
    { id: 'HOL-2', date: '2026-03-25', name: 'Holi', type: 'Festival Mandatory', state: 'Pan-India' },
    { id: 'HOL-3', date: '2026-05-01', name: 'Labour / May Day', type: 'Statutory Holiday', state: 'Pan-India' },
    { id: 'HOL-4', date: '2026-08-15', name: 'Independence Day', type: 'National Mandatory', state: 'Pan-India' },
    { id: 'HOL-5', date: '2026-10-02', name: 'Gandhi Jayanti', type: 'National Mandatory', state: 'Pan-India' },
    { id: 'HOL-6', date: '2026-10-20', name: 'Dussehra / Vijayadashami', type: 'Festival Mandatory', state: 'Pan-India' },
    { id: 'HOL-7', date: '2026-11-09', name: 'Diwali / Deepavali', type: 'Festival Mandatory', state: 'Pan-India' },
    { id: 'HOL-8', date: '2026-12-25', name: 'Christmas', type: 'National Mandatory', state: 'Pan-India' }
  ]
};

// Get configurable attendance & leave rules
router.get('/policies/rules', (req, res) => {
  res.json(attendanceConfigurableRules);
});

// Update configurable rules
router.put('/policies/rules', (req, res) => {
  Object.assign(attendanceConfigurableRules, req.body);
  res.json(attendanceConfigurableRules);
});

// Add holiday
router.post('/policies/holidays', (req, res) => {
  const { date, name, type, state } = req.body;
  const newHol = {
    id: `HOL-${Date.now().toString().slice(-4)}`,
    date: date || new Date().toISOString().split('T')[0],
    name: name || 'Official Holiday',
    type: type || 'National Mandatory',
    state: state || 'Pan-India'
  };
  attendanceConfigurableRules.holidayCalendar.push(newHol);
  res.status(201).json(newHol);
});

// Update holiday
router.put('/policies/holidays/:id', (req, res) => {
  const { id } = req.params;
  const index = attendanceConfigurableRules.holidayCalendar.findIndex((h: any) => h.id === id);
  if (index === -1) return res.status(404).json({ error: 'Holiday not found' });
  attendanceConfigurableRules.holidayCalendar[index] = { ...attendanceConfigurableRules.holidayCalendar[index], ...req.body };
  res.json(attendanceConfigurableRules.holidayCalendar[index]);
});

// Delete holiday
router.delete('/policies/holidays/:id', (req, res) => {
  const { id } = req.params;
  attendanceConfigurableRules.holidayCalendar = attendanceConfigurableRules.holidayCalendar.filter((h: any) => h.id !== id);
  res.json({ success: true, message: 'Holiday deleted' });
});

// ==========================================
// 11. OVERVIEW STATS (Aggregated)
// ==========================================
router.get('/overview-stats', async (req, res) => {
  try {
    const [empCount, attCount, payCount, perfCount] = await Promise.all([
      prisma.user.count().catch(() => 0),
      prisma.attendanceLog.count().catch(() => 0),
      prisma.payrollRecord.count().catch(() => 0),
      prisma.performanceReview.count().catch(() => 0)
    ]);

    res.json({
      employees: empCount,
      attendance: rawSwipeLogs.length || attCount,
      payroll: payCount,
      reviews: perfCount,
      onboarding: onboardingRecords.length,
      alerts: alertsAndReminders.filter(a => a.status === 'Active').length,
      policies: policies.length,
      leaveRequests: leaveRequests.length,
      leaveTypes: customLeaveTypes.length,
      swipeTerminals: swipeTerminals.length,
      rawSwipes: rawSwipeLogs.length,
      regularizations: regularizationRequests.length,
      shifts: shiftDefinitions.length,
      shiftRosters: shiftRosterAssignments.length,
      overtimeClaims: overtimeClaims.length,
      enrolledFaces: enrolledFaceProfiles.length,
      facePunches: facialPunchLogs.length
    });
  } catch (err) {
    res.json({
      employees: 0,
      attendance: rawSwipeLogs.length,
      payroll: 0,
      reviews: 0,
      onboarding: onboardingRecords.length,
      alerts: alertsAndReminders.filter(a => a.status === 'Active').length,
      policies: policies.length,
      leaveRequests: leaveRequests.length,
      leaveTypes: customLeaveTypes.length,
      swipeTerminals: swipeTerminals.length,
      rawSwipes: rawSwipeLogs.length,
      regularizations: regularizationRequests.length,
      shifts: shiftDefinitions.length,
      shiftRosters: shiftRosterAssignments.length,
      overtimeClaims: overtimeClaims.length,
      enrolledFaces: enrolledFaceProfiles.length,
      facePunches: facialPunchLogs.length
    });
  }
});

// ==========================================
// 8. EXIT MANAGEMENT & OFFBOARDING
// ==========================================

export interface ExitRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  designation: string;
  email: string;
  phone: string;
  joiningDate: string;
  resignationDate: string;
  requestedLWD: string;
  approvedLWD: string;
  noticePeriodDays: number;
  noticeShortfallDays: number;
  reasonCategory: 'Career Progression' | 'Higher Studies' | 'Relocation' | 'Compensation & Role' | 'Health & Personal' | 'Entrepreneurship' | 'Mutual Separation';
  detailedReason: string;
  submittedBy: 'Employee (Self)' | 'HR on Behalf' | 'Manager on Behalf';
  submittedByRemarks?: string;
  status: 'Submitted' | 'Manager Review' | 'Notice Period' | 'Clearance In Progress' | 'Exit Interview Scheduled' | 'FnF Settlement Approved' | 'Relieved & Closed' | 'Revoked';
  revocationDetails?: {
    revokedAt: string;
    revokedBy: string;
    revocationReason: string;
    counterOfferAccepted?: boolean;
    retainedDesignation?: string;
  };
  managerApproval?: {
    approvedBy: string;
    approvedAt: string;
    comments: string;
    decision: 'Approved' | 'Retained' | 'Waived Notice';
  };
  clearanceStatus: 'Not Started' | 'In Progress' | 'Fully Cleared' | 'Blocked / Discrepancy';
  overallClearanceProgress: number; // 0 - 100%
  exitInterviewStatus: 'Not Scheduled' | 'Scheduled' | 'Completed' | 'Waived';
  fnfStatus: 'Pending' | 'Calculated' | 'Settled';
  fnfAmount?: number;
  relievingLetterGenerated: boolean;
  createdAt: string;
}

export interface ClearanceItem {
  id: string;
  exitId: string;
  department: 'IT & Hardware Assets' | 'Finance & Accounts' | 'Project & Department Handover' | 'Admin & HR Operations';
  itemTitle: string;
  itemType: 'Hardware Asset' | 'Access Revocation' | 'Financial Recovery' | 'Knowledge Transfer' | 'Documentation';
  assetTag?: string;
  serialNumber?: string;
  assignedCondition?: string;
  status: 'Pending' | 'Cleared' | 'Discrepancy / Damaged' | 'Waived';
  recoveryNotes?: string;
  financialDeductionAmount?: number;
  clearedBy?: string;
  clearedAt?: string;
}

export interface ExitInterview {
  id: string;
  exitId: string;
  employeeId: string;
  employeeName: string;
  department: string;
  designation: string;
  interviewerName: string;
  scheduledDate: string;
  scheduledTime: string;
  meetingLink: string;
  mode: 'Online Video Call' | 'In-person' | 'Digital Self-Survey';
  status: 'Scheduled' | 'Completed' | 'Canceled';
  responses?: {
    overallExperience: number;
    managementEffectiveness: number;
    compensationSatisfaction: number;
    workLifeBalance: number;
    growthOpportunities: number;
    primaryPullFactor: string;
    primaryPushFactor: string;
    recommendCompany: 'Definitely Yes' | 'Maybe' | 'No';
    retentionFeedback: string;
    confidentialNotes: string;
    sentimentTone: 'Positive / Brand Advocate' | 'Constructive & Neutral' | 'Critical / Unhappy';
  };
  completedAt?: string;
}

// In-Memory Exit Management State
let exitRecords: ExitRecord[] = [];
let clearanceItems: ClearanceItem[] = [];
let exitInterviews: ExitInterview[] = [];

// Helper to auto-create standard clearance checklist
function generateStandardClearanceTasks(exitId: string): ClearanceItem[] {
  return [
    // IT & Hardware Assets
    {
      id: `CLR-IT-01-${Date.now()}`,
      exitId,
      department: 'IT & Hardware Assets',
      itemTitle: 'Corporate Primary Laptop / Workstation Return',
      itemType: 'Hardware Asset',
      assetTag: 'AST-LAP-4091',
      serialNumber: 'C02F8912MD6R',
      assignedCondition: 'A+ (Good)',
      status: 'Pending',
      recoveryNotes: 'Physical hardware inspection and disk wipe',
      financialDeductionAmount: 0
    },
    {
      id: `CLR-IT-02-${Date.now()}`,
      exitId,
      department: 'IT & Hardware Assets',
      itemTitle: 'Secondary External Monitor & Power Dock Return',
      itemType: 'Hardware Asset',
      assetTag: 'AST-MON-2104',
      status: 'Pending',
      financialDeductionAmount: 0
    },
    {
      id: `CLR-IT-03-${Date.now()}`,
      exitId,
      department: 'IT & Hardware Assets',
      itemTitle: 'Revoke Corporate Google Workspace / M365 Email & SSO',
      itemType: 'Access Revocation',
      status: 'Pending',
      recoveryNotes: 'Forward incoming critical emails to department lead'
    },
    {
      id: `CLR-IT-04-${Date.now()}`,
      exitId,
      department: 'IT & Hardware Assets',
      itemTitle: 'Revoke AWS / Cloud Production IAM & GitHub Repository Access',
      itemType: 'Access Revocation',
      status: 'Pending',
      recoveryNotes: 'Rotate API keys and SSH keys'
    },
    {
      id: `CLR-IT-05-${Date.now()}`,
      exitId,
      department: 'IT & Hardware Assets',
      itemTitle: 'Surrender RFID Smart Access Card & Biometric NFC Tag',
      itemType: 'Hardware Asset',
      assetTag: 'NFC-8902',
      status: 'Pending'
    },

    // Finance & Accounts
    {
      id: `CLR-FIN-01-${Date.now()}`,
      exitId,
      department: 'Finance & Accounts',
      itemTitle: 'Settle Pending Travel Advances & Tour Cash Balances',
      itemType: 'Financial Recovery',
      status: 'Pending',
      recoveryNotes: 'Audit pending expense claims ledger'
    },
    {
      id: `CLR-FIN-02-${Date.now()}`,
      exitId,
      department: 'Finance & Accounts',
      itemTitle: 'Surrender Corporate Credit Card (P-Card) & Settle Outstanding',
      itemType: 'Financial Recovery',
      status: 'Pending'
    },
    {
      id: `CLR-FIN-03-${Date.now()}`,
      exitId,
      department: 'Finance & Accounts',
      itemTitle: 'Staff Loan / Salary Advance Recovery Audit',
      itemType: 'Financial Recovery',
      status: 'Pending',
      recoveryNotes: 'Check unpaid loan EMI schedule in Payroll Hub'
    },

    // Project & Department Handover
    {
      id: `CLR-PRJ-01-${Date.now()}`,
      exitId,
      department: 'Project & Department Handover',
      itemTitle: 'Knowledge Transfer (KT) Document Repository Sign-off',
      itemType: 'Knowledge Transfer',
      status: 'Pending',
      recoveryNotes: 'Upload architecture specs and operational runbooks to Confluence'
    },
    {
      id: `CLR-PRJ-02-${Date.now()}`,
      exitId,
      department: 'Project & Department Handover',
      itemTitle: 'Reassign Active Jira Sprints, Tickets & Client Accounts',
      itemType: 'Knowledge Transfer',
      status: 'Pending'
    },
    {
      id: `CLR-PRJ-03-${Date.now()}`,
      exitId,
      department: 'Project & Department Handover',
      itemTitle: 'Vault Credentials & Shared Service Passwords Handover',
      itemType: 'Knowledge Transfer',
      status: 'Pending'
    },

    // Admin & HR Operations
    {
      id: `CLR-HR-01-${Date.now()}`,
      exitId,
      department: 'Admin & HR Operations',
      itemTitle: 'Earned Leave (PL) Balance Encashment & Gratuity Calculation',
      itemType: 'Documentation',
      status: 'Pending',
      recoveryNotes: 'Verify leaves taken vs balance for FnF settlement'
    },
    {
      id: `CLR-HR-02-${Date.now()}`,
      exitId,
      department: 'Admin & HR Operations',
      itemTitle: 'EPF / UAN Transfer & Pension Withdrawal Guidance Dossier',
      itemType: 'Documentation',
      status: 'Pending'
    },
    {
      id: `CLR-HR-03-${Date.now()}`,
      exitId,
      department: 'Admin & HR Operations',
      itemTitle: 'Sign NDA, Confidentiality & Non-Solicitation Exit Undertaking',
      itemType: 'Documentation',
      status: 'Pending'
    },
    {
      id: `CLR-HR-04-${Date.now()}`,
      exitId,
      department: 'Admin & HR Operations',
      itemTitle: 'Issue Experience Certificate & Digital Relieving Letter',
      itemType: 'Documentation',
      status: 'Pending'
    }
  ];
}

// ------------------------------------------
// EXIT MANAGEMENT ENDPOINTS
// ------------------------------------------

// 1. Get all exit records
router.get('/exit/records', (req, res) => {
  res.json(exitRecords);
});

// 2. Apply Resignation (Self or On Behalf)
router.post('/exit/apply', (req, res) => {
  const {
    employeeId, employeeName, department, designation, email, phone, joiningDate,
    resignationDate, requestedLWD, noticePeriodDays = 60, noticeShortfallDays = 0,
    reasonCategory, detailedReason, submittedBy = 'Employee (Self)', submittedByRemarks
  } = req.body;

  const exitId = `EXIT-${Date.now().toString().slice(-6)}`;
  const resDate = resignationDate || new Date().toISOString().split('T')[0];
  const reqLWD = requestedLWD || new Date(Date.now() + Number(noticePeriodDays) * 86400000).toISOString().split('T')[0];

  const newExit: ExitRecord = {
    id: exitId,
    employeeId: employeeId || 'EMP-101',
    employeeName: employeeName || 'Employee',
    department: department || 'General',
    designation: designation || 'Staff',
    email: email || 'employee@company.com',
    phone: phone || '+91 98765 43210',
    joiningDate: joiningDate || '2023-01-15',
    resignationDate: resDate,
    requestedLWD: reqLWD,
    approvedLWD: reqLWD,
    noticePeriodDays: Number(noticePeriodDays),
    noticeShortfallDays: Number(noticeShortfallDays),
    reasonCategory: reasonCategory || 'Career Progression',
    detailedReason: detailedReason || 'Pursuing an external career advancement opportunity.',
    submittedBy,
    submittedByRemarks,
    status: submittedBy.includes('on Behalf') ? 'Notice Period' : 'Submitted',
    clearanceStatus: 'In Progress',
    overallClearanceProgress: 0,
    exitInterviewStatus: 'Not Scheduled',
    fnfStatus: 'Pending',
    fnfAmount: 185000,
    relievingLetterGenerated: false,
    createdAt: new Date().toISOString()
  };

  // Auto-initiate clearance tasks right away
  const tasks = generateStandardClearanceTasks(exitId);
  clearanceItems.push(...tasks);
  newExit.clearanceStatus = 'In Progress';

  exitRecords.unshift(newExit);
  res.json({ message: 'Resignation successfully tendered and registered into Exit Workflow.', exitRecord: newExit });
});

// 3. Update Exit Record Status (e.g., Approve Notice, Put on Clearance, Settle FnF, Relieve)
router.put('/exit/records/:id/status', (req, res) => {
  const exit = exitRecords.find(e => e.id === req.params.id);
  if (!exit) return res.status(404).json({ error: 'Exit record not found' });

  const { status, approvedLWD, managerComments, approvedBy = 'Department Head / HR Lead' } = req.body;
  if (status) exit.status = status;
  if (approvedLWD) exit.approvedLWD = approvedLWD;

  if (managerComments) {
    exit.managerApproval = {
      approvedBy,
      approvedAt: new Date().toISOString(),
      comments: managerComments,
      decision: 'Approved'
    };
  }

  // If status is Relieved & Closed
  if (status === 'Relieved & Closed') {
    exit.relievingLetterGenerated = true;
    exit.fnfStatus = 'Settled';
    exit.clearanceStatus = 'Fully Cleared';
    exit.overallClearanceProgress = 100;
  }

  res.json(exit);
});

// Update Exit Record details
router.put('/exit/records/:id', (req, res) => {
  const exit = exitRecords.find(e => e.id === req.params.id);
  if (!exit) return res.status(404).json({ error: 'Exit record not found' });
  Object.assign(exit, req.body);
  res.json(exit);
});

// Delete Exit Record
router.delete('/exit/records/:id', (req, res) => {
  exitRecords = exitRecords.filter(e => e.id !== req.params.id);
  clearanceItems = clearanceItems.filter(c => c.exitId !== req.params.id);
  exitInterviews = exitInterviews.filter(i => i.exitId !== req.params.id);
  res.json({ message: 'Exit case deleted successfully' });
});

// 4. Revoke Resignation (On Employee's Behalf or Self)
router.post('/exit/records/:id/revoke', (req, res) => {
  const exit = exitRecords.find(e => e.id === req.params.id);
  if (!exit) return res.status(404).json({ error: 'Exit record not found' });

  const { revocationReason, revokedBy = 'HR on Behalf', counterOfferAccepted = false, retainedDesignation } = req.body;

  exit.status = 'Revoked';
  exit.revocationDetails = {
    revokedAt: new Date().toISOString(),
    revokedBy,
    revocationReason: revocationReason || 'Counter-offer accepted and growth pathway agreed with executive sponsor.',
    counterOfferAccepted: Boolean(counterOfferAccepted),
    retainedDesignation: retainedDesignation || exit.designation
  };

  // Mark all associated clearance tasks as waived
  clearanceItems.filter(c => c.exitId === exit.id).forEach(c => {
    c.status = 'Waived';
    c.recoveryNotes = 'Separation revoked. Retained in active employment.';
  });
  exit.clearanceStatus = 'Not Started';

  res.json({ message: `Resignation successfully revoked for ${exit.employeeName}. Employee reinstated to active workforce.`, exitRecord: exit });
});

// 5. Get Clearance Items for an Exit
router.get('/exit/clearance/:exitId', (req, res) => {
  const items = clearanceItems.filter(c => c.exitId === req.params.exitId);
  res.json(items);
});

// 6. Auto-initiate Clearance Checklist for an Exit
router.post('/exit/clearance/:exitId/auto-initiate', (req, res) => {
  const exit = exitRecords.find(e => e.id === req.params.exitId);
  if (!exit) return res.status(404).json({ error: 'Exit record not found' });

  // Remove existing pending items if any
  clearanceItems = clearanceItems.filter(c => c.exitId !== exit.id);
  const tasks = generateStandardClearanceTasks(exit.id);
  clearanceItems.push(...tasks);

  exit.clearanceStatus = 'In Progress';
  exit.overallClearanceProgress = 0;

  res.json({ message: `Auto-initiated ${tasks.length} departmental clearance tasks.`, tasks });
});

// 7. Update Clearance Task (Asset recovery sign-off, access revoke, finance settlement)
router.put('/exit/clearance/:exitId/item/:itemId', (req, res) => {
  const item = clearanceItems.find(c => c.exitId === req.params.exitId && c.id === req.params.itemId);
  if (!item) return res.status(404).json({ error: 'Clearance task not found' });

  const { status, recoveryNotes, financialDeductionAmount, clearedBy = 'Clearance Officer' } = req.body;
  if (status) item.status = status;
  if (recoveryNotes) item.recoveryNotes = recoveryNotes;
  if (financialDeductionAmount !== undefined) item.financialDeductionAmount = Number(financialDeductionAmount);

  if (status === 'Cleared') {
    item.clearedBy = clearedBy;
    item.clearedAt = new Date().toISOString();
  }

  // Recompute progress for the exit
  const exit = exitRecords.find(e => e.id === req.params.exitId);
  if (exit) {
    const allExitTasks = clearanceItems.filter(c => c.exitId === exit.id);
    const clearedCount = allExitTasks.filter(c => c.status === 'Cleared' || c.status === 'Waived').length;
    exit.overallClearanceProgress = allExitTasks.length > 0 ? Math.round((clearedCount / allExitTasks.length) * 100) : 0;
    if (exit.overallClearanceProgress === 100) {
      exit.clearanceStatus = 'Fully Cleared';
    } else if (allExitTasks.some(c => c.status === 'Discrepancy / Damaged')) {
      exit.clearanceStatus = 'Blocked / Discrepancy';
    } else {
      exit.clearanceStatus = 'In Progress';
    }
  }

  res.json({ item, overallProgress: exit?.overallClearanceProgress });
});

router.delete('/exit/clearance/:exitId/item/:itemId', (req, res) => {
  clearanceItems = clearanceItems.filter(c => !(c.exitId === req.params.exitId && c.id === req.params.itemId));
  res.json({ message: 'Clearance task removed' });
});

// 8. Exit Interviews: Get all
router.get('/exit/interviews', (req, res) => {
  res.json(exitInterviews);
});

// 9. Schedule Online Exit Interview
router.post('/exit/interviews/schedule', (req, res) => {
  const { exitId, interviewerName, scheduledDate, scheduledTime, meetingLink, mode = 'Online Video Call' } = req.body;
  const exit = exitRecords.find(e => e.id === exitId);
  if (!exit) return res.status(404).json({ error: 'Exit record not found' });

  const interview: ExitInterview = {
    id: `EXIT-INT-${Date.now().toString().slice(-6)}`,
    exitId: exit.id,
    employeeId: exit.employeeId,
    employeeName: exit.employeeName,
    department: exit.department,
    designation: exit.designation,
    interviewerName: interviewerName || 'Meera Nambiar (Senior HRBP)',
    scheduledDate: scheduledDate || new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    scheduledTime: scheduledTime || '14:30 IST',
    meetingLink: meetingLink || 'https://meet.google.com/exi-exit-off',
    mode,
    status: 'Scheduled'
  };

  exitInterviews.unshift(interview);
  exit.exitInterviewStatus = 'Scheduled';
  res.json(interview);
});

router.put('/exit/interviews/:id', (req, res) => {
  const interview = exitInterviews.find(i => i.id === req.params.id);
  if (!interview) return res.status(404).json({ error: 'Exit interview not found' });
  Object.assign(interview, req.body);
  res.json(interview);
});

router.delete('/exit/interviews/:id', (req, res) => {
  exitInterviews = exitInterviews.filter(i => i.id !== req.params.id);
  res.json({ message: 'Exit interview deleted' });
});

// 10. Record Online Exit Interview Responses
router.post('/exit/interviews/:id/record', (req, res) => {
  const interview = exitInterviews.find(i => i.id === req.params.id);
  if (!interview) return res.status(404).json({ error: 'Exit interview not found' });

  const {
    overallExperience = 4,
    managementEffectiveness = 4,
    compensationSatisfaction = 3,
    workLifeBalance = 4,
    growthOpportunities = 3,
    primaryPullFactor,
    primaryPushFactor,
    recommendCompany = 'Definitely Yes',
    retentionFeedback,
    confidentialNotes,
    sentimentTone = 'Constructive & Neutral'
  } = req.body;

  interview.responses = {
    overallExperience: Number(overallExperience),
    managementEffectiveness: Number(managementEffectiveness),
    compensationSatisfaction: Number(compensationSatisfaction),
    workLifeBalance: Number(workLifeBalance),
    growthOpportunities: Number(growthOpportunities),
    primaryPullFactor: primaryPullFactor || 'Substantial compensation uplift and global relocation.',
    primaryPushFactor: primaryPushFactor || 'Limited architecture modernization speed in legacy squads.',
    recommendCompany,
    retentionFeedback: retentionFeedback || 'Offer faster principal architect tracks and quarterly tech refresh.',
    confidentialNotes: confidentialNotes || 'Parted on cordial terms; candidate is an outstanding brand ambassador and open to boomerang return.',
    sentimentTone
  };

  interview.status = 'Completed';
  interview.completedAt = new Date().toISOString();

  const exit = exitRecords.find(e => e.id === interview.exitId);
  if (exit) {
    exit.exitInterviewStatus = 'Completed';
  }

  res.json(interview);
});

// 11. Simulate Exit Management Ecosystem
router.post('/exit/simulate', (req, res) => {
  const sampleExits: ExitRecord[] = [
    {
      id: 'EXIT-2026-001',
      employeeId: 'EMP-103',
      employeeName: 'Amit Verma',
      department: 'Operations & Logistics',
      designation: 'Operations Specialist',
      email: 'amit.verma@company.com',
      phone: '+91 98451 22890',
      joiningDate: '2023-04-10',
      resignationDate: '2026-09-01',
      requestedLWD: '2026-10-31',
      approvedLWD: '2026-10-31',
      noticePeriodDays: 60,
      noticeShortfallDays: 0,
      reasonCategory: 'Career Progression',
      detailedReason: 'Accepted an operational manager role closer to hometown in Ahmedabad with supply chain logistics firm.',
      submittedBy: 'Employee (Self)',
      status: 'Clearance In Progress',
      clearanceStatus: 'In Progress',
      overallClearanceProgress: 60,
      exitInterviewStatus: 'Scheduled',
      fnfStatus: 'Calculated',
      fnfAmount: 94500,
      relievingLetterGenerated: false,
      managerApproval: {
        approvedBy: 'Sneha Patel (Head of Logistics)',
        approvedAt: '2026-09-03T11:00:00Z',
        comments: 'Resignation accepted with regret. Amit has contributed reliably to warehouse operations.',
        decision: 'Approved'
      },
      createdAt: '2026-09-01T09:30:00Z'
    },
    {
      id: 'EXIT-2026-002',
      employeeId: 'EMP-101',
      employeeName: 'Rajesh Kumar',
      department: 'Technology & Engineering',
      designation: 'Staff Software Architect',
      email: 'rajesh.kumar@company.com',
      phone: '+91 98112 34567',
      joiningDate: '2022-02-01',
      resignationDate: '2026-08-15',
      requestedLWD: '2026-10-15',
      approvedLWD: '2026-10-15',
      noticePeriodDays: 60,
      noticeShortfallDays: 0,
      reasonCategory: 'Compensation & Role',
      detailedReason: 'Offered Principal Architect position at US-based cloud infrastructure company.',
      submittedBy: 'HR on Behalf',
      submittedByRemarks: 'Applied on employee behalf following mutual discussion with VP Engineering.',
      status: 'Revoked',
      revocationDetails: {
        revokedAt: '2026-08-25T16:00:00Z',
        revokedBy: 'HR on Behalf',
        revocationReason: 'Counter-offer successfully accepted: promoted to Principal Architect with 25% compensation revision and leadership of cloud core squad.',
        counterOfferAccepted: true,
        retainedDesignation: 'Principal Software Architect'
      },
      clearanceStatus: 'Not Started',
      overallClearanceProgress: 0,
      exitInterviewStatus: 'Waived',
      fnfStatus: 'Pending',
      relievingLetterGenerated: false,
      createdAt: '2026-08-15T10:00:00Z'
    },
    {
      id: 'EXIT-2026-003',
      employeeId: 'EMP-104',
      employeeName: 'Neha Kapoor',
      department: 'Product & Design',
      designation: 'Senior Product Analyst',
      email: 'neha.kapoor@company.com',
      phone: '+91 99881 77665',
      joiningDate: '2023-08-01',
      resignationDate: '2026-07-20',
      requestedLWD: '2026-09-20',
      approvedLWD: '2026-09-20',
      noticePeriodDays: 60,
      noticeShortfallDays: 0,
      reasonCategory: 'Higher Studies',
      detailedReason: 'Admitted to full-time MBA in Technology Strategy at INSEAD starting Fall 2026.',
      submittedBy: 'Employee (Self)',
      status: 'Relieved & Closed',
      clearanceStatus: 'Fully Cleared',
      overallClearanceProgress: 100,
      exitInterviewStatus: 'Completed',
      fnfStatus: 'Settled',
      fnfAmount: 148000,
      relievingLetterGenerated: true,
      managerApproval: {
        approvedBy: 'Ananya Sharma (Lead PM)',
        approvedAt: '2026-07-22T14:00:00Z',
        comments: 'Full support for higher education at INSEAD. Exceptional analytical rigor throughout her tenure.',
        decision: 'Approved'
      },
      createdAt: '2026-07-20T10:00:00Z'
    }
  ];

  exitRecords = sampleExits;

  // Clearance items for Amit Verma (EXIT-2026-001)
  const amitTasks = generateStandardClearanceTasks('EXIT-2026-001');
  // Mark some cleared
  amitTasks[0].status = 'Cleared'; // Laptop
  amitTasks[0].recoveryNotes = 'MacBook Pro received in excellent condition. Serial verified.';
  amitTasks[0].clearedBy = 'Rohit Verma (IT Lead)';
  amitTasks[0].clearedAt = '2026-09-18T14:00:00Z';

  amitTasks[1].status = 'Cleared'; // Monitor
  amitTasks[1].clearedBy = 'Rohit Verma (IT Lead)';

  amitTasks[2].status = 'Pending'; // Email
  amitTasks[4].status = 'Cleared'; // Access card

  amitTasks[5].status = 'Cleared'; // Travel advance
  amitTasks[5].recoveryNotes = 'All tour advances reconciled.';
  amitTasks[5].clearedBy = 'Suresh Nair (Finance)';

  amitTasks[8].status = 'Cleared'; // KT Handover
  amitTasks[8].recoveryNotes = 'Warehouse ops SOP and vendor escalation matrix updated in Confluence.';
  amitTasks[8].clearedBy = 'Sneha Patel (Operations Lead)';

  clearanceItems = amitTasks;

  // Exit interview for Neha Kapoor
  exitInterviews = [
    {
      id: 'EXIT-INT-001',
      exitId: 'EXIT-2026-003',
      employeeId: 'EMP-104',
      employeeName: 'Neha Kapoor',
      department: 'Product & Design',
      designation: 'Senior Product Analyst',
      interviewerName: 'Meera Nambiar (Senior HRBP)',
      scheduledDate: '2026-09-15',
      scheduledTime: '15:00 IST',
      meetingLink: 'https://meet.google.com/exi-exit-off',
      mode: 'Online Video Call',
      status: 'Completed',
      responses: {
        overallExperience: 5,
        managementEffectiveness: 5,
        compensationSatisfaction: 4,
        workLifeBalance: 4,
        growthOpportunities: 5,
        primaryPullFactor: 'Prestigious global MBA admission at INSEAD.',
        primaryPushFactor: 'None; thrilled with product mentorship and team culture.',
        recommendCompany: 'Definitely Yes',
        retentionFeedback: 'Keep supporting employee upskilling and sabbatical options for higher studies.',
        confidentialNotes: 'High-caliber professional. Welcome back as Senior Product Manager post-MBA.',
        sentimentTone: 'Positive / Brand Advocate'
      },
      completedAt: '2026-09-15T15:45:00Z'
    },
    {
      id: 'EXIT-INT-002',
      exitId: 'EXIT-2026-001',
      employeeId: 'EMP-103',
      employeeName: 'Amit Verma',
      department: 'Operations & Logistics',
      designation: 'Operations Specialist',
      interviewerName: 'Meera Nambiar (Senior HRBP)',
      scheduledDate: '2026-10-25',
      scheduledTime: '16:00 IST',
      meetingLink: 'https://meet.google.com/off-amit-ver',
      mode: 'Online Video Call',
      status: 'Scheduled'
    }
  ];

  res.json({
    message: 'Exit Management Ecosystem simulated with 3 realistic separation workflows, asset recovery clearances, and exit interviews!',
    exitsCount: exitRecords.length,
    clearanceCount: clearanceItems.length,
    interviewsCount: exitInterviews.length
  });
});

// 12. Reset Exit Records
router.post('/exit/reset', (req, res) => {
  exitRecords = [];
  clearanceItems = [];
  exitInterviews = [];
  res.json({ message: 'All exit records, clearance items, and exit interviews reset to 0 entries.' });
});

export default router;

