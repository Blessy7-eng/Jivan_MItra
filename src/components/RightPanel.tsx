import React, { useState } from "react";
import PatientDashboard from "./PatientDashboard";
import { UploadCloud, FileText, CheckCircle, ShieldCheck, Activity, BrainCircuit } from "lucide-react";
import { extractPrescription, ExtractedPrescription } from "../services/geminiService";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";

export default function RightPanel({ onSaved }: { onSaved: () => void }) {
  const { t } = useLanguage();
  const { user, setShowAuthModal } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ExtractedPrescription | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  // Verification confirmation state
  const [requiresConfirmation, setRequiresConfirmation] = useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const fileToBase64 = (f: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(f);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setIsSaved(false);
      
      setIsProcessing(true);
      setResult(null);
      setRequiresConfirmation(false);
      
      try {
        const base64 = await fileToBase64(selectedFile);
        const extraction = await extractPrescription(base64, selectedFile.type);
        if (extraction.data) {
          setResult(extraction.data);
          setRequiresConfirmation(true); // AI asks for confirmation
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleConfirmAndSave = async () => {
    if (!result) return;
    setIsVerifying(true);
    setRequiresConfirmation(false);
    
    try {
        await fetch("/api/prescriptions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ extractedData: result, confidenceScore: 0.99 })
        });
        setIsSaved(true);
        onSaved();
    } catch (err) {
        console.error(err);
    } finally {
        setIsVerifying(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl border border-[#bbdefb] shadow-lg lg:overflow-hidden">
        <div className="border-b border-slate-100 p-6 bg-gradient-to-r from-[#0D47A1] to-[#1565C0] text-white rounded-t-3xl border-t-0">
          <div className="flex items-center gap-3">
             <div className="bg-white/20 p-2 rounded-xl">
                <BrainCircuit size={28} />
             </div>
             <div>
               <h2 className="text-xl font-bold font-serif shadow-sm">AI Analysis Hub</h2>
               <p className="text-xs font-semibold text-blue-100 uppercase tracking-widest mt-0.5">Gemini 2.0 Flash Integration</p>
             </div>
          </div>
        </div>
        
        <div className="p-6 flex-1 bg-[#E3F2FD]/30 overflow-y-auto">
          <div className="space-y-6 h-full flex flex-col">
            {!previewUrl && (
                <div 
                   onClick={() => {
                     if (!user) {
                       setShowAuthModal(true);
                       return;
                     }
                     fileInputRef.current?.click();
                   }}
                   className="bg-white border-2 border-dashed border-[#0D47A1]/30 rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 transition-all flex-1 shadow-sm group"
                >
                  <UploadCloud size={64} className="text-[#0D47A1]/50 mb-4 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
                  <p className="text-xl font-bold text-[#0D47A1]">
                    {user ? "Upload Prescription" : "Login to Analyze Prescription"}
                  </p>
                  <p className="text-sm font-semibold text-slate-500 mt-2 text-center max-w-xs">
                    {user ? "Tap here to scan a physical medical document or prescription" : "Secure clinical capabilities require authenticated access."}
                  </p>
                </div>
            )}

            {previewUrl && (
                <div className="space-y-6">
                    <div className="bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                       <img src={previewUrl} alt="Prescription" className="w-full object-contain max-h-[250px]" />
                       <div className="p-3 bg-white border-t border-slate-200 flex justify-end">
                          <button 
                            onClick={() => { setPreviewUrl(null); setResult(null); setIsSaved(false); setRequiresConfirmation(false); }}
                            className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-red-600 transition-colors"
                          >
                            Discard & Re-upload
                          </button>
                       </div>
                    </div>

                    {isProcessing && (
                        <div className="bg-white rounded-xl p-8 flex flex-col items-center justify-center gap-4 text-center border border-[#bbdefb] shadow-sm">
                             <div className="w-10 h-10 border-4 border-[#0D47A1] border-t-transparent rounded-full animate-spin"></div>
                             <div>
                               <p className="font-bold tracking-wide text-lg text-[#0D47A1]">Analyzing Document</p>
                               <p className="text-sm font-semibold text-slate-500 mt-1">Extracting dosages and drug interactions...</p>
                             </div>
                        </div>
                    )}

                    {result && !isProcessing && (
                        <div className="bg-white rounded-xl border border-[#bbdefb] shadow-md overflow-hidden animate-in fade-in slide-in-from-bottom-4">
                             <div className="bg-green-50 px-5 py-4 border-b border-green-100 flex items-center gap-3 text-green-800">
                                <CheckCircle size={24} />
                                <div>
                                    <span className="font-bold text-base block">Extraction Successful</span>
                                    <span className="text-xs font-semibold opacity-80 uppercase tracking-widest">Structuring Medical Data</span>
                                </div>
                             </div>
                             
                             <div className="p-5 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                   <div className="col-span-2 bg-[#F1F8E9] p-3 rounded-lg border border-[#DCEDC8]">
                                      <p className="text-[10px] text-green-700 uppercase font-bold tracking-widest mb-1">Detected Medication</p>
                                      <p className="text-xl font-bold font-mono text-[#2E7D32]">{result.drugName || "Unrecognized Drug"}</p>
                                   </div>
                                   
                                   <div>
                                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Dosage</p>
                                      <p className="font-bold text-slate-800">{result.dosage}</p>
                                   </div>
                                   <div>
                                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Frequency</p>
                                      <p className="font-bold text-slate-800">{result.frequency}</p>
                                   </div>
                                   <div>
                                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Duration</p>
                                      <p className="font-bold text-slate-800">{result.duration}</p>
                                   </div>
                                   <div>
                                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Purpose/Condition</p>
                                      <p className="font-bold text-[#0D47A1]">{result.purpose || 'General'}</p>
                                   </div>

                                   <div className="col-span-2 pt-2 border-t border-slate-100">
                                      <p className="text-[10px] text-amber-600 uppercase font-bold tracking-widest mb-1">Clinical Precautions</p>
                                      <p className="text-sm font-semibold text-slate-700 bg-amber-50 p-2.5 rounded-lg border border-amber-100">{result.precautions}</p>
                                   </div>
                                </div>
                             </div>

                             {requiresConfirmation && (
                                 <div className="p-5 bg-blue-50 border-t border-blue-100 flex flex-col gap-3">
                                     <div className="flex items-start gap-3">
                                         <BrainCircuit className="text-[#0D47A1] shrink-0" size={24} />
                                         <p className="text-sm font-bold text-[#0D47A1]">
                                            I detected {result.drugName}. Is this correct? Please verify the dosage before saving to your profile.
                                         </p>
                                     </div>
                                     <div className="flex gap-3 mt-2">
                                         <button 
                                            onClick={handleConfirmAndSave}
                                            className="flex-1 bg-[#0D47A1] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-900 transition-colors shadow-sm"
                                         >
                                            <ShieldCheck size={20} /> Yes, Save to Treatment
                                         </button>
                                         <button 
                                            onClick={() => { setPreviewUrl(null); setResult(null); setRequiresConfirmation(false); }}
                                            className="px-4 bg-white border border-slate-200 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                                         >
                                            No, retry
                                         </button>
                                     </div>
                                 </div>
                             )}

                             {isVerifying && (
                                <div className="p-5 bg-slate-50 border-t border-slate-100 flex justify-center">
                                    <span className="font-bold text-slate-500 flex items-center gap-2">
                                        <div className="w-5 h-5 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></div> 
                                        Committing to Database...
                                    </span>
                                </div>
                             )}

                             {isSaved && (
                                <div className="p-5 bg-green-600 border-t border-green-700 text-white flex justify-center items-center gap-2 font-bold text-lg">
                                    <CheckCircle size={24} /> Treatment Added Successfully
                                </div>
                             )}
                        </div>
                    )}
                </div>
            )}
            
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
            />
          </div>
        </div>
    </div>
  );
}
