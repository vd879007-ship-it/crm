import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart3, TrendingUp, DollarSign, Clock, Users, 
  Award, Download, Calendar, Filter, Sparkles, ArrowUpRight, 
  ArrowDownRight, CheckCircle2, FileSpreadsheet
} from 'lucide-react';

export default function RecruitmentAnalytics() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('Q3-2026');

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/recruitment/analytics`);
      setAnalytics(res.data);
    } catch (err) {
      console.error(err);
      setAnalytics({
        summary: {
          timeToHireAvgDays: 0,
          costPerHireAvg: 0,
          openRequisitions: 0,
          totalRequisitions: 0,
          totalCandidates: 0,
          inPipeline: 0,
          offersExtended: 0,
          offersAccepted: 0,
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
        ],
        timeToHireByDepartment: [
          { department: 'Engineering', avgDays: 0 },
          { department: 'Sales', avgDays: 0 },
          { department: 'Marketing', avgDays: 0 },
          { department: 'Product', avgDays: 0 },
          { department: 'Finance', avgDays: 0 }
        ],
        channelPerformance: [
          { channel: 'LinkedIn Recruiter', leads: 0, hires: 0, cost: 0, costPerHire: 0, efficiency: 0 },
          { channel: 'Employee Referrals', leads: 0, hires: 0, cost: 0, costPerHire: 0, efficiency: 0 },
          { channel: 'Indeed Sponsored', leads: 0, hires: 0, cost: 0, costPerHire: 0, efficiency: 0 },
          { channel: 'GitHub & Outbound Sourcing', leads: 0, hires: 0, cost: 0, costPerHire: 0, efficiency: 0 },
          { channel: 'Campus & Tech Talks', leads: 0, hires: 0, cost: 0, costPerHire: 0, efficiency: 0 }
        ],
        monthlyHiringVelocity: [
          { month: 'Apr', target: 0, actual: 0 },
          { month: 'May', target: 0, actual: 0 },
          { month: 'Jun', target: 0, actual: 0 },
          { month: 'Jul', target: 0, actual: 0 },
          { month: 'Aug', target: 0, actual: 0 },
          { month: 'Sep', target: 0, actual: 0 }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Metric,Value\n"
      + `Average Time To Hire,${analytics?.summary?.timeToHireAvgDays || 0} days\n`
      + `Average Cost Per Hire,$${analytics?.summary?.costPerHireAvg || 0}\n`
      + `Offer Acceptance Rate,${analytics?.summary?.offerAcceptanceRate || 0}%\n`
      + `Requisition Fill Rate,${analytics?.summary?.fillRatePercentage || 0}%\n`;
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Recruitment_Analytics_${period}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-slate-800" />
            <span>Advanced Recruitment Intelligence & Analytics</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Data-driven talent acquisition metrics, pipeline velocity, cost-per-hire, and channel attribution
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="text-xs font-semibold border border-gray-300 rounded-xl px-3 py-2 bg-white text-gray-700 shadow-xs"
          >
            <option value="Last-30-Days">Last 30 Days</option>
            <option value="Q3-2026">Q3 2026 (Current)</option>
            <option value="Q2-2026">Q2 2026</option>
            <option value="YTD-2026">Full Year 2026 YTD</option>
          </select>

          <button
            onClick={handleExportCSV}
            className="bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV Report
          </button>
        </div>
      </div>

      {/* Primary KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Avg Time-to-Hire</span>
            <span className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-gray-900">
              {analytics?.summary?.timeToHireAvgDays ?? 0}
              <span className="text-sm font-semibold text-gray-500 ml-1">days</span>
            </span>
            <span className="text-xs font-bold text-gray-400 flex items-center">
              0d MoM
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Benchmark: 36 days</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Cost Per Hire</span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-gray-900">
              ${analytics?.summary?.costPerHireAvg?.toLocaleString() ?? '0'}
            </span>
            <span className="text-xs font-bold text-gray-400 flex items-center">
              $0 spent
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Benchmark: $4,400</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Offer Acceptance</span>
            <span className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Award className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-gray-900">
              {analytics?.summary?.offerAcceptanceRate ?? 0}%
            </span>
            <span className="text-xs font-bold text-gray-400 flex items-center">
              0 signed
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Benchmark: 68%</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Requisition Fill Rate</span>
            <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <FileSpreadsheet className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-gray-900">
              {analytics?.summary?.fillRatePercentage ?? 0}%
            </span>
            <span className="text-xs font-bold text-gray-400">0 filled</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Target: 80% on-time</p>
        </div>
      </div>

      {/* Hiring Conversion Funnel & Time to Hire by Department */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visual Conversion Funnel */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h3 className="font-bold text-base text-gray-900">End-to-End Pipeline Funnel</h3>
              <p className="text-xs text-gray-500">Candidate throughput and drop-off per recruitment stage</p>
            </div>
            <span className="text-xs font-mono font-bold text-gray-400">Total Volume: {analytics?.summary?.totalCandidates ?? 0}</span>
          </div>

          <div className="space-y-4">
            {analytics?.funnel?.map((step: any, idx: number) => {
              const maxVal = analytics.funnel[0]?.count || 1;
              const widthPct = step.count > 0 ? Math.max(14, Math.round((step.count / maxVal) * 100)) : 0;
              return (
                <div key={step.stage}>
                  <div className="flex justify-between text-xs mb-1.5 font-medium">
                    <span className="text-gray-800 font-semibold">{step.stage}</span>
                    <span className="text-gray-600">
                      <strong>{step.count}</strong> candidates <span className="text-gray-400 font-normal">({step.conversion}% stage conversion)</span>
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-3 rounded-full transition-all duration-700 ${
                        idx === 0 ? 'bg-blue-600' :
                        idx === 1 ? 'bg-indigo-600' :
                        idx === 2 ? 'bg-purple-600' :
                        idx === 3 ? 'bg-amber-500' :
                        idx === 4 ? 'bg-rose-500' :
                        idx === 5 ? 'bg-cyan-600' : 'bg-emerald-600'
                      }`}
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Time-to-Hire by Department */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h3 className="font-bold text-base text-gray-900">Time-to-Hire by Department</h3>
              <p className="text-xs text-gray-500">Days from requisition approval to candidate signature</p>
            </div>
          </div>

          <div className="space-y-4 mt-2">
            {analytics?.timeToHireByDepartment?.map((dept: any) => {
              const maxDays = 35;
              const barWidth = Math.round((dept.avgDays / maxDays) * 100);
              return (
                <div key={dept.department}>
                  <div className="flex justify-between text-xs mb-1 font-semibold">
                    <span className="text-gray-800">{dept.department}</span>
                    <span className="text-gray-700">{dept.avgDays} Days</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div 
                      className={`h-3 rounded-full ${
                        dept.avgDays > 25 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Monthly Velocity Bar Indicator */}
          <div className="mt-8 pt-5 border-t border-gray-100">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
              Monthly Hiring Velocity (Hires vs Plan)
            </h4>
            <div className="grid grid-cols-6 gap-2 text-center text-xs">
              {analytics?.monthlyHiringVelocity?.map((m: any) => (
                <div key={m.month} className="p-2 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-[11px] font-bold text-gray-400 block">{m.month}</span>
                  <span className="font-extrabold text-sm text-emerald-700 block mt-0.5">{m.actual}</span>
                  <span className="text-[10px] text-gray-400">/ {m.target} plan</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sourcing Channel Performance Matrix Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-base text-gray-900">Sourcing Channel Efficiency Matrix</h3>
            <p className="text-xs text-gray-500">Volume, cost-per-hire, and quality score by talent acquisition source</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50/80 text-gray-500 font-semibold border-b border-gray-200 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Channel Name</th>
                <th className="py-3 px-4 text-center">Candidates Sourced</th>
                <th className="py-3 px-4 text-center">Hires Made</th>
                <th className="py-3 px-4 text-center">Budget Spent</th>
                <th className="py-3 px-4 text-center">Cost Per Hire</th>
                <th className="py-3 px-4 text-right">Quality Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {analytics?.channelPerformance?.map((ch: any) => (
                <tr key={ch.channel} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-gray-900">
                    {ch.channel}
                  </td>
                  <td className="py-3.5 px-4 text-center font-semibold text-gray-700">
                    {ch.leads}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-emerald-700">
                    {ch.hires}
                  </td>
                  <td className="py-3.5 px-4 text-center text-gray-600">
                    ${ch.cost?.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-gray-800">
                    ${ch.costPerHire}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full text-[11px]">
                      {ch.efficiency}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
