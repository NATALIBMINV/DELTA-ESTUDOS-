
import React from 'react';
import { LegalArticle } from '../types';

interface ArticleCardProps {
  article: LegalArticle;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
  const hasDoctrine = !!article.doctrine;
  const hasJuris = article.jurisprudence && article.jurisprudence.length > 0;
  const isEnriched = hasDoctrine || hasJuris;

  return (
    <div className={`triade-card bg-white rounded-3xl overflow-hidden border transition-all duration-300 print-shadow-none ${isEnriched ? 'border-slate-200 shadow-xl' : 'border-slate-100 shadow-sm opacity-90'}`}>
      {/* Header do Card */}
      <div className={`${isEnriched ? 'bg-slate-900' : 'bg-slate-500'} px-8 py-5 flex items-center justify-between print:bg-white print:border-b-2 print:border-slate-200`}>
        <div className="flex items-center space-x-3">
          <span className="text-2xl font-black text-white font-serif print:text-slate-900">{article.number}</span>
          {isEnriched ? (
            <span className="bg-blue-500/20 text-blue-300 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-tighter print:hidden">Enriquecido</span>
          ) : (
            <span className="bg-white/10 text-white/50 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-tighter print:hidden">Lei Pura</span>
          )}
        </div>
        <div className="flex space-x-2 no-print">
          <div className={`w-2 h-2 rounded-full ${isEnriched ? 'bg-amber-400' : 'bg-slate-400'}`}></div>
          <div className={`w-2 h-2 rounded-full ${hasDoctrine ? 'bg-blue-400' : 'bg-slate-400 opacity-20'}`}></div>
          <div className={`w-2 h-2 rounded-full ${hasJuris ? 'bg-emerald-400' : 'bg-slate-400 opacity-20'}`}></div>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* Pilar 1: Lei Seca */}
        <section className="relative">
          <header className="flex items-center space-x-2 mb-3">
            <div className="w-1 h-4 bg-slate-300 rounded-full"></div>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Pilar 01 • Texto Normativo</h4>
          </header>
          <div className="bg-slate-50 p-6 rounded-2xl border-2 border-slate-100 text-slate-800 italic text-sm leading-relaxed font-medium print:bg-white print:border-slate-200">
            {article.statuteText}
          </div>
        </section>

        {/* Pilar 2: Doutrina */}
        {hasDoctrine && (
          <section className="animate-fadeIn">
            <header className="flex items-center space-x-2 mb-3">
              <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
              <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Pilar 02 • Doutrina Criminal</h4>
            </header>
            <div className="bg-blue-50/40 p-6 rounded-2xl border border-blue-100 text-slate-700 text-sm leading-relaxed text-justify print:bg-white print:border-slate-200">
              <p className="first-letter:text-2xl first-letter:font-bold first-letter:mr-1 first-letter:text-blue-700">
                {article.doctrine}
              </p>
            </div>
          </section>
        )}

        {/* Pilar 3: Jurisprudência */}
        {hasJuris && (
          <section className="animate-fadeIn">
            <header className="flex items-center space-x-2 mb-3">
              <div className="w-1 h-4 bg-emerald-500 rounded-full"></div>
              <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">Pilar 03 • Jurisprudência Tribunais</h4>
            </header>
            <div className="grid grid-cols-1 gap-4">
              {article.jurisprudence?.map((j, idx) => (
                <div key={idx} className="bg-white border-2 border-emerald-50 p-6 rounded-2xl shadow-sm hover:border-emerald-200 transition-colors print:border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <span className="bg-emerald-600 text-white text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest">{j.court}</span>
                    <svg className="w-4 h-4 text-emerald-200" fill="currentColor" viewBox="0 0 20 20"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a2 2 0 012-2v10a2 2 0 01-2-2V7zM16 7a2 2 0 00-2-2v10a2 2 0 002-2V7z" /></svg>
                  </div>
                  <h5 className="text-base font-bold text-slate-900 mb-2 leading-tight">{j.centralThesis}</h5>
                  <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 italic print:bg-white">
                    "{j.objectiveSummary}"
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
