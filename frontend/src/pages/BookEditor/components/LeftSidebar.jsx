import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, ChevronDown, ChevronRight, GripVertical,
  Pencil, Trash2, Copy, Plus
} from 'lucide-react';

// ── Drag-and-drop chapter item ───────────────────────────────────────────────
const ChapterItem = ({
  chapter, _index, isActive, isCollapsed, onSelect,
  onRename, onDelete, onDuplicate, onToggleCollapse,
  isDragging, dragHandleProps,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [nameValue, setNameValue] = useState(chapter.title);

  const handleRenameSubmit = () => {
    onRename(chapter.id, nameValue);
    setRenaming(false);
  };

  return (
    <div
      className={`group relative rounded-xl transition-all duration-150 ${
        isDragging ? 'opacity-50 scale-[0.98]' : ''
      } ${isActive ? 'bg-soft-beige' : 'hover:bg-soft-beige/40'}`}
    >
      <div className="flex items-center gap-2 p-2.5 pr-2">
        {/* Drag handle */}
        <span
          {...dragHandleProps}
          className="drag-handle text-warm-gray/30 hover:text-warm-gray/70 shrink-0 transition-colors"
        >
          <GripVertical size={14} />
        </span>

        {/* Collapse toggle */}
        <button
          onClick={() => onToggleCollapse(chapter.id)}
          className="text-warm-gray/40 hover:text-warm-gray transition-colors shrink-0"
        >
          {isCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
        </button>

        {/* Chapter name / rename input */}
        {renaming ? (
          <input
            autoFocus
            value={nameValue}
            onChange={e => setNameValue(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={e => e.key === 'Enter' && handleRenameSubmit()}
            className="flex-1 text-xs font-semibold text-deep-brown bg-transparent border-b border-dusty-rose outline-none py-0.5"
          />
        ) : (
          <button
            onClick={() => onSelect(chapter.id)}
            className="flex-1 text-left text-xs font-semibold text-deep-brown truncate"
          >
            {chapter.title}
          </button>
        )}

        {/* Context menu */}
        <div className="relative shrink-0">
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-warm-gray/10 text-warm-gray transition-all"
          >
            <ChevronDown size={12} />
          </button>
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -4 }}
                transition={{ duration: 0.15 }}
                onMouseLeave={() => setMenuOpen(false)}
                className="absolute right-0 top-full mt-1 w-40 bg-white border border-warm-gray/10 rounded-xl shadow-lg z-50 py-1 text-xs"
              >
                <button
                  onClick={() => { setRenaming(true); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-soft-beige/50 text-deep-brown transition-colors"
                >
                  <Pencil size={12} /> Rename
                </button>
                <button
                  onClick={() => { onDuplicate(chapter.id); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-soft-beige/50 text-deep-brown transition-colors"
                >
                  <Copy size={12} /> Duplicate
                </button>
                <div className="my-1 border-t border-warm-gray/10" />
                <button
                  onClick={() => { onDelete(chapter.id); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-50 text-red-500 transition-colors"
                >
                  <Trash2 size={12} /> Delete
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

// ── Left Sidebar ─────────────────────────────────────────────────────────────
const LeftSidebar = ({
  story, chapters, activeChapterId, collapsedChapters,
  onSelectChapter, onRenameChapter, onDeleteChapter,
  onDuplicateChapter, onToggleCollapse, onMoveChapter, onAddChapter,
}) => {
  const [draggingId, setDraggingId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);

  // Simplified drag-and-drop via mousedown tracking
  const handleDragStart = (id) => setDraggingId(id);
  const handleDragOver = (id) => setDragOverId(id);
  const handleDragEnd = () => {
    if (draggingId && dragOverId && draggingId !== dragOverId) {
      onMoveChapter(draggingId, dragOverId);
    }
    setDraggingId(null);
    setDragOverId(null);
  };

  const wordCount = chapters.reduce((acc, ch) => {
    return acc + (ch.content?.join(' ').split(/\s+/).length || 0);
  }, 0);

  const progress = story.progress || 0;

  return (
    <aside className="w-64 shrink-0 h-full bg-[#faf8f4] border-r border-warm-gray/10 flex flex-col overflow-hidden">
      {/* Book Cover + Meta */}
      <div className="p-5 border-b border-warm-gray/10">
        {/* Cover */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`w-12 aspect-[3/4] rounded-lg bg-gradient-to-br ${story.coverGradient} shadow-md shrink-0 relative overflow-hidden`}
          >
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-black/10 blur-[0.5px]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <BookOpen size={14} className="text-deep-brown/20" strokeWidth={1.5} />
            </div>
          </div>
          <div className="min-w-0">
            <h3 className="font-serif text-sm font-bold text-deep-brown leading-snug line-clamp-2">
              {story.title}
            </h3>
            <p className="text-[10px] text-warm-gray mt-0.5 italic line-clamp-1">{story.subject}</p>
          </div>
        </div>

        {/* Progress */}
        <div>
          <div className="flex justify-between text-[10px] text-warm-gray mb-1.5 font-medium">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-soft-beige h-1 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-dusty-rose to-[hsl(10,40%,70%)] rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[10px] text-warm-gray/60 mt-1.5">{wordCount.toLocaleString()} words</p>
        </div>
      </div>

      {/* Chapter List */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-warm-gray/60">
            Chapters
          </span>
          <button
            onClick={onAddChapter}
            className="p-1 rounded-md hover:bg-soft-beige text-warm-gray hover:text-deep-brown transition-colors"
            title="Add chapter"
          >
            <Plus size={13} />
          </button>
        </div>

        <div className="space-y-0.5">
          {chapters.map((ch, index) => (
            <div
              key={ch.id}
              draggable
              onDragStart={() => handleDragStart(ch.id)}
              onDragOver={(e) => { e.preventDefault(); handleDragOver(ch.id); }}
              onDragEnd={handleDragEnd}
              className={`transition-all duration-100 ${dragOverId === ch.id && draggingId !== ch.id ? 'border-t-2 border-dusty-rose' : ''}`}
            >
              <ChapterItem
                chapter={ch}
                index={index}
                isActive={activeChapterId === ch.id}
                isCollapsed={collapsedChapters.has(ch.id)}
                onSelect={onSelectChapter}
                onRename={onRenameChapter}
                onDelete={onDeleteChapter}
                onDuplicate={onDuplicateChapter}
                onToggleCollapse={onToggleCollapse}
                isDragging={draggingId === ch.id}
                dragHandleProps={{}}
              />
            </div>
          ))}
        </div>

        {/* Reflection */}
        <div className="mt-2 border-t border-warm-gray/10 pt-2">
          <button
            onClick={() => onSelectChapter('reflection')}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
              activeChapterId === 'reflection'
                ? 'bg-soft-beige text-deep-brown'
                : 'text-warm-gray hover:text-deep-brown hover:bg-soft-beige/40'
            }`}
          >
            ✦ Final Reflection
          </button>
        </div>
      </div>
    </aside>
  );
};

export default LeftSidebar;
