import React, { useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { PhoneCall, MapPin, AlertCircle, Loader, User, ShieldCheck } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

interface Location {
 lat: number;
 lng: number;
}

export default function SOSCommandCenter() {
 const { t } = useLanguage();
 const { user, setShowAuthModal, login, loginWithGoogle } = useAuth();
 const [loadingLoc, setLoadingLoc] = useState(false);
 const [location, setLocation] = useState<Location | null>(null);
 const [activeSOS, setActiveSOS] = useState(false);
 
 // locating -> notifying_hospitals -> (asking_login if guest) -> done
 const [step, setStep] = useState<"locating" | "notifying_hospitals" | "asking_login" | "done">("locating");

 const [contactNotified, setContactNotified] = useState(false);

 const handleSOS = () => {
 setActiveSOS(true);
 setLoadingLoc(true);
 setStep("locating");
 setContactNotified(false);
 
 if (navigator.geolocation) {
 navigator.geolocation.getCurrentPosition(
 (pos) => {
 setLocation({
 lat: pos.coords.latitude,
 lng: pos.coords.longitude
 });
 setLoadingLoc(false);
 processSOS();
 },
 (err) => {
 console.error("Geolocation error:", err);
 setLoadingLoc(false);
 processSOS();
 }
 );
 } else {
 setLoadingLoc(false);
 processSOS();
 }
 };

 const processSOS = () => {
 setStep("notifying_hospitals");
 
 // Simulate hospital notification delay
 setTimeout(() => {
 if (!user) {
 setStep("asking_login");
 } else {
 setContactNotified(true);
 setStep("done");
 }
 }, 2000);
 };
 
 const handleInstantGoogleLogin = async () => {
 await loginWithGoogle();
 setStep("done");
 setContactNotified(true);
 };

 const emergencyContactName = user?.emergencyContacts && user.emergencyContacts.length > 0 && user.emergencyContacts[0].name 
 ? user.emergencyContacts[0].name 
 : "Primary Contact";

 return (
 <div className="bg-white dark:bg-[#111827] rounded-3xl border border-[#bbdefb] dark:border-slate-800 shadow-sm p-8 overflow-hidden h-full flex flex-col">
 <div className="text-center mb-8">
 <h2 className="text-3xl font-bold font-serif text-red-600 mb-2">Emergency Response</h2>
 <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Connects to nearby hospitals & emergency contacts</p>
 </div>
 
 <div className="flex-1 flex flex-col items-center justify-center">
 {!activeSOS ? (
 <div className="flex flex-col items-center">
 <button 
 onClick={handleSOS}
 className="relative group h-64 w-64 rounded-full bg-gradient-to-b from-red-500 to-red-700 flex items-center justify-center text-white shadow-[0_20px_50px_rgba(220,38,38,0.3)] hover:scale-[1.02] active:scale-95 transition-all outline-none"
 >
 <div className="absolute inset-0 rounded-full border-[20px] border-red-500/10 animate-ping"></div>
 <div className="flex flex-col items-center z-10">
 <PhoneCall size={64} strokeWidth={2} />
 <span className="font-bold text-3xl uppercase tracking-widest mt-4">SOS</span>
 </div>
 </button>
 <p className="mt-12 text-slate-500 dark:text-slate-400 font-medium text-center max-w-sm">
 Tap the button in case of a medical emergency to share your live location with <strong className="text-slate-800 dark:text-slate-200">Dad (Emergency Contact)</strong> and nearby facilities.
 </p>
 </div>
 ) : (
 <div className="w-full max-w-lg space-y-6 animate-in fade-in zoom-in-95 duration-500">
 <div className="bg-red-600 text-white p-8 rounded-3xl text-center shadow-[0_10px_30px_rgba(220,38,38,0.2)]">
 <AlertCircle size={48} className="mx-auto mb-4 animate-pulse" />
 <h3 className="text-2xl font-bold uppercase tracking-widest mb-2">Emergency Activated</h3>
 <p className="text-red-100 font-semibold text-lg">Alerting nearby facilities{user ? ` and ${emergencyContactName}...` : "..."}</p>
 </div>

 <div className="bg-slate-50 dark:bg-[#1E293B]/50 rounded-3xl p-6 border border-slate-200 dark:border-slate-800">
 <div className="flex flex-col items-center mb-6 border-b border-slate-200 dark:border-slate-800 pb-6">
 {loadingLoc ? (
 <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
 <Loader size={20} className="animate-spin" />
 <span className="font-bold uppercase tracking-widest text-sm">Acquiring Live GPS...</span>
 </div>
 ) : location ? (
 <div className="flex items-center gap-3 text-[#0D47A1] dark:text-blue-400">
 <MapPin size={28} />
 <div>
 <p className="font-bold uppercase tracking-widest text-xs text-slate-500 dark:text-slate-400 mb-1">Current Coordinates</p>
 <span className="font-bold font-mono text-xl">
 {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
 </span>
 </div>
 </div>
 ) : (
 <div className="font-bold text-slate-500 dark:text-slate-400">Location unavailable. Using generalized area.</div>
 )}
 </div>

 {/* Contact Notification Section */}
 <div className="space-y-4">
 <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Personal Contact Status</h4>
 
 {step === "asking_login" ? (
 <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-center">
 <ShieldCheck size={28} className="text-amber-500 mx-auto mb-2" />
 <p className="text-sm font-bold text-amber-800 mb-3">Login to instantly notify your closest personal contacts.</p>
 <button onClick={handleInstantGoogleLogin} className="w-full bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-700 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 dark:bg-[#1E293B]/50 transition-all shadow-sm">
 <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-[18px] h-[18px]" />
 Instantly Login with Google
 </button>
 </div>
 ) : contactNotified ? (
 <div className="flex items-center p-4 rounded-2xl bg-white dark:bg-[#111827] border border-green-200 shadow-sm gap-4">
 <div className="bg-green-50 p-3 rounded-xl text-green-600"><User size={24} /></div>
 <div className="flex-1">
 <p className="font-bold text-slate-800 dark:text-slate-200">{emergencyContactName}</p>
 <p className="text-xs font-bold text-green-600 uppercase tracking-widest mt-1">✓ Live Location Sent</p>
 </div>
 </div>
 ) : (
 <div className="flex items-center justify-center p-4 gap-2 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs">
 <div className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
 Preparing...
 </div>
 )}
 </div>

 <div className="space-y-4 mt-6 border-t border-slate-200 dark:border-slate-800 pt-6">
 <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Hospital Responses</h4>
 
 <div className="space-y-3">
 {[
 { name: "City Civil Hospital", distance: "1.2 km", time: "5 mins", active: step === "done" || step === "asking_login" },
 { name: "Sanjivani Multispeciality", distance: "3.4 km", time: "12 mins", active: step === "done" || step === "asking_login" },
 ].map((h, i) => (
 <div key={i} className={`flex justify-between items-center p-4 rounded-2xl bg-white dark:bg-[#111827] border shadow-sm transition-all ${h.active ? 'border-green-200' : 'border-slate-100 dark:border-slate-800/80 opacity-60'}`}>
 <div>
 <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
 {h.name}
 {h.active && <span className="w-2 h-2 rounded-full bg-green-500 shrink-0"></span>}
 </p>
 <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">{h.distance} away | Traffic: Light</p>
 </div>
 <div className={`${h.active ? 'bg-green-600' : 'bg-slate-300'} text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-colors`}>
 {h.active ? h.time : "..."}
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>
 
 <button 
 onClick={() => setActiveSOS(false)} 
 className="w-full py-4 text-center text-sm font-bold text-slate-400 uppercase tracking-widest hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
 >
 Cancel Emergency Protocol
 </button>
 </div>
 )}
 </div>
 </div>
 );
}
