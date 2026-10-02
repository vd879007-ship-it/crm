import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Pencil,
  Trash2,
  X,
  Target, Award, TrendingUp, CheckCircle2, Clock, AlertTriangle, 
  Users, BookOpen, MessageSquare, ThumbsUp, Sparkles, Compass, 
  ShieldCheck, DollarSign, ArrowRight, Plus, RefreshCw, BarChart3, 
  Star, Layers, Zap, Sliders, ChevronRight, FileText, Send, 
  Calendar, CheckSquare, GraduationCap, Eye, Filter, UserCheck, 
  Search, Lock, HeartHandshake, HelpCircle, ExternalLink
} from 'lucide-react';
import HEMNavigation from '../../components/HEMNavigation';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function Performance() {
  const [activeTab, setActiveTab] = useState<'goals' | 'library' | 'cpm' | 'reviews' | 'feedback360' | 'idp' | 'payroll'>('goals');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Data states
  const [goals, setGoals] = useState<any[]>([]);
  const [competencies, setCompetencies] = useState<any[]>([]);
  const [goalLibrary, setGoalLibrary] = useState<any[]>([]);
  const [checkins, setCheckins] = useState<any[]>([]);
  const [kudos, setKudos] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [feedback360, setFeedback360] = useState<any[]>([]);
  const [idpList, setIdpList] = useState<any[]>([]);
  const [payrollPreview, setPayrollPreview] = useState<any>(null);
  const [syncHistory, setSyncHistory] = useState<any[]>([]);

  // Filter & Search states
  const [goalFilterCategory, setGoalFilterCategory] = useState<string>('All');
  const [libraryDeptFilter, setLibraryDeptFilter] = useState<string>('All');
  const [librarySearch, setLibrarySearch] = useState<string>('');
  const [selected360Survey, setSelected360Survey] = useState<any>(null);

  // Modals
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showEditGoalModal, setShowEditGoalModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<any>(null);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<any>(null);
  const [showAdoptModal, setShowAdoptModal] = useState(false);
  const [selectedLibGoal, setSelectedLibGoal] = useState<any>(null);
  const [showCheckinModal, setShowCheckinModal] = useState(false);
  const [showKudosModal, setShowKudosModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showNominate360Modal, setShowNominate360Modal] = useState(false);
  const [showRespond360Modal, setShowRespond360Modal] = useState(false);
  const [showIDPModal, setShowIDPModal] = useState(false);
  const [showCompetencyAssessModal, setShowCompetencyAssessModal] = useState(false);
  const [selectedCompetency, setSelectedCompetency] = useState<any>(null);

  const handleOpenEditGoal = (g: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingGoal({ ...g });
    setShowEditGoalModal(true);
  };

  const handleUpdateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGoal) return;
    try {
      await axios.put(`${API_BASE}/api/hem/performance/goals/${editingGoal.id}`, editingGoal);
      setShowEditGoalModal(false);
      setEditingGoal(null);
      setMessage({ type: 'success', text: 'Goal details updated.' });
      await fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update goal.' });
    }
  };

  const handleDeleteGoal = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Delete this goal / OKR from the framework?')) return;
    try {
      await axios.delete(`${API_BASE}/api/hem/performance/goals/${id}`);
      setMessage({ type: 'success', text: 'Goal deleted.' });
      await fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete goal.' });
    }
  };

  // Form states
  const defaultEmployees = [
    { id: 'EMP-101', name: 'Rajesh Kumar', dept: 'Technology & Engineering', role: 'Staff Software Architect', salary: 145000 },
    { id: 'EMP-102', name: 'Ananya Sharma', dept: 'Product & Design', role: 'Lead Product Manager', salary: 125000 },
    { id: 'EMP-103', name: 'Amit Verma', dept: 'Operations & Logistics', role: 'Operations Specialist', salary: 45000 },
    { id: 'EMP-104', name: 'Priya Nair', dept: 'People & Culture (HR)', role: 'HR Business Partner', salary: 85000 },
    { id: 'EMP-105', name: 'Vikramaditya Rao', dept: 'Executive Management', role: 'VP Engineering & Infrastructure', salary: 210000 }
  ];

  // New Goal form
  const [goalForm, setGoalForm] = useState({
    title: '',
    description: '',
    category: 'Operational',
    employeeId: 'EMP-101',
    targetValue: 100,
    currentValue: 0,
    unit: '%',
    weightage: 25,
    dueDate: '2026-11-30',
    milestone1: 'Phase 1: Architecture Blueprint & Feasibility',
    milestone2: 'Phase 2: Core Implementation & CI/CD',
    milestone3: 'Phase 3: Production Rollout & SLA Verification'
  });

  // Goal Progress form
  const [progressForm, setProgressForm] = useState({
    currentValue: 0,
    status: 'On Track',
    comment: '',
    author: 'Rajesh Kumar'
  });

  // Adopt Library Goal form
  const [adoptForm, setAdoptForm] = useState({
    employeeId: 'EMP-101',
    targetValue: 100,
    weightage: 20,
    dueDate: '2026-11-30'
  });

  // 1-on-1 Checkin form
  const [checkinForm, setCheckinForm] = useState({
    employeeId: 'EMP-101',
    managerName: 'Vikramaditya Rao (VP Engg)',
    date: new Date().toISOString().split('T')[0],
    cadence: 'Bi-Weekly',
    highlights: '',
    blockers: '',
    nextPriorities: '',
    sentiment: 'Great / Highly Motivated',
    actionItem1: '',
    actionItem2: '',
    privateNotes: ''
  });

  // Kudos form
  const [kudosForm, setKudosForm] = useState({
    fromEmployeeId: 'EMP-102',
    toEmployeeId: 'EMP-101',
    badge: 'Innovation Champion',
    message: '',
    coreValue: 'Architectural Excellence & Speed'
  });

  // Continuous Feedback form
  const [feedbackForm, setFeedbackForm] = useState({
    fromName: 'Ananya Sharma',
    toName: 'Rajesh Kumar',
    type: 'Praise',
    projectContext: 'Q3 Enterprise Architecture Sprint',
    content: '',
    visibility: 'Public Feed'
  });

  // Review Form
  const [reviewForm, setReviewForm] = useState({
    employeeId: 'EMP-101',
    cycleName: 'Annual Appraisal Cycle 2026',
    period: 'FY 2025-26',
    selfRating: 4.5,
    selfAchievements: '',
    selfChallenges: '',
    managerRating: 4.8,
    managerStrengths: '',
    managerImprovements: '',
    promotionRecommended: true,
    finalCalibratedRating: 4.8,
    potentialLevel: 'High'
  });

  // 360 Nominate form
  const [nominateForm, setNominateForm] = useState({
    employeeId: 'EMP-101',
    cycle: 'Annual 360 Review 2026',
    rater1Name: 'Self',
    rater1Rel: 'Self',
    rater2Name: 'Vikramaditya Rao',
    rater2Rel: 'Manager',
    rater3Name: 'Ananya Sharma',
    rater3Rel: 'Peer',
    rater4Name: 'Arjun Mehta',
    rater4Rel: 'Direct Report'
  });

  // 360 Respond form
  const [respond360Form, setRespond360Form] = useState({
    raterId: '',
    techScore: 5,
    collabScore: 5,
    leadScore: 4,
    accountScore: 5,
    agilityScore: 4,
    comments: ''
  });

  // IDP form
  const [idpForm, setIdpForm] = useState({
    employeeId: 'EMP-101',
    focusArea: 'Enterprise Cloud Security & Zero-Trust Governance',
    targetCompetency: 'Architectural Excellence & Scalability',
    skillGaps: 'mTLS service mesh, automated secret rotation, SOC-2 audit protocols',
    learningObjectives: 'Earn AWS Security Specialist Certification and lead team architecture threat modeling',
    courseName: 'AWS Certified Security Specialty Deep Dive',
    coursePlatform: 'A Cloud Guru / Linux Academy',
    courseCost: 24000,
    mentorName: 'Vikramaditya Rao (VP Engg)',
    allocatedBudget: 45000,
    targetDate: '2026-12-15'
  });

  // Competency assess form
  const [compAssessForm, setCompAssessForm] = useState({
    employeeId: 'EMP-101',
    selfRating: 4,
    managerRating: 5,
    evidence: 'Delivered zero-downtime cluster migration and authored enterprise architecture guidelines.'
  });

  // Fetch all performance data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [
        goalsRes, compRes, libRes, checkinRes, kudosRes, feedbackRes, 
        reviewRes, fb360Res, idpRes, previewRes, syncRes
      ] = await Promise.all([
        axios.get(`${API_BASE}/api/hem/performance/goals`).catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/api/hem/performance/competencies`).catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/api/hem/performance/goal-library`).catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/api/hem/performance/cpm/checkins`).catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/api/hem/performance/cpm/kudos`).catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/api/hem/performance/cpm/feedback`).catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/api/hem/performance/reviews`).catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/api/hem/performance/feedback360`).catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/api/hem/performance/idp`).catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/api/hem/performance/payroll-sync/preview`).catch(() => ({ data: null })),
        axios.get(`${API_BASE}/api/hem/performance/payroll-sync/history`).catch(() => ({ data: [] }))
      ]);

      setGoals(goalsRes.data);
      setCompetencies(compRes.data);
      setGoalLibrary(libRes.data);
      setCheckins(checkinRes.data);
      setKudos(kudosRes.data);
      setFeedbacks(feedbackRes.data);
      setReviews(reviewRes.data);
      setFeedback360(fb360Res.data);
      if (fb360Res.data.length > 0 && !selected360Survey) {
        setSelected360Survey(fb360Res.data[0]);
      }
      setIdpList(idpRes.data);
      setPayrollPreview(previewRes.data);
      setSyncHistory(syncRes.data);
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to load performance management datasets.' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const triggerSimulation = async () => {
    try {
      setRefreshing(true);
      const res = await axios.post(`${API_BASE}/api/hem/performance/simulate`);
      setMessage({ type: 'success', text: res.data.message || 'Performance ecosystem populated successfully!' });
      await fetchData();
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Failed to simulate performance data.' });
      setRefreshing(false);
    }
  };

  const triggerReset = async () => {
    try {
      setRefreshing(true);
      await axios.post(`${API_BASE}/api/hem/performance/reset`);
      setMessage({ type: 'success', text: 'All performance records have been reset to 0 entries.' });
      await fetchData();
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Failed to reset records.' });
      setRefreshing(false);
    }
  };

  // Helper to get employee info
  const getEmp = (id: string) => defaultEmployees.find(e => e.id === id) || { id: 'EMP-101', name: 'Staff Member', dept: 'General', role: 'Staff', salary: 100000 };

  // Form Handlers
  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    const emp = getEmp(goalForm.employeeId);
    try {
      await axios.post(`${API_BASE}/api/hem/performance/goals`, {
        title: goalForm.title,
        description: goalForm.description,
        category: goalForm.category,
        employeeId: emp.id,
        employeeName: emp.name,
        department: emp.dept,
        role: emp.role,
        targetValue: goalForm.targetValue,
        currentValue: goalForm.currentValue,
        unit: goalForm.unit,
        weightage: goalForm.weightage,
        dueDate: goalForm.dueDate,
        milestones: [goalForm.milestone1, goalForm.milestone2, goalForm.milestone3].filter(Boolean)
      });
      setShowGoalModal(false);
      setMessage({ type: 'success', text: `Goal "${goalForm.title}" successfully assigned to ${emp.name}!` });
      fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: 'Error assigning goal.' });
    }
  };

  const handleUpdateProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoal) return;
    try {
      await axios.put(`${API_BASE}/api/hem/performance/goals/${selectedGoal.id}/progress`, {
        currentValue: progressForm.currentValue,
        status: progressForm.status,
        comment: progressForm.comment,
        author: progressForm.author
      });
      setShowProgressModal(false);
      setMessage({ type: 'success', text: `Progress updated for "${selectedGoal.title}".` });
      fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: 'Error updating goal progress.' });
    }
  };

  const handleAdoptLibraryGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLibGoal) return;
    const emp = getEmp(adoptForm.employeeId);
    try {
      await axios.post(`${API_BASE}/api/hem/performance/goal-library/adopt`, {
        libraryGoalId: selectedLibGoal.id,
        employeeId: emp.id,
        employeeName: emp.name,
        department: emp.dept,
        role: emp.role,
        targetValue: adoptForm.targetValue,
        weightage: adoptForm.weightage,
        dueDate: adoptForm.dueDate
      });
      setShowAdoptModal(false);
      setMessage({ type: 'success', text: `Adopted "${selectedLibGoal.title}" from library for ${emp.name}!` });
      fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: 'Error adopting goal from library.' });
    }
  };

  const handleCreateCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    const emp = getEmp(checkinForm.employeeId);
    try {
      await axios.post(`${API_BASE}/api/hem/performance/cpm/checkins`, {
        employeeId: emp.id,
        employeeName: emp.name,
        managerName: checkinForm.managerName,
        department: emp.dept,
        date: checkinForm.date,
        cadence: checkinForm.cadence,
        highlights: checkinForm.highlights,
        blockers: checkinForm.blockers,
        nextPriorities: checkinForm.nextPriorities,
        sentiment: checkinForm.sentiment,
        actionItems: [checkinForm.actionItem1, checkinForm.actionItem2].filter(Boolean),
        privateManagerNotes: checkinForm.privateNotes
      });
      setShowCheckinModal(false);
      setMessage({ type: 'success', text: `1-on-1 Sync logged with ${emp.name}!` });
      fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: 'Error logging 1-on-1.' });
    }
  };

  const handleSendKudos = async (e: React.FormEvent) => {
    e.preventDefault();
    const fromEmp = getEmp(kudosForm.fromEmployeeId);
    const toEmp = getEmp(kudosForm.toEmployeeId);
    try {
      await axios.post(`${API_BASE}/api/hem/performance/cpm/kudos`, {
        fromEmployeeId: fromEmp.id,
        fromEmployeeName: fromEmp.name,
        toEmployeeId: toEmp.id,
        toEmployeeName: toEmp.name,
        badge: kudosForm.badge,
        message: kudosForm.message,
        coreValue: kudosForm.coreValue
      });
      setShowKudosModal(false);
      setMessage({ type: 'success', text: `Kudos badge awarded to ${toEmp.name}!` });
      fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: 'Error sending kudos.' });
    }
  };

  const handleLikeKudos = async (id: string) => {
    try {
      await axios.post(`${API_BASE}/api/hem/performance/cpm/kudos/${id}/like`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/api/hem/performance/cpm/feedback`, feedbackForm);
      setShowFeedbackModal(false);
      setMessage({ type: 'success', text: 'Continuous feedback note published.' });
      fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: 'Error logging feedback.' });
    }
  };

  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    const emp = getEmp(reviewForm.employeeId);
    try {
      await axios.post(`${API_BASE}/api/hem/performance/reviews`, {
        employeeId: emp.id,
        employeeName: emp.name,
        department: emp.dept,
        designation: emp.role,
        currentSalary: emp.salary,
        cycleName: reviewForm.cycleName,
        period: reviewForm.period,
        selfRating: reviewForm.selfRating,
        selfAchievements: reviewForm.selfAchievements,
        selfChallenges: reviewForm.selfChallenges,
        managerRating: reviewForm.managerRating,
        managerStrengths: reviewForm.managerStrengths,
        managerImprovements: reviewForm.managerImprovements,
        promotionRecommended: reviewForm.promotionRecommended,
        finalCalibratedRating: reviewForm.finalCalibratedRating,
        potentialLevel: reviewForm.potentialLevel
      });
      setShowReviewModal(false);
      setMessage({ type: 'success', text: `Appraisal calibrated for ${emp.name}. 9-Box & hike generated.` });
      fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: 'Error saving review.' });
    }
  };

  const handleNominate360 = async (e: React.FormEvent) => {
    e.preventDefault();
    const emp = getEmp(nominateForm.employeeId);
    try {
      await axios.post(`${API_BASE}/api/hem/performance/feedback360/nominate`, {
        employeeId: emp.id,
        employeeName: emp.name,
        department: emp.dept,
        designation: emp.role,
        cycle: nominateForm.cycle,
        raters: [
          { raterName: nominateForm.rater1Name, relationship: nominateForm.rater1Rel, isAnonymous: false },
          { raterName: nominateForm.rater2Name, relationship: nominateForm.rater2Rel, isAnonymous: false },
          { raterName: nominateForm.rater3Name, relationship: nominateForm.rater3Rel, isAnonymous: true },
          { raterName: nominateForm.rater4Name, relationship: nominateForm.rater4Rel, isAnonymous: true }
        ]
      });
      setShowNominate360Modal(false);
      setMessage({ type: 'success', text: `360 Feedback survey initiated for ${emp.name}!` });
      fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: 'Error creating 360 survey.' });
    }
  };

  const handleRespond360 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected360Survey || !respond360Form.raterId) return;
    try {
      await axios.post(`${API_BASE}/api/hem/performance/feedback360/${selected360Survey.id}/respond`, {
        raterId: respond360Form.raterId,
        scores: {
          technical: Number(respond360Form.techScore),
          collaboration: Number(respond360Form.collabScore),
          leadership: Number(respond360Form.leadScore),
          accountability: Number(respond360Form.accountScore),
          agility: Number(respond360Form.agilityScore)
        },
        qualitativeFeedback: respond360Form.comments
      });
      setShowRespond360Modal(false);
      setMessage({ type: 'success', text: '360 Evaluation submitted successfully. Radar chart updated!' });
      fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: 'Error submitting 360 response.' });
    }
  };

  const handleCreateIDP = async (e: React.FormEvent) => {
    e.preventDefault();
    const emp = getEmp(idpForm.employeeId);
    try {
      await axios.post(`${API_BASE}/api/hem/performance/idp`, {
        employeeId: emp.id,
        employeeName: emp.name,
        department: emp.dept,
        designation: emp.role,
        focusArea: idpForm.focusArea,
        targetCompetency: idpForm.targetCompetency,
        skillGapsIdentified: idpForm.skillGaps.split(',').map(s => s.trim()),
        learningObjectives: idpForm.learningObjectives.split(',').map(s => s.trim()),
        actionCourses: [
          {
            name: idpForm.courseName,
            platform: idpForm.coursePlatform,
            duration: '40 Hours',
            cost: Number(idpForm.courseCost),
            completed: false
          }
        ],
        mentorName: idpForm.mentorName,
        allocatedBudget: Number(idpForm.allocatedBudget),
        targetDate: idpForm.targetDate
      });
      setShowIDPModal(false);
      setMessage({ type: 'success', text: `Integrated Development Plan created for ${emp.name}!` });
      fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: 'Error creating IDP.' });
    }
  };

  const handleAssessCompetency = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompetency) return;
    const emp = getEmp(compAssessForm.employeeId);
    try {
      await axios.post(`${API_BASE}/api/hem/performance/competencies/${selectedCompetency.id}/assess`, {
        employeeId: emp.id,
        employeeName: emp.name,
        department: emp.dept,
        selfRating: compAssessForm.selfRating,
        managerRating: compAssessForm.managerRating,
        evidence: compAssessForm.evidence
      });
      setShowCompetencyAssessModal(false);
      setMessage({ type: 'success', text: `Competency evaluated for ${emp.name}.` });
      fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: 'Error updating competency assessment.' });
    }
  };

  const handleApplyPayrollSync = async () => {
    if (!window.confirm('Are you sure you want to push approved merit increments and performance bonuses into the active Payroll Engine? This will update employee monthly payslips and CTC.')) {
      return;
    }
    try {
      setRefreshing(true);
      const res = await axios.post(`${API_BASE}/api/hem/performance/payroll-sync/apply`, {
        cycleName: 'Annual Appraisal Cycle 2026',
        syncedBy: 'HR Talent & Rewards Committee'
      });
      setMessage({ type: 'success', text: res.data.message });
      await fetchData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to sync with Payroll.' });
      setRefreshing(false);
    }
  };

  // Helper Radar Chart SVG calculation
  const renderRadarChart = (survey: any) => {
    if (!survey || !survey.computedAverages) return null;
    const dims = [
      { key: 'technical', label: 'Technical' },
      { key: 'collaboration', label: 'Collaboration' },
      { key: 'leadership', label: 'Leadership' },
      { key: 'accountability', label: 'Accountability' },
      { key: 'agility', label: 'Agility' }
    ];

    const cx = 160;
    const cy = 150;
    const radius = 95;

    const getCoord = (idx: number, val: number) => {
      const angle = (idx * (2 * Math.PI / 5)) - (Math.PI / 2);
      const r = (val / 5) * radius;
      return {
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle)
      };
    };

    const selfPoints = dims.map((d, i) => {
      const pt = getCoord(i, survey.computedAverages.self[d.key] || 3);
      return `${pt.x},${pt.y}`;
    }).join(' ');

    const mgrPoints = dims.map((d, i) => {
      const pt = getCoord(i, survey.computedAverages.manager[d.key] || 3);
      return `${pt.x},${pt.y}`;
    }).join(' ');

    const peerPoints = dims.map((d, i) => {
      const pt = getCoord(i, survey.computedAverages.peers[d.key] || 3);
      return `${pt.x},${pt.y}`;
    }).join(' ');

    return (
      <div className="relative flex flex-col items-center">
        <svg width="320" height="300" className="overflow-visible">
          {/* Concentric rings */}
          {[1, 2, 3, 4, 5].map((lvl) => {
            const ringPts = dims.map((_, i) => {
              const pt = getCoord(i, lvl);
              return `${pt.x},${pt.y}`;
            }).join(' ');
            return (
              <polygon
                key={lvl}
                points={ringPts}
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="1"
                strokeDasharray={lvl < 5 ? "2 2" : "none"}
              />
            );
          })}

          {/* Spokes & Axis Labels */}
          {dims.map((d, i) => {
            const outer = getCoord(i, 5);
            const labelCoord = getCoord(i, 5.8);
            return (
              <g key={d.key}>
                <line x1={cx} y1={cy} x2={outer.x} y2={outer.y} stroke="#cbd5e1" strokeWidth="1" />
                <text
                  x={labelCoord.x}
                  y={labelCoord.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="text-[10px] font-semibold fill-gray-600"
                >
                  {d.label}
                </text>
              </g>
            );
          })}

          {/* Self Polygon (Blue) */}
          <polygon
            points={selfPoints}
            fill="rgba(59, 130, 246, 0.2)"
            stroke="#2563eb"
            strokeWidth="2"
          />

          {/* Manager Polygon (Green) */}
          <polygon
            points={mgrPoints}
            fill="rgba(16, 185, 129, 0.2)"
            stroke="#059669"
            strokeWidth="2"
          />

          {/* Peers Polygon (Purple) */}
          <polygon
            points={peerPoints}
            fill="rgba(168, 85, 247, 0.2)"
            stroke="#9333ea"
            strokeWidth="2"
          />
        </svg>

        {/* Legend */}
        <div className="flex gap-4 mt-2 text-xs">
          <span className="flex items-center gap-1 font-medium text-blue-700">
            <span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span> Self ({survey.computedAverages.self.overall}/5)
          </span>
          <span className="flex items-center gap-1 font-medium text-emerald-700">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span> Manager ({survey.computedAverages.manager.overall}/5)
          </span>
          <span className="flex items-center gap-1 font-medium text-purple-700">
            <span className="w-3 h-3 rounded-full bg-purple-500 inline-block"></span> Peers ({survey.computedAverages.peers.overall}/5)
          </span>
        </div>
      </div>
    );
  };

  // Filtered Goals
  const filteredGoals = goals.filter(g => {
    if (goalFilterCategory !== 'All' && g.category !== goalFilterCategory) return false;
    return true;
  });

  // Filtered Library
  const filteredLibrary = goalLibrary.filter(g => {
    if (libraryDeptFilter !== 'All' && g.department !== libraryDeptFilter) return false;
    if (librarySearch && !g.title.toLowerCase().includes(librarySearch.toLowerCase()) && !g.tags.some((t: string) => t.toLowerCase().includes(librarySearch.toLowerCase()))) return false;
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <HEMNavigation />

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl border border-indigo-900/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="p-2.5 bg-indigo-500/20 rounded-2xl border border-indigo-400/30 text-indigo-300">
                <Target className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  Performance & Appraisal Suite
                  <span className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                    Enterprise HCM
                  </span>
                </h1>
                <p className="text-xs text-indigo-200/80">
                  Continuous performance management, OKRs, 360° appraisals, calibrated 9-box reviews, IDPs & real-time payroll sync
                </p>
              </div>
            </div>
          </div>

          {/* Top Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={triggerSimulation}
              disabled={refreshing}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center shadow-lg shadow-indigo-600/30 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 mr-1.5" />
              {refreshing ? 'Processing...' : 'Simulate Performance'}
            </button>
            <button
              onClick={triggerReset}
              disabled={refreshing}
              className="bg-slate-800/80 hover:bg-slate-700 text-gray-300 px-3 py-2 rounded-xl text-xs font-semibold transition-all border border-slate-700/60 cursor-pointer"
            >
              Reset 0
            </button>
            <button
              onClick={fetchData}
              disabled={refreshing}
              className="p-2 bg-slate-800/80 hover:bg-slate-700 rounded-xl text-gray-300 transition-colors border border-slate-700/60 cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Global Summary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-5 border-t border-indigo-900/60">
          <div className="bg-slate-800/50 backdrop-blur-xs p-3 rounded-2xl border border-indigo-900/40">
            <p className="text-[10px] uppercase font-bold text-indigo-300/80 tracking-wider">Active Goals</p>
            <p className="text-xl font-black text-white mt-0.5">{goals.length}</p>
            <p className="text-[10px] text-emerald-400 font-medium mt-0.5">
              {goals.filter(g => g.status === 'Completed').length} Completed
            </p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-xs p-3 rounded-2xl border border-indigo-900/40">
            <p className="text-[10px] uppercase font-bold text-indigo-300/80 tracking-wider">Goal Library</p>
            <p className="text-xl font-black text-white mt-0.5">{goalLibrary.length}</p>
            <p className="text-[10px] text-indigo-300 font-medium mt-0.5">Across 6 Depts</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-xs p-3 rounded-2xl border border-indigo-900/40">
            <p className="text-[10px] uppercase font-bold text-indigo-300/80 tracking-wider">1-on-1 Syncs</p>
            <p className="text-xl font-black text-white mt-0.5">{checkins.length}</p>
            <p className="text-[10px] text-amber-300 font-medium mt-0.5">{kudos.length} Spot Kudos</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-xs p-3 rounded-2xl border border-indigo-900/40">
            <p className="text-[10px] uppercase font-bold text-indigo-300/80 tracking-wider">Appraisals Logged</p>
            <p className="text-xl font-black text-white mt-0.5">{reviews.length}</p>
            <p className="text-[10px] text-emerald-300 font-medium mt-0.5">9-Box Calibrated</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-xs p-3 rounded-2xl border border-indigo-900/40">
            <p className="text-[10px] uppercase font-bold text-indigo-300/80 tracking-wider">360 Surveys</p>
            <p className="text-xl font-black text-white mt-0.5">{feedback360.length}</p>
            <p className="text-[10px] text-purple-300 font-medium mt-0.5">Radar Benchmarks</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-xs p-3 rounded-2xl border border-indigo-900/40">
            <p className="text-[10px] uppercase font-bold text-indigo-300/80 tracking-wider">Payroll Sync</p>
            <p className="text-xl font-black text-emerald-400 mt-0.5">
              {payrollPreview ? `₹${(payrollPreview.totalBonusPool / 1000).toFixed(0)}k` : '₹0'}
            </p>
            <p className="text-[10px] text-indigo-300 font-medium mt-0.5">Bonus Pool Ready</p>
          </div>
        </div>
      </div>

      {/* Flash Notifications */}
      {message && (
        <div className={`p-4 rounded-2xl flex items-center justify-between text-sm font-semibold transition-all ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 text-rose-600" />}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-xs hover:underline cursor-pointer">Dismiss</button>
        </div>
      )}

      {/* Submodule Navigation Tabs */}
      <div className="bg-white p-1.5 rounded-2xl border border-gray-200 shadow-xs flex flex-wrap gap-1.5">
        {[
          { id: 'goals', label: 'Goals & Competencies', icon: Target, badge: goals.length },
          { id: 'library', label: 'Goal Library', icon: BookOpen, badge: goalLibrary.length },
          { id: 'cpm', label: 'Continuous CPM', icon: MessageSquare, badge: checkins.length + kudos.length },
          { id: 'reviews', label: 'Rating & Reviews (9-Box)', icon: Award, badge: reviews.length },
          { id: 'feedback360', label: '360° Feedback', icon: Users, badge: feedback360.length },
          { id: 'idp', label: 'Integrated Dev Plans (IDP)', icon: GraduationCap, badge: idpList.length },
          { id: 'payroll', label: 'Payroll Integration', icon: DollarSign, badge: payrollPreview?.eligibleCount || 0 }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === tab.id ? 'bg-indigo-700/80 text-white' : 'bg-gray-200/80 text-gray-700'
              }`}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ASSIGN, TRACK & REVIEW GOALS & COMPETENCIES */}
      {/* ========================================================================= */}
      {activeTab === 'goals' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-600" />
                Goals & Competency Framework
              </h2>
              <p className="text-xs text-gray-500">
                Assign SMART OKRs, track progress milestones, log manager reviews, and map core competencies.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowGoalModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4 mr-1.5" /> Assign New Goal
              </button>
            </div>
          </div>

          {/* Goal Categories Filter */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-bold text-gray-500 flex items-center gap-1 mr-2">
              <Filter className="w-3.5 h-3.5" /> Category:
            </span>
            {['All', 'Strategic', 'Operational', 'Financial', 'Customer', 'Innovation', 'People & Culture'].map(cat => (
              <button
                key={cat}
                onClick={() => setGoalFilterCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  goalFilterCategory === cat ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Goals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredGoals.map((g) => (
              <div key={g.id} className="bg-white rounded-2xl p-5 border border-gray-200/90 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow relative">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-wide">
                      {g.category}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      g.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                      g.status === 'On Track' ? 'bg-blue-100 text-blue-800' :
                      g.status === 'At Risk' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {g.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-gray-900 text-sm mb-1 leading-snug">{g.title}</h3>
                  <p className="text-xs text-gray-500 mb-3 line-clamp-2">{g.description}</p>

                  <div className="p-2.5 bg-gray-50 rounded-xl mb-3 text-xs space-y-1">
                    <div className="flex justify-between text-gray-600 font-medium">
                      <span>Owner: <strong className="text-gray-900">{g.employeeName}</strong></span>
                      <span className="text-[11px] text-gray-500">Weight: <strong>{g.weightage}%</strong></span>
                    </div>
                    <div className="flex justify-between text-gray-500 text-[11px]">
                      <span>Target: {g.targetValue} {g.unit}</span>
                      <span>Current: {g.currentValue} {g.unit}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1 mb-3">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-gray-600">Completion</span>
                      <span className={g.progress >= 100 ? 'text-emerald-600' : 'text-indigo-600'}>{g.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          g.progress >= 100 ? 'bg-emerald-500' : g.progress >= 70 ? 'bg-indigo-600' : g.progress >= 40 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.min(100, g.progress)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Milestones Preview */}
                  {g.milestones && g.milestones.length > 0 && (
                    <div className="border-t border-gray-100 pt-2 mb-3 space-y-1">
                      <p className="text-[11px] font-bold text-gray-600">Milestones:</p>
                      {g.milestones.slice(0, 2).map((m: any, idx: number) => (
                        <div key={idx} className="flex items-center text-[11px] text-gray-500 gap-1.5">
                          <CheckCircle2 className={`w-3.5 h-3.5 ${m.completed ? 'text-emerald-500' : 'text-gray-300'}`} />
                          <span className={m.completed ? 'line-through text-gray-400' : 'truncate'}>{m.title}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Manager Review Snippet */}
                  {g.managerReview && (
                    <div className="p-2 bg-indigo-50/60 rounded-xl border border-indigo-100/80 text-[11px] text-indigo-900 mb-2">
                      <div className="flex items-center justify-between font-bold mb-0.5">
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500" /> Manager Rating: {g.managerReview.rating}/5
                        </span>
                        <span className="text-[10px] text-indigo-500">{g.managerReview.reviewedAt}</span>
                      </div>
                      <p className="italic text-gray-600 truncate">"{g.managerReview.feedback}"</p>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-gray-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Due: {g.dueDate}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => handleOpenEditGoal(g, e)}
                      className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                      title="Edit Goal"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteGoal(g.id, e)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Goal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedGoal(g);
                        setProgressForm({
                          currentValue: g.currentValue,
                          status: g.status,
                          comment: '',
                          author: g.employeeName
                        });
                        setShowProgressModal(true);
                      }}
                      className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-0.5 hover:underline cursor-pointer"
                    >
                      <span>Progress</span> <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filteredGoals.length === 0 && !loading && (
              <div className="col-span-full bg-white rounded-2xl border border-gray-200 p-12 text-center">
                <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-gray-800 font-bold text-base">No Goals Recorded</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                  Get started by assigning a new goal, adopting one from the curated Enterprise Goal Library, or clicking "Simulate Performance" above.
                </p>
                <div className="flex justify-center gap-3 mt-4">
                  <button
                    onClick={() => setShowGoalModal(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold"
                  >
                    Assign Goal
                  </button>
                  <button
                    onClick={() => setActiveTab('library')}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-xl text-xs font-bold"
                  >
                    Browse Goal Library
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Competency Framework Section */}
          <div className="mt-10 pt-6 border-t border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-600" />
                  Enterprise Competency Framework (Proficiency 1 - 5)
                </h3>
                <p className="text-xs text-gray-500">
                  Standardized behavioral indicators and proficiency matrices across Core Values, Functional Skills, and Leadership.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {competencies.map((c) => (
                <div key={c.id} className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-100 uppercase">
                        {c.category}
                      </span>
                      <span className="text-xs font-bold text-gray-600">
                        Target: <strong className="text-indigo-600">Level {c.targetLevel}/5</strong>
                      </span>
                    </div>

                    <h4 className="font-bold text-gray-900 text-sm mb-1">{c.name}</h4>
                    <p className="text-xs text-gray-500 mb-3">{c.description}</p>

                    {/* Proficiency Levels list */}
                    <div className="bg-gray-50 p-3 rounded-xl mb-3 space-y-1.5">
                      <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Proficiency Scale:</p>
                      {c.proficiencyLevels.slice(0, 3).map((lvl: any) => (
                        <div key={lvl.level} className="text-[11px] text-gray-600 flex items-start gap-1">
                          <span className="font-bold text-indigo-600 w-4">{lvl.level}.</span>
                          <span className="font-medium text-gray-800">{lvl.label}:</span>
                          <span className="text-gray-500 truncate">{lvl.behavioralIndicators?.[0]}</span>
                        </div>
                      ))}
                    </div>

                    {/* Latest Employee Assessment */}
                    {c.assessments && c.assessments.length > 0 && (
                      <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100 text-xs">
                        <div className="flex justify-between font-bold text-emerald-900 mb-1">
                          <span>{c.assessments[0].employeeName}</span>
                          <span>Rating: {c.assessments[0].managerRating}/5</span>
                        </div>
                        <p className="text-[11px] text-emerald-700 line-clamp-2">"{c.assessments[0].evidence}"</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-gray-100 mt-3 flex justify-end">
                    <button
                      onClick={() => {
                        setSelectedCompetency(c);
                        setShowCompetencyAssessModal(true);
                      }}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-bold hover:underline cursor-pointer"
                    >
                      Record Employee Assessment →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: GOAL LIBRARY (SMART KPI REPOSITORY) */}
      {/* ========================================================================= */}
      {activeTab === 'library' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                Enterprise Goal & KPI Library
              </h2>
              <p className="text-xs text-gray-500">
                Curated catalog of battle-tested SMART goals across Engineering, Sales, Product, Marketing, HR & Finance. 1-click adoption.
              </p>
            </div>
          </div>

          {/* Search & Department Filters */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search goals, keywords, tags (e.g. SRE, Retention, ARR)..."
                value={librarySearch}
                onChange={(e) => setLibrarySearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex flex-wrap gap-1.5 items-center w-full md:w-auto">
              <span className="text-xs font-bold text-gray-500 mr-1">Department:</span>
              {[
                'All',
                'Technology & Engineering',
                'Enterprise Sales',
                'Product & Design',
                'Growth Marketing',
                'Customer Success & Support',
                'People & Culture (HR)',
                'Finance & Compliance'
              ].map(dept => (
                <button
                  key={dept}
                  onClick={() => setLibraryDeptFilter(dept)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-colors cursor-pointer ${
                    libraryDeptFilter === dept ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {dept === 'All' ? 'All Depts' : dept.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Library Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredLibrary.map((g) => (
              <div key={g.id} className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition-colors">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                      {g.department}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      {g.difficulty}
                    </span>
                  </div>

                  <h3 className="font-bold text-gray-900 text-sm mb-1">{g.title}</h3>
                  <p className="text-xs text-gray-500 mb-3">{g.description}</p>

                  <div className="grid grid-cols-2 gap-2 p-2.5 bg-gray-50 rounded-xl mb-3 text-xs">
                    <div>
                      <span className="text-[10px] text-gray-400 block font-semibold uppercase">Suggested Target</span>
                      <strong className="text-gray-800">{g.suggestedTarget} {g.unit}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block font-semibold uppercase">Default Weight</span>
                      <strong className="text-indigo-600">{g.suggestedWeightage}%</strong>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {g.tags?.map((t: string, idx: number) => (
                      <span key={idx} className="text-[10px] font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-gray-400">{g.category}</span>
                  <button
                    onClick={() => {
                      setSelectedLibGoal(g);
                      setAdoptForm({
                        employeeId: 'EMP-101',
                        targetValue: g.suggestedTarget,
                        weightage: g.suggestedWeightage,
                        dueDate: '2026-11-30'
                      });
                      setShowAdoptModal(true);
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                  >
                    Adopt Goal <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: CONTINUOUS PERFORMANCE MANAGEMENT (CPM) */}
      {/* ========================================================================= */}
      {activeTab === 'cpm' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-600" />
                Continuous Performance Management (CPM)
              </h2>
              <p className="text-xs text-gray-500">
                Weekly/Bi-weekly 1-on-1 check-ins, real-time peer kudos, blocker remediation, and continuous feedback loops.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowCheckinModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center shadow-xs cursor-pointer"
              >
                <Calendar className="w-4 h-4 mr-1.5" /> Log 1-on-1 Check-in
              </button>
              <button
                onClick={() => setShowKudosModal(true)}
                className="bg-amber-500 hover:bg-amber-600 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center shadow-xs cursor-pointer"
              >
                <Award className="w-4 h-4 mr-1.5" /> Award Spot Kudos
              </button>
              <button
                onClick={() => setShowFeedbackModal(true)}
                className="bg-slate-800 hover:bg-slate-900 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center shadow-xs cursor-pointer"
              >
                <Send className="w-4 h-4 mr-1.5" /> Give Continuous Feedback
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Column 1: 1-on-1 Sync Notes & Action Items */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                Recent 1-on-1 Check-in Logs ({checkins.length})
              </h3>

              <div className="space-y-4">
                {checkins.map((chk) => (
                  <div key={chk.id} className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-gray-900 text-sm">{chk.employeeName}</h4>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500">with {chk.managerName}</span>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {chk.cadence} Sync on <strong>{chk.date}</strong> ({chk.department})
                        </p>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        chk.sentiment.includes('Great') ? 'bg-emerald-100 text-emerald-800' :
                        chk.sentiment.includes('Good') ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {chk.sentiment}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100/60">
                        <strong className="text-emerald-900 block mb-1">Highlights & Achievements</strong>
                        <p className="text-gray-700">{chk.highlights}</p>
                      </div>
                      <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100/60">
                        <strong className="text-amber-900 block mb-1">Blockers & Roadblocks</strong>
                        <p className="text-gray-700">{chk.blockers || 'None reported.'}</p>
                      </div>
                    </div>

                    {/* Action Items */}
                    {chk.actionItems && chk.actionItems.length > 0 && (
                      <div className="pt-2 border-t border-gray-100">
                        <p className="text-[11px] font-bold text-gray-600 mb-1">Action Items Checklist:</p>
                        <div className="space-y-1">
                          {chk.actionItems.map((act: any) => (
                            <div key={act.id} className="flex items-center justify-between text-xs p-1.5 rounded-lg hover:bg-gray-50">
                              <span className={`flex items-center gap-2 ${act.completed ? 'line-through text-gray-400' : 'text-gray-700 font-medium'}`}>
                                <CheckSquare className={`w-4 h-4 ${act.completed ? 'text-emerald-500' : 'text-gray-300'}`} />
                                {act.task}
                              </span>
                              <span className="text-[10px] text-gray-400">Due: {act.dueDate}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Private Manager Notes */}
                    {chk.privateManagerNotes && (
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 flex items-start gap-2">
                        <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-[11px] text-slate-800 block">Manager Private Calibration Note:</strong>
                          <p className="italic">{chk.privateManagerNotes}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {checkins.length === 0 && (
                  <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center">
                    <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-600 font-semibold text-xs">No 1-on-1 check-ins logged yet.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Column 2: Spot Recognition & Kudos Feed */}
            <div className="space-y-4">
              <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Spot Recognition & Kudos Feed ({kudos.length})
              </h3>

              <div className="space-y-3">
                {kudos.map((k) => (
                  <div key={k.id} className="bg-white rounded-2xl p-4 border border-amber-100 shadow-xs relative overflow-hidden">
                    <div className="flex items-center justify-between mb-2">
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                        <Award className="w-3 h-3 text-amber-600" />
                        {k.badge}
                      </span>
                      <button
                        onClick={() => handleLikeKudos(k.id)}
                        className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-bold bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100 cursor-pointer"
                      >
                        <ThumbsUp className="w-3 h-3" /> {k.likes}
                      </button>
                    </div>

                    <p className="text-xs text-gray-700 mb-2 italic">"{k.message}"</p>

                    <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2 border-t border-gray-100">
                      <span><strong>{k.fromEmployeeName}</strong> → <strong>{k.toEmployeeName}</strong></span>
                      <span className="text-[10px] font-semibold text-amber-700">#{k.coreValue.split(' ')[0]}</span>
                    </div>
                  </div>
                ))}

                {kudos.length === 0 && (
                  <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center">
                    <Award className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-600 font-semibold text-xs">No kudos awarded yet.</p>
                  </div>
                )}
              </div>

              {/* Continuous Feedback Pulse */}
              <div className="pt-4">
                <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2 mb-3">
                  <Send className="w-4 h-4 text-indigo-600" />
                  Recent Feedback Pulses ({feedbacks.length})
                </h4>

                <div className="space-y-2.5">
                  {feedbacks.map((f) => (
                    <div key={f.id} className="bg-white p-3.5 rounded-xl border border-gray-200 text-xs">
                      <div className="flex justify-between font-bold text-gray-800 mb-1">
                        <span>{f.fromName} → {f.toName}</span>
                        <span className="text-[10px] text-indigo-600 font-medium">{f.type}</span>
                      </div>
                      <p className="text-gray-600 mb-1.5">{f.content}</p>
                      <span className="text-[10px] text-gray-400 block">{f.projectContext}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: RATING AND REVIEWING (APPRAISALS & 9-BOX GRID) */}
      {/* ========================================================================= */}
      {activeTab === 'reviews' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-600" />
                Calibrated Rating & 9-Box Grid Review
              </h2>
              <p className="text-xs text-gray-500">
                Formal review cycles with 5-point calibrated ratings, 9-Box potential vs performance grid, and merit increments.
              </p>
            </div>
            <button
              onClick={() => setShowReviewModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-1.5" /> Log Appraisal Review
            </button>
          </div>

          {/* 9-BOX GRID MATRIX */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-indigo-600" />
                  Talent Density Matrix: 9-Box Grid
                </h3>
                <p className="text-[11px] text-gray-500">
                  Performance (X-Axis: Low, Medium, High) vs Leadership Potential (Y-Axis: Low, Medium, High)
                </p>
              </div>
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-100">
                Cycle: Annual Appraisal 2026
              </span>
            </div>

            {/* 3x3 Grid Matrix */}
            <div className="grid grid-cols-3 gap-3">
              {/* Row 1: High Potential */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 min-h-28">
                <div className="flex justify-between text-[11px] font-bold text-amber-900 mb-1">
                  <span>Enigma / Rough Diamond</span>
                  <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-amber-200/80">Low Perf • High Pot</span>
                </div>
                <div className="space-y-1">
                  {reviews.filter(r => r.nineBoxGridBox === 'Enigma / Rough Diamond').map(r => (
                    <span key={r.id} className="inline-block text-[11px] bg-white px-2 py-0.5 rounded-md font-semibold text-gray-700 border border-amber-300">
                      {r.employeeName} ({r.finalCalibratedRating})
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200 min-h-28">
                <div className="flex justify-between text-[11px] font-bold text-indigo-900 mb-1">
                  <span>High Potential / Growth</span>
                  <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-indigo-200/80">Med Perf • High Pot</span>
                </div>
                <div className="space-y-1">
                  {reviews.filter(r => r.nineBoxGridBox === 'High Potential').map(r => (
                    <span key={r.id} className="inline-block text-[11px] bg-white px-2 py-0.5 rounded-md font-semibold text-indigo-900 border border-indigo-300">
                      {r.employeeName} ({r.finalCalibratedRating})
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-100/70 border border-emerald-300 min-h-28">
                <div className="flex justify-between text-[11px] font-bold text-emerald-900 mb-1">
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Star Performer
                  </span>
                  <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-emerald-200 font-black">High Perf • High Pot</span>
                </div>
                <div className="space-y-1">
                  {reviews.filter(r => r.nineBoxGridBox === 'Star Performer').map(r => (
                    <span key={r.id} className="inline-block text-[11px] bg-white px-2 py-0.5 rounded-md font-black text-emerald-900 border border-emerald-400 shadow-2xs">
                      {r.employeeName} ({r.finalCalibratedRating})
                    </span>
                  ))}
                </div>
              </div>

              {/* Row 2: Medium Potential */}
              <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200 min-h-28">
                <div className="flex justify-between text-[11px] font-bold text-rose-900 mb-1">
                  <span>Dilemma / Action Needed</span>
                  <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-rose-200/80">Low Perf • Med Pot</span>
                </div>
                <div className="space-y-1">
                  {reviews.filter(r => r.nineBoxGridBox === 'Dilemma').map(r => (
                    <span key={r.id} className="inline-block text-[11px] bg-white px-2 py-0.5 rounded-md font-semibold text-gray-700 border border-rose-300">
                      {r.employeeName}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 min-h-28">
                <div className="flex justify-between text-[11px] font-bold text-blue-900 mb-1">
                  <span>Core Contributor</span>
                  <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-blue-200/80">Med Perf • Med Pot</span>
                </div>
                <div className="space-y-1">
                  {reviews.filter(r => r.nineBoxGridBox === 'Core Contributor').map(r => (
                    <span key={r.id} className="inline-block text-[11px] bg-white px-2 py-0.5 rounded-md font-semibold text-blue-900 border border-blue-300">
                      {r.employeeName} ({r.finalCalibratedRating})
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200 min-h-28">
                <div className="flex justify-between text-[11px] font-bold text-teal-900 mb-1">
                  <span>High Professional / Master</span>
                  <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-teal-200/80">High Perf • Med Pot</span>
                </div>
                <div className="space-y-1">
                  {reviews.filter(r => r.nineBoxGridBox === 'High Professional').map(r => (
                    <span key={r.id} className="inline-block text-[11px] bg-white px-2 py-0.5 rounded-md font-semibold text-teal-900 border border-teal-300">
                      {r.employeeName} ({r.finalCalibratedRating})
                    </span>
                  ))}
                </div>
              </div>

              {/* Row 3: Low Potential */}
              <div className="p-3.5 rounded-2xl bg-red-100/70 border border-red-300 min-h-28">
                <div className="flex justify-between text-[11px] font-bold text-red-900 mb-1">
                  <span>Underperformer (PIP)</span>
                  <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-red-200/80">Low Perf • Low Pot</span>
                </div>
                <div className="space-y-1">
                  {reviews.filter(r => r.nineBoxGridBox === 'Underperformer').map(r => (
                    <span key={r.id} className="inline-block text-[11px] bg-white px-2 py-0.5 rounded-md font-bold text-red-800 border border-red-300">
                      {r.employeeName}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-100/70 border border-slate-300 min-h-28">
                <div className="flex justify-between text-[11px] font-bold text-slate-800 mb-1">
                  <span>Effective Performer</span>
                  <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-slate-200/80">Med Perf • Low Pot</span>
                </div>
                <div className="space-y-1">
                  {reviews.filter(r => r.nineBoxGridBox === 'Consistent Performer').map(r => (
                    <span key={r.id} className="inline-block text-[11px] bg-white px-2 py-0.5 rounded-md font-semibold text-gray-700 border border-slate-300">
                      {r.employeeName}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-cyan-50/70 border border-cyan-200 min-h-28">
                <div className="flex justify-between text-[11px] font-bold text-cyan-900 mb-1">
                  <span>Trusted Subject Specialist</span>
                  <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-cyan-200/80">High Perf • Low Pot</span>
                </div>
                <div className="space-y-1">
                  {reviews.filter(r => r.nineBoxGridBox === 'High Professional').map(r => (
                    <span key={r.id} className="inline-block text-[11px] bg-white px-2 py-0.5 rounded-md font-semibold text-cyan-900 border border-cyan-300">
                      {r.employeeName}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Calibrated Appraisals Table */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-900 text-sm">
                Employee Appraisal Scorecards ({reviews.length})
              </h3>
              <span className="text-xs text-gray-500">5-Point Standard Scale</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50/75 text-gray-500 font-bold border-b border-gray-100">
                  <tr>
                    <th className="p-4">Employee</th>
                    <th className="p-4">Self Rating</th>
                    <th className="p-4">Manager Rating</th>
                    <th className="p-4">Final Calibrated Rating</th>
                    <th className="p-4">Performance Band</th>
                    <th className="p-4">9-Box Position</th>
                    <th className="p-4">Merit Hike %</th>
                    <th className="p-4">Bonus Payout</th>
                    <th className="p-4 text-center">Payroll Sync</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {reviews.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50/80">
                      <td className="p-4">
                        <strong className="text-gray-900 block">{r.employeeName}</strong>
                        <span className="text-[11px] text-gray-400">{r.designation} • {r.department}</span>
                      </td>
                      <td className="p-4 font-semibold text-gray-700">{r.selfRating} / 5.0</td>
                      <td className="p-4 font-semibold text-indigo-700">{r.managerRating} / 5.0</td>
                      <td className="p-4">
                        <div className="flex items-center gap-1 font-bold text-sm text-gray-900">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          {r.finalCalibratedRating}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          r.performanceBand === 'Outstanding' ? 'bg-emerald-100 text-emerald-800' :
                          r.performanceBand === 'Exceeds Expectations' ? 'bg-blue-100 text-blue-800' :
                          r.performanceBand === 'Meets Expectations' ? 'bg-indigo-100 text-indigo-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {r.performanceBand}
                        </span>
                      </td>
                      <td className="p-4 font-semibold text-gray-800">{r.nineBoxGridBox}</td>
                      <td className="p-4 font-bold text-emerald-600">+{r.proposedHikePercent}%</td>
                      <td className="p-4 font-bold text-gray-900">₹{r.proposedBonusAmount?.toLocaleString()}</td>
                      <td className="p-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          r.payrollSyncStatus === 'Synced to Payroll'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {r.payrollSyncStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {reviews.length === 0 && (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-gray-400">
                        No appraisal reviews recorded. Click "Log Appraisal Review" above or simulate.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: 360 FEEDBACK APPRAISAL */}
      {/* ========================================================================= */}
      {activeTab === 'feedback360' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                360° Multi-Rater Feedback & Spider Radar
              </h2>
              <p className="text-xs text-gray-500">
                Multi-perspective evaluation (Self, Manager, Peer, Direct Reports) with automated competency radar charting.
              </p>
            </div>
            <button
              onClick={() => setShowNominate360Modal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-1.5" /> Launch 360 Survey
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Surveys List */}
            <div className="space-y-3">
              <h3 className="font-bold text-gray-800 text-sm">Active 360 Surveys ({feedback360.length})</h3>
              {feedback360.map((s) => (
                <div
                  key={s.id}
                  onClick={() => setSelected360Survey(s)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    selected360Survey?.id === s.id
                      ? 'bg-indigo-50/70 border-indigo-400 shadow-xs'
                      : 'bg-white border-gray-200 hover:border-indigo-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-gray-900 text-sm">{s.employeeName}</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                      {s.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{s.designation} • {s.department}</p>
                  <div className="flex justify-between text-[11px] text-gray-500 pt-2 border-t border-gray-100">
                    <span>{s.cycle}</span>
                    <span>{s.raters?.filter((r: any) => r.status === 'Completed').length} / {s.raters?.length} Submitted</span>
                  </div>
                </div>
              ))}

              {feedback360.length === 0 && (
                <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center">
                  <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">No 360 surveys found.</p>
                </div>
              )}
            </div>

            {/* Radar Spider Chart & Raters Breakdown */}
            <div className="lg:col-span-2 space-y-5">
              {selected360Survey ? (
                <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-6">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                    <div>
                      <h3 className="font-bold text-gray-900 text-base">
                        360° Radar: {selected360Survey.employeeName}
                      </h3>
                      <p className="text-xs text-gray-500">
                        Visual alignment between Self-perception, Manager appraisal, and Peer averages.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        const pendingRater = selected360Survey.raters?.find((r: any) => r.status === 'Pending') || selected360Survey.raters?.[0];
                        if (pendingRater) {
                          setRespond360Form(prev => ({ ...prev, raterId: pendingRater.id }));
                          setShowRespond360Modal(true);
                        }
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Submit Feedback as Rater
                    </button>
                  </div>

                  {/* SVG Radar Visualization */}
                  <div className="py-2">
                    {renderRadarChart(selected360Survey)}
                  </div>

                  {/* Raters Feedback Table */}
                  <div className="border-t border-gray-100 pt-4">
                    <h4 className="font-bold text-gray-800 text-xs mb-3">Evaluators & Feedback Submissions</h4>
                    <div className="space-y-2.5">
                      {selected360Survey.raters?.map((r: any) => (
                        <div key={r.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-gray-800">
                              {r.raterName}
                              <span className="ml-2 text-[10px] font-semibold text-gray-500">({r.relationship})</span>
                              {r.isAnonymous && <span className="ml-1 text-[9px] bg-gray-200 px-1.5 py-0.5 rounded">Anonymous</span>}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              r.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {r.status}
                            </span>
                          </div>
                          {r.status === 'Completed' ? (
                            <div>
                              <div className="flex gap-3 text-[11px] text-gray-600 mb-1">
                                <span>Tech: <strong>{r.scores?.technical}/5</strong></span>
                                <span>Collab: <strong>{r.scores?.collaboration}/5</strong></span>
                                <span>Lead: <strong>{r.scores?.leadership}/5</strong></span>
                                <span>Accountability: <strong>{r.scores?.accountability}/5</strong></span>
                                <span>Agility: <strong>{r.scores?.agility}/5</strong></span>
                              </div>
                              {r.qualitativeFeedback && (
                                <p className="italic text-gray-600 text-[11px]">"{r.qualitativeFeedback}"</p>
                              )}
                            </div>
                          ) : (
                            <p className="text-[11px] text-gray-400 italic">Pending evaluation submission.</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center">
                  <p className="text-gray-500 text-xs">Select a 360 survey on the left or simulate sample data.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: INTEGRATED DEVELOPMENT PLANS (IDP) */}
      {/* ========================================================================= */}
      {activeTab === 'idp' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-600" />
                Integrated Development Plans (IDP)
              </h2>
              <p className="text-xs text-gray-500">
                Personalized career growth roadmaps, identified skill gaps, executive coaching, approved training budgets & certifications.
              </p>
            </div>
            <button
              onClick={() => setShowIDPModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-1.5" /> Create IDP Roadmap
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {idpList.map((plan) => (
              <div key={plan.id} className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-gray-900 text-base">{plan.employeeName}</h3>
                      <p className="text-xs text-gray-500">{plan.designation} • {plan.department}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                      {plan.status}
                    </span>
                  </div>

                  <div className="p-3 bg-indigo-50/60 rounded-2xl border border-indigo-100/70 text-xs space-y-1 mt-3">
                    <span className="text-[10px] uppercase font-bold text-indigo-500 tracking-wider">Career Focus Area</span>
                    <strong className="text-indigo-950 block text-sm">{plan.focusArea}</strong>
                    <span className="text-gray-600 text-[11px] block">Target Competency: <strong>{plan.targetCompetency}</strong></span>
                  </div>

                  {/* Skill Gaps & Objectives */}
                  <div className="mt-3 space-y-2 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Identified Skill Gaps:</span>
                      <div className="flex flex-wrap gap-1">
                        {plan.skillGapsIdentified?.map((gap: string, idx: number) => (
                          <span key={idx} className="bg-rose-50 text-rose-700 border border-rose-100 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                            {gap}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Learning Milestones:</span>
                      <ul className="list-disc pl-4 space-y-0.5 text-gray-600 text-[11px]">
                        {plan.learningObjectives?.map((obj: string, idx: number) => (
                          <li key={idx}>{obj}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Approved Course / Budget */}
                  {plan.actionCourses && plan.actionCourses.length > 0 && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-2xl border border-gray-100 text-xs">
                      <div className="flex justify-between font-bold text-gray-800 mb-0.5">
                        <span>{plan.actionCourses[0].name}</span>
                        <span className="text-indigo-600">₹{plan.actionCourses[0].cost?.toLocaleString()}</span>
                      </div>
                      <span className="text-[11px] text-gray-500 block">
                        Platform: {plan.actionCourses[0].platform} • Duration: {plan.actionCourses[0].duration}
                      </span>
                    </div>
                  )}

                  {/* Progress Bar */}
                  <div className="space-y-1 mt-3">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-gray-600">Roadmap Progress</span>
                      <span className="text-indigo-600">{plan.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${plan.progress}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <span>Mentor: <strong>{plan.mentorName}</strong></span>
                  <span>Target: <strong>{plan.targetDate}</strong></span>
                </div>
              </div>
            ))}

            {idpList.length === 0 && (
              <div className="col-span-full bg-white rounded-3xl border border-gray-200 p-12 text-center">
                <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="font-bold text-gray-800 text-base">No Integrated Development Plans</h3>
                <p className="text-xs text-gray-500 mt-1">Create an individual learning roadmap or simulate performance to populate samples.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: INTEGRATION WITH PAYROLL */}
      {/* ========================================================================= */}
      {activeTab === 'payroll' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                Performance-to-Payroll Integration Engine
              </h2>
              <p className="text-xs text-gray-500">
                Direct compensation bridge: translate calibrated appraisal ratings into automated merit salary hikes and performance bonus payouts.
              </p>
            </div>
            <button
              onClick={handleApplyPayrollSync}
              disabled={refreshing || !payrollPreview?.eligibleCount}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center shadow-lg shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
            >
              <Zap className="w-4 h-4 mr-2" /> Push Increments & Bonus to Payroll
            </button>
          </div>

          {/* Policy Compensation Framework Cards */}
          <div className="bg-gradient-to-r from-emerald-900 to-slate-900 rounded-3xl p-6 text-white shadow-md">
            <h3 className="font-bold text-sm text-emerald-200 mb-1 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Corporate Merit Compensation & Incentive Grid (FY 2025-26)
            </h3>
            <p className="text-xs text-gray-300 mb-4">
              Approved corporate matrix mapping Calibrated 5-Point Performance Bands to Base Salary Increments and Target Bonus Multipliers.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              <div className="bg-white/10 p-3 rounded-2xl border border-white/10">
                <span className="font-bold text-emerald-300 block">Rating 5 (Outstanding)</span>
                <p className="text-lg font-black text-white mt-1">+16% Hike</p>
                <p className="text-[11px] text-emerald-200">125% Target Bonus</p>
              </div>
              <div className="bg-white/10 p-3 rounded-2xl border border-white/10">
                <span className="font-bold text-blue-300 block">Rating 4 (Exceeds)</span>
                <p className="text-lg font-black text-white mt-1">+12% Hike</p>
                <p className="text-[11px] text-blue-200">100% Target Bonus</p>
              </div>
              <div className="bg-white/10 p-3 rounded-2xl border border-white/10">
                <span className="font-bold text-indigo-300 block">Rating 3 (Meets)</span>
                <p className="text-lg font-black text-white mt-1">+8% Hike</p>
                <p className="text-[11px] text-indigo-200">75% Target Bonus</p>
              </div>
              <div className="bg-white/10 p-3 rounded-2xl border border-white/10">
                <span className="font-bold text-amber-300 block">Rating 2 (Needs Dev)</span>
                <p className="text-lg font-black text-white mt-1">+2% Hike</p>
                <p className="text-[11px] text-amber-200">0% Bonus (IDP Req)</p>
              </div>
              <div className="bg-white/10 p-3 rounded-2xl border border-white/10">
                <span className="font-bold text-rose-300 block">Rating 1 (Unsatisfactory)</span>
                <p className="text-lg font-black text-white mt-1">+0% Hike</p>
                <p className="text-[11px] text-rose-200">0% Bonus (PIP Track)</p>
              </div>
            </div>
          </div>

          {/* Sync Financial Impact KPI Widgets */}
          {payrollPreview && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
                <p className="text-xs text-gray-500 font-semibold uppercase">Total Bonus Pool Ready</p>
                <p className="text-2xl font-black text-emerald-600 mt-1">₹{payrollPreview.totalBonusPool?.toLocaleString()}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{payrollPreview.eligibleCount} Staff Eligible</p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
                <p className="text-xs text-gray-500 font-semibold uppercase">Monthly Base Increment</p>
                <p className="text-2xl font-black text-gray-900 mt-1">₹{payrollPreview.monthlyIncrementCost?.toLocaleString()}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Recurring Monthly Base Delta</p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
                <p className="text-xs text-gray-500 font-semibold uppercase">Annualized Impact</p>
                <p className="text-2xl font-black text-indigo-600 mt-1">₹{payrollPreview.annualizedIncrementCost?.toLocaleString()}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Annual CTC Growth</p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
                <p className="text-xs text-gray-500 font-semibold uppercase">Average Merit Hike</p>
                <p className="text-2xl font-black text-emerald-500 mt-1">+{payrollPreview.averageHikePercent}%</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Company-wide Weighted Avg</p>
              </div>
            </div>
          )}

          {/* Live Sync Preview Table */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-900 text-sm">
                  Appraisal to Payroll Adjustment Preview
                </h3>
                <p className="text-xs text-gray-500">
                  Calculated revision for effective salary run: October 2026
                </p>
              </div>
              <button
                onClick={handleApplyPayrollSync}
                className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 hover:bg-emerald-100 cursor-pointer"
              >
                Execute Real-time Sync
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100">
                  <tr>
                    <th className="p-4">Employee</th>
                    <th className="p-4">Calibrated Rating</th>
                    <th className="p-4">Performance Band</th>
                    <th className="p-4">Previous Base Salary</th>
                    <th className="p-4">Merit Hike %</th>
                    <th className="p-4">New Base Salary</th>
                    <th className="p-4">Bonus Incentive</th>
                    <th className="p-4 text-center">Sync Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {payrollPreview?.previewItems?.map((item: any) => (
                    <tr key={item.reviewId} className="hover:bg-gray-50/80">
                      <td className="p-4">
                        <strong className="text-gray-900 block">{item.employeeName}</strong>
                        <span className="text-[11px] text-gray-400">{item.department}</span>
                      </td>
                      <td className="p-4">
                        <span className="flex items-center gap-1 font-bold text-gray-800">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          {item.rating}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-gray-700 font-medium">{item.band}</span>
                      </td>
                      <td className="p-4 font-semibold text-gray-600">₹{item.previousBase?.toLocaleString()}</td>
                      <td className="p-4 font-bold text-emerald-600">+{item.hikePercent}%</td>
                      <td className="p-4 font-bold text-gray-900">₹{item.newBase?.toLocaleString()}</td>
                      <td className="p-4 font-bold text-emerald-700">₹{item.bonusAmount?.toLocaleString()}</td>
                      <td className="p-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          item.syncStatus === 'Synced to Payroll' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {item.syncStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {(!payrollPreview?.previewItems || payrollPreview.previewItems.length === 0) && (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-gray-400">
                        No completed appraisals found to sync. Log an appraisal review or run simulation.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Past Synchronization Batches Audit Log */}
          {syncHistory.length > 0 && (
            <div className="bg-white rounded-3xl border border-gray-200 shadow-xs p-5 space-y-4">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                Payroll Synchronization History ({syncHistory.length})
              </h3>
              <div className="space-y-3">
                {syncHistory.map((h) => (
                  <div key={h.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-xs flex justify-between items-center">
                    <div>
                      <strong className="text-gray-900 block font-bold">{h.cycleName} ({h.syncBatchId})</strong>
                      <span className="text-gray-500 text-[11px]">
                        Synced by {h.syncedBy} on {new Date(h.syncedAt).toLocaleDateString()} for {h.effectiveMonth}
                      </span>
                    </div>
                    <div className="text-right">
                      <strong className="text-emerald-700 block font-bold">Total Bonus: ₹{h.totalBonusPool?.toLocaleString()}</strong>
                      <span className="text-gray-500 text-[11px]">{h.totalEmployees} Employees Updated</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}

      {/* 1. ASSIGN GOAL MODAL */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-3xl shadow-xl w-[620px] max-w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Assign New Goal / OKR</h3>
            <p className="text-xs text-gray-500 mb-4">Set target metrics, weightage, milestones and link to staff.</p>

            <form onSubmit={handleCreateGoal} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block font-semibold text-gray-700 mb-1">Employee</label>
                  <select
                    value={goalForm.employeeId}
                    onChange={(e) => setGoalForm({ ...goalForm, employeeId: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl p-2.5 bg-white font-medium"
                  >
                    {defaultEmployees.map(e => (
                      <option key={e.id} value={e.id}>{e.name} — {e.role} ({e.dept})</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block font-semibold text-gray-700 mb-1">Goal Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Architect & Deploy Multi-Region Kubernetes Failover"
                    value={goalForm.title}
                    onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl p-2.5"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-semibold text-gray-700 mb-1">Description / Target Outcome</label>
                  <textarea
                    rows={2}
                    placeholder="Detailed SMART justification and success criteria..."
                    value={goalForm.description}
                    onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl p-2.5"
                  ></textarea>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Category</label>
                  <select
                    value={goalForm.category}
                    onChange={(e) => setGoalForm({ ...goalForm, category: e.target.value as any })}
                    className="w-full border border-gray-200 rounded-xl p-2.5 bg-white"
                  >
                    <option value="Strategic">Strategic</option>
                    <option value="Operational">Operational</option>
                    <option value="Financial">Financial</option>
                    <option value="Customer">Customer</option>
                    <option value="Innovation">Innovation</option>
                    <option value="People & Culture">People & Culture</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Weightage (%)</label>
                  <input
                    type="number"
                    min="5"
                    max="100"
                    value={goalForm.weightage}
                    onChange={(e) => setGoalForm({ ...goalForm, weightage: Number(e.target.value) })}
                    className="w-full border border-gray-200 rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Target Value</label>
                  <input
                    type="number"
                    step="any"
                    value={goalForm.targetValue}
                    onChange={(e) => setGoalForm({ ...goalForm, targetValue: Number(e.target.value) })}
                    className="w-full border border-gray-200 rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Measurement Unit</label>
                  <input
                    type="text"
                    placeholder="%, INR, Days, Count"
                    value={goalForm.unit}
                    onChange={(e) => setGoalForm({ ...goalForm, unit: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={goalForm.dueDate}
                    onChange={(e) => setGoalForm({ ...goalForm, dueDate: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl p-2.5"
                  />
                </div>
              </div>

              {/* Milestones */}
              <div className="border-t border-gray-100 pt-3">
                <label className="block font-semibold text-gray-700 mb-1">Key Execution Milestones</label>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Milestone 1"
                    value={goalForm.milestone1}
                    onChange={(e) => setGoalForm({ ...goalForm, milestone1: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl p-2"
                  />
                  <input
                    type="text"
                    placeholder="Milestone 2"
                    value={goalForm.milestone2}
                    onChange={(e) => setGoalForm({ ...goalForm, milestone2: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl p-2"
                  />
                  <input
                    type="text"
                    placeholder="Milestone 3"
                    value={goalForm.milestone3}
                    onChange={(e) => setGoalForm({ ...goalForm, milestone3: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl p-2"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowGoalModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold"
                >
                  Assign Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. UPDATE PROGRESS MODAL */}
      {showProgressModal && selectedGoal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-3xl shadow-xl w-[500px] max-w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Update Progress & Check-in</h3>
            <p className="text-xs text-gray-500 mb-4">{selectedGoal.title}</p>

            <form onSubmit={handleUpdateProgress} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Current Value (Target: {selectedGoal.targetValue} {selectedGoal.unit})
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={progressForm.currentValue}
                    onChange={(e) => setProgressForm({ ...progressForm, currentValue: Number(e.target.value) })}
                    className="w-full border border-gray-200 rounded-xl p-2.5 font-bold text-indigo-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Status</label>
                  <select
                    value={progressForm.status}
                    onChange={(e) => setProgressForm({ ...progressForm, status: e.target.value as any })}
                    className="w-full border border-gray-200 rounded-xl p-2.5 bg-white font-medium"
                  >
                    <option value="On Track">On Track</option>
                    <option value="At Risk">At Risk</option>
                    <option value="Behind">Behind</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block font-semibold text-gray-700 mb-1">Check-in Notes / Comment</label>
                  <textarea
                    rows={3}
                    placeholder="Describe progress made, blockers mitigated, or evidence link..."
                    value={progressForm.comment}
                    onChange={(e) => setProgressForm({ ...progressForm, comment: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl p-2.5"
                  ></textarea>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowProgressModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold"
                >
                  Save Progress
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. ADOPT LIBRARY GOAL MODAL */}
      {showAdoptModal && selectedLibGoal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-3xl shadow-xl w-[520px] max-w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Adopt Goal from Enterprise Library</h3>
            <p className="text-xs text-indigo-700 font-semibold mb-4">{selectedLibGoal.title}</p>

            <form onSubmit={handleAdoptLibraryGoal} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Assign To Employee</label>
                <select
                  value={adoptForm.employeeId}
                  onChange={(e) => setAdoptForm({ ...adoptForm, employeeId: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl p-2.5 bg-white font-medium"
                >
                  {defaultEmployees.map(e => (
                    <option key={e.id} value={e.id}>{e.name} — {e.role} ({e.dept})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Target Metric ({selectedLibGoal.unit})
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={adoptForm.targetValue}
                    onChange={(e) => setAdoptForm({ ...adoptForm, targetValue: Number(e.target.value) })}
                    className="w-full border border-gray-200 rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Weightage (%)</label>
                  <input
                    type="number"
                    value={adoptForm.weightage}
                    onChange={(e) => setAdoptForm({ ...adoptForm, weightage: Number(e.target.value) })}
                    className="w-full border border-gray-200 rounded-xl p-2.5"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-semibold text-gray-700 mb-1">Target Due Date</label>
                  <input
                    type="date"
                    value={adoptForm.dueDate}
                    onChange={(e) => setAdoptForm({ ...adoptForm, dueDate: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAdoptModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold"
                >
                  Confirm & Assign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. LOG 1-ON-1 CHECKIN MODAL */}
      {showCheckinModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-3xl shadow-xl w-[580px] max-w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Log 1-on-1 Check-in</h3>
            <p className="text-xs text-gray-500 mb-4">Capture agenda, blockers, sentiment, and agreed action items.</p>

            <form onSubmit={handleCreateCheckin} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Employee</label>
                  <select
                    value={checkinForm.employeeId}
                    onChange={(e) => setCheckinForm({ ...checkinForm, employeeId: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl p-2 bg-white"
                  >
                    {defaultEmployees.map(e => <option key={e.id} value={e.id}>{e.name} ({e.dept})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Manager</label>
                  <input
                    type="text"
                    value={checkinForm.managerName}
                    onChange={(e) => setCheckinForm({ ...checkinForm, managerName: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl p-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Cadence</label>
                  <select
                    value={checkinForm.cadence}
                    onChange={(e) => setCheckinForm({ ...checkinForm, cadence: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl p-2 bg-white"
                  >
                    <option value="Weekly">Weekly</option>
                    <option value="Bi-Weekly">Bi-Weekly</option>
                    <option value="Monthly">Monthly</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Sentiment / Pulse</label>
                  <select
                    value={checkinForm.sentiment}
                    onChange={(e) => setCheckinForm({ ...checkinForm, sentiment: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl p-2 bg-white"
                  >
                    <option value="Great / Highly Motivated">Great / Highly Motivated</option>
                    <option value="Good / Steady">Good / Steady</option>
                    <option value="Stressed / Blocked">Stressed / Blocked</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block font-semibold text-gray-700 mb-1">Highlights & Achievements</label>
                  <textarea
                    rows={2}
                    placeholder="Key wins, completed sprint stories, breakthroughs..."
                    value={checkinForm.highlights}
                    onChange={(e) => setCheckinForm({ ...checkinForm, highlights: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl p-2"
                  ></textarea>
                </div>
                <div className="col-span-2">
                  <label className="block font-semibold text-gray-700 mb-1">Blockers & Challenges</label>
                  <textarea
                    rows={2}
                    placeholder="Dependencies, cross-team latency, technical hurdles..."
                    value={checkinForm.blockers}
                    onChange={(e) => setCheckinForm({ ...checkinForm, blockers: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl p-2"
                  ></textarea>
                </div>
                <div className="col-span-2">
                  <label className="block font-semibold text-gray-700 mb-1">Action Items Checklist</label>
                  <input
                    type="text"
                    placeholder="Action item 1"
                    value={checkinForm.actionItem1}
                    onChange={(e) => setCheckinForm({ ...checkinForm, actionItem1: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl p-2 mb-2"
                  />
                  <input
                    type="text"
                    placeholder="Action item 2"
                    value={checkinForm.actionItem2}
                    onChange={(e) => setCheckinForm({ ...checkinForm, actionItem2: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl p-2"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-semibold text-gray-700 mb-1">Private Manager Calibration Notes</label>
                  <input
                    type="text"
                    placeholder="Private managerial observations (hidden from staff)..."
                    value={checkinForm.privateNotes}
                    onChange={(e) => setCheckinForm({ ...checkinForm, privateNotes: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl p-2"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCheckinModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold"
                >
                  Save Check-in
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. SPOT KUDOS MODAL */}
      {showKudosModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-3xl shadow-xl w-[480px] max-w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Award Spot Kudos</h3>
            <p className="text-xs text-gray-500 mb-4">Celebrate exceptional contributions with instant peer recognition.</p>

            <form onSubmit={handleSendKudos} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Recognize Colleague</label>
                <select
                  value={kudosForm.toEmployeeId}
                  onChange={(e) => setKudosForm({ ...kudosForm, toEmployeeId: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl p-2.5 bg-white font-medium"
                >
                  {defaultEmployees.map(e => <option key={e.id} value={e.id}>{e.name} ({e.dept})</option>)}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Recognition Badge</label>
                <select
                  value={kudosForm.badge}
                  onChange={(e) => setKudosForm({ ...kudosForm, badge: e.target.value as any })}
                  className="w-full border border-gray-200 rounded-xl p-2.5 bg-white font-bold text-amber-700"
                >
                  <option value="Innovation Champion">🌟 Innovation Champion</option>
                  <option value="Customer Obsessed">🎯 Customer Obsessed</option>
                  <option value="Ultimate Team Player">🤝 Ultimate Team Player</option>
                  <option value="Speed & Agility">🚀 Speed & Agility</option>
                  <option value="Rockstar Mentor">💡 Rockstar Mentor</option>
                  <option value="Resilience Hero">🛡️ Resilience Hero</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Message</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Share what they did and how it made an impact..."
                  value={kudosForm.message}
                  onChange={(e) => setKudosForm({ ...kudosForm, message: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl p-2.5"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowKudosModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold"
                >
                  Award Kudos
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. CONTINUOUS FEEDBACK MODAL */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-3xl shadow-xl w-[480px] max-w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Give Continuous Feedback</h3>
            <p className="text-xs text-gray-500 mb-4">Real-time coaching, project retros, and constructive feedback.</p>

            <form onSubmit={handleCreateFeedback} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">To</label>
                  <input
                    type="text"
                    value={feedbackForm.toName}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, toName: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl p-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Type</label>
                  <select
                    value={feedbackForm.type}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, type: e.target.value as any })}
                    className="w-full border border-gray-200 rounded-xl p-2 bg-white"
                  >
                    <option value="Praise">Praise</option>
                    <option value="Constructive Coaching">Constructive Coaching</option>
                    <option value="Project Retro">Project Retro</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block font-semibold text-gray-700 mb-1">Project / Context</label>
                  <input
                    type="text"
                    value={feedbackForm.projectContext}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, projectContext: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl p-2"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-semibold text-gray-700 mb-1">Feedback Note</label>
                  <textarea
                    rows={3}
                    required
                    value={feedbackForm.content}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, content: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl p-2"
                  ></textarea>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowFeedbackModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-black text-white rounded-xl font-bold"
                >
                  Send Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. FORMAL APPRAISAL REVIEW MODAL */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-3xl shadow-xl w-[640px] max-w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Log & Calibrate Appraisal Review</h3>
            <p className="text-xs text-gray-500 mb-4">5-Point scale evaluation with 9-box mapping and merit increment eligibility.</p>

            <form onSubmit={handleCreateReview} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block font-semibold text-gray-700 mb-1">Employee</label>
                  <select
                    value={reviewForm.employeeId}
                    onChange={(e) => setReviewForm({ ...reviewForm, employeeId: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl p-2.5 bg-white font-medium"
                  >
                    {defaultEmployees.map(e => <option key={e.id} value={e.id}>{e.name} — {e.role} (Current: ₹{e.salary.toLocaleString()})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Review Period</label>
                  <input
                    type="text"
                    value={reviewForm.period}
                    onChange={(e) => setReviewForm({ ...reviewForm, period: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl p-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Cycle Name</label>
                  <input
                    type="text"
                    value={reviewForm.cycleName}
                    onChange={(e) => setReviewForm({ ...reviewForm, cycleName: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl p-2"
                  />
                </div>

                {/* Ratings */}
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Self Rating (1.0 - 5.0)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={reviewForm.selfRating}
                    onChange={(e) => setReviewForm({ ...reviewForm, selfRating: Number(e.target.value) })}
                    className="w-full border border-gray-200 rounded-xl p-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Manager Rating (1.0 - 5.0)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={reviewForm.managerRating}
                    onChange={(e) => setReviewForm({ ...reviewForm, managerRating: Number(e.target.value) })}
                    className="w-full border border-gray-200 rounded-xl p-2 font-bold text-indigo-700"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-semibold text-gray-700 mb-1">Manager Key Strengths & Remarks</label>
                  <textarea
                    rows={2}
                    value={reviewForm.managerStrengths}
                    onChange={(e) => setReviewForm({ ...reviewForm, managerStrengths: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl p-2"
                  ></textarea>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Final Calibrated Rating (1.0 - 5.0)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={reviewForm.finalCalibratedRating}
                    onChange={(e) => setReviewForm({ ...reviewForm, finalCalibratedRating: Number(e.target.value) })}
                    className="w-full border border-gray-200 rounded-xl p-2 font-black text-emerald-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Leadership Potential Level</label>
                  <select
                    value={reviewForm.potentialLevel}
                    onChange={(e) => setReviewForm({ ...reviewForm, potentialLevel: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl p-2 bg-white"
                  >
                    <option value="High">High Potential</option>
                    <option value="Medium">Medium Potential</option>
                    <option value="Low">Low Potential</option>
                  </select>
                </div>

                <div className="col-span-2 flex items-center pt-2">
                  <input
                    type="checkbox"
                    id="promo"
                    checked={reviewForm.promotionRecommended}
                    onChange={(e) => setReviewForm({ ...reviewForm, promotionRecommended: e.target.checked })}
                    className="mr-2 rounded"
                  />
                  <label htmlFor="promo" className="text-gray-800 font-bold">
                    Recommend for Grade Promotion / Executive Talent Track
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold"
                >
                  Save Calibrated Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. NOMINATE 360 MODAL */}
      {showNominate360Modal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-3xl shadow-xl w-[520px] max-w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Initiate 360° Feedback Survey</h3>
            <p className="text-xs text-gray-500 mb-4">Nominate evaluators across managerial, peer, and subordinate layers.</p>

            <form onSubmit={handleNominate360} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Subject Employee</label>
                <select
                  value={nominateForm.employeeId}
                  onChange={(e) => setNominateForm({ ...nominateForm, employeeId: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl p-2.5 bg-white font-medium"
                >
                  {defaultEmployees.map(e => <option key={e.id} value={e.id}>{e.name} ({e.dept})</option>)}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Reporting Manager (Downward Review)</label>
                <input
                  type="text"
                  value={nominateForm.rater2Name}
                  onChange={(e) => setNominateForm({ ...nominateForm, rater2Name: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl p-2"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Peer Colleague (Lateral Review)</label>
                <input
                  type="text"
                  value={nominateForm.rater3Name}
                  onChange={(e) => setNominateForm({ ...nominateForm, rater3Name: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl p-2"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Direct Report (Upward Leadership Review)</label>
                <input
                  type="text"
                  value={nominateForm.rater4Name}
                  onChange={(e) => setNominateForm({ ...nominateForm, rater4Name: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl p-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowNominate360Modal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold"
                >
                  Launch 360 Survey
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9. RESPOND 360 MODAL */}
      {showRespond360Modal && selected360Survey && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-3xl shadow-xl w-[520px] max-w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Submit 360° Evaluation</h3>
            <p className="text-xs text-gray-500 mb-4">Evaluating: <strong>{selected360Survey.employeeName}</strong></p>

            <form onSubmit={handleRespond360} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Submitting as Rater</label>
                <select
                  value={respond360Form.raterId}
                  onChange={(e) => setRespond360Form({ ...respond360Form, raterId: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl p-2 bg-white"
                >
                  {selected360Survey.raters?.map((r: any) => (
                    <option key={r.id} value={r.id}>{r.raterName} ({r.relationship}) — Status: {r.status}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Technical Competence (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={respond360Form.techScore}
                    onChange={(e) => setRespond360Form({ ...respond360Form, techScore: Number(e.target.value) })}
                    className="w-full border border-gray-200 rounded-xl p-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Cross-Collaboration (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={respond360Form.collabScore}
                    onChange={(e) => setRespond360Form({ ...respond360Form, collabScore: Number(e.target.value) })}
                    className="w-full border border-gray-200 rounded-xl p-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Leadership & Influence (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={respond360Form.leadScore}
                    onChange={(e) => setRespond360Form({ ...respond360Form, leadScore: Number(e.target.value) })}
                    className="w-full border border-gray-200 rounded-xl p-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Accountability (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={respond360Form.accountScore}
                    onChange={(e) => setRespond360Form({ ...respond360Form, accountScore: Number(e.target.value) })}
                    className="w-full border border-gray-200 rounded-xl p-2"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-semibold text-gray-700 mb-1">Agility & Adaptability (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={respond360Form.agilityScore}
                    onChange={(e) => setRespond360Form({ ...respond360Form, agilityScore: Number(e.target.value) })}
                    className="w-full border border-gray-200 rounded-xl p-2"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-semibold text-gray-700 mb-1">Qualitative Feedback</label>
                  <textarea
                    rows={3}
                    placeholder="Specific examples of strengths and improvement areas..."
                    value={respond360Form.comments}
                    onChange={(e) => setRespond360Form({ ...respond360Form, comments: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl p-2"
                  ></textarea>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowRespond360Modal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold"
                >
                  Submit 360 Ratings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 10. CREATE IDP MODAL */}
      {showIDPModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-3xl shadow-xl w-[580px] max-w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Create Integrated Development Plan</h3>
            <p className="text-xs text-gray-500 mb-4">Establish personal career upskilling roadmaps and corporate sponsorship.</p>

            <form onSubmit={handleCreateIDP} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block font-semibold text-gray-700 mb-1">Employee</label>
                  <select
                    value={idpForm.employeeId}
                    onChange={(e) => setIdpForm({ ...idpForm, employeeId: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl p-2.5 bg-white font-medium"
                  >
                    {defaultEmployees.map(e => <option key={e.id} value={e.id}>{e.name} ({e.dept})</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block font-semibold text-gray-700 mb-1">Career Focus Area</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Enterprise Cloud Security & Zero-Trust Governance"
                    value={idpForm.focusArea}
                    onChange={(e) => setIdpForm({ ...idpForm, focusArea: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl p-2"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-semibold text-gray-700 mb-1">Target Competency</label>
                  <input
                    type="text"
                    placeholder="e.g. Architectural Excellence & Scalability"
                    value={idpForm.targetCompetency}
                    onChange={(e) => setIdpForm({ ...idpForm, targetCompetency: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl p-2"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-semibold text-gray-700 mb-1">Skill Gaps (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="mTLS service mesh, secret rotation, SOC-2 compliance"
                    value={idpForm.skillGaps}
                    onChange={(e) => setIdpForm({ ...idpForm, skillGaps: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl p-2"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-semibold text-gray-700 mb-1">Learning Objectives (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="AWS Security Specialist exam, lead security reviews"
                    value={idpForm.learningObjectives}
                    onChange={(e) => setIdpForm({ ...idpForm, learningObjectives: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl p-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Course / Certification Name</label>
                  <input
                    type="text"
                    value={idpForm.courseName}
                    onChange={(e) => setIdpForm({ ...idpForm, courseName: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl p-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Platform / Institution</label>
                  <input
                    type="text"
                    value={idpForm.coursePlatform}
                    onChange={(e) => setIdpForm({ ...idpForm, coursePlatform: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl p-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Allocated Budget (₹)</label>
                  <input
                    type="number"
                    value={idpForm.allocatedBudget}
                    onChange={(e) => setIdpForm({ ...idpForm, allocatedBudget: Number(e.target.value) })}
                    className="w-full border border-gray-200 rounded-xl p-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Assigned Executive Mentor</label>
                  <input
                    type="text"
                    value={idpForm.mentorName}
                    onChange={(e) => setIdpForm({ ...idpForm, mentorName: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl p-2"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowIDPModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold"
                >
                  Create Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 11. COMPETENCY ASSESSMENT MODAL */}
      {showCompetencyAssessModal && selectedCompetency && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-3xl shadow-xl w-[500px] max-w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Evaluate Competency</h3>
            <p className="text-xs text-indigo-700 font-semibold mb-4">{selectedCompetency.name}</p>

            <form onSubmit={handleAssessCompetency} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Employee</label>
                <select
                  value={compAssessForm.employeeId}
                  onChange={(e) => setCompAssessForm({ ...compAssessForm, employeeId: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl p-2.5 bg-white font-medium"
                >
                  {defaultEmployees.map(e => <option key={e.id} value={e.id}>{e.name} ({e.dept})</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Self Rating (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={compAssessForm.selfRating}
                    onChange={(e) => setCompAssessForm({ ...compAssessForm, selfRating: Number(e.target.value) })}
                    className="w-full border border-gray-200 rounded-xl p-2 font-bold text-gray-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Manager Rating (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={compAssessForm.managerRating}
                    onChange={(e) => setCompAssessForm({ ...compAssessForm, managerRating: Number(e.target.value) })}
                    className="w-full border border-gray-200 rounded-xl p-2 font-bold text-indigo-700"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-semibold text-gray-700 mb-1">Observable Behavioral Evidence</label>
                  <textarea
                    rows={3}
                    placeholder="Specific projects, incident responses, or behaviors demonstrating proficiency..."
                    value={compAssessForm.evidence}
                    onChange={(e) => setCompAssessForm({ ...compAssessForm, evidence: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl p-2"
                  ></textarea>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCompetencyAssessModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold"
                >
                  Save Assessment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* EDIT GOAL MODAL */}
      {showEditGoalModal && editingGoal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Pencil className="w-5 h-5" />
                </span>
                <h3 className="text-base font-bold text-gray-900">Edit Goal / SMART Objective</h3>
              </div>
              <button onClick={() => setShowEditGoalModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateGoal} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Goal Title *</label>
                <input
                  type="text"
                  required
                  value={editingGoal.title}
                  onChange={(e) => setEditingGoal({ ...editingGoal, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingGoal.description}
                  onChange={(e) => setEditingGoal({ ...editingGoal, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Category</label>
                  <select
                    value={editingGoal.category}
                    onChange={(e) => setEditingGoal({ ...editingGoal, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  >
                    <option value="Strategic">Strategic</option>
                    <option value="Operational">Operational</option>
                    <option value="Financial">Financial</option>
                    <option value="Customer">Customer</option>
                    <option value="Innovation">Innovation</option>
                    <option value="People & Culture">People & Culture</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Status</label>
                  <select
                    value={editingGoal.status}
                    onChange={(e) => setEditingGoal({ ...editingGoal, status: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  >
                    <option value="On Track">On Track</option>
                    <option value="At Risk">At Risk</option>
                    <option value="Lagging">Lagging</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Target Value</label>
                  <input
                    type="number"
                    value={editingGoal.targetValue}
                    onChange={(e) => setEditingGoal({ ...editingGoal, targetValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Current Value</label>
                  <input
                    type="number"
                    value={editingGoal.currentValue}
                    onChange={(e) => setEditingGoal({ ...editingGoal, currentValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Unit</label>
                  <input
                    type="text"
                    value={editingGoal.unit}
                    onChange={(e) => setEditingGoal({ ...editingGoal, unit: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Weightage (%)</label>
                  <input
                    type="number"
                    value={editingGoal.weightage}
                    onChange={(e) => setEditingGoal({ ...editingGoal, weightage: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={editingGoal.dueDate}
                    onChange={(e) => setEditingGoal({ ...editingGoal, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowEditGoalModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
