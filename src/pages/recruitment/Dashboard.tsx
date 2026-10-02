import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { 
  Briefcase, FileSpreadsheet, Compass, FileCheck, Mail, 
  ShieldCheck, Award, GitBranch, BarChart3, Users, 
  ArrowUpRight, Clock, Plus, CheckCircle2, AlertCircle, 
  Sparkles, TrendingUp, DollarSign, Calendar
} from 'lucide-react';

export default function RecruitmentDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/recruitment/analytics`);
      setData(res.data);
    } catch (err) {
      console.error(err);
      setData({
        summary: {
          openRequisitions: 0,
          totalCandidates: 0,
          inPipeline: 0,
          offersExtended: 0,
          offersAccepted: 0,
          timeToHireAvgDays: 0,
          offerAcceptanceRate: 0,
          fillRatePercentage: 0
        },
        funnel: [
          { stage: 'Sourced', count: 0, conversion: 0 },
          { stage: 'Applied', count: 0, conversion: 0 },
          { stage: 'Screened', count: 0, conversion: 0 },
          { stage: 'Interviews', count: 0, conversion: 0 },
          { stage: 'Background Screening', count: 0, conversion: 0 },
          { stage: 'Offers Extended', count: 0, conversion: 0 },
          { stage: 'Hired & Onboarded', count: 0, conversion: 0 }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const quickNav = [
    { title: 'Job Requisitions', desc: 'Manage open headcounts & requisition approvals', icon: FileSpreadsheet, href: '/recruitment/requisitions', color: 'from-blue-600 to-indigo-600', badge: `${data?.summary?.openRequisitions ?? 0} Active` },
    { title: 'Candidate Sourcing', desc: 'Campaigns across LinkedIn, Indeed & Referrals', icon: Compass, href: '/recruitment/sourcing', color: 'from-emerald-600 to-teal-600', badge: 'Multi-Channel' },
    { title: 'Resume Management', desc: 'ATS parser, smart filtering & skill matching', icon: FileCheck, href: '/recruitment/resumes', color: 'from-purple-600 to-violet-600', badge: 'ATS AI' },
    { title: 'Candidate Comms', desc: 'Interview scheduling & standardized templates', icon: Mail, href: '/recruitment/communications', color: 'from-amber-500 to-orange-600', badge: 'Templates' },
    { title: 'Background Screening', desc: 'Verify identity, employment, education & criminal', icon: ShieldCheck, href: '/recruitment/screening', color: 'from-rose-600 to-red-600', badge: 'Compliance' },
    { title: 'Offer Letters', desc: 'Compensation breakdown & digital e-signatures', icon: Award, href: '/recruitment/offers', color: 'from-cyan-600 to-blue-600', badge: 'DocuSign' },
    { title: 'Hiring Workflow', desc: 'Interactive ATS Kanban pipeline stage manager', icon: GitBranch, href: '/recruitment/workflow', color: 'from-fuchsia-600 to-pink-600', badge: 'Pipeline Board' },
    { title: 'Advanced Analytics', desc: 'Time-to-hire, channel ROI & conversion funnels', icon: BarChart3, href: '/recruitment/analytics', color: 'from-slate-700 to-slate-900', badge: 'BI Metrics' }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-3 py-1 rounded-full mb-3 border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Full-Cycle Enterprise Recruitment Platform</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Recruitment & Talent Operations</h1>
            <p className="text-emerald-100/80 text-sm sm:text-base mt-2 max-w-2xl">
              End-to-end talent lifecycle: from job requisition approvals and multi-channel sourcing to resume ATS parsing, interview coordination, background checks, and offer e-signatures.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/recruitment/requisitions"
              className="bg-white text-emerald-900 hover:bg-emerald-50 px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm flex items-center transition-all"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              New Requisition
            </Link>
            <Link
              to="/recruitment/workflow"
              className="bg-emerald-600/60 hover:bg-emerald-600 text-white border border-emerald-400/30 px-4 py-2.5 rounded-xl font-bold text-sm flex items-center transition-all"
            >
              <GitBranch className="w-4 h-4 mr-1.5" />
              View ATS Pipeline
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Open Requisitions</span>
            <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <FileSpreadsheet className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-gray-900">{data?.summary?.openRequisitions ?? 0}</span>
            <span className="text-xs font-semibold text-gray-400">
              0 urgent
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Across departments</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Active Talent Pool</span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-gray-900">{data?.summary?.inPipeline ?? 0}</span>
            <span className="text-xs font-semibold text-blue-600">Sourced & Applied</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">0 candidates this week</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Time-to-Hire</span>
            <span className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-gray-900">{data?.summary?.timeToHireAvgDays ?? 0}d</span>
            <span className="text-xs font-semibold text-gray-400">0d average</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Benchmark: 36 days</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Offer Acceptance</span>
            <span className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Award className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-gray-900">{data?.summary?.offerAcceptanceRate ?? 0}%</span>
            <span className="text-xs font-semibold text-gray-400">0 signed</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">0 signed / 0 sent</p>
        </div>
      </div>

      {/* Recruitment Modules Hub */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Recruitment Operations Hub</h2>
            <p className="text-xs text-gray-500">Select any dedicated capability below to manage recruitment flows</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickNav.map((item) => (
            <Link
              key={item.title}
              to={item.href}
              className="group bg-white rounded-xl p-5 border border-gray-200 hover:border-emerald-500/50 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-xl text-white bg-gradient-to-br ${item.color} shadow-xs`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-gray-500 bg-gray-100 group-hover:bg-emerald-50 group-hover:text-emerald-700 px-2 py-0.5 rounded-full transition-colors">
                    {item.badge}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 group-hover:text-emerald-700 transition-colors text-base">
                  {item.title}
                </h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  {item.desc}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-emerald-600">
                <span>Open module</span>
                <ArrowUpRight className="w-4 h-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Pipeline Funnel & Urgent Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual Hiring Funnel */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-bold text-gray-900 text-base">Hiring Pipeline Conversion Funnel</h3>
              <p className="text-xs text-gray-500">Candidate flow through recruitment stages</p>
            </div>
            <Link to="/recruitment/analytics" className="text-xs font-semibold text-emerald-600 hover:underline">
              Full Analytics →
            </Link>
          </div>

          <div className="space-y-3.5">
            {data?.funnel?.map((step: any, idx: number) => {
              const maxCount = Math.max(1, data.funnel[0]?.count || 1);
              const widthPct = step.count > 0 ? Math.max(12, Math.round((step.count / maxCount) * 100)) : 0;
              return (
                <div key={step.stage}>
                  <div className="flex justify-between text-xs mb-1 font-medium">
                    <span className="text-gray-700 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      {step.stage}
                    </span>
                    <span className="text-gray-500 font-semibold">
                      {step.count} candidates <span className="text-gray-400">({step.conversion}% pass)</span>
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className={`h-2.5 rounded-full transition-all duration-500 ${
                        idx === 0 ? 'bg-blue-500' :
                        idx === 1 ? 'bg-indigo-500' :
                        idx === 2 ? 'bg-purple-500' :
                        idx === 3 ? 'bg-amber-500' :
                        idx === 4 ? 'bg-rose-500' :
                        idx === 5 ? 'bg-cyan-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Activity & Alerts */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 text-base">Urgent Requisitions</h3>
              <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                0 Active
              </span>
            </div>

            <div className="p-8 text-center bg-gray-50/70 rounded-xl border border-gray-100">
              <CheckCircle2 className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-gray-600">No urgent requisitions</p>
              <p className="text-[11px] text-gray-400 mt-1">0 open requisitions currently pending.</p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100">
            <Link
              to="/recruitment/requisitions"
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center justify-center gap-1 w-full py-2 bg-emerald-50 hover:bg-emerald-100/70 rounded-lg transition-colors"
            >
              <span>Manage All Requisitions</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
