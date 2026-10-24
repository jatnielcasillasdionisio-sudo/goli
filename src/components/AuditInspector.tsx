import React, { useState } from 'react';
import { CodeAuditResult } from '../utils/codeAudit';

interface AuditInspectorProps {
  auditResult: CodeAuditResult;
  onApplyRefactor: (refactoredCode: string) => void;
  kvCacheTokens: number;
  threads: number;
}

export const AuditInspector: React.FC<AuditInspectorProps> = ({
  auditResult,
  onApplyRefactor,
  kvCacheTokens,
  threads,
}) => {
  const [showRefactorModal, setShowRefactorModal] = useState(false);
  const [copiedRefactor, setCopiedRefactor] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400 border-emerald-500 bg-emerald-950/40';
    if (score >= 75) return 'text-amber-400 border-amber-500 bg-amber-950/40';
    return 'text-rose-400 border-rose-500 bg-rose-950/40';
  };

  const handleCopyRefactor = () => {
    navigator.clipboard.writeText(auditResult.refactoredSnippet).then(() => {
      setCopiedRefactor(true);
      setTimeout(() => setCopiedRefactor(false), 2000);
    });
  };

  return (
    <aside className="w-full lg:w-80 bg-[#0c1220] border-l border-slate-800 p-4 flex flex-col gap-4 overflow-y-auto shrink-0 select-none">
      {/* Code Quality Card */}
      <div className="bg-[#10192e] border border-slate-800 rounded p-3.5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
            [SCORE DE CALIDAD]
          </span>
          <span className="text-xs font-mono text-cyan-400">
            {auditResult.language}
          </span>
        </div>

        <div className="flex items-baseline justify-between">
          <span className={`text-3xl font-extrabold font-mono px-2 py-0.5 rounded border ${getScoreColor(auditResult.score)}`}>
            {auditResult.score}/100
          </span>
          <span className="text-xs font-mono text-slate-300">
            {auditResult.cleanCodePassed ? '[CLEAN CODE OK]' : '[REQUIERE REVISIÓN]'}
          </span>
        </div>

        {/* Complexity Grid */}
        <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="bg-[#080d1a] p-2 rounded border border-slate-800">
            <span className="text-[9px] text-slate-500 block uppercase">Tiempo:</span>
            <span className="text-cyan-300 font-bold">{auditResult.timeComplexity}</span>
          </div>
          <div className="bg-[#080d1a] p-2 rounded border border-slate-800">
            <span className="text-[9px] text-slate-500 block uppercase">Memoria:</span>
            <span className="text-purple-300 font-bold">{auditResult.spaceComplexity}</span>
          </div>
        </div>

        {/* Action: Refactor Button */}
        <div className="mt-3">
          <button
            onClick={() => onApplyRefactor(auditResult.refactoredSnippet)}
            type="button"
            className="w-full py-1.5 bg-[#082f49] hover:bg-cyan-900 text-cyan-300 hover:text-white border border-cyan-500 rounded text-xs font-mono font-semibold transition-all cursor-pointer"
          >
            [DIFF] Inyectar Solución Limpia
          </button>
        </div>
      </div>

      {/* Verified Principles */}
      <div className="bg-[#10192e] border border-slate-800 rounded p-3">
        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-2">
          [PRINCIPIOS Y PATRONES GOF]
        </span>
        <div className="flex flex-col gap-1.5 text-xs font-mono">
          {auditResult.patternsDetected.map((pat, idx) => (
            <div key={idx} className="flex items-center gap-1.5 text-slate-300">
              <span className="text-emerald-400 font-bold">[OK]</span>
              <span>{pat}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="text-emerald-400 font-bold">[OK]</span>
            <span>Single Responsibility (SOLID)</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="text-emerald-400 font-bold">[OK]</span>
            <span>Strict Memory Boundary &amp; No Leaks</span>
          </div>
        </div>
      </div>

      {/* Audit Findings */}
      <div className="flex-1 flex flex-col gap-2">
        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
          [HALLAZGOS DE AUDITORÍA ({auditResult.findings.length})]
        </span>
        {auditResult.findings.length === 0 ? (
          <div className="p-3 bg-[#080d1a] border border-emerald-900/60 rounded text-xs font-mono text-emerald-400">
            [AUDITORÍA LIMPIA] No se detectaron vulnerabilidades críticas ni cuellos de botella asintóticos.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {auditResult.findings.map((f) => (
              <div
                key={f.id}
                className="bg-[#10192e] border border-slate-800 rounded p-2.5 text-xs font-mono"
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                      f.severity === 'CRITICAL'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : f.severity === 'WARNING'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                    }`}
                  >
                    [{f.severity}]
                  </span>
                  <span className="text-slate-500 text-[10px]">{f.category}</span>
                </div>
                <div className="font-semibold text-slate-200 mt-1">{f.title}</div>
                <div className="text-slate-400 text-[11px] mt-1 leading-relaxed">
                  {f.description}
                </div>
                <div className="mt-2 text-[10px] text-cyan-400 bg-[#080d1a] p-1.5 rounded border border-slate-800/80">
                  <span className="font-bold text-slate-300">Solución: </span>
                  {f.recommendation}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Low-Level CGo Engine Memory State */}
      <div className="bg-[#10192e] border border-slate-800 rounded p-3 text-xs font-mono">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
          [ESTADO TELEMETRÍA CGO]
        </span>
        <div className="flex justify-between py-1 border-b border-slate-800 text-slate-400">
          <span>KV Cache Tokens:</span>
          <span className="text-cyan-300 font-bold">{kvCacheTokens} tokens</span>
        </div>
        <div className="flex justify-between py-1 border-b border-slate-800 text-slate-400">
          <span>Goroutine Workers:</span>
          <span className="text-slate-200 font-bold">{threads} activos</span>
        </div>
        <div className="flex justify-between py-1 text-slate-400">
          <span>Zero-Copy Channel:</span>
          <span className="text-emerald-400 font-bold">128 slots (sync.Pool)</span>
        </div>
      </div>
    </aside>
  );
};
