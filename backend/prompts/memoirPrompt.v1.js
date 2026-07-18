'use strict';

/**
 * memoirPrompt.v1.js
 *
 * Versioned prompt template for memoir book generation.
 * This file contains ONLY text-formatting logic — no service calls, no DB access.
 *
 * To create a v2 prompt without touching business logic:
 *   1. Copy this file to memoirPrompt.v2.js
 *   2. Edit the template
 *   3. Update aiGenerationService.js to import v2
 */

const PROMPT_VERSION = 'memoir.v1';

/**
 * Formats a single memory into a readable block for the prompt.
 * @param {object} memory
 * @param {number} index  1-based position
 */
const formatMemory = (memory, index) => {
  const lines = [`Memory ${index}:`];
  if (memory.title)    lines.push(`  Title:    ${memory.title}`);
  if (memory.date)     lines.push(`  Date:     ${memory.date}`);
  if (memory.location) lines.push(`  Location: ${memory.location}`);
  lines.push(`  Content:  ${memory.content}`);
  return lines.join('\n');
};

/**
 * Build the complete prompt string for one generation run.
 *
 * @param {object} story    - Story Mongoose document (or plain object)
 * @param {object[]} memories - Memory documents sorted by `order` ASC
 * @returns {{ prompt: string, promptVersion: string }}
 */
const buildBookPrompt = (story, memories) => {
  const memoryBlocks = memories
    .map((m, i) => formatMemory(m, i + 1))
    .join('\n\n');

  const prompt = `
You are a professional biographer and memoir writer. Your task is to transform a collection of personal memories into a beautifully written, emotionally resonant memoir book.

## Story Information
- Title:        ${story.title || '(untitled)'}
- Subtitle:     ${story.subtitle || '(none)'}
- Subject:      ${story.subject}
- Relationship: ${story.relationship || 'not specified'}
- Visibility:   ${story.visibility}

## Memories (in chronological / user-defined order)
${memoryBlocks}

## Your Task
Write a complete memoir book based on these memories. Follow these rules precisely:

1. **Dedication** — Write a heartfelt, personal 1–3 sentence dedication addressing the subject.
2. **Chapters** — Create one chapter per memory. Each chapter must:
   - Have an evocative, poetic title (not just the memory title)
   - Expand the raw memory into 3–5 richly written paragraphs
   - Each paragraph must be a separate string in the "content" array
   - Include a single short pullQuote (one powerful sentence from the chapter)
   - Omit the "photo" field (set to null)
3. **Reflection** — Write a final reflection chapter titled "A Letter Across Time" that ties all memories together into a cohesive emotional conclusion (3–5 paragraphs).
4. **Reading Time** — Estimate total reading time as a string like "8 min read".

## Output Format
Respond with ONLY valid JSON. No markdown, no code fences, no explanation. The JSON must match this exact structure:

{
  "dedication": "string",
  "chapters": [
    {
      "title": "string",
      "content": ["paragraph 1", "paragraph 2", "..."],
      "photo": null,
      "pullQuote": "string"
    }
  ],
  "reflection": {
    "title": "string",
    "content": ["paragraph 1", "paragraph 2", "..."]
  },
  "readingTime": "string"
}

Do NOT include any other keys. Do NOT wrap the JSON in markdown code blocks.
`.trim();

  return { prompt, promptVersion: PROMPT_VERSION };
};

module.exports = { buildBookPrompt, PROMPT_VERSION };
