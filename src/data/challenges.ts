export interface ChallengePreset {
  id: string;
  name: string;
  language: string;
  prompt: string;
  response: {
    overview: string;
    code: string;
    complexity: {
      time: string;
      space: string;
    };
  };
}

export const PRESET_CHALLENGES: Record<string, ChallengePreset> = {
  cpp_ringbuffer: {
    id: 'cpp_ringbuffer',
    name: '[C++] Lock-Free SPSC Ring Buffer',
    language: 'C++',
    prompt: 'Diseña un Single-Producer Single-Consumer (SPSC) Ring Buffer libre de bloqueos en C++20 con alineación a línea de caché (64 bytes) para evitar false sharing y barreras de memoria std::memory_order_acquire/release.',
    response: {
      overview: 'Implementación industrial de un búfer circular lock-free de alto rendimiento. Se utiliza memoria contiguous con tamaño potencia de dos para reemplazar el operador módulo (%) por una operación bitwise AND (&). Los punteros head y tail se aíslan en líneas de caché independientes (alignas(64)) para erradicar el fenómeno de false sharing entre núcleos de CPU.',
      code: `// Lock-Free Single-Producer Single-Consumer (SPSC) Ring Buffer en C++20
// Principios: Zero-allocation en hot-path, cache-line alignment, std::memory_order

#include <atomic>
#include <cstddef>
#include <new>
#include <span>
#include <utility>

template <typename T, size_t Capacity>
class LockFreeSPSCQueue {
    static_assert((Capacity & (Capacity - 1)) == 0, "Capacity must be a power of two");

    // Head (leído por Consumer, actualizado por Consumer)
    alignas(64) std::atomic<size_t> head_{0};

    // Tail (leído por Producer, actualizado por Producer)
    alignas(64) std::atomic<size_t> tail_{0};

    // Búfer preasignado en memoria contigua
    alignas(64) T buffer_[Capacity];

public:
    LockFreeSPSCQueue() = default;
    ~LockFreeSPSCQueue() = default;

    // Prohibir copia para preservar semántica de propiedad única
    LockFreeSPSCQueue(const LockFreeSPSCQueue&) = delete;
    LockFreeSPSCQueue& operator=(const LockFreeSPSCQueue&) = delete;

    // Enqueue: Solo invocado por el hilo Producer
    template <typename... Args>
    bool emplace(Args&&... args) noexcept {
        const size_t current_tail = tail_.load(std::memory_order_relaxed);
        const size_t current_head = head_.load(std::memory_order_acquire);

        if (current_tail - current_head >= Capacity) {
            return false; // Cola llena: backpressure determinista sin bloqueo
        }

        buffer_[current_tail & (Capacity - 1)] = T(std::forward<Args>(args)...);
        tail_.store(current_tail + 1, std::memory_order_release);
        return true;
    }

    // Dequeue: Solo invocado por el hilo Consumer
    bool pop(T& item) noexcept {
        const size_t current_head = head_.load(std::memory_order_relaxed);
        const size_t current_tail = tail_.load(std::memory_order_acquire);

        if (current_head == current_tail) {
            return false; // Cola vacía
        }

        item = std::move(buffer_[current_head & (Capacity - 1)]);
        head_.store(current_head + 1, std::memory_order_release);
        return true;
    }

    [[nodiscard]] size_t size() const noexcept {
        const size_t t = tail_.load(std::memory_order_relaxed);
        const size_t h = head_.load(std::memory_order_relaxed);
        return (t >= h) ? (t - h) : 0;
    }
};`,
      complexity: {
        time: 'O(1) Wait-Free',
        space: 'O(Capacity) Preallocated',
      }
    }
  },
  go_zerocopy: {
    id: 'go_zerocopy',
    name: '[GO] Zero-Copy WebSocket Parser',
    language: 'Go',
    prompt: 'Implementa un decodificador de tramas binarias de red en Go con cero alocaciones en el heap mediante sync.Pool, ordenamiento de campos de struct para mitigar padding y manejo de errores estricto.',
    response: {
      overview: 'Diseño conforme a las reglas de Clean Architecture y Go Performance. La estructura FrameHeader ordena sus campos de 64/32/16/8 bits en orden decreciente para minimizar el overhead de padding del compilador (escape analysis). Se usa sync.Pool para reciclar descriptores de tramas y evitar presión sobre el Garbage Collector.',
      code: `// Zero-Copy Frame Header Parsing en Go
// Principios: Struct padding optimization, sync.Pool reuse, error boundaries

package network

import (
	"encoding/binary"
	"errors"
	"sync"
)

var (
	ErrBufferUnderflow = errors.New("frame: payload underflow, minimum 8 bytes required")
	ErrInvalidOpcode   = errors.New("frame: unsupported protocol opcode")
)

// FrameHeader alineado a múltiplos de 8 bytes para eliminar padding residual
type FrameHeader struct {
	Timestamp int64  // 8 bytes (offset 0)
	PayloadLen uint32 // 4 bytes (offset 8)
	SequenceID uint16 // 2 bytes (offset 12)
	OpCode     uint8  // 1 byte  (offset 14)
	Flags      uint8  // 1 byte  (offset 15) -> Total: 16 bytes perfectos
}

var headerPool = sync.Pool{
	New: func() any {
		return new(FrameHeader)
	},
}

// AcquireHeader obtiene una instancia reciclada de la piscina
func AcquireHeader() *FrameHeader {
	return headerPool.Get().(*FrameHeader)
}

// ReleaseHeader devuelve el objeto a la piscina tras limpiar el estado
func ReleaseHeader(h *FrameHeader) {
	*h = FrameHeader{} // Reset memoria
	headerPool.Put(h)
}

// ParseHeaderZeroCopy decodifica la cabecera sin alocar memoria en el heap
func ParseHeaderZeroCopy(dst *FrameHeader, raw []byte) error {
	if len(raw) < 16 {
		return ErrBufferUnderflow
	}

	dst.Timestamp = int64(binary.BigEndian.Uint64(raw[0:8]))
	dst.PayloadLen = binary.BigEndian.Uint32(raw[8:12])
	dst.SequenceID = binary.BigEndian.Uint16(raw[12:14])
	dst.OpCode = raw[14]
	dst.Flags = raw[15]

	if dst.OpCode > 0x0F {
		return ErrInvalidOpcode
	}

	return nil
}`,
      complexity: {
        time: 'O(1) Direct Slice Offset',
        space: '0 B Heap Allocations (sync.Pool)',
      }
    }
  },
  rust_simd: {
    id: 'rust_simd',
    name: '[RUST] Vectorized SIMD Dot Product',
    language: 'Rust',
    prompt: 'Desarrolla un algoritmo de producto punto vectorial en Rust utilizando instrucciones intrínsecas AVX2 / FMA con garantía de alineación de punteros y manejo seguro de cola residual.',
    response: {
      overview: 'Implementación en Rust que aprovecha los registros de 256 bits AVX2 (_mm256) para procesar 8 floats de 32 bits por ciclo de reloj con operaciones Fused Multiply-Add (_mm256_fmadd_ps). Los elementos residuales se procesan de forma escalar sin desbordamiento de búfer.',
      code: `// Producto Punto Vectorizado con AVX2 + FMA en Rust
// Principios: Data-parallelism, memory safety con invariantes documentados

#[cfg(target_arch = "x86_64")]
use std::arch::x86_64::*;

pub fn dot_product_avx2(a: &[f32], b: &[f32]) -> f32 {
    assert_eq!(a.len(), b.len(), "Vectors must have matching dimensions");
    let len = a.len();

    #[cfg(target_arch = "x86_64")]
    {
        if is_x86_feature_detected!("avx2") && is_x86_feature_detected!("fma") {
            // SAFETY: Se verificaron las extensiones de CPU en tiempo de ejecución
            // y las dimensiones a.len() == b.len() garantizan límites válidos.
            return unsafe { dot_product_avx2_fma_unchecked(a, b) };
        }
    }

    // Fallback escalar portable
    a.iter().zip(b.iter()).map(|(x, y)| x * y).sum()
}

#[target_feature(enable = "avx2", enable = "fma")]
unsafe fn dot_product_avx2_fma_unchecked(a: &[f32], b: &[f32]) -> f32 {
    let len = a.len();
    let chunks = len / 8;
    let mut acc = _mm256_setzero_ps();

    for i in 0..chunks {
        let offset = i * 8;
        let va = _mm256_loadu_ps(a.as_ptr().add(offset));
        let vb = _mm256_loadu_ps(b.as_ptr().add(offset));
        acc = _mm256_fmadd_ps(va, vb, acc);
    }

    // Reducción horizontal de los 8 lanes a 1 escalar
    let mut buffer = [0.0f32; 8];
    _mm256_storeu_ps(buffer.as_mut_ptr(), acc);
    let mut sum: f32 = buffer.iter().sum();

    // Procesamiento de cola residual (elementos restantes < 8)
    for i in (chunks * 8)..len {
        sum += *a.get_unchecked(i) * *b.get_unchecked(i);
    }

    sum
}`,
      complexity: {
        time: 'O(N/8) Vectorized Throughput',
        space: 'O(1) Stack registers',
      }
    }
  },
  ts_raft: {
    id: 'ts_raft',
    name: '[TS] Branded Raft State Machine',
    language: 'TypeScript',
    prompt: 'Crea una máquina de estados para el algoritmo de consenso Raft en TypeScript con Tipos Nominales (Branded Types), Uniones Discriminadas exhaustivas y pureza funcional.',
    response: {
      overview: 'Diseño formal de estados de consenso distribuido. La exhaustividad del compilador de TypeScript asegura que ningún estado quede sin manejar en el switch mediante comprobación never. Se previenen errores de intercambio accidental de números primitivos mediante Branded Types.',
      code: `// Máquina de Estados Finita para Algoritmo Raft en TypeScript
// Principios: Exhaustiveness checking, Branded types, Immutability

export type Term = number & { readonly __brand: unique symbol };
export type NodeId = string & { readonly __brand: unique symbol };

export const makeTerm = (n: number): Term => {
  if (n < 0 || !Number.isInteger(n)) throw new Error("Invalid term");
  return n as Term;
};

export const makeNodeId = (id: string): NodeId => {
  if (!id.trim()) throw new Error("Empty nodeId");
  return id as NodeId;
};

export type RaftState =
  | {
      readonly status: 'FOLLOWER';
      readonly currentTerm: Term;
      readonly votedFor: NodeId | null;
      readonly leaderId: NodeId | null;
    }
  | {
      readonly status: 'CANDIDATE';
      readonly currentTerm: Term;
      readonly votesReceived: ReadonlySet<NodeId>;
    }
  | {
      readonly status: 'LEADER';
      readonly currentTerm: Term;
      readonly nextIndex: ReadonlyMap<NodeId, number>;
      readonly matchIndex: ReadonlyMap<NodeId, number>;
    };

export function handleElectionTimeout(state: RaftState, selfId: NodeId): RaftState {
  switch (state.status) {
    case 'FOLLOWER':
    case 'CANDIDATE': {
      const nextTerm = makeTerm((state.currentTerm as number) + 1);
      return {
        status: 'CANDIDATE',
        currentTerm: nextTerm,
        votesReceived: new Set([selfId]),
      };
    }
    case 'LEADER':
      // El líder activo no experimenta election timeout
      return state;
    default: {
      const _exhaustive: never = state;
      return _exhaustive;
    }
  }
}`,
      complexity: {
        time: 'O(1) Functional State Transition',
        space: 'O(1) Immutably shared references',
      }
    }
  },
  py_pipeline: {
    id: 'py_pipeline',
    name: '[PY] Zero-Alloc Async Pipeline',
    language: 'Python',
    prompt: 'Diseña un pipeline asíncrono con slots (__slots__), generadores de streaming y concurrencia asyncio en Python 3.12 con tipado estricto.',
    response: {
      overview: 'Arquitectura de alto rendimiento en Python. El uso de __slots__ elimina el diccionario dinámico __dict__ de cada instancia, reduciendo el consumo de memoria en más de un 60%. Se combinan generadores asíncronos para procesar flujos de datos continuos sin cargar el dataset completo en memoria.',
      code: `"""
Pipeline de Datos Asíncrono de Alto Rendimiento en Python 3.12
Principios: Memory slots, async streaming generators, static typing
"""

import asyncio
from typing import AsyncGenerator, Final
from dataclasses import dataclass

MAX_BATCH_SIZE: Final[int] = 512

class MetricPacket:
    __slots__ = ("device_id", "timestamp", "temperature", "voltage")

    def __init__(self, device_id: str, timestamp: float, temp: float, volt: float) -> None:
        self.device_id = device_id
        self.timestamp = timestamp
        self.temperature = temp
        self.voltage = volt

async def packet_streamer(count: int) -> AsyncGenerator[MetricPacket, None]:
    """Generador asíncrono que no acumula memoria en búferes intermedios."""
    for i in range(count):
        yield MetricPacket(f"edge-{i % 16}", 1700000000.0 + i, 22.5 + (i * 0.01), 3.3)
        if i % 64 == 0:
            await asyncio.sleep(0)  # Ceder el event loop

async def filter_anomalies(
    stream: AsyncGenerator[MetricPacket, None], threshold: float
) -> AsyncGenerator[MetricPacket, None]:
    async for packet in stream:
        if packet.temperature > threshold:
            yield packet

async def execute_pipeline() -> int:
    processed = 0
    async for anomaly in filter_anomalies(packet_streamer(1000), 22.8):
        processed += 1
    return processed`,
      complexity: {
        time: 'O(N) Streaming Pipeline',
        space: 'O(1) Memory Footprint via Generators',
      }
    }
  }
};
