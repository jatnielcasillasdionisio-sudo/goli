/**
 * Telemetry and hardware memory calculations for local inference
 */

export interface EngineParams {
  contextSize: number;       // e.g. 2048, 4096, 8192, 16384, 32768
  threads: number;           // CPU cores
  gpuLayers: number;         // 0 to 48
  quantization: 'Q4_K_M' | 'Q5_K_M' | 'Q8_0' | 'F16';
  temperature: number;
  topP: number;
}

export interface TelemetryMetrics {
  totalTokens: number;
  tokensPerSec: number;
  hostRamMB: number;
  gpuVramMB: number;
  timeToFirstTokenMs: number;
  kvCacheTokens: number;
  kvCacheMB: number;
}

const QUANT_BASE_SIZES_MB: Record<EngineParams['quantization'], number> = {
  'Q4_K_M': 4200,
  'Q5_K_M': 5100,
  'Q8_0': 7600,
  'F16': 14200,
};

const TOTAL_MODEL_LAYERS = 33;

/**
 * Calculates estimated VRAM and host RAM requirements
 */
export function calculateHardwareMemory(params: EngineParams, activeTokens: number = 0): { hostRamMB: number; gpuVramMB: number; kvCacheMB: number } {
  const baseSize = QUANT_BASE_SIZES_MB[params.quantization] || 4200;
  // KV Cache: ~1.2 MB per 1,024 context tokens in Q4
  const kvCacheTotalMB = Math.round((params.contextSize / 1024) * 1.25);
  const totalModelAndCache = baseSize + kvCacheTotalMB;

  const gpuRatio = Math.min(1.0, Math.max(0, params.gpuLayers / TOTAL_MODEL_LAYERS));
  const gpuVramMB = Math.round(totalModelAndCache * gpuRatio);
  
  // Host RAM holds non-offloaded layers + Go runtime + CGo thread buffers
  const nonOffloadedModel = Math.round(totalModelAndCache * (1.0 - gpuRatio));
  const goRuntimeOverhead = 256 + (params.threads * 16);
  const hostRamMB = nonOffloadedModel + goRuntimeOverhead;

  const kvCacheCurrentMB = Math.round((activeTokens / 1024) * 1.25);

  return {
    hostRamMB,
    gpuVramMB,
    kvCacheMB: kvCacheCurrentMB,
  };
}

/**
 * Calculates throughput in tokens per second
 */
export function calculateTPS(tokenCount: number, elapsedMs: number): number {
  if (elapsedMs <= 0 || tokenCount <= 0) return 0;
  const seconds = elapsedMs / 1000;
  return Number((tokenCount / seconds).toFixed(1));
}
