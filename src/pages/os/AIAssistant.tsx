import { useState } from 'react';
import { Bot, Send, User, Sparkles, Building2, Briefcase } from 'lucide-react';
import OSNavigation from '../../components/OSNavigation';

export default function AIAssistant() {
  const [activeTab, setActiveTab] = useState('sales');
  const [messages, setMessages] = useState<{role: string, content: string}[]>([
    { role: 'ai', content: 'Hello! I am your AI Sales Assistant. How can I help you analyze your CRM data today?' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');

    // Mock AI Response
    setTimeout(() => {
      let aiResponse = "I'm analyzing that for you now...";
      if (activeTab === 'sales') {
        aiResponse = "Based on the data, Kumar Motors hasn't purchased in 42 days. They historically order ₹1.5 lakh every 45 days. I have drafted an email for you to follow up.";
      } else if (activeTab === 'hr') {
        aiResponse = "You currently have 14 days of Paid Leave and 5 days of Casual Leave remaining for 2026. Would you like me to open a leave request form?";
      } else if (activeTab === 'manager') {
        aiResponse = "Sales fell by 12% this month primarily due to a 40% drop in conversions from the 'Website' lead source, and 3 key sales reps taking overlapping vacations. I recommend redistributing the inbound queue.";
      }
      setMessages(prev => [...prev, { role: 'ai', content: aiResponse }]);
    }, 1000);
  };

  const switchTab = (tab: string) => {
    setActiveTab(tab);
    setMessages([{ 
      role: 'ai', 
      content: tab === 'sales' ? 'Hello! I am your AI Sales Assistant. Ask me about leads or follow-ups.' 
        : tab === 'hr' ? 'Hi! I am your AI HR Assistant. Ask me about your leaves, payroll, or company policies.'
        : 'Welcome, Boss. I am your AI Management Assistant. What business metrics should we analyze?'
    }]);
  };

  return (
    <div className="space-y-6">
      <OSNavigation />
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <Sparkles className="w-6 h-6 mr-2 text-purple-600" /> AI Business Engine
          </h2>
          <p className="text-gray-500 text-sm mt-1">Talk to your data naturally.</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button onClick={() => switchTab('sales')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${activeTab === 'sales' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>
            <Briefcase className="w-4 h-4 mr-2" /> Sales AI
          </button>
          <button onClick={() => switchTab('hr')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${activeTab === 'hr' ? 'bg-white shadow-sm text-green-600' : 'text-gray-600 hover:text-gray-900'}`}>
            <User className="w-4 h-4 mr-2" /> Employee AI
          </button>
          <button onClick={() => switchTab('manager')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${activeTab === 'manager' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-600 hover:text-gray-900'}`}>
            <Building2 className="w-4 h-4 mr-2" /> Manager AI
          </button>
        </div>
      </div>

      <div className="min-h-[550px] bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-blue-600 ml-3' : 'bg-purple-600 mr-3'}`}>
                  {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-5 h-5 text-white" />}
                </div>
                <div className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'}`}>
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-4 bg-white border-t border-gray-100">
          <form onSubmit={handleSend} className="flex space-x-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask the ${activeTab} AI...`}
              className="flex-1 border-gray-300 rounded-xl p-3 border focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
            />
            <button type="submit" disabled={!input.trim()} className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-medium shadow-sm transition-colors flex items-center">
              <Send className="w-5 h-5 mr-2" /> Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
