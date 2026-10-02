import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  Users, LayoutDashboard, MessageSquare, Video, FolderGit2, Zap, LogOut, 
  Briefcase, UserSquare2, Receipt, PhoneCall, Clock, DollarSign, Target, 
  UserCog, Bot, CheckSquare, LifeBuoy, Package, ShieldCheck, Laptop, Menu, X,
  FileSpreadsheet, Compass, FileCheck, Mail, GitBranch, BarChart3, Award,
  UserCheck, BellRing, FileCheck2, FolderLock, Megaphone, HeartHandshake, Scale, Building2,
  Fingerprint, CalendarCheck, CalendarDays, Timer, Camera, Smartphone,
  FileText, ShoppingCart, BadgeDollarSign, PhoneForwarded
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import SideHUD from './SideHUD';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export default function Layout() {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isHudOpen, setIsHudOpen] = useState(false);

  // Auto-close mobile sidebar when route changes
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  // Expand HUD on large screens by default
  useEffect(() => {
    if (window.innerWidth >= 1280) {
      setIsHudOpen(true);
    }
  }, []);

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isAdmin = user?.role === 'Admin';

  const navItems = [
    { name: 'Unified Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Directory', href: '/directory', icon: Users },
    { name: 'Chat & Collaboration', href: '/chat', icon: MessageSquare },
    { name: 'Video Meetings', href: '/meetings', icon: Video },
    { name: 'Files Vault', href: '/files', icon: FolderGit2 },
  ];

  const crmNavItems = [
    { name: 'CRM Overview', href: '/crm', icon: Briefcase },
    { name: 'Leads Pipeline', href: '/crm/leads', icon: Users },
    { name: 'Customers & Accounts', href: '/crm/customers', icon: UserSquare2 },
    { name: 'Tickets & Field Service', href: '/crm/tickets', icon: LifeBuoy },
    { name: 'Deals & Quotes', href: '/crm/deals', icon: BadgeDollarSign },
    { name: 'Goals & Campaigns', href: '/crm/campaigns', icon: Target },
    { name: 'Cloud Telephony', href: '/crm/telephony', icon: PhoneForwarded },
    { name: 'Sales Documents', href: '/crm/sales', icon: Receipt },
    { name: 'Communications', href: '/crm/communications', icon: PhoneCall },
  ];

  const erpNavItems = [
    { name: 'Purchase Entry & GRN', href: '/erp/purchases', icon: ShoppingCart },
    { name: 'Inventory & BOM', href: '/erp/inventory', icon: Package },
    { name: 'Projects & Tasks', href: '/erp/projects', icon: FolderGit2 },
    { name: 'Asset Lifecycle', href: '/erp/assets', icon: Laptop },
    { name: 'Expenses & Claims', href: '/erp/expenses', icon: Receipt },
    { name: 'Admin Console & Isolation', href: '/erp/admin', icon: ShieldCheck },
  ];

  const financeNavItems = [
    { name: 'Invoicing & WhatsApp Bills', href: '/erp/invoicing', icon: FileText },
    { name: 'Financial Ledger & BRS', href: '/erp/finance', icon: DollarSign },
    { name: 'Payroll & Statutory Hub', href: '/hem/payroll', icon: Receipt },
  ];

  const hrNavItems = [
    { name: 'HR Overview', href: '/hr', icon: LayoutDashboard },
    { name: 'Employee Info', href: '/hr/employee-info', icon: Users },
    { name: 'Workforce Ops & Rosters', href: '/hem/employees', icon: Users },
    { name: 'Attendance & Swipes', href: '/hem/attendance', icon: Fingerprint },
    { name: 'Facial AI Kiosk', href: '/hem/facial-attendance', icon: Camera },
    { name: 'Leave Management', href: '/hem/leave', icon: CalendarCheck },
    { name: 'Shift Management', href: '/hem/shifts', icon: CalendarDays },
    { name: 'Overtime (OT)', href: '/hem/overtime', icon: Timer },
    { name: 'Digital Onboarding', href: '/hem/onboarding', icon: UserCheck },
    { name: 'Recruitment ATS', href: '/recruitment', icon: Briefcase },
    { name: 'Performance & Goals', href: '/hem/performance', icon: Target },
    { name: 'Document Vault', href: '/hr/documents', icon: FolderLock },
    { name: 'Labour Law Reports', href: '/hr/labour-law-reports', icon: Scale },
    { name: 'Exit Management', href: '/hem/exit', icon: LogOut },
  ];

  const dashboardNavItems = [
    { name: 'Employee Portal', href: '/dashboards/employee', icon: UserSquare2 },
    { name: 'Manager View', href: '/dashboards/manager', icon: Target },
    { name: 'HR View', href: '/dashboards/hr', icon: Users },
    { name: 'Mobile ESS App', href: '/mobile-ess', icon: Smartphone },
  ];

  if (isAdmin) {
    navItems.push({ name: 'Central Approvals', href: '/approvals', icon: ShieldCheck });
  }

  const renderNavLinks = () => (
    <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
      {navItems.map((item) => (
        <Link
          key={item.name}
          to={item.href}
          className={cn(
            "flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
            location.pathname === item.href 
              ? "bg-blue-50 text-blue-700 font-semibold shadow-xs" 
              : "text-gray-700 hover:bg-gray-100"
          )}
        >
          <item.icon className={cn("mr-3 h-5 w-5", location.pathname === item.href ? "text-blue-600" : "text-gray-400")} />
          {item.name}
        </Link>
      ))}

      {/* TIER 1: FRONT OFFICE (CRM, SALES & SERVICE) */}
      <div className="pt-4 pb-1">
        <div className="flex items-center justify-between px-3">
          <p className="text-xs font-bold text-purple-700 uppercase tracking-wider">Front Office (CRM & Sales)</p>
          {location.pathname.startsWith('/crm') && (
            <span className="text-[9px] bg-purple-100 text-purple-800 font-extrabold px-1.5 py-0.5 rounded tracking-wider">ACTIVE</span>
          )}
        </div>
      </div>
      {crmNavItems.map((item) => (
        <Link
          key={item.name}
          to={item.href}
          className={cn(
            "flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
            location.pathname === item.href 
              ? "bg-purple-50 text-purple-700 font-semibold shadow-xs" 
              : "text-gray-700 hover:bg-gray-100"
          )}
        >
          <item.icon className={cn("mr-3 h-5 w-5", location.pathname === item.href ? "text-purple-600" : "text-gray-400")} />
          {item.name}
        </Link>
      ))}

      {/* TIER 2: OPERATIONS (SUPPLY CHAIN & ASSETS) */}
      <div className="pt-4 pb-1">
        <div className="flex items-center justify-between px-3">
          <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Operations (Supply Chain)</p>
          {location.pathname.startsWith('/erp') && !['/erp/finance', '/erp/invoicing'].includes(location.pathname) && (
            <span className="text-[9px] bg-indigo-100 text-indigo-800 font-extrabold px-1.5 py-0.5 rounded tracking-wider">ACTIVE</span>
          )}
        </div>
      </div>
      {erpNavItems.map((item) => (
        <Link
          key={item.name}
          to={item.href}
          className={cn(
            "flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
            location.pathname === item.href 
              ? "bg-indigo-50 text-indigo-700 font-semibold shadow-xs" 
              : "text-gray-700 hover:bg-gray-100"
          )}
        >
          <item.icon className={cn("mr-3 h-5 w-5", location.pathname === item.href ? "text-indigo-600" : "text-gray-400")} />
          {item.name}
        </Link>
      ))}

      {/* TIER 3: BACK OFFICE & FINANCE */}
      <div className="pt-4 pb-1">
        <div className="flex items-center justify-between px-3">
          <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Back Office & Finance</p>
          {(location.pathname === '/erp/invoicing' || location.pathname === '/erp/finance' || location.pathname === '/hem/payroll') && (
            <span className="text-[9px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.5 rounded tracking-wider">ACTIVE</span>
          )}
        </div>
      </div>
      {financeNavItems.map((item) => (
        <Link
          key={item.name}
          to={item.href}
          className={cn(
            "flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
            location.pathname === item.href 
              ? "bg-emerald-50 text-emerald-700 font-semibold shadow-xs" 
              : "text-gray-700 hover:bg-gray-100"
          )}
        >
          <item.icon className={cn("mr-3 h-5 w-5", location.pathname === item.href ? "text-emerald-600" : "text-gray-400")} />
          {item.name}
        </Link>
      ))}

      {/* TIER 4: PEOPLE LAYER (HRM & WORKFORCE) */}
      <div className="pt-4 pb-1">
        <div className="flex items-center justify-between px-3">
          <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">People Layer (HRM)</p>
          {(location.pathname.startsWith('/hr') || location.pathname.startsWith('/hem') || location.pathname.startsWith('/recruitment')) && location.pathname !== '/hem/payroll' && (
            <span className="text-[9px] bg-blue-100 text-blue-800 font-extrabold px-1.5 py-0.5 rounded tracking-wider">ACTIVE</span>
          )}
        </div>
      </div>
      {hrNavItems.map((item) => (
        <Link
          key={item.name}
          to={item.href}
          className={cn(
            "flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
            location.pathname === item.href 
              ? "bg-blue-50 text-blue-700 font-semibold shadow-xs" 
              : "text-gray-700 hover:bg-gray-100"
          )}
        >
          <item.icon className={cn("mr-3 h-5 w-5", location.pathname === item.href ? "text-blue-600" : "text-gray-400")} />
          {item.name}
        </Link>
      ))}

      {/* ROLE PORTALS */}
      <div className="pt-4 pb-1">
        <div className="flex items-center justify-between px-3">
          <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">Role Portals</p>
          {location.pathname.startsWith('/dashboards') && (
            <span className="text-[9px] bg-amber-100 text-amber-800 font-extrabold px-1.5 py-0.5 rounded tracking-wider">ACTIVE</span>
          )}
        </div>
      </div>
      {dashboardNavItems.map((item) => (
        <Link
          key={item.name}
          to={item.href}
          className={cn(
            "flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
            location.pathname === item.href 
              ? "bg-amber-50 text-amber-700 font-semibold shadow-xs" 
              : "text-gray-700 hover:bg-gray-100"
          )}
        >
          <item.icon className={cn("mr-3 h-5 w-5", location.pathname === item.href ? "text-amber-600" : "text-gray-400")} />
          {item.name}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans relative overflow-hidden">
      {/* Mobile Sidebar Overlay Backdrop */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)} 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar (Desktop Persistent & Mobile Drawer) */}
      <aside className={cn(
        "bg-white border-r border-gray-200 flex flex-col z-50 shadow-sm transition-transform duration-300 ease-in-out",
        "fixed inset-y-0 left-0 w-64 md:static md:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
          <span className="text-lg font-extrabold text-blue-600 flex items-center gap-2 tracking-tight">
            <span>Antigravity ERP</span>
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-blue-100 text-blue-800 font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider">
              BUSINESS OS
            </span>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="p-1 rounded-md text-gray-400 hover:text-gray-600 md:hidden cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {renderNavLinks()}

        <div className="p-4 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-9 w-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm uppercase">
              {user?.name ? user.name.substring(0, 2) : 'U'}
            </div>
            <div className="ml-3 truncate max-w-[120px]">
              <p className="text-sm font-semibold text-gray-800 truncate" title={user?.name || 'User'}>
                {user?.name || 'User'}
              </p>
              <p className="text-[10px] text-gray-500 truncate" title={user?.role || 'Employee'}>
                {user?.role || 'Employee'}
              </p>
            </div>
          </div>
          <button 
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              window.location.href = '/login';
            }}
            className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={cn(
        "flex-1 flex flex-col overflow-hidden transition-all duration-300 min-w-0",
        isHudOpen ? "xl:mr-80" : "mr-0"
      )}>
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 shadow-xs z-10">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 text-gray-600 hover:text-gray-900 rounded-lg md:hidden cursor-pointer"
              title="Open Navigation"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-base sm:text-lg font-bold text-gray-800 truncate">
              {navItems.find((i: any) => i.href === location.pathname)?.name || 
               crmNavItems.find((i: any) => i.href === location.pathname)?.name ||
               erpNavItems.find((i: any) => i.href === location.pathname)?.name ||
               financeNavItems.find((i: any) => i.href === location.pathname)?.name ||
               hrNavItems.find((i: any) => i.href === location.pathname)?.name ||
               dashboardNavItems.find((i: any) => i.href === location.pathname)?.name ||
               'Antigravity ERP'}
            </h1>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={() => setIsHudOpen(!isHudOpen)}
              className="flex items-center space-x-1.5 sm:space-x-2 px-2.5 sm:px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-blue-400 rounded-lg text-xs font-semibold shadow-sm transition-all border border-slate-700/80 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 animate-pulse text-amber-400" />
              <span className="hidden sm:inline">{isHudOpen ? 'Side HUD Active' : 'Toggle Side HUD'}</span>
              <span className="sm:hidden">HUD</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50/50">
          <Outlet />
        </div>
      </main>

      {/* Dedicated Side HUD Component */}
      <SideHUD isOpen={isHudOpen} onToggle={() => setIsHudOpen(!isHudOpen)} />
    </div>
  );
}


