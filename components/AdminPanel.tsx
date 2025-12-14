import React, { useState, useEffect, useRef } from 'react';
import { SiteContent, ContactMessage, EventPosition, LightColor, BlinkSpeed, ChatMode } from '../types';
import { getRegistrations, getContactMessages, syncLocalToCloud, uploadFile } from '../services/firebase';
import { askAI } from '../services/gemini';
import { X, Save, Edit2, Menu, Database, Loader2, CloudUpload, Eye, Download, Film, Users, Mail, Trash2, Plus, Sparkles, Lock, Briefcase, FileText, Info } from 'lucide-react';

interface AdminPanelProps {
  content: SiteContent;
  onSave: (newContent: SiteContent) => Promise<void>;
  onClose: () => void;
  onLocalUpload: (type: any, file: File) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ content, onSave, onClose, onLocalUpload }) => {
  // 🔐 امنیت: لاجیک رمز عبور
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

  const [formData, setFormData] = useState<SiteContent>(content || {});
  const [activeTab, setActiveTab] = useState<'general' | 'menu' | 'special_event' | 'ai_config' | 'works' | 'articles' | 'registrations' | 'inbox' | 'about'>('general');
  
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedReg, setSelectedReg] = useState<any | null>(null);

  const safeVal = (val: any) => {
      if (typeof val === 'object' && val !== null) return val.fa || val.en || '';
      return val || '';
  };

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

  // هندل کردن رمز عبور
  const handleLogin = (e: React.FormEvent) => {
      e.preventDefault();
      if (passwordInput === 'hope') {
          setIsAuthenticated(true);
      } else {
          alert('رمز عبور اشتباه است!');
      }
  };

  const handleFileUpload = async (file: File, field: string, index?: number) => {
    setUploading(true);
    try {
      // آپلود روی سرور لیارا
      const url = await uploadFile(file);
      const newData = { ...formData };
      
      if (field === 'article' && typeof index === 'number') {
        if (!newData.articles) newData.articles = [];
        newData.articles[index].coverUrl = url;
      } else if (field === 'work' && typeof index === 'number') {
        if (!newData.works) newData.works = [];
        newData.works[index].imageUrl = url;
      } else if (field === 'event' && typeof index === 'number') {
        if (!newData.eventsList) newData.eventsList = [];
        newData.eventsList[index].imageUrl = url;
      } else if (field === 'logo') {
        newData.logoUrl = url;
      } else if (field === 'poster') {
        newData.posterUrl = url;
      } else if (field === 'specialPoster') {
         if(!newData.specialEvent) newData.specialEvent = {} as any;
         newData.specialEvent!.posterUrl = url;
      }
      
      setFormData(newData);
    } catch (e) { alert("آپلود نشد. اتصال سرور را چک کنید."); }
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
    alert("تغییرات با موفقیت ذخیره شد.");
  };

  const addArticle = () => {
    setFormData({
        ...formData,
        articles: [...(formData.articles || []), { id: Date.now().toString(), title: {fa:'عنوان جدید',en:'New Title'}, summary: {fa:'',en:''}, content: {fa:'',en:''}, author: {fa:'تحریریه',en:'Editorial'}, date: '1404', coverUrl: '', tags: '' }]
    });
  };

  const addWork = () => {
    setFormData({
        ...formData,
        works: [...(formData.works || []), { id: Date.now().toString(), title: {fa:'اثر جدید',en:'New Work'}, year: '2025', imageUrl: '', link: '', description: '' }]
    });
  };

  const addMenuItem = () => {
    setFormData({
        ...formData,
        menuItems: [...(formData.menuItems || []), { id: Date.now().toString(), title: {fa:'منو جدید',en:'New Item'}, link: '#', description: {fa:'',en:''} }]
    });
  };

  const exportToCSV = () => {
      if (!registrations || registrations.length === 0) return alert("داده‌ای وجود ندارد");
      const headers = ["نام فیلم", "کارگردان", "تلفن", "ایمیل", "لینک فیلم"];
      const rows = registrations.map(reg => [
          safeVal(reg.filmTitleFa), safeVal(reg.directorNameFa), safeVal(reg.phone), safeVal(reg.email), safeVal(reg.filmLink)
      ]);
      const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      const link = document.createElement("a");
      link.href = encodeURI(csvContent);
      link.download = "registrations.csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  // 🔒 اگر رمز زده نشده، فرم ورود نشان بده
  if (!isAuthenticated) {
      return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur">
              <div className="bg-[#111] p-8 rounded-xl border border-white/10 text-center w-80 shadow-2xl">
                  <Lock size={40} className="text-yellow-500 mx-auto mb-4"/>
                  <h2 className="text-white font-bold mb-4">مدیریت سودای خیال</h2>
                  <form onSubmit={handleLogin} className="space-y-4">
                      <input 
                        type="password" 
                        value={passwordInput} 
                        onChange={e => setPasswordInput(e.target.value)} 
                        className="w-full bg-black border border-white/20 p-3 rounded text-white text-center tracking-[5px] outline-none focus:border-yellow-500 transition"
                        placeholder="••••"
                        autoFocus
                      />
                      <div className="flex gap-2">
                          <button type="button" onClick={onClose} className="flex-1 py-2 text-xs text-gray-400 hover:text-white">لغو</button>
                          <button type="submit" className="flex-1 bg-white text-black font-bold py-2 rounded text-xs hover:bg-gray-200">ورود</button>
                      </div>
                  </form>
              </div>
          </div>
      );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl p-4" dir="rtl">
      
      {/* مودال نمایش جزئیات ثبت‌نام */}
      {selectedReg && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4" onClick={() => setSelectedReg(null)}>
              <div className="bg-[#111] border border-white/20 w-full max-w-2xl h-[80vh] rounded-xl overflow-y-auto p-6 relative" onClick={e => e.stopPropagation()}>
                  <button onClick={() => setSelectedReg(null)} className="absolute top-4 left-4 text-white hover:text-red-500"><X/></button>
                  <h3 className="text-xl font-bold text-yellow-500 mb-6 border-b border-white/10 pb-4">{safeVal(selectedReg.filmTitleFa)}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
                      <div><span className="text-white/50 block text-xs">کارگردان:</span> {safeVal(selectedReg.directorNameFa)}</div>
                      <div><span className="text-white/50 block text-xs">موبایل:</span> {safeVal(selectedReg.phone)}</div>
                      <div><span className="text-white/50 block text-xs">ایمیل:</span> {safeVal(selectedReg.email)}</div>
                      <div><span className="text-white/50 block text-xs">تاریخ:</span> {selectedReg.submittedAt}</div>
                      <div className="col-span-full bg-white/5 p-3 rounded"><span className="text-white/50 block text-xs mb-1">خلاصه داستان:</span> {safeVal(selectedReg.synopsis || selectedReg.logline)}</div>
                      <div className="col-span-full space-y-2">
                          {selectedReg.filmLink && <a href={selectedReg.filmLink} target="_blank" className="block text-blue-400">📥 دانلود فیلم</a>}
                          {selectedReg.posterLink && <a href={selectedReg.posterLink} target="_blank" className="block text-blue-400">🖼️ مشاهده پوستر</a>}
                      </div>
                  </div>
              </div>
          </div>
      )}

      <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-6xl h-[90vh] flex flex-col rounded-xl overflow-hidden shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b border-white/5 bg-[#0a0a0a]">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-light text-white flex items-center gap-3"><Edit2 size={20} className="text-yellow-500" /> <span>پنل مدیریت</span></h2>
            <span className="text-[10px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded border border-green-500/20">آنلاین (Liara)</span>
          </div>
          <button onClick={onClose}><X className="text-white hover:text-red-500 transition" /></button>
        </div>

        <div className="flex flex-1 overflow-hidden">
            {/* سایدبار */}
            <div className="w-56 bg-black/50 border-l border-white/5 flex flex-col p-4 gap-2 overflow-y-auto shrink-0">
                <TabButton active={activeTab === 'registrations'} onClick={() => setActiveTab('registrations')} icon={Users} label="ثبت‌نام‌ها" />
                <TabButton active={activeTab === 'inbox'} onClick={() => setActiveTab('inbox')} icon={Mail} label="پیام‌ها" />
                <div className="h-px bg-white/10 my-2"></div>
                <TabButton active={activeTab === 'general'} onClick={() => setActiveTab('general')} icon={Edit2} label="عمومی" />
                <TabButton active={activeTab === 'special_event'} onClick={() => setActiveTab('special_event')} icon={Sparkles} label="بنر و چراغ" />
                <TabButton active={activeTab === 'ai_config'} onClick={() => setActiveTab('ai_config')} icon={Database} label="هوش مصنوعی" />
                <div className="h-px bg-white/10 my-2"></div>
                <TabButton active={activeTab === 'menu'} onClick={() => setActiveTab('menu')} icon={Menu} label="منو" />
                <TabButton active={activeTab === 'works'} onClick={() => setActiveTab('works')} icon={Briefcase} label="آثار" />
                <TabButton active={activeTab === 'articles'} onClick={() => setActiveTab('articles')} icon={FileText} label="مقالات" />
                <TabButton active={activeTab === 'about'} onClick={() => setActiveTab('about')} icon={Info} label="درباره ما" />
            </div>

            {/* محتوا */}
            <div className="flex-1 p-8 overflow-y-auto bg-[#0f0f0f] text-white">
                
                {activeTab === 'registrations' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold flex items-center gap-2"><Users size={18}/> لیست شرکت‌کنندگان ({registrations.length})</h3>
                            <div className="flex gap-2">
                                <button onClick={exportToCSV} className="bg-green-600 px-3 py-1 rounded text-xs flex items-center gap-1"><Download size={12}/> خروجی اکسل</button>
                                <button onClick={() => fetchData('regs')} className="bg-white/10 px-3 py-1 rounded text-xs"><Loader2 size={12}/></button>
                            </div>
                        </div>
                        {loadingData ? <div className="text-center py-10"><Loader2 className="animate-spin mx-auto"/></div> : (
                            <div className="overflow-x-auto border border-white/10 rounded-lg">
                                <table className="w-full text-right text-xs">
                                    <thead className="bg-white/5 text-white/50 uppercase">
                                        <tr>
                                            <th className="px-4 py-3">فیلم</th>
                                            <th className="px-4 py-3">کارگردان</th>
                                            <th className="px-4 py-3">موبایل</th>
                                            <th className="px-4 py-3">تاریخ</th>
                                            <th className="px-4 py-3 text-center">عملیات</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {registrations.map((reg, idx) => (
                                            <tr key={idx} className="hover:bg-white/5 transition">
                                                <td className="px-4 py-3 font-bold">{safeVal(reg.filmTitleFa)}</td>
                                                <td className="px-4 py-3">{safeVal(reg.directorNameFa)}</td>
                                                <td className="px-4 py-3 font-mono">{safeVal(reg.phone)}</td>
                                                <td className="px-4 py-3 font-mono opacity-50">{reg.submittedAt ? new Date(reg.submittedAt).toLocaleDateString('fa-IR') : '-'}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <button onClick={() => setSelectedReg(reg)} className="text-blue-400 hover:bg-blue-400/20 p-1.5 rounded"><Eye size={14}/></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {registrations.length === 0 && <div className="text-center py-8 text-white/30">لیست خالی است</div>}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'inbox' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center mb-4"><h3 className="font-bold">صندوق پیام‌ها</h3><button onClick={() => fetchData('msgs')} className="bg-white/10 px-2 py-1 rounded text-xs">بروزرسانی</button></div>
                        <div className="grid gap-3">
                            {messages.map((msg, idx) => (
                                <div key={idx} className="bg-white/5 border border-white/10 p-4 rounded-lg">
                                    <div className="flex justify-between mb-2">
                                        <span className="font-bold text-sm">{safeVal(msg.name)}</span>
                                        <span className="text-[10px] text-white/40">{msg.date}</span>
                                    </div>
                                    <div className="text-xs text-blue-300 mb-2">{safeVal(msg.email)}</div>
                                    <p className="text-sm text-gray-300 bg-black/20 p-2 rounded">{safeVal(msg.message)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'general' && (
                    <div className="space-y-6 max-w-2xl">
                        <InputGroup label="لینک ویدیو پس‌زمینه (MP4)" value={formData.videoUrl} onChange={v => setFormData({...formData, videoUrl: v})} />
                        <InputGroup label="لینک لوگو" value={formData.logoUrl} onChange={v => setFormData({...formData, logoUrl: v})} />
                        <div className="border-t border-white/10 pt-4">
                            <label className="text-xs block mb-2">آپلود لوگوی جدید</label>
                            <input type="file" className="text-xs" onChange={e => e.target.files && handleFileUpload(e.target.files[0], 'logo')} />
                        </div>
                        <div className="flex items-center gap-4">
                            <label className="text-xs text-gray-400">سایز لوگو</label>
                            <input type="range" min="1" max="10" step="0.5" value={formData.logoSize} onChange={e => setFormData({...formData, logoSize: +e.target.value})} className="flex-1" />
                        </div>
                        <InputGroup label="نام شرکت (فارسی)" value={formData.companyName?.fa} onChange={v => setFormData({...formData, companyName: {...formData.companyName!, fa: v}})} />
                        <div className="p-4 bg-purple-900/10 border border-purple-500/20 rounded-lg">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" checked={formData.enableDarkRoom} onChange={e => setFormData({...formData, enableDarkRoom: e.target.checked})} className="w-5 h-5 accent-purple-500" />
                                <span className="font-bold text-purple-200">فعال‌سازی اتاق تاریک (آیکون چشم)</span>
                            </label>
                        </div>
                    </div>
                )}

                {activeTab === 'special_event' && (
                    <div className="space-y-6 max-w-3xl">
                        <div className="flex items-center gap-3 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                            <input type="checkbox" checked={formData.specialEvent?.isActive} onChange={e => setFormData({...formData, specialEvent: {...formData.specialEvent!, isActive: e.target.checked}})} className="w-5 h-5 accent-yellow-500" />
                            <div>
                                <span className="font-bold text-yellow-500 block">فعال‌سازی بنر جشنواره</span>
                                <span className="text-[10px] text-gray-400">این بنر در صفحه اصلی نمایش داده می‌شود</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs text-gray-400">رنگ چراغ وضعیت</label>
                                <select value={formData.specialEvent?.lightColor || 'yellow'} onChange={e => setFormData({...formData, specialEvent: {...formData.specialEvent!, lightColor: e.target.value as LightColor}})} className="w-full bg-black border border-white/20 p-2 rounded text-sm">
                                    <option value="green">🟢 سبز (عادی)</option>
                                    <option value="yellow">🟡 زرد (هشدار)</option>
                                    <option value="red">🔴 قرمز (پایان/اضطرار)</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-gray-400">سرعت چشمک‌زن</label>
                                <select value={formData.specialEvent?.blinkSpeed || 'slow'} onChange={e => setFormData({...formData, specialEvent: {...formData.specialEvent!, blinkSpeed: e.target.value as BlinkSpeed}})} className="w-full bg-black border border-white/20 p-2 rounded text-sm">
                                    <option value="none">ثابت (بدون چشمک)</option>
                                    <option value="slow">کند (آرام)</option>
                                    <option value="fast">تند (سریع)</option>
                                </select>
                            </div>
                        </div>

                        <div className="bg-white/5 p-4 rounded border border-white/10">
                            <label className="text-xs text-gray-400 block mb-2">موقعیت چت هوشمند</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="radio" name="chatMode" value="banner" checked={formData.specialEvent?.chatMode !== 'floating'} onChange={() => setFormData({...formData, specialEvent: {...formData.specialEvent!, chatMode: 'banner'}})} /> داخل بنر جشنواره</label>
                                <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="radio" name="chatMode" value="floating" checked={formData.specialEvent?.chatMode === 'floating'} onChange={() => setFormData({...formData, specialEvent: {...formData.specialEvent!, chatMode: 'floating'}})} /> شناور (پایین صفحه)</label>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <InputGroup label="عنوان (فارسی)" value={safeVal(formData.specialEvent?.title?.fa)} onChange={v => setFormData({...formData, specialEvent: {...formData.specialEvent!, title: {...formData.specialEvent!.title, fa: v}}})} />
                            <InputGroup label="تاریخ ددلاین" value={safeVal(formData.specialEvent?.date)} onChange={v => setFormData({...formData, specialEvent: {...formData.specialEvent!, date: v}})} />
                        </div>
                        <InputGroup label="توضیحات کوتاه" value={safeVal(formData.specialEvent?.description?.fa)} onChange={v => setFormData({...formData, specialEvent: {...formData.specialEvent!, description: {...formData.specialEvent!.description, fa: v}}})} />
                        
                        <div className="border-t border-white/10 pt-4">
                            <label className="text-xs block mb-2">آپلود پوستر کامل (داخل مودال)</label>
                            <input type="file" className="text-xs" onChange={e => e.target.files && handleFileUpload(e.target.files[0], 'specialPoster')} />
                            {uploading && <span className="text-xs text-yellow-500 animate-pulse mr-2">در حال آپلود...</span>}
                            {formData.specialEvent?.posterUrl && <img src={formData.specialEvent.posterUrl} className="h-20 mt-2 rounded border border-white/20"/>}
                        </div>
                    </div>
                )}

                {activeTab === 'ai_config' && (
                    <div className="space-y-4 max-w-2xl">
                        <div className="bg-gradient-to-br from-purple-900/20 to-black p-6 rounded-xl border border-purple-500/30">
                            <div className="flex items-center gap-3 mb-4">
                                <Sparkles className="text-purple-400" />
                                <h3 className="font-bold text-purple-100">تنظیمات مغز هوش مصنوعی</h3>
                            </div>
                            <p className="text-xs text-gray-400 mb-2 leading-6">در اینجا می‌توانید به هوش مصنوعی بگویید چطور رفتار کند. مثلاً اگر جشنواره تمام شده، به او بگویید که مودبانه کاربران را به سال بعد ارجاع دهد.</p>
                            <textarea 
                                value={formData.aiSystemPrompt || ''}
                                onChange={e => setFormData({...formData, aiSystemPrompt: e.target.value})}
                                className="w-full bg-black/50 border border-white/20 rounded-lg p-4 text-sm text-white h-40 focus:border-purple-500 outline-none leading-7"
                                placeholder="مثال: تو دستیار جشنواره سودای خیال هستی. الان مهلت ارسال تمام شده. لطفا به کاربران بگو منتظر اعلام نتایج باشند..."
                            />
                        </div>
                    </div>
                )}

                {activeTab === 'menu' && (
                    <div className="space-y-4">
                        <div className="flex justify-between"><h3 className="font-bold">آیتم‌های منو</h3><button onClick={addMenuItem} className="bg-white/10 text-xs px-3 py-1 rounded">+ افزودن</button></div>
                        {formData.menuItems?.map((item, i) => (
                            <div key={item.id || i} className="flex gap-2 items-center bg-white/5 p-2 rounded">
                                <input value={safeVal(item.title?.fa)} onChange={e => {const n=[...formData.menuItems]; n[i].title.fa=e.target.value; setFormData({...formData, menuItems:n})}} className="bg-black/30 border border-white/10 text-xs p-2 rounded w-1/3 text-white" placeholder="عنوان فارسی" />
                                <input value={safeVal(item.title?.en)} onChange={e => {const n=[...formData.menuItems]; n[i].title.en=e.target.value; setFormData({...formData, menuItems:n})}} className="bg-black/30 border border-white/10 text-xs p-2 rounded w-1/3 text-white" placeholder="English Title" dir="ltr" />
                                <input value={safeVal(item.link)} onChange={e => {const n=[...formData.menuItems]; n[i].link=e.target.value; setFormData({...formData, menuItems:n})}} className="bg-black/30 border border-white/10 text-xs p-2 rounded w-1/3 text-white" placeholder="Link (works, about...)" dir="ltr" />
                                <button onClick={() => {const n=formData.menuItems.filter((_, idx)=>idx!==i); setFormData({...formData, menuItems:n})}} className="text-red-500 p-2"><Trash2 size={16}/></button>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'works' && (
                    <div className="space-y-6">
                        <button onClick={addWork} className="bg-blue-600 px-4 py-2 rounded text-xs">+ افزودن اثر جدید</button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {formData.works?.map((work, i) => (
                                <div key={work.id || i} className="bg-white/5 p-4 rounded border border-white/10 relative">
                                    <button onClick={() => {const n=formData.works!.filter((_, idx)=>idx!==i); setFormData({...formData, works:n})}} className="absolute top-2 left-2 text-red-500"><Trash2 size={16}/></button>
                                    <div className="space-y-3">
                                        <div className="flex gap-2">
                                            <InputGroup label="عنوان (FA)" value={safeVal(work.title?.fa)} onChange={v => {const n=[...formData.works!]; n[i].title.fa=v; setFormData({...formData, works:n})}} />
                                            <InputGroup label="سال" value={safeVal(work.year)} onChange={v => {const n=[...formData.works!]; n[i].year=v; setFormData({...formData, works:n})}} />
                                        </div>
                                        <InputGroup label="لینک ویدیو/صفحه" value={safeVal(work.link)} onChange={v => {const n=[...formData.works!]; n[i].link=v; setFormData({...formData, works:n})}} />
                                        <div>
                                            <label className="text-xs text-gray-400 block mb-1">تصویر کاور</label>
                                            <input type="file" className="text-xs" onChange={e => e.target.files && handleFileUpload(e.target.files[0], 'work', i)} />
                                            {work.imageUrl && <img src={work.imageUrl} className="h-16 mt-2 rounded object-cover" />}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'articles' && (
                    <div className="space-y-8">
                        <button onClick={addArticle} className="bg-yellow-600 px-4 py-2 rounded text-xs font-bold">+ نوشتن مقاله جدید</button>
                        {formData.articles?.map((art, i) => (
                            <div key={art.id || i} className="bg-white/5 p-6 rounded-xl border border-white/10 space-y-4 relative group">
                                <div className="absolute top-4 left-4 flex gap-2">
                                    <button onClick={() => {const n=formData.articles!.filter((_, idx)=>idx!==i); setFormData({...formData, articles:n})}} className="text-red-500 bg-black/50 p-2 rounded hover:bg-red-500/20"><Trash2 size={16}/></button>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputGroup label="عنوان مقاله" value={safeVal(art.title)} onChange={v => {const n=[...formData.articles!]; n[i].title=v; setFormData({...formData, articles:n})}} />
                                    <InputGroup label="نویسنده" value={safeVal(art.author)} onChange={v => {const n=[...formData.articles!]; n[i].author=v; setFormData({...formData, articles:n})}} />
                                </div>

                                <div className="bg-black/30 p-4 rounded border border-white/5">
                                    <div className="flex gap-4 items-start">
                                        <div className="flex-1">
                                            <label className="text-xs text-gray-400 block mb-2">تصویر شاخص مقاله</label>
                                            <input type="file" className="text-xs w-full" onChange={e => e.target.files && handleFileUpload(e.target.files[0], 'article', i)} />
                                            {uploading && <span className="text-[10px] text-yellow-500 block mt-1">در حال آپلود...</span>}
                                        </div>
                                        {art.coverUrl && <img src={art.coverUrl} className="w-24 h-24 object-cover rounded border border-white/20" />}
                                    </div>
                                </div>

                                <InputGroup label="هشتگ‌ها (با کاما جدا کنید)" value={art.tags} onChange={v => {const n=[...formData.articles!]; n[i].tags=v; setFormData({...formData, articles:n})}} placeholder="سینما, هوش مصنوعی, نقد" />
                                
                                <div>
                                    <label className="text-xs text-gray-400 block mb-2">متن کامل مقاله</label>
                                    <textarea 
                                        value={safeVal(art.content)} 
                                        onChange={e => {const n=[...formData.articles!]; n[i].content=e.target.value; setFormData({...formData, articles:n})}} 
                                        className="w-full bg-black border border-white/20 p-3 rounded text-sm h-64 focus:border-yellow-500 outline-none leading-7"
                                        placeholder="متن خود را اینجا بنویسید..."
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'about' && (
                    <div className="space-y-4">
                        <label className="text-xs text-gray-400">متن بیانیه / درباره ما</label>
                        <textarea value={safeVal(formData.about?.manifesto?.fa)} onChange={e => setFormData({...formData, about: {...formData.about!, manifesto: {fa: e.target.value, en: formData.about?.manifesto.en || ''}}})} className="w-full h-40 bg-black/50 border border-white/20 p-3 rounded text-sm" />
                        <InputGroup label="آدرس" value={safeVal(formData.about?.address?.fa)} onChange={v => setFormData({...formData, about: {...formData.about!, address: {fa: v, en: ''}}})} />
                    </div>
                )}

            </div>
        </div>

        <div className="p-6 border-t border-white/10 bg-[#0a0a0a] flex justify-end gap-4">
          <button onClick={onClose} className="px-6 py-2 text-xs text-gray-500 hover:text-white">بستن</button>
          <button onClick={handleSubmit} className="px-6 py-2 bg-white text-black font-bold text-xs hover:bg-gray-200 transition flex items-center gap-2"><Save size={14} /> ذخیره تغییرات</button>
        </div>
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, icon: Icon, label }: any) => (
    <button onClick={onClick} className={`flex items-center gap-3 p-3 rounded-lg transition-all text-xs font-bold w-full ${active ? 'bg-white text-black' : 'text-white/50 hover:text-white hover:bg-white/5'}`}>
        <Icon size={16}/> {label}
    </button>
);

const InputGroup = ({ label, value, onChange, placeholder }: any) => (
  <div className="w-full"><label className="block text-[10px] text-gray-500 mb-1">{label}</label><input type="text" value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-black/50 border-b border-white/20 py-2 text-white outline-none text-sm focus:border-white transition" /></div>
);

export default AdminPanel;
