import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface SyntaxHighlighterProps {
  code: string;
  language: string;
}

export const SyntaxHighlighter: React.FC<SyntaxHighlighterProps> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // High-performance lexical tokenizer supporting Python, Rust, Go, TypeScript, Zig, C++, Java, Kotlin, Swift, Elixir, Haskell, SQL, Bash
  const renderHighlighted = (rawCode: string) => {
    const lines = rawCode.split('\n');

    return lines.map((line, lIdx) => {
      const trimmed = line.trimStart();
      // Comments
      if (
        trimmed.startsWith('//') ||
        trimmed.startsWith('#') ||
        trimmed.startsWith('--') ||
        trimmed.startsWith(';')
      ) {
        return (
          <div key={lIdx} className="table-row leading-6">
            <span className="table-cell pr-4 text-right select-none text-neutral-600 font-mono text-xs w-8">
              {lIdx + 1}
            </span>
            <span className="table-cell font-mono text-emerald-400/90 italic">{line}</span>
          </div>
        );
      }

      // Tokenize line elements
      const tokens = line.split(
        /(\/\*.*?\*\/|\/\/.*$|#.*$|--.*$|".*?"|'.*?'|`.*?`|\b(?:def|class|fn|pub|impl|struct|enum|type|interface|package|import|from|export|return|if|else|elif|for|while|match|select|case|default|go|defer|chan|let|mut|const|val|var|async|await|try|catch|except|finally|raise|throw|throws|actor|protocol|extension|use|mod|trait|where|concept|template|constexpr|virtual|override|public|private|protected|package|new|null|nil|true|false|self|this|None|Some|Ok|Err|CREATE|TABLE|SELECT|FROM|WHERE|INSERT|INTO|UPDATE|DELETE|JOIN|GROUP|BY|ORDER|DESC|ASC|LIMIT|PRIMARY|KEY|UUID|NOT|AND|OR)\b|\b\d+(?:\.\d+)?\b|[{}()[\];,])/g
      );

      return (
        <div key={lIdx} className="table-row leading-6 hover:bg-neutral-800/40 transition-colors">
          <span className="table-cell pr-4 text-right select-none text-neutral-600 font-mono text-xs w-8">
            {lIdx + 1}
          </span>
          <span className="table-cell font-mono text-neutral-200">
            {tokens.map((token, tIdx) => {
              if (!token) return null;
              if (
                token.startsWith('//') ||
                token.startsWith('/*') ||
                token.startsWith('#') ||
                token.startsWith('--')
              ) {
                return (
                  <span key={tIdx} className="text-emerald-400/90 italic">
                    {token}
                  </span>
                );
              }
              if (token.startsWith('"') || token.startsWith("'") || token.startsWith('`')) {
                return <span key={tIdx} className="text-amber-300">{token}</span>;
              }
              if (
                /^(def|class|fn|pub|impl|struct|enum|type|interface|package|import|from|export|return|if|else|elif|for|while|match|select|case|default|go|defer|chan|let|mut|const|val|var|async|await|try|catch|except|finally|actor|use|mod|trait|concept|public|private|CREATE|SELECT|FROM|WHERE|INSERT|UPDATE|DELETE)$/.test(
                  token
                )
              ) {
                return <span key={tIdx} className="text-cyan-400 font-medium">{token}</span>;
              }
              if (/^(true|false|null|nil|None|Some|Ok|Err)$/.test(token)) {
                return <span key={tIdx} className="text-purple-400 font-semibold">{token}</span>;
              }
              if (/^\d+(?:\.\d+)?$/.test(token)) {
                return <span key={tIdx} className="text-rose-400">{token}</span>;
              }
              return <span key={tIdx}>{token}</span>;
            })}
          </span>
        </div>
      );
    });
  };

  return (
    <div className="rounded-xl border border-white/10 bg-[#0d0d0f] overflow-hidden my-3 shadow-xl">
      {/* Code Header (ChatGPT style) */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#18181b] border-b border-white/5 text-xs font-mono">
        <span className="font-semibold text-neutral-300 lowercase">{language}</span>
        <button
          onClick={handleCopy}
          type="button"
          aria-label={`Copiar código ${language}`}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-neutral-400 hover:text-white hover:bg-white/10 transition-colors text-xs font-sans cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copiado</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copiar código</span>
            </>
          )}
        </button>
      </div>

      {/* Code Body */}
      <div className="p-4 overflow-x-auto text-xs font-mono select-text table w-full leading-relaxed">
        {renderHighlighted(code)}
      </div>
    </div>
  );
};
