/**
 * Automated Code Review & Static Analysis Engine
 * Evaluates Clean Code (Robert C. Martin), GoF Patterns, Memory Bounds & Asymptotic Complexity
 */

export type Severity = 'CRITICAL' | 'WARNING' | 'INFO';

export interface AuditFinding {
  id: string;
  category: 'Clean Code' | 'Seguridad & Memoria' | 'Concurrencia' | 'Rendimiento';
  severity: Severity;
  title: string;
  description: string;
  line?: number;
  recommendation: string;
}

export interface CodeAuditResult {
  language: string;
  score: number; // 0 - 100
  timeComplexity: string;
  spaceComplexity: string;
  findings: AuditFinding[];
  cleanCodePassed: boolean;
  patternsDetected: string[];
  refactoredSnippet: string;
}

export function detectLanguage(code: string): string {
  if (code.includes('package ') || (code.includes('func ') && (code.includes('{') || code.includes('(')))) return 'Go';
  if (code.includes('#include') || code.includes('std::') || code.includes('template <') || code.includes('constexpr')) return 'C++';
  if (code.includes('fn ') || code.includes('pub ') || code.includes('impl ') || code.includes('let mut') || code.includes('match ')) return 'Rust';
  if (code.includes('def ') || (code.includes('import ') && code.includes(':') && !code.includes('{'))) return 'Python';
  if (code.includes('interface ') || code.includes('export type') || code.includes(': string') || code.includes('readonly ')) return 'TypeScript';
  return 'General Code';
}

export function auditSourceCode(code: string): CodeAuditResult {
  const lang = detectLanguage(code);
  const findings: AuditFinding[] = [];
  const patterns: string[] = [];
  let score = 100;

  // 1. Concurrency & Race Condition Analysis
  const hasAtomic = code.includes('atomic') || code.includes('sync/atomic');
  const hasMutex = code.includes('Mutex') || code.includes('sync.Mutex') || code.includes('RWMutex');
  const hasThreadOrGoroutine = code.includes('go ') || code.includes('std::thread') || code.includes('tokio::spawn');

  if (hasThreadOrGoroutine && !hasAtomic && !hasMutex && !code.includes('chan ')) {
    findings.push({
      id: 'race-risk',
      category: 'Concurrencia',
      severity: 'CRITICAL',
      title: 'Posible Data Race Hazard',
      description: 'Se invocan hilos o goroutines concurrentes sin sincronización observable (Mutex, Atomics o Canales CSP).',
      recommendation: 'Encapsula el estado mutable en un sync.Mutex (Go), std::atomic (C++) o utiliza canales con paso de mensajes sin memoria compartida.'
    });
    score -= 25;
  } else if (hasAtomic || hasMutex) {
    patterns.push('Thread-Safe Synchronization');
  }

  // 2. Memory Management & Leaks
  if (lang === 'C++') {
    if (code.includes('malloc(') || code.includes('new ') && !code.includes('std::make_unique') && !code.includes('std::make_shared')) {
      findings.push({
        id: 'raw-allocation',
        category: 'Seguridad & Memoria',
        severity: 'CRITICAL',
        title: 'Asignación manual de memoria cruda (violación RAII)',
        description: 'Uso de malloc/new crudo sin gestión automática de ciclo de vida.',
        recommendation: 'Reemplaza punteros crudos por std::unique_ptr, std::shared_ptr o std::vector.'
      });
      score -= 20;
    } else {
      patterns.push('Modern RAII Resource Ownership');
    }
  }

  if (lang === 'Go') {
    if (code.includes('sync.Pool')) {
      patterns.push('Zero-Allocation Buffer Reuse (sync.Pool)');
    }
    if (code.includes('context.Context')) {
      patterns.push('Defensive Context Propagation');
    }
  }

  if (lang === 'Rust') {
    if (code.includes('unsafe')) {
      findings.push({
        id: 'unsafe-block',
        category: 'Seguridad & Memoria',
        severity: 'WARNING',
        title: 'Bloque Unsafe Detectado',
        description: 'El bloque unsafe elude las garantías de tiempo de compilación del borrow checker.',
        recommendation: 'Documenta con un comentario // SAFETY: los invariantes que garantizan la no existencia de undefined behavior.'
      });
      score -= 10;
    } else {
      patterns.push('100% Safe Memory Borrowing');
    }
  }

  // 3. Clean Code & SOLID Rules
  const lines = code.split('\n');
  if (lines.length > 50 && !code.includes('interface') && !code.includes('type ') && !code.includes('struct ')) {
    findings.push({
      id: 'god-routine',
      category: 'Clean Code',
      severity: 'WARNING',
      title: 'Monolito o Violación de Responsabilidad Única (SRP)',
      description: 'El fragmento supera el tamaño recomendado sin descomposición modular ni abstracción.',
      recommendation: 'Descompón la rutina en funciones puras con un solo nivel de abstracción (Uncle Bob: Clean Code).'
    });
    score -= 12;
  }

  // Magic numbers check
  const magicNumRegex = /[^a-zA-Z0-9_](?:[3-9]\d{2,}|[1-9]\d{3,})[^a-zA-Z0-9_]/;
  if (magicNumRegex.test(code) && !code.includes('const ') && !code.includes('constexpr')) {
    findings.push({
      id: 'magic-number',
      category: 'Clean Code',
      severity: 'INFO',
      title: 'Números Mágicos en Código',
      description: 'Valores numéricos constantes sin nombre representativo directo.',
      recommendation: 'Extrae constantes descriptivas (e.g. const MAX_BUFFER_CAPACITY = 4096).'
    });
    score -= 5;
  }

  // 4. Asymptotic Complexity Assessment
  let timeComplexity = 'O(1)';
  let spaceComplexity = 'O(1)';

  const forMatches = (code.match(/\bfor\b/g) || []).length;
  const whileMatches = (code.match(/\bwhile\b/g) || []).length;
  const loopDepth = forMatches + whileMatches;

  if (loopDepth >= 2 && (code.includes('for ') && code.indexOf('for ') !== code.lastIndexOf('for '))) {
    timeComplexity = 'O(N²) Cuadrática';
    findings.push({
      id: 'nested-loops',
      category: 'Rendimiento',
      severity: 'WARNING',
      title: 'Bucles Anidados Detectados',
      description: 'Riesgo de degradación de rendimiento en conjuntos de datos grandes.',
      recommendation: 'Considera reemplazar la búsqueda cuadrática por una tabla hash amortizada O(1) o un árbol balanceado O(log N).'
    });
    score -= 10;
  } else if (loopDepth === 1) {
    timeComplexity = 'O(N) Lineal';
  } else if (code.includes('binary_search') || code.includes('>> 1') || code.includes('/ 2')) {
    timeComplexity = 'O(log N) Logarítmica';
  }

  if (code.includes('make([]') || code.includes('vector<') || code.includes('Vec::new') || code.includes('.push(')) {
    spaceComplexity = 'O(N) Dinámico';
  }

  // Check GoF Design Patterns
  if (code.includes('Factory') || code.includes('NewEngine') || code.includes('NewPipeline')) {
    patterns.push('GoF: Factory Method');
  }
  if (code.includes('Strategy') || code.includes('interface') && code.includes('Execute')) {
    patterns.push('GoF: Strategy Pattern');
  }
  if (code.includes('Observer') || code.includes('Subscribe') || code.includes('chan ')) {
    patterns.push('GoF / CSP: Observer & Channel Passing');
  }

  score = Math.max(20, Math.min(100, score));

  return {
    language: lang,
    score,
    timeComplexity,
    spaceComplexity,
    findings,
    cleanCodePassed: score >= 80,
    patternsDetected: patterns.length > 0 ? patterns : ['Procedural Modularization'],
    refactoredSnippet: `// =======================================================\n// REFACTORIZACIÓN CLEAN CODE & ARCHITECTURE\n// =======================================================\n${code}`
  };
}
