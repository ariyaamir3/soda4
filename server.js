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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// --- اصلاح حیاتی: پشتیبانی از نام‌های مختلف متغیرها ---
const MONGO_URL = process.env.MONGO_URI || process.env.MONGODB_URI;
const S3_ENDPOINT = process.env.LIARA_ENDPOINT || process.env.S3_ENDPOINT;
const S3_ACCESS = process.env.LIARA_ACCESS_KEY || process.env.S3_ACCESS_KEY;
const S3_SECRET = process.env.LIARA_SECRET_KEY || process.env.S3_SECRET_KEY;
const S3_BUCKET = process.env.LIARA_BUCKET_NAME || process.env.S3_BUCKET;
const AI_KEY = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

// لاگ کردن وضعیت برای دیباگ (بدون نمایش رمزها)
console.log("--- Server Config Check ---");
console.log("DB URL Found:", !!MONGO_URL);
console.log("S3 Endpoint:", S3_ENDPOINT);
console.log("S3 Bucket:", S3_BUCKET);
console.log("AI Key Found:", !!AI_KEY);
console.log("---------------------------");

// --- 1. اتصال به دیتابیس ---
if (MONGO_URL) {
    mongoose.connect(MONGO_URL)
        .then(() => console.log('✅ Connected to MongoDB Successfully'))
        .catch(err => console.error('❌ MongoDB Connection Error:', err));
} else {
    console.error('❌ CRITICAL: No MongoDB URI found. Saving will not work.');
}

// --- 2. تنظیمات فضای ذخیره‌سازی ---
const s3 = new S3Client({
    region: "default",
    endpoint: S3_ENDPOINT,
    credentials: {
        accessKeyId: S3_ACCESS || '',
        secretAccessKey: S3_SECRET || ''
    }
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'dist')));

// --- 3. مدل‌ها ---
const Registration = mongoose.model('Registration', new mongoose.Schema({}, { strict: false }));
const Message = mongoose.model('Message', new mongoose.Schema({}, { strict: false }));
const Content = mongoose.model('Content', new mongoose.Schema({ id: String, data: Object }, { strict: false }));

// --- 4. روت‌های API ---

// دریافت محتوا
app.get('/api/content', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            console.warn("Database not connected, sending empty object.");
            return res.json({});
        }
        const doc = await Content.findOne({ id: 'main' });
        res.json(doc ? doc.data : {});
    } catch (e) {
        console.error("Fetch content error:", e);
        res.status(500).json({ error: "Database error" });
    }
});

// ذخیره محتوا
app.post('/api/content', async (req, res) => {
    try {
        await Content.findOneAndUpdate({ id: 'main' }, { data: req.body }, { upsert: true, new: true });
        console.log("✅ Content saved successfully");
        res.json({ success: true });
    } catch (e) {
        console.error("Save content error:", e);
        res.status(500).json({ error: e.message });
    }
});

// ثبت‌نام
app.post('/api/registrations', async (req, res) => {
    try {
        await Registration.create({ ...req.body, submittedAt: new Date() });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/registrations', async (req, res) => {
    try { const data = await Registration.find().sort({ submittedAt: -1 }); res.json(data); } 
    catch (e) { res.json([]); }
});

// پیام‌ها
app.post('/api/messages', async (req, res) => {
    try { await Message.create({ ...req.body, date: new Date() }); res.json({ success: true }); } 
    catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/messages', async (req, res) => {
    try { const data = await Message.find().sort({ date: -1 }); res.json(data); } 
    catch (e) { res.json([]); }
});

// --- 5. پروکسی هوش مصنوعی ---
app.post('/api/chat', (req, res) => {
    const { message, customPrompt, model } = req.body;
    
    if (!AI_KEY) return res.status(500).json({ error: "API Key missing" });

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
            'Authorization': `Bearer ${AI_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://sodayekhiyal.ir',
            'X-Title': 'Soodaye Khial'
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
            } catch (e) { res.status(500).json({ error: "Parse error" }); }
        });
    });

    request.on('error', (e) => {
        console.error("AI Proxy Error:", e);
        res.status(500).json({ error: "Network error" });
    });

    request.write(postData);
    request.end();
});

// --- 6. آپلود فایل ---
const upload = multer({ storage: multer.memoryStorage() });

app.post('/api/upload', upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).send('No file uploaded.');

    try {
        const filename = `${Date.now()}_${req.file.originalname.replace(/\s/g, '_')}`;
        
        await s3.send(new PutObjectCommand({
            Bucket: S3_BUCKET,
            Key: filename,
            Body: req.file.buffer,
            ContentType: req.file.mimetype,
            ACL: 'public-read'
        }));

        // تمیزکاری آدرس اندپوینت
        let endpointClean = S3_ENDPOINT.replace('https://', '').replace('http://', '');
        if (endpointClean.endsWith('/')) endpointClean = endpointClean.slice(0, -1);
        
        const url = `https://${S3_BUCKET}.${endpointClean}/${filename}`;
        
        console.log("Upload Success:", url);
        res.json({ url });
    } catch (e) {
        console.error("Upload error:", e);
        res.status(500).json({ error: 'Upload failed' });
    }
});

// سرو کردن فرانت
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
