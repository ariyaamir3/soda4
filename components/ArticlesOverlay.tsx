import React, { useState } from 'react';
import { ArticleItem } from '../types';
import { X, Calendar, User, Tag, ChevronRight, BookOpen } from 'lucide-react';

// تابع کمکی برای دریافت متن (فارسی یا انگلیسی)
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
    <div className="fixed inset-0 z-50 bg-[#050505] text-white flex flex-col md:flex-row font-vazir" dir="rtl">
      
      {/* --- ستون سمت راست: لیست مقالات --- */}
      <div className={`w-full md:w-1/3 border-l border-white/10 flex flex-col h-full bg-[#0a0a0a] ${selected ? 'hidden md:flex' : 'flex'}`}>
        
        {/* هدر لیست */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <BookOpen size={20} className="text-yellow-600"/> مقالات
            </h2>
            <p className="text-xs text-gray-500 mt-1">یادداشت‌های سینمایی</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition p-2">
            <X size={24} />
          </button>
        </div>

        {/* لیست آیتم‌ها */}
        <div className="flex-1 overflow-y-auto">
          {articles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-600 gap-4">
              <BookOpen size={40} strokeWidth={1} />
              <p className="text-sm">هنوز مقاله‌ای منتشر نشده است.</p>
            </div>
          ) : (
            articles.map((art) => (
              <div 
                key={art.id} 
                onClick={() => setSelected(art)} 
                className={`p-5 border-b border-white/5 cursor-pointer transition-all duration-300 group hover:bg-white/5 ${selected?.id === art.id ? 'bg-white/5 border-r-4 border-yellow-600' : ''}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-mono text-yellow-600/70 bg-yellow-600/10 px-2 py-0.5 rounded">
                    {art.date}
                  </span>
                </div>
                <h3 className="font-bold text-base mb-2 leading-6 group-hover:text-yellow-500 transition-colors">
                  {getText(art.title)}
                </h3>
                <p className="text-xs text-gray-500 line-clamp-2 leading-5">
                  {getText(art.summary)}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* --- ستون سمت چپ: نمایش کامل مقاله (Reader) --- */}
      <div className={`flex-1 bg-black h-full overflow-y-auto relative ${!selected ? 'hidden md:flex items-center justify-center' : 'block'}`}>
        
        {selected ? (
          <div className="max-w-4xl mx-auto p-6 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* دکمه بازگشت در موبایل */}
            <button 
              onClick={() => setSelected(null)} 
              className="md:hidden flex items-center gap-1 text-xs text-gray-400 mb-6 hover:text-white"
            >
              <ChevronRight size={14} /> بازگشت به لیست
            </button>

            {/* تصویر شاخص مقاله */}
            {selected.coverUrl && (
              <div className="relative w-full aspect-video md:h-96 rounded-lg overflow-hidden mb-8 border border-white/10 shadow-2xl">
                <img 
                  src={selected.coverUrl} 
                  alt={getText(selected.title)} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
              </div>
            )}

            {/* عنوان اصلی */}
            <h1 className="text-2xl md:text-4xl font-black leading-tight mb-6 text-transparent bg-clip-text bg-gradient-to-l from-white to-gray-400">
              {getText(selected.title)}
            </h1>

            {/* اطلاعات نویسنده و تاریخ */}
            <div className="flex flex-wrap items-center gap-6 text-xs text-gray-500 mb-10 pb-6 border-b border-white/10 font-mono">
              <span className="flex items-center gap-2">
                <User size={14} className="text-yellow-600"/> 
                {getText(selected.author)}
              </span>
              <span className="flex items-center gap-2">
                <Calendar size={14} className="text-yellow-600"/> 
                {selected.date}
              </span>
            </div>

            {/* متن اصلی مقاله */}
            <article className="prose prose-invert prose-lg max-w-none">
              <div className="text-gray-300 font-light leading-9 whitespace-pre-wrap text-justify selection:bg-yellow-600/30">
                {getText(selected.content)}
              </div>
            </article>

            {/* هشتگ‌ها / تگ‌ها */}
            {selected.tags && (
              <div className="mt-12 pt-6 border-t border-white/10">
                <div className="flex flex-wrap gap-2">
                  {selected.tags.split(',').map((tag, index) => (
                    tag.trim() && (
                      <span key={index} className="flex items-center gap-1 bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1 rounded-full text-xs text-gray-400 transition-colors cursor-default">
                        <Tag size={10} /> {tag.trim()}
                      </span>
                    )
                  ))}
                </div>
              </div>
            )}

          </div>
        ) : (
          // حالت خالی (وقتی هنوز مقاله‌ای انتخاب نشده)
          <div className="text-center opacity-30">
            <BookOpen size={64} strokeWidth={0.5} className="mx-auto mb-4"/>
            <p className="text-sm font-light tracking-widest">یک مقاله را برای مطالعه انتخاب کنید</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default ArticlesOverlay;
