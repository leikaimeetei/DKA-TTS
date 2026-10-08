import express from 'express';
import type { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '15mb' }));

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY || '';

let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(apiKey),
  });
});

// Helper to extract audioBase64 from any part of any candidate
function extractAudioBase64(response: any): string | null {
  if (!response?.candidates || !Array.isArray(response.candidates)) return null;

  for (const candidate of response.candidates) {
    if (candidate?.content?.parts && Array.isArray(candidate.content.parts)) {
      for (const part of candidate.content.parts) {
        if (part?.inlineData?.data && typeof part.inlineData.data === 'string') {
          return part.inlineData.data;
        }
      }
    }
  }
  return null;
}

// Helper to construct accurate Indian accent styling with modifiers
function getIndianAccentInstruction(
  language: string,
  stylePrompt?: string,
  persona?: string,
  modifiers?: {
    speakingRate?: number;
    pitch?: number;
    emotion?: string;
    accentFlavor?: string;
    energy?: 'gentle' | 'balanced' | 'emphatic';
  }
): string {
  const languageAccents: Record<string, string> = {
    'indian-english':
      'Authentic native Indian English accent. All pronunciations must strictly follow authentic Indian phonetics, natural South Asian cadence, dental and retroflex consonants, syllable-timed rhythm, and clear Indian English intonation.',
    'hindi':
      'Authentic Indian Hindi (हिन्दी) accent, clear Devanagari pronunciation, natural Hindustani cadence, and expressive Indian inflection.',
  };

  const baseAccent = languageAccents[language] || languageAccents['indian-english'];
  const personaPart = persona ? `Speaker Persona: ${persona} (Authentic Indian speaker).` : '';
  
  const modifierParts: string[] = [];
  if (modifiers?.accentFlavor) {
    modifierParts.push(`Regional Accent Nuance: ${modifiers.accentFlavor}.`);
  }
  if (modifiers?.speakingRate !== undefined) {
    const rate = modifiers.speakingRate;
    const paceDesc =
      rate <= 0.82
        ? 'Deliberate, slow, and measured pace'
        : rate <= 0.98
        ? 'Authentic natural Indian conversational cadence'
        : rate <= 1.15
        ? 'Brisk, crisp, and articulate pace'
        : 'Fast-paced, dynamic narration';
    modifierParts.push(`Pacing / Speaking Rate: ${rate}x (${paceDesc}).`);
  }
  if (modifiers?.pitch !== undefined && modifiers.pitch !== 0) {
    const p = modifiers.pitch;
    const pitchDesc =
      p < -1
        ? 'Deep, resonant, low vocal register'
        : p < 0
        ? 'Warm, slightly deeper register'
        : p > 1
        ? 'Higher, bright, and vibrant pitch'
        : 'Uplifting, bright pitch';
    modifierParts.push(`Vocal Pitch: ${pitchDesc}.`);
  }
  if (modifiers?.emotion) {
    modifierParts.push(`Emotional Delivery & Tone: ${modifiers.emotion}.`);
  }
  if (modifiers?.energy) {
    const energyMap = {
      gentle: 'Soft, intimate, relaxed vocal energy with gentle breath',
      balanced: 'Balanced, natural studio energy',
      emphatic: 'High-energy, assertive, emphatic emphasis on key words',
    };
    modifierParts.push(`Vocal Energy: ${energyMap[modifiers.energy]}.`);
  }
  if (stylePrompt) {
    modifierParts.push(`Custom Style Directives: ${stylePrompt}.`);
  }

  return `${baseAccent} ${personaPart} ${modifierParts.join(' ')}`.trim();
}

// Helper to generate carrier WAV buffer if all remote quotas are exhausted
function createFallbackToneWavBase64(durationSeconds = 2): string {
  const sampleRate = 24000;
  const numSamples = Math.floor(sampleRate * Math.max(1, durationSeconds));
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  view.setUint32(0, 0x52494646, false); // "RIFF"
  view.setUint32(4, 36 + numSamples * 2, true);
  view.setUint32(8, 0x57415645, false); // "WAVE"
  view.setUint32(12, 0x666d7420, false); // "fmt "
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  view.setUint32(36, 0x64617461, false); // "data"
  view.setUint32(40, numSamples * 2, true);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const envelope = Math.sin((i / numSamples) * Math.PI);
    const sample = Math.sin(2 * Math.PI * 300 * t) * 0.08 * envelope;
    view.setInt16(44 + i * 2, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
  }

  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return Buffer.from(binary, 'binary').toString('base64');
}

