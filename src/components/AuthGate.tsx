import React, { useState } from "react";
import { ShieldCheck, Phone, KeyRound, HeartPulse, User, Calendar, Languages } from "lucide-react";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Profile
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [language, setLanguage] = useState("English");

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(2);
    }, 1000);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(3);
    }, 1000);
  };

  const handleCreateProfile = (e: React.FormEvent) => {
     e.preventDefault();
     if (!name || !age) return;
     setLoading(true);
     setTimeout(() => {
       setLoading(false);
       setIsAuthenticated(true);
     }, 1000);
  };

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#E3F2FD] flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-[#bbdefb] p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-[#0D47A1] text-white p-4 rounded-2xl mb-4 shadow-md">
            <HeartPulse size={36} strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold text-[#0D47A1] tracking-tight">Jivan-Mitra</h1>
          <p className="text-sm font-semibold text-slate-500 mt-2">Professional Healthcare Portal</p>
        </div>

        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="tel"
                  placeholder="Enter your mobile number"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#0D47A1] focus:border-transparent transition-all"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || phone.length < 10}
              className="w-full bg-[#0D47A1] text-white font-bold py-3 rounded-xl shadow-sm hover:bg-blue-900 disabled:opacity-50 transition-colors flex justify-center"
            >
              {loading ? "Sending Secure OTP..." : "Get Access Code"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-6 animate-in fade-in slide-in-from-right-8">
            <div className="text-center mb-6">
               <p className="text-sm text-slate-600 font-medium">We sent a 4-digit code to</p>
               <p className="font-bold text-[#0D47A1] text-lg">{phone}</p>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">One-Time Password</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  maxLength={4}
                  placeholder="• • • •"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-[#0D47A1] font-bold tracking-[1em] text-center focus:outline-none focus:ring-2 focus:ring-[#0D47A1] focus:border-transparent transition-all"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || otp.length < 4}
              className="w-full bg-[#0D47A1] text-white font-bold py-3 rounded-xl shadow-sm hover:bg-blue-900 disabled:opacity-50 transition-colors flex justify-center gap-2 items-center"
            >
              {loading ? "Verifying..." : <><ShieldCheck size={20} /> Secure Login</>}
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleCreateProfile} className="space-y-5 animate-in fade-in slide-in-from-right-8">
            <div className="text-center mb-4">
               <h2 className="text-lg font-bold text-slate-800">Complete Profile</h2>
               <p className="text-sm text-slate-500">Just a few details to get started.</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Patient Name"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#0D47A1]"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Age</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="number"
                  placeholder="e.g. 65"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#0D47A1]"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Preferred Language</label>
              <div className="relative">
                <Languages className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <select
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#0D47A1] appearance-none"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                   <option value="English">English</option>
                   <option value="Hindi">Hindi (हिंदी)</option>
                   <option value="Marathi">Marathi (मराठी)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !name || !age}
              className="w-full mt-4 bg-[#0D47A1] text-white font-bold py-3 rounded-xl shadow-sm hover:bg-blue-900 disabled:opacity-50 transition-colors flex justify-center gap-2 items-center"
            >
              {loading ? "Saving..." : "Enter Portal"}
            </button>
          </form>
        )}
        
        <div className="mt-8 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest flex flex-col items-center justify-center gap-2">
           <ShieldCheck size={18} className="text-[#0D47A1]/50" /> 
           HIPAA / ABHA Compliant Infrastructure
        </div>
      </div>
    </div>
  );
}
