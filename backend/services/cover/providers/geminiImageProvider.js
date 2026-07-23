'use strict';

const BaseImageProvider = require('./provider');
const FallbackImageProvider = require('./fallbackImageProvider');
const logger = require('../../../services/logger/logger');

class GeminiImageProvider extends BaseImageProvider {
  constructor() {
    super();
    this.fallback = new FallbackImageProvider();
  }

  get name() {
    return 'gemini';
  }

  isConfigured() {
    return Boolean(process.env.GEMINI_API_KEY);
  }

  async generateImage(prompt, options = {}) {
    if (!this.isConfigured()) {
      return this.fallback.generateImage(prompt, options);
    }

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instances: [{ prompt }],
          parameters: { sampleCount: 1, aspectRatio: '3:4' }
        })
      });

      if (!response.ok) {
        logger.warn({ provider: 'gemini', status: response.status }, `Gemini Imagen API error (${response.status})`);
        return this.fallback.generateImage(prompt, options);
      }

      const data = await response.json();
      const b64 = data?.predictions?.[0]?.bytesBase64Encoded;

      if (!b64) {
        return this.fallback.generateImage(prompt, options);
      }

      const imageUrl = `data:image/png;base64,${b64}`;

      return {
        imageUrl,
        thumbnailUrl: imageUrl,
        provider: 'Google Gemini Imagen',
        model: 'imagen-3.0'
      };
    } catch (err) {
      logger.error({ provider: 'gemini', err: err.message }, 'Gemini Imagen request failed');
      return this.fallback.generateImage(prompt, options);
    }
  }
}

module.exports = GeminiImageProvider;
