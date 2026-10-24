import test from 'node:test';
import assert from 'node:assert/strict';
import { compileAndRunCode } from './codeCompiler';

test('compileAndRunCode executes JavaScript and captures console.log', async () => {
  const code = 'console.log("Hello from Goli JS Engine");';
  const result = await compileAndRunCode(code, 'javascript');
  assert.equal(result.success, true);
  assert.equal(result.exitCode, 0);
  assert.ok(result.stdout.includes('Hello from Goli JS Engine'));
});

test('compileAndRunCode executes HTML and generates preview bundle', async () => {
  const html = '<!DOCTYPE html><html><body><h1>App</h1></body></html>';
  const result = await compileAndRunCode(html, 'html');
  assert.equal(result.success, true);
  assert.equal(result.htmlPreviewBundle, html);
});

test('compileAndRunCode parses Go fmt.Println', async () => {
  const goCode = `
    package main
    import "fmt"
    func main() {
        fmt.Println("Goli Go Runtime Active")
    }
  `;
  const result = await compileAndRunCode(goCode, 'go');
  assert.equal(result.success, true);
  assert.ok(result.stdout.includes('Goli Go Runtime Active'));
});

test('compileAndRunCode detects missing main in C++', async () => {
  const brokenCpp = `int add(int a, int b) { return a + b; }`;
  const result = await compileAndRunCode(brokenCpp, 'cpp');
  assert.equal(result.success, false);
  assert.equal(result.exitCode, 1);
  assert.ok(result.stderr.includes('undefined reference to `main`'));
});
