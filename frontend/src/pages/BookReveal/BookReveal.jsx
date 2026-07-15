import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check, BookOpen, Clock, Hash, BookMarked, Pencil, ChevronRight
} from 'lucide-react';
import { mockStories } from '../../data/stories';

// ─── Processing stages ────────────────────────────────────────────────────────
const stages = [
  'Reading your memories',
  'Understanding relationships',
  'Finding meaningful moments',
  'Organising your timeline',
  'Creating chapters',
  'Designing your book',
];

// Duration each stage stays "active" before the next one checks off (ms)
const STAGE_INTERVAL = 900;
// How long to wait after all stages complete before revealing
const REVEAL_DELAY = 800;

// ─── Single animated stage row ────────────────────────────────────────────────
const StageRow = ({ label, state }) => {
  // state: 'pending' | 'active' | 'done'
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: state === 'pending' ? 0.3 : 1, x: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex items-center gap-4"
    >
      {/* Icon area */}
      <div className="w-8 h-8 shrink-0 flex items-center justify-center">
        {state === 'done' && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="w-8 h-8 bg-deep-brown rounded-full flex items-center justify-center"
          >
            <Check size={14} className="text-warm-ivory" strokeWidth={3} />
          </motion.div>
        )}
        {state === 'active' && (
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
            className="w-8 h-8 bg-dusty-rose rounded-full flex items-center justify-center shadow-md"
          >
            <div className="w-2.5 h-2.5 bg-warm-ivory rounded-full" />
          </motion.div>
        )}
        {state === 'pending' && (
          <div className="w-8 h-8 border-2 border-warm-gray/20 rounded-full" />
        )}
      </div>

      {/* Label */}
      <span
        className={`font-serif text-xl transition-all duration-300 ${
          state === 'done'
            ? 'text-deep-brown line-through decoration-warm-gray/30'
            : state === 'active'
            ? 'text-deep-brown font-bold'
            : 'text-warm-gray'
        }`}
      >
        {label}
      </span>
    </motion.div>
  );
};

