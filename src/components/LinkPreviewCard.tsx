import React from 'react';
import { Globe, ExternalLink, ArrowRight, BookOpen } from 'lucide-react';
import { getDomain } from '../utils/webReader';

interface LinkPreviewCardProps {
  url: string;
  onVisitLink: (url: string) => void;
}

export const LinkPreviewCard: React.FC<LinkPreviewCardProps> = ({ url, onVisitLink }) => {
  const domain = getDomain(url);

  return (
    <div className="my-2.5 p-3 rounded-xl border border-white/10 bg-[#1a1a1d] hover:bg-[#202025] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-cyan-950/70 border border-cyan-500/30 flex items-center justify-center shrink-0">
          <Globe className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-200 truncate">
              {domain}
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
              ENLACE WEB
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400 truncate block mt-0.5">
            {url}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={() => onVisitLink(url)}
          className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm hover:shadow-cyan-500/20 cursor-pointer"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Visitar y Leer Enlace</span>
          <ArrowRight className="w-3 h-3" />
        </button>

        <a
          href={url.startsWith('http') ? url : `https://${url}`}
          target="_blank"
          rel="noreferrer"
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
          title="Abrir en pestaña externa"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};
