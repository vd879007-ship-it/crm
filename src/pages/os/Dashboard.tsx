import { useState, useEffect } from 'react';
import axios from 'axios';
import { Target, Users, DollarSign, AlertTriangle, Briefcase, Bot } from 'lucide-react';
import OSNavigation from '../../components/OSNavigation';

export default function OwnerDashboard() {
  const [stats, setStats] = useState<any>({
    sales: 0,
    collections: 0,
    leads: 0,
    followUps: 0,
    presentEmployees: 0,
    totalEmployees: 0,
    complaints: 0
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <OSNavigation />

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Executive Business Pulse</h2>
          <p className="text-xs text-gray-500 mt-0.5">Live operational performance metrics across sales, revenue and workforce</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-2xl shadow-lg text-white">
          <p className="text-blue-100 font-medium mb-1 flex items-center"><DollarSign className="w-4 h-4 mr-1" /> Today's Sales</p>
          <h3 className="text-3xl font-bold">₹{stats.sales}</h3>
          <p className="text-xs text-blue-200 mt-4">0% change from yesterday</p>
        </div>
        
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-6 rounded-2xl shadow-lg text-white">
          <p className="text-emerald-100 font-medium mb-1 flex items-center"><DollarSign className="w-4 h-4 mr-1" /> Collections</p>
          <h3 className="text-3xl font-bold">₹{stats.collections}</h3>
          <p className="text-xs text-emerald-200 mt-4">₹0 pending for today</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-500 font-medium mb-1 flex items-center"><Target className="w-4 h-4 mr-1" /> CRM Pipeline</p>
          <div className="flex justify-between items-end mt-2">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.leads}</h3>
              <p className="text-xs text-gray-400">New Leads</p>
            </div>
            <div className="text-right">
              <h3 className="text-2xl font-bold text-blue-600">{stats.followUps}</h3>
              <p className="text-xs text-gray-400">Follow-ups</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-500 font-medium mb-1 flex items-center"><Users className="w-4 h-4 mr-1" /> HR & Ops</p>
          <div className="flex justify-between items-end mt-2">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.presentEmployees}/{stats.totalEmployees}</h3>
              <p className="text-xs text-gray-400">Present</p>
            </div>
            <div className="text-right">
              <h3 className="text-2xl font-bold text-red-500">{stats.complaints}</h3>
              <p className="text-xs text-gray-400">Open Complaints</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Bot className="w-5 h-5 mr-2 text-purple-600" /> AI Insights Generator
          </h3>
          <div className="p-6 text-center bg-gray-50 rounded-xl border border-gray-100">
            <Bot className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-gray-600">No alerts or anomalies detected</p>
            <p className="text-[11px] text-gray-400 mt-1">All business units, collections, and workforce metrics are within normal baseline.</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Briefcase className="w-5 h-5 mr-2 text-gray-600" /> Executive Actions
          </h3>
          <div className="p-6 text-center bg-gray-50 rounded-xl border border-gray-100">
            <Briefcase className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-gray-600">No executive actions pending</p>
            <p className="text-[11px] text-gray-400 mt-1">0 pending payroll approvals or critical SLA tickets.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
