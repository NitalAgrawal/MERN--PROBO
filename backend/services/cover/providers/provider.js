'use strict';

/**
 * provider.js
 *
 * Abstract base class for Image Generation Providers.
 * Every concrete provider (OpenAI, Gemini, Stability, Ideogram, Fallback)
 * extends BaseImageProvider and implements `generateImage(prompt, options)`.
 *
 * Contract:
 *   generateImage(prompt: string, options: Object)
 *     → Promise<{ imageUrl: string, thumbnailUrl: string, provider: string, model: string }>
 */

class BaseImageProvider {
  get name() {
    throw new Error(`${this.constructor.name} must implement get name()`);
  }

  /**
   * Check if this provider has required API keys configured.
   * @returns {boolean}
   */
  isConfigured() {
    return false;
  }

  /**
   * Generate an image from a prompt string.
   *
   * @param {string} prompt
   * @param {Object} [options]
   * @returns {Promise<{ imageUrl: string, thumbnailUrl: string, provider: string, model: string }>}
   */
  // eslint-disable-next-line no-unused-vars
  async generateImage(prompt, options = {}) {
    throw new Error(`${this.constructor.name} must implement generateImage(prompt, options)`);
  }
}

module.exports = BaseImageProvider;
