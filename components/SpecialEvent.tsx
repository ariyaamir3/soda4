import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SpecialEvent as SpecialEventType } from "../types";
import { askAI } from "../services/gemini";
import {
  X,
  MessageSquare,
  FileText,
  Send,
  Loader2,
  Info,
  Minimize2,
  Ticket,
  ChevronLeft,
  Bot
} from "lucide-react";

interface SpecialEventProps {
  event: SpecialEventType;
  language: "fa" | "en";
  onClose: () => void;
  onRegisterClick: () => void;
  onCallForEntriesClick?: () => void;
  systemPrompt?: string; // دستورالعمل هوش مصنوعی از پنل ادمین
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

  // --- دیکشنری کلمات (دوزبانه) ---
  const t = {
    register: isFa ? "ثبت‌نام در جشنواره" : "Register Now",
    info: isFa ? "اطلاعات" : "Info",
    chat: event.aiName || (isFa ? "دستیار هوشمند" : "AI Assistant"),
    readMore: isFa ? "متن کامل فراخوان" : "Read Full Call",
    placeholder: isFa ? "سوال شما..." : "Your question...",
    welcome: isFa ? "سلام! درباره جشنواره سوالی دارید؟" : "Hi! Any questions about the festival?",
    send: isFa ? "ارسال" : "Send",
    ticketLabel: isFa ? "رویداد ویژه" : "SPECIAL EVENT"
  };

  // --- تنظیمات چراغ چشمک‌زن (از پنل ادمین) ---
  const getLightStyle = () => {
    const colors: Record<string, string> = { 
      green: '#10b981', 
      yellow: '#ffd700', 
      red: '#ef4444',
      blue: '#3b82f6'
    };
    const speeds: Record<string, string> = { 
      none: 'none', 
      slow: '2s', 
      normal: '1s',
      fast: '0.5s' 
    };

    const color = colors[event.lightColor || 'yellow'];
    const animation = event.blinkSpeed === 'none' 
      ? 'none' 
      : `glowPulse ${speeds[event.blinkSpeed || 'slow']} infinite ease-in-out`;

    return {
      backgroundColor: color,
      boxShadow: `0 0 15px ${color}`,
      animation: animation
    };
  };

  // --- ارسال پیام به هوش مصنوعی ---
  const handleChatSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const userMsg = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setChatLoading(true);
    
    // اتصال به سرور پروکسی (با پرامپت ادمین)
    const response = await askAI(userMsg, "auto", systemPrompt);
    
