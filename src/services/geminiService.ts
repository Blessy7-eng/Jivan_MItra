import { GoogleGenAI, Type } from "@google/genai";

let ai: GoogleGenAI;

function getAi() {
  if (!ai) {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY_ });
  }
  return ai;
}

export interface ExtractedPrescription {
  drugName: string;
  dosage: string;
  frequency: string;
  duration: string;
  purpose: string;
  precautions: string;
  timing: ("morning" | "afternoon" | "evening" | "night")[];
}

export async function extractPrescription(base64Image: string, mimeType: string): Promise<{ data: ExtractedPrescription | null, raw: string }> {
  try {
    const aiClient = getAi();
    const response = await aiClient.models.generateContent({
      model: "gemini-2.0-flash",
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType
            }
          },
          {
            text: "You are an expert clinical pharmacist OCR and translation tool. Extract the prescription details from this image exactly as medical structured data. If it's not a prescription, return an empty object."
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            drugName: { type: Type.STRING, description: "Name of the drug" },
            dosage: { type: Type.STRING, description: "Dosage amount (e.g., 500mg)" },
            frequency: { type: Type.STRING, description: "How often it should be taken (e.g., Twice a day)" },
            duration: { type: Type.STRING, description: "For how many days" },
            purpose: { type: Type.STRING, description: "The likely purpose or condition being treated, inferred if necessary" },
            precautions: { type: Type.STRING, description: "Any special instructions or precautions" },
            timing: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Time of day: morning, afternoon, evening, or night"
            }
          },
          required: ["drugName", "dosage", "frequency", "duration", "purpose", "precautions", "timing"]
        }
      }
    });

    const text = response.text?.trim() || "";
    try {
      const parsed = JSON.parse(text);
      return { data: parsed, raw: text };
    } catch {
      return { data: null, raw: text };
    }
  } catch (error) {
    console.error("Error extracting prescription:", error);
    throw error;
  }
}

export async function verifyPill(pillImageBase64: string, mimeType: string, expectedDrug: string): Promise<boolean | string> {
  try {
    const aiClient = getAi();
    const response = await aiClient.models.generateContent({
      model: "gemini-2.0-flash",
      contents: {
        parts: [
          {
            inlineData: {
              data: pillImageBase64,
              mimeType
            }
          },
          {
             text: `Is this physical pill likely to be ${expectedDrug}? Analyze the shape, color, and imprints if visible. Respond with ONLY 'YES' if it matches, or a short explanation if it does not match.`
          }
        ]
      }
    });
    return response.text?.trim() || "Uncertain";
  } catch (error) {
    console.error("Error verifying pill:", error);
    throw error;
  }
}
