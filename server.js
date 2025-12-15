import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import multer from 'multer';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import https from 'https';

// بارگذاری متغیرهای محیطی
dotenv.config();

// تنظیم مسیرها
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
    console.warn('⚠️ Warning: MONGO_URI is missing.');
}

// --- 2. تنظیمات فضای ذخیره‌سازی (Liara S3) ---
const s3 = new S3Client({
    region: "default",
    endpoint: process.env.LIARA_ENDPOINT,
    credentials: {
        accessKeyId: process.env.LIARA_ACCESS_KEY || '',
        secretAccessKey: process.env.LIARA_SECRET_KEY || ''
    }
});

// --- 3. میدل‌ورها ---
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'dist')));

// --- 4. مدل‌های دیتابیس ---
const Registration = mongoose.model('Registration', new mongoose.Schema({}, { strict: false }));
const Message = mongoose.model('Message', new mongoose.Schema({}, { strict: false }));
const Content = mongoose.model('Content', new mongoose.Schema({ id: String, data: Object }, { strict: false }));

// --- 5. روت‌های API ---

// دریافت محتوا
app.get('/api/content', async (req, res) => {
    try {
        const doc = await Content.findOne({ id: 'main' });
        res.json(doc ? doc.data : {});
    } catch (e) {
        res.status(500).json({ error: "Database error" });
    }
});

// ذخیره محتوا
app.post('/api/content', async (req, res) => {
    try {
        await Content.findOneAndUpdate({ id: 'main' }, { data: req.body }, { upsert: true, new: true });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// ثبت‌نام
app.post('/api/registrations', async (req, res) => {
    try {
        await Registration.create({ ...req.body, submittedAt: new Date() });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// لیست ثبت‌نام‌ها
app.get('/api/registrations', async (req, res) => {
    try {
        const data = await Registration.find().sort({ submittedAt: -1 });
        res.json(data);
    } catch (e) {
        res.json([]);
    }
});

// ثبت پیام
app.post('/api/messages', async (req, res) => {
    try {
        await Message.create({ ...req.body, date: new Date() });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// لیست پیام‌ها
app.get('/api/messages', async (req, res) => {
    try {
        const data = await Message.find().sort({ date: -1 });
        res.json(data);
    } catch (e) {
        res.json([]);
    }
});

// --- 6. پروکسی هوشمند برای هوش مصنوعی (رفع فیلتر) ---
app.post('/api/chat', (req, res) => {
    const { message, customPrompt, model } = req.body;
    const apiKey = process.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: "API Key missing on server" });
    }

    const postData = JSON.stringify({
        model: model || "google/gemini-2.0-flash-exp:free",
        messages: [
            { role: "system", content: customPrompt || "You are a helpful assistant." },
            { role: "user", content: message }
        ]
    });

    const options = {
        hostname: 'openrouter.ai',
        path: '/api/v1/chat/completions',
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://sodayekhiyal.ir',
            'X-Title': 'Soodaye Khial',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    const request = https.request(options, (response) => {
        let body = '';
        response.on('data', (chunk) => body += chunk);
        response.on('end', () => {
            try {
                const json = JSON.parse(body);
                const answer = json.choices?.[0]?.message?.content;
                res.json({ text: answer || "..." });
            } catch (e) {
                console.error("AI Parse Error:", e);
                res.status(500).json({ error: "Failed to parse AI response" });
            }
        });
    });

    request.on('error', (e) => {
        console.error("AI Network Error:", e);
        res.status(500).json({ error: "Network error to OpenRouter" });
    });

    request.write(postData);
    request.end();
});

// --- 7. آپلود فایل ---
const upload = multer({ storage: multer.memoryStorage() });

app.post('/api/upload', upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).send('No file uploaded.');

    try {
        const filename = `${Date.now()}_${req.file.originalname.replace(/\s/g, '_')}`;
        await s3.send(new PutObjectCommand({
            Bucket: process.env.LIARA_BUCKET_NAME,
            Key: filename,
            Body: req.file.buffer,
            ContentType: req.file.mimetype,
            ACL: 'public-read'
        }));

        const endpointRaw = process.env.LIARA_ENDPOINT.replace('https://', '').replace('http://', '');
        const url = `https://${process.env.LIARA_BUCKET_NAME}.${endpointRaw}/${filename}`;

        res.json({ url });
    } catch (e) {
        console.error("Upload error:", e);
        res.status(500).json({ error: 'Upload failed' });
    }
});

// سرو کردن ایندکس برای تمام روت‌ها
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
