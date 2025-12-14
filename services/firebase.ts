import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, addDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { SiteContent, DEFAULT_CONTENT, FullRegistrationData, ContactMessage } from '../types';

export interface RegistrationData {
  directorName: string;
  phone: string;
  email: string;
  filmTitle: string;
  category: string;
  filmLink: string;
  posterLink: string;
  technicalInfo: string;
  bio: string;
  submittedAt: string;
}

// کلیدهای شما
const HARDCODED_CONFIG = {
  apiKey: "AIzaSyAzs_aRSnGxG496QL_1RL38AJASBZ3-5gw",
  authDomain: "sodakhial.firebaseapp.com",
  projectId: "sodakhial",
  storageBucket: "sodakhial.firebasestorage.app",
  messagingSenderId: "1026058271710",
  appId: "1:1026058271710:web:dd4aeb5cb96fb84f1efb4f"
};

const STORAGE_KEY_CONTENT = 'siteContent';

let db: any = null;
let storage: any = null;
let app: any = null;
let connectionError: string | null = null;

// راه‌اندازی اجباری
try {
    app = !getApps().length ? initializeApp(HARDCODED_CONFIG) : getApp();
    db = getFirestore(app);
    try { storage = getStorage(app); } catch (e) { console.warn("Storage skipped"); }
    console.log("🔥 Firebase initialized.");
} catch (e: any) {
    console.error("🔥 Error:", e);
    connectionError = e.message;
}

export const getConnectionStatus = () => {
    return { isConnected: !connectionError, error: connectionError };
};

export const getSiteContent = async (): Promise<SiteContent> => {
  // اولویت با سرور است
  if (!connectionError) {
      try {
        const docRef = doc(db, "content", "main");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as SiteContent;
          localStorage.setItem(STORAGE_KEY_CONTENT, JSON.stringify(data)); // آپدیت لوکال
          return data;
        }
      } catch (error) { console.error("Read Error:", error); }
  }
  // اگر سرور نشد، از لوکال بخون
  const stored = localStorage.getItem(STORAGE_KEY_CONTENT);
  return stored ? JSON.parse(stored) : DEFAULT_CONTENT;
};

export const updateSiteContent = async (newContent: SiteContent): Promise<void> => {
  // ۱. ذخیره سریع در مرورگر
  localStorage.setItem(STORAGE_KEY_CONTENT, JSON.stringify(newContent));

  if (connectionError) {
      alert("⚠️ دیتابیس قطع است. ذخیره فقط در مرورگر انجام شد.");
      return;
  }

  // ۲. ذخیره در سرور
  try {
    const docRef = doc(db, "content", "main");
    await setDoc(docRef, newContent);
    console.log("✅ Saved to Server");
  } catch (error) {
    console.error("Save Error:", error);
    alert("❌ خطا در ذخیره روی سرور! (فیلترشکن را چک کنید)");
    throw error;
  }
};

// 🔴 تابع جادویی: همگام‌سازی دستی (آپلود زورکی)
export const syncLocalToCloud = async () => {
    if (connectionError) throw new Error("اتصال به دیتابیس قطع است.");

    const localData = localStorage.getItem(STORAGE_KEY_CONTENT);
    if (!localData) throw new Error("هیچ اطلاعاتی در حافظه مرورگر نیست.");

    try {
        const data = JSON.parse(localData);
        const docRef = doc(db, "content", "main");
        await setDoc(docRef, data);
        return "✅ اطلاعات شما با موفقیت به سرور گوگل آپلود شد.";
    } catch (e: any) {
        throw new Error("خطا در آپلود: " + e.message);
    }
};

export const uploadFile = async (file: File, path: string, onProgress?: (progress: number) => void): Promise<string> => {
    if (!storage) { if(onProgress) onProgress(100); return URL.createObjectURL(file); }
    try {
        const storageRef = ref(storage, path);
        const uploadTask = uploadBytesResumable(storageRef, file);
        return new Promise((resolve, reject) => {
            uploadTask.on('state_changed', 
                (s) => { if (onProgress) onProgress((s.bytesTransferred / s.totalBytes) * 100); }, 
                (e) => resolve(URL.createObjectURL(file)), 
                async () => { resolve(await getDownloadURL(uploadTask.snapshot.ref)); }
            );
        });
    } catch (error) { return URL.createObjectURL(file); }
};

export const saveFirebaseConfig = (config: any) => {};
export const resetFirebaseConfig = () => { localStorage.removeItem(STORAGE_KEY_CONTENT); window.location.reload(); };

// --- Registrations & Messages ---
export const submitRegistration = async (data: FullRegistrationData) => {
  try { await addDoc(collection(db, "registrations"), { ...data, timestamp: new Date() }); return true; } catch (error) { throw error; }
};
export const getRegistrations = async (): Promise<FullRegistrationData[]> => {
    try {
        const q = query(collection(db, "registrations"), orderBy("timestamp", "desc"));
        const s = await getDocs(q);
        return s.docs.map(d => ({ id: d.id, ...d.data() } as unknown as FullRegistrationData));
    } catch (e) { return []; }
};
export const submitContactMessage = async (data: ContactMessage) => {
    try { await addDoc(collection(db, "messages"), { ...data, timestamp: new Date() }); return true; } catch (error) { throw error; }
};
export const getContactMessages = async (): Promise<ContactMessage[]> => {
    try {
        const q = query(collection(db, "messages"), orderBy("timestamp", "desc"));
        const s = await getDocs(q);
        return s.docs.map(d => ({ id: d.id, ...d.data() } as ContactMessage));
    } catch (e) { return []; }
};