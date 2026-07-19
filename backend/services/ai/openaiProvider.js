'use strict';

/**
 * openaiProvider.js
 *
 * AI provider that calls the official OpenAI Chat Completions API.
 *
 * Required env vars:
 *   OPENAI_API_KEY   — your OpenAI secret key
 *   OPENAI_MODEL     — e.g. "gpt-4o-mini" (default below)
 *
 * Docs: https://platform.openai.com/docs/api-reference/chat
 */

const AIProvider = require('./provider');

const BASE_URL = 'https://api.openai.com/v1/chat/completions';
const DEFAULT_MODEL = 'gpt-4o-mini';

class OpenAIProvider extends AIProvider {
  get name() {
    return 'openai';
  }

  /**
   * @param {string} prompt
   * @returns {Promise<{ text: string, model: string, provider: string }>}
   */
  async complete(prompt) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not set in environment variables.');
    }

    const model = process.env.OPENAI_MODEL || DEFAULT_MODEL;

    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`OpenAI API error ${response.status}: ${errorBody}`);
    }

    const json = await response.json();
    const text = json.choices?.[0]?.message?.content ?? '';

    return { text, model, provider: this.name };
  }
}

module.exports = new OpenAIProvider();
