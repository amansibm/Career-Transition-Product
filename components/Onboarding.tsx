import React, { useState } from 'react';
import { Button } from './Button';
import { UserProfile, DiscProfile, Skill } from '../types';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

const DISC_QUESTIONS = [
  {
    id: 101,
    question: "How do you typically approach a new problem?",
    options: [
      { text: "I take charge and make quick decisions.", type: "d" },
      { text: "I discuss it with others to get buy-in.", type: "i" },
      { text: "I look for a steady, proven method.", type: "s" },
      { text: "I analyze all the data before acting.", type: "c" }
    ]
  },
  {
    id: 102,
    question: "What motivates you most at work?",
    options: [
      { text: "Achieving results and winning.", type: "d" },
      { text: "Recognition and social interaction.", type: "i" },
      { text: "Helping others and harmony.", type: "s" },
      { text: "Accuracy and doing things right.", type: "c" }
    ]
  },
  {
    id: 103,
    question: "What is your biggest fear?",
    options: [
      { text: "Being taken advantage of.", type: "d" },
      { text: "Rejection or loss of approval.", type: "i" },
      { text: "Loss of security or sudden change.", type: "s" },
      { text: "Criticism or making a mistake.", type: "c" }
    ]
  },
  {
    id: 104,
    question: "Which work style describes you best?",
    options: [
      { text: "Direct, firm, and strong-willed.", type: "d" },
      { text: "Enthusiastic, optimistic, and lively.", type: "i" },
      { text: "Even-tempered, accommodating, and patient.", type: "s" },
      { text: "Analytical, reserved, and precise.", type: "c" }
    ]
  },
  {
    id: 105,
    question: "Under pressure, I tend to...",
    options: [
      { text: "Become autocratic and demanding.", type: "d" },
      { text: "Attack verbally or become emotional.", type: "i" },
      { text: "Give in to keep the peace.", type: "s" },
      { text: "Withdraw and become critical.", type: "c" }
    ]
  }
];

const INDUSTRIES = [
  "Technology & Software", "Healthcare", "Finance & Fintech", "Education", 
  "Creative & Design", "Marketing & Media", "Green Tech & Energy", 
  "Consulting", "Non-profit", "Manufacturing"
];

