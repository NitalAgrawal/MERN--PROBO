import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock, Globe, Users, Clock, BookOpen, Sparkles, CheckCircle2
} from 'lucide-react';
import MemoryCanvas from './components/MemoryCanvas';

// ─── Mock Data ────────────────────────────────────────────────────────────────
const mockStory = {
  title: 'My Grandmother',
  subtitle: 'A lifetime of love and wisdom',
  subject: 'Nana Rose',
  relationship: 'Grandmother',
  privacy: 'Private',
  progress: 10,
  lastSaved: 'Just now',
  coverGradient: 'from-dusty-rose/30 via-soft-beige to-warm-ivory',
};

const suggestions = [
  'Describe the first time you remember meeting her.',
  'Share your favourite memory you have together.',
  'Tell us about a lesson she taught you.',
  'What did her home look, smell, or feel like?',
  'Add a photograph that captures her perfectly.',
  'What would you want the world to know about her?',
];

// ─── Privacy Badge ────────────────────────────────────────────────────────────
const PrivacyBadge = ({ privacy }) => {
  const map = {
    Private: { icon: Lock, color: 'text-warm-gray bg-soft-beige' },
    Shared:  { icon: Users, color: 'text-sage-green bg-sage-green/10' },
    Public:  { icon: Globe, color: 'text-dusty-rose bg-dusty-rose/10' },
  };
  const { icon: Icon, color } = map[privacy] || map.Private;
  return (
    <span className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full ${color}`}>
      <Icon size={11} /> {privacy}
    </span>
  );
};

// ─── Left Panel ───────────────────────────────────────────────────────────────
const LeftPanel = ({ story }) => (
  <aside className="w-64 shrink-0 sticky top-0 h-screen flex flex-col overflow-y-auto border-r border-warm-gray/10 bg-warm-ivory py-10 px-7">
    {/* Cover */}
    <div className={`w-full aspect-[3/4] rounded-2xl bg-gradient-to-br ${story.coverGradient} mb-6 flex items-center justify-center shadow-soft overflow-hidden`}>
      <BookOpen size={44} className="text-deep-brown/20" strokeWidth={1} />
    </div>

    <h2 className="font-serif text-xl font-bold text-deep-brown leading-snug mb-1">
      {story.title || 'Untitled Story'}
    </h2>
    {story.subtitle && (
      <p className="text-sm text-warm-gray italic mb-4">{story.subtitle}</p>
    )}

    <div className="flex flex-wrap gap-2 mb-6">
      <PrivacyBadge privacy={story.privacy} />
      {story.relationship && (
        <span className="text-xs font-medium px-3 py-1 rounded-full text-deep-brown bg-soft-beige">
          {story.relationship}
        </span>
      )}
    </div>

    {/* Progress */}
    <div className="mb-6">
      <div className="flex justify-between text-xs font-medium text-warm-gray mb-2">
        <span>Story progress</span>
        <span>{story.progress}%</span>
      </div>
      <div className="w-full bg-soft-beige h-1.5 rounded-full overflow-hidden">
        <motion.div
          className="bg-dusty-rose h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${story.progress}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.4 }}
        />
      </div>
    </div>

    <div className="flex items-center gap-1.5 text-xs text-warm-gray mt-auto pt-4 border-t border-warm-gray/10">
      <Clock size={12} />
      <span>Last saved {story.lastSaved}</span>
    </div>
  </aside>
);

// ─── Suggestions Panel ────────────────────────────────────────────────────────
const SuggestionsPanel = ({ open, onToggle }) => (
  <div
    className={`fixed right-0 top-0 h-full z-20 flex transition-all duration-300 ease-in-out ${open ? 'translate-x-0' : 'translate-x-[calc(100%-2.75rem)]'}`}
  >
    {/* Toggle Tab */}
    <button
      onClick={onToggle}
      className="w-11 self-center bg-white border border-warm-gray/10 rounded-l-2xl shadow-soft py-6 flex flex-col items-center gap-2 text-deep-brown hover:bg-soft-beige transition-colors"
    >
      <Sparkles size={16} className="text-dusty-rose" />
      <span className="text-xs font-medium [writing-mode:vertical-lr] rotate-180 tracking-widest text-warm-gray">
        Suggestions
      </span>
    </button>

    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="w-72 bg-white border-l border-warm-gray/10 shadow-soft h-full overflow-y-auto py-10 px-6"
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={16} className="text-dusty-rose" />
            <h3 className="font-serif text-lg font-bold text-deep-brown">Gentle Suggestions</h3>
          </div>
          <p className="text-xs text-warm-gray mb-8 leading-relaxed">
            Optional nudges to help you remember. Use them only if they inspire you.
          </p>
          <ul className="space-y-4">
            {suggestions.map((s, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                className="group flex items-start gap-3 bg-warm-ivory p-4 rounded-xl cursor-pointer hover:bg-dusty-rose/5 transition-colors border border-warm-gray/5"
              >
                <CheckCircle2 size={15} className="text-dusty-rose/40 mt-0.5 shrink-0 group-hover:text-dusty-rose transition-colors" />
                <span className="text-sm text-warm-gray group-hover:text-deep-brown transition-colors leading-relaxed">
                  {s}
                </span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

// ─── Main Workspace ───────────────────────────────────────────────────────────
const Workspace = () => {
  const navigate = useNavigate();
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-warm-ivory flex relative">
      <LeftPanel story={mockStory} />

      {/* Main canvas area */}
      <main
        className={`flex-1 overflow-y-auto py-14 transition-all duration-300 ${
          suggestionsOpen ? 'px-10 pr-80' : 'px-12 pr-20'
        }`}
      >
        <div className="max-w-2xl mx-auto">
          <MemoryCanvas onFinish={() => navigate('/dashboard')} />

          <p className="text-xs text-warm-gray/50 mt-16 leading-relaxed text-center">
            Your memories are auto-saved and completely private. You can return and add more at any time.
          </p>
        </div>
      </main>

      <SuggestionsPanel open={suggestionsOpen} onToggle={() => setSuggestionsOpen(o => !o)} />
    </div>
  );
};

export default Workspace;
