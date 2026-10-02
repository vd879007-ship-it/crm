import { useState, useEffect } from 'react';
import axios from 'axios';
import { FolderGit2, CheckCircle2, Clock, Calendar, Plus, Trash2, Pencil } from 'lucide-react';
import ERPNavigation from '../../components/ERPNavigation';

export default function Projects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [editProjectForm, setEditProjectForm] = useState({ name: '', description: '', status: 'Planning', startDate: '', endDate: '' });

  const handleOpenEdit = (p: any) => {
    setEditingProject(p);
    setEditProjectForm({
      name: p.name,
      description: p.description,
      status: p.status,
      startDate: p.startDate ? p.startDate.split('T')[0] : '',
      endDate: p.endDate ? p.endDate.split('T')[0] : ''
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/erp/projects/${editingProject.id}`, editProjectForm);
      setShowEditModal(false);
      fetchProjects();
    } catch (err) {
      console.error(err);
      alert('Failed to update project');
    }
  };
  const [newProject, setNewProject] = useState({ name: '', description: '', status: 'Planning', startDate: '', endDate: '' });

  const fetchProjects = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/erp/projects`);
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/erp/projects`, newProject);
      setShowModal(false);
      setNewProject({ name: '', description: '', status: 'Planning', startDate: '', endDate: '' });
      fetchProjects();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/erp/projects/${id}`);
      fetchProjects();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Active': return 'bg-blue-100 text-blue-700';
      case 'Completed': return 'bg-green-100 text-green-700';
      case 'On Hold': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700'; // Planning
    }
  };

  return (
    <div className="space-y-6">
      <ERPNavigation />
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Project Management</h2>
        <button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center font-medium shadow-sm transition-colors">
          <Plus className="w-5 h-5 mr-2" /> New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <FolderGit2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-700">No active projects</h3>
          <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">Get started by creating your first milestone, deliverable or enterprise project.</p>
          <button onClick={() => setShowModal(true)} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-xs transition-colors">
            + New Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(p => (
            <div key={p.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                  <FolderGit2 className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(p.status)}`}>
                    {p.status}
                  </span>
                  <button
                    onClick={() => handleDelete(p.id)}
                    title="Delete Project"
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">{p.name}</h3>
              <p className="text-sm text-gray-500 flex-1">{p.description}</p>
              
              <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
                {p.startDate && (
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                    {new Date(p.startDate).toLocaleDateString()}
                  </div>
                )}
                {p.endDate && (
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1 text-gray-400" />
                    {new Date(p.endDate).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-[500px] max-w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Create New Project</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <input required value={newProject.name} onChange={e => setNewProject({...newProject, name: e.target.value})} className="w-full border-gray-300 rounded-lg p-2 border" placeholder="Project Name" />
              <textarea required value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})} className="w-full border-gray-300 rounded-lg p-2 border" placeholder="Project Objectives / Description" rows={3}></textarea>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
                  <input type="date" value={newProject.startDate} onChange={e => setNewProject({...newProject, startDate: e.target.value})} className="w-full border-gray-300 rounded-lg p-2 border" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Target End Date</label>
                  <input type="date" value={newProject.endDate} onChange={e => setNewProject({...newProject, endDate: e.target.value})} className="w-full border-gray-300 rounded-lg p-2 border" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Initial Status</label>
                  <select value={newProject.status} onChange={e => setNewProject({...newProject, status: e.target.value})} className="w-full border-gray-300 rounded-lg p-2 border bg-white">
                    <option>Planning</option><option>Active</option><option>Completed</option><option>On Hold</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Create Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
