'use strict';

const BaseImageProvider = require('./provider');
const FallbackImageProvider = require('./fallbackImageProvider');
const logger = require('../../../services/logger/logger');

class IdeogramImageProvider extends BaseImageProvider {
  constructor() {
    super();
    this.fallback = new FallbackImageProvider();
  }

  get name() {
    return 'ideogram';
  }

  isConfigured() {
    return Boolean(process.env.IDEOGRAM_API_KEY);
  }

  async generateImage(prompt, options = {}) {
    if (!this.isConfigured()) {
      return this.fallback.generateImage(prompt, options);
    }

    try {
      const response = await fetch('https://api.ideogram.ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Api-Key': process.env.IDEOGRAM_API_KEY
        },
        body: JSON.stringify({
          image_request: {
            prompt,
            aspect_ratio: 'ASPECT_3_4',
            model: 'V_2'
          }
        })
      });

      if (!response.ok) {
        logger.warn({ provider: 'ideogram', status: response.status }, `Ideogram API error (${response.status})`);
        return this.fallback.generateImage(prompt, options);
      }

      const data = await response.json();
      const imageUrl = data?.data?.[0]?.url;

      if (!imageUrl) {
        return this.fallback.generateImage(prompt, options);
      }

      return {
        imageUrl,
        thumbnailUrl: imageUrl,
        provider: 'Ideogram AI',
        model: 'v2'
      };
    } catch (err) {
      logger.error({ provider: 'ideogram', err: err.message }, 'Ideogram API request failed');
      return this.fallback.generateImage(prompt, options);
    }
  }
}

module.exports = IdeogramImageProvider;
