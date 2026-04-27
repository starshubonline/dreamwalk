import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateWorkoutPlan(level: string, goal: string, preferences: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a personalized workout plan for a user with the following profile:
      Level: ${level}
      Goal: ${goal}
      Preferences: ${preferences}
      
      The response should be structured JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            exercises: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  sets: { type: Type.NUMBER },
                  reps: { type: Type.STRING },
                  tips: { type: Type.STRING }
                },
                required: ["name", "sets", "reps"]
              }
            },
            nutritionalTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["title", "exercises"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini API Error (generateWorkoutPlan):", error);
    return null;
  }
}

export async function getMotivationalQuote() {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Give me a short, powerful motivational quote for weight loss and fitness. Return as a plain string.",
    });
    return response.text.trim();
  } catch (error) {
    console.error("Gemini API Error (getMotivationalQuote):", error);
    return "Keep moving, keep dreaming.";
  }
}