const VALUES = [
  "High Salary", "Work-Life Balance", "Remote Flexibility", "Social Impact", 
  "Rapid Growth", "Stability", "Innovation", "Leadership Opportunities"
];

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  
  // Form State
  const [name, setName] = useState('');
  const [resumeText, setResumeText] = useState('');
  
  const [location, setLocation] = useState('');
  const [relocation, setRelocation] = useState<boolean | null>(null);
  const [remotePreference, setRemotePreference] = useState<any>('');
  const [financialRunway, setFinancialRunway] = useState('');
  
  const [targetIndustries, setTargetIndustries] = useState<string[]>([]);
  const [coreValues, setCoreValues] = useState<string[]>([]);
  
  // Skill State
  const [skillInput, setSkillInput] = useState('');
  const [skillLevel, setSkillLevel] = useState<'Beginner' | 'Intermediate' | 'Expert'>('Intermediate');
  const [topSkills, setTopSkills] = useState<Skill[]>([]);
  
  const [discAnswers, setDiscAnswers] = useState<Record<number, string>>({});

  const handleDiscSelect = (questionId: number, type: string) => {
    setDiscAnswers(prev => ({ ...prev, [questionId]: type }));
  };

  const toggleSelection = (item: string, list: string[], setList: (l: string[]) => void) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      if (list.length < 3) setList([...list, item]);
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && topSkills.length < 10) {
      setTopSkills([...topSkills, { name: skillInput.trim(), level: skillLevel }]);
      setSkillInput('');
    }
  };

  const removeSkill = (index: number) => {
    setTopSkills(topSkills.filter((_, i) => i !== index));
  };

  const calculateDisc = (): DiscProfile => {
    const counts = { d: 0, i: 0, s: 0, c: 0 };
    Object.values(discAnswers).forEach(type => {
      counts[type as keyof typeof counts]++;
    });
    const dominantType = Object.entries(counts).reduce((a, b) => a[1] > b[1] ? a : b)[0].toUpperCase();
    return { ...counts, dominantType };
  };

  const handleFinish = () => {
    const discProfile = calculateDisc();
    onComplete({
      name,
      resumeText,
      location,
      relocation: relocation || false,
      remotePreference,
      financialRunway,
      targetIndustries,
      coreValues,
      topSkills,
      discProfile
    });
  };

  const isStep1Valid = name.trim().length > 0 && resumeText.trim().length > 50;
  const isStep2Valid = location.trim().length > 0 && relocation !== null && remotePreference !== '' && financialRunway !== '';
  const isStep3Valid = targetIndustries.length > 0 && topSkills.length > 0;
  const isStep4Valid = Object.keys(discAnswers).length === DISC_QUESTIONS.length;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Build Your Career Profile</h2>
        <p className="text-slate-600">Step {step} of 4</p>
        <div className="mt-4 flex gap-2 justify-center max-w-xs mx-auto">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className={`h-2 flex-1 rounded-full transition-colors ${step >= s ? 'bg-indigo-600' : 'bg-slate-200'}`} />
          ))}
        </div>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 animate-fadeIn min-h-[500px] flex flex-col">
        
        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-6 flex-grow">
            <h3 className="text-xl font-semibold mb-4">Let's start with the basics</h3>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="e.g. Sarah"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Resume / LinkedIn Summary</label>
              <p className="text-xs text-slate-500 mb-2">Paste your text here. The more detail, the better the match.</p>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                className="w-full h-48 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                placeholder="Experience: 5 years in Marketing... Skills: SEO, Content Strategy..."
              />
            </div>
          </div>
        )}

        {/* Step 2: Logistics & Finance */}
        {step === 2 && (
          <div className="space-y-6 flex-grow">
            <h3 className="text-xl font-semibold mb-4">Logistics & Financial Constraints</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Current Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. New York, NY"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Relocation?</label>
                <div className="flex gap-2">
                  <button onClick={() => setRelocation(true)} className={`flex-1 py-2 px-3 rounded-lg border text-sm ${relocation === true ? 'bg-indigo-50 border-indigo-600 text-indigo-700' : 'border-slate-200'}`}>Yes</button>
                  <button onClick={() => setRelocation(false)} className={`flex-1 py-2 px-3 rounded-lg border text-sm ${relocation === false ? 'bg-indigo-50 border-indigo-600 text-indigo-700' : 'border-slate-200'}`}>No</button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Work Preference</label>
              <select value={remotePreference} onChange={(e) => setRemotePreference(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                <option value="" disabled>Select preference...</option>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
                <option value="Any">Open to anything</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Financial Runway / Urgency</label>
              <p className="text-xs text-slate-500 mb-2">This helps us suggest roles with appropriate training timelines.</p>
              <select value={financialRunway} onChange={(e) => setFinancialRunway(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                <option value="" disabled>Select runway...</option>
                <option value="Urgent">Immediate (Need job within 1 month)</option>
                <option value="Short">Short Term (1-3 months)</option>
                <option value="Medium">Medium Term (3-6 months)</option>
                <option value="Long">Secure (6 months+ / Currently Employed)</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 3: Skills & Interests */}
        {step === 3 && (
          <div className="space-y-6 flex-grow">
            <h3 className="text-xl font-semibold mb-4">Skills & Interests</h3>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Key Skills & Proficiency</label>
              <div className="flex gap-2 mb-3">
                <input 
                  type="text" 
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                  placeholder="e.g. Project Management"
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <select 
                  value={skillLevel}
                  onChange={(e) => setSkillLevel(e.target.value as any)}
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Expert">Expert</option>
                </select>
                <Button onClick={addSkill} disabled={!skillInput.trim()}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 min-h-[40px]">
                {topSkills.map((skill, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm border border-indigo-100">
                    <span className="font-medium">{skill.name}</span>
                    <span className="text-xs text-indigo-400">({skill.level})</span>
                    <button onClick={() => removeSkill(idx)} className="ml-1 text-indigo-400 hover:text-indigo-600">×</button>
                  </span>
                ))}
                {topSkills.length === 0 && <span className="text-sm text-slate-400 italic">Add at least one skill...</span>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Top 3 Target Industries</label>
              <div className="flex flex-wrap gap-2">
                {INDUSTRIES.map(ind => (
                  <button
                    key={ind}
                    onClick={() => toggleSelection(ind, targetIndustries, setTargetIndustries)}
                    className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
                      targetIndustries.includes(ind) 
                      ? 'bg-indigo-600 text-white border-indigo-600' 
                      : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    {ind}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Core Values (Select up to 3)</label>
              <div className="flex flex-wrap gap-2">
                {VALUES.map(val => (
                  <button
                    key={val}
                    onClick={() => toggleSelection(val, coreValues, setCoreValues)}
                    className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
                      coreValues.includes(val) 
                      ? 'bg-teal-600 text-white border-teal-600' 
                      : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: DISC Assessment */}
        {step === 4 && (
          <div className="space-y-6 flex-grow">
            <h3 className="text-xl font-semibold mb-2">Quick Personality Check</h3>
            <p className="text-sm text-slate-500 mb-4">Select the option that matches you best.</p>
            
            <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2">
              {DISC_QUESTIONS.map((q) => (
                <div key={q.id} className="space-y-2">
                  <p className="text-sm font-medium text-slate-800">{q.question}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {q.options.map((opt) => (
                      <button
                        key={opt.text}
                        onClick={() => handleDiscSelect(q.id, opt.type)}
                        className={`p-2 text-left text-xs rounded-lg border transition-all ${
                          discAnswers[q.id] === opt.type 
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-medium' 
                            : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        {opt.text}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between pt-6 border-t border-slate-100 mt-4">
          {step > 1 ? (
            <Button variant="ghost" onClick={() => setStep(step - 1)}>Back</Button>
          ) : (
            <div></div>
          )}
          
          {step < 4 ? (
            <Button 
              disabled={
                (step === 1 && !isStep1Valid) || 
                (step === 2 && !isStep2Valid) || 
                (step === 3 && !isStep3Valid)
              } 
              onClick={() => setStep(step + 1)}
            >
              Next Step
            </Button>
          ) : (
            <Button disabled={!isStep4Valid} onClick={handleFinish}>
              Generate Career Plan
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};