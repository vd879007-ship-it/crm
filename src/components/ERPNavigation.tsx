import { Link, useLocation } from 'react-router-dom';
import { Package, FolderGit2, Laptop, ShieldCheck, Sparkles, ChevronRight, Layers, CheckCircle2, Box, Receipt, FileText, ShoppingCart, Scale, Landmark, Building2 } from 'lucide-react';

export default function ERPNavigation() {
  const location = useLocation();

  const navItems = [
    {
      name: 'Invoicing & Billing',
      path: '/erp/invoicing',
      icon: FileText,
      badge: 'Quotations, Invoices & DC',
      desc: 'Tax invoices, sales quotes, delivery challans & E-Way'
    },
    {
      name: 'Purchase Entry',
      path: '/erp/purchases',
      icon: ShoppingCart,
      badge: 'POs & 2B Reconcile',
      desc: 'Purchase orders, vendor bills & GSTR-2B ITC matching'
    },
    {
      name: 'P&L & Balance Sheet',
      path: '/erp/finance',
      icon: Scale,
      badge: 'Financials & GSTR',
      desc: 'P&L, balance sheet, GSTR-1/3B & client aging'
    },
    {
      name: 'Inventory & Stock',
      path: '/erp/inventory',
      icon: Package,
      badge: 'Multi-Godown',
      desc: 'Multi-warehouse stock, inter-godown transfers & SKU'
    },
    {
      name: 'Banking & BRS',
      path: '/erp/banking',
      icon: Landmark,
      badge: 'Connected & BRS',
      desc: 'Bank reconciliation, statement sync & instant payouts'
    },
    {
      name: 'Payroll & Statutory',
      path: '/hem/payroll',
      icon: Receipt,
      badge: 'PF, ESI & JV',
      desc: 'Salary processing, statutory compliance & accounting JV'
    },
    {
      name: 'Projects & Milestones',
      path: '/erp/projects',
      icon: FolderGit2,
      badge: 'Execution',
      desc: 'Sprints, tasks & deadlines'
    },
    {
      name: 'Asset Management',
      path: '/erp/assets',
      icon: Laptop,
      badge: 'Hardware',
      desc: 'IT custody & device serials'
    },
    {
      name: 'Expenses & Claims',
      path: '/erp/expenses',
      icon: Receipt,
      badge: 'Claims & Payouts',
      desc: 'Multi-form claims, tour advances & batches'
    },
    {
      name: 'Admin & Compliance',
      path: '/erp/admin',
      icon: ShieldCheck,
      badge: 'Governance',
      desc: 'RBAC & security audit logs'
    }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-blue-100 overflow-hidden mb-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-950 text-white p-5 sm:p-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-1">
              <Box className="w-4 h-4 text-blue-400" />
              <span>Core ERP Operations Suite</span>
              <span>•</span>
              <span className="flex items-center text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1.5"></span>
                Audit Logging Enabled
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center">
              ERP Operations
              <span className="ml-3 text-xs bg-blue-500/30 text-blue-200 border border-blue-400/30 px-2.5 py-1 rounded-full font-medium">
                Enterprise Core
              </span>
            </h1>
            <p className="text-blue-200/80 text-sm mt-1 max-w-2xl">
              Centralized orchestration for supply chain inventory, multi-phase project execution, physical asset lifecycle, and governance controls.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/erp/admin"
              className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-xs font-semibold text-emerald-200 border border-emerald-400/40 transition-all flex items-center shadow-xs"
              title="Click to Switch Company Entity or Configure Multi-Company"
            >
              <Building2 className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
              <span>Co: Antigravity Global (HQ)</span>
              <span className="ml-1.5 text-[10px] bg-emerald-400/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono">29AAACT2727Q1ZB</span>
            </Link>
            <span className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md text-xs font-medium text-white border border-white/15 flex items-center">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
              ISO 27001 Compliant
            </span>
            <Link
              to="/erp/finance"
              className="px-3.5 py-1.5 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 text-xs font-semibold text-blue-100 border border-blue-400/40 transition-all flex items-center shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-300" />
              Finance Ledger
            </Link>
          </div>
        </div>
      </div>

      {/* Horizontal Tab Navigation */}
      <div className="px-3 py-2 bg-blue-50/50 border-b border-blue-100 flex items-center gap-2 overflow-x-auto scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap group ${
                isActive
                  ? 'bg-blue-700 text-white shadow-md shadow-blue-600/25 font-semibold'
                  : 'bg-white hover:bg-blue-100/70 text-slate-700 border border-slate-200/70 hover:border-blue-300'
              }`}
            >
              <div
                className={`p-1.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-blue-100 text-blue-700 group-hover:bg-blue-200'
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
                    isActive ? 'text-blue-200' : 'text-slate-400'
                  }`}
                >
                  {item.desc}
                </span>
              </div>
              <ChevronRight
                className={`w-3.5 h-3.5 ml-1 transition-transform ${
                  isActive
                    ? 'text-blue-200 translate-x-0.5'
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
