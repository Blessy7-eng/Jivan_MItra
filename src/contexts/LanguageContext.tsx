import React, { createContext, useContext, useState, ReactNode } from "react";

type Language = "en" | "hi" | "mr";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    dashboard: "Patient Dashboard",
    healthVault: "Health Vault",
    handwritingAnalyzer: "Handwriting Analyzer",
    sos: "SOS Emergency",
     activeRx: "Active Prescriptions",
    uploadRx: "Upload Prescription",
    uploadDesc: "Drag & drop or tap to upload a photo of your prescription",
    processing: "AI Processing...",
    noRx: "No active prescriptions.",
    interactionChecker: "Drug Interactions",
    uploadPill: "Verify Pill",
    consent: "I consent to link my ABHA record"
  },
  hi: {
    dashboard: "रोगी डैशबोर्ड",
    healthVault: "स्वास्थ्य वॉल्ट",
    handwritingAnalyzer: "हस्तलेख विश्लेषक",
    sos: "आपातकालीन SOS",
    activeRx: "सक्रिय नुस्खे",
    uploadRx: "नुस्खा अपलोड करें",
    uploadDesc: "अपने नुस्खे की फोटो खींचें या यहाँ अपलोड करें",
    processing: "AI प्रोसेस कर रहा है...",
    noRx: "कोई सक्रिय नुस्खे नहीं हैं।",
    interactionChecker: "दवा पारस्परिक क्रिया",
    uploadPill: "गोली सत्यापित करें",
    consent: "मैं अपने ABHA रिकॉर्ड को लिंक करने की सहमति देता हूँ"
  },
  mr: {
    dashboard: "रुग्ण डॅशबोर्ड",
    healthVault: "आरोग्य वॉल्ट",
    handwritingAnalyzer: "हस्ताक्षर विश्लेषक",
    sos: "आणीबाणी SOS",
    activeRx: "सक्रिय प्रिस्क्रिप्शन",
    uploadRx: "प्रिस्क्रिप्शन अपलोड करा",
    uploadDesc: "तुमच्या प्रिस्क्रिप्शनचा फोटो येथे अपलोड करा",
    processing: "AI प्रक्रिया करत आहे...",
    noRx: "कोणतेही सक्रिय प्रिस्क्रिप्शन नाहीत.",
    interactionChecker: "औषधांचा परस्परसंवाद",
    uploadPill: "गोळी तपासा",
    consent: "माझे ABHA रेकॉर्ड लिंक करण्यास माझी संमती आहे"
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>("en");

  const t = (key: string) => translations[language][key] || key;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
};
