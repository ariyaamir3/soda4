import React from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, Award, Film, Cpu, Users, Globe, FileText } from 'lucide-react';

interface CallForEntriesProps {
  posterUrl?: string;
  onClose: () => void;
  onRegisterClick: () => void;
}

const CallForEntries: React.FC<CallForEntriesProps> = ({ posterUrl, onClose, onRegisterClick }) => {
  return (
    <motion.div 
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      dir="rtl"
    >
      <style>{`
        @keyframes filmStrip {
          0% { background-position: 0 0; }
          100% { background-position: 100px 0; }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(218, 165, 32, 0.3); }
          50% { box-shadow: 0 0 40px rgba(218, 165, 32, 0.6); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .gold-border {
          border-image: linear-gradient(135deg, #b8860b 0%, #ffd700 50%, #b8860b 100%) 1;
        }
      `}</style>

      <button 
        onClick={onClose}
        className="fixed top-6 left-6 z-50 bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all duration-300 group"
      >
        <X size={24} className="text-white group-hover:rotate-90 transition-transform duration-300" />
      </button>

      <div className="min-h-screen flex flex-col items-center justify-start py-8 px-4">

        <motion.div 
          className="relative w-full max-w-4xl"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          <div className="absolute -top-4 left-0 right-0 h-8 bg-gradient-to-b from-black to-transparent z-10"></div>
          <div className="absolute -bottom-4 left-0 right-0 h-8 bg-gradient-to-t from-black to-transparent z-10"></div>

          <div className="relative overflow-hidden rounded-lg" style={{ animation: 'glow 3s ease-in-out infinite' }}>
            <div className="absolute inset-0 border-4 border-[#b8860b]/30 rounded-lg pointer-events-none z-20"></div>

            {posterUrl ? (
              <img 
                src={posterUrl} 
                alt="Festival Poster" 
                className="w-full h-auto object-contain"
              />
            ) : (
              <div className="w-full aspect-[3/4] bg-gradient-to-b from-[#1a1a1a] to-black flex items-center justify-center">
                <div className="text-center">
                  <Film size={80} className="text-[#b8860b] mx-auto mb-4 opacity-50" />
                  <p className="text-white/30 text-sm">پوستر جشنواره</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div 
          className="w-full max-w-4xl mt-12 space-y-8"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >

          <div className="text-center space-y-4">
            <motion.h1 
              className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-l from-[#b8860b] via-[#ffd700] to-[#b8860b]"
              style={{ animation: 'float 4s ease-in-out infinite' }}
            >
              نخستین جشنواره بین‌المللی فیلم کوتاه هوش مصنوعی
            </motion.h1>
            <h2 className="text-xl md:text-2xl text-white/80 font-light tracking-wider">
              1st International Sodaye Khiyal AI Short Film Festival
            </h2>
            <div className="flex items-center justify-center gap-2 text-[#b8860b]">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#b8860b]"></div>
              <span className="text-sm italic">تجسّم خیال با هوش مصنوعی</span>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#b8860b]"></div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6 md:p-8">
            <h3 className="text-xl font-bold text-[#ffd700] mb-4 flex items-center gap-2">
              <FileText size={20} /> مانیفست
            </h3>
            <p className="text-white/80 leading-8 text-sm md:text-base">
              هنر، تمنایی است برای تجسّد خیال؛ تمنایی که اکنون با ظهور هوش مصنوعی، رنگ و مسیر دیگری گرفته است.
              «سودای خیال» بستری برای تشویق دوستداران این فناوری نوین و امکانی برای تحلیل زیبایی‌شناسی سینمای پساهوش‌مصنوعی است؛ جریانی تازه برای روایت، تصویر و خلاقیت.
            </p>
            <p className="text-white/60 leading-7 text-sm mt-4 italic" dir="ltr">
              "Art is the embodiment of imagination, reinvented by AI. 'Sodaye Khiyal' is a sanctuary for the aesthetics of Post-AI Cinema; A new era for narrative and image."
            </p>
          </div>

          <div className="bg-gradient-to-r from-[#b8860b]/10 via-[#ffd700]/5 to-[#b8860b]/10 border border-[#b8860b]/30 rounded-xl p-6 md:p-8">
            <h3 className="text-xl font-bold text-[#ffd700] mb-6 flex items-center gap-2">
              <Users size={20} /> ساختار داوری: انسان و ماشین
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-black/30 p-4 rounded-lg border border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl">🧠</div>
                  <h4 className="font-bold text-white">داوران انسانی</h4>
                </div>
                <p className="text-white/60 text-sm leading-6">
                  گروهی از سینماگران و هنرمندان برجسته، وظیفه بررسی روایت، کارگردانی، خلاقیت هنری و تاثیرگذاری عاطفی آثار را بر عهده دارند.
                </p>
              </div>
              <div className="bg-black/30 p-4 rounded-lg border border-[#b8860b]/30">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#b8860b]/20 flex items-center justify-center text-xl">🤖</div>
                  <h4 className="font-bold text-[#ffd700]">داور هوش مصنوعی</h4>
                </div>
                <p className="text-white/60 text-sm leading-6">
                  یک مدل هوش مصنوعی اختصاصی که برای تحلیل زیبایی‌شناسی بصری آموزش دیده است، وظیفه آنالیز پارامترهای فنی، نوآوری در تصویرسازی و مهندسی پرامت را بر عهده دارد.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6 md:p-8">
            <h3 className="text-xl font-bold text-[#ffd700] mb-6 flex items-center gap-2">
              <Film size={20} /> دسته‌بندی و ژانرها
            </h3>
            <p className="text-white/70 mb-4">جشنواره پذیرای تمامی ژانرها (درام، کمدی، علمی-تخیلی، وحشت، مستند و...) است. آثار در دو گروه داوری می‌شوند:</p>
            <div className="flex flex-wrap gap-3">
              <span className="bg-white/10 px-4 py-2 rounded-full text-white text-sm">۱. فیلم‌های داستانی</span>
              <span className="bg-white/10 px-4 py-2 rounded-full text-white text-sm">۲. انیمیشن و هنر تجربی</span>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6 md:p-8">
            <h3 className="text-xl font-bold text-[#ffd700] mb-6 flex items-center gap-2">
              <Cpu size={20} /> قوانین و مقررات
            </h3>
            <div className="space-y-4 text-sm">
              <div className="bg-black/30 p-4 rounded-lg">
                <h4 className="font-bold text-white mb-2">تولید و پس‌تولید</h4>
                <p className="text-white/60">تمامی تصاویر باید الزاماً توسط هوش مصنوعی تولید شده باشند. استفاده از راش‌های دوربین (Live-action) ممنوع است.</p>
              </div>
              <div className="bg-black/30 p-4 rounded-lg">
                <h4 className="font-bold text-white mb-2">زمان و فرمت</h4>
                <ul className="text-white/60 space-y-1 list-disc list-inside">
                  <li>زمان: بین ۱ تا ۱۰ دقیقه</li>
                  <li>فرمت: فایل MP4/MOV (حداقل 1080p)</li>
                  <li>زیرنویس: انگلیسی (الزامی)</li>
                </ul>
              </div>
              <div className="bg-black/30 p-4 rounded-lg">
                <h4 className="font-bold text-white mb-2">نحوه ارسال</h4>
                <p className="text-white/60">فایل ویدیو آپلود نشود. تنها لینک دانلود/تماشا (مانند Google Drive, Dropbox, YouTube, Vimeo) ارسال گردد. لینک‌ها باید بدون پسورد باشند.</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-[#b8860b]/20 via-[#ffd700]/10 to-[#b8860b]/20 border border-[#b8860b]/40 rounded-xl p-6 md:p-8">
            <h3 className="text-xl font-bold text-[#ffd700] mb-6 flex items-center gap-2">
              <Award size={20} /> جوایز
            </h3>

            <h4 className="text-white font-bold mb-4">🏆 بخش اصلی (داوری ترکیبی: انسان + هوش مصنوعی)</h4>
            <div className="grid md:grid-cols-2 gap-3 mb-6">
              {[
                { title: 'بهترین فیلم داستانی', prize: '۱۰۰۰ دلار + تندیس' },
                { title: 'بهترین انیمیشن / هنر تجربی', prize: '۱۰۰۰ دلار + تندیس' },
                { title: 'بهترین موسیقی متن (AI)', prize: '۵۰۰ دلار' },
                { title: 'بهترین پوستر (AI)', prize: '۵۰۰ دلار' },
                { title: 'منتخب تماشاگران', prize: '۵۰۰ دلار' },
              ].map((award, i) => (
                <div key={i} className="bg-black/40 p-3 rounded-lg flex justify-between items-center">
                  <span className="text-white/80 text-sm">{award.title}</span>
                  <span className="text-[#ffd700] font-bold text-sm">{award.prize}</span>
                </div>
              ))}
            </div>

            <h4 className="text-white font-bold mb-4">💎 بخش ویژه</h4>
            <div className="space-y-3">
              <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-blue-300 font-bold">🌊 جایزه ویژه «آبِ زندگی»</span>
                  <span className="text-[#ffd700] font-bold">۵۰۰ دلار</span>
                </div>
                <p className="text-white/60 text-sm">به اثری که بیانگر بحران عظیم آب بوده و توجه همگان را به این معضل حیاتی جلب کند.</p>
              </div>
              <div className="bg-yellow-900/20 border border-yellow-500/30 p-4 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-yellow-300 font-bold">⌨️ پرامت طلایی (Golden Prompt)</span>
                  <span className="text-[#ffd700] font-bold">۵۰۰ دلار</span>
                </div>
                <p className="text-white/60 text-sm">جایزه‌ای برای خلاقیت الگوریتمی و مهندسی دقیق دستورات متنی. برنده این بخش مستقلاً توسط داور هوش مصنوعی انتخاب می‌شود.</p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6 md:p-8">
            <h3 className="text-xl font-bold text-[#ffd700] mb-6 flex items-center gap-2">
              <Calendar size={20} /> تقویم و ثبت‌نام
            </h3>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-black/30 p-4 rounded-lg text-center">
                <p className="text-white/50 text-xs mb-1">شروع ثبت‌نام</p>
                <p className="text-white font-bold">۱۵ آذر ۱۴۰۴</p>
                <p className="text-white/50 text-xs mt-1">Dec 6, 2025</p>
              </div>
              <div className="bg-[#b8860b]/20 p-4 rounded-lg text-center border border-[#b8860b]/40">
                <p className="text-[#ffd700]/70 text-xs mb-1">مهلت ارسال</p>
                <p className="text-[#ffd700] font-bold text-lg">۱۵ بهمن ۱۴۰۴</p>
                <p className="text-[#ffd700]/70 text-xs mt-1">Feb 4, 2026</p>
              </div>
              <div className="bg-black/30 p-4 rounded-lg text-center">
                <p className="text-white/50 text-xs mb-1">اختتامیه</p>
                <p className="text-white font-bold">۱۵ اسفند ۱۴۰۴</p>
                <p className="text-white/50 text-xs mt-1">Mar 6, 2026</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 text-white/60 text-sm">
              <Globe size={16} />
              <span>www.sodayekhiyal.ir</span>
            </div>
          </div>

          <motion.button
            onClick={onRegisterClick}
            className="w-full bg-gradient-to-r from-[#b8860b] via-[#ffd700] to-[#b8860b] text-black font-black text-lg py-5 rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(218,165,32,0.5)]"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            ورود به فرم ثبت‌نام
          </motion.button>

          <div className="h-16"></div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CallForEntries;