import React, { useEffect, useState, useRef, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SiteContent, DEFAULT_CONTENT } from './types';
import { getSiteContent, updateSiteContent } from './services/firebase';
import VideoHero from './components/VideoHero';
import MenuLight from './components/MenuLight';
import Loading from './components/Loading';
import SpecialEvent from './components/SpecialEvent';
import Atmosphere from './components/Atmosphere';
import { Lock, ChevronRight } from 'lucide-react';

// Lazy load کامپوننت‌های سنگین - فقط وقتی نیاز شد لود میشن
const AdminPanel = lazy(() => import('./components/AdminPanel'));
const WorksGallery = lazy(() => import('./components/WorksGallery'));
const RegistrationForm = lazy(() => import('./components/RegistrationForm'));
const ArticlesOverlay = lazy(() => import('./components/ArticlesOverlay'));
const EventsOverlay = lazy(() => import('./components/EventsOverlay'));
const ContactForm = lazy(() => import('./components/ContactForm'));
const AboutOverlay = lazy(() => import('./components/AboutOverlay'));
const CallForEntries = lazy(() => import('./components/CallForEntries'));

const App: React.FC = () => {
  // لاگ جهت اطمینان از نسخه صحیح
  console.log("APP VERSION: LIARA FINAL - SECURE AUTH");

  const [content, setContent] = useState<SiteContent | null>(null);
  const [animationFinished, setAnimationFinished] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [videoEnded, setVideoEnded] = useState(false);
  
  // مدیریت مودال‌ها
  const [showAdmin, setShowAdmin] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false); // مودال رمز عبور
  const [adminPass, setAdminPass] = useState('');
  
  const [showRegistration, setShowRegistration] = useState(false);
  const [showArticles, setShowArticles] = useState(false);
  const [showEventsList, setShowEventsList] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showWorksGallery, setShowWorksGallery] = useState(false);
  const [showCallForEntries, setShowCallForEntries] = useState(false);
  const [showSpecialEvent, setShowSpecialEvent] = useState(true);

  const [language, setLanguage] = useState<'fa' | 'en'>('fa');
  
  // متغیرهای لوکال برای پیش‌نمایش آنی آپلودها
  const [localVideoUrl, setLocalVideoUrl] = useState<string>("");
  const [localLogoUrl, setLocalLogoUrl] = useState<string>("");

  // شمارنده کلیک لوگو
  const [logoClickCount, setLogoClickCount] = useState(0);

  useEffect(() => {
    // ۱. خواندن سریع از کش مرورگر
    const cached = localStorage.getItem('siteContent');
    if (cached) {
      try {
        setContent(JSON.parse(cached));
      } catch (e) {
        setContent(DEFAULT_CONTENT);
      }
    } else {
      setContent(DEFAULT_CONTENT);
    }

    // ۲. خواندن تازه از سرور لیارا
    const fetchData = async () => {
      try {
        const data = await getSiteContent();
        setContent(data);
      } catch (error) { 
        console.log("Using cached data due to connection issue");
      }
    };
    fetchData();
  }, []);

  useEffect(() => { 
    // لودر منتظر انیمیشن میمونه
    if (animationFinished) {
      setTimeout(() => setIsLoading(false), 100); 
    }
  }, [animationFinished]);

  // ریست شدن شمارنده کلیک لوگو بعد از ۲ ثانیه
  useEffect(() => {
    if (logoClickCount > 0 && logoClickCount < 5) {
      const timer = setTimeout(() => setLogoClickCount(0), 2000);
      return () => clearTimeout(timer);
    }
  }, [logoClickCount]);

  const handleUpdateContent = async (newContent: SiteContent) => { 
    await updateSiteContent(newContent); 
    setContent(newContent); 
  };

  const handleLocalUpload = (type: 'video' | 'logo' | 'work', file: File) => {
      const url = URL.createObjectURL(file);
      if (type === 'video') { 
        setLocalVideoUrl(url); 
        setVideoEnded(false); 
        setVideoLoaded(true); 
      } else if (type === 'logo') { 
        setLocalLogoUrl(url); 
      }
  };

  const toggleLanguage = () => setLanguage(prev => prev === 'fa' ? 'en' : 'fa');

  const handleMenuItemClick = (link: string) => {
    const lowerLink = link.toLowerCase();
    if (lowerLink.includes('works') || lowerLink.includes('gallery')) setShowWorksGallery(true);
    else if (lowerLink.includes('blog') || lowerLink.includes('articles')) setShowArticles(true);
    else if (lowerLink.includes('event') || lowerLink.includes('fest')) setShowEventsList(true);
    else if (lowerLink.includes('contact') || lowerLink.includes('تماس')) setShowContact(true);
    else if (lowerLink.includes('about') || lowerLink.includes('درباره')) setShowAbout(true);
    else if (lowerLink.includes('dark') || lowerLink.includes('room')) { 
      if (content?.enableDarkRoom || showAdmin) setShowAuthModal(true); 
    }
  };

  // لاجیک هوشمند کلیک لوگو
  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation(); 

    const newCount = logoClickCount + 1;
    setLogoClickCount(newCount);

    if (newCount >= 5) {
        // ۵ بار کلیک: درخواست رمز
        setShowAuthModal(true);
        setShowAbout(false);
        setLogoClickCount(0);
    } else {
        // ۱ بار کلیک: نمایش درباره ما
        setShowAbout(true);
    }
  };

  // بررسی رمز عبور ادمین
  const checkPassword = (e?: React.FormEvent) => {
      if(e) e.preventDefault();
      if (adminPass === 'hope') {
          setShowAdmin(true);
          setShowAuthModal(false);
          setAdminPass('');
      } else {
          alert("رمز عبور اشتباه است / Incorrect Password");
      }
  };

  const effectiveVideoUrl = localVideoUrl || content?.videoUrl || "";
  const effectiveLogoUrl = localLogoUrl || content?.logoUrl || "";
  const logoScale = content?.logoSize || 3;
  const logoWidth = `${logoScale}rem`; 

  const visibleMenuItems = content?.menuItems.filter(item => {
      const isDarkRoom = item.link.toLowerCase().includes('dark') || item.title.en.toLowerCase().includes('dark') || item.title.fa.includes('تاریک'); 
      if (isDarkRoom) return content.enableDarkRoom; 
      return true; 
  }) || [];

  return (
    <div className={`relative w-full h-screen overflow-hidden bg-black font-sans text-white select-none ${language === 'fa' ? 'font-vazir' : 'font-sans'}`} onClick={() => setVideoEnded(true)}>

      {/* لایه اتمسفر و ذرات معلق */}
      <Atmosphere />

      <AnimatePresence>{isLoading && <Loading onComplete={() => setAnimationFinished(true)} customImage={content?.loaderUrl} />}</AnimatePresence>

      <Suspense fallback={null}>
        <AnimatePresence>{showRegistration && <RegistrationForm onClose={() => setShowRegistration(false)} />}</AnimatePresence>
        <AnimatePresence>{showContact && <ContactForm language={language} onClose={() => setShowContact(false)} />}</AnimatePresence>
        <AnimatePresence>{showAbout && content?.about && <AboutOverlay data={content.about} language={language} onClose={() => setShowAbout(false)} />}</AnimatePresence>
        <AnimatePresence>{showArticles && content && <ArticlesOverlay articles={content.articles || []} onClose={() => setShowArticles(false)} />}</AnimatePresence>
        <AnimatePresence>{showEventsList && content && <EventsOverlay events={content.eventsList || []} onClose={() => setShowEventsList(false)} />}</AnimatePresence>
        
        {/* گالری و فراخوان */}
        <AnimatePresence>{showWorksGallery && <WorksGallery works={content?.works || []} language={language} onClose={() => setShowWorksGallery(false)} />}</AnimatePresence>
        <AnimatePresence>{showCallForEntries && <CallForEntries posterUrl={content?.specialEvent?.posterUrl} onClose={() => setShowCallForEntries(false)} onRegisterClick={() => { setShowCallForEntries(false); setShowRegistration(true); }} />}</AnimatePresence>
        
        {/* پنل مدیریت */}
        <AnimatePresence>{showAdmin && <AdminPanel content={content!} onSave={handleUpdateContent} onClose={() => setShowAdmin(false)} onLocalUpload={handleLocalUpload} />}</AnimatePresence>
      </Suspense>

      {/* مودال امنیتی رمز عبور */}
      {showAuthModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-[#0a0a0a] border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-sm text-center relative overflow-hidden"
              >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-600 to-transparent"></div>
                  <Lock size={40} className="mx-auto text-yellow-600 mb-6 opacity-80" />
                  
                  <h3 className="text-white font-bold text-lg mb-2">منطقه ممنوعه</h3>
                  <p className="text-xs text-gray-500 mb-6">ورود فقط برای مدیران سایت امکان‌پذیر است.</p>
                  
                  <form onSubmit={checkPassword} className="space-y-4">
                    <input 
                        type="password" 
                        value={adminPass} 
                        onChange={e => setAdminPass(e.target.value)} 
                        className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-white text-center tracking-[0.5em] outline-none focus:border-yellow-600 transition placeholder:tracking-normal placeholder:text-xs"
                        placeholder="رمز عبور"
                        autoFocus
                    />
                    <div className="flex gap-2">
                        <button type="button" onClick={() => {setShowAuthModal(false); setAdminPass('');}} className="flex-1 py-3 text-xs text-gray-400 hover:text-white transition rounded-lg border border-white/10 hover:bg-white/5">بازگشت</button>
                        <button type="submit" className="flex-1 bg-white text-black text-xs font-bold py-3 rounded-lg hover:bg-yellow-500 hover:text-black transition flex items-center justify-center gap-2">
                            ورود <ChevronRight size={14} />
                        </button>
                    </div>
                  </form>
              </motion.div>
          </div>
      )}

      {content && (
        <>
            <VideoHero videoUrl={effectiveVideoUrl} posterUrl={content.posterUrl} onVideoEnd={() => setVideoEnded(true)} isEditing={showAdmin} onVideoReady={() => setVideoLoaded(true)} />
            
            {!isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>

                    {/* لوگو با قابلیت کلیک دوگانه */}
                    <motion.div 
                        className="absolute top-4 right-4 md:top-8 md:right-8 z-40 opacity-50 hover:opacity-100 transition-opacity duration-500 cursor-pointer flex items-center gap-2 select-none"
                        style={{ touchAction: 'manipulation' }}
                        onClick={handleLogoClick}
                    >
                        {effectiveLogoUrl ? 
                            <img src={effectiveLogoUrl} alt="Logo" style={{ width: logoWidth, height: logoWidth }} className="object-contain invert brightness-0 saturate-100 pointer-events-none" /> 
                            : 
                            <div className="flex flex-col items-center justify-center w-12 h-12 border border-white/20 rounded-full bg-black/50 backdrop-blur-sm shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                                <span className="text-[10px] font-bold tracking-widest">SK</span>
                            </div>
                        }
                    </motion.div>

                    {/* دکمه تغییر زبان */}
                    <motion.button 
                        className="absolute bottom-6 right-6 z-40 text-[9px] tracking-[0.2em] opacity-30 hover:opacity-80 transition-all duration-300 font-bold bg-black/40 px-3 py-1.5 rounded-full border border-white/5 hover:border-white/20" 
                        onClick={(e) => { e.stopPropagation(); toggleLanguage(); }}
                    >
                        {language === 'fa' ? 'ENGLISH' : 'فارسی'}
                    </motion.button>
                    
                    {/* بنر رویداد ویژه */}
                    <AnimatePresence>
                        {(videoEnded || showAdmin) && showSpecialEvent && content.specialEvent && (
                            <SpecialEvent 
                                event={content.specialEvent} 
                                language={language} 
                                onClose={() => setShowSpecialEvent(false)} 
                                onRegisterClick={() => setShowRegistration(true)} 
                                onCallForEntriesClick={() => setShowCallForEntries(true)} 
                                systemPrompt={content.aiSystemPrompt}
                            />
                        )}
                    </AnimatePresence>
                    
                    {/* منوی اصلی */}
                    <MenuLight items={visibleMenuItems} visible={videoEnded || showAdmin} language={language} onItemClick={handleMenuItemClick} />
                    
                </motion.div>
            )}
        </>
      )}
    </div>
  );
};

export default App;
