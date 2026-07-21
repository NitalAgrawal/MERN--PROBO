'use strict';

/**
 * epubExporter.js
 *
 * Generates a standards-compliant ePub 3 file from a StoryNest generatedBook
 * using the `epub-gen-memory` package (pure JS, no native dependencies).
 *
 * Produces a Buffer suitable for upload to Cloudinary or streaming to the client.
 *
 * Typography:
 *   - Playfair Display (Google Fonts CDN in CSS)
 *   - Inter (Google Fonts CDN in CSS)
 */

const Epub = require('epub-gen-memory').default || require('epub-gen-memory');

// ── Shared CSS ─────────────────────────────────────────────────────────────
const EPUB_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@400;500;600&display=swap');

body {
  font-family: 'Inter', Helvetica, Arial, sans-serif;
  font-size: 1em;
  line-height: 1.75;
  color: #382910;
  margin: 0;
  padding: 0;
  background: #faf8f4;
}

h1, h2, h3 {
  font-family: 'Playfair Display', 'Times New Roman', Georgia, serif;
  color: #382910;
  line-height: 1.25;
}

/* Cover */
.cover-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 90vh;
  text-align: center;
  padding: 2em;
}
.cover-label {
  font-family: 'Inter', sans-serif;
  font-size: 0.7em;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: #8c7f75;
  margin-bottom: 2em;
}
.cover-title {
  font-family: 'Playfair Display', serif;
  font-size: 2.4em;
  font-weight: 700;
  margin: 0.4em 0;
  color: #382910;
}
.cover-subtitle {
  font-style: italic;
  color: #8c7f75;
  font-size: 1.1em;
  margin-top: 0.5em;
}
.cover-author {
  margin-top: 2em;
  font-size: 0.85em;
  color: #8c7f75;
}
.cover-divider {
  width: 4em;
  border-top: 1px solid #c8bdb2;
  margin: 1.5em auto;
}

/* Dedication */
.dedication-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 70vh;
  padding: 3em 2em;
  text-align: center;
}
.dedication-text {
  font-family: 'Playfair Display', serif;
  font-size: 1.3em;
  font-style: italic;
  line-height: 2;
  max-width: 28em;
  color: #382910;
}

/* TOC */
.toc-page { padding: 2em; }
.toc-page h2 {
  font-family: 'Playfair Display', serif;
  font-size: 1.8em;
  text-align: center;
  border-bottom: 1px solid #e0d6c9;
  padding-bottom: 0.5em;
  margin-bottom: 1.5em;
}
.toc-entry {
  display: flex;
  justify-content: space-between;
  padding: 0.6em 0;
  border-bottom: 1px dashed #e0d6c9;
  font-family: 'Playfair Display', serif;
  font-size: 1em;
  color: #382910;
}

/* Chapter */
.chapter-page { padding: 2em; }
.chapter-label {
  font-family: 'Inter', sans-serif;
  font-size: 0.65em;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: #8c7f75;
  text-align: center;
  margin-bottom: 0.5em;
}
.chapter-title {
  font-family: 'Playfair Display', serif;
  font-size: 2em;
  font-weight: 700;
  text-align: center;
  margin-bottom: 1.5em;
  color: #382910;
}
.chapter-divider {
  width: 3em;
  border-top: 1px solid #c8bdb2;
  margin: 0 auto 2em;
}
.chapter-body p {
  text-align: justify;
  margin: 0 0 1em 0;
  font-size: 1em;
  line-height: 1.8;
}
.chapter-body p.drop-cap::first-letter {
  font-family: 'Playfair Display', serif;
  font-size: 3.5em;
  font-weight: 700;
  float: left;
  margin: 0.1em 0.1em 0 0;
  line-height: 0.8;
  color: #382910;
}

/* Pull quote */
.pull-quote {
  border-left: 4px solid #cc8789;
  background: #fdf9f3;
  padding: 1em 1.5em;
  margin: 1.5em 0;
  font-family: 'Playfair Display', serif;
  font-style: italic;
  font-size: 1.15em;
  line-height: 1.7;
  color: #382910;
  border-radius: 0 6px 6px 0;
}

/* Photo placeholder */
.photo-block {
  background: #f0ebe4;
  border-radius: 8px;
  padding: 3em 2em;
  text-align: center;
  margin: 1.5em 0;
  color: #8c7f75;
  font-style: italic;
  font-size: 0.9em;
}
.photo-caption {
  font-style: italic;
  color: #8c7f75;
  text-align: center;
  font-size: 0.85em;
  margin-top: 0.5em;
}

