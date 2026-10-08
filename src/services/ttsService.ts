import { GeneratedSpeech, IndianLanguage, SpeechModifiers } from '../types';
import { Mp3Encoder } from '@breezystack/lamejs';

export interface TTSGenerateRequest {
  text: string;
  language: IndianLanguage;
  voiceName: string;
  personaName: string;
  model?: 'gemini-3.8-flash-lite-tts' | 'gemini-3.8-flash-tts';
  stylePrompt?: string;
  speakingRate?: number;
  pitch?: number;
  emotion?: string;
  accentFlavor?: string;
  energy?: 'gentle' | 'balanced' | 'emphatic';
  dialogue?: boolean;
  dialogueSpeakers?: Array<{
    name: string;
    voiceName: string;
    text: string;
    style?: string;
  }>;
}

export interface TTSResponse {
  audioBase64: string;
  mimeType: string;
  model: string;
  language: IndianLanguage;
  voiceName: string;
  personaName: string;
  accentStyle: string;
  isClientFallback?: boolean;
}

export function createToneWavBase64(durationSeconds: number): string {
  const sampleRate = 24000;
  const numSamples = Math.floor(sampleRate * Math.max(1, durationSeconds));
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  // RIFF header
  view.setUint32(0, 0x52494646, false); // "RIFF"
  view.setUint32(4, 36 + numSamples * 2, true);
  view.setUint32(8, 0x57415645, false); // "WAVE"
  // format chunk identifier
  view.setUint32(12, 0x666d7420, false); // "fmt "
  view.setUint32(16, 16, true); // format chunk length
  view.setUint16(20, 1, true); // sample format (raw PCM)
  view.setUint16(22, 1, true); // channel count (mono)
  view.setUint32(24, sampleRate, true); // sample rate
  view.setUint32(28, sampleRate * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  // data chunk identifier
  view.setUint32(36, 0x64617461, false); // "data"
  view.setUint32(40, numSamples * 2, true);

  // Soft pleasant carrier wave
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const envelope = Math.sin((i / numSamples) * Math.PI);
    const sample = Math.sin(2 * Math.PI * 300 * t) * 0.1 * envelope;
    view.setInt16(44 + i * 2, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
  }

  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function speakInBrowser(
  text: string,
  language: IndianLanguage,
  voiceGender = 'Female',
  _personaName?: string,
  rate = 0.95,
  pitch = 1.0
) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);

    const isHindi = language === 'hindi';
    utterance.lang = isHindi ? 'hi-IN' : 'en-IN';
    utterance.rate = Math.max(0.6, Math.min(1.8, rate));
    const basePitch = voiceGender === 'Female' ? 1.05 : 0.92;
    utterance.pitch = Math.max(0.6, Math.min(1.6, basePitch * pitch));

    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      // Find authentic Indian voice
      const indianMatch = voices.find((v) => {
        const langLower = v.lang.toLowerCase();
        const nameLower = v.name.toLowerCase();
        const isIndian = langLower.includes('in') || nameLower.includes('india');
        if (isHindi) {
          return langLower.startsWith('hi') || nameLower.includes('hindi');
        }
        return isIndian && langLower.startsWith('en');
      }) || voices.find((v) => v.lang.includes('IN') || v.name.toLowerCase().includes('india'));

      if (indianMatch) {
        utterance.voice = indianMatch;
      }
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Browser speech synthesis failed:', err);
  }
}

// Quick instant audition of modifier settings (pacing, pitch, cadence)
export function previewSpeechModifier(
  sampleText: string,
  language: IndianLanguage,
  voiceGender: 'Female' | 'Male' = 'Female',
  modifiers: SpeechModifiers
) {
  const pitchMultiplier = 1 + modifiers.pitch * 0.15;
  const textToPlay = sampleText.trim()
    ? sampleText.trim().slice(0, 110)
    : language === 'hindi'
    ? 'नमस्ते, यह भारतीय आवाज़ परीक्षण है।'
    : 'Welcome, testing authentic Indian speech synthesis cadence.';
  speakInBrowser(
    textToPlay,
    language,
    voiceGender,
    undefined,
    modifiers.speakingRate,
    pitchMultiplier
  );
}

