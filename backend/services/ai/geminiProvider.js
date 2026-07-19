'use strict';

/**
 * geminiProvider.js
 *
 * AI provider that calls Google Gemini via the REST API.
 *
 * Required env vars:
 *   GEMINI_API_KEY   — your Google AI Studio key
 *   GEMINI_MODEL     — e.g. "gemini-1.5-flash" (default below)
 *
 * Docs: https://ai.google.dev/api/generate-content
 */

const AIProvider = require('./provider');

const DEFAULT_MODEL = 'gemini-1.5-flash';

class GeminiProvider extends AIProvider {
  get name() {
    return 'gemini';
  }

  /**
   * @param {string} prompt
   * @returns {Promise<{ text: string, model: string, provider: string }>}
   */
  async complete(prompt) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set in environment variables.');
    }

    const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.8 }
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Gemini API error ${response.status}: ${errorBody}`);
    }

    const json = await response.json();
    const text =
      json.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    return { text, model, provider: this.name };
  }
}

module.exports = new GeminiProvider();
