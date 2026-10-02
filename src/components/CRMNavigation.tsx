import { Link, useLocation } from 'react-router-dom';
import { 
  Briefcase, 
  Users, 
  UserSquare2, 
  Receipt, 
  PhoneCall, 
  LayoutDashboard,
  ArrowRight,
  LifeBuoy,
  Target,
  BadgeDollarSign,
  PhoneForwarded,
  Sparkles
} from 'lucide-react';

export default function CRMNavigation() {
  const location = useLocation();

  const crmTabs = [
    { 
      name: 'CRM Overview', 
      href: '/crm', 
      icon: LayoutDashboard,
      desc: 'Metrics & Operations' 
    },
    { 
      name: 'Leads Pipeline', 
      href: '/crm/leads', 
      icon: Users,
      desc: 'Stages & Scoring' 
    },
    { 
      name: 'Customers & Contacts', 
      href: '/crm/customers', 
      icon: UserSquare2,
      desc: 'Client Directory' 
    },
    { 
      name: 'Ticket Manager', 
      href: '/crm/tickets', 
      icon: LifeBuoy,
      desc: 'Support Desk & SLA' 
    },
    { 
      name: 'Deals & Quotes', 
      href: '/crm/deals', 
      icon: BadgeDollarSign,
      desc: 'Pipeline & Proposals' 
    },
    { 
      name: 'Goals & Campaigns', 
      href: '/crm/campaigns', 
      icon: Target,
      desc: 'Quotas & Marketing' 
    },
    { 
      name: 'Cloud Telephony & Recordings', 
      href: '/crm/telephony', 
      icon: PhoneForwarded,
      desc: 'Softphone & Audio Waveforms' 
    },
    { 
      name: 'Sales & Invoices', 
      href: '/crm/sales', 
      icon: Receipt,
      desc: 'Orders & Payments' 
    },
    { 
      name: 'Communications Log', 
      href: '/crm/communications', 
      icon: PhoneCall,
      desc: 'Omnichannel Records' 
    }
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs mb-6 overflow-hidden">
      {/* Top Banner / Breadcrumb Bar */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white/10 rounded-xl border border-white/10 shadow-xs">
            <Briefcase className="w-5 h-5 text-purple-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-purple-300 tracking-wide uppercase">Enterprise Suite</span>
              <span className="text-[10px] bg-purple-500/30 text-purple-200 px-2 py-0.5 rounded-full font-bold border border-purple-400/30">
                CRM 360° Operations
              </span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">Customer Relationship Management</h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/crm/tickets"
            className="text-xs font-bold bg-white text-purple-900 hover:bg-purple-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <span>+ Ticket</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            to="/crm/telephony"
            className="text-xs font-semibold bg-purple-800/60 hover:bg-purple-800 text-purple-100 border border-purple-500/30 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <PhoneForwarded className="w-3.5 h-3.5" />
            <span>Open Softphone</span>
          </Link>
        </div>
      </div>

      {/* Navigation Tab Bar */}
      <div className="flex items-center gap-1 p-2 bg-gray-50/70 border-t border-gray-100 overflow-x-auto">
        {crmTabs.map((tab) => {
          const isActive = location.pathname === tab.href;
          return (
            <Link
              key={tab.name}
              to={tab.href}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-purple-700 hover:bg-purple-50/80'
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
