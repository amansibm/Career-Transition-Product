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

export interface Skill {
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Expert';
}

export interface UserProfile {
  name: string;
  resumeText: string;
  location?: string;
  relocation?: boolean;
  remotePreference?: 'Remote' | 'Hybrid' | 'On-site' | 'Any';
  financialRunway?: string;
  salaryExpectation?: string;
  targetIndustries?: string[];
  coreValues?: string[];
  topSkills?: Skill[];
  discProfile?: DiscProfile;
  targetRole?: SuggestedRole;
}

export interface SuggestedRole {
  title: string;
  matchScore: number;
  reasoning: string;
  skillsGap: string[];
  salary: {
    starting: string;
    year2: string;
    year5: string;
  };
  careerJourney: string[];
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