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
        const discType = userProfile.discProfile?.dominantType || 'Unknown';
        const results = await discoverRoles(userProfile.resumeText, discType);
        
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
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Analyzing your potential...</h2>
        <p className="text-slate-500 max-w-md">Our AI is mapping your skills from your resume and personality traits to high-growth career paths.</p>
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
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-3">Your Top Matches</h2>
        <p className="text-slate-600">Based on your {userProfile.discProfile?.dominantType}-Type personality and experience, here are your best pivot options.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {roles.map((role, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden flex flex-col hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
            <div className="h-2 bg-gradient-to-r from-indigo-500 to-teal-400"></div>
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-slate-800">{role.title}</h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {role.matchScore}% Match
                </span>
              </div>
              
              <p className="text-slate-600 text-sm mb-6 flex-grow leading-relaxed">
                {role.reasoning}
              </p>

              <div className="mb-6">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Skill Gaps to Close</p>
                <div className="flex flex-wrap gap-2">
                  {role.skillsGap.slice(0, 3).map((skill, i) => (
                    <span key={i} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <Button 
                onClick={() => onRoleSelect(role)}
                className="w-full justify-center"
              >
                Select & Plan Transition
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};