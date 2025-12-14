import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Send, Mail, User, MessageSquare, CheckCircle2 } from 'lucide-react';
import { submitContactMessage } from '../services/firebase';

interface Props {
  language: 'fa' | 'en';
  onClose: () => void;
}

const ContactForm: React.FC<Props> = ({ language, onClose }) => {
  const [data, setData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const isFa = language === 'fa';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.name || !data.email || !data.message) {
      alert(isFa ? 'لطفاً تمام فیلدها را پر کنید' : 'Please fill all fields');
      return;
    }
    setStatus('sending');
    try {
        await submitContactMessage({
            name: data.name,
            email: data.email,
            message: data.message,
            date: new Date().toLocaleDateString(isFa ? 'fa-IR' : 'en-US')
        });
        setStatus('success');
        setTimeout(() => {
          onClose();
        }, 2000);
    } catch (error) {
        setStatus('error');
        alert(isFa ? 'خطا در ارسال پیام' : 'Error sending message');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4" dir={isFa ? 'rtl' : 'ltr'}>
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        className="bg-[#111] border border-white/10 w-full max-w-md p-8 rounded-xl relative shadow-2xl"
      >
        <button onClick={onClose} className="absolute top-4 left-4 text-white/50 hover:text-white transition"><X size={24} /></button>

        {status === 'success' ? (
            <div className="text-center py-10 space-y-4">
                <CheckCircle2 size={60} className="text-green-500 mx-auto" />
                <h3 className="text-xl font-bold text-white">{isFa ? 'پیام ارسال شد' : 'Message Sent'}</h3>
                <p className="text-sm text-gray-400">{isFa ? 'ما به زودی با شما تماس می‌گیریم.' : 'We will contact you soon.'}</p>
                <button onClick={onClose} className="text-xs underline text-white mt-4">{isFa ? 'بستن' : 'Close'}</button>
            </div>
        ) : (
            <>
                <h2 className="text-2xl font-bold text-white mb-1">{isFa ? 'تماس با ما' : 'Contact Us'}</h2>
                <p className="text-xs text-gray-500 mb-6">{isFa ? 'نظرات و پیشنهادات خود را ارسال کنید' : 'Send us your thoughts'}</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase text-gray-500 tracking-wider flex items-center gap-1"><User size={10} /> {isFa ? 'نام' : 'Name'}</label>
                        <input 
                            type="text" required 
                            value={data.name} onChange={e => setData({...data, name: e.target.value})}
                            className="w-full bg-black/50 border border-white/20 rounded p-3 text-white outline-none focus:border-white transition"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase text-gray-500 tracking-wider flex items-center gap-1"><Mail size={10} /> {isFa ? 'ایمیل' : 'Email'}</label>
                        <input 
                            type="email" required dir="ltr"
                            value={data.email} onChange={e => setData({...data, email: e.target.value})}
                            className="w-full bg-black/50 border border-white/20 rounded p-3 text-white outline-none focus:border-white transition"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase text-gray-500 tracking-wider flex items-center gap-1"><MessageSquare size={10} /> {isFa ? 'پیام شما' : 'Message'}</label>
                        <textarea 
                            required rows={4}
                            value={data.message} onChange={e => setData({...data, message: e.target.value})}
                            className="w-full bg-black/50 border border-white/20 rounded p-3 text-white outline-none focus:border-white transition"
                        ></textarea>
                    </div>

                    <button 
                        type="submit" 
                        disabled={status === 'sending'}
                        className="w-full bg-white text-black font-bold py-3 rounded hover:bg-gray-200 transition flex items-center justify-center gap-2 mt-2"
                    >
                        {status === 'sending' ? (isFa ? 'در حال ارسال...' : 'Sending...') : (
                            <>{isFa ? 'ارسال پیام' : 'Send Message'} <Send size={16} /></>
                        )}
                    </button>
                </form>
            </>
        )}
      </motion.div>
    </div>
  );
};

export default ContactForm;