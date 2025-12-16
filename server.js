import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import multer from 'multer';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import https from 'https';

// --- 1. تنظیمات اولیه سیستم ---
dotenv.config();

// تنظیم مسیرهای فایل برای ماژول‌های ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// --- 2. دریافت هوشمند متغیرهای محیطی ---
// این بخش تضمین می‌کند که چه با نام‌های من و چه با نام‌های لیارا، سرور کار کند
const MONGO_URL = process.env.MONGO_URI || process.env.MONGODB_URI;
const S3_ENDPOINT = process.env.LIARA_ENDPOINT || process.env.S3_ENDPOINT;
const S3_ACCESS = process.env.LIARA_ACCESS_KEY || process.env.S3_ACCESS_KEY;
const S3_SECRET = process.env.LIARA_SECRET_KEY || process.env.S3_SECRET_KEY;
const S3_BUCKET = process.env.LIARA_BUCKET_NAME || process.env.S3_BUCKET;
const AI_KEY = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

// --- 3. بررسی سلامت سرور در لحظه شروع ---
console.log("=================================");
console.log("🚀 STARTING SOODAYE KHIYAL SERVER");
console.log("=================================");
console.log(`📡 Port: ${PORT}`);
console.log(`💾 Database URL Found: ${!!MONGO_URL}`);
console.log(`☁️  Object Storage Endpoint: ${S3_ENDPOINT}`);
console.log(`☁️  Object Storage Bucket: ${S3_BUCKET}`);
console.log(`🤖 AI API Key Loaded: ${!!AI_KEY ? "YES" : "NO (Chat will be disabled)"}`);
console.log("=================================");

// --- 4. اتصال به دیتابیس (MongoDB) ---
if (MONGO_URL) {
    mongoose.connect(MONGO_URL)
        .then(() => console.log('✅ MongoDB Connection Established Successfully.'))
        .catch(err => {
            console.error('❌ MongoDB Connection Failed!');
            console.error(err);
        });
} else {
    console.error('❌ CRITICAL ERROR: MongoDB URI is missing. Data will not be saved.');
}

// --- 5. تنظیمات فضای ذخیره‌سازی (Liara S3) ---
const s3 = new S3Client({
    region: "default",
    endpoint: S3_ENDPOINT,
    credentials: {
        accessKeyId: S3_ACCESS || '',
        secretAccessKey: S3_SECRET || ''
    }
});

// --- 6. میدل‌ورها (تنظیمات امنیتی و ترافیک) ---
app.use(cors()); // اجازه دسترسی از همه جا (برای رفع مشکل CORS)
app.use(express.json({ limit: '50mb' })); // افزایش حجم مجاز آپلود دیتا
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
// سرو کردن فایل‌های استاتیک (سایت بیلد شده)
app.use(express.static(path.join(__dirname, 'dist')));

// --- 7. مدل‌های دیتابیس (Mongoose Schemas) ---

// مدل ثبت‌نام کاربران (Registration)
// strict: false یعنی هر فیلدی که از فرم بیاید (مثل عوامل، لینک‌ها و...) ذخیره شود
const RegistrationSchema = new mongoose.Schema({
    submittedAt: { type: Date, default: Date.now },
}, { strict: false });
const Registration = mongoose.model('Registration', RegistrationSchema);

// مدل پیام‌های تماس با ما
const MessageSchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
}, { strict: false });
const Message = mongoose.model('Message', MessageSchema);

// مدل محتوای سایت (Site Content)
// این مدل تمام تنظیمات پنل ادمین را نگه می‌دارد
const ContentSchema = new mongoose.Schema({
    id: String, // همیشه 'main' است
    data: Object // کل تنظیمات سایت داخل این آبجکت است
}, { strict: false });
const Content = mongoose.model('Content', ContentSchema);

// --- 8. روت‌های API (Backend Logic) ---

/**
 * دریافت محتوای سایت
 * اگر دیتابیس خالی بود یا وصل نبود، آبجکت خالی برمی‌گرداند تا سایت کرش نکند.
 */
app.get('/api/content', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            console.warn("⚠️ DB Not Connected. Returning empty content.");
            return res.json({});
        }
        const doc = await Content.findOne({ id: 'main' });
        res.json(doc ? doc.data : {});
    } catch (e) {
        console.error("Error fetching content:", e);
        res.status(500).json({ error: "Server Error" });
    }
});

/**
 * ذخیره محتوای سایت (از پنل ادمین)
 */
app.post('/api/content', async (req, res) => {
    try {
        console.log("💾 Saving content update...");
        await Content.findOneAndUpdate(
            { id: 'main' }, 
            { data: req.body }, 
            { upsert: true, new: true }
        );
        console.log("✅ Content saved successfully.");
        res.json({ success: true });
    } catch (e) {
        console.error("❌ Error saving content:", e);
        res.status(500).json({ error: e.message });
    }
});

