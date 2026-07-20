import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Loader2, AlertCircle } from 'lucide-react';

/**
 * PhotoGallery Component
 * Displays a premium grid of images attached to a memory card.
 * Handles:
 *  - Thumbnail rendering with lazy loading (using thumbnailUrl)
 *  - Upload progress / pending states
 *  - Custom lightbox zoomed view
 *  - Asset deletion with confirmation
 */
const PhotoGallery = ({ photos, isEditable, onDeletePhoto }) => {
  const [activePhoto, setActivePhoto] = useState(null);

  if (!photos || photos.length === 0) return null;

  return (
    <div className="mt-4 select-none">
      {/* Grid Layout */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {photos.map((photo) => {
          const isUploading = photo.status === 'uploading';
          const isFailed = photo.status === 'failed';
          const displayUrl = photo.thumbnailUrl || photo.url;

          return (
            <motion.div
              key={photo._id || photo.id || photo.url}
              layoutId={`photo-wrapper-${photo._id || photo.id}`}
              className="relative aspect-square rounded-2xl overflow-hidden bg-warm-ivory border border-warm-gray/10 group shadow-sm flex items-center justify-center cursor-pointer"
              onClick={() => {
                if (!isUploading && !isFailed) {
                  setActivePhoto(photo);
                }
              }}
            >
              {/* Image thumbnail (if uploaded) */}
              {!isFailed && (
                <img
                  src={displayUrl}
                  alt={photo.caption || 'Memory Photo'}
                  loading="lazy"
                  className={`w-full h-full object-cover transition-transform duration-300 ${
                    isUploading ? 'opacity-40 blur-xs' : 'group-hover:scale-105'
                  }`}
                />
              )}

              {/* Uploading Overlay */}
              {isUploading && (
                <div className="absolute inset-0 bg-white/40 flex flex-col items-center justify-center gap-1.5 backdrop-blur-xs">
                  <Loader2 size={20} className="text-dusty-rose animate-spin" />
                  <span className="text-[10px] font-semibold tracking-wider uppercase text-deep-brown/60">
                    Uploading...
                  </span>
                </div>
              )}

              {/* Failed Overlay */}
              {isFailed && (
                <div className="absolute inset-0 bg-red-50/90 flex flex-col items-center justify-center gap-1.5 p-3 text-center">
                  <AlertCircle size={22} className="text-red-400" />
                  <span className="text-xs font-semibold text-red-500">
                    Upload Failed
                  </span>
                </div>
              )}

              {/* Hover Actions (Delete & Caption Preview) */}
              {!isUploading && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-3.5 z-10">
                  {/* Delete Button */}
                  {isEditable && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Delete this photo?')) {
                          onDeletePhoto(photo._id || photo.id);
                        }
                      }}
                      className="self-end bg-white/90 hover:bg-red-500 hover:text-white text-deep-brown p-2 rounded-full shadow-md transition-all duration-200 hover:scale-110 active:scale-95"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}

                  {/* Caption preview at bottom */}
                  {photo.caption ? (
                    <p className="text-white text-xs truncate font-medium bg-black/30 backdrop-blur-xs px-2.5 py-1 rounded-lg">
                      {photo.caption}
                    </p>
                  ) : (
                    <div />
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Lightbox / Custom Modal Zoom */}
      <AnimatePresence>
        {activePhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActivePhoto(null)}
            className="fixed inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 z-50 cursor-zoom-out"
          >
            {/* Close Button */}
            <button
              onClick={() => setActivePhoto(null)}
              className="absolute top-5 right-5 text-white/70 hover:text-white p-3 rounded-full hover:bg-white/10 transition-colors"
            >
              <X size={26} />
            </button>

            {/* High-res Image */}
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="relative max-w-4xl max-h-[75vh] rounded-3xl overflow-hidden shadow-2xl bg-black flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={activePhoto.url}
                alt={activePhoto.caption || 'Zoomed memory photo'}
                className="w-full h-full max-h-[75vh] object-contain"
              />
            </motion.div>

            {/* Caption description */}
            {activePhoto.caption && (
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mt-6 text-center max-w-xl bg-white/5 backdrop-blur-md px-6 py-3.5 rounded-2xl border border-white/10"
              >
                <p className="text-white text-sm font-medium leading-relaxed">
                  {activePhoto.caption}
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PhotoGallery;