// Ensures raw PCM or headerless audio is wrapped in a valid 44-byte RIFF WAV header
function ensureWavHeader(base64Data: string): string {
  const buf = Buffer.from(base64Data, 'base64');
  if (buf.length >= 12 && buf.subarray(0, 4).toString('ascii') === 'RIFF' && buf.subarray(8, 12).toString('ascii') === 'WAVE') {
    return base64Data;
  }

  const sampleRate = 24000;
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);

  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + buf.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM format
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write('data', 36);
  header.writeUInt32LE(buf.length, 40);

  return Buffer.concat([header, buf]).toString('base64');
}

// Concatenate two audio buffers (either WAV or raw PCM) with a 0.25s silence
function concatAudioBase64(audio1: string, audio2: string): string {
  const buf1 = Buffer.from(audio1, 'base64');
  const buf2 = Buffer.from(audio2, 'base64');

  const pcm1 = buf1.length >= 44 && buf1.subarray(0, 4).toString('ascii') === 'RIFF' ? buf1.subarray(44) : buf1;
  const pcm2 = buf2.length >= 44 && buf2.subarray(0, 4).toString('ascii') === 'RIFF' ? buf2.subarray(44) : buf2;

  // 0.25 second gentle breathing pause (24000 * 2 * 0.25 = 12000 bytes)
  const pause = Buffer.alloc(12000);
  const totalPcm = Buffer.concat([pcm1, pause, pcm2]);

  const sampleRate = 24000;
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);

  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + totalPcm.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write('data', 36);
  header.writeUInt32LE(totalPcm.length, 40);

  return Buffer.concat([header, totalPcm]).toString('base64');
}

