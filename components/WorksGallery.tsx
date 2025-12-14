import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WorkItem } from '../types';
import { X, ExternalLink, Film } from 'lucide-react';

interface Props {
  works: WorkItem[];
  language: 'fa' | 'en';
  onClose: () => void;
}

const WorksGallery: React.FC<Props> = ({ works, language, onClose }) => {
  const isFa = language === 'fa';

  return (
    <div className="fixed inset-0 z-50 bg-[#050505] text-white overflow-hidden flex flex-col font-vazir" dir={isFa ? 'rtl' : 'ltr'}>

      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b border-white/10 bg-[#0a0a0a] z-10">
        <div>
          <h2 className="text-2xl font-bold tracking-tighter text-white">آرشیو آثار</h2>
          <p className="text-xs text-white/40 uppercase tracking-widest">Works & Projects</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition text-white/60 hover:text-white hover:rotate-90 duration-300">
          <X size={32} strokeWidth={1} />
        </button>
      </div>

      {/* Gallery Grid */}
      <div className="flex-1 overflow-y-auto p-6 md:p-12">
        {works.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-white/20">
            <Film size={64} strokeWidth={0.5} />
            <p className="mt-4 text-sm font-light">هنوز اثری ثبت نشده است.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {works.map((work, index) => (
              <motion.div
                key={work.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative"
              >
                {/* Image Container */}
                <div className="aspect-[3/4] overflow-hidden rounded-sm bg-zinc-900 relative shadow-2xl">
                  {work.imageUrl ? (
                    <img 
                      src={work.imageUrl} 
                      alt={isFa ? work.title.fa : work.title.en} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/10"><Film size={40} /></div>
                  )}

                  {/* Overlay Info */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                    <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <span className="text-yellow-500 text-xs font-mono mb-1 block">{work.year}</span>
                      <h3 className="text-xl font-bold mb-2">{isFa ? work.title.fa : work.title.en}</h3>
                      {work.description && <p className="text-xs text-gray-300 line-clamp-3 mb-4 leading-relaxed">{work.description}</p>}

                      {work.link && (
                        <a 
                          href={work.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-xs border border-white/30 px-4 py-2 rounded-full hover:bg-white hover:text-black transition"
                        >
                          <ExternalLink size={12} /> {isFa ? 'مشاهده اثر' : 'View Project'}
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

export default WorksGallery;