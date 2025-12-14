export type EventPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'center';
export type LightColor = 'red' | 'yellow' | 'green';
export type BlinkSpeed = 'none' | 'slow' | 'fast';
export type ChatMode = 'banner' | 'floating'; // حالت بنری یا شناور

export interface SiteContent {
  videoUrl?: string;
  logoUrl?: string;
  logoSize?: number;
  enableDarkRoom?: boolean;
  companyName?: { fa: string; en: string };
  posterUrl?: string;
  loaderUrl?: string;
  aiSystemPrompt?: string; // 🟢 دستورالعمل چت هوشمند
  
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
  link: string;
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
  coverUrl?: string; // 🟢 عکس مقاله
  tags?: string; // 🟢 هشتگ‌ها (با کاما جدا شوند)
  author: string | { fa: string; en: string };
  date: string;
}

export interface SpecialEvent {
  isActive: boolean;
  title: { fa: string; en: string };
  description: { fa: string; en: string };
  date: string;
  position: EventPosition;
  posterUrl?: string;
  imageUrl?: string;
  mainLink?: string;
  aiName?: string;
  buttonText?: string;
  enableChat: boolean;
  enableRegister: boolean;
  
  // 🟢 تنظیمات جدید
  lightColor: LightColor; 
  blinkSpeed: BlinkSpeed;
  chatMode: ChatMode; // بنر یا شناور
}

export interface AboutSection {
  manifesto: { fa: string; en: string };
  address: { fa: string; en: string };
  socials: { platform: string; url: string; isActive: boolean }[];
}

export interface FullRegistrationData {
  id?: string;
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
  participantType?: string;
  role?: string;
  filmTitleFa: string;
  filmTitleEn: string;
  section: string;
  logline?: string;
  synopsis?: string;
  duration?: string;
  productionYear?: string;
  productionCountry?: string;
  fileFormat?: string;
  aspectRatio?: string;
  resolution?: string;
  softwareUsed?: string;
  aiModels: string;
  aiVersion?: string;
  humanPercent: string;
  crew: { producer?: string; writer?: string; editor?: string; soundDesigner?: string; composer?: string; };
  dynamicCrew?: { role: string; name: string }[];
  filmLink: string;
  posterLink?: string;
  projectFilesLink?: string;
  agreedToRules: boolean;
  aiGeneratedConfirmed: boolean;
  rightsTransferred: boolean;
  submittedAt: string;
  status?: string;
}

export interface ContactMessage {
  name: string;
  email: string;
  message: string;
  date?: string;
}

export const DEFAULT_CONTENT: SiteContent = {
  menuItems: [],
  works: [],
  eventsList: [],
  aiSystemPrompt: 'تو دستیار هوشمند جشنواره سودای خیال هستی. پاسخ‌های کوتاه و سینمایی بده.',
  about: { manifesto: {fa:'',en:''}, address: {fa:'',en:''}, socials: [] },
  specialEvent: { 
    isActive: true, title: {fa:'',en:''}, description: {fa:'',en:''}, date: '', position: 'top-right', 
    enableChat: true, enableRegister: true,
    lightColor: 'yellow', blinkSpeed: 'slow', chatMode: 'banner'
  }
};
