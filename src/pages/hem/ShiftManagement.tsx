import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  CalendarDays, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  Moon, 
  Sun, 
  Sunrise, 
  Sunset, 
  ArrowRightLeft, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  X, 
  Calendar, 
  Users, 
  Check, 
  Settings, 
  ShieldCheck, 
  Download,
  AlertCircle,
  Pencil,
  Trash2
} from 'lucide-react';
import HEMNavigation from '../../components/HEMNavigation';

interface ShiftDefinition {
  id: string;
  name: string;
  code: string;
  startTime: string;
  endTime: string;
  totalHours: number;
  gracePeriodMins: number;
  halfDayThresholdHours: number;
  fullDayThresholdHours: number;
  breakDurationMins: number;
  isNightShift: boolean;
  color: string;
  applicableDays: string[];
  description: string;
}

interface RosterAssignment {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  shiftId: string;
  shiftName: string;
  shiftCode: string;
  startTime: string;
  endTime: string;
  color: string;
  startDate: string;
  endDate: string;
  assignedAt: string;
  notes: string;
}

interface ShiftSwap {
  id: string;
  requesterName: string;
  requesterShift: string;
  targetPeerName: string;
  targetShift: string;
  swapDate: string;
  reason: string;
  status: string;
  createdAt: string;
}

