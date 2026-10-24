import React, { useState } from 'react';
import { AgenticStep } from '../utils/agenticEngine';
import {
  Compass,
  Globe,
  Layers,
  Code2,
  Shield,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Loader2,
  ExternalLink,
} from 'lucide-react';

interface AgenticStepperProps {
  steps: AgenticStep[];
  isGenerating?: boolean;
  onOpenLinkModal?: (url: string) => void;
}

export const AgenticStepper: React.FC<AgenticStepperProps> = ({
  steps,
  isGenerating,
  onOpenLinkModal,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!steps || steps.length === 0) return null;

  const getStepIcon = (iconName: string, status: string) => {
    if (status === 'running') {
      return <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />;
    }
    if (status === 'completed') {
      return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
    }

    switch (iconName) {
      case 'Compass':
        return <Compass className="w-3.5 h-3.5 text-slate-400" />;
      case 'Globe':
        return <Globe className="w-3.5 h-3.5 text-cyan-400" />;
      case 'Layers':
        return <Layers className="w-3.5 h-3.5 text-purple-400" />;
      case 'Code2':
        return <Code2 className="w-3.5 h-3.5 text-amber-400" />;
      case 'Shield':
        return <Shield className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <Compass className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const completedCount = steps.filter((s) => s.status === 'completed').length;
  const currentRunning = steps.find((s) => s.status === 'running');

  return (
    <div className="my-3 rounded-xl border border-white/10 bg-[#141416] overflow-hidden text-xs font-sans">
      {/* Summary Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-2.5 bg-[#18181b] hover:bg-[#202024] flex items-center justify-between text-slate-200 transition-colors cursor-pointer select-none"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-700/50 text-cyan-300 font-mono text-[11px] font-semibold">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            ETAPA AGÉNTICA GOLI
          </div>

          <span className="text-slate-300 font-medium truncate">
            {isGenerating && currentRunning
              ? currentRunning.name
              : `${completedCount} de ${steps.length} etapas agénticas completadas`}
          </span>
        </div>

        <div className="flex items-center gap-2 text-slate-400">
          <span className="text-[11px] font-mono hidden sm:inline">
            {isExpanded ? 'Ocultar detalles' : 'Ver traza de razonamiento'}
          </span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Expanded Step Detail List */}
      {isExpanded && (
        <div className="p-4 space-y-3 bg-[#111113] border-t border-white/5 divide-y divide-white/5">
          {steps.map((step, idx) => (
            <div key={step.id} className="pt-2.5 first:pt-0">
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5">{getStepIcon(step.iconName, step.status)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`font-medium ${
                        step.status === 'completed'
                          ? 'text-slate-200'
                          : step.status === 'running'
                          ? 'text-cyan-300 font-semibold'
                          : 'text-slate-500'
                      }`}
                    >
                      Paso {idx + 1}: {step.name}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 uppercase">
                      {step.status === 'completed'
                        ? 'Completado'
                        : step.status === 'running'
                        ? 'Ejecutando...'
                        : 'Pendiente'}
                    </span>
                  </div>

                  <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                    {step.summary}
                  </p>

                  {/* Bullet points */}
                  <ul className="mt-1.5 space-y-1 text-[11px] text-slate-300 pl-2">
                    {step.details.map((detail, dIdx) => (
                      <li key={dIdx} className="flex items-start gap-1.5">
                        <span className="text-cyan-500/80 font-mono">&bull;</span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Tool calls (such as web link visits) */}
                  {step.toolCalls && step.toolCalls.length > 0 && (
                    <div className="mt-2 space-y-1.5">
                      {step.toolCalls.map((tc, tcIdx) => (
                        <div
                          key={tcIdx}
                          className="p-2 rounded-lg bg-[#1a1a1e] border border-white/5 flex flex-wrap items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-1.5 font-mono text-[11px] text-cyan-400">
                            <Globe className="w-3 h-3 text-cyan-400" />
                            <span className="truncate max-w-xs">{tc.input}</span>
                          </div>
                          {onOpenLinkModal && (
                            <button
                              type="button"
                              onClick={() => onOpenLinkModal(tc.input)}
                              className="px-2 py-0.5 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 text-[10px] font-mono flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              Leer Contenido <ExternalLink className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
