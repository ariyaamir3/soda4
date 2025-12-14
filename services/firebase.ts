// services/firebase.ts
// توجه: نام این فایل firebase باقی مانده تا سایر فایل‌ها ارور ندهند،
// اما در واقع این فایل به سرور Node.js لیارا وصل می‌شود.

import { SiteContent, FullRegistrationData, ContactMessage, DEFAULT_CONTENT } from '../types';

// آدرس پایه API (چون فایل‌ها در ریشه هستند، این آدرس نسبی به سرور server.js اشاره می‌کند)
const API_URL = '/api';

// --- وضعیت اتصال ---
// در سیستم جدید، فرض بر این است که سرور همیشه در دسترس است
export const getConnectionStatus = () => {
    return { isConnected: true, error: null };
};

// --- دریافت محتوای سایت ---
export const getSiteContent = async (): Promise<SiteContent> => {
  try {
    const response = await fetch(`${API_URL}/content`);
    
    // اگر سرور پاسخ نداد یا ارور داد
    if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // بررسی اعتبار دیتا (اگر آبجکت خالی بود، محتوای پیش‌فرض را برگردان)
    if (data && (data.menuItems || data.companyName)) {
        return data;
    }
    return DEFAULT_CONTENT;
  } catch (error) {
    console.warn("⚠️ خطا در دریافت اطلاعات از سرور، استفاده از محتوای پیش‌فرض:", error);
    return DEFAULT_CONTENT;
  }
};

// --- بروزرسانی و ذخیره محتوا (پنل ادمین) ---
export const updateSiteContent = async (newContent: SiteContent): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/content`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newContent)
    });

    if (!response.ok) {
        throw new Error('خطا در ذخیره‌سازی روی سرور');
    }
  } catch (error) {
    console.error("Save Error:", error);
    throw error; // خطا را پرتاب کن تا در پنل ادمین نمایش داده شود
  }
};

// --- ثبت‌نام در جشنواره ---
export const submitRegistration = async (data: FullRegistrationData) => {
  try {
    const response = await fetch(`${API_URL}/registrations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) throw new Error('Registration failed');
    return true;
  } catch (error) {
    console.error("Registration Submission Error:", error);
    throw error;
  }
};

// --- دریافت لیست ثبت‌نام‌کنندگان (پنل ادمین) ---
export const getRegistrations = async (): Promise<FullRegistrationData[]> => {
  try {
    const response = await fetch(`${API_URL}/registrations`);
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error("Fetch Registrations Error:", error);
    return [];
  }
};

// --- ارسال پیام تماس با ما ---
export const submitContactMessage = async (data: ContactMessage) => {
  try {
    const response = await fetch(`${API_URL}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) throw new Error('Message failed');
    return true;
  } catch (error) {
    console.error("Message Submission Error:", error);
    throw error;
  }
};

// --- دریافت پیام‌های صندوق ورودی ---
export const getContactMessages = async (): Promise<ContactMessage[]> => {
  try {
    const response = await fetch(`${API_URL}/messages`);
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error("Fetch Messages Error:", error);
    return [];
  }
};

// --- آپلود فایل (جایگزین Firebase Storage) ---
// این تابع فایل را به سرور لیارا می‌فرستد و لینک S3 دریافت می‌کند
export const uploadFile = async (file: File, path?: string, onProgress?: (progress: number) => void): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  
  // شبیه‌سازی شروع آپلود
  if(onProgress) onProgress(10);

  try {
    const response = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      body: formData
    });
    
    // شبیه‌سازی پیشرفت
    if(onProgress) onProgress(60);

    if (!response.ok) throw new Error('Upload failed on server');
    
    const data = await response.json();
    
    // اتمام آپلود
    if(onProgress) onProgress(100);
    
    return data.url; // لینک فایل آپلود شده
  } catch (error) {
    console.error("Upload Error:", error);
    throw error;
  }
};

// --- توابع نگهدارنده (Placeholder) ---
// این توابع در کد ادمین صدا زده می‌شوند، پس نباید حذف شوند حتی اگر کار خاصی نکنند
export const saveFirebaseConfig = (config: any) => {
    console.log("تنظیمات دیتابیس در فایل env لیارا مدیریت می‌شود.");
};

export const resetFirebaseConfig = () => {
    console.log("ریست تنظیمات در حالت سرور داخلی غیرفعال است.");
};

// --- همگام‌سازی دستی ---
// اگر ادمین دکمه "آپلود به سرور" را زد، دیتای لوکال را به سرور می‌فرستد
export const syncLocalToCloud = async () => {
    try {
        const localData = localStorage.getItem('siteContent');
        if (!localData) throw new Error("هیچ اطلاعاتی در حافظه مرورگر نیست.");
        
        await updateSiteContent(JSON.parse(localData));
        return "✅ اطلاعات با موفقیت به سرور لیارا منتقل شد.";
    } catch (e: any) {
        throw new Error("خطا در همگام‌سازی: " + e.message);
    }
};
