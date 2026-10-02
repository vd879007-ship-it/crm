import { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle2, Clock, Calendar, Plus, Pencil, Trash2 } from 'lucide-react';
import OSNavigation from '../../components/OSNavigation';

export default function Tasks() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [editTaskForm, setEditTaskForm] = useState({ title: '', description: '', status: 'Pending', dueDate: '' });

  const handleOpenEdit = (t: any) => {
    setEditingTask(t);
    setEditTaskForm({
      title: t.title,
      description: t.description || '',
      status: t.status,
      dueDate: t.dueDate ? t.dueDate.split('T')[0] : ''
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/os/tasks/${editingTask.id}`, editTaskForm);
      setShowEditModal(false);
      fetchTasks();
    } catch (err) {
      alert('Failed to update task');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/os/tasks/${id}`);
      fetchTasks();
    } catch (err) {
      alert('Failed to delete task');
    }
  };
  const [newTask, setNewTask] = useState({ title: '', description: '', status: 'Pending', dueDate: '' });

  const userStr = localStorage.getItem('user');
  const currentUser = userStr ? JSON.parse(userStr) : null;

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/os/tasks`);
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/os/tasks`, { ...newTask, userId: currentUser?.id });
      setShowModal(false);
      setNewTask({ title: '', description: '', status: 'Pending', dueDate: '' });
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <OSNavigation />

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">CHRM & Operational Tasks</h2>
          <p className="text-xs text-gray-500">Kanban workflow tracking across Pending, In Progress and Completed states</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl flex items-center font-bold text-sm shadow-sm transition-colors cursor-pointer">
          <Plus className="w-4 h-4 mr-2" /> New Task
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center"><Clock className="w-5 h-5 mr-2 text-yellow-500" /> Pending</h3>
          <div className="space-y-3">
            {tasks.filter(t => t.status === 'Pending').map(t => (
              <div key={t.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex justify-between items-start">
                  <h4 className="font-semibold text-gray-900">{t.title}</h4>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleOpenEdit(t)} className="p-1 text-gray-400 hover:text-blue-600 rounded cursor-pointer" title="Edit Task">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(t.id)} className="p-1 text-gray-400 hover:text-rose-600 rounded cursor-pointer" title="Delete Task">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{t.description}</p>
                {t.dueDate && <p className="text-xs font-medium text-gray-600 mt-2 flex items-center"><Calendar className="w-3 h-3 mr-1" /> {new Date(t.dueDate).toLocaleDateString()}</p>}
              </div>
            ))}
            {tasks.filter(t => t.status === 'Pending').length === 0 && (
              <p className="text-xs text-gray-400 text-center py-6">No pending tasks</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center"><Clock className="w-5 h-5 mr-2 text-blue-500" /> In Progress</h3>
          <div className="space-y-3">
            {tasks.filter(t => t.status === 'In Progress').map(t => (
              <div key={t.id} className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <h4 className="font-semibold text-gray-900">{t.title}</h4>
              </div>
            ))}
            {tasks.filter(t => t.status === 'In Progress').length === 0 && (
              <p className="text-xs text-gray-400 text-center py-6">No active tasks</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center"><CheckCircle2 className="w-5 h-5 mr-2 text-green-500" /> Completed</h3>
          <div className="space-y-3">
            {tasks.filter(t => t.status === 'Completed').map(t => (
              <div key={t.id} className="p-3 bg-green-50 rounded-lg border border-green-100">
                <h4 className="font-semibold text-gray-900 line-through">{t.title}</h4>
              </div>
            ))}
            {tasks.filter(t => t.status === 'Completed').length === 0 && (
              <p className="text-xs text-gray-400 text-center py-6">No completed tasks</p>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-[500px] max-w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Add Task</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <input required value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} className="w-full border-gray-300 rounded-lg p-2 border" placeholder="Task Title" />
              <textarea value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} className="w-full border-gray-300 rounded-lg p-2 border" placeholder="Description"></textarea>
              <div className="grid grid-cols-2 gap-4">
                <input type="date" value={newTask.dueDate} onChange={e => setNewTask({...newTask, dueDate: e.target.value})} className="w-full border-gray-300 rounded-lg p-2 border" />
                <select value={newTask.status} onChange={e => setNewTask({...newTask, status: e.target.value})} className="w-full border-gray-300 rounded-lg p-2 border">
                  <option>Pending</option><option>In Progress</option><option>Completed</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Save Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