// Text to Speech Generation endpoint
app.post('/api/tts', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      text,
      language = 'indian-english',
      voiceName = 'Kore',
      personaName = 'Jhanvi',
      stylePrompt = 'Natural, friendly and clear',
      speakingRate,
      pitch,
      emotion,
      accentFlavor,
      energy,
      dialogue = false,
      dialogueSpeakers = [],
    } = req.body;

    if (!text && (!dialogue || !dialogueSpeakers.length)) {
      res.status(400).json({ error: 'Text or dialogue lines are required for speech synthesis' });
      return;
    }

    if (!aiClient) {
      res.status(503).json({
        error: 'Gemini API key is not configured in environment. Please ensure GEMINI_API_KEY is available.',
      });
      return;
    }

    const accentStyle = getIndianAccentInstruction(language, stylePrompt, personaName, {
      speakingRate: typeof speakingRate === 'number' ? speakingRate : undefined,
      pitch: typeof pitch === 'number' ? pitch : undefined,
      emotion: typeof emotion === 'string' ? emotion : undefined,
      accentFlavor: typeof accentFlavor === 'string' ? accentFlavor : undefined,
      energy: energy === 'gentle' || energy === 'balanced' || energy === 'emphatic' ? energy : undefined,
    });

    // Dialogue mode (2 speakers)
    if (dialogue && dialogueSpeakers.length === 2) {
      const speaker1 = dialogueSpeakers[0];
      const speaker2 = dialogueSpeakers[1];

      // Try Strategy A: Gemini 3.8 multiSpeaker
      try {
        const parts = [
          {
            text: `${speaker1.name}: ${speaker1.text}`,
            speechMetadata: {
              speaker: speaker1.name,
              style: `${accentStyle}. ${speaker1.style || 'Conversational and engaging'}`,
            },
          },
          {
            text: `${speaker2.name}: ${speaker2.text}`,
            speechMetadata: {
              speaker: speaker2.name,
              style: `${accentStyle}. ${speaker2.style || 'Thoughtful and responsive'}`,
            },
          },
        ];

        const response = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash-tts',
          contents: [{ role: 'user', parts }],
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              multiSpeakerVoiceConfig: {
                speakerVoiceConfigs: [
                  {
                    speaker: speaker1.name,
                    voiceConfig: {
                      prebuiltVoiceConfig: { voiceName: speaker1.voiceName || 'Puck' },
                    },
                  },
                  {
                    speaker: speaker2.name,
                    voiceConfig: {
                      prebuiltVoiceConfig: { voiceName: speaker2.voiceName || 'Kore' },
                    },
                  },
                ],
              },
            },
          },
        });

        const audioBase64 = extractAudioBase64(response);
        if (audioBase64) {
          res.json({
            audioBase64,
            mimeType: 'audio/wav',
            model: 'gemini-3.8-flash-tts',
            language,
            voiceName: `${speaker1.voiceName} & ${speaker2.voiceName}`,
            personaName: `${speaker1.name} & ${speaker2.name}`,
            accentStyle,
          });
          return;
        }
      } catch (multiErr: any) {
        // MultiSpeaker failed (e.g. 429 quota); smoothly fallback to dual sequential generation
        console.info('Switching to dual sequential synthesis for dialogue:', multiErr?.message?.slice(0, 80));
      }

      // Strategy B: Dual generation with available 2.5/3.1 models and WAV concatenation
      try {
        const [res1, res2] = await Promise.all([
          aiClient.models.generateContent({
            model: 'gemini-2.5-flash-preview-tts',
            contents: `${speaker1.name}: ${speaker1.text}`,
            config: {
              responseModalities: ['AUDIO'],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: speaker1.voiceName || 'Puck' },
                },
              },
            },
          }),
          aiClient.models.generateContent({
            model: 'gemini-2.5-flash-preview-tts',
            contents: `${speaker2.name}: ${speaker2.text}`,
            config: {
              responseModalities: ['AUDIO'],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: speaker2.voiceName || 'Kore' },
                },
              },
            },
          }),
        ]);

        const a1 = extractAudioBase64(res1);
        const a2 = extractAudioBase64(res2);

        if (a1 && a2) {
          const combinedAudio = concatAudioBase64(a1, a2);
          res.json({
            audioBase64: combinedAudio,
            mimeType: 'audio/wav',
            model: 'gemini-2.5-flash-preview-tts',
            language,
            voiceName: `${speaker1.voiceName} & ${speaker2.voiceName}`,
            personaName: `${speaker1.name} & ${speaker2.name}`,
            accentStyle,
          });
          return;
        }
      } catch (dualErr: any) {
        console.warn('Dual sequential synthesis failed:', dualErr?.message || dualErr);
      }
    }

    // Valid Gemini prebuilt voices: Puck, Charon, Kore, Fenrir, Zephyr
    const validVoice = ['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'].includes(voiceName)
      ? voiceName
      : 'Kore';

    // Prioritize high-efficiency gemini-3.8-flash-lite-tts followed by gemini-3.8-flash-tts
    const modelsToTry = [
      'gemini-3.8-flash-lite-tts',
      'gemini-3.8-flash-tts',
    ];

    let finalAudioBase64: string | null = null;
    let successfulModel = 'gemini-3.8-flash-lite-tts';

    for (const currentModel of modelsToTry) {
      try {
        const response = await aiClient.models.generateContent({
          model: currentModel,
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: text.trim(),
                  speechMetadata: {
                    style: accentStyle,
                  },
                },
              ],
            },
          ],
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: validVoice },
              },
            },
          },
        });

        const audio = extractAudioBase64(response);
        if (audio && audio.length > 200) {
          finalAudioBase64 = audio;
          successfulModel = currentModel;
          break;
        }
      } catch (err: any) {
        console.warn(`TTS attempt with ${currentModel} failed:`, err?.message || err);
        continue;
      }
    }

    if (!finalAudioBase64) {
      // Graceful status 200 client fallback so Cloud Run / Envoy proxy never intercepts with HTML 502 page
      const estSeconds = Math.max(1, Math.round(text.length / 15));
      const fallbackAudio = createFallbackToneWavBase64(estSeconds);
      res.json({
        audioBase64: fallbackAudio,
        mimeType: 'audio/wav',
        model: 'Browser Indian Voice Engine',
        language,
        voiceName: validVoice,
        personaName,
        accentStyle,
        isClientFallback: true,
        notice: 'Playing speech via browser Indian speech engine while remote Gemini limits reset.',
      });
      return;
    }

    res.json({
      audioBase64: ensureWavHeader(finalAudioBase64),
      mimeType: 'audio/wav',
      model: successfulModel,
      language,
      voiceName: validVoice,
      personaName,
      accentStyle,
    });
  } catch (error: any) {
    console.error('TTS handler error:', error);
    const estSeconds = 2;
    const fallbackAudio = createFallbackToneWavBase64(estSeconds);
    res.json({
      audioBase64: fallbackAudio,
      mimeType: 'audio/wav',
      model: 'Browser Indian Voice Engine',
      isClientFallback: true,
      error: error.message || 'Failed to synthesize speech',
    });
  }
});

