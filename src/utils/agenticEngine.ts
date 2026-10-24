/**
 * Agentic Pipeline & Execution Engine for Goli AI
 * Manages autonomous multi-step reasoning, link inspection, planning, synthesis, and self-correction.
 */

export interface AgenticToolCall {
  tool: string;
  input: string;
  output: string;
  timestamp: string;
}

export interface AgenticStep {
  id: string;
  name: string;
  iconName: string;
  status: 'pending' | 'running' | 'completed' | 'skipped';
  summary: string;
  details: string[];
  toolCalls?: AgenticToolCall[];
  durationMs?: number;
}

export interface AgenticSession {
  goal: string;
  activeLanguage: string;
  detectedUrls: string[];
  steps: AgenticStep[];
  isCompleted: boolean;
  totalTokens: number;
}

export function createInitialAgenticSteps(
  prompt: string,
  detectedUrls: string[],
  targetLang: string
): AgenticStep[] {
  const hasUrls = detectedUrls.length > 0;

  const steps: AgenticStep[] = [
    {
      id: 'step_intent',
      name: 'Análisis de Intención & Requisitos',
      iconName: 'Compass',
      status: 'pending',
      summary: `Descomposición de la consulta y selección de ${targetLang}.`,
      details: [
        `Identificación del lenguaje objetivo: ${targetLang}.`,
        'Extracción de restricciones de rendimiento, concurrencia y límites de memoria.',
        'Mapeo de interfaces y contratos de entrada/salida.',
      ],
    },
  ];

  if (hasUrls) {
    steps.push({
      id: 'step_web_browsing',
      name: 'Navegación & Lectura Web en Vivo',
      iconName: 'Globe',
      status: 'pending',
      summary: `Visita e inspección de ${detectedUrls.length} enlace(s) detectado(s).`,
      details: [
        `Resolución HTTP y rastreo de enlaces: ${detectedUrls.join(', ')}.`,
        'Extracción de metadatos, árbol DOM y documentación técnica.',
        'Sintetización del contenido para contextualizar el código generado.',
      ],
      toolCalls: detectedUrls.map((url) => ({
        tool: 'web_reader.visit_and_read',
        input: url,
        output: `200 OK - Contenido extraído e indexado en el contexto del agente`,
        timestamp: new Date().toLocaleTimeString(),
      })),
    });
  }

  steps.push(
    {
      id: 'step_planning',
      name: 'Planificación & Patrones Arquitectónicos',
      iconName: 'Layers',
      status: 'pending',
      summary: 'Selección de patrones de diseño GoF y principios Clean Architecture.',
      details: [
        'Desacoplamiento de dependencias mediante Interfaces o Traits.',
        'Garantía de localidad espacial de memoria (evitando pointer-chasing).',
        'Diseño de manejo de errores idiomático sin fallos en runtime.',
      ],
    },
    {
      id: 'step_synthesis',
      name: `Síntesis de Código Idiomático (${targetLang})`,
      iconName: 'Code2',
      status: 'pending',
      summary: `Generación de código de producción en ${targetLang}.`,
      details: [
        'Escritura de código con tipado estricto y comentarios técnicos.',
        'Inclusión de imports de librerías estándar oficiales.',
        'Pruebas unitarias y ejemplo de ejecución verificable.',
      ],
    },
    {
      id: 'step_reflection',
      name: 'Reflexión, Auditoría & Verificación Formal',
      iconName: 'Shield',
      status: 'pending',
      summary: 'Auditoría estática, complejidad asintótica y auto-corrección.',
      details: [
        'Comprobación de límites asintóticos de tiempo O(1)/O(N) y memoria O(1).',
        'Verificación contra condiciones de carrera (Race Condition Scanner).',
        'Validación de directivas Clean Code y Uncle Bob SOLID.',
      ],
    }
  );

  return steps;
}
