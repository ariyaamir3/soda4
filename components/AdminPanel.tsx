import React, { useState, useEffect } from 'react';
import { SiteContent, ContactMessage, LightColor, BlinkSpeed, ChatMode, FullRegistrationData } from '../types';
import { getRegistrations, getContactMessages, uploadFile } from '../services/firebase';
import { X, Save, Edit2, Menu, Database, Loader2, Download, Users, Mail, Trash2, Sparkles, Lock, Briefcase, FileText, Info, Eye, CheckCircle2 } from 'lucide-react';

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
  const [formData, setFormData] = useState<SiteContent>(content || {});
  const [activeTab, setActiveTab] = useState<'general' | 'menu' | 'special_event' | 'ai_config' | 'works' | 'articles' | 'registrations' | 'inbox' | 'about'>('general');
  
  // داده‌های دیتابیس
  const [registrations, setRegistrations] = useState<FullRegistrationData[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedReg, setSelectedReg] = useState<FullRegistrationData | null>(null);

  // تابع کمکی برای جلوگیری از ارور آبجکت‌های تهی
  const safeVal = (val: any) => {
      if (typeof val === 'object' && val !== null) return val.fa || val.en || '';
      return val || '';
  };

  // لود کردن داده‌ها وقتی تب عوض می‌شود
  useEffect(() => {
    if (activeTab === 'registrations') fetchData('regs');
    if (activeTab === 'inbox') fetchData('msgs');
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

  // هندل کردن ورود با رمز
  const handleLogin = (e: React.FormEvent) => {
      e.preventDefault();
      if (passwordInput === 'hope') {
          setIsAuthenticated(true);
      } else {
          alert('رمز عبور اشتباه است!');
      }
  };

  // مدیریت آپلود فایل در بخش‌های مختلف
  const handleFileUpload = async (file: File, field: string, index?: number) => {
    setUploading(true);
    try {
      // آپلود روی سرور و دریافت لینک
      const url = await uploadFile(file);
      const newData = { ...formData };
      
      if (field === 'article' && typeof index === 'number') {
        if (!newData.articles) newData.articles = [];
        newData.articles[index].coverUrl = url;
      } else if (field === 'work' && typeof index === 'number') {
        if (!newData.works) newData.works = [];
        newData.works[index].imageUrl = url;
      } else if (field === 'logo') {
        newData.logoUrl = url;
      } else if (field === 'poster') {
        newData.posterUrl = url; // پوستر ویدیو
      } else if (field === 'specialPoster') {
         if(!newData.specialEvent) newData.specialEvent = {} as any;
         newData.specialEvent!.posterUrl = url; // پوستر جشنواره
      }
      
      setFormData(newData);
    } catch (e) { 
        alert("آپلود نشد. لطفا اتصال اینترنت را بررسی کنید."); 
    }
    setUploading(false);
  };

  const handleSubmit = async () => {
    await onSave(formData);
    alert("تغییرات با موفقیت در دیتابیس ذخیره شد.");
  };

  // توابع افزودن آیتم جدید
  const addArticle = () => {
    setFormData({
        ...formData,
        articles: [...(formData.articles || []), { 
            id: Date.now().toString(), 
            title: {fa:'عنوان جدید',en:'New Title'}, 
            summary: {fa:'',en:''}, 
            content: {fa:'',en:''}, 
            author: {fa:'تحریریه',en:'Editorial'}, 
            date: new Date().toLocaleDateString('fa-IR'), 
            coverUrl: '', 
            tags: '' 
        }]
    });
  };

  const addWork = () => {
    setFormData({
        ...formData,
        works: [...(formData.works || []), { 
            id: Date.now().toString(), 
            title: {fa:'اثر جدید',en:'New Work'}, 
            year: '2025', 
            imageUrl: '', 
            link: '', 
            description: '' 
        }]
    });
  };

  const addMenuItem = () => {
    setFormData({
        ...formData,
        menuItems: [...(formData.menuItems || []), { 
            id: Date.now().toString(), 
            title: {fa:'منو جدید',en:'New Item'}, 
            link: '#', 
            description: {fa:'',en:''} 
        }]
    });
  };

  // خروجی اکسل از لیست ثبت‌نام‌ها
  const exportToCSV = () => {
      if (!registrations || registrations.length === 0) return alert("داده‌ای برای خروجی وجود ندارد");
      
      const headers = ["کد رهگیری", "نام فیلم", "کارگردان", "موبایل", "ایمیل", "بخش", "تاریخ ثبت", "لینک اثر"];
      const rows = registrations.map(reg => [
          reg.id,
          safeVal(reg.filmTitleFa),
          safeVal(reg.directorNameFa),
          safeVal(reg.phone),
          safeVal(reg.email),
          safeVal(reg.section),
          safeVal(reg.submittedAt),
          safeVal(reg.filmLink)
      ]);

      const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "registrations_sodakhial.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  // 🔒 اگر کاربر لاگین نکرده باشد، فرم ورود نشان داده می‌شود
  if (!isAuthenticated) {
      return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4">
              <div className="bg-[#111] p-8 rounded-2xl border border-white/10 text-center w-full max-w-sm shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 to-purple-600"></div>
                  <Lock size={48} className="text-yellow-500 mx-auto mb-6 opacity-80"/>
                  <h2 className="text-white font-bold text-xl mb-6 tracking-wide">پنل مدیریت سودای خیال</h2>
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
                  <button onClick={() => setSelectedReg(null)} className="absolute top-6 left-6 text-white/50 hover:text-red-500 transition"><X size={24}/></button>
                  
                  <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-6">
                      <div className="bg-yellow-600/20 p-3 rounded-full text-yellow-500"><Film size={24}/></div>
                      <div>
                          <h3 className="text-2xl font-bold text-white">{safeVal(selectedReg.filmTitleFa)}</h3>
                          <p className="text-sm text-gray-400">{safeVal(selectedReg.filmTitleEn)}</p>
                      </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-sm text-gray-300">
                      <div className="space-y-1"><span className="text-white/40 block text-xs">کارگردان</span> <span className="text-white text-base">{safeVal(selectedReg.directorNameFa)}</span></div>
                      <div className="space-y-1"><span className="text-white/40 block text-xs">Director</span> <span className="text-white text-base" dir="ltr">{safeVal(selectedReg.directorNameEn)}</span></div>
                      <div className="space-y-1"><span className="text-white/40 block text-xs">موبایل</span> <span className="font-mono text-white">{safeVal(selectedReg.phone)}</span></div>
                      <div className="space-y-1"><span className="text-white/40 block text-xs">ایمیل</span> <span className="font-mono text-white">{safeVal(selectedReg.email)}</span></div>
                      <div className="space-y-1"><span className="text-white/40 block text-xs">بخش جشنواره</span> <span className="text-yellow-500">{safeVal(selectedReg.section)}</span></div>
                      <div className="space-y-1"><span className="text-white/40 block text-xs">تاریخ ثبت</span> <span className="font-mono">{selectedReg.submittedAt}</span></div>
                      
                      <div className="col-span-full bg-white/5 p-4 rounded-lg border border-white/5">
                          <span className="text-white/40 block text-xs mb-2">خلاصه داستان (Logline/Synopsis)</span>
                          <p className="leading-7">{safeVal(selectedReg.synopsis || selectedReg.logline)}</p>
                      </div>

                      <div className="col-span-full grid grid-cols-2 gap-4 bg-black/30 p-4 rounded-lg">
                          <div><span className="text-white/40 text-xs">درصد هوش مصنوعی:</span> {safeVal(selectedReg.humanPercent)}%</div>
                          <div><span className="text-white/40 text-xs">مدل‌های AI:</span> {safeVal(selectedReg.aiModels)}</div>
                      </div>

                      <div className="col-span-full flex gap-4 pt-4 border-t border-white/10">
                          {selectedReg.filmLink && <a href={selectedReg.filmLink} target="_blank" rel="noopener noreferrer" className="flex-1 bg-blue-600/20 text-blue-400 border border-blue-600/50 py-3 rounded text-center hover:bg-blue-600 hover:text-white transition">📥 دانلود فیلم</a>}
                          {selectedReg.posterLink && <a href={selectedReg.posterLink} target="_blank" rel="noopener noreferrer" className="flex-1 bg-purple-600/20 text-purple-400 border border-purple-600/50 py-3 rounded text-center hover:bg-purple-600 hover:text-white transition">🖼️ پوستر/عکس</a>}
                          {selectedReg.projectFilesLink && <a href={selectedReg.projectFilesLink} target="_blank" rel="noopener noreferrer" className="flex-1 bg-gray-600/20 text-gray-400 border border-gray-600/50 py-3 rounded text-center hover:bg-gray-600 hover:text-white transition">📂 فایل پروژه</a>}
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
                <span className="tracking-wide font-bold">پنل مدیریت</span>
            </h2>
            <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] text-green-400 font-bold">اتصال به سرور لیارا</span>
            </div>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-red-500 transition p-2 hover:bg-white/5 rounded-full"><X size={20} /></button>
        </div>

        <div className="flex flex-1 overflow-hidden">
            {/* سایدبار منو */}
            <div className="w-64 bg-black/50 border-l border-white/5 flex flex-col p-4 gap-2 overflow-y-auto shrink-0 custom-scrollbar">
                <div className="text-[10px] text-gray-500 uppercase tracking-widest px-2 mb-1 mt-2">اصلی</div>
                <TabBtn active={activeTab==='registrations'} onClick={()=>setActiveTab('registrations')} icon={Users} label="ثبت‌نام‌ها" count={registrations.length} />
                <TabBtn active={activeTab==='inbox'} onClick={()=>setActiveTab('inbox')} icon={Mail} label="صندوق پیام" count={messages.length} />
                
                <div className="h-px bg-white/5 my-2 mx-2"></div>
                
                <div className="text-[10px] text-gray-500 uppercase tracking-widest px-2 mb-1">تنظیمات</div>
                <TabBtn active={activeTab==='general'} onClick={()=>setActiveTab('general')} icon={Edit2} label="عمومی & لوگو" />
                <TabBtn active={activeTab==='special_event'} onClick={()=>setActiveTab('special_event')} icon={Sparkles} label="بنر و چراغ" />
                <TabBtn active={activeTab==='ai_config'} onClick={()=>setActiveTab('ai_config')} icon={Database} label="مغز هوش مصنوعی" />
                
                <div className="h-px bg-white/5 my-2 mx-2"></div>
                
                <div className="text-[10px] text-gray-500 uppercase tracking-widest px-2 mb-1">محتوا</div>
                <TabBtn active={activeTab==='articles'} onClick={()=>setActiveTab('articles')} icon={FileText} label="مقالات" />
                <TabBtn active={activeTab==='works'} onClick={()=>setActiveTab('works')} icon={Briefcase} label="گالری آثار" />
                <TabBtn active={activeTab==='menu'} onClick={()=>setActiveTab('menu')} icon={Menu} label="آیتم‌های منو" />
                <TabBtn active={activeTab==='about'} onClick={()=>setActiveTab('about')} icon={Info} label="درباره ما" />
            </div>

            {/* ناحیه محتوا */}
            <div className="flex-1 p-8 overflow-y-auto bg-[#0f0f0f] text-white custom-scrollbar relative">
                
                {/* تب ثبت‌نام‌ها */}
                {activeTab === 'registrations' && (
                    <div className="space-y-6 animate-in fade-in">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-lg flex items-center gap-2"><Users size={20} className="text-blue-500"/> لیست شرکت‌کنندگان</h3>
                            <div className="flex gap-3">
                                <button onClick={exportToCSV} className="bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded text-xs flex items-center gap-2 transition"><Download size={14}/> خروجی اکسل</button>
                                <button onClick={() => fetchData('regs')} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded text-xs transition"><Loader2 size={14} className={loadingData ? "animate-spin" : ""}/></button>
                            </div>
                        </div>
                        {loadingData ? <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-white/30" size={30}/></div> : (
                            <div className="overflow-x-auto border border-white/10 rounded-xl bg-black/20">
                                <table className="w-full text-right text-xs">
                                    <thead className="bg-white/5 text-white/40 uppercase font-mono border-b border-white/5">
                                        <tr>
                                            <th className="px-6 py-4">نام فیلم</th>
                                            <th className="px-6 py-4">کارگردان</th>
                                            <th className="px-6 py-4">بخش</th>
                                            <th className="px-6 py-4">تاریخ</th>
                                            <th className="px-6 py-4 text-center">جزئیات</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {registrations.length === 0 ? (
                                            <tr><td colSpan={5} className="text-center py-10 text-white/20">لیست خالی است</td></tr>
                                        ) : registrations.map((reg, idx) => (
                                            <tr key={idx} className="hover:bg-white/5 transition group">
                                                <td className="px-6 py-4 font-bold text-white group-hover:text-yellow-500 transition">{safeVal(reg.filmTitleFa)}</td>
                                                <td className="px-6 py-4">{safeVal(reg.directorNameFa)}</td>
                                                <td className="px-6 py-4"><span className="bg-white/5 px-2 py-1 rounded border border-white/5">{safeVal(reg.section)}</span></td>
                                                <td className="px-6 py-4 font-mono opacity-50">{reg.submittedAt ? new Date(reg.submittedAt).toLocaleDateString('fa-IR') : '-'}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <button onClick={() => setSelectedReg(reg)} className="text-blue-400 hover:bg-blue-500/20 p-2 rounded-full transition"><Eye size={16}/></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* تب پیام‌ها */}
                {activeTab === 'inbox' && (
                    <div className="space-y-6 animate-in fade-in">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-lg flex items-center gap-2"><Mail size={20} className="text-pink-500"/> پیام‌های دریافتی</h3>
                            <button onClick={() => fetchData('msgs')} className="bg-white/10 hover:bg-white/20 p-2 rounded text-xs"><Loader2 size={14} className={loadingData ? "animate-spin" : ""}/></button>
                        </div>
                        <div className="grid gap-4">
                            {messages.length === 0 ? <div className="text-center py-10 text-white/20">پیامی نیست</div> : messages.map((msg, idx) => (
                                <div key={idx} className="bg-white/5 border border-white/10 p-5 rounded-xl hover:border-white/30 transition">
                                    <div className="flex justify-between mb-3 border-b border-white/5 pb-2">
                                        <span className="font-bold text-sm text-white">{safeVal(msg.name)}</span>
                                        <span className="text-[10px] text-white/40 font-mono">{msg.date}</span>
                                    </div>
                                    <div className="text-xs text-blue-400 mb-3 flex items-center gap-1"><Mail size={12}/> {safeVal(msg.email)}</div>
                                    <p className="text-sm text-gray-300 leading-6 bg-black/20 p-3 rounded">{safeVal(msg.message)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* تب تنظیمات عمومی */}
                {activeTab === 'general' && (
                    <div className="space-y-8 max-w-3xl animate-in fade-in">
                        <div className="bg-white/5 border border-white/10 p-6 rounded-xl space-y-6">
                            <h4 className="text-white/60 text-sm font-bold border-b border-white/10 pb-2">تنظیمات اصلی</h4>
                            <InputGroup label="لینک ویدیو پس‌زمینه (MP4)" value={formData.videoUrl} onChange={v => setFormData({...formData, videoUrl: v})} />
                            <InputGroup label="لینک لوگو (بالا راست)" value={formData.logoUrl} onChange={v => setFormData({...formData, logoUrl: v})} />
                            
                            <div className="flex gap-4 items-end">
                                <div className="flex-1">
                                    <label className="text-xs text-gray-400 block mb-2">آپلود لوگوی جدید</label>
                                    <input type="file" className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20" onChange={e => e.target.files && handleFileUpload(e.target.files[0], 'logo')} />
                                </div>
                                {uploading && <Loader2 className="animate-spin text-yellow-500 mb-2" size={16}/>}
                            </div>

                            <div className="flex items-center gap-4 bg-black/30 p-3 rounded border border-white/5">
                                <label className="text-xs text-gray-400 whitespace-nowrap">سایز لوگو</label>
                                <input type="range" min="1" max="10" step="0.5" value={formData.logoSize || 3} onChange={e => setFormData({...formData, logoSize: +e.target.value})} className="flex-1 accent-yellow-500" />
                                <span className="text-xs font-mono w-8 text-center">{formData.logoSize}</span>
                            </div>

                            <InputGroup label="نام شرکت (فارسی)" value={formData.companyName?.fa} onChange={v => setFormData({...formData, companyName: {...formData.companyName!, fa: v}})} />
                        </div>

                        <div className="p-6 bg-purple-900/10 border border-purple-500/20 rounded-xl flex items-center justify-between">
                            <div>
                                <h4 className="text-purple-300 font-bold mb-1">اتاق تاریک</h4>
                                <p className="text-xs text-purple-400/60">آیکون چشم در منو ظاهر می‌شود</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={formData.enableDarkRoom} onChange={e => setFormData({...formData, enableDarkRoom: e.target.checked})} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                            </label>
                        </div>
                    </div>
                )}

                {/* تب بنر و چراغ */}
                {activeTab === 'special_event' && (
                    <div className="space-y-8 max-w-3xl animate-in fade-in">
                        <div className="flex items-center gap-3 p-5 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                            <input type="checkbox" checked={formData.specialEvent?.isActive} onChange={e => setFormData({...formData, specialEvent: {...formData.specialEvent!, isActive: e.target.checked}})} className="w-5 h-5 accent-yellow-500 cursor-pointer" />
                            <div>
                                <span className="font-bold text-yellow-500 block">فعال‌سازی بنر جشنواره</span>
                                <span className="text-[10px] text-gray-400">نمایش تیکت سمت راست صفحه</span>
                            </div>
                        </div>

                        <div className="bg-white/5 border border-white/10 p-6 rounded-xl space-y-6">
                            <h4 className="text-white/60 text-sm font-bold border-b border-white/10 pb-2">تنظیمات چراغ هشدار</h4>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs text-gray-400 block mb-2">رنگ چراغ</label>
                                    <select value={formData.specialEvent?.lightColor || 'yellow'} onChange={e => setFormData({...formData, specialEvent: {...formData.specialEvent!, lightColor: e.target.value as LightColor}})} className="w-full bg-black border border-white/20 p-3 rounded-lg text-sm text-white focus:border-yellow-500 outline-none">
                                        <option value="green">🟢 سبز (وضعیت عادی)</option>
                                        <option value="yellow">🟡 زرد (هشدار ددلاین)</option>
                                        <option value="red">🔴 قرمز (اضطراری/پایان)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 block mb-2">سرعت چشمک</label>
                                    <select value={formData.specialEvent?.blinkSpeed || 'slow'} onChange={e => setFormData({...formData, specialEvent: {...formData.specialEvent!, blinkSpeed: e.target.value as BlinkSpeed}})} className="w-full bg-black border border-white/20 p-3 rounded-lg text-sm text-white focus:border-yellow-500 outline-none">
                                        <option value="none">ثابت (بدون چشمک)</option>
                                        <option value="slow">کند (آرام)</option>
                                        <option value="fast">تند (هیجانی)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/5 border border-white/10 p-6 rounded-xl space-y-4">
                            <h4 className="text-white/60 text-sm font-bold border-b border-white/10 pb-2">تنظیمات چت هوشمند</h4>
                            <div className="flex gap-6">
                                <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-yellow-500 transition"><input type="radio" name="chatMode" value="banner" checked={formData.specialEvent?.chatMode !== 'floating'} onChange={() => setFormData({...formData, specialEvent: {...formData.specialEvent!, chatMode: 'banner'}})} className="accent-yellow-500" /> داخل بنر (پیش‌فرض)</label>
                                <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-yellow-500 transition"><input type="radio" name="chatMode" value="floating" checked={formData.specialEvent?.chatMode === 'floating'} onChange={() => setFormData({...formData, specialEvent: {...formData.specialEvent!, chatMode: 'floating'}})} className="accent-yellow-500" /> شناور (پایین صفحه)</label>
                            </div>
                        </div>

                        <div className="bg-white/5 border border-white/10 p-6 rounded-xl space-y-4">
                            <InputGroup label="عنوان بنر (فارسی)" value={safeVal(formData.specialEvent?.title?.fa)} onChange={v => setFormData({...formData, specialEvent: {...formData.specialEvent!, title: {...formData.specialEvent!.title, fa: v}}})} />
                            <InputGroup label="تاریخ ددلاین (نمایش در بنر)" value={safeVal(formData.specialEvent?.date)} onChange={v => setFormData({...formData, specialEvent: {...formData.specialEvent!, date: v}})} placeholder="مثال: ۱۵ بهمن ۱۴۰۴" />
                            <InputGroup label="توضیحات کوتاه" value={safeVal(formData.specialEvent?.description?.fa)} onChange={v => setFormData({...formData, specialEvent: {...formData.specialEvent!, description: {...formData.specialEvent!.description, fa: v}}})} />
                            
                            <div className="border-t border-white/10 pt-4 mt-2">
                                <label className="text-xs text-gray-400 block mb-2">آپلود پوستر کامل (برای داخل مودال)</label>
                                <input type="file" className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20" onChange={e => e.target.files && handleFileUpload(e.target.files[0], 'specialPoster')} />
                                {formData.specialEvent?.posterUrl && <div className="mt-4"><img src={formData.specialEvent.posterUrl} className="h-32 rounded border border-white/20 object-cover"/></div>}
                            </div>
                        </div>
                    </div>
                )}

                {/* تب تنظیمات هوش مصنوعی */}
                {activeTab === 'ai_config' && (
                    <div className="space-y-6 max-w-3xl animate-in fade-in">
                        <div className="bg-gradient-to-br from-indigo-900/20 to-black p-8 rounded-2xl border border-indigo-500/30 shadow-lg">
                            <div className="flex items-center gap-3 mb-6">
                                <Sparkles className="text-indigo-400" size={24} />
                                <h3 className="font-bold text-xl text-indigo-100">تنظیمات مغز هوش مصنوعی</h3>
                            </div>
                            <p className="text-sm text-gray-400 mb-4 leading-7">
                                در اینجا می‌توانید "شخصیت" و "دستورالعمل‌های کلی" دستیار هوشمند سایت را تعیین کنید.
                                <br/>مثلاً اگر جشنواره تمام شد، بنویسید: <span className="text-indigo-300">"مودبانه به کاربر بگو مهلت تمام شده و منتظر نتایج باشد."</span>
                            </p>
                            <textarea 
                                value={formData.aiSystemPrompt || ''}
                                onChange={e => setFormData({...formData, aiSystemPrompt: e.target.value})}
                                className="w-full bg-black/50 border border-indigo-500/30 rounded-xl p-5 text-sm text-white h-48 focus:border-indigo-500 outline-none leading-7 resize-none shadow-inner"
                                placeholder="مثال: تو دستیار جشنواره فیلم کوتاه سودای خیال هستی. لحن تو باید کاملاً رسمی و سینمایی باشد..."
                            />
                        </div>
                    </div>
                )}

                {/* تب مقالات */}
                {activeTab === 'articles' && (
                    <div className="space-y-8 animate-in fade-in">
                        <div className="flex justify-between items-center border-b border-white/10 pb-4">
                            <h3 className="font-bold text-lg">مدیریت مقالات</h3>
                            <button onClick={addArticle} className="bg-yellow-600 hover:bg-yellow-500 text-black font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-2 transition"><Plus size={14}/> مقاله جدید</button>
                        </div>
                        
                        <div className="grid gap-6">
                            {formData.articles?.map((art, i) => (
                                <div key={art.id || i} className="bg-white/5 p-6 rounded-xl border border-white/5 space-y-4 relative group hover:border-white/20 transition">
                                    <button onClick={() => {const n=formData.articles!.filter((_, idx)=>idx!==i); setFormData({...formData, articles:n})}} className="absolute top-4 left-4 text-white/30 hover:text-red-500 bg-black/50 p-2 rounded-full transition"><Trash2 size={16}/></button>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <InputGroup label="عنوان مقاله" value={safeVal(art.title)} onChange={v => {const n=[...formData.articles!]; n[i].title=v; setFormData({...formData, articles:n})}} />
                                        <InputGroup label="نویسنده" value={safeVal(art.author)} onChange={v => {const n=[...formData.articles!]; n[i].author=v; setFormData({...formData, articles:n})}} />
                                    </div>

                                    <div className="bg-black/30 p-4 rounded-lg border border-white/5 flex gap-6 items-start">
                                        <div className="flex-1">
                                            <label className="text-xs text-gray-400 block mb-2">تصویر شاخص مقاله</label>
                                            <input type="file" className="text-xs text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:bg-white/10 file:text-white" onChange={e => e.target.files && handleFileUpload(e.target.files[0], 'article', i)} />
                                            {uploading && <span className="text-[10px] text-yellow-500 block mt-1">در حال آپلود...</span>}
                                        </div>
                                        {art.coverUrl && <img src={art.coverUrl} className="w-24 h-24 object-cover rounded-lg border border-white/20 shadow-lg" />}
                                    </div>

                                    <InputGroup label="هشتگ‌ها (با کاما جدا کنید)" value={art.tags} onChange={v => {const n=[...formData.articles!]; n[i].tags=v; setFormData({...formData, articles:n})}} placeholder="سینما, هوش مصنوعی, نقد" />
                                    <InputGroup label="خلاصه کوتاه" value={safeVal(art.summary)} onChange={v => {const n=[...formData.articles!]; n[i].summary=v; setFormData({...formData, articles:n})}} />
                                    
                                    <div>
                                        <label className="text-xs text-gray-400 block mb-2">متن کامل</label>
                                        <textarea 
                                            value={safeVal(art.content)} 
                                            onChange={e => {const n=[...formData.articles!]; n[i].content=e.target.value; setFormData({...formData, articles:n})}} 
                                            className="w-full bg-black border border-white/20 p-4 rounded-lg text-sm h-64 focus:border-yellow-500 outline-none leading-7"
                                            placeholder="متن خود را اینجا بنویسید..."
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* تب آثار (گالری) */}
                {activeTab === 'works' && (
                    <div className="space-y-6 animate-in fade-in">
                        <div className="flex justify-between items-center border-b border-white/10 pb-4">
                            <h3 className="font-bold text-lg">مدیریت آثار</h3>
                            <button onClick={addWork} className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-xs flex items-center gap-2"><Plus size={14}/> افزودن اثر</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {formData.works?.map((work, i) => (
                                <div key={work.id || i} className="bg-white/5 p-5 rounded-xl border border-white/5 relative group hover:border-white/20 transition">
                                    <button onClick={() => {const n=formData.works!.filter((_, idx)=>idx!==i); setFormData({...formData, works:n})}} className="absolute top-3 left-3 text-white/30 hover:text-red-500"><Trash2 size={16}/></button>
                                    <div className="space-y-3">
                                        <div className="flex gap-3">
                                            <InputGroup label="عنوان" value={safeVal(work.title?.fa)} onChange={v => {const n=[...formData.works!]; n[i].title.fa=v; setFormData({...formData, works:n})}} />
                                            <InputGroup label="سال" value={safeVal(work.year)} onChange={v => {const n=[...formData.works!]; n[i].year=v; setFormData({...formData, works:n})}} />
                                        </div>
                                        <InputGroup label="لینک اثر" value={safeVal(work.link)} onChange={v => {const n=[...formData.works!]; n[i].link=v; setFormData({...formData, works:n})}} />
                                        <div className="pt-2 border-t border-white/5 mt-2">
                                            <label className="text-xs text-gray-400 block mb-1">کاور اثر</label>
                                            <div className="flex items-center gap-3">
                                                <input type="file" className="text-xs w-full" onChange={e => e.target.files && handleFileUpload(e.target.files[0], 'work', i)} />
                                                {work.imageUrl && <img src={work.imageUrl} className="w-12 h-12 object-cover rounded border border-white/10" />}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* تب منو */}
                {activeTab === 'menu' && (
                    <div className="space-y-4 animate-in fade-in">
                        <div className="flex justify-between items-center border-b border-white/10 pb-4">
                            <h3 className="font-bold text-lg">آیتم‌های منو</h3>
                            <button onClick={addMenuItem} className="bg-white/10 hover:bg-white/20 px-3 py-1 rounded text-xs">+ افزودن</button>
                        </div>
                        {formData.menuItems?.map((item, i) => (
                            <div key={i} className="flex gap-3 items-center bg-white/5 p-3 rounded-lg border border-white/5 hover:border-white/20 transition">
                                <div className="flex-1">
                                    <label className="text-[9px] text-gray-500 block mb-1">عنوان فارسی</label>
                                    <input value={safeVal(item.title?.fa)} onChange={e => {const n=[...formData.menuItems]; n[i].title.fa=e.target.value; setFormData({...formData, menuItems:n})}} className="w-full bg-black/30 border border-white/10 text-xs p-2 rounded text-white" />
                                </div>
                                <div className="flex-1">
                                    <label className="text-[9px] text-gray-500 block mb-1">English Title</label>
                                    <input value={safeVal(item.title?.en)} onChange={e => {const n=[...formData.menuItems]; n[i].title.en=e.target.value; setFormData({...formData, menuItems:n})}} className="w-full bg-black/30 border border-white/10 text-xs p-2 rounded text-white" dir="ltr" />
                                </div>
                                <div className="flex-1">
                                    <label className="text-[9px] text-gray-500 block mb-1">Link Key</label>
                                    <input value={safeVal(item.link)} onChange={e => {const n=[...formData.menuItems]; n[i].link=e.target.value; setFormData({...formData, menuItems:n})}} className="w-full bg-black/30 border border-white/10 text-xs p-2 rounded text-white font-mono" dir="ltr" />
                                </div>
                                <button onClick={() => {const n=formData.menuItems.filter((_, idx)=>idx!==i); setFormData({...formData, menuItems:n})}} className="text-white/30 hover:text-red-500 p-2 mt-4"><Trash2 size={16}/></button>
                            </div>
                        ))}
                    </div>
                )}

                {/* تب درباره ما */}
                {activeTab === 'about' && (
                    <div className="space-y-6 animate-in fade-in">
                        <h3 className="font-bold text-lg border-b border-white/10 pb-4">اطلاعات درباره ما</h3>
                        <div>
                            <label className="text-xs text-gray-400 block mb-2">متن بیانیه (Manifesto)</label>
                            <textarea value={safeVal(formData.about?.manifesto?.fa)} onChange={e => setFormData({...formData, about: {...formData.about!, manifesto: {fa: e.target.value, en: formData.about?.manifesto.en || ''}}})} className="w-full h-40 bg-black/50 border border-white/20 p-4 rounded-lg text-sm leading-7" />
                        </div>
                        <InputGroup label="آدرس" value={safeVal(formData.about?.address?.fa)} onChange={v => setFormData({...formData, about: {...formData.about!, address: {fa: v, en: ''}}})} />
                    </div>
                )}

            </div>
        </div>

        {/* فوتر دکمه‌ها */}
        <div className="p-5 border-t border-white/10 flex justify-end gap-3 bg-[#0a0a0a]">
            <button onClick={onClose} className="px-6 py-2 text-xs text-gray-400 hover:text-white transition">بستن پنل</button>
            <button onClick={handleSubmit} className="px-6 py-2 bg-white text-black font-bold rounded-lg text-xs hover:bg-gray-200 transition flex items-center gap-2 shadow-lg shadow-white/10">
                <Save size={14}/> ذخیره تغییرات
            </button>
        </div>
      </div>
    </div>
  );
};

// کامپوننت‌های کوچک داخلی برای تمیزی کد
const TabBtn = ({ active, onClick, icon: Icon, label, count }: any) => (
    <button onClick={onClick} className={`flex items-center justify-between p-3 rounded-lg text-xs font-bold w-full transition-all ${active ? 'bg-white text-black shadow-lg shadow-white/10' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
        <div className="flex items-center gap-3"><Icon size={16}/> {label}</div>
        {count !== undefined && <span className={`text-[10px] px-2 py-0.5 rounded-full ${active ? 'bg-black/10 text-black' : 'bg-white/10 text-white'}`}>{count}</span>}
    </button>
);

const InputGroup = ({ label, value, onChange, placeholder }: any) => (
  <div className="w-full">
      <label className="block text-[10px] text-gray-500 mb-1.5 uppercase tracking-wider">{label}</label>
      <input type="text" value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-black/50 border-b border-white/20 py-2.5 text-white outline-none text-sm focus:border-white transition placeholder:text-white/20" />
  </div>
);

export default AdminPanel;
