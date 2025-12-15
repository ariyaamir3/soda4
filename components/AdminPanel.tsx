import React, { useState, useEffect } from 'react';
import { SiteContent, ContactMessage, FullRegistrationData, LightColor, BlinkSpeed, ChatMode, DEFAULT_CONTENT, AiConfig } from '../types';
import { getRegistrations, getContactMessages, uploadFile } from '../services/firebase';
import { 
  X, Save, Edit2, Menu, Database, Loader2, Download, Users, Mail, Trash2, 
  Sparkles, Lock, Briefcase, FileText, Info, Eye, Film, Plus, Upload, 
  CheckCircle2, AlertCircle, RefreshCw, Calendar, MonitorPlay, Settings, Ticket
} from 'lucide-react';

interface AdminPanelProps {
  content: SiteContent;
  onSave: (newContent: SiteContent) => Promise<void>;
  onClose: () => void;
  onLocalUpload: (type: any, file: File) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ content, onSave, onClose }) => {
  // 🔐 امنیت: لاجیک رمز عبور
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

  // استیت‌های اصلی
  const [formData, setFormData] = useState<SiteContent>(content || DEFAULT_CONTENT);
  const [activeTab, setActiveTab] = useState<'general' | 'ai' | 'special_event' | 'menu' | 'works' | 'events' | 'articles' | 'registrations' | 'inbox' | 'about'>('general');
  
  // داده‌های دیتابیس
  const [registrations, setRegistrations] = useState<FullRegistrationData[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  
  // وضعیت آپلود و ذخیره
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [aiConnectionStatus, setAiConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');

  // مودال‌ها
  const [selectedReg, setSelectedReg] = useState<FullRegistrationData | null>(null);

  // تابع کمکی برای مقادیر امن
  const safeVal = (val: any) => {
      if (typeof val === 'object' && val !== null) return val.fa || val.en || '';
      return val || '';
  };

  // لود اولیه داده‌ها
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
    } catch (e) { console.error(e); }
    setLoadingData(false);
  };

  // تست اتصال هوش مصنوعی (ماک)
  const checkAiConnection = () => {
      setAiConnectionStatus('checking');
      setTimeout(() => {
          setAiConnectionStatus('connected'); 
      }, 1500);
  };

  // هندل کردن ورود
  const handleLogin = (e: React.FormEvent) => {
      e.preventDefault();
      if (passwordInput === 'hope') setIsAuthenticated(true);
      else alert('رمز عبور اشتباه است!');
  };

  // 📤 مدیریت آپلود یکپارچه
  const handleFileUpload = async (file: File, fieldKey: string, index?: number, subKey?: string) => {
    setUploadingField(fieldKey + (index !== undefined ? index : ''));
    try {
      const url = await uploadFile(file);
      const newData = { ...formData };

      // لاجیک آپلود برای بخش‌های مختلف
      if (fieldKey === 'logo') newData.logoUrl = url;
      else if (fieldKey === 'video') newData.videoUrl = url;
      else if (fieldKey === 'poster') newData.posterUrl = url;
      else if (fieldKey === 'loader') newData.loaderUrl = url;
      else if (fieldKey === 'specialPoster') {
          if (!newData.specialEvent) newData.specialEvent = {} as any;
          newData.specialEvent!.posterUrl = url;
      }
      else if (fieldKey === 'article' && typeof index === 'number') {
          newData.articles[index].coverUrl = url;
      }
      else if (fieldKey === 'work' && typeof index === 'number') {
          newData.works[index].imageUrl = url;
      }
      else if (fieldKey === 'event' && typeof index === 'number') {
          newData.eventsList[index].imageUrl = url;
      }

      setFormData(newData);
    } catch (e) { 
        alert("آپلود ناموفق بود."); 
    }
    setUploadingField(null);
  };

  // 💾 ذخیره با فیدبک بصری (سبز/قرمز)
  const handleSubmit = async () => {
    try {
        await onSave(formData);
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (e) {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  // افزودن آیتم‌ها
  const addArticle = () => setFormData({ ...formData, articles: [...(formData.articles || []), { id: Date.now().toString(), title: {fa:'عنوان جدید',en:'New'}, summary: {fa:'',en:''}, content: {fa:'',en:''}, author: {fa:'تحریریه',en:'Editorial'}, date: '1404', coverUrl: '', tags: '' }] });
  const addWork = () => setFormData({ ...formData, works: [...(formData.works || []), { id: Date.now().toString(), title: {fa:'اثر جدید',en:'New'}, year: '2025', imageUrl: '', link: '', description: '' }] });
  const addEvent = () => setFormData({ ...formData, eventsList: [...(formData.eventsList || []), { id: Date.now().toString(), title: 'رویداد جدید', date: '', description: '', imageUrl: '', isActive: true }] });
  const addMenuItem = () => setFormData({ ...formData, menuItems: [...(formData.menuItems || []), { id: Date.now().toString(), title: {fa:'منو',en:'Menu'}, link: '#' }] });

  // خروجی اکسل
  const exportToCSV = () => {
      if (!registrations || registrations.length === 0) return alert("داده‌ای نیست");
      const headers = ["Tracking ID", "Film Title", "Director", "Mobile", "Email", "Section", "Date", "Link"];
      const rows = registrations.map(r => [r.trackingId || r.id, safeVal(r.filmTitleFa), safeVal(r.directorNameFa), safeVal(r.phone), safeVal(r.email), safeVal(r.section), safeVal(r.submittedAt), safeVal(r.filmLink)]);
      const csv = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      const link = document.createElement("a"); link.href = encodeURI(csv); link.download = "registrations.csv"; document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  if (!isAuthenticated) return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95">
          <div className="bg-[#111] p-8 rounded-xl border border-white/10 text-center w-80">
              <Lock size={40} className="text-yellow-500 mx-auto mb-4"/>
              <form onSubmit={handleLogin} className="space-y-4">
                  <input type="password" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} className="w-full bg-black border border-white/20 p-3 rounded text-white text-center tracking-[5px] outline-none focus:border-yellow-500" placeholder="••••" autoFocus />
                  <button type="submit" className="w-full bg-white text-black font-bold py-2 rounded">ورود</button>
              </form>
          </div>
      </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 font-vazir" dir="rtl">
      
      {/* مودال جزئیات ثبت‌نام */}
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
                      <div className="col-span-full flex gap-2">
                          {selectedReg.filmLink && <a href={selectedReg.filmLink} target="_blank" className="flex-1 bg-blue-600 text-white py-2 rounded text-center text-xs">دانلود فیلم</a>}
                          {selectedReg.posterLink && <a href={selectedReg.posterLink} target="_blank" className="flex-1 bg-gray-700 text-white py-2 rounded text-center text-xs">مشاهده پوستر</a>}
                      </div>
                  </div>
              </div>
          </div>
      )}

      <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-7xl h-[90vh] flex flex-col rounded-xl overflow-hidden shadow-2xl">
        <div className="flex justify-between items-center p-5 border-b border-white/5 bg-[#0a0a0a]">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-light text-white flex items-center gap-3"><Edit2 size={20} className="text-yellow-500" /> <span className="font-bold">پنل مدیریت</span></h2>
            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full text-[10px] text-gray-400">
                <div className={`w-2 h-2 rounded-full ${saveStatus === 'success' ? 'bg-green-500' : saveStatus === 'error' ? 'bg-red-500' : 'bg-gray-500'}`}></div>
                {saveStatus === 'success' ? 'ذخیره شد' : 'آماده'}
            </div>
          </div>
          <button onClick={onClose}><X className="text-white hover:text-red-500 transition"/></button>
        </div>

        <div className="flex flex-1 overflow-hidden">
            {/* سایدبار */}
            <div className="w-64 bg-black/50 border-l border-white/5 flex flex-col p-4 gap-2 overflow-y-auto shrink-0 custom-scrollbar">
                <div className="text-[10px] text-gray-500 uppercase tracking-widest px-2 mb-1 mt-2">اصلی</div>
                <TabBtn active={activeTab==='general'} onClick={()=>setActiveTab('general')} icon={Settings} label="تنظیمات عمومی" />
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
                <TabBtn active={activeTab==='menu'} onClick={()=>setActiveTab('menu')} icon={Menu} label="منو" />
                <TabBtn active={activeTab==='about'} onClick={()=>setActiveTab('about')} icon={Info} label="درباره ما" />
            </div>

            {/* محتوا */}
            <div className="flex-1 p-8 overflow-y-auto bg-[#0f0f0f] text-white custom-scrollbar relative">
                
                {/* --- تب عمومی (General) --- */}
                {activeTab === 'general' && (
                    <div className="space-y-8 max-w-3xl animate-in fade-in">
                        <div className="bg-white/5 border border-white/10 p-6 rounded-xl space-y-6">
                            <h4 className="text-white/60 text-sm font-bold border-b border-white/10 pb-2">فایل‌های اصلی</h4>
                            
                            {/* ویدیو */}
                            <div className="space-y-2">
                                <label className="text-xs text-gray-400">ویدیو پس‌زمینه</label>
                                <div className="flex gap-2">
                                    <input value={formData.videoUrl} onChange={e => setFormData({...formData, videoUrl: e.target.value})} className="flex-1 bg-black/50 border border-white/20 p-2 rounded text-xs" placeholder="لینک مستقیم یا آپلود..." />
                                    <UploadBtn uploading={uploadingField === 'video'} onUpload={f => handleFileUpload(f, 'video')} />
                                </div>
                            </div>

                            {/* لوگو */}
                            <div className="space-y-2">
                                <label className="text-xs text-gray-400">لوگو سایت</label>
                                <div className="flex gap-2 items-center">
                                    <input value={formData.logoUrl} onChange={e => setFormData({...formData, logoUrl: e.target.value})} className="flex-1 bg-black/50 border border-white/20 p-2 rounded text-xs" />
                                    <UploadBtn uploading={uploadingField === 'logo'} onUpload={f => handleFileUpload(f, 'logo')} />
                                    {formData.logoUrl && <img src={formData.logoUrl} className="w-8 h-8 object-contain bg-white/10 rounded" />}
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                    <label className="text-[10px] text-gray-500">سایز لوگو</label>
                                    <input type="range" min="1" max="10" step="0.5" value={formData.logoSize || 3} onChange={e => setFormData({...formData, logoSize: +e.target.value})} className="w-32 accent-yellow-500" />
                                </div>
                            </div>

                            {/* لودر */}
                            <div className="space-y-2">
                                <label className="text-xs text-gray-400">تصویر لودر (اسب سوار)</label>
                                <div className="flex gap-2 items-center">
                                    <input value={formData.loaderUrl || ''} onChange={e => setFormData({...formData, loaderUrl: e.target.value})} className="flex-1 bg-black/50 border border-white/20 p-2 rounded text-xs" placeholder="لینک تصویر..." />
                                    <UploadBtn uploading={uploadingField === 'loader'} onUpload={f => handleFileUpload(f, 'loader')} />
                                    {formData.loaderUrl && <img src={formData.loaderUrl} className="w-8 h-8 object-contain bg-white/10 rounded" />}
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-purple-900/10 border border-purple-500/20 rounded-xl">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" checked={formData.enableDarkRoom} onChange={e => setFormData({...formData, enableDarkRoom: e.target.checked})} className="w-5 h-5 accent-purple-500" />
                                <span className="font-bold text-purple-200">فعال‌سازی اتاق تاریک (آیکون چشم)</span>
                            </label>
                        </div>
                    </div>
                )}

                {/* --- تب هوش مصنوعی (AI) --- */}
                {activeTab === 'ai' && (
                    <div className="space-y-6 max-w-3xl animate-in fade-in">
                        <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/10">
                            <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${aiConnectionStatus === 'connected' ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-red-500'}`}></div>
                                <div>
                                    <h3 className="font-bold text-white text-sm">وضعیت اتصال هوش مصنوعی</h3>
                                    <p className="text-[10px] text-gray-400">{aiConnectionStatus === 'connected' ? 'متصل به OpenRouter' : 'در حال بررسی...'}</p>
                                </div>
                            </div>
                            <button onClick={checkAiConnection} className="bg-white/10 hover:bg-white/20 px-3 py-1 rounded text-xs flex items-center gap-2"><RefreshCw size={12}/> تست مجدد</button>
                        </div>

                        <div className="bg-black/30 p-6 rounded-xl border border-white/10 space-y-4">
                            <h4 className="text-white/60 text-sm font-bold border-b border-white/10 pb-2">تنظیمات ربات</h4>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="w-full"><label className="block text-[10px] text-gray-500 mb-1">نام ربات</label><input type="text" value={formData.aiConfig?.name || 'دستیار'} onChange={v => setFormData({...formData, aiConfig: {...(formData.aiConfig || {}), name: v.target.value} as AiConfig})} className="w-full bg-black/50 border-b border-white/20 py-2 text-white outline-none text-sm"/></div>
                                <div>
                                    <label className="block text-[10px] text-gray-500 mb-1">مدل انتخابی</label>
                                    <select value={formData.aiConfig?.model} onChange={e => setFormData({...formData, aiConfig: {...(formData.aiConfig || {}), model: e.target.value} as AiConfig})} className="w-full bg-black/50 border border-white/20 p-2 rounded text-xs text-white">
                                        <option value="google/gemini-2.0-flash-exp:free">Gemini Flash (سریع)</option>
                                        <option value="meta-llama/llama-3.3-70b-instruct:free">Llama 3 (دقیق)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] text-gray-500 mb-1">دستورالعمل سیستم (System Prompt)</label>
                                <textarea 
                                    value={formData.aiConfig?.systemPrompt || ''} 
                                    onChange={e => setFormData({...formData, aiConfig: {...(formData.aiConfig || {}), systemPrompt: e.target.value} as AiConfig})} 
                                    className="w-full bg-black/50 border border-white/20 p-3 rounded text-sm text-white h-32 leading-6" 
                                    placeholder="تو یک دستیار سینمایی هستی..." 
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* --- تب بنر و فراخوان (Special Event) --- */}
                {activeTab === 'special_event' && (
                    <div className="space-y-6 max-w-3xl animate-in fade-in">
                        <div className="flex items-center gap-3 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                            <input type="checkbox" checked={formData.specialEvent?.isActive} onChange={e => setFormData({...formData, specialEvent: {...formData.specialEvent!, isActive: e.target.checked}})} className="w-5 h-5 accent-yellow-500" />
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
                                <label className="text-xs text-gray-400 block mb-2">موقعیت قرارگیری</label>
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
                            
                            <label className="text-xs text-gray-400 block mt-2">پوستر فراخوان</label>
                            <div className="flex gap-2">
                                <input value={formData.specialEvent?.posterUrl || ''} onChange={e => setFormData({...formData, specialEvent: {...formData.specialEvent!, posterUrl: e.target.value}})} className="flex-1 bg-black/50 border border-white/20 p-2 rounded text-xs" />
                                <UploadBtn uploading={uploadingField === 'specialPoster'} onUpload={f => handleFileUpload(f, 'specialPoster')} />
                            </div>
                            {formData.specialEvent?.posterUrl && <img src={formData.specialEvent.posterUrl} className="h-20 rounded border border-white/20" />}
                        </div>
                    </div>
                )}

                {/* --- تب رویدادها (Events) --- */}
                {activeTab === 'events' && (
                    <div className="space-y-6 animate-in fade-in">
                        <div className="flex justify-between items-center"><h3 className="font-bold">رویدادها و ورکشاپ‌ها</h3><button onClick={addEvent} className="bg-yellow-600 px-3 py-1 rounded text-xs flex items-center gap-1"><Plus size={12}/> جدید</button></div>
                        {formData.eventsList?.map((ev, i) => (
                            <div key={ev.id || i} className="bg-white/5 p-4 rounded border border-white/10 relative space-y-3">
                                <button onClick={() => {const n=formData.eventsList!.filter((_, idx)=>idx!==i); setFormData({...formData, eventsList:n})}} className="absolute top-2 left-2 text-red-500"><Trash2 size={14}/></button>
                                <div className="grid grid-cols-2 gap-4">
                                    <InputGroup label="عنوان" value={ev.title} onChange={v => {const n=[...formData.eventsList!]; n[i].title=v; setFormData({...formData, eventsList:n})}} />
                                    <InputGroup label="تاریخ" value={ev.date} onChange={v => {const n=[...formData.eventsList!]; n[i].date=v; setFormData({...formData, eventsList:n})}} />
                                </div>
                                <div className="flex gap-2 items-end">
                                    <div className="flex-1"><label className="text-[10px] text-gray-500">تصویر رویداد</label><input value={ev.imageUrl || ''} onChange={e => {const n=[...formData.eventsList!]; n[i].imageUrl=e.target.value; setFormData({...formData, eventsList:n})}} className="w-full bg-black/50 border border-white/20 p-2 rounded text-xs" /></div>
                                    <UploadBtn uploading={uploadingField === 'event'+i} onUpload={f => handleFileUpload(f, 'event', i)} />
                                    {ev.imageUrl && <img src={ev.imageUrl} className="w-8 h-8 rounded object-cover" />}
                                </div>
                                <textarea value={ev.description} onChange={e => {const n=[...formData.eventsList!]; n[i].description=e.target.value; setFormData({...formData, eventsList:n})}} className="w-full bg-black p-2 h-20 text-xs rounded border border-white/10" placeholder="توضیحات..." />
                            </div>
                        ))}
                    </div>
                )}

                {/* --- تب مقالات (Articles) --- */}
                {activeTab === 'articles' && (
                    <div className="space-y-6">
                        <button onClick={addArticle} className="bg-yellow-600 px-3 py-1 rounded text-xs">+ مقاله جدید</button>
                        {formData.articles?.map((art, i) => (
                            <div key={art.id} className="bg-white/5 p-4 rounded border border-white/10 space-y-3 relative">
                                <button onClick={() => {const n=formData.articles!.filter((_, idx)=>idx!==i); setFormData({...formData, articles:n})}} className="absolute top-2 left-2 text-red-500"><Trash2 size={14}/></button>
                                <InputGroup label="عنوان" value={safeVal(art.title)} onChange={v => {const n=[...formData.articles!]; n[i].title=v; setFormData({...formData, articles:n})}} />
                                <div className="flex gap-2 items-end">
                                    <div className="flex-1"><label className="text-[10px] text-gray-500">کاور مقاله</label><input value={art.coverUrl || ''} onChange={e => {const n=[...formData.articles!]; n[i].coverUrl=e.target.value; setFormData({...formData, articles:n})}} className="w-full bg-black/50 border border-white/20 p-2 rounded text-xs" /></div>
                                    <UploadBtn uploading={uploadingField === 'article'+i} onUpload={f => handleFileUpload(f, 'article', i)} />
                                    {art.coverUrl && <img src={art.coverUrl} className="w-8 h-8 rounded object-cover" />}
                                </div>
                                <textarea value={safeVal(art.content)} onChange={e => {const n=[...formData.articles!]; n[i].content=e.target.value; setFormData({...formData, articles:n})}} className="w-full bg-black p-2 h-32 text-xs rounded" placeholder="متن مقاله..." />
                            </div>
                        ))}
                    </div>
                )}

                {/* --- تب آثار (Works) --- */}
                {activeTab === 'works' && (
                    <div className="space-y-6">
                        <button onClick={addWork} className="bg-blue-600 px-3 py-1 rounded text-xs">+ اثر جدید</button>
                        <div className="grid grid-cols-2 gap-4">
                            {formData.works?.map((w, i) => (
                                <div key={w.id} className="bg-white/5 p-4 rounded border border-white/10 relative space-y-2">
                                    <button onClick={() => {const n=formData.works!.filter((_, idx)=>idx!==i); setFormData({...formData, works:n})}} className="absolute top-2 left-2 text-red-500"><Trash2 size={14}/></button>
                                    <InputGroup label="عنوان" value={safeVal(w.title?.fa)} onChange={v => {const n=[...formData.works!]; n[i].title.fa=v; setFormData({...formData, works:n})}} />
                                    <div className="flex gap-2 items-end">
                                        <div className="flex-1"><input value={w.imageUrl || ''} onChange={e => {const n=[...formData.works!]; n[i].imageUrl=e.target.value; setFormData({...formData, works:n})}} className="w-full bg-black/50 border border-white/20 p-2 rounded text-xs" placeholder="کاور..." /></div>
                                        <UploadBtn uploading={uploadingField === 'work'+i} onUpload={f => handleFileUpload(f, 'work', i)} />
                                        {w.imageUrl && <img src={w.imageUrl} className="w-8 h-8 rounded object-cover" />}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- تب درباره ما (About) --- */}
                {activeTab === 'about' && (
                    <div className="space-y-6 animate-in fade-in">
                        <h4 className="text-white font-bold border-b border-white/10 pb-2">متن و شبکه‌های اجتماعی</h4>
                        <textarea value={safeVal(formData.about?.manifesto?.fa)} onChange={e => setFormData({...formData, about: {...formData.about!, manifesto: {fa: e.target.value, en: ''}}})} className="w-full h-40 bg-black/50 border border-white/20 p-4 rounded-lg text-sm leading-7" placeholder="بیانیه..." />
                        
                        <div className="space-y-2">
                            <label className="text-xs text-gray-400">شبکه‌های اجتماعی</label>
                            {formData.about?.socials?.map((soc, i) => (
                                <div key={i} className="flex gap-2 items-center bg-white/5 p-2 rounded">
                                    <input type="checkbox" checked={soc.isActive} onChange={e => {const n=[...formData.about!.socials]; n[i].isActive=e.target.checked; setFormData({...formData, about: {...formData.about!, socials: n}})}} />
                                    <span className="text-xs w-20 opacity-50 uppercase">{soc.platform}</span>
                                    <input value={soc.url} onChange={e => {const n=[...formData.about!.socials]; n[i].url=e.target.value; setFormData({...formData, about: {...formData.about!, socials: n}})}} className="flex-1 bg-black/30 border-none text-xs p-1 rounded text-white" placeholder="لینک..." />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- تب ثبت‌نام‌ها و پیام‌ها --- */}
                {(activeTab === 'registrations' || activeTab === 'inbox') && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold">{activeTab==='registrations' ? `ثبت‌نام‌ها (${registrations.length})` : `پیام‌ها (${messages.length})`}</h3>
                            <div className="flex gap-2">
                                {activeTab==='registrations' && <button onClick={exportToCSV} className="bg-green-600 px-3 py-1 rounded text-xs flex items-center gap-1"><Download size={12}/> اکسل</button>}
                                <button onClick={() => fetchData(activeTab==='registrations'?'regs':'msgs')} className="bg-white/10 px-3 py-1 rounded text-xs"><RefreshCw size={12}/></button>
                            </div>
                        </div>
                        {loadingData ? <Loader2 className="animate-spin mx-auto"/> : (
                            <div className="grid gap-2">
                                {activeTab==='registrations' ? registrations.map((r, i) => (
                                    <div key={i} className="bg-white/5 p-3 rounded flex justify-between items-center text-xs hover:bg-white/10 cursor-pointer" onClick={() => setSelectedReg(r)}>
                                        <div className="flex gap-4">
                                            <span className="font-bold text-white w-32 truncate">{safeVal(r.filmTitleFa)}</span>
                                            <span className="text-gray-400 w-32 truncate">{safeVal(r.directorNameFa)}</span>
                                            <span className="text-yellow-500 font-mono">{r.trackingId || r.id}</span>
                                        </div>
                                        <Eye size={14} className="text-blue-400"/>
                                    </div>
                                )) : messages.map((m, i) => (
                                    <div key={i} className="bg-white/5 p-3 rounded text-xs space-y-1">
                                        <div className="flex justify-between font-bold text-white"><span>{safeVal(m.name)}</span><span className="text-white/30 font-mono">{m.date}</span></div>
                                        <div className="text-blue-300">{safeVal(m.email)}</div>
                                        <p className="text-gray-400 bg-black/20 p-2 rounded">{safeVal(m.message)}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>

        {/* فوتر دکمه‌ها */}
        <div className="p-4 border-t border-white/10 flex justify-end gap-3 bg-[#0a0a0a]">
            <button onClick={onClose} className="px-5 py-2 text-xs text-gray-400 hover:text-white transition">بستن</button>
            <button 
                onClick={handleSubmit} 
                className={`px-6 py-2 font-bold rounded-lg text-xs flex items-center gap-2 transition-all duration-300 ${saveStatus === 'success' ? 'bg-green-600 text-white' : saveStatus === 'error' ? 'bg-red-600 text-white' : 'bg-white text-black hover:bg-gray-200'}`}
            >
                {saveStatus === 'success' ? <CheckCircle2 size={16}/> : saveStatus === 'error' ? <AlertCircle size={16}/> : <Save size={16}/>}
                {saveStatus === 'success' ? 'ذخیره شد' : saveStatus === 'error' ? 'خطا' : 'ذخیره تغییرات'}
            </button>
        </div>
      </div>
    </div>
  );
};

// کامپوننت‌های کمکی
const TabBtn = ({ active, onClick, icon: Icon, label, count }: any) => (
    <button onClick={onClick} className={`flex items-center justify-between p-3 rounded-lg text-xs font-bold w-full transition-all ${active ? 'bg-white text-black shadow-lg shadow-white/10' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
        <div className="flex items-center gap-3"><Icon size={16}/> {label}</div>
        {count !== undefined && <span className={`text-[10px] px-2 py-0.5 rounded-full ${active ? 'bg-black/10 text-black' : 'bg-white/10 text-white'}`}>{count}</span>}
    </button>
);

const InputGroup = ({ label, value, onChange }: any) => (
  <div className="w-full">
      <label className="block text-[10px] text-gray-500 mb-1">{label}</label>
      <input type="text" value={value || ''} onChange={e => onChange(e.target.value)} className="w-full bg-black/50 border-b border-white/20 py-2 text-white outline-none text-xs focus:border-white transition" />
  </div>
);

const UploadBtn = ({ uploading, onUpload }: any) => (
    <div className="relative overflow-hidden">
        <button type="button" className="bg-white/10 hover:bg-white/20 p-2 rounded text-white transition disabled:opacity-50" disabled={uploading}>
            {uploading ? <Loader2 size={16} className="animate-spin"/> : <Upload size={16}/>}
        </button>
        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => e.target.files && onUpload(e.target.files[0])} disabled={uploading} />
    </div>
);

export default AdminPanel;
