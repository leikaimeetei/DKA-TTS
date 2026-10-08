import type { Handler } from '@netlify/functions';

export const handler: Handler = async () => {
  const apiKey = process.env.GEMINI_API_KEY || '';
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
    },
    body: JSON.stringify({
      status: 'ok',
      hasApiKey: Boolean(apiKey),
      platform: 'netlify',
    }),
  };
};
