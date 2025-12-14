import React, { useState } from 'react';
import { ArticleItem } from '../types';
import { X, Calendar, User, Tag, ChevronRight, BookOpen, Clock, Share2 } from 'lucide-react';

// تابع کمکی برای دریافت متن (فارسی یا انگلیسی)
// این تابع چک می‌کند که ورودی متن است یا آبجکت دوزبانه
const getText = (field: any) => {
  if (!field) return '';
  if (typeof field === 'string') return field;
  return field.fa || field.en || '';
};

interface Props {
  articles: ArticleItem[];
  onClose: () => void;
}

const ArticlesOverlay: React.FC<Props> = ({ articles, onClose }) => {
  const [selected, setSelected] = useState<ArticleItem | null>(null);

  return (
    <div className="fixed inset-0 z-50 bg-[#050505] text-white flex flex-col md:flex-row font-vazir overflow-hidden" dir="rtl">
      
      {/* ---------------------------------------------------------- */}
      {/* ستون سمت راست: لیست مقالات (Sidebar List) */}
      {/* ---------------------------------------------------------- */}
      <div 
        className={`w-full md:w-1/3 border-l border-white/10 flex flex-col h-full bg-[#0a0a0a] transition-all duration-500 ${selected ? 'hidden md:flex' : 'flex'}`}
      >
        
        {/* هدر لیست */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center shrink-0 bg-black/20 backdrop-blur-sm">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2 text-white">
              <BookOpen size={20} className="text-yellow-600"/> مقالات
            </h2>
            <p className="text-xs text-gray-500 mt-1 font-light tracking-wide">یادداشت‌ها و نقدهای سینمایی</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-red-500 transition p-2 rounded-full hover:bg-white/5"
          >
            <X size={24} strokeWidth={1.5} />
          </button>
        </div>

        {/* لیست اسکرول‌خور */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {articles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-600 gap-4 opacity-50">
              <BookOpen size={48} strokeWidth={0.5} />
              <p className="text-sm font-light">هنوز مقاله‌ای منتشر نشده است.</p>
            </div>
          ) : (
            articles.map((art) => (
              <div 
                key={art.id} 
                onClick={() => setSelected(art)} 
                className={`p-5 border-b border-white/5 cursor-pointer transition-all duration-300 group hover:bg-white/5 relative overflow-hidden ${selected?.id === art.id ? 'bg-white/5' : ''}`}
              >
                {/* خط نشانگر انتخاب شده */}
                {selected?.id === art.id && (
                  <div className="absolute right-0 top-0 bottom-0 w-1 bg-yellow-600 shadow-[0_0_10px_#ca8a04]"></div>
                )}

                <div className="flex justify-between items-start mb-2 opacity-60 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] font-mono text-yellow-600/80 bg-yellow-600/10 px-2 py-0.5 rounded border border-yellow-600/20">
                    {art.date}
                  </span>
                </div>
                
                <h3 className="font-bold text-base mb-2 leading-6 text-gray-200 group-hover:text-yellow-500 transition-colors">
                  {getText(art.title)}
                </h3>
                
                <p className="text-xs text-gray-500 line-clamp-2 leading-5 font-light">
                  {getText(art.summary)}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ---------------------------------------------------------- */}
      {/* ستون سمت چپ: نمایش کامل مقاله (Reader View) */}
      {/* ---------------------------------------------------------- */}
      <div className={`flex-1 bg-black h-full overflow-y-auto relative custom-scrollbar ${!selected ? 'hidden md:flex items-center justify-center' : 'block'}`}>
        
        {/* پس‌زمینه نویز سینمایی */}
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>

        {selected ? (
          <div className="max-w-4xl mx-auto p-6 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-700 relative z-10">
            
            {/* دکمه بازگشت (فقط موبایل) */}
            <button 
              onClick={() => setSelected(null)} 
              className="md:hidden flex items-center gap-1 text-xs text-gray-400 mb-6 hover:text-white transition group sticky top-0 bg-black/80 backdrop-blur py-3 w-full z-20 border-b border-white/10"
            >
              <ChevronRight size={14} className="group-hover:-translate-x-1 transition-transform" /> بازگشت به لیست
            </button>

            {/* تصویر شاخص (کاور) */}
            {selected.coverUrl && (
              <div className="relative w-full aspect-video md:h-[400px] rounded-xl overflow-hidden mb-8 border border-white/10 shadow-2xl group">
                <img 
                  src={selected.coverUrl} 
                  alt={getText(selected.title)} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 grayscale group-hover:grayscale-0"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
                
                {/* تایتل روی عکس (اختیاری برای زیبایی) */}
                <div className="absolute bottom-0 right-0 p-6 w-full">
                   <div className="h-1 w-20 bg-yellow-600 mb-4 rounded-full"></div>
                </div>
              </div>
            )}

            {/* سرتیترها و اطلاعات متا */}
            <div className="mb-8">
                <h1 className="text-2xl md:text-4xl font-black leading-tight mb-6 text-transparent bg-clip-text bg-gradient-to-l from-white via-gray-200 to-gray-500">
                {getText(selected.title)}
                </h1>

                <div className="flex flex-wrap items-center gap-6 text-xs text-gray-500 pb-6 border-b border-white/10 font-mono">
                <span className="flex items-center gap-2 hover:text-white transition">
                    <User size={14} className="text-yellow-600"/> 
                    {getText(selected.author)}
                </span>
                <span className="flex items-center gap-2 hover:text-white transition">
                    <Calendar size={14} className="text-yellow-600"/> 
                    {selected.date}
                </span>
                <span className="flex items-center gap-2 hover:text-white transition ml-auto cursor-pointer" title="زمان مطالعه">
                    <Clock size={14} className="text-gray-600"/> 
                    <span className="opacity-50">خواندن: ۵ دقیقه</span>
                </span>
                </div>
            </div>

            {/* متن اصلی مقاله (Reader Content) */}
            <article className="prose prose-invert prose-lg max-w-none mb-12">
              <div className="text-gray-300 font-light leading-9 whitespace-pre-wrap text-justify selection:bg-yellow-600/30 selection:text-white">
                {getText(selected.content)}
              </div>
            </article>

            {/* بخش تگ‌ها / هشتگ‌ها */}
            {selected.tags && (
              <div className="mt-12 pt-6 border-t border-white/10">
                <div className="flex items-center gap-2 mb-3 text-xs text-gray-500 uppercase tracking-widest">
                    <Tag size={12} /> برچسب‌ها
                </div>
                <div className="flex flex-wrap gap-2">
                  {selected.tags.split(',').map((tag, index) => {
                    const cleanTag = tag.trim();
                    if (!cleanTag) return null;
                    return (
                      <span 
                        key={index} 
                        className="flex items-center gap-1 bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-full text-xs text-gray-300 transition-colors cursor-pointer hover:border-yellow-600/50 hover:text-yellow-500"
                      >
                        #{cleanTag}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* فوتر مقاله */}
            <div className="mt-10 flex justify-between items-center opacity-30 hover:opacity-100 transition-opacity">
                <div className="text-[10px] uppercase tracking-[0.2em]">Sodaye Khial Magazine</div>
                <button className="flex items-center gap-2 text-xs hover:text-yellow-500 transition">
                    <Share2 size={14} /> اشتراک‌گذاری
                </button>
            </div>

          </div>
        ) : (
          // حالت خالی (Empty State) - وقتی هنوز مقاله‌ای انتخاب نشده
          <div className="text-center opacity-30 flex flex-col items-center select-none">
            <BookOpen size={80} strokeWidth={0.5} className="mb-6"/>
            <h3 className="text-xl font-bold mb-2">مجله سودای خیال</h3>
            <p className="text-sm font-light tracking-widest max-w-xs leading-6">
              جهت مطالعه، لطفاً یک مقاله را از لیست سمت راست انتخاب کنید.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};

export default ArticlesOverlay;
