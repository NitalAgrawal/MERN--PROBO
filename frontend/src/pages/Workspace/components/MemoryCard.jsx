import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ImagePlus, Mic, Calendar, MapPin, Check,
  Pencil, Trash2, Copy, X, ChevronDown, ChevronUp, MicOff
} from 'lucide-react';
import { updateMemory } from '../../../../services/memoryService';

// ─── Saved Card View ──────────────────────────────────────────────────────────
const SavedMemoryCard = ({ card, index, onEdit, onDelete, onDuplicate }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.97, y: -10 }}
    transition={{ duration: 0.35, ease: 'easeOut' }}
    className="relative bg-white border border-warm-gray/10 rounded-3xl p-8 shadow-soft group cursor-grab active:cursor-grabbing"
  >
    {/* Corner index chip */}
    <span className="absolute top-5 right-5 text-xs font-semibold text-warm-gray/40 select-none">
      #{index + 1}
    </span>

    {card.title && (
      <h4 className="font-serif text-2xl font-bold text-deep-brown mb-4 pr-8 leading-snug">
        {card.title}
      </h4>
    )}

    {card.body && (
      <p className="text-warm-gray leading-relaxed text-base whitespace-pre-wrap mb-5">
        {card.body}
      </p>
    )}

    {/* Meta row */}
    {(card.date || card.location) && (
      <div className="flex flex-wrap gap-4 mb-5 text-xs text-warm-gray/70">
        {card.date && (
          <span className="flex items-center gap-1.5">
            <Calendar size={11} /> {card.date}
          </span>
        )}
        {card.location && (
          <span className="flex items-center gap-1.5">
            <MapPin size={11} /> {card.location}
          </span>
        )}
      </div>
    )}

    {/* Indicator pills */}
    <div className="flex flex-wrap gap-2 mb-2">
      {card.voiceNote && (
        <span className="flex items-center gap-1 text-xs bg-dusty-rose/10 text-dusty-rose px-3 py-1 rounded-full">
          <Mic size={10} /> Voice note attached
        </span>
      )}
      {card.photos?.length > 0 && (
        <span className="flex items-center gap-1 text-xs bg-sage-green/15 text-deep-brown px-3 py-1 rounded-full">
          <ImagePlus size={10} /> {card.photos.length} photo{card.photos.length > 1 ? 's' : ''}
        </span>
      )}
    </div>

    {/* Action bar — appears on hover */}
    <div className="flex items-center gap-2 mt-5 pt-4 border-t border-warm-gray/8 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      <button
        onClick={() => onEdit(card.id)}
        className="flex items-center gap-1.5 text-xs font-medium text-deep-brown hover:text-dusty-rose transition-colors px-3 py-1.5 rounded-full hover:bg-dusty-rose/5"
      >
        <Pencil size={13} /> Edit
      </button>
      <button
        onClick={() => onDuplicate(card.id)}
        className="flex items-center gap-1.5 text-xs font-medium text-deep-brown hover:text-sage-green transition-colors px-3 py-1.5 rounded-full hover:bg-sage-green/10"
      >
        <Copy size={13} /> Duplicate
      </button>
      <button
        onClick={() => onDelete(card.id)}
        className="flex items-center gap-1.5 text-xs font-medium text-warm-gray hover:text-red-400 transition-colors px-3 py-1.5 rounded-full hover:bg-red-50 ml-auto"
      >
        <Trash2 size={13} /> Delete
      </button>
    </div>
  </motion.div>
);

