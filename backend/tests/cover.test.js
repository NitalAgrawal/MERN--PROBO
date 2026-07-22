'use strict';

const assert = require('assert');
const { buildCoverPrompt, getSupportedStyles } = require('../services/cover/coverPromptBuilder');
const coverService = require('../services/cover/coverService');

console.log('--- Running Cover Studio Backend Tests ---');

// 1. Test getSupportedStyles
const styles = getSupportedStyles();
assert.strictEqual(styles.length, 7, 'Should support exactly 7 cover styles');
console.log('✓ getSupportedStyles returns 7 styles:', styles.map(s => s.id).join(', '));

// 2. Test buildCoverPrompt for all 7 styles
const mockStory = {
  title: 'My Grandfather Memories',
  subject: 'Life in Normandy',
  relationship: 'Grandfather',
  subtitle: 'A journey through peace and war',
  generatedBook: {
    dedication: 'Dedicated to my family'
  }
};

styles.forEach(styleObj => {
  const prompt = buildCoverPrompt(mockStory, styleObj.id, 'Add golden autumn trees');
  assert.ok(prompt.includes(mockStory.title), `Prompt for style ${styleObj.id} should include story title`);
  assert.ok(prompt.includes(mockStory.subject), `Prompt for style ${styleObj.id} should include story subject`);
  assert.ok(prompt.includes('golden autumn trees'), `Prompt for style ${styleObj.id} should include custom instructions`);
});
console.log('✓ buildCoverPrompt successfully generates prompts for all 7 styles');

// 3. Test computeStoryHash caching hash consistency
const hash1 = coverService.computeStoryHash(mockStory);
const hash2 = coverService.computeStoryHash({ ...mockStory });
assert.strictEqual(hash1, hash2, 'Identical story attributes should yield identical hash');

const modifiedStory = { ...mockStory, title: 'Different Title' };
const hash3 = coverService.computeStoryHash(modifiedStory);
assert.notStrictEqual(hash1, hash3, 'Different story title should yield different hash');
console.log('✓ SHA-256 story hash calculation is consistent and distinct for changed titles');

// 4. Test provider fallback generation
async function testFallbackProvider() {
  const mockStoryDoc = {
    ...mockStory,
    coverHistory: [],
    activeCover: null,
    save: async function() { return this; }
  };

  const result = await coverService.generateCover(mockStoryDoc, {
    style: 'Classic Memoir',
    provider: 'openai',
    customInstructions: 'Sepia memory'
  });

  assert.strictEqual(result.cached, false, 'First generation should not be cached');
  assert.ok(result.cover.imageUrl.startsWith('data:image/svg+xml'), 'Fallback image URL should be valid SVG data URL');
  assert.strictEqual(mockStoryDoc.coverHistory.length, 1, 'Cover history should contain 1 item');
  assert.strictEqual(mockStoryDoc.activeCover.id, result.cover.id, 'First cover should automatically be active cover');

  // Test caching on second call
  const cacheResult = await coverService.generateCover(mockStoryDoc, {
    style: 'Classic Memoir',
    provider: 'openai'
  });

  assert.strictEqual(cacheResult.cached, true, 'Second generation with identical params should return cached = true');
  assert.strictEqual(mockStoryDoc.coverHistory.length, 1, 'Cached generation should not append duplicate item to history');

  console.log('✓ Cover Service generation, fallback image creation, auto-active assignment, and SHA-256 caching passed!');
}

testFallbackProvider().then(() => {
  console.log('--- All Cover Studio Tests Passed Successfully! ---');
}).catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
