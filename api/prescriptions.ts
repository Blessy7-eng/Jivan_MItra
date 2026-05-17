import type { VercelRequest, VercelResponse } from '@vercel/node';

// Mock DB for demonstration
const db = {
  prescriptions: [
    {
      id: "mock1",
      patientPhone: "mock",
      extractedData: {
        drugName: "Paracetamol 500mg",
        dosage: "1 tablet",
        frequency: "Twice a day",
        duration: "5 days",
        timing: ["morning", "night"]
      },
      confidenceScore: 0.95,
      timestamp: new Date().toISOString()
    }
  ]
};

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Defensive guard for API Keys (if this endpoint required Gemini)
  // For Gemini API endpoints, you would initialize like this:
  /*
  const apiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY_;
  if (!apiKey) {
    return res.status(500).json({ error: "Server Configuration Error: API key is missing." });
  }
  */

  if (req.method === 'GET') {
    return res.status(200).json(db.prescriptions);
  }

  if (req.method === 'POST') {
    const { extractedData, confidenceScore } = req.body || {};
    const newRx = {
      id: Math.random().toString(36).substr(2, 9),
      patientPhone: "mock-user",
      imageUrl: "mock-url",
      extractedData,
      confidenceScore,
      timestamp: new Date().toISOString()
    };
    db.prescriptions.unshift(newRx);
    return res.status(200).json(newRx);
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}
