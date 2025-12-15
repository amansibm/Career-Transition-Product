export enum AppState {
  ONBOARDING = 'ONBOARDING',
  ROLE_DISCOVERY = 'ROLE_DISCOVERY',
  MENTOR_MATCH = 'MENTOR_MATCH',
  ROADMAP_VIEW = 'ROADMAP_VIEW',
  DASHBOARD = 'DASHBOARD'
}

export interface DiscProfile {
  d: number;
  i: number;
  s: number;
  c: number;
  dominantType: string;
}

export interface UserProfile {
  name: string;
  resumeText: string;
  location?: string;
  relocation?: boolean;
  remotePreference?: 'Remote' | 'Hybrid' | 'On-site' | 'Any';
  salaryExpectation?: string;
  targetIndustries?: string[];
  coreValues?: string[];
  desiredSkills?: string;
  discProfile?: DiscProfile;
  targetRole?: SuggestedRole;
}

export interface SuggestedRole {
  title: string;
  matchScore: number;
  reasoning: string;
  skillsGap: string[];
}

export interface RoadmapWeek {
  weekNumber: number;
  theme: string;
  tasks: string[];
  status: 'pending' | 'in-progress' | 'completed';
}

export interface Roadmap {
  overview: string;
  weeks: RoadmapWeek[];
}

export interface Mentor {
  name: string;
  role: string;
  company: string;
  bio: string;
  avatarUrl: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'mentor';
  text: string;
  timestamp: Date;
}

export interface InterviewFeedback {
  score: number;
  strengths: string;
  weaknesses: string;
  starAnalysis: string;
  improvedSample: string;
}