import { GoogleGenAI, Type } from "@google/genai";
import { SuggestedRole, Roadmap, RoadmapWeek, InterviewFeedback } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const ROLE_DISCOVERY_MODEL = "gemini-2.5-flash";
const ROADMAP_MODEL = "gemini-2.5-flash"; // Capable enough for planning and faster
const PITCH_MODEL = "gemini-2.5-flash";
const CHAT_MODEL = "gemini-2.5-flash";
const INTERVIEW_MODEL = "gemini-2.5-flash";

export const discoverRoles = async (resumeText: string, discType: string): Promise<SuggestedRole[]> => {
  try {
    const prompt = `
      Analyze the following resume content and DISC personality type (${discType}).
      Identify 3 ideal career transition roles that leverage the candidate's existing strengths while offering a fresh direction.
      
      Resume Content:
      ${resumeText.substring(0, 10000)}
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
              skillsGap: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["title", "matchScore", "reasoning", "skillsGap"]
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
    // Return a fallback structure in case of error
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