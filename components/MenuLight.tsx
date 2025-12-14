import React from 'react';
import { motion } from 'framer-motion';
import { MenuItem } from '../types';
import { Clapperboard, Feather, Ticket, Phone, Video, EyeOff, LayoutGrid, FileText } from 'lucide-react';

interface Props {
  items: MenuItem[];
  visible: boolean;
  language: 'fa' | 'en';
  onItemClick: (link: string) => void;
}

const MenuLight: React.FC<Props> = ({ items, visible, language, onItemClick }) => {
  const isFa = language === 'fa';

  const getIcon = (item: MenuItem) => {
    const key = (item.link + item.title.en).toLowerCase();
    if (key.includes('gallery') || key.includes('work')) return Clapperboard;
    if (key.includes('blog') || key.includes('article')) return Feather;
    if (key.includes('event') || key.includes('fest')) return Ticket;
    if (key.includes('contact')) return Phone;
    if (key.includes('dark')) return EyeOff;
    return Video;
  };

  if (!visible) return null;

  return (
    <motion.div 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
      // 🔴 تغییر مهم: در موبایل (bottom-12) شد تا بیاد بالا
      className="absolute bottom-12 md:bottom-0 left-0 right-0 flex justify-center items-end z-30 pointer-events-none pb-2 md:pb-6"
    >
      <div className="flex gap-2 md:gap-12 pointer-events-auto items-end px-2">
        {items.map((item) => {
          const Icon = getIcon(item);
          return (
            <div 
              key={item.id} 
              onClick={() => onItemClick(item.link)}
              className="group relative flex flex-col items-center justify-end cursor-pointer w-[60px] h-[120px] md:w-[100px] md:h-[180px]"
            >

              {/* --- 1. منبع نور --- */}
              <div className="absolute top-0 w-full flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                   <div className="w-4 md:w-8 h-1 bg-white rounded-full shadow-[0_0_15px_2px_rgba(255,255,255,1)]"></div>
              </div>

              {/* --- 2. پرتو نور --- */}
              <div 
                className="absolute top-1 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.05) 70%, transparent 100%)',
                  clipPath: 'polygon(25% 0%, 75% 0%, 100% 100%, 0% 100%)',
                  zIndex: 0
                }}
              ></div>

              {/* --- 3. آیکون و متن --- */}
              <div className="relative z-10 flex flex-col items-center mb-1 transition-transform duration-300 group-hover:-translate-y-2">
                <Icon 
                  className="w-5 h-5 md:w-8 md:h-8 text-[#444] group-hover:text-white transition-colors duration-300 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" 
                  strokeWidth={1.5}
                />

                <span className={`mt-2 text-[9px] md:text-[11px] font-bold tracking-widest uppercase transition-all duration-300 ${isFa ? 'font-vazir' : 'font-sans'} text-[#333] group-hover:text-white group-hover:text-shadow-[0_0_5px_white] whitespace-nowrap`}>
                  {isFa ? item.title.fa : item.title.en}
                </span>
              </div>

            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default MenuLight;