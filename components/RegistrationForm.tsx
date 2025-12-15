import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FullRegistrationData } from '../types';
import { submitRegistration } from '../services/firebase';
import { 
  X, ChevronLeft, ChevronRight, CheckCircle2, Upload, 
  User, Film, Layers, FileText, ShieldCheck, Ticket 
} from 'lucide-react';

interface Props {
  onClose: () => void;
}

const steps = [
  { id: 1, title: 'هنرمند', icon: User },
  { id: 2, title: 'اثر', icon: Film },
  { id: 3, title: 'فنی', icon: Layers },
  { id: 4, title: 'عوامل', icon: UsersIcon },
  { id: 5, title: 'فایل‌ها', icon: Upload },
  { id: 6, title: 'تایید', icon: ShieldCheck },
];

// آیکون کمکی
function UsersIcon({size}: {size: number}) { return <User size={size}/> }

const RegistrationForm: React.FC<Props> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<{trackingId: string} | null>(null);

  // استیت کامل فرم با مقادیر پیش‌فرض
  const [data, setData] = useState<FullRegistrationData>({
    directorNameFa: '', directorNameEn: '', artistName: '', 
    gender: 'مرد / Male', birthDate: '', nationality: '', country: '', city: '',
    phone: '', email: '', website: '', socialLinks: '', 
    participantType: 'individual', role: 'Director',
    
    filmTitleFa: '', filmTitleEn: '', section: 'داستانی هوش مصنوعی', 
    logline: '', synopsis: '', duration: '', 
    productionYear: '2025', productionCountry: '',
    
    fileFormat: 'MP4', aspectRatio: '16:9', resolution: '1080p', 
    softwareUsed: '', aiModels: '', aiVersion: '', humanPercent: '20',
    
    crew: { producer: '', writer: '', editor: '', soundDesigner: '', composer: '' },
    dynamicCrew: [],
    
    filmLink: '', posterLink: '', projectFilesLink: '',
    
    agreedToRules: false, aiGeneratedConfirmed: false, rightsTransferred: false,
    submittedAt: '', status: 'pending', trackingId: ''
  });

  // مدیریت عوامل (Crew)
  const addCrewMember = () => {
    setData(prev => ({
      ...prev,
      dynamicCrew: [...(prev.dynamicCrew || []), { role: '', name: '' }]
    }));
  };

  const updateCrewMember = (index: number, field: 'role' | 'name', value: string) => {
    const newCrew = [...(data.dynamicCrew || [])];
    newCrew[index][field] = value;
    setData({ ...data, dynamicCrew: newCrew });
  };

  // ارسال فرم
  const handleSubmit = async () => {
    if (!data.agreedToRules) return alert("لطفاً قوانین جشنواره را بپذیرید.");
    if (!data.filmLink) return alert("لینک دانلود فیلم الزامی است.");

    setIsSubmitting(true);
    
    // تولید شناسه یکتا (Tracking ID)
    const trackingId = `SK-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    
    try {
      await submitRegistration({
        ...data,
        trackingId,
        submittedAt: new Date().toISOString()
      });
      
      // نمایش پیام موفقیت
      setSuccessData({ trackingId });
    } catch (error) {
      alert("خطا در ارسال اطلاعات. لطفاً اتصال اینترنت را بررسی کنید.");
    }
    setIsSubmitting(false);
  };

  // --- صفحه موفقیت (رسید) ---
  if (successData) {
    return (
      <div className="fixed inset-0 z-[70] bg-[#050505] flex items-center justify-center p-4 font-vazir" dir="rtl">
        <div className="bg-[#111] border border-green-500/30 p-8 rounded-2xl shadow-[0_0_50px_rgba(34,197,94,0.1)] max-w-md w-full text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 via-green-400 to-green-500"></div>
          
          <CheckCircle2 size={64} className="text-green-500 mx-auto mb-6" />
          
          <h2 className="text-2xl font-bold text-white mb-2">ثبت‌نام موفقیت‌آمیز بود!</h2>
          <p className="text-sm text-gray-400 mb-6">اطلاعات اثر شما در دبیرخانه جشنواره ثبت شد.</p>
          
          <div className="bg-black/40 p-4 rounded-lg border border-white/10 mb-6">
            <span className="block text-xs text-gray-500 mb-1">کد رهگیری شما (Tracking ID)</span>
            <span className="block text-3xl font-mono font-bold text-yellow-500 tracking-widest">{successData.trackingId}</span>
          </div>
          
          <p className="text-xs text-gray-500 mb-6 leading-5">
            لطفاً از این صفحه عکس بگیرید یا کد رهگیری را یادداشت کنید.
            نتایج از طریق ایمیل و همین کد قابل پیگیری است.
          </p>
          
          <button onClick={onClose} className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-gray-200 transition">
            بازگشت به سایت
          </button>
        </div>
      </div>
    );
  }

  // --- فرم اصلی ---
  return (
    <div className="fixed inset-0 z-[60] bg-[#050505] text-white flex flex-col font-vazir" dir="rtl">
      
      {/* هدر */}
      <div className="flex justify-between items-center p-5 border-b border-white/10 bg-[#0a0a0a]">
        <div>
          <h2 className="text-lg font-bold text-yellow-500 flex items-center gap-2">
            <Ticket size={18}/> فرم ثبت اثر
          </h2>
          <p className="text-[10px] text-white/40 mt-1">First AI Short Film Festival</p>
        </div>
        <button onClick={onClose} className="text-white/50 hover:text-red-500 transition p-2"><X size={24}/></button>
      </div>

      {/* نوار پیشرفت (Steps) */}
      <div className="bg-[#0a0a0a] border-b border-white/5 py-4 px-2 overflow-x-auto hide-scrollbar">
        <div className="flex items-center justify-start md:justify-center gap-2 min-w-max px-4">
          {steps.map((step) => (
            <div 
              key={step.id}
              onClick={() => setCurrentStep(step.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer border ${
                currentStep === step.id 
                  ? 'bg-yellow-500 text-black border-yellow-500' 
                  : 'bg-white/5 text-gray-500 border-transparent hover:bg-white/10'
              }`}
            >
              <step.icon size={14} /> {step.title}
            </div>
          ))}
        </div>
      </div>

      {/* بدنه فرم */}
      <div className="flex-1 overflow-y-auto p-6 md:p-12 custom-scrollbar">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
            >
              
              {/* مرحله ۱: مشخصات هنرمند */}
              {currentStep === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="نام کامل (فارسی)" value={data.directorNameFa} onChange={v => setData({...data, directorNameFa: v})} required placeholder="مثال: علی محمدی" />
                  <Input label="Full Name (English)" value={data.directorNameEn} onChange={v => setData({...data, directorNameEn: v})} dir="ltr" required placeholder="Ex: Ali Mohammadi" />
                  <Input label="نام هنری (اختیاری)" value={data.artistName || ''} onChange={v => setData({...data, artistName: v})} />
                  <Select label="جنسیت" value={data.gender} onChange={v => setData({...data, gender: v})} options={['مرد / Male', 'زن / Female', 'سایر / Other']} />
                  <Input label="تاریخ تولد" value={data.birthDate} onChange={v => setData({...data, birthDate: v})} placeholder="YYYY/MM/DD" dir="ltr" />
                  <Input label="ملیت" value={data.nationality} onChange={v => setData({...data, nationality: v})} />
                  <Input label="شماره تماس (با کد کشور)" value={data.phone} onChange={v => setData({...data, phone: v})} dir="ltr" required placeholder="+98 912 ..." />
                  <Input label="ایمیل معتبر" value={data.email} onChange={v => setData({...data, email: v})} dir="ltr" required />
                  <Input label="وبسایت / رزومه آنلاین" value={data.website || ''} onChange={v => setData({...data, website: v})} dir="ltr" />
                  <Select label="نوع شرکت‌کننده" value={data.participantType} onChange={v => setData({...data, participantType: v})} options={['فردی / Individual', 'گروهی / Group', 'شرکت / Company']} />
                </div>
              )}

              {/* مرحله ۲: مشخصات اثر */}
              {currentStep === 2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="عنوان فیلم (فارسی)" value={data.filmTitleFa} onChange={v => setData({...data, filmTitleFa: v})} required />
                  <Input label="Film Title (English)" value={data.filmTitleEn} onChange={v => setData({...data, filmTitleEn: v})} dir="ltr" required />
                  
                  <div className="md:col-span-2">
                    <label className="block text-xs text-gray-400 mb-2">بخش مسابقه</label>
                    <select value={data.section} onChange={e => setData({...data, section: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-yellow-500 transition">
                      <option>داستانی هوش مصنوعی / AI Fiction</option>
                      <option>انیمیشن / Animation</option>
                      <option>تجربی / Experimental</option>
                      <option>مستند / Documentary</option>
                      <option>موزیک ویدیو / Music Video</option>
                    </select>
                  </div>

                  <TextArea label="خلاصه داستان کوتاه (Logline)" value={data.logline} onChange={v => setData({...data, logline: v})} />
                  <TextArea label="خلاصه کامل (Synopsis)" value={data.synopsis} onChange={v => setData({...data, synopsis: v})} />
                  
                  <Input label="مدت زمان (دقیقه:ثانیه)" value={data.duration} onChange={v => setData({...data, duration: v})} dir="ltr" placeholder="05:30" />
                  <Input label="سال تولید" value={data.productionYear} onChange={v => setData({...data, productionYear: v})} dir="ltr" />
                </div>
              )}

              {/* مرحله ۳: اطلاعات فنی */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg text-xs text-yellow-200">
                    دقت در این بخش برای داوری فنی بسیار مهم است. لطفاً ابزارهای استفاده شده را دقیق ذکر کنید.
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input label="مدل‌های هوش مصنوعی (AI Models)" value={data.aiModels} onChange={v => setData({...data, aiModels: v})} required placeholder="Midjourney v6, Runway Gen-2, Pika..." dir="ltr" />
                    <Input label="نرم‌افزارهای جانبی (Software)" value={data.softwareUsed} onChange={v => setData({...data, softwareUsed: v})} placeholder="Premiere, After Effects, DaVinci..." dir="ltr" />
                    <Input label="رزولوشن" value={data.resolution} onChange={v => setData({...data, resolution: v})} dir="ltr" placeholder="1080p / 4K" />
                    <Input label="نسبت تصویر" value={data.aspectRatio} onChange={v => setData({...data, aspectRatio: v})} dir="ltr" placeholder="16:9 / 2.35:1" />
                    
                    <div className="md:col-span-2">
                        <label className="block text-xs text-gray-400 mb-2">درصد دخالت هوش مصنوعی ({data.humanPercent}%)</label>
                        <input type="range" min="0" max="100" value={data.humanPercent} onChange={e => setData({...data, humanPercent: e.target.value})} className="w-full accent-yellow-500" />
                        <div className="flex justify-between text-[10px] text-gray-500 mt-1"><span>0% (کاملا انسانی)</span><span>100% (کاملا AI)</span></div>
                    </div>
                  </div>
                </div>
              )}

              {/* مرحله ۴: عوامل تولید */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input label="تهیه‌کننده" value={data.crew.producer || ''} onChange={v => setData({...data, crew: {...data.crew, producer: v}})} />
                    <Input label="نویسنده / پرامپت‌نویس" value={data.crew.writer || ''} onChange={v => setData({...data, crew: {...data.crew, writer: v}})} />
                    <Input label="تدوین‌گر" value={data.crew.editor || ''} onChange={v => setData({...data, crew: {...data.crew, editor: v}})} />
                    <Input label="موسیقی / صدا" value={data.crew.soundDesigner || ''} onChange={v => setData({...data, crew: {...data.crew, soundDesigner: v}})} />
                  </div>
                  
                  <div className="border-t border-white/10 pt-6">
                    <h4 className="text-sm font-bold mb-4">سایر عوامل (اختیاری)</h4>
                    {data.dynamicCrew?.map((member, idx) => (
                      <div key={idx} className="flex gap-2 mb-3">
                        <input placeholder="نقش (Role)" value={member.role} onChange={e => updateCrewMember(idx, 'role', e.target.value)} className="bg-white/5 border border-white/10 p-2 rounded text-xs w-1/3 text-white outline-none" />
                        <input placeholder="نام (Name)" value={member.name} onChange={e => updateCrewMember(idx, 'name', e.target.value)} className="bg-white/5 border border-white/10 p-2 rounded text-xs w-2/3 text-white outline-none" />
                      </div>
                    ))}
                    <button onClick={addCrewMember} className="text-xs bg-white/10 hover:bg-white/20 px-4 py-2 rounded text-white transition">+ افزودن عامل جدید</button>
                  </div>
                </div>
              )}

              {/* مرحله ۵: فایل‌ها */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div className="bg-blue-600/10 border border-blue-600/20 p-4 rounded-lg text-xs text-blue-200 leading-6">
                    لطفاً فایل اثر را در یک فضای ابری (Google Drive, Dropbox, Uploadboy) آپلود کنید و لینک مستقیم یا قابل دانلود آن را در اینجا قرار دهید.
                    <br/>ما در سرور خود فایل ویدیویی سنگین دریافت نمی‌کنیم.
                  </div>

                  <Input label="لینک دانلود فیلم (الزامی)" value={data.filmLink} onChange={v => setData({...data, filmLink: v})} dir="ltr" required placeholder="https://..." />
                  <Input label="لینک پوستر / عکس (اختیاری)" value={data.posterLink || ''} onChange={v => setData({...data, posterLink: v})} dir="ltr" placeholder="https://..." />
                  <Input label="لینک فایل‌های پروژه / مستندات (اختیاری)" value={data.projectFilesLink || ''} onChange={v => setData({...data, projectFilesLink: v})} dir="ltr" placeholder="https://..." />
                </div>
              )}

              {/* مرحله ۶: تایید نهایی */}
              {currentStep === 6 && (
                <div className="space-y-6">
                  <div className="bg-black/40 border border-white/10 p-6 rounded-xl space-y-4">
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5 ${data.agreedToRules ? 'bg-yellow-500 border-yellow-500' : 'border-white/30 group-hover:border-white'}`}>
                        {data.agreedToRules && <CheckCircle2 size={14} className="text-black"/>}
                      </div>
                      <input type="checkbox" checked={data.agreedToRules} onChange={e => setData({...data, agreedToRules: e.target.checked})} className="hidden" />
                      <span className="text-sm text-gray-300">تمامی <span className="text-white underline">قوانین و مقررات</span> جشنواره سودای خیال را مطالعه کرده و می‌پذیرم.</span>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer group">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5 ${data.aiGeneratedConfirmed ? 'bg-yellow-500 border-yellow-500' : 'border-white/30 group-hover:border-white'}`}>
                        {data.aiGeneratedConfirmed && <CheckCircle2 size={14} className="text-black"/>}
                      </div>
                      <input type="checkbox" checked={data.aiGeneratedConfirmed} onChange={e => setData({...data, aiGeneratedConfirmed: e.target.checked})} className="hidden" />
                      <span className="text-sm text-gray-300">تایید می‌کنم که اثر ارسالی با استفاده از هوش مصنوعی تولید شده است.</span>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer group">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5 ${data.rightsTransferred ? 'bg-yellow-500 border-yellow-500' : 'border-white/30 group-hover:border-white'}`}>
                        {data.rightsTransferred && <CheckCircle2 size={14} className="text-black"/>}
                      </div>
                      <input type="checkbox" checked={data.rightsTransferred} onChange={e => setData({...data, rightsTransferred: e.target.checked})} className="hidden" />
                      <span className="text-sm text-gray-300">حق نمایش اثر در جشنواره و پلتفرم‌های مرتبط را به دبیرخانه واگذار می‌کنم.</span>
                    </label>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* فوتر دکمه‌ها */}
      <div className="p-5 border-t border-white/10 bg-[#0a0a0a] flex justify-between items-center shrink-0">
        <button 
          onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm transition ${currentStep === 1 ? 'opacity-0 pointer-events-none' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
        >
          <ChevronRight size={16} /> مرحله قبل
        </button>

        {currentStep < 6 ? (
          <button 
            onClick={() => setCurrentStep(prev => Math.min(6, prev + 1))}
            className="bg-white text-black px-8 py-3 rounded-lg font-bold hover:bg-gray-200 transition flex items-center gap-2 text-sm"
          >
            مرحله بعد <ChevronLeft size={16} />
          </button>
        ) : (
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting || !data.agreedToRules}
            className="bg-yellow-500 text-black px-10 py-3 rounded-lg font-black hover:bg-yellow-400 transition flex items-center gap-2 text-sm shadow-[0_0_20px_rgba(234,179,8,0.4)] disabled:opacity-50 disabled:shadow-none"
          >
            {isSubmitting ? 'در حال ارسال...' : 'ثبت نهایی و دریافت کد'}
          </button>
        )}
      </div>

    </div>
  );
};

