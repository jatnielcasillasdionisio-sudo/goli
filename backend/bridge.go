package main

/*
#cgo CFLAGS: -I. -O3 -Wall
#include "bridge.h"

// Forward declaration of the gateway function exported from Go
extern int goTokenCallback(const char* token, void* user_data);

// C trampoline to call into Go export
static int c_callback_trampoline(const char* token, void* user_data) {
    return goTokenCallback(token, user_data);
}

static int run_stream(llama_ctx_t* ctx, const char* prompt, void* user_data, engine_metrics_t* metrics) {
    return engine_generate_stream(ctx, prompt, c_callback_trampoline, user_data, metrics);
}
*/
import "C"

import (
	"context"
	"errors"
	"fmt"
	"sync"
	"sync/atomic"
	"unsafe"
)

// EngineConfig maps high-level Go configuration to C engine parameters
type EngineConfig struct {
	ModelPath   string  `json:"model_path"`
	ContextSize int     `json:"n_ctx"`
	Threads     int     `json:"n_threads"`
	GPULayers   int     `json:"n_gpu_layers"`
	Temperature float32 `json:"temperature"`
	TopP        float32 `json:"top_p"`
	Seed        int     `json:"seed"`
}

// EngineTelemetry contains real-time runtime metrics from C memory
type EngineTelemetry struct {
	TotalTokens      int     `json:"total_tokens"`
	TokensPerSec     float32 `json:"tokens_per_sec"`
	RAMUsageMB       uint64  `json:"ram_usage_mb"`
	VRAMUsageMB      uint64  `json:"vram_usage_mb"`
	TimeToFirstToken float64 `json:"time_to_first_token_ms"`
	KVCacheTokens    int     `json:"kv_cache_tokens"`
}

// Engine wraps the native C/C++ llama.cpp/GGML context safely in Go
type Engine struct {
	ctxMu sync.RWMutex
	cCtx  *C.llama_ctx_t
	cfg   EngineConfig
}

// Global stream dispatcher registry to map C callbacks to Go channels
var (
	dispatcherIDCounter uint64
	activeDispatchers   sync.Map
)

type streamSession struct {
	tokenChan chan<- string
	ctx       context.Context
	aborted   int32
}

//export goTokenCallback
func goTokenCallback(token *C.char, userData unsafe.Pointer) C.int {
	id := uint64(uintptr(userData))
	val, ok := activeDispatchers.Load(id)
	if !ok {
		return 1 // Stop if session was removed
	}

	session := val.(*streamSession)
	if atomic.LoadInt32(&session.aborted) == 1 {
		return 1
	}

	// Check context cancellation
	select {
	case <-session.ctx.Done():
		atomic.StoreInt32(&session.aborted, 1)
		return 1
	default:
	}

	goStr := C.GoString(token)
	select {
	case session.tokenChan <- goStr:
		return 0
	case <-session.ctx.Done():
		atomic.StoreInt32(&session.aborted, 1)
		return 1
	}
}

// NewEngine initializes the C/C++ engine instance
func NewEngine(cfg EngineConfig) (*Engine, error) {
	cPath := C.CString(cfg.ModelPath)
	defer C.free(unsafe.Pointer(cPath))

	cConfig := C.engine_config_t{
		model_path:   cPath,
		n_ctx:        C.int32_t(cfg.ContextSize),
		n_threads:    C.int32_t(cfg.Threads),
		n_gpu_layers: C.int32_t(cfg.GPULayers),
		temperature:  C.float(cfg.Temperature),
		top_p:        C.float(cfg.TopP),
		seed:         C.int32_t(cfg.Seed),
	}

	cCtx := C.engine_init(&cConfig)
	if cCtx == nil {
		return nil, errors.New("failed to initialize C inference engine context")
	}

	return &Engine{
		cCtx: cCtx,
		cfg:  cfg,
	}, nil
}

// Close releases the low-level C memory
func (e *Engine) Close() {
	e.ctxMu.Lock()
	defer e.ctxMu.Unlock()
	if e.cCtx != nil {
		C.engine_free(e.cCtx)
		e.cCtx = nil
	}
}

// Cancel interrupts any active generation in the C engine
func (e *Engine) Cancel() {
	e.ctxMu.RLock()
	defer e.ctxMu.RUnlock()
	if e.cCtx != nil {
		C.engine_cancel(e.cCtx)
	}
}

// GetTelemetry polls instantaneous memory telemetry from the engine
func (e *Engine) GetTelemetry() EngineTelemetry {
	e.ctxMu.RLock()
	defer e.ctxMu.RUnlock()
	if e.cCtx == nil {
		return EngineTelemetry{}
	}

	cMetrics := C.engine_get_telemetry(e.cCtx)
	return EngineTelemetry{
		RAMUsageMB:    uint64(cMetrics.ram_usage_mb),
		VRAMUsageMB:   uint64(cMetrics.vram_usage_mb),
		KVCacheTokens: int(cMetrics.kv_cache_tokens),
	}
}

// StreamGenerate executes token generation in a separate goroutine and streams tokens to a Go channel
func (e *Engine) StreamGenerate(ctx context.Context, prompt string) (<-chan string, <-chan EngineTelemetry, <-chan error) {
	tokenCh := make(chan string, 128)
	telemetryCh := make(chan EngineTelemetry, 1)
	errCh := make(chan error, 1)

	sessionID := atomic.AddUint64(&dispatcherIDCounter, 1)
	session := &streamSession{
		tokenChan: tokenCh,
		ctx:       ctx,
	}
	activeDispatchers.Store(sessionID, session)

	go func() {
		defer func() {
			activeDispatchers.Delete(sessionID)
			close(tokenCh)
			close(telemetryCh)
			close(errCh)
		}()

		e.ctxMu.RLock()
		ctxPtr := e.cCtx
		e.ctxMu.RUnlock()

		if ctxPtr == nil {
			errCh <- errors.New("engine context is closed")
			return
		}

		cPrompt := C.CString(prompt)
		defer C.free(unsafe.Pointer(cPrompt))

		var cMetrics C.engine_metrics_t
		ret := C.run_stream(ctxPtr, cPrompt, unsafe.Pointer(uintptr(sessionID)), &cMetrics)

		if ret != 0 {
			errCh <- fmt.Errorf("engine generation returned code: %d", int(ret))
			return
		}

		telemetryCh <- EngineTelemetry{
			TotalTokens:      int(cMetrics.total_tokens),
			TokensPerSec:     float32(cMetrics.tokens_per_sec),
			RAMUsageMB:       uint64(cMetrics.ram_usage_mb),
			VRAMUsageMB:      uint64(cMetrics.vram_usage_mb),
			TimeToFirstToken: float64(cMetrics.time_to_first_token_ms),
			KVCacheTokens:    int(cMetrics.kv_cache_tokens),
		}
	}()

	return tokenCh, telemetryCh, errCh
}
