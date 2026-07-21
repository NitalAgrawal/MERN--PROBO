'use strict';

/**
 * htmlExporter.js
 *
 * Generates a zero-dependency, self-contained single-file HTML export of
 * a StoryNest generatedBook.
 *
 * Features:
 *   - Google Fonts (Playfair Display + Inter) loaded from CDN
 *   - Full StoryNest branding & colour palette
 *   - Cover, Dedication, TOC (anchor links), Chapters, Reflection
 *   - Drop caps, pull quotes, photo captions
 *   - Print media query: A4 layout, proper margins, page breaks
 *   - Returns { buffer: Buffer, pageCount: number }
 */

/** Minimal HTML entity escaping */
const escHtml = (str) =>
  String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

// ── CSS ──────────────────────────────────────────────────────────────────────
const buildCSS = () => `
  /* ── Reset & Base ─────────────────────────────────────────────────────── */
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --deep-brown:   #382910;
    --dusty-rose:   #cc8789;
    --warm-gray:    #8c7f75;
    --warm-ivory:   #faf8f4;
    --soft-beige:   #f0ebe2;
    --light-rule:   #e0d6c9;
    --serif:        'Playfair Display', 'Times New Roman', Georgia, serif;
    --sans:         'Inter', Helvetica, Arial, sans-serif;
  }

  html { scroll-behavior: smooth; }

  body {
    font-family: var(--sans);
    font-size: 16px;
    color: var(--deep-brown);
    background: var(--warm-ivory);
    line-height: 1.75;
  }

  /* ── Layout ────────────────────────────────────────────────────────────── */
  .book-wrapper {
    max-width: 740px;
    margin: 0 auto;
    padding: 48px 24px 80px;
  }

  /* ── Sections ──────────────────────────────────────────────────────────── */
  .page-section {
    background: #fff;
    border: 1px solid var(--light-rule);
    border-radius: 16px;
    padding: 64px 72px;
    margin-bottom: 56px;
    position: relative;
    box-shadow: 0 2px 20px rgba(56,41,16,0.06);
  }
  .page-section::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 4px;
    background: linear-gradient(to bottom, var(--dusty-rose), transparent);
    border-radius: 16px 0 0 16px;
  }

  /* ── Cover ─────────────────────────────────────────────────────────────── */
  .cover-page {
    min-height: 520px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    text-align: center;
    background: linear-gradient(160deg, #fff 0%, var(--warm-ivory) 100%);
    padding: 56px 48px;
  }
  .cover-brand {
    font-family: var(--sans);
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: var(--warm-gray);
  }
  .cover-medallion {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: radial-gradient(circle at 35% 35%, #e8c9c9 0%, #d4a5a5 60%, #c08080 100%);
    margin: 32px auto;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .cover-medallion-inner {
    width: 70px;
    height: 70px;
    border-radius: 50%;
    background: rgba(255,255,255,0.2);
  }
  .cover-title {
    font-family: var(--serif);
    font-size: 2.8em;
    font-weight: 700;
    line-height: 1.2;
    color: var(--deep-brown);
    margin-bottom: 12px;
  }
  .cover-subtitle {
    font-family: var(--serif);
    font-style: italic;
    font-size: 1.1em;
    color: var(--warm-gray);
    max-width: 380px;
    margin: 0 auto;
    line-height: 1.6;
  }
  .cover-footer { text-align: center; }
  .cover-divider {
    width: 40px;
    height: 1px;
    background: var(--light-rule);
    margin: 0 auto 12px;
  }
  .cover-author-label {
    font-size: 10px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--warm-gray);
    margin-bottom: 4px;
  }
  .cover-author-name {
    font-family: var(--serif);
    font-size: 1.1em;
    font-weight: 600;
    color: var(--deep-brown);
  }

  /* ── Dedication ─────────────────────────────────────────────────────────── */
  .dedication-page {
    min-height: 320px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 64px 56px;
  }
  .dedication-text {
    font-family: var(--serif);
    font-size: 1.3em;
    font-style: italic;
    text-align: center;
    line-height: 1.9;
    max-width: 480px;
    color: var(--deep-brown);
  }

  /* ── TOC ────────────────────────────────────────────────────────────────── */
  .toc-heading {
    font-family: var(--serif);
    font-size: 1.8em;
    text-align: center;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--light-rule);
    margin-bottom: 32px;
    color: var(--deep-brown);
  }
  .toc-list { list-style: none; }
  .toc-list li {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    padding: 10px 0;
    border-bottom: 1px dashed var(--light-rule);
  }
  .toc-list a {
    font-family: var(--serif);
    font-weight: 600;
    font-size: 1em;
    color: var(--deep-brown);
    text-decoration: none;
    transition: color 0.2s;
  }
  .toc-list a:hover { color: var(--dusty-rose); }
  .toc-page-num {
    font-family: var(--serif);
    font-size: 0.9em;
    color: var(--warm-gray);
    margin-left: 16px;
    white-space: nowrap;
  }

  /* ── Chapter Section Label ──────────────────────────────────────────────── */
  .section-label {
    font-family: var(--sans);
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.28em;
    text-transform: uppercase;
    color: var(--warm-gray);
    text-align: center;
    margin-bottom: 8px;
  }
  .chapter-title {
    font-family: var(--serif);
    font-size: 2.2em;
    font-weight: 700;
    text-align: center;
    line-height: 1.25;
    color: var(--deep-brown);
    margin-bottom: 24px;
  }
  .chapter-rule {
    width: 48px;
    height: 1px;
    background: var(--light-rule);
    margin: 0 auto 40px;
  }

  /* ── Body Text ──────────────────────────────────────────────────────────── */
  .body-text p {
    text-align: justify;
    font-size: 1.05em;
    line-height: 1.85;
    color: #3d3830;
    margin-bottom: 1.1em;
  }
  .body-text p.drop-cap::first-letter {
    font-family: var(--serif);
    font-size: 4em;
    font-weight: 700;
    float: left;
    line-height: 0.75;
    margin: 0.1em 0.12em 0 0;
    color: var(--deep-brown);
  }

  /* ── Pull Quote ─────────────────────────────────────────────────────────── */
  .pull-quote {
    border-left: 4px solid var(--dusty-rose);
    background: #fdf9f3;
    padding: 16px 24px;
    margin: 32px 0;
    border-radius: 0 8px 8px 0;
    font-family: var(--serif);
    font-style: italic;
    font-size: 1.15em;
    line-height: 1.7;
    color: var(--deep-brown);
  }

  /* ── Photo Block ────────────────────────────────────────────────────────── */
  .photo-block {
    background: var(--soft-beige);
    border-radius: 12px;
    padding: 48px 24px;
    text-align: center;
    margin: 32px 0;
    color: var(--warm-gray);
    font-size: 0.9em;
    font-style: italic;
  }
  .photo-caption {
    margin-top: 12px;
    font-size: 0.85em;
    color: var(--warm-gray);
    font-style: italic;
  }

  /* ── Reflection Ornament ────────────────────────────────────────────────── */
  .reflection-ornament {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--dusty-rose);
    margin: 40px auto 0;
    opacity: 0.6;
  }

  /* ── Page number footer ─────────────────────────────────────────────────── */
  .page-num {
    text-align: center;
    font-size: 0.75em;
    color: var(--warm-gray);
    margin-top: 40px;
    letter-spacing: 0.05em;
  }

  /* ── Sticky nav bar ─────────────────────────────────────────────────────── */
  .book-nav {
    position: sticky;
    top: 0;
    z-index: 100;
    background: rgba(250,248,244,0.9);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--light-rule);
    padding: 10px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .book-nav-title {
    font-family: var(--serif);
    font-style: italic;
    font-size: 0.85em;
    color: var(--deep-brown);
  }
  .book-nav-brand {
    font-size: 10px;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: var(--warm-gray);
    font-weight: 600;
  }

  /* ── Print Styles ───────────────────────────────────────────────────────── */
  @media print {
    @page {
      size: A4;
      margin: 72pt;
    }
    body { background: #fff; font-size: 11pt; }
    .book-nav { display: none; }
    .book-wrapper { max-width: 100%; padding: 0; }
    .page-section {
      border: none;
      box-shadow: none;
      border-radius: 0;
      padding: 0;
      margin-bottom: 0;
      page-break-after: always;
    }
    .page-section::before { display: none; }
    .pull-quote { border-left: 3pt solid #cc8789; }
    .photo-block { border: 1px solid #e0d6c9; }
  }

  /* ── Responsive ─────────────────────────────────────────────────────────── */
  @media (max-width: 600px) {
    .page-section { padding: 36px 24px; }
    .cover-title { font-size: 2em; }
    .chapter-title { font-size: 1.7em; }
  }
`;

