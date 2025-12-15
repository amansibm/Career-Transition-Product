import React, { useState } from 'react';
import { Button } from './Button';
import { generatePitch, tailorResume } from '../services/geminiService';

interface PitchEngineProps {
  resumeText: string;
  targetRole: string;
}

export const PitchEngine: React.FC<PitchEngineProps> = ({ resumeText, targetRole }) => {
  const [jobDescription, setJobDescription] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [mode, setMode] = useState<'cover_letter' | 'networking_message' | 'resume'>('cover_letter');

  const handleGenerate = async () => {
    // JD is optional for Resume tailoring if we just use the target role
    if (mode !== 'resume' && !jobDescription.trim()) return;
    
    setIsGenerating(true);
    let result = '';

    if (mode === 'resume') {
        result = await tailorResume(resumeText, targetRole, jobDescription);
    } else {
        result = await generatePitch(resumeText, jobDescription, mode);
    }
    
    setGeneratedContent(result);
    setIsGenerating(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 h-full flex flex-col">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          Application Agent
        </h3>
        <p className="text-sm text-slate-500">Create tailored materials for your <span className="font-semibold">{targetRole}</span> applications.</p>
      </div>

      <div className="flex gap-2 mb-4 bg-slate-50 p-1 rounded-lg overflow-x-auto">
        <button
          onClick={() => setMode('cover_letter')}
          className={`flex-1 py-2 px-2 text-xs font-medium rounded-md whitespace-nowrap transition-all ${mode === 'cover_letter' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Cover Letter
        </button>
        <button
          onClick={() => setMode('networking_message')}
          className={`flex-1 py-2 px-2 text-xs font-medium rounded-md whitespace-nowrap transition-all ${mode === 'networking_message' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Networking Msg
        </button>
        <button
          onClick={() => setMode('resume')}
          className={`flex-1 py-2 px-2 text-xs font-medium rounded-md whitespace-nowrap transition-all ${mode === 'resume' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Curated Resume
        </button>
      </div>

      <div className="space-y-4 flex-grow flex flex-col min-h-0">
        <div className="shrink-0">
          <label className="block text-xs font-medium text-slate-700 mb-1 uppercase">
            {mode === 'resume' ? 'Job Description (Optional)' : 'Job Description (Required)'}
          </label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="w-full h-24 p-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
            placeholder={mode === 'resume' ? `Paste a JD to tailor specifically, or leave blank to curate generally for ${targetRole}...` : "Paste the Job Description here..."}
          />
        </div>

        <Button 
          onClick={handleGenerate} 
          isLoading={isGenerating} 
          disabled={mode !== 'resume' && !jobDescription.trim()}
          className="w-full shrink-0"
        >
          {mode === 'resume' ? 'Curate Resume for Role' : 'Generate Draft'}
        </Button>

        {generatedContent && (
          <div className="mt-2 animate-fadeIn flex-grow flex flex-col min-h-0">
            <div className="flex justify-between items-end mb-1">
                <label className="block text-xs font-medium text-slate-700 uppercase">
                Generated {mode === 'cover_letter' ? 'Letter' : mode === 'resume' ? 'Resume (Markdown)' : 'Message'}
                </label>
                <button 
                    onClick={() => navigator.clipboard.writeText(generatedContent)}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                >
                    Copy Text
                </button>
            </div>
            <div className="relative flex-grow">
              <textarea
                readOnly
                value={generatedContent}
                className="w-full h-full min-h-[200px] p-3 text-sm border border-indigo-100 bg-indigo-50/30 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none font-mono"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};