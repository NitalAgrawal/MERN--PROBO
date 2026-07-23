'use strict';

const BaseImageProvider = require('./provider');
const FallbackImageProvider = require('./fallbackImageProvider');
const logger = require('../../../services/logger/logger');

class OpenAIImageProvider extends BaseImageProvider {
  constructor() {
    super();
    this.fallback = new FallbackImageProvider();
  }

  get name() {
    return 'openai';
  }

  isConfigured() {
    return Boolean(process.env.OPENAI_API_KEY);
  }

  async generateImage(prompt, options = {}) {
    if (!this.isConfigured()) {
      return this.fallback.generateImage(prompt, options);
    }

    try {
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: prompt.slice(0, 1000),
          n: 1,
          size: '1024x1024',
          quality: 'standard'
        })
      });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        logger.warn({ provider: 'openai', status: response.status, errorJson }, `OpenAI image generation API error (${response.status})`);
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
        provider: 'OpenAI DALL-E 3',
        model: 'dall-e-3'
      };
    } catch (err) {
      logger.error({ provider: 'openai', err: err.message }, 'OpenAI image generation request failed');
      return this.fallback.generateImage(prompt, options);
    }
  }
}

module.exports = OpenAIImageProvider;
