import React from 'react';
import { motion } from 'framer-motion';
import { MenuItem } from '../types';
import { 
  Clapperboard, // آثار
  Feather,      // مقاله
  Phone,        // تماس
  Info,         // درباره ما
  Eye,          // اتاق تاریک
  Ticket,       // رویدادها
  Video,        // پیش‌فرض
  LucideIcon
} from 'lucide-react';

interface Props {
  items: MenuItem[];
  visible: boolean;
  language: 'fa' | 'en';
  onItemClick: (link: string) => void;
}

const MenuLight: React.FC<Props> = ({ items, visible, language, onItemClick }) => {
  const isFa = language === 'fa';

  // تابع انتخاب آیکون بر اساس لینک
  const getIcon = (link: string): LucideIcon => {
    const l = link.toLowerCase();
    if (l.includes('work') || l.includes('gallery')) return Clapperboard;
    if (l.includes('article') || l.includes('blog')) return Feather;
    if (l.includes('contact')) return Phone;
    if (l.includes('about')) return Info;
    if (l.includes('event')) return Ticket;
    if (l.includes('dark') || l.includes('room')) return Eye;
    return Video;
  };

  // اگر ویدیو هنوز تمام نشده یا ادمین نیستیم، منو را نشان نده (مگر اینکه forced باشد)
  // اما طبق درخواست شما، معمولاً بعد از لود ویدیو ظاهر می‌شود
  if (!visible) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
      className="absolute bottom-0 left-0 w-full flex justify-center items-end pb-4 md:pb-8 z-40 pointer-events-none"
    >
      <div className="flex gap-4 md:gap-8 pointer-events-auto bg-gradient-to-t from-black via-black/80 to-transparent px-6 pb-2 pt-10 rounded-t-3xl">
        {items.map((item) => {
          const Icon = getIcon(item.link);
          
          return (
            <div key={item.id} className="light-button group" onClick={() => onItemClick(item.link)}>
              {/* 
                این ساختار دقیقاً با CSS فایل index.html هماهنگ است 
                تا افکت نوری (Light Beam) کار کند.
              */}
              <button className="bt">
                
                {/* 1. منبع نور و پرتو (فقط در هاور روشن می‌شود) */}
                <div className="light-holder">
                  <div className="dot"></div>
                  <div className="light"></div>
                </div>

                {/* 2. جعبه آیکون */}
                <div className="button-holder">
                  <Icon size={18} />
                </div>

                {/* 3. متن زیر دکمه */}
                <div className={`label-text ${isFa ? 'font-vazir' : 'font-sans'}`}>
                  {isFa ? item.title.fa : item.title.en}
                </div>

              </button>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default MenuLight;
