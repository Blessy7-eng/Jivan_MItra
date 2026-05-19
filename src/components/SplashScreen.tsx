import React, { useState, useEffect } from "react";
import { HeartPulse } from "lucide-react";

const quotes = [
 "Healing is a matter of time",
 "The greatest wealth is health",
 "Let food be thy medicine",
 "Guard your health with care",
 "Curing the disease is not enough"
];

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
 const [quoteIndex, setQuoteIndex] = useState(0);
 const [isFadingOut, setIsFadingOut] = useState(false);

 useEffect(() => {
 // Change quote every 1.5 seconds
 const quoteTimer = setInterval(() => {
 setQuoteIndex(prev => (prev + 1) % quotes.length);
 }, 1500);

 // Start fade out after 4.5s to allow reading a few quotes
 const outTimer = setTimeout(() => {
 setIsFadingOut(true);
 // Remove component from DOM after fade out completes (500ms)
 setTimeout(onComplete, 500);
 }, 4500);
 
 return () => {
 clearInterval(quoteTimer);
 clearTimeout(outTimer);
 };
 }, [onComplete]);

 return (
 <div className={`fixed inset-0 z-[200] bg-[#0D47A1] flex flex-col items-center justify-center text-white transition-opacity duration-500 ${isFadingOut ? 'opacity-0' : 'opacity-100'}`}>
 <div className="flex flex-col items-center animate-in zoom-in-95 duration-1000">
 <div className="mb-6 animate-bounce-slow drop-shadow-2xl">
 <HeartPulse size={90} strokeWidth={2} className="animate-pulse text-white drop-shadow-lg" />
 </div>
 <h1 className="text-4xl md:text-5xl font-bold font-serif tracking-tight mb-4 shadow-sm text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200">
 Jivan-Mitra
 </h1>
 
 <div className="h-6 flex items-center justify-center w-full relative overflow-hidden mt-2">
 <p 
 key={quoteIndex}
 className="text-[10px] sm:text-xs font-light text-white uppercase tracking-[0.2em] text-center px-6 animate-in fade-in slide-in-from-bottom-4 duration-500 [text-shadow:_0_0_12px_rgba(255,255,255,0.8),_0_0_24px_rgba(147,197,253,0.6)]"
 >
 {quotes[quoteIndex]}
 </p>
 </div>
 </div>
 </div>
 );
}
