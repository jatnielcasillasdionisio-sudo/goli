import { useState, useRef, useEffect, useTransition, useMemo } from 'react';
import { HeaderTelemetry, MainNavTab } from './components/HeaderTelemetry';
import { ChatStream, ChatMessage, ModelEffortLevel, ReasoningEffortData } from './components/ChatStream';
import { HtmlVisualizer } from './components/HtmlVisualizer';
import { CompilerPlayground } from './components/CompilerPlayground';
import { ModelTrainingView } from './components/ModelTrainingView';
import { SettingsModal } from './components/SettingsModal';
import { OperatingMode } from './components/SidebarControls';
import { EngineParams, TelemetryMetrics, calculateHardwareMemory, calculateTPS } from './utils/telemetry';
import { auditSourceCode, CodeAuditResult } from './utils/codeAudit';
import { PRESET_CHALLENGES } from './data/challenges';

const DEFAULT_HTML_APP = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>App Completa Goli</title>
  <style>
    body { font-family: system-ui; background: #060913; color: #f8fafc; margin: 0; padding: 24px; text-align: center; }
    .box { background: #0f172a; border: 1px solid #0284c7; border-radius: 12px; padding: 24px; max-width: 500px; margin: 40px auto; box-shadow: 0 0 25px rgba(2,132,199,0.3); }
    button { background: #06b6d4; color: #000; border: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 14px; margin-top: 16px; }
    button:hover { background: #22d3ee; }
  </style>
</head>
<body>
  <div class="box">
    <h1 style="color: #38bdf8;">Visualizador HTML Goli</h1>
    <p>Esta aplicación completa está ejecutándose en tiempo real en el sandbox.</p>
    <div id="status" style="font-size: 18px; margin: 16px 0; color: #4ade80;">Estado: Listo para interactuar</div>
    <button onclick="changeStatus()">Probar Interactividad</button>
  </div>
  <script>
    let clicks = 0;
    function changeStatus() {
      clicks++;
      document.getElementById('status').innerText = 'Clics registrados: ' + clicks + ' (Tiempo: ' + new Date().toLocaleTimeString() + ')';
      console.log('[SANDBOX LOG] Clic recibido:', clicks);
    }
  </script>
</body>
</html>`;

export default function App() {
  const [, startTransition] = useTransition();

  // Navigation tab
  const [activeTab, setActiveTab] = useState<MainNavTab>('chat');

  // Active HTML code for visualizer
  const [activeHtmlCode, setActiveHtmlCode] = useState<string>(DEFAULT_HTML_APP);

  // Engine Configuration
  const [params, setParams] = useState<EngineParams>({
    contextSize: 8192,
    threads: 8,
    gpuLayers: 32,
    quantization: 'Q4_K_M',
    temperature: 0.2,
    topP: 0.95,
  });

  const [currentMode] = useState<OperatingMode>('architecture');
  const [effortLevel, setEffortLevel] = useState<ModelEffortLevel>('high');
  const [inputPrompt, setInputPrompt] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [engineStatus, setEngineStatus] = useState<'READY' | 'INFERRING' | 'ABORTED'>('READY');
  const [isGenerating, setIsGenerating] = useState(false);
  const abortRef = useRef(false);
  const streamIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up any streaming interval on unmount
  useEffect(() => {
    return () => {
      if (streamIntervalRef.current) {
        clearInterval(streamIntervalRef.current);
      }
    };
  }, []);

  // Telemetry metrics
  const [metrics, setMetrics] = useState<TelemetryMetrics>(() => {
    const mem = calculateHardwareMemory({
      contextSize: 8192,
      threads: 8,
      gpuLayers: 32,
      quantization: 'Q4_K_M',
      temperature: 0.2,
      topP: 0.95,
    }, 0);
    return {
      totalTokens: 0,
      tokensPerSec: 0,
      hostRamMB: mem.hostRamMB,
      gpuVramMB: mem.gpuVramMB,
      timeToFirstTokenMs: 0,
      kvCacheTokens: 0,
      kvCacheMB: 0,
    };
  });

  // Chat messages
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString(),
      text: 'Hola, soy Goli. He sido entrenado para programar aplicaciones completas, compilar código en cualquier lenguaje y previsualizar aplicaciones web en tiempo real.',
      reasoningEffort: {
        level: 'high',
        thoughtTokens: 1120,
        thoughtSummary: [
          'Inicialización del kernel de compilación multi-lenguaje.',
          'Montaje del visualizador HTML interactivo con sandbox seguro.',
          'Directivas de programación de apps completas cargadas.',
          'Listo para generar arquitecturas y compilar en caliente.'
        ]
      },
      codeSnippet: DEFAULT_HTML_APP,
      language: 'HTML',
      complexity: {
        time: 'O(1)',
        space: 'O(1)',
      }
    }
  ]);

  const [auditResult, setAuditResult] = useState<CodeAuditResult>(() => {
    return auditSourceCode(messages[0].codeSnippet || '');
  });

  // Derived hardware memory & telemetry metrics calculated synchronously
  // Eliminates the setState in useEffect cycle that triggers "Maximum update depth exceeded"
  const mem = useMemo(
    () => calculateHardwareMemory(params, metrics.kvCacheTokens),
    [params, metrics.kvCacheTokens]
  );

  const fullMetrics: TelemetryMetrics = useMemo(
    () => ({
      ...metrics,
      hostRamMB: mem.hostRamMB,
      gpuVramMB: mem.gpuVramMB,
      kvCacheMB: mem.kvCacheMB,
    }),
    [metrics, mem]
  );

  const handleSelectChallenge = (key: string) => {
    const challenge = PRESET_CHALLENGES[key];
    if (!challenge) return;

    setInputPrompt(challenge.prompt);
    const audit = auditSourceCode(challenge.response.code);
    setAuditResult(audit);

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString(),
      text: challenge.prompt,
    };

    const assistantMsg: ChatMessage = {
      id: `asst_${Date.now() + 1}`,
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString(),
      text: challenge.response.overview,
      reasoningEffort: {
        level: effortLevel,
        thoughtTokens: 1420,
        thoughtSummary: [
          `Análisis profundo de la especificación técnica en ${challenge.language}.`,
          'Desacoplamiento de interfaces y verificación de principios SOLID.',
          'Generación de aplicación modular lista para producción.'
        ]
      },
      codeSnippet: challenge.response.code,
      language: challenge.language,
      complexity: challenge.response.complexity,
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setActiveTab('chat');
  };

  const handleResetSession = () => {
    if (streamIntervalRef.current) {
      clearInterval(streamIntervalRef.current);
      streamIntervalRef.current = null;
    }
    abortRef.current = true;
    setIsGenerating(false);
    setEngineStatus('READY');
    setInputPrompt('');
    setMessages([
      {
        id: 'reset_init',
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString(),
        text: 'Sesión reiniciada. Búferes de memoria KV y compilador listos.',
      }
    ]);
    setMetrics((prev) => ({
      ...prev,
      totalTokens: 0,
      tokensPerSec: 0,
      timeToFirstTokenMs: 0,
      kvCacheTokens: 0,
    }));
  };

  const handleCancelGeneration = () => {
    if (streamIntervalRef.current) {
      clearInterval(streamIntervalRef.current);
      streamIntervalRef.current = null;
    }
    abortRef.current = true;
    setIsGenerating(false);
    setEngineStatus('ABORTED');
  };

  const handleTriggerAudit = (code: string) => {
    const audit = auditSourceCode(code);
    setAuditResult(audit);
    setIsSettingsOpen(true);
  };

  const handleOpenInHtmlVisualizer = (html: string) => {
    setActiveHtmlCode(html);
    setActiveTab('visualizer');
  };

  const handleSendToChat = (prompt: string) => {
    setInputPrompt(prompt);
    setActiveTab('chat');
  };

  const handleSubmitInference = async () => {
    const prompt = inputPrompt.trim();
    if (!prompt || isGenerating) return;

    abortRef.current = false;
    setIsGenerating(true);
    setEngineStatus('INFERRING');

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString(),
      text: prompt,
    };

    const asstMsgId = `asst_${Date.now() + 1}`;
    let thoughtTokens = effortLevel === 'extreme' ? 2850 : effortLevel === 'high' ? 1450 : effortLevel === 'medium' ? 750 : 320;
    const reasoningEffort: ReasoningEffortData = {
      level: effortLevel,
      thoughtTokens,
      thoughtSummary: [
        'Análisis sintáctico y semántico del requerimiento completo.',
        'Diseño de arquitectura monolítica autónoma sin dependencias externas.',
        'Verificación asintótica y encapsulación de componentes interactivos.',
        'Listo para ejecución directa en el compilador o visualizador.'
      ],
    };

    const assistantMsg: ChatMessage = {
      id: asstMsgId,
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString(),
      text: '',
      codeSnippet: '',
      language: 'HTML',
      reasoningEffort,
      isStreaming: true,
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInputPrompt('');

    // Check if the user is asking for an HTML app, game, or web app
    const isHtmlRequest = prompt.toLowerCase().includes('app') || prompt.toLowerCase().includes('html') || prompt.toLowerCase().includes('juego') || prompt.toLowerCase().includes('web') || prompt.toLowerCase().includes('interfaz');

    let responseText = '';
    let responseCode = '';
    let lang = 'HTML';

    if (isHtmlRequest) {
      responseText = `[GOLI - APLICACIÓN COMPLETA GENERADA]\nHe diseñado la aplicación web completa solicitada. Puedes abrirla inmediatamente en la pestaña [VISUALIZADOR HTML] para interactuar con ella.`;
      responseCode = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>App: ${prompt.slice(0, 30)}</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #090d16; color: #f1f5f9; margin: 0; padding: 20px; display: flex; flex-direction: column; align-items: center; }
    .card { background: #131d33; border: 1px solid #1e293b; border-radius: 12px; padding: 24px; max-width: 600px; width: 100%; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    h2 { color: #38bdf8; margin-top: 0; }
    .btn { background: #0284c7; color: #fff; border: none; padding: 10px 18px; border-radius: 6px; font-weight: bold; cursor: pointer; transition: all 0.15s; }
    .btn:hover { background: #0369a1; }
    input { background: #060911; border: 1px solid #334155; color: #fff; padding: 8px 12px; border-radius: 6px; width: 70%; margin-right: 8px; }
    ul { list-style: none; padding: 0; margin-top: 16px; }
    li { background: #1e293b; padding: 10px 14px; border-radius: 6px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; }
  </style>
</head>
<body>
  <div class="card">
    <h2>Aplicación Interactiva Goli</h2>
    <p>Generada para: ${prompt.slice(0, 45)}...</p>
    <div style="display:flex; margin-top: 16px;">
      <input type="text" id="itemInput" placeholder="Escribe un elemento y presiona Agregar...">
      <button class="btn" onclick="addItem()">Agregar</button>
    </div>
    <ul id="itemList"></ul>
  </div>
  <script>
    const items = ['Módulo Inicial Configurado', 'Kernel CGo Reactivo'];
    function render() {
      const list = document.getElementById('itemList');
      list.innerHTML = items.map((it, idx) => \`<li><span>\${it}</span><button class="btn" style="background:#be123c; padding:4px 8px;" onclick="removeItem(\${idx})">X</button></li>\`).join('');
    }
    function addItem() {
      const input = document.getElementById('itemInput');
      if (input.value.trim()) { items.push(input.value.trim()); input.value = ''; render(); }
    }
    function removeItem(idx) { items.splice(idx, 1); render(); }
    render();
  </script>
</body>
</html>`;
      lang = 'HTML';
    } else {
      responseText = `[GOLI - ARQUITECTURA SENIOR GENERADA]\nHe generado la solución técnica optimizada para: "${prompt.slice(0, 40)}".`;
      responseCode = `// Goli Software Architecture
package main

import (
    "fmt"
    "sync"
)

func main() {
    var wg sync.WaitGroup
    wg.Add(1)
    go func() {
        defer wg.Done()
        fmt.Println("[GOLI] Tarea asincrona ejecutada de forma segura.")
    }()
    wg.Wait()
}`;
      lang = 'Go';
    }

    // Try calling server-side Gemini API endpoint
    try {
      const apiRes = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, effortLevel, mode: currentMode }),
      });

      if (apiRes.ok) {
        const data = await apiRes.json();
        if (data.text) {
          // If Gemini returned text
          responseText = `[GOLI AI - RESPUESTA GENERATIVA EN TIEMPO REAL]`;
          responseCode = data.text;
          if (responseCode.includes('<!DOCTYPE html>') || responseCode.includes('<html')) {
            lang = 'HTML';
          }
        }
      }
    } catch {
      // Offline fallback: use local high-performance template
    }

    // High velocity token streaming simulation
    const startTime = performance.now();
    let firstTokenRecorded = false;
    const tokens = responseCode.split(/(\s+|\n|[;,{}()])/).filter(Boolean);
    let tokenIndex = 0;
    let accumulatedCode = '';

    if (streamIntervalRef.current) {
      clearInterval(streamIntervalRef.current);
      streamIntervalRef.current = null;
    }

    streamIntervalRef.current = setInterval(() => {
      if (abortRef.current || tokenIndex >= tokens.length) {
        if (streamIntervalRef.current) {
          clearInterval(streamIntervalRef.current);
          streamIntervalRef.current = null;
        }
        setIsGenerating(false);
        setEngineStatus(abortRef.current ? 'ABORTED' : 'READY');

        if (lang === 'HTML') {
          setActiveHtmlCode(responseCode);
        }

        const finalAudit = auditSourceCode(responseCode);
        setAuditResult(finalAudit);

        startTransition(() => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === asstMsgId
                ? {
                    ...m,
                    text: responseText,
                    codeSnippet: accumulatedCode,
                    language: lang,
                    isStreaming: false,
                    complexity: {
                      time: finalAudit.timeComplexity,
                      space: finalAudit.spaceComplexity,
                    },
                  }
                : m
            )
          );
        });
        return;
      }

      if (!firstTokenRecorded) {
        firstTokenRecorded = true;
        const ttft = performance.now() - startTime;
        setMetrics((prev) => ({
          ...prev,
          timeToFirstTokenMs: Number(ttft.toFixed(1)),
        }));
      }

      accumulatedCode += tokens[tokenIndex];
      tokenIndex++;

      const elapsedMs = performance.now() - startTime;
      const tps = calculateTPS(tokenIndex, elapsedMs);

      setMetrics((prev) => ({
        ...prev,
        totalTokens: prev.totalTokens + 1,
        tokensPerSec: tps,
        kvCacheTokens: prev.kvCacheTokens + 1,
      }));

      setMessages((prev) =>
        prev.map((m) =>
          m.id === asstMsgId
            ? {
                ...m,
                text: responseText,
                codeSnippet: accumulatedCode,
                language: lang,
              }
            : m
        )
      );
    }, 14);
  };

  const handleExportReport = () => {
    const reportContent = [
      '# Goli - Reporte Técnico de Arquitectura y Compilación',
      `Fecha: ${new Date().toISOString()}`,
      `Esfuerzo del Modelo: ${effortLevel.toUpperCase()}`,
      '',
      '## Historial de Mensajes y Código',
      ...messages.map((m) => {
        let b = `### ${m.sender.toUpperCase()} - ${m.timestamp}\n\n${m.text || ''}\n`;
        if (m.codeSnippet) {
          b += `\n\`\`\`${m.language || 'text'}\n${m.codeSnippet}\n\`\`\`\n`;
        }
        return b;
      }),
    ].join('\n');

    const blob = new Blob([reportContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `goli-report-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleApplyRefactor = (refactoredCode: string) => {
    setInputPrompt(refactoredCode);
    const audit = auditSourceCode(refactoredCode);
    setAuditResult(audit);
    setIsSettingsOpen(false);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#070b14] text-slate-100 overflow-hidden font-sans">
      {/* Minimalist Top Header */}
      <HeaderTelemetry
        metrics={fullMetrics}
        status={engineStatus}
        effortLevel={effortLevel}
        activeNavTab={activeTab}
        onSelectNavTab={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onResetSession={handleResetSession}
        hasHtmlCode={!!activeHtmlCode}
      />

      {/* Main Workspace based on Active Tab */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === 'chat' && (
          <ChatStream
            messages={messages}
            currentMode={currentMode}
            inputPrompt={inputPrompt}
            onChangeInput={setInputPrompt}
            onSubmit={handleSubmitInference}
            onCancel={handleCancelGeneration}
            onClear={handleResetSession}
            isGenerating={isGenerating}
            effortLevel={effortLevel}
            onChangeEffortLevel={setEffortLevel}
            onTriggerAudit={handleTriggerAudit}
          />
        )}

        {activeTab === 'visualizer' && (
          <div className="flex-1 p-3 overflow-hidden">
            <HtmlVisualizer
              htmlCode={activeHtmlCode}
              onUpdateCode={setActiveHtmlCode}
            />
          </div>
        )}

        {activeTab === 'compiler' && (
          <CompilerPlayground
            onOpenInHtmlVisualizer={handleOpenInHtmlVisualizer}
          />
        )}

        {activeTab === 'training' && (
          <ModelTrainingView
            onLoadAppIntoVisualizer={handleOpenInHtmlVisualizer}
            onSendToChat={handleSendToChat}
          />
        )}
      </div>

      {/* Settings Modal (Hardware Sliders, CGo Telemetry, Code Audit, Sources) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        params={params}
        onChangeParams={setParams}
        metrics={fullMetrics}
        auditResult={auditResult}
        onSelectChallenge={handleSelectChallenge}
        onExportReport={handleExportReport}
        onApplyRefactor={handleApplyRefactor}
      />
    </div>
  );
}
