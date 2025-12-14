import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

const Loading: React.FC<{ onComplete: () => void, customImage?: string }> = ({ onComplete, customImage }) => {
  const [animationPhase, setAnimationPhase] = useState<'enter' | 'display' | 'exit'>('enter');
  const [hasCompleted, setHasCompleted] = useState(false);

  const safeComplete = useCallback(() => {
    if (!hasCompleted) {
      setHasCompleted(true);
      onComplete();
    }
  }, [hasCompleted, onComplete]);

  useEffect(() => {
    const enterTimer = setTimeout(() => setAnimationPhase('display'), 800);
    const displayTimer = setTimeout(() => setAnimationPhase('exit'), 1800);
    const completeTimer = setTimeout(() => safeComplete(), 2500);
    const fallbackTimer = setTimeout(() => safeComplete(), 3500);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(displayTimer);
      clearTimeout(completeTimer);
      clearTimeout(fallbackTimer);
    };
  }, [safeComplete]);

  return (
    <motion.div 
      className="fixed inset-0 bg-black z-50 flex items-center justify-center overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-overlay animate-pulse"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ 
          opacity: animationPhase === 'exit' ? 0 : 1, 
          scale: animationPhase === 'exit' ? 1.1 : 1,
          filter: animationPhase === 'exit' ? "blur(10px)" : "blur(0px)"
        }}
        transition={{ duration: 0.8 }}
        className="relative flex flex-col items-center justify-center"
      >
        <div className="relative p-4 border-2 border-white/5 bg-black rounded-sm shadow-[0_0_100px_rgba(255,255,255,0.1)]">
          <div className="absolute inset-0 z-20 bg-[radial-gradient(circle,transparent_50%,black_100%)] pointer-events-none"></div>
          <div className="absolute inset-0 z-20 bg-white/5 animate-pulse pointer-events-none mix-blend-overlay"></div>

          {customImage ? (
            <img 
              src={customImage} 
              alt="Loading..." 
              className="w-48 md:w-64 h-auto object-contain grayscale contrast-[1.3] brightness-90 sepia-[0.3]"
            />
          ) : (
            <div className="w-48 md:w-64 h-32 md:h-40 flex items-center justify-center">
              <div className="text-white/30 text-3xl font-bold tracking-widest">SK</div>
            </div>
          )}
        </div>

        <motion.div 
          className="mt-6 text-white/40 text-[10px] uppercase tracking-[0.5em] font-mono"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Loading...
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Loading;