import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from '../constants';
import { ContentRequest } from '../types';

let aiClient: GoogleGenAI | null = null;

const getClient = () => {
  if (!aiClient) {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API_KEY environment variable is missing.");
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
};

export const generateContent = async (request: ContentRequest): Promise<string> => {
  try {
    const ai = getClient();
    
    // Using gemini-3-flash-preview as recommended for text tasks
    const modelId = 'gemini-3-flash-preview';

    const prompt = `
      Topic: ${request.topic}
      Platform: ${request.platform}
      Target Audience: ${request.audience}
      Tone: ${request.tone}
      
      Create optimized content based on these parameters.
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7, // Slightly creative but structured
        topK: 40,
        topP: 0.95,
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No content generated from the model.");
    }

    return text;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to generate content. Please check your API key and try again.");
  }
};