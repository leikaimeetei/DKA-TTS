import type { Handler, HandlerEvent } from '@netlify/functions';
import { GoogleGenAI } from '@google/genai';

// Helper to extract audioBase64 from any part of candidate
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

// Indian accent prompt builder
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

// Fallback WAV generator if remote limits are reached
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
    view.setInt16(44 + i * 2, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
  }

  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return Buffer.from(binary, 'binary').toString('base64');
}

// Ensure 44-byte RIFF header is present
function ensureWavHeader(base64Data: string): string {
  const buf = Buffer.from(base64Data, 'base64');
  if (
    buf.length >= 12 &&
    buf.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buf.subarray(8, 12).toString('ascii') === 'WAVE'
  ) {
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
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write('data', 36);
  header.writeUInt32LE(buf.length, 40);

  return Buffer.concat([header, buf]).toString('base64');
}

// Concatenate two base64 audio clips with subtle breathing pause
function concatAudioBase64(audio1: string, audio2: string): string {
  const buf1 = Buffer.from(audio1, 'base64');
  const buf2 = Buffer.from(audio2, 'base64');

  const pcm1 =
    buf1.length >= 44 && buf1.subarray(0, 4).toString('ascii') === 'RIFF'
      ? buf1.subarray(44)
      : buf1;
  const pcm2 =
    buf2.length >= 44 && buf2.subarray(0, 4).toString('ascii') === 'RIFF'
      ? buf2.subarray(44)
      : buf2;

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

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: CORS_HEADERS,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  let body: any = {};
  try {
    const rawBody = event.isBase64Encoded
      ? Buffer.from(event.body || '', 'base64').toString('utf8')
      : event.body || '{}';
    body = JSON.parse(rawBody);
  } catch {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Invalid JSON request body' }),
    };
  }

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
  } = body;

  if (!text && (!dialogue || !dialogueSpeakers.length)) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        error: 'Text or dialogue lines are required for speech synthesis',
      }),
    };
  }

  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!apiKey) {
    const estSeconds = Math.max(1, Math.round((text || '').length / 15));
    const fallbackAudio = createFallbackToneWavBase64(estSeconds);
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        audioBase64: fallbackAudio,
        mimeType: 'audio/wav',
        model: 'Browser Indian Voice Engine',
        language,
        voiceName,
        personaName,
        accentStyle: 'Native Browser Speech',
        isClientFallback: true,
        notice:
          'Netlify: GEMINI_API_KEY is not set in Netlify environment variables. Playing via browser Indian speech engine.',
      }),
    };
  }

  const aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build-netlify',
      },
    },
  });

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
        return {
          statusCode: 200,
          headers: CORS_HEADERS,
          body: JSON.stringify({
            audioBase64,
            mimeType: 'audio/wav',
            model: 'gemini-3.8-flash-tts',
            language,
            voiceName: `${speaker1.voiceName} & ${speaker2.voiceName}`,
            personaName: `${speaker1.name} & ${speaker2.name}`,
            accentStyle,
          }),
        };
      }
    } catch {
      // Fall through to dual sequential
    }

    // Strategy B: Dual generation with Gemini 2.5 flash preview
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
        return {
          statusCode: 200,
          headers: CORS_HEADERS,
          body: JSON.stringify({
            audioBase64: combinedAudio,
            mimeType: 'audio/wav',
            model: 'gemini-2.5-flash-preview-tts',
            language,
            voiceName: `${speaker1.voiceName} & ${speaker2.voiceName}`,
            personaName: `${speaker1.name} & ${speaker2.name}`,
            accentStyle,
          }),
        };
      }
    } catch {
      // Fall through to fallback
    }
  }

  // Single speaker synthesis
  const validVoice = ['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'].includes(voiceName)
    ? voiceName
    : 'Kore';

  const modelsToTry = ['gemini-3.8-flash-lite-tts', 'gemini-3.8-flash-tts'];

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
    } catch {
      continue;
    }
  }

  if (!finalAudioBase64) {
    const estSeconds = Math.max(1, Math.round(text.length / 15));
    const fallbackAudio = createFallbackToneWavBase64(estSeconds);
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        audioBase64: fallbackAudio,
        mimeType: 'audio/wav',
        model: 'Browser Indian Voice Engine',
        language,
        voiceName: validVoice,
        personaName,
        accentStyle,
        isClientFallback: true,
        notice:
          'Playing speech via browser Indian speech engine while remote Gemini limits reset.',
      }),
    };
  }

  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify({
      audioBase64: ensureWavHeader(finalAudioBase64),
      mimeType: 'audio/wav',
      model: successfulModel,
      language,
      voiceName: validVoice,
      personaName,
      accentStyle,
    }),
  };
};
