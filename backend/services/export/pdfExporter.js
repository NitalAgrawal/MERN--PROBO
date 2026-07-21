'use strict';

/**
 * pdfExporter.js
 *
 * Generates a print-ready A4 PDF from a StoryNest generatedBook object using PDFKit.
 *
 * Layout:
 *   Cover → Dedication → Table of Contents → Chapters (N) → Reflection
 *
 * Typography mapping:
 *   Playfair Display → Times-Roman  (PDFKit built-in serif)
 *   Inter            → Helvetica    (PDFKit built-in sans-serif)
 *
 * Returns a Promise<Buffer> containing the complete PDF binary.
 */

const PDFDocument = require('pdfkit');

// ── A4 page dimensions & layout constants ─────────────────────────────────
const PAGE_W  = 595.28;   // pts
const PAGE_H  = 841.89;   // pts
const MARGIN  = 72;       // 1 inch margins all around
const CONTENT_W = PAGE_W - MARGIN * 2;

// ── Brand colours (converted to 0-1 RGB) ─────────────────────────────────
const DEEP_BROWN   = [0.22, 0.16, 0.11];  // #382910
const DUSTY_ROSE   = [0.80, 0.53, 0.54];  // #cc8789
const WARM_GRAY    = [0.55, 0.50, 0.46];  // #8c7f75
const WARM_IVORY   = [0.98, 0.96, 0.92];  // #faf5eb
const LIGHT_RULE   = [0.88, 0.84, 0.79];  // #e0d6c9

// ── Helpers ───────────────────────────────────────────────────────────────

/** Set fill colour from [r, g, b] (0–1 float) */
const setFill = (doc, rgb) => doc.fillColor(rgb.map(v => Math.round(v * 255)));

/** Draw a full-width horizontal rule */
const hRule = (doc, y, colour = LIGHT_RULE, thickness = 0.5) => {
  doc.save()
    .strokeColor(colour.map(v => Math.round(v * 255)))
    .lineWidth(thickness)
    .moveTo(MARGIN, y)
    .lineTo(PAGE_W - MARGIN, y)
    .stroke()
    .restore();
};

/** Add a centered footer with page number */
const addFooter = (doc, pageNum) => {
  const y = PAGE_H - MARGIN / 2;
  setFill(doc, WARM_GRAY);
  doc.font('Helvetica').fontSize(8)
    .text(`— ${pageNum} —`, 0, y, { width: PAGE_W, align: 'center' });
};

/** Estimate how many lines a block of text occupies at current font settings */
const estimateLines = (doc, text, width, lineHeight) => {
  const charsPerLine = Math.floor(width / (doc.currentLineHeight() * 0.55));
  return Math.ceil(text.length / charsPerLine) * lineHeight;
};

// ── Section renderers ─────────────────────────────────────────────────────

/**
 * COVER PAGE
 * Full-page warm ivory background, centred title and metadata.
 */
const renderCover = (doc, story) => {
  // Background
  doc.rect(0, 0, PAGE_W, PAGE_H)
    .fill(WARM_IVORY.map(v => Math.round(v * 255)));

  // Spine shadow
  doc.rect(0, 0, 18, PAGE_H)
    .fill([220, 210, 200]);

  // Top label
  setFill(doc, WARM_GRAY);
  doc.font('Helvetica').fontSize(7).text(
    'STORYNEST BIOGRAPHY',
    MARGIN, 100, { width: CONTENT_W, align: 'center', characterSpacing: 3 }
  );

  // Decorative circle
  const cx = PAGE_W / 2;
  const cy = 290;
  const r  = 60;
  doc.circle(cx, cy, r).fill(DUSTY_ROSE.map(v => Math.round(v * 255 * 0.25)));
  doc.circle(cx, cy, r - 6).fill(DUSTY_ROSE.map(v => Math.round(v * 255 * 0.15)));

  // Title
  setFill(doc, DEEP_BROWN);
  doc.font('Times-Roman').fontSize(36)
    .text(story.title || 'Untitled Story', MARGIN, 380, { width: CONTENT_W, align: 'center', lineGap: 6 });

  // Subtitle
  if (story.subtitle) {
    setFill(doc, WARM_GRAY);
    doc.font('Times-Italic').fontSize(14)
      .text(story.subtitle, MARGIN, doc.y + 16, { width: CONTENT_W, align: 'center', lineGap: 4 });
  }

  // Divider
  const divY = doc.y + 40;
  hRule(doc, divY);

  // Author line
  setFill(doc, WARM_GRAY);
  doc.font('Helvetica').fontSize(8).text('AUTHOR', 0, divY + 12, { width: PAGE_W, align: 'center', characterSpacing: 2 });
  setFill(doc, DEEP_BROWN);
  doc.font('Times-Roman').fontSize(16).text('Created by You', 0, divY + 26, { width: PAGE_W, align: 'center' });

  // Bottom year
  setFill(doc, WARM_GRAY);
  doc.font('Helvetica').fontSize(8)
    .text(new Date().getFullYear().toString(), 0, PAGE_H - 80, { width: PAGE_W, align: 'center' });
};

