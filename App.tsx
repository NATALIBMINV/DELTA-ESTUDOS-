
import React, { useState, useEffect } from 'react';
import { FileData, ProcessingResult } from './types';
import { processLegalDocuments } from './services/geminiService';
import { ArticleCard } from './components/ArticleCard';
import { FileUpload } from './components/FileUpload';

const App: React.FC = () => {
  const [lawName, setLawName] = useState('');
  const [lawFiles, setLawFiles] = useState<FileData[]>([]);
  const [doctrineFiles, setDoctrineFiles] = useState<FileData[]>([]);
  const [jurisprudenceFiles, setJurisprudenceFiles] = useState<FileData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const steps = [
    "Carregando bases...",
    "Mapeando Lei Seca...",
    "Filtrando Doutrina Temática...",
    "Sincronizando Jurisprudência...",
    "Consolidando Material Delta..."
  ];

  useEffect(() => {
    let interval: any;
    if (isProcessing) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) return prev; // Para em 95% até a resposta chegar
          const increment = prev < 50 ? 2 : prev < 80 ? 0.8 : 0.3;
          return prev + increment;
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isProcessing]);

  const handleProcess = async () => {
    if (!lawName) {
      setError('Informe o TEMA para filtragem da Jurisprudência.');
      return;
    }
    if (lawFiles.length === 0) {
      setError('O PDF da Lei Seca é obrigatório.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResult(null);
    
    try {
      const data = await processLegalDocuments(lawName, lawFiles, doctrineFiles, jurisprudenceFiles);
      setResult(data);
      setProgress(100);
      setTimeout(() => setIsProcessing(false), 500);
    } catch (err: any) {
      setError(err.message || 'Erro inesperado.');
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setResult(null);
    setIsProcessing(false);
    setLawFiles([]);
    setDoctrineFiles([]);
    setJurisprudenceFiles([]);
    setLawName('');
    setError(null);
  };

  const currentStep = Math.min(Math.floor((progress / 100) * steps.length), steps.length - 1);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <header className="gradient-delta text-white py-6 shadow-2xl sticky top-0 z-50 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-amber-500 p-2 rounded-lg shadow-inner">
              <svg className="w-6 h-6 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-black font-serif tracking-tight uppercase">Planejador Delta</h1>
              <p className="text-[9px] text-amber-400 uppercase tracking-widest font-bold">Mapeamento Tríade • Nível Superior</p>
            </div>
          </div>
          <button onClick={reset} className="text-[10px] bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded border border-white/10 font-bold uppercase transition-all">Novo Estudo</button>
        </div>
      </header>

      <main className="flex-grow max-w-6xl mx-auto px-4 py-12 w-full">
        {!result && !isProcessing ? (
          <div className="animate-fadeIn space-y-10">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-black text-slate-900 font-serif uppercase tracking-tight">Consolidação Tríade</h2>
              <p className="text-slate-500 font-medium max-w-2xl mx-auto">Mapeamento exaustivo integrando <span className="text-blue-600 font-bold">Lei, Doutrina e Jurisprudência</span> com filtro de pertinência temática.</p>
            </div>

            <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Tema Específico (Essencial para filtrar Jurisprudência)</label>
                  <input 
                    type="text" 
                    value={lawName}
                    onChange={(e) => setLawName(e.target.value)}
                    placeholder="Ex: Lei de Drogas (11.343) ou Crimes Hediondos"
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 transition-all outline-none font-bold text-slate-800 shadow-sm"
                  />
                </div>

                <div className="md:col-span-2">
                  <FileUpload id="law" label="1. Texto da Lei (Estrutura)" accept="application/pdf" files={lawFiles} onFilesChange={setLawFiles} />
                </div>
                <FileUpload id="doctrine" label="2. PDF de Doutrina" multiple accept="application/pdf" files={doctrineFiles} onFilesChange={setDoctrineFiles} />
                <FileUpload id="jurisprudence" label="3. PDF de Jurisprudência" multiple accept="application/pdf" files={jurisprudenceFiles} onFilesChange={setJurisprudenceFiles} />
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs font-bold rounded-r-lg">
                  {error}
                </div>
              )}

              <button
                onClick={handleProcess}
                className="w-full py-6 bg-slate-900 text-amber-400 rounded-3xl font-black text-xl uppercase tracking-[0.2em] hover:bg-slate-800 shadow-2xl transition-all active:scale-95 flex items-center justify-center space-x-4 border border-amber-400/20"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <span>Processar Mapeamento</span>
              </button>
            </div>
          </div>
        ) : isProcessing ? (
          <div className="max-w-2xl mx-auto py-24 text-center space-y-12 animate-fadeIn">
            <div className="space-y-6">
              <div className="flex justify-between items-end mb-2">
                <div className="text-left">
                  <h3 className="text-2xl font-black text-slate-800 font-serif">Analisando Tríade...</h3>
                  <p className="text-blue-600 font-bold uppercase tracking-widest text-xs">{steps[currentStep]}</p>
                </div>
                <span className="text-slate-400 font-black text-2xl font-serif">{Math.floor(progress)}%</span>
              </div>
              
              <div className="w-full bg-slate-200 h-4 rounded-full overflow-hidden border-2 border-white shadow-inner">
                <div 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full transition-all duration-300 ease-out" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>

              <div className="flex justify-between items-center px-2">
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Tempo médio: 45s - 60s</p>
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 text-left">
              <h4 className="text-blue-900 font-black text-[10px] uppercase tracking-widest mb-3">O que a IA está fazendo:</h4>
              <ul className="text-blue-800/70 text-xs font-medium space-y-2">
                <li className="flex items-center"><svg className="w-3 h-3 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg> Filtrando jurisprudência irrelevante (limpando o material)</li>
                <li className="flex items-center"><svg className="w-3 h-3 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg> Cruzando cada artigo com a doutrina selecionada</li>
                <li className="flex items-center"><svg className="w-3 h-3 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg> Organizando o layout para facilitar a memorização</li>
              </ul>
            </div>
          </div>
        ) : result && (
          <div className="animate-fadeIn space-y-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-2 border-slate-200 pb-10 gap-6">
              <div className="space-y-2">
                <span className="bg-slate-900 text-white text-[9px] font-black px-3 py-1 rounded uppercase tracking-[0.2em]">Mapeamento Tríade Finalizado</span>
                <h2 className="text-5xl font-black text-slate-900 font-serif leading-none">{result.lawName}</h2>
                <p className="text-slate-500 font-bold text-xs uppercase tracking-widest pt-4">{result.articles.length} Artigos Integrados com Sucesso</p>
              </div>
              <div className="flex space-x-4 no-print">
                <button onClick={() => window.print()} className="px-6 py-3 bg-white border-2 border-slate-200 rounded-2xl text-[10px] font-black hover:bg-slate-50 flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                  <span>Exportar PDF</span>
                </button>
                <button onClick={reset} className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black hover:bg-slate-800 transition-all flex items-center space-x-2 shadow-xl">
                  <span>Reiniciar Sistema</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-12">
              {result.articles.map((art, index) => (
                <ArticleCard key={index} article={art} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
