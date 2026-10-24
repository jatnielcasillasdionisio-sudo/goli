# ==============================================================================
# Makefile: GoCgoCodeEngine - Local AI Coding Architect
# High-performance C/C++ engine + Go WebSocket Backend + Web Frontend
# ==============================================================================

CC := gcc
CFLAGS := -O3 -Wall -Wextra -pthread -fPIC -I./backend
CXX := g++
CXXFLAGS := -O3 -Wall -Wextra -pthread -fPIC -std=c++20 -I./backend
GO := go
CGO_ENABLED := 1

BIN_DIR := ./bin
DIST_DIR := ./dist
BACKEND_BIN := $(BIN_DIR)/gocgo-engine

.PHONY: all build clean run test lint docker-build help

all: build

help:
	@echo "GoCgoCodeEngine Build System"
	@echo "Targets:"
	@echo "  make build       - Compiles C engine objects and links Go CGo binary"
	@echo "  make run         - Executes the compiled Go backend server"
	@echo "  make test        - Executes Go and C unit tests"
	@echo "  make clean       - Removes built binaries and intermediate objects"
	@echo "  make frontend    - Builds modern frontend web app"

$(BIN_DIR):
	mkdir -p $(BIN_DIR)

# Compile C bridge object
$(BIN_DIR)/bridge.o: backend/bridge.c backend/bridge.h | $(BIN_DIR)
	$(CC) $(CFLAGS) -c backend/bridge.c -o $(BIN_DIR)/bridge.o

# Compile Go binary with CGo linking
build: $(BIN_DIR)/bridge.o
	@echo "==> Compiling GoCgoCodeEngine with CGO_ENABLED=1..."
	cd backend && CGO_ENABLED=1 $(GO) build -ldflags="-s -w" -o ../$(BACKEND_BIN) main.go bridge.go
	@echo "==> Build successful: $(BACKEND_BIN)"

run: build
	@echo "==> Starting GoCgoCodeEngine..."
	$(BACKEND_BIN) -port 8080 -model models/deepseek-coder-7b-q4.gguf

test:
	@echo "==> Running Go backend test suite..."
	cd backend && $(GO) test -v -race ./...

clean:
	@echo "==> Cleaning build artifacts..."
	rm -rf $(BIN_DIR) $(DIST_DIR)
	@echo "==> Clean complete."

frontend:
	@echo "==> Building frontend web application..."
	npm run build
