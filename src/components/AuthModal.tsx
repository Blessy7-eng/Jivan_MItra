import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Mail, Lock, User, X } from "lucide-react";

export default function AuthModal() {
 const { showAuthModal, setShowAuthModal, login, loginWithGoogle, loginWithFacebook } = useAuth();
 const [isLogin, setIsLogin] = useState(true);
 
 const [name, setName] = useState("");
 const [email, setEmail] = useState("");
 const [password, setPassword] = useState("");

 if (!showAuthModal) return null;

 const handleSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 login(name || email.split("@")[0] || "User", email);
 };

 const socialLogin = (provider: string) => {
 login(`${provider} User`, `user@${provider.toLowerCase()}.com`);
 };

 return (
 <div 
 className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
 role="dialog"
 aria-modal="true"
 aria-labelledby="auth-modal-title"
 >
 <div className="bg-white dark:bg-[#111827] rounded-3xl w-full max-w-md p-8 relative overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
 <button 
 onClick={() => setShowAuthModal(false)}
 className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 dark:text-slate-200 transition-colors p-2 rounded-full hover:bg-slate-100 dark:bg-slate-800"
 aria-label="Close modal"
 >
 <X size={24} strokeWidth={2.5} />
 </button>
 
 <div className="mb-8 mt-2 text-center">
 <h2 id="auth-modal-title" className="text-2xl font-bold font-serif text-[#0D47A1] dark:text-blue-400">
 {isLogin ? "Welcome Back" : "Create Account"}
 </h2>
 <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
 {isLogin ? "Log in to access your clinical portal" : "Sign up to track your health records"}
 </p>
 </div>

 <form onSubmit={handleSubmit} className="space-y-5">
 {!isLogin && (
 <div className="relative">
 <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
 <input 
 type="text" 
 placeholder="Full Name" 
 className="w-full bg-slate-50 dark:bg-[#1E293B]/50 border border-slate-200 dark:border-slate-800 rounded-2xl py-3.5 pl-11 pr-4 font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-[#0D47A1] focus:border-transparent outline-none transition-all"
 value={name}
 onChange={(e) => setName(e.target.value)}
 required
 />
 </div>
 )}
 <div className="relative">
 <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
 <input 
 type="email" 
 placeholder="Email Address" 
 className="w-full bg-slate-50 dark:bg-[#1E293B]/50 border border-slate-200 dark:border-slate-800 rounded-2xl py-3.5 pl-11 pr-4 font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-[#0D47A1] focus:border-transparent outline-none transition-all"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 required
 />
 </div>
 <div className="relative">
 <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
 <input 
 type="password" 
 placeholder="Password" 
 className="w-full bg-slate-50 dark:bg-[#1E293B]/50 border border-slate-200 dark:border-slate-800 rounded-2xl py-3.5 pl-11 pr-4 font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-[#0D47A1] focus:border-transparent outline-none transition-all"
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 required
 />
 </div>
 
 <button type="submit" className="w-full bg-[#0D47A1] text-white font-bold py-3.5 rounded-2xl shadow-[0_4px_15px_rgba(13,71,161,0.2)] hover:bg-blue-900 hover:scale-[1.02] active:scale-95 transition-all">
 {isLogin ? "Secure Log In" : "Create Free Account"}
 </button>
 </form>

 <div className="mt-6 flex items-center gap-4">
 <div className="h-px bg-slate-200 flex-1"></div>
 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">OR CONTINUE WITH</span>
 <div className="h-px bg-slate-200 flex-1"></div>
 </div>

 <div className="mt-6 grid grid-cols-2 gap-3">
 <button type="button" onClick={() => loginWithGoogle()} className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-700 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 dark:bg-[#1E293B]/50 transition-colors shadow-sm">
 <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-[18px] h-[18px]" />
 Google
 </button>
 <button type="button" onClick={() => loginWithFacebook()} className="bg-[#1877F2] text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-sm">
 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
 Facebook
 </button>
 </div>

 <p className="mt-8 text-center text-sm font-semibold text-slate-500 dark:text-slate-400">
 {isLogin ? "Don't have an account? " : "Already have an account? "}
 <button onClick={() => setIsLogin(!isLogin)} className="text-[#0D47A1] dark:text-blue-400 hover:underline font-bold">
 {isLogin ? "Sign up" : "Log in"}
 </button>
 </p>
 </div>
 </div>
 );
}
