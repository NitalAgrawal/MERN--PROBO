'use strict';

/**
 * openrouterProvider.js
 *
 * AI provider that calls OpenRouter's OpenAI-compatible REST API.
 * OpenRouter routes requests to 100+ models (Claude, Llama, Mistral, etc.)
 * from a single API key — ideal as the primary provider.
 *
 * Required env vars:
 *   OPENROUTER_API_KEY   — your OpenRouter secret key
 *   OPENROUTER_MODEL     — e.g. "anthropic/claude-3-haiku"  (default below)
 *
 * Docs: https://openrouter.ai/docs
 */

const AIProvider = require('./provider');

const BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'anthropic/claude-3-haiku';

class OpenRouterProvider extends AIProvider {
  get name() {
    return 'openrouter';
  }

  /**
   * @param {string} prompt
   * @returns {Promise<{ text: string, model: string, provider: string }>}
   */
  async complete(prompt) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error('OPENROUTER_API_KEY is not set in environment variables.');
    }

    const model = process.env.OPENROUTER_MODEL || DEFAULT_MODEL;

    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.CLIENT_URL || 'http://localhost:5173',
        'X-Title': 'FavBook Memoir Generator'
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `OpenRouter API error ${response.status}: ${errorBody}`
      );
    }

    const json = await response.json();
    const text = json.choices?.[0]?.message?.content ?? '';

    return { text, model, provider: this.name };
  }
}

module.exports = new OpenRouterProvider();
