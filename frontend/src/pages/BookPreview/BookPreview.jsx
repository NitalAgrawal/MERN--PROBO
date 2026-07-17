import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Pencil, BookOpen, Sparkles, BookMarked, Printer, Download,
  Share2, Image as ImageIcon, Menu, X, ChevronRight, Eye
} from 'lucide-react';
import { getStory } from '../../services/storyService';

const BookPreview = () => {
  const { storyId } = useParams();
  const navigate = useNavigate();
  
  // State for dynamic story loading
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sidebar open/collapsed state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  // Active page ID for TOC highlighting
  const [activeSection, setActiveSection] = useState('cover');
  // Overall reading progress percentage
  const [readProgress, setReadProgress] = useState(0);

  // References for scrolling
  const containerRef = useRef(null);
  const sectionsRef = useRef({});

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const response = await getStory(storyId);
        const fetchedStory = response.data.story;
        setStory(fetchedStory);
        if (!fetchedStory.generatedBook) {
          // If no generated book yet, redirect to the reveal/compilation page
          navigate(`/book-reveal/${storyId}`);
        }
      } catch (err) {
        console.error('Failed to load book preview:', err);
        setError('Failed to load book preview. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchStory();
  }, [storyId, navigate]);

  const book = story?.generatedBook;

  // Handle scroll progress and update active section
  useEffect(() => {
    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;

      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;

      // 1. Calculate reading progress percentage
      const totalScrollable = scrollHeight - clientHeight;
      if (totalScrollable > 0) {
        const progress = Math.min(Math.round((scrollTop / totalScrollable) * 100), 100);
        setReadProgress(progress);
      }

      // 2. Detect which section is active
      let currentSection = 'cover';
      const sectionIds = ['cover', 'dedication', 'toc', ...(book?.chapters?.map(c => c.id || c._id) || []), 'reflection'];
      
      for (const id of sectionIds) {
        const el = sectionsRef.current[id];
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= clientHeight / 2) {
            currentSection = id;
          }
        }
      }
      setActiveSection(currentSection);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }
    
    // Initial check
    setTimeout(handleScroll, 100);

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [book, storyId]);

  // Smooth scroll to a target section
  const scrollToSection = (id) => {
    const el = sectionsRef.current[id];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f4ee] flex justify-center items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-dusty-rose" />
      </div>
    );
  }

  if (error || !story || !book) {
    return (
      <div className="min-h-screen bg-[#f7f4ee] flex flex-col justify-center items-center gap-4">
        <p className="text-red-500 font-semibold">{error || 'Book preview is not available.'}</p>
        <button 
          onClick={() => navigate('/dashboard')} 
          className="bg-deep-brown text-warm-ivory px-6 py-2 rounded-full text-sm font-semibold hover:bg-deep-brown/95 transition-colors"
        >
          Back to Stories
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f4ee] text-deep-brown flex overflow-hidden relative">
      
      {/* ─── LEFT SIDEBAR (TOC & Settings) ─────────────────────────────────── */}
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="h-screen bg-[#faf8f4] border-r border-warm-gray/10 flex flex-col shrink-0 overflow-hidden relative z-30 shadow-lg"
          >
            {/* Header / Brand */}
            <div className="p-6 border-b border-warm-gray/10 flex items-center justify-between">
              <button 
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 text-sm text-warm-gray hover:text-deep-brown transition-colors group"
              >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                <span>My Stories</span>
              </button>
              <button 
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1.5 rounded-full hover:bg-soft-beige/50 text-warm-gray"
              >
                <X size={18} />
              </button>
            </div>

            {/* Sidebar Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Miniature Cover Preview */}
              <div className="flex items-start gap-4">
                <div className={`w-16 aspect-[3/4] rounded-md bg-gradient-to-br ${story.coverGradient} shadow-md shrink-0 flex items-center justify-center relative overflow-hidden`}>
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-black/10 blur-[0.5px]" />
                  <BookOpen size={18} className="text-deep-brown/25" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold leading-tight line-clamp-2">{story.title || 'Untitled Story'}</h3>
                  <p className="text-xs text-warm-gray mt-1">Created by You</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="text-[10px] bg-soft-beige text-warm-gray px-2 py-0.5 rounded-full font-medium">
                      {story.status}
                    </span>
                    <span className="text-[10px] text-warm-gray font-serif italic">
                      {book?.readingTime || '5 min'} read
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Slider (View Only) */}
              <div>
                <div className="flex justify-between text-xs text-warm-gray mb-2 font-medium">
                  <span>Reading Progress</span>
                  <span>{readProgress}%</span>
                </div>
                <div className="w-full bg-soft-beige h-1 rounded-full overflow-hidden">
                  <div 
                    className="bg-dusty-rose h-full rounded-full transition-all duration-300"
                    style={{ width: `${readProgress}%` }}
                  />
                </div>
              </div>

              {/* Table of Contents */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-warm-gray uppercase tracking-widest">Table of Contents</h4>
                <nav className="space-y-1">
                  {[
                    { id: 'cover', label: 'Cover Page' },
                    { id: 'dedication', label: 'Dedication' },
                    { id: 'toc', label: 'Table of Contents' },
                    ...(book?.chapters?.map((ch, idx) => ({ id: ch.id || ch._id || `ch-${idx}`, label: ch.title })) || []),
                    { id: 'reflection', label: 'Final Reflection' }
                  ].map((item) => {
                    const isActive = activeSection === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => scrollToSection(item.id)}
                        className={`w-full text-left flex items-center justify-between py-2 px-3 rounded-lg text-sm transition-all ${
                          isActive 
                            ? 'bg-soft-beige font-bold text-deep-brown shadow-sm' 
                            : 'text-warm-gray hover:text-deep-brown hover:bg-soft-beige/30'
                        }`}
                      >
                        <span className="truncate pr-2 font-serif">{item.label}</span>
                        {isActive && <ChevronRight size={14} className="text-dusty-rose shrink-0" />}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Primary Actions */}
              <div className="pt-4 border-t border-warm-gray/10 space-y-2">
                <button
                  onClick={() => navigate(`/book-editor/${story._id}`)}
                  className="w-full flex items-center justify-center gap-2 bg-deep-brown text-warm-ivory py-2.5 rounded-full hover:bg-deep-brown/90 transition-colors shadow-md text-sm font-medium"
                >
                  <Pencil size={15} />
                  Edit Book
                </button>
              </div>

              {/* Disabled Future Placeholders */}
              <div className="space-y-3 pt-4 border-t border-warm-gray/10">
                <h4 className="text-xs font-semibold text-warm-gray uppercase tracking-widest">Future Features</h4>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { icon: Sparkles, label: 'AI Rewrite' },
                    { icon: BookMarked, label: 'Add Memory' },
                    { icon: ImageIcon, label: 'New Cover' },
                    { icon: Share2, label: 'Publish' },
                    { icon: Printer, label: 'Print Book' },
                    { icon: Download, label: 'PDF Book' }
                  ].map(({ icon: Icon, label }) => (
                    <button
                      key={label}
                      disabled
                      className="flex flex-col items-center justify-center p-3 rounded-xl border border-warm-gray/10 bg-black/[0.01] text-warm-gray opacity-45 cursor-not-allowed hover:bg-transparent transition-colors text-center"
                    >
                      <Icon size={16} className="mb-1" />
                      <span className="text-[10px] font-medium leading-tight">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ─── SIDEBAR TOGGLE FLOATER ────────────────────────────────────────── */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed left-6 top-6 z-40 bg-white border border-warm-gray/15 p-3 rounded-full shadow-lg text-deep-brown hover:bg-soft-beige transition-all"
        >
          <Menu size={20} />
        </button>
      )}

      {/* ─── MAIN CONTENT CONTAINER (READING PAGES) ─────────────────────────── */}
      <main 
        ref={containerRef}
        className="flex-1 h-screen overflow-y-auto px-6 md:px-16 py-10 scroll-smooth flex flex-col items-center"
      >
        <div className="w-full max-w-2xl flex flex-col items-center">
          
          {/* Header Bar Indicator */}
          <div className="w-full flex justify-between items-center text-xs text-warm-gray border-b border-warm-gray/10 pb-3 mb-10 select-none">
            <span className="font-serif italic font-medium">{story.title || 'Untitled Story'}</span>
            <span className="uppercase tracking-widest font-semibold text-[10px]">StoryNest Preview</span>
          </div>

          {/* ─── COVER PAGE ─── */}
          <section
            id="cover"
            ref={el => sectionsRef.current['cover'] = el}
            className="w-full aspect-[3/4.2] rounded-2xl bg-gradient-to-br from-white to-[#faf8f4] border border-warm-gray/10 shadow-soft p-12 md:p-16 mb-16 flex flex-col justify-between relative overflow-hidden select-none"
          >
            <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-black/5 via-black/[0.01] to-transparent blur-[1px]" />
            <div className="absolute left-4 top-0 bottom-0 w-[1px] bg-warm-gray/10" />

            <div className="text-center mt-8 relative z-10">
              <span className="text-[10px] uppercase tracking-[0.25em] text-warm-gray/60 font-semibold block mb-12">StoryNest Biography</span>
              
              <div className={`w-40 h-40 rounded-full mx-auto mb-12 bg-gradient-to-br ${story.coverGradient} shadow-inner flex items-center justify-center relative`}>
                <BookOpen size={48} className="text-deep-brown/15" strokeWidth={1} />
                <div className="absolute inset-0 rounded-full bg-white/10 mix-blend-overlay" />
              </div>

              <h1 className="font-serif text-3xl md:text-5xl font-bold leading-tight tracking-tight text-deep-brown mt-4 mb-4">
                {story.title || 'Untitled Story'}
              </h1>
              {story.subtitle && (
                <p className="font-serif text-warm-gray italic text-sm md:text-base max-w-md mx-auto leading-relaxed">
                  {story.subtitle}
                </p>
              )}
            </div>

            <div className="text-center mb-4 relative z-10">
              <div className="w-8 h-[1px] bg-warm-gray/20 mx-auto mb-4" />
              <span className="text-[10px] uppercase tracking-[0.2em] text-warm-gray/50 font-semibold block">Author</span>
              <span className="font-serif text-deep-brown font-semibold text-lg mt-1 block">Created by You</span>
            </div>
          </section>

          {/* ─── DEDICATION PAGE ─── */}
          <section
            id="dedication"
            ref={el => sectionsRef.current['dedication'] = el}
            className="w-full min-h-[50vh] rounded-2xl bg-white border border-warm-gray/10 shadow-soft p-12 md:p-16 mb-16 flex flex-col justify-center items-center relative overflow-hidden"
          >
            <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-black/5 via-black/[0.01] to-transparent blur-[1px]" />
            <div className="absolute left-4 top-0 bottom-0 w-[1px] bg-warm-gray/10" />

            <div className="max-w-md text-center py-12">
              <p className="font-serif text-xl md:text-2xl text-deep-brown italic leading-loose font-medium select-none">
                "{book?.dedication || 'Dedicated to those who store their memories in quiet corners.'}"
              </p>
            </div>
          </section>

          {/* ─── TABLE OF CONTENTS PAGE ─── */}
          <section
            id="toc"
            ref={el => sectionsRef.current['toc'] = el}
            className="w-full min-h-[60vh] rounded-2xl bg-white border border-warm-gray/10 shadow-soft p-12 md:p-16 mb-16 flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-black/5 via-black/[0.01] to-transparent blur-[1px]" />
            <div className="absolute left-4 top-0 bottom-0 w-[1px] bg-warm-gray/10" />

            <div>
              <h2 className="font-serif text-2xl md:text-3xl font-bold mb-10 pb-4 border-b border-warm-gray/10 text-center select-none">
                Contents
              </h2>
              <div className="max-w-md mx-auto space-y-6">
                {[
                  { id: 'cover', label: 'Cover Page', pageNum: '1' },
                  { id: 'dedication', label: 'Dedication', pageNum: '3' },
                  ...(book?.chapters?.map((ch, index) => ({ id: ch.id || ch._id || `ch-${index}`, label: ch.title, pageNum: `${5 + index * 2}` })) || []),
                  { id: 'reflection', label: 'Final Reflection', pageNum: `${5 + (book?.chapters?.length || 0) * 2}` }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className="w-full flex items-end justify-between text-left group text-warm-gray hover:text-deep-brown transition-colors font-serif"
                  >
                    <span className="font-semibold pr-2 group-hover:underline">{item.label}</span>
                    <span className="flex-1 border-b border-dashed border-warm-gray/25 mx-2 mb-1 group-hover:border-deep-brown/40" />
                    <span className="font-semibold tabular-nums">{item.pageNum}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="text-center text-xs text-warm-gray mt-12 select-none">
              — Page 4 —
            </div>
          </section>

          {/* ─── DYNAMIC CHAPTERS ─── */}
          {book?.chapters?.map((chapter, index) => {
            const pageNum = 5 + index * 2;
            const chId = chapter.id || chapter._id || `ch-${index}`;
            return (
              <section
                key={chId}
                id={chId}
                ref={el => sectionsRef.current[chId] = el}
                className="w-full rounded-2xl bg-white border border-warm-gray/10 shadow-soft p-12 md:p-16 mb-16 flex flex-col justify-between relative overflow-hidden"
              >
                <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-black/5 via-black/[0.01] to-transparent blur-[1px]" />
                <div className="absolute left-4 top-0 bottom-0 w-[1px] bg-warm-gray/10" />

                <div className="space-y-8">
                  <div className="text-center mb-8">
                    <span className="text-[10px] uppercase tracking-widest text-warm-gray/50 font-bold block mb-2 select-none">Section {index + 1}</span>
                    <h2 className="font-serif text-3xl md:text-4xl font-bold text-deep-brown leading-tight">
                      {chapter.title}
                    </h2>
                    <div className="w-12 h-[1px] bg-warm-gray/20 mx-auto mt-4" />
                  </div>

                  <div className="space-y-6 text-[#3d3830] font-sans text-base md:text-lg leading-relaxed text-justify">
                    {chapter.content?.map((paragraph, pIdx) => {
                      if (pIdx === 0) {
                        const firstChar = paragraph.charAt(0);
                        const restOfText = paragraph.slice(1);
                        return (
                          <p key={pIdx}>
                            <span className="first-letter:text-5xl first-letter:font-serif first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:font-bold first-letter:text-deep-brown">
                              {firstChar}
                            </span>
                            {restOfText}
                          </p>
                        );
                      }
                      return <p key={pIdx}>{paragraph}</p>;
                    })}
                  </div>

                  {chapter.photo && (
                    <div className="my-8">
                      <div 
                        className={`w-full ${
                          chapter.photo.aspect === 'video' ? 'aspect-video' : chapter.photo.aspect === 'portrait' ? 'aspect-[3/4]' : 'aspect-square'
                        } rounded-xl ${chapter.photo.placeholderStyle || 'bg-soft-beige'} border border-warm-gray/10 flex flex-col items-center justify-center p-8 relative overflow-hidden shadow-inner group`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2.5s_infinite]" />
                        
                        <ImageIcon size={36} className="text-warm-gray/40 mb-3 group-hover:scale-105 transition-transform" />
                        <span className="text-xs text-warm-gray/50 text-center font-serif italic select-none">
                          Illustration Block Placeholder
                        </span>
                        
                        <div className="absolute bottom-4 right-4 flex items-center gap-1.5 text-[10px] text-warm-gray/40 bg-white/40 backdrop-blur-sm px-2 py-1 rounded-full">
                          <Eye size={10} />
                          <span>AI Asset Preview</span>
                        </div>
                      </div>
                      {chapter.photo.caption && (
                        <p className="text-xs text-warm-gray font-serif italic text-center mt-3 leading-normal">
                          {chapter.photo.caption}
                        </p>
                      )}
                    </div>
                  )}

                  {chapter.pullQuote && (
                    <blockquote className="my-8 pl-6 border-l-4 border-dusty-rose py-2 italic font-serif text-lg md:text-xl text-deep-brown/85 leading-relaxed bg-[#fdfbf7] pr-4 rounded-r-md">
                      “{chapter.pullQuote}”
                    </blockquote>
                  )}

                </div>

                <div className="text-center text-xs text-warm-gray mt-12 select-none">
                  — Page {pageNum} —
                </div>
              </section>
            );
          })}

          {/* ─── FINAL REFLECTION PAGE ─── */}
          <section
            id="reflection"
            ref={el => sectionsRef.current['reflection'] = el}
            className="w-full rounded-2xl bg-white border border-warm-gray/10 shadow-soft p-12 md:p-16 mb-24 flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-black/5 via-black/[0.01] to-transparent blur-[1px]" />
            <div className="absolute left-4 top-0 bottom-0 w-[1px] bg-warm-gray/10" />

            <div className="space-y-8">
              <div className="text-center mb-8">
                <span className="text-[10px] uppercase tracking-widest text-warm-gray/50 font-bold block mb-2 select-none">Conclusion</span>
                <h2 className="font-serif text-3xl font-bold text-deep-brown">
                  {book?.reflection?.title || 'Final Reflection'}
                </h2>
                <div className="w-12 h-[1px] bg-warm-gray/20 mx-auto mt-4" />
              </div>

              <div className="space-y-6 text-[#3d3830] font-sans text-base md:text-lg leading-relaxed text-justify">
                {book?.reflection?.content?.map((paragraph, pIdx) => (
                  <p key={pIdx}>{paragraph}</p>
                ))}
              </div>

              <div className="flex justify-center pt-8">
                <div className="w-3 h-3 rounded-full bg-dusty-rose/30 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-dusty-rose" />
                </div>
              </div>
            </div>

            <div className="text-center text-xs text-warm-gray mt-12 select-none">
              — Page {5 + (book?.chapters?.length || 0) * 2} —
            </div>
          </section>

          {/* Bottom Back To Stories CTA */}
          <div className="w-full flex justify-between items-center text-xs text-warm-gray border-t border-warm-gray/10 pt-6 pb-20 select-none">
            <button 
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-1.5 hover:text-deep-brown transition-colors group"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Stories</span>
            </button>
            <button 
              onClick={() => {
                const container = containerRef.current;
                if (container) {
                  container.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className="hover:text-deep-brown transition-colors"
            >
              Back to Top ↑
            </button>
          </div>

        </div>
      </main>

    </div>
  );
};

export default BookPreview;
