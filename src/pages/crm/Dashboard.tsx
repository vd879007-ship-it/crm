import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  MessageSquare, 
  ArrowUpRight, 
  UserSquare2, 
  Receipt, 
  PhoneCall, 
  Sparkles,
  LifeBuoy,
  BadgeDollarSign,
  Target,
  PhoneForwarded,
  Layers,
  Award,
  Megaphone,
  CheckCircle2,
  Clock
} from 'lucide-react';
import CRMNavigation from '../../components/CRMNavigation';

export default function CRMDashboard() {
  const [stats, setStats] = useState({
    leads: 0,
    customers: 0,
    sales: 0,
    comms: 0,
    tickets: 0,
    deals: 0,
    quotes: 0,
    goals: 0,
    campaigns: 0,
    calls: 0
  });
  const [leadsByStatus, setLeadsByStatus] = useState<Record<string, number>>({});

  useEffect(() => {
    Promise.all([
      axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/crm/leads`).catch(() => ({ data: [] })),
      axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/crm/customers`).catch(() => ({ data: [] })),
      axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/crm/sales`).catch(() => ({ data: [] })),
      axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/crm/communications`).catch(() => ({ data: [] })),
      axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/crm/tickets`).catch(() => ({ data: [] })),
      axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/crm/deals`).catch(() => ({ data: [] })),
      axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/crm/quotes`).catch(() => ({ data: [] })),
      axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/crm/goals`).catch(() => ({ data: [] })),
      axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/crm/campaigns`).catch(() => ({ data: [] })),
      axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/crm/telephony/calls`).catch(() => ({ data: [] })),
    ]).then(([leadsRes, custRes, salesRes, commsRes, ticketsRes, dealsRes, quotesRes, goalsRes, campaignsRes, callsRes]) => {
      const leads = leadsRes.data || [];
      const statusCounts: Record<string, number> = {};
      leads.forEach((l: any) => {
        statusCounts[l.status] = (statusCounts[l.status] || 0) + 1;
      });
      setLeadsByStatus(statusCounts);

      setStats({
        leads: leads.length,
        customers: (custRes.data || []).length,
        sales: (salesRes.data || []).reduce((acc: number, doc: any) => acc + (doc.totalAmount || 0), 0),
        comms: (commsRes.data || []).length,
        tickets: (ticketsRes.data || []).length,
        deals: (dealsRes.data || []).length,
        quotes: (quotesRes.data || []).length,
        goals: (goalsRes.data || []).length,
        campaigns: (campaignsRes.data || []).length,
        calls: (callsRes.data || []).length
      });
    }).catch(console.error);
  }, []);

  const crmModules = [
    {
      title: 'Leads & Contacts',
      desc: 'Visual Kanban stage tracking, contact directory, source attribution & scoring',
      icon: Users,
      href: '/crm/leads',
      badge: `${stats.leads} Leads`,
      color: 'from-blue-600 to-indigo-600',
      actionText: 'View Pipeline'
    },
    {
      title: 'Customer Directory',
      desc: 'Corporate client accounts, billing addresses, credit terms & key contacts',
      icon: UserSquare2,
      href: '/crm/customers',
      badge: `${stats.customers} Accounts`,
      color: 'from-emerald-600 to-teal-600',
      actionText: 'Open Client Directory'
    },
    {
      title: 'Ticket Manager',
      desc: 'Enterprise support desk, SLA resolution countdown, priority and ticket queues',
      icon: LifeBuoy,
      href: '/crm/tickets',
      badge: `${stats.tickets} Tickets`,
      color: 'from-purple-600 to-violet-600',
      actionText: 'Support Helpdesk'
    },
    {
      title: 'Deals & Quotes',
      desc: 'Opportunity pipeline, probability weighting, quote generator and print PDF',
      icon: BadgeDollarSign,
      href: '/crm/deals',
      badge: `${stats.deals} Deals`,
      color: 'from-amber-500 to-orange-600',
      actionText: 'Manage Proposals'
    },
    {
      title: 'Goals & Campaigns',
      desc: 'Sales target quotas, rep attainment benchmarks and marketing campaign ROI',
      icon: Target,
      href: '/crm/campaigns',
      badge: `${stats.campaigns} Campaigns`,
      color: 'from-pink-600 to-rose-600',
      actionText: 'Quotas & Ads'
    },
    {
      title: 'Cloud Telephony & Recordings',
      desc: 'Browser softphone dialer, call recording playback, audio waveforms & AI speech transcripts',
      icon: PhoneForwarded,
      href: '/crm/telephony',
      badge: `${stats.calls} Calls`,
      color: 'from-indigo-600 to-blue-700',
      actionText: 'Open Softphone'
    },
    {
      title: 'Sales & Invoices',
      desc: 'Create sales orders, tax invoices, track receipts and payment collections',
      icon: Receipt,
      href: '/crm/sales',
      badge: `₹${stats.sales.toLocaleString()}`,
      color: 'from-cyan-600 to-blue-600',
      actionText: 'Invoicing Suite'
    },
    {
      title: 'Communications Log',
      desc: 'Unified omnichannel interactions across WhatsApp, Email & Phone logs',
      icon: PhoneCall,
      href: '/crm/communications',
      badge: `${stats.comms} Logged`,
      color: 'from-slate-700 to-gray-900',
      actionText: 'Outreach History'
    }
  ];

  const pipelineStages = ['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top CRM In-Module Navigation Bar */}
      <CRMNavigation />

      {/* Interactive Metric Cards Linking to Sections */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link 
          to="/crm/leads"
          className="group bg-white p-5 rounded-xl border border-gray-200/80 shadow-xs hover:border-blue-500/50 hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Leads</span>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <h3 className="text-3xl font-extrabold text-gray-900">{stats.leads}</h3>
            <span className="text-xs font-bold text-blue-600 flex items-center group-hover:translate-x-0.5 transition-transform">
              Pipeline →
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Active prospective clients</p>
        </Link>

        <Link 
          to="/crm/tickets"
          className="group bg-white p-5 rounded-xl border border-gray-200/80 shadow-xs hover:border-purple-500/50 hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Support Desk</span>
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <LifeBuoy className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <h3 className="text-3xl font-extrabold text-purple-700">{stats.tickets}</h3>
            <span className="text-xs font-bold text-purple-600 flex items-center group-hover:translate-x-0.5 transition-transform">
              Tickets →
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Customer SLA inquiries</p>
        </Link>

        <Link 
          to="/crm/deals"
          className="group bg-white p-5 rounded-xl border border-gray-200/80 shadow-xs hover:border-amber-500/50 hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Deals & Quotes</span>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <BadgeDollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <h3 className="text-3xl font-extrabold text-gray-900">{stats.deals} Deals</h3>
            <span className="text-xs font-bold text-amber-600 flex items-center group-hover:translate-x-0.5 transition-transform">
              Forecast →
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">{stats.quotes} Issued quotations</p>
        </Link>

        <Link 
          to="/crm/telephony"
          className="group bg-white p-5 rounded-xl border border-gray-200/80 shadow-xs hover:border-indigo-500/50 hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Telephony & Calls</span>
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <PhoneForwarded className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <h3 className="text-3xl font-extrabold text-gray-900">{stats.calls}</h3>
            <span className="text-xs font-bold text-indigo-600 flex items-center group-hover:translate-x-0.5 transition-transform">
              Softphone →
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Recordings & transcripts</p>
        </Link>
      </div>

      {/* CRM Operations Hub - Grid of all 8 core modules */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">CRM Operations Hub</h3>
            <p className="text-xs text-gray-500">Instant navigation to core CRM tools, support, and telephony pipelines</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {crmModules.map((item) => (
            <Link
              key={item.title}
              to={item.href}
              className="group bg-white rounded-xl p-5 border border-gray-200 hover:border-purple-500/50 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-xl text-white bg-gradient-to-br ${item.color} shadow-xs`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-gray-500 bg-gray-100 group-hover:bg-purple-50 group-hover:text-purple-700 px-2 py-0.5 rounded-full transition-colors">
                    {item.badge}
                  </span>
                </div>
                <h4 className="font-bold text-gray-900 group-hover:text-purple-700 transition-colors text-base">
                  {item.title}
                </h4>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  {item.desc}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-purple-600">
                <span>{item.actionText}</span>
                <ArrowUpRight className="w-4 h-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Lead Pipeline Stage Distribution */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-2">
          <div>
            <h4 className="font-bold text-gray-900 text-base">Pipeline Stage Velocity</h4>
            <p className="text-xs text-gray-500">Distribution of leads across Kanban lifecycle stages</p>
          </div>
          <Link
            to="/crm/leads"
            className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Open Kanban Board</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mt-4">
          {pipelineStages.map((stage) => {
            const count = leadsByStatus[stage] || 0;
            return (
              <Link
                key={stage}
                to="/crm/leads"
                className="p-3 bg-gray-50 hover:bg-purple-50/60 rounded-xl border border-gray-200/80 transition-colors text-center group"
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 group-hover:text-purple-700 block">
                  {stage}
                </span>
                <span className="text-xl font-extrabold text-gray-900 group-hover:text-purple-700 mt-1 block">
                  {count}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
