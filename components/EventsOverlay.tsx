import React from 'react';
import { motion } from 'framer-motion';
import { EventItem } from '../types';
import { X, Calendar, MapPin, ExternalLink, Ticket } from 'lucide-react';

interface Props {
  events: EventItem[];
  onClose: () => void;
}

const EventsOverlay: React.FC<Props> = ({ events, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-[#080808] text-white flex flex-col font-vazir" dir="rtl">

      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b border-white/10 bg-[#0a0a0a] shrink-0 z-10">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Ticket className="text-yellow-500" /> تقویم رویدادها
          </h2>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition text-white/60 hover:text-white hover:rotate-90 duration-300">
          <X size={28} strokeWidth={1.5} />
        </button>
      </div>

      {/* Timeline List */}
      <div className="flex-1 overflow-y-auto p-6 md:p-12 relative">
        <div className="absolute top-0 bottom-0 right-8 md:right-16 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>

        {events.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-white/20">
            <Calendar size={64} strokeWidth={0.5} />
            <p className="mt-4 text-sm font-light">هیچ رویدادی ثبت نشده است.</p>
          </div>
        ) : (
          <div className="space-y-12 max-w-4xl mx-auto pr-8 md:pr-16">
            {events.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative group"
              >
                <div className="absolute top-6 -right-[41px] md:-right-[73px] w-3 h-3 bg-black border-2 border-yellow-500 rounded-full z-10 group-hover:bg-yellow-500 transition-colors duration-300 shadow-[0_0_10px_rgba(234,179,8,0.5)]"></div>

                <div className="bg-[#111] border border-white/5 rounded-lg overflow-hidden hover:border-white/20 transition-colors duration-300 flex flex-col md:flex-row shadow-lg">
                  {event.imageUrl && (
                    <div className="w-full md:w-1/3 h-48 md:h-auto relative">
                      <img src={event.imageUrl} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition duration-700" />
                    </div>
                  )}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold text-white group-hover:text-yellow-500 transition-colors">{event.title}</h3>
                        <div className="hidden md:flex items-center gap-2 text-xs text-yellow-500/80 font-mono bg-yellow-500/5 px-3 py-1 rounded border border-yellow-500/10">
                          <Calendar size={12} /> {event.date}
                        </div>
                      </div>
                      {event.location && <div className="flex items-center gap-1 text-xs text-white/40 mb-4"><MapPin size={12} /><span>{event.location}</span></div>}
                      <p className="text-sm text-gray-400 leading-7 font-light whitespace-pre-wrap">{event.description}</p>
                    </div>
                    {event.link && (
                      <div className="mt-6 flex justify-end">
                        <a href={event.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs bg-white text-black px-4 py-2 rounded font-bold hover:bg-yellow-500 transition">بیشتر / ثبت‌نام <ExternalLink size={12} /></a>
                      </div>
                    )}
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