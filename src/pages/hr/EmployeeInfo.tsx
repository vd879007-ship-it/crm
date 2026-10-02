import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  X, 
  Edit, 
  Trash2, 
  CreditCard, 
  Building2, 
  Mail, 
  Phone, 
  Calendar, 
  ShieldCheck, 
  Sparkles,
  UserCheck,
  CheckCircle2,
  FileText
} from 'lucide-react';
import HRNavigation from '../../components/HRNavigation';

interface EmployeeRecord {
  id: string;
  empCode: string;
  name: string;
  email: string;
  phone: string;
  designation: string;
  department: string;
  joiningDate: string;
  dob: string;
  gender: string;
  bloodGroup: string;
  panNumber: string;
  aadhaarNumber: string;
  uanNumber: string;
  pfNumber: string;
  esiNumber: string;
  bankDetails: {
    bankName: string;
    accountNumber: string;
    ifscCode: string;
  };
  emergencyContact: {
    name: string;
    phone: string;
  };
  address: string;
  ctc: number;
  status: 'Active' | 'On Leave' | 'Resigned' | 'Terminated';
}

export default function EmployeeInfo() {
  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Modals
  const [showModal, setShowModal] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState<EmployeeRecord | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    empCode: '',
    name: '',
    email: '',
    phone: '',
    designation: '',
    department: 'Engineering',
    joiningDate: new Date().toISOString().split('T')[0],
    dob: '1995-05-15',
    gender: 'Male',
    bloodGroup: 'B+',
    panNumber: '',
    aadhaarNumber: '',
    uanNumber: '',
    pfNumber: '',
    esiNumber: '',
    bankName: 'HDFC Bank',
    accountNumber: '',
    ifscCode: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    address: '',
    ctc: 1200000,
    status: 'Active' as EmployeeRecord['status']
  });

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hr/employees`);
      setEmployees(res.data || []);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedEmp) {
        await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hr/employees/${selectedEmp.id}`, formData);
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hr/employees`, formData);
      }
      setShowModal(false);
      setSelectedEmp(null);
      resetForm();
      fetchEmployees();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this employee profile?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hr/employees/${id}`);
      fetchEmployees();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (emp: EmployeeRecord) => {
    setSelectedEmp(emp);
    setFormData({
      empCode: emp.empCode,
      name: emp.name,
      email: emp.email,
      phone: emp.phone,
      designation: emp.designation,
      department: emp.department,
      joiningDate: emp.joiningDate,
      dob: emp.dob,
      gender: emp.gender,
      bloodGroup: emp.bloodGroup,
      panNumber: emp.panNumber,
      aadhaarNumber: emp.aadhaarNumber,
      uanNumber: emp.uanNumber,
      pfNumber: emp.pfNumber,
      esiNumber: emp.esiNumber,
      bankName: emp.bankDetails?.bankName || '',
      accountNumber: emp.bankDetails?.accountNumber || '',
      ifscCode: emp.bankDetails?.ifscCode || '',
      emergencyContactName: emp.emergencyContact?.name || '',
      emergencyContactPhone: emp.emergencyContact?.phone || '',
      address: emp.address,
      ctc: emp.ctc,
      status: emp.status
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      empCode: '',
      name: '',
      email: '',
      phone: '',
      designation: '',
      department: 'Engineering',
      joiningDate: new Date().toISOString().split('T')[0],
      dob: '1995-05-15',
      gender: 'Male',
      bloodGroup: 'B+',
      panNumber: '',
      aadhaarNumber: '',
      uanNumber: '',
      pfNumber: '',
      esiNumber: '',
      bankName: 'HDFC Bank',
      accountNumber: '',
      ifscCode: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      address: '',
      ctc: 1200000,
      status: 'Active'
    });
  };

  const handleSeedSample = async () => {
    const samples = [
      {
        empCode: 'ATH-1001',
        name: 'Aditi Deshmukh',
        email: 'aditi.deshmukh@athenahr.io',
        phone: '+91 98200 12345',
        designation: 'Senior Frontend Architect',
        department: 'Engineering',
        joiningDate: '2025-06-01',
        dob: '1994-08-20',
        gender: 'Female',
        bloodGroup: 'O+',
        panNumber: 'ABCDE1234F',
        aadhaarNumber: '9876-5432-1098',
        uanNumber: '101234567890',
        pfNumber: 'MH/BAN/0012345/000/001',
        esiNumber: '31001234560000101',
        bankName: 'HDFC Bank Ltd',
        accountNumber: '50100234567890',
        ifscCode: 'HDFC0001234',
        emergencyContactName: 'Rajesh Deshmukh (Spouse)',
        emergencyContactPhone: '+91 98200 99999',
        address: '402, Green Glen Layout, Bellandur, Bangalore - 560103',
        ctc: 2400000,
        status: 'Active'
      },
      {
        empCode: 'ATH-1002',
        name: 'Karan Mehra',
        email: 'karan.mehra@athenahr.io',
        phone: '+91 98111 87654',
        designation: 'Lead Product Manager',
        department: 'Product & Design',
        joiningDate: '2025-09-15',
        dob: '1992-11-12',
        gender: 'Male',
        bloodGroup: 'A+',
        panNumber: 'FGHIJ5678K',
        aadhaarNumber: '1234-5678-9012',
        uanNumber: '109876543210',
        pfNumber: 'MH/BAN/0012345/000/002',
        esiNumber: '31001234560000102',
        bankName: 'ICICI Bank',
        accountNumber: '001105001234',
        ifscCode: 'ICIC0000011',
        emergencyContactName: 'Sunita Mehra (Mother)',
        emergencyContactPhone: '+91 98111 11111',
        address: '12, Indiranagar 100ft Road, Bangalore - 560038',
        ctc: 2800000,
        status: 'Active'
      }
    ];

    for (const item of samples) {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hr/employees`, item);
    }
    fetchEmployees();
  };

  const filteredEmployees = employees.filter(e => {
    const matchesDept = deptFilter === 'All' || e.department === deptFilter;
    const matchesStatus = statusFilter === 'All' || e.status === statusFilter;
    const matchesSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.empCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.designation.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesStatus && matchesSearch;
  });

  const activeCount = employees.filter(e => e.status === 'Active').length;
  const onLeaveCount = employees.filter(e => e.status === 'On Leave').length;
  const resignedCount = employees.filter(e => e.status === 'Resigned' || e.status === 'Terminated').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top HR Navigation */}
      <HRNavigation />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-blue-50 text-blue-700 rounded-lg">
              <Users className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">Employee Information Management</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Master Employee Information Database</h1>
          <p className="text-sm text-gray-500 mt-1 max-w-2xl">
            Complete biographical, official, statutory (PF, ESI, PAN, UAN), banking, direct deposit, and emergency profiles in one unified system.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {employees.length === 0 && (
            <button
              onClick={handleSeedSample}
              className="px-3.5 py-2 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Simulate Employee Records</span>
            </button>
          )}
          <button
            onClick={() => {
              resetForm();
              setSelectedEmp(null);
              setShowModal(true);
            }}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Employee</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Headcount</p>
            <h3 className="text-3xl font-extrabold text-gray-900 mt-1">{employees.length}</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Master directory records</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active Workforce</p>
            <h3 className="text-3xl font-extrabold text-emerald-600 mt-1">{activeCount}</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Full-time active contracts</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">On Planned Leave</p>
            <h3 className="text-3xl font-extrabold text-amber-600 mt-1">{onLeaveCount}</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Sabbatical or parental leaves</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Separations & Alumni</p>
            <h3 className="text-3xl font-extrabold text-slate-600 mt-1">{resignedCount}</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Past records archived</p>
          </div>
          <div className="p-3 bg-slate-100 text-slate-600 rounded-2xl">
            <FileText className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Control Bar: Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="All">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Product & Design">Product & Design</option>
            <option value="Sales & Marketing">Sales & Marketing</option>
            <option value="Human Resources">Human Resources</option>
            <option value="Finance & Legal">Finance & Legal</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="On Leave">On Leave</option>
            <option value="Resigned">Resigned</option>
          </select>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search employee by name, code or role..."
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Employee Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-3.5 text-left">Emp Code & Name</th>
                <th className="px-5 py-3.5 text-left">Designation & Team</th>
                <th className="px-5 py-3.5 text-left">Statutory IDs (PAN/UAN)</th>
                <th className="px-5 py-3.5 text-left">Bank & Account</th>
                <th className="px-5 py-3.5 text-left">Date Joined</th>
                <th className="px-5 py-3.5 text-left">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-gray-400">
                    <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="font-semibold text-gray-600">No employee information records found</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Click "+ Add New Employee" or "Simulate Employee Records".</p>
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                          {emp.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{emp.name}</div>
                          <div className="text-[10px] text-gray-400 font-mono">{emp.empCode} • {emp.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-gray-800">{emp.designation}</div>
                      <div className="text-[10px] text-gray-400">{emp.department}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-mono text-gray-700">PAN: {emp.panNumber || '—'}</div>
                      <div className="font-mono text-[10px] text-gray-400">UAN: {emp.uanNumber || '—'}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="text-gray-800 font-medium">{emp.bankDetails?.bankName || '—'}</div>
                      <div className="text-[10px] text-gray-400 font-mono">A/C: {emp.bankDetails?.accountNumber || '—'}</div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">
                      {emp.joiningDate}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        emp.status === 'Active' ? 'bg-emerald-100 text-emerald-800' :
                        emp.status === 'On Leave' ? 'bg-amber-100 text-amber-800' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-2">
                      <button
                        onClick={() => handleEdit(emp)}
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Details"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(emp.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT EMPLOYEE MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-gray-900">
                  {selectedEmp ? `Edit Profile: ${selectedEmp.name}` : 'Add Master Employee Information'}
                </h3>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 mt-4">
              {/* Section 1: Basic Information */}
              <div>
                <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-2">1. Personal & Official Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">Employee ID Code *</label>
                    <input
                      type="text"
                      required
                      value={formData.empCode}
                      onChange={(e) => setFormData({ ...formData, empCode: e.target.value })}
                      placeholder="ATH-1001"
                      className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none uppercase font-mono"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Priya Nair"
                      className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">Corporate Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="priya.nair@athenahr.io"
                      className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">Phone Number *</label>
                    <input
                      type="text"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">Date of Joining</label>
                    <input
                      type="date"
                      value={formData.joiningDate}
                      onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">Job Designation</label>
                    <input
                      type="text"
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      placeholder="e.g. Software Engineer"
                      className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">Department</label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    >
                      <option value="Engineering">Engineering</option>
                      <option value="Product & Design">Product & Design</option>
                      <option value="Sales & Marketing">Sales & Marketing</option>
                      <option value="Human Resources">Human Resources</option>
                      <option value="Finance & Legal">Finance & Legal</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as EmployeeRecord['status'] })}
                      className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    >
                      <option value="Active">Active</option>
                      <option value="On Leave">On Leave</option>
                      <option value="Resigned">Resigned</option>
                      <option value="Terminated">Terminated</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Statutory IDs */}
              <div className="pt-3 border-t border-gray-100">
                <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-2">2. Statutory & Tax Identification</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">PAN Card Number</label>
                    <input
                      type="text"
                      value={formData.panNumber}
                      onChange={(e) => setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })}
                      placeholder="ABCDE1234F"
                      className="w-full px-3 py-2 border rounded-xl text-xs font-mono uppercase focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">Aadhaar Card No.</label>
                    <input
                      type="text"
                      value={formData.aadhaarNumber}
                      onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                      placeholder="1234-5678-9012"
                      className="w-full px-3 py-2 border rounded-xl text-xs font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">Universal Account No (UAN)</label>
                    <input
                      type="text"
                      value={formData.uanNumber}
                      onChange={(e) => setFormData({ ...formData, uanNumber: e.target.value })}
                      placeholder="101234567890"
                      className="w-full px-3 py-2 border rounded-xl text-xs font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Banking & Payroll */}
              <div className="pt-3 border-t border-gray-100">
                <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-2">3. Direct Deposit Bank Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={formData.bankName}
                      onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                      placeholder="HDFC Bank"
                      className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">Account Number</label>
                    <input
                      type="text"
                      value={formData.accountNumber}
                      onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                      placeholder="50100..."
                      className="w-full px-3 py-2 border rounded-xl text-xs font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">IFSC Code</label>
                    <input
                      type="text"
                      value={formData.ifscCode}
                      onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value.toUpperCase() })}
                      placeholder="HDFC0001234"
                      className="w-full px-3 py-2 border rounded-xl text-xs font-mono uppercase focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Emergency Contacts & Address */}
              <div className="pt-3 border-t border-gray-100">
                <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-2">4. Emergency & Residential Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">Emergency Contact Name</label>
                    <input
                      type="text"
                      value={formData.emergencyContactName}
                      onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                      placeholder="e.g. Ramesh Nair (Father)"
                      className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">Emergency Contact Phone</label>
                    <input
                      type="text"
                      value={formData.emergencyContactPhone}
                      onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                      placeholder="+91 98765 99999"
                      className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Residential Address</label>
                  <textarea
                    rows={2}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Full residential address with postal PIN code..."
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  {selectedEmp ? 'Update Master Profile' : 'Save Employee Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
