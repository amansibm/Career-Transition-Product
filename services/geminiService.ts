import { GoogleGenAI, Type } from "@google/genai";
import { SuggestedRole, Roadmap, RoadmapWeek, InterviewFeedback, UserProfile, Mentor } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const ROLE_DISCOVERY_MODEL = "gemini-2.5-flash";
const ROADMAP_MODEL = "gemini-2.5-flash";
const PITCH_MODEL = "gemini-2.5-flash";
const CHAT_MODEL = "gemini-2.5-flash";
const INTERVIEW_MODEL = "gemini-2.5-flash";

export const discoverRoles = async (profile: UserProfile): Promise<SuggestedRole[]> => {
  try {
    const prompt = `
      You are an expert Career Strategist Agent.
      Analyze the candidate profile below and suggest 3 viable career transition roles.
      
      Candidate Profile:
      - Resume Summary: ${profile.resumeText.substring(0, 8000)}
      - DISC Personality: ${profile.discProfile?.dominantType || 'Unknown'}
      - Location: ${profile.location || 'Not specified'} (Relocation: ${profile.relocation ? 'Yes' : 'No'})
      - Work Preference: ${profile.remotePreference || 'Flexible'}
      - Financial Runway/Urgency: ${profile.financialRunway || 'Medium'} (Important: ${profile.financialRunway === 'Urgent' ? 'Prioritize roles with low barrier to entry/fast hiring' : 'Can suggest roles requiring upskilling'})
      - Target Industries: ${profile.targetIndustries?.join(', ') || 'Open'}
      - Core Values: ${profile.coreValues?.join(', ') || 'Not specified'}
      - Self-Rated Skills: ${profile.topSkills?.map(s => `${s.name} (${s.level})`).join(', ') || 'See resume'}

      Task:
      1. Consider current market trends and demand for ${profile.location || 'global markets'}.
      2. Match the candidate's transferrable skills and personality to high-growth roles.
      3. Respect constraints (financial runway is critical).
      4. Provide a visual career journey and salary projection for 5 years.
      
      Output JSON matching the schema.
    `;

    const response = await ai.models.generateContent({
      model: ROLE_DISCOVERY_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              matchScore: { type: Type.NUMBER, description: "Percentage match 0-100" },
              reasoning: { type: Type.STRING },
              skillsGap: { type: Type.ARRAY, items: { type: Type.STRING } },
              salary: {
                type: Type.OBJECT,
                properties: {
                  starting: { type: Type.STRING, description: "e.g. $70k" },
                  year2: { type: Type.STRING, description: "e.g. $90k" },
                  year5: { type: Type.STRING, description: "e.g. $130k" }
                },
                required: ["starting", "year2", "year5"]
              },
              careerJourney: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "List of 3-4 job titles representing the 5-year progression" 
              }
            },
            required: ["title", "matchScore", "reasoning", "skillsGap", "salary", "careerJourney"]
          }
        }
      }
    });

    const jsonText = response.text || "[]";
    return JSON.parse(jsonText) as SuggestedRole[];
  } catch (error) {
    console.error("Error discovering roles:", error);
    return [];
  }
};

export const generateRoadmap = async (targetRole: string, currentBackground: string): Promise<Roadmap> => {
  try {
    const prompt = `
      Create a detailed 12-week (90-day) transition roadmap for a professional moving from their current background to a ${targetRole}.
      Break it down into weeks. Focus on practical steps: learning, networking, personal branding, and applying.
      
      Current Background Summary:
      ${currentBackground.substring(0, 2000)}
    `;

    const response = await ai.models.generateContent({
      model: ROADMAP_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overview: { type: Type.STRING, description: "A motivating summary of the 90-day journey" },
            weeks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  weekNumber: { type: Type.INTEGER },
                  theme: { type: Type.STRING },
                  tasks: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["weekNumber", "theme", "tasks"]
              }
            }
          },
          required: ["overview", "weeks"]
        }
      }
    });

    const jsonText = response.text || "{}";
    const data = JSON.parse(jsonText);
    
    // Add default status
    if (data.weeks) {
      data.weeks = data.weeks.map((w: any) => ({ ...w, status: 'pending' }));
    }
    
    return data as Roadmap;
  } catch (error) {
    console.error("Error generating roadmap:", error);
    return { overview: "Could not generate roadmap. Please try again.", weeks: [] };
  }
};

export const generatePitch = async (resumeText: string, jobDescription: string, type: 'cover_letter' | 'networking_message'): Promise<string> => {
  try {
    const prompt = `
      You are an expert career coach.
      Write a ${type === 'cover_letter' ? "compelling cover letter" : "short, punchy LinkedIn networking message"} for the following candidate applying to the described job.
      Emphasize transferable skills.
      
      Candidate Resume:
      ${resumeText.substring(0, 5000)}
      
      Job Description:
      ${jobDescription.substring(0, 2000)}
    `;

    const response = await ai.models.generateContent({
      model: PITCH_MODEL,
      contents: prompt,
    });

    return response.text || "";
  } catch (error) {
    console.error("Error generating pitch:", error);
    return "Error generating content. Please check your inputs.";
  }
};

