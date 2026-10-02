import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Directory from './pages/Directory';
import Login from './pages/Login';
import Register from './pages/Register';
import Chat from './pages/Chat';
import Meetings from './pages/Meetings';
import Files from './pages/Files';
import Approvals from './pages/Approvals';

// CRM Pages
import CRMDashboard from './pages/crm/Dashboard';
import Leads from './pages/crm/Leads';
import Customers from './pages/crm/Customers';
import Sales from './pages/crm/Sales';
import Communications from './pages/crm/Communications';
import TicketManager from './pages/crm/TicketManager';
import DealsQuotes from './pages/crm/DealsQuotes';
import GoalsCampaigns from './pages/crm/GoalsCampaigns';
import CloudTelephony from './pages/crm/CloudTelephony';

// HEM Pages
import HEMDashboard from './pages/hem/Dashboard';
import Employees from './pages/hem/Employees';
import Attendance from './pages/hem/Attendance';
import Payroll from './pages/hem/Payroll';
import Performance from './pages/hem/Performance';
import Onboarding from './pages/hem/Onboarding';
import AlertsReminders from './pages/hem/AlertsReminders';
import Policies from './pages/hem/Policies';
import LeaveManagement from './pages/hem/LeaveManagement';
import ShiftManagement from './pages/hem/ShiftManagement';
import OvertimeManagement from './pages/hem/OvertimeManagement';
import FacialAttendance from './pages/hem/FacialAttendance';
import ExitManagement from './pages/hem/ExitManagement';
import MobileESS from './pages/mobile/MobileESS';


// OS Pages
import OwnerDashboard from './pages/os/Dashboard';
import Tasks from './pages/os/Tasks';
import AIAssistant from './pages/os/AIAssistant';

// ERP Core Pages
import Invoicing from './pages/erp/Invoicing';
import Finance from './pages/erp/Finance';
import PurchaseEntry from './pages/erp/PurchaseEntry';
import Inventory from './pages/erp/Inventory';
import Projects from './pages/erp/Projects';
import Assets from './pages/erp/Assets';
import Expenses from './pages/erp/Expenses';
import Admin from './pages/erp/Admin';
import Banking from './pages/erp/Banking';

// Role Dashboards
import HRDashboard from './pages/dashboards/HRDashboard';
import ManagerDashboard from './pages/dashboards/ManagerDashboard';
import EmployeePortal from './pages/dashboards/EmployeePortal';

// Recruitment Management Suite Pages
import RecruitmentDashboard from './pages/recruitment/Dashboard';
import JobRequisitions from './pages/recruitment/JobRequisitions';
import CandidateSourcing from './pages/recruitment/CandidateSourcing';
import ResumeManagement from './pages/recruitment/ResumeManagement';
import CandidateCommunications from './pages/recruitment/CandidateCommunications';
import BackgroundScreening from './pages/recruitment/BackgroundScreening';
import OfferLetters from './pages/recruitment/OfferLetters';
import HiringWorkflow from './pages/recruitment/HiringWorkflow';
import RecruitmentAnalytics from './pages/recruitment/RecruitmentAnalytics';

