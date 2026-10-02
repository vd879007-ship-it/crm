import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Clock, 
  DollarSign, 
  Target, 
  ArrowUpRight, 
  UserCheck, 
  Calendar, 
  Award,
  Sparkles,
  ShieldCheck,
  BellRing,
  FileCheck2
} from 'lucide-react';
import HEMNavigation from '../../components/HEMNavigation';

export default function HEMDashboard() {
  const [stats, setStats] = useState({ 
    employees: 0, 
    attendance: 0, 
    payroll: 0, 
    reviews: 0,
    onboarding: 0,
    alerts: 0,
    policies: 0
  });

  useEffect(() => {
    Promise.all([
      axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hem/employees`).catch(() => ({ data: [] })),
      axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hem/attendance`).catch(() => ({ data: [] })),
      axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hem/payroll`).catch(() => ({ data: [] })),
      axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hem/performance`).catch(() => ({ data: [] })),
      axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hem/onboarding`).catch(() => ({ data: [] })),
      axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hem/alerts`).catch(() => ({ data: [] })),
      axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hem/policies`).catch(() => ({ data: [] })),
    ]).then(([empRes, attRes, payRes, perfRes, onbRes, altRes, polRes]) => {
      setStats({
        employees: (empRes.data || []).length,
        attendance: (attRes.data || []).length,
        payroll: (payRes.data || []).length,
        reviews: (perfRes.data || []).length,
        onboarding: (onbRes.data || []).length,
        alerts: (altRes.data || []).filter((a: any) => a.status === 'Active').length,
        policies: (polRes.data || []).length
      });
    }).catch(console.error);
  }, []);

  const hemModules = [
    {
      title: 'Digital Onboarding',
      desc: 'Paperless welcome packets, document verification vault & digital e-signatures',
      icon: UserCheck,
      href: '/hem/onboarding',
      badge: `${stats.onboarding} In-Flight`,
      color: 'from-teal-600 to-emerald-700',
      actionText: 'Onboarding Pipeline'
    },
    {
      title: 'Alerts & Reminders',
      desc: 'Smart notifications for doc expiry, probation reviews, and staff broadcasts',
      icon: BellRing,
      href: '/hem/alerts',
      badge: `${stats.alerts} Active`,
      color: 'from-amber-500 to-orange-600',
      actionText: 'Notifications Hub'
    },
    {
      title: 'Policies & Compliance',
      desc: 'Published handbooks, version history, mandatory digital signoffs & audit',
      icon: FileCheck2,
      href: '/hem/policies',
      badge: `${stats.policies} Published`,
      color: 'from-indigo-600 to-violet-700',
      actionText: 'Policy Repository'
    },
    {
      title: 'Employee Database',
      desc: 'Centralized staff records, compensation details, skills & emergency contacts',
      icon: Users,
      href: '/hem/employees',
      badge: `${stats.employees} Registered`,
      color: 'from-blue-600 to-indigo-600',
      actionText: 'View Staff Directory'
    },
    {
      title: 'Attendance & Shifts',
      desc: 'Real-time clock-in logs, work hours calculation, and shift allocations',
      icon: Clock,
      href: '/hem/attendance',
      badge: `${stats.attendance} Logs`,
      color: 'from-teal-600 to-emerald-600',
      actionText: 'Inspect Attendance'
    },
    {
      title: 'Payroll & Leave',
      desc: 'Salary disbursements, deductions, bonuses, and leave approval workflows',
      icon: DollarSign,
      href: '/hem/payroll',
      badge: `${stats.payroll} Slips`,
      color: 'from-amber-500 to-orange-600',
      actionText: 'Process Payroll'
    },
    {
      title: 'Performance Reviews',
      desc: 'Quarterly review cycles, ratings, goal tracking, and promotion paths',
      icon: Target,
      href: '/hem/performance',
      badge: `${stats.reviews} Cycles`,
      color: 'from-purple-600 to-violet-600',
      actionText: 'Manage Appraisals'
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top HEM In-Module Navigation Bar */}
      <HEMNavigation />

      {/* Row 1: Core Digital Workforce & Compliance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link 
          to="/hem/onboarding"
          className="group bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs hover:border-teal-500/50 hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Digital Onboarding</span>
            <div className="p-2.5 bg-teal-50 text-teal-600 rounded-xl group-hover:bg-teal-600 group-hover:text-white transition-colors">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <h3 className="text-3xl font-extrabold text-teal-700">{stats.onboarding}</h3>
            <span className="text-xs font-bold text-teal-600 flex items-center group-hover:translate-x-0.5 transition-transform">
              Onboarding →
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Paperless welcome & doc verification</p>
        </Link>

        <Link 
          to="/hem/alerts"
          className="group bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs hover:border-amber-500/50 hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Alerts & Reminders</span>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <BellRing className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <h3 className="text-3xl font-extrabold text-amber-600">{stats.alerts}</h3>
            <span className="text-xs font-bold text-amber-600 flex items-center group-hover:translate-x-0.5 transition-transform">
              Alerts Hub →
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Expiries, probations & broadcasts</p>
        </Link>

        <Link 
          to="/hem/policies"
          className="group bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs hover:border-indigo-500/50 hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Policy Compliance</span>
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <h3 className="text-3xl font-extrabold text-indigo-600">{stats.policies}</h3>
            <span className="text-xs font-bold text-indigo-600 flex items-center group-hover:translate-x-0.5 transition-transform">
              Policies →
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Published handbooks & e-signoffs</p>
        </Link>

        <Link 
          to="/hem/employees"
          className="group bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs hover:border-blue-500/50 hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Staff</span>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <h3 className="text-3xl font-extrabold text-gray-900">{stats.employees}</h3>
            <span className="text-xs font-bold text-blue-600 flex items-center group-hover:translate-x-0.5 transition-transform">
              Directory →
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Active full-time & contract staff</p>
        </Link>
      </div>

      {/* Row 2: Attendance, Payroll, Appraisals */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link 
          to="/hem/attendance"
          className="group bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs hover:border-teal-500/50 hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Attendance Logs</span>
            <div className="p-2.5 bg-teal-50 text-teal-600 rounded-xl group-hover:bg-teal-600 group-hover:text-white transition-colors">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <h3 className="text-2xl font-extrabold text-gray-900">{stats.attendance}</h3>
            <span className="text-xs font-bold text-teal-600 flex items-center group-hover:translate-x-0.5 transition-transform">
              Timesheets →
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Clock-in & shift verifications</p>
        </Link>

        <Link 
          to="/hem/payroll"
          className="group bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs hover:border-amber-500/50 hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Payroll Records</span>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <h3 className="text-2xl font-extrabold text-gray-900">{stats.payroll}</h3>
            <span className="text-xs font-bold text-amber-600 flex items-center group-hover:translate-x-0.5 transition-transform">
              Disbursements →
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Monthly wage disbursements</p>
        </Link>

        <Link 
          to="/hem/performance"
          className="group bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs hover:border-purple-500/50 hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Appraisals & Reviews</span>
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <h3 className="text-2xl font-extrabold text-gray-900">{stats.reviews}</h3>
            <span className="text-xs font-bold text-purple-600 flex items-center group-hover:translate-x-0.5 transition-transform">
              Appraisals →
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Goal ratings & appraisals</p>
        </Link>
      </div>

      {/* HEM Operations Hub */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">HEM Operations Hub</h3>
            <p className="text-xs text-gray-500">Direct navigation across people operations & workforce tools</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {hemModules.map((item) => (
            <Link
              key={item.title}
              to={item.href}
              className="group bg-white rounded-xl p-5 border border-gray-200 hover:border-teal-500/50 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-xl text-white bg-gradient-to-br ${item.color} shadow-xs`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-gray-500 bg-gray-100 group-hover:bg-teal-50 group-hover:text-teal-700 px-2 py-0.5 rounded-full transition-colors">
                    {item.badge}
                  </span>
                </div>
                <h4 className="font-bold text-gray-900 group-hover:text-teal-700 transition-colors text-base">
                  {item.title}
                </h4>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  {item.desc}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-teal-600">
                <span>{item.actionText}</span>
                <ArrowUpRight className="w-4 h-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