// ─── Editable Card Form ───────────────────────────────────────────────────────
const MemoryCardForm = ({ card, onChange, onSave, onCancel, isFirst }) => {
  const [showExtras, setShowExtras] = useState(!!(card.date || card.location));
  const [recording, setRecording] = useState(false);
  const textareaRef = useRef(null);

  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'
  const debounceTimerRef = useRef(null);

  // Debounced autosave method
  const triggerAutosave = (updatedCard) => {
    if (updatedCard.id.startsWith('temp-')) return; // do not autosave local unsaved drafts

    setSaveStatus('saving');

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      try {
        await updateMemory(updatedCard.id, {
          title: updatedCard.title || undefined,
          content: updatedCard.body,
          date: updatedCard.date || undefined,
          location: updatedCard.location || undefined,
          photos: updatedCard.photos,
          voiceNote: updatedCard.voiceNote
        });
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } catch (err) {
        console.error('Autosave failed:', err);
        setSaveStatus('error');
      }
    }, 2000);
  };

  // Clear debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleSave = async () => {
    if (!card.body.trim()) {
      textareaRef.current?.focus();
      return;
    }

    // Clear debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (card.id.startsWith('temp-')) {
      onSave(); // let parent component handle creation POST
    } else {
      setSaveStatus('saving');
      try {
        await updateMemory(card.id, {
          title: card.title || undefined,
          content: card.body,
          date: card.date || undefined,
          location: card.location || undefined,
          photos: card.photos,
          voiceNote: card.voiceNote
        });
        setSaveStatus('idle');
        onSave(); // mark as saved (read-only view)
      } catch (err) {
        console.error('Save failed:', err);
        setSaveStatus('error');
      }
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="bg-white border-2 border-dusty-rose/20 rounded-3xl p-8 shadow-soft relative"
    >
      {/* Optional cancel (only for non-first cards) */}
      {!isFirst && (
        <button
          onClick={onCancel}
          className="absolute top-5 right-5 text-warm-gray hover:text-deep-brown transition-colors"
        >
          <X size={18} />
        </button>
      )}

      {/* Memory Title */}
      <input
        type="text"
        placeholder="Give this memory a name… (optional)"
        value={card.title}
        onChange={e => {
          const nextCard = { ...card, title: e.target.value };
          onChange(nextCard);
          triggerAutosave(nextCard);
        }}
        className="w-full font-serif text-2xl font-bold text-deep-brown placeholder:text-warm-gray/30 bg-transparent border-none outline-none mb-6 pr-8"
      />

      {/* Main Writing Area */}
      <textarea
        ref={textareaRef}
        rows={7}
        placeholder="Write this memory in your own words… let it flow naturally."
        value={card.body}
        onChange={e => {
          const nextCard = { ...card, body: e.target.value };
          onChange(nextCard);
          triggerAutosave(nextCard);
        }}
        className="w-full bg-warm-ivory/70 rounded-2xl px-5 py-4 text-deep-brown placeholder:text-warm-gray/40 leading-relaxed resize-none focus:ring-2 focus:ring-dusty-rose outline-none transition-all text-base"
      />

      {/* Toolbar Row */}
      <div className="flex items-center gap-3 mt-4 flex-wrap">

        {/* Photos */}
        <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-deep-brown hover:text-dusty-rose transition-colors bg-soft-beige hover:bg-dusty-rose/10 px-4 py-2 rounded-full">
          <ImagePlus size={15} />
          Add Photos
          <input type="file" className="hidden" accept="image/*" multiple />
        </label>

        {/* Voice */}
        <button
          onClick={() => {
            setRecording(r => !r);
            const nextCard = { ...card, voiceNote: !recording ? 'voice_recording.mp3' : card.voiceNote };
            onChange(nextCard);
            triggerAutosave(nextCard);
          }}
          className={`flex items-center gap-2 text-sm font-medium transition-colors px-4 py-2 rounded-full ${
            recording
              ? 'bg-dusty-rose text-warm-ivory animate-pulse'
              : 'text-deep-brown hover:text-dusty-rose bg-soft-beige hover:bg-dusty-rose/10'
          }`}
        >
          {recording ? <MicOff size={15} /> : <Mic size={15} />}
          {recording ? 'Stop Recording' : 'Record Voice'}
        </button>

        {/* Date / Location toggle */}
        <button
          onClick={() => setShowExtras(s => !s)}
          className="flex items-center gap-1.5 text-sm font-medium text-warm-gray hover:text-deep-brown transition-colors px-4 py-2 rounded-full bg-soft-beige hover:bg-warm-gray/10 ml-auto"
        >
          {showExtras ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          Details
        </button>
      </div>

      {/* Optional Date & Location */}
      <AnimatePresence>
        {showExtras && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex gap-4 mt-4">
              <div className="flex-1 flex items-center gap-2 bg-warm-ivory/70 rounded-xl px-4 py-3">
                <Calendar size={14} className="text-warm-gray shrink-0" />
                <input
                  type="text"
                  placeholder="Date (e.g. Summer 2019)"
                  value={card.date}
                  onChange={e => {
                    const nextCard = { ...card, date: e.target.value };
                    onChange(nextCard);
                    triggerAutosave(nextCard);
                  }}
                  className="bg-transparent text-sm text-deep-brown placeholder:text-warm-gray/40 outline-none w-full"
                />
              </div>
              <div className="flex-1 flex items-center gap-2 bg-warm-ivory/70 rounded-xl px-4 py-3">
                <MapPin size={14} className="text-warm-gray shrink-0" />
                <input
                  type="text"
                  placeholder="Location (e.g. Kyoto, Japan)"
                  value={card.location}
                  onChange={e => {
                    const nextCard = { ...card, location: e.target.value };
                    onChange(nextCard);
                    triggerAutosave(nextCard);
                  }}
                  className="bg-transparent text-sm text-deep-brown placeholder:text-warm-gray/40 outline-none w-full"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save */}
      <div className="mt-6 flex justify-end items-center gap-4">
        {saveStatus === 'saving' && (
          <span className="text-xs text-dusty-rose animate-pulse flex items-center gap-1.5 font-medium select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-dusty-rose" /> Saving...
          </span>
        )}
        {saveStatus === 'saved' && (
          <span className="text-xs text-sage-green flex items-center gap-1.5 font-medium select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-sage-green" /> Saved
          </span>
        )}
        {saveStatus === 'error' && (
          <span className="text-xs text-red-400 font-medium select-none">
            Save failed
          </span>
        )}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          className="flex items-center gap-2 bg-deep-brown text-warm-ivory px-7 py-3 rounded-full hover:bg-deep-brown/90 transition-colors shadow-soft text-sm font-medium group"
        >
          <Check size={15} className="group-hover:scale-110 transition-transform" />
          Save Memory
        </motion.button>
      </div>
    </motion.div>
  );
};

// ─── Exported MemoryCard (smart wrapper) ─────────────────────────────────────
const MemoryCard = ({ card, index, onChange, onSave, onEdit, onDelete, onDuplicate, onCancel, isFirst }) => {
  if (card.saved) {
    return (
      <SavedMemoryCard
        card={card}
        index={index}
        onEdit={onEdit}
        onDelete={onDelete}
        onDuplicate={onDuplicate}
      />
    );
  }
  return (
    <MemoryCardForm
      card={card}
      onChange={onChange}
      onSave={onSave}
      onCancel={onCancel}
      isFirst={isFirst}
    />
  );
};

export default MemoryCard;
