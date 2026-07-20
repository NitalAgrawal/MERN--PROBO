import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { PlusCircle, Sparkles } from 'lucide-react';
import MemoryCard from './MemoryCard';
import { getMemories, createMemory, deleteMemory, bulkReorderMemories } from '../../../services/memoryService';

// ─── Temp ID generator ────────────────────────────────────────────────────────
let tempIdCounter = 1;
const makeTempId = () => `temp-memory-${tempIdCounter++}`;

// ─── Blank card factory ───────────────────────────────────────────────────────
const blankCard = () => ({
  id: makeTempId(),
  title: '',
  body: '',
  date: '',
  location: '',
  photos: [],
  voiceNotes: [],
  saved: false,
});

// ─── MemoryCanvas ─────────────────────────────────────────────────────────────
const MemoryCanvas = ({ storyId, onFinish }) => {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load memories from backend on mount
  useEffect(() => {
    const fetchMemories = async () => {
      try {
        const response = await getMemories(storyId);
        const backendMemories = response.data.memories || [];
        if (backendMemories.length > 0) {
          const mappedCards = backendMemories.map(m => ({
            id: m._id,
            title: m.title || '',
            body: m.content || '',
            date: m.date || '',
            location: m.location || '',
            photos: m.photos || [],
            voiceNotes: m.voiceNotes || [],
            saved: true
          }));
          setCards(mappedCards);
        } else {
          setCards([blankCard()]);
        }
      } catch (err) {
        console.error('Failed to load memories:', err);
        setCards([blankCard()]);
      } finally {
        setLoading(false);
      }
    };
    fetchStoryMemories();

    // Hoisted helper
    async function fetchStoryMemories() {
      await fetchMemories();
    }
  }, [storyId]);

  // Update a single card's data in local state (supports callbacks for safe concurrent updates)
  const updateCard = (id, updaterOrData) =>
    setCards(prev => prev.map(c => {
      if (c.id === id) {
        return typeof updaterOrData === 'function' ? updaterOrData(c) : updaterOrData;
      }
      return c;
    }));

  // Ensure a temporary memory exists in the database before uploading media
  const ensureMemoryCreated = async (id, currentData) => {
    if (!id.startsWith('temp-')) return id;

    try {
      const response = await createMemory(storyId, {
        title: currentData.title || undefined,
        content: currentData.body || 'Untitled Memory',
        date: currentData.date || undefined,
        location: currentData.location || undefined,
        photos: currentData.photos || [],
        voiceNotes: currentData.voiceNotes || []
      });
      const savedMemory = response.data.memory;
      setCards(prev => prev.map(c => (c.id === id ? {
        ...c,
        id: savedMemory._id
      } : c)));
      return savedMemory._id;
    } catch (err) {
      console.error('Failed to auto-create memory for media upload:', err);
      throw err;
    }
  };

  // Save a memory card
  const saveCard = async (id) => {
    const card = cards.find(c => c.id === id);
    if (!card) return;

    if (id.startsWith('temp-')) {
      try {
        const response = await createMemory(storyId, {
          title: card.title || undefined,
          content: card.body,
          date: card.date || undefined,
          location: card.location || undefined,
          photos: card.photos,
          voiceNotes: card.voiceNotes
        });
        const savedMemory = response.data.memory;
        setCards(prev => prev.map(c => (c.id === id ? {
          ...c,
          id: savedMemory._id,
          saved: true
        } : c)));
      } catch (err) {
        console.error('Failed to save memory:', err);
        alert('Failed to save memory. Please try again.');
      }
    } else {
      // Just mark as saved in local UI view state
      setCards(prev => prev.map(c => (c.id === id ? { ...c, saved: true } : c)));
    }
  };

  // Enter edit mode for a saved card
  const editCard = id =>
    setCards(prev => prev.map(c => (c.id === id ? { ...c, saved: false } : c)));

  // Delete a card
  const deleteCard = async (id) => {
    if (!id.startsWith('temp-')) {
      try {
        await deleteMemory(id);
      } catch (err) {
        console.error('Failed to delete memory from database:', err);
        alert('Failed to delete memory. Please try again.');
        return;
      }
    }
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
      const copy = {
        ...source,
        id: makeTempId(),
        saved: false,
        title: source.title ? `${source.title} (copy)` : '',
        photos: source.photos ? [...source.photos] : [],
        voiceNotes: source.voiceNotes ? [...source.voiceNotes] : []
      };
      const idx = prev.findIndex(c => c.id === id);
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      return next;
    });
  };

  // Cancel an unsaved card
  const cancelCard = id => {
    setCards(prev => {
      if (prev.length === 1) return prev;
      return prev.filter(c => c.id !== id);
    });
  };

  // Add a fresh blank card below all saved ones
  const addCard = () => {
    setCards(prev => {
      if (prev.some(c => !c.saved)) return prev;
      return [...prev, blankCard()];
    });
  };

  // Handles visual drag-and-drop reordering with Framer Motion
  const handleReorder = async (newCardsOrder) => {
    setCards(newCardsOrder);

    // Sync new order to the backend
    const savedCards = newCardsOrder.filter(c => c.saved && !c.id.startsWith('temp-'));
    const reorders = savedCards.map((card, index) => ({
      id: card.id,
      order: index
    }));

    if (reorders.length > 0) {
      try {
        await bulkReorderMemories(storyId, reorders);
        console.log('Drag-and-drop ordering synchronized.');
      } catch (err) {
        console.error('Failed to sync reordering on backend:', err);
      }
    }
  };

  const hasUnsaved = cards.some(c => !c.saved);
  const savedCount = cards.filter(c => c.saved).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dusty-rose" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Canvas header */}
      <div className="mb-8 select-none">
        <p className="text-xs font-semibold text-warm-gray uppercase tracking-widest mb-2">Memory Canvas</p>
        <h2 className="font-serif text-4xl font-bold text-deep-brown mb-3">
          Pour your memories onto the page.
        </h2>
        <p className="text-warm-gray text-lg leading-relaxed max-w-xl">
          Each card is one memory. Don't worry about order or perfection — simply capture what feels true.
          StoryNest will weave them into something beautiful.
        </p>
      </div>

      {/* Card stack (with Framer Motion drag and drop reordering) */}
      <Reorder.Group values={cards} onReorder={handleReorder} className="space-y-6">
        <AnimatePresence mode="popLayout">
          {cards.map((card, index) => (
            <Reorder.Item
              key={card.id}
              value={card}
              dragListener={card.saved} // disable dragging while typing in input fields
              className="outline-none"
            >
              <MemoryCard
                card={card}
                index={index}
                isFirst={index === 0 && !card.saved}
                onChange={data => updateCard(card.id, data)}
                onSave={() => saveCard(card.id)}
                onEdit={() => editCard(card.id)}
                onDelete={() => deleteCard(card.id)}
                onDuplicate={() => duplicateCard(card.id)}
                onCancel={() => cancelCard(card.id)}
                ensureMemoryCreated={ensureMemoryCreated}
              />
            </Reorder.Item>
          ))}
        </AnimatePresence>
      </Reorder.Group>

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
            onClick={onFinish}
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
