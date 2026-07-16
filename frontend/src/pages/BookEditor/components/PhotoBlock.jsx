import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image, Trash2, Edit3, MoreHorizontal } from 'lucide-react';

const SIZES = ['small', 'medium', 'large', 'full'];
const SIZE_CLASSES = {
  small: 'max-w-xs',
  medium: 'max-w-sm',
  large: 'max-w-lg',
  full: 'w-full',
};

const PhotoBlock = ({ photo, onCaptionChange, onDelete }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [captionEditing, setCaptionEditing] = useState(false);
  const [caption, setCaption] = useState(photo?.caption || '');
  const [size, setSize] = useState('large');
  const [align, setAlign] = useState('center'); // 'left' | 'center' | 'right'

  const alignClasses = {
    left: 'mr-auto',
    center: 'mx-auto',
    right: 'ml-auto',
  };

  const aspectClasses = {
    video: 'aspect-video',
    square: 'aspect-square',
    portrait: 'aspect-[3/4]',
  };

  const handleCaptionSave = () => {
    onCaptionChange?.(caption);
    setCaptionEditing(false);
  };

  return (
    <div className={`group my-8 ${alignClasses[align]} ${SIZE_CLASSES[size]}`}>
      {/* Photo container */}
      <div className="relative">
        <div
          className={`w-full ${aspectClasses[photo?.aspect] || 'aspect-video'} rounded-xl ${
            photo?.placeholderStyle || 'bg-soft-beige'
          } border border-warm-gray/10 flex flex-col items-center justify-center relative overflow-hidden`}
        >
          {/* Soft inner shimmer */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/5 to-white/10" />
          <Image size={32} className="text-warm-gray/30 mb-2 z-10" />
          <span className="text-[11px] text-warm-gray/40 font-serif italic z-10 select-none">
            Photo Placeholder
          </span>

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors rounded-xl" />
        </div>

        {/* Context menu button */}
        <button
          onClick={() => setMenuOpen(o => !o)}
          className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-sm p-1.5 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white text-warm-gray hover:text-deep-brown"
        >
          <MoreHorizontal size={15} />
        </button>

        {/* Dropdown menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -4 }}
              transition={{ duration: 0.15 }}
              onMouseLeave={() => setMenuOpen(false)}
              className="absolute top-10 right-2.5 w-48 bg-white border border-warm-gray/10 rounded-xl shadow-lg z-50 py-1 text-xs overflow-hidden"
            >
              {/* Replace */}
              <button
                onClick={() => setMenuOpen(false)}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-soft-beige/50 text-deep-brown transition-colors"
              >
                <Image size={12} /> Replace Photo
              </button>

              {/* Edit caption */}
              <button
                onClick={() => { setCaptionEditing(true); setMenuOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-soft-beige/50 text-deep-brown transition-colors"
              >
                <Edit3 size={12} /> Edit Caption
              </button>

              {/* Move / Align */}
              <div className="my-1 border-t border-warm-gray/10" />
              <div className="px-3 py-1">
                <p className="text-[10px] text-warm-gray mb-1 font-semibold uppercase tracking-wider">Align</p>
                <div className="flex gap-1">
                  {['left', 'center', 'right'].map(a => (
                    <button
                      key={a}
                      onClick={() => { setAlign(a); }}
                      className={`flex-1 py-1 rounded text-[10px] font-medium transition-colors capitalize ${
                        align === a ? 'bg-deep-brown text-warm-ivory' : 'bg-soft-beige/60 text-warm-gray hover:bg-soft-beige'
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              {/* Resize */}
              <div className="px-3 py-1">
                <p className="text-[10px] text-warm-gray mb-1 font-semibold uppercase tracking-wider">Size</p>
                <div className="flex gap-1">
                  {SIZES.map(s => (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      className={`flex-1 py-1 rounded text-[10px] font-medium transition-colors capitalize ${
                        size === s ? 'bg-deep-brown text-warm-ivory' : 'bg-soft-beige/60 text-warm-gray hover:bg-soft-beige'
                      }`}
                    >
                      {s[0].toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="my-1 border-t border-warm-gray/10" />
              <button
                onClick={() => { onDelete?.(); setMenuOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-50 text-red-500 transition-colors"
              >
                <Trash2 size={12} /> Remove Photo
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Caption */}
      <div className="mt-2 text-center">
        {captionEditing ? (
          <input
            autoFocus
            value={caption}
            onChange={e => setCaption(e.target.value)}
            onBlur={handleCaptionSave}
            onKeyDown={e => e.key === 'Enter' && handleCaptionSave()}
            className="w-full text-center text-xs text-warm-gray font-serif italic bg-transparent border-b border-dusty-rose/50 outline-none py-0.5"
          />
        ) : (
          <button
            onClick={() => setCaptionEditing(true)}
            className="text-xs text-warm-gray/60 font-serif italic hover:text-warm-gray transition-colors group/cap"
          >
            {caption || (
              <span className="text-warm-gray/30">
                + Add caption
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default PhotoBlock;
