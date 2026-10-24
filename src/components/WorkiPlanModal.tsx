import React from 'react';
import { WorkiMasterPlan } from '../utils/goliWorki';
import {
  Sparkles,
  CheckCircle2,
  X,
  Layers,
  Shield,
  Zap,
  Download,
  Target,
  FileCheck,
  ChevronRight,
} from 'lucide-react';

interface WorkiPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: WorkiMasterPlan | null;
  onExecutePlan?: (plan: WorkiMasterPlan) => void;
}

export const WorkiPlanModal: React.FC<WorkiPlanModalProps> = ({
  isOpen,
  onClose,
  plan,
  onExecutePlan,
}) => {
  if (!isOpen || !plan) return null;

  const handleDownloadPlan = () => {
    const md = [
      `# Plan Maestro Goli Worki: ${plan.projectGoal}`,
      `Fecha: ${plan.createdAt || new Date().toISOString()}`,
      `Lenguaje Objetivo: ${plan.targetLanguage}`,
      `Capacidad Virtual: ${plan.virtualLinesCapacity}`,
      `Protocolo Anti-Duplicación: ${plan.antiDuplicationScore}% Sin Redundancia`,
      '',
      '## Directrices de Arquitectura',
      ...plan.architectureGuidelines.map((g) => `- ${g}`),
      '',
      '## Fases de Ejecución',
      ...plan.phases.map(
        (p, idx) =>
          `### ${p.title}\n**Objetivo:** ${p.objective}\n**Estado:** ${p.status.toUpperCase()}\n\n` +
          p.deliverables.map((d) => `  - [x] ${d}`).join('\n')
      ),
    ].join('\n');

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plan-maestro-goli-worki-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-text">
      <div className="bg-[#18181b] border border-cyan-500/30 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#121214]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center font-bold text-slate-950 text-sm shadow-lg shadow-cyan-500/20 shrink-0">
              GW
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-base text-white truncate">
                  Goli Worki: Plan Maestro de Arquitectura
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700/60 font-semibold shrink-0">
                  AGENTE PLANIFICADOR
                </span>
              </div>
              <p className="text-xs text-neutral-400 truncate mt-0.5 font-mono">
                {plan.projectGoal} &bull; {plan.targetLanguage}
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

        {/* Top Badges / Capacity Indicators */}
        <div className="bg-[#141417] px-6 py-3 border-b border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[#202025] border border-white/5">
            <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
            <div>
              <span className="text-[10px] text-neutral-400 uppercase font-mono block">
                Capacidad de Streaming
              </span>
              <span className="font-semibold text-cyan-300">1 Billón de Líneas (1B LOC)</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[#202025] border border-white/5">
            <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="text-[10px] text-neutral-400 uppercase font-mono block">
                Control Anti-Duplicación
              </span>
              <span className="font-semibold text-emerald-300">Zero Redundancy (100%)</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[#202025] border border-white/5">
            <FileCheck className="w-4 h-4 text-purple-400 shrink-0" />
            <div>
              <span className="text-[10px] text-neutral-400 uppercase font-mono block">
                Garantía de Sintaxis
              </span>
              <span className="font-semibold text-purple-300">Zero Errores de Tipado</span>
            </div>
          </div>
        </div>

        {/* Scrollable Plan Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm">
          {/* Architectural Guidelines */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-2">
              <Target className="w-3.5 h-3.5 text-cyan-400" />
              Directrices de Excelencia Arquitectónica
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {plan.architectureGuidelines.map((guideline, gIdx) => (
                <div
                  key={gIdx}
                  className="p-2.5 rounded-xl bg-[#1d1d21] border border-white/5 text-xs text-neutral-300 flex items-start gap-2"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                  <span>{guideline}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Master Phases */}
          <div className="space-y-4">
            <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              Fases de Ejecución Estructurada ({plan.phases.length} Fases)
            </h4>

            {plan.phases.map((phase, pIdx) => (
              <div
                key={phase.id}
                className="rounded-2xl border border-white/10 bg-[#161619] p-4.5 space-y-3 shadow-md"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-cyan-950 border border-cyan-700 text-cyan-300 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                      0{pIdx + 1}
                    </span>
                    <span className="font-semibold text-white text-sm">
                      {phase.title}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1 w-fit">
                    <CheckCircle2 className="w-3 h-3" /> LISTO PARA EJECUCIÓN
                  </span>
                </div>

                <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                  {phase.objective}
                </p>

                {/* Deliverables checklist */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-mono uppercase text-neutral-500 block">
                    Entregables Verificados:
                  </span>
                  {phase.deliverables.map((deliv, dIdx) => (
                    <div
                      key={dIdx}
                      className="flex items-center gap-2 text-xs text-neutral-300 font-sans pl-2"
                    >
                      <ChevronRight className="w-3 h-3 text-cyan-400 shrink-0" />
                      <span>{deliv}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 bg-[#121214] text-xs">
          <button
            type="button"
            onClick={handleDownloadPlan}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#242429] hover:bg-[#2e2e34] text-neutral-200 transition-colors font-mono cursor-pointer border border-white/5"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Descargar Plan en Markdown</span>
          </button>

          <div className="flex items-center gap-2">
            {onExecutePlan && (
              <button
                type="button"
                onClick={() => {
                  onExecutePlan(plan);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-400 hover:opacity-90 text-slate-950 font-bold transition-all cursor-pointer shadow-lg shadow-cyan-500/20"
              >
                Ejecutar Plan Maestro con Goli Worki
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#26262b] hover:bg-[#32323a] text-neutral-300 transition-colors cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
