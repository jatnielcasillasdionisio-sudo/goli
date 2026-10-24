/**
 * @file bridge.h
 * @brief C Interface for High-Performance Local AI Inference Engine (llama.cpp / GGML wrapper)
 * 
 * Provides low-level token generation, memory management, KV-cache tracking,
 * and high-frequency streaming callbacks for Go CGo integration.
 */

#ifndef BRIDGE_H
#define BRIDGE_H

#include <stddef.h>
#include <stdint.h>
#include <stdbool.h>

#ifdef __cplusplus
extern "C" {
#endif

/* Configuration parameters for engine initialization */
typedef struct {
    const char* model_path;
    int32_t     n_ctx;            /* Context window size (e.g. 4096, 8192) */
    int32_t     n_threads;        /* Number of CPU worker threads */
    int32_t     n_gpu_layers;     /* Number of layers offloaded to GPU/VRAM */
    float       temperature;      /* Sampling temperature (0.0 - 2.0) */
    float       top_p;            /* Top-P nucleus sampling */
    int32_t     seed;             /* Random seed (-1 for randomized) */
} engine_config_t;

/* Telemetry metrics measured during token generation */
typedef struct {
    int32_t     total_tokens;             /* Number of generated output tokens */
    float       tokens_per_sec;           /* Throughput in tokens/sec */
    size_t      ram_usage_mb;             /* Host RAM usage in Megabytes */
    size_t      vram_usage_mb;            /* Device VRAM allocated in Megabytes */
    double      time_to_first_token_ms;   /* Latency to first token emission */
    int32_t     kv_cache_tokens;          /* KV cache occupancy count */
} engine_metrics_t;

/* Opaque pointer to internal C/C++ engine context */
typedef struct llama_inference_context llama_ctx_t;

/**
 * Token callback function type.
 * @param token      Null-terminated token string fragment
 * @param user_data  Opaque pointer passed back to caller (Goroutine context)
 * @return 0 to continue generation, non-zero to abort early
 */
typedef int (*token_callback_fn)(const char* token, void* user_data);

/* Engine lifecycle API */
llama_ctx_t* engine_init(const engine_config_t* config);
void         engine_free(llama_ctx_t* ctx);
void         engine_cancel(llama_ctx_t* ctx);

/* Inference API */
int          engine_generate_stream(
                 llama_ctx_t* ctx,
                 const char* prompt,
                 token_callback_fn callback,
                 void* user_data,
                 engine_metrics_t* out_metrics
             );

engine_metrics_t engine_get_telemetry(llama_ctx_t* ctx);

#ifdef __cplusplus
}
#endif

#endif /* BRIDGE_H */
