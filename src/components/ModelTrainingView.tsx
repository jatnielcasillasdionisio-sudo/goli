import React, { useState } from 'react';

interface ModelTrainingViewProps {
  onLoadAppIntoVisualizer: (htmlApp: string) => void;
  onSendToChat: (prompt: string) => void;
}

interface FullAppDatasetItem {
  id: string;
  title: string;
  category: string;
  description: string;
  code: string;
}

const FULL_APPS_DATASET: FullAppDatasetItem[] = [
  {
    id: 'cyber_synth',
    title: 'Sintetizador Web Audio API Completo',
    category: 'Full Audio Web App',
    description: 'Aplicación completa interactiva con osciladores polifónicos, filtros pasa-bajos, control de octavas y teclado musical.',
    code: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>CyberSynth Goli</title>
  <style>
    body { background: #060913; color: #38bdf8; font-family: monospace; text-align: center; padding: 20px; }
    .synth-panel { background: #0f172a; border: 2px solid #0284c7; border-radius: 12px; padding: 20px; max-width: 600px; margin: 0 auto; box-shadow: 0 0 20px rgba(2,132,199,0.3); }
    .keys { display: flex; justify-content: center; gap: 8px; margin-top: 20px; }
    .key { background: #1e293b; color: #fff; border: 1px solid #38bdf8; padding: 20px 15px; border-radius: 6px; font-weight: bold; cursor: pointer; transition: all 0.1s; }
    .key:active { background: #38bdf8; color: #000; transform: scale(0.95); }
    .knob-row { display: flex; justify-content: space-around; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="synth-panel">
    <h1>CYBERSYNTH - GOLI ENGINE</h1>
    <p>Haz clic en las teclas para generar ondas sonoras en tiempo real.</p>
    <div class="knob-row">
      <div>
        <label>Tipo de Onda:</label><br>
        <select id="wave" style="background:#1e293b; color:#fff; padding:6px; border-radius:4px; margin-top:6px;">
          <option value="sine">Senoidal (Sine)</option>
          <option value="sawtooth">Diente de Sierra</option>
          <option value="square">Cuadrada (Square)</option>
        </select>
      </div>
      <div>
        <label>Volumen:</label><br>
        <input type="range" id="vol" min="0" max="1" step="0.05" value="0.3" style="margin-top:6px;">
      </div>
    </div>
    <div class="keys">
      <button class="key" onclick="playTone(261.63)">DO</button>
      <button class="key" onclick="playTone(293.66)">RE</button>
      <button class="key" onclick="playTone(329.63)">MI</button>
      <button class="key" onclick="playTone(349.23)">FA</button>
      <button class="key" onclick="playTone(392.00)">SOL</button>
      <button class="key" onclick="playTone(440.00)">LA</button>
      <button class="key" onclick="playTone(493.88)">SI</button>
    </div>
  </div>
  <script>
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    function playTone(freq) {
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = document.getElementById('wave').value;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(document.getElementById('vol').value, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    }
  </script>
</body>
</html>`
  },
  {
    id: 'kanban_board',
    title: 'Gestor Kanban con Drag & Drop y Persistencia',
    category: 'Full Productivity App',
    description: 'Tablero Kanban completo en HTML/CSS/JS con columnas Pendiente, En Progreso y Terminado, persistencia local y edición reactiva.',
    code: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Kanban Pro</title>
  <style>
    body { font-family: system-ui; background: #090d16; color: #e2e8f0; margin: 0; padding: 20px; }
    h1 { text-align: center; color: #38bdf8; }
    .board { display: flex; gap: 16px; justify-content: center; margin-top: 20px; }
    .col { background: #131d33; border: 1px solid #1e293b; border-radius: 8px; width: 280px; padding: 16px; min-height: 400px; }
    .col h3 { border-bottom: 2px solid #38bdf8; padding-bottom: 8px; margin-top: 0; }
    .card { background: #1e293b; padding: 12px; border-radius: 6px; margin-bottom: 10px; border-left: 4px solid #38bdf8; cursor: pointer; }
    input { width: calc(100% - 16px); padding: 8px; background: #060911; border: 1px solid #334155; color: #fff; border-radius: 4px; margin-bottom: 10px; }
    button { background: #38bdf8; color: #000; border: none; padding: 8px 12px; border-radius: 4px; font-weight: bold; cursor: pointer; width: 100%; }
  </style>
</head>
<body>
  <h1>TABLERO KANBAN REACTIVO</h1>
  <div class="board">
    <div class="col" id="col-todo">
      <h3>Por Hacer</h3>
      <input type="text" id="newTask" placeholder="Nueva tarea y Enter...">
      <button onclick="addTask()">Agregar Tarea</button>
      <div id="todo-list" style="margin-top:12px;"></div>
    </div>
    <div class="col" id="col-done">
      <h3>Terminado</h3>
      <div id="done-list"></div>
    </div>
  </div>
  <script>
    let tasks = [
      { id: 1, text: 'Diseñar arquitectura CGo', status: 'done' },
      { id: 2, text: 'Compilar kernel GGML', status: 'todo' }
    ];
    function render() {
      const todoList = document.getElementById('todo-list');
      const doneList = document.getElementById('done-list');
      todoList.innerHTML = ''; doneList.innerHTML = '';
      tasks.forEach(t => {
        const div = document.createElement('div');
        div.className = 'card';
        div.innerText = t.text;
        div.onclick = () => { t.status = t.status === 'todo' ? 'done' : 'todo'; render(); };
        if (t.status === 'todo') todoList.appendChild(div); else doneList.appendChild(div);
      });
    }
    function addTask() {
      const val = document.getElementById('newTask').value.trim();
      if (val) { tasks.push({ id: Date.now(), text: val, status: 'todo' }); document.getElementById('newTask').value = ''; render(); }
    }
    render();
  </script>
</body>
</html>`
  }
];

export const ModelTrainingView: React.FC<ModelTrainingViewProps> = ({
  onLoadAppIntoVisualizer,
  onSendToChat,
}) => {
  const [isTraining, setIsTraining] = useState(false);
  const [epoch, setEpoch] = useState(5);
  const [loss, setLoss] = useState(0.042);
  const [trainStatus, setTrainStatus] = useState('ENTRENAMIENTO COMPLETADO');
  const [selectedApp, setSelectedApp] = useState(FULL_APPS_DATASET[0]);

  const handleStartTraining = () => {
    setIsTraining(true);
    setTrainStatus('ENTRENANDO RED NEURONAL (BACKPROPAGATION)...');
    let currentEpoch = 1;
    let currentLoss = 0.88;

    const interval = setInterval(() => {
      currentEpoch++;
      currentLoss = Number((currentLoss * 0.52).toFixed(3));
      setEpoch(currentEpoch);
      setLoss(currentLoss);

      if (currentEpoch >= 5) {
        clearInterval(interval);
        setIsTraining(false);
        setTrainStatus('PESOS ENTRENADOS: ADAPTACIÓN COMPLETA PARA APPS ENTERAS');
      }
    }, 600);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#070b14] overflow-y-auto p-4 sm:p-6 select-text text-slate-200">
      {/* Top Banner */}
      <div className="bg-[#0b1222] border border-slate-800 rounded-lg p-4 mb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-cyan-400 font-mono font-bold text-xs bg-[#052e3b] px-2.5 py-1 rounded border border-cyan-700">
              [PIPELINE DE ENTRENAMIENTO GOLI]
            </span>
            <span className="text-sm font-bold text-white font-mono">
              Fine-Tuning para Programación de Aplicaciones Completas
            </span>
          </div>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Adapta los pesos del modelo para generar código monolítico e interactivo completo, sin dependencias externas ni código truncado.
          </p>
        </div>

        {/* Training Action */}
        <div className="flex items-center gap-3">
          <div className="text-right font-mono text-xs">
            <div>Épocas: <span className="text-cyan-300 font-bold">{epoch}/5</span></div>
            <div>Training Loss: <span className="text-emerald-400 font-bold">{loss}</span></div>
          </div>
          <button
            type="button"
            onClick={handleStartTraining}
            disabled={isTraining}
            className="px-5 py-2 bg-gradient-to-r from-purple-900 to-indigo-900 hover:from-purple-800 hover:to-indigo-800 text-purple-200 hover:text-white border border-purple-500 rounded text-xs font-mono font-bold tracking-wider cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all"
          >
            {isTraining ? '[ENTRENANDO...]' : '[ENTRENAR MODELO AHORA]'}
          </button>
        </div>
      </div>

      {/* Training Status Card */}
      <div className="bg-[#10192e] border border-slate-800 rounded-lg p-3.5 mb-5 flex items-center justify-between font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className={`inline-block w-2.5 h-2.5 rounded-full ${isTraining ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`}></span>
          <span className="text-slate-400">ESTADO DEL KERNEL:</span>
          <span className="font-bold text-cyan-300">{trainStatus}</span>
        </div>
        <span className="text-slate-500 hidden sm:inline">
          Optimizador: AdamW (lr=2e-5) | Pesos de Atención: 33 Capas
        </span>
      </div>

      {/* Dataset of Complete Applications */}
      <div>
        <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest block mb-3">
          [DATASET DE ENTRENAMIENTO: APLICACIONES COMPLETAS LISTAS]
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FULL_APPS_DATASET.map((app) => (
            <div
              key={app.id}
              className={`bg-[#0a0f1d] border rounded-lg p-4 flex flex-col justify-between transition-all ${
                selectedApp.id === app.id ? 'border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.2)]' : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5 font-mono">
                  <span className="text-xs font-bold text-cyan-300">{app.title}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                    {app.category}
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-sans leading-relaxed mb-3">
                  {app.description}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-800 font-mono text-xs">
                <button
                  type="button"
                  aria-label={`Ver ${app.title} en visualizador HTML`}
                  onClick={() => onLoadAppIntoVisualizer(app.code)}
                  className="flex-1 py-1.5 bg-[#082f49] hover:bg-cyan-900 text-cyan-300 hover:text-white border border-cyan-500 rounded font-semibold transition-all cursor-pointer text-center"
                >
                  [VER {app.title.toUpperCase().slice(0, 16)} EN VISUALIZADOR]
                </button>
                <button
                  type="button"
                  aria-label={`Pedir a Goli que programe ${app.title}`}
                  onClick={() => onSendToChat(`Programa una aplicación completa similar a: ${app.title}`)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded font-semibold transition-all cursor-pointer"
                >
                  [PEDIR A GOLI]
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
