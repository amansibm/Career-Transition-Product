import React, { useEffect, useState } from 'react';
import { Roadmap, UserProfile, Mentor } from '../types';
import { generateRoadmap } from '../services/geminiService';
import { Button } from './Button';

interface RoadmapViewProps {
  userProfile: UserProfile;
  mentor: Mentor;
  onComplete: (roadmap: Roadmap) => void;
}

export const RoadmapView: React.FC<RoadmapViewProps> = ({ userProfile, mentor, onComplete }) => {
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const createPlan = async () => {
      if (!userProfile.targetRole || !userProfile.resumeText) return;
      
      const plan = await generateRoadmap(userProfile.targetRole.title, userProfile.resumeText);
      if (mounted) {
        setRoadmap(plan);
        setLoading(false);
      }
    };
    createPlan();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="w-12 h-12 bg-indigo-600 rounded-lg animate-bounce mb-4"></div>
        <h2 className="text-xl font-bold text-slate-800">Generating your 90-day Blueprint...</h2>
        <p className="text-slate-500 mt-2">{mentor.name.split(' ')[0]} is curating the best resources for you.</p>
      </div>
    );
  }

  if (!roadmap) return <div>Error loading roadmap.</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 animate-fadeIn pb-24">
      <div className="bg-indigo-900 text-white rounded-2xl p-8 mb-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-indigo-500 rounded-full opacity-20 blur-3xl"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Your 90-Day Transition Roadmap</h1>
          <p className="text-indigo-200 text-lg max-w-2xl">{roadmap.overview}</p>
        </div>
      </div>

      <div className="space-y-6">
        {roadmap.weeks.map((week, index) => (
          <div key={index} className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-indigo-50 text-indigo-700 rounded-lg flex items-center justify-center font-bold text-lg">
                W{week.weekNumber}
              </div>
              <div className="flex-grow">
                <h3 className="text-lg font-bold text-slate-900 mb-1">{week.theme}</h3>
                <ul className="space-y-3 mt-4">
                  {week.tasks.map((task, tIndex) => (
                    <li key={tIndex} className="flex items-start gap-3 text-slate-600 group">
                      <div className="mt-1 w-4 h-4 rounded border border-slate-300 group-hover:border-indigo-500 transition-colors"></div>
                      <span className="text-sm leading-relaxed">{task}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 p-4 shadow-lg flex justify-center z-50">
        <Button 
          onClick={() => roadmap && onComplete(roadmap)}
          className="w-full max-w-md shadow-indigo-200 shadow-lg"
        >
          Confirm Plan & Enter Dashboard
        </Button>
      </div>
    </div>
  );
};