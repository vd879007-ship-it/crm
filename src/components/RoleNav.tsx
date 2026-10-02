import { Link, useLocation } from 'react-router-dom';
import { User, Users, ShieldAlert, Sparkles, ChevronRight, Layers, CheckCircle2 } from 'lucide-react';

export default function RoleNav() {
  const location = useLocation();

  const navItems = [
    {
      name: 'My Employee Portal',
      path: '/dashboards/employee',
      icon: User,
      badge: 'Self-Service',
      desc: 'Attendance, leaves & profile'
    },
    {
      name: 'Team Manager View',
      path: '/dashboards/manager',
      icon: Users,
      badge: 'Team Lead',
      desc: 'Shift oversight & approvals'
    },
    {
      name: 'HR Leadership View',
      path: '/dashboards/hr',
      icon: ShieldAlert,
      badge: 'Executive HR',
      desc: 'Workforce metrics & compliance'
    }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-purple-100 overflow-hidden mb-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-800 via-indigo-900 to-slate-900 text-white p-5 sm:p-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-purple-300 text-xs font-semibold uppercase tracking-wider mb-1">
              <Layers className="w-4 h-4 text-purple-400" />
              <span>Persona-Based Workspaces</span>
              <span>•</span>
              <span className="flex items-center text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1.5"></span>
                Role-Based RBAC Active
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center">
              Role Dashboards
              <span className="ml-3 text-xs bg-purple-500/30 text-purple-200 border border-purple-400/30 px-2.5 py-1 rounded-full font-medium">
                3 Dedicated Portals
              </span>
            </h1>
            <p className="text-purple-200/80 text-sm mt-1 max-w-2xl">
              Switch effortlessly between your personal employee self-service workbench, line manager approvals, and organization-wide HR executive metrics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md text-xs font-medium text-white border border-white/15 flex items-center">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
              Live Workspace Sync
            </span>
            <Link
              to="/os/ai"
              className="px-3.5 py-1.5 rounded-xl bg-purple-500/30 hover:bg-purple-500/50 text-xs font-semibold text-purple-100 border border-purple-400/40 transition-all flex items-center shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-300" />
              Ask AI Co-Pilot
            </Link>
          </div>
        </div>
      </div>

      {/* Horizontal Tab Navigation */}
      <div className="px-3 py-2 bg-purple-50/50 border-b border-purple-100 flex items-center gap-2 overflow-x-auto scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap group ${
                isActive
                  ? 'bg-purple-700 text-white shadow-md shadow-purple-600/25 font-semibold'
                  : 'bg-white hover:bg-purple-100/70 text-slate-700 border border-slate-200/70 hover:border-purple-300'
              }`}
            >
              <div
                className={`p-1.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-purple-100 text-purple-700 group-hover:bg-purple-200'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex flex-col text-left">
                <div className="flex items-center gap-1.5">
                  <span>{item.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                      isActive
                        ? 'bg-white/25 text-white'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {item.badge}
                  </span>
                </div>
                <span
                  className={`text-[10px] hidden sm:block ${
                    isActive ? 'text-purple-200' : 'text-slate-400'
                  }`}
                >
                  {item.desc}
                </span>
              </div>
              <ChevronRight
                className={`w-3.5 h-3.5 ml-1 transition-transform ${
                  isActive
                    ? 'text-purple-200 translate-x-0.5'
                    : 'text-slate-400 opacity-0 group-hover:opacity-100'
                }`}
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
