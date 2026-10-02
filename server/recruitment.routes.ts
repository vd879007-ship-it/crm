import express from 'express';

const router = express.Router();

// ==========================================
// IN-MEMORY DATA STORE INITIALIZED TO ZERO
// ==========================================

let requisitions: any[] = [];

let sourcingChannels = [
  { id: 'SC-1', name: 'LinkedIn Recruiter', type: 'Job Board', candidatesCount: 0, costSpent: 0, hiredCount: 0, efficiencyScore: 0 },
  { id: 'SC-2', name: 'Employee Referrals', type: 'Internal', candidatesCount: 0, costSpent: 0, hiredCount: 0, efficiencyScore: 0 },
  { id: 'SC-3', name: 'Indeed Sponsored', type: 'Job Board', candidatesCount: 0, costSpent: 0, hiredCount: 0, efficiencyScore: 0 },
  { id: 'SC-4', name: 'GitHub & Outbound Sourcing', type: 'Outbound', candidatesCount: 0, costSpent: 0, hiredCount: 0, efficiencyScore: 0 },
  { id: 'SC-5', name: 'Campus & Tech Talks', type: 'Events', candidatesCount: 0, costSpent: 0, hiredCount: 0, efficiencyScore: 0 }
];

let sourcingCampaigns: any[] = [];

let candidates: any[] = [];

let communications: any[] = [];

let communicationTemplates = [
  {
    id: 'TPL-1',
    title: 'Round 1 Initial Recruiter Screen',
    type: 'Interview Invitation',
    subject: 'Athena HR: Initial Conversation for {{job_title}}',
    body: 'Hi {{candidate_name}},\n\nThank you for applying for the {{job_title}} role at Athena HR. We were very impressed by your background and would love to schedule a 30-minute introductory call to learn more about your goals and share details about our team.\n\nPlease select a convenient time from my calendar link: https://meet.athenahr.io/recruiter-screen\n\nBest regards,\n{{recruiter_name}}\nTalent Acquisition Team'
  },
  {
    id: 'TPL-2',
    title: 'Technical Panel Interview',
    type: 'Interview Invitation',
    subject: 'Athena HR: Technical Architecture Panel - {{candidate_name}}',
    body: 'Hi {{candidate_name}},\n\nCongratulations on moving forward! For the next stage, we have scheduled a 60-minute technical session covering architecture and system design.\n\nDate: {{interview_date}}\nTime: {{interview_time}}\nMeeting Link: {{meeting_url}}\nInterviewers: {{interviewer_names}}\n\nFeel free to reach out with any questions prior to the session.'
  },
  {
    id: 'TPL-3',
    title: 'Pre-Employment Background Check Request',
    type: 'Verification',
    subject: 'Action Required: Background Screening Authorization - Athena HR',
    body: 'Dear {{candidate_name}},\n\nAs we prepare for the final stages of the hiring process for {{job_title}}, we require pre-employment background screening through our verification partner.\n\nPlease complete the secure verification portal link within 3 business days: {{screening_portal_url}}\n\nThank you,\nAthena HR Compliance & People Operations'
  },
  {
    id: 'TPL-4',
    title: 'Formal Offer Letter Announcement',
    type: 'Offer',
    subject: 'Athena HR: Official Job Offer for {{job_title}}',
    body: 'Dear {{candidate_name}},\n\nWe are overjoyed to formally extend an offer to join Athena HR as our {{job_title}}! Enclosed is your formal offer package detailing compensation, equity, healthcare benefits, and initial start date.\n\nPlease review and sign electronically via DocuSign by {{expiry_date}}.\n\nWelcome to the team!\n{{hiring_manager_name}} & Athena Leadership'
  },
  {
    id: 'TPL-5',
    title: 'Polite Application Rejection',
    type: 'Rejection',
    subject: 'Your application with Athena HR for {{job_title}}',
    body: 'Dear {{candidate_name}},\n\nThank you for your time and interest in the {{job_title}} position at Athena HR. While your qualifications and experience are impressive, we have chosen to proceed with another candidate whose background more closely aligns with our immediate technical requirements.\n\nWe will retain your profile in our talent network for future openings that match your skillset. We wish you continued success in your career.\n\nWarm regards,\nAthena HR Talent Acquisition'
  }
];

let backgroundScreenings: any[] = [];

let offerLetters: any[] = [];

// ==========================================
// 1. REQUISITION ROUTES
// ==========================================

router.get('/requisitions', (req, res) => {
  res.json(requisitions);
});

