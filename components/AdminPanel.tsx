import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SpecialEvent as SpecialEventType } from "../types";
import { askAI } from "../services/gemini";
import { submitRegistration } from "../services/firebase"; // اصلاح شد
import {
  X,
  MessageSquare,
  FileText,
  Send,
  Loader2,
  Info,
  Minimize2,
  Maximize2
} from "lucide-react";

interface SpecialEventProps {
  event: SpecialEventType;
  language: "fa" | "en";
  onClose: () => void;
  onRegisterClick: () => void;
  onCallForEntriesClick?: () => void;
  systemPrompt?: string;
}

const SpecialEvent: React.FC<SpecialEventProps> = ({
  event,
  language,
  onClose,
  onRegisterClick,
  onCallForEntriesClick,
  systemPrompt
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "chat">("info");
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const isFa = language === "fa";

  // --- Logic: Light Styles ---
  const getLightStyle = () => {
    const colors: Record<string, string> = { 
      green: '#10b981', 
      yellow: '#ffd700', 
      red: '#ef4444' 
    };
    const speeds: Record<string, string> = { 
      none: 'none', 
      slow: '2s', 
      fast: '0.5s' 
    };

    const color = colors[event.lightColor || 'yellow'];
    const animDuration = speeds[event.blinkSpeed || 'slow'];
    const animationName = event.blinkSpeed === 'none' ? 'none' : 'glowPulse';

    return {
      backgroundColor: color,
      boxShadow: `0 0 15px ${color}`,
      animation: event.blinkSpeed !== 'none' ? `${animationName} ${animDuration} ease-in-out infinite` : 'none'
    };
  };

  const handleChatSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setChatLoading(true);
    
    const response = await askAI(userMsg, "auto", systemPrompt);
    
    setMessages((prev) => [...prev, { role: "ai", text: response.text }]);
    setChatLoading(false);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!event.isActive) return null;

  // --- Mode 1: Floating Chat ---
  if (event.chatMode === 'floating') {
    return (
      <div className="fixed bottom-6 left-6 z-[60] flex flex-col items-end pointer-events-auto font-vazir" dir={isFa ? 'rtl' : 'ltr'}>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="bg-[#111] border border-white/20 w-80 h-96 rounded-2xl shadow-2xl flex flex-col overflow-hidden mb-4 backdrop-blur-md"
            >
              <div className="bg-black/60 p-3 flex justify-between items-center border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-xs font-bold text-white">{event.aiName || (isFa ? "دستیار هوشمند" : "AI Assistant")}</span>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white transition">
                  <Minimize2 size={16} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-black/40">
                {messages.length === 0 && (
                  <div className="text-center text-white/30 text-xs mt-10">
                    <MessageSquare size={32} className="mx-auto mb-2 opacity-50"/>
                    <p>{isFa ? "سلام! چطور می‌توانم کمک کنم؟" : "Hello! How can I help?"}</p>
                  </div>
                )}
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-2.5 rounded-xl text-xs leading-5 ${m.role === 'user' ? 'bg-white text-black rounded-br-sm' : 'bg-white/10 text-white rounded-bl-sm border border-white/5'}`}>
                      {m.text}
                    </div>
                  </div>
                ))}
                {chatLoading && <Loader2 size={16} className="animate-spin text-white/50 mx-auto" />}
                <div ref={chatEndRef}></div>
              </div>

              <form onSubmit={handleChatSend} className="p-2 border-t border-white/10 bg-black/60 flex gap-2">
                <input 
                  value={input} 
                  onChange={(e) => setInput(e.target.value)} 
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-white/30 transition"
                  placeholder={isFa ? "پیام..." : "Message..."}
                />
                <button type="submit" disabled={chatLoading} className="bg-white text-black p-2 rounded-lg hover:bg-gray-200 transition">
                  <Send size={16} />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {!isOpen && (
          <motion.button
            onClick={() => setIsOpen(true)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#1a1a1a] to-[#333] border border-white/20 shadow-[0_0_20px_rgba(0,0,0,0.5)] flex items-center justify-center group overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/5 group-hover:bg-white/10 transition"></div>
            <MessageSquare size={24} className="text-white relative z-10" />
            <div className="absolute top-3 right-3 w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
          </motion.button>
        )}
      </div>
    );
  }

  // --- Mode 2: Standard Banner ---
  const posClass =
    event.position === "top-left" ? "top-24 left-8" :
    event.position === "center" ? "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" :
    event.position === "bottom-right" ? "bottom-24 right-8" :
    event.position === "bottom-left" ? "bottom-24 left-8" :
    "top-24 right-8"; 

  return (
    <div className={`fixed z-50 transition-all duration-500 ${isOpen ? "inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center" : posClass}`}>
      <style>{`
        @keyframes breathe {
          0%, 100% { box-shadow: 0 20px 50px rgba(0,0,0,0.5); border-color: rgba(255,255,255,0.1); }
          50% { box-shadow: 0 0 25px rgba(255,255,255,0.2); border-color: rgba(255,255,255,0.4); }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
      `}</style>

      {/* --- Minimized Ticket --- */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, rotate: 5 }}
            animate={{ scale: 1, rotate: -2 }}
            exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            className="cursor-pointer bg-[#e0e0e0] text-black p-1 relative group max-w-[240px]"
            style={{ animation: "breathe 4s infinite ease-in-out", border: "1px solid transparent" }}
          >
            <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-8 bg-black rounded-r-full border-r border-white/20"></div>
            <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-8 bg-black rounded-l-full border-l border-white/20"></div>

            <div 
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full z-20 border-2 border-white shadow-lg"
              style={getLightStyle()}
            ></div>

            <div 
              className="absolute -bottom-3 -left-3 z-20 group/icon cursor-pointer"
              onClick={(e) => { e.stopPropagation(); if (onCallForEntriesClick) onCallForEntriesClick(); }}
            >
              <div className="bg-black text-[#ffd700] p-2 rounded-full border border-[#ffd700]/30 shadow-lg hover:scale-110 transition">
                <FileText size={16} />
              </div>
            </div>

            <div className="border-2 border-dashed border-black/20 p-4 flex flex-col items-start gap-2 relative overflow-hidden bg-[#f0f0f0]">
              <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
              
              <div className="flex justify-between w-full items-start mb-1">
                <span className="bg-black text-white text-[9px] px-2 py-0.5 uppercase tracking-widest font-bold rounded-sm">
                  EVENT
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); onClose(); }}
                  className="text-black/40 hover:text-red-600 transition"
                >
                  <X size={14} />
                </button>
              </div>

              <h3 className={`text-lg font-black uppercase leading-tight ${isFa ? "font-vazir" : "font-sans"}`}>
                {isFa ? event.title.fa : event.title.en}
              </h3>
              
              <p className="text-[10px] font-serif text-gray-600 leading-relaxed line-clamp-2">
                {isFa ? event.description.fa : event.description.en}
              </p>

              <div className="mt-2 w-full flex justify-end">
                <span className="text-[10px] font-bold underline decoration-1 underline-offset-2 hover:bg-black hover:text-white transition px-2 py-1 rounded">
                  {event.buttonText || (isFa ? "جزئیات و ثبت‌نام" : "Details & Register")} &rarr;
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Full Modal --- */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="bg-[#111] text-white w-full max-w-lg h-[85vh] md:h-[700px] shadow-2xl rounded-xl border border-white/10 flex flex-col overflow-hidden"
            dir={isFa ? "rtl" : "ltr"}
          >
            <div className="bg-black/80 p-4 border-b border-white/10 flex justify-between items-center shrink-0 backdrop-blur">
              <h2 className="font-bold text-white font-vazir text-sm md:text-base flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getLightStyle().backgroundColor }}></span>
                {isFa ? "دبیرخانه جشنواره" : "Festival Secretariat"}
              </h2>
              <button onClick={() => setIsOpen(false)} className="hover:text-red-500 transition text-white/60">
                <X size={24} />
              </button>
            </div>

            <div className="flex border-b border-white/10 bg-black/40 shrink-0">
              <TabButton active={activeTab === "info"} onClick={() => setActiveTab("info")} icon={Info} label={isFa ? "اطلاعات" : "Info"} />
              
              {onCallForEntriesClick && (
                <button
                  onClick={() => { setIsOpen(false); onCallForEntriesClick(); }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold text-[#ffd700] bg-[#ffd700]/5 hover:bg-[#ffd700]/10 border-b-2 border-[#ffd700]/50 transition"
                >
                  <FileText size={14} /> {isFa ? "فراخوان" : "Call"}
                </button>
              )}
              
              {event.enableChat && (
                <TabButton active={activeTab === "chat"} onClick={() => setActiveTab("chat")} icon={MessageSquare} label={event.aiName || (isFa ? "چت" : "AI Chat")} />
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-0 bg-[#0a0a0a] relative">
              <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>

              {activeTab === "info" && (
                <div className="p-6 space-y-6 text-sm text-gray-300 relative z-10">
                  {event.posterUrl && (
                    <div className="rounded-lg overflow-hidden border border-white/10 shadow-lg">
                      <img src={event.posterUrl} className="w-full object-cover" alt="Poster" />
                    </div>
                  )}
                  
                  <div className="bg-white/5 p-5 rounded-lg border border-white/5">
                    <h3 className="text-[#ffd700] font-bold text-lg mb-3 font-vazir">
                      {isFa ? event.title.fa : event.title.en}
                    </h3>
                    <p className="text-xs leading-7 text-justify opacity-80">
                      {isFa ? event.description.fa : event.description.en}
                    </p>
                  </div>

                  <ul className="space-y-3 text-xs border-t border-white/10 pt-4">
                    <li className="flex justify-between">
                      <span className="text-white/50">{isFa ? "مهلت ارسال:" : "Deadline:"}</span>
                      <span className="text-white font-mono">{event.date}</span>
                    </li>
                    {event.mainLink && (
                      <li className="flex justify-between">
                        <span className="text-white/50">{isFa ? "وبسایت:" : "Website:"}</span>
                        <a href={`https://${event.mainLink}`} target="_blank" className="text-blue-400 hover:underline">{event.mainLink}</a>
                      </li>
                    )}
                  </ul>

                  {event.enableRegister && (
                    <button
                      onClick={() => { setIsOpen(false); onRegisterClick(); }}
                      className="w-full bg-white text-black font-black py-4 rounded-lg mt-4 hover:bg-[#ffd700] transition-colors shadow-lg text-sm"
                    >
                      {isFa ? "ورود به فرم ثبت‌نام" : "Register Now"}
                    </button>
                  )}
                </div>
              )}

              {activeTab === "chat" && event.enableChat && (
                <div className="flex flex-col h-full relative z-10">
                  <div className="flex-1 space-y-4 overflow-y-auto p-4">
                    {messages.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-full text-white/20">
                        <MessageSquare size={40} strokeWidth={1} />
                        <p className="text-xs mt-2">{isFa ? "سوالات خود را بپرسید..." : "Ask me anything..."}</p>
                      </div>
                    )}
                    {messages.map((m, i) => (
                      <div key={i} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
                        <div className={`p-3 rounded-2xl text-xs max-w-[85%] leading-6 ${m.role === "user" ? "bg-white text-black rounded-br-sm" : "bg-white/10 text-white rounded-bl-sm border border-white/5"}`}>
                          {m.text}
                        </div>
                      </div>
                    ))}
                    {chatLoading && <div className="text-center"><Loader2 className="animate-spin text-white/30 inline-block" size={20} /></div>}
                    <div ref={chatEndRef}></div>
                  </div>
                  
                  <form onSubmit={handleChatSend} className="p-4 bg-black/40 border-t border-white/10 flex gap-2">
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="..."
                      className="flex-1 bg-black/50 border border-white/20 rounded-lg px-4 py-3 text-white text-xs outline-none focus:border-white/50 transition"
                    />
                    <button type="submit" disabled={chatLoading} className="bg-white text-black p-3 rounded-lg hover:scale-105 transition disabled:opacity-50">
                      <Send size={18} />
                    </button>
                  </form>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const TabButton = ({ active, onClick, icon: Icon, label }: any) => (
  <button
    onClick={onClick}
    className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold transition border-b-2 ${active ? "bg-white/10 text-white border-white" : "text-gray-500 border-transparent hover:text-gray-300"}`}
  >
    <Icon size={14} /> {label}
  </button>
);

export default SpecialEvent;
