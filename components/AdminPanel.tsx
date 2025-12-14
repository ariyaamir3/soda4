import React, { useState, useEffect, useRef } from 'react';
import { SiteContent, FullRegistrationData, ContactMessage, EventPosition } from '../types';
import { saveFirebaseConfig, getConnectionStatus, getRegistrations, getContactMessages, syncLocalToCloud } from '../services/firebase';
import { askAI } from '../services/gemini';
import { X, Save, Edit2, Menu, Database, Loader2, RefreshCw, Sparkles, Briefcase, FileText, Ticket, Mail, Info, CloudUpload, Eye, Download, Film, Users, MessageSquare, Trash2, Plus, CheckCircle2 } from 'lucide-react';

interface AdminPanelProps {
  content: SiteContent;
  onSave: (newContent: SiteContent) => Promise<void>;
  onClose: () => void;
  onLocalUpload: (type: 'video' | 'logo' | 'work', file: File, workId?: string) => void;
}

interface ChatMessage { role: 'user' | 'ai'; text: string; }

const AdminPanel: React.FC<AdminPanelProps> = ({ content, onSave, onClose, onLocalUpload }) => {
  const [formData, setFormData] = useState<SiteContent>(content || {});
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'menu' | 'special_event' | 'events_list' | 'works' | 'articles' | 'about' | 'database' | 'darkroom' | 'registrations' | 'inbox'>('general');
  const [connectionStatus, setConnectionStatus] = useState<any>({});

  const [registrations, setRegistrations] = useState<any[]>([]); 
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [selectedReg, setSelectedReg] = useState<any | null>(null);

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [aiMode, setAiMode] = useState<'auto' | 'manual'>('auto');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [dbConfig, setDbConfig] = useState({ apiKey: '', authDomain: '', projectId: '', storageBucket: '', messagingSenderId: '', appId: '' });
  const [dbSaving, setDbSaving] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');

  // 🛡️ تابع محافظ: این تابع هر دیتای خراب یا قدیمی رو تبدیل به متن سالم میکنه تا صفحه سیاه نشه
  const safeVal = (val: any): string => {
      if (val === null || val === undefined) return '';
      if (typeof val === 'string') return val;
      if (typeof val === 'number') return String(val);
      if (typeof val === 'object') {
          // اگر دیتای قدیمی (آبجکت) بود، سعی کن فارسی یا انگلیسیش رو برگردونی
          return val.fa || val.en || val.toString() || '';
      }
      return '';
  };

  useEffect(() => {
      const stored = localStorage.getItem('firebase_config_override');
      if (stored) { try { setDbConfig(JSON.parse(stored)); } catch(e) {} }
      setConnectionStatus(getConnectionStatus());

      setFormData(prev => ({
          ...prev,
          about: prev.about || { manifesto: { fa: '', en: '' }, address: { fa: '', en: '' }, socials: [] },
          works: prev.works || [],
          menuItems: prev.menuItems || [],
          eventsList: prev.eventsList || [],
          articles: prev.articles || [],
          specialEvent: prev.specialEvent || { isActive: false, title: {fa:'', en:''}, description: {fa:'', en:''}, date: '', position: 'top-right', enableChat: true, enableRegister: true, imageUrl: '', buttonText: '' }
      }));
  }, []);

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

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatHistory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSaving(true);
    try { await onSave(formData); alert("ذخیره شد"); } catch (e) { alert("فقط در مرورگر ذخیره شد (آفلاین)"); }
    setSaving(false);
  };

  const handleDbSave = () => {
      setDbSaving('processing');
      setTimeout(() => { try { saveFirebaseConfig(dbConfig); setDbSaving('success'); setConnectionStatus(getConnectionStatus()); } catch (e) { setDbSaving('error'); alert("خطا"); } }, 1000);
  };

  const handleForceSync = async () => {
      setSyncStatus('syncing');
      try {
          const msg = await syncLocalToCloud();
          setSyncStatus('success');
          alert(msg);
      } catch (e: any) {
          setSyncStatus('error');
          alert("خطا: " + e.message);
      }
      setTimeout(() => setSyncStatus('idle'), 3000);
  };

  const handleAskKiarostami = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsAiThinking(true);
    const aiResponse = await askAI(userMsg, aiMode);
    setChatHistory(prev => [...prev, { role: 'ai', text: aiResponse.text }]);
    setIsAiThinking(false);
  };

  const addArticle = () => {
      setFormData({
          ...formData,
          articles: [...(formData.articles || []), {
              id: Date.now().toString(),
              title: 'عنوان جدید', summary: '', content: '', author: '', date: '1404', coverUrl: ''
          }]
      });
  };

  const addEvent = () => {
      setFormData({
          ...formData,
          eventsList: [...(formData.eventsList || []), {
              id: Date.now().toString(),
              title: 'رویداد جدید', date: '', description: '', imageUrl: '', link: ''
          }]
      });
  };

  const addWork = () => {
      setFormData({
          ...formData,
          works: [...(formData.works || []), {
              id: Date.now().toString(),
              title: { fa: 'اثر جدید', en: 'New Work' },
              year: '2024',
              imageUrl: '',
              description: '',
              link: ''
          }]
      });
  };

  const addMenuItem = () => {
      setFormData({
          ...formData,
          menuItems: [...(formData.menuItems || []), {
              id: Date.now().toString(),
              title: {fa: 'آیتم جدید', en: 'New'}, 
              description: {fa:'', en:''}, 
              link: '#'
          }]
      });
  };

  const exportToCSV = () => {
      if (!registrations || registrations.length === 0) return alert("داده‌ای برای خروجی وجود ندارد");
      const headers = ["نام کارگردان (FA)", "نام انگلیسی", "نام فیلم", "بخش", "موبایل", "ایمیل", "تاریخ ثبت", "لینک فیلم"];
      const rows = registrations.map(reg => [
          safeVal(reg.directorNameFa),
          safeVal(reg.directorNameEn),
          safeVal(reg.filmTitleFa),
          safeVal(reg.section),
          safeVal(reg.phone),
          safeVal(reg.email),
          reg.submittedAt || '-',
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl p-4" dir="rtl">

      {selectedReg && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4" onClick={() => setSelectedReg(null)}>
              <div className="bg-[#111] border border-white/20 w-full max-w-3xl h-[80vh] rounded-xl overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
                  <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                      <h3 className="text-xl font-bold text-yellow-500">{safeVal(selectedReg.filmTitleFa)}</h3>
                      <button onClick={() => setSelectedReg(null)}><X className="text-white hover:text-red-500"/></button>
                  </div>
                  <div className="grid grid-cols-2 gap-6 text-sm text-gray-300">
                      <div><strong className="text-white block mb-1">کارگردان:</strong> {safeVal(selectedReg.directorNameFa)} ({safeVal(selectedReg.directorNameEn)})</div>
                      <div><strong className="text-white block mb-1">بخش:</strong> {safeVal(selectedReg.section)}</div>
                      <div><strong className="text-white block mb-1">تماس:</strong> {safeVal(selectedReg.phone)}</div>
                      <div><strong className="text-white block mb-1">ایمیل:</strong> {safeVal(selectedReg.email)}</div>
                      <div><strong className="text-white block mb-1">تاریخ تولد:</strong> {safeVal(selectedReg.birthDate)}</div>
                      <div><strong className="text-white block mb-1">شهر/کشور:</strong> {safeVal(selectedReg.city)} - {safeVal(selectedReg.country)}</div>
                      <div className="col-span-2 bg-white/5 p-3 rounded"><strong className="text-white block mb-1">خلاصه داستان:</strong> {safeVal(selectedReg.synopsis || selectedReg.logline)}</div>
                      <div className="col-span-2 grid grid-cols-2 gap-4 bg-white/5 p-3 rounded">
                          <div><strong>مدت:</strong> {safeVal(selectedReg.duration)}</div>
                          <div><strong>سال تولید:</strong> {safeVal(selectedReg.productionYear)}</div>
                          <div><strong>فرمت:</strong> {safeVal(selectedReg.fileFormat)}</div>
                          <div><strong>درصد هوش مصنوعی:</strong> {safeVal(selectedReg.humanPercent)}%</div>
                      </div>
                      <div className="col-span-2"><strong className="text-white block mb-1">مدل‌های AI:</strong> {safeVal(selectedReg.aiModels)}</div>
                      <div className="col-span-2 space-y-2 pt-4 border-t border-white/10">
                          {selectedReg.filmLink && <a href={selectedReg.filmLink} target="_blank" rel="noopener noreferrer" className="block text-blue-400 hover:underline">📥 لینک دانلود فیلم</a>}
                          {selectedReg.posterLink && <a href={selectedReg.posterLink} target="_blank" rel="noopener noreferrer" className="block text-blue-400 hover:underline">🖼️ لینک پوستر</a>}
                          {selectedReg.projectFilesLink && <a href={selectedReg.projectFilesLink} target="_blank" rel="noopener noreferrer" className="block text-blue-400 hover:underline">📂 فایل‌های پروژه</a>}
                      </div>
                  </div>
              </div>
          </div>
      )}

      <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-5xl h-[90vh] flex flex-col rounded-xl overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-white/5 bg-[#0a0a0a]">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-light text-white flex items-center gap-3"><Edit2 size={20} className="text-white/70" /> <span>مدیریت محتوا</span></h2>
            <div className={`px-2 py-0.5 rounded-full text-[10px] border ${connectionStatus.isConnected ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>{connectionStatus.isConnected ? 'متصل' : 'دمو'}</div>
          </div>
          <button onClick={onClose}><X className="text-white hover:text-red-500" /></button>
        </div>

        <div className="flex flex-1 overflow-hidden">
            <div className="w-48 bg-black/50 border-l border-white/5 flex flex-col p-4 gap-2 overflow-y-auto">
                <TabButton active={activeTab === 'registrations'} onClick={() => setActiveTab('registrations')} icon={Users} label="ثبت‌نام‌ها" />
                <TabButton active={activeTab === 'inbox'} onClick={() => setActiveTab('inbox')} icon={Mail} label="پیام‌ها" />
                <div className="h-px bg-white/10 my-2"></div>
                <TabButton active={activeTab === 'general'} onClick={() => setActiveTab('general')} icon={Edit2} label="عمومی" />
                <TabButton active={activeTab === 'about'} onClick={() => setActiveTab('about')} icon={Info} label="درباره ما" />
                <TabButton active={activeTab === 'menu'} onClick={() => setActiveTab('menu')} icon={Menu} label="منو" />
                <div className="h-px bg-white/10 my-2"></div>
                <TabButton active={activeTab === 'special_event'} onClick={() => setActiveTab('special_event')} icon={Sparkles} label="بنر ویژه" />
                <TabButton active={activeTab === 'events_list'} onClick={() => setActiveTab('events_list')} icon={Ticket} label="تقویم رویدادها" />
                <div className="h-px bg-white/10 my-2"></div>
                <TabButton active={activeTab === 'works'} onClick={() => setActiveTab('works')} icon={Briefcase} label="آثار (گالری)" />
                <TabButton active={activeTab === 'articles'} onClick={() => setActiveTab('articles')} icon={FileText} label="مقالات" />
                {formData.enableDarkRoom && <TabButton active={activeTab === 'darkroom'} onClick={() => setActiveTab('darkroom')} icon={Film} label="اتاق تاریک" />}
                <div className="h-px bg-white/10 my-2"></div>
                <TabButton active={activeTab === 'database'} onClick={() => setActiveTab('database')} icon={Database} label="دیتابیس" />
            </div>

            <div className="flex-1 p-6 overflow-y-auto bg-[#0f0f0f]">

                {activeTab === 'inbox' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-bold text-white flex items-center gap-2"><Mail size={20} /> صندوق پیام‌ها</h3><button type="button" onClick={() => fetchData('msgs')} className="bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded text-xs">بروزرسانی</button></div>
                        {messages.length === 0 ? <div className="text-center py-10 text-white/30">خالی</div> : (
                            <div className="grid gap-3">
                                {messages.map((msg, idx) => (
                                    <div key={idx} className="bg-white/5 border border-white/10 rounded-lg p-4 flex flex-col space-y-2">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-bold text-white text-sm">{safeVal(msg.name)}</h4>
                                            <span className="text-[9px] font-mono opacity-50">{msg.date}</span>
                                        </div>
                                        <div className="text-xs text-blue-300 font-mono select-all">{safeVal(msg.email)}</div>
                                        <p className="text-sm text-gray-300 bg-black/20 p-3 rounded leading-6 whitespace-pre-wrap">{safeVal(msg.message)}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'registrations' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2"><Users size={20} /> لیست شرکت‌کنندگان ({registrations.length})</h3>
                            <div className="flex gap-2">
                                <button type="button" onClick={exportToCSV} className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-xs flex items-center gap-1"><Download size={12} /> خروجی اکسل</button>
                                <button type="button" onClick={() => fetchData('regs')} className="bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded text-xs flex items-center gap-1"><RefreshCw size={12} /> بروزرسانی</button>
                            </div>
                        </div>
                        {registrations.length === 0 ? <div className="text-center py-10 text-white/30">لیست خالی است.</div> : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-right text-sm text-gray-400">
                                    <thead className="text-xs text-gray-500 uppercase bg-white/5 border-b border-white/10">
                                        <tr>
                                            <th className="px-4 py-3">نام فیلم</th>
                                            <th className="px-4 py-3">کارگردان</th>
                                            <th className="px-4 py-3">بخش</th>
                                            <th className="px-4 py-3">تاریخ</th>
                                            <th className="px-4 py-3 text-center">جزئیات</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {registrations.map((reg, idx) => (
                                            <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition">
                                                <td className="px-4 py-3 font-bold text-white truncate max-w-[150px]">{safeVal(reg.filmTitleFa)}</td>
                                                <td className="px-4 py-3 truncate max-w-[150px]">{safeVal(reg.directorNameFa)}</td>
                                                <td className="px-4 py-3 text-xs text-yellow-500 truncate">{safeVal(reg.section)}</td>
                                                <td className="px-4 py-3 text-[10px] font-mono opacity-50 dir-ltr">{reg.submittedAt ? new Date(reg.submittedAt).toLocaleDateString('fa-IR') : '-'}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <button type="button" onClick={() => setSelectedReg(reg)} className="text-blue-400 hover:bg-blue-400/20 p-1.5 rounded transition"><Eye size={16}/></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {activeTab !== 'registrations' && activeTab !== 'inbox' && activeTab !== 'darkroom' && (
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {activeTab === 'general' && (
                            <div className="space-y-4">
                                <InputGroup label="لینک ویدیو (mp4)" value={safeVal(formData.videoUrl)} onChange={(v: string) => setFormData({...formData, videoUrl: v})} />
                                <div className="p-4 bg-blue-900/10 border border-blue-500/20 rounded-lg"><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={formData.enableDarkRoom ?? false} onChange={(e) => setFormData({...formData, enableDarkRoom: e.target.checked})} className="w-4 h-4 rounded border-white/30 bg-black checked:bg-blue-500" /><span className="text-sm text-white font-bold">فعال‌سازی اتاق تاریک</span></label></div>
                                <div className="grid grid-cols-2 gap-4"><InputGroup label="لینک لوگو" value={safeVal(formData.logoUrl)} onChange={(v: string) => setFormData({...formData, logoUrl: v})} /><div><label className="text-[10px] text-gray-500">سایز لوگو</label><input type="range" min="1" max="8" step="0.5" value={formData.logoSize || 3} onChange={(e) => setFormData({...formData, logoSize: parseFloat(e.target.value)})} className="w-full" /></div></div>
                                <InputGroup label="نام شرکت (FA)" value={safeVal(formData.companyName?.fa)} onChange={(v: string) => setFormData({...formData, companyName: {...(formData.companyName || {}), fa: v}})} />
                                <InputGroup label="نام شرکت (EN)" value={safeVal(formData.companyName?.en)} onChange={(v: string) => setFormData({...formData, companyName: {...(formData.companyName || {}), en: v}})} />
                                <div className="p-4 bg-yellow-900/10 border border-yellow-500/20 rounded-lg space-y-3">
                                    <h4 className="text-sm text-yellow-500 font-bold flex items-center gap-2">📢 پوستر فراخوان جشنواره</h4>
                                    <InputGroup label="لینک پوستر فراخوان" value={safeVal(formData.specialEvent?.posterUrl)} onChange={(v: string) => setFormData({...formData, specialEvent: {...formData.specialEvent!, posterUrl: v}})} />
                                    <p className="text-[10px] text-gray-500">این پوستر در صفحه فراخوان کامل نمایش داده می‌شود</p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'about' && (
                            <div className="space-y-4">
                                <h4 className="text-white font-bold border-b border-white/10 pb-2">بیانیه / مانیفست</h4>
                                <textarea value={safeVal(formData.about?.manifesto?.fa)} onChange={(e) => setFormData({...formData, about: {...formData.about!, manifesto: {...formData.about!.manifesto, fa: e.target.value}}})} className="w-full bg-black/50 border-b border-white/20 p-2 text-white text-sm h-32 outline-none" />
                                <textarea dir="ltr" value={safeVal(formData.about?.manifesto?.en)} onChange={(e) => setFormData({...formData, about: {...formData.about!, manifesto: {...formData.about!.manifesto, en: e.target.value}}})} className="w-full bg-black/50 border-b border-white/20 p-2 text-white text-sm h-32 outline-none" />
                                <h4 className="text-white font-bold border-b border-white/10 pb-2 mt-4">اطلاعات تماس</h4>
                                <InputGroup label="آدرس (FA)" value={safeVal(formData.about?.address?.fa)} onChange={(v: string) => setFormData({...formData, about: {...formData.about!, address: {...formData.about?.address, fa: v}}})} />
                                <InputGroup label="Address (EN)" value={safeVal(formData.about?.address?.en)} onChange={(v: string) => setFormData({...formData, about: {...formData.about!, address: {...formData.about?.address, en: v}}})} />
                                <div className="space-y-2">{(formData.about?.socials || []).map((social, idx) => (<div key={idx} className="flex gap-2 items-center bg-black/30 p-2 rounded"><span className="text-xs w-20 uppercase font-mono text-white/50">{social.platform}</span><input type="text" dir="ltr" value={safeVal(social.url)} onChange={(e) => { const newSocials = [...formData.about!.socials]; newSocials[idx].url = e.target.value; setFormData({...formData, about: {...formData.about!, socials: newSocials}}); }} className="flex-1 bg-transparent border-none text-white text-sm outline-none" placeholder="Link..." /><input type="checkbox" checked={social.isActive} onChange={(e) => { const newSocials = [...formData.about!.socials]; newSocials[idx].isActive = e.target.checked; setFormData({...formData, about: {...formData.about!, socials: newSocials}}); }} /></div>))}</div>
                            </div>
                        )}

                        {activeTab === 'menu' && (
                            <div className="space-y-3">
                                <div className="flex justify-between"><h3 className="text-sm text-white/60">منو</h3><button type="button" onClick={addMenuItem} className="text-xs bg-white/10 px-2 py-1 rounded text-white">+ افزودن</button></div>
                                {(formData.menuItems || []).map((item, idx) => (
                                    <div key={item.id} className="grid grid-cols-12 gap-2 bg-black/40 p-2 rounded border border-white/5">
                                        <div className="col-span-4"><InputGroup label="عنوان" value={safeVal(item.title?.fa)} onChange={(v: string) => {const n=[...formData.menuItems!]; n[idx].title = {...(n[idx].title || {}), fa: v}; setFormData({...formData, menuItems:n})}} /></div>
                                        <div className="col-span-4"><InputGroup label="EN" value={safeVal(item.title?.en)} onChange={(v: string) => {const n=[...formData.menuItems!]; n[idx].title = {...(n[idx].title || {}), en: v}; setFormData({...formData, menuItems:n})}} /></div>
                                        <div className="col-span-3"><InputGroup label="لینک" value={safeVal(item.link)} onChange={(v: string) => {const n=[...formData.menuItems!]; n[idx].link=v; setFormData({...formData, menuItems:n})}} /></div>
                                        <div className="col-span-1"><button type="button" onClick={() => {const n=formData.menuItems!.filter((_, i)=>i!==idx); setFormData({...formData, menuItems:n})}} className="text-red-500"><Trash2 size={16}/></button></div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'special_event' && (
                            <div className="space-y-6">
                                <label className="flex items-center gap-2 cursor-pointer bg-white/5 p-2 rounded mb-4"><input type="checkbox" checked={formData.specialEvent?.isActive ?? false} onChange={(e) => setFormData({...formData, specialEvent: {...(formData.specialEvent || {title: {fa:'',en:''}, description:{fa:'',en:''}, date: '', position: 'top-right', enableChat:true, enableRegister:true, posterUrl: ''}), isActive: e.target.checked}})} /><span className="text-sm text-white font-bold">✅ فعال بودن بنر ویژه</span></label>
                                <div className="grid grid-cols-2 gap-4 bg-white/5 p-4 rounded border border-white/10 mb-4"><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={formData.specialEvent?.enableChat ?? true} onChange={(e) => setFormData({...formData, specialEvent: {...formData.specialEvent!, enableChat: e.target.checked}})} className="w-4 h-4"/><span className="text-xs text-white">فعال‌سازی چت هوشمند</span></label><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={formData.specialEvent?.enableRegister ?? true} onChange={(e) => setFormData({...formData, specialEvent: {...formData.specialEvent!, enableRegister: e.target.checked}})} className="w-4 h-4"/><span className="text-xs text-white">فعال‌سازی دکمه ثبت‌نام</span></label></div>
                                <InputGroup label="لینک پوستر داخل بلیط" value={safeVal(formData.specialEvent?.posterUrl)} onChange={(v: string) => setFormData({...formData, specialEvent: {...formData.specialEvent!, posterUrl: v}})} />
                                <div className="grid grid-cols-2 gap-4"><InputGroup label="عنوان" value={safeVal(formData.specialEvent?.title?.fa)} onChange={(v: string) => setFormData({...formData, specialEvent: {...formData.specialEvent!, title: {...formData.specialEvent?.title, fa: v}}})} /><InputGroup label="ددلاین" value={safeVal(formData.specialEvent?.date)} onChange={(v: string) => setFormData({...formData, specialEvent: {...formData.specialEvent!, date: v}})} /></div>
                                <InputGroup label="توضیحات کوتاه" value={safeVal(formData.specialEvent?.description?.fa)} onChange={(v: string) => setFormData({...formData, specialEvent: {...formData.specialEvent!, description: {...formData.specialEvent?.description, fa: v}}})} />
                                <div className="w-full"><label className="text-[10px] text-gray-500">موقعیت</label><select value={formData.specialEvent?.position || 'top-right'} onChange={(e) => setFormData({...formData, specialEvent: {...formData.specialEvent!, position: e.target.value as EventPosition}})} className="w-full bg-black/50 border-b border-white/20 py-2 text-white text-sm outline-none"><option value="top-right">بالا - راست</option><option value="top-left">بالا - چپ</option><option value="bottom-right">پایین - راست</option><option value="bottom-left">پایین - چپ</option></select></div>
                            </div>
                        )}

                        {activeTab === 'events_list' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center"><h3 className="text-sm text-white/60">تقویم رویدادها</h3><button type="button" onClick={addEvent} className="text-xs bg-yellow-600 px-3 py-1 rounded text-white flex items-center gap-1"><Plus size={12}/> جدید</button></div>
                                {(formData.eventsList || []).map((ev, index) => (
                                    <div key={ev.id || index} className="bg-black/40 p-4 rounded border border-white/5 space-y-4 relative">
                                        <div className="grid grid-cols-2 gap-4">
                                            {/* استفاده از safeVal برای جلوگیری از سیاه شدن */}
                                            <InputGroup label="عنوان" value={safeVal(ev.title)} onChange={(v: string) => {const n=[...(formData.eventsList || [])]; n[index].title=v; setFormData({...formData, eventsList:n})}} />
                                            <InputGroup label="تاریخ" value={safeVal(ev.date)} onChange={(v: string) => {const n=[...(formData.eventsList || [])]; n[index].date=v; setFormData({...formData, eventsList:n})}} />
                                        </div>
                                        <InputGroup label="لینک تصویر" value={safeVal(ev.imageUrl)} onChange={(v: string) => {const n=[...(formData.eventsList || [])]; n[index].imageUrl=v; setFormData({...formData, eventsList:n})}} />
                                        <div className="grid grid-cols-2 gap-4">
                                            <InputGroup label="مکان" value={safeVal(ev.location)} onChange={(v: string) => {const n=[...(formData.eventsList || [])]; n[index].location=v; setFormData({...formData, eventsList:n})}} />
                                            <InputGroup label="لینک" value={safeVal(ev.link)} onChange={(v: string) => {const n=[...(formData.eventsList || [])]; n[index].link=v; setFormData({...formData, eventsList:n})}} />
                                        </div>
                                        <div className="w-full"><label className="text-[10px] text-gray-500">توضیحات</label><textarea value={safeVal(ev.description)} onChange={(e) => {const n=[...(formData.eventsList || [])]; n[index].description=e.target.value; setFormData({...formData, eventsList:n})}} className="w-full bg-black/50 border-b border-white/20 p-2 text-white text-sm h-20 outline-none" /></div>
                                        <button type="button" onClick={() => {const n=(formData.eventsList || []).filter((_, i)=>i!==index); setFormData({...formData, eventsList:n})}} className="text-red-500 text-xs absolute top-4 left-4"><Trash2 size={16}/></button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'works' && (
                            <div className="space-y-4">
                                <div className="flex justify-between"><h3 className="text-sm text-white/60">آثار (گالری)</h3><button type="button" onClick={addWork} className="text-xs bg-white/10 px-2 py-1 rounded text-white">+ افزودن</button></div>
                                {formData.works?.map((work, index) => (<div key={work.id} className="bg-black/40 p-4 rounded border border-white/5 space-y-3 relative"><button type="button" onClick={() => {const n=formData.works!.filter((_, i)=>i!==index); setFormData({...formData, works:n})}} className="text-red-500 absolute top-2 left-2"><Trash2 size={16}/></button><div className="grid grid-cols-2 gap-4"><InputGroup label="عنوان (FA)" value={safeVal(work.title?.fa)} onChange={(v: string) => {const n=[...formData.works!]; n[index].title.fa=v; setFormData({...formData, works:n})}} /><InputGroup label="Title (EN)" value={safeVal(work.title?.en)} onChange={(v: string) => {const n=[...formData.works!]; n[index].title.en=v; setFormData({...formData, works:n})}} /></div><div className="grid grid-cols-2 gap-4"><InputGroup label="سال تولید" value={safeVal(work.year)} onChange={(v: string) => {const n=[...formData.works!]; n[index].year=v; setFormData({...formData, works:n})}} /><InputGroup label="لینک اثر" value={safeVal(work.link)} onChange={(v: string) => {const n=[...formData.works!]; n[index].link=v; setFormData({...formData, works:n})}} /></div><InputGroup label="لینک تصویر (کاور)" value={safeVal(work.imageUrl)} onChange={(v: string) => {const n=[...formData.works!]; n[index].imageUrl=v; setFormData({...formData, works:n})}} /><div className="w-full"><label className="text-[10px] text-gray-500">توضیحات</label><textarea value={safeVal(work.description)} onChange={(e) => {const n=[...formData.works!]; n[index].description=e.target.value; setFormData({...formData, works:n})}} className="w-full bg-black/50 border-b border-white/20 p-2 text-white text-sm h-16 outline-none" /></div></div>))}
                            </div>
                        )}

                        {activeTab === 'articles' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center"><h3 className="text-sm text-white/60">مقالات</h3><button type="button" onClick={addArticle} className="text-xs bg-yellow-600 px-3 py-1 rounded text-white flex items-center gap-1"><Plus size={12}/> جدید</button></div>
                                {(formData.articles || []).map((article, index) => (<div key={article.id} className="bg-black/40 p-4 rounded border border-white/5 space-y-4 relative"><InputGroup label="عنوان" value={safeVal(article.title)} onChange={(v: string) => {const n=[...(formData.articles || [])]; n[index].title=v; setFormData({...formData, articles:n})}} /><div className="w-full"><label className="text-[10px] text-gray-500">متن</label><textarea value={safeVal(article.content)} onChange={(e) => {const n=[...(formData.articles || [])]; n[index].content=e.target.value; setFormData({...formData, articles:n})}} className="w-full bg-black/50 border-b border-white/20 p-2 text-white text-sm h-32 outline-none" /></div><button type="button" onClick={() => {const n=(formData.articles || []).filter((_, i)=>i!==index); setFormData({...formData, articles:n})}} className="text-red-500 text-xs absolute top-4 left-4"><Trash2 size={16}/></button></div>))}
                            </div>
                        )}

                        {activeTab === 'database' && (
                            <div className="space-y-4">
                                 <InputGroup label="apiKey" value={dbConfig.apiKey} onChange={(v: string) => setDbConfig({...dbConfig, apiKey: v})} />
                                 <InputGroup label="projectId" value={dbConfig.projectId} onChange={(v: string) => setDbConfig({...dbConfig, projectId: v})} />
                                 <button type="button" onClick={handleDbSave} disabled={dbSaving === 'processing'} className="bg-blue-600 text-white px-6 py-2 rounded text-xs">{dbSaving === 'processing' ? '...' : 'ذخیره اتصال'}</button>
                                 <div className="bg-white/5 border border-white/10 p-6 rounded-lg text-center space-y-4 mt-8"><h4 className="font-bold text-white">همگام‌سازی اضطراری (آپلود به سرور)</h4><p className="text-xs text-gray-400">اگر اطلاعات در سایت اصلی تغییر نکرده، این دکمه را بزنید تا اطلاعات این دستگاه به سرور ارسال شود.</p><button type="button" onClick={handleForceSync} disabled={syncStatus === 'syncing'} className={`w-full py-3 rounded font-bold text-sm flex items-center justify-center gap-2 transition ${syncStatus === 'syncing' ? 'bg-yellow-600 cursor-wait' : 'bg-green-600 hover:bg-green-500'}`}>{syncStatus === 'idle' && <><CloudUpload size={18}/> آپلود اطلاعات به سرور</>}{syncStatus === 'syncing' && <><Loader2 size={18} className="animate-spin"/> در حال ارسال...</>}{syncStatus === 'success' && <><CheckCircle2 size={18}/> با موفقیت انجام شد!</>}{syncStatus === 'error' && "خطا در ارسال"}</button></div>
                            </div>
                        )}
                    </form>
                )}

                {activeTab === 'darkroom' && (
                    <div className="flex flex-col h-full">
                        <div className="bg-blue-900/10 border border-blue-500/20 rounded-lg p-4 mb-4 flex items-center justify-between"><div className="flex items-center gap-4"><div className="text-2xl">🕶️</div><div><h3 className="font-bold text-white">اتاق تاریک</h3><p className="text-xs text-white/50">جناب کیارستمی</p></div></div><div className="flex bg-black/50 rounded p-1 text-[10px] font-bold"><button onClick={() => setAiMode('auto')} className={`px-3 py-1 rounded ${aiMode === 'auto' ? 'bg-blue-600' : 'text-white/50'}`}>هوشمند</button><button onClick={() => setAiMode('manual')} className={`px-3 py-1 rounded ${aiMode === 'manual' ? 'bg-yellow-600' : 'text-white/50'}`}>دستی</button></div></div>
                        <div className="flex-1 bg-black/20 border border-white/5 rounded-lg mb-4 p-4 overflow-y-auto space-y-4 min-h-[300px] max-h-[400px]">{chatHistory.map((msg, idx) => (<div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[80%] p-3 rounded-lg text-sm ${msg.role === 'user' ? 'bg-white/10 text-white' : 'bg-blue-900/20 text-blue-100 border border-blue-500/20'}`}>{msg.text}</div></div>))}{isAiThinking && <div className="text-blue-400 text-xs flex items-center gap-2"><Loader2 size={12} className="animate-spin" /> ...</div>}<div ref={chatEndRef}></div></div>
                        <form onSubmit={handleAskKiarostami} className="flex gap-2"><input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="..." className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white text-sm outline-none" /><button type="submit" disabled={isAiThinking} className="bg-white text-black px-4 py-2 rounded-lg"><MessageSquare size={18} /></button></form>
                    </div>
                )}
            </div>
        </div>

        <div className="p-6 border-t border-white/10 bg-[#0a0a0a] flex justify-end gap-4">
          <button type="button" onClick={onClose} className="px-6 py-2 text-xs text-gray-500 hover:text-white">بستن</button>
          {!['registrations', 'inbox', 'darkroom'].includes(activeTab) && (
            <button type="button" onClick={(e) => handleSubmit(e as any)} disabled={saving} className="px-6 py-2 bg-white text-black font-bold text-xs hover:bg-gray-200 transition flex items-center gap-2">{saving ? '...' : <><Save size={14} /> ذخیره</>}</button>
          )}
        </div>
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, icon: Icon, label, className = '' }: any) => (
    <button 
        type="button" 
        onClick={(e) => { e.preventDefault(); onClick(); }} 
        className={`flex items-center gap-3 p-3 rounded-lg transition-all text-xs font-bold w-full ${active ? 'bg-white text-black' : 'text-white/50 hover:text-white hover:bg-white/5'} ${className}`}
    >
        <Icon size={16}/> {label}
    </button>
);

const InputGroup = ({ label, value, onChange, placeholder }: any) => (
  <div className="w-full"><label className="block text-[10px] text-gray-500 mb-1">{label}</label><input type="text" dir="ltr" value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-black/50 border-b border-white/20 py-2 text-white outline-none text-sm" /></div>
);

export default AdminPanel;