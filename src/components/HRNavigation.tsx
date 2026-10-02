import { Link, useLocation } from 'react-router-dom';
import { 
  Building2, 
  Users, 
  FolderLock, 
  Megaphone, 
  HeartHandshake, 
  BarChart3, 
  Scale, 
  Mail, 
  FileSpreadsheet, 
  LayoutDashboard,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export default function HRNavigation() {
  const location = useLocation();

  const hrTabs = [
    { 
      name: 'HR Overview', 
      href: '/hr', 
      icon: LayoutDashboard,
      desc: 'Central Command' 
    },
    { 
      name: 'Employee Info', 
      href: '/hr/employee-info', 
      icon: Users,
      desc: 'Personal & Official DB' 
    },
    { 
      name: 'Document Vault', 
      href: '/hr/documents', 
      icon: FolderLock,
      desc: 'Digital Records' 
    },
    { 
      name: 'Communication', 
      href: '/hr/communication', 
      icon: Megaphone,
      desc: 'Broadcasts & Notices' 
    },
    { 
      name: 'Engagement', 
      href: '/hr/engagement', 
      icon: HeartHandshake,
      desc: 'Surveys & Kudos' 
    },
    { 
      name: 'HR Reports', 
      href: '/hr/reports', 
      icon: BarChart3,
      desc: 'Workforce Analytics' 
    },
    { 
      name: 'Labour Law Reports', 
      href: '/hr/labour-law-reports', 
      icon: Scale,
      desc: 'Statutory Filings' 
    },
    { 
      name: 'Letters & Mail Merge', 
      href: '/hr/letters-mail-merge', 
      icon: Mail,
      desc: 'Automated Issuance' 
    },
    { 
      name: 'Policies & Forms', 
      href: '/hr/policies-forms', 
      icon: FileSpreadsheet,
      desc: 'Standard Forms & Rules' 
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-blue-200/80 shadow-xs mb-6 overflow-hidden">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-950 text-white px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-3 relative z-10">
          <div className="p-2.5 bg-blue-500/20 rounded-xl border border-blue-400/20 shadow-xs">
            <Building2 className="w-5 h-5 text-blue-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-blue-300 tracking-wide uppercase">Core People Operations</span>
              <span className="text-[10px] bg-blue-500/30 text-blue-200 px-2 py-0.5 rounded-full font-bold border border-blue-400/30">
                HR SUITE PRO
              </span>
              <span className="flex items-center text-emerald-400 text-[10px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1"></span>
                Labour Law Compliant
              </span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">Core Human Resources Management</h2>
          </div>
        </div>

        <div className="flex items-center gap-2 relative z-10">
          <Link
            to="/hr/employee-info"
            className="text-xs font-bold bg-white text-blue-900 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <span>Staff Directory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            to="/hr/letters-mail-merge"
            className="text-xs font-semibold bg-blue-800/60 hover:bg-blue-800 text-blue-100 border border-blue-500/30 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Generate Letter</span>
          </Link>
        </div>
      </div>

      {/* Navigation Tab Bar */}
      <div className="flex items-center gap-1 p-2 bg-slate-50/80 border-t border-slate-100 overflow-x-auto scrollbar-none">
        {hrTabs.map((tab) => {
          const isActive = location.pathname === tab.href;
          return (
            <Link
              key={tab.name}
              to={tab.href}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap group ${
                isActive
                  ? 'bg-blue-700 text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-blue-700 hover:bg-blue-50/80'
              }`}
            >
              <tab.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-600'}`} />
              <span>{tab.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