router.post('/requisitions', (req, res) => {
  const { title, department, hiringManager, positionsCount, employmentType, location, salaryMin, salaryMax, priority, description, targetDate } = req.body;
  const newReq = {
    id: `REQ-2026-${String(requisitions.length + 1).padStart(3, '0')}`,
    title,
    department: department || 'Engineering',
    hiringManager: hiringManager || 'HR Admin',
    positionsCount: Number(positionsCount) || 1,
    filledCount: 0,
    employmentType: employmentType || 'Full-time',
    location: location || 'Remote',
    salaryMin: Number(salaryMin) || 80000,
    salaryMax: Number(salaryMax) || 120000,
    priority: priority || 'Normal',
    status: 'Approved',
    targetDate: targetDate || '2026-11-30',
    description: description || '',
    createdAt: new Date().toISOString()
  };
  requisitions.unshift(newReq);
  res.status(201).json(newReq);
});

router.put('/requisitions/:id', (req, res) => {
  const { id } = req.params;
  const index = requisitions.findIndex(r => r.id === id);
  if (index === -1) return res.status(404).json({ error: 'Requisition not found' });
  requisitions[index] = { ...requisitions[index], ...req.body };
  res.json(requisitions[index]);
});

router.delete('/requisitions/:id', (req, res) => {
  const { id } = req.params;
  requisitions = requisitions.filter(r => r.id !== id);
  res.json({ success: true, message: 'Requisition deleted' });
});

// ==========================================
// 2. CANDIDATE SOURCING ROUTES
// ==========================================

router.get('/sourcing/channels', (req, res) => {
  res.json(sourcingChannels);
});

router.get('/sourcing/campaigns', (req, res) => {
  res.json(sourcingCampaigns);
});

router.post('/sourcing/candidates', (req, res) => {
  const { name, email, phone, currentRole, currentCompany, experienceYears, requisitionId, source, skills, notes, resumeSummary } = req.body;
  const newCandidate = {
    id: `CAN-${String(candidates.length + 1).padStart(3, '0')}`,
    name,
    email,
    phone: phone || '',
    currentRole: currentRole || 'Candidate',
    currentCompany: currentCompany || 'Independent',
    experienceYears: Number(experienceYears) || 3,
    education: 'University Degree',
    requisitionId: requisitionId || (requisitions[0]?.id || 'REQ-2026-001'),
    targetRole: requisitions.find(r => r.id === requisitionId)?.title || 'Open Position',
    source: source || 'LinkedIn Recruiter',
    sourceChannelId: 'SC-1',
    atsScore: Math.floor(Math.random() * 20) + 80,
    stage: 'Sourced',
    skills: Array.isArray(skills) ? skills : (skills ? skills.split(',').map((s: string) => s.trim()) : ['General']),
    statusNote: notes || 'Sourced candidate added to active talent pipeline.',
    resumeSummary: resumeSummary || 'Candidate sourced through talent acquisition outreach.',
    createdAt: new Date().toISOString()
  };
  candidates.unshift(newCandidate);

  // Update channel stats
  const ch = sourcingChannels.find(c => c.name === source);
  if (ch) ch.candidatesCount += 1;

  res.status(201).json(newCandidate);
});

router.post('/sourcing/campaigns', (req, res) => {
  const { name, requisitionId, channels, budget, startDate, endDate } = req.body;
  const newCmp = {
    id: `CMP-${Math.floor(100 + Math.random() * 900)}`,
    name,
    requisitionId,
    channels: channels || ['LinkedIn Recruiter'],
    budget: Number(budget) || 2000,
    spent: 0,
    leadsGenerated: 0,
    qualifiedLeads: 0,
    status: 'Active',
    startDate: startDate || new Date().toISOString().split('T')[0],
    endDate: endDate || '2026-12-31'
  };
  sourcingCampaigns.unshift(newCmp);
  res.status(201).json(newCmp);
});

// ==========================================
// 3. RESUME MANAGEMENT ROUTES
// ==========================================

router.get('/resumes', (req, res) => {
  res.json(candidates);
});

