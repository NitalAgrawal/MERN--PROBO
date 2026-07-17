import { useState, useRef, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import { getStory } from '../../services/storyService';
import EditorHeader from './components/EditorHeader';
import LeftSidebar from './components/LeftSidebar';
import RightSidebar from './components/RightSidebar';
import FloatingToolbar from './components/FloatingToolbar';
import ChapterPage from './components/ChapterPage';
import VersionHistoryDrawer from './components/VersionHistoryDrawer';

// ── Reflection page (non-chapter) ───────────────────────────────────────────
const ReflectionPage = ({ reflection }) => (
  <motion.article
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: 'easeOut' }}
    className="editor-page rounded-2xl mb-10 overflow-hidden"
  >
    <div className="flex justify-between items-center px-10 md:px-16 pt-6 pb-3 text-[10px] text-warm-gray/40 uppercase tracking-widest select-none font-semibold border-b border-warm-gray/5">
      <span>StoryNest</span>
      <span>Reflection</span>
    </div>

    <div className="px-10 md:px-20 py-12 md:py-16">
      <div className="mb-10 text-center">
        <span className="text-[10px] uppercase tracking-[0.25em] text-warm-gray/50 font-bold block mb-3 select-none">
          Conclusion
        </span>
        <h2
          contentEditable
          suppressContentEditableWarning
          className="font-serif text-3xl md:text-4xl font-bold text-deep-brown leading-tight outline-none"
          dangerouslySetInnerHTML={{ __html: reflection?.title || 'Final Reflection' }}
        />
        <div className="w-10 h-[1.5px] bg-warm-gray/20 mx-auto mt-5" />
      </div>

      <div className="space-y-6 text-[#3d3830] text-base md:text-lg leading-[1.85] text-justify">
        {(reflection?.content || []).map((para, idx) => (
          <p
            key={idx}
            contentEditable
            suppressContentEditableWarning
            data-placeholder="Write your reflection…"
            className="outline-none transition-all rounded-sm px-1 -mx-1 focus:bg-soft-beige/20"
            dangerouslySetInnerHTML={{ __html: para }}
          />
        ))}
      </div>

      <div className="flex justify-center pt-12">
        <div className="flex items-center gap-3 text-warm-gray/25 select-none">
          <div className="w-8 h-[1px] bg-current" />
          <span className="text-lg">✦</span>
          <div className="w-8 h-[1px] bg-current" />
        </div>
      </div>
    </div>

    <div className="flex justify-center items-center px-10 md:px-16 pb-6 pt-3 text-[10px] text-warm-gray/30 select-none border-t border-warm-gray/5">
      <span>— Fin —</span>
    </div>
  </motion.article>
);

