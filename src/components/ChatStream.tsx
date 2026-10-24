import React, { useRef, useEffect, useState } from 'react';
import { SyntaxHighlighter } from './SyntaxHighlighter';
import { AgenticStepper } from './AgenticStepper';
import { LinkPreviewCard } from './LinkPreviewCard';
import { AgenticStep } from '../utils/agenticEngine';
import { WebLinkInfo, extractUrlsFromText } from '../utils/webReader';
import { WorkiMasterPlan } from '../utils/goliWorki';
import {
  ArrowUp,
  Square,
  Globe,
  Sparkles,
  Bot,
  User,
  Shield,
  Copy,
  Check,
  Code2,
  Trash2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Layers,
  Zap,
} from 'lucide-react';

import { SUPPORTED_LANGUAGES } from '../utils/polyglotEngine';

export type ModelEffortLevel = 'low' | 'medium' | 'high' | 'extreme';

export interface ReasoningEffortData {
  level: ModelEffortLevel;
  thoughtTokens: number;
  thoughtSummary: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text?: string;
  codeSnippet?: string;
  language?: string;
  detectedUrls?: string[];
  agenticSteps?: AgenticStep[];
  reasoningEffort?: ReasoningEffortData;
  complexity?: {
    time: string;
    space: string;
  };
  workiPlan?: WorkiMasterPlan;
  isStreaming?: boolean;
}

interface ChatStreamProps {
  messages: ChatMessage[];
  inputPrompt: string;
  onChangeInput: (text: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  onClear: () => void;
  isGenerating: boolean;
  effortLevel: ModelEffortLevel;
  onChangeEffortLevel: (level: ModelEffortLevel) => void;
  onTriggerAudit: (code: string) => void;
  onVisitLink: (url: string) => void;
  onOpenWorkiPlan?: (plan: WorkiMasterPlan) => void;
}


export const ChatStream: React.FC<ChatStreamProps> = ({
  messages,
  inputPrompt,
  onChangeInput,
  onSubmit,
  onCancel,
  onClear,
  isGenerating,
  effortLevel,
  onChangeEffortLevel,
  onTriggerAudit,
  onVisitLink,
  onOpenWorkiPlan,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [expandedThoughts, setExpandedThoughts] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInputValue, setUrlInputValue] = useState('');

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`;
    }
  }, [inputPrompt]);

  const toggleThought = (msgId: string) => {
    setExpandedThoughts((prev) => ({
      ...prev,
      [msgId]: !prev[msgId],
    }));
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isGenerating && inputPrompt.trim()) {
        onSubmit();
      }
    }
  };

  const handleAddUrl = () => {
    if (!urlInputValue.trim()) return;
    const cleanUrl = urlInputValue.trim();
    const updated = inputPrompt
      ? `${inputPrompt}\nVisita y analiza este enlace: ${cleanUrl}`
      : `Visita y analiza este enlace: ${cleanUrl}`;
    onChangeInput(updated);
    setUrlInputValue('');
    setShowUrlInput(false);
  };

  const handleQuickPrompt = (prompt: string) => {
    onChangeInput(prompt);
  };

  const handleQuickLanguage = (langName: string) => {
    if (!inputPrompt.trim()) {
      onChangeInput(`Escribe un módulo de producción en ${langName} con pruebas unitarias y concurrencia`);
    } else {
      onChangeInput(`${inputPrompt} (en ${langName})`);
    }
    textareaRef.current?.focus();
  };

  const getEffortLabel = (lvl: ModelEffortLevel) => {
    switch (lvl) {
      case 'low':
        return 'Bajo (Rápido)';
      case 'medium':
        return 'Medio';
      case 'high':
        return 'Alto (Arquitectura)';
      case 'extreme':
        return 'Extremo (Formal)';
    }
  };

  const isStarter = messages.length <= 1;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#212121] overflow-hidden select-text text-neutral-100">
      {/* Scrollable Chat Viewport */}
      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
        <div className="max-w-3xl mx-auto flex flex-col gap-6">
          {/* Welcome Screen if empty/starter */}
          {isStarter && (
            <div className="py-8 sm:py-12 flex flex-col items-center text-center animate-in fade-in duration-300">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center font-bold text-slate-950 text-xl shadow-lg shadow-cyan-500/20 mb-4">
                G
              </div>
              <h2 className="text-xl sm:text-2xl font-semibold text-white mb-2">
                ¿En qué código o proyecto trabajamos hoy?
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 max-w-lg mb-8 leading-relaxed">
                Goli puede escribir código idiomático en <strong className="text-cyan-300">cualquier lenguaje</strong> solo con nombrarlo, <strong className="text-emerald-300">visitar y leer enlaces web</strong>, y ejecutar razonamiento agéntico autónomo.
              </p>

              {/* 4 Starter Suggestion Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl text-left">
                <button
                  type="button"
                  onClick={() =>
                    handleQuickPrompt(
                      'Escribe un servidor web concurrente en Rust usando TcpListener, ThreadPool y manejo de errores con Result.'
                    )
                  }
                  className="p-3.5 rounded-2xl bg-[#2a2a2e] hover:bg-[#34343a] border border-white/5 hover:border-white/10 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 mb-1">
                    <span>🦀 Rust</span>
                    <span className="text-[10px] font-mono text-neutral-400 group-hover:text-white">
                      Concurrencia
                    </span>
                  </div>
                  <p className="text-xs text-neutral-300 line-clamp-2">
                    Servidor HTTP multihilo sin dependencias externas usando ThreadPool.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleQuickPrompt(
                      'Visita y lee https://docs.rs y explícame cómo diseñar un canal MPSC seguro en Rust.'
                    )
                  }
                  className="p-3.5 rounded-2xl bg-[#2a2a2e] hover:bg-[#34343a] border border-white/5 hover:border-white/10 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1">
                    <span>🌐 Enlace Web</span>
                    <span className="text-[10px] font-mono text-neutral-400 group-hover:text-white">
                      Lectura en vivo
                    </span>
                  </div>
                  <p className="text-xs text-neutral-300 line-clamp-2">
                    Visita docs.rs y sintetiza la arquitectura de canales concurrentes.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleQuickPrompt(
                      'Escribe en Zig un búfer circular de bytes con GeneralPurposeAllocator explícito.'
                    )
                  }
                  className="p-3.5 rounded-2xl bg-[#2a2a2e] hover:bg-[#34343a] border border-white/5 hover:border-white/10 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
                    <span>⚡ Zig</span>
                    <span className="text-[10px] font-mono text-neutral-400 group-hover:text-white">
                      Bajo Nivel
                    </span>
                  </div>
                  <p className="text-xs text-neutral-300 line-clamp-2">
                    Búfer ring buffer de alto rendimiento con allocator manual.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleQuickPrompt(
                      'Diseña en Python un pipeline asíncrono con asyncio.Queue, tipado estático y dataclasses.'
                    )
                  }
                  className="p-3.5 rounded-2xl bg-[#2a2a2e] hover:bg-[#34343a] border border-white/5 hover:border-white/10 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 mb-1">
                    <span>🐍 Python</span>
                    <span className="text-[10px] font-mono text-neutral-400 group-hover:text-white">
                      Asyncio &amp; Clean Code
                    </span>
                  </div>
                  <p className="text-xs text-neutral-300 line-clamp-2">
                    Procesador de eventos en cola con backpressure y PEP 484.
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* Messages Timeline */}
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const detectedUrls = msg.detectedUrls || (msg.text ? extractUrlsFromText(msg.text) : []);

            return (
              <div
                key={msg.id}
                className={`flex gap-3 sm:gap-4 ${
                  isUser ? 'justify-end' : 'justify-start'
                }`}
              >
                {/* Assistant Avatar */}
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center font-bold text-slate-950 text-xs shadow-md shrink-0 mt-0.5">
                    G
                  </div>
                )}

                {/* Message Content Container */}
                <div
                  className={`flex flex-col max-w-full ${
                    isUser
                      ? 'max-w-xl bg-[#2f2f2f] text-white px-4 py-3 rounded-2xl rounded-tr-sm shadow-sm'
                      : 'flex-1 min-w-0 text-neutral-100'
                  }`}
                >
                  {/* Header in assistant message */}
                  {!isUser && (
                    <div className="flex items-center justify-between pb-1 text-xs text-neutral-400 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">Goli</span>
                        {msg.complexity && (
                          <span className="text-[11px] font-mono text-emerald-400 hidden sm:inline">
                            {msg.complexity.time} &bull; {msg.complexity.space}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-neutral-500">
                        {msg.timestamp}
                      </span>
                    </div>
                  )}

                  {/* Detected Links in Message (Preview Card) */}
                  {detectedUrls.length > 0 && (
                    <div className="space-y-2 my-1">
                      {detectedUrls.map((url, uIdx) => (
                        <LinkPreviewCard key={uIdx} url={url} onVisitLink={onVisitLink} />
                      ))}
                    </div>
                  )}

                  {/* Agentic Execution Stepper */}
                  {!isUser && msg.agenticSteps && msg.agenticSteps.length > 0 && (
                    <AgenticStepper
                      steps={msg.agenticSteps}
                      isGenerating={msg.isStreaming}
                      onOpenLinkModal={onVisitLink}
                    />
                  )}

                  {/* Goli Worki Master Plan Card */}
                  {!isUser && msg.workiPlan && (
                    <div className="my-2.5 p-3.5 rounded-2xl border border-cyan-500/40 bg-gradient-to-r from-[#111a28] to-[#121622] shadow-xl">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 text-slate-950 font-bold flex items-center justify-center text-xs shadow-md shadow-cyan-500/30 shrink-0">
                            GW
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-white text-xs sm:text-sm">
                                Plan Maestro Goli Worki ({msg.workiPlan.phases.length} Fases)
                              </span>
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-700 font-semibold">
                                1B LOC
                              </span>
                            </div>
                            <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
                              Zero Duplication &bull; Anti-Duplication: 100% Sin Redundancia &bull; Tipado Estricto
                            </p>
                          </div>
                        </div>

                        {onOpenWorkiPlan && (
                          <button
                            type="button"
                            onClick={() => onOpenWorkiPlan(msg.workiPlan!)}
                            className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/20 cursor-pointer shrink-0"
                          >
                            <Layers className="w-3.5 h-3.5" />
                            <span>Ver Plan Maestro</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}


                  {/* Reasoning Effort Dropdown */}
                  {!isUser && msg.reasoningEffort && (
                    <div className="my-2 rounded-xl border border-purple-900/40 bg-[#161224] overflow-hidden text-xs font-mono">
                      <button
                        type="button"
                        onClick={() => toggleThought(msg.id)}
                        className="w-full px-3.5 py-2 bg-[#1c1630] hover:bg-[#231b3e] text-purple-300 flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                          <span className="font-semibold text-xs">
                            Pensamiento profundo ({msg.reasoningEffort.thoughtTokens.toLocaleString()} tokens)
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-950 border border-purple-800 text-purple-300 uppercase">
                            {msg.reasoningEffort.level}
                          </span>
                        </div>
                        <span className="text-purple-400 text-xs">
                          {expandedThoughts[msg.id] ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </span>
                      </button>

                      {expandedThoughts[msg.id] && (
                        <div className="p-3.5 bg-[#120e1e] border-t border-purple-900/30 text-neutral-300 space-y-1.5 text-xs font-sans leading-relaxed">
                          <div className="text-[11px] font-mono text-purple-400 font-bold uppercase tracking-wider mb-1">
                            Proceso de razonamiento interno:
                          </div>
                          {msg.reasoningEffort.thoughtSummary.map((step, sIdx) => (
                            <div key={sIdx} className="flex items-start gap-2 text-xs">
                              <span className="text-purple-400 font-mono">&bull;</span>
                              <span>{step}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Main Text Content */}
                  {msg.text && (
                    <div className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-neutral-200 mt-1">
                      {msg.text}
                    </div>
                  )}

                  {/* Code Snippet Block */}
                  {msg.codeSnippet && (
                    <SyntaxHighlighter
                      code={msg.codeSnippet}
                      language={msg.language || 'Code'}
                    />
                  )}

                  {/* Streaming indicator */}
                  {msg.isStreaming && (
                    <div className="flex items-center gap-2 mt-2 text-cyan-400 font-mono text-xs">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                      <span>Goli está razonando y generando código en tiempo real...</span>
                    </div>
                  )}

                  {/* Assistant Footer Actions (Copy, Audit) */}
                  {!isUser && !msg.isStreaming && (
                    <div className="flex items-center gap-3 mt-2 text-neutral-400 text-xs">
                      <button
                        type="button"
                        onClick={() =>
                          handleCopyMessage(
                            msg.id,
                            `${msg.text || ''}\n\n${msg.codeSnippet || ''}`
                          )
                        }
                        className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                        title="Copiar respuesta completa"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copiar</span>
                          </>
                        )}
                      </button>

                      {msg.codeSnippet && (
                        <button
                          type="button"
                          onClick={() => onTriggerAudit(msg.codeSnippet || '')}
                          className="flex items-center gap-1 hover:text-cyan-400 transition-colors cursor-pointer"
                          title="Auditar calidad, seguridad y complejidad"
                        >
                          <Shield className="w-3.5 h-3.5" />
                          <span>Auditar código</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* User Avatar */}
                {isUser && (
                  <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center font-bold text-white text-xs shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ChatGPT-style Bottom Input Dock */}
      <div className="bg-[#212121] px-4 pb-4 pt-2 shrink-0">
        <div className="max-w-3xl mx-auto flex flex-col gap-2">
          {/* Quick Language & Goli Worki Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs select-none">
            {/* Goli Worki Trigger Button */}
            <button
              type="button"
              onClick={() => {
                onChangeInput(
                  inputPrompt.trim()
                    ? `[GOLI WORKI PLAN]: Crea un Plan Maestro exhaustivo para ${inputPrompt}`
                    : `[GOLI WORKI PLAN]: Crea un Plan Maestro de arquitectura para un sistema de alta concurrencia con 1 billón de líneas virtuales y cero duplicación.`
                );
              }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/50 text-[11px] font-mono shrink-0 font-bold transition-all shadow-sm shadow-cyan-950 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Goli Worki: Plan Maestro</span>
            </button>

            <span className="text-[11px] font-mono text-neutral-500 uppercase shrink-0 flex items-center gap-1 ml-1 mr-0.5">
              <Code2 className="w-3 h-3 text-cyan-400" /> Lenguaje:
            </span>

            {[
              'Python',
              'Rust',
              'Go',
              'TypeScript',
              'C++',
              'Zig',
              'C#',
              'Java',
              'Kotlin',
              'Swift',
              'SQL',
              'Bash',
              'Solidity',
              'Assembly',
              'PHP',
              'Ruby',
              'Scala',
              'Clojure',
              'Dart',
              'WAT',
              'Fortran',
              'COBOL',
              'R',
              'Docker',
            ].map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => handleQuickLanguage(lang)}
                className="px-2.5 py-1 rounded-full bg-[#2a2a2e] hover:bg-neutral-700 text-neutral-300 hover:text-white border border-white/5 text-[11px] font-mono shrink-0 transition-colors cursor-pointer"
              >
                {lang}
              </button>
            ))}
          </div>


          {/* URL Input Bar if opened */}
          {showUrlInput && (
            <div className="p-2.5 rounded-2xl bg-[#2a2a2e] border border-cyan-500/40 flex items-center gap-2 text-xs">
              <Globe className="w-4 h-4 text-cyan-400 shrink-0" />
              <input
                type="text"
                value={urlInputValue}
                onChange={(e) => setUrlInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddUrl();
                  }
                }}
                placeholder="Pega la URL para que Goli la visite y lea (ej. https://github.com/torvalds/linux o https://docs.rs)..."
                className="flex-1 bg-transparent border-none text-neutral-100 placeholder-neutral-500 text-xs focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddUrl}
                className="px-3 py-1 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-colors cursor-pointer"
              >
                Añadir al chat
              </button>
              <button
                type="button"
                onClick={() => setShowUrlInput(false)}
                className="text-neutral-400 hover:text-white px-1.5 py-1 text-xs"
              >
                Cancelar
              </button>
            </div>
          )}

          {/* Main ChatGPT Input Box */}
          <div className="relative bg-[#2f2f2f] rounded-3xl border border-white/10 focus-within:border-white/30 transition-all p-2.5 flex flex-col gap-2 shadow-xl">
            {/* Auto-growing Textarea */}
            <textarea
              ref={textareaRef}
              value={inputPrompt}
              onChange={(e) => onChangeInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Envía un mensaje a Goli, pide código en cualquier lenguaje o escribe un enlace web..."
              className="w-full bg-transparent border-none text-neutral-100 placeholder-neutral-500 text-sm focus:outline-none resize-none px-2 max-h-48 overflow-y-auto leading-relaxed"
            />

            {/* Bottom Bar inside Input Box */}
            <div className="flex items-center justify-between pt-1 select-none">
              {/* Left tools: Link & Model Effort */}
              <div className="flex items-center gap-2">
                {/* Link button */}
                <button
                  type="button"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-colors cursor-pointer ${
                    showUrlInput
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                      : 'hover:bg-neutral-700/60 text-neutral-400 hover:text-white'
                  }`}
                  title="Añadir enlace web para que Goli lo lea y visite"
                >
                  <Globe className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-[11px] font-mono hidden sm:inline">Visitar Enlace</span>
                </button>

                {/* Effort selector dropdown */}
                <div className="flex items-center gap-1 bg-[#242424] px-1.5 py-0.5 rounded-full border border-white/5 text-[11px] font-mono">
                  <span className="text-neutral-500 text-[10px] pl-1">Esfuerzo:</span>
                  {(['low', 'medium', 'high', 'extreme'] as ModelEffortLevel[]).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => onChangeEffortLevel(lvl)}
                      className={`px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                        effortLevel === lvl
                          ? 'bg-purple-900/80 text-purple-200 border border-purple-600 font-semibold shadow-sm'
                          : 'text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      {lvl.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Action: Send / Stop Button */}
              <div className="flex items-center gap-2">
                {isGenerating ? (
                  <button
                    type="button"
                    onClick={onCancel}
                    className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:bg-neutral-200 transition-colors shadow-md cursor-pointer"
                    title="Detener generación"
                  >
                    <Square className="w-3.5 h-3.5 fill-black" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onSubmit}
                    disabled={!inputPrompt.trim()}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      inputPrompt.trim()
                        ? 'bg-white text-black hover:bg-neutral-200 cursor-pointer shadow-md'
                        : 'bg-neutral-600 text-neutral-400 cursor-not-allowed opacity-50'
                    }`}
                    title="Enviar mensaje (Enter)"
                  >
                    <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ChatGPT Disclaimer Footer */}
          <div className="text-center text-[11px] text-neutral-500">
            Goli puede cometer errores. Verifica el código generado y los enlaces web antes de producción.
          </div>
        </div>
      </div>
    </div>
  );
};
