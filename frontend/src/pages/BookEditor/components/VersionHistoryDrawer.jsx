import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Eye, RotateCcw } from 'lucide-react';

const mockVersions = [
  {
    id: 'v3',
    label: "Today's Draft",
    timestamp: 'Jul 15, 2026 · 10:41 PM',
    summary: 'Refined Chapter 2 ending, adjusted pull quote in Chapter 1.',
    current: true,
  },
  {
    id: 'v2',
    label: 'Version 2',
    timestamp: 'Jul 14, 2026 · 3:15 PM',
    summary: 'Added Chapter 3 draft. Reworked dedication text.',
    current: false,
  },
  {
    id: 'v1',
    label: 'Version 1',
    timestamp: 'Jul 13, 2026 · 9:02 AM',
    summary: 'Initial generation. All three chapters, photo captions, and reflection.',
    current: false,
  },
];

const VersionHistoryDrawer = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/10 backdrop-blur-[1px] z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed right-0 top-0 h-full w-80 bg-white border-l border-warm-gray/10 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-warm-gray/10">
              <div>
                <h3 className="font-serif text-lg font-bold text-deep-brown">Version History</h3>
                <p className="text-[11px] text-warm-gray mt-0.5">Preview or restore a previous draft.</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-soft-beige/60 text-warm-gray hover:text-deep-brown transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Version list */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {mockVersions.map((v) => (
                <motion.div
                  key={v.id}
                  whileHover={{ x: 2 }}
                  transition={{ duration: 0.15 }}
                  className={`p-4 rounded-xl border transition-all ${
                    v.current
                      ? 'border-dusty-rose/40 bg-dusty-rose/5'
                      : 'border-warm-gray/10 bg-[#faf8f4]/60 hover:border-warm-gray/20 hover:bg-soft-beige/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="text-sm font-bold text-deep-brown font-serif">{v.label}</p>
                      {v.current && (
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-dusty-rose">
                          Current
                        </span>
                      )}
                    </div>
                    {v.current && (
                      <div className="w-2 h-2 rounded-full bg-dusty-rose mt-1 shrink-0" />
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-[10px] text-warm-gray mb-2">
                    <Clock size={10} />
                    <span>{v.timestamp}</span>
                  </div>

                  <p className="text-[11px] text-warm-gray leading-relaxed mb-3">{v.summary}</p>

                  <div className="flex gap-2">
                    <button
                      disabled
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-warm-gray/15 text-[11px] font-medium text-warm-gray/50 cursor-not-allowed"
                    >
                      <Eye size={11} /> Preview
                    </button>
                    {!v.current && (
                      <button
                        disabled
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-warm-gray/15 text-[11px] font-medium text-warm-gray/50 cursor-not-allowed"
                      >
                        <RotateCcw size={11} /> Restore
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-warm-gray/10">
              <p className="text-[10px] text-warm-gray/50 text-center leading-relaxed">
                Version history is saved automatically. Up to 30 versions are retained.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default VersionHistoryDrawer;