// ── Main BookEditor ──────────────────────────────────────────────────────────
const BookEditor = () => {
  const { storyId } = useParams();
  const navigate = useNavigate();

  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [chapters, setChapters] = useState([]);
  const [activeChapterId, setActiveChapterId] = useState('reflection');
  
  const [collapsedChapters, setCollapsedChapters] = useState(new Set());
  const [aiPanelOpen, setAiPanelOpen] = useState(true);
  const [versionHistoryOpen, setVersionHistoryOpen] = useState(false);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);

  // The editable area ref — FloatingToolbar scopes selection checks to this
  const editorAreaRef = useRef(null);

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const response = await getStory(storyId);
        const fetchedStory = response.data.story;
        setStory(fetchedStory);
        
        if (fetchedStory.generatedBook) {
          const loadedChapters = (fetchedStory.generatedBook.chapters || []).map(ch => ({ ...ch }));
          setChapters(loadedChapters);
          if (loadedChapters.length > 0) {
            setActiveChapterId(loadedChapters[0].id || loadedChapters[0]._id);
          }
        }
      } catch (err) {
        console.error('Failed to load story for editor:', err);
        setError('Failed to load story for editor.');
      } finally {
        setLoading(false);
      }
    };
    fetchStory();
  }, [storyId]);

  // ── Chapter management ───────────────────────────────────────────────────
  const handleSelectChapter = useCallback((id) => {
    setActiveChapterId(id);
    setTimeout(() => {
      const el = document.getElementById(`chapter-${id}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  }, []);

  const handleRenameChapter = useCallback((id, newTitle) => {
    setChapters(prev =>
      prev.map(ch => (ch.id === id || ch._id === id) ? { ...ch, title: newTitle } : ch)
    );
  }, []);

  const handleDeleteChapter = useCallback((id) => {
    setChapters(prev => {
      const next = prev.filter(ch => ch.id !== id && ch._id !== id);
      if (activeChapterId === id) {
        setActiveChapterId(next[0]?.id || next[0]?._id || 'reflection');
      }
      return next;
    });
  }, [activeChapterId]);

  const handleDuplicateChapter = useCallback((id) => {
    setChapters(prev => {
      const idx = prev.findIndex(ch => ch.id === id || ch._id === id);
      if (idx === -1) return prev;
      const original = prev[idx];
      const copy = {
        ...original,
        id: `${original.id || original._id}-copy-${Date.now()}`,
        _id: undefined,
        title: `${original.title} (Copy)`,
      };
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      return next;
    });
  }, []);

  const handleToggleCollapse = useCallback((id) => {
    setCollapsedChapters(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleMoveChapter = useCallback((dragId, overId) => {
    setChapters(prev => {
      const next = [...prev];
      const fromIdx = next.findIndex(ch => ch.id === dragId || ch._id === dragId);
      const toIdx = next.findIndex(ch => ch.id === overId || ch._id === overId);
      if (fromIdx === -1 || toIdx === -1) return prev;
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return next;
    });
  }, []);

  const handleAddChapter = useCallback(() => {
    const newId = `ch-new-${Date.now()}`;
    const newChapter = {
      id: newId,
      title: 'New Chapter',
      content: ['Begin writing your new chapter here…'],
      photo: null,
      pullQuote: '',
    };
    setChapters(prev => [...prev, newChapter]);
    setActiveChapterId(newId);
    setTimeout(() => {
      const el = document.getElementById(`chapter-${newId}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }, []);

  const getPageNumber = (idx) => 5 + idx * 2;

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center bg-[#f0ede7]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-dusty-rose" />
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="h-screen flex flex-col justify-center items-center bg-[#f0ede7] gap-4">
        <p className="text-red-500 font-semibold">{error || 'Story not found.'}</p>
        <button 
          onClick={() => navigate('/dashboard')} 
          className="bg-deep-brown text-warm-ivory px-6 py-2 rounded-full text-sm font-semibold hover:bg-deep-brown/95 transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#f0ede7]">

      {/* ── Top Header ─── */}
      <EditorHeader
        story={story}
        onVersionHistoryOpen={() => setVersionHistoryOpen(true)}
      />

      {/* ── Three-panel body ─── */}
      <div className="flex-1 flex overflow-hidden min-h-0">

        {/* LEFT SIDEBAR */}
        <AnimatePresence initial={false}>
          {leftSidebarOpen && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 256 }}
              exit={{ width: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden shrink-0 h-full"
            >
              <LeftSidebar
                story={story}
                chapters={chapters}
                activeChapterId={activeChapterId}
                collapsedChapters={collapsedChapters}
                onSelectChapter={handleSelectChapter}
                onRenameChapter={handleRenameChapter}
                onDeleteChapter={handleDeleteChapter}
                onDuplicateChapter={handleDuplicateChapter}
                onToggleCollapse={handleToggleCollapse}
                onMoveChapter={handleMoveChapter}
                onAddChapter={handleAddChapter}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle left sidebar tab */}
        <button
          onClick={() => setLeftSidebarOpen(o => !o)}
          className={`absolute left-0 top-1/2 -translate-y-1/2 z-30 bg-white border border-l-0 border-warm-gray/10 rounded-r-xl py-5 px-1.5 text-warm-gray/40 hover:text-warm-gray transition-colors shadow-sm ${
            leftSidebarOpen ? 'translate-x-64' : 'translate-x-0'
          } hidden lg:flex flex-col items-center transition-transform duration-300`}
          title={leftSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <div className="w-1 h-8 rounded-full bg-current opacity-50" />
        </button>

        {/* CENTER — Editable Book Pages */}
        <main
          ref={editorAreaRef}
          className="flex-1 overflow-y-auto px-4 md:px-8 py-10 min-w-0"
          style={{ background: 'linear-gradient(to bottom, #ede9e2 0%, #e8e4dc 100%)' }}
        >
          <div className="max-w-3xl mx-auto">

            {/* Ambient background glow */}
            <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-dusty-rose/5 blur-3xl rounded-full" />

            {/* Chapters */}
            {chapters.map((chapter, idx) => {
              const chId = chapter.id || chapter._id;
              return (
                <div
                  key={chId}
                  id={`chapter-${chId}`}
                  onClick={() => setActiveChapterId(chId)}
                  className={`transition-all duration-200 ${
                    activeChapterId === chId
                      ? 'ring-2 ring-dusty-rose/20 ring-offset-4 ring-offset-transparent rounded-2xl'
                      : ''
                  }`}
                >
                  <ChapterPage
                    chapter={chapter}
                    pageNumber={getPageNumber(idx)}
                    isCollapsed={collapsedChapters.has(chId)}
                  />
                </div>
              );
            })}

            {/* Reflection page */}
            <div
              id="chapter-reflection"
              onClick={() => setActiveChapterId('reflection')}
              className={`transition-all duration-200 ${
                activeChapterId === 'reflection'
                  ? 'ring-2 ring-dusty-rose/20 ring-offset-4 ring-offset-transparent rounded-2xl'
                  : ''
              }`}
            >
              <ReflectionPage reflection={story.generatedBook?.reflection} />
            </div>

            {/* Bottom spacer */}
            <div className="h-24" />
          </div>
        </main>

        {/* RIGHT SIDEBAR — AI Assistant */}
        <RightSidebar
          isOpen={aiPanelOpen}
          onToggle={() => setAiPanelOpen(o => !o)}
        />

      </div>

      {/* Floating rich-text toolbar — positioned globally via fixed CSS */}
      <FloatingToolbar targetRef={editorAreaRef} />

      {/* Version History Drawer */}
      <VersionHistoryDrawer
        isOpen={versionHistoryOpen}
        onClose={() => setVersionHistoryOpen(false)}
      />

    </div>
  );
};

export default BookEditor;
