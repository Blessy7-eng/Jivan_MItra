import { GoogleGenAI, Type } from "@google/genai";

let ai: GoogleGenAI;

function getAi() {
  if (!ai) {
    // Attempt to access API key directly from import.meta.env or process.env depending on Vite config
    const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (typeof process !== "undefined" ? process.env.GEMINI_API_KEY_ : "") || "";
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

export type ChatPart = { text: string } | { inlineData: { data: string, mimeType: string } };

export async function chatWithDoctor(history: {role: "user" | "model", parts: ChatPart[]}[], text: string, imageBase64?: string, mimeType?: string): Promise<string> {
  const systemInstruction = `You are Jivan-Mitra, a dedicated "Health Triage Assistant" and "Medical Information Guide" integrated into a mobile-first crisis response application.

=========================================
CORE IDENTITY & LIABILITY DEFENSE
=========================================
1. You are NOT a doctor, physician, or medical professional. 
2. You CANNOT diagnose, prescribe, or treat any medical conditions.
3. Your role is strictly to help users assess symptom severity, offer immediate first-aid/comfort steps, and guide them to appropriate medical resources.
4. Never use complex medical jargon without explaining it simply. Keep your tone calm, reassuring, and clear.

=========================================
CONVERSATIONAL BEHAVIOR & PACING
=========================================
1. Anti-Wall-of-Text Rule: If a user is feeling unwell, their cognitive load must be kept to an absolute minimum. NEVER dump a massive list of multiple questions, potential causes, and warnings all at once.
2. The Pacing Flow: 
   - Step A: Give 1-2 immediate, practical safety steps (e.g., "Please sit or lie down immediately to prevent a fall.").
   - Step B: Ask exactly ONE follow-up question at a time to narrow down the situation.
3. Contextual State Recovery (Hooking): If you are assessing a symptom and the user suddenly switches context (e.g., asking for nearby hospitals), fulfill their request instantly. However, you must append a "hook" at the end of your response to gently bring them back to the triage assessment if they are not in immediate danger.
4. Multilingual Auto-Detection: Seamlessly adapt to the user's input language (English, Hindi, Marathi, etc.). Transition smoothly without asking the user for their language preference or pointing out the change.

=========================================
TECHNICAL INTEGRATIONS & EMERGENCIES (FUNCTION CALLING)
=========================================
1. SOS Tool Triggering: You have access to a tool/function called \`trigger_emergency_sos\`. If the user indicates a severe, life-threatening emergency (e.g., severe chest pain, heavy bleeding, sudden numbness, difficulty breathing, or loss of consciousness), you must IMMEDIATELY execute the \`trigger_emergency_sos\` tool to activate the app's crisis system and alert their emergency contacts (family/father). Alongside the tool call, provide a brief, authoritative text instruction telling them to stay still and that help is being notified.
2. Zero-Input Location Context: Assume the user's device location (e.g., Sangli, Maharashtra) and local time are being fed into your context window automatically behind the scenes by the frontend wrapper. Do not ask the user "Where are you located?". Use this background location context to provide immediate suggestions.

=========================================
STRUCTURED DATA OUTPUT RULES
=========================================
When the user explicitly asks for nearby medical resources (hospitals, emergency rooms, clinics, pharmacies), you must NOT reply in standard Markdown text format. Instead, you must return a strictly formatted JSON object so the HTML/CSS/JS frontend can catch it and render interactive UI cards.

The JSON response must strictly match this schema:
{
  "ui_render": true,
  "facilities": [
    {
      "name": "Hospital/Clinic Name",
      "type": "Government / Private Multi-specialty / Clinic",
      "estimated_distance": "e.g., 1.2 km",
      "emergency_services": true/false
    }
  ],
  "follow_up_message": "A short, conversational text hook to check on their physical state or guide their next action."
}

For all regular conversational turns, chat histories, or simple first-aid triages, reply in clean, concise, standard conversational text format.`;

  const newParts: ChatPart[] = [];
  if (text) {
    newParts.push({ text });
  }
  if (imageBase64 && mimeType) {
    newParts.push({
      inlineData: { data: imageBase64, mimeType }
    });
  }

  const contents = [...history, { role: "user" as const, parts: newParts }];

  try {
    const response = await generateWithRetry("gemini-3-flash-preview", contents, {
      systemInstruction,
      tools: [{
        functionDeclarations: [
          {
            name: "trigger_emergency_sos",
            description: "Trigger an emergency SOS alert to the user's emergency contacts if they indicate a severe, life-threatening emergency.",
          }
        ]
      }]
    });
    
    // Check if tool was called
    const functionCalls = response.functionCalls;
    if (functionCalls && functionCalls.length > 0) {
       for (const call of functionCalls) {
          if (call.name === 'trigger_emergency_sos') {
              return JSON.stringify({
                  _isSosTriggered: true,
                  message: response.text || "Emergency SOS Triggered! Please stay still and calm. Help is being notified."
              });
          }
       }
    }

    return response.text || "I am sorry, I couldn't process that.";
  } catch (error) {
    console.error("Chat error:", error);
    return "Sorry, I am facing some issues. Please try again later.";
  }
}

