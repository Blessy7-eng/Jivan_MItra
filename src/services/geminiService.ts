import { GoogleGenAI, Type } from "@google/genai";

let ai: GoogleGenAI;

function getAi() {
  if (!ai) {
    // Attempt to access API key directly from import.meta.env or process.env depending on Vite config
    const apiKey = import.meta.env?.VITE_GEMINI_API_KEY || (typeof process !== "undefined" ? process.env.GEMINI_API_KEY : "") || "";
    ai = new GoogleGenAI({ apiKey });
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

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function generateWithRetry(model: string, contents: any, config?: any, retries = 3) {
  const aiClient = getAi();
  for (let i = 0; i < retries; i++) {
    try {
      return await aiClient.models.generateContent({
        model,
        contents,
        config
      });
    } catch (error: any) {
      if (error?.status === 429 || error?.message?.includes('RESOURCE_EXHAUSTED') || error?.message?.includes('429')) {
        if (i === retries - 1) throw error;
        await sleep(2000 * (i + 1)); // Backoff
      } else {
        throw error;
      }
    }
  }
  throw new Error("Failed to generate content after retries");
}

export async function extractPrescription(base64Image: string, mimeType: string): Promise<{ data: ExtractedPrescription | null, raw: string }> {
  try {
    const response = await generateWithRetry(
      "gemini-3-flash-preview",
      {
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
      {
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
    );

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
    const response = await generateWithRetry(
      "gemini-3-flash-preview",
      {
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
    );
    return response.text?.trim() || "Uncertain";
  } catch (error) {
    console.error("Error verifying pill:", error);
    throw error;
  }
}
