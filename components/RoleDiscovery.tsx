import React, { useEffect, useState } from 'react';
import { UserProfile, SuggestedRole } from '../types';
import { discoverRoles } from '../services/geminiService';
import { Button } from './Button';

interface RoleDiscoveryProps {
  userProfile: UserProfile;
  onRoleSelect: (role: SuggestedRole) => void;
}

export const RoleDiscovery: React.FC<RoleDiscoveryProps> = ({ userProfile, onRoleSelect }) => {
  const [roles, setRoles] = useState<SuggestedRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const fetchRoles = async () => {
      try {
        if (!userProfile.resumeText) return;
        // Pass the entire profile object now
        const results = await discoverRoles(userProfile);
        
        if (mounted) {
          if (results.length === 0) {
            setError("We couldn't generate roles. Please try checking your resume content.");
          } else {
            setRoles(results);
          }
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError("An error occurred while analyzing your profile.");
          setLoading(false);
        }
      }
    };

    fetchRoles();

    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Finding your perfect pivot...</h2>
        <p className="text-slate-500 max-w-md">Our AI is analyzing your skills, constraints, and 5-year market trends.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-12">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-3">Your Top Career Pivots</h2>
        <p className="text-slate-600">Tailored to your {userProfile.financialRunway !== 'Long' ? 'timeline' : 'ambitions'} and skills.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {roles.map((role, idx) => (
          <div key={idx} className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden flex flex-col hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className={`h-2 bg-gradient-to-r ${idx === 0 ? 'from-indigo-500 to-indigo-300' : 'from-teal-500 to-teal-300'}`}></div>
            <div className="p-6 flex-1 flex flex-col">
              
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-slate-800">{role.title}</h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800">
                  {role.matchScore}% Match
                </span>
              </div>
              
              {/* Reasoning */}
              <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                {role.reasoning}
              </p>

              {/* 5-Year Journey Visualization */}
              <div className="mb-6 bg-slate-50 p-4 rounded-lg border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">5-Year Trajectory</p>
                <div className="relative pl-2 space-y-4">
                  {/* Vertical line connector */}
                  <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-indigo-100"></div>
                  
                  {role.careerJourney?.map((step, i) => (
                    <div key={i} className="relative flex items-center gap-3">
                      <div className={`w-1.5 h-1.5 rounded-full z-10 ${i === 0 ? 'bg-indigo-600 ring-4 ring-indigo-50' : 'bg-indigo-300'}`}></div>
                      <span className={`text-xs ${i === 0 ? 'font-bold text-slate-800' : 'text-slate-500'}`}>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Salary Projection */}
              <div className="mb-6">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Salary Potential</p>
                <div className="flex items-end justify-between text-sm bg-gradient-to-r from-emerald-50 to-white p-3 rounded-lg border border-emerald-50">
                   <div className="text-center">
                     <div className="text-emerald-600 font-bold">{role.salary?.starting || '$?'}</div>
                     <div className="text-[10px] text-slate-400">Entry</div>
                   </div>
                   <div className="text-slate-300 mb-1">→</div>
                   <div className="text-center">
                     <div className="text-emerald-700 font-bold opacity-80">{role.salary?.year2 || '$?'}</div>
                     <div className="text-[10px] text-slate-400">2 Yrs</div>
                   </div>
                   <div className="text-slate-300 mb-1">→</div>
                   <div className="text-center">
                     <div className="text-emerald-800 font-extrabold">{role.salary?.year5 || '$?'}</div>
                     <div className="text-[10px] text-slate-400">5 Yrs</div>
                   </div>
                </div>
              </div>

              {/* Skills Gap */}
              <div className="mb-6 flex-grow">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Focus Areas</p>
                <div className="flex flex-wrap gap-2">
                  {role.skillsGap.slice(0, 3).map((skill, i) => (
                    <span key={i} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md border border-slate-200">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <Button 
                onClick={() => onRoleSelect(role)}
                className="w-full justify-center"
              >
                Plan Transition
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};