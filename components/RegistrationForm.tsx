import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FullRegistrationData } from '../types';
import { submitRegistration } from '../services/firebase';
import { X, ChevronLeft, ChevronRight, CheckCircle2, Upload, User, Film, Layers, FileText, ShieldCheck } from 'lucide-react';

interface Props {
  onClose: () => void;
}

const steps = [
  { id: 1, title: 'Artist / هنرمند', icon: User },
  { id: 2, title: 'Work / اثر', icon: Film },
  { id: 3, title: 'Tech / فنی', icon: Layers },
  { id: 4, title: 'Crew / عوامل', icon: User },
  { id: 5, title: 'Files / فایل‌ها', icon: Upload },
  { id: 6, title: 'Confirm / تایید', icon: ShieldCheck },
];

const RegistrationForm: React.FC<Props> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [data, setData] = useState<FullRegistrationData>({
    directorNameFa: '', directorNameEn: '', artistName: '', gender: 'مرد / Male', birthDate: '', nationality: '', country: '', city: '',
    phone: '', email: '', website: '', socialLinks: '', participantType: 'individual', role: 'Director / کارگردان',
    filmTitleFa: '', filmTitleEn: '', section: 'داستانی هوش مصنوعی / AI Fiction', logline: '', synopsis: '', duration: '', productionYear: '', productionCountry: '',
    fileFormat: 'MP4', aspectRatio: '16:9', resolution: '1080p', softwareUsed: '', aiModels: '', aiVersion: '', humanPercent: '20',
    crew: {}, dynamicCrew: [],
    filmLink: '', posterLink: '', projectFilesLink: '',
    agreedToRules: false, aiGeneratedConfirmed: false, rightsTransferred: false,
    submittedAt: '', status: 'pending'
  });

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

  const handleSubmit = async () => {
    if (!data.agreedToRules) return alert("لطفاً قوانین را بپذیرید / Please accept the rules");
    setIsSubmitting(true);
    try {
      await submitRegistration({
        ...data,
        submittedAt: new Date().toISOString()
      });
      setIsSuccess(true);
    } catch (error) {
      alert("خطا در ارسال. لطفاً اینترنت را بررسی کنید.");
    }
    setIsSubmitting(false);
  };

  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-[60] bg-black flex items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-md border border-green-500/30 p-8 rounded-2xl bg-green-900/10">
          <CheckCircle2 size={80} className="text-green-500 mx-auto" />
          <h2 className="text-3xl font-bold text-white font-vazir">ثبت‌نام موفق! <br/> <span className="text-lg opacity-70">Registration Successful</span></h2>
          <p className="text-gray-400 text-sm">اطلاعات شما با موفقیت ثبت شد.<br/>Your submission has been received.</p>
          <div className="bg-white/10 p-4 rounded text-yellow-400 font-mono text-xl tracking-widest">
            CODE: {Math.floor(10000 + Math.random() * 90000)}
          </div>
          <p className="text-xs text-gray-500">لطفاً از این صفحه اسکرین‌شات بگیرید.</p>
          <button onClick={onClose} className="bg-white text-black px-8 py-3 rounded-full font-bold hover:scale-105 transition">بازگشت / Return</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] bg-[#050505] text-white flex flex-col font-vazir overflow-hidden" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b border-white/10 bg-[#0a0a0a]">
        <div>
          <h2 className="text-xl font-bold text-yellow-500">فرم ثبت اثر / Submission Form</h2>
          <p className="text-xs text-white/50">جشنواره بین‌المللی سودای خیال</p>
        </div>
        <button onClick={onClose} className="hover:text-red-500 transition"><X size={24} /></button>
      </div>

      {/* Progress Bar */}
      <div className="flex justify-center gap-2 p-4 bg-black/50 overflow-x-auto">
        {steps.map((step) => (
          <div 
            key={step.id} 
            onClick={() => setCurrentStep(step.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer transition text-xs whitespace-nowrap ${currentStep === step.id ? 'bg-yellow-500 text-black font-bold' : 'bg-white/5 text-gray-500 hover:bg-white/10'}`}
          >
            <step.icon size={14} /> {step.title}
          </div>
        ))}
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-6 md:p-12 max-w-4xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            {/* STEP 1: Artist Info */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold border-b border-white/10 pb-2 mb-4 text-blue-400">۱. مشخصات هنرمند / Artist Info</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="نام کامل (فارسی)" value={data.directorNameFa} onChange={v => setData({...data, directorNameFa: v})} required />
                  <Input label="Full Name (English)" value={data.directorNameEn} onChange={v => setData({...data, directorNameEn: v})} dir="ltr" required />
                  <Input label="نام هنری / Artist Name (Optional)" value={data.artistName || ''} onChange={v => setData({...data, artistName: v})} />
                  <Select label="جنسیت / Gender" value={data.gender} onChange={v => setData({...data, gender: v})} options={['مرد / Male', 'زن / Female', 'سایر / Other']} />
                  <Input label="تاریخ تولد / Birth Date" value={data.birthDate} onChange={v => setData({...data, birthDate: v})} placeholder="YYYY/MM/DD" dir="ltr" />
                  <Input label="ملیت / Nationality" value={data.nationality} onChange={v => setData({...data, nationality: v})} />
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="کشور / Country" value={data.country} onChange={v => setData({...data, country: v})} />
                    <Input label="شهر / City" value={data.city} onChange={v => setData({...data, city: v})} />
                  </div>
                  <Input label="شماره موبایل / Phone Number" value={data.phone} onChange={v => setData({...data, phone: v})} dir="ltr" required placeholder="+98..." />
                  <Input label="ایمیل / Email" value={data.email} onChange={v => setData({...data, email: v})} dir="ltr" required />
                  <Select label="نوع شرکت‌کننده / Type" value={data.participantType} onChange={v => setData({...data, participantType: v as any})} options={['فردی / Individual', 'گروهی / Group', 'شرکت / Company']} />
                </div>
              </div>
            )}

            {/* STEP 2: Work Info */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold border-b border-white/10 pb-2 mb-4 text-purple-400">۲. مشخصات اثر / Work Info</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="عنوان اثر (فارسی)" value={data.filmTitleFa} onChange={v => setData({...data, filmTitleFa: v})} required />
                  <Input label="Title (English)" value={data.filmTitleEn} onChange={v => setData({...data, filmTitleEn: v})} dir="ltr" required />

                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs text-gray-400 mb-1">بخش مسابقه / Category</label>
                    <select value={data.section} onChange={e => setData({...data, section: e.target.value})} className="w-full bg-white/5 border border-white/10 p-3 rounded text-white outline-none focus:border-yellow-500">
                      <option>داستانی هوش مصنوعی / AI Fiction</option>
                      <option>انیمیشن هوش مصنوعی / AI Animation</option>
                      <option>جایزه ویژه: آبِ زندگی / Aqua Vitae</option>
                      <option>جایزه ویژه: پرامت طلایی / Golden Prompt</option>
                      <option>ترکیبی / Hybrid</option>
                    </select>
                  </div>

                  <TextArea label="خلاصه داستان کوتاه / Logline" value={data.logline} onChange={v => setData({...data, logline: v})} />
                  <TextArea label="خلاصه کامل / Synopsis" value={data.synopsis} onChange={v => setData({...data, synopsis: v})} />
                  <Input label="مدت زمان / Duration (MM:SS)" value={data.duration} onChange={v => setData({...data, duration: v})} dir="ltr" />
                  <Input label="سال تولید / Production Year" value={data.productionYear} onChange={v => setData({...data, productionYear: v})} dir="ltr" />
                </div>
              </div>
            )}

            {/* STEP 3: Technical */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold border-b border-white/10 pb-2 mb-4 text-green-400">۳. اطلاعات فنی / Technical Spec</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="مدل‌های هوش مصنوعی / AI Models Used" value={data.aiModels} onChange={v => setData({...data, aiModels: v})} required placeholder="Midjourney, Runway, Pika..." />
                  <Input label="نرم‌افزارهای جانبی / Software Used" value={data.softwareUsed} onChange={v => setData({...data, softwareUsed: v})} placeholder="Premiere, After Effects..." />
                  <Select label="فرمت فایل / Format" value={data.fileFormat} onChange={v => setData({...data, fileFormat: v})} options={['MP4', 'MOV', 'WAV', 'JPG', 'PDF']} />
                  <Input label="رزولوشن / Resolution" value={data.resolution} onChange={v => setData({...data, resolution: v})} placeholder="1080p, 4K..." dir="ltr" />
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs text-gray-400 mb-1">درصد دخالت انسانی / Human Involvement ({data.humanPercent}%)</label>
                    <input type="range" min="0" max="100" value={data.humanPercent} onChange={e => setData({...data, humanPercent: e.target.value})} className="w-full accent-yellow-500" />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Crew (اصلاح شد: فیلد کارگردان باز شد) */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold border-b border-white/10 pb-2 mb-4 text-orange-400">۴. عوامل تولید / Crew</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="تهیه‌کننده / Producer" value={data.crew.producer || ''} onChange={v => setData({...data, crew: {...data.crew, producer: v}})} required />

                  {/* 🟢 اصلاح شده: حذف disabled برای قابلیت ویرایش */}
                  <Input 
                    label="کارگردان / Director" 
                    value={data.directorNameFa} 
                    onChange={v => setData({...data, directorNameFa: v})} 
                    placeholder="نام کارگردان" 
                  /> 

                  <Input label="نویسنده / Writer" value={data.crew.writer || ''} onChange={v => setData({...data, crew: {...data.crew, writer: v}})} />
                  <Input label="تدوین / Editor" value={data.crew.editor || ''} onChange={v => setData({...data, crew: {...data.crew, editor: v}})} />
                  <Input label="طراحی صدا / Sound Designer" value={data.crew.soundDesigner || ''} onChange={v => setData({...data, crew: {...data.crew, soundDesigner: v}})} />
                  <Input label="موسیقی / Composer" value={data.crew.composer || ''} onChange={v => setData({...data, crew: {...data.crew, composer: v}})} />
                </div>

                <div className="border-t border-white/10 pt-4 mt-4">
                  <h4 className="text-sm font-bold mb-2">سایر عوامل / Other Crew</h4>
                  {data.dynamicCrew?.map((member, idx) => (
                    <div key={idx} className="flex gap-2 mb-2">
                      <input placeholder="نقش / Role" value={member.role} onChange={e => updateCrewMember(idx, 'role', e.target.value)} className="bg-white/5 border border-white/10 p-2 rounded text-xs w-1/3 text-white" />
                      <input placeholder="نام / Name" value={member.name} onChange={e => updateCrewMember(idx, 'name', e.target.value)} className="bg-white/5 border border-white/10 p-2 rounded text-xs w-2/3 text-white" />
                    </div>
                  ))}
                  <button onClick={addCrewMember} className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded text-white flex items-center gap-1">+ افزودن / Add</button>
                </div>
              </div>
            )}

            {/* STEP 5: Files */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold border-b border-white/10 pb-2 mb-4 text-red-400">۵. فایل‌ها / Files</h3>
                <div className="bg-white/5 p-4 rounded border border-white/10 text-sm text-gray-300 mb-4">
                  لطفاً فایل‌ها را در گوگل درایو یا دراپ‌باکس آپلود کنید و لینک را اینجا قرار دهید.<br/>
                  Please upload files to Google Drive/Dropbox and paste the link here.
                </div>

                <Input label="لینک دانلود اثر (الزامی) / Film Download Link *" value={data.filmLink} onChange={v => setData({...data, filmLink: v})} dir="ltr" required placeholder="https://..." />

                <Input label="لینک عکس/پوستر (مخصوص بخش آب) / Photo Link (Aqua Vitae)" value={data.posterLink || ''} onChange={v => setData({...data, posterLink: v})} dir="ltr" placeholder="https://..." />

                <Input label="لینک فایل‌های پروژه/مستندات (ZIP) / Project Files" value={data.projectFilesLink || ''} onChange={v => setData({...data, projectFilesLink: v})} dir="ltr" placeholder="https://..." />
              </div>
            )}

            {/* STEP 6: Confirmation */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold border-b border-white/10 pb-2 mb-4 text-yellow-400">۶. تأیید نهایی / Confirmation</h3>
                <div className="space-y-4 bg-black/30 p-6 rounded border border-white/10">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={data.agreedToRules} onChange={e => setData({...data, agreedToRules: e.target.checked})} className="w-5 h-5 accent-yellow-500" />
                    <span className="text-sm">قوانین جشنواره را می‌پذیرم / I accept the rules.</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={data.aiGeneratedConfirmed} onChange={e => setData({...data, aiGeneratedConfirmed: e.target.checked})} className="w-5 h-5 accent-yellow-500" />
                    <span className="text-sm">اثر با هوش مصنوعی ساخته شده است / AI Generated confirmed.</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={data.rightsTransferred} onChange={e => setData({...data, rightsTransferred: e.target.checked})} className="w-5 h-5 accent-yellow-500" />
                    <span className="text-sm">اجازه نمایش اثر را می‌دهم / I grant screening rights.</span>
                  </label>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer / Navigation */}
      <div className="p-6 border-t border-white/10 bg-[#0a0a0a] flex justify-between items-center shrink-0">
        <button 
          onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
          className={`flex items-center gap-2 px-6 py-3 rounded text-sm ${currentStep === 1 ? 'opacity-0 pointer-events-none' : 'text-gray-400 hover:text-white'}`}
        >
          <ChevronRight size={16} /> قبل / Prev
        </button>

        {currentStep < 6 ? (
          <button 
            onClick={() => setCurrentStep(prev => Math.min(6, prev + 1))}
            className="bg-white text-black px-8 py-3 rounded font-bold hover:bg-gray-200 transition flex items-center gap-2"
          >
            بعد / Next <ChevronLeft size={16} />
          </button>
        ) : (
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting || !data.agreedToRules}
            className="bg-yellow-500 text-black px-8 py-3 rounded font-bold hover:bg-yellow-400 transition flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? 'Sending...' : 'ثبت نهایی / Submit'}
          </button>
        )}
      </div>
    </div>
  );
};

const Input = ({ label, value, onChange, required, placeholder, dir, disabled }: any) => (
  <div className="w-full">
    <label className="block text-xs text-gray-400 mb-1">{label}</label>
    <input 
      type="text" value={value} onChange={e => onChange(e.target.value)} 
      placeholder={placeholder} dir={dir} disabled={disabled}
      className={`w-full bg-white/5 border border-white/10 rounded p-3 text-white outline-none focus:border-yellow-500 transition ${disabled ? 'opacity-50' : ''}`}
    />
  </div>
);

const TextArea = ({ label, value, onChange }: any) => (
  <div className="w-full">
    <label className="block text-xs text-gray-400 mb-1">{label}</label>
    <textarea 
      value={value} onChange={e => onChange(e.target.value)} 
      className="w-full bg-white/5 border border-white/10 rounded p-3 text-white outline-none focus:border-yellow-500 transition h-24"
    />
  </div>
);

const Select = ({ label, value, onChange, options }: any) => (
  <div className="w-full">
    <label className="block text-xs text-gray-400 mb-1">{label}</label>
    <select value={value} onChange={e => onChange(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded p-3 text-white outline-none focus:border-yellow-500">
      {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

export default RegistrationForm;