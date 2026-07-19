'use strict';

/**
 * provider.js
 *
 * Abstract base class for AI providers.
 * Every concrete provider (OpenRouter, Gemini, OpenAI …) must extend this
 * and implement `complete(prompt)`.
 *
 * Contract:
 *   complete(prompt: string) → Promise<{ text: string, model: string, provider: string }>
 *
 * Keeping the abstraction here means:
 *   - aiGenerationService never imports a vendor SDK directly.
 *   - Swapping providers is a one-line config change.
 *   - Background queue workers can call the same interface later.
 */

class AIProvider {
  /** @returns {string} Human-readable name used in generationHistory.provider */
  get name() {
    throw new Error(`${this.constructor.name} must implement get name()`);
  }

  /**
   * Send a prompt to the underlying model and return the raw text response.
   *
   * @param {string} prompt  The fully-built prompt string.
   * @returns {Promise<{ text: string, model: string, provider: string }>}
   */
  // eslint-disable-next-line no-unused-vars
  async complete(prompt) {
    throw new Error(`${this.constructor.name} must implement complete(prompt)`);
  }
}

module.exports = AIProvider;
