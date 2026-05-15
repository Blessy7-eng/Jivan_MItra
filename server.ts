import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import multer from "multer";
import cors from "cors";
import twilio from "twilio";
import { GoogleGenAI, Type } from "@google/genai";

// We'll mock the Supabase logic for now
interface Patient {
  phone: string;
  abhaId: string;
  language: string;
}

interface Prescription {
  id: string;
  patientPhone: string;
  imageUrl: string;
  extractedData: any;
  confidenceScore: number;
  timestamp: string;
}

const db = {
  patients: [] as Patient[],
  prescriptions: [] as Prescription[],
};

// Insert a default mock prescription for the UI
db.prescriptions.push({
  id: "mock1",
  patientPhone: "mock",
  imageUrl: "",
  extractedData: {
    drugName: "Paracetamol 500mg",
    dosage: "1 tablet",
    frequency: "Twice a day",
    duration: "5 days",
    precautions: "Take after meals",
    timing: ["morning", "night"]
  },
  confidenceScore: 0.95,
  timestamp: new Date().toISOString()
});

const upload = multer({ storage: multer.memoryStorage() });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API ROUTES

  app.post("/api/whatsapp", async (req, res) => {
    const MessagingResponse = twilio.twiml.MessagingResponse;
    const twiml = new MessagingResponse();

    const mediaUrl = req.body.MediaUrl0;
    const bodyText = req.body.Body || "";
    const from = req.body.From;

    if (!mediaUrl && !bodyText.trim()) {
      twiml.message("Namaste! Welcome to Jivan-Mitra Clinical Platform. Please text your health questions or send a clear photo of your prescription, and I will assist you.\n\nNote: This is an AI assistant. Please verify with your doctor or pharmacist.");
      res.type('text/xml').send(twiml.toString());
      return;
    }

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      let aiResponse;

      if (mediaUrl) {
        // Fetch image from Twilio
        const imageResponse = await fetch(mediaUrl);
        const arrayBuffer = await imageResponse.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Image = buffer.toString('base64');
        const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg';
        
        const textPrompt = bodyText.trim() ? 
          `The user sent an image with the following message: "${bodyText}". Please analyze the image, answer the user's query, and identify any medicines in this prescription (name, dosage, time). Reply in a helpful, concise manner, primarily returning the structured data in JSON along with a friendly WhatsApp message translating the advice to Hindi/Marathi if required.` :
          `Identify the medicines in this prescription. For each, give the name, dosage, and time (Morning/Afternoon/Night). Translate the result into Hindi or Marathi. Keep it simple and life-saving. Return the data structured according to the schema.`;

        aiResponse = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: [
              {
                 role: "user",
                 parts: [
                     { inlineData: { data: base64Image, mimeType } },
                     { text: textPrompt }
                 ]
              }
          ],
          config: {
              responseMimeType: "application/json",
              responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                      whatsappMessage: { type: Type.STRING, description: "The message to send back to the user via WhatsApp explaining the image or answering their query." },
                      extractedData: {
                          type: Type.ARRAY,
                          items: {
                              type: Type.OBJECT,
                              properties: {
                                  drugName: { type: Type.STRING },
                                  dosage: { type: Type.STRING },
                                  frequency: { type: Type.STRING },
                                  duration: { type: Type.STRING },
                                  purpose: { type: Type.STRING },
                                  precautions: { type: Type.STRING },
                                  timing: { type: Type.ARRAY, items: { type: Type.STRING } }
                              }
                          }
                      }
                  },
                  required: ["whatsappMessage", "extractedData"]
              }
          }
        });

        const responseText = aiResponse.text;
        if (!responseText) throw new Error("No response from AI");
        const result = JSON.parse(responseText);

        for (const rx of result.extractedData) {
           db.prescriptions.unshift({
              id: Math.random().toString(36).substr(2, 9),
              patientPhone: from,
              imageUrl: mediaUrl,
              extractedData: rx,
              confidenceScore: 0.95,
              timestamp: new Date().toISOString()
           });
        }

        const finalReply = `${result.whatsappMessage}\n\nNote: This is an AI transcription. Please verify with your doctor or pharmacist.`;
        twiml.message(finalReply);
      } else {
        // Text only response
        const promptText = `Imagine you are an expert medical AI assistant for the 'Jivan-Mitra Clinical Platform'. A user has sent the following message: "${bodyText}". 
        Please provide a helpful, concise response. Emphasize that you are an AI and they should consult a real doctor for serious issues. Return your response in JSON format.`;
        
        aiResponse = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: [
              { role: "user", parts: [{ text: promptText }] }
          ],
          config: {
              responseMimeType: "application/json",
              responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                      whatsappMessage: { type: Type.STRING, description: "The conversational text response to send back via WhatsApp." }
                  },
                  required: ["whatsappMessage"]
              }
          }
        });

        const responseText = aiResponse.text;
        if (!responseText) throw new Error("No response from AI");
        const result = JSON.parse(responseText);
        
        const finalReply = `${result.whatsappMessage}\n\nNote: This is an AI assistant, not professional medical advice.`;
        twiml.message(finalReply);
      }

      res.type('text/xml').send(twiml.toString());
    } catch (error) {
      console.error("WhatsApp Webhook Error:", error);
      twiml.message("Sorry, I encountered an error right now. Please try again later.\n\nNote: Please verify with your doctor or pharmacist on medical matters.");
      res.type('text/xml').send(twiml.toString());
    }
  });

  // 1. Get Prescriptions for a patient
  app.get("/api/prescriptions", (req, res) => {
    // In a real app we'd fetch by logged-in user phone
    // We mock returning the existing prescriptions
    res.json(db.prescriptions);
  });

  // 2. OCR Endpoint: Front-end will do the actual Gemini call but might send it here to save
  // Alternatively fallback: Gemini backend route for drug interaction
  app.post("/api/interactions", (req, res) => {
    const { drugs } = req.body;
    // Mock drug interaction logic
    if (drugs && drugs.length > 1) {
      if (drugs.includes("Ibuprofen") && drugs.includes("Aspirin")) {
         return res.json({ safe: false, warning: "High risk of gastrointestinal bleeding." });
      }
    }
    res.json({ safe: true, warning: null });
  });

  // 3. Save prescription
  app.post("/api/prescriptions", (req, res) => {
    const { extractedData, confidenceScore } = req.body;
    const newRx = {
      id: Math.random().toString(36).substr(2, 9),
      patientPhone: "mock-user",
      imageUrl: "mock-url",
      extractedData,
      confidenceScore,
      timestamp: new Date().toISOString()
    };
    db.prescriptions.unshift(newRx);
    res.json(newRx);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
