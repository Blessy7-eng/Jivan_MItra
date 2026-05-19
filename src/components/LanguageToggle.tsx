import React, { useState, useEffect, useRef } from "react";
import { Globe, ChevronDown, Search } from "lucide-react";

const LANGUAGES = [
 { code: "en", name: "English" },
 { code: "hi", name: "Hindi" },
 { code: "mr", name: "Marathi" },
 { code: "gu", name: "Gujarati" },
 { code: "ta", name: "Tamil" },
 { code: "te", name: "Telugu" },
 { code: "kn", name: "Kannada" },
 { code: "ml", name: "Malayalam" },
 { code: "bn", name: "Bengali" },
 { code: "pa", name: "Punjabi" },
 { code: "ur", name: "Urdu" },
 { code: "es", name: "Spanish" },
 { code: "fr", name: "French" },
 { code: "de", name: "German" },
 { code: "it", name: "Italian" },
 { code: "pt", name: "Portuguese" },
 { code: "ru", name: "Russian" },
 { code: "ja", name: "Japanese" },
 { code: "ko", name: "Korean" },
 { code: "zh-CN", name: "Chinese (Simplified)" },
 { code: "zh-TW", name: "Chinese (Traditional)" },
 { code: "ar", name: "Arabic" },
 { code: "tr", name: "Turkish" },
 { code: "nl", name: "Dutch" },
 { code: "el", name: "Greek" },
 { code: "vi", name: "Vietnamese" },
 { code: "th", name: "Thai" },
 { code: "id", name: "Indonesian" },
 { code: "ms", name: "Malay" },
 { code: "fil", name: "Filipino" },
 { code: "sw", name: "Swahili" },
 { code: "am", name: "Amharic" },
 { code: "yo", name: "Yoruba" },
 { code: "zu", name: "Zulu" },
 { code: "af", name: "Afrikaans" },
 { code: "pl", name: "Polish" },
 { code: "uk", name: "Ukrainian" },
 { code: "cs", name: "Czech" },
 { code: "ro", name: "Romanian" },
 { code: "hu", name: "Hungarian" },
 { code: "sk", name: "Slovak" },
 { code: "bg", name: "Bulgarian" },
 { code: "hr", name: "Croatian" },
 { code: "sr", name: "Serbian" },
 { code: "sv", name: "Swedish" },
 { code: "da", name: "Danish" },
 { code: "fi", name: "Finnish" },
 { code: "no", name: "Norwegian" },
];

export default function LanguageToggle() {
 const [isOpen, setIsOpen] = useState(false);
 const [search, setSearch] = useState("");
 const [currentLang, setCurrentLang] = useState("en");
 const dropdownRef = useRef<HTMLDivElement>(null);

 useEffect(() => {
 // Check cookie for current language
 const match = document.cookie.match(/(?:^|;)\s*googtrans=([^;]*)/);
 if (match && match[1]) {
 const parts = decodeURIComponent(match[1]).split('/');
 if (parts.length >= 3) {
 setCurrentLang(parts[2]);
 }
 }

 const handleClickOutside = (event: MouseEvent) => {
 if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
 setIsOpen(false);
 }
 };

 document.addEventListener("mousedown", handleClickOutside);
 return () => document.removeEventListener("mousedown", handleClickOutside);
 }, []);

 const handleSelectLanguage = (code: string) => {
 setIsOpen(false);
 
 // Clear existing translation cookies
 document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`;
 document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
 document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname}`;

 if (code === "en") {
 // For English, we just cleared it, so it will revert to default
 } else {
 document.cookie = `googtrans=/en/${code}; path=/; domain=${window.location.hostname}`;
 document.cookie = `googtrans=/en/${code}; path=/`;
 document.cookie = `googtrans=/en/${code}; path=/; domain=.${window.location.hostname}`;
 }
 
 window.location.reload();
 };

 const filteredLanguages = LANGUAGES.filter(l => 
 l.name.toLowerCase().includes(search.toLowerCase()) || 
 l.code.toLowerCase().includes(search.toLowerCase())
 );

 return (
 <div className="relative" ref={dropdownRef}>
 <button 
 onClick={() => setIsOpen(!isOpen)}
 className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full px-3 py-2 transition-colors border border-slate-200 dark:border-slate-800"
 >
 <Globe size={16} className="text-[#0D47A1] dark:text-blue-400" />
 <span className="text-sm font-semibold uppercase text-slate-700">
 {currentLang}
 </span>
 <ChevronDown size={14} className="text-slate-500 dark:text-slate-400" />
 </button>

 {isOpen && (
 <div className="absolute top-full mt-2 right-0 w-64 bg-white dark:bg-[#111827] rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800/80 overflow-hidden z-50">
 <div className="p-3 border-b border-slate-100 dark:border-slate-800/80">
 <div className="relative">
 <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
 <input
 type="text"
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 placeholder="Search language..."
 className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-[#1E293B]/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0D47A1]/20 dark:text-white"
 />
 </div>
 </div>
 
 <div className="max-h-64 overflow-y-auto p-2 scrollbar-thin">
 {filteredLanguages.length > 0 ? (
 filteredLanguages.map((lang) => (
 <button
 key={lang.code}
 onClick={() => handleSelectLanguage(lang.code)}
 className={`w-full text-left px-3 py-2 text-sm rounded-xl transition-colors ${
 currentLang === lang.code 
 ? "bg-blue-50 dark:bg-blue-900/30 text-[#0D47A1] dark:text-blue-400 font-bold" 
 : "text-slate-700 hover:bg-slate-50 dark:bg-[#1E293B]/50 dark:hover:bg-slate-700/50"
 }`}
 >
 {lang.name}
 </button>
 ))
 ) : (
 <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">
 No languages found
 </div>
 )}
 </div>
 </div>
 )}
 </div>
 );
}
