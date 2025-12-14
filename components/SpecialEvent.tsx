import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SpecialEvent as SpecialEventType } from "../types";
import { askAI } from "../services/gemini";
import { submitRegistration, RegistrationData } from "../services/firebase";
import {
  X,
  MessageSquare,
  FileText,
  Send,
  Loader2,
  Bot,
  Info,
  CheckCircle2,
} from "lucide-react";

interface SpecialEventProps {
  event: SpecialEventType;
  language: "fa" | "en";
  onClose: () => void;
  onRegisterClick: () => void;
  onCallForEntriesClick?: () => void;
}

const SpecialEvent: React.FC<SpecialEventProps> = ({
  event,
  language,
  onClose,
  onRegisterClick,
  onCallForEntriesClick,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "chat">("info");
  const [messages, setMessages] = useState<
    { role: string; text: string; status?: string }[]
  >([]);
  const [input, setInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [regData, setRegData] = useState<RegistrationData>({
    directorName: "",
    phone: "",
    email: "",
    filmTitle: "",
    category: "داستانی",
    filmLink: "",
    posterLink: "",
    technicalInfo: "",
    bio: "",
    submittedAt: "",
  });
  const [regStatus, setRegStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const isFa = language === "fa";

  const handleChatSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setChatLoading(true);
    const response = await askAI(userMsg, "auto");
    setMessages((prev) => [
      ...prev,
      { role: "ai", text: response.text, status: response.status },
    ]);
    setChatLoading(false);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleRegSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegStatus("submitting");
    try {
      await submitRegistration({
        ...regData,
        submittedAt: new Date().toISOString(),
      });
      setRegStatus("success");
    } catch (e) {
      setRegStatus("error");
    }
  };

  const openFullRegistration = () => {
    setIsOpen(false);
    onRegisterClick();
  };

  if (!event.isActive) return null;

  const posClass =
    event.position === "top-left"
      ? "top-24 left-8"
      : event.position === "center"
        ? "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        : "top-24 right-8";

  return (
    <div
      className={`fixed z-50 transition-all duration-500 ${isOpen ? "inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center" : posClass}`}
    >
      <style>{`
        @keyframes breathe {
          0%, 100% { box-shadow: 0 20px 50px rgba(0,0,0,0.5); border-color: rgba(0,0,0,0.2); }
          50% { box-shadow: 0 0 25px rgba(255,255,255,0.2); border-color: rgba(255,255,255,0.4); }
        }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 15px rgba(255,215,0,0.6); }
          50% { box-shadow: 0 0 25px rgba(255,215,0,0.9), 0 0 35px rgba(255,215,0,0.4); }
        }
      `}</style>

      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, rotate: 10 }}
            animate={{ scale: 1, rotate: -2 }}
            exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            className="cursor-pointer bg-[#e0e0e0] text-black p-1 relative group max-w-[220px]"
            style={{
              animation: "breathe 4s infinite ease-in-out",
              border: "1px solid transparent",
            }}
          >
            <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-8 bg-black rounded-r-full"></div>
            <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-8 bg-black rounded-l-full"></div>

            <div 
              className="absolute -top-3 -right-3 z-20 group/icon cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                if (onCallForEntriesClick) onCallForEntriesClick();
              }}
            >
              <div 
                className="relative w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-br from-[#ffd700] to-[#b8860b] shadow-[0_0_15px_rgba(255,215,0,0.6)] transition-all duration-300 hover:shadow-[0_0_25px_rgba(255,215,0,0.9)] hover:scale-110"
                style={{ animation: "glowPulse 2s ease-in-out infinite" }}
              >
                <span className="text-black text-xs font-black">📢</span>
                <div className="absolute inset-0 rounded-full bg-white/30 animate-ping opacity-30"></div>
              </div>
              <div className="absolute -bottom-8 right-0 opacity-0 group-hover/icon:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap bg-black/90 text-[#ffd700] text-[10px] px-3 py-1 rounded-full font-bold shadow-lg border border-[#ffd700]/30">
                فراخوان
              </div>
            </div>

            <div className="border-2 border-dashed border-black/20 p-4 flex flex-col items-start gap-2 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
              <div className="flex justify-between w-full items-start">
                <span className="bg-black text-white text-[10px] px-2 py-0.5 uppercase tracking-widest font-bold">
                  SPECIAL EVENT
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                  }}
                  className="text-black/40 hover:text-red-600 transition"
                >
                  <X size={14} />
                </button>
              </div>
              <h3
                className={`text-xl font-black uppercase leading-tight mt-2 ${isFa ? "font-vazir" : "font-sans"}`}
              >
                {event.title.fa}
              </h3>
              <p className="text-xs font-serif text-gray-600 leading-relaxed line-clamp-2">
                {event.description.fa}
              </p>
              <div className="mt-3 w-full flex justify-end">
                <span className="text-[10px] font-bold underline decoration-1 underline-offset-2 hover:bg-black hover:text-white transition px-2 py-1">
                  اطلاعات و ثبت‌نام &rarr;
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="bg-[#111] text-white w-full max-w-lg h-[90vh] md:h-[700px] shadow-2xl rounded-xl border border-white/10 flex flex-col overflow-hidden"
            dir={isFa ? "rtl" : "ltr"}
          >
            <div className="bg-black/50 p-4 border-b border-white/10 flex justify-between items-center shrink-0">
              <h2 className="font-bold text-white font-vazir">
                دبیرخانه جشنواره
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:text-red-500 transition"
              >
                <X size={24} />
              </button>
            </div>
            <div className="flex border-b border-white/10 bg-black/30 shrink-0">
              <TabButton
                active={activeTab === "info"}
                onClick={() => setActiveTab("info")}
                icon={Info}
                label="اطلاعات"
              />
              {onCallForEntriesClick && (
                <button
                  onClick={() => { setIsOpen(false); onCallForEntriesClick(); }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold text-[#ffd700] bg-[#ffd700]/10 hover:bg-[#ffd700]/20 border-b-2 border-[#ffd700] transition"
                >
                  <FileText size={14} /> فراخوان کامل
                </button>
              )}
              {event.enableChat && (
                <TabButton
                  active={activeTab === "chat"}
                  onClick={() => setActiveTab("chat")}
                  icon={MessageSquare}
                  label={event.aiName || "دستیار"}
                />
              )}
              {event.enableRegister && (
                <button
                  onClick={openFullRegistration}
                  className="flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold text-yellow-500 bg-yellow-500/10 hover:bg-yellow-500/20 border-b-2 border-yellow-500 transition"
                >
                  <FileText size={14} /> شروع ثبت‌نام
                </button>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-[#0a0a0a]">
              {activeTab === "info" && (
                <div className="space-y-4 text-sm text-gray-300">
                  {event.posterUrl && (
                    <img
                      src={event.posterUrl}
                      className="w-full rounded border border-white/10"
                    />
                  )}
                  <div className="bg-white/5 p-4 rounded border border-white/10">
                    <h3 className="text-white font-bold mb-2 text-yellow-500">
                      {event.title.fa}
                    </h3>
                    <p className="text-xs leading-6">{event.description.fa}</p>
                  </div>
                  <ul className="list-disc list-inside space-y-2 text-xs">
                    <li>
                      <span className="text-white">مهلت ارسال:</span>{" "}
                      {event.date}
                    </li>
                    <li>
                      <span className="text-white">وبسایت:</span>{" "}
                      {event.mainLink || "www.sodayekhiyal.ir"}
                    </li>
                  </ul>
                  <button
                    onClick={openFullRegistration}
                    className="w-full bg-white text-black font-bold py-3 rounded mt-4 hover:bg-gray-200 transition"
                  >
                    ورود به فرم ثبت‌نام
                  </button>
                </div>
              )}
              {activeTab === "chat" && event.enableChat && (
                <div className="flex flex-col h-full">
                  <div className="flex-1 space-y-3 overflow-y-auto mb-4">
                    {messages.length === 0 && (
                      <p className="text-center text-white/30 text-xs mt-10">
                        سلام! دستیار هوشمند جشنواره هستم. بپرسید.
                      </p>
                    )}
                    {messages.map((m, i) => (
                      <div
                        key={i}
                        className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
                      >
                        <div
                          className={`p-3 rounded-lg text-xs max-w-[85%] relative ${m.role === "user" ? "bg-white text-black rounded-br-none" : "bg-white/10 text-white rounded-bl-none"}`}
                        >
                          {m.text}
                        </div>
                      </div>
                    ))}
                    {chatLoading && (
                      <Loader2
                        className="animate-spin text-white/50 mx-auto"
                        size={20}
                      />
                    )}
                    <div ref={chatEndRef}></div>
                  </div>
                  <form onSubmit={handleChatSend} className="flex gap-2">
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="..."
                      className="flex-1 bg-black border border-white/20 rounded px-3 py-2 text-white outline-none"
                    />
                    <button
                      type="submit"
                      disabled={chatLoading}
                      className="bg-white text-black p-2 rounded"
                    >
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
    className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold transition border-b-2 ${active ? "bg-white/10 text-white border-yellow-500" : "text-gray-500 border-transparent hover:text-gray-300"}`}
  >
    <Icon size={14} /> {label}
  </button>
);

export default SpecialEvent;