router.post('/resumes/parse', (req, res) => {
  const { name, email, targetRole, skills, experienceYears, summaryText } = req.body;
  const parsedCandidate = {
    id: `CAN-${String(candidates.length + 1).padStart(3, '0')}`,
    name: name || 'Parsed Candidate',
    email: email || 'candidate@example.com',
    phone: '+1 (555) 019-2831',
    currentRole: targetRole || 'Software Professional',
    currentCompany: 'Previous Employer',
    experienceYears: Number(experienceYears) || 4,
    education: 'B.S. in Computer Science',
    requisitionId: requisitions[0]?.id || 'REQ-2026-001',
    targetRole: targetRole || 'Senior Engineer',
    source: 'Direct Upload',
    sourceChannelId: 'SC-2',
    atsScore: Math.floor(Math.random() * 15) + 85,
    stage: 'Applied',
    skills: Array.isArray(skills) ? skills : ['React', 'TypeScript', 'Node.js', 'API Design'],
    statusNote: 'Resume uploaded and parsed via ATS engine.',
    resumeSummary: summaryText || 'Parsed candidate profile with extensive software development lifecycle expertise.',
    createdAt: new Date().toISOString()
  };
  candidates.unshift(parsedCandidate);
  res.status(201).json(parsedCandidate);
});

router.put('/resumes/:id', (req, res) => {
  const { id } = req.params;
  const index = candidates.findIndex(c => c.id === id);
  if (index === -1) return res.status(404).json({ error: 'Candidate not found' });
  candidates[index] = { ...candidates[index], ...req.body };
  res.json(candidates[index]);
});

router.delete('/resumes/:id', (req, res) => {
  const { id } = req.params;
  candidates = candidates.filter(c => c.id !== id);
  res.json({ success: true, message: 'Resume candidate profile deleted' });
});

// ==========================================
// 4. CANDIDATE COMMUNICATION ROUTES
// ==========================================

router.get('/communications', (req, res) => {
  res.json(communications);
});

router.get('/communications/templates', (req, res) => {
  res.json(communicationTemplates);
});

router.post('/communications', (req, res) => {
  const { candidateId, candidateName, candidateEmail, type, subject, content, sender } = req.body;
  const newComm = {
    id: `COMM-${String(communications.length + 1).padStart(3, '0')}`,
    candidateId,
    candidateName: candidateName || 'Candidate',
    candidateEmail: candidateEmail || 'candidate@mail.com',
    type: type || 'Email',
    subject,
    content,
    sender: sender || 'Athena HR Talent Team',
    status: 'Delivered',
    sentAt: new Date().toISOString()
  };
  communications.unshift(newComm);
  res.status(201).json(newComm);
});

// ==========================================
// 5. BACKGROUND SCREENING ROUTES
// ==========================================

router.get('/screening', (req, res) => {
  res.json(backgroundScreenings);
});

router.post('/screening', (req, res) => {
  const { candidateId, candidateName, position, department, provider, packageType, notes } = req.body;
  const newScreening = {
    id: `BGC-2026-${String(backgroundScreenings.length + 1).padStart(3, '0')}`,
    candidateId: candidateId || 'CAN-NEW',
    candidateName: candidateName || 'Candidate',
    position: position || 'Open Role',
    department: department || 'Engineering',
    provider: provider || 'Checkr Enterprise',
    packageType: packageType || 'Comprehensive Verification',
    submittedDate: new Date().toISOString().split('T')[0],
    completedDate: null,
    status: 'In Progress',
    checks: [
      { name: 'SSN & Identity Trace', status: 'Passed', detail: 'Identity verified' },
      { name: 'National Criminal History', status: 'Passed', detail: 'No adverse records' },
      { name: 'Prior Employment (Past 5 Years)', status: 'In Progress', detail: 'Verification in progress' },
      { name: 'Highest Degree Credential', status: 'In Progress', detail: 'University registry contact initiated' },
      { name: 'Professional Reference Checks', status: 'Pending', detail: 'Contact forms sent' },
      { name: 'Standard 10-Panel Drug Screen', status: 'Pending', detail: 'Clinic requisition issued' }
    ],
    notes: notes || 'Verification package initiated with secure candidate consent link.'
  };
  backgroundScreenings.unshift(newScreening);

  // Update candidate stage if matching
  const cand = candidates.find(c => c.id === candidateId || c.name === candidateName);
  if (cand) {
    cand.stage = 'Screening';
  }

  res.status(201).json(newScreening);
});

router.put('/screening/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;
  const item = backgroundScreenings.find(b => b.id === id);
  if (!item) return res.status(404).json({ error: 'Screening not found' });
  if (status) item.status = status;
  if (notes) item.notes = notes;
  if (status === 'Verified') item.completedDate = new Date().toISOString().split('T')[0];
  res.json(item);
});

// ==========================================
// 6. OFFER LETTER ROUTES
// ==========================================

router.get('/offers', (req, res) => {
  res.json(offerLetters);
});