// ─── Phase 1 — Processing ─────────────────────────────────────────────────────
const ProcessingScreen = ({ currentStage }) => (
  <motion.div
    key="processing"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0, scale: 0.98 }}
    transition={{ duration: 0.6 }}
    className="flex flex-col items-center justify-center min-h-screen px-6 text-center"
  >
    {/* Ambient glow blob */}
    <motion.div
      animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.6, 0.4] }}
      transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
      className="absolute w-96 h-96 rounded-full bg-dusty-rose/15 blur-3xl pointer-events-none"
    />

    <div className="relative z-10 max-w-lg w-full">
      {/* Heading */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-xs font-semibold text-dusty-rose uppercase tracking-widest mb-6"
      >
        StoryNest AI
      </motion.p>
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="font-serif text-4xl md:text-5xl font-bold text-deep-brown leading-tight mb-16"
      >
        Your memories are<br />
        becoming a{' '}
        <span className="italic text-dusty-rose">beautiful story</span>.
      </motion.h1>

      {/* Stage list */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="space-y-5 text-left"
      >
        {stages.map((label, i) => {
          const state =
            i < currentStage ? 'done' : i === currentStage ? 'active' : 'pending';
          return <StageRow key={label} label={label} state={state} />;
        })}
      </motion.div>

      {/* Fine print */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-xs text-warm-gray/50 mt-16"
      >
        This usually takes just a moment. Please don't close this page.
      </motion.p>
    </div>
  </motion.div>
);

const BookRevealScreen = ({ book, navigate }) => {
  const chapterCount = book.book?.chapters?.length || 0;
  const memoryCount = chapterCount * 3; // Mocking 3 memories per chapter
  const readingTime = book.book?.readingTime || '15 min';

  return (
    <motion.div
      key="reveal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="flex flex-col items-center justify-center min-h-screen px-6 py-16 text-center"
    >
      {/* Ambient glow */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
        className="absolute w-[500px] h-[500px] rounded-full bg-dusty-rose/10 blur-3xl pointer-events-none"
      />

      <div className="relative z-10 flex flex-col items-center max-w-xl w-full">
        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xs font-semibold text-dusty-rose uppercase tracking-widest mb-12"
        >
          ✦ Your Book is Ready
        </motion.p>

        {/* Book Cover */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="mb-12"
        >
          {/* Outer shadow frame — gives a "book on table" feel */}
          <div className="relative">
            {/* Spine shadow */}
            <div className="absolute -left-3 top-3 bottom-0 w-3 bg-deep-brown/20 rounded-l-sm blur-[2px]" />
            {/* Page edges */}
            <div className="absolute -right-1 top-1 bottom-0 w-2 bg-white/60 rounded-r-sm" />

            {/* Cover */}
            <div
              className={`w-56 md:w-64 aspect-[3/4] rounded-2xl bg-gradient-to-br ${book.coverGradient || 'from-soft-beige to-warm-ivory'} shadow-2xl flex flex-col items-center justify-end p-6 overflow-hidden`}
            >
              {/* Decorative inner pattern */}
              <motion.div
                animate={{ rotate: [0, 3, 0, -3, 0] }}
                transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
                className="absolute inset-0 flex items-center justify-center opacity-10"
              >
                <BookOpen size={140} strokeWidth={0.5} className="text-deep-brown" />
              </motion.div>

              {/* Cover text */}
              <div className="relative z-10 text-center">
                <p className="text-xs font-semibold text-deep-brown/50 uppercase tracking-widest mb-2">StoryNest</p>
                <h2 className="font-serif text-lg font-bold text-deep-brown leading-snug">
                  {book.title}
                </h2>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Title & Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-deep-brown mb-3 leading-snug">
            {book.title}
          </h1>
          <p className="text-warm-gray text-base leading-relaxed max-w-md mx-auto italic">
            {book.subtitle}
          </p>
        </motion.div>

        {/* Meta pills */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75 }}
          className="flex flex-wrap items-center justify-center gap-3 mb-12"
        >
          {[
            { icon: BookMarked, label: `${chapterCount} Chapters` },
            { icon: Hash, label: `${memoryCount} Memories` },
            { icon: Clock, label: `${readingTime} read` },
          ].map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="flex items-center gap-2 bg-white border border-warm-gray/10 text-warm-gray text-sm px-4 py-2 rounded-full shadow-sm"
            >
              <Icon size={13} /> {label}
            </span>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="flex flex-col sm:flex-row gap-4 w-full justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(`/book/${book.id}`)}
            className="flex items-center justify-center gap-2.5 bg-deep-brown text-warm-ivory px-10 py-4 rounded-full hover:bg-deep-brown/90 transition-colors shadow-soft text-base font-medium group"
          >
            <BookOpen size={18} className="group-hover:animate-pulse" />
            Open My Book
            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/workspace')}
            className="flex items-center justify-center gap-2.5 bg-white text-deep-brown border border-warm-gray/20 px-10 py-4 rounded-full hover:bg-soft-beige transition-colors text-base font-medium group"
          >
            <Pencil size={16} />
            Continue Collecting Memories
          </motion.button>
        </motion.div>

        {/* Fine print */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="text-xs text-warm-gray/50 mt-10"
        >
          You can always come back and add more memories before publishing.
        </motion.p>
      </div>
    </motion.div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const BookReveal = () => {
  const navigate = useNavigate();
  const { storyId } = useParams();
  const [currentStage, setCurrentStage] = useState(0);
  const [phase, setPhase] = useState('processing'); // 'processing' | 'reveal'

  const activeStoryId = storyId || 'family-rose';
  const story = mockStories.find(s => s.id === activeStoryId) || mockStories[0];

  useEffect(() => {
    if (phase !== 'processing') return;

    // Advance through stages
    if (currentStage < stages.length) {
      const timer = setTimeout(
        () => setCurrentStage(s => s + 1),
        STAGE_INTERVAL
      );
      return () => clearTimeout(timer);
    }

    // All stages done → wait then reveal
    const revealTimer = setTimeout(() => setPhase('reveal'), REVEAL_DELAY);
    return () => clearTimeout(revealTimer);
  }, [currentStage, phase]);

  return (
    <div className="min-h-screen bg-warm-ivory relative overflow-hidden">
      <AnimatePresence mode="wait">
        {phase === 'processing' ? (
          <ProcessingScreen key="processing" currentStage={currentStage} />
        ) : (
          <BookRevealScreen key="reveal" book={story} navigate={navigate} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default BookReveal;