// کامپوننت‌های فرم
const Input = ({ label, value, onChange, required, placeholder, dir }: any) => (
  <div className="w-full">
    <label className="block text-xs text-gray-400 mb-2">{label} {required && <span className="text-red-500">*</span>}</label>
    <input 
      type="text" value={value || ''} onChange={e => onChange(e.target.value)} 
      placeholder={placeholder} dir={dir}
      className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white text-sm outline-none focus:border-yellow-500 transition placeholder:text-white/20"
    />
  </div>
);

const TextArea = ({ label, value, onChange }: any) => (
  <div className="w-full md:col-span-2">
    <label className="block text-xs text-gray-400 mb-2">{label}</label>
    <textarea 
      value={value || ''} onChange={e => onChange(e.target.value)} 
      className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white text-sm outline-none focus:border-yellow-500 transition h-24 leading-6"
    />
  </div>
);

const Select = ({ label, value, onChange, options }: any) => (
  <div className="w-full">
    <label className="block text-xs text-gray-400 mb-2">{label}</label>
    <select value={value} onChange={e => onChange(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white text-sm outline-none focus:border-yellow-500 transition cursor-pointer">
      {options.map((opt: string) => <option key={opt} value={opt} className="bg-black text-white">{opt}</option>)}
    </select>
  </div>
);

export default RegistrationForm;