router.post('/offers', (req, res) => {
  const { candidateId, candidateName, requisitionId, positionTitle, department, hiringManager, baseSalary, signOnBonus, annualBonusPercentage, equityShares, startDate, expirationDate, benefitsSummary } = req.body;
  const newOffer = {
    id: `OFF-2026-${String(offerLetters.length + 1).padStart(3, '0')}`,
    candidateId: candidateId || 'CAN-NEW',
    candidateName: candidateName || 'Candidate',
    requisitionId: requisitionId || 'REQ-2026-001',
    positionTitle: positionTitle || 'Role',
    department: department || 'Engineering',
    hiringManager: hiringManager || 'HR Manager',
    baseSalary: Number(baseSalary) || 120000,
    signOnBonus: Number(signOnBonus) || 0,
    annualBonusPercentage: Number(annualBonusPercentage) || 10,
    equityShares: Number(equityShares) || 5000,
    startDate: startDate || '2026-11-01',
    expirationDate: expirationDate || '2026-10-15',
    status: 'Sent',
    benefitsSummary: benefitsSummary || 'Comprehensive Healthcare, 401(k) Match, Unlimited PTO, Equity Options.',
    createdDate: new Date().toISOString().split('T')[0],
    eSignatureTrackingId: `DS-${Math.floor(1000000 + Math.random() * 9000000)}`,
    signedDate: null
  };
  offerLetters.unshift(newOffer);

  // Update candidate stage to Offer
  const cand = candidates.find(c => c.id === candidateId || c.name === candidateName);
  if (cand) {
    cand.stage = 'Offer';
  }

  res.status(201).json(newOffer);
});

router.put('/offers/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const offer = offerLetters.find(o => o.id === id);
  if (!offer) return res.status(404).json({ error: 'Offer not found' });
  offer.status = status;
  if (status === 'Accepted') {
    offer.signedDate = new Date().toISOString().split('T')[0];
    const cand = candidates.find(c => c.id === offer.candidateId);
    if (cand) cand.stage = 'Hired';
  }
  res.json(offer);
});

// ==========================================
// 7. HIRING WORKFLOW (ATS STAGES)
// ==========================================

router.get('/workflow', (req, res) => {
  res.json({
    stages: ['Sourced', 'Applied', 'Screened', 'Interview', 'Screening', 'Offer', 'Hired'],
    candidates: candidates
  });
});

router.put('/workflow/:id/stage', (req, res) => {
  const { id } = req.params;
  const { stage } = req.body;
  const candidate = candidates.find(c => c.id === id);
  if (!candidate) return res.status(404).json({ error: 'Candidate not found' });
  candidate.stage = stage;
  res.json(candidate);
});

// ==========================================
// 8. ADVANCED ANALYTICS
// ==========================================

router.get('/analytics', (req, res) => {
  const totalRequisitions = requisitions.length;
  const openRequisitions = requisitions.filter(r => r.status === 'Approved' && r.filledCount < r.positionsCount).length;
  const totalCandidates = candidates.length;
  const hiredCandidates = candidates.filter(c => c.stage === 'Hired').length;
  const offersExtended = offerLetters.length;
  const offersAccepted = offerLetters.filter(o => o.status === 'Accepted').length;

  res.json({
    summary: {
      timeToHireAvgDays: 0,
      costPerHireAvg: 0,
      openRequisitions,
      totalRequisitions,
      totalCandidates,
      inPipeline: candidates.filter(c => c.stage !== 'Hired').length,
      offersExtended,
      offersAccepted,
      offerAcceptanceRate: offersExtended > 0 ? Math.round((offersAccepted / offersExtended) * 100) : 0,
      fillRatePercentage: totalRequisitions > 0 ? Math.round((hiredCandidates / totalRequisitions) * 100) : 0
    },
    funnel: [
      { stage: 'Sourced', count: candidates.filter(c => c.stage === 'Sourced').length, conversion: 0 },
      { stage: 'Applied', count: candidates.filter(c => c.stage === 'Applied').length, conversion: 0 },
      { stage: 'Screened', count: candidates.filter(c => c.stage === 'Screened').length, conversion: 0 },
      { stage: 'Interviews', count: candidates.filter(c => c.stage === 'Interview').length, conversion: 0 },
      { stage: 'Background Screening', count: candidates.filter(c => c.stage === 'Screening').length, conversion: 0 },
      { stage: 'Offers Extended', count: candidates.filter(c => c.stage === 'Offer').length, conversion: 0 },
      { stage: 'Hired & Onboarded', count: candidates.filter(c => c.stage === 'Hired').length, conversion: 0 }
    ],
    timeToHireByDepartment: [
      { department: 'Engineering', avgDays: 0 },
      { department: 'Sales', avgDays: 0 },
      { department: 'Marketing', avgDays: 0 },
      { department: 'Product', avgDays: 0 },
      { department: 'Finance', avgDays: 0 }
    ],
    channelPerformance: sourcingChannels.map(sc => ({
      channel: sc.name,
      leads: sc.candidatesCount,
      hires: sc.hiredCount,
      cost: sc.costSpent,
      costPerHire: sc.hiredCount > 0 ? Math.round(sc.costSpent / sc.hiredCount) : 0,
      efficiency: sc.efficiencyScore
    })),
    monthlyHiringVelocity: [
      { month: 'Apr', target: 0, actual: 0 },
      { month: 'May', target: 0, actual: 0 },
      { month: 'Jun', target: 0, actual: 0 },
      { month: 'Jul', target: 0, actual: 0 },
      { month: 'Aug', target: 0, actual: 0 },
      { month: 'Sep', target: 0, actual: 0 }
    ]
  });
});

// Candidates CRUD
router.put('/sourcing/candidates/:id', (req, res) => {
  const { id } = req.params;
  const index = candidates.findIndex(c => c.id === id);
  if (index === -1) return res.status(404).json({ error: 'Candidate not found' });
  candidates[index] = { ...candidates[index], ...req.body };
  res.json(candidates[index]);
});

router.delete('/sourcing/candidates/:id', (req, res) => {
  const { id } = req.params;
  candidates = candidates.filter(c => c.id !== id);
  res.json({ success: true, message: 'Candidate deleted' });
});

// Campaigns CRUD
router.put('/sourcing/campaigns/:id', (req, res) => {
  const { id } = req.params;
  const index = sourcingCampaigns.findIndex(c => c.id === id);
  if (index === -1) return res.status(404).json({ error: 'Campaign not found' });
  sourcingCampaigns[index] = { ...sourcingCampaigns[index], ...req.body };
  res.json(sourcingCampaigns[index]);
});

router.delete('/sourcing/campaigns/:id', (req, res) => {
  const { id } = req.params;
  sourcingCampaigns = sourcingCampaigns.filter(c => c.id !== id);
  res.json({ success: true, message: 'Campaign deleted' });
});

// Offers CRUD
router.put('/offers/:id', (req, res) => {
  const { id } = req.params;
  const index = offerLetters.findIndex(o => o.id === id);
  if (index === -1) return res.status(404).json({ error: 'Offer not found' });
  offerLetters[index] = { ...offerLetters[index], ...req.body };
  res.json(offerLetters[index]);
});

router.delete('/offers/:id', (req, res) => {
  const { id } = req.params;
  offerLetters = offerLetters.filter(o => o.id !== id);
  res.json({ success: true, message: 'Offer deleted' });
});

// Communication Templates CRUD
router.post('/communications/templates', (req, res) => {
  const { title, type, subject, body } = req.body;
  const newTpl = {
    id: `TPL-${String(communicationTemplates.length + 1)}`,
    title: title || 'New Custom Template',
    type: type || 'Interview Invitation',
    subject: subject || '',
    body: body || ''
  };
  communicationTemplates.push(newTpl);
  res.status(201).json(newTpl);
});

router.put('/communications/templates/:id', (req, res) => {
  const { id } = req.params;
  const index = communicationTemplates.findIndex(t => t.id === id);
  if (index === -1) return res.status(404).json({ error: 'Template not found' });
  communicationTemplates[index] = { ...communicationTemplates[index], ...req.body };
  res.json(communicationTemplates[index]);
});

router.delete('/communications/templates/:id', (req, res) => {
  const { id } = req.params;
  communicationTemplates = communicationTemplates.filter(t => t.id !== id);
  res.json({ success: true, message: 'Template deleted' });
});

router.delete('/communications/:id', (req, res) => {
  const { id } = req.params;
  communications = communications.filter(c => c.id !== id);
  res.json({ success: true, message: 'Communication deleted' });
});

// Background Screening CRUD
router.put('/screening/:id', (req, res) => {
  const { id } = req.params;
  const index = backgroundScreenings.findIndex(s => s.id === id);
  if (index === -1) return res.status(404).json({ error: 'Screening not found' });
  backgroundScreenings[index] = { ...backgroundScreenings[index], ...req.body };
  res.json(backgroundScreenings[index]);
});

router.delete('/screening/:id', (req, res) => {
  const { id } = req.params;
  backgroundScreenings = backgroundScreenings.filter(s => s.id !== id);
  res.json({ success: true, message: 'Screening record deleted' });
});

export default router;