    setMessages((prev) => [...prev, { role: "ai", text: response.text }]);
    setChatLoading(false);
  };

  // اسکرول خودکار چت به پایین
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!event.isActive) return null;

  // --- موقعیت بنر ---
  const posClass =
    event.position === "top-left" ? "top-24 left-4 md:left-8" :
    event.position === "center" ? "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" :
    event.position === "bottom-right" ? "bottom-24 right-4 md:right-8" :
    event.position === "bottom-left" ? "bottom-24 left-4 md:left-8" :
    "top-24 right-4 md:right-8"; // پیش‌فرض: بالا راست

  // ==========================================
  // حالت ۱: چت شناور (Floating Button)
  // ==========================================
  if (event.chatMode === 'floating') {
    return (
      <div className="fixed bottom-6 left-6 z-[60] flex flex-col items-end font-vazir" dir={isFa ? 'rtl' : 'ltr'}>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="bg-[#111] border border-white/20 w-80 h-96 rounded-2xl shadow-2xl flex flex-col overflow-hidden mb-4 backdrop-blur-md"
            >
              {/* هدر چت شناور */}
              <div className="bg-gradient-to-r from-blue-900/50 to-black p-3 flex justify-between items-center border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-xs font-bold text-white">{t.chat}</span>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white transition">
                  <Minimize2 size={16} />
                </button>
              </div>

              {/* بدنه پیام‌ها */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-black/40">
                {messages.length === 0 && (
                  <div className="text-center text-white/30 text-xs mt-10">
                    <Bot size={32} className="mx-auto mb-2 opacity-50"/>
                    <p>{t.welcome}</p>
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

              {/* ورودی متن */}
              <form onSubmit={handleChatSend} className="p-2 border-t border-white/10 bg-black/60 flex gap-2">
                <input value={input} onChange={(e) => setInput(e.target.value)} className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-white/30 transition" placeholder={t.placeholder} />
                <button type="submit" disabled={chatLoading} className="bg-white text-black p-2 rounded-lg hover:bg-gray-200 transition"><Send size={16} /></button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* دکمه دایره‌ای شناور */}
        {!isOpen && (
          <motion.button onClick={() => setIsOpen(true)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 border border-white/20 shadow-[0_0_20px_rgba(59,130,246,0.5)] flex items-center justify-center group relative overflow-hidden">
            <div className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition"></div>
            <MessageSquare size={24} className="text-white relative z-10" />
            <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-green-400 rounded-full animate-ping"></div>
          </motion.button>
        )}
      </div>
    );
  }

  // ==========================================
  // حالت ۲: بنر جشنواره (طرح بلیت سینما)
  // ==========================================
  return (
    <>
      <style>{`
        @keyframes glowPulse { 0%, 100% { opacity: 1; box-shadow: 0 0 10px currentColor; } 50% { opacity: 0.5; box-shadow: 0 0 20px currentColor; } }
        .cinema-ticket-holes {
            background-image: radial-gradient(circle, transparent 50%, #e5e5e5 50%);
            background-size: 10px 10px;
            background-position: -5px 0;
            background-repeat: repeat-y;
        }
      `}</style>

      {/* --- بنر بسته (روی صفحه) --- */}
      <AnimatePresence>
        {!isOpen && (
          <div className={`fixed z-50 ${posClass} flex flex-col items-end font-vazir scale-90 md:scale-100 origin-top-right transition-transform duration-300`}>
            
            {/* بدنه اصلی بلیت */}
            <motion.div
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              onClick={() => setIsOpen(true)}
              className="relative flex w-72 h-32 cursor-pointer shadow-2xl group transition-transform hover:-translate-x-2"
            >
                {/* بخش چپ بلیت (کوچک) - سوراخ‌دار */}
                <div className="w-16 bg-black border-r-2 border-dashed border-white/20 flex flex-col items-center justify-center relative overflow-hidden rounded-l-lg">
                    <span className="-rotate-90 text-white/50 text-[10px] font-mono tracking-widest whitespace-nowrap">NO: {Math.floor(Math.random()*9999)}</span>
                    <div className="absolute -right-2 top-0 bottom-0 w-4 cinema-ticket-holes opacity-20"></div>
                </div>

                {/* بخش راست بلیت (اصلی) */}
                <div className="flex-1 bg-[#e5e5e5] text-black relative rounded-r-lg overflow-hidden flex flex-col">
                    {/* نویز کاغذ */}
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] pointer-events-none"></div>
                    
                    {/* چراغ وضعیت */}
                    <div className="absolute top-3 right-3 w-3 h-3 rounded-full z-20 border border-white/50" style={getLightStyle()}></div>

                    <div className="p-4 flex flex-col h-full justify-between relative z-10">
                        <div className="flex justify-between items-start">
                            <span className="bg-black text-white text-[9px] px-2 py-0.5 font-bold tracking-[0.2em] uppercase rounded-sm">
                                {t.ticketLabel}
                            </span>
                            <button onClick={(e) => {e.stopPropagation(); onClose();}} className="text-black/30 hover:text-red-600 transition"><X size={16}/></button>
                        </div>

                        <div>
                            <h3 className={`text-lg font-black leading-tight ${isFa ? "font-vazir" : "font-sans"}`}>
                                {isFa ? event.title.fa : event.title.en}
                            </h3>
                            <p className="text-[10px] text-gray-600 mt-1 line-clamp-1 font-mono opacity-80">
                                {isFa ? event.description.fa : event.description.en}
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* دکمه ثبت‌نام آویزان (Hanging Tag) */}
            {event.enableRegister && (
                <motion.button
                    initial={{ y: -30, opacity: 0 }}
                    animate={{ y: -8, opacity: 1 }}
                    whileHover={{ y: 0, scale: 1.05 }}
                    onClick={onRegisterClick}
                    className="mr-8 bg-yellow-500 text-black font-black text-xs px-6 py-2.5 rounded-b-xl shadow-lg border-t-0 border-2 border-yellow-600 z-40 flex items-center gap-2 animate-pulse hover:animate-none"
                >
                    <Ticket size={14} className={isFa ? "" : "rotate-45"}/> {t.register}
                </motion.button>
            )}
          </div>
        )}
      </AnimatePresence>

      {/* --- مودال باز شده (Full Content) --- */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#111] text-white w-full max-w-md h-[650px] rounded-xl border border-white/10 flex flex-col overflow-hidden shadow-2xl relative font-vazir"
              dir={isFa ? "rtl" : "ltr"}
            >
                {/* هدر مودال */}
                <div className="bg-black/50 p-4 border-b border-white/10 flex justify-between items-center shrink-0">
                    <h2 className="font-bold text-lg text-yellow-500 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full animate-pulse" style={{backgroundColor: getLightStyle().backgroundColor}}></span>
                        {isFa ? "دبیرخانه جشنواره" : "Festival Secretariat"}
                    </h2>
                    <button onClick={() => setIsOpen(false)} className="bg-white/10 hover:bg-red-500/80 p-1.5 rounded-full transition text-white"><X size={18}/></button>
                </div>

                {/* تب‌ها */}
                <div className="flex bg-black/30 border-b border-white/10 shrink-0">
                    <button onClick={() => setActiveTab('info')} className={`flex-1 py-3 text-xs font-bold transition flex items-center justify-center gap-2 ${activeTab==='info' ? 'bg-white/10 text-white border-b-2 border-yellow-500' : 'text-gray-500 hover:text-white'}`}>
                        <Info size={14}/> {t.info}
                    </button>
                    {event.enableChat && (
                        <button onClick={() => setActiveTab('chat')} className={`flex-1 py-3 text-xs font-bold transition flex items-center justify-center gap-2 ${activeTab==='chat' ? 'bg-white/10 text-white border-b-2 border-yellow-500' : 'text-gray-500 hover:text-white'}`}>
                            <MessageSquare size={14}/> {t.chat}
                        </button>
                    )}
                </div>

                {/* بدنه محتوا */}
                <div className="flex-1 overflow-y-auto p-0 relative bg-[#0a0a0a]">
                    
                    {/* تب اطلاعات */}
                    {activeTab === 'info' && (
                        <div className="p-6 space-y-6">
                            {event.posterUrl ? (
                                <div className="relative group">
                                    <img src={event.posterUrl} className="w-full rounded-lg border border-white/10 shadow-lg object-cover" alt="Poster" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-50 rounded-lg"></div>
                                </div>
                            ) : (
                                <div className="w-full h-40 bg-white/5 rounded-lg flex items-center justify-center text-white/20 text-xs border border-white/5 border-dashed">پوستر بارگذاری نشده</div>
                            )}
                            
                            <div>
                                <h3 className="text-white font-bold text-lg mb-2">{isFa ? event.title.fa : event.title.en}</h3>
                                <p className="text-xs text-gray-400 leading-7 text-justify">{isFa ? event.description.fa : event.description.en}</p>
                            </div>

                            <div className="bg-white/5 p-4 rounded-lg border border-white/5 space-y-3 text-xs">
                                <div className="flex justify-between border-b border-white/5 pb-2">
                                    <span className="text-white/50">{isFa ? "مهلت ارسال:" : "Deadline:"}</span>
                                    <span className="text-yellow-500 font-mono tracking-wider">{event.date}</span>
                                </div>
                                {event.mainLink && (
                                    <div className="flex justify-between">
                                        <span className="text-white/50">{t.website}</span>
                                        <a href={`https://${event.mainLink}`} target="_blank" className="text-blue-400 hover:underline">{event.mainLink}</a>
                                    </div>
                                )}
                            </div>

                            {/* دکمه خواندن فراخوان (شیشه‌ای) */}
                            {onCallForEntriesClick && (
                                <button onClick={() => { setIsOpen(false); onCallForEntriesClick(); }} className="w-full border border-white/20 py-3 rounded-lg text-xs text-white/70 hover:bg-white/10 hover:text-white transition flex items-center justify-center gap-2 group">
                                    <FileText size={14} className="group-hover:scale-110 transition"/> {t.readMore}
                                </button>
                            )}
                            
                            <div className="h-16"></div> {/* فضای خالی برای دکمه ثابت */}
                        </div>
                    )}

                    {/* تب چت */}
                    {activeTab === 'chat' && (
                        <div className="flex flex-col h-full">
                            <div className="flex-1 p-4 space-y-3 overflow-y-auto custom-scrollbar">
                                {messages.length===0 && (
                                    <div className="h-full flex flex-col items-center justify-center text-white/20 space-y-3">
                                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center animate-pulse"><Bot size={32} strokeWidth={1}/></div>
                                        <p className="text-xs">{t.welcome}</p>
                                    </div>
                                )}
                                {messages.map((m, i) => (
                                    <div key={i} className={`flex ${m.role==='user'?'justify-end':'justify-start'}`}>
                                        <div className={`max-w-[85%] p-3 rounded-2xl text-xs leading-6 shadow-sm ${m.role==='user'?'bg-white text-black rounded-br-none':'bg-white/10 text-white rounded-bl-none border border-white/5'}`}>{m.text}</div>
                                    </div>
                                ))}
                                {chatLoading && <div className="text-center"><Loader2 className="animate-spin text-white/30 inline-block" size={20}/></div>}
                                <div ref={chatEndRef}></div>
                            </div>
                            <form onSubmit={handleChatSend} className="p-3 border-t border-white/10 bg-black/40 flex gap-2 shrink-0">
                                <input value={input} onChange={e=>setInput(e.target.value)} className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-3 text-xs text-white outline-none focus:border-white/30 transition" placeholder={t.placeholder} />
                                <button disabled={chatLoading} className="bg-white text-black p-3 rounded-lg hover:bg-gray-200 transition"><Send size={16}/></button>
                            </form>
                            <div className="h-16"></div> {/* فضای خالی برای دکمه ثابت */}
                        </div>
                    )}
                </div>

                {/* فوتر ثابت: دکمه ثبت نام (Sticky Footer) */}
                {event.enableRegister && (
                    <div className="p-4 bg-gradient-to-t from-black via-black to-black/80 border-t border-white/10 backdrop-blur shrink-0 absolute bottom-0 left-0 right-0 z-20">
                        <button 
                            onClick={() => { setIsOpen(false); onRegisterClick(); }}
                            className="w-full bg-yellow-500 text-black font-black py-3 rounded-lg shadow-[0_0_20px_rgba(234,179,8,0.2)] hover:shadow-[0_0_30px_rgba(234,179,8,0.4)] transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2 text-sm"
                        >
                            {t.register} <ChevronLeft size={16} className={isFa ? "" : "rotate-180"}/>
                        </button>
                    </div>
                )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SpecialEvent;
