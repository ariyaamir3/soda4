import React from 'react';
import { motion } from 'framer-motion';
import { AboutSection } from '../types';
import { X, Instagram, Twitter, Linkedin, Youtube, Phone, Mail, MapPin } from 'lucide-react';

interface Props {
  data: AboutSection;
  language: 'fa' | 'en';
  onClose: () => void;
}

const AboutOverlay: React.FC<Props> = ({ data, language, onClose }) => {
  const isFa = language === 'fa';

  const getIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return Instagram;
      case 'x': return Twitter;
      case 'linkedin': return Linkedin;
      case 'youtube': return Youtube;
      case 'phone': return Phone;
      case 'email': return Mail;
      default: return null;
    }
  };

  const getHref = (platform: string, url: string) => {
    if (platform === 'phone') return `tel:${url}`;
    if (platform === 'email') return `mailto:${url}`;
    return url;
  };

  // 🟢 تابع هوشمند برای خوشگل‌سازی متن
  const renderManifesto = (text: string) => {
    if (!text) return null;
    // متن رو بر اساس "اینتر" (خط جدید) جدا میکنیم
    const lines = text.split('\n').filter(line => line.trim() !== '');

    return lines.map((line, index) => {
      // اگر خط آخر بود -> استایل خاص (سفید، بولد، درشت)
      const isLastLine = index === lines.length - 1;

      return (
        <p 
          key={index} 
          className={`mb-6 leading-8 ${
            isLastLine 
              ? 'text-white font-bold text-xl mt-8 border-r-4 border-yellow-500 pr-4' // استایل خط آخر (امضا)
              : 'text-gray-300 font-light text-justify' // استایل متن معمولی
          }`}
        >
          {line}
        </p>
      );
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-xl flex items-center justify-center p-4" dir={isFa ? 'rtl' : 'ltr'}>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.5, ease: "circOut" }}
        className="relative w-full max-w-5xl bg-[#111] border border-white/10 p-8 md:p-16 shadow-2xl overflow-hidden flex flex-col md:flex-row gap-12 max-h-[90vh] md:max-h-auto overflow-y-auto"
      >
        {/* Cinematic Noise Texture */}
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>

        {/* Close Button */}
        <button onClick={onClose} className="absolute top-6 right-6 text-white/30 hover:text-white transition hover:rotate-90 duration-300 z-50">
          <X size={32} strokeWidth={1} />
        </button>

        {/* Left Column: Manifesto */}
        <div className="flex-[2] relative z-10">
          <div className="mb-8">
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-2 font-vazir text-transparent bg-clip-text bg-gradient-to-br from-white to-white/20">
              {isFa ? 'درباره ما' : 'About Us'}
            </h2>
            <div className="h-1 w-20 bg-yellow-500 rounded-full"></div>
          </div>

          {/* نمایش متن با استایل هوشمند */}
          <div className="prose prose-invert prose-lg max-w-none font-serif">
            {renderManifesto(isFa ? data.manifesto.fa : data.manifesto.en)}
          </div>
        </div>

        {/* Right Column: Contact & Socials */}
        <div className="flex-1 flex flex-col justify-end border-t md:border-t-0 md:border-r border-white/10 pt-8 md:pt-0 md:pr-12 relative z-10">

          {/* Address */}
          <div className="mb-10">
            <h4 className="text-xs uppercase tracking-[0.2em] text-white/40 mb-4 flex items-center gap-2">
              <MapPin size={12} /> {isFa ? 'موقعیت' : 'Location'}
            </h4>
            <p className="text-sm text-white font-mono leading-6 opacity-80">
              {isFa ? data.address.fa : data.address.en}
            </p>
          </div>

          {/* Social Links */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] text-white/40 mb-4">
              {isFa ? 'ارتباط' : 'Connect'}
            </h4>
            <div className="flex flex-col gap-4">
              {data.socials.map((social, idx) => {
                if (!social.isActive) return null;
                const Icon = getIcon(social.platform);
                if (!Icon) return null;

                return (
                  <a 
                    key={idx}
                    href={getHref(social.platform, social.url)}
                    target={social.platform === 'phone' || social.platform === 'email' ? '_self' : '_blank'}
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-white/60 hover:text-yellow-500 transition group"
                  >
                    <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-yellow-500/50 group-hover:bg-yellow-500/10 transition">
                      <Icon size={16} />
                    </div>
                    <span className="text-xs font-mono tracking-widest uppercase text-white/50 group-hover:text-white transition duration-300">
                      {social.platform}
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        </div>

      </motion.div>
    </div>
  );
};

export default AboutOverlay;