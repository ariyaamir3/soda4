import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SpecialEvent as SpecialEventType } from "../types";
import { askAI } from "../services/gemini";
import { X, MessageSquare, Send, Loader2, Minimize2 } from "lucide-react";

interface Props {
  event: SpecialEventType;
  language: "fa" | "en";
  onClose: () => void;
  onRegisterClick: () => void;
  onCallForEntriesClick?: () => void;
  systemPrompt?: string;
}

const SpecialEvent: React.FC<Props> = ({ event, language, onClose, onRegisterClick, onCallForEntriesClick, systemPrompt }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "chat">("info");
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const isFa = language === "fa";

  const getLightStyle = () => {
      const colors = { green: '#10b981', yellow: '#facc15', red: '#ef4444' };
      const speeds = { none: 'none', slow: '2s', fast: '0.5s' };
      const color = colors[event.lightColor || 'yellow'];
      const anim = speeds[event.blinkSpeed || 'slow'];
      return { backgroundColor: color, boxShadow: `0 0 10px ${color}`, animation: event.blinkSpeed !== 'none' ? `pulse ${anim} infinite` : 'none' };
  };

  const handleChat = async (e: React.FormEvent) => {
      e.preventDefault();
      if(!input.trim()) return;
      const msg = input; setInput('');
      setMessages(p => [...p, {role: 'user', text: msg}]);
      setLoading(true);
      const res = await askAI(msg, 'auto', systemPrompt);
      setMessages(p => [...p, {role: 'ai', text: res.text}]);
      setLoading(false);
  };

  if (!event.isActive) return null;

  if (event.chatMode === 'floating') {
      return (
          <div className="fixed bottom-4 left-4 z-50">
              <AnimatePresence>
                  {isOpen ? (
                      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="bg-[#111] border border-white/20 w-80 h-96 rounded-xl flex flex-col shadow-2xl">
                          <div className="bg-black/50 p-3 flex justify-between items-center border-b border-white/10"><span className="text-xs font-bold">دستیار هوشمند</span><button onClick={() => setIsOpen(false)}><Minimize2 size={16}/></button></div>
                          <div className="flex-1 overflow-y-auto p-3 space-y-2">{messages.map((m, i) => <div key={i} className={`text-xs p-2 rounded max-w-[80%] ${m.role === 'user' ? 'bg-white text-black self-end' : 'bg-white/10 text-white'}`}>{m.text}</div>)}{loading && <Loader2 size={16} className="animate-spin text-white/50"/>}</div>
                          <form onSubmit={handleChat} className="p-2 border-t border-white/10 flex gap-2"><input value={input} onChange={e=>setInput(e.target.value)} className="flex-1 bg-black/30 text-white text-xs p-2 rounded outline-none" placeholder="..." /><button type="submit" disabled={loading}><Send size={16} className="text-white"/></button></form>
                      </motion.div>
                  ) : (
                      <button onClick={() => setIsOpen(true)} className="bg-blue-600 w-12 h-12 rounded-full flex items-center justify-center shadow-lg"><MessageSquare size={24} className="text-white"/></button>
                  )}
              </AnimatePresence>
          </div>
      );
  }

  return (
    <>
      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>
      <div className={`fixed z-50 transition-all duration-500 ${isOpen ? "inset-0 bg-black/90 flex items-center justify-center" : "top-24 right-8"}`}>
        {!isOpen && (
            <motion.div onClick={() => setIsOpen(true)} className="cursor-pointer relative group max-w-[200px] border border-white/10 bg-black/40 backdrop-blur p-4 rounded-lg hover:border-yellow-500/50">
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full" style={getLightStyle()}></div>
                <h3 className="text-white font-bold text-sm mb-1">{isFa ? event.title.fa : event.title.en}</h3>
                <p className="text-[10px] text-gray-400 line-clamp-2">{isFa ? event.description.fa : event.description.en}</p>
                <div className="mt-2 text-[10px] text-yellow-500 underline">اطلاعات بیشتر &rarr;</div>
            </motion.div>
        )}

        {isOpen && (
            <div className="bg-[#111] w-full max-w-lg h-[600px] rounded-xl border border-white/20 flex flex-col relative overflow-hidden">
                <button onClick={() => setIsOpen(false)} className="absolute top-4 left-4 z-10 bg-black/50 p-1 rounded-full text-white"><X size={20}/></button>
                <div className="flex bg-black/50 border-b border-white/10 p-2 gap-2">
                    <button onClick={() => setActiveTab('info')} className={`flex-1 py-2 text-xs rounded ${activeTab === 'info' ? 'bg-white text-black' : 'text-gray-400'}`}>اطلاعات</button>
                    {event.enableChat && <button onClick={() => setActiveTab('chat')} className={`flex-1 py-2 text-xs rounded ${activeTab === 'chat' ? 'bg-white text-black' : 'text-gray-400'}`}>چت هوشمند</button>}
                </div>
                
                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'info' ? (
                        <div className="space-y-4 text-center">
                            {event.posterUrl && <img src={event.posterUrl} className="w-full rounded border border-white/10" />}
                            <h2 className="text-xl font-bold text-yellow-500">{isFa ? event.title.fa : event.title.en}</h2>
                            <p className="text-sm text-gray-300 leading-7 text-justify">{isFa ? event.description.fa : event.description.en}</p>
                            <div className="flex gap-2 justify-center pt-4">
                                {onCallForEntriesClick && <button onClick={onCallForEntriesClick} className="border border-yellow-500 text-yellow-500 px-4 py-2 rounded text-xs hover:bg-yellow-500 hover:text-black">فراخوان</button>}
                                {event.enableRegister && <button onClick={onRegisterClick} className="bg-white text-black px-4 py-2 rounded text-xs font-bold hover:bg-gray-200">ثبت‌نام</button>}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col h-full">
                            <div className="flex-1 space-y-3 mb-4 overflow-y-auto">
                                {messages.map((m, i) => <div key={i} className={`text-xs p-3 rounded-lg max-w-[85%] ${m.role === 'user' ? 'bg-white text-black self-end' : 'bg-white/10 text-white'}`}>{m.text}</div>)}
                                {loading && <Loader2 size={20} className="animate-spin text-white mx-auto"/>}
                            </div>
                            <form onSubmit={handleChat} className="flex gap-2"><input value={input} onChange={e=>setInput(e.target.value)} className="flex-1 bg-black border border-white/20 rounded px-3 py-2 text-xs text-white" placeholder="..." /><button type="submit" disabled={loading} className="bg-white text-black p-2 rounded"><Send size={16}/></button></form>
                        </div>
                    )}
                </div>
            </div>
        )}
      </div>
    </>
  );
};

export default SpecialEvent;
