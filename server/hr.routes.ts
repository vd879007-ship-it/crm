import express from 'express';

const router = express.Router();

// ==========================================
// IN-MEMORY DATA STORES (INITIALIZED TO ZERO)
// ==========================================

let employees: any[] = [];
let documents: any[] = [];
let communications: any[] = [];
let surveys: any[] = [];
let kudos: any[] = [];
let statutoryReports: any[] = [];
let letterHistory: any[] = [];
let formSubmissions: any[] = [];

// ==========================================
// 1. EMPLOYEE INFORMATION MANAGEMENT
// ==========================================

router.get('/employees', (req, res) => {
  res.json(employees);
});

router.post('/employees', (req, res) => {
  const {
    name,
    empCode,
    email,
    phone,
    designation,
    department,
    joiningDate,
    dob,
    gender,
    bloodGroup,
    panNumber,
    aadhaarNumber,
    uanNumber,
    pfNumber,
    esiNumber,
    bankName,
    accountNumber,
    ifscCode,
    emergencyContactName,
    emergencyContactPhone,
    address,
    ctc,
    status
  } = req.body;

  const newEmp = {
    id: `EMP-${Date.now().toString().slice(-5)}`,
    empCode: empCode || `ATH-${Math.floor(1000 + Math.random() * 9000)}`,
    name: name || 'New Employee',
    email: email || '',
    phone: phone || '',
    designation: designation || 'Staff Associate',
    department: department || 'Engineering',
    joiningDate: joiningDate || new Date().toISOString().split('T')[0],
    dob: dob || '1995-01-01',
    gender: gender || 'Not Specified',
    bloodGroup: bloodGroup || 'O+',
    panNumber: panNumber || '',
    aadhaarNumber: aadhaarNumber || '',
    uanNumber: uanNumber || '',
    pfNumber: pfNumber || '',
    esiNumber: esiNumber || '',
    bankDetails: {
      bankName: bankName || 'HDFC Bank',
      accountNumber: accountNumber || '',
      ifscCode: ifscCode || ''
    },
    emergencyContact: {
      name: emergencyContactName || '',
      phone: emergencyContactPhone || ''
    },
    address: address || '',
    ctc: Number(ctc) || 0,
    status: status || 'Active', // Active, On Leave, Resigned, Terminated
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  employees.unshift(newEmp);
  res.status(201).json(newEmp);
});

router.put('/employees/:id', (req, res) => {
  const emp = employees.find(e => e.id === req.params.id);
  if (!emp) return res.status(404).json({ error: 'Employee not found' });

  Object.assign(emp, req.body, { updatedAt: new Date().toISOString() });
  res.json(emp);
});

router.delete('/employees/:id', (req, res) => {
  employees = employees.filter(e => e.id !== req.params.id);
  res.json({ message: 'Employee profile deleted' });
});

// ==========================================
// 2. DOCUMENT MANAGEMENT & VAULT
// ==========================================

router.get('/documents', (req, res) => {
  res.json(documents);
});

router.post('/documents', (req, res) => {
  const {
    employeeId,
    employeeName,
    category,
    title,
    documentNumber,
    expiryDate,
    fileUrl,
    notes
  } = req.body;

  const newDoc = {
    id: `DOC-${Date.now().toString().slice(-5)}`,
    employeeId: employeeId || 'General',
    employeeName: employeeName || 'Company-Wide',
    category: category || 'Identification & KYC', // Identification & KYC, Educational Credentials, Employment Contract, Visa & Work Permit, Medical & Insurance, Appraisal & Increment
    title: title || 'Document File',
    documentNumber: documentNumber || '',
    uploadDate: new Date().toISOString().split('T')[0],
    expiryDate: expiryDate || '',
    fileUrl: fileUrl || 'https://storage.athenahr.io/docs/employee-record.pdf',
    verified: false,
    verifiedBy: null,
    verifiedAt: null,
    notes: notes || '',
    createdAt: new Date().toISOString()
  };

  documents.unshift(newDoc);
  res.status(201).json(newDoc);
});

router.put('/documents/:id/verify', (req, res) => {
  const doc = documents.find(d => d.id === req.params.id);
  if (!doc) return res.status(404).json({ error: 'Document not found' });

  const { verified, verifiedBy, notes } = req.body;
  doc.verified = verified !== undefined ? verified : true;
  doc.verifiedBy = verifiedBy || 'HR Admin';
  doc.verifiedAt = new Date().toISOString();
  if (notes) doc.notes = notes;

  res.json(doc);
});

router.put('/documents/:id', (req, res) => {
  const doc = documents.find(d => d.id === req.params.id);
  if (!doc) return res.status(404).json({ error: 'Document not found' });
  Object.assign(doc, req.body);
  res.json(doc);
});

router.delete('/documents/:id', (req, res) => {
  documents = documents.filter(d => d.id !== req.params.id);
  res.json({ message: 'Document removed from vault' });
});

// ==========================================
// 3. EMPLOYEE COMMUNICATION & BULLETINS
// ==========================================

router.get('/communications', (req, res) => {
  res.json(communications);
});

router.post('/communications', (req, res) => {
  const {
    title,
    category,
    targetAudience,
    channels,
    content,
    priority,
    authorName,
    attachments
  } = req.body;

  const newComm = {
    id: `COM-${Date.now().toString().slice(-5)}`,
    title: title || 'Company Announcement',
    category: category || 'Corporate Announcement', // Corporate Announcement, Policy Circular, Executive Townhall, Urgent Notice, Health & Safety
    targetAudience: targetAudience || 'All Employees',
    channels: channels || ['In-App Bulletin', 'Email Broadcast'],
    content: content || '',
    priority: priority || 'Normal', // Urgent, High, Normal
    authorName: authorName || 'HR Leadership',
    publishDate: new Date().toISOString().split('T')[0],
    attachments: attachments || [],
    readCount: 0,
    acknowledgmentRequired: false,
    createdAt: new Date().toISOString()
  };

  communications.unshift(newComm);
  res.status(201).json(newComm);
});

router.put('/communications/:id', (req, res) => {
  const comm = communications.find(c => c.id === req.params.id);
  if (!comm) return res.status(404).json({ error: 'Communication not found' });
  Object.assign(comm, req.body);
  res.json(comm);
});

router.delete('/communications/:id', (req, res) => {
  communications = communications.filter(c => c.id !== req.params.id);
  res.json({ message: 'Communication bulletin archived' });
});

// ==========================================
// 4. EMPLOYEE ENGAGEMENT & RECOGNITION
// ==========================================

router.get('/engagement/surveys', (req, res) => {
  res.json(surveys);
});

router.post('/engagement/surveys', (req, res) => {
  const { title, description, category, questions, deadline } = req.body;

  const newSurvey = {
    id: `SUR-${Date.now().toString().slice(-5)}`,
    title: title || 'Quarterly Pulse Survey',
    description: description || 'Your feedback shapes our workplace culture and benefits.',
    category: category || 'eNPS & Culture', // eNPS & Culture, Management Feedback, Benefits & Perks, Remote Work
    questions: questions || [
      { id: 'Q1', text: 'How likely are you to recommend Athena HR as a great place to work?', type: 'Rating_1_10' },
      { id: 'Q2', text: 'Do you feel valued and recognized for your contributions?', type: 'Yes_No' },
      { id: 'Q3', text: 'What is one area leadership could improve?', type: 'Text' }
    ],
    deadline: deadline || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    responsesCount: 0,
    averageScore: 0,
    status: 'Active',
    createdAt: new Date().toISOString()
  };

  surveys.unshift(newSurvey);
  res.status(201).json(newSurvey);
});

router.put('/engagement/surveys/:id', (req, res) => {
  const survey = surveys.find(s => s.id === req.params.id);
  if (!survey) return res.status(404).json({ error: 'Survey not found' });
  Object.assign(survey, req.body);
  res.json(survey);
});

router.delete('/engagement/surveys/:id', (req, res) => {
  surveys = surveys.filter(s => s.id !== req.params.id);
  res.json({ message: 'Survey deleted successfully' });
});

router.post('/engagement/surveys/:id/respond', (req, res) => {
  const survey = surveys.find(s => s.id === req.params.id);
  if (!survey) return res.status(404).json({ error: 'Survey not found' });

  survey.responsesCount = (survey.responsesCount || 0) + 1;
  survey.averageScore = 8.5; // Calculated demo score
  res.json({ message: 'Survey response submitted anonymously', survey });
});

router.get('/engagement/kudos', (req, res) => {
  res.json(kudos);
});

router.post('/engagement/kudos', (req, res) => {
  const { senderName, recipientName, category, message, points } = req.body;

  const newKudos = {
    id: `KUD-${Date.now().toString().slice(-5)}`,
    senderName: senderName || 'Colleague',
    recipientName: recipientName || 'Team Member',
    category: category || 'Team Player', // Team Player, Innovation Star, Customer Hero, Leadership Impact
    message: message || 'Thank you for going above and beyond on our latest project!',
    points: Number(points) || 100,
    timestamp: new Date().toISOString()
  };

  kudos.unshift(newKudos);
  res.status(201).json(newKudos);
});

// ==========================================
router.put('/engagement/kudos/:id', (req, res) => {
  const k = kudos.find(item => item.id === req.params.id);
  if (!k) return res.status(404).json({ error: 'Kudos not found' });
  Object.assign(k, req.body);
  res.json(k);
});

router.delete('/engagement/kudos/:id', (req, res) => {
  kudos = kudos.filter(item => item.id !== req.params.id);
  res.json({ message: 'Kudos removed successfully' });
});

// 5. EXTENSIVE LABOUR & LAW REPORTS
// ==========================================

router.get('/labour-law-reports', (req, res) => {
  res.json(statutoryReports);
});

router.post('/labour-law-reports/generate', (req, res) => {
  const { actType, period, state, comments } = req.body;

  const newReport = {
    id: `REP-LL-${Date.now().toString().slice(-5)}`,
    actType: actType || 'Employees Provident Fund (EPFO / ECR)', // EPFO / ECR, ESIC Form 6, Gratuity Act 1972, Minimum Wages Act 1948, Payment of Bonus Act, Maternity Benefit Act 1961, POSH Annual Report
    period: period || 'September 2026',
    state: state || 'All States / Pan-India',
    complianceStatus: 'Compliant & Audit Ready',
    generatedDate: new Date().toISOString().split('T')[0],
    filingDeadline: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
    recordsAudited: employees.length || 0,
    fileDownloadUrl: `https://storage.athenahr.io/compliance/statutory_${Date.now()}.pdf`,
    comments: comments || 'Auto-generated statutory return based on current payroll and attendance logs.',
    createdAt: new Date().toISOString()
  };

  statutoryReports.unshift(newReport);
  res.status(201).json(newReport);
});

router.put('/labour-law-reports/:id', (req, res) => {
  const report = statutoryReports.find(r => r.id === req.params.id);
  if (!report) return res.status(404).json({ error: 'Report not found' });
  Object.assign(report, req.body);
  res.json(report);
});

router.delete('/labour-law-reports/:id', (req, res) => {
  statutoryReports = statutoryReports.filter(r => r.id !== req.params.id);
  res.json({ message: 'Statutory report deleted successfully' });
});

// ==========================================
// 6. LETTER & MAIL MERGE
// ==========================================

let letterTemplates = [
  {
    id: 'TPL-LET-1',
    name: 'Employment Offer & Appointment Letter',
    type: 'Appointment',
    variables: ['{{employee_name}}', '{{designation}}', '{{department}}', '{{ctc}}', '{{joining_date}}', '{{work_location}}'],
    body: `Dear {{employee_name}},

We are delighted to formally offer you the position of {{designation}} in the {{department}} department at Athena HR, commencing on {{joining_date}} at our {{work_location}} office.

Your total annual Cost to Company (CTC) will be ₹{{ctc}}. Enclosed are your specific terms of employment and compensation annexures.

Welcome aboard!
Yours sincerely,
Athena HR People Operations`
  },
  {
    id: 'TPL-LET-2',
    name: 'Probation Confirmation Letter',
    type: 'Confirmation',
    variables: ['{{employee_name}}', '{{designation}}', '{{effective_date}}'],
    body: `Dear {{employee_name}},

Consequent to the successful completion of your probationary period and subsequent performance evaluation, we are pleased to confirm your employment as {{designation}} with effective date {{effective_date}}.

All other terms of your appointment letter remain unchanged. Congratulations on your confirmation!

Sincerely,
People & Culture Team`
  },
  {
    id: 'TPL-LET-3',
    name: 'Annual Compensation Increment & Appraisal Letter',
    type: 'Increment',
    variables: ['{{employee_name}}', '{{designation}}', '{{previous_ctc}}', '{{revised_ctc}}', '{{effective_date}}'],
    body: `Dear {{employee_name}},

In recognition of your exceptional performance and valuable contribution towards our corporate objectives, management is pleased to revise your annual compensation.

Effective {{effective_date}}, your revised CTC will be ₹{{revised_ctc}} (revised from ₹{{previous_ctc}}).

We look forward to your continued dedication and excellence.
Sincerely,
Chief Human Resources Officer`
  },
  {
    id: 'TPL-LET-4',
    name: 'Work Experience & Relieving Certificate',
    type: 'Relieving',
    variables: ['{{employee_name}}', '{{designation}}', '{{joining_date}}', '{{relieving_date}}'],
    body: `TO WHOMSOEVER IT MAY CONCERN

This is to certify that {{employee_name}} was employed with Athena HR as {{designation}} from {{joining_date}} to {{relieving_date}}.

During their tenure with us, they demonstrated high professionalism, ethical conduct, and technical competence. All dues have been cleared, and they stand relieved from company duties as of {{relieving_date}}.

We wish them success in all future endeavors.
Yours faithfully,
Athena HR Management`
  }
];

router.get('/letters/templates', (req, res) => {
  res.json(letterTemplates);
});

router.post('/letters/templates', (req, res) => {
  const { name, type, body, variables } = req.body;
  const newTpl = {
    id: `TPL-LET-${Date.now().toString().slice(-5)}`,
    name: name || 'Custom HR Letter Template',
    type: type || 'General',
    variables: variables || ['{{employee_name}}', '{{designation}}', '{{department}}'],
    body: body || 'Dear {{employee_name}},\n\n'
  };
  letterTemplates.unshift(newTpl);
  res.status(201).json(newTpl);
});

router.put('/letters/templates/:id', (req, res) => {
  const tpl = letterTemplates.find(t => t.id === req.params.id);
  if (!tpl) return res.status(404).json({ error: 'Template not found' });
  Object.assign(tpl, req.body);
  res.json(tpl);
});

router.delete('/letters/templates/:id', (req, res) => {
  letterTemplates = letterTemplates.filter(t => t.id !== req.params.id);
  res.json({ message: 'Letter template deleted successfully' });
});

router.get('/letters/history', (req, res) => {
  res.json(letterHistory);
});

router.post('/letters/generate', (req, res) => {
  const { templateId, employeeId, employeeName, designation, department, customVariables } = req.body;
  const template = letterTemplates.find(t => t.id === templateId) || letterTemplates[0];

  let generatedContent = template ? template.body : '';
  const vars: any = {
    '{{employee_name}}': employeeName || 'Employee',
    '{{designation}}': designation || 'Software Engineer',
    '{{department}}': department || 'Engineering',
    '{{joining_date}}': new Date().toISOString().split('T')[0],
    '{{effective_date}}': new Date().toISOString().split('T')[0],
    '{{ctc}}': '15,00,000',
    '{{work_location}}': 'Bangalore Headquarters',
    ...customVariables
  };

  Object.keys(vars).forEach(key => {
    generatedContent = generatedContent.replaceAll(key, vars[key]);
  });

  const record = {
    id: `LET-${Date.now().toString().slice(-5)}`,
    templateId: template ? template.id : 'CUSTOM',
    templateName: template ? template.name : 'Custom Letter',
    employeeId: employeeId || 'EMP-TEMP',
    employeeName: employeeName || 'Employee Name',
    generatedDate: new Date().toISOString().split('T')[0],
    content: generatedContent,
    pdfUrl: `https://storage.athenahr.io/letters/${Date.now()}.pdf`,
    status: 'Dispatched & Archived',
    createdAt: new Date().toISOString()
  };

  letterHistory.unshift(record);
  res.status(201).json(record);
});

router.put('/letters/history/:id', (req, res) => {
  const record = letterHistory.find(h => h.id === req.params.id);
  if (!record) return res.status(404).json({ error: 'Letter record not found' });
  Object.assign(record, req.body);
  res.json(record);
});

router.delete('/letters/history/:id', (req, res) => {
  letterHistory = letterHistory.filter(h => h.id !== req.params.id);
  res.json({ message: 'Letter record deleted successfully' });
});

// ==========================================
// 7. COMPANY POLICIES & FORMS
// ==========================================

const standardCompanyForms = [
  {
    id: 'FRM-01',
    name: 'Form 12BB - Tax Deduction & Investment Proof Declaration',
    category: 'Finance & Tax',
    description: 'Statutory income tax declaration form for HRA, 80C, 80D, and Home Loan interest.',
    format: 'Digital Fillable',
    pdfUrl: 'https://storage.athenahr.io/forms/form_12bb.pdf'
  },
  {
    id: 'FRM-02',
    name: 'Official Travel & Expense Reimbursement Claim',
    category: 'Finance & Operations',
    description: 'Submit domestic and international flight, hotel, and client meal bills for reimbursement.',
    format: 'Digital Fillable',
    pdfUrl: 'https://storage.athenahr.io/forms/travel_expense.pdf'
  },
  {
    id: 'FRM-03',
    name: 'No Objection Certificate (NOC) Request Form',
    category: 'Administration',
    description: 'Application for visa processing, higher education, or passport renewal NOC.',
    format: 'Digital Fillable',
    pdfUrl: 'https://storage.athenahr.io/forms/noc_request.pdf'
  },
  {
    id: 'FRM-04',
    name: 'Medical Insurance Dependent Addition / Deletion Form',
    category: 'Benefits & Health',
    description: 'Add newly married spouse or newborn child to corporate group mediclaim policy.',
    format: 'Digital Fillable',
    pdfUrl: 'https://storage.athenahr.io/forms/insurance_dependent.pdf'
  },
  {
    id: 'FRM-05',
    name: 'Comprehensive Exit Clearance & Handover Form',
    category: 'Separation',
    description: 'Digital sign-offs from IT hardware, finance, admin, and project lead during exit.',
    format: 'Digital Fillable',
    pdfUrl: 'https://storage.athenahr.io/forms/exit_clearance.pdf'
  }
];

router.get('/forms', (req, res) => {
  res.json(standardCompanyForms);
});

router.get('/forms/submissions', (req, res) => {
  res.json(formSubmissions);
});

router.post('/forms/submissions', (req, res) => {
  const { formId, formName, employeeName, department, submissionData } = req.body;

  const newSub = {
    id: `SUB-${Date.now().toString().slice(-5)}`,
    formId: formId || 'FRM-01',
    formName: formName || 'Standard Form',
    employeeName: employeeName || 'Employee',
    department: department || 'General',
    submissionDate: new Date().toISOString().split('T')[0],
    data: submissionData || {},
    status: 'Pending Review', // Pending Review, Approved, Rejected
    reviewedBy: null,
    reviewedAt: null,
    createdAt: new Date().toISOString()
  };

  formSubmissions.unshift(newSub);
  res.status(201).json(newSub);
});

router.put('/forms/submissions/:id/status', (req, res) => {
  const sub = formSubmissions.find(s => s.id === req.params.id);
  if (!sub) return res.status(404).json({ error: 'Submission not found' });

  const { status, reviewedBy } = req.body;
  sub.status = status;
  sub.reviewedBy = reviewedBy || 'HR Admin';
  sub.reviewedAt = new Date().toISOString();
  res.json(sub);
});

router.put('/forms/submissions/:id', (req, res) => {
  const sub = formSubmissions.find(s => s.id === req.params.id);
  if (!sub) return res.status(404).json({ error: 'Submission not found' });
  Object.assign(sub, req.body);
  res.json(sub);
});

router.delete('/forms/submissions/:id', (req, res) => {
  formSubmissions = formSubmissions.filter(s => s.id !== req.params.id);
  res.json({ message: 'Submission deleted successfully' });
});

// ==========================================
// 8. OVERVIEW STATS (Aggregated)
// ==========================================

router.get('/overview-stats', (req, res) => {
  res.json({
    totalEmployees: employees.length,
    activeDocuments: documents.length,
    announcements: communications.length,
    activeSurveys: surveys.length,
    totalKudos: kudos.length,
    labourLawReports: statutoryReports.length,
    lettersGenerated: letterHistory.length,
    formSubmissions: formSubmissions.length
  });
});

export default router;