// ── Section builders ──────────────────────────────────────────────────────

const buildCoverSection = (story) => `
<section class="page-section cover-page" id="cover">
  <div>
    <p class="cover-brand">StoryNest Biography</p>
    <div class="cover-medallion"><div class="cover-medallion-inner"></div></div>
    <h1 class="cover-title">${escHtml(story.title || 'Untitled Story')}</h1>
    ${story.subtitle ? `<p class="cover-subtitle">${escHtml(story.subtitle)}</p>` : ''}
  </div>
  <div class="cover-footer">
    <div class="cover-divider"></div>
    <p class="cover-author-label">Author</p>
    <p class="cover-author-name">Created by You</p>
  </div>
</section>
`;

const buildDedicationSection = (dedication) => `
<section class="page-section dedication-page" id="dedication">
  <p class="dedication-text">"${escHtml(dedication || 'Dedicated to those who store their memories in quiet corners.')}"</p>
  <p class="page-num">— 2 —</p>
</section>
`;

const buildTocSection = (chapters) => {
  const entries = [
    { label: 'Dedication',      anchor: '#dedication', page: 2 },
    ...chapters.map((ch, i) => ({
      label:  ch.title,
      anchor: `#chapter-${i}`,
      page:   4 + i * 2
    })),
    { label: 'Final Reflection', anchor: '#reflection', page: 4 + chapters.length * 2 }
  ];

  return `
<section class="page-section" id="toc">
  <h2 class="toc-heading">Contents</h2>
  <ul class="toc-list">
    ${entries.map(e => `
      <li>
        <a href="${e.anchor}">${escHtml(e.label)}</a>
        <span class="toc-page-num">${e.page}</span>
      </li>
    `).join('')}
  </ul>
  <p class="page-num">— 3 —</p>
</section>
`;
};

