import { Link, useLocation } from 'react-router-dom';
import { 
  Zap, 
  CheckSquare, 
  Briefcase, 
  LifeBuoy, 
  DollarSign, 
  Bot, 
  LayoutDashboard,
  ArrowRight
} from 'lucide-react';

export default function OSNavigation() {
  const location = useLocation();

  const osTabs = [
    { 
      name: 'Owner Dashboard', 
      href: '/os', 
      icon: LayoutDashboard,
      desc: 'Executive Pulse' 
    },
    { 
      name: 'Operations & Tasks', 
      href: '/os/tasks', 
      icon: CheckSquare,
      desc: 'Kanban Checklists' 
    },
    { 
      name: 'Recruitment Suite', 
      href: '/recruitment', 
      icon: Briefcase,
      desc: 'ATS, Sourcing & Requisitions' 
    },
    { 
      name: 'Support & Tickets', 
      href: '/crm/tickets', 
      icon: LifeBuoy,
      desc: 'CRM Helpdesk & SLA' 
    },
    { 
      name: 'Finance & Ledger', 
      href: '/erp/finance', 
      icon: DollarSign,
      desc: 'ERP P&L & Balance Sheet' 
    },
    { 
      name: 'AI Assistants', 
      href: '/os/ai', 
      icon: Bot,
      desc: 'GenAI Tools' 
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs mb-6 overflow-hidden">
      {/* Top Banner / Breadcrumb Bar */}
      <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-indigo-950 text-white px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-500/20 rounded-xl border border-rose-500/30 shadow-xs">
            <Zap className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-rose-300 tracking-wide uppercase">Enterprise Suite</span>
              <span className="text-[10px] bg-rose-500/30 text-rose-200 px-2 py-0.5 rounded-full font-bold border border-rose-400/30">
                BUSINESS OS
              </span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">Executive Operations & Operating System</h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/os/tasks"
            className="text-xs font-bold bg-white text-rose-900 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <span>Task Board</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            to="/erp/finance"
            className="text-xs font-semibold bg-rose-900/60 hover:bg-rose-800 text-rose-100 border border-rose-500/30 px-3 py-1.5 rounded-lg transition-colors"
          >
            Ledger
          </Link>
        </div>
      </div>

      {/* Navigation Tab Bar */}
      <div className="flex items-center gap-1 p-2 bg-gray-50/70 border-t border-gray-100 overflow-x-auto">
        {osTabs.map((tab) => {
          const isActive = location.pathname === tab.href;
          return (
            <Link
              key={tab.name}
              to={tab.href}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-rose-700 hover:bg-rose-50/80'
              }`}
            >
              <tab.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
              <span>{tab.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
