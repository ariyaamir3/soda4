import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArticleItem } from '../types';
import { X, ChevronLeft, Calendar, User, BookOpen } from 'lucide-react';

interface Props {
  articles: ArticleItem[];
  onClose: () => void;
}

// تابع کمکی برای گرفتن متن از فیلد (چه string باشه چه آبجکت دو زبانه)
const getText = (field: string | { fa: string; en: string } | undefined): string => {
  if (!field) return '';
  if (typeof field === 'string') return field;
  return field.fa || field.en || '';
};

const ArticlesOverlay: React.FC<Props> = ({ articles, onClose }) => {
  const [selectedArticle, setSelectedArticle] = useState<ArticleItem | null>(null);

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0a] text-white flex font-vazir" dir="rtl">

      {/* Sidebar / List (Desktop) or Full (Mobile) */}
      <div className={`w-full md:w-1/3 border-l border-white/10 flex flex-col h-full ${selectedArticle ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#050505]">
          <div>
            <h2 className="text-xl font-bold">مقالات و یادداشت‌ها</h2>
            <p className="text-xs text-white/40">اندیشه‌های سینمایی</p>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white transition"><X size={24} /></button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {articles.length === 0 ? (
            <div className="text-center py-20 text-white/20">
              <BookOpen size={40} className="mx-auto mb-4" />
              <p>هنوز مقاله‌ای منتشر نشده است.</p>
            </div>
          ) : (
            articles.map((article) => (
              <div 
                key={article.id} 
                onClick={() => setSelectedArticle(article)}
                className={`p-6 border-b border-white/5 cursor-pointer hover:bg-white/5 transition group ${selectedArticle?.id === article.id ? 'bg-white/5 border-r-4 border-yellow-500' : ''}`}
              >
                <span className="text-[10px] text-yellow-500/70 font-mono mb-1 block">{article.date}</span>
                <h3 className="font-bold text-lg mb-2 group-hover:text-yellow-500 transition">{getText(article.title as any)}</h3>
                <p className="text-xs text-white/50 line-clamp-2 leading-relaxed">{getText(article.summary as any)}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Content Area (Reader) */}
      <div className={`flex-1 bg-[#050505] h-full overflow-y-auto relative ${!selectedArticle ? 'hidden md:flex items-center justify-center' : 'block'}`}>
        {selectedArticle ? (
          <div className="max-w-3xl mx-auto p-6 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button 
              onClick={() => setSelectedArticle(null)} 
              className="md:hidden flex items-center gap-1 text-white/50 mb-6 text-sm"
            >
              <ChevronLeft size={16} /> بازگشت به لیست
            </button>

            {selectedArticle.coverUrl && (
              <img src={selectedArticle.coverUrl} className="w-full h-64 md:h-96 object-cover rounded-sm mb-8 shadow-2xl grayscale hover:grayscale-0 transition duration-700" />
            )}

            <h1 className="text-2xl md:text-4xl font-bold leading-tight mb-6 text-white">{getText(selectedArticle.title as any)}</h1>

            <div className="flex items-center gap-4 text-xs text-white/40 mb-8 border-b border-white/10 pb-4 font-mono">
              <span className="flex items-center gap-1"><User size={12} /> {getText(selectedArticle.author as any)}</span>
              <span className="flex items-center gap-1"><Calendar size={12} /> {selectedArticle.date}</span>
            </div>

            <div className="prose prose-invert prose-lg max-w-none text-gray-300 font-light leading-9 whitespace-pre-wrap">
              {getText(selectedArticle.content as any)}
            </div>
          </div>
        ) : (
          <div className="text-center text-white/20">
            <p>لطفاً یک مقاله را برای مطالعه انتخاب کنید.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticlesOverlay;