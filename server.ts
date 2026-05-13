import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import multer from "multer";
import cors from "cors";

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

  // API ROUTES

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
