import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Globe } from 'lucide-react';

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200">
      <Globe className="w-4 h-4 text-slate-500 ml-1.5 hidden sm:inline" />
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
          language === 'en'
            ? 'bg-emerald-600 text-white shadow-sm'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLanguage('hi')}
        className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
          language === 'hi'
            ? 'bg-emerald-600 text-white shadow-sm font-["Noto_Sans_Devanagari"]'
            : 'text-slate-600 hover:text-slate-900 font-["Noto_Sans_Devanagari"]'
        }`}
      >
        हिन्दी
      </button>
      <button
        type="button"
        onClick={() => setLanguage('mr')}
        className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
          language === 'mr'
            ? 'bg-emerald-600 text-white shadow-sm font-["Noto_Sans_Devanagari"]'
            : 'text-slate-600 hover:text-slate-900 font-["Noto_Sans_Devanagari"]'
        }`}
      >
        मराठी
      </button>
    </div>
  );
}
