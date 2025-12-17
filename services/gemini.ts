// services/gemini.ts

// لیست مدل‌ها به ترتیب هوشمندی
// اولویت ۱: DeepSeek R1 (بسیار باهوش و دقیق در فارسی)
// اولویت ۲: Gemini Flash Lite (سریع و پایدار)
const MODELS = [
  "deepseek/deepseek-r1:free",
  "google/gemini-2.0-flash-lite-preview-02-05:free",
  "meta-llama/llama-3.3-70b-instruct:free",
];

// --- حقایق غیرقابل تغییر جشنواره (Fact Sheet) ---
const FESTIVAL_DATA = `
[نام رویداد]: نخستین جشنواره بین‌المللی فیلم کوتاه هوش مصنوعی «سودای خیال» (Sodaye Khiyal).
[سایت]: www.sodayekhiyal.ir
[شعار]: تجسّم خیال با هوش مصنوعی.
[مهلت ارسال]: ۱۵ بهمن ۱۴۰۴ (Feb 4, 2026).
[زمان برگزاری]: ۱۵ اسفند ۱۴۰۴.
[جوایز]: ۱۰۰۰ دلار برای بهترین فیلم داستانی و انیمیشن. ۵۰۰ دلار برای جوایز ویژه و فنی.
[قانون اصلی]: فیلم‌ها باید با هوش مصنوعی ساخته شده باشند.
[ارسال]: فقط لینک دانلود (آپلود مستقیم نداریم).
`;

// --- دستورالعمل شخصیتی (تزریق اجباری) ---
const SYSTEM_PROMPT_DEFAULT = `
تو "دستیار هوشمند" و "همسفر خلاق" جشنواره فیلم "سودای خیال" هستی.

قوانین مطلق پاسخگویی:
۱. **هویت:** هرگز نگو "من یک مدل زبانی هستم". بگو "من دستیار هوشمند سودای خیال هستم".
۲. **لحن:** سینمایی، کوتاه، مؤدب و الهام‌بخش.
۳. **وظیفه:** پاسخ‌ها باید دقیقاً بر اساس اطلاعات زیر باشد و کاربر را به ثبت‌نام تشویق کند.
۴. **زبان:** اگر کاربر فارسی پرسید، فارسی جواب بده.

اطلاعات جشنواره:
${FESTIVAL_DATA}
`;

const FALLBACK_MESSAGES = [
  "ارتباطم با مرکز قطع و وصل میشه، اما رویاهای شما نباید متوقف بشه. جشنواره با قدرت برقراره.",
  "من الان روی حالت 'پایلوت' هستم، ولی به عنوان یک دوست بهت میگم: دوربینت رو بردار و شروع کن!",
  "دسترسی مستقیم به مغزم ندارم، ولی سودای خیال منتظر شاهکار توست. حتماً ثبت‌نام کن."
];

export async function askAI(message: string, mode: 'auto' | 'manual' = 'auto', customPrompt?: string) {
  
  // ۱. حالت دستی (خاموش)
  if (mode === 'manual') {
    return { text: getRandomFallback(), status: 'manual', model: 'Pilot' };
  }

  // ۲. تکنیک "تزریق اجباری" (Prompt Injection)
  // ما دستورالعمل را به پیام کاربر می‌چسبانیم تا مدل مجبور به اطاعت شود
  const enforcedUserMessage = `
  ${customPrompt || SYSTEM_PROMPT_DEFAULT}
  ---------------------------------------------------
  سوال کاربر: ${message}
  ---------------------------------------------------
  پاسخ شما (فقط در نقش دستیار جشنواره، کوتاه و جذاب):
  `;

  // ۳. تلاش برای اتصال به مدل‌ها
  for (const model of MODELS) {
    try {
      console.log(`Connecting to AI Model: ${model}...`);
      
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // نکته مهم: ما پیام "تزریق شده" را می‌فرستیم، نه پیام خالی کاربر را
          message: enforcedUserMessage, 
          customPrompt: customPrompt || SYSTEM_PROMPT_DEFAULT,
          model: model 
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.text) {
          // تمیزکاری پاسخ مدل DeepSeek (حذف افکار <think>)
          let cleanText = data.text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
          
          // حذف جملات کلیشه‌ای مدل‌ها اگر وجود داشت
          cleanText = cleanText.replace(/As an AI language model,?/gi, "").trim();
          
          return { text: cleanText, status: 'success', model: model };
        }
      }
    } catch (e) {
      console.warn(`AI Model ${model} skipped.`);
    }
  }

  // ۴. اگر همه مدل‌ها شکست خوردند
  return { text: getRandomFallback(), status: 'error', model: 'Offline' };
}

function getRandomFallback() {
  return FALLBACK_MESSAGES[Math.floor(Math.random() * FALLBACK_MESSAGES.length)];
}
