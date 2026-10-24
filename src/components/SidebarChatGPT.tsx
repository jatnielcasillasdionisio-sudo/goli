import React, { useState } from 'react';
import {
  Plus,
  MessageSquare,
  Trash2,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Sparkles,
  ExternalLink,
  Code2,
} from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../utils/polyglotEngine';

export interface ChatThread {
  id: string;
  title: string;
  timestamp: string;
  category: 'Hoy' | 'Ayer' | 'Últimos 7 días';
  language?: string;
  hasLinks?: boolean;
}

interface SidebarChatGPTProps {
  isOpen: boolean;
  onToggle: () => void;
  threads: ChatThread[];
  activeThreadId: string;
  onSelectThread: (id: string) => void;
  onNewChat: () => void;
  onDeleteThread: (id: string) => void;
  onOpenSettings: () => void;
  onSelectLanguageQuick: (langKey: string) => void;
}

export const SidebarChatGPT: React.FC<SidebarChatGPTProps> = ({
  isOpen,
  onToggle,
  threads,
  activeThreadId,
  onSelectThread,
  onNewChat,
  onDeleteThread,
  onOpenSettings,
  onSelectLanguageQuick,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showLanguageFilter, setShowLanguageFilter] = useState(false);

  const filteredThreads = threads.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const grouped = {
    Hoy: filteredThreads.filter((t) => t.category === 'Hoy'),
    Ayer: filteredThreads.filter((t) => t.category === 'Ayer'),
    'Últimos 7 días': filteredThreads.filter((t) => t.category === 'Últimos 7 días'),
  };

  if (!isOpen) {
    return (
      <div className="fixed top-3 left-3 z-30">
        <button
          onClick={onToggle}
          type="button"
          title="Abrir barra lateral"
          className="p-2 rounded-xl bg-[#212124] hover:bg-[#2b2b30] border border-white/10 text-neutral-300 hover:text-white transition-all shadow-md cursor-pointer"
        >
          <PanelLeftOpen className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <aside className="w-64 sm:w-72 h-full bg-[#171717] border-r border-white/5 flex flex-col text-neutral-200 select-none z-30 shrink-0 transition-all duration-200">
      {/* Top Header */}
      <div className="p-3 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center font-bold text-slate-950 text-xs shadow-md shadow-cyan-500/20">
            G
          </div>
          <span className="font-semibold text-sm tracking-tight text-white flex items-center gap-1.5">
            Goli AI
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-800 text-cyan-400 border border-neutral-700">
              4.5
            </span>
          </span>
        </div>

        <button
          onClick={onToggle}
          title="Cerrar barra lateral"
          className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <PanelLeftClose className="w-4 h-4" />
        </button>
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <button
          onClick={onNewChat}
          type="button"
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#212124] hover:bg-[#2a2a30] border border-white/5 hover:border-white/15 text-sm font-medium text-white transition-all shadow-sm cursor-pointer group"
        >
          <div className="flex items-center gap-2.5">
            <Plus className="w-4 h-4 text-cyan-400 group-hover:rotate-90 transition-transform duration-200" />
            <span>Nuevo chat</span>
          </div>
          <span className="text-[10px] font-mono text-neutral-400 px-1.5 py-0.5 rounded bg-neutral-800/80">
            Ctrl+K
          </span>
        </button>
      </div>

      {/* Search Input */}
      <div className="px-3 pb-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar conversaciones..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#212124] border border-white/5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-cyan-500/50"
          />
        </div>
      </div>

      {/* Language Quick-Filter Toggle */}
      <div className="px-3 py-1.5 border-y border-white/5 bg-[#141416]">
        <button
          type="button"
          onClick={() => setShowLanguageFilter(!showLanguageFilter)}
          className="w-full flex items-center justify-between text-[11px] font-mono text-neutral-400 hover:text-cyan-400 transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <Code2 className="w-3.5 h-3.5" />
            <span>+40 Lenguajes Soportados</span>
          </span>
          <span className="text-cyan-400">{showLanguageFilter ? 'Ocultar' : 'Explorar'}</span>
        </button>

        {showLanguageFilter && (
          <div className="grid grid-cols-2 gap-1 pt-2 max-h-36 overflow-y-auto">
            {Object.values(SUPPORTED_LANGUAGES).map((lang) => (
              <button
                key={lang.id}
                type="button"
                onClick={() => {
                  onSelectLanguageQuick(lang.name);
                  setShowLanguageFilter(false);
                }}
                className="px-2 py-1 rounded text-left text-[10px] font-mono bg-neutral-800/60 hover:bg-cyan-950 hover:text-cyan-300 text-neutral-300 truncate transition-colors"
              >
                {lang.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chat Thread History */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4 text-xs">
        {(Object.keys(grouped) as Array<keyof typeof grouped>).map((category) => {
          const list = grouped[category];
          if (list.length === 0) return null;

          return (
            <div key={category} className="space-y-1">
              <h4 className="px-2 text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
                {category}
              </h4>
              <div className="space-y-0.5">
                {list.map((thread) => {
                  const isActive = thread.id === activeThreadId;
                  return (
                    <div
                      key={thread.id}
                      onClick={() => onSelectThread(thread.id)}
                      className={`group relative flex items-center justify-between px-2.5 py-2 rounded-xl cursor-pointer transition-all ${
                        isActive
                          ? 'bg-[#212124] text-white font-medium border border-white/10'
                          : 'text-neutral-400 hover:bg-neutral-800/60 hover:text-neutral-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1 pr-1">
                        <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-70" />
                        <span className="truncate text-xs">{thread.title}</span>
                      </div>

                      {/* Right icons: Language tag or Delete */}
                      <div className="flex items-center gap-1 shrink-0">
                        {thread.language && (
                          <span className="text-[9px] font-mono px-1 rounded bg-neutral-800 text-cyan-400 border border-neutral-700">
                            {thread.language}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteThread(thread.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-neutral-700 text-neutral-400 hover:text-rose-400 transition-opacity cursor-pointer"
                          title="Eliminar conversación"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom User & Settings Footer */}
      <div className="p-3 border-t border-white/5 bg-[#141416] space-y-2">
        <button
          onClick={onOpenSettings}
          type="button"
          className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-neutral-800/80 text-neutral-300 hover:text-white transition-colors cursor-pointer text-xs"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full bg-neutral-700 flex items-center justify-center text-[10px] font-bold text-white">
              JS
            </div>
            <div className="text-left">
              <div className="font-medium text-xs leading-none text-white">Ingeniero Principal</div>
              <div className="text-[10px] text-emerald-400 font-mono mt-0.5">Goli Pro Plus</div>
            </div>
          </div>
          <Settings className="w-4 h-4 text-neutral-400 hover:text-white" />
        </button>
      </div>
    </aside>
  );
};
