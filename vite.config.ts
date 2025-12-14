import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // بارگذاری تمام متغیرهای محیطی از فایل‌های .env (برای دسترسی به کلیدها)
  const env = loadEnv(mode, '.', '');

  return {
    server: {
      port: 5000, // پورت پیش‌فرض شما
      host: '0.0.0.0', // برای دسترسی در شبکه
      strictPort: true,
      allowedHosts: true, // اجازه دسترسی از دامنه‌های مختلف
      
      // تنظیمات حیاتی برای اتصال فرانت‌اِند به سرور جدید (server.js)
      proxy: {
        '/api': {
          target: 'http://localhost:3000', // هدایت درخواست‌ها به پورت سرور
          changeOrigin: true,
          secure: false,
        },
        '/uploads': {
          target: 'http://localhost:3000', // هدایت تصاویر آپلودی به سرور
          changeOrigin: true,
          secure: false,
        }
      }
    },
    
    plugins: [react()],
    
    // تعریف متغیرها برای دسترسی در فایل‌های پروژه
    define: {
      'process.env': env, // سازگاری با کدهایی که از process.env استفاده می‌کنند
      // اطمینان از اینکه کلید جمینای چه با VITE_ و چه بدون آن خوانده شود
      'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY),
    },

    resolve: {
      alias: {
        // تنظیم حیاتی برای ساختار فلت: @ به همین پوشه جاری اشاره می‌کند
        '@': path.resolve(__dirname, '.'),
      }
    },

    build: {
      outDir: 'dist', // پوشه خروجی نهایی
      emptyOutDir: true, // پاک کردن بیلد قبلی قبل از بیلد جدید
      sourcemap: false // غیرفعال کردن سورس‌مپ برای امنیت و سبکی
    }
  };
});
