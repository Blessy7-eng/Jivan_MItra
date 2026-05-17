import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, Send, X, Moon, Sun, ShieldAlert, Mic, Camera, StopCircle, Plus, ArrowRight, Image as ImageIcon, Video, FileText, Volume2, VolumeX } from "lucide-react";
import { chatWithDoctor } from "../services/geminiService";

interface ChatbotProps {
  onClose: () => void;
}

interface Message {
  role: "user" | "model";
  text: string;
  image?: string;
  mimeType?: string;
}

export default function Chatbot({ onClose }: ChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "model", text: "Namaste! I am Jivan-Mitra, your AI doctor and medical assistant. How can I assist you with your health today?" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedMimeType, setSelectedMimeType] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Keep track of the latest voiceEnabled state for use in closures
  const voiceEnabledRef = useRef(voiceEnabled);
  useEffect(() => {
    voiceEnabledRef.current = voiceEnabled;
  }, [voiceEnabled]);

  // Keep track of latest handleSend to avoid stale closures in recognition.onresult
  const handleSendRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const speakText = (text: string) => {
    if (!voiceEnabledRef.current) return;
    const synth = window.speechSynthesis;
    
    // Stop any ongoing speech
    synth.cancel();

    // Don't speak JSON
    let textToSpeak = text;
    try {
      let rawText = text;
      if (rawText.startsWith('```json')) {
        rawText = rawText.replace(/^```json\n/, '').replace(/\n```$/, '');
      } else if (rawText.startsWith('```')) {
        rawText = rawText.replace(/^```\n/, '').replace(/\n```$/, '');
      }
      const data = JSON.parse(rawText);
      textToSpeak = data.follow_up_message || data.message || "Here are the details you requested.";
    } catch(e) {}
    
    // Quick sanitization
    textToSpeak = textToSpeak.replace(/[*#_]|(\*\*)/g, '').trim();
    
    // Break long text into chunks to prevent speech synthesis pausing unexpectedly
    const sentences = textToSpeak.match(/[^.!?]+[.!?]*/g) || [textToSpeak];
    
    // Find a good voice
    let voices = synth.getVoices();
    const preferredVoice = voices.find(v => v.name.includes("Google") || v.lang === "en-US" || v.lang === "en-GB") || voices[0];
    
    sentences.forEach((sentence) => {
      const utterance = new SpeechSynthesisUtterance(sentence.trim());
      if (preferredVoice) utterance.voice = preferredVoice;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      synth.speak(utterance);
    });
  };

  // Try to load voices early
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.getVoices();
    }
  }, []);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Speech recognition isn't supported in your browser.");
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onstart = () => {
      setIsListening(true);
      setVoiceEnabled(true);
    };
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setTimeout(() => {
        if (handleSendRef.current) {
          handleSendRef.current(transcript);
        }
      }, 100);
    };
    
    recognition.onerror = (event: any) => {
      setIsListening(false);
      if (event.error === 'not-allowed') {
        alert("Microphone access was denied. Please check your browser permissions.");
      } else if (event.error === 'no-speech') {
        console.log("No speech detected. Please try again.");
      } else {
        console.error("Speech recognition error:", event.error);
      }
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setSelectedImage(base64String);
        setSelectedMimeType(file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    handleSendRef.current = handleSend;
  });

  const handleSend = async (overrideInput?: string | React.MouseEvent | React.KeyboardEvent) => {
    const textToSend = typeof overrideInput === "string" ? overrideInput : input;
    if (!textToSend.trim() && !selectedImage) return;
    
    // Add user message
    const userMessage: Message = { 
      role: "user", 
      text: textToSend.trim() || (selectedImage ? "Uploaded an image." : ""),
      image: selectedImage ? `data:${selectedMimeType};base64,${selectedImage}` : undefined,
      mimeType: selectedMimeType || undefined
    };
    
    // Snapshot current image
    const currentBase64 = selectedImage;
    const currentMimeType = selectedMimeType;
    
    setMessages(prev => [...prev, userMessage]);
    
    setInput("");
    setSelectedImage(null);
    setSelectedMimeType(null);
    setIsTyping(true);

    try {
      // Build history including past images
      const history = messages.slice(1).map(msg => {
        const parts: any[] = [{ text: msg.text }];
        if (msg.image && msg.mimeType) {
          parts.push({
            inlineData: {
              data: msg.image.split(',')[1],
              mimeType: msg.mimeType
            }
          });
        }
        return {
          role: msg.role,
          parts
        };
      });
      
      const responseText = await chatWithDoctor(history, textToSend, currentBase64 || undefined, currentMimeType || undefined);
      
      setMessages(prev => [...prev, { role: "model", text: responseText }]);
      speakText(responseText);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: "model", text: "I am having trouble connecting right now. Please try again later. For emergencies, visit a doctor immediately." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  const toggleTheme = () => {
    setTheme(prev => prev === "light" ? "dark" : "light");
  };

  const isDark = theme === "dark";

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col ${isDark ? "bg-slate-900 text-slate-100" : "bg-slate-50 text-slate-900"}`}>
      {/* Header */}
      <div className={`flex items-center justify-between p-4 shadow-md ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-blue-100"} border-b`}>
        <div className="flex items-center gap-3">
          <div className="bg-[#0D47A1] p-2 rounded-full text-white">
            <MessageCircle size={24} />
          </div>
          <div>
            <h2 className="font-bold text-lg font-serif">Jivan-Mitra</h2>
            <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"} flex items-center gap-1`}>
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Online AI Doctor
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              if (voiceEnabled) {
                window.speechSynthesis.cancel();
              }
              setVoiceEnabled(!voiceEnabled);
            }} 
            className={`p-2 rounded-full transition-colors ${voiceEnabled ? "text-[#0D47A1] bg-blue-50 dark:bg-blue-900/40" : isDark ? "hover:bg-slate-700 text-slate-300" : "hover:bg-slate-100 text-slate-600"}`}
            title={voiceEnabled ? "Mute Voice Reply" : "Enable Voice Reply"}
          >
            {voiceEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
          <button 
            onClick={toggleTheme} 
            className={`p-2 rounded-full transition-colors ${isDark ? "hover:bg-slate-700 text-slate-300" : "hover:bg-slate-100 text-slate-600"}`}
            title="Toggle Dark Mode"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button 
            onClick={onClose} 
            className={`p-2 rounded-full transition-colors ${isDark ? "hover:bg-red-500/20 text-red-400" : "hover:bg-red-50 text-red-500"}`}
            title="Close Chat"
          >
            <ArrowRight size={24} />
          </button>
        </div>
      </div>

      {/* Warning Banner */}
      <div className={`p-2 text-center text-xs font-semibold ${isDark ? "bg-red-900/30 text-amber-200" : "bg-red-50 py-2 text-red-600"} flex justify-center items-center gap-2`}>
        <ShieldAlert size={14} />
        This is an AI assistant, not a human doctor. In emergencies, please seek immediate medical help.
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => {
          const isUser = msg.role === "user";
          
          let parsedData: any = null;
          let isSos = false;
          let textContent = msg.text;

          if (!isUser) {
            try {
              let rawText = msg.text;
              if (rawText.startsWith('```json')) {
                rawText = rawText.replace(/^```json\n/, '').replace(/\n```$/, '');
              } else if (rawText.startsWith('```')) {
                rawText = rawText.replace(/^```\n/, '').replace(/\n```$/, '');
              }
              const data = JSON.parse(rawText);
              if (data.ui_render) {
                 parsedData = data;
                 textContent = data.follow_up_message || "";
              } else if (data._isSosTriggered) {
                 isSos = true;
                 textContent = data.message || "SOS Triggered.";
              }
            } catch (e) {
              // Not JSON, just normal text
            }
          }

          return (
            <div key={index} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-4 ${isUser ? "bg-[#0D47A1] text-white rounded-br-none" : isDark ? "bg-slate-800 text-slate-200 rounded-bl-none shadow-sm" : "bg-white text-slate-800 border border-slate-200 shadow-sm rounded-bl-none"} ${isSos ? "border-red-500 bg-red-50 dark:bg-red-900/40 text-red-700 dark:text-red-100 border-2" : ""}`}>
                {isSos && (
                   <div className="flex items-center gap-2 mb-2 text-red-600 dark:text-red-400 font-bold">
                      <ShieldAlert size={18} className="animate-pulse" />
                      EMERGENCY ALERT ACTIVATED
                   </div>
                )}
                
                {parsedData?.facilities && Array.isArray(parsedData.facilities) && (
                   <div className="mb-4 space-y-3">
                      {parsedData.facilities.map((facility: any, i: number) => (
                         <div key={i} className={`p-3 rounded-xl border ${isDark ? "bg-slate-700 border-slate-600" : "bg-slate-50 border-slate-200"}`}>
                            <h4 className="font-bold text-sm text-[#0D47A1] dark:text-blue-400">{facility.name}</h4>
                            <p className="text-xs mt-1 text-slate-600 dark:text-slate-300"><span className="font-semibold">Type:</span> {facility.type}</p>
                            <p className="text-xs text-slate-600 dark:text-slate-300"><span className="font-semibold">Distance:</span> {facility.estimated_distance}</p>
                            {facility.emergency_services && <p className="text-xs mt-1 text-red-500 font-semibold bg-red-100 dark:bg-red-900/30 inline-block px-2 py-0.5 rounded-full">Emergency Services Available</p>}
                         </div>
                      ))}
                   </div>
                )}
                
                {msg.image && (
                   <div className="mb-3">
                      <img src={msg.image} alt="Uploaded" className="rounded-lg max-h-48 object-cover shadow-sm" />
                   </div>
                )}
                
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{textContent}</p>
              </div>
            </div>
          );
        })}
        {isTyping && (
          <div className="flex justify-start">
             <div className={`rounded-2xl p-4 rounded-bl-none flex items-center justify-center gap-1 ${isDark ? "bg-slate-800" : "bg-white border border-slate-200"}`}>
                <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }}></div>
                <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }}></div>
                <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }}></div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className={`p-4 border-t ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
        {selectedImage && (
          <div className="max-w-4xl mx-auto mb-2 relative inline-block p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
            <img src={`data:${selectedMimeType};base64,${selectedImage}`} className="h-16 rounded" alt="Preview" />
            <button 
              onClick={() => { setSelectedImage(null); setSelectedMimeType(null); }}
              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"
            >
              <X size={14} />
            </button>
          </div>
        )}
        <div className="max-w-4xl mx-auto relative flex items-center gap-2">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            className="hidden" 
          />
          
          <div className="relative flex-1 flex items-center">
            <div className="absolute left-2 flex items-center z-10">
              <button 
                onClick={() => setShowAttachMenu(!showAttachMenu)}
                className={`p-2 rounded-full transition-colors ${isDark ? "hover:bg-slate-600 text-slate-300" : "hover:bg-slate-200 text-slate-600"} ${selectedImage ? "text-[#0D47A1]" : ""}`}
                title="Add Attachment"
                disabled={isTyping}
              >
                <Plus size={20} />
              </button>

              {showAttachMenu && (
                <div className={`absolute bottom-full left-0 mb-4 w-56 rounded-xl shadow-lg border ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"} overflow-hidden z-50`}>
                  <button 
                    onClick={() => { fileInputRef.current!.accept = "image/*"; fileInputRef.current!.removeAttribute("capture"); fileInputRef.current?.click(); setShowAttachMenu(false); }}
                    className={`w-full text-left px-4 py-3 flex items-center gap-3 text-sm transition-colors ${isDark ? "hover:bg-slate-700 text-slate-200" : "hover:bg-slate-50 text-slate-700"}`}
                  >
                    <ImageIcon size={18} /> Photos / Images
                  </button>
                  <button 
                    onClick={() => { fileInputRef.current!.accept = "video/*"; fileInputRef.current!.removeAttribute("capture"); fileInputRef.current?.click(); setShowAttachMenu(false); }}
                    className={`w-full text-left px-4 py-3 flex items-center gap-3 text-sm transition-colors ${isDark ? "hover:bg-slate-700 text-slate-200" : "hover:bg-slate-50 text-slate-700"}`}
                  >
                    <Video size={18} /> Videos
                  </button>
                  <button 
                    onClick={() => { fileInputRef.current!.accept = "*/*"; fileInputRef.current!.removeAttribute("capture"); fileInputRef.current?.click(); setShowAttachMenu(false); }}
                    className={`w-full text-left px-4 py-3 flex items-center gap-3 text-sm transition-colors ${isDark ? "hover:bg-slate-700 text-slate-200" : "hover:bg-slate-50 text-slate-700"}`}
                  >
                    <FileText size={18} /> Documents / Reports
                  </button>
                  <button 
                    onClick={() => { fileInputRef.current!.accept = "image/*"; fileInputRef.current!.setAttribute("capture", "environment"); fileInputRef.current?.click(); setShowAttachMenu(false); }}
                    className={`w-full text-left px-4 py-3 flex items-center gap-3 text-sm transition-colors border-t ${isDark ? "hover:bg-slate-700 text-slate-200 border-slate-700" : "hover:bg-slate-50 text-slate-700 border-slate-200"}`}
                  >
                    <Camera size={18} /> Open Camera
                  </button>
                </div>
              )}
            </div>
            
            <input 
              type="text" 
              placeholder="Describe your symptoms..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className={`w-full pl-12 pr-24 py-4 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#0D47A1] transition-shadow shadow-inner ${isDark ? "bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400" : "bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400"}`}
              disabled={isTyping || isListening}
            />
            
            <div className="absolute right-2 flex items-center gap-1">
              <button 
                onClick={isListening ? () => recognitionRef.current?.stop() : startListening}
                className={`p-2 rounded-full transition-colors ${isListening ? "bg-red-500 text-white animate-pulse" : isDark ? "hover:bg-slate-600 text-slate-300" : "hover:bg-slate-200 text-slate-600"}`}
                title={isListening ? "Stop Listening" : "Speak to Jivan-Mitra"}
                disabled={isTyping}
              >
                {isListening ? <StopCircle size={18} /> : <Mic size={18} />}
              </button>

              <button 
                onClick={() => handleSend()}
                disabled={(!input.trim() && !selectedImage) || isTyping}
                className={`p-3 flex items-center justify-center rounded-full transition-colors ${(!input.trim() && !selectedImage) || isTyping ? "bg-slate-300 text-slate-500 cursor-not-allowed" : "bg-[#0D47A1] text-white hover:bg-blue-800 shadow-md transform hover:scale-105"}`}
              >
                <Send size={18} className={(input.trim() || selectedImage) && !isTyping ? "translate-x-0.5" : ""} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
