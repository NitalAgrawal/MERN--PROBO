'use strict';

const crypto = require('crypto');
const { buildCoverPrompt, getSupportedStyles } = require('./coverPromptBuilder');

// Import providers
const OpenAIImageProvider = require('./providers/openaiImageProvider');
const GeminiImageProvider = require('./providers/geminiImageProvider');
const StabilityImageProvider = require('./providers/stabilityImageProvider');
const IdeogramImageProvider = require('./providers/ideogramImageProvider');
const FallbackImageProvider = require('./providers/fallbackImageProvider');

// Provider instances map
const providersMap = {
  openai: new OpenAIImageProvider(),
  gemini: new GeminiImageProvider(),
  stability: new StabilityImageProvider(),
  ideogram: new IdeogramImageProvider(),
  fallback: new FallbackImageProvider()
};

/**
 * Compute SHA-256 hash of key story attributes for generation caching.
 *
 * @param {Object} story
 * @returns {string} SHA-256 hash in hex format.
 */
function computeStoryHash(story) {
  const title = (story.title || '').trim().toLowerCase();
  const subject = (story.subject || '').trim().toLowerCase();
  const relationship = (story.relationship || '').trim().toLowerCase();
  const bookSummary = (
    story.generatedBook?.dedication ||
    story.subtitle ||
    (story.generatedBook?.chapters?.[0]?.content?.[0] || '')
  ).trim().toLowerCase();

  const payload = `${title}|${subject}|${relationship}|${bookSummary}`;
  return crypto.createHash('sha256').update(payload).digest('hex');
}

/**
 * Generate a new cover concept for a story (or return cached identical generation).
 *
 * @param {Object} story  Mongoose story document.
 * @param {Object} [params]
 * @param {string} [params.style='Classic Memoir']
 * @param {string} [params.provider='openai']
 * @param {string} [params.customInstructions='']
 * @returns {Promise<{ cover: Object, cached: boolean }>}
 */
async function generateCover(story, params = {}) {
  const style = params.style || 'Classic Memoir';
  const providerKey = (params.provider || 'openai').toLowerCase();
  const customInstructions = params.customInstructions || '';

  const hash = computeStoryHash(story);

  // 1. Caching check: Check if identical cover exists in history
  const cachedCover = (story.coverHistory || []).find(
    c => c.hash === hash && c.style === style && c.provider === providerKey
  );

  if (cachedCover && !params.forceRefresh) {
    return { cover: cachedCover, cached: true };
  }

  // 2. Select AI Provider
  const provider = providersMap[providerKey] || providersMap.fallback;

  // 3. Build Prompt
  const prompt = buildCoverPrompt(story, style, customInstructions);

  // 4. Generate Image via Provider
  const result = await provider.generateImage(prompt, {
    style,
    title: story.title,
    subtitle: story.subtitle || story.subject
  });

  const coverId = `cover_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

  const newCover = {
    id: coverId,
    style,
    prompt,
    provider: providerKey,
    imageUrl: result.imageUrl,
    thumbnailUrl: result.thumbnailUrl || result.imageUrl,
    hash,
    createdAt: new Date()
  };

  // 5. Append to Cover History
  story.coverHistory.push(newCover);

  // If no active cover exists, make this the active cover
  if (!story.activeCover) {
    story.activeCover = newCover;
    story.coverImage = newCover.imageUrl;
  }

  await story.save();

  return { cover: newCover, cached: false };
}

/**
 * Get cover history and active cover for a story.
 *
 * @param {Object} story
 * @returns {{ coverHistory: Array, activeCover: Object|null }}
 */
function getCovers(story) {
  return {
    coverHistory: story.coverHistory || [],
    activeCover: story.activeCover || null
  };
}

/**
 * Select active cover by cover ID.
 *
 * @param {Object} story  Mongoose story document.
 * @param {string} coverId
 * @returns {Promise<Object>} Updated active cover.
 */
async function selectActiveCover(story, coverId) {
  const targetCover = (story.coverHistory || []).find(
    c => c.id === coverId || c._id?.toString() === coverId
  );

  if (!targetCover) {
    const error = new Error('Cover concept not found in story history.');
    error.statusCode = 404;
    throw error;
  }

  story.activeCover = targetCover;
  story.coverImage = targetCover.imageUrl;

  await story.save();

  return story.activeCover;
}

module.exports = {
  computeStoryHash,
  generateCover,
  getCovers,
  selectActiveCover,
  getSupportedStyles,
  providersMap
};