export async function generateIndianSpeech(req: TTSGenerateRequest): Promise<TTSResponse> {
  try {
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req),
    });

    const rawText = await response.text();
    let data: any = {};
    try {
      data = rawText ? JSON.parse(rawText) : {};
    } catch {
      data = {};
    }

    if (response.ok && data?.audioBase64) {
      if (data.isClientFallback) {
        speakInBrowser(
          req.text,
          req.language,
          'Female',
          req.personaName,
          req.speakingRate || 0.95,
          req.pitch ? 1 + req.pitch * 0.15 : 1.0
        );
      }
      return data as TTSResponse;
    }

    // If server failed (e.g. rate limit or temporary issue), smoothly fallback to browser Indian speech
    console.info('Using browser speech engine:', data?.notice || data?.error);
    const estSeconds = estimateReadingTimeSeconds(req.text);
    const fallbackAudioBase64 = createToneWavBase64(estSeconds);

    speakInBrowser(
      req.text,
      req.language,
      'Female',
      req.personaName,
      req.speakingRate || 0.95,
      req.pitch ? 1 + req.pitch * 0.15 : 1.0
    );

    return {
      audioBase64: fallbackAudioBase64,
      mimeType: 'audio/wav',
      model: 'Browser Indian Speech Engine',
      language: req.language,
      voiceName: req.voiceName,
      personaName: req.personaName,
      accentStyle: 'Indian Accent (Browser Native)',
      isClientFallback: true,
    };
  } catch (netErr: any) {
    console.warn('Network error during TTS, falling back to browser speech:', netErr);
    const estSeconds = estimateReadingTimeSeconds(req.text);
    const fallbackAudioBase64 = createToneWavBase64(estSeconds);

    speakInBrowser(
      req.text,
      req.language,
      'Female',
      req.personaName,
      req.speakingRate || 0.95,
      req.pitch ? 1 + req.pitch * 0.15 : 1.0
    );

    return {
      audioBase64: fallbackAudioBase64,
      mimeType: 'audio/wav',
      model: 'Browser Indian Speech Engine',
      language: req.language,
      voiceName: req.voiceName,
      personaName: req.personaName,
      accentStyle: 'Indian Accent (Browser Native)',
      isClientFallback: true,
    };
  }
}

export async function processScriptHelper(
  text: string,
  targetLanguage: IndianLanguage,
  mode: 'translate' | 'transliterate' | 'enhance' | 'pronunciation'
): Promise<string> {
  try {
    const response = await fetch('/api/translate-script', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, targetLanguage, mode }),
    });

    const raw = await response.text();
    try {
      const data = JSON.parse(raw);
      return data.result || text;
    } catch {
      return text;
    }
  } catch {
    return text;
  }
}

export function ensureWavBase64(base64: string): string {
  if (base64.startsWith('UklGR')) {
    return base64; // Already has RIFF WAV header
  }
  try {
    const binary = atob(base64);
    const pcmLen = binary.length;
    const buffer = new ArrayBuffer(44 + pcmLen);
    const view = new DataView(buffer);
    const bytes = new Uint8Array(buffer);

    // RIFF identifier
    view.setUint32(0, 0x52494646, false); // "RIFF"
    view.setUint32(4, 36 + pcmLen, true);
    view.setUint32(8, 0x57415645, false); // "WAVE"
    // fmt chunk
    view.setUint32(12, 0x666d7420, false); // "fmt "
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM format
    view.setUint16(22, 1, true); // Mono
    view.setUint32(24, 24000, true); // 24kHz
    view.setUint32(28, 48000, true); // Byte rate (24000 * 2)
    view.setUint16(32, 2, true); // Block align
    view.setUint16(34, 16, true); // Bits per sample
    // data chunk
    view.setUint32(36, 0x64617461, false); // "data"
    view.setUint32(40, pcmLen, true);

    for (let i = 0; i < pcmLen; i++) {
      bytes[44 + i] = binary.charCodeAt(i);
    }

    let result = '';
    for (let i = 0; i < bytes.length; i++) {
      result += String.fromCharCode(bytes[i]);
    }
    return btoa(result);
  } catch {
    return base64;
  }
}

export function base64ToBlobUrl(base64: string, mimeType = 'audio/wav'): string {
  const wavBase64 = ensureWavBase64(base64);
  const byteCharacters = atob(wavBase64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
}

// Convert WAV PCM bytes into standard MP3 Blob using lamejs
export async function wavToMp3Blob(base64OrArrayBuffer: string | ArrayBuffer): Promise<Blob> {
  let arrayBuffer: ArrayBuffer;
  if (typeof base64OrArrayBuffer === 'string') {
    const binary = atob(base64OrArrayBuffer);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    arrayBuffer = bytes.buffer;
  } else {
    arrayBuffer = base64OrArrayBuffer;
  }

  let samples: Int16Array;
  let sampleRate = 24000;

  // Attempt standard AudioContext decoding for utmost fidelity
  let decodedSuccess = false;
  if (typeof window !== 'undefined' && (window.AudioContext || (window as any).webkitAudioContext)) {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0));
      sampleRate = audioBuffer.sampleRate;
      const channelData = audioBuffer.getChannelData(0);
      samples = new Int16Array(channelData.length);
      for (let i = 0; i < channelData.length; i++) {
        const s = Math.max(-1, Math.min(1, channelData[i]));
        samples[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
      }
      ctx.close();
      decodedSuccess = true;
    } catch {
      decodedSuccess = false;
    }
  }

  // Fallback: direct WAV extraction from RIFF headers
  if (!decodedSuccess) {
    const view = new DataView(arrayBuffer);
    sampleRate = view.getUint32(24, true) || 24000;
    // Find data chunk
    let offset = 12;
    while (offset < view.byteLength - 8) {
      const chunkId = String.fromCharCode(
        view.getUint8(offset),
        view.getUint8(offset + 1),
        view.getUint8(offset + 2),
        view.getUint8(offset + 3)
      );
      const chunkSize = view.getUint32(offset + 4, true);
      if (chunkId === 'data') {
        offset += 8;
        break;
      }
      offset += 8 + chunkSize;
    }
    const numSamples = Math.floor((arrayBuffer.byteLength - offset) / 2);
    samples = new Int16Array(Math.max(0, numSamples));
    for (let i = 0; i < numSamples; i++) {
      samples[i] = view.getInt16(offset + i * 2, true);
    }
  }

  // Encode to MP3 at 128kbps mono
  const mp3encoder = new Mp3Encoder(1, sampleRate, 128);
  const mp3Data: Uint8Array[] = [];
  const sampleBlockSize = 1152;

  for (let i = 0; i < samples!.length; i += sampleBlockSize) {
    const chunk = samples!.subarray(i, i + sampleBlockSize);
    const mp3buf = mp3encoder.encodeBuffer(chunk);
    if (mp3buf.length > 0) {
      mp3Data.push(new Uint8Array(mp3buf));
    }
  }

  const mp3buf = mp3encoder.flush();
  if (mp3buf.length > 0) {
    mp3Data.push(new Uint8Array(mp3buf));
  }

  return new Blob(mp3Data as BlobPart[], { type: 'audio/mp3' });
}

