import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import multer from 'multer';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// اتصال به دیتابیس لیارا
if (process.env.MONGO_URI) {
    mongoose.connect(process.env.MONGO_URI)
        .then(() => console.log('✅ Connected to MongoDB'))
        .catch(err => console.error('❌ MongoDB Error:', err));
} else {
    console.warn('⚠️ Warning: MONGO_URI not found.');
}

// تنظیمات فضای ذخیره‌سازی لیارا
const s3 = new S3Client({
    region: "default",
    endpoint: process.env.LIARA_ENDPOINT,
    credentials: {
        accessKeyId: process.env.LIARA_ACCESS_KEY || '',
        secretAccessKey: process.env.LIARA_SECRET_KEY || ''
    }
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));
// سرو کردن فایل‌های بیلد شده React
app.use(express.static(path.join(__dirname, 'dist')));

// --- مدل‌های دیتابیس ---
const RegistrationSchema = new mongoose.Schema({}, { strict: false });
const Registration = mongoose.model('Registration', RegistrationSchema);

const MessageSchema = new mongoose.Schema({}, { strict: false });
const Message = mongoose.model('Message', MessageSchema);

const ContentSchema = new mongoose.Schema({ id: String, data: Object }, { strict: false });
const Content = mongoose.model('Content', ContentSchema);

// --- API ها ---

// 1. دریافت محتوا
app.get('/api/content', async (req, res) => {
    try {
        const doc = await Content.findOne({ id: 'main' });
        // اگر دیتابیس خالی بود، آبجکت خالی بفرست تا فرانت با دیفالت پر کنه
        res.json(doc ? doc.data : {});
    } catch (e) { res.status(500).json({}); }
});

// 2. ذخیره محتوا
app.post('/api/content', async (req, res) => {
    try {
        await Content.findOneAndUpdate({ id: 'main' }, { data: req.body }, { upsert: true, new: true });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// 3. ثبت‌نام
app.post('/api/registrations', async (req, res) => {
    try {
        await Registration.create({ ...req.body, submittedAt: new Date() });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/registrations', async (req, res) => {
    try {
        const data = await Registration.find().sort({ submittedAt: -1 });
        res.json(data);
    } catch (e) { res.json([]); }
});

// 4. پیام‌ها
app.post('/api/messages', async (req, res) => {
    try {
        await Message.create({ ...req.body, date: new Date() });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/messages', async (req, res) => {
    try {
        const data = await Message.find().sort({ date: -1 });
        res.json(data);
    } catch (e) { res.json([]); }
});

// 5. آپلود فایل
const upload = multer({ storage: multer.memoryStorage() });
app.post('/api/upload', upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).send('No file');
    try {
        // اسم فایل رو یونیک می‌کنیم
        const filename = `${Date.now()}_${req.file.originalname.replace(/\s/g, '_')}`;
        
        await s3.send(new PutObjectCommand({
            Bucket: process.env.LIARA_BUCKET_NAME,
            Key: filename,
            Body: req.file.buffer,
            ACL: 'public-read'
        }));

        // حذف https:// اول اندپوینت چون خود bucket اولش میاد
        const endpointRaw = process.env.LIARA_ENDPOINT.replace('https://', '');
        const url = `https://${process.env.LIARA_BUCKET_NAME}.${endpointRaw}/${filename}`;
        
        res.json({ url });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Upload failed' });
    }
});

// هدایت تمام درخواست‌ها به React
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