// HR Module Pages
import HROverview from './pages/hr/Dashboard';
import EmployeeInfo from './pages/hr/EmployeeInfo';
import DocumentManagement from './pages/hr/DocumentManagement';
import EmployeeCommunication from './pages/hr/EmployeeCommunication';
import EmployeeEngagement from './pages/hr/EmployeeEngagement';
import HRReports from './pages/hr/HRReports';
import LabourLawReports from './pages/hr/LabourLawReports';
import LetterMailMerge from './pages/hr/LetterMailMerge';
import CompanyPoliciesForms from './pages/hr/CompanyPoliciesForms';

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  if (!token || !userStr) {
    return <Navigate to="/login" />;
  }
  
  const user = JSON.parse(userStr);
  
  if (adminOnly && user.role !== 'Admin') {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes */}
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="directory" element={<Directory />} />
          <Route path="chat" element={<Chat />} />
          <Route path="meetings" element={<Meetings />} />
          <Route path="files" element={<Files />} />
          <Route path="approvals" element={<ProtectedRoute adminOnly><Approvals /></ProtectedRoute>} />
          
          {/* CRM Routes */}
          <Route path="crm" element={<CRMDashboard />} />
          <Route path="crm/leads" element={<Leads />} />
          <Route path="crm/customers" element={<Customers />} />
          <Route path="crm/tickets" element={<TicketManager />} />
          <Route path="crm/deals" element={<DealsQuotes />} />
          <Route path="crm/campaigns" element={<GoalsCampaigns />} />
          <Route path="crm/telephony" element={<CloudTelephony />} />
          <Route path="crm/sales" element={<Sales />} />
          <Route path="crm/communications" element={<Communications />} />

          {/* HEM Routes */}
          <Route path="hem" element={<HEMDashboard />} />
          <Route path="hem/employees" element={<Employees />} />
          <Route path="hem/onboarding" element={<Onboarding />} />
          <Route path="hem/alerts" element={<AlertsReminders />} />
          <Route path="hem/policies" element={<Policies />} />
          <Route path="hem/attendance" element={<Attendance />} />
          <Route path="hem/leave" element={<LeaveManagement />} />
          <Route path="hem/shifts" element={<ShiftManagement />} />
          <Route path="hem/overtime" element={<OvertimeManagement />} />
          <Route path="hem/facial-attendance" element={<FacialAttendance />} />
          <Route path="hem/payroll" element={<Payroll />} />
          <Route path="hem/performance" element={<Performance />} />
          <Route path="hem/exit" element={<ExitManagement />} />
          <Route path="hem/mobile-ess" element={<MobileESS />} />
          <Route path="mobile-ess" element={<MobileESS />} />


          {/* Business OS Routes */}
          <Route path="os" element={<OwnerDashboard />} />
          <Route path="os/tasks" element={<Tasks />} />
          <Route path="os/recruitment" element={<Navigate to="/recruitment" replace />} />
          <Route path="os/service" element={<Navigate to="/crm/tickets" replace />} />
          <Route path="os/finance" element={<Navigate to="/erp/finance" replace />} />
          <Route path="os/ai" element={<AIAssistant />} />

          {/* ERP Core Routes */}
          <Route path="erp/invoicing" element={<Invoicing />} />
          <Route path="erp/finance" element={<Finance />} />
          <Route path="erp/purchases" element={<PurchaseEntry />} />
          <Route path="erp/inventory" element={<Inventory />} />
          <Route path="erp/banking" element={<Banking />} />
          <Route path="erp/projects" element={<Projects />} />
          <Route path="erp/assets" element={<Assets />} />
          <Route path="erp/expenses" element={<Expenses />} />
          <Route path="erp/admin" element={<Admin />} />

          {/* Role Dashboards */}
          <Route path="dashboards/hr" element={<HRDashboard />} />
          <Route path="dashboards/manager" element={<ManagerDashboard />} />
          <Route path="dashboards/employee" element={<EmployeePortal />} />

          {/* Recruitment Management Suite Routes */}
          <Route path="recruitment" element={<RecruitmentDashboard />} />
          <Route path="recruitment/requisitions" element={<JobRequisitions />} />
          <Route path="recruitment/sourcing" element={<CandidateSourcing />} />
          <Route path="recruitment/resumes" element={<ResumeManagement />} />
          <Route path="recruitment/communications" element={<CandidateCommunications />} />
          <Route path="recruitment/screening" element={<BackgroundScreening />} />
          <Route path="recruitment/offers" element={<OfferLetters />} />
          <Route path="recruitment/workflow" element={<HiringWorkflow />} />
          <Route path="recruitment/analytics" element={<RecruitmentAnalytics />} />

          {/* HR Core Module Routes */}
          <Route path="hr" element={<HROverview />} />
          <Route path="hr/employee-info" element={<EmployeeInfo />} />
          <Route path="hr/documents" element={<DocumentManagement />} />
          <Route path="hr/communication" element={<EmployeeCommunication />} />
          <Route path="hr/engagement" element={<EmployeeEngagement />} />
          <Route path="hr/reports" element={<HRReports />} />
          <Route path="hr/labour-law-reports" element={<LabourLawReports />} />
          <Route path="hr/letters-mail-merge" element={<LetterMailMerge />} />
          <Route path="hr/policies-forms" element={<CompanyPoliciesForms />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
