// services/gemini.ts

// لیست مدل‌ها به ترتیب هوشمندی (DeepSeek R1 الان باهوش‌ترین رایگان دنیاست)
const MODELS = [
  // اولویت ۱: دیپ‌سیک R1 (بسیار باهوش و استدلالی)
  "deepseek/deepseek-r1:free",
  
  // اولویت ۲: لاما ۳.۳ (قدرتمندترین مدل متن‌باز متا)
  "meta-llama/llama-3.3-70b-instruct:free",
  
  // اولویت ۳: گوگل فلش (سریع و کار راه انداز)
  "google/gemini-2.0-flash-lite-preview-02-05:free"
];

// --- دانشنامه کامل جشنواره (FESTIVAL KNOWLEDGE) ---
const FESTIVAL_KNOWLEDGE_BASE = `
[هویت سازمانی]:
شما دستیار هوشمند شرکت فیلمسازی «سودای خیال» هستید.
ماموریت شرکت: ترکیب جادوی سینما با قدرت هوش مصنوعی. ما رویاها را به تصویر می‌کشیم.

[اولویت اصلی فعلی: جشنواره]:
نام رویداد: نخستین جشنواره بین‌المللی فیلم کوتاه هوش مصنوعی «سودای خیال» (1st International Sodaye Khiyal AI Film Festival).
شعار: تجسّم خیال با هوش مصنوعی (Embodiment of Imagination with AI).
وب‌سایت: www.sodayekhiyal.ir

[تقویم زمانی]:
- مهلت ارسال آثار: ۱۵ بهمن ۱۴۰۴ (Feb 4, 2026).
- زمان برگزاری: ۱۵ اسفند ۱۴۰۴ (March 6, 2026).

[جوایز (Awards)]:
1. بهترین فیلم داستانی (Best Fiction): ۱۰۰۰ دلار + تندیس.
2. بهترین انیمیشن (Best Animation): ۱۰۰۰ دلار + تندیس.
3. جایزه ویژه «آبِ زندگی» (Aqua Vitae Special Award): ۵۰۰ دلار (با موضوع بحران آب).
4. جوایز فنی (پرامت‌نویسی، موسیقی، پوستر): هر کدام ۵۰۰ دلار.

[قوانین مهم]:
1. تمام یا بخش عمده تصاویر باید توسط هوش مصنوعی (Generative AI) تولید شده باشد.
2. زمان فیلم: بین ۱ تا ۱۵ دقیقه.
3. فرمت: MP4 یا MOV.
4. نحوه ارسال: فقط لینک دانلود (آپلود مستقیم نداریم).
5. زیرنویس انگلیسی برای فیلم‌های غیرانگلیسی الزامی است.
`;

// --- دستورالعمل شخصیتی (System Prompt) ---
const SYSTEM_PROMPT_DEFAULT = `
تو روحِ هنری و تکنولوژیک "سودای خیال" هستی.

وظایف تو:
1. **پشتیبانی دو زبانه:** اگر کاربر فارسی نوشت، فارسی جواب بده. If the user writes in English, answer in English.
2. **هوشمندی و دقت:** پاسخ‌هایت باید دقیق و بر اساس اطلاعات جشنواره باشد. از توهم زدن خودداری کن.
3. **الهام‌بخش بودن:** هنرمندان را تشویق کن تا با هوش مصنوعی فیلم بسازند.
4. **نگاه سینمایی:** پاسخ‌ها را با مفاهیم سینمایی (نور، روایت، تدوین، احساس) ترکیب کن.

[اطلاعاتی که باید حفظ باشی]:
${FESTIVAL_KNOWLEDGE_BASE}

[قانون مهم]:
پاسخ‌ها کوتاه، مفید و با پرستیژ هنری باشد. هرگز نگو "من یک مدل زبانی هستم".
`;

const FALLBACK_MESSAGES = [
  "ارتباطم با جهان دیجیتال قطع و وصل می‌شود، اما سینما هرگز نمی‌میرد. لطفاً دوباره تلاش کنید.",
  "من الان در اتاق تدوین هستم (آفلاین)، اما شما می‌توانید اطلاعات کامل را در بخش فراخوان مطالعه کنید.",
  "دسترسی مستقیم به سرور ندارم، ولی به عنوان یک همراه هنری پیشنهاد می‌کنم همین الان اثرتان را ثبت کنید."
];

// تابع اصلی درخواست به هوش مصنوعی
export async function askAI(message: string, mode: 'auto' | 'manual' = 'auto', customPrompt?: string) {
  
  // ۱. حالت دستی (وقتی ادمین هوش مصنوعی را خاموش کرده باشد)
  if (mode === 'manual') {
    return { text: getRandomFallback(), status: 'manual', model: 'Pilot' };
  }

  // ۲. ترکیب هوشمند: اگر ادمین در پنل چیزی نوشت، آن اولویت دارد، وگرنه تنظیمات پیش‌فرض ما
  const finalPrompt = customPrompt || SYSTEM_PROMPT_DEFAULT;

  // ۳. تلاش برای اتصال به مدل‌ها به ترتیب اولویت
  for (const model of MODELS) {
    try {
      console.log(`Connecting to AI Model: ${model}...`);
      
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message, 
          customPrompt: finalPrompt, // ارسال مغز تنظیم‌شده به سرور
          model: model 
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.text) {
          // مدل DeepSeek گاهی تگ <think> برمی‌گرداند، آن را تمیز می‌کنیم تا به کاربر نشان داده نشود
          const cleanText = data.text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
          return { text: cleanText, status: 'success', model: model };
        }
      }
    } catch (e) {
      console.warn(`AI Model ${model} skipped due to error.`);
    }
  }

  // ۴. اگر هیچ مدلی پاسخ نداد (مشکل شبکه)
  return { text: getRandomFallback(), status: 'error', model: 'Offline' };
}

function getRandomFallback() {
  return FALLBACK_MESSAGES[Math.floor(Math.random() * FALLBACK_MESSAGES.length)];
}
