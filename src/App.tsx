import React from "react";
import { LanguageProvider } from "./contexts/LanguageContext";
import AuthGate from "./components/AuthGate";
import MainLayout from "./components/MainLayout";
import LanguageToggle from "./components/LanguageToggle";
import { HeartPulse, LogOut } from "lucide-react";

function AppContent() {
  return (
    <div className="min-h-screen bg-[#E3F2FD]/50 text-slate-800 font-sans flex flex-col selection:bg-[#0D47A1] selection:text-white">
      <header className="bg-white border-b border-[#bbdefb] px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3 text-[#0D47A1]">
          <HeartPulse size={30} strokeWidth={2.5} />
          <h1 className="text-2xl font-bold tracking-tight font-serif shadow-sm inline-block">Jivan-Mitra <span className="text-slate-400 font-sans font-normal text-sm ml-3 hidden sm:inline-block border-l border-slate-200 pl-3 uppercase tracking-widest">Clinical Platform</span></h1>
        </div>
        <div className="flex items-center gap-5">
          <LanguageToggle />
          <button className="text-slate-400 hover:text-red-600 flex items-center justify-center p-2 rounded-full hover:bg-red-50 transition-colors" title="Secure Sign out">
             <LogOut size={22} />
          </button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8">
        <MainLayout />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthGate>
        <AppContent />
      </AuthGate>
    </LanguageProvider>
  );
}
