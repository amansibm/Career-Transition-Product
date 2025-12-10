import React, { useEffect, useState } from 'react';
import { Mentor, SuggestedRole } from '../types';
import { Button } from './Button';

interface MentorMatchProps {
  role: SuggestedRole;
  onMatchConfirmed: (mentor: Mentor) => void;
}

const MENTOR_PERSONAS: Mentor[] = [
  {
    name: "Elena Rodriguez",
    role: "Senior Product Manager",
    company: "TechFlow Inc.",
    bio: "Transitioned from Marketing to Product 5 years ago. Expert in stakeholder management and agile workflows.",
    avatarUrl: "https://picsum.photos/200/200?random=1"
  },
  {
    name: "David Chen",
    role: "Lead Data Scientist",
    company: "DataSphere",
    bio: "Former academic researcher who moved into industry. passionate about practical ML applications.",
    avatarUrl: "https://picsum.photos/200/200?random=2"
  },
  {
    name: "Sarah Jenkins",
    role: "UX Research Director",
    company: "Creative Pulse",
    bio: "Psychology background turned UX leader. Helps career switchers build portfolios that tell a story.",
    avatarUrl: "https://picsum.photos/200/200?random=3"
  }
];

export const MentorMatch: React.FC<MentorMatchProps> = ({ role, onMatchConfirmed }) => {
  const [status, setStatus] = useState<'searching' | 'found'>('searching');
  const [matchedMentor, setMatchedMentor] = useState<Mentor | null>(null);

  useEffect(() => {
    // Simulate searching algorithm
    const timer = setTimeout(() => {
      // Simple random selection for demo, ideally would match based on role title
      const mentor = MENTOR_PERSONAS[Math.floor(Math.random() * MENTOR_PERSONAS.length)];
      setMatchedMentor(mentor);
      setStatus('found');
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  if (status === 'searching') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="relative w-24 h-24 mb-8">
           <span className="absolute inset-0 rounded-full border-4 border-slate-100"></span>
           <span className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></span>
           <div className="absolute inset-0 flex items-center justify-center">
             <span className="text-3xl">🤝</span>
           </div>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Finding your Career Ally...</h2>
        <p className="text-slate-500">Scanning our network for mentors who have successfully transitioned into {role.title}.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 text-center animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 md:p-12 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
        
        <div className="mb-6">
          <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-semibold mb-4">
            It's a Match!
          </span>
          <img 
            src={matchedMentor?.avatarUrl} 
            alt={matchedMentor?.name}
            className="w-32 h-32 rounded-full mx-auto border-4 border-white shadow-lg object-cover"
          />
        </div>

        <h2 className="text-3xl font-bold text-slate-900 mb-1">{matchedMentor?.name}</h2>
        <p className="text-indigo-600 font-medium mb-4">{matchedMentor?.role} at {matchedMentor?.company}</p>
        
        <blockquote className="text-slate-600 italic mb-8 border-l-4 border-indigo-100 pl-4 text-left mx-auto max-w-md bg-slate-50 p-4 rounded-r-lg">
          "{matchedMentor?.bio}"
        </blockquote>

        <div className="space-y-3">
          <p className="text-sm text-slate-500">
            {matchedMentor?.name.split(' ')[0]} will guide you through your 90-day plan to become a {role.title}.
          </p>
          <Button 
            onClick={() => matchedMentor && onMatchConfirmed(matchedMentor)}
            className="w-full md:w-auto px-8 py-3 text-lg"
          >
            Meet Your Ally & Start Plan
          </Button>
        </div>
      </div>
    </div>
  );
};