import { Link, useLocation } from 'react-router-dom';
import { 
  UserCog, 
  Users, 
  Clock, 
  DollarSign, 
  Target, 
  LayoutDashboard, 
  ArrowRight, 
  UserCheck, 
  BellRing, 
  FileCheck2,
  CalendarCheck,
  CalendarDays,
  Timer,
  Camera,
  Layers,
  Fingerprint,
  LogOut
} from 'lucide-react';


export default function HEMNavigation() {
  const location = useLocation();

  const hemTabs = [
    { 
      name: 'HEM Overview', 
      href: '/hem', 
      icon: LayoutDashboard,
      desc: 'Workforce Hub' 
    },
    { 
      name: 'Workforce Ops & Rosters', 
      href: '/hem/employees', 
      icon: Users,
      desc: 'Rosters & Shift Allocations' 
    },
    { 
      name: 'Attendance & Swipes', 
      href: '/hem/attendance', 
      icon: Fingerprint,
      desc: 'Multi-Source Capture' 
    },
    { 
      name: 'Leave Management', 
      href: '/hem/leave', 
      icon: CalendarCheck,
      desc: 'Custom Schemes & Quotas' 
    },
    { 
      name: 'Shift Management', 
      href: '/hem/shifts', 
      icon: CalendarDays,
      desc: 'Rosters & Swaps' 
    },
    { 
      name: 'Overtime (OT)', 
      href: '/hem/overtime', 
      icon: Timer,
      desc: 'Policies & Payouts' 
    },
    { 
      name: 'Facial AI Kiosk', 
      href: '/hem/facial-attendance', 
      icon: Camera,
      desc: 'Biometric Recognition' 
    },
    { 
      name: 'Digital Onboarding', 
      href: '/hem/onboarding', 
      icon: UserCheck,
      desc: 'Paperless Flow' 
    },
    { 
      name: 'Alerts & Reminders', 
      href: '/hem/alerts', 
      icon: BellRing,
      desc: 'Staff & Admin' 
    },
    { 
      name: 'Shift & Attendance Rules', 
      href: '/hem/policies', 
      icon: FileCheck2,
      desc: 'Late Marks, LOP & Work Hours' 
    },
    { 
      name: 'Payroll Hub', 
      href: '/hem/payroll', 
      icon: DollarSign,
      desc: 'Salary & Compensation' 
    },
    { 
      name: 'Performance', 
      href: '/hem/performance', 
      icon: Target,
      desc: 'KPIs & Appraisals' 
    },
    { 
      name: 'Exit Management', 
      href: '/hem/exit', 
      icon: LogOut,
      desc: 'Resignations & Clearance' 
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs mb-6 overflow-hidden">
      {/* Top Banner / Breadcrumb Bar */}
      <div className="bg-gradient-to-r from-teal-900 via-emerald-900 to-slate-900 text-white px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white/10 rounded-xl border border-white/10 shadow-xs">
            <UserCog className="w-5 h-5 text-teal-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-teal-300 tracking-wide uppercase">Human Capital Suite</span>
              <span className="text-[10px] bg-teal-500/30 text-teal-200 px-2 py-0.5 rounded-full font-bold border border-teal-400/30">
                HEM 360°
              </span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">Human Capital & Employee Management</h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/hr/employee-info"
            className="text-xs font-bold bg-white text-teal-900 hover:bg-teal-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <span>Staff Directory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            to="/hem/payroll"
            className="text-xs font-semibold bg-teal-800/60 hover:bg-teal-800 text-teal-100 border border-teal-500/30 px-3 py-1.5 rounded-lg transition-colors"
          >
            Payroll Hub
          </Link>
        </div>
      </div>

      {/* Navigation Tab Bar */}
      <div className="flex items-center gap-1 p-2 bg-gray-50/70 border-t border-gray-100 overflow-x-auto">
        {hemTabs.map((tab) => {
          const isActive = location.pathname === tab.href;
          return (
            <Link
              key={tab.name}
              to={tab.href}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-teal-700 hover:bg-teal-50/80'
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
