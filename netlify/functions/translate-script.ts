import type { Handler, HandlerEvent } from '@netlify/functions';
import { GoogleGenAI } from '@google/genai';

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

  const { text, targetLanguage = 'indian-english', mode = 'translate' } = body;

  if (!text) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Text is required' }),
    };
  }

  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!apiKey) {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ result: text, targetLanguage, mode }),
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

  const languageNames: Record<string, string> = {
    'indian-english': 'Indian English (with authentic Indian idioms and natural phrasing)',
    hindi: 'Hindi (हिन्दी) in standard Devanagari script, natural colloquial and authentic',
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
    } catch {
      continue;
    }
  }

  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify({
      result: resultText || text,
      targetLanguage,
      mode,
    }),
  };
};
