import React, { useState, useRef, useEffect } from 'react';

interface HtmlVisualizerProps {
  htmlCode: string;
  onUpdateCode?: (newCode: string) => void;
  title?: string;
}

type ViewportMode = 'desktop' | 'tablet' | 'mobile';

export const HtmlVisualizer: React.FC<HtmlVisualizerProps> = ({
  htmlCode,
  onUpdateCode,
  title = 'Visualizador de Aplicaciones HTML - Goli',
}) => {
  const [viewport, setViewport] = useState<ViewportMode>('desktop');
  const [refreshKey, setRefreshKey] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showConsole, setShowConsole] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Inject console interceptor into HTML
  const getAugmentedHtml = () => {
    const interceptor = `
      <script>
        (function() {
          const originalLog = console.log;
          const originalError = console.error;
          const originalWarn = console.warn;
          function send(type, args) {
            window.parent.postMessage({
              type: 'GOLI_CONSOLE_LOG',
              level: type,
              message: Array.from(args).map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')
            }, '*');
          }
          console.log = function() { send('info', arguments); originalLog.apply(console, arguments); };
          console.error = function() { send('error', arguments); originalError.apply(console, arguments); };
          console.warn = function() { send('warn', arguments); originalWarn.apply(console, arguments); };
        })();
      </script>
    `;

    if (htmlCode.includes('<head>')) {
      return htmlCode.replace('<head>', `<head>${interceptor}`);
    }
    return `${interceptor}${htmlCode}`;
  };

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (iframeRef.current && e.source !== iframeRef.current.contentWindow) {
        return;
      }
      if (e.data?.type === 'GOLI_CONSOLE_LOG') {
        const level = typeof e.data.level === 'string' ? e.data.level.toUpperCase() : 'INFO';
        const message = typeof e.data.message === 'string' ? e.data.message : String(e.data.message ?? '');
        const line = `[${level}] ${message}`;
        setConsoleLogs((prev) => [...prev.slice(-30), line]);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
    setConsoleLogs([]);
  };

  const handleOpenExternal = () => {
    const blob = new Blob([htmlCode], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const getViewportWidth = () => {
    switch (viewport) {
      case 'desktop': return 'w-full';
      case 'tablet': return 'w-[768px]';
      case 'mobile': return 'w-[375px]';
    }
  };

  return (
    <div className={`flex flex-col bg-[#070b14] border border-slate-800 rounded-lg overflow-hidden ${isFullscreen ? 'fixed inset-4 z-50 shadow-2xl' : 'h-full w-full'}`}>
      {/* Visualizer Top Bar */}
      <div className="bg-[#0b1222] border-b border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between gap-2 select-none text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]"></span>
          <span className="font-bold text-white tracking-wider">[HTML ENGINE RUNTIME]</span>
          <span className="text-slate-400 text-[11px] hidden sm:inline">&mdash; {title}</span>
        </div>

        {/* Viewport switchers */}
        <div className="flex items-center gap-1 bg-[#050811] p-1 rounded border border-slate-800">
          <button
            type="button"
            onClick={() => setViewport('desktop')}
            className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-all ${
              viewport === 'desktop' ? 'bg-[#0f2847] text-cyan-300 border border-cyan-500' : 'text-slate-400 hover:text-white'
            }`}
          >
            [100% PC]
          </button>
          <button
            type="button"
            onClick={() => setViewport('tablet')}
            className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-all ${
              viewport === 'tablet' ? 'bg-[#0f2847] text-cyan-300 border border-cyan-500' : 'text-slate-400 hover:text-white'
            }`}
          >
            [768px TAB]
          </button>
          <button
            type="button"
            onClick={() => setViewport('mobile')}
            className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-all ${
              viewport === 'mobile' ? 'bg-[#0f2847] text-cyan-300 border border-cyan-500' : 'text-slate-400 hover:text-white'
            }`}
          >
            [375px MOV]
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowConsole(!showConsole)}
            className={`px-2.5 py-1 rounded border text-xs cursor-pointer transition-all ${
              showConsole ? 'bg-purple-950 text-purple-300 border-purple-500' : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
            }`}
          >
            [CONSOLA ({consoleLogs.length})]
          </button>
          <button
            type="button"
            onClick={handleRefresh}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded text-xs cursor-pointer transition-all"
          >
            [RECARGAR]
          </button>
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded text-xs cursor-pointer transition-all"
          >
            {isFullscreen ? '[RESTAURAR]' : '[FULLSCREEN]'}
          </button>
          <button
            type="button"
            onClick={handleOpenExternal}
            className="px-2.5 py-1 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-600 rounded text-xs font-bold cursor-pointer transition-all"
          >
            [ABRIR EN VENTANA]
          </button>
        </div>
      </div>

      {/* Main Preview Container */}
      <div className="flex-1 bg-[#020409] flex flex-col items-center justify-center p-2 overflow-auto relative">
        <div className={`${getViewportWidth()} h-full transition-all duration-200 bg-white rounded shadow-2xl overflow-hidden flex flex-col`}>
          <iframe
            key={refreshKey}
            ref={iframeRef}
            title="Goli HTML Visualizer Sandbox"
            srcDoc={getAugmentedHtml()}
            sandbox="allow-scripts allow-modals allow-same-origin allow-forms"
            className="w-full h-full border-0 bg-white"
          />
        </div>

        {/* Console Overlay Drawer */}
        {showConsole && (
          <div className="absolute bottom-2 left-4 right-4 max-h-44 bg-[#0a0f1d] border border-purple-900/80 rounded-lg p-3 font-mono text-xs overflow-y-auto shadow-2xl flex flex-col gap-1 select-text">
            <div className="flex justify-between items-center text-purple-400 border-b border-slate-800 pb-1 mb-1 font-bold">
              <span>[CONSOLA DE LA APLICACIÓN HTML]</span>
              <button
                type="button"
                onClick={() => setConsoleLogs([])}
                className="text-[10px] text-slate-400 hover:text-white cursor-pointer"
              >
                [LIMPIAR LOGS]
              </button>
            </div>
            {consoleLogs.length === 0 ? (
              <span className="text-slate-500 italic">No hay logs registrados en la consola.</span>
            ) : (
              consoleLogs.map((log, idx) => (
                <div
                  key={idx}
                  className={`leading-relaxed ${
                    log.includes('[ERROR]') ? 'text-rose-400' : log.includes('[WARN]') ? 'text-amber-400' : 'text-slate-300'
                  }`}
                >
                  {log}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