export const tailorResume = async (originalResume: string, targetRole: string, jobDescription?: string): Promise<string> => {
  try {
      const prompt = `
          You are an expert Resume Writer and Career Coach.
          Rewrite the following resume to specifically target a ${targetRole} position.
          ${jobDescription ? `Tailor it specifically to this Job Description: ${jobDescription}` : ''}
          
          Guidelines:
          1. Create a strong Professional Summary highlighting the pivot to ${targetRole}.
          2. Rewrite bullet points to emphasize transferrable skills relevant to ${targetRole}.
          3. Use strong action verbs and quantify achievements where possible.
          4. Output the result in clean, structured Markdown format.

          Original Resume:
          ${originalResume.substring(0, 10000)}
      `;

      const response = await ai.models.generateContent({
          model: PITCH_MODEL,
          contents: prompt
      });

      return response.text || "Could not generate resume.";
  } catch (e) {
      console.error("Error tailoring resume:", e);
      return "Error tailoring resume. Please try again.";
  }
};

export const generateMentorPersona = async (targetRoleTitle: string): Promise<Mentor> => {
  try {
    const prompt = `
      Create a realistic persona for a senior industry mentor who is an expert in ${targetRoleTitle}.
      The mentor must have a designation equivalent to or higher than a senior ${targetRoleTitle} (e.g., Lead, Principal, Director, VP).
      
      The bio should be encouraging and mention their experience helping people transition into this field.
      
      Output JSON only.
    `;

    const response = await ai.models.generateContent({
      model: CHAT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            role: { type: Type.STRING, description: "A senior job title" },
            company: { type: Type.STRING, description: "A fictional but realistic tech company name" },
            bio: { type: Type.STRING },
            avatarUrl: { type: Type.STRING, description: "Use a seed string for https://api.dicebear.com/7.x/avataaars/svg?seed=[Seed]" }
          },
          required: ["name", "role", "company", "bio", "avatarUrl"]
        }
      }
    });
     const jsonText = response.text || "{}";
     const data = JSON.parse(jsonText);
     
     // Ensure avatar URL is valid or fallback
     if (!data.avatarUrl || !data.avatarUrl.startsWith('http')) {
        data.avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name.replace(' ', '')}`;
     }
     
     return data as Mentor;
  } catch (error) {
    console.error("Mentor generation failed", error);
    // Fallback
    return {
        name: "Alex Rivera",
        role: `Senior ${targetRoleTitle} Lead`,
        company: "Innovate Inc.",
        bio: `I've spent 15 years in ${targetRoleTitle} and love helping motivated professionals make the switch.`,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=AlexRivera`
    };
  }
};

export const chatWithMentor = async (history: {role: string, parts: {text: string}[]}[], message: string, mentorName: string, targetRole: string): Promise<string> => {
  try {
    const chat = ai.chats.create({
      model: CHAT_MODEL,
      config: {
        systemInstruction: `You are ${mentorName}, an experienced mentor in the field of ${targetRole}. You are encouraging, practical, and succinct. Help the user with their career transition. Keep answers under 100 words unless asked for detail.`
      },
      history: history as any
    });

    const result = await chat.sendMessage({ message });
    return result.text || "I'm having trouble connecting right now. Let's try again in a moment.";
  } catch (error) {
    console.error("Error in mentor chat:", error);
    return "I'm having trouble connecting right now.";
  }
};

export const generateInterviewQuestion = async (role: string, difficulty: string): Promise<string> => {
  try {
    const prompt = `Generate a single behavioral interview question for a ${role} position. Difficulty level: ${difficulty}. The question should be open-ended and suitable for the STAR method. Return just the question text.`;

    const response = await ai.models.generateContent({
      model: INTERVIEW_MODEL,
      contents: prompt,
    });

    return response.text || "Tell me about a time you faced a challenge.";
  } catch (error) {
    console.error("Error generating question:", error);
    return "Tell me about a time you faced a challenge.";
  }
};

export const evaluateInterviewResponse = async (question: string, answer: string, role: string): Promise<InterviewFeedback> => {
  try {
    const prompt = `
      You are an interview coach. Evaluate the following answer to the interview question: "${question}" for a ${role} position.
      Candidate Answer: "${answer}"
      
      Evaluate based on the STAR method (Situation, Task, Action, Result).
      Provide structured feedback.
    `;

    const response = await ai.models.generateContent({
      model: INTERVIEW_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER, description: "Score out of 10" },
            strengths: { type: Type.STRING },
            weaknesses: { type: Type.STRING },
            starAnalysis: { type: Type.STRING, description: "Did they use STAR effectively?" },
            improvedSample: { type: Type.STRING, description: "A better version of the answer" }
          },
          required: ["score", "strengths", "weaknesses", "starAnalysis", "improvedSample"]
        }
      }
    });

    const jsonText = response.text || "{}";
    return JSON.parse(jsonText) as InterviewFeedback;
  } catch (error) {
    console.error("Error evaluating response:", error);
    return {
      score: 0,
      strengths: "N/A",
      weaknesses: "Error analyzing response.",
      starAnalysis: "N/A",
      improvedSample: "N/A"
    };
  }
};