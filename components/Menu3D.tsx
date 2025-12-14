import React from 'react';
import { motion } from 'framer-motion';
import { MenuItem } from '../types';
import { Film, Clapperboard, Ticket, Aperture, LucideIcon } from 'lucide-react';

interface Menu3DProps {
  items: MenuItem[];
  visible: boolean;
  language: 'fa' | 'en';
}

const Menu3D: React.FC<Menu3DProps> = ({ items, visible, language }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  return (
    <div className="absolute bottom-0 left-0 w-full z-30 pb-20 pointer-events-none flex justify-center items-center">
      <motion.div
        className="flex flex-row gap-12 md:gap-16 items-center justify-center"
        variants={containerVariants}
        initial="hidden"
        animate={visible ? "show" : "hidden"}
      >
        {items.map((item, index) => (
          <IconItem key={item.id} item={item} index={index} language={language} />
        ))}
      </motion.div>
    </div>
  );
};

const getIconForIndex = (index: number): LucideIcon => {
  // Cinema specific icons:
  // 0: Archive -> Film (Reel)
  // 1: About -> Clapperboard (Making of)
  // 2: Contact -> Ticket (Admission)
  // 3: Gallery -> Aperture (Lens)
  const icons = [Film, Clapperboard, Ticket, Aperture];
  return icons[index % icons.length];
};

const IconItem: React.FC<{ item: MenuItem; index: number; language: 'fa' | 'en' }> = ({ item, index, language }) => {
  const Icon = getIconForIndex(index);
  const title = language === 'fa' ? item.title.fa : item.title.en;

  return (
    <motion.div
      variants={{
        hidden: { y: 50, opacity: 0, scale: 0.5 },
        show: { 
          y: 0, 
          opacity: 1, 
          scale: 1,
          transition: { type: 'spring', stiffness: 100, damping: 15 }
        }
      }}
      className="relative group pointer-events-auto perspective-1000"
    >
      {/* The 3D Object/Icon Container */}
      <motion.div
        className="relative w-10 h-10 md:w-12 md:h-12 flex items-center justify-center cursor-pointer"
        whileHover={{ 
          y: -15, 
          scale: 1.2,
          rotateX: 10,
          rotateY: 10,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        {/* Glassmorphism Background */}
        <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px] border border-white/20 rounded-lg shadow-[0_10px_30px_rgba(0,0,0,0.5)] group-hover:bg-white/10 group-hover:border-white/40 transition-all duration-300" />
        
        {/* Inner Glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg" />

        {/* Icon */}
        <Icon 
          size={20} 
          className="text-gray-400 group-hover:text-white transition-colors duration-300 z-10" 
          strokeWidth={1.5}
        />
      </motion.div>

      {/* Floating Label (Appears on Hover) */}
      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 flex flex-col items-center pointer-events-none min-w-[100px]">
        <motion.span
          className={`text-[10px] md:text-xs font-light tracking-[0.2em] text-white uppercase whitespace-nowrap opacity-0 blur-sm translate-y-2 group-hover:opacity-100 group-hover:blur-0 group-hover:translate-y-0 transition-all duration-500 ease-out ${language === 'fa' ? 'font-vazir' : 'font-sans'}`}
        >
          {title}
        </motion.span>
        {/* Small decorative dot below text */}
        <motion.div 
           className="w-1 h-1 bg-white rounded-full mt-2 opacity-0 group-hover:opacity-50 transition-opacity duration-700 delay-100"
        />
      </div>
    </motion.div>
  );
};

export default Menu3D;