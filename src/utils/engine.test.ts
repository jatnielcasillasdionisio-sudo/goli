import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateHardwareMemory, calculateTPS } from './telemetry';
import { auditSourceCode, detectLanguage } from './codeAudit';

test('calculateHardwareMemory allocates VRAM according to GPU layers', () => {
  const params = {
    contextSize: 8192,
    threads: 8,
    gpuLayers: 33, // 100% offloaded
    quantization: 'Q4_K_M' as const,
    temperature: 0.2,
    topP: 0.95,
  };

  const mem = calculateHardwareMemory(params, 1024);
  assert.ok(mem.gpuVramMB > 4000, 'GPU VRAM should hold full model base in 100% offload');
  assert.ok(mem.hostRamMB > 0, 'Host RAM covers Go runtime and buffers');
});

test('calculateTPS computes accurate throughput', () => {
  const tps = calculateTPS(100, 2000); // 100 tokens in 2 seconds
  assert.equal(tps, 50.0);
  assert.equal(calculateTPS(0, 1000), 0);
});

test('detectLanguage detects languages accurately', () => {
  assert.equal(detectLanguage('package main\nimport "fmt"'), 'Go');
  assert.equal(detectLanguage('#include <iostream>\nstd::cout'), 'C++');
  assert.equal(detectLanguage('fn main() {\n    let mut x = 5;\n}'), 'Rust');
  assert.equal(detectLanguage('interface UserConfig {\n  name: string;\n}'), 'TypeScript');
});

test('auditSourceCode catches unsafe pointers in C++', () => {
  const riskyCpp = `
    #include <iostream>
    void process() {
        int* data = (int*)malloc(1024);
        // missing free
    }
  `;
  const result = auditSourceCode(riskyCpp);
  assert.equal(result.language, 'C++');
  const foundAlloc = result.findings.some(f => f.id === 'raw-allocation');
  assert.equal(foundAlloc, true, 'Should flag raw malloc in C++');
  assert.ok(result.score < 100, 'Score should be penalized for raw allocation');
});

test('auditSourceCode gives high score to modern safe Go code', () => {
  const safeGo = `
    package engine
    import (
      "context"
      "sync"
    )
    type Pool struct {
      mu sync.RWMutex
      pool sync.Pool
    }
    func NewEngine(ctx context.Context) *Pool {
      return &Pool{}
    }
  `;
  const result = auditSourceCode(safeGo);
  assert.equal(result.language, 'Go');
  assert.ok(result.score >= 90, 'Clean code should score >= 90');
  assert.ok(result.patternsDetected.includes('Thread-Safe Synchronization'));
});
