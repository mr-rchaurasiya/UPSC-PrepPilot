import dotenv from 'dotenv';

dotenv.config();

const GROQ_MODELS = [
  'openai/gpt-oss-120b',
  'qwen/qwen3.8-27b',
  'openai/gpt-oss-20b',
  'qwen/qwen3.6-27b',
  'groq/compound'
];

/**
 * Robust caller for Groq Cloud API with model fallback
 * @param {Array<{role: string, content: string}>} messages - Chat messages
 * @param {object} options - Options including timeout, max_tokens, jsonMode, temperature
 * @returns {Promise<string|null>} Generated response text or null if failed
 */
export async function generateWithGroq(messages, options = {}) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    return null;
  }

  const timeoutMs = options.timeoutMs || 12000;
  const isJson = options.jsonMode || false;
  const temperature = options.temperature ?? 0.3;
  const maxTokens = options.maxTokens || 1500;

  for (const model of GROQ_MODELS) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const requestBody = {
        model,
        messages,
        temperature,
        max_tokens: maxTokens
      };

      if (isJson) {
        requestBody.response_format = { type: 'json_object' };
      }

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey.trim()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errText = await response.text();
        console.warn(`[Groq] Model ${model} returned ${response.status}: ${errText.slice(0, 120)}`);
        continue; // Try fallback model
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (content) {
        return content;
      }
    } catch (err) {
      console.warn(`[Groq] Error with ${model}:`, err.message);
    }
  }

  return null;
}