/* Reflection */
.reflection-page { padding: 2em; }
.reflection-ornament {
  width: 12px;
  height: 12px;
  background: #cc8789;
  border-radius: 50%;
  margin: 2em auto;
}
`;

// ── HTML builders ──────────────────────────────────────────────────────────

const buildCoverHtml = (story) => `
<div class="cover-page">
  <p class="cover-label">StoryNest Biography</p>
  <h1 class="cover-title">${escHtml(story.title || 'Untitled Story')}</h1>
  ${story.subtitle ? `<p class="cover-subtitle">${escHtml(story.subtitle)}</p>` : ''}
  <div class="cover-divider"></div>
  <p class="cover-author">Created by You · ${new Date().getFullYear()}</p>
</div>
`;

const buildDedicationHtml = (dedication) => `
<div class="dedication-page">
  <p class="dedication-text">"${escHtml(dedication || 'Dedicated to those who store their memories in quiet corners.')}"</p>
</div>
`;

const buildTocHtml = (chapters) => {
  const entries = [
    { label: 'Dedication',       page: 2 },
    ...chapters.map((ch, i) => ({ label: ch.title, page: 4 + i * 2 })),
    { label: 'Final Reflection', page: 4 + chapters.length * 2 }
  ];

  return `
<div class="toc-page">
  <h2>Contents</h2>
  ${entries.map(e => `
    <div class="toc-entry">
      <span>${escHtml(e.label)}</span>
      <span>${e.page}</span>
    </div>
  `).join('')}
</div>
`;
};

const buildChapterHtml = (chapter, index) => {
  const paragraphs = (chapter.content || []).map((p, i) => {
    if (!p) return '';
    return `<p${i === 0 ? ' class="drop-cap"' : ''}>${escHtml(p)}</p>`;
  }).join('\n');

  const pullQuote = chapter.pullQuote
    ? `<blockquote class="pull-quote">"${escHtml(chapter.pullQuote)}"</blockquote>`
    : '';

  const photo = chapter.photo?.caption
    ? `<div class="photo-block">[ Image ]<br/><span class="photo-caption">${escHtml(chapter.photo.caption)}</span></div>`
    : '';

  return `
<div class="chapter-page">
  <p class="chapter-label">Section ${index + 1}</p>
  <h2 class="chapter-title">${escHtml(chapter.title)}</h2>
  <div class="chapter-divider"></div>
  <div class="chapter-body">
    ${paragraphs}
    ${photo}
    ${pullQuote}
  </div>
</div>
`;
};

const buildReflectionHtml = (reflection) => {
  const paragraphs = (reflection?.content || []).map(p => `<p>${escHtml(p || '')}</p>`).join('\n');
  return `
<div class="reflection-page">
  <p class="chapter-label">Conclusion</p>
  <h2 class="chapter-title">${escHtml(reflection?.title || 'Final Reflection')}</h2>
  <div class="chapter-divider"></div>
  <div class="chapter-body">${paragraphs}</div>
  <div class="reflection-ornament"></div>
</div>
`;
};

/** Minimal HTML entity escaping to prevent malformed markup */
const escHtml = (str) =>
  String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

// ── Main export function ───────────────────────────────────────────────────

/**
 * Export a generatedBook as an ePub Buffer.
 *
 * @param {object} story - Story plain object with generatedBook
 * @returns {Promise<{ buffer: Buffer, pageCount: number }>}
 */
const exportToEpub = async (story) => {
  const book = story.generatedBook;
  if (!book) throw new Error('No generated book found on story.');

  const chapters = book.chapters || [];

  // Build ePub content sections (each becomes a "chapter" in ePub terms)
  const content = [
    {
      title: 'Cover',
      data: buildCoverHtml(story),
      excludeFromToc: true
    },
    {
      title: 'Dedication',
      data: buildDedicationHtml(book.dedication)
    },
    {
      title: 'Contents',
      data: buildTocHtml(chapters)
    },
    ...chapters.map((ch, i) => ({
      title: ch.title,
      data: buildChapterHtml(ch, i)
    })),
    {
      title: book.reflection?.title || 'Final Reflection',
      data: buildReflectionHtml(book.reflection)
    }
  ];

  const options = {
    title:    story.title || 'StoryNest Book',
    author:   'Created by You',
    publisher:'StoryNest',
    description: story.subtitle || `A memoir about ${story.subject || 'life'}.`,
    lang:     'en',
    css:      EPUB_CSS,
    content,
    appendChapterTitles: false   // we render our own styled titles
  };

  // epub-gen-memory returns a Buffer directly
  const buffer = await Epub(options);
  // ePub page count isn't deterministic at generation time; estimate from chapter count
  const pageCount = 3 + chapters.length * 2 + 1;

  return { buffer, pageCount };
};

module.exports = { exportToEpub };
