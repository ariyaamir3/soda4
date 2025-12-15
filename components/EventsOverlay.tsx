import React from 'react';
import { motion } from 'framer-motion';
import { EventItem } from '../types';
import { X, Calendar, MapPin, ExternalLink, Ticket, Clock } from 'lucide-react';

interface Props {
  events: EventItem[];
  onClose: () => void;
}

const EventsOverlay: React.FC<Props> = ({ events, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-[#080808] text-white flex flex-col font-vazir overflow-hidden" dir="rtl">
      
      {/* پس‌زمینه نویزدار */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>

      {/* هدر */}
      <div className="flex justify-between items-center p-6 border-b border-white/10 bg-[#0a0a0a]/90 backdrop-blur shrink-0 z-20">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Ticket className="text-yellow-500" /> تقویم رویدادها
          </h2>
          <p className="text-xs text-white/40 mt-1">ورکشاپ‌ها، اکران‌ها و جشنواره‌ها</p>
        </div>
        <button 
          onClick={onClose} 
          className="p-2 bg-white/5 hover:bg-red-500/20 rounded-full transition text-white/60 hover:text-red-500 hover:rotate-90 duration-300"
        >
          <X size={24} strokeWidth={1.5} />
        </button>
      </div>

      {/* لیست رویدادها (Timeline) */}
      <div className="flex-1 overflow-y-auto p-6 md:p-12 relative custom-scrollbar">
        
        {/* خط زمان (Timeline Line) */}
        <div className="absolute top-0 bottom-0 right-8 md:right-[3.25rem] w-px bg-gradient-to-b from-transparent via-white/10 to-transparent"></div>

        {events.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-white/20 select-none">
            <div className="w-20 h-20 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center mb-4">
                <Calendar size={40} strokeWidth={0.5} />
            </div>
            <p className="text-sm font-light tracking-widest">هیچ رویدادی فعال نیست.</p>
          </div>
        ) : (
          <div className="space-y-16 max-w-4xl mx-auto pr-8 md:pr-12">
            {events.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
                className="relative group"
              >
                {/* دایره روی خط زمان */}
                <div className="absolute top-0 -right-[41px] md:-right-[60px] w-4 h-4 bg-[#0a0a0a] border-2 border-white/30 rounded-full z-10 group-hover:border-yellow-500 group-hover:bg-yellow-500 transition-all duration-300 shadow-[0_0_15px_rgba(0,0,0,1)]"></div>

                {/* کارت رویداد */}
                <div className="bg-[#111] border border-white/5 rounded-xl overflow-hidden hover:border-white/20 transition-all duration-500 flex flex-col md:flex-row shadow-2xl group-hover:-translate-x-2">
                  
                  {/* تصویر رویداد */}
                  {event.imageUrl && (
                    <div className="w-full md:w-48 h-48 md:h-auto relative shrink-0 overflow-hidden">
                      <img 
                        src={event.imageUrl} 
                        alt={event.title}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition duration-700 scale-100 group-hover:scale-110" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent md:bg-gradient-to-r md:from-black/80 md:to-transparent"></div>
                    </div>
                  )}

                  {/* محتوا */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex flex-wrap justify-between items-start mb-3 gap-2">
                        <h3 className="text-xl font-bold text-white group-hover:text-yellow-500 transition-colors leading-tight">
                            {event.title}
                        </h3>
                        <div className="flex items-center gap-2 text-[10px] text-yellow-500/90 font-mono bg-yellow-500/5 px-3 py-1 rounded-full border border-yellow-500/10">
                          <Calendar size={12} /> {event.date}
                        </div>
                      </div>

                      {event.location && (
                          <div className="flex items-center gap-1 text-xs text-white/40 mb-4 font-light">
                              <MapPin size={12} /> <span>{event.location}</span>
                          </div>
                      )}

                      <p className="text-sm text-gray-400 leading-7 font-light whitespace-pre-wrap text-justify border-l-2 border-white/5 pl-4 ml-2">
                          {event.description}
                      </p>
                    </div>

                    {/* فوتر کارت */}
                    <div className="mt-6 pt-4 border-t border-white/5 flex justify-end items-center gap-4 opacity-60 group-hover:opacity-100 transition-opacity">
                      {event.link && (
                        <a 
                            href={event.link} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex items-center gap-2 text-xs bg-white text-black px-5 py-2 rounded-lg font-bold hover:bg-yellow-500 transition shadow-[0_0_10px_rgba(255,255,255,0.1)] hover:shadow-[0_0_15px_rgba(234,179,8,0.4)]"
                        >
                            ثبت‌نام / جزئیات <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsOverlay;
