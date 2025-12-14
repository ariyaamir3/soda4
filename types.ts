// types.ts
// تعریف کامل تایپ‌ها برای هماهنگی با تمام بخش‌های سایت

export type EventPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'center';
export type LightColor = 'red' | 'yellow' | 'green';
export type BlinkSpeed = 'none' | 'slow' | 'fast';
export type ChatMode = 'banner' | 'floating';

export interface SiteContent {
  // تنظیمات عمومی
  videoUrl?: string;
  audioUrl?: string;
  logoUrl?: string;
  logoSize?: number;
  enableLogoEffect?: boolean;
  enableDarkRoom?: boolean;
  companyName?: { fa: string; en: string };
  posterUrl?: string; // پوستر ویدیو
  loaderUrl?: string; // عکس لودینگ
  
  // تنظیمات هوش مصنوعی
  aiSystemPrompt?: string; // دستورالعمل رفتار دستیار هوشمند

  // بخش‌های محتوایی
  menuItems: MenuItem[];
  works?: WorkItem[];
  articles?: ArticleItem[];
  eventsList?: EventItem[];
  specialEvent?: SpecialEvent;
  about?: AboutSection;
}

export interface MenuItem {
  id: string;
  title: { fa: string; en: string };
  link: string; // کلید لینک مثل 'works', 'contact'
  description?: { fa: string; en: string };
}

export interface WorkItem {
  id: string;
  title: { fa: string; en: string };
  year: string;
  imageUrl: string;
  link?: string;
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
}

export interface ArticleItem {
  id: string;
  title: string | { fa: string; en: string };
  summary: string | { fa: string; en: string };
  content: string | { fa: string; en: string };
  coverUrl?: string; // عکس شاخص مقاله
  tags?: string;     // هشتگ‌ها (رشته جدا شده با کاما)
  author: string | { fa: string; en: string };
  date: string;
}

export interface SpecialEvent {
  isActive: boolean;
  title: { fa: string; en: string };
  description: { fa: string; en: string };
  date: string;
  position: EventPosition;
  
  // تصاویر و لینک‌ها
  posterUrl?: string; // پوستر داخل مودال فراخوان
  imageUrl?: string; 
  mainLink?: string;
  
  // تنظیمات تعاملی
  aiName?: string;
  buttonText?: string;
  enableChat: boolean;
  enableRegister: boolean;
  
  // تنظیمات ظاهری جدید (چراغ و چت)
  lightColor?: LightColor; 
  blinkSpeed?: BlinkSpeed;
  chatMode?: ChatMode;
}

export interface AboutSection {
  manifesto: { fa: string; en: string };
  address: { fa: string; en: string };
  socials: { platform: string; url: string; isActive: boolean }[];
}

// دیتای کامل فرم ثبت‌نام (هماهنگ با RegistrationForm.tsx)
export interface FullRegistrationData {
  id?: string;
  
  // ۱. مشخصات هنرمند
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
  website?: string;
  socialLinks?: string;
  participantType?: string; // individual, group, company
  role?: string; // Director, Producer...

  // ۲. مشخصات اثر
  filmTitleFa: string;
  filmTitleEn: string;
  section: string;
  logline?: string;
  synopsis?: string;
  duration?: string;
  productionYear?: string;
  productionCountry?: string;

  // ۳. اطلاعات فنی
  fileFormat?: string;
  aspectRatio?: string;
  resolution?: string;
  softwareUsed?: string;
  aiModels: string;
  aiVersion?: string;
  humanPercent: string;

  // ۴. عوامل تولید
  crew: {
    producer?: string;
    writer?: string;
    editor?: string;
    soundDesigner?: string;
    composer?: string;
  };
  dynamicCrew?: { role: string; name: string }[];

  // ۵. فایل‌ها
  filmLink: string;
  posterLink?: string;
  projectFilesLink?: string;

  // ۶. تاییدیه‌ها
  agreedToRules: boolean;
  aiGeneratedConfirmed: boolean;
  rightsTransferred: boolean;

  // سیستمی
  submittedAt: string;
  status?: string; // pending, approved, rejected
}

export interface ContactMessage {
  name: string;
  email: string;
  message: string;
  date?: string;
}

// مقادیر پیش‌فرض برای جلوگیری از کرش کردن سایت در اولین اجرا
export const DEFAULT_CONTENT: SiteContent = {
  videoUrl: '',
  logoUrl: '',
  logoSize: 3,
  enableDarkRoom: false,
  companyName: { fa: 'سودای خیال', en: 'Soodaye Khiyal' },
  menuItems: [],
  works: [],
  articles: [],
  eventsList: [],
  aiSystemPrompt: 'تو دستیار هوشمند جشنواره هستی. پاسخ‌های کوتاه و سینمایی بده.',
  about: {
    manifesto: { fa: '', en: '' },
    address: { fa: '', en: '' },
    socials: []
  },
  specialEvent: {
    isActive: true,
    title: { fa: 'جشنواره هوش مصنوعی', en: 'AI Film Festival' },
    description: { fa: 'فراخوان ارسال آثار', en: 'Call for Entries' },
    date: '1404',
    position: 'top-right',
    enableChat: true,
    enableRegister: true,
    lightColor: 'yellow',
    blinkSpeed: 'slow',
    chatMode: 'banner'
  }
};
