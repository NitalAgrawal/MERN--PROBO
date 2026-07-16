import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import PhotoBlock from './PhotoBlock';

// ── Editable paragraph ───────────────────────────────────────────────────────
const EditableParagraph = ({ text, placeholder, className = '' }) => {
  const ref = useRef(null);

  return (
    <p
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      data-placeholder={placeholder || 'Start writing…'}
      className={`outline-none transition-all rounded-sm px-1 -mx-1 focus:bg-soft-beige/20 ${className}`}
      style={{ minHeight: '1.5em' }}
      dangerouslySetInnerHTML={{ __html: text }}
    />
  );
};

// ── Editable pull-quote ──────────────────────────────────────────────────────
const EditablePullQuote = ({ text }) => (
  <blockquote
    contentEditable
    suppressContentEditableWarning
    className="pull-quote-block outline-none focus:ring-1 focus:ring-dusty-rose/30 rounded-r-lg"
    dangerouslySetInnerHTML={{ __html: `"${text}"` }}
  />
);

// ── Chapter Page ─────────────────────────────────────────────────────────────
const ChapterPage = ({ chapter, pageNumber, isCollapsed }) => {
  const [titleValue, setTitleValue] = useState(chapter.title);
  const titleRef = useRef(null);

  if (isCollapsed) return null;

  const paragraphs = chapter.content || [];
  const photo = chapter.photo;
  const pullQuote = chapter.pullQuote;

  // Split paragraphs: first half → photo → second half → pull quote
  const mid = Math.ceil(paragraphs.length / 2);
  const firstHalf = paragraphs.slice(0, mid);
  const secondHalf = paragraphs.slice(mid);

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="editor-page rounded-2xl mb-10 overflow-hidden"
    >
      {/* Page header (running title) */}
      <div className="flex justify-between items-center px-10 md:px-16 pt-8 pb-0 text-[10px] text-warm-gray/40 uppercase tracking-widest select-none font-semibold border-b border-warm-gray/5 pb-3">
        <span>StoryNest</span>
        <span>{titleValue}</span>
      </div>

      {/* Page body */}
      <div className="px-10 md:px-20 py-12 md:py-16">

        {/* Chapter heading */}
        <div className="mb-10 text-center">
          <span className="text-[10px] uppercase tracking-[0.25em] text-warm-gray/50 font-bold block mb-3 select-none">
            Chapter
          </span>
          <h2
            ref={titleRef}
            contentEditable
            suppressContentEditableWarning
            onInput={e => setTitleValue(e.currentTarget.textContent)}
            className="font-serif text-3xl md:text-4xl font-bold text-deep-brown leading-tight outline-none focus:border-b-2 focus:border-dusty-rose/40 transition-all"
            style={{ display: 'block' }}
            dangerouslySetInnerHTML={{ __html: titleValue }}
          />
          <div className="w-10 h-[1.5px] bg-warm-gray/20 mx-auto mt-5" />
        </div>

        {/* First half of paragraphs (with drop cap on first) */}
        <div className="space-y-6 text-[#3d3830] text-base md:text-lg leading-[1.85] text-justify">
          {firstHalf.map((para, idx) => {
            if (idx === 0) {
              const first = para.charAt(0);
              const rest = para.slice(1);
              return (
                <div key={idx}>
                  <p
                    contentEditable
                    suppressContentEditableWarning
                    data-placeholder="Start writing…"
                    className="outline-none transition-all rounded-sm px-1 -mx-1 focus:bg-soft-beige/20"
                    style={{ minHeight: '1.5em' }}
                  >
                    <span className="float-left font-serif text-5xl font-bold text-deep-brown mr-3 mt-1 leading-none">
                      {first}
                    </span>
                    {rest}
                  </p>
                </div>
              );
            }
            return (
              <EditableParagraph key={idx} text={para} placeholder="Add paragraph…" />
            );
          })}
        </div>

        {/* Photo block */}
        {photo && (
          <PhotoBlock photo={photo} />
        )}

        {/* Second half of paragraphs */}
        {secondHalf.length > 0 && (
          <div className="space-y-6 text-[#3d3830] text-base md:text-lg leading-[1.85] text-justify mt-6">
            {secondHalf.map((para, idx) => (
              <EditableParagraph key={idx} text={para} placeholder="Add paragraph…" />
            ))}
          </div>
        )}

        {/* Pull quote */}
        {pullQuote && (
          <EditablePullQuote text={pullQuote} />
        )}

        {/* Add paragraph hint */}
        <button
          onClick={() => {
            const p = document.createElement('p');
            p.textContent = '';
            p.contentEditable = true;
            p.className = 'outline-none py-1 text-base leading-[1.85] text-[#3d3830]';
          }}
          className="mt-8 w-full py-3 border border-dashed border-warm-gray/20 rounded-lg text-xs text-warm-gray/40 hover:text-warm-gray hover:border-warm-gray/40 transition-colors font-medium"
        >
          + Add paragraph
        </button>
      </div>

      {/* Page footer */}
      <div className="flex justify-between items-center px-10 md:px-16 pb-6 pt-2 text-[10px] text-warm-gray/30 select-none border-t border-warm-gray/5 pt-3">
        <span className="italic font-serif">{titleValue}</span>
        <span>— {pageNumber} —</span>
      </div>
    </motion.article>
  );
};

export default ChapterPage;
