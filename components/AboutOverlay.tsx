import React from 'react';
import { motion } from 'framer-motion';
import { AboutSection } from '../types';
import { 
  X, Instagram, Twitter, Linkedin, Youtube, 
  Phone, Mail, MapPin, Globe, Send, MessageCircle 
} from 'lucide-react';

interface Props {
  data: AboutSection;
  language: 'fa' | 'en';
  onClose: () => void;
}

const AboutOverlay: React.FC<Props> = ({ data, language, onClose }) => {
  const isFa = language === 'fa';

  // انتخاب آیکون بر اساس نام پلتفرم
  const getIcon = (platform: string) => {
    const p = platform.toLowerCase();
    if (p.includes('instagram')) return Instagram;
    if (p.includes('twitter') || p.includes('x')) return Twitter;
    if (p.includes('linkedin')) return Linkedin;
    if (p.includes('youtube')) return Youtube;
    if (p.includes('telegram')) return Send;
    if (p.includes('whatsapp')) return MessageCircle;
    if (p.includes('email') || p.includes('mail')) return Mail;
    if (p.includes('phone') || p.includes('tel')) return Phone;
    return Globe; // آیکون پیش‌فرض
  };

  // تنظیم لینک (مثلاً اضافه کردن tel: یا mailto:)
  const getHref = (platform: string, url: string) => {
    const p = platform.toLowerCase();
    if (p.includes('phone') || p.includes('tel')) return `tel:${url}`;
    if (p.includes('email') || p.includes('mail')) return `mailto:${url}`;
    return url.startsWith('http') ? url : `https://${url}`;
  };

  // رندر کردن متن بیانیه با پاراگراف‌بندی صحیح
  const renderManifesto = (text: string) => {
    if (!text) return null;
    const lines = text.split('\n').filter(line => line.trim() !== '');

    return lines.map((line, index) => {
      // خط آخر را برجسته (Bold) و طلایی می‌کنیم (به عنوان امضا یا شعار)
      const isLastLine = index === lines.length - 1 && lines.length > 1;

      return (
        <p 
          key={index} 
          className={`mb-6 leading-8 ${
            isLastLine 
              ? 'text-yellow-500 font-bold text-lg mt-8 border-r-4 border-yellow-500 pr-4 pl-4 bg-yellow-500/5 py-2 rounded-l' 
              : 'text-gray-300 font-light text-justify'
          }`}
        >
          {line}
        </p>
      );
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-xl flex items-center justify-center p-4 font-vazir" dir={isFa ? 'rtl' : 'ltr'}>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.5, ease: "circOut" }}
        className="relative w-full max-w-5xl bg-[#111] border border-white/10 shadow-2xl flex flex-col md:flex-row rounded-2xl overflow-hidden max-h-[90vh]"
      >
        {/* پس‌زمینه نویزدار */}
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>

        {/* دکمه بستن */}
        <button 
          onClick={onClose} 
          className="absolute top-6 left-6 z-50 text-white/30 hover:text-red-500 transition p-2 bg-black/50 rounded-full hover:rotate-90 duration-300"
        >
          <X size={24} />
        </button>

        {/* --- ستون متن (چپ/راست بسته به زبان) --- */}
        <div className="flex-[2] p-8 md:p-12 overflow-y-auto custom-scrollbar relative z-10">
          <div className="mb-10 border-b border-white/10 pb-6">
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-2 text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-500">
              {isFa ? 'درباره ما' : 'About Us'}
            </h2>
            <div className="h-1 w-24 bg-yellow-500 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.5)]"></div>
          </div>

          <div className="prose prose-invert prose-lg max-w-none">
            {renderManifesto(isFa ? data.manifesto.fa : data.manifesto.en)}
          </div>
        </div>

        {/* --- ستون اطلاعات تماس (سایدبار تیره) --- */}
        <div className="flex-1 bg-[#050505] p-8 md:p-12 border-t md:border-t-0 md:border-r border-white/10 flex flex-col justify-center relative z-10">
          
          {/* آدرس */}
          <div className="mb-12">
            <h4 className="text-xs uppercase tracking-[0.2em] text-white/40 mb-4 flex items-center gap-2">
              <MapPin size={14} className="text-yellow-500" /> {isFa ? 'موقعیت' : 'Location'}
            </h4>
            <p className="text-sm text-white/80 font-mono leading-7 border-r-2 border-white/10 pr-4">
              {isFa ? data.address.fa : data.address.en}
            </p>
          </div>

          {/* شبکه‌های اجتماعی */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] text-white/40 mb-6 flex items-center gap-2">
              <Globe size={14} className="text-yellow-500" /> {isFa ? 'ارتباط' : 'Connect'}
            </h4>
            
            <div className="flex flex-col gap-3">
              {data.socials.map((social, idx) => {
                // فقط اگر تیک "فعال" در ادمین خورده باشد نشان بده
                if (!social.isActive) return null;
                
                const Icon = getIcon(social.platform);
                
                return (
                  <a 
                    key={idx}
                    href={getHref(social.platform, social.url)}
                    target={social.platform.toLowerCase().includes('phone') || social.platform.toLowerCase().includes('mail') ? '_self' : '_blank'}
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-yellow-500/30 transition group"
                  >
                    <div className="text-gray-400 group-hover:text-yellow-500 transition-colors">
                      <Icon size={18} />
                    </div>
                    <span className="text-xs font-bold uppercase text-gray-300 group-hover:text-white tracking-wider">
                      {social.platform}
                    </span>
                  </a>
                );
              })}

              {/* اگر هیچ شبکه اجتماعی‌ای نبود */}
              {data.socials.filter(s => s.isActive).length === 0 && (
                <p className="text-xs text-white/20 italic">راه ارتباطی ثبت نشده است.</p>
              )}
            </div>
          </div>

        </div>

      </motion.div>
    </div>
  );
};

export default AboutOverlay;
