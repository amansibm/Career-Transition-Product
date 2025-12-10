import React, { useState } from 'react';
import { Button } from './Button';
import { generateInterviewQuestion, evaluateInterviewResponse } from '../services/geminiService';
import { InterviewFeedback } from '../types';

interface InterviewCoachProps {
  targetRole: string;
}

export const InterviewCoach: React.FC<InterviewCoachProps> = ({ targetRole }) => {
  const [status, setStatus] = useState<'idle' | 'questioning' | 'analyzing' | 'feedback'>('idle');
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);

  const startSession = async () => {
    setStatus('analyzing'); // Temporary state for loading question
    const question = await generateInterviewQuestion(targetRole, 'medium');
    setCurrentQuestion(question);
    setUserAnswer('');
    setFeedback(null);
    setStatus('questioning');
  };

  const submitAnswer = async () => {
    if (!userAnswer.trim()) return;
    setStatus('analyzing');
    const result = await evaluateInterviewResponse(currentQuestion, userAnswer, targetRole);
    setFeedback(result);
    setStatus('feedback');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 h-full flex flex-col animate-fadeIn">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span className="text-2xl">🎙️</span>
          Interview Coach Agent
        </h3>
        <p className="text-sm text-slate-500">Practice behavioral questions for {targetRole} roles with real-time feedback.</p>
      </div>

      <div className="flex-1 flex flex-col">
        {status === 'idle' && (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 p-8 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-3xl mb-2">
              ?
            </div>
            <h4 className="font-semibold text-slate-900">Ready to Practice?</h4>
            <p className="text-slate-500 text-sm max-w-xs">I'll ask you a standard interview question relevant to your new career path.</p>
            <Button onClick={startSession}>Start Session</Button>
          </div>
        )}

        {(status === 'questioning' || status === 'analyzing' || status === 'feedback') && (
          <div className="space-y-6">
            <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-lg">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wide">Question</span>
              <p className="text-lg font-medium text-slate-800 mt-1">{currentQuestion}</p>
            </div>

            {status !== 'feedback' && (
              <div className="space-y-3">
                <textarea 
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Type your answer here using the STAR method (Situation, Task, Action, Result)..."
                  className="w-full h-40 p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  disabled={status === 'analyzing'}
                />
                <div className="flex justify-end">
                  <Button 
                    onClick={submitAnswer} 
                    disabled={!userAnswer.trim() || status === 'analyzing'}
                    isLoading={status === 'analyzing'}
                  >
                    Analyze Answer
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {status === 'feedback' && feedback && (
          <div className="mt-4 space-y-4 animate-fadeIn">
            <div className="flex items-center gap-4 bg-slate-800 text-white p-4 rounded-lg">
              <div className={`text-3xl font-bold ${feedback.score >= 7 ? 'text-green-400' : 'text-yellow-400'}`}>
                {feedback.score}/10
              </div>
              <div>
                <p className="font-medium">Analysis Complete</p>
                <p className="text-xs text-slate-300">{feedback.score >= 7 ? 'Great job! keep refining.' : 'Good attempt, let\'s improve structure.'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-green-50 border border-green-100 rounded-lg">
                <p className="text-xs font-bold text-green-700 uppercase">Strengths</p>
                <p className="text-sm text-green-900 mt-1">{feedback.strengths}</p>
              </div>
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                <p className="text-xs font-bold text-red-700 uppercase">Areas to Improve</p>
                <p className="text-sm text-red-900 mt-1">{feedback.weaknesses}</p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-lg">
               <p className="text-xs font-bold text-slate-500 uppercase mb-2">STAR Method Analysis</p>
               <p className="text-sm text-slate-700 italic">{feedback.starAnalysis}</p>
            </div>

            <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-lg">
               <p className="text-xs font-bold text-indigo-600 uppercase mb-2">Better Way to Say It</p>
               <p className="text-sm text-indigo-900 leading-relaxed">{feedback.improvedSample}</p>
            </div>

            <div className="flex justify-center pt-4">
              <Button onClick={startSession} variant="outline">Next Question</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};