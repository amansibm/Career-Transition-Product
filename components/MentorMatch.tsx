import React, { useEffect, useState } from 'react';
import { Mentor, SuggestedRole } from '../types';
import { generateMentorPersona } from '../services/geminiService';
import { Button } from './Button';

interface MentorMatchProps {
  role: SuggestedRole;
  onMatchConfirmed: (mentor: Mentor) => void;
}

export const MentorMatch: React.FC<MentorMatchProps> = ({ role, onMatchConfirmed }) => {
  const [status, setStatus] = useState<'searching' | 'analyzing' | 'found'>('searching');
  const [matchedMentor, setMatchedMentor] = useState<Mentor | null>(null);

  useEffect(() => {
    let mounted = true;

    const findMentor = async () => {
      // Step 1: Simulate searching network
      await new Promise(resolve => setTimeout(resolve, 1500));
      if (mounted) setStatus('analyzing');
      
      // Step 2: Generate specific mentor profile via AI
      const mentor = await generateMentorPersona(role.title);
      
      if (mounted) {
        setMatchedMentor(mentor);
        setStatus('found');
      }
    };

    findMentor();
    return () => { mounted = false; };
  }, [role.title]);

  if (status !== 'found') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="relative w-24 h-24 mb-8">
           <span className="absolute inset-0 rounded-full border-4 border-slate-100"></span>
           <span className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></span>
           <div className="absolute inset-0 flex items-center justify-center">
             <span className="text-3xl">🤝</span>
           </div>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          {status === 'searching' ? 'Scanning Professional Network...' : 'Identifying Best Match...'}
        </h2>
        <p className="text-slate-500 max-w-md">
          Finding a senior leader in <span className="font-semibold text-indigo-600">{role.title}</span> who matches your background.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 text-center animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 md:p-12 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
        
        <div className="mb-6">
          <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-semibold mb-4">
            Perfect Mentor Found
          </span>
          <img 
            src={matchedMentor?.avatarUrl} 
            alt={matchedMentor?.name}
            className="w-32 h-32 rounded-full mx-auto border-4 border-white shadow-lg bg-slate-100 object-cover"
          />
        </div>

        <h2 className="text-3xl font-bold text-slate-900 mb-1">{matchedMentor?.name}</h2>
        <p className="text-indigo-600 font-medium text-lg mb-4">{matchedMentor?.role} at {matchedMentor?.company}</p>
        
        <blockquote className="text-slate-600 italic mb-8 border-l-4 border-indigo-100 pl-4 text-left mx-auto max-w-md bg-slate-50 p-4 rounded-r-lg">
          "{matchedMentor?.bio}"
        </blockquote>

        <div className="space-y-4">
          <p className="text-sm text-slate-500">
            {matchedMentor?.name.split(' ')[0]} has deep expertise in {role.title} and is ready to guide your transition.
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