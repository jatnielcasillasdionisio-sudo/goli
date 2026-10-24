import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json({ limit: '10mb' }));

  // Initialize Gemini if API key is present
  const apiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  // API Route for Real AI Code & App Generation
  app.post('/api/generate', async (req, res) => {
    const { prompt, effortLevel, mode } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    try {
      if (ai) {
        const thinkingLevel = effortLevel === 'extreme' || effortLevel === 'high' ? 'HIGH' : effortLevel === 'medium' ? 'MEDIUM' : 'LOW';
        const systemInstruction = `You are Goli, an Elite Software Architect and Senior Systems Engineer.
Your mission is to generate COMPLETE, runnable, production-ready full applications and modules in any language (HTML/CSS/JS, Python, Go, C++, Rust, TypeScript).
Always provide fully functional, complete apps without placeholders.
Structure your output with:
1. Architectural reasoning and design decisions.
2. Complete, self-contained, working production code.
3. Big-O time and space complexity.
4. Edge cases and invariants handled.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction,
            temperature: 0.2,
          },
        });

        return res.json({
          text: response.text || '',
          source: 'gemini',
        });
      }

      // If no API key, return null to let frontend local neural transformer engine handle it seamlessly
      return res.json({
        text: null,
        source: 'local_engine',
      });
    } catch (err: any) {
      console.error('Error generating with Gemini:', err);
      return res.status(500).json({ error: err.message, source: 'error_fallback' });
    }
  });

  // Health endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      hasApiKey: !!process.env.GEMINI_API_KEY,
      timestamp: new Date().toISOString(),
    });
  });

  // In production serve dist; in dev mount Vite middlewares
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[GOLI SERVER] Running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[FATAL SERVER ERROR]', err);
  process.exit(1);
});