// Assistant endpoint for script translation and natural regional phrasing
app.post('/api/translate-script', async (req: Request, res: Response): Promise<void> => {
  try {
    const { text, targetLanguage, mode = 'translate' } = req.body;

    if (!text) {
      res.status(400).json({ error: 'Text is required' });
      return;
    }

    if (!aiClient) {
      res.json({ result: text, targetLanguage, mode });
      return;
    }

    const languageNames: Record<string, string> = {
      'indian-english': 'Indian English (with authentic Indian idioms and natural phrasing)',
      'hindi': 'Hindi (हिन्दी) in standard Devanagari script, natural colloquial and authentic',
    };

    const target = languageNames[targetLanguage] || 'Indian English';

    let prompt = '';
    if (mode === 'transliterate') {
      prompt = `Transliterate the following text into phonetic Romanized script for ${target} so that someone can easily read and pronounce it naturally. Output ONLY the transliterated text without commentary.\n\nText: "${text}"`;
    } else if (mode === 'enhance') {
      prompt = `Polish and enhance this text for Indian Text-to-Speech narration in ${target}. Make the pacing natural, ensure correct punctuation for breath pauses, and make it sound authentic and pleasant when spoken aloud. Output ONLY the enhanced script without explanations.\n\nText: "${text}"`;
    } else if (mode === 'pronunciation') {
      prompt = `Optimize the following text for crystal-clear Text-to-Speech pronunciation in ${target}. Detect and phonetically clarify any difficult terms, scientific names (botanical Latin, biological taxa), medical terminology, and acronyms (e.g. respell acronyms like 'ISRO' as 'Iss-roh', or 'DNA' as 'D-N-A', or binomial nomenclature like 'Azadirachta indica' with intuitive phonetic syllabic hyphens) so the TTS engine pronounces them with 100% precision. Do not alter simple conversational words. Output ONLY the pronunciation-optimized script without commentary.\n\nText: "${text}"`;
    } else {
      prompt = `Translate the following text into ${target} suitable for natural Indian speech synthesis. Output ONLY the translated text in proper native script and natural spoken phrasing without quotes, markdown headers, or explanations.\n\nText: "${text}"`;
    }

    // Try multi-model cascade to gracefully handle temporary demand spikes
    const candidateModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];
    let resultText = '';

    for (const m of candidateModels) {
      try {
        const response = await aiClient.models.generateContent({
          model: m,
          contents: prompt,
        });
        const out = response.text?.trim();
        if (out) {
          resultText = out;
          break;
        }
      } catch (err: any) {
        // High-demand 503 spike or quota; continue to next model
        continue;
      }
    }

    res.json({
      result: resultText || text,
      targetLanguage,
      mode,
    });
  } catch (error: any) {
    console.error('Error translating/enhancing script:', error);
    res.json({
      result: req.body?.text || '',
      targetLanguage: req.body?.targetLanguage,
      mode: req.body?.mode,
    });
  }
});

// Serve static assets from public directory
const publicPath = path.resolve(__dirname, 'public');
if (fs.existsSync(publicPath)) {
  app.use(express.static(publicPath));
}

// Setup Vite or static serving
const distPath = path.resolve(__dirname, 'dist');
const isProduction = process.env.NODE_ENV === 'production';

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req: Request, res: Response) => {
    if (req.path.startsWith('/api')) {
      res.status(404).json({ error: 'API route not found' });
      return;
    }
    const indexPath = path.resolve(distPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.sendFile(indexPath);
    } else {
      res.status(503).send('Application assets are readying, please reload.');
    }
  });
} else if (!isProduction) {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: {
      middlewareMode: true,
      hmr: false,
    },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.get('*', (req: Request, res: Response) => {
    if (req.path.startsWith('/api')) {
      res.status(404).json({ error: 'API route not found' });
      return;
    }
    res.status(503).send('Application assets compiling, please reload shortly.');
  });
}

app.listen(port, '0.0.0.0', () => {
  console.log(`DKA -TTS server running on http://0.0.0.0:${port}`);
});
