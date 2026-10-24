import React from 'react';
import { EngineParams } from '../utils/telemetry';

export type OperatingMode = 'architecture' | 'audit' | 'refactor' | 'concurrency';

interface SidebarControlsProps {
  currentMode: OperatingMode;
  onSelectMode: (mode: OperatingMode) => void;
  onSelectChallenge: (key: string) => void;
  params: EngineParams;
  onChangeParams: (newParams: EngineParams) => void;
  onExportReport: () => void;
}

export const SidebarControls: React.FC<SidebarControlsProps> = ({
  currentMode,
  onSelectMode,
  onSelectChallenge,
  params,
  onChangeParams,
  onExportReport,
}) => {
  return (
    <aside className="w-full md:w-68 bg-[#0c1220] border-r border-slate-800 p-3 flex flex-col gap-3 overflow-y-auto shrink-0 select-none text-xs">
      {/* Operating Modes */}
      <div>
        <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center justify-between">
          <span>[MODO DE OPERACIÓN]</span>
          <span className="text-cyan-400">SOLID/GoF</span>
        </div>
        <div className="flex flex-col gap-1">
          <button
            onClick={() => onSelectMode('architecture')}
            type="button"
            className={`w-full text-left px-2.5 py-1.5 rounded text-xs font-mono font-semibold transition-all border cursor-pointer ${
              currentMode === 'architecture'
                ? 'bg-[#082f49] border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                : 'bg-[#10192e] border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
            }`}
          >
            [ARCH] Diseño &amp; Arquitectura
          </button>
          <button
            onClick={() => onSelectMode('audit')}
            type="button"
            className={`w-full text-left px-2.5 py-1.5 rounded text-xs font-mono font-semibold transition-all border cursor-pointer ${
              currentMode === 'audit'
                ? 'bg-[#082f49] border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                : 'bg-[#10192e] border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
            }`}
          >
            [AUDIT] Auditoría &amp; Seguridad
          </button>
          <button
            onClick={() => onSelectMode('refactor')}
            type="button"
            className={`w-full text-left px-2.5 py-1.5 rounded text-xs font-mono font-semibold transition-all border cursor-pointer ${
              currentMode === 'refactor'
                ? 'bg-[#082f49] border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                : 'bg-[#10192e] border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
            }`}
          >
            [CLEAN] Refactor Clean Code
          </button>
          <button
            onClick={() => onSelectMode('concurrency')}
            type="button"
            className={`w-full text-left px-2.5 py-1.5 rounded text-xs font-mono font-semibold transition-all border cursor-pointer ${
              currentMode === 'concurrency'
                ? 'bg-[#082f49] border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                : 'bg-[#10192e] border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
            }`}
          >
            [ASYNC] Concurrencia &amp; Lock-Free
          </button>
        </div>
      </div>

      {/* Production Challenges */}
      <div>
        <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center justify-between">
          <span>[EJEMPLOS DE PRODUCCIÓN]</span>
          <span className="text-emerald-400">LISTOS</span>
        </div>
        <div className="flex flex-col gap-1">
          <button
            onClick={() => onSelectChallenge('cpp_ringbuffer')}
            type="button"
            className="w-full text-left px-2 py-1 rounded bg-[#10192e] hover:bg-[#16233d] border border-slate-800 hover:border-cyan-600/60 text-[11px] font-mono text-slate-300 hover:text-cyan-300 transition-all cursor-pointer truncate"
          >
            [C++] Lock-Free Ring Buffer
          </button>
          <button
            onClick={() => onSelectChallenge('go_zerocopy')}
            type="button"
            className="w-full text-left px-2 py-1 rounded bg-[#10192e] hover:bg-[#16233d] border border-slate-800 hover:border-cyan-600/60 text-[11px] font-mono text-slate-300 hover:text-cyan-300 transition-all cursor-pointer truncate"
          >
            [GO] Zero-Copy Header Parser
          </button>
          <button
            onClick={() => onSelectChallenge('rust_simd')}
            type="button"
            className="w-full text-left px-2 py-1 rounded bg-[#10192e] hover:bg-[#16233d] border border-slate-800 hover:border-cyan-600/60 text-[11px] font-mono text-slate-300 hover:text-cyan-300 transition-all cursor-pointer truncate"
          >
            [RUST] Vectorized SIMD Math
          </button>
          <button
            onClick={() => onSelectChallenge('ts_raft')}
            type="button"
            className="w-full text-left px-2 py-1 rounded bg-[#10192e] hover:bg-[#16233d] border border-slate-800 hover:border-cyan-600/60 text-[11px] font-mono text-slate-300 hover:text-cyan-300 transition-all cursor-pointer truncate"
          >
            [TS] Branded Raft State Machine
          </button>
          <button
            onClick={() => onSelectChallenge('py_pipeline')}
            type="button"
            className="w-full text-left px-2 py-1 rounded bg-[#10192e] hover:bg-[#16233d] border border-slate-800 hover:border-cyan-600/60 text-[11px] font-mono text-slate-300 hover:text-cyan-300 transition-all cursor-pointer truncate"
          >
            [PY] Zero-Alloc Async Pipeline
          </button>
        </div>
      </div>

      {/* Engine C Parameters */}
      <div className="bg-[#10192e] border border-slate-800 rounded p-2.5 flex flex-col gap-2">
        <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between">
          <span>[PARÁMETROS MOTOR C]</span>
          <span className="text-cyan-400">GGUF</span>
        </div>

        {/* Quantization */}
        <div className="flex flex-col gap-0.5">
          <label htmlFor="select-quantization" className="text-[10px] font-mono text-slate-400">Cuantización:</label>
          <select
            id="select-quantization"
            value={params.quantization}
            onChange={(e) =>
              onChangeParams({ ...params, quantization: e.target.value as EngineParams['quantization'] })
            }
            className="bg-[#080d1a] border border-slate-700 text-slate-200 rounded px-1.5 py-0.5 text-[11px] font-mono outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="Q4_K_M">Q4_K_M (4.2 GB - Rápido)</option>
            <option value="Q5_K_M">Q5_K_M (5.1 GB - Equilibrado)</option>
            <option value="Q8_0">Q8_0 (7.6 GB - Precisión)</option>
            <option value="F16">F16 (14.2 GB - Sin Cuantizar)</option>
          </select>
        </div>

        {/* Context Window */}
        <div className="flex flex-col gap-0.5">
          <div className="flex justify-between text-[10px] font-mono text-slate-300">
            <span>Context Window:</span>
            <span className="text-cyan-300 font-bold">{params.contextSize.toLocaleString()}</span>
          </div>
          <input
            type="range"
            min={2048}
            max={32768}
            step={2048}
            value={params.contextSize}
            onChange={(e) => onChangeParams({ ...params, contextSize: Number(e.target.value) })}
            className="accent-cyan-400 cursor-pointer h-1.5"
          />
        </div>

        {/* CPU Threads */}
        <div className="flex flex-col gap-0.5">
          <div className="flex justify-between text-[10px] font-mono text-slate-300">
            <span>CPU Threads:</span>
            <span className="text-cyan-300 font-bold">{params.threads} hilos</span>
          </div>
          <input
            type="range"
            min={1}
            max={32}
            step={1}
            value={params.threads}
            onChange={(e) => onChangeParams({ ...params, threads: Number(e.target.value) })}
            className="accent-cyan-400 cursor-pointer h-1.5"
          />
        </div>

        {/* GPU Layers */}
        <div className="flex flex-col gap-0.5">
          <div className="flex justify-between text-[10px] font-mono text-slate-300">
            <span>GPU Layers Offload:</span>
            <span className="text-cyan-300 font-bold">{params.gpuLayers} / 33</span>
          </div>
          <input
            type="range"
            min={0}
            max={33}
            step={1}
            value={params.gpuLayers}
            onChange={(e) => onChangeParams({ ...params, gpuLayers: Number(e.target.value) })}
            className="accent-cyan-400 cursor-pointer h-1.5"
          />
        </div>
      </div>

      {/* Export Action */}
      <div className="pt-1">
        <button
          onClick={onExportReport}
          type="button"
          className="w-full py-1.5 bg-gradient-to-r from-cyan-900/60 to-blue-900/60 hover:from-cyan-800 hover:to-blue-800 border border-cyan-500/60 text-cyan-200 hover:text-white rounded text-xs font-mono font-bold tracking-wide transition-all shadow-[0_0_10px_rgba(6,182,212,0.15)] cursor-pointer text-center"
        >
          [EXPORT] Descargar Reporte (.md)
        </button>
      </div>
    </aside>
  );
};
