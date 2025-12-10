import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, Roadmap, Mentor, ChatMessage } from '../types';
import { chatWithMentor } from '../services/geminiService';
import { PitchEngine } from './PitchEngine';
import { Button } from './Button';

interface DashboardProps {
  userProfile: UserProfile;
  roadmap: Roadmap;
  mentor: Mentor;
}

export const Dashboard: React.FC<DashboardProps> = ({ userProfile, roadmap, mentor }) => {
  const [activeTab, setActiveTab] = useState<'roadmap' | 'tools'>('roadmap');
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'mentor',
      text: `Hi ${userProfile.name}! I'm ${mentor.name.split(' ')[0]}. I've reviewed your plan. Ready to start Week 1?`,
      timestamp: new Date()
    }
  ]);
  const [isChatting, setIsChatting] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatting) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: chatInput,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsChatting(true);

    // Prepare history for API
    const history = messages.map(m => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }));

    // Add current message to history context
    history.push({ role: 'user', parts: [{ text: userMsg.text }] });

    const responseText = await chatWithMentor(
      history, 
      userMsg.text, 
      mentor.name, 
      userProfile.targetRole?.title || 'Tech'
    );

    const mentorMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      sender: 'mentor',
      text: responseText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, mentorMsg]);
    setIsChatting(false);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">P</div>
          <h1 className="font-bold text-slate-900">PivotPath</h1>
        </div>
        <div className="flex items-center gap-4">
           <span className="text-sm text-slate-500 hidden md:inline">Current Goal: <span className="font-medium text-indigo-600">{userProfile.targetRole?.title}</span></span>
           <img src={mentor.avatarUrl} className="w-8 h-8 rounded-full border border-slate-200" alt="Mentor" />
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar (Desktop) / Tab Content (Mobile) */}
        <div className="flex-1 flex flex-col min-w-0 md:max-w-2xl lg:max-w-3xl border-r border-slate-200 bg-white overflow-hidden">
          <div className="flex border-b border-slate-200">
             <button 
               onClick={() => setActiveTab('roadmap')}
               className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'roadmap' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
             >
               My Roadmap
             </button>
             <button 
               onClick={() => setActiveTab('tools')}
               className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'tools' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
             >
               Application Tools
             </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
            {activeTab === 'roadmap' && (
              <div className="space-y-4">
                {roadmap.weeks.map((week) => (
                  <div key={week.weekNumber} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-bold text-slate-800">Week {week.weekNumber}: {week.theme}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${week.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                        {week.status === 'pending' ? 'Upcoming' : week.status}
                      </span>
                    </div>
                    <ul className="space-y-2">
                       {week.tasks.map((task, i) => (
                         <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                           <input type="checkbox" className="mt-1 rounded text-indigo-600 focus:ring-indigo-500" />
                           <span>{task}</span>
                         </li>
                       ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'tools' && (
               <PitchEngine resumeText={userProfile.resumeText} />
            )}
          </div>
        </div>

        {/* Right Sidebar (Chat) */}
        <div className="w-80 lg:w-96 flex flex-col bg-white shrink-0 shadow-xl z-10 hidden md:flex">
          <div className="p-4 border-b border-slate-100 bg-indigo-50/50 flex items-center gap-3">
            <div className="relative">
              <img src={mentor.avatarUrl} className="w-10 h-10 rounded-full" alt={mentor.name} />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div>
              <p className="font-bold text-sm text-slate-900">{mentor.name}</p>
              <p className="text-xs text-slate-500">Career Ally</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                  msg.sender === 'user' 
                    ? 'bg-indigo-600 text-white rounded-br-none' 
                    : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isChatting && (
               <div className="flex justify-start">
                  <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                    </div>
                  </div>
               </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-4 border-t border-slate-200 bg-white">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input 
                type="text" 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask for advice..."
                className="flex-1 text-sm border border-slate-200 rounded-full px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <Button type="submit" variant="primary" disabled={!chatInput.trim() || isChatting} className="rounded-full px-4">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};