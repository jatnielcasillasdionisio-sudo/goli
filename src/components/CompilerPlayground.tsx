import React, { useState, useEffect } from 'react';
import { compileAndRunCode, CompilationResult } from '../utils/codeCompiler';
import { SUPPORTED_LANGUAGES } from '../utils/languageDetector';

interface CompilerPlaygroundProps {
  onOpenInHtmlVisualizer: (htmlCode: string) => void;
  initialCode?: string;
  initialLang?: string;
}

export const CompilerPlayground: React.FC<CompilerPlaygroundProps> = ({
  onOpenInHtmlVisualizer,
  initialCode,
  initialLang,
}) => {
  const [selectedLangKey, setSelectedLangKey] = useState(initialLang ? initialLang.toLowerCase() : 'html');
  const [code, setCode] = useState(
    initialCode || SUPPORTED_LANGUAGES[selectedLangKey]?.defaultTemplate || SUPPORTED_LANGUAGES.html.defaultTemplate
  );
  const [isCompiling, setIsCompiling] = useState(false);
  const [result, setResult] = useState<CompilationResult | null>(null);

  // Sync incoming code and language from chat
  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
    }
    if (initialLang && SUPPORTED_LANGUAGES[initialLang.toLowerCase()]) {
      setSelectedLangKey(initialLang.toLowerCase());
    }
  }, [initialCode, initialLang]);

  const handleSelectLang = (key: string) => {
    setSelectedLangKey(key);
    const langMeta = SUPPORTED_LANGUAGES[key];
    if (langMeta) {
      setCode(langMeta.defaultTemplate);
    }
    setResult(null);
  };

  const handleCompile = async () => {
    setIsCompiling(true);
    try {
      const res = await compileAndRunCode(code, selectedLangKey);
      setResult(res);
    } finally {
      setIsCompiling(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#070b14] overflow-hidden p-4 select-text">
      {/* Top Language Bar */}
      <div className="bg-[#0b1222] border border-slate-800 rounded-t-lg p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-cyan-400 font-mono font-bold text-xs bg-[#052e3b] px-2.5 py-1 rounded border border-cyan-700">
            [COMPILADOR GOLI MULTI-LENGUAJE]
          </span>
          <span className="text-xs font-mono text-slate-300">
            16+ Lenguajes Nativos Soportados
          </span>
        </div>

        {/* Language Tabs / Selector */}
        <div className="flex items-center gap-1 overflow-x-auto max-w-xl py-1">
          {Object.entries(SUPPORTED_LANGUAGES).map(([key, meta]) => (
            <button
              key={key}
              type="button"
              onClick={() => handleSelectLang(key)}
              className={`px-2 py-0.5 text-[11px] font-mono rounded cursor-pointer transition-all border whitespace-nowrap ${
                selectedLangKey === key
                  ? 'bg-[#0f2847] text-cyan-300 border-cyan-500 font-bold shadow-[0_0_8px_rgba(6,182,212,0.3)]'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {meta.name}
            </button>
          ))}
        </div>

        {/* Execution Actions */}
        <div className="flex items-center gap-2">
          {result?.htmlPreviewBundle && (
            <button
              type="button"
              onClick={() => onOpenInHtmlVisualizer(result.htmlPreviewBundle!)}
              className="px-3 py-1.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-600 rounded text-xs font-mono font-bold tracking-wider cursor-pointer shadow-[0_0_10px_rgba(16,185,129,0.2)]"
            >
              [VER EN VISUALIZADOR]
            </button>
          )}

          <button
            type="button"
            onClick={handleCompile}
            disabled={isCompiling}
            className="px-5 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 border border-cyan-400 rounded text-xs font-mono font-bold tracking-wider cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.4)] transition-all"
          >
            {isCompiling ? '[COMPILANDO...]' : '[COMPILAR Y EJECUTAR]'}
          </button>
        </div>
      </div>

      {/* Code Editor & Output Console */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-3 mt-1 overflow-hidden">
        {/* Editor */}
        <div className="flex flex-col bg-[#050811] border border-slate-800 rounded-b-lg overflow-hidden">
          <div className="bg-[#0c1220] px-3 py-1.5 border-b border-slate-800 text-xs font-mono flex justify-between items-center text-slate-400">
            <span>
              Archivo: main.{SUPPORTED_LANGUAGES[selectedLangKey]?.extension || 'txt'} ({SUPPORTED_LANGUAGES[selectedLangKey]?.category})
            </span>
            <span>{code.split('\n').length} líneas</span>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            className="flex-1 p-3 bg-transparent text-slate-200 font-mono text-xs sm:text-sm focus:outline-none resize-none leading-relaxed"
          />
        </div>

        {/* Terminal Console Output */}
        <div className="flex flex-col bg-[#050811] border border-slate-800 rounded-b-lg overflow-hidden">
          <div className="bg-[#0c1220] px-3 py-1.5 border-b border-slate-800 text-xs font-mono flex justify-between items-center">
            <span className="text-slate-400">[TERMINAL / STDOUT]</span>
            {result && (
              <div className="flex items-center gap-3 text-[11px]">
                <span className={result.exitCode === 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  Exit Code: {result.exitCode}
                </span>
                <span className="text-cyan-400">{result.durationMs} ms</span>
                <span className="text-purple-400">{result.memoryAllocatedKB} KB</span>
              </div>
            )}
          </div>

          <div className="flex-1 p-3 font-mono text-xs overflow-y-auto space-y-2 select-text">
            {!result ? (
              <div className="text-slate-600 italic">
                Selecciona cualquier lenguaje de programación y pulsa [COMPILAR Y EJECUTAR] para ver el resultado en la consola.
              </div>
            ) : (
              <>
                {result.stdout && (
                  <pre className="text-emerald-400 whitespace-pre-wrap leading-relaxed">
                    {result.stdout}
                  </pre>
                )}
                {result.stderr && (
                  <pre className="text-rose-400 whitespace-pre-wrap leading-relaxed mt-2 p-2 bg-rose-950/30 rounded border border-rose-900">
                    {result.stderr}
                  </pre>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
