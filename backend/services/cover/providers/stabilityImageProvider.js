'use strict';

const BaseImageProvider = require('./provider');
const FallbackImageProvider = require('./fallbackImageProvider');
const logger = require('../../../services/logger/logger');

class StabilityImageProvider extends BaseImageProvider {
  constructor() {
    super();
    this.fallback = new FallbackImageProvider();
  }

  get name() {
    return 'stability';
  }

  isConfigured() {
    return Boolean(process.env.STABILITY_API_KEY);
  }

  async generateImage(prompt, options = {}) {
    if (!this.isConfigured()) {
      return this.fallback.generateImage(prompt, options);
    }

    try {
      const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${process.env.STABILITY_API_KEY}`
        },
        body: JSON.stringify({
          text_prompts: [{ text: prompt, weight: 1 }],
          cfg_scale: 7,
          height: 1024,
          width: 768,
          samples: 1
        })
      });

      if (!response.ok) {
        logger.warn({ provider: 'stability', status: response.status }, `Stability API error (${response.status})`);
        return this.fallback.generateImage(prompt, options);
      }

      const data = await response.json();
      const b64 = data?.artifacts?.[0]?.base64;

      if (!b64) {
        return this.fallback.generateImage(prompt, options);
      }

      const imageUrl = `data:image/png;base64,${b64}`;

      return {
        imageUrl,
        thumbnailUrl: imageUrl,
        provider: 'Stability AI SDXL',
        model: 'sdxl-1.0'
      };
    } catch (err) {
      logger.error({ provider: 'stability', err: err.message }, 'Stability AI request failed');
      return this.fallback.generateImage(prompt, options);
    }
  }
}

module.exports = StabilityImageProvider;
