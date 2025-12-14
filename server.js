import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import multer from 'multer';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// بارگذاری متغیرهای محیطی
dotenv.config();

// تنظیم مسیرها برای ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// --- 1. اتصال به دیتابیس (MongoDB) ---
if (process.env.MONGO_URI) {
    mongoose.connect(process.env.MONGO_URI)
        .then(() => console.log('✅ Connected to MongoDB'))
        .catch(err => console.error('❌ MongoDB Connection Error:', err));
} else {
    console.warn('⚠️ Warning: MONGO_URI is missing in environment variables.');
}

// --- 2. تنظیمات فضای ذخیره‌سازی (Liara S3) ---
const s3 = new S3Client({
    region: "default",
    endpoint: process.env.LIARA_ENDPOINT, // مثلا https://storage.iran.liara.space
    credentials: {
        accessKeyId: process.env.LIARA_ACCESS_KEY || '',
        secretAccessKey: process.env.LIARA_SECRET_KEY || ''
    }
});

// --- 3. میدل‌ورها (تنظیمات سرور) ---
app.use(cors()); // اجازه دسترسی به فرانت
app.use(express.json({ limit: '50mb' })); // افزایش حجم مجاز JSON برای دیتاهای بزرگ
app.use(express.static(path.join(__dirname, 'dist'))); // سرو کردن فایل‌های بیلد شده سایت

// --- 4. مدل‌های دیتابیس (Schemas) ---
// مدل ثبت‌نام (برای ذخیره فرم‌ها)
const RegistrationSchema = new mongoose.Schema({
    submittedAt: { type: Date, default: Date.now },
    // فیلدهای دیگر به صورت آزاد ذخیره می‌شوند (Strict: false)
}, { strict: false });
const Registration = mongoose.model('Registration', RegistrationSchema);

// مدل پیام‌ها (فرم تماس)
const MessageSchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
}, { strict: false });
const Message = mongoose.model('Message', MessageSchema);

// مدل محتوای سایت (برای ذخیره تغییرات پنل ادمین)
const ContentSchema = new mongoose.Schema({
    id: String,
    data: Object
}, { strict: false });
const Content = mongoose.model('Content', ContentSchema);

// --- 5. روت‌های API (Backend Logic) ---

// دریافت محتوای سایت
app.get('/api/content', async (req, res) => {
    try {
        const doc = await Content.findOne({ id: 'main' });
        // اگر دیتابیس خالی بود، آبجکت خالی برمی‌گرداند تا فرانت‌اِند دیتای پیش‌فرض را نشان دهد
        res.json(doc ? doc.data : {});
    } catch (e) {
        console.error("Error fetching content:", e);
        res.status(500).json({ error: "Database error" });
    }
});

// ذخیره محتوای سایت (از پنل ادمین)
app.post('/api/content', async (req, res) => {
    try {
        // upsert: true یعنی اگر نبود بساز، اگر بود آپدیت کن
        await Content.findOneAndUpdate({ id: 'main' }, { data: req.body }, { upsert: true, new: true });
        res.json({ success: true });
    } catch (e) {
        console.error("Error saving content:", e);
        res.status(500).json({ error: e.message });
    }
});

// ثبت‌نام جدید
app.post('/api/registrations', async (req, res) => {
    try {
        const newReg = { ...req.body, submittedAt: new Date() };
        await Registration.create(newReg);
        res.json({ success: true });
    } catch (e) {
        console.error("Registration error:", e);
        res.status(500).json({ error: e.message });
    }
});

// دریافت لیست ثبت‌نام‌ها (برای ادمین)
app.get('/api/registrations', async (req, res) => {
    try {
        const data = await Registration.find().sort({ submittedAt: -1 });
        res.json(data);
    } catch (e) {
        res.json([]);
    }
});

// ثبت پیام جدید
app.post('/api/messages', async (req, res) => {
    try {
        await Message.create({ ...req.body, date: new Date() });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// دریافت پیام‌ها
app.get('/api/messages', async (req, res) => {
    try {
        const data = await Message.find().sort({ date: -1 });
        res.json(data);
    } catch (e) {
        res.json([]);
    }
});

// --- 6. آپلود فایل (اتصال به S3 لیارا) ---
const upload = multer({ storage: multer.memoryStorage() }); // فایل موقتاً در رم ذخیره می‌شود

app.post('/api/upload', upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).send('No file uploaded.');

    try {
        // ساخت نام یکتا برای فایل تا تکراری نشود
        const filename = `${Date.now()}_${req.file.originalname.replace(/\s/g, '_')}`;

        // دستور آپلود به لیارا
        await s3.send(new PutObjectCommand({
            Bucket: process.env.LIARA_BUCKET_NAME,
            Key: filename,
            Body: req.file.buffer,
            ContentType: req.file.mimetype, // نوع فایل (عکس، ویدیو و...)
            ACL: 'public-read' // فایل عمومی باشد تا در سایت دیده شود
        }));

        // ساخت لینک دانلود فایل
        // نکته: در لیارا معمولا اندپوینت شامل https:// است، آن را تمیز می‌کنیم
        const endpointRaw = process.env.LIARA_ENDPOINT.replace('https://', '').replace('http://', '');
        const url = `https://${process.env.LIARA_BUCKET_NAME}.${endpointRaw}/${filename}`;

        res.json({ url });
    } catch (e) {
        console.error("Upload error:", e);
        res.status(500).json({ error: 'Upload failed' });
    }
});

// --- 7. سرو کردن سایت (React) ---
// هر درخواستی که API نبود، به فایل index.html هدایت می‌شود تا React Router کار کند
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// روشن کردن سرور
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
