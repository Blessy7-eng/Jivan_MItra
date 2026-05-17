import React, { useState } from "react";
import PatientDashboard from "./PatientDashboard";
import RightPanel from "./RightPanel";
import SOSCommandCenter from "./SOSCommandCenter";
import Chatbot from "./Chatbot";
import { Activity, ShieldAlert, HeartPulse, UserCircle, Settings, ClipboardList, MessageCircle } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";

export default function MainLayout() {
  const { t } = useLanguage();
  const { user, setShowAuthModal, updateProfile } = useAuth();
  const [activeMenu, setActiveMenu] = useState<"overview" | "sos" | "settings">("overview");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showChatbot, setShowChatbot] = useState(false);

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:h-[calc(100vh-100px)] pb-24 lg:pb-0">
      {showChatbot && <Chatbot onClose={() => setShowChatbot(false)} />}
      
      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 flex justify-around items-center p-2 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.5rem)' }}>
        <button 
          onClick={() => setActiveMenu("overview")}
          className={`flex flex-col items-center gap-1 p-2 w-full ${activeMenu === "overview" ? "text-[#0D47A1]" : "text-slate-400"}`}
        >
          <ClipboardList size={22} />
          <span className="text-[10px] font-bold uppercase tracking-wider mt-1">Vault</span>
        </button>
        <button 
          onClick={() => setActiveMenu("sos")}
          className={`flex flex-col items-center gap-1 p-2 w-full relative ${activeMenu === "sos" ? "text-red-600" : "text-slate-400"}`}
        >
          <ShieldAlert size={22} className={activeMenu !== "sos" ? "text-red-500" : ""} />
          <span className="text-[10px] font-bold uppercase tracking-wider mt-1">SOS</span>
          {activeMenu !== "sos" && <span className="absolute top-2 right-[35%] w-2 h-2 bg-red-500 rounded-full animate-pulse border border-white"></span>}
        </button>
        <button 
          onClick={() => setActiveMenu("settings")}
          className={`flex flex-col items-center gap-1 p-2 w-full ${activeMenu === "settings" ? "text-slate-800" : "text-slate-400"}`}
        >
          <Settings size={22} />
          <span className="text-[10px] font-bold uppercase tracking-wider mt-1">Profile</span>
        </button>
      </nav>

      {/* Left Sidebar: Navigation & Profile */}
      <aside className="hidden lg:flex lg:col-span-2 flex-col gap-6 h-full">
         <div className="bg-white rounded-3xl border border-[#bbdefb] p-5 shadow-sm flex flex-col items-center text-center">
             <div className="w-20 h-20 bg-[#0D47A1] rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-md mb-3">
                {user ? user.name.substring(0, 1).toUpperCase() : "G"}
             </div>
             <h2 className="text-lg font-bold text-slate-800">{user ? user.name : "Guest User"}</h2>
             <p className="text-xs font-semibold text-slate-500 mb-2 truncate max-w-[12rem]">{user ? user.email : "Not logged in"}</p>
             {user && user.abhaId ? (
                <div className="bg-[#E3F2FD] text-[#0D47A1] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-blue-200 shadow-sm mt-1">
                   ABHA: {user.abhaId}
                </div>
             ) : (
                <button 
                  onClick={() => user ? setActiveMenu('settings') : setShowAuthModal(true)} 
                  className="bg-slate-50 text-slate-500 hover:text-[#0D47A1] hover:bg-blue-50 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-slate-200 transition-colors mt-1"
                >
                  {user ? "+ Add ABHA ID" : "Login to Save Data"}
                </button>
             )}
         </div>

         <nav className="bg-white rounded-3xl border border-[#bbdefb] p-3 shadow-sm flex-1 flex flex-col gap-2">
            <button 
              onClick={() => setActiveMenu("overview")}
              className={`flex items-center gap-3 p-4 rounded-2xl font-bold transition-all ${activeMenu === "overview" ? "bg-[#0D47A1] text-white shadow-md" : "text-slate-600 hover:bg-slate-50"}`}
            >
               <ClipboardList size={22} /> My Vault
            </button>
            <button 
              onClick={() => setActiveMenu("sos")}
              className={`flex items-center gap-3 p-4 rounded-2xl font-bold transition-all ${activeMenu === "sos" ? "bg-red-600 text-white shadow-md" : "text-slate-600 hover:bg-slate-50"}`}
            >
               <ShieldAlert size={22} /> SOS History
            </button>
            <button 
              onClick={() => setActiveMenu("settings")}
              className={`flex items-center gap-3 p-4 rounded-2xl font-bold transition-all ${activeMenu === "settings" ? "bg-slate-800 text-white shadow-md" : "text-slate-600 hover:bg-slate-50"}`}
            >
               <Settings size={22} /> Settings
            </button>
         </nav>
      </aside>

      {/* Center Stage & Right Panel */}
      {activeMenu === "overview" && (
        <>
          <div className="lg:col-span-5 lg:h-full h-auto flex flex-col">
            <div className="bg-white rounded-3xl border border-[#bbdefb] shadow-sm flex-1 lg:overflow-y-auto">
              <div className="sticky top-0 bg-white/90 backdrop-blur-md z-10 border-b border-[#bbdefb] p-5 lg:p-6 rounded-t-3xl">
                 <div className="flex items-center gap-3">
                   <div className="bg-[#E3F2FD] p-2.5 rounded-xl text-[#0D47A1]">
                     <Activity size={24} />
                   </div>
                   <div>
                      <h2 className="text-2xl font-bold font-serif text-[#0D47A1]">Active Timeline</h2>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5">Current Medication Schedule</p>
                   </div>
                 </div>
              </div>
              <div className="p-6">
                 <PatientDashboard refreshTrigger={refreshTrigger} />
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 h-[650px] lg:h-full mt-2 lg:mt-0">
            <RightPanel onSaved={() => setRefreshTrigger(prev => prev + 1)} />
          </div>
        </>
      )}

      {activeMenu === "sos" && (
         <div className="lg:col-span-10 flex justify-center items-center lg:h-full h-[70vh]">
             <div className="max-w-2xl w-full">
                <SOSCommandCenter />
             </div>
         </div>
      )}

      {activeMenu === "settings" && (
         <div className="lg:col-span-10 lg:h-full h-auto">
            <div className="bg-white rounded-3xl border border-[#bbdefb] shadow-sm p-6 lg:p-8 max-w-2xl mx-auto">
               <h2 className="text-2xl font-bold font-serif text-[#0D47A1] border-b border-slate-100 pb-4 mb-6">Patient Settings</h2>
               
               {!user ? (
                 <div className="text-center py-10">
                   <p className="text-slate-500 font-semibold mb-6">Please log in to manage your medical profile, ABHA linkage, and emergency contacts.</p>
                   <button 
                     onClick={() => setShowAuthModal(true)} 
                     className="bg-[#0D47A1] text-white px-8 py-3 rounded-xl font-bold shadow-sm hover:bg-blue-900 transition-colors inline-flex items-center gap-2"
                   >
                     Log In to Continue
                   </button>
                 </div>
               ) : (
                 <div className="space-y-6">
                   <div>
                      <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-3">Medical Identity & Privacy</h3>
                      <div className="flex flex-col gap-3 p-4 bg-[#E3F2FD]/50 rounded-2xl border border-blue-100">
                         <div>
                            <p className="font-bold text-[#0D47A1]">ABHA Record Linkage</p>
                            <p className="text-sm font-medium text-slate-600 mt-1">Allow hospitals to access your medical history securely during emergencies.</p>
                         </div>
                         <div className="mt-2">
                           <input 
                             type="text" 
                             placeholder="Enter 14-digit ABHA ID..."
                             className="w-full bg-white border border-blue-200 rounded-xl py-2.5 px-4 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0D47A1] transition-all"
                             value={user.abhaId || ""}
                             onChange={(e) => updateProfile({ abhaId: e.target.value })}
                           />
                         </div>
                      </div>
                   </div>

                   <div>
                      <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-3">Emergency Setup</h3>
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                         <div>
                           <p className="font-bold text-slate-800">Emergency Contacts</p>
                           <p className="text-sm font-medium text-slate-600 mt-1">These contacts will be notified automatically with your GPS location when you activate SOS.</p>
                         </div>
                         
                         <div className="space-y-3">
                           {(Array.isArray(user.emergencyContacts) ? user.emergencyContacts : []).map((contact, idx) => (
                             <div key={contact.id} className="flex flex-col sm:flex-row gap-2">
                               <input
                                 type="text"
                                 placeholder="Name (e.g. Dad)"
                                 className="flex-1 bg-white border border-slate-300 rounded-xl py-2 px-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
                                 value={contact.name}
                                 onChange={(e) => {
                                   const next = [...(user.emergencyContacts || [])];
                                   next[idx] = { ...next[idx], name: e.target.value };
                                   updateProfile({ emergencyContacts: next });
                                 }}
                               />
                               <input
                                 type="tel"
                                 placeholder="Phone (+91...)"
                                 className="flex-1 bg-white border border-slate-300 rounded-xl py-2 px-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
                                 value={contact.phone}
                                 onChange={(e) => {
                                   const next = [...(user.emergencyContacts || [])];
                                   next[idx] = { ...next[idx], phone: e.target.value };
                                   updateProfile({ emergencyContacts: next });
                                 }}
                               />
                               <button 
                                 onClick={() => {
                                    const next = [...(user.emergencyContacts || [])];
                                    next.splice(idx, 1);
                                    updateProfile({ emergencyContacts: next });
                                 }}
                                 className="bg-red-50 text-red-500 px-3 py-2 rounded-xl text-sm font-bold hover:bg-red-100 flex items-center justify-center min-w-[3rem]"
                                 title="Remove Contact"
                               >
                                 ✕
                               </button>
                             </div>
                           ))}
                         </div>

                         <div className="flex flex-col sm:flex-row gap-3 pt-2">
                           <button
                             onClick={() => {
                                const next = [...(user.emergencyContacts || []), { id: Math.random().toString(), name: "", phone: "" }];
                                updateProfile({ emergencyContacts: next });
                             }}
                             className="text-[#0D47A1] font-bold text-sm bg-blue-50 px-4 py-2.5 rounded-xl border border-blue-200 hover:bg-blue-100 flex-1 text-center transition-colors"
                           >
                              + Add New Contact
                           </button>
                           <button
                             onClick={(e) => {
                               const btn = e.currentTarget;
                               const originalText = btn.innerText;
                               btn.innerText = "✓ Saved!";
                               btn.classList.replace("bg-[#0D47A1]", "bg-green-600");
                               btn.classList.replace("hover:bg-blue-900", "hover:bg-green-700");
                               setTimeout(() => {
                                 btn.innerText = originalText;
                                 btn.classList.replace("bg-green-600", "bg-[#0D47A1]");
                                 btn.classList.replace("hover:bg-green-700", "hover:bg-blue-900");
                               }, 2000);
                             }}
                             className="bg-[#0D47A1] text-white font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-blue-900 flex-1 text-center transition-colors shadow-sm"
                           >
                              Save Settings
                           </button>
                         </div>
                      </div>
                   </div>

                   <div>
                      <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-3">Offline Mode</h3>
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                         <p className="font-bold text-slate-800">Service Worker Strategy Active</p>
                         <p className="text-sm font-medium text-slate-600 mt-1">Your vault and timeline are cached locally. You can access your dosage without an internet connection.</p>
                      </div>
                   </div>
                 </div>
               )}
            </div>
         </div>
      )}

      {/* Floating Action Buttons (Chatbot, WhatsApp & SOS) */}
      <div className="fixed bottom-24 right-6 lg:bottom-8 lg:right-8 flex flex-col gap-4 z-50">
         <button 
            onClick={() => setShowChatbot(true)}
            className="w-14 h-14 bg-[#0D47A1] text-white rounded-full flex items-center justify-center shadow-[0_4px_15px_rgba(13,71,161,0.4)] hover:bg-[#002171] hover:scale-110 active:scale-95 transition-all outline-none focus:ring-4 focus:ring-blue-500/30 group"
            title="Chat with Web Chatbot (Jivan-Mitra)"
         >
            <MessageCircle size={26} strokeWidth={2.5} className="z-10 group-hover:scale-110 transition-transform" />
         </button>

         <a 
            href={`https://wa.me/+14155238886?text=${encodeURIComponent("Hello Jivan-Mitra! I need to upload a prescription photo for analysis, or set up my medicine reminders.")}`} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-[0_4px_15px_rgba(37,211,102,0.4)] hover:bg-[#128C7E] hover:scale-110 active:scale-95 transition-all outline-none focus:ring-4 focus:ring-[#25D366]/30 group"
            title="Chat with AI Pharmacist on WhatsApp"
         >
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
         </a>
         
         <button 
            onClick={() => setActiveMenu('sos')}
            className="w-14 h-14 bg-red-600 text-white rounded-full flex items-center justify-center shadow-[0_4px_15px_rgba(220,38,38,0.4)] hover:bg-red-700 hover:scale-110 active:scale-95 transition-all outline-none focus:ring-4 focus:ring-red-500/30 group relative"
            title="Emergency SOS"
         >
            <div className="absolute inset-0 rounded-full border-2 border-red-400 animate-ping opacity-30"></div>
            <ShieldAlert size={26} strokeWidth={2.5} className="z-10 group-hover:scale-110 transition-transform" />
         </button>
      </div>
    </div>
  );
}
