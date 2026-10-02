import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Pencil,
  Trash2,
  HeartHandshake, 
  Plus, 
  Award, 
  Smile, 
  ThumbsUp, 
  BarChart2, 
  Calendar, 
  User, 
  Send, 
  CheckCircle2, 
  Sparkles, 
  X,
  MessageCircle,
  HelpCircle,
  TrendingUp,
  Star
} from 'lucide-react';
import HRNavigation from '../../components/HRNavigation';

interface SurveyItem {
  id: string;
  title: string;
  description: string;
  category: string;
  questions: any[];
  deadline: string;
  responsesCount: number;
  averageScore: number;
  status: string;
}

interface KudosItem {
  id: string;
  senderName: string;
  recipientName: string;
  category: string;
  message: string;
  points: number;
  timestamp: string;
}

export default function EmployeeEngagement() {
  const [activeTab, setActiveTab] = useState<'kudos' | 'surveys'>('kudos');
  const [surveys, setSurveys] = useState<SurveyItem[]>([]);
  const [kudos, setKudos] = useState<KudosItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showKudosModal, setShowKudosModal] = useState(false);
  const [showEditKudosModal, setShowEditKudosModal] = useState(false);
  const [editingKudos, setEditingKudos] = useState<any>(null);
  const [showEditSurveyModal, setShowEditSurveyModal] = useState(false);
  const [editingSurvey, setEditingSurvey] = useState<any>(null);
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [activeSurveyToTake, setActiveSurveyToTake] = useState<SurveyItem | null>(null);

  // Kudos Form
  const [newKudos, setNewKudos] = useState({
    senderName: '',
    recipientName: '',
    category: 'Team Player',
    message: '',
    points: 100
  });

  // Survey Form
  const [newSurvey, setNewSurvey] = useState({
    title: '',
    description: '',
    category: 'eNPS & Culture',
    deadline: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  });

  const [surveyResponseRating, setSurveyResponseRating] = useState('9');
  const [surveyResponseFeedback, setSurveyResponseFeedback] = useState('');

  const fetchEngagementData = async () => {
    try {
      const [surveysRes, kudosRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hr/engagement/surveys`),
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hr/engagement/kudos`)
      ]);
      setSurveys(surveysRes.data || []);
      setKudos(kudosRes.data || []);
    } catch (err) {
      console.error('Failed to fetch engagement data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEngagementData();
  }, []);

  const handleOpenEditKudos = (item: KudosItem) => {
    setEditingKudos({ ...item });
    setShowEditKudosModal(true);
  };

  const handleUpdateKudos = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingKudos) return;
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hr/engagement/kudos/${editingKudos.id}`, editingKudos);
      setShowEditKudosModal(false);
      setEditingKudos(null);
      fetchEngagementData();
    } catch (err) {
      console.error(err);
      alert('Failed to update kudos');
    }
  };

  const handleDeleteKudos = async (id: string) => {
    if (!window.confirm('Delete this kudos recognition from the wall?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hr/engagement/kudos/${id}`);
      fetchEngagementData();
    } catch (err) {
      console.error(err);
      alert('Failed to delete kudos');
    }
  };

  const handleOpenEditSurvey = (s: SurveyItem) => {
    setEditingSurvey({ ...s });
    setShowEditSurveyModal(true);
  };

  const handleUpdateSurvey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSurvey) return;
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hr/engagement/surveys/${editingSurvey.id}`, editingSurvey);
      setShowEditSurveyModal(false);
      setEditingSurvey(null);
      fetchEngagementData();
    } catch (err) {
      console.error(err);
      alert('Failed to update survey');
    }
  };

  const handleDeleteSurvey = async (id: string) => {
    if (!window.confirm('Delete this pulse survey?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hr/engagement/surveys/${id}`);
      fetchEngagementData();
    } catch (err) {
      console.error(err);
      alert('Failed to delete survey');
    }
  };

  const handleSendKudos = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hr/engagement/kudos`, newKudos);
      setShowKudosModal(false);
      setNewKudos({
        senderName: '',
        recipientName: '',
        category: 'Team Player',
        message: '',
        points: 100
      });
      fetchEngagementData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateSurvey = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hr/engagement/surveys`, newSurvey);
      setShowSurveyModal(false);
      setNewSurvey({
        title: '',
        description: '',
        category: 'eNPS & Culture',
        deadline: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
      });
      fetchEngagementData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitSurveyResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSurveyToTake) return;
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hr/engagement/surveys/${activeSurveyToTake.id}/respond`, {
        rating: surveyResponseRating,
        feedback: surveyResponseFeedback
      });
      setActiveSurveyToTake(null);
      setSurveyResponseFeedback('');
      fetchEngagementData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSeedSample = async () => {
    const sampleKudos = [
      {
        senderName: 'Aditi Deshmukh',
        recipientName: 'Karan Mehra',
        category: 'Innovation Star',
        message: 'Tremendous work architecting our new offline database synchronization! Solved critical latency bottlenecks for our field reps.',
        points: 250
      },
      {
        senderName: 'Rohit Verma',
        recipientName: 'Priya Sharma',
        category: 'Customer Hero',
        message: 'Handled our client escalation with outstanding empathy and lightning resolution. You are a rockstar!',
        points: 150
      }
    ];

    const sampleSurvey = {
      title: 'Q3 Workplace Wellbeing & Culture Pulse',
      description: 'Help leadership understand your work-life balance, management support, and team collaboration satisfaction.',
      category: 'eNPS & Culture',
      deadline: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0]
    };

    for (const k of sampleKudos) {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hr/engagement/kudos`, k);
    }
    await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/hr/engagement/surveys`, sampleSurvey);

    fetchEngagementData();
  };

  const totalPointsAwarded = kudos.reduce((acc, k) => acc + (k.points || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top HR Navigation */}
      <HRNavigation />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-rose-50 text-rose-700 rounded-lg">
              <HeartHandshake className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">Culture, Recognition & Pulse</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Employee Engagement & Kudos</h1>
          <p className="text-sm text-gray-500 mt-1 max-w-2xl">
            Promote peer appreciation, celebrate milestones, collect anonymous sentiment with pulse surveys, and monitor workforce happiness indices.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {kudos.length === 0 && surveys.length === 0 && (
            <button
              onClick={handleSeedSample}
              className="px-3.5 py-2 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-rose-600" />
              <span>Simulate Engagement</span>
            </button>
          )}
          <button
            onClick={() => setShowSurveyModal(true)}
            className="px-3.5 py-2 text-xs font-bold bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-xl border border-purple-200 transition-colors flex items-center gap-1.5"
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>New Pulse Survey</span>
          </button>
          <button
            onClick={() => setShowKudosModal(true)}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2"
          >
            <Award className="w-4 h-4" />
            <span>Give Kudos</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Kudos Given</p>
            <h3 className="text-3xl font-extrabold text-rose-600 mt-1">{kudos.length}</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Peer recognitions shared</p>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
            <HeartHandshake className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Reward Points</p>
            <h3 className="text-3xl font-extrabold text-amber-600 mt-1">{totalPointsAwarded}</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Recognition reward wallet</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <Star className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active Surveys</p>
            <h3 className="text-3xl font-extrabold text-purple-600 mt-1">{surveys.length}</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Live anonymous feedback</p>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
            <BarChart2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Employee eNPS</p>
            <h3 className="text-3xl font-extrabold text-emerald-600 mt-1">
              {kudos.length > 0 ? '+68' : '0'}
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Net promoter satisfaction</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <Smile className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tabs Switcher: Kudos Wall vs Pulse Surveys */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('kudos')}
          className={`px-5 py-3 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 border-b-2 ${
            activeTab === 'kudos'
              ? 'text-rose-600 border-rose-600'
              : 'text-gray-400 border-transparent hover:text-gray-700'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Peer Kudos & Recognition Wall ({kudos.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('surveys')}
          className={`px-5 py-3 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 border-b-2 ${
            activeTab === 'surveys'
              ? 'text-purple-600 border-purple-600'
              : 'text-gray-400 border-transparent hover:text-gray-700'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>Pulse Surveys & Sentiment ({surveys.length})</span>
        </button>
      </div>

      {/* TAB 1: KUDOS WALL */}
      {activeTab === 'kudos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {kudos.length === 0 ? (
            <div className="col-span-2 bg-white p-12 rounded-2xl border border-dashed border-gray-300 text-center">
              <HeartHandshake className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-700">No Kudos on the Wall Yet</h3>
              <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                Be the first to recognize a colleague for outstanding teamwork or innovation.
              </p>
            </div>
          ) : (
            kudos.map((item) => (
              <div
                key={item.id}
                className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs hover:border-rose-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                      {item.category}
                    </span>
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      +{item.points} Pts
                    </span>
                  </div>

                  <p className="text-xs text-gray-700 italic leading-relaxed bg-rose-50/30 p-3.5 rounded-xl border border-rose-100">
                    "{item.message}"
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-[11px]">
                      {item.senderName.charAt(0)}
                    </div>
                    <span><strong>{item.senderName}</strong> recognized <strong>{item.recipientName}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-gray-400">{item.timestamp.split('T')[0]}</span>
                    <button
                      onClick={() => handleOpenEditKudos(item)}
                      className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Edit Kudos"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteKudos(item.id)}
                      className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Kudos"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: PULSE SURVEYS */}
      {activeTab === 'surveys' && (
        <div className="space-y-4">
          {surveys.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-dashed border-gray-300 text-center">
              <BarChart2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-700">No active pulse surveys</h3>
              <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                Launch a survey to gather anonymous feedback on work culture, tools, and leadership.
              </p>
            </div>
          ) : (
            surveys.map((survey) => (
              <div
                key={survey.id}
                className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs hover:border-purple-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">
                      {survey.category}
                    </span>
                    <span className="text-[10px] text-gray-400">Deadline: {survey.deadline}</span>
                  </div>
                  <h3 className="text-base font-bold text-gray-900">{survey.title}</h3>
                  <p className="text-xs text-gray-500 max-w-2xl">{survey.description}</p>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-600 pt-2">
                    <span><strong>{survey.responsesCount}</strong> Responses Received</span>
                    <span>•</span>
                    <span>Avg Score: <strong className="text-purple-700">{survey.averageScore}/10</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                  <button
                    onClick={() => handleOpenEditSurvey(survey)}
                    className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-colors border border-gray-200"
                    title="Edit Survey"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteSurvey(survey.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-gray-200"
                    title="Delete Survey"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setActiveSurveyToTake(survey)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Participate Anonymously</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* SEND KUDOS MODAL */}
      {showKudosModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-rose-600" />
                <h3 className="text-base font-bold text-gray-900">Recognize a Colleague</h3>
              </div>
              <button onClick={() => setShowKudosModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendKudos} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Your Name *</label>
                <input
                  type="text"
                  required
                  value={newKudos.senderName}
                  onChange={(e) => setNewKudos({ ...newKudos, senderName: e.target.value })}
                  placeholder="e.g. Aditi Deshmukh"
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Recipient Colleague *</label>
                <input
                  type="text"
                  required
                  value={newKudos.recipientName}
                  onChange={(e) => setNewKudos({ ...newKudos, recipientName: e.target.value })}
                  placeholder="e.g. Karan Mehra"
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Recognition Badge</label>
                  <select
                    value={newKudos.category}
                    onChange={(e) => setNewKudos({ ...newKudos, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-rose-500 outline-none bg-white"
                  >
                    <option value="Team Player">Team Player</option>
                    <option value="Innovation Star">Innovation Star</option>
                    <option value="Customer Hero">Customer Hero</option>
                    <option value="Leadership Impact">Leadership Impact</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Points to Gift</label>
                  <input
                    type="number"
                    value={newKudos.points}
                    onChange={(e) => setNewKudos({ ...newKudos, points: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-rose-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Appreciation Message *</label>
                <textarea
                  rows={3}
                  required
                  value={newKudos.message}
                  onChange={(e) => setNewKudos({ ...newKudos, message: e.target.value })}
                  placeholder="Share specifically what they did that inspired you..."
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowKudosModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  Publish Kudos to Wall
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LAUNCH SURVEY MODAL */}
      {showSurveyModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-bold text-gray-900">Launch Pulse Survey</h3>
              </div>
              <button onClick={() => setShowSurveyModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSurvey} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Survey Title *</label>
                <input
                  type="text"
                  required
                  value={newSurvey.title}
                  onChange={(e) => setNewSurvey({ ...newSurvey, title: e.target.value })}
                  placeholder="e.g. Work From Home Tooling & Ergonomics Survey"
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Context / Description *</label>
                <textarea
                  rows={2}
                  required
                  value={newSurvey.description}
                  onChange={(e) => setNewSurvey({ ...newSurvey, description: e.target.value })}
                  placeholder="Briefly state why you are collecting this sentiment..."
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Category</label>
                  <select
                    value={newSurvey.category}
                    onChange={(e) => setNewSurvey({ ...newSurvey, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-purple-500 outline-none bg-white"
                  >
                    <option value="eNPS & Culture">eNPS & Culture</option>
                    <option value="Management Feedback">Management Feedback</option>
                    <option value="Benefits & Perks">Benefits & Perks</option>
                    <option value="Remote Work">Remote Work</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Close Deadline</label>
                  <input
                    type="date"
                    value={newSurvey.deadline}
                    onChange={(e) => setNewSurvey({ ...newSurvey, deadline: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowSurveyModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  Deploy Survey to Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAKE SURVEY MODAL */}
      {activeSurveyToTake && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-900">{activeSurveyToTake.title}</h3>
                <p className="text-[10px] text-emerald-600 font-semibold">🔒 100% Anonymous Response</p>
              </div>
              <button onClick={() => setActiveSurveyToTake(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitSurveyResponse} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">
                  Overall rating from 1 (Poor) to 10 (Outstanding)
                </label>
                <div className="flex items-center justify-between gap-1">
                  {['1','2','3','4','5','6','7','8','9','10'].map((val) => (
                    <button
                      type="button"
                      key={val}
                      onClick={() => setSurveyResponseRating(val)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                        surveyResponseRating === val
                          ? 'bg-purple-600 text-white scale-110 shadow-sm'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Qualitative Suggestions / Comments
                </label>
                <textarea
                  rows={3}
                  value={surveyResponseFeedback}
                  onChange={(e) => setSurveyResponseFeedback(e.target.value)}
                  placeholder="What can we do to improve your daily experience?..."
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setActiveSurveyToTake(null)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  Submit Anonymous Response
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT KUDOS MODAL */}
      {showEditKudosModal && editingKudos && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                  <Pencil className="w-5 h-5" />
                </span>
                <h3 className="text-base font-bold text-gray-900">Edit Kudos Recognition</h3>
              </div>
              <button onClick={() => setShowEditKudosModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateKudos} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Sender Name *</label>
                <input
                  type="text"
                  required
                  value={editingKudos.senderName}
                  onChange={(e) => setEditingKudos({ ...editingKudos, senderName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Recipient Colleague *</label>
                <input
                  type="text"
                  required
                  value={editingKudos.recipientName}
                  onChange={(e) => setEditingKudos({ ...editingKudos, recipientName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Recognition Badge</label>
                  <select
                    value={editingKudos.category}
                    onChange={(e) => setEditingKudos({ ...editingKudos, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-rose-500 outline-none bg-white"
                  >
                    <option value="Team Player">Team Player</option>
                    <option value="Innovation Star">Innovation Star</option>
                    <option value="Customer Hero">Customer Hero</option>
                    <option value="Leadership Impact">Leadership Impact</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Points</label>
                  <input
                    type="number"
                    value={editingKudos.points}
                    onChange={(e) => setEditingKudos({ ...editingKudos, points: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-rose-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Appreciation Note *</label>
                <textarea
                  rows={3}
                  required
                  value={editingKudos.message}
                  onChange={(e) => setEditingKudos({ ...editingKudos, message: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowEditKudosModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  Save Kudos
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT SURVEY MODAL */}
      {showEditSurveyModal && editingSurvey && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                  <Pencil className="w-5 h-5" />
                </span>
                <h3 className="text-base font-bold text-gray-900">Edit Pulse Survey</h3>
              </div>
              <button onClick={() => setShowEditSurveyModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSurvey} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Survey Title *</label>
                <input
                  type="text"
                  required
                  value={editingSurvey.title}
                  onChange={(e) => setEditingSurvey({ ...editingSurvey, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Objective / Description</label>
                <textarea
                  rows={2}
                  value={editingSurvey.description}
                  onChange={(e) => setEditingSurvey({ ...editingSurvey, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Category</label>
                  <select
                    value={editingSurvey.category}
                    onChange={(e) => setEditingSurvey({ ...editingSurvey, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-purple-500 outline-none bg-white"
                  >
                    <option value="eNPS & Culture">eNPS & Culture</option>
                    <option value="Manager & Leadership">Manager & Leadership</option>
                    <option value="Wellness & Work-Life">Wellness & Work-Life</option>
                    <option value="Tooling & Productivity">Tooling & Productivity</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Response Deadline</label>
                  <input
                    type="date"
                    value={editingSurvey.deadline}
                    onChange={(e) => setEditingSurvey({ ...editingSurvey, deadline: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowEditSurveyModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  Save Survey
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
