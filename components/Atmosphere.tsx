import React, { useEffect, useState } from 'react';

const Atmosphere: React.FC = () => {
  const [particles, setParticles] = useState<number[]>([]);

  useEffect(() => {
    // تولید ۲۰ ذره غبار (تعداد کم برای سبکی)
    setParticles(Array.from({ length: 20 }, (_, i) => i));
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-10 overflow-hidden">
      {/* استایل انیمیشن */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          20% { opacity: 0.4; }
          50% { transform: translateY(-40px) translateX(20px); opacity: 0.2; }
          80% { opacity: 0.4; }
          100% { transform: translateY(-100px) translateX(-20px); opacity: 0; }
        }
      `}</style>

      {particles.map((i) => {
        // تولید اعداد رندوم برای طبیعی شدن حرکت
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        const duration = 10 + Math.random() * 10; // بین ۱۰ تا ۲۰ ثانیه
        const delay = Math.random() * 10;
        const size = Math.random() * 2 + 1; // ۱ تا ۳ پیکسل

        return (
          <div
            key={i}
            className="absolute bg-white rounded-full opacity-0"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: `${size}px`,
              height: `${size}px`,
              animation: `float ${duration}s linear infinite`,
              animationDelay: `${delay}s`,
              boxShadow: `0 0 ${size * 2}px rgba(255,255,255,0.8)` // درخشش ریز
            }}
          />
        );
      })}
    </div>
  );
};

export default Atmosphere;