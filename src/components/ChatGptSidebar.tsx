import React from 'react';
import { MainNavTab } from './HeaderTelemetry';

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  language?: string;
}

interface ChatGptSidebarProps {
  isOpen: boolean;
  onToggleOpen: () => void;
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  activeNavTab: MainNavTab;
  onSelectNavTab: (tab: MainNavTab) => void;
  onOpenSettings: () => void;
}

export const ChatGptSidebar: React.FC<ChatGptSidebarProps> = ({
  isOpen,
  onToggleOpen,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  activeNavTab,
  onSelectNavTab,
  onOpenSettings,
}) => {
  return (
    <aside
      className={`h-full bg-[#0a0d16] border-r border-slate-800 flex flex-col transition-all duration-200 select-none z-20 ${
        isOpen ? 'w-64 sm:w-72' : 'w-14'
      }`}
    >
      {/* Top Header: New Chat & Toggle */}
      <div className="p-3 border-b border-slate-800/80 flex items-center justify-between gap-2">
        {isOpen ? (
          <button
            type="button"
            onClick={onNewChat}
            className="flex-1 py-2 px-3 bg-[#131d33] hover:bg-[#1e2d4d] text-cyan-300 hover:text-white border border-slate-700 hover:border-cyan-500 rounded-lg text-xs font-mono font-bold flex items-center justify-between transition-all cursor-pointer shadow-[0_0_10px_rgba(6,182,212,0.15)]"
          >
            <span>[+] Nuevo chat</span>
            <span className="text-[10px] text-slate-500 font-normal">Goli v2</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onNewChat}
            title="Nuevo chat"
            className="w-8 h-8 rounded-lg bg-[#131d33] hover:bg-cyan-950 text-cyan-400 border border-slate-700 font-mono font-bold text-sm flex items-center justify-center cursor-pointer"
          >
            +
          </button>
        )}

        <button
          type="button"
          onClick={onToggleOpen}
          aria-label={isOpen ? 'Ocultar barra lateral' : 'Mostrar barra lateral'}
          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 font-mono text-xs cursor-pointer"
        >
          {isOpen ? '[<<]' : '[>>]'}
        </button>
      </div>

      {/* Middle: Chat History List */}
      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
        {isOpen ? (
          <>
            <div className="px-2 py-1 text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
              Historial de Chats
            </div>
            {sessions.map((sess) => {
              const isActive = sess.id === activeSessionId && activeNavTab === 'chat';
              return (
                <div
                  key={sess.id}
                  onClick={() => {
                    onSelectSession(sess.id);
                    onSelectNavTab('chat');
                  }}
                  className={`group px-3 py-2 rounded-lg text-xs font-mono flex items-center justify-between cursor-pointer transition-all border ${
                    isActive
                      ? 'bg-[#131d33] text-cyan-300 border-cyan-500/50 shadow-[0_0_8px_rgba(6,182,212,0.15)]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border-transparent'
                  }`}
                >
                  <div className="truncate flex-1 pr-2">
                    <span className="block truncate">{sess.title}</span>
                    {sess.language && (
                      <span className="text-[9px] text-cyan-400/80 uppercase">
                        [{sess.language}]
                      </span>
                    )}
                  </div>

                  {sessions.length > 1 && (
                    <button
                      type="button"
                      aria-label="Eliminar chat"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSession(sess.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 hover:text-rose-400 text-slate-500 text-[10px] p-1 font-bold transition-opacity"
                    >
                      [X]
                    </button>
                  )}
                </div>
              );
            })}
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 pt-2">
            {sessions.slice(0, 5).map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  onSelectSession(s.id);
                  onSelectNavTab('chat');
                }}
                title={s.title}
                className={`w-8 h-8 rounded-md font-mono text-[10px] font-bold border flex items-center justify-center cursor-pointer ${
                  s.id === activeSessionId && activeNavTab === 'chat'
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-500'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {s.language ? s.language.slice(0, 2).toUpperCase() : '//'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Navigation Tools Drawer */}
      <div className="p-2 border-t border-slate-800/80 bg-[#080b12] flex flex-col gap-1 text-xs font-mono">
        {isOpen ? (
          <>
            <div className="px-2 py-0.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Herramientas de Software
            </div>
            <button
              type="button"
              onClick={() => onSelectNavTab('chat')}
              className={`w-full text-left px-3 py-1.5 rounded-md cursor-pointer transition-all border ${
                activeNavTab === 'chat'
                  ? 'bg-[#101f38] text-cyan-300 border-cyan-500 font-bold'
                  : 'text-slate-400 hover:text-white border-transparent'
              }`}
            >
              [CHAT PRINCIPAL]
            </button>
            <button
              type="button"
              onClick={() => onSelectNavTab('visualizer')}
              className={`w-full text-left px-3 py-1.5 rounded-md cursor-pointer transition-all border ${
                activeNavTab === 'visualizer'
                  ? 'bg-[#101f38] text-cyan-300 border-cyan-500 font-bold'
                  : 'text-slate-400 hover:text-white border-transparent'
              }`}
            >
              [VISUALIZADOR HTML]
            </button>
            <button
              type="button"
              onClick={() => onSelectNavTab('compiler')}
              className={`w-full text-left px-3 py-1.5 rounded-md cursor-pointer transition-all border ${
                activeNavTab === 'compiler'
                  ? 'bg-[#101f38] text-cyan-300 border-cyan-500 font-bold'
                  : 'text-slate-400 hover:text-white border-transparent'
              }`}
            >
              [COMPILADOR DE CÓDIGO]
            </button>
            <button
              type="button"
              onClick={() => onSelectNavTab('training')}
              className={`w-full text-left px-3 py-1.5 rounded-md cursor-pointer transition-all border ${
                activeNavTab === 'training'
                  ? 'bg-[#101f38] text-cyan-300 border-cyan-500 font-bold'
                  : 'text-slate-400 hover:text-white border-transparent'
              }`}
            >
              [ENTRENAMIENTO APPS]
            </button>
            <button
              type="button"
              onClick={onOpenSettings}
              className="w-full text-left px-3 py-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent transition-all cursor-pointer"
            >
              [AJUSTES Y CGO ENGINE]
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1.5 py-1">
            <button
              type="button"
              onClick={() => onSelectNavTab('visualizer')}
              title="Visualizador HTML"
              className="w-8 h-8 rounded-md bg-slate-900 hover:bg-cyan-950 text-cyan-400 border border-slate-800 font-mono text-xs flex items-center justify-center cursor-pointer"
            >
              UI
            </button>
            <button
              type="button"
              onClick={() => onSelectNavTab('compiler')}
              title="Compilador"
              className="w-8 h-8 rounded-md bg-slate-900 hover:bg-cyan-950 text-cyan-400 border border-slate-800 font-mono text-xs flex items-center justify-center cursor-pointer"
            >
              &gt;_
            </button>
            <button
              type="button"
              onClick={onOpenSettings}
              title="Ajustes"
              className="w-8 h-8 rounded-md bg-slate-900 hover:bg-cyan-950 text-slate-300 border border-slate-800 font-mono text-xs flex items-center justify-center cursor-pointer"
            >
              CFG
            </button>
          </div>
        )}
      </div>

      {/* Bottom Profile Badge */}
      <div className="p-3 border-t border-slate-800 bg-[#070a12] flex items-center justify-between text-xs font-mono">
        {isOpen ? (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]"></span>
            <div>
              <span className="font-bold text-white block">Goli 4 - Elite</span>
              <span className="text-[10px] text-slate-500">Local Neural CGo Engine</span>
            </div>
          </div>
        ) : (
          <span className="w-2.5 h-2.5 mx-auto rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]"></span>
        )}
      </div>
    </aside>
  );
};
