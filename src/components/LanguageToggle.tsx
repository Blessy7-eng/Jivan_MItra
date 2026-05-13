import React from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { Globe } from "lucide-react";

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex bg-slate-100 rounded-full p-1 items-center">
      <Globe size={16} className="text-slate-400 ml-2 mr-1" />
      {(["en", "hi", "mr"] as const).map((lang) => (
        <button
          key={lang}
          onClick={() => setLanguage(lang)}
          className={`px-3 py-1 text-xs font-semibold rounded-full uppercase transition-all ${
            language === lang ? "bg-white text-[#0056b3] shadow-sm" : "text-slate-500"
          }`}
        >
          {lang}
        </button>
      ))}
    </div>
  );
}
