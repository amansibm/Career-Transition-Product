import React, { useState } from 'react';
import { AppState, UserProfile, SuggestedRole, Mentor, Roadmap } from './types';
import { Onboarding } from './components/Onboarding';
import { RoleDiscovery } from './components/RoleDiscovery';
import { MentorMatch } from './components/MentorMatch';
import { RoadmapView } from './components/RoadmapView';
import { Dashboard } from './components/Dashboard';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.ONBOARDING);
  const [userProfile, setUserProfile] = useState<UserProfile>({ name: '', resumeText: '' });
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [generatedRoadmap, setGeneratedRoadmap] = useState<Roadmap | null>(null);

  const handleOnboardingComplete = (profile: UserProfile) => {
    setUserProfile(profile);
    setAppState(AppState.ROLE_DISCOVERY);
  };

  const handleRoleSelect = (role: SuggestedRole) => {
    setUserProfile(prev => ({ ...prev, targetRole: role }));
    setAppState(AppState.MENTOR_MATCH);
  };

  const handleMentorConfirmed = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setAppState(AppState.ROADMAP_VIEW);
  };

  const handleRoadmapComplete = (roadmap: Roadmap) => {
    setGeneratedRoadmap(roadmap);
    setAppState(AppState.DASHBOARD);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {appState === AppState.ONBOARDING && (
        <div className="pt-10 animate-fadeIn">
          <Onboarding onComplete={handleOnboardingComplete} />
        </div>
      )}

      {appState === AppState.ROLE_DISCOVERY && (
        <div className="pt-10 animate-fadeIn">
          <RoleDiscovery userProfile={userProfile} onRoleSelect={handleRoleSelect} />
        </div>
      )}

      {appState === AppState.MENTOR_MATCH && userProfile.targetRole && (
        <div className="pt-10 animate-fadeIn">
          <MentorMatch role={userProfile.targetRole} onMatchConfirmed={handleMentorConfirmed} />
        </div>
      )}

      {appState === AppState.ROADMAP_VIEW && userProfile.targetRole && selectedMentor && (
        <div className="pt-4 animate-fadeIn">
          <RoadmapView 
            userProfile={userProfile} 
            mentor={selectedMentor} 
            onComplete={handleRoadmapComplete} 
          />
        </div>
      )}

      {appState === AppState.DASHBOARD && userProfile.targetRole && selectedMentor && generatedRoadmap && (
        <Dashboard 
          userProfile={userProfile}
          mentor={selectedMentor}
          roadmap={generatedRoadmap}
        />
      )}
    </div>
  );
};

export default App;