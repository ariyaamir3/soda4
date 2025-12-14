export type EventPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'center';

export interface SpecialEvent {
  isActive: boolean;
  title: { fa: string; en: string };
  description: { fa: string; en: string };
  date: string;
  position: EventPosition;
  posterUrl?: string;
  mainLink?: string;
  aiName?: string;
  enableChat: boolean;
  enableRegister: boolean;
}

export interface MenuItem {
  id: string;
  title: { fa: string; en: string };
  description?: { fa: string; en: string };
  link: string;
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
  title: string;
  summary: string;
  content: string;
  coverUrl?: string;
  author: string;
  date: string;
}

// 🟢 ساختار جدید درباره ما
export interface SocialLink {
  platform: 'instagram' | 'x' | 'linkedin' | 'youtube' | 'phone' | 'email';
  url: string;
  isActive: boolean;
}

export interface AboutSection {
  manifesto: { fa: string; en: string };
  address: { fa: string; en: string };
  socials: SocialLink[];
}

export interface SiteContent {
  videoUrl: string;
  audioUrl?: string;
  logoUrl: string;
  logoSize?: number;
  enableLogoEffect?: boolean;
  posterUrl?: string;
  loaderUrl?: string;
  companyName: { fa: string; en: string };
  enableDarkRoom?: boolean;
  menuItems: MenuItem[];
  works?: WorkItem[];
  articles?: ArticleItem[];
  eventsList?: EventItem[];
  specialEvent?: SpecialEvent;
  about?: AboutSection; // 🟢 اضافه شد
}

export interface FullRegistrationData {
  id?: string;
  directorNameFa?: string;
  directorNameEn?: string;
  filmTitleFa?: string;
  filmTitleEn?: string;
  section?: string;
  phone?: string;
  email?: string;
  birthDate?: string;
  city?: string;
  country?: string;
  synopsis?: string;
  logline?: string;
  duration?: string;
  productionYear?: string;
  fileFormat?: string;
  humanPercent?: number;
  aiModels?: string;
  filmLink?: string;
  posterLink?: string;
  projectFilesLink?: string;
  submittedAt?: string;
}

export interface ContactMessage {
  name: string;
  email: string;
  message: string;
  date?: string;
}

export const DEFAULT_CONTENT: SiteContent = {
  videoUrl: '',
  logoUrl: '',
  logoSize: 3,
  companyName: { fa: 'سودای خیال', en: 'Soodaye Khiyal' },
  enableDarkRoom: false,
  menuItems: [],
  works: [],
  articles: [],
  eventsList: [],
  about: { // 🟢 مقادیر پیش‌فرض
    manifesto: { fa: 'ما رویا می‌سازیم...', en: 'We craft dreams...' },
    address: { fa: 'تهران، ایران', en: 'Tehran, Iran' },
    socials: [
      { platform: 'instagram', url: '', isActive: true },
      { platform: 'x', url: '', isActive: true },
      { platform: 'linkedin', url: '', isActive: true },
      { platform: 'phone', url: '', isActive: true },
      { platform: 'email', url: '', isActive: true },
    ]
  },
  specialEvent: {
    isActive: true,
    title: { fa: 'جشنواره هوش مصنوعی', en: 'AI Film Festival' },
    description: { fa: 'فراخوان ارسال آثار', en: 'Call for entries' },
    date: '1404',
    position: 'top-right',
    enableChat: true,
    enableRegister: true,
    aiName: 'دبیر هوشمند'
  }
};