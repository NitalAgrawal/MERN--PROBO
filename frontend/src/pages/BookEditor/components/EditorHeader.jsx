import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Eye, Share2, Printer, Download, ImageIcon,
  CheckCircle, Loader, History, Users
} from 'lucide-react';

// Mock auto-save cycling: idle → saving → saved
const SAVE_CYCLE_MS = 6000;

const SaveIndicator = () => {
  const [status, setStatus] = useState('saved'); // 'saving' | 'saved'

  useEffect(() => {
    const loop = setInterval(() => {
      setStatus('saving');
      setTimeout(() => setStatus('saved'), 1400);
    }, SAVE_CYCLE_MS);
    return () => clearInterval(loop);
  }, []);

  return (
    <AnimatePresence mode="wait">
      {status === 'saving' ? (
        <motion.span
          key="saving"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          className="flex items-center gap-1.5 text-xs text-warm-gray"
        >
          <Loader size={12} className="animate-spin" />
          Saving…
        </motion.span>
      ) : (
        <motion.span
          key="saved"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          className="flex items-center gap-1.5 text-xs text-warm-gray"
        >
          <CheckCircle size={12} className="text-sage-green" />
          Saved just now
        </motion.span>
      )}
    </AnimatePresence>
  );
};

const DisabledBtn = ({ icon: Icon, label }) => (
  <button
    disabled
    title={label}
    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-warm-gray/40 text-xs font-medium cursor-not-allowed hover:bg-transparent select-none"
  >
    <Icon size={14} />
    <span className="hidden lg:inline">{label}</span>
  </button>
);

const EditorHeader = ({ story, onVersionHistoryOpen }) => {
  const navigate = useNavigate();

  return (
    <header className="h-14 bg-white/90 backdrop-blur-md border-b border-warm-gray/10 flex items-center justify-between px-4 md:px-6 sticky top-0 z-40 shrink-0 gap-4">
      {/* Left: back + breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => navigate(`/book/${story.id}`)}
          className="flex items-center gap-2 text-sm text-warm-gray hover:text-deep-brown transition-colors group shrink-0"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          <span className="hidden sm:inline">Preview</span>
        </button>

        <span className="text-warm-gray/30 select-none">|</span>

        <div className="min-w-0">
          <span className="text-xs font-semibold text-deep-brown truncate block max-w-[180px] md:max-w-[300px]">
            {story.title}
          </span>
          <span className="text-[10px] uppercase tracking-widest text-warm-gray/60 font-medium hidden sm:block">
            Book Editor
          </span>
        </div>
      </div>

      {/* Centre: auto-save */}
      <div className="hidden md:flex items-center">
        <SaveIndicator />
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Active — version history */}
        <button
          onClick={onVersionHistoryOpen}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-warm-gray hover:text-deep-brown hover:bg-soft-beige/50 text-xs font-medium transition-colors"
        >
          <History size={14} />
          <span className="hidden lg:inline">History</span>
        </button>

        {/* Active — preview */}
        <button
          onClick={() => navigate(`/book/${story.id}`)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-warm-gray hover:text-deep-brown hover:bg-soft-beige/50 text-xs font-medium transition-colors"
        >
          <Eye size={14} />
          <span className="hidden lg:inline">Preview</span>
        </button>

        <div className="w-px h-4 bg-warm-gray/15 mx-1" />

        {/* Active — Cover Studio */}
        <button
          onClick={() => navigate(`/cover-studio/${story.id || story._id}`)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-dusty-rose font-semibold bg-dusty-rose/10 hover:bg-dusty-rose/20 text-xs transition-colors"
        >
          <ImageIcon size={14} />
          <span>Cover Studio</span>
        </button>

        <DisabledBtn icon={Share2} label="Publish" />
        <DisabledBtn icon={Printer} label="Print" />
        <DisabledBtn icon={Download} label="Export PDF" />
        <DisabledBtn icon={Users} label="Collaborate" />
      </div>
    </header>
  );
};

export default EditorHeader;
