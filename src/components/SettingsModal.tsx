import React, { useState } from 'react';
import { EngineParams, TelemetryMetrics } from '../utils/telemetry';
import { CodeAuditResult } from '../utils/codeAudit';
import { SyntaxHighlighter } from './SyntaxHighlighter';
import { PRESET_CHALLENGES } from '../data/challenges';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  params: EngineParams;
  onChangeParams: (newParams: EngineParams) => void;
  metrics: TelemetryMetrics;
  auditResult: CodeAuditResult;
  onSelectChallenge: (key: string) => void;
  onExportReport: () => void;
  onApplyRefactor: (code: string) => void;
}

type SettingsTab = 'telemetry' | 'audit' | 'source' | 'challenges';

const SOURCE_FILES = [
  {
    path: '/backend/main.go',
    lang: 'Go',
    description: 'Servidor HTTP y WebSocket con Goroutines y limitador de concurrencia.',
    content: `package main

import (
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"runtime"
	"syscall"
	"time"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  4096,
	WriteBufferSize: 4096,
	CheckOrigin: func(r *http.Request) bool { return true },
}

func main() {
	port := flag.Int("port", 8080, "HTTP/WebSocket server port")
	modelPath := flag.String("model", "models/deepseek-coder-7b-q4.gguf", "Model file path")
	flag.Parse()

	log.Printf("[GOLI ENGINE] Booting on port %d (GOMAXPROCS=%d)", *port, runtime.NumCPU())

	cfg := EngineConfig{
		ModelPath:   *modelPath,
		ContextSize: 8192,
		Threads:     runtime.NumCPU(),
		GPULayers:   32,
		Temperature: 0.2,
		TopP:        0.95,
	}

	engine, err := NewEngine(cfg)
	if err != nil {
		log.Fatalf("[FATAL] CGo engine error: %v", err)
	}
	defer engine.Close()

	mux := http.NewServeMux()
	mux.HandleFunc("/ws/generate", handleWS(engine))
	http.ListenAndServe(fmt.Sprintf(":%d", *port), mux)
}`
  },
  {
    path: '/backend/bridge.go',
    lang: 'Go',
    description: 'Puente CGo que conecta Goroutines de Go con la memoria C y callbacks de streaming.',
    content: `package main

/*
#cgo CFLAGS: -I. -O3 -Wall
#include "bridge.h"

extern int goTokenCallback(const char* token, void* user_data);

static int c_callback_trampoline(const char* token, void* user_data) {
    return goTokenCallback(token, user_data);
}
*/
import "C"
import (
	"context"
	"sync"
	"unsafe"
)

type Engine struct {
	mu   sync.RWMutex
	cCtx *C.llama_ctx_t
}

//export goTokenCallback
func goTokenCallback(token *C.char, userData unsafe.Pointer) C.int {
	// Zero-copy dispatch directly into Go channel
	return 0
}`
  },
  {
    path: '/backend/bridge.h',
    lang: 'C++',
    description: 'Cabecera C que define la interfaz de inferencia, estructuras de configuración y telemetría.',
    content: `#ifndef BRIDGE_H
#define BRIDGE_H

#include <stddef.h>
#include <stdint.h>

#ifdef __cplusplus
extern "C" {
#endif

typedef struct {
    const char* model_path;
    int32_t     n_ctx;
    int32_t     n_threads;
    int32_t     n_gpu_layers;
    float       temperature;
    float       top_p;
} engine_config_t;

typedef struct {
    int32_t total_tokens;
    float   tokens_per_sec;
    size_t  ram_usage_mb;
    size_t  vram_usage_mb;
    double  time_to_first_token_ms;
} engine_metrics_t;

typedef struct llama_inference_context llama_ctx_t;
typedef int (*token_callback_fn)(const char* token, void* user_data);

llama_ctx_t* engine_init(const engine_config_t* config);
void         engine_free(llama_ctx_t* ctx);
void         engine_cancel(llama_ctx_t* ctx);

int engine_generate_stream(llama_ctx_t* ctx, const char* prompt, token_callback_fn cb, void* udata, engine_metrics_t* metrics);

#ifdef __cplusplus
}
#endif
#endif`
  },
  {
    path: '/prompts/coding_master_prompt.txt',
    lang: 'General Code',
    description: 'Directiva de Ingeniería Senior con principios Clean Code (Robert C. Martin), GoF y análisis asintótico.',
    content: `# ==============================================================================
# GOLI CODING MASTER DIRECTIVE: PRINCIPAL SOFTWARE ARCHITECT
# Specialization: High-Performance Systems, Clean Architecture & Formal Code Audit
# ==============================================================================

1. Clean Code & SOLID: Robert C. Martin rules (SRP, OCP, LSP, ISP, DIP).
2. Gang of Four Design Patterns: Creational, Structural and Behavioral.
3. Asymptotic Complexity: Strict Big-O time and space bounds.
4. Concurrency: Lock-free algorithms, atomics, CSP channels, race-free state.`
  },
  {
    path: '/Makefile',
    lang: 'General Code',
    description: 'Script de compilación unificado para CGo, optimizaciones C (-O3 -march=native) y Go.',
    content: `CC := gcc
CFLAGS := -O3 -Wall -Wextra -pthread -fPIC -I./backend
GO := go
CGO_ENABLED := 1

build:
	@echo "==> Compilando Goli Engine con CGO..."
	cd backend && CGO_ENABLED=1 $(GO) build -ldflags="-s -w" -o ../bin/gocgo-engine main.go bridge.go

run: build
	./bin/gocgo-engine -port 8080`
  }
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  params,
  onChangeParams,
  metrics,
  auditResult,
  onSelectChallenge,
  onExportReport,
  onApplyRefactor,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('telemetry');
  const [selectedSourceIdx, setSelectedSourceIdx] = useState(0);
  const [downloadMsg, setDownloadMsg] = useState('');

  if (!isOpen) return null;

  const currentSource = SOURCE_FILES[selectedSourceIdx];

  const handleDownloadSource = () => {
    const blob = new Blob([currentSource.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentSource.path.split('/').pop() || 'file.txt';
    a.click();
    setDownloadMsg(`Descargado: ${a.download}`);
    setTimeout(() => setDownloadMsg(''), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
      <div className="bg-[#0b1120] border border-cyan-500/50 rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col shadow-[0_0_35px_rgba(6,182,212,0.25)] select-none">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#0f172a] border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="text-cyan-400 font-mono font-bold text-xs bg-[#052e3b] px-2.5 py-1 rounded border border-cyan-700">
              [PANEL DE AJUSTES GOLI]
            </span>
            <span className="text-sm font-bold text-white font-mono">
              Configuración de Motor, Telemetría y Auditoría
            </span>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="px-3 py-1 rounded bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-300 text-xs font-mono font-bold border border-slate-700 transition-colors cursor-pointer"
          >
            [X] CERRAR
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-[#070b14] p-1.5 gap-1.5 overflow-x-auto">
          <button
            onClick={() => setActiveTab('telemetry')}
            type="button"
            className={`px-3 py-1.5 text-xs font-mono rounded transition-all cursor-pointer ${
              activeTab === 'telemetry'
                ? 'bg-[#0f2847] text-cyan-300 border border-cyan-500 font-bold shadow-[0_0_8px_rgba(6,182,212,0.3)]'
                : 'text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            [MOTOR Y TELEMETRÍA]
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            type="button"
            className={`px-3 py-1.5 text-xs font-mono rounded transition-all cursor-pointer ${
              activeTab === 'audit'
                ? 'bg-[#0f2847] text-cyan-300 border border-cyan-500 font-bold shadow-[0_0_8px_rgba(6,182,212,0.3)]'
                : 'text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            [AUDITORÍA DE CÓDIGO]
          </button>
          <button
            onClick={() => setActiveTab('source')}
            type="button"
            className={`px-3 py-1.5 text-xs font-mono rounded transition-all cursor-pointer ${
              activeTab === 'source'
                ? 'bg-[#0f2847] text-cyan-300 border border-cyan-500 font-bold shadow-[0_0_8px_rgba(6,182,212,0.3)]'
                : 'text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            [CÓDIGO FUENTE GO+CGO]
          </button>
          <button
            onClick={() => setActiveTab('challenges')}
            type="button"
            className={`px-3 py-1.5 text-xs font-mono rounded transition-all cursor-pointer ${
              activeTab === 'challenges'
                ? 'bg-[#0f2847] text-cyan-300 border border-cyan-500 font-bold shadow-[0_0_8px_rgba(6,182,212,0.3)]'
                : 'text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            [EJEMPLOS DE PRODUCCIÓN]
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-5 overflow-y-auto flex-1 bg-[#080d1a] text-slate-200">
          {/* TAB 1: TELEMETRÍA Y PARÁMETROS */}
          {activeTab === 'telemetry' && (
            <div className="flex flex-col gap-5">
              {/* Telemetry Dials */}
              <div>
                <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-2.5">
                  [TELEMETRÍA EN TIEMPO REAL DEL MOTOR CGO]
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-[#10192e] border border-slate-800 rounded p-3">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Throughput</span>
                    <span className="text-xl font-mono font-bold text-cyan-300">{metrics.tokensPerSec.toFixed(1)} TPS</span>
                  </div>
                  <div className="bg-[#10192e] border border-slate-800 rounded p-3">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Host RAM</span>
                    <span className="text-xl font-mono font-bold text-slate-200">{metrics.hostRamMB.toLocaleString()} MB</span>
                  </div>
                  <div className="bg-[#10192e] border border-slate-800 rounded p-3">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">GPU VRAM</span>
                    <span className="text-xl font-mono font-bold text-cyan-400">{metrics.gpuVramMB.toLocaleString()} MB</span>
                  </div>
                  <div className="bg-[#10192e] border border-slate-800 rounded p-3">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Latencia TTFT</span>
                    <span className="text-xl font-mono font-bold text-purple-300">{metrics.timeToFirstTokenMs.toFixed(1)} ms</span>
                  </div>
                </div>
              </div>

              {/* Hardware Sliders */}
              <div className="bg-[#10192e] border border-slate-800 rounded p-4 flex flex-col gap-4">
                <span className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-widest block">
                  [PARÁMETROS DE HARDWARE Y CUANTIZACIÓN]
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Quantization */}
                  <div className="flex flex-col gap-1">
                    <label htmlFor="modal-quantization" className="text-xs font-mono text-slate-300">Formato de Cuantización:</label>
                    <select
                      id="modal-quantization"
                      value={params.quantization}
                      onChange={(e) =>
                        onChangeParams({ ...params, quantization: e.target.value as EngineParams['quantization'] })
                      }
                      className="bg-[#080d1a] border border-slate-700 text-slate-200 rounded px-2.5 py-1.5 text-xs font-mono outline-none focus:border-cyan-500 cursor-pointer"
                    >
                      <option value="Q4_K_M">Q4_K_M (4.2 GB - Óptimo para Velocidad)</option>
                      <option value="Q5_K_M">Q5_K_M (5.1 GB - Alta Precisión)</option>
                      <option value="Q8_0">Q8_0 (7.6 GB - Calidad Cuasi-FP16)</option>
                      <option value="F16">F16 (14.2 GB - Sin Cuantización)</option>
                    </select>
                  </div>

                  {/* Context Window */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs font-mono text-slate-300">
                      <span>Ventana de Contexto (Tokens):</span>
                      <span className="text-cyan-300 font-bold">{params.contextSize.toLocaleString()}</span>
                    </div>
                    <input
                      type="range"
                      min={2048}
                      max={32768}
                      step={2048}
                      value={params.contextSize}
                      onChange={(e) => onChangeParams({ ...params, contextSize: Number(e.target.value) })}
                      className="accent-cyan-400 cursor-pointer"
                    />
                  </div>

                  {/* Threads */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs font-mono text-slate-300">
                      <span>Hilos de Cómputo CPU:</span>
                      <span className="text-cyan-300 font-bold">{params.threads} workers</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={32}
                      step={1}
                      value={params.threads}
                      onChange={(e) => onChangeParams({ ...params, threads: Number(e.target.value) })}
                      className="accent-cyan-400 cursor-pointer"
                    />
                  </div>

                  {/* GPU Offload */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs font-mono text-slate-300">
                      <span>Capas Offload a VRAM:</span>
                      <span className="text-cyan-300 font-bold">{params.gpuLayers} / 33</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={33}
                      step={1}
                      value={params.gpuLayers}
                      onChange={(e) => onChangeParams({ ...params, gpuLayers: Number(e.target.value) })}
                      className="accent-cyan-400 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Export Button */}
              <div className="pt-2">
                <button
                  onClick={onExportReport}
                  type="button"
                  className="px-4 py-2 bg-gradient-to-r from-cyan-900 to-blue-900 hover:from-cyan-800 hover:to-blue-800 border border-cyan-500 text-cyan-200 hover:text-white rounded text-xs font-mono font-bold tracking-wide transition-all shadow-[0_0_12px_rgba(6,182,212,0.2)] cursor-pointer"
                >
                  [EXPORTAR REPORTE COMPLETO .MD]
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: AUDITORÍA DE CÓDIGO */}
          {activeTab === 'audit' && (
            <div className="flex flex-col gap-4">
              <div className="bg-[#10192e] border border-slate-800 rounded p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 block uppercase">PUNTUACIÓN DE CALIDAD DE CÓDIGO</span>
                  <span className="text-3xl font-extrabold font-mono text-emerald-400">{auditResult.score}/100</span>
                </div>
                <div className="text-right font-mono text-xs text-slate-300">
                  <div>Lenguaje Detectado: <span className="text-cyan-300 font-bold">{auditResult.language}</span></div>
                  <div>Complejidad Temporal: <span className="text-cyan-300 font-bold">{auditResult.timeComplexity}</span></div>
                  <div>Complejidad Espacial: <span className="text-purple-300 font-bold">{auditResult.spaceComplexity}</span></div>
                </div>
              </div>

              {/* Findings */}
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                  [HALLAZGOS Y VULNERABILIDADES]
                </span>
                {auditResult.findings.length === 0 ? (
                  <div className="p-3 bg-[#0c1a2e] border border-emerald-800/80 rounded text-xs font-mono text-emerald-400">
                    [OK] No se detectaron vulnerabilidades de memoria ni antipatrones.
                  </div>
                ) : (
                  auditResult.findings.map((f) => (
                    <div key={f.id} className="bg-[#10192e] border border-slate-800 rounded p-3 text-xs font-mono">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-amber-400 font-bold">[{f.severity}] {f.title}</span>
                        <span className="text-slate-400 text-[11px]">{f.category}</span>
                      </div>
                      <div className="text-slate-300 leading-relaxed">{f.description}</div>
                      <div className="mt-2 text-cyan-300 bg-[#080d1a] p-2 rounded border border-slate-800">
                        <span className="font-bold text-slate-400">Recomendación: </span>{f.recommendation}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Verified Principles */}
              <div className="bg-[#10192e] border border-slate-800 rounded p-3 text-xs font-mono flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  [PATRONES Y PRINCIPIOS VERIFICADOS]
                </span>
                {auditResult.patternsDetected.map((p, i) => (
                  <div key={i} className="text-slate-300">
                    <span className="text-emerald-400 font-bold">[OK] </span>{p}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: CÓDIGO FUENTE */}
          {activeTab === 'source' && (
            <div className="flex flex-col gap-3">
              <div className="flex border-b border-slate-800 bg-[#070b14] p-1 gap-1 overflow-x-auto">
                {SOURCE_FILES.map((f, idx) => (
                  <button
                    key={f.path}
                    onClick={() => setSelectedSourceIdx(idx)}
                    type="button"
                    className={`px-2.5 py-1 text-xs font-mono rounded transition-all cursor-pointer ${
                      selectedSourceIdx === idx
                        ? 'bg-[#0f2847] text-cyan-300 border border-cyan-500 font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {f.path}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs font-mono bg-[#0c1220] p-2 rounded border border-slate-800">
                <span className="text-slate-300">{currentSource.description}</span>
                <div className="flex items-center gap-2">
                  {downloadMsg && <span className="text-emerald-400 font-bold">{downloadMsg}</span>}
                  <button
                    onClick={handleDownloadSource}
                    type="button"
                    className="px-2.5 py-1 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-600 rounded text-xs font-mono font-semibold transition-all cursor-pointer"
                  >
                    [DOWNLOAD] Descargar
                  </button>
                </div>
              </div>

              <SyntaxHighlighter code={currentSource.content} language={currentSource.lang} />
            </div>
          )}

          {/* TAB 4: EJEMPLOS DE PRODUCCIÓN */}
          {activeTab === 'challenges' && (
            <div className="flex flex-col gap-3">
              <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                [CARGAR DESAFÍO EN EL CHAT DE GOLI]
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.values(PRESET_CHALLENGES).map((ch) => (
                  <div key={ch.id} className="bg-[#10192e] border border-slate-800 rounded p-3 flex flex-col justify-between">
                    <div>
                      <div className="text-xs font-mono font-bold text-cyan-300 mb-1">{ch.name}</div>
                      <div className="text-[11px] font-mono text-slate-400 line-clamp-2">{ch.prompt}</div>
                    </div>
                    <button
                      onClick={() => {
                        onSelectChallenge(ch.id);
                        onClose();
                      }}
                      type="button"
                      className="mt-3 px-3 py-1.5 bg-[#082f49] hover:bg-cyan-900 text-cyan-300 hover:text-white border border-cyan-500 rounded text-xs font-mono font-semibold transition-all cursor-pointer"
                    >
                      [CARGAR EN CHAT]
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
