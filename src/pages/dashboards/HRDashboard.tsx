import { useState } from 'react';
import { Users, UserPlus, UserMinus, Activity, Heart, ShieldAlert } from 'lucide-react';
import RoleNav from '../../components/RoleNav';

export default function HRDashboard() {
  const [stats] = useState({
    totalEmployees: 0,
    newJoiners: 0,
    exits: 0,
    turnoverRate: '0%',
    complianceAlerts: 0
  });

  return (
    <div className="space-y-6">
      <RoleNav />
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">HR Analytics Dashboard</h2>
          <p className="text-gray-500 mt-1">High-level workforce overview</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500 mb-1 flex items-center"><Users className="w-4 h-4 mr-1" /> Total Staff</p>
          <h3 className="text-2xl font-bold text-gray-900">{stats.totalEmployees}</h3>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500 mb-1 flex items-center"><UserPlus className="w-4 h-4 mr-1 text-green-500" /> New Joiners</p>
          <h3 className="text-2xl font-bold text-green-600">+{stats.newJoiners}</h3>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500 mb-1 flex items-center"><UserMinus className="w-4 h-4 mr-1 text-red-500" /> Exits</p>
          <h3 className="text-2xl font-bold text-red-600">{stats.exits}</h3>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500 mb-1 flex items-center"><Activity className="w-4 h-4 mr-1 text-orange-500" /> Turnover</p>
          <h3 className="text-2xl font-bold text-orange-600">{stats.turnoverRate}</h3>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500 mb-1 flex items-center"><ShieldAlert className="w-4 h-4 mr-1 text-red-500" /> Compliance</p>
          <h3 className="text-2xl font-bold text-red-600">{stats.complianceAlerts} Issues</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4">Department Headcount</h3>
          <div className="p-8 text-center bg-gray-50 rounded-xl border border-gray-100">
            <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-gray-500">No department headcount recorded yet.</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4">Pending HR Actions</h3>
          <div className="p-8 text-center bg-gray-50 rounded-xl border border-gray-100">
            <ShieldAlert className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-gray-500">No pending HR actions. All compliance checks are clear.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
