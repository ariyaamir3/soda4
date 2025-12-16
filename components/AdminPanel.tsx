import React, { useState, useEffect } from 'react';
import { SiteContent, ContactMessage, FullRegistrationData, LightColor, BlinkSpeed, ChatMode, DEFAULT_CONTENT, AiConfig } from '../types';
import { getRegistrations, getContactMessages, uploadFile } from '../services/firebase';
import { 
  X, Save, Edit2, Menu, Database, Loader2, Download, Users, Mail, Trash2, 
  Sparkles, Lock, Briefcase, FileText, Info, Eye, Film, Plus, Upload, 
  CheckCircle2, AlertCircle, RefreshCw, Calendar, Settings, Ticket, MonitorPlay
} from 'lucide-react';

interface AdminPanelProps {
  content: SiteContent;
  onSave: (newContent: SiteContent) => Promise<void>;
  onClose: () => void;
  onLocalUpload: (type: any, file: File) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ content, onSave, onClose }) => {
  // --- مدیریت لاگین امنیتی ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

  // --- استیت‌های داده ---
  // استفاده از تابع برای مقداردهی اولیه تا از خالی بودن جلوگیری شود
  const [formData, setFormData] = useState<SiteContent>(() => {
      return content && Object.keys(content).length > 0 ? content : DEFAULT_CONTENT;
  });

  const [activeTab, setActiveTab] = useState<string>('general');
  const [loadingData, setLoadingData] = useState(false);
  
  // داده‌های دریافتی از سرور
  const [registrations, setRegistrations] = useState<FullRegistrationData[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  
  // مدیریت وضعیت‌های UI
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [aiConnectionStatus, setAiConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [selectedReg, setSelectedReg] = useState<FullRegistrationData | null>(null);

  // اگر پراپ content آپدیت شد، فرم را سینک کن (مگر اینکه کاربر در حال تایپ باشد)
  useEffect(() => {
    if (content && Object.keys(content).length > 0 && !saveStatus.includes('success')) {
        // فقط اگر فرم خالی است یا تازه لود شده آپدیت کن
        setFormData(prev => ({...DEFAULT_CONTENT, ...prev, ...content}));
    }
  }, [content]);

  // تابع کمکی برای نمایش امن مقادیر (جلوگیری از ارور آبجکت)
  const safeVal = (val: any) => {
      if (val === undefined || val === null) return '';
      if (typeof val === 'object') return val.fa || val.en || '';
      return val;
  };

  // لود کردن داده‌های سنگین فقط وقتی تب مربوطه باز شود
  useEffect(() => {
    if (activeTab === 'registrations') fetchData('regs');
    if (activeTab === 'inbox') fetchData('msgs');
    if (activeTab === 'ai') checkAiConnection();
  }, [activeTab]);

  const fetchData = async (type: 'regs' | 'msgs') => {
    setLoadingData(true);
    try {
      if (type === 'regs') {
          const data = await getRegistrations();
          setRegistrations(data);
      } else {
          const data = await getContactMessages();
          setMessages(data);
      }
    } catch (e) { console.error("Error fetching data:", e); }
    setLoadingData(false);
  };

  const checkAiConnection = () => {
      setAiConnectionStatus('checking');
      // شبیه‌سازی چک کردن اتصال (در آینده می‌تواند واقعی شود)
      setTimeout(() => { setAiConnectionStatus('connected'); }, 1500);
  };

  const handleLogin = (e: React.FormEvent) => {
      e.preventDefault();
      if (passwordInput === 'hope') setIsAuthenticated(true);
      else alert('رمز عبور اشتباه است!');
  };

  // --- سیستم آپلود یکپارچه ---
  const handleFileUpload = async (file: File, fieldKey: string, index?: number) => {
    const uniqueKey = fieldKey + (index !== undefined ? index : '');
    setUploadingField(uniqueKey);
    
    try {
      const url = await uploadFile(file);
      const newData = { ...formData };

      if (fieldKey === 'logo') newData.logoUrl = url;
      else if (fieldKey === 'video') newData.videoUrl = url;
      else if (fieldKey === 'poster') newData.posterUrl = url;
      else if (fieldKey === 'loader') newData.loaderUrl = url;
      else if (fieldKey === 'specialPoster') {
          if (!newData.specialEvent) newData.specialEvent = {} as any;
          newData.specialEvent!.posterUrl = url;
      }
      else if (fieldKey === 'article' && typeof index === 'number') {
          if (!newData.articles) newData.articles = [];
          newData.articles[index].coverUrl = url;
      }
      else if (fieldKey === 'work' && typeof index === 'number') {
          if (!newData.works) newData.works = [];
          newData.works[index].imageUrl = url;
      }
      else if (fieldKey === 'event' && typeof index === 'number') {
          if (!newData.eventsList) newData.eventsList = [];
          newData.eventsList[index].imageUrl = url;
      }

      setFormData(newData);
    } catch (e) { 
        alert("آپلود ناموفق بود. لطفاً اتصال اینترنت را بررسی کنید."); 
    }
    setUploadingField(null);
  };

  const handleSubmit = async () => {
    try {
        await onSave(formData);
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (e) {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  // --- توابع افزودن آیتم جدید ---
  const addArticle = () => setFormData({ ...formData, articles: [...(formData.articles || []), { id: Date.now().toString(), title: {fa:'عنوان جدید',en:'New'}, summary: {fa:'',en:''}, content: {fa:'',en:''}, author: {fa:'نویسنده',en:'Author'}, date: '1404', coverUrl: '', tags: '' }] });
  
  const addWork = () => setFormData({ ...formData, works: [...(formData.works || []), { id: Date.now().toString(), title: {fa:'اثر جدید',en:'Work'}, year: '2025', imageUrl: '', link: '', description: '' }] });
  
  const addEvent = () => setFormData({ ...formData, eventsList: [...(formData.eventsList || []), { id: Date.now().toString(), title: 'رویداد جدید', date: '', description: '', imageUrl: '', isActive: true }] });
  
  const addMenuItem = () => setFormData({ ...formData, menuItems: [...(formData.menuItems || []), { id: Date.now().toString(), title: {fa:'منو',en:'Menu'}, link: '#', description: {fa:'',en:''} }] });

  // خروجی اکسل
  const exportToCSV = () => {
      if (!registrations || registrations.length === 0) return alert("داده‌ای برای خروجی وجود ندارد");
      
      const headers = ["Tracking ID", "Film Title", "Director", "Mobile", "Email", "Section", "Date", "Link"];
      const rows = registrations.map(r => [
          r.trackingId || r.id, 
          safeVal(r.filmTitleFa), 
          safeVal(r.directorNameFa), 
          safeVal(r.phone), 
          safeVal(r.email), 
          safeVal(r.section), 
          safeVal(r.submittedAt), 
          safeVal(r.filmLink)
      ]);
      
      const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "registrations.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  // اگر لاگین نکرده باشد
  if (!isAuthenticated) {
      return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4">
              <div className="bg-[#111] p-8 rounded-xl border border-white/10 text-center w-full max-w-sm shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 to-purple-600"></div>
                  <Lock size={48} className="text-yellow-500 mx-auto mb-6 opacity-80"/>
                  <h2 className="text-white font-bold text-xl mb-6 tracking-wide">پنل مدیریت</h2>
                  <form onSubmit={handleLogin} className="space-y-4">
                      <input 
                        type="password" 
                        value={passwordInput} 
                        onChange={e => setPasswordInput(e.target.value)} 
                        className="w-full bg-black/50 border border-white/20 p-3 rounded-lg text-white text-center tracking-[5px] outline-none focus:border-yellow-500 transition placeholder:tracking-normal text-lg"
                        placeholder="رمز عبور"
                        autoFocus
                      />
                      <button type="submit" className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-gray-200 transition shadow-lg">ورود</button>
                  </form>
                  <button onClick={onClose} className="mt-4 text-xs text-gray-500 hover:text-white transition">بازگشت به سایت</button>
              </div>
          </div>
      );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 font-vazir" dir="rtl">
      
      {/* --- مودال جزئیات ثبت‌نام --- */}
      {selectedReg && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4" onClick={() => setSelectedReg(null)}>
              <div className="bg-[#111] border border-white/20 w-full max-w-3xl h-[85vh] rounded-xl overflow-y-auto p-8 relative shadow-2xl" onClick={e => e.stopPropagation()}>
                  <button onClick={() => setSelectedReg(null)} className="absolute top-6 left-6 text-white/50 hover:text-red-500"><X size={24}/></button>
                  
                  <div className="flex items-center gap-4 mb-6 border-b border-white/10 pb-4">
                      <div className="bg-blue-600/20 p-3 rounded-full text-blue-400"><Users size={24}/></div>
                      <div>
                          <h3 className="text-2xl font-bold text-white">{safeVal(selectedReg.filmTitleFa)}</h3>
                          <p className="text-xs text-yellow-500 font-mono mt-1">ID: {selectedReg.trackingId || selectedReg.id}</p>
                      </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-300">
                      <div><span className="text-white/40 block text-xs">کارگردان:</span> {safeVal(selectedReg.directorNameFa)}</div>
                      <div><span className="text-white/40 block text-xs">موبایل:</span> {safeVal(selectedReg.phone)}</div>
                      <div><span className="text-white/40 block text-xs">ایمیل:</span> {safeVal(selectedReg.email)}</div>
                      <div><span className="text-white/40 block text-xs">بخش:</span> {safeVal(selectedReg.section)}</div>
                      
                      <div className="col-span-full bg-white/5 p-4 rounded"><span className="text-white/40 block text-xs mb-2">خلاصه داستان:</span> {safeVal(selectedReg.synopsis || selectedReg.logline)}</div>
                      
                      <div className="col-span-full flex gap-2 pt-4 border-t border-white/5">
                          {selectedReg.filmLink && <a href={selectedReg.filmLink} target="_blank" rel="noopener noreferrer" className="flex-1 bg-blue-600 text-white py-3 rounded text-center text-xs hover:bg-blue-500 transition">دانلود فیلم</a>}
                          {selectedReg.posterLink && <a href={selectedReg.posterLink} target="_blank" rel="noopener noreferrer" className="flex-1 bg-gray-700 text-white py-3 rounded text-center text-xs hover:bg-gray-600 transition">مشاهده پوستر</a>}
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* --- بدنه اصلی پنل --- */}
      <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-7xl h-[90vh] flex flex-col rounded-xl overflow-hidden shadow-2xl">
        
        {/* هدر پنل */}
        <div className="flex justify-between items-center p-5 border-b border-white/5 bg-[#0a0a0a]">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-light text-white flex items-center gap-3">
                <Edit2 size={20} className="text-yellow-500" /> 
                <span className="font-bold tracking-wide">پنل مدیریت</span>
            </h2>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] transition-colors ${saveStatus === 'success' ? 'bg-green-500/20 text-green-400' : saveStatus === 'error' ? 'bg-red-500/20 text-red-400' : 'bg-white/5 text-gray-400'}`}>
                <div className={`w-2 h-2 rounded-full ${saveStatus === 'success' ? 'bg-green-500' : saveStatus === 'error' ? 'bg-red-500' : 'bg-gray-500'}`}></div>
                {saveStatus === 'success' ? 'ذخیره شد' : saveStatus === 'error' ? 'خطا در ذخیره' : 'آماده'}
            </div>
          </div>
          <button onClick={onClose}><X className="text-white hover:text-red-500 transition p-2 hover:bg-white/5 rounded-full"/></button>
        </div>

        <div className="flex flex-1 overflow-hidden">
            {/* سایدبار */}
            <div className="w-64 bg-black/50 border-l border-white/5 flex flex-col p-4 gap-2 overflow-y-auto shrink-0 custom-scrollbar">
                <div className="text-[10px] text-gray-500 uppercase tracking-widest px-2 mb-1 mt-2">تنظیمات</div>
                <TabBtn active={activeTab==='general'} onClick={()=>setActiveTab('general')} icon={Settings} label="عمومی & لودر" />
                <TabBtn active={activeTab==='ai'} onClick={()=>setActiveTab('ai')} icon={Sparkles} label="هوش مصنوعی" />
                <TabBtn active={activeTab==='special_event'} onClick={()=>setActiveTab('special_event')} icon={Ticket} label="بنر و فراخوان" />
                
                <div className="h-px bg-white/5 my-2 mx-2"></div>
                <div className="text-[10px] text-gray-500 uppercase tracking-widest px-2 mb-1">داده‌ها</div>
                <TabBtn active={activeTab==='registrations'} onClick={()=>setActiveTab('registrations')} icon={Users} label="ثبت‌نام‌ها" count={registrations.length} />
                <TabBtn active={activeTab==='inbox'} onClick={()=>setActiveTab('inbox')} icon={Mail} label="صندوق پیام" count={messages.length} />
                
                <div className="h-px bg-white/5 my-2 mx-2"></div>
                <div className="text-[10px] text-gray-500 uppercase tracking-widest px-2 mb-1">محتوا</div>
                <TabBtn active={activeTab==='events'} onClick={()=>setActiveTab('events')} icon={Calendar} label="رویدادها" />
                <TabBtn active={activeTab==='works'} onClick={()=>setActiveTab('works')} icon={Briefcase} label="گالری آثار" />
                <TabBtn active={activeTab==='articles'} onClick={()=>setActiveTab('articles')} icon={FileText} label="مقالات" />
                <TabBtn active={activeTab==='menu'} onClick={()=>setActiveTab('menu')} icon={Menu} label="منو سایت" />
                <TabBtn active={activeTab==='about'} onClick={()=>setActiveTab('about')} icon={Info} label="درباره ما" />
            </div>
            
            {/* محتوای اصلی */}
            <div className="flex-1 p-8 overflow-y-auto bg-[#0f0f0f] text-white custom-scrollbar">
                
                {/* تب عمومی */}
                {activeTab === 'general' && (
                    <div className="space-y-8 max-w-3xl animate-in fade-in">
                        <div className="bg-white/5 border border-white/10 p-6 rounded-xl space-y-6">
                            <h4 className="text-white/60 text-sm font-bold border-b border-white/10 pb-2">تنظیمات پایه</h4>
                            
                            <InputGroup label="لینک ویدیو پس‌زمینه" value={formData.videoUrl} onChange={v => setFormData({...formData, videoUrl: v})} uploadKey="video" onUpload={handleFileUpload} uploading={uploadingField === 'video'} />
                            <InputGroup label="لینک لوگو (png)" value={formData.logoUrl} onChange={v => setFormData({...formData, logoUrl: v})} uploadKey="logo" onUpload={handleFileUpload} uploading={uploadingField === 'logo'} />
                            <InputGroup label="لینک لودر (اسب)" value={formData.loaderUrl} onChange={v => setFormData({...formData, loaderUrl: v})} uploadKey="loader" onUpload={handleFileUpload} uploading={uploadingField === 'loader'} />
                            
                            <div className="flex items-center gap-4 bg-black/30 p-3 rounded border border-white/5">
                                <label className="text-xs text-gray-400 whitespace-nowrap">سایز لوگو</label>
                                <input type="range" min="1" max="10" step="0.5" value={formData.logoSize || 3} onChange={e => setFormData({...formData, logoSize: +e.target.value})} className="flex-1 accent-yellow-500" />
                                <span className="text-xs font-mono w-8 text-center">{formData.logoSize}</span>
                            </div>

                            <InputGroup label="نام شرکت (فارسی)" value={formData.companyName?.fa} onChange={v => setFormData({...formData, companyName: {...(formData.companyName || {}), fa: v, en: formData.companyName?.en || ''}})} />
                        </div>

                        <div className="p-4 bg-purple-900/10 border border-purple-500/20 rounded-xl">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" checked={formData.enableDarkRoom} onChange={e => setFormData({...formData, enableDarkRoom: e.target.checked})} className="w-5 h-5 accent-purple-500 rounded" />
                                <span className="font-bold text-purple-200">فعال‌سازی اتاق تاریک (آیکون چشم)</span>
                            </label>
                        </div>
                    </div>
                )}

                {/* تب هوش مصنوعی */}
                {activeTab === 'ai' && (
                    <div className="space-y-6 max-w-3xl animate-in fade-in">
                        <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/10">
                            <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${aiConnectionStatus === 'connected' ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-red-500'}`}></div>
                                <div>
                                    <h3 className="font-bold text-white text-sm">وضعیت سرور هوش مصنوعی</h3>
                                    <p className="text-[10px] text-gray-400">{aiConnectionStatus === 'connected' ? 'متصل به OpenRouter' : 'در حال بررسی...'}</p>
                                </div>
                            </div>
                            <button onClick={checkAiConnection} className="bg-white/10 hover:bg-white/20 px-3 py-1 rounded text-xs flex items-center gap-2"><RefreshCw size={12}/> تست مجدد</button>
                        </div>

                        <div className="bg-black/30 p-6 rounded-xl border border-white/10 space-y-4">
                            <InputGroup label="نام ربات" value={formData.aiConfig?.name || 'دستیار'} onChange={v => setFormData({...formData, aiConfig: {...(formData.aiConfig || {}), name: v} as AiConfig})} />
                            
                            <div>
                                <label className="block text-[10px] text-gray-500 mb-1">مدل زبانی</label>
                                <select value={formData.aiConfig?.model} onChange={e => setFormData({...formData, aiConfig: {...(formData.aiConfig || {}), model: e.target.value} as AiConfig})} className="w-full bg-black/50 border border-white/20 p-2 rounded text-xs text-white outline-none">
                                    <option value="google/gemini-2.0-flash-exp:free">Gemini Flash (سریع)</option>
                                    <option value="meta-llama/llama-3.3-70b-instruct:free">Llama 3 (دقیق)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] text-gray-500 mb-1">دستورالعمل سیستم (System Prompt)</label>
                                <textarea 
                                    value={formData.aiConfig?.systemPrompt || ''} 
                                    onChange={e => setFormData({...formData, aiConfig: {...(formData.aiConfig || {}), systemPrompt: e.target.value} as AiConfig})} 
                                    className="w-full bg-black/50 border border-white/20 p-3 rounded text-sm text-white h-32 leading-6 outline-none" 
                                    placeholder="تو یک دستیار سینمایی هستی..." 
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* تب بنر و فراخوان */}
                {activeTab === 'special_event' && (
                    <div className="space-y-6 max-w-3xl animate-in fade-in">
                        <div className="flex items-center gap-3 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                            <input type="checkbox" checked={formData.specialEvent?.isActive} onChange={e => setFormData({...formData, specialEvent: {...formData.specialEvent!, isActive: e.target.checked}})} className="w-5 h-5 accent-yellow-500 rounded" />
                            <span className="font-bold text-yellow-500">فعال‌سازی بنر جشنواره</span>
                        </div>

                        <div className="grid grid-cols-2 gap-6 bg-white/5 p-6 rounded-xl border border-white/10">
                            <div>
                                <label className="text-xs text-gray-400 block mb-2">استایل بلیت</label>
                                <select value={formData.specialEvent?.ticketStyle || 'cinema'} onChange={e => setFormData({...formData, specialEvent: {...formData.specialEvent!, ticketStyle: e.target.value as any}})} className="w-full bg-black border border-white/20 p-2 rounded text-xs">
                                    <option value="cinema">سینمایی (سوراخ‌دار)</option>
                                    <option value="modern">مدرن (ساده)</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 block mb-2">موقعیت</label>
                                <select value={formData.specialEvent?.position || 'top-right'} onChange={e => setFormData({...formData, specialEvent: {...formData.specialEvent!, position: e.target.value as any}})} className="w-full bg-black border border-white/20 p-2 rounded text-xs">
                                    <option value="top-right">بالا - راست</option>
                                    <option value="top-left">بالا - چپ</option>
                                    <option value="bottom-right">پایین - راست</option>
                                    <option value="bottom-left">پایین - چپ</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 block mb-2">رنگ چراغ</label>
                                <select value={formData.specialEvent?.lightColor} onChange={e => setFormData({...formData, specialEvent: {...formData.specialEvent!, lightColor: e.target.value as any}})} className="w-full bg-black border border-white/20 p-2 rounded text-xs">
                                    <option value="green">سبز</option><option value="yellow">زرد</option><option value="red">قرمز</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 block mb-2">سرعت چشمک</label>
                                <select value={formData.specialEvent?.blinkSpeed} onChange={e => setFormData({...formData, specialEvent: {...formData.specialEvent!, blinkSpeed: e.target.value as any}})} className="w-full bg-black border border-white/20 p-2 rounded text-xs">
                                    <option value="slow">کند</option><option value="fast">تند</option><option value="none">ثابت</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <InputGroup label="عنوان بنر" value={safeVal(formData.specialEvent?.title?.fa)} onChange={v => setFormData({...formData, specialEvent: {...formData.specialEvent!, title: {...formData.specialEvent!.title, fa: v}}})} />
                            <InputGroup label="توضیحات کوتاه" value={safeVal(formData.specialEvent?.description?.fa)} onChange={v => setFormData({...formData, specialEvent: {...formData.specialEvent!, description: {...formData.specialEvent!.description, fa: v}}})} />
                            <InputGroup label="پوستر فراخوان" value={formData.specialEvent?.posterUrl} onChange={v => setFormData({...formData, specialEvent: {...formData.specialEvent!, posterUrl: v}})} uploadKey="specialPoster" onUpload={handleFileUpload} uploading={uploadingField === 'specialPoster'} />
                            {formData.specialEvent?.posterUrl && <img src={formData.specialEvent.posterUrl} className="h-20 rounded border border-white/20 object-cover mt-2" />}
                        </div>
                    </div>
                )}

                {/* --- تب منو (اصلاح شده) --- */}
                {activeTab === 'menu' && (
                    <div className="space-y-6 animate-in fade-in">
                        <button onClick={addMenuItem} className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition shadow-lg">+ افزودن آیتم منو</button>
                        
                        {(!formData.menuItems || formData.menuItems.length === 0) ? (
                            <div className="text-center text-white/30 py-10 bg-white/5 rounded-xl border border-white/5">منو خالی است.</div>
                        ) : (
                            formData.menuItems.map((item, i) => (
                                <div key={i} className="flex gap-3 items-center bg-white/5 p-3 rounded-lg border border-white/5 hover:border-white/20 transition">
                                    <div className="flex-1"><label className="text-[9px] text-gray-500 block mb-1">عنوان فارسی</label><input value={safeVal(item.title?.fa)} onChange={e => {const n=[...formData.menuItems]; n[i].title = {fa: e.target.value, en: item.title?.en || ''}; setFormData({...formData, menuItems:n})}} className="w-full bg-black/30 border border-white/10 text-xs p-2 rounded text-white outline-none focus:border-white/30" /></div>
                                    <div className="flex-1"><label className="text-[9px] text-gray-500 block mb-1">Link Key</label><input value={safeVal(item.link)} onChange={e => {const n=[...formData.menuItems]; n[i].link=e.target.value; setFormData({...formData, menuItems:n})}} className="w-full bg-black/30 border border-white/10 text-xs p-2 rounded text-white font-mono outline-none focus:border-white/30" placeholder="works, contact..." dir="ltr" /></div>
                                    <button onClick={() => {const n=formData.menuItems.filter((_, idx)=>idx!==i); setFormData({...formData, menuItems:n})}} className="text-white/30 hover:text-red-500 p-2 mt-4"><Trash2 size={16}/></button>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* --- تب رویدادها --- */}
                {activeTab === 'events' && (
                    <div className="space-y-6 animate-in fade-in">
                        <button onClick={addEvent} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition">+ افزودن رویداد جدید</button>
                        
                        {(!formData.eventsList || formData.eventsList.length === 0) ? (
                            <div className="text-center text-white/30 py-10 bg-white/5 rounded-xl border border-white/5">لیست رویدادها خالی است.</div>
                        ) : (
                            formData.eventsList.map((ev, i) => (
                                <div key={ev.id || i} className="bg-white/5 p-4 rounded-xl border border-white/10 relative space-y-3">
                                    <button onClick={() => {const n=formData.eventsList!.filter((_, idx)=>idx!==i); setFormData({...formData, eventsList:n})}} className="absolute top-3 left-3 text-red-500/50 hover:text-red-500"><Trash2 size={14}/></button>
                                    <div className="grid grid-cols-2 gap-4">
                                        <InputGroup label="عنوان" value={ev.title} onChange={v => {const n=[...formData.eventsList!]; n[i].title=v; setFormData({...formData, eventsList:n})}} />
                                        <InputGroup label="تاریخ" value={ev.date} onChange={v => {const n=[...formData.eventsList!]; n[i].date=v; setFormData({...formData, eventsList:n})}} />
                                    </div>
                                    <InputGroup label="تصویر رویداد" value={ev.imageUrl} onChange={v => {const n=[...formData.eventsList!]; n[i].imageUrl=v; setFormData({...formData, eventsList:n})}} uploadKey={`event${i}`} onUpload={(f)=>handleFileUpload(f,'event',i)} uploading={uploadingField === `event${i}`} />
                                    <textarea value={ev.description} onChange={e => {const n=[...formData.eventsList!]; n[i].description=e.target.value; setFormData({...formData, eventsList:n})}} className="w-full bg-black/50 p-3 h-20 text-xs rounded border border-white/20 outline-none" placeholder="توضیحات رویداد..." />
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* --- تب آثار --- */}
                {activeTab === 'works' && (
                    <div className="space-y-6 animate-in fade-in">
                        <button onClick={addWork} className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition">+ افزودن اثر</button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {formData.works?.map((w, i) => (
                                <div key={w.id || i} className="bg-white/5 p-4 rounded-xl border border-white/10 relative space-y-2">
                                    <button onClick={() => {const n=formData.works!.filter((_, idx)=>idx!==i); setFormData({...formData, works:n})}} className="absolute top-3 left-3 text-red-500/50 hover:text-red-500"><Trash2 size={14}/></button>
                                    <InputGroup label="عنوان" value={safeVal(w.title?.fa)} onChange={v => {const n=[...formData.works!]; n[i].title={fa:v, en:''}; setFormData({...formData, works:n})}} />
                                    <InputGroup label="کاور اثر" value={w.imageUrl} onChange={v => {const n=[...formData.works!]; n[i].imageUrl=v; setFormData({...formData, works:n})}} uploadKey={`work${i}`} onUpload={(f)=>handleFileUpload(f,'work',i)} uploading={uploadingField === `work${i}`} />
                                    <InputGroup label="لینک" value={w.link} onChange={v => {const n=[...formData.works!]; n[i].link=v; setFormData({...formData, works:n})}} placeholder="https://..." />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- تب مقالات --- */}
                {activeTab === 'articles' && (
                    <div className="space-y-6 animate-in fade-in">
                        <button onClick={addArticle} className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition">+ مقاله جدید</button>
                        {formData.articles?.map((art, i) => (
                            <div key={art.id || i} className="bg-white/5 p-6 rounded-xl border border-white/10 space-y-4 relative">
                                <button onClick={() => {const n=formData.articles!.filter((_, idx)=>idx!==i); setFormData({...formData, articles:n})}} className="absolute top-4 left-4 text-red-500/50 hover:text-red-500"><Trash2 size={14}/></button>
                                <InputGroup label="عنوان مقاله" value={safeVal(art.title)} onChange={v => {const n=[...formData.articles!]; n[i].title=v; setFormData({...formData, articles:n})}} />
                                <InputGroup label="کاور مقاله" value={art.coverUrl} onChange={v => {const n=[...formData.articles!]; n[i].coverUrl=v; setFormData({...formData, articles:n})}} uploadKey={`article${i}`} onUpload={(f)=>handleFileUpload(f,'article',i)} uploading={uploadingField === `article${i}`} />
                                <textarea value={safeVal(art.content)} onChange={e => {const n=[...formData.articles!]; n[i].content=e.target.value; setFormData({...formData, articles:n})}} className="w-full bg-black/50 p-4 h-32 text-sm rounded border border-white/20 outline-none" placeholder="متن مقاله..." />
                            </div>
                        ))}
                    </div>
                )}

                {/* --- تب ثبت‌نام‌ها و پیام‌ها --- */}
                {(activeTab === 'registrations' || activeTab === 'inbox') && (
                    <div className="space-y-4 animate-in fade-in">
                        <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
                            <h3 className="font-bold text-sm">{activeTab==='registrations' ? `ثبت‌نام‌ها (${registrations.length})` : `پیام‌ها (${messages.length})`}</h3>
                            <div className="flex gap-2">
                                {activeTab==='registrations' && <button onClick={exportToCSV} className="bg-green-600 hover:bg-green-500 px-3 py-1.5 rounded text-xs flex items-center gap-1 transition"><Download size={12}/> اکسل</button>}
                                <button onClick={() => fetchData(activeTab==='registrations'?'regs':'msgs')} className="bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded text-xs flex items-center gap-1 transition"><RefreshCw size={12}/> بروزرسانی</button>
                            </div>
                        </div>
                        
                        {loadingData ? <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-white/30" size={30}/></div> : (
                            <div className="grid gap-2">
                                {activeTab==='registrations' ? registrations.map((r, i) => (
                                    <div key={i} className="bg-white/5 p-4 rounded-xl flex justify-between items-center text-xs hover:bg-white/10 cursor-pointer border border-white/5 transition" onClick={() => setSelectedReg(r)}>
                                        <div className="flex gap-4 items-center">
                                            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">{i+1}</div>
                                            <div>
                                                <span className="font-bold text-white block text-sm">{safeVal(r.filmTitleFa)}</span>
                                                <span className="text-gray-400 block mt-1">{safeVal(r.directorNameFa)}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-yellow-500 font-mono bg-yellow-500/10 px-2 py-1 rounded">{r.trackingId || r.id}</span>
                                            <Eye size={16} className="text-white/50 hover:text-white transition"/>
                                        </div>
                                    </div>
                                )) : messages.map((m, i) => (
                                    <div key={i} className="bg-white/5 p-4 rounded-xl text-xs space-y-2 border border-white/5">
                                        <div className="flex justify-between font-bold text-white"><span>{safeVal(m.name)}</span><span className="text-white/30 font-mono">{m.date}</span></div>
                                        <div className="text-blue-300">{safeVal(m.email)}</div>
                                        <p className="text-gray-300 bg-black/20 p-3 rounded leading-6">{safeVal(m.message)}</p>
                                    </div>
                                ))}
                                {registrations.length === 0 && messages.length === 0 && <div className="text-center py-10 text-white/20">لیست خالی است</div>}
                            </div>
                        )}
                    </div>
                )}
                
                {/* --- تب درباره ما --- */}
                {activeTab === 'about' && (
                    <div className="space-y-6 animate-in fade-in">
                        <textarea value={safeVal(formData.about?.manifesto?.fa)} onChange={e => setFormData({...formData, about: {...formData.about!, manifesto: {fa: e.target.value, en: ''}}})} className="w-full h-40 bg-black/50 border border-white/20 p-4 rounded-lg text-sm leading-7 outline-none" placeholder="متن بیانیه..." />
                        <InputGroup label="آدرس" value={safeVal(formData.about?.address?.fa)} onChange={v => setFormData({...formData, about: {...formData.about!, address: {fa: v, en: ''}}})} />
                    </div>
                )}
            </div>
        </div>

        {/* فوتر */}
        <div className="p-4 border-t border-white/10 flex justify-end gap-3 bg-[#0a0a0a]">
            <button onClick={onClose} className="px-5 py-2 text-xs text-gray-400 hover:text-white transition">بستن</button>
            <button 
                onClick={handleSubmit} 
                className={`px-6 py-2 font-bold rounded-lg text-xs flex items-center gap-2 transition-all duration-300 shadow-lg ${saveStatus === 'success' ? 'bg-green-600 text-white' : saveStatus === 'error' ? 'bg-red-600 text-white' : 'bg-white text-black hover:bg-gray-200'}`}
            >
                {saveStatus === 'success' ? <CheckCircle2 size={16}/> : saveStatus === 'error' ? <AlertCircle size={16}/> : <Save size={16}/>}
                {saveStatus === 'success' ? 'ذخیره شد' : saveStatus === 'error' ? 'خطا' : 'ذخیره تغییرات'}
            </button>
        </div>
      </div>
    </div>
  );
};

// --- کامپوننت‌های کمکی (Helper Components) ---
const TabBtn = ({ active, onClick, icon: Icon, label, count }: any) => (
    <button onClick={onClick} className={`flex items-center justify-between p-3 rounded-lg text-xs font-bold w-full transition-all ${active ? 'bg-white text-black shadow-lg shadow-white/10' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
        <div className="flex items-center gap-3"><Icon size={16}/> {label}</div>
        {count !== undefined && <span className={`text-[10px] px-2 py-0.5 rounded-full ${active ? 'bg-black/10 text-black' : 'bg-white/10 text-white'}`}>{count}</span>}
    </button>
);

const InputGroup = ({ label, value, onChange, placeholder, uploadKey, onUpload, uploading }: any) => (
  <div className="w-full">
      <label className="block text-[10px] text-gray-500 mb-1.5 uppercase tracking-wider">{label}</label>
      <div className="flex gap-2">
        <input type="text" value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="flex-1 bg-black/50 border-b border-white/20 py-2.5 text-white outline-none text-sm focus:border-white transition placeholder:text-white/20" />
        {onUpload && (
            <div className="relative">
                <button className="bg-white/10 p-2 rounded text-white hover:bg-white/20 transition disabled:opacity-50" disabled={uploading}>
                    {uploading ? <Loader2 size={16} className="animate-spin"/> : <Upload size={16}/>}
                </button>
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => e.target.files && onUpload(e.target.files[0])} disabled={uploading} />
            </div>
        )}
      </div>
  </div>
);

export default AdminPanel;
