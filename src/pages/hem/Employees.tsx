import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Users, Briefcase, Calendar, Phone, Plus, Trash2, Pencil, Building2, ArrowRight } from 'lucide-react';
import HEMNavigation from '../../components/HEMNavigation';

export default function Employees() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmp, setSelectedEmp] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditEmpModal, setShowEditEmpModal] = useState(false);
  const [editingEmp, setEditingEmp] = useState<any>(null);
  const [editEmpForm, setEditEmpForm] = useState({ name: '', email: '', department: 'Engineering', role: 'Software Engineer', status: 'Active' });

  const handleOpenEditEmployee = (emp: any) => {
    setEditingEmp(emp);
    setEditEmpForm({
      name: emp.name,
      email: emp.email,
      department: emp.department || 'Engineering',
      role: emp.role || 'Software Engineer',
      status: emp.status || 'Active'
    });
    setShowEditEmpModal(true);
  };

  const handleEditEmployeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmp) return;
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hem/employees/${editingEmp.id}`, editEmpForm);
      setShowEditEmpModal(false);
      fetchEmployees();
    } catch (err) {
      console.error('Failed to update employee', err);
      alert('Failed to update employee profile');
    }
  };
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    department: 'Engineering',
    role: 'Software Engineer',
    baseSalary: 60000,
    skills: '',
    emergencyContact: ''
  });
  
  const [detailForm, setDetailForm] = useState({
    joiningDate: '', baseSalary: 0, emergencyContact: '', skills: '', certifications: '', employmentHistory: ''
  });

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hem/employees`);
      setEmployees(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEmployees(); }, []);

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hem/employees`, newEmployee);
      setShowCreateModal(false);
      setNewEmployee({
        name: '',
        email: '',
        department: 'Engineering',
        role: 'Software Engineer',
        baseSalary: 60000,
        skills: '',
        emergencyContact: ''
      });
      fetchEmployees();
    } catch (err) {
      console.error('Failed to create employee', err);
      alert('Failed to register employee');
    }
  };

  const handleDeleteEmployee = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete employee "${name}"? This will remove all their records.`)) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hem/employees/${id}`);
      fetchEmployees();
    } catch (err) {
      console.error('Failed to delete employee', err);
      alert('Failed to delete employee');
    }
  };

  const handleUpdateDetail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp) return;
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hem/employees/${selectedEmp.id}/detail`, detailForm);
      setSelectedEmp(null);
      fetchEmployees();
    } catch (err) {
      console.error(err);
    }
  };

  const openModal = (emp: any) => {
    setSelectedEmp(emp);
    const d = emp.employeeDetail || {};
    setDetailForm({
      joiningDate: d.joiningDate ? d.joiningDate.split('T')[0] : '',
      baseSalary: d.baseSalary || 0,
      emergencyContact: d.emergencyContact || '',
      skills: d.skills || '',
      certifications: d.certifications || '',
      employmentHistory: d.employmentHistory || ''
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <HEMNavigation />

      {/* Master Employee Database Gateway */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-slate-50 border border-blue-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-blue-900 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-xs">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-blue-950 text-sm">Master Employee Information Center</span>
              <span className="text-[10px] bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-full border border-blue-200">
                HR Suite Canonical Source
              </span>
            </div>
            <p className="text-blue-700/90 text-xs mt-0.5">
              Official employee master records, PAN/Aadhaar/UAN/PF/ESI statutory IDs, bank details, and formal employment contracts are centralized in HR Suite.
            </p>
          </div>
        </div>
        <Link
          to="/hr/employee-info"
          className="whitespace-nowrap px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-center text-xs"
        >
          <span>Open Master HR Profiles</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Workforce Operations & Shift Rosters</h2>
          <p className="text-xs text-gray-500">Day-to-day workforce rosters, shift deployments, emergency contacts and operational stationing</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center font-medium shadow-sm transition-colors text-sm"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Employee
        </button>
      </div>

      {employees.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-700">No employees registered</h3>
          <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">Registered staff records, skills, and emergency contact profiles will appear here.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            + Add First Employee
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {employees.map(emp => (
            <div key={emp.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between space-x-4 mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xl">
                    {emp.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{emp.name}</h3>
                    <p className="text-sm text-gray-500">{emp.role} - {emp.department}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteEmployee(emp.id, emp.name)}
                  title="Delete Employee"
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-2 mt-4 text-sm text-gray-600">
                <div className="flex items-center"><Briefcase className="w-4 h-4 mr-2" /> Skills: {emp.employeeDetail?.skills || 'Not set'}</div>
                <div className="flex items-center"><Calendar className="w-4 h-4 mr-2" /> Joined: {emp.employeeDetail?.joiningDate ? new Date(emp.employeeDetail.joiningDate).toLocaleDateString() : 'Not set'}</div>
                <div className="flex items-center"><Phone className="w-4 h-4 mr-2" /> Emergency: {emp.employeeDetail?.emergencyContact || 'Not set'}</div>
              </div>
              
              <button onClick={() => openModal(emp)} className="mt-6 w-full py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium rounded-lg transition-colors border border-gray-200">
                Edit Details
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Create Employee Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-[520px] max-w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Register New Employee</h3>
            <form onSubmit={handleCreateEmployee} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
                <input
                  required
                  value={newEmployee.name}
                  onChange={e => setNewEmployee({...newEmployee, name: e.target.value})}
                  className="w-full border-gray-300 rounded-lg p-2.5 border text-sm"
                  placeholder="e.g. Priya Sundaram"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={newEmployee.email}
                    onChange={e => setNewEmployee({...newEmployee, email: e.target.value})}
                    className="w-full border-gray-300 rounded-lg p-2.5 border text-sm"
                    placeholder="priya@company.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Department</label>
                  <select
                    value={newEmployee.department}
                    onChange={e => setNewEmployee({...newEmployee, department: e.target.value})}
                    className="w-full border-gray-300 rounded-lg p-2.5 border text-sm bg-white"
                  >
                    <option>Engineering</option>
                    <option>Human Resources</option>
                    <option>Finance</option>
                    <option>Sales & Marketing</option>
                    <option>Operations</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Designation / Role</label>
                  <input
                    required
                    value={newEmployee.role}
                    onChange={e => setNewEmployee({...newEmployee, role: e.target.value})}
                    className="w-full border-gray-300 rounded-lg p-2.5 border text-sm"
                    placeholder="Staff Engineer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Base Monthly Salary (₹)</label>
                  <input
                    type="number"
                    required
                    value={newEmployee.baseSalary}
                    onChange={e => setNewEmployee({...newEmployee, baseSalary: Number(e.target.value)})}
                    className="w-full border-gray-300 rounded-lg p-2.5 border text-sm"
                    placeholder="65000"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Skills (comma separated)</label>
                <input
                  value={newEmployee.skills}
                  onChange={e => setNewEmployee({...newEmployee, skills: e.target.value})}
                  className="w-full border-gray-300 rounded-lg p-2.5 border text-sm"
                  placeholder="React, TypeScript, Node.js"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Emergency Contact</label>
                <input
                  value={newEmployee.emergencyContact}
                  onChange={e => setNewEmployee({...newEmployee, emergencyContact: e.target.value})}
                  className="w-full border-gray-300 rounded-lg p-2.5 border text-sm"
                  placeholder="Karthik (Spouse) - +91 9876543210"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm shadow-sm transition-colors"
                >
                  Create Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedEmp && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-[500px] max-w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Edit Details: {selectedEmp.name}</h3>
            <form onSubmit={handleUpdateDetail} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Joining Date</label>
                  <input type="date" value={detailForm.joiningDate} onChange={e => setDetailForm({...detailForm, joiningDate: e.target.value})} className="w-full border-gray-300 rounded-lg p-2 border" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Base Salary</label>
                  <input type="number" value={detailForm.baseSalary} onChange={e => setDetailForm({...detailForm, baseSalary: Number(e.target.value)})} className="w-full border-gray-300 rounded-lg p-2 border" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label>
                  <input value={detailForm.emergencyContact} onChange={e => setDetailForm({...detailForm, emergencyContact: e.target.value})} className="w-full border-gray-300 rounded-lg p-2 border" placeholder="Name & Phone" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma separated)</label>
                  <input value={detailForm.skills} onChange={e => setDetailForm({...detailForm, skills: e.target.value})} className="w-full border-gray-300 rounded-lg p-2 border" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Certifications</label>
                  <input value={detailForm.certifications} onChange={e => setDetailForm({...detailForm, certifications: e.target.value})} className="w-full border-gray-300 rounded-lg p-2 border" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employment History</label>
                  <textarea rows={3} value={detailForm.employmentHistory} onChange={e => setDetailForm({...detailForm, employmentHistory: e.target.value})} className="w-full border-gray-300 rounded-lg p-2 border"></textarea>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setSelectedEmp(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm transition-colors">Save Details</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
