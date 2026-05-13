import React, { useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { PhoneCall, MapPin, AlertCircle, Loader, User } from "lucide-react";

interface Location {
  lat: number;
  lng: number;
}

export default function SOSCommandCenter() {
  const { t } = useLanguage();
  const [loadingLoc, setLoadingLoc] = useState(false);
  const [location, setLocation] = useState<Location | null>(null);
  const [activeSOS, setActiveSOS] = useState(false);

  const handleSOS = () => {
    setActiveSOS(true);
    setLoadingLoc(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
          setLoadingLoc(false);
        },
        (err) => {
          console.error("Geolocation error:", err);
          setLoadingLoc(false);
        }
      );
    } else {
      setLoadingLoc(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-[#bbdefb] shadow-sm p-8 overflow-hidden h-full flex flex-col">
       <div className="text-center mb-8">
           <h2 className="text-3xl font-bold font-serif text-red-600 mb-2">Emergency Response</h2>
           <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Connects to nearby hospitals & emergency contacts</p>
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
                 <p className="mt-12 text-slate-500 font-medium text-center max-w-sm">
                    Tap the button in case of a medical emergency to share your live location with <strong className="text-slate-800">Dad (Emergency Contact)</strong> and nearby facilities.
                 </p>
              </div>
           ) : (
              <div className="w-full max-w-lg space-y-6 animate-in fade-in zoom-in-95 duration-500">
                 <div className="bg-red-600 text-white p-8 rounded-3xl text-center shadow-[0_10px_30px_rgba(220,38,38,0.2)]">
                    <AlertCircle size={48} className="mx-auto mb-4 animate-pulse" />
                    <h3 className="text-2xl font-bold uppercase tracking-widest mb-2">Emergency Activated</h3>
                    <p className="text-red-100 font-semibold">Alerting Dad and searching for nearby medical help...</p>
                 </div>

                 <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200">
                    <div className="flex flex-col items-center mb-6 border-b border-slate-200 pb-6">
                      {loadingLoc ? (
                        <div className="flex items-center gap-3 text-slate-500">
                          <Loader size={20} className="animate-spin" />
                          <span className="font-bold uppercase tracking-widest text-sm">Acquiring Live GPS...</span>
                        </div>
                      ) : location ? (
                        <div className="flex items-center gap-3 text-[#0D47A1]">
                          <MapPin size={28} />
                          <div>
                              <p className="font-bold uppercase tracking-widest text-xs text-slate-500 mb-1">Current Coordinates</p>
                              <span className="font-bold font-mono text-xl">
                                {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                              </span>
                          </div>
                        </div>
                      ) : null}
                    </div>

                    <div className="space-y-4">
                       <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Notifications Sent</h4>
                       
                       <div className="flex items-center p-3 rounded-2xl bg-white border border-slate-100 shadow-sm gap-4">
                          <div className="bg-slate-100 p-3 rounded-xl text-slate-600"><User size={24} /></div>
                          <div className="flex-1">
                              <p className="font-bold text-slate-800">Dad (Primary Contact)</p>
                              <p className="text-xs font-bold text-green-600">SMS & Location Sent</p>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-4 mt-6">
                       <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Locating Hospitals...</h4>
                       
                       <div className="space-y-3">
                           {[
                            { name: "City Civil Hospital", distance: "1.2 km", time: "5 mins" },
                            { name: "Sanjivani Multispeciality", distance: "3.4 km", time: "12 mins" },
                           ].map((h, i) => (
                              <div key={i} className="flex justify-between items-center p-4 rounded-2xl bg-white border border-slate-100 shadow-sm transition-all hover:border-blue-200 cursor-pointer">
                                <div>
                                   <p className="font-bold text-slate-800">{h.name}</p>
                                   <p className="text-xs font-bold text-slate-500 mt-1">{h.distance} away | Traffic: Light</p>
                                </div>
                                <div className="bg-[#0D47A1] text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm">
                                  {h.time}
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
