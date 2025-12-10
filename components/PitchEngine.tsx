import React, { useState } from 'react';
import { Button } from './Button';
import { generatePitch } from '../services/geminiService';

interface PitchEngineProps {
  resumeText: string;
}

export const PitchEngine: React.FC<PitchEngineProps> = ({ resumeText }) => {
  const [jobDescription, setJobDescription] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [mode, setMode] = useState<'cover_letter' | 'networking_message'>('cover_letter');

  const handleGenerate = async () => {
    if (!jobDescription.trim()) return;
    setIsGenerating(true);
    const result = await generatePitch(resumeText, jobDescription, mode);
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
          AI Pitch Engine
        </h3>
        <p className="text-sm text-slate-500">Paste a job description to generate a tailored application.</p>
      </div>

      <div className="flex gap-2 mb-4 bg-slate-50 p-1 rounded-lg">
        <button
          onClick={() => setMode('cover_letter')}
          className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${mode === 'cover_letter' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Cover Letter
        </button>
        <button
          onClick={() => setMode('networking_message')}
          className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${mode === 'networking_message' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Networking Msg
        </button>
      </div>

      <div className="space-y-4 flex-grow">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1 uppercase">Job Description</label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="w-full h-32 p-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
            placeholder="Paste the JD here..."
          />
        </div>

        <Button 
          onClick={handleGenerate} 
          isLoading={isGenerating} 
          disabled={!jobDescription.trim()}
          className="w-full"
        >
          Generate Draft
        </Button>

        {generatedContent && (
          <div className="mt-4 animate-fadeIn">
            <label className="block text-xs font-medium text-slate-700 mb-1 uppercase">
              Generated {mode === 'cover_letter' ? 'Letter' : 'Message'}
            </label>
            <div className="relative">
              <textarea
                readOnly
                value={generatedContent}
                className="w-full h-64 p-3 text-sm border border-indigo-100 bg-indigo-50/30 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              />
              <button 
                onClick={() => navigator.clipboard.writeText(generatedContent)}
                className="absolute top-2 right-2 p-1.5 bg-white rounded shadow-sm text-slate-500 hover:text-indigo-600 border border-slate-200"
                title="Copy to clipboard"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};