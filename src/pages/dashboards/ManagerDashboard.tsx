import { useState } from 'react';
import { Users, Clock, Target, CheckCircle2, AlertCircle } from 'lucide-react';
import RoleNav from '../../components/RoleNav';

export default function ManagerDashboard() {
  const [stats] = useState({
    teamSize: 0,
    presentToday: 0,
    onLeave: 0,
    pendingApprovals: 0,
    avgPerformance: '0/10'
  });

  return (
    <div className="space-y-6">
      <RoleNav />
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Manager Dashboard</h2>
          <p className="text-gray-500 mt-1">Manage your team's operations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500 mb-1 flex items-center"><Users className="w-4 h-4 mr-1" /> Team Size</p>
          <h3 className="text-2xl font-bold text-gray-900">{stats.teamSize}</h3>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500 mb-1 flex items-center"><CheckCircle2 className="w-4 h-4 mr-1 text-green-500" /> Present Today</p>
          <h3 className="text-2xl font-bold text-green-600">{stats.presentToday}</h3>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500 mb-1 flex items-center"><AlertCircle className="w-4 h-4 mr-1 text-orange-500" /> On Leave</p>
          <h3 className="text-2xl font-bold text-orange-600">{stats.onLeave}</h3>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500 mb-1 flex items-center"><Clock className="w-4 h-4 mr-1 text-blue-500" /> Pending Approvals</p>
          <h3 className="text-2xl font-bold text-blue-600">{stats.pendingApprovals}</h3>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500 mb-1 flex items-center"><Target className="w-4 h-4 mr-1 text-purple-500" /> Avg KPI</p>
          <h3 className="text-2xl font-bold text-purple-600">{stats.avgPerformance}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-blue-500" /> Requires Your Approval
          </h3>
          <div className="p-8 text-center bg-gray-50 rounded-xl border border-gray-100">
            <CheckCircle2 className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-gray-500">No approvals pending. All team requests are up to date.</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2 text-purple-500" /> Team Target Progress (Q3)
          </h3>
          <div className="p-8 text-center bg-gray-50 rounded-xl border border-gray-100">
            <Target className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-gray-500">No targets assigned for this cycle yet.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