/**
 * DEDICATION PAGE
 */
const renderDedication = (doc, dedication, pageNum) => {
  doc.addPage();
  const midY = PAGE_H / 2 - 60;

  setFill(doc, DEEP_BROWN);
  doc.font('Times-Italic').fontSize(18)
    .text(`"${dedication || 'Dedicated to those who store their memories in quiet corners.'}"`,
      MARGIN + 30, midY,
      { width: CONTENT_W - 60, align: 'center', lineGap: 8 }
    );

  addFooter(doc, pageNum);
};

/**
 * TABLE OF CONTENTS PAGE
 */
const renderTOC = (doc, chapters, pageNum) => {
  doc.addPage();

  // Heading
  setFill(doc, DEEP_BROWN);
  doc.font('Times-Roman').fontSize(26)
    .text('Contents', MARGIN, MARGIN + 20, { width: CONTENT_W, align: 'center' });

  hRule(doc, doc.y + 10);

  let y = doc.y + 30;

  const entries = [
    { label: 'Dedication',      page: 2 },
    ...chapters.map((ch, i) => ({ label: ch.title, page: 4 + i * 2 })),
    { label: 'Final Reflection', page: 4 + chapters.length * 2 }
  ];

  entries.forEach(({ label, page }) => {
    const pageStr = String(page);
    const dotAreaW = CONTENT_W - doc.widthOfString(pageStr, { fontSize: 11 });

    setFill(doc, DEEP_BROWN);
    doc.font('Times-Roman').fontSize(11).text(label, MARGIN, y, { lineBreak: false });

    // Dot leaders
    setFill(doc, WARM_GRAY);
    const startX = MARGIN + doc.widthOfString(label, { fontSize: 11 }) + 4;
    doc.font('Helvetica').fontSize(8);
    let dotX = startX;
    while (dotX < PAGE_W - MARGIN - 20) {
      doc.text('.', dotX, y + 2, { lineBreak: false });
      dotX += 6;
    }

    // Page number
    setFill(doc, DEEP_BROWN);
    doc.font('Times-Roman').fontSize(11)
      .text(pageStr, PAGE_W - MARGIN - doc.widthOfString(pageStr, { fontSize: 11 }), y, { lineBreak: false });

    y += 28;
  });

  addFooter(doc, pageNum);
};

/**
 * CHAPTER PAGE
 */
