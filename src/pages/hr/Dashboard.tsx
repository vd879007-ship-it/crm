import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
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
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Award,
  FileCheck,
  Send
} from 'lucide-react';
import HRNavigation from '../../components/HRNavigation';

export default function HRDashboard() {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeDocuments: 0,
    announcements: 0,
    activeSurveys: 0,
    totalKudos: 0,
    labourLawReports: 0,
    lettersGenerated: 0,
    formSubmissions: 0
  });

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hr/overview-stats`);
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch HR stats:', err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const hrModules = [
    {
      title: 'Employee Information Management',
      desc: 'Centralized master employee directory, KYC, statutory IDs, banking & emergency profiles',
      icon: Users,
      href: '/hr/employee-info',
      badge: `${stats.totalEmployees} Profiles`,
      color: 'from-blue-600 to-indigo-600',
      actionText: 'Manage Employee DB'
    },
    {
      title: 'Document Management & Vault',
      desc: 'Secured digital repository for contracts, educational proofs, KYC & expiry tracking',
      icon: FolderLock,
      href: '/hr/documents',
      badge: `${stats.activeDocuments} Documents`,
      color: 'from-teal-600 to-emerald-600',
      actionText: 'Inspect Document Vault'
    },
    {
      title: 'Employee Communication',
      desc: 'Company circulars, executive townhall bulletins, multi-channel announcements & alerts',
      icon: Megaphone,
      href: '/hr/communication',
      badge: `${stats.announcements} Bulletins`,
      color: 'from-amber-500 to-orange-600',
      actionText: 'Broadcast Notices'
    },
    {
      title: 'Employee Engagement & Kudos',
      desc: 'Workplace pulse surveys, peer recognition, rewards, milestone celebrations & eNPS',
      icon: HeartHandshake,
      href: '/hr/engagement',
      badge: `${stats.totalKudos} Kudos Shared`,
      color: 'from-rose-500 to-pink-600',
      actionText: 'View Engagement'
    },
    {
      title: 'HR Reports & Analytics',
      desc: 'Headcount trends, attrition rates, diversity metrics, tenure curves & compensation reports',
      icon: BarChart3,
      href: '/hr/reports',
      badge: 'Full Analytics',
      color: 'from-purple-600 to-violet-600',
      actionText: 'Generate Analytics'
    },
    {
      title: 'Extensive Labour & Law Reports',
      desc: 'Statutory compliance filings: PF (ECR), ESIC Form 6, Gratuity, Minimum Wages & POSH',
      icon: Scale,
      href: '/hr/labour-law-reports',
      badge: `${stats.labourLawReports} Filings`,
      color: 'from-emerald-700 to-slate-900',
      actionText: 'Statutory Filings'
    },
    {
      title: 'Letter & Mail Merge',
      desc: 'Automated template generator for Offer, Confirmation, Increment & Relieving letters',
      icon: Mail,
      href: '/hr/letters-mail-merge',
      badge: `${stats.lettersGenerated} Dispatched`,
      color: 'from-indigo-600 to-blue-700',
      actionText: 'Launch Mail Merge'
    },
    {
      title: 'Company Policies & Forms',
      desc: 'Standardized digital HR forms (Form 12BB, Travel Expense, NOC, Exit Clearance) & policies',
      icon: FileSpreadsheet,
      href: '/hr/policies-forms',
      badge: `${stats.formSubmissions} Submissions`,
      color: 'from-cyan-600 to-blue-600',
      actionText: 'Access Standard Forms'
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top HR Navigation Bar */}
      <HRNavigation />

      {/* Hero Executive Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-blue-50 text-blue-700 rounded-lg">
              <Building2 className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">Enterprise People Governance</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Core HR Operations & Intelligence Hub</h1>
          <p className="text-sm text-gray-500 mt-1 max-w-2xl">
            Unified human resources command center integrating employee master records, document archives, broadcasts, employee engagement, labour law statutory compliance, and mail merge generation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/hr/employee-info"
            className="px-3.5 py-2 text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-xl transition-colors flex items-center gap-1.5 border border-blue-200"
          >
            <Plus className="w-4 h-4" />
            <span>Add Employee Profile</span>
          </Link>
          <Link
            to="/hr/letters-mail-merge"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-2"
          >
            <Mail className="w-4 h-4" />
            <span>Dispatch HR Letter</span>
          </Link>
        </div>
      </div>

      {/* Row 1 Metric Cards: Primary Operations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link 
          to="/hr/employee-info"
          className="group bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs hover:border-blue-500/50 hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee Information</span>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <h3 className="text-3xl font-extrabold text-gray-900">{stats.totalEmployees}</h3>
            <span className="text-xs font-bold text-blue-600 flex items-center group-hover:translate-x-0.5 transition-transform">
              Profiles →
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Master biographical & official records</p>
        </Link>

        <Link 
          to="/hr/documents"
          className="group bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs hover:border-teal-500/50 hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Document Management</span>
            <div className="p-2.5 bg-teal-50 text-teal-600 rounded-xl group-hover:bg-teal-600 group-hover:text-white transition-colors">
              <FolderLock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <h3 className="text-3xl font-extrabold text-teal-700">{stats.activeDocuments}</h3>
            <span className="text-xs font-bold text-teal-600 flex items-center group-hover:translate-x-0.5 transition-transform">
              Vault →
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">KYC, credentials & contracts</p>
        </Link>

        <Link 
          to="/hr/labour-law-reports"
          className="group bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs hover:border-emerald-500/50 hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Labour Law Compliance</span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Scale className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <h3 className="text-3xl font-extrabold text-emerald-700">{stats.labourLawReports}</h3>
            <span className="text-xs font-bold text-emerald-600 flex items-center group-hover:translate-x-0.5 transition-transform">
              Statutory →
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">PF, ESIC, Gratuity & POSH filings</p>
        </Link>

        <Link 
          to="/hr/letters-mail-merge"
          className="group bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs hover:border-indigo-500/50 hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Letters & Mail Merge</span>
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Mail className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <h3 className="text-3xl font-extrabold text-indigo-700">{stats.lettersGenerated}</h3>
            <span className="text-xs font-bold text-indigo-600 flex items-center group-hover:translate-x-0.5 transition-transform">
              Mail Merge →
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Offers, increments & certificates</p>
        </Link>
      </div>

      {/* Row 2 Metric Cards: Engagement & Communication */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link 
          to="/hr/communication"
          className="group bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs hover:border-amber-500/50 hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Communication & Bulletins</span>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Megaphone className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <h3 className="text-3xl font-extrabold text-amber-600">{stats.announcements}</h3>
            <span className="text-xs font-bold text-amber-600 flex items-center group-hover:translate-x-0.5 transition-transform">
              Bulletins →
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Broadcast notices & townhalls</p>
        </Link>

        <Link 
          to="/hr/engagement"
          className="group bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs hover:border-rose-500/50 hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee Engagement</span>
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl group-hover:bg-rose-600 group-hover:text-white transition-colors">
              <HeartHandshake className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <h3 className="text-3xl font-extrabold text-rose-600">{stats.totalKudos}</h3>
            <span className="text-xs font-bold text-rose-600 flex items-center group-hover:translate-x-0.5 transition-transform">
              Kudos & Surveys →
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Peer recognition & culture pulse</p>
        </Link>

        <Link 
          to="/hr/reports"
          className="group bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs hover:border-purple-500/50 hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">HR Analytics Reports</span>
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <BarChart3 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <h3 className="text-3xl font-extrabold text-purple-600">8+</h3>
            <span className="text-xs font-bold text-purple-600 flex items-center group-hover:translate-x-0.5 transition-transform">
              Analytics →
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Headcount, turnover & diversity</p>
        </Link>

        <Link 
          to="/hr/policies-forms"
          className="group bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs hover:border-cyan-500/50 hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Company Forms & Policies</span>
            <div className="p-2.5 bg-cyan-50 text-cyan-600 rounded-xl group-hover:bg-cyan-600 group-hover:text-white transition-colors">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <h3 className="text-3xl font-extrabold text-cyan-700">{stats.formSubmissions}</h3>
            <span className="text-xs font-bold text-cyan-600 flex items-center group-hover:translate-x-0.5 transition-transform">
              Standard Forms →
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Tax, travel, NOC & exit submissions</p>
        </Link>
      </div>

      {/* HR Operations Command Grid */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">HR Suite Modules & Operations</h3>
            <p className="text-xs text-gray-500">Access all 8 functional pillars of human resource governance</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {hrModules.map((item) => (
            <Link
              key={item.title}
              to={item.href}
              className="group bg-white rounded-2xl p-5 border border-gray-200/80 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-xl text-white bg-gradient-to-br ${item.color} shadow-xs`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                    {item.badge}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                  {item.title}
                </h4>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-blue-600 group-hover:text-blue-700">
                <span>{item.actionText}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
