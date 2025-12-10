import React, { useState } from 'react';
import { Button } from './Button';
import { UserProfile, DiscProfile } from '../types';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

const DISC_QUESTIONS = [
  {
    id: 1,
    question: "How do you typically approach a new problem?",
    options: [
      { text: "I take charge and make quick decisions.", type: "d" },
      { text: "I discuss it with others to get buy-in.", type: "i" },
      { text: "I look for a steady, proven method.", type: "s" },
      { text: "I analyze all the data before acting.", type: "c" }
    ]
  },
  {
    id: 2,
    question: "What motivates you most at work?",
    options: [
      { text: "Achieving results and winning.", type: "d" },
      { text: "Recognition and social interaction.", type: "i" },
      { text: "Helping others and harmony.", type: "s" },
      { text: "Accuracy and doing things right.", type: "c" }
    ]
  },
  {
    id: 3,
    question: "What is your biggest fear?",
    options: [
      { text: "Being taken advantage of.", type: "d" },
      { text: "Rejection or loss of approval.", type: "i" },
      { text: "Loss of security or sudden change.", type: "s" },
      { text: "Criticism or making a mistake.", type: "c" }
    ]
  }
];

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const handleDiscSelect = (questionId: number, type: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: type }));
  };

  const calculateDisc = (): DiscProfile => {
    const counts = { d: 0, i: 0, s: 0, c: 0 };
    Object.values(answers).forEach(type => {
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
      discProfile
    });
  };

  const isStep1Valid = name.trim().length > 0 && resumeText.trim().length > 50;
  const isStep2Valid = Object.keys(answers).length === DISC_QUESTIONS.length;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Let's build your profile</h2>
        <p className="text-slate-600">We need a few details to tailor your transition plan.</p>
        <div className="mt-4 flex gap-2">
          <div className={`h-2 flex-1 rounded-full ${step >= 1 ? 'bg-indigo-600' : 'bg-slate-200'}`} />
          <div className={`h-2 flex-1 rounded-full ${step >= 2 ? 'bg-indigo-600' : 'bg-slate-200'}`} />
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-6 bg-white p-8 rounded-xl shadow-sm border border-slate-100 animate-fadeIn">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              placeholder="e.g. Sarah"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Professional Summary / Resume Text</label>
            <p className="text-xs text-slate-500 mb-2">Paste your resume content or a detailed LinkedIn summary here.</p>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg h-48 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
              placeholder="Experience: 5 years in Marketing... Skills: SEO, Content Strategy..."
            />
          </div>

          <div className="flex justify-end">
            <Button disabled={!isStep1Valid} onClick={() => setStep(2)}>
              Next: Quick Personality Check
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-8 bg-white p-8 rounded-xl shadow-sm border border-slate-100 animate-fadeIn">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold">Quick Style Assessment</h3>
            <p className="text-sm text-slate-500">Helps us match you with the right roles and mentor.</p>
          </div>

          {DISC_QUESTIONS.map((q) => (
            <div key={q.id} className="space-y-3">
              <p className="font-medium text-slate-800">{q.question}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {q.options.map((opt) => (
                  <button
                    key={opt.text}
                    onClick={() => handleDiscSelect(q.id, opt.type)}
                    className={`p-3 text-left text-sm rounded-lg border transition-all ${
                      answers[q.id] === opt.type 
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

          <div className="flex justify-between pt-6 border-t border-slate-100">
            <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
            <Button disabled={!isStep2Valid} onClick={handleFinish}>
              Analyze My Profile
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};