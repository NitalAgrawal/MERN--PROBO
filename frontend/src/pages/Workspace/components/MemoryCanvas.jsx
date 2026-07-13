import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, Sparkles } from 'lucide-react';
import MemoryCard from './MemoryCard';

// ─── ID generator ─────────────────────────────────────────────────────────────
let idCounter = 1;
const makeId = () => `memory-${idCounter++}`;

// ─── Blank card factory ───────────────────────────────────────────────────────
const blankCard = () => ({
  id: makeId(),
  title: '',
  body: '',
  date: '',
  location: '',
  photos: [],
  hasVoice: false,
  saved: false,
});

// ─── MemoryCanvas ─────────────────────────────────────────────────────────────
const MemoryCanvas = ({ onFinish }) => {
  const navigate = useNavigate();
  const [cards, setCards] = useState([blankCard()]);

  // Update a single card's data
  const updateCard = (id, data) =>
    setCards(prev => prev.map(c => (c.id === id ? data : c)));

  // Mark card as saved
  const saveCard = id =>
    setCards(prev => prev.map(c => (c.id === id ? { ...c, saved: true } : c)));

  // Enter edit mode for a saved card
  const editCard = id =>
    setCards(prev => prev.map(c => (c.id === id ? { ...c, saved: false } : c)));

  // Delete a card (keep at least 1 unsaved card)
  const deleteCard = id => {
    setCards(prev => {
      const next = prev.filter(c => c.id !== id);
      return next.length === 0 ? [blankCard()] : next;
    });
  };

  // Duplicate a saved card
  const duplicateCard = id => {
    setCards(prev => {
      const source = prev.find(c => c.id === id);
      if (!source) return prev;
      const copy = { ...source, id: makeId(), saved: false, title: source.title ? `${source.title} (copy)` : '' };
      const idx = prev.findIndex(c => c.id === id);
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      return next;
    });
  };

  // Cancel an unsaved card (remove it, unless it's the only one)
  const cancelCard = id => {
    setCards(prev => {
      if (prev.length === 1) return prev; // keep at least one
      return prev.filter(c => c.id !== id);
    });
  };

  // Add a fresh blank card below all saved ones
  const addCard = () => {
    setCards(prev => {
      // Don't add if there's already an unsaved card
      if (prev.some(c => !c.saved)) return prev;
      return [...prev, blankCard()];
    });
  };

  const hasUnsaved = cards.some(c => !c.saved);
  const savedCount = cards.filter(c => c.saved).length;

  return (
    <div className="space-y-6">
      {/* Canvas header */}
      <div className="mb-8">
        <p className="text-xs font-semibold text-warm-gray uppercase tracking-widest mb-2">Memory Canvas</p>
        <h2 className="font-serif text-4xl font-bold text-deep-brown mb-3">
          Pour your memories onto the page.
        </h2>
        <p className="text-warm-gray text-lg leading-relaxed max-w-xl">
          Each card is one memory. Don't worry about order or perfection — simply capture what feels true.
          StoryNest will weave them into something beautiful.
        </p>
      </div>

      {/* Card stack */}
      <AnimatePresence mode="popLayout">
        {cards.map((card, index) => (
          <MemoryCard
            key={card.id}
            card={card}
            index={index}
            isFirst={index === 0 && !card.saved}
            onChange={data => updateCard(card.id, data)}
            onSave={() => saveCard(card.id)}
            onEdit={() => editCard(card.id)}
            onDelete={() => deleteCard(card.id)}
            onDuplicate={() => duplicateCard(card.id)}
            onCancel={() => cancelCard(card.id)}
          />
        ))}
      </AnimatePresence>

      {/* Add Another Memory CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex justify-center pt-4"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={addCard}
          disabled={hasUnsaved}
          className={`flex items-center gap-2.5 px-8 py-4 rounded-full border-2 border-dashed transition-all text-sm font-medium ${
            hasUnsaved
              ? 'border-warm-gray/10 text-warm-gray/30 cursor-not-allowed'
              : 'border-warm-gray/20 text-deep-brown hover:border-dusty-rose hover:text-dusty-rose hover:bg-dusty-rose/5'
          }`}
        >
          <PlusCircle size={18} />
          Add Another Memory
        </motion.button>
      </motion.div>

      {/* Divider before finish */}
      {savedCount >= 1 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="pt-12 mt-4 border-t border-warm-gray/10 flex flex-col items-center text-center gap-4"
        >
          <p className="text-warm-gray text-sm max-w-sm">
            You've captured {savedCount} {savedCount === 1 ? 'memory' : 'memories'}.
            When you're ready, StoryNest will transform them into a beautiful story.
          </p>
          <button
            onClick={() => navigate('/book-reveal')}
            className="flex items-center gap-2 bg-deep-brown text-warm-ivory px-10 py-4 rounded-full hover:bg-deep-brown/90 transition-colors shadow-soft text-base font-medium group"
          >
            <Sparkles size={18} className="group-hover:animate-pulse" />
            Transform into a Book
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default MemoryCanvas;