// Download MP3 audio
export async function downloadMp3File(base64: string, filename = 'dka-tts-speech.mp3') {
  const cleanFilename = filename.endsWith('.mp3')
    ? filename
    : filename.replace(/\.[^/.]+$/, '') + '.mp3';

  const blob = await wavToMp3Blob(base64);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = cleanFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

// Backward-compatible alias
export const downloadAudioFile = downloadMp3File;
export const downloadWavFile = downloadMp3File;

// Clean up any bloated historical localStorage keys to free browser storage
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.removeItem('vani_speech_history_v1');
    window.localStorage.removeItem('vani_speech_history');
    window.localStorage.removeItem('dka_speech_history_v1');
  }
} catch {
  // Ignore quota errors from reading/cleaning localStorage
}

// In-Memory cache for lightning-fast responsive UI
let inMemoryHistory: GeneratedSpeech[] = [];

const DB_NAME = 'dka_tts_db_v1';
const STORE_NAME = 'audio_history';
const DB_VERSION = 1;

function getIndexedDB(): IDBFactory | null {
  if (typeof window === 'undefined') return null;
  return window.indexedDB || (window as any).mozIndexedDB || (window as any).webkitIndexedDB || null;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const idb = getIndexedDB();
    if (!idb) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = idb.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Asynchronously loads full history from IndexedDB into memory
export async function loadSpeechHistory(): Promise<GeneratedSpeech[]> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = () => {
        const items: GeneratedSpeech[] = req.result || [];
        items.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        inMemoryHistory = items.slice(0, 50);
        resolve(inMemoryHistory);
      };

      req.onerror = () => {
        resolve(inMemoryHistory);
      };
    });
  } catch (err) {
    console.warn('Could not read from IndexedDB, using memory cache:', err);
    return inMemoryHistory;
  }
}

// Returns in-memory history synchronously
export function getSavedSpeechHistory(): GeneratedSpeech[] {
  return inMemoryHistory;
}

// Saves item into in-memory store immediately and persists to IndexedDB
export function saveSpeechToHistory(item: GeneratedSpeech): GeneratedSpeech[] {
  inMemoryHistory = [item, ...inMemoryHistory.filter((x) => x.id !== item.id)].slice(0, 50);

  // Background async persistence to IndexedDB (virtually unlimited quota for audio)
  openDB()
    .then((db) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(item);
    })
    .catch((err) => {
      console.warn('Background IndexedDB write failed:', err);
    });

  return inMemoryHistory;
}

// Deletes item from in-memory store and removes from IndexedDB
export function deleteSpeechFromHistory(id: string): GeneratedSpeech[] {
  inMemoryHistory = inMemoryHistory.filter((x) => x.id !== id);

  openDB()
    .then((db) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.delete(id);
    })
    .catch((err) => {
      console.warn('Background IndexedDB delete failed:', err);
    });

  return inMemoryHistory;
}

// Clears all saved speech history
export function clearSpeechHistory(): void {
  inMemoryHistory = [];

  openDB()
    .then((db) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.clear();
    })
    .catch((err) => {
      console.warn('Background IndexedDB clear failed:', err);
    });
}

// Estimate reading duration: Average spoken speed in India is ~135 words/minute
export function estimateReadingTimeSeconds(text: string): number {
  if (!text || !text.trim()) return 0;
  const words = text.trim().split(/\s+/).length;
  // ~2.25 words per second
  return Math.max(1, Math.round(words / 2.25));
}
