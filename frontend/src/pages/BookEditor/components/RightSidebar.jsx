import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronLeft, ChevronRight, Wand2 } from 'lucide-react';

const suggestions = [
  { label: 'Improve emotional tone', icon: '💛', desc: 'Deepen the emotional resonance of this passage.' },
  { label: 'Rewrite paragraph', icon: '✍️', desc: 'Generate a fresh take on the selected paragraph.' },
  { label: 'Make shorter', icon: '✂️', desc: 'Trim without losing the core meaning.' },
  { label: 'Make longer', icon: '📖', desc: 'Expand with richer detail and texture.' },
  { label: 'Suggest chapter title', icon: '🏷️', desc: 'Generate three evocative title options.' },
  { label: 'Improve ending', icon: '🌅', desc: 'Craft a more memorable final sentence.' },
  { label: 'Add transition', icon: '🔗', desc: 'Smooth the passage between two paragraphs.' },
  { label: 'Generate dedication', icon: '🤍', desc: 'Write a heartfelt dedication for this story.' },
  { label: 'Suggest pull quote', icon: '💬', desc: 'Pick the most powerful sentence as a quote.' },
];

const RightSidebar = ({ isOpen, onToggle }) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  return (
    <>
      {/* Collapsed tab */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-30 bg-white border border-l-0 border-warm-gray/10 rounded-l-2xl shadow-soft px-2 py-6 flex flex-col items-center gap-2 text-deep-brown hover:bg-soft-beige/60 transition-colors"
        >
          <Sparkles size={15} className="text-dusty-rose" />
          <span
            className="text-[10px] font-semibold tracking-widest text-warm-gray uppercase"
            style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)' }}
          >
            AI Assistant
          </span>
          <ChevronLeft size={13} className="text-warm-gray/50" />
        </button>
      )}

      {/* Open panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 288, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="h-full bg-white border-l border-warm-gray/10 flex flex-col overflow-hidden shrink-0 relative z-20"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-warm-gray/10">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-dusty-rose/20 rounded-full flex items-center justify-center">
                  <Sparkles size={12} className="text-dusty-rose" />
                </div>
                <span className="text-sm font-bold text-deep-brown font-serif">AI Assistant</span>
              </div>
              <button
                onClick={onToggle}
                className="text-warm-gray hover:text-deep-brown transition-colors p-1 rounded-md hover:bg-soft-beige/50"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Subtitle */}
            <div className="px-5 py-3 border-b border-warm-gray/10">
              <p className="text-[11px] text-warm-gray leading-relaxed">
                Select any paragraph, then choose a suggestion to let AI refine your story.
              </p>
              <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-semibold uppercase tracking-widest text-dusty-rose">
                <Wand2 size={10} /> Coming in Phase 4
              </span>
            </div>

            {/* Suggestion Cards */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5">
              {suggestions.map((s, i) => (
                <motion.button
                  key={s.label}
                  disabled
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  whileHover={{ x: 2 }}
                  transition={{ duration: 0.15 }}
                  className="w-full text-left p-3 rounded-xl border border-warm-gray/10 bg-[#faf8f4]/60 cursor-not-allowed hover:bg-soft-beige/50 hover:border-warm-gray/20 transition-all group"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="text-base shrink-0 mt-0.5">{s.icon}</span>
                    <div>
                      <p className="text-xs font-semibold text-deep-brown group-hover:text-deep-brown/80 leading-tight">
                        {s.label}
                      </p>
                      <AnimatePresence>
                        {hoveredIdx === i && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="text-[10px] text-warm-gray mt-1 leading-relaxed overflow-hidden"
                          >
                            {s.desc}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Footer note */}
            <div className="px-5 py-3 border-t border-warm-gray/10">
              <p className="text-[10px] text-warm-gray/50 text-center leading-relaxed">
                AI suggestions are optional and never interrupt your writing.
              </p>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};

export default RightSidebar;
