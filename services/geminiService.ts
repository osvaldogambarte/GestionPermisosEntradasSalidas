
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeMotive = async (motive: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analiza el siguiente motivo de salida de un empleado y categorízalo brevemente (Ej: Médico, Trámite, Personal, Urgencia). Indica si parece razonable para un permiso laboral corto: "${motive}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            summary: { type: Type.STRING },
            isReasonable: { type: Type.BOOLEAN }
          },
          required: ["category", "summary", "isReasonable"]
        }
      }
    });

    // Added safety check for response.text property to avoid parsing undefined
    const jsonStr = response.text?.trim() || "{}";
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Error analyzing motive with AI", error);
    return null;
  }
};
