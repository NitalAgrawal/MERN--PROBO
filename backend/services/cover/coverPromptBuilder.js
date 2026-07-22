'use strict';

/**
 * coverPromptBuilder.js
 *
 * Constructs rich, artistic image prompts tailored to a story's subject,
 * title, relationship, book summary, and the selected cover style.
 */

const STYLE_PROMPTS = {
  'Classic Memoir': 
    'A timeless and elegant memoir book cover aesthetic, featuring soft linen textures, understated gold foil typography accents, warm sepia tones, and an evocative, nostalgic illustration representing memory and life reflection.',
  
  'Vintage Album': 
    'A classic retro vintage photo album book cover aesthetic, featuring aged leather paper texture, warm muted pastel tones, analog film grain, subtle corner gilding, and an artistic archival vignette.',
  
  'Minimalist': 
    'A ultra-clean modern minimalist book cover design, featuring generous negative space, sophisticated muted tone color palettes, clean geometric linework, and sleek contemporary typography framing a single poignant focal element.',
  
  'Watercolor': 
    'An expressive handwritten watercolor artwork book cover design, featuring soft paint splashes, translucent color washes, gentle organic gradients, soft deckled edge paper textures, and elegant fluid brush strokes.',
  
  'Modern Hardcover': 
    'A premium contemporary hardcover book cover, featuring crisp color blocking, modern architectural lines, rich tactile matte texture, bold elegant typography, and striking modern art composition.',
  
  "Children's Storybook": 
    'A charming, whimsical children\'s storybook cover illustration, vibrant joyful color palette, soft hand-drawn character details, gentle magical glows, inviting storybook warmth, and playful artistic imagination.',
  
  'Handwritten Journal': 
    'An intimate personal keepsake journal book cover, featuring warm kraft paper texture, subtle hand-stitched leather border details, botanical ink sketches, warm candlelight tones, and authentic handwritten aesthetic.'
};

const DEFAULT_STYLE = 'Classic Memoir';

/**
 * Build a detailed AI image generation prompt for a story cover.
 *
 * @param {Object} story  The story Mongoose document or object.
 * @param {string} [styleName='Classic Memoir']  One of the 7 supported styles.
 * @param {string} [customInstructions='']  Optional user prompt additions.
 * @returns {string} Fully formulated visual prompt.
 */
function buildCoverPrompt(story, styleName = DEFAULT_STYLE, customInstructions = '') {
  const title = story.title || 'Personal Story';
  const subject = story.subject || 'Family Memories';
  const relationship = story.relationship || '';
  const summary = story.generatedBook?.dedication || story.subtitle || '';

  const styleDirective = STYLE_PROMPTS[styleName] || STYLE_PROMPTS[DEFAULT_STYLE];

  let prompt = `High quality professional book cover art for a book titled "${title}". `;
  prompt += `Theme and Subject: ${subject}`;
  if (relationship) {
    prompt += ` (${relationship})`;
  }
  prompt += `. `;

  if (summary) {
    prompt += `Story Mood: "${summary.slice(0, 150)}". `;
  }

  prompt += `Visual Style: ${styleDirective} `;
  prompt += `Art direction: Centered composition, clear margins suitable for book front cover printing, no random text artifacts, highly detailed 8k resolution artistic illustration.`;

  if (customInstructions && customInstructions.trim()) {
    prompt += ` Additional detail: ${customInstructions.trim()}`;
  }

  return prompt;
}

/**
 * Get available styles with metadata for UI.
 */
function getSupportedStyles() {
  return [
    { id: 'Classic Memoir', label: 'Classic Memoir', description: 'Timeless linen, gold foil accents, nostalgic sepia mood' },
    { id: 'Vintage Album', label: 'Vintage Album', description: 'Retro photo album style with aged paper and film grain' },
    { id: 'Minimalist', label: 'Minimalist', description: 'Sleek negative space, geometric symmetry, clean lines' },
    { id: 'Watercolor', label: 'Watercolor', description: 'Expressive translucent paints, soft splashes and organic washes' },
    { id: 'Modern Hardcover', label: 'Modern Hardcover', description: 'Bold contemporary color blocking and sharp architectural art' },
    { id: "Children's Storybook", label: "Children's Storybook", description: 'Whimsical, colorful hand-drawn illustration with magical warmth' },
    { id: 'Handwritten Journal', label: 'Handwritten Journal', description: 'Intimate kraft paper, botanical ink sketches, leather stitching' }
  ];
}

module.exports = {
  buildCoverPrompt,
  getSupportedStyles,
  STYLE_PROMPTS
};
