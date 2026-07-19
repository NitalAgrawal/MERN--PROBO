'use strict';

/**
 * aiGenerationService.js
 *
 * Orchestrates the full memoir generation pipeline.
 *
 * Flow:
 *   Controller  →  generateBook()  →  Provider  →  DB write
 *
 * This layer owns:
 *   • 409 Conflict guard (no concurrent generation)
 *   • Fetching memories sorted by order
 *   • Building the prompt via the versioned prompt builder
 *   • Delegating the LLM call to the active provider
 *   • Persisting generatedBook on the Story document
 *   • Appending an immutable entry to generationHistory
 *
 * Keeping all of this here means:
 *   - The controller stays thin (validate → call service → respond)
 *   - A future background queue can import and call generateBook() directly
 *     without touching the HTTP layer at all.
 *
 * Active provider is resolved from AI_PROVIDER env var:
 *   openrouter (default) | gemini | openai
 */

const Story  = require('../../models/Story');
const Memory = require('../../models/Memory');
const AppError = require('../../utils/AppError');
const HTTP_STATUS = require('../../constants/httpStatus');
const { buildBookPrompt } = require('../../prompts/memoirPrompt.v1');

// ── Provider registry ──────────────────────────────────────────────────────
const PROVIDERS = {
  openrouter: () => require('./openrouterProvider'),
  gemini:     () => require('./geminiProvider'),
  openai:     () => require('./openaiProvider')
};

/**
 * Resolve the active provider from env.  Defaults to openrouter.
 * Lazy-requires so unused providers never throw on missing API keys at boot.
 *
 * @returns {import('./provider')}
 */
const getProvider = () => {
  const key = (process.env.AI_PROVIDER || 'openrouter').toLowerCase();
  const factory = PROVIDERS[key];
  if (!factory) {
    throw new AppError(
      `Unknown AI_PROVIDER "${key}". Valid values: ${Object.keys(PROVIDERS).join(', ')}.`,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
  return factory();
};

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Parse the raw LLM text into a structured book object.
 * Strips accidental markdown fences before JSON.parse().
 *
 * @param {string} text
 * @returns {object}
 */
const parseBookJson = (text) => {
  // Strip ```json ... ``` wrappers if the model added them anyway
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    throw new AppError(
      'AI returned invalid JSON. The response could not be parsed.',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};

// ── Main export ────────────────────────────────────────────────────────────

/**
 * Generate a memoir book for a story.
 *
 * @param {string} userId   Authenticated user's ObjectId (string)
 * @param {string} storyId  Target story's ObjectId (string)
 * @returns {Promise<object>}  The updated story plain object
 */
const generateBook = async (userId, storyId) => {
  // 1. Load the story (ownership check)
  const story = await Story.findOne({ _id: storyId, owner: userId });
  if (!story) {
    throw new AppError(
      'Story not found or you do not have access.',
      HTTP_STATUS.NOT_FOUND
    );
  }

  // 2. ── 409 Conflict guard ─────────────────────────────────────────────
  //    Never allow two generation runs to overlap on the same story.
  if (story.status === 'Generating') {
    throw new AppError(
      'Generation already in progress for this story.',
      HTTP_STATUS.CONFLICT
    );
  }

  // 3. Load memories sorted by user-defined order
  const memories = await Memory.find({ storyId: story._id })
    .sort({ order: 1 })
    .lean();

  if (memories.length === 0) {
    throw new AppError(
      'Cannot generate a book with no memories. Add at least one memory first.',
      HTTP_STATUS.BAD_REQUEST
    );
  }

  // 4. Build the prompt from the versioned template (no hardcoded strings here)
  const { prompt, promptVersion } = buildBookPrompt(story, memories);

  // 5. Mark as Generating so concurrent requests are rejected
  story.status = 'Generating';
  story.lastEdited = Date.now();
  await story.save();

  // 6. Call the provider — wrapped so we can reset status on failure
  const provider = getProvider();
  const startTime = Date.now();
  let rawResponse;
  let modelUsed;
  let providerName;

  try {
    const result = await provider.complete(prompt);
    rawResponse  = result.text;
    modelUsed    = result.model;
    providerName = result.provider;
  } catch (providerError) {
    // Reset status so the user can retry
    story.status = 'Collecting Memories';
    await story.save();
    throw providerError; // propagate to global error handler
  }

  const generationTime = Date.now() - startTime; // ms

  // 7. Parse the raw JSON response into a structured book
  const bookData = parseBookJson(rawResponse);

  // 8. Persist generatedBook (replaces any previous version)
  story.generatedBook = {
    dedication:  bookData.dedication  ?? '',
    chapters:    bookData.chapters    ?? [],
    reflection:  bookData.reflection  ?? { title: '', content: [] },
    readingTime: bookData.readingTime ?? '',
    generatedAt: new Date(),
    aiVersion:   promptVersion,
    aiMetadata: {
      model:          modelUsed,
      promptVersion,
      generationTime
    }
  };

  // 9. Append an immutable audit entry to generationHistory
  //    (separate from generatedBook — never overwritten, always appended)
  story.generationHistory.push({
    prompt,
    rawResponse,
    provider:       providerName,
    model:          modelUsed,
    generationTime,
    createdAt:      new Date()
  });

  // 10. Mark as Ready and persist
  story.status = 'Ready';
  story.lastEdited = Date.now();
  await story.save();

  return story.toJSON();
};

module.exports = { generateBook };
