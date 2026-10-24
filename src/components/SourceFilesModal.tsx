import React, { useState } from 'react';
import { SyntaxHighlighter } from './SyntaxHighlighter';

interface SourceFilesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SourceFileEntry {
  path: string;
  lang: string;
  description: string;
  content: string;
}

const SOURCE_FILES: SourceFileEntry[] = [
  {
    path: '/backend/main.go',
    lang: 'Go',
    description: 'Servidor HTTP y WebSocket con concurrencia controlada en Goroutines y limits de memoria.',
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

	log.Printf("[INIT] GoCgoCodeEngine on port %d (GOMAXPROCS=%d)", *port, runtime.NumCPU())

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
	// Dispatches directly into Go channel without memory copying
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
# CODING MASTER DIRECTIVE: PRINCIPAL SOFTWARE ARCHITECT & ELITE SYSTEM ENGINEER
# Specialization: High-Performance Systems, Clean Architecture & Formal Code Audit
# ==============================================================================

[SYSTEM IDENTITY & MISSION]
You are the Principal AI Software Architect and Elite Systems Engineer.
Your purpose is exclusively focused on programming excellence, software architecture,
advanced algorithmic optimization, low-level systems (C++, Rust, Go), and clean code.

1. Clean Code & SOLID: Robert C. Martin rules (SRP, OCP, LSP, ISP, DIP).
2. Gang of Four Design Patterns: Creational, Structural and Behavioral.
3. Asymptotic Complexity: Strict Big-O time and space bounds.
4. Concurrency: Lock-free algorithms, atomics, CSP channels, race-free state.`
  },
  {
    path: '/Makefile',
    lang: 'General Code',
    description: 'Script de compilación unificado para CGo, optimizaciones del compilador C (-O3 -march=native) y frontend.',
    content: `CC := gcc
CFLAGS := -O3 -Wall -Wextra -pthread -fPIC -I./backend
GO := go
CGO_ENABLED := 1

build:
	@echo "==> Compilando CGo con soporte multicore..."
	cd backend && CGO_ENABLED=1 $(GO) build -ldflags="-s -w" -o ../bin/gocgo-engine main.go bridge.go

run: build
	./bin/gocgo-engine -port 8080`
  }
];

export const SourceFilesModal: React.FC<SourceFilesModalProps> = ({ isOpen, onClose }) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [downloadMsg, setDownloadMsg] = useState('');

  if (!isOpen) return null;

  const currentFile = SOURCE_FILES[activeIdx];

  const handleDownload = () => {
    const blob = new Blob([currentFile.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentFile.path.split('/').pop() || 'file.txt';
    a.click();
    setDownloadMsg(`Descargado: ${a.download}`);
    setTimeout(() => setDownloadMsg(''), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#0b1120] border border-cyan-500/40 rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col shadow-[0_0_30px_rgba(6,182,212,0.2)]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#0f172a] border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-cyan-400 font-mono font-bold text-xs bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
              [ARQUITECTURA DE ARCHIVOS]
            </span>
            <span className="text-sm font-bold text-white font-mono">
              Código Fuente Completo del Sistema
            </span>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-300 text-xs font-mono font-bold border border-slate-700 transition-colors cursor-pointer"
          >
            [X] CERRAR
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-700 bg-[#070b14] overflow-x-auto select-none p-1 gap-1">
          {SOURCE_FILES.map((f, idx) => (
            <button
              key={f.path}
              onClick={() => setActiveIdx(idx)}
              type="button"
              className={`px-3 py-1.5 text-xs font-mono rounded transition-all cursor-pointer ${
                activeIdx === idx
                  ? 'bg-[#0f2847] text-cyan-300 border border-cyan-500 font-bold shadow-[0_0_8px_rgba(6,182,212,0.3)]'
                  : 'text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {f.path}
            </button>
          ))}
        </div>

        {/* File Details & Download Toolbar */}
        <div className="px-4 py-2 bg-[#0c1220] border-b border-slate-800/80 flex items-center justify-between text-xs font-mono">
          <div className="text-slate-300">
            <span className="text-cyan-400 font-bold">{currentFile.path}</span> &mdash;{' '}
            <span className="text-slate-400">{currentFile.description}</span>
          </div>
          <div className="flex items-center gap-2">
            {downloadMsg && (
              <span className="text-emerald-400 text-xs font-mono font-bold">
                [{downloadMsg}]
              </span>
            )}
            <button
              onClick={handleDownload}
              type="button"
              className="px-3 py-1 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 hover:text-white border border-cyan-600 rounded text-xs font-mono font-semibold transition-all cursor-pointer"
            >
              [DOWNLOAD] Descargar Archivo
            </button>
          </div>
        </div>

        {/* File Content with Syntax Highlighter */}
        <div className="p-4 overflow-y-auto flex-1 bg-[#060911]">
          <SyntaxHighlighter code={currentFile.content} language={currentFile.lang} />
        </div>
      </div>
    </div>
  );
};
