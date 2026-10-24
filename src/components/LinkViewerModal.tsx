import React from 'react';
import { WebLinkInfo } from '../utils/webReader';
import { Globe, ExternalLink, X, CheckCircle2, Code2, BookOpen } from 'lucide-react';

interface LinkViewerModalProps {
  linkInfo: WebLinkInfo | null;
  isOpen: boolean;
  onClose: () => void;
  onAskAboutLink?: (url: string) => void;
}

export const LinkViewerModal: React.FC<LinkViewerModalProps> = ({
  linkInfo,
  isOpen,
  onClose,
  onAskAboutLink,
}) => {
  if (!isOpen || !linkInfo) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-text">
      <div className="bg-[#18181b] border border-white/10 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#121214]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center shrink-0">
              <Globe className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm text-white truncate max-w-md">
                  {linkInfo.title}
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/80 shrink-0 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> {linkInfo.status} OK
                </span>
              </div>
              <p className="text-xs font-mono text-slate-400 truncate mt-0.5">
                {linkInfo.normalizedUrl}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm">
          {/* Metadata pill box */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-[#202024] p-3 rounded-xl border border-white/5">
              <span className="text-[11px] font-mono text-slate-400 block uppercase">Dominio</span>
              <span className="font-medium text-slate-200 text-xs">{linkInfo.domain}</span>
            </div>
            <div className="bg-[#202024] p-3 rounded-xl border border-white/5">
              <span className="text-[11px] font-mono text-slate-400 block uppercase">Protocolo &amp; Tipo</span>
              <span className="font-medium text-slate-200 text-xs">HTTPS / {linkInfo.contentType.split(';')[0]}</span>
            </div>
            <div className="bg-[#202024] p-3 rounded-xl border border-white/5">
              <span className="text-[11px] font-mono text-slate-400 block uppercase">Leído por Goli</span>
              <span className="font-medium text-emerald-400 text-xs">{linkInfo.visitedAt}</span>
            </div>
          </div>

          {/* Extracted Headings */}
          {linkInfo.headings.length > 0 && (
            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-cyan-400" /> Secciones Principales
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {linkInfo.headings.map((h, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-md bg-[#27272a] text-slate-300 text-xs border border-white/5"
                  >
                    {h}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Description & Extracted Text */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
              Contenido &amp; Resumen Extraído
            </h4>
            <div className="bg-[#121214] p-4 rounded-xl border border-white/10 text-slate-300 whitespace-pre-wrap font-sans leading-relaxed text-xs sm:text-sm">
              {linkInfo.extractedContent}
            </div>
          </div>

          {/* Code Snippets found in page if any */}
          {linkInfo.codeSnippets.length > 0 && (
            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-purple-400" /> Fragmentos de Código en la Página
              </h4>
              {linkInfo.codeSnippets.map((snippet, idx) => (
                <pre
                  key={idx}
                  className="bg-[#0e0e11] p-3 rounded-xl border border-purple-900/40 font-mono text-xs text-purple-300 overflow-x-auto my-2"
                >
                  {snippet}
                </pre>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-white/10 flex items-center justify-between bg-[#121214] text-xs">
          <a
            href={linkInfo.normalizedUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 transition-colors font-mono"
          >
            Abrir URL original en navegador <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <div className="flex items-center gap-2">
            {onAskAboutLink && (
              <button
                onClick={() => {
                  onAskAboutLink(linkInfo.normalizedUrl);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold transition-colors cursor-pointer shadow-lg shadow-cyan-900/30"
              >
                Analizar este enlace en el Chat
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#27272a] hover:bg-[#323238] text-slate-200 transition-colors cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