const renderChapter = (doc, chapter, index, pageNum) => {
  doc.addPage();

  // Section label
  setFill(doc, WARM_GRAY);
  doc.font('Helvetica').fontSize(7).text(
    `SECTION ${index + 1}`,
    MARGIN, MARGIN + 10, { width: CONTENT_W, align: 'center', characterSpacing: 3 }
  );

  // Chapter title
  setFill(doc, DEEP_BROWN);
  doc.font('Times-Roman').fontSize(28)
    .text(chapter.title, MARGIN, doc.y + 12, { width: CONTENT_W, align: 'center', lineGap: 6 });

  hRule(doc, doc.y + 14);
  doc.moveDown(1.5);

  // Body paragraphs
  const content = chapter.content || [];
  content.forEach((paragraph, pIdx) => {
    if (!paragraph) return;
    const y = doc.y;

    if (pIdx === 0) {
      // Drop cap for first letter
      const firstChar = paragraph.charAt(0);
      const rest = paragraph.slice(1);

      setFill(doc, DEEP_BROWN);
      doc.font('Times-Roman').fontSize(46).text(firstChar, MARGIN, y, { lineBreak: false, continued: false });
      const dropCapW = doc.widthOfString(firstChar, { fontSize: 46 });
      const dropCapH = doc.currentLineHeight();

      // Remaining text wraps beside drop cap
      setFill(doc, DEEP_BROWN);
      doc.font('Helvetica').fontSize(11)
        .text(rest, MARGIN + dropCapW + 6, y + 4, {
          width: CONTENT_W - dropCapW - 6,
          align: 'justify',
          lineGap: 4
        });

      // If text was shorter than drop cap height, move below it
      if (doc.y < y + dropCapH) doc.y = y + dropCapH + 4;
    } else {
      setFill(doc, DEEP_BROWN);
      doc.font('Helvetica').fontSize(11)
        .text(paragraph, MARGIN, doc.y, { width: CONTENT_W, align: 'justify', lineGap: 4 });
    }
    doc.moveDown(0.8);
  });

  // Pull quote
  if (chapter.pullQuote) {
    doc.moveDown(0.5);
    const qY = doc.y;
    // Left accent bar (dusty rose)
    doc.rect(MARGIN, qY, 3, 60).fill(DUSTY_ROSE.map(v => Math.round(v * 255)));
    // Light background
    doc.rect(MARGIN + 3, qY, CONTENT_W - 3, 60).fill([253, 249, 243]);

    setFill(doc, DEEP_BROWN);
    doc.font('Times-Italic').fontSize(13)
      .text(`"${chapter.pullQuote}"`, MARGIN + 18, qY + 14, {
        width: CONTENT_W - 24,
        align: 'left',
        lineGap: 5
      });
    doc.y = qY + 70;
    doc.moveDown(0.8);
  }

  // Photo placeholder / caption
  if (chapter.photo?.caption) {
    doc.moveDown(0.5);
    // Grey placeholder box
    doc.rect(MARGIN, doc.y, CONTENT_W, 80).fill([240, 235, 228]);
    setFill(doc, WARM_GRAY);
    doc.font('Helvetica').fontSize(9)
      .text('[ Image Placeholder ]', MARGIN, doc.y + 30, { width: CONTENT_W, align: 'center' });
    const boxBottom = doc.y + 50;
    // Caption below box
    setFill(doc, WARM_GRAY);
    doc.font('Times-Italic').fontSize(9)
      .text(chapter.photo.caption, MARGIN, boxBottom + 6, { width: CONTENT_W, align: 'center' });
    doc.y = boxBottom + 24;
  }

  addFooter(doc, pageNum);
};

/**
 * REFLECTION PAGE
 */
const renderReflection = (doc, reflection, pageNum) => {
  doc.addPage();

  setFill(doc, WARM_GRAY);
  doc.font('Helvetica').fontSize(7).text(
    'CONCLUSION',
    MARGIN, MARGIN + 10, { width: CONTENT_W, align: 'center', characterSpacing: 3 }
  );

  setFill(doc, DEEP_BROWN);
  doc.font('Times-Roman').fontSize(26)
    .text(reflection?.title || 'Final Reflection', MARGIN, doc.y + 12, { width: CONTENT_W, align: 'center' });

  hRule(doc, doc.y + 14);
  doc.moveDown(1.5);

  (reflection?.content || []).forEach(paragraph => {
    if (!paragraph) return;
    setFill(doc, DEEP_BROWN);
    doc.font('Helvetica').fontSize(11)
      .text(paragraph, MARGIN, doc.y, { width: CONTENT_W, align: 'justify', lineGap: 4 });
    doc.moveDown(0.8);
  });

  // Closing ornament
  doc.moveDown(2);
  setFill(doc, DUSTY_ROSE);
  doc.circle(PAGE_W / 2, doc.y + 10, 5).fill();

  addFooter(doc, pageNum);
};

// ── Main export function ───────────────────────────────────────────────────

/**
 * Export a generatedBook as a PDF Buffer.
 *
 * @param {object} story - Mongoose story doc plain object
 * @returns {Promise<{ buffer: Buffer, pageCount: number }>}
 */
const exportToPdf = (story) => {
  return new Promise((resolve, reject) => {
    const book = story.generatedBook;
    if (!book) return reject(new Error('No generated book found on story.'));

    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN },
      info: {
        Title:   story.title || 'StoryNest Book',
        Author:  'StoryNest',
        Subject: story.subject || '',
        Creator: 'StoryNest Export Engine'
      },
      autoFirstPage: false   // we control all pages manually
    });

    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end',  () => {
      const buffer = Buffer.concat(chunks);
      const pageCount = doc.bufferedPageRange().count;
      resolve({ buffer, pageCount });
    });
    doc.on('error', reject);

    // ── Render all sections ─────────────────────────────────────────────
    doc.addPage();
    renderCover(doc, story);                                          // p.1

    renderDedication(doc, book.dedication, 2);                        // p.2

    renderTOC(doc, book.chapters || [], 3);                           // p.3

    (book.chapters || []).forEach((chapter, i) => {
      renderChapter(doc, chapter, i, 4 + i * 2);                     // p.4+
    });

    const reflectionPage = 4 + (book.chapters?.length || 0) * 2;
    renderReflection(doc, book.reflection, reflectionPage);

    doc.end();
  });
};

module.exports = { exportToPdf };