export default function ShiftManagement() {
  const [shifts, setShifts] = useState<ShiftDefinition[]>([]);
  const [roster, setRoster] = useState<RosterAssignment[]>([]);
  const [swaps, setSwaps] = useState<ShiftSwap[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'definitions' | 'roster' | 'swaps'>('definitions');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showCreateShiftModal, setShowCreateShiftModal] = useState(false);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [showEditShiftModal, setShowEditShiftModal] = useState(false);
  const [editingShift, setEditingShift] = useState<any>(null);
  const [editShiftForm, setEditShiftForm] = useState({ name: '', code: '', startTime: '09:00', endTime: '18:00', gracePeriodMins: 15 });

  const [showEditRosterModal, setShowEditRosterModal] = useState(false);
  const [editingRoster, setEditingRoster] = useState<any>(null);
  const [editRosterForm, setEditRosterForm] = useState({ shiftId: '', startDate: '', endDate: '', notes: '' });

  const handleOpenEditShift = (shift: any) => {
    setEditingShift(shift);
    setEditShiftForm({
      name: shift.name,
      code: shift.code,
      startTime: shift.startTime,
      endTime: shift.endTime,
      gracePeriodMins: shift.gracePeriodMins || 15
    });
    setShowEditShiftModal(true);
  };

  const handleEditShiftSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingShift) return;
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hem/shifts/types/${editingShift.id}`, editShiftForm);
      setShowEditShiftModal(false);
      fetchShiftData();
    } catch (err) {
      alert('Failed to update shift definition');
    }
  };

  const handleDeleteShift = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete shift "${name}"?`)) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hem/shifts/types/${id}`);
      fetchShiftData();
    } catch (err) {
      alert('Failed to delete shift definition');
    }
  };

  const handleOpenEditRoster = (r: any) => {
    setEditingRoster(r);
    setEditRosterForm({
      shiftId: r.shiftId,
      startDate: r.startDate,
      endDate: r.endDate,
      notes: r.notes || ''
    });
    setShowEditRosterModal(true);
  };

  const handleEditRosterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoster) return;
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hem/shifts/roster/${editingRoster.id}`, editRosterForm);
      setShowEditRosterModal(false);
      fetchShiftData();
    } catch (err) {
      alert('Failed to update roster assignment');
    }
  };

  const handleDeleteRoster = async (id: string) => {
    if (!confirm('Are you sure you want to remove this roster assignment?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hem/shifts/roster/${id}`);
      fetchShiftData();
    } catch (err) {
      alert('Failed to delete roster assignment');
    }
  };

  // Forms
  const [assignForm, setAssignForm] = useState({
    employeeName: '',
    employeeId: '',
    department: 'Engineering',
    shiftId: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    notes: ''
  });

  const [shiftForm, setShiftForm] = useState({
    name: '',
    code: '',
    startTime: '09:00',
    endTime: '18:00',
    gracePeriodMins: 15,
    halfDayThresholdHours: 4.5,
    fullDayThresholdHours: 8.0,
    breakDurationMins: 60,
    isNightShift: false,
    color: 'blue',
    description: ''
  });

  const [swapForm, setSwapForm] = useState({
    requesterName: '',
    requesterShift: 'General Corporate Day Shift',
    targetPeerName: '',
    targetShift: 'Early Morning Operations Shift',
    swapDate: new Date().toISOString().split('T')[0],
    reason: ''
  });

  const fetchShiftData = async () => {
    try {
      const [shiftsRes, rosterRes, swapsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hem/shifts/types`),
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hem/shifts/roster`),
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hem/shifts/swaps`)
      ]);
      setShifts(shiftsRes.data || []);
      if (shiftsRes.data && shiftsRes.data.length > 0) {
        setAssignForm(prev => ({ ...prev, shiftId: shiftsRes.data[0].id }));
      }
      setRoster(rosterRes.data || []);
      setSwaps(swapsRes.data || []);
    } catch (err) {
      console.error('Failed to load shift data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShiftData();
  }, []);

  const handleAssignRoster = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hem/shifts/roster/assign`, assignForm);
      setShowAssignModal(false);
      setAssignForm({
        employeeName: '',
        employeeId: '',
        department: 'Engineering',
        shiftId: shifts[0]?.id || '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        notes: ''
      });
      fetchShiftData();
      setActiveTab('roster');
    } catch (err) {
      console.error(err);
      alert('Failed to assign shift.');
    }
  };

  const handleSimulateRoster = async () => {
    try {
      const sampleNames = [
        { name: 'Aditya Sen', id: 'EMP-1823', dept: 'DevOps & SRE' },
        { name: 'Meera Rao', id: 'EMP-2914', dept: 'Customer Support' },
        { name: 'Vikas Batra', id: 'EMP-3120', dept: 'Infrastructure' }
      ];
      const person = sampleNames[Math.floor(Math.random() * sampleNames.length)];
      const randomShift = shifts[Math.floor(Math.random() * shifts.length)] || shifts[0];

      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hem/shifts/roster/assign`, {
        employeeName: person.name,
        employeeId: person.id,
        department: person.dept,
        shiftId: randomShift.id,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        notes: 'Monthly rotational schedule assignment.'
      });
      fetchShiftData();
      setActiveTab('roster');
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateShift = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hem/shifts/types`, shiftForm);
      setShowCreateShiftModal(false);
      setShiftForm({
        name: '',
        code: '',
        startTime: '09:00',
        endTime: '18:00',
        gracePeriodMins: 15,
        halfDayThresholdHours: 4.5,
        fullDayThresholdHours: 8.0,
        breakDurationMins: 60,
        isNightShift: false,
        color: 'blue',
        description: ''
      });
      fetchShiftData();
      setActiveTab('definitions');
    } catch (err) {
      console.error(err);
      alert('Failed to create shift definition.');
    }
  };

  const handleCreateSwap = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hem/shifts/swaps`, swapForm);
      setShowSwapModal(false);
      setSwapForm({
        requesterName: '',
        requesterShift: 'General Corporate Day Shift',
        targetPeerName: '',
        targetShift: 'Early Morning Operations Shift',
        swapDate: new Date().toISOString().split('T')[0],
        reason: ''
      });
      fetchShiftData();
      setActiveTab('swaps');
    } catch (err) {
      console.error(err);
      alert('Failed to submit swap request.');
    }
  };

  const handleReviewSwap = async (id: string, newStatus: 'Approved' | 'Rejected') => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hem/shifts/swaps/${id}`, {
        status: newStatus,
        reviewedBy: 'Shift Supervisor'
      });
      fetchShiftData();
    } catch (err) {
      console.error(err);
    }
  };

  const getShiftIcon = (isNight: boolean, startTime: string) => {
    if (isNight) return Moon;
    const hour = parseInt(startTime.split(':')[0], 10);
    if (hour < 12) return Sunrise;
    if (hour < 17) return Sun;
    return Sunset;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Universal HEM Navigation Bar */}
      <HEMNavigation />

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-2 bg-blue-500/20 rounded-xl border border-blue-400/30">
                <CalendarDays className="w-5 h-5 text-blue-300" />
              </span>
              <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider">
                Workforce Rostering & Shift Engine
              </span>
              <span className="text-[10px] bg-blue-500/30 text-blue-200 font-bold px-2 py-0.5 rounded-full border border-blue-400/30">
                24/7 Operations
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Extensive Shift Management</h1>
            <p className="text-sm text-slate-300 max-w-2xl mt-1">
              Configure multi-shift schedules, grace periods, half-day/full-day thresholds, night shifts, automated rotational rostering, and peer-to-peer shift exchange boards.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleSimulateRoster}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Simulate Roster</span>
            </button>
            <button
              onClick={() => setShowCreateShiftModal(true)}
              className="px-3.5 py-2 bg-blue-700/60 hover:bg-blue-700 text-blue-100 border border-blue-500/40 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>New Shift Type</span>
            </button>
            <button
              onClick={() => setShowAssignModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-xs transition-all"
            >
              <Users className="w-4 h-4" />
              <span>Assign Roster</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold border border-blue-100">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">{shifts.length} Shifts</div>
            <div className="text-xs font-medium text-slate-500">Configured Operational Shifts</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold border border-emerald-100">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">{roster.length}</div>
            <div className="text-xs font-medium text-slate-500">Scheduled Roster Assignments</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 font-bold border border-purple-100">
            <ArrowRightLeft className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">
              {swaps.filter(s => s.status.includes('Pending')).length}
            </div>
            <div className="text-xs font-medium text-slate-500">Pending Shift Swaps</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-amber-400 font-bold">
            <Moon className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">24 / 7</div>
            <div className="text-xs font-medium text-slate-500">Night & Continuous Coverage</div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('definitions')}
          className={`px-5 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'definitions'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Shift Definitions & Thresholds ({shifts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('roster')}
          className={`px-5 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'roster'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Weekly Staff Roster ({roster.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('swaps')}
          className={`px-5 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'swaps'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <ArrowRightLeft className="w-4 h-4" />
          <span>Peer Shift Swaps ({swaps.length})</span>
          {swaps.filter(s => s.status.includes('Pending')).length > 0 && (
            <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full text-[10px] font-bold">
              {swaps.filter(s => s.status.includes('Pending')).length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: SHIFT DEFINITIONS */}
      {activeTab === 'definitions' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shifts.map((s) => {
              const ShiftIcon = getShiftIcon(s.isNightShift, s.startTime);
              return (
                <div
                  key={s.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-blue-400 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-xl ${s.isNightShift ? 'bg-slate-900 text-amber-300' : 'bg-blue-50 text-blue-700'}`}>
                          <ShiftIcon className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 font-mono">
                          {s.code}
                        </span>
                      </div>
                      {s.isNightShift ? (
                        <span className="text-[10px] bg-slate-900 text-amber-300 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Moon className="w-3 h-3" /> Night Shift
                        </span>
                      ) : (
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
                          Day Shift
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-700 leading-snug">
                      {s.name}
                    </h3>
                    <div className="text-xs text-blue-600 font-bold mt-1 font-mono">
                      {s.startTime} — {s.endTime} ({s.totalHours} hrs)
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed mt-2 mb-4">
                      {s.description}
                    </p>

                    <div className="space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-600">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Grace Period (Late):</span>
                        <span className="font-semibold text-slate-700">{s.gracePeriodMins} Minutes</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Half-Day Threshold:</span>
                        <span className="font-semibold text-slate-700">{s.halfDayThresholdHours} Hours min</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Full-Day Threshold:</span>
                        <span className="font-semibold text-slate-700">{s.fullDayThresholdHours} Hours min</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Break Duration:</span>
                        <span className="font-semibold text-slate-700">{s.breakDurationMins} Mins included</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Days Active:</span>
                        <div className="flex gap-1">
                          {s.applicableDays.map(d => (
                            <span key={d} className="text-[10px] bg-slate-100 text-slate-600 px-1 py-0.5 rounded font-mono">
                              {d}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">Auto-detected punch</span>
                    <button
                      onClick={() => {
                        setAssignForm(prev => ({ ...prev, shiftId: s.id }));
                        setShowAssignModal(true);
                      }}
                      className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold transition-colors"
                    >
                      Assign Staff
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: ROSTER */}
      {activeTab === 'roster' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            {roster.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
                  <Calendar className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-1">No Shift Roster Assignments</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mb-5 leading-relaxed">
                  Allocate employees or departments to designated shifts with custom date validity windows and operational instructions.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={handleSimulateRoster}
                    className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 font-semibold rounded-xl text-xs border border-blue-200 flex items-center gap-2 transition-all shadow-xs"
                  >
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>Simulate Shift Allocation</span>
                  </button>
                  <button
                    onClick={() => setShowAssignModal(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-xs transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Assign Shift</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold text-[11px] tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Employee</th>
                      <th className="py-3.5 px-4">Assigned Shift</th>
                      <th className="py-3.5 px-4">Shift Timing</th>
                      <th className="py-3.5 px-4">Validity Period</th>
                      <th className="py-3.5 px-4">Notes</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {roster.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{r.employeeName}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{r.employeeId} • {r.department}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                            {r.shiftName} ({r.shiftCode})
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-mono text-slate-800 font-semibold">{r.startTime} — {r.endTime}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-slate-700">{r.startDate} to {r.endDate}</div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">
                          {r.notes}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => {
                              setSwapForm(prev => ({
                                ...prev,
                                requesterName: r.employeeName,
                                requesterShift: r.shiftName
                              }));
                              setShowSwapModal(true);
                            }}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 ml-auto"
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                            <span>Request Swap</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: SHIFT SWAPS */}
      {activeTab === 'swaps' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">Peer shift exchange board with manager approval gating.</p>
            <button
              onClick={() => setShowSwapModal(true)}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>Submit Swap Request</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            {swaps.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs">
                No shift swap requests currently on the board.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold text-[11px] tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Requester & Shift</th>
                      <th className="py-3.5 px-4">Exchange With Peer</th>
                      <th className="py-3.5 px-4">Target Date</th>
                      <th className="py-3.5 px-4">Reason</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {swaps.map((sw) => (
                      <tr key={sw.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{sw.requesterName}</div>
                          <div className="text-[11px] text-slate-500">{sw.requesterShift}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{sw.targetPeerName}</div>
                          <div className="text-[11px] text-slate-500">{sw.targetShift}</div>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-700">
                          {sw.swapDate}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                          {sw.reason}
                        </td>
                        <td className="py-3.5 px-4">
                          {sw.status === 'Approved' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                            </span>
                          ) : sw.status === 'Rejected' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                              <XCircle className="w-3.5 h-3.5" /> Rejected
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                              <Clock className="w-3.5 h-3.5" /> Pending Manager
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {sw.status.includes('Pending') && (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleReviewSwap(sw.id, 'Rejected')}
                                className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition-colors border border-rose-200"
                                title="Reject"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleReviewSwap(sw.id, 'Approved')}
                                className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors shadow-xs"
                                title="Approve Swap"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Assign Roster Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setShowAssignModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
                <CalendarDays className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Assign Shift Roster</h3>
                <p className="text-xs text-slate-500">Schedule staff member to an operational shift</p>
              </div>
            </div>

            <form onSubmit={handleAssignRoster} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Employee Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Vikas Batra"
                    value={assignForm.employeeName}
                    onChange={(e) => setAssignForm({ ...assignForm, employeeName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Employee ID *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. EMP-2104"
                    value={assignForm.employeeId}
                    onChange={(e) => setAssignForm({ ...assignForm, employeeId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Shift Profile *
                </label>
                <select
                  value={assignForm.shiftId}
                  onChange={(e) => setAssignForm({ ...assignForm, shiftId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  required
                >
                  {shifts.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.startTime} - {s.endTime})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Effective Start Date *
                  </label>
                  <input
                    type="date"
                    value={assignForm.startDate}
                    onChange={(e) => setAssignForm({ ...assignForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Effective End Date *
                  </label>
                  <input
                    type="date"
                    value={assignForm.endDate}
                    onChange={(e) => setAssignForm({ ...assignForm, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Workforce Operations Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Assigned to European client overlap rotation"
                  value={assignForm.notes}
                  onChange={(e) => setAssignForm({ ...assignForm, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Users className="w-4 h-4" />
                  <span>Confirm Assignment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Shift Modal */}
      {showCreateShiftModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowCreateShiftModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Create Shift Definition</h3>
                <p className="text-xs text-slate-500">Configure timings, grace periods, and thresholds</p>
              </div>
            </div>

            <form onSubmit={handleCreateShift} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Shift Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Weekend Special Support"
                    value={shiftForm.name}
                    onChange={(e) => setShiftForm({ ...shiftForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Shift Code *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. WKD-01"
                    value={shiftForm.code}
                    onChange={(e) => setShiftForm({ ...shiftForm, code: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono uppercase"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    value={shiftForm.startTime}
                    onChange={(e) => setShiftForm({ ...shiftForm, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    End Time *
                  </label>
                  <input
                    type="time"
                    value={shiftForm.endTime}
                    onChange={(e) => setShiftForm({ ...shiftForm, endTime: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Grace (Mins)
                  </label>
                  <input
                    type="number"
                    value={shiftForm.gracePeriodMins}
                    onChange={(e) => setShiftForm({ ...shiftForm, gracePeriodMins: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Half-Day (Hrs)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={shiftForm.halfDayThresholdHours}
                    onChange={(e) => setShiftForm({ ...shiftForm, halfDayThresholdHours: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full-Day (Hrs)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={shiftForm.fullDayThresholdHours}
                    onChange={(e) => setShiftForm({ ...shiftForm, fullDayThresholdHours: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                <input
                  type="checkbox"
                  id="nightShiftCheck"
                  checked={shiftForm.isNightShift}
                  onChange={(e) => setShiftForm({ ...shiftForm, isNightShift: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="nightShiftCheck" className="text-xs font-semibold text-slate-700 cursor-pointer flex items-center gap-1.5">
                  <Moon className="w-3.5 h-3.5 text-amber-500" />
                  <span>Night Shift (Crosses Midnight Rollover)</span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={shiftForm.description}
                  onChange={(e) => setShiftForm({ ...shiftForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateShiftModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Save Shift Profile</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Shift Swap Modal */}
      {showSwapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setShowSwapModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
                <ArrowRightLeft className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Request Peer Shift Swap</h3>
                <p className="text-xs text-slate-500">Exchange scheduled roster dates with a colleague</p>
              </div>
            </div>

            <form onSubmit={handleCreateSwap} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Vikas Batra"
                  value={swapForm.requesterName}
                  onChange={(e) => setSwapForm({ ...swapForm, requesterName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Exchange With Colleague (Peer Name) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Meera Rao"
                  value={swapForm.targetPeerName}
                  onChange={(e) => setSwapForm({ ...swapForm, targetPeerName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Swap Date *
                </label>
                <input
                  type="date"
                  value={swapForm.swapDate}
                  onChange={(e) => setSwapForm({ ...swapForm, swapDate: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason for Shift Swap *
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Urgent family doctor appointment on Tuesday..."
                  value={swapForm.reason}
                  onChange={(e) => setSwapForm({ ...swapForm, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSwapModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                  <span>Submit Swap Request</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT SHIFT DEFINITION ================= */}
      {showEditShiftModal && editingShift && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-[480px] max-w-full text-xs">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-gray-900">Edit Shift Definition</h3>
              <button onClick={() => setShowEditShiftModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleEditShiftSubmit} className="space-y-4">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Shift Name *</label>
                <input
                  required
                  value={editShiftForm.name}
                  onChange={e => setEditShiftForm({...editShiftForm, name: e.target.value})}
                  className="w-full border-gray-300 rounded-xl p-2.5 border font-semibold"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Shift Code *</label>
                  <input
                    required
                    value={editShiftForm.code}
                    onChange={e => setEditShiftForm({...editShiftForm, code: e.target.value.toUpperCase()})}
                    className="w-full border-gray-300 rounded-xl p-2.5 border font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Grace Period (Minutes)</label>
                  <input
                    type="number"
                    value={editShiftForm.gracePeriodMins}
                    onChange={e => setEditShiftForm({...editShiftForm, gracePeriodMins: Number(e.target.value)})}
                    className="w-full border-gray-300 rounded-xl p-2.5 border font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Start Time *</label>
                  <input
                    type="time"
                    required
                    value={editShiftForm.startTime}
                    onChange={e => setEditShiftForm({...editShiftForm, startTime: e.target.value})}
                    className="w-full border-gray-300 rounded-xl p-2.5 border font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">End Time *</label>
                  <input
                    type="time"
                    required
                    value={editShiftForm.endTime}
                    onChange={e => setEditShiftForm({...editShiftForm, endTime: e.target.value})}
                    className="w-full border-gray-300 rounded-xl p-2.5 border font-mono"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setShowEditShiftModal(false)} className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs cursor-pointer">Save Shift</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT ROSTER ASSIGNMENT ================= */}
      {showEditRosterModal && editingRoster && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-[480px] max-w-full text-xs">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-gray-900">Edit Roster Assignment</h3>
              <button onClick={() => setShowEditRosterModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleEditRosterSubmit} className="space-y-4">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Shift Assignment *</label>
                <select
                  value={editRosterForm.shiftId}
                  onChange={e => setEditRosterForm({...editRosterForm, shiftId: e.target.value})}
                  className="w-full border-gray-300 rounded-xl p-2.5 border bg-white font-medium"
                >
                  {shifts.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.startTime} - {s.endTime})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={editRosterForm.startDate}
                    onChange={e => setEditRosterForm({...editRosterForm, startDate: e.target.value})}
                    className="w-full border-gray-300 rounded-xl p-2.5 border font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">End Date *</label>
                  <input
                    type="date"
                    required
                    value={editRosterForm.endDate}
                    onChange={e => setEditRosterForm({...editRosterForm, endDate: e.target.value})}
                    className="w-full border-gray-300 rounded-xl p-2.5 border font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Notes</label>
                <input
                  value={editRosterForm.notes}
                  onChange={e => setEditRosterForm({...editRosterForm, notes: e.target.value})}
                  className="w-full border-gray-300 rounded-xl p-2.5 border"
                  placeholder="Deployment notes or client team"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setShowEditRosterModal(false)} className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs cursor-pointer">Save Assignment</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