/**
 * ثبت‌نام جدید در جشنواره
 */
app.post('/api/registrations', async (req, res) => {
    try {
        console.log("📝 New Registration Received");
        const newReg = { ...req.body, submittedAt: new Date() };
        await Registration.create(newReg);
        res.json({ success: true });
    } catch (e) {
        console.error("❌ Registration Error:", e);
        res.status(500).json({ error: e.message });
    }
});

/**
 * دریافت لیست ثبت‌نام‌کنندگان (برای ادمین)
 */
app.get('/api/registrations', async (req, res) => {
    try {
        const data = await Registration.find().sort({ submittedAt: -1 });
        res.json(data);
    } catch (e) {
        console.error(e);
        res.json([]);
    }
});

/**
 * ثبت پیام تماس با ما
 */
app.post('/api/messages', async (req, res) => {
    try {
        await Message.create({ ...req.body, date: new Date() });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/messages', async (req, res) => {
    try {
        const data = await Message.find().sort({ date: -1 });
        res.json(data);
    } catch (e) {
        res.json([]);
    }
});

/**
 * 🔴 سیستم پروکسی هوشمند برای هوش مصنوعی (AI Proxy)
 * این بخش درخواست کاربر را می‌گیرد و از طریق سرور لیارا (که فیلتر نیست) به OpenRouter می‌فرستد.
 */
app.post('/api/chat', async (req, res) => {
    const { message, customPrompt, model } = req.body;
    
    if (!AI_KEY) {
        console.error("❌ AI Error: No API Key found on server.");
        return res.status(500).json({ error: "Server API Key Missing" });
    }

    console.log(`🤖 AI Request: "${message?.substring(0, 20)}..."`);

    try {
        // استفاده از fetch برای ارتباط مدرن‌تر
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${AI_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://sodayekhiyal.ir", // آدرس سایت شما
                "X-Title": "Soodaye Khial"
            },
            body: JSON.stringify({
                model: model || "google/gemini-2.0-flash-exp:free",
                messages: [
                    { role: "system", content: customPrompt || "You are a helpful assistant." },
                    { role: "user", content: message }
                ]
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error(`❌ OpenRouter API Error (${response.status}):`, errText);
            return res.status(response.status).json({ error: "AI Provider Error", details: errText });
        }

        const data = await response.json();
        const answer = data.choices?.[0]?.message?.content;

        if (!answer) {
            console.error("❌ OpenRouter returned empty content.");
            return res.status(500).json({ error: "Empty response from AI" });
        }

        console.log("✅ AI Response Success");
        res.json({ text: answer });

    } catch (error) {
        console.error("❌ Network/Server Error in AI Proxy:", error);
        res.status(500).json({ error: "Internal Proxy Error" });
    }
});

/**
 * 📤 آپلود فایل به Object Storage لیارا
 */
const upload = multer({ storage: multer.memoryStorage() });

app.post('/api/upload', upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).send('No file uploaded.');

    try {
        // تولید نام فایل یکتا (Timestamp + نام اصلی تمیز شده)
        const cleanName = req.file.originalname.replace(/\s+/g, '_').replace(/[()]/g, '');
        const filename = `${Date.now()}_${cleanName}`;

        console.log(`📤 Uploading file: ${filename} to bucket: ${S3_BUCKET}`);

        // دستور آپلود به S3
        await s3.send(new PutObjectCommand({
            Bucket: S3_BUCKET,
            Key: filename,
            Body: req.file.buffer,
            ContentType: req.file.mimetype,
            ACL: 'public-read' // فایل عمومی باشد تا در سایت دیده شود
        }));

        // ساخت لینک دانلود نهایی
        // حذف پروتکل‌های اضافی از اندپوینت برای ساخت لینک تمیز
        let endpointClean = S3_ENDPOINT.replace('https://', '').replace('http://', '');
        if (endpointClean.endsWith('/')) endpointClean = endpointClean.slice(0, -1);
        
        // فرمت لینک لیارا: https://BUCKET.ENDPOINT/FILENAME
        const url = `https://${S3_BUCKET}.${endpointClean}/${filename}`;

        console.log("✅ Upload Success:", url);
        res.json({ url });
    } catch (e) {
        console.error("❌ Upload Failed Detailed Error:", e);
        res.status(500).json({ error: 'Upload failed', details: e.message });
    }
});

// --- 9. سرو کردن فرانت‌اِند (SPA) ---
// هر درخواستی که به APIها مربوط نبود، فایل index.html را برمی‌گرداند
// این کار باعث می‌شود React Router در رفرش کردن صفحه کار کند
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// --- 10. روشن کردن سرور ---
app.listen(PORT, () => {
    console.log(`\n✅ SERVER IS RUNNING ON PORT ${PORT}`);
    console.log("Ready to serve requests...\n");
});
