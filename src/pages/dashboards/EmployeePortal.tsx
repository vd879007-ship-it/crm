import { useState, useEffect } from 'react';
import { User, Clock, Calendar, CheckSquare, FileText, Briefcase } from 'lucide-react';
import RoleNav from '../../components/RoleNav';

export default function EmployeePortal() {
  const userStr = localStorage.getItem('user');
  const currentUser = userStr ? JSON.parse(userStr) : null;
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    setProfile(currentUser);
  }, []);

  return (
    <div className="space-y-6">
      <RoleNav />
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">My Employee Portal</h2>
          <p className="text-gray-500 mt-1">Welcome back, {profile?.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
            <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">{profile?.name}</h3>
            <p className="text-gray-500">{profile?.role} - {profile?.department}</p>
            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-around">
              <div>
                <p className="text-xs text-gray-400">Casual Leave</p>
                <p className="font-bold text-gray-900">0 Days</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Paid Leave</p>
                <p className="font-bold text-gray-900">0 Days</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center"><Clock className="w-5 h-5 mr-2 text-blue-500" /> Today's Attendance</h3>
            <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold mb-3 shadow-sm transition-colors">
              Clock In Now
            </button>
            <p className="text-xs text-center text-gray-500">Your shift starts at 09:00 AM</p>
          </div>
        </div>

        <div className="col-span-2 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <button className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-purple-300 transition-colors text-left group">
              <Calendar className="w-8 h-8 text-purple-500 mb-3 group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-gray-900">Apply Leave</h4>
              <p className="text-xs text-gray-500 mt-1">Submit sick or planned leaves</p>
            </button>
            <button className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-green-300 transition-colors text-left group">
              <FileText className="w-8 h-8 text-green-500 mb-3 group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-gray-900">My Payslips</h4>
              <p className="text-xs text-gray-500 mt-1">Download monthly salary slips</p>
            </button>
            <button className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-blue-300 transition-colors text-left group">
              <CheckSquare className="w-8 h-8 text-blue-500 mb-3 group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-gray-900">My Tasks</h4>
              <p className="text-xs text-gray-500 mt-1">View pending assignments</p>
            </button>
            <button className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-orange-300 transition-colors text-left group">
              <Briefcase className="w-8 h-8 text-orange-500 mb-3 group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-gray-900">Expenses</h4>
              <p className="text-xs text-gray-500 mt-1">Submit reimbursement claims</p>
            </button>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-800 mb-4">Recent Announcements</h3>
            <div className="p-8 text-center bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-xs font-semibold text-gray-400">No company announcements posted.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
