export type EventPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'center';
export type LightColor = 'red' | 'yellow' | 'green' | 'blue';
export type BlinkSpeed = 'none' | 'slow' | 'normal' | 'fast';
export type ChatMode = 'banner' | 'floating';
export type TicketStyle = 'modern' | 'cinema' | 'minimal';

// تنظیمات هوش مصنوعی (متمرکز)
export interface AiConfig {
  isActive: boolean;
  name: string; // نام ربات (مثلا: دستیار جشنواره)
  systemPrompt: string; // دستورالعمل رفتار
  model: string; // مدل انتخابی
  lastStatus: 'connected' | 'disconnected' | 'unknown'; // وضعیت اتصال (چراغ سبز/زرد)
}

export interface SiteContent {
  // --- عمومی ---
  companyName: { fa: string; en: string };
  videoUrl: string;
  posterUrl?: string; // پوستر ویدیو
  logoUrl: string;
  logoSize: number;
  loaderUrl?: string; // تصویر لودر (اسب سوار)
  enableDarkRoom: boolean; // فعال/غیرفعال کردن اتاق تاریک

  // --- تنظیمات هوش مصنوعی (جدید) ---
  aiConfig: AiConfig;

  // --- محتوا ---
  menuItems: MenuItem[];
  works: WorkItem[];
  articles: ArticleItem[];
  eventsList: EventItem[]; // لیست رویدادها (ورک‌شاپ و...)
  
  // --- درباره ما ---
  about: AboutSection;

  // --- بنر جشنواره (رویداد ویژه) ---
  specialEvent: SpecialEvent;
}

export interface MenuItem {
  id: string;
  title: { fa: string; en: string };
  link: string; // کلید لینک مثل 'works'
  description?: { fa: string; en: string };
}

export interface WorkItem {
  id: string;
  title: { fa: string; en: string };
  year: string;
  imageUrl: string; // کاور اثر
  link?: string; // لینک مشاهده
  description?: string;
}

export interface EventItem {
  id: string;
  title: string;
  date: string;
  description: string;
  imageUrl?: string;
  location?: string;
  link?: string;
  isActive: boolean;
}

export interface ArticleItem {
  id: string;
  title: string | { fa: string; en: string };
  summary: string | { fa: string; en: string };
  content: string | { fa: string; en: string };
  coverUrl?: string; // عکس مقاله
  tags?: string;     // تگ‌ها
  author: string | { fa: string; en: string };
  date: string;
}

export interface SpecialEvent {
  isActive: boolean;
  title: { fa: string; en: string };
  description: { fa: string; en: string };
  date: string;
  position: EventPosition;
  
  // استایل و ظاهر
  ticketStyle: TicketStyle; // استایل بلیت (سینمایی/مدرن)
  lightColor: LightColor;   // رنگ چراغ
  blinkSpeed: BlinkSpeed;   // سرعت چشمک
  
  // تصاویر
  posterUrl?: string; // پوستر داخل مودال
  
  // تنظیمات
  mainLink?: string;
  buttonText?: string;
  enableChat: boolean;
  chatMode: ChatMode; // داخل بنر یا شناور
  enableRegister: boolean;
}

export interface SocialLink {
  platform: 'instagram' | 'twitter' | 'linkedin' | 'youtube' | 'telegram' | 'whatsapp' | 'email' | 'phone';
  url: string;
  isActive: boolean;
  label?: string; // متن اختیاری
}

export interface AboutSection {
  manifesto: { fa: string; en: string };
  address: { fa: string; en: string };
  socials: SocialLink[];
}

// دیتای کامل ثبت‌نام (شامل شناسه یکتا)
export interface FullRegistrationData {
  id?: string;
  trackingId: string; // 🟢 شناسه یکتا (Tracking ID)
  
  // هنرمند
  directorNameFa: string;
  directorNameEn: string;
  artistName?: string;
  gender?: string;
  birthDate?: string;
  nationality?: string;
  country?: string;
  city?: string;
  phone: string;
  email: string;
  
  // اثر
  filmTitleFa: string;
  filmTitleEn: string;
  section: string;
  logline?: string;
  synopsis?: string;
  duration?: string;
  productionYear?: string;
  productionCountry?: string;

  // فنی
  fileFormat?: string;
  resolution?: string;
  softwareUsed?: string;
  aiModels: string;
  humanPercent: string;

  // لینک‌ها
  filmLink: string;
  posterLink?: string;
  projectFilesLink?: string;

  // سیستمی
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface ContactMessage {
  id?: string;
  name: string;
  email: string;
  message: string;
  date: string;
  isRead?: boolean; // وضعیت خوانده شده
}

// مقادیر پیش‌فرض (برای جلوگیری از کرش در شروع کار)
export const DEFAULT_CONTENT: SiteContent = {
  companyName: { fa: 'سودای خیال', en: 'Soodaye Khiyal' },
  videoUrl: '',
  logoUrl: '',
  logoSize: 3,
  enableDarkRoom: false,
  
  aiConfig: {
    isActive: true,
    name: 'دستیار هوشمند',
    systemPrompt: 'تو دستیار هوشمند جشنواره هستی.',
    model: 'google/gemini-2.0-flash-exp:free',
    lastStatus: 'unknown'
  },

  menuItems: [
    { id: '1', title: {fa:'آرشیو',en:'Archive'}, link: 'works' },
    { id: '2', title: {fa:'مقالات',en:'Blog'}, link: 'articles' },
    { id: '3', title: {fa:'درباره ما',en:'About'}, link: 'about' },
    { id: '4', title: {fa:'تماس',en:'Contact'}, link: 'contact' },
  ],
  works: [],
  articles: [],
  eventsList: [],
  
  about: {
    manifesto: { fa: '', en: '' },
    address: { fa: '', en: '' },
    socials: [
      { platform: 'instagram', url: '', isActive: true },
      { platform: 'email', url: '', isActive: true }
    ]
  },
  
  specialEvent: {
    isActive: true,
    title: { fa: 'جشنواره هوش مصنوعی', en: 'AI Film Festival' },
    description: { fa: 'فراخوان ارسال آثار', en: 'Call for Entries' },
    date: '1404',
    position: 'top-right',
    ticketStyle: 'cinema',
    lightColor: 'yellow',
    blinkSpeed: 'slow',
    enableChat: true,
    chatMode: 'banner',
    enableRegister: true
  }
};
