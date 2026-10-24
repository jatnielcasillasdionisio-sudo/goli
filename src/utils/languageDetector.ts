/**
 * Language Identification & Multi-Language Dictionary Engine for Goli
 * Detects languages by name in natural language prompts and by code syntax.
 */

export interface LanguageMeta {
  id: string;
  name: string;
  extension: string;
  category: 'Systems' | 'Web' | 'Backend' | 'Mobile' | 'Data & Scripting';
  defaultTemplate: string;
  runMode: 'interactive_web' | 'v8_sandbox' | 'interpreter' | 'native_compiler';
}

export const SUPPORTED_LANGUAGES: Record<string, LanguageMeta> = {
  python: {
    id: 'python',
    name: 'Python',
    extension: 'py',
    category: 'Data & Scripting',
    runMode: 'interpreter',
    defaultTemplate: `# Código Python 3.12 en Goli
def saludar(nombre: str) -> str:
    return f"Hola, {nombre}! Bienvenido al entorno Goli."

print(saludar("Desarrollador"))
print("Calculando serie de Fibonacci:")
fib = [0, 1]
for _ in range(8):
    fib.append(fib[-1] + fib[-2])
print("Serie:", fib)`,
  },
  javascript: {
    id: 'javascript',
    name: 'JavaScript',
    extension: 'js',
    category: 'Web',
    runMode: 'v8_sandbox',
    defaultTemplate: `// Código JavaScript (ES2024)
const tareas = ["Diseñar arquitectura", "Optimizar memoria", "Compilar binario"];
console.log("Tareas activas en Goli:");
tareas.forEach((t, i) => console.log(\`\${i + 1}. \${t}\`));
const total = [10, 25, 45].reduce((acc, v) => acc + v, 0);
console.log("Total calculado:", total);`,
  },
  typescript: {
    id: 'typescript',
    name: 'TypeScript',
    extension: 'ts',
    category: 'Web',
    runMode: 'v8_sandbox',
    defaultTemplate: `// Código TypeScript Estricto
interface TaskRecord {
  readonly id: number;
  readonly title: string;
  completed: boolean;
}

const list: TaskRecord[] = [
  { id: 1, title: "Kernel CGo enlazado", completed: true },
  { id: 2, title: "Verificación de tipos", completed: true },
];

console.log("TypeScript Verificado:", list);`,
  },
  html: {
    id: 'html',
    name: 'HTML5 / Web App',
    extension: 'html',
    category: 'Web',
    runMode: 'interactive_web',
    defaultTemplate: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>App Completa Goli</title>
  <style>
    body { font-family: system-ui; background: #090d16; color: #f1f5f9; padding: 30px; text-align: center; }
    .box { background: #131d33; padding: 24px; border-radius: 12px; border: 1px solid #1e293b; max-width: 480px; margin: 0 auto; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    button { background: #06b6d4; color: #000; border: none; padding: 10px 20px; font-weight: bold; border-radius: 6px; cursor: pointer; margin-top: 15px; }
  </style>
</head>
<body>
  <div class="box">
    <h2 style="color:#38bdf8;">Aplicación Web Interactiva</h2>
    <p>Renderizada en vivo en el visualizador HTML de Goli.</p>
    <div id="out" style="color:#4ade80; margin:15px 0;">Contador: 0</div>
    <button onclick="add()">Incrementar</button>
  </div>
  <script>
    let n = 0;
    function add() { n++; document.getElementById('out').innerText = 'Contador: ' + n; }
  </script>
</body>
</html>`,
  },
  go: {
    id: 'go',
    name: 'Go',
    extension: 'go',
    category: 'Backend',
    runMode: 'native_compiler',
    defaultTemplate: `package main

import "fmt"

func main() {
    fmt.Println("[GOLI GO RUNTIME] Concurrencia mediante Goroutines y canales.")
    canal := make(chan string, 1)
    canal <- "Paso de mensaje sin memoria compartida (CSP)"
    fmt.Println("Recibido:", <-canal)
}`,
  },
  cpp: {
    id: 'cpp',
    name: 'C++',
    extension: 'cpp',
    category: 'Systems',
    runMode: 'native_compiler',
    defaultTemplate: `#include <iostream>
#include <vector>
#include <numeric>

int main() {
    std::cout << "[GOLI C++23] Ejecutando calculo de bajo nivel con RAII:" << std::endl;
    std::vector<int> nums = {1, 2, 3, 4, 5, 6, 7, 8};
    int suma = std::accumulate(nums.begin(), nums.end(), 0);
    std::cout << "Suma acumulada: " << suma << std::endl;
    return 0;
}`,
  },
  rust: {
    id: 'rust',
    name: 'Rust',
    extension: 'rs',
    category: 'Systems',
    runMode: 'native_compiler',
    defaultTemplate: `fn main() {
    println!("[GOLI RUST 1.78] Verificacion de propiedad y Borrow Checker:");
    let mut data = vec!["cgo", "rust", "clean_code"];
    data.push("zero_cost_abstractions");
    for (i, item) in data.iter().enumerate() {
        println!("{}: {}", i + 1, item);
    }
}`,
  },
  java: {
    id: 'java',
    name: 'Java',
    extension: 'java',
    category: 'Backend',
    runMode: 'native_compiler',
    defaultTemplate: `public class Main {
    public static void main(String[] args) {
        System.out.println("[GOLI JAVA 21] Clean Architecture y SOLID:");
        java.util.List<String> items = java.util.List.of("Singleton", "Factory", "Strategy");
        items.forEach(p -> System.out.println("Patron GoF: " + p));
    }
}`,
  },
  kotlin: {
    id: 'kotlin',
    name: 'Kotlin',
    extension: 'kt',
    category: 'Mobile',
    runMode: 'native_compiler',
    defaultTemplate: `fun main() {
    println("[GOLI KOTLIN] Corutinas y Null Safety:")
    val items = listOf("Coroutines", "Flow", "Data Class")
    items.forEach { println("Tecnologia: $it") }
}`,
  },
  swift: {
    id: 'swift',
    name: 'Swift',
    extension: 'swift',
    category: 'Mobile',
    runMode: 'native_compiler',
    defaultTemplate: `import Foundation

print("[GOLI SWIFT] Arquitectura Moderna & ARC:")
let frameworks = ["SwiftUI", "Concurrency", "Actors"]
for fw in frameworks {
    print("Framework: \\(fw)")
}`,
  },
  csharp: {
    id: 'csharp',
    name: 'C#',
    extension: 'cs',
    category: 'Backend',
    runMode: 'native_compiler',
    defaultTemplate: `using System;
using System.Linq;

class Program {
    static void Main() {
        Console.WriteLine("[GOLI C# .NET 9] Async/Await & LINQ:");
        var numeros = new int[] { 1, 2, 3, 4, 5 };
        var pares = numeros.Where(n => n % 2 == 0);
        Console.WriteLine("Pares: " + string.Join(", ", pares));
    }
}`,
  },
  php: {
    id: 'php',
    name: 'PHP',
    extension: 'php',
    category: 'Backend',
    runMode: 'interpreter',
    defaultTemplate: `<?php
echo "[GOLI PHP 8.3] Tipado estricto y composicion:\n";
$usuarios = ["Alice", "Bob", "Charlie"];
foreach ($usuarios as $u) {
    echo "Usuario verificado: $u\n";
}`,
  },
  ruby: {
    id: 'ruby',
    name: 'Ruby',
    extension: 'rb',
    category: 'Backend',
    runMode: 'interpreter',
    defaultTemplate: `# Código Ruby en Goli
puts "[GOLI RUBY] Metaprogramacion y bloques limpios:"
[1, 2, 3, 4, 5].each do |num|
  puts "Procesando elemento: #{num * 2}"
end`,
  },
  zig: {
    id: 'zig',
    name: 'Zig',
    extension: 'zig',
    category: 'Systems',
    runMode: 'native_compiler',
    defaultTemplate: `const std = @import("std");

pub fn main() !void {
    const stdout = std.io.getStdOut().writer();
    try stdout.print("[GOLI ZIG] Control manual de memoria y comptime: OK\\n", .{});
}`,
  },
  sql: {
    id: 'sql',
    name: 'SQL',
    extension: 'sql',
    category: 'Data & Scripting',
    runMode: 'interpreter',
    defaultTemplate: `-- Esquema Relacional de Alto Rendimiento en SQL
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(64) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_users_username ON users(username);`,
  },
  bash: {
    id: 'bash',
    name: 'Bash',
    extension: 'sh',
    category: 'Data & Scripting',
    runMode: 'interpreter',
    defaultTemplate: `#!/usr/bin/env bash
set -euo pipefail
echo "[GOLI BASH] Scripting de automatizacion defensivo:"
for item in "cgo_engine" "compiler" "visualizer"; do
  echo "Servicio activo: \${item}"
done`,
  },
};

/**
 * Identifies language from user natural language prompt.
 * E.g. "haz un servidor en zig", "escribe en python", "en c++", "app en html", etc.
 */
export function identifyLanguageFromPrompt(prompt: string): LanguageMeta | null {
  const p = prompt.toLowerCase();

  // Explicit keyword checks
  if (/\b(?:python|py)\b/i.test(p)) return SUPPORTED_LANGUAGES.python;
  if (/\b(?:html|html5|web\s*app|pagina\s*web|sitio\s*web|interfaz\s*web)\b/i.test(p)) return SUPPORTED_LANGUAGES.html;
  if (/\b(?:typescript|ts)\b/i.test(p)) return SUPPORTED_LANGUAGES.typescript;
  if (/\b(?:javascript|js|node|nodejs)\b/i.test(p)) return SUPPORTED_LANGUAGES.javascript;
  if (/\b(?:golang|go)\b/i.test(p)) return SUPPORTED_LANGUAGES.go;
  if (/\b(?:c\+\+|cpp)\b/i.test(p)) return SUPPORTED_LANGUAGES.cpp;
  if (/\b(?:rust|rs)\b/i.test(p)) return SUPPORTED_LANGUAGES.rust;
  if (/\b(?:c#|csharp|\.net)\b/i.test(p)) return SUPPORTED_LANGUAGES.csharp;
  if (/\b(?:java)\b/i.test(p)) return SUPPORTED_LANGUAGES.java;
  if (/\b(?:kotlin|kt)\b/i.test(p)) return SUPPORTED_LANGUAGES.kotlin;
  if (/\b(?:swift)\b/i.test(p)) return SUPPORTED_LANGUAGES.swift;
  if (/\b(?:php)\b/i.test(p)) return SUPPORTED_LANGUAGES.php;
  if (/\b(?:ruby|rb)\b/i.test(p)) return SUPPORTED_LANGUAGES.ruby;
  if (/\b(?:zig)\b/i.test(p)) return SUPPORTED_LANGUAGES.zig;
  if (/\b(?:sql|postgres|postgresql|mysql)\b/i.test(p)) return SUPPORTED_LANGUAGES.sql;
  if (/\b(?:bash|shell|sh)\b/i.test(p)) return SUPPORTED_LANGUAGES.bash;

  return null;
}
