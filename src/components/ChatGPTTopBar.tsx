import React from 'react';
import {
  ChevronDown,
  Globe,
  Settings,
  Sparkles,
  Zap,
  Code2,
  Cpu,
  Layers,
} from 'lucide-react';

import { ModelEffortLevel } from './ChatStream';

export type GoliModelChoice = 'agentic-4.5' | 'deepreason-o3' | 'polyglot-code' | 'goli-worki';

interface ChatGPTTopBarProps {
  currentModel: GoliModelChoice;
  onChangeModel: (model: GoliModelChoice) => void;
  effortLevel: ModelEffortLevel;
  onOpenSettings: () => void;
  onOpenQuickLink: () => void;
  onOpenWorkiPlan?: () => void;
  hasWorkiPlan?: boolean;
  status: 'READY' | 'INFERRING' | 'ABORTED';
}

export const ChatGPTTopBar: React.FC<ChatGPTTopBarProps> = ({
  currentModel,
  onChangeModel,
  effortLevel,
  onOpenSettings,
  onOpenQuickLink,
  onOpenWorkiPlan,
  hasWorkiPlan,
  status,
}) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const getModelLabel = () => {
    switch (currentModel) {
      case 'goli-worki':
        return { name: 'Goli Worki', badge: 'Planes & 1B LOC', icon: Layers };
      case 'agentic-4.5':
        return { name: 'Goli 4.5 Agentic', badge: 'Recomendado', icon: Sparkles };
      case 'deepreason-o3':
        return { name: 'Goli DeepReason o3', badge: 'Razonamiento', icon: Cpu };
      case 'polyglot-code':
        return { name: 'Goli Code Polyglot', badge: '50+ Lenguajes', icon: Code2 };
    }
  };

  const current = getModelLabel();
  const IconComp = current.icon;

  return (
    <header className="h-14 border-b border-white/5 bg-[#171717] px-4 flex items-center justify-between text-neutral-200 select-none z-20 shrink-0">
      {/* Model Selector Dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-neutral-800/80 transition-colors cursor-pointer group"
        >
          <IconComp className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-sm text-white">{current.name}</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-800 text-cyan-300 border border-neutral-700 hidden sm:inline">
            {current.badge}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-neutral-400 group-hover:text-white transition-transform" />
        </button>

        {dropdownOpen && (
          <div className="absolute top-full left-0 mt-1 w-72 bg-[#212124] border border-white/10 rounded-xl shadow-2xl p-1.5 z-50 text-xs font-sans">
            <button
              onClick={() => {
                onChangeModel('goli-worki');
                setDropdownOpen(false);
              }}
              className="w-full text-left p-2.5 rounded-lg hover:bg-neutral-850 flex items-start gap-2.5 transition-colors border border-cyan-500/20 bg-cyan-950/20 mb-1"
            >
              <Layers className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <span>Goli Worki</span>
                  <span className="text-[9px] font-mono px-1 rounded bg-cyan-900 text-cyan-300">MASTER AGENT</span>
                </div>
                <div className="text-[11px] text-neutral-300">
                  Agente autónomo de planes de arquitectura, 1B de líneas sin duplicados.
                </div>
              </div>
            </button>

            <button
              onClick={() => {
                onChangeModel('agentic-4.5');
                setDropdownOpen(false);
              }}
              className="w-full text-left p-2.5 rounded-lg hover:bg-neutral-850 flex items-start gap-2.5 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-white">Goli 4.5 Agentic</div>
                <div className="text-[11px] text-neutral-400">
                  Agente autónomo, lectura web y síntesis de código.
                </div>
              </div>
            </button>

            <button
              onClick={() => {
                onChangeModel('deepreason-o3');
                setDropdownOpen(false);
              }}
              className="w-full text-left p-2.5 rounded-lg hover:bg-neutral-850 flex items-start gap-2.5 transition-colors"
            >
              <Cpu className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-white">Goli DeepReason o3</div>
                <div className="text-[11px] text-neutral-400">
                  Pensamiento formal profundo y verificación estricta.
                </div>
              </div>
            </button>

            <button
              onClick={() => {
                onChangeModel('polyglot-code');
                setDropdownOpen(false);
              }}
              className="w-full text-left p-2.5 rounded-lg hover:bg-neutral-850 flex items-start gap-2.5 transition-colors"
            >
              <Code2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-white">Goli Code Polyglot</div>
                <div className="text-[11px] text-neutral-400">
                  Experto en cualquier lenguaje solo con nombrarlo.
                </div>
              </div>
            </button>
          </div>
        )}
      </div>


      {/* Right Controls: Web Link Tool & Settings */}
      <div className="flex items-center gap-2">
        {/* Status Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-800/80 border border-white/5 text-[11px] font-mono">
          <span
            className={`w-2 h-2 rounded-full ${
              status === 'INFERRING'
                ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)] animate-pulse'
                : 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
            }`}
          ></span>
          <span className="text-neutral-400">ESTADO:</span>
          <span className="text-white font-bold">{status}</span>
        </div>

        {/* Goli Worki Plan button */}
        {hasWorkiPlan && onOpenWorkiPlan && (
          <button
            type="button"
            onClick={onOpenWorkiPlan}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-xs font-semibold transition-all cursor-pointer shadow-sm shadow-cyan-950"
            title="Ver Plan Maestro de Goli Worki"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Plan Maestro</span>
          </button>
        )}

        {/* Web Link Reader quick button */}
        <button
          type="button"
          onClick={onOpenQuickLink}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium transition-colors cursor-pointer border border-white/5"
          title="Visitar o leer un enlace web"
        >

          <Globe className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden md:inline">Leer Enlace Web</span>
        </button>

        {/* Settings modal trigger */}
        <button
          type="button"
          onClick={onOpenSettings}
          className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white transition-colors cursor-pointer border border-white/5"
          title="Ajustes de motor y telemetría"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
