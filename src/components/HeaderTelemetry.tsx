import React from 'react';
import { TelemetryMetrics } from '../utils/telemetry';
import { ModelEffortLevel } from './ChatStream';

export type MainNavTab = 'chat' | 'visualizer' | 'compiler' | 'training';

interface HeaderTelemetryProps {
  metrics: TelemetryMetrics;
  status: 'READY' | 'INFERRING' | 'ABORTED';
  effortLevel: ModelEffortLevel;
  activeNavTab: MainNavTab;
  onSelectNavTab: (tab: MainNavTab) => void;
  onOpenSettings: () => void;
  onResetSession: () => void;
  hasHtmlCode: boolean;
}

export const HeaderTelemetry: React.FC<HeaderTelemetryProps> = ({
  metrics,
  status,
  effortLevel,
  activeNavTab,
  onSelectNavTab,
  onOpenSettings,
  onResetSession,
  hasHtmlCode,
}) => {
  return (
    <header className="bg-[#090d16] border-b border-slate-800 px-4 py-2.5 flex items-center justify-between gap-3 text-slate-100 select-none">
      {/* Brand Identity: Goli */}
      <div className="flex items-center gap-3">
        <div className="bg-[#052e3b] text-cyan-400 border border-cyan-500 font-mono text-xs font-bold px-2.5 py-1 rounded shadow-[0_0_12px_rgba(6,182,212,0.3)] tracking-wider">
          GOLI
        </div>
        <div>
          <h1 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
            Goli AI
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-700">
              v2.0-MINIMAL
            </span>
          </h1>
        </div>
      </div>

      {/* Minimalist Navigation Tabs */}
      <nav className="flex items-center gap-1 bg-[#050811] p-1 rounded border border-slate-800 text-xs font-mono">
        <button
          type="button"
          onClick={() => onSelectNavTab('chat')}
          className={`px-3 py-1 rounded cursor-pointer transition-all ${
            activeNavTab === 'chat'
              ? 'bg-[#0f2847] text-cyan-300 border border-cyan-500 font-bold shadow-[0_0_8px_rgba(6,182,212,0.3)]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          [CHAT]
        </button>
        <button
          type="button"
          onClick={() => onSelectNavTab('visualizer')}
          className={`px-3 py-1 rounded cursor-pointer transition-all relative ${
            activeNavTab === 'visualizer'
              ? 'bg-[#0f2847] text-cyan-300 border border-cyan-500 font-bold shadow-[0_0_8px_rgba(6,182,212,0.3)]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          [VISUALIZADOR HTML]
          {hasHtmlCode && (
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
          )}
        </button>
        <button
          type="button"
          onClick={() => onSelectNavTab('compiler')}
          className={`px-3 py-1 rounded cursor-pointer transition-all ${
            activeNavTab === 'compiler'
              ? 'bg-[#0f2847] text-cyan-300 border border-cyan-500 font-bold shadow-[0_0_8px_rgba(6,182,212,0.3)]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          [COMPILADOR]
        </button>
        <button
          type="button"
          onClick={() => onSelectNavTab('training')}
          className={`px-3 py-1 rounded cursor-pointer transition-all ${
            activeNavTab === 'training'
              ? 'bg-[#0f2847] text-cyan-300 border border-cyan-500 font-bold shadow-[0_0_8px_rgba(6,182,212,0.3)]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          [ENTRENAMIENTO]
        </button>
      </nav>

      {/* Right Actions: Settings & New Chat */}
      <div className="flex items-center gap-2">
        <button
          onClick={onResetSession}
          type="button"
          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded text-xs font-mono font-semibold transition-all cursor-pointer"
        >
          [NUEVO CHAT]
        </button>

        <button
          onClick={onOpenSettings}
          type="button"
          className="px-3 py-1.5 bg-[#082f49] hover:bg-cyan-900 text-cyan-300 hover:text-white border border-cyan-400 rounded text-xs font-mono font-bold tracking-wide transition-all shadow-[0_0_12px_rgba(6,182,212,0.25)] cursor-pointer"
        >
          [AJUSTES]
        </button>
      </div>
    </header>
  );
};
