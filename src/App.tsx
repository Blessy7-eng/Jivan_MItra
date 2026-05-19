import React, { useState } from "react";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import MainLayout from "./components/MainLayout";
import AuthModal from "./components/AuthModal";
import LanguageToggle from "./components/LanguageToggle";
import ThemeToggle from "./components/ThemeToggle";
import SplashScreen from "./components/SplashScreen";
import { HeartPulse, LogOut } from "lucide-react";

function AppContent() {
  const { user, setShowAuthModal, logout } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  
  return (
    <div className="min-h-screen bg-[#E3F2FD]/50 dark:bg-[#0B1120] text-slate-800 dark:text-slate-200 font-sans flex flex-col selection:bg-[#0D47A1] selection:text-white relative transition-colors duration-300">
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      
      <header className="bg-white dark:bg-[#111827]/90 backdrop-blur-md border-b border-[#bbdefb] dark:border-slate-800/80 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm transition-colors duration-300">
        <div className="flex items-center gap-3 text-[#0D47A1] dark:text-blue-400">
          <HeartPulse size={30} strokeWidth={2.5} />
          <h1 className="text-2xl font-bold tracking-tight font-serif shadow-sm inline-block">Jivan-Mitra <span className="text-slate-400 font-sans font-normal text-sm ml-3 hidden sm:inline-block border-l border-slate-200 dark:border-slate-700 pl-3 uppercase tracking-widest">Clinical Platform</span></h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-5">
          <ThemeToggle />
          <LanguageToggle />
          {user ? (
            <button onClick={logout} className="text-slate-400 hover:text-red-600 flex items-center justify-center p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors" title="Secure Sign out">
               <LogOut size={22} />
            </button>
          ) : (
            <button onClick={() => setShowAuthModal(true)} className="text-[#0D47A1] dark:text-blue-400 font-bold text-sm px-4 py-2 rounded-xl border border-[#0D47A1] dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/40 transition-colors">
               Login
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8">
        <MainLayout />
      </main>

      <footer className="w-full text-center py-6 text-sm text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800">
        &copy; {new Date().getFullYear()} Jivan-Mitra Healthcare. All rights reserved.
      </footer>

      <AuthModal />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LanguageProvider>
          <AppContent />
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

