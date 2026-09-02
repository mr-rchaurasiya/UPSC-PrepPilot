import dotenv from 'dotenv';

dotenv.config();

const GEMINI_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.6-flash',
  'gemini-3.7-flash'
];

/**
 * Robust caller for Google Generative AI REST API with model fallback
 * @param {string} prompt - Prompt text to generate content from
 * @param {object} options - Options including timeout and response_mime_type
 * @returns {Promise<string|null>} Generated text or null if failed
 */
export async function generateWithGemini(prompt, options = {}) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    return null;
  }

  const timeoutMs = options.timeoutMs || 10000;
  const isJson = options.jsonMode || false;

  for (const model of GEMINI_MODELS) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;
      
      const requestBody = {
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      };

      if (isJson) {
        requestBody.generationConfig = {
          responseMimeType: 'application/json'
        };
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errText = await response.text();
        console.warn(`[Gemini] Model ${model} returned ${response.status}: ${errText.slice(0, 100)}`);
        continue; // Try next model in sequence
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        return text;
      }
    } catch (err) {
      console.warn(`[Gemini] Error with ${model}:`, err.message);
    }
  }

  return null;
}
