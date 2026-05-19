import React, { useEffect, useState, useRef } from "react";
import { Pill, Sun, Moon, Sunrise, Coffee, Camera, CheckCircle, XCircle } from "lucide-react";
import { ExtractedPrescription, verifyPill } from "../services/geminiService";

interface Prescription {
 id: string;
 extractedData: ExtractedPrescription;
 timestamp: string;
}

export default function PatientDashboard({ refreshTrigger }: { refreshTrigger?: number }) {
 const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
 const [loading, setLoading] = useState(true);
 const [verifyingPillFor, setVerifyingPillFor] = useState<string | null>(null);
 const [verificationResult, setVerificationResult] = useState<string | null>(null);
 const [isVerifying, setIsVerifying] = useState(false);
 const fileInputRef = useRef<HTMLInputElement>(null);

 useEffect(() => {
 setLoading(true);
 fetch("/api/prescriptions")
 .then((res) => {
 if (!res.ok) throw new Error("Failed to fetch prescriptions");
 return res.json();
 })
 .then((data) => {
 setPrescriptions(Array.isArray(data) ? data : []);
 setLoading(false);
 })
 .catch((err) => {
 console.error("Failed to fetch prescriptions:", err);
 setPrescriptions([]); // fallback to empty array gracefully
 setLoading(false);
 });
 }, [refreshTrigger]);

 const getTimingIcon = (timing: string) => {
 switch(timing.toLowerCase()) {
 case "morning": return <Sunrise size={14} className="text-amber-500" />;
 case "afternoon": return <Sun size={14} className="text-orange-500" />;
 case "evening": return <Coffee size={14} className="text-slate-600 dark:text-slate-300" />;
 case "night": return <Moon size={14} className="text-[#0D47A1] dark:text-blue-400" />;
 default: return <Sun size={14} className="text-slate-400" />;
 }
 };

 const handlePillUpload = async (e: React.ChangeEvent<HTMLInputElement>, drugName: string) => {
 if (e.target.files && e.target.files[0]) {
 setIsVerifying(true);
 setVerificationResult(null);
 const file = e.target.files[0];
 const reader = new FileReader();
 reader.onload = async () => {
 const base64 = (reader.result as string).split(',')[1];
 try {
 const res = await verifyPill(base64, file.type, drugName);
 setVerificationResult(res as string);
 } catch (err) {
 setVerificationResult("Error verifying pill.");
 } finally {
 setIsVerifying(false);
 }
 };
 reader.readAsDataURL(file);
 }
 };

 if (loading) {
 return <div className="py-8 text-center text-sm font-semibold text-slate-400 animate-pulse">Syncing treatment schedule...</div>;
 }

 return (
 <section className="space-y-4">
 {prescriptions.length === 0 ? (
 <div className="bg-slate-50 dark:bg-[#1E293B]/50 border border-dashed border-slate-200 dark:border-slate-800 p-8 rounded-2xl text-center text-slate-400 font-medium">
 No active treatments
 </div>
 ) : (
 <div className="space-y-3">
 {(Array.isArray(prescriptions) ? prescriptions : []).map((rx) => (
 <div key={rx.id} className="bg-white dark:bg-[#111827] rounded-xl p-4 border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow group">
 <div className="flex items-start justify-between">
 <div className="flex gap-4 items-start">
 <div className="bg-slate-50 dark:bg-[#1E293B]/50 border border-slate-100 dark:border-slate-800/80 p-2.5 rounded-xl text-[#0D47A1] dark:text-blue-400 group-hover:bg-[#0D47A1] group-hover:text-white transition-colors">
 <Pill size={20} />
 </div>
 <div>
 <h3 className="text-base font-bold text-[#0D47A1] dark:text-blue-400 leading-tight mb-1">{rx.extractedData?.drugName || "Unknown Medicine"}</h3>
 <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{rx.extractedData?.dosage || "-"} • {rx.extractedData?.duration || "-"}</p>
 
 <div className="flex flex-wrap gap-1.5 mt-3">
 {(Array.isArray(rx.extractedData?.timing) ? rx.extractedData.timing : []).map((tId, idx) => (
 <div key={idx} className="flex items-center gap-1.5 bg-[#E3F2FD] dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 px-2.5 py-1 rounded-md text-[10px] font-bold text-[#0D47A1] dark:text-blue-400 uppercase tracking-widest shadow-sm">
 {getTimingIcon(tId)}
 {tId}
 </div>
 ))}
 </div>
 </div>
 </div>
 
 <button 
 title="Verify Physical Pill"
 onClick={() => setVerifyingPillFor(rx.id === verifyingPillFor ? null : rx.id)}
 className="text-slate-400 hover:text-[#0D47A1] dark:text-blue-400 hover:bg-blue-50 p-2 rounded-xl transition-colors"
 >
 <Camera size={18} />
 </button>
 </div>

 {rx.extractedData?.precautions && (
 <div className="mt-4 pl-14 hidden group-hover:block transition-all">
 <div className="p-2.5 bg-amber-50 rounded-lg text-xs font-semibold tracking-wide text-amber-800 border border-amber-100/50">
 <span className="font-bold mr-1">NOTE:</span> {rx.extractedData.precautions}
 </div>
 </div>
 )}

 {/* Visual Validation Area */}
 {verifyingPillFor === rx.id && (
 <div className="mt-4 ml-14 bg-slate-50 dark:bg-[#1E293B]/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
 <h4 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">AI Pill Verification</h4>
 <input 
 type="file" 
 accept="image/*" 
 className="hidden" 
 ref={fileInputRef} 
 onChange={(e) => handlePillUpload(e, rx.extractedData.drugName)} 
 />
 
 {!verificationResult && !isVerifying && (
 <button 
 onClick={() => fileInputRef.current?.click()}
 className="w-full bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 hover:border-[#0D47A1] hover:text-[#0D47A1] dark:text-blue-400 text-slate-600 dark:text-slate-300 font-bold text-xs py-2.5 rounded-xl flex justify-center items-center gap-2 transition-colors shadow-sm uppercase tracking-widest"
 >
 <Camera size={16} /> Scan Pill via Camera
 </button>
 )}
 
 {isVerifying && (
 <div className="flex justify-center items-center py-3 text-xs font-bold text-[#0D47A1] dark:text-blue-400 uppercase tracking-widest gap-2">
 <div className="w-3 h-3 border-2 border-[#0D47A1] border-t-transparent rounded-full animate-spin"></div>
 Analyzing Pill Structure...
 </div>
 )}
 
 {verificationResult && (
 <div className={`mt-2 text-sm font-semibold p-3 rounded-lg border flex gap-2 items-start bg-white dark:bg-[#111827] ${verificationResult.toUpperCase().includes('YES') ? 'border-green-200' : 'border-red-200'}`}>
 {verificationResult.toUpperCase().includes('YES') ? (
 <>
 <CheckCircle className="text-green-500 shrink-0 mt-0.5" size={18} />
 <span className="text-green-800 leading-tight tracking-tight">Verified Match. Safe to consume.</span>
 </>
 ) : (
 <>
 <XCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
 <span className="text-red-800 leading-tight tracking-tight">{verificationResult}</span>
 </>
 )}
 </div>
 )}
 </div>
 )}
 </div>
 ))}
 </div>
 )}
 </section>
 );
}

