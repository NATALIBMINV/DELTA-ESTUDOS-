
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
    "Carregando fontes...",
    "Executando Filtro Temático...",
    "Mapeando Doutrina Pertinente...",
    "Sincronizando Teses STF/STJ...",
    "Finalizando Mapeamento Delta..."
  ];

  useEffect(() => {
    let interval: any;
    if (isProcessing) {
      setProgress(5);
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 98) return prev; 
          const increment = prev < 40 ? 1.5 : prev < 70 ? 0.5 : 0.1;
          return prev + increment;
        });
      }, 400);
    }
    return () => clearInterval(interval);
  }, [isProcessing]);

  const handleProcess = async () => {
    if (!lawName.trim()) {
      setError('Obrigatório informar o TEMA para que a IA possa realizar o filtro temático.');
      return;
    }
    if (lawFiles.length === 0) {
      setError('O PDF da Lei Seca é a base do mapeamento.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResult(null);
    setProgress(0);
    
    try {
      const data = await processLegalDocuments(lawName, lawFiles, doctrineFiles, jurisprudenceFiles);
      setResult(data);
      setProgress(100);
      setTimeout(() => setIsProcessing(false), 800);
    } catch (err: any) {
      console.error("Erro no App:", err);
      setError(err.message || 'Erro crítico na integração.');
      setIsProcessing(false);
      setProgress(0);
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
    setProgress(0);
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
              <p className="text-[9px] text-amber-400 uppercase tracking-widest font-bold">Mapeamento Tríade • Análise Temática</p>
            </div>
          </div>
          <button onClick={reset} className="text-[10px] bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded border border-white/10 font-bold uppercase transition-all">Novo Estudo</button>
        </div>
      </header>

      <main className="flex-grow max-w-6xl mx-auto px-4 py-12 w-full">
        {!result && !isProcessing ? (
          <div className="animate-fadeIn space-y-10">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-black text-slate-900 font-serif uppercase tracking-tight">Mapeamento Tríade</h2>
              <p className="text-slate-500 font-medium max-w-2xl mx-auto">Sincronização exaustiva de <span className="text-blue-600 font-bold">Lei, Doutrina e Jurisprudência</span> com foco em Carreiras Policiais.</p>
            </div>

            <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Tema Delimitado (Ex: Lei de Drogas, Crimes contra o Patrimônio)</label>
                  <input 
                    type="text" 
                    value={lawName}
                    onChange={(e) => setLawName(e.target.value)}
                    placeholder="Informe o tema para que a IA descarte conteúdos irrelevantes dos PDFs"
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 transition-all outline-none font-bold text-slate-800"
                  />
                </div>

                <div className="md:col-span-2">
                  <FileUpload id="law" label="1. PDF Lei Seca (Referencial de Artigos)" accept="application/pdf" files={lawFiles} onFilesChange={setLawFiles} />
                </div>
                <FileUpload id="doctrine" label="2. PDF Doutrina Delta" multiple accept="application/pdf" files={doctrineFiles} onFilesChange={setDoctrineFiles} />
                <FileUpload id="jurisprudence" label="3. PDF Jurisprudência Temática" multiple accept="application/pdf" files={jurisprudenceFiles} onFilesChange={setJurisprudenceFiles} />
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs font-bold rounded-r-lg">
                  ERRO: {error}
                </div>
              )}

              <button
                onClick={handleProcess}
                disabled={isProcessing}
                className={`w-full py-6 rounded-3xl font-black text-xl uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95 flex items-center justify-center space-x-4 border ${isProcessing ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-amber-400 hover:bg-slate-800 border-amber-400/20'}`}
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
                  <h3 className="text-2xl font-black text-slate-800 font-serif">Gerando Material Delta...</h3>
                  <p className="text-blue-600 font-bold uppercase tracking-widest text-xs h-4">{steps[currentStep]}</p>
                </div>
                <span className="text-slate-400 font-black text-2xl font-serif">{Math.floor(progress)}%</span>
              </div>
              
              <div className="w-full bg-slate-200 h-4 rounded-full overflow-hidden border-2 border-white shadow-inner">
                <div 
                  className="bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-900 h-full transition-all duration-300 ease-out" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>

              <div className="flex justify-between items-center px-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                <p>Processamento de IA (Tempo estimado: 60s)</p>
                <p>Filtrando apenas o conteúdo de "{lawName}"</p>
              </div>
            </div>

            <div className="bg-slate-900 p-8 rounded-[2rem] border border-slate-700 text-left shadow-2xl">
              <h4 className="text-amber-400 font-black text-[10px] uppercase tracking-widest mb-4">Status da Análise:</h4>
              <ul className="text-slate-300 text-xs font-medium space-y-3">
                <li className="flex items-center opacity-80"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-3"></div> Extraindo artigos da Lei Seca...</li>
                <li className={`flex items-center ${progress > 30 ? 'opacity-100' : 'opacity-40'}`}><div className={`w-1.5 h-1.5 ${progress > 30 ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'} rounded-full mr-3`}></div> Filtrando Doutrina específica para o tema...</li>
                <li className={`flex items-center ${progress > 60 ? 'opacity-100' : 'opacity-40'}`}><div className={`w-1.5 h-1.5 ${progress > 60 ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'} rounded-full mr-3`}></div> Cruzando teses do STF/STJ pertinentes...</li>
              </ul>
            </div>
          </div>
        ) : result && (
          <div className="animate-fadeIn space-y-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-2 border-slate-200 pb-10 gap-6">
              <div className="space-y-2">
                <span className="bg-slate-900 text-white text-[9px] font-black px-3 py-1 rounded uppercase tracking-[0.2em]">Material Sincronizado</span>
                <h2 className="text-5xl font-black text-slate-900 font-serif leading-none">{result.lawName}</h2>
                <p className="text-slate-500 font-bold text-xs uppercase tracking-widest pt-4">{result.articles.length} Artigos Analisados Tematicamente</p>
              </div>
              <div className="flex space-x-4 no-print">
                <button onClick={() => window.print()} className="px-6 py-3 bg-white border-2 border-slate-200 rounded-2xl text-[10px] font-black hover:bg-slate-50 flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                  <span>Exportar Material</span>
                </button>
                <button onClick={reset} className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black hover:bg-slate-800 transition-all flex items-center space-x-2 shadow-xl">
                  <span>Novo Filtro</span>
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