const buildChapterSection = (chapter, index) => {
  const paragraphs = (chapter.content || []).map((p, i) => {
    if (!p) return '';
    return `<p${i === 0 ? ' class="drop-cap"' : ''}>${escHtml(p)}</p>`;
  }).join('\n');

  const pullQuote = chapter.pullQuote
    ? `<blockquote class="pull-quote">"${escHtml(chapter.pullQuote)}"</blockquote>`
    : '';

  const photo = chapter.photo?.caption
    ? `<div class="photo-block">
         <div style="margin-bottom:8px;opacity:0.5;">📷</div>
         Image from your memories
         <p class="photo-caption">${escHtml(chapter.photo.caption)}</p>
       </div>`
    : '';

  return `
<section class="page-section" id="chapter-${index}">
  <p class="section-label">Section ${index + 1}</p>
  <h2 class="chapter-title">${escHtml(chapter.title)}</h2>
  <div class="chapter-rule"></div>
  <div class="body-text">
    ${paragraphs}
    ${photo}
    ${pullQuote}
  </div>
  <p class="page-num">— ${4 + index * 2} —</p>
</section>
`;
};

const buildReflectionSection = (reflection, chapters) => {
  const paragraphs = (reflection?.content || []).map(p => `<p>${escHtml(p || '')}</p>`).join('\n');
  const pageNum = 4 + chapters.length * 2;
  return `
<section class="page-section" id="reflection">
  <p class="section-label">Conclusion</p>
  <h2 class="chapter-title">${escHtml(reflection?.title || 'Final Reflection')}</h2>
  <div class="chapter-rule"></div>
  <div class="body-text">${paragraphs}</div>
  <div class="reflection-ornament"></div>
  <p class="page-num">— ${pageNum} —</p>
</section>
`;
};

// ── Main export function ───────────────────────────────────────────────────

/**
 * Export a generatedBook as a self-contained HTML Buffer.
 *
 * @param {object} story - Story plain object with generatedBook
 * @returns {{ buffer: Buffer, pageCount: number }}
 */
const exportToHtml = (story) => {
  const book = story.generatedBook;
  if (!book) throw new Error('No generated book found on story.');

  const chapters = book.chapters || [];

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escHtml(story.title || 'StoryNest Book')} — StoryNest</title>
  <meta name="description" content="${escHtml(story.subtitle || `A memoir about ${story.subject || 'life'}.`)}" />
  <meta name="author" content="StoryNest" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
  <style>${buildCSS()}</style>
</head>
<body>

  <!-- Sticky navigation bar -->
  <nav class="book-nav">
    <span class="book-nav-title">${escHtml(story.title || 'StoryNest Book')}</span>
    <span class="book-nav-brand">StoryNest Preview</span>
  </nav>

  <div class="book-wrapper">

    ${buildCoverSection(story)}
    ${buildDedicationSection(book.dedication)}
    ${buildTocSection(chapters)}
    ${chapters.map((ch, i) => buildChapterSection(ch, i)).join('\n')}
    ${buildReflectionSection(book.reflection, chapters)}

  </div>

  <script>
    // Highlight active TOC link on scroll
    const sections = document.querySelectorAll('[id]');
    const tocLinks = document.querySelectorAll('.toc-list a');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          tocLinks.forEach(link => {
            link.style.color = link.getAttribute('href') === '#' + entry.target.id
              ? 'var(--dusty-rose)' : '';
          });
        }
      });
    }, { threshold: 0.3 });
    sections.forEach(s => observer.observe(s));
  </script>

</body>
</html>`;

  const buffer = Buffer.from(html, 'utf8');
  const pageCount = 3 + chapters.length * 2 + 1;

  return { buffer, pageCount };
};

module.exports = { exportToHtml };
