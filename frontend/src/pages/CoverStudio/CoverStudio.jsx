import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, ArrowLeft, CheckCircle2, RefreshCw, Wand2,
  BookOpen, Info, Layers, Eye, Zap, Image as ImageIcon, Check
} from 'lucide-react';
import { getStory, generateCover, getCovers, selectActiveCover } from '../../services/storyService';

const STYLES = [
  { id: 'Classic Memoir', label: 'Classic Memoir', icon: '📖', desc: 'Timeless linen, gold foil accents, nostalgic sepia mood', gradient: 'from-[#3a2d27] to-[#1c1410]' },
  { id: 'Vintage Album', label: 'Vintage Album', icon: '📸', desc: 'Retro photo album style with aged paper and film grain', gradient: 'from-[#4a3f31] to-[#251d15]' },
  { id: 'Minimalist', label: 'Minimalist', icon: '🎨', desc: 'Sleek negative space, geometric symmetry, clean lines', gradient: 'from-[#242b35] to-[#11161d]' },
  { id: 'Watercolor', label: 'Watercolor', icon: '🖌️', desc: 'Expressive translucent paints, soft splashes and organic washes', gradient: 'from-[#2c4054] to-[#152332]' },
  { id: 'Modern Hardcover', label: 'Modern Hardcover', icon: '🏛️', desc: 'Bold contemporary color blocking and sharp architectural art', gradient: 'from-[#1e382d] to-[#0c1b14]' },
  { id: "Children's Storybook", label: "Children's Storybook", icon: '🎈', desc: 'Whimsical, colorful hand-drawn illustration with magical warmth', gradient: 'from-[#542d41] to-[#2b121e]' },
  { id: 'Handwritten Journal', label: 'Handwritten Journal', icon: '✒️', desc: 'Intimate kraft paper, botanical ink sketches, leather stitching', gradient: 'from-[#473737] to-[#211717]' }
];

const PROVIDERS = [
  { id: 'openai', label: 'OpenAI Images', sub: 'DALL-E 3 Model' },
  { id: 'gemini', label: 'Gemini', sub: 'Imagen 3 Model' },
  { id: 'stability', label: 'Stability AI', sub: 'SDXL 1.0 Model' },
  { id: 'ideogram', label: 'Ideogram', sub: 'Typography & Art v2' }
];

const CoverStudio = () => {
  const { storyId } = useParams();
  const navigate = useNavigate();

  const [story, setStory] = useState(null);
  const [covers, setCovers] = useState([]);
  const [activeCover, setActiveCover] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selecting, setSelecting] = useState(null);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [selectedStyle, setSelectedStyle] = useState('Classic Memoir');
  const [selectedProvider, setSelectedProvider] = useState('openai');
  const [customInstructions, setCustomInstructions] = useState('');

  // Preview target state (active or hovered concept)
  const [previewCover, setPreviewCover] = useState(null);
  const [promptPopoverId, setPromptPopoverId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const storyRes = await getStory(storyId);
        const fetchedStory = storyRes.data.story;
        setStory(fetchedStory);

        const coversRes = await getCovers(storyId);
        const fetchedCovers = coversRes.data.coverHistory || [];
        const fetchedActive = coversRes.data.activeCover || null;

        setCovers(fetchedCovers);
        setActiveCover(fetchedActive);
        setPreviewCover(fetchedActive || (fetchedCovers.length > 0 ? fetchedCovers[0] : null));
      } catch (err) {
        console.error('Failed to load cover studio data:', err);
        setError('Failed to load story details for Cover Studio.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [storyId]);

  const handleGenerate = async (forceRefresh = false) => {
    try {
      setGenerating(true);
      setError(null);
      setSuccessMsg('');

      const res = await generateCover(storyId, {
        style: selectedStyle,
        provider: selectedProvider,
        customInstructions,
        forceRefresh
      });

      const newCover = res.data.cover;
      const updatedActive = res.data.activeCover;
      const updatedHistory = res.data.coverHistory || [];

      setCovers(updatedHistory);
      if (updatedActive) setActiveCover(updatedActive);
      setPreviewCover(newCover);

      if (res.data.cached) {
        setSuccessMsg('Reused identical cached generation! (Hash match)');
      } else {
        setSuccessMsg('New AI cover concept generated successfully!');
      }

      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Generation error:', err);
      setError(err.response?.data?.message || 'Cover generation failed.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSelectCover = async (coverId) => {
    try {
      setSelecting(coverId);
      const res = await selectActiveCover(storyId, coverId);
      const updatedActive = res.data.activeCover;
      setActiveCover(updatedActive);
      setPreviewCover(updatedActive);
      setSuccessMsg('Active cover updated!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Error selecting cover:', err);
      setError('Failed to update active cover.');
    } finally {
      setSelecting(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#141210] flex justify-center items-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-dusty-rose" />
          <p className="text-warm-gray text-xs tracking-wider uppercase font-semibold">Opening Cover Studio…</p>
        </div>
      </div>
    );
  }

  if (error && !story) {
    return (
      <div className="min-h-screen bg-[#141210] text-warm-ivory flex flex-col justify-center items-center p-6 text-center">
        <p className="text-red-400 font-semibold mb-4">{error}</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-dusty-rose text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-dusty-rose/90 transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#12100e] text-[#f4efe8] flex flex-col selection:bg-dusty-rose selection:text-white">

      {/* ── Top Header ──────────────────────────────────────────────────────── */}
      <header className="h-16 bg-[#1a1714]/90 border-b border-warm-gray/10 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/book/${storyId}`)}
            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-warm-gray hover:text-white transition-colors py-1.5 px-3 rounded-full hover:bg-white/5"
          >
            <ArrowLeft size={16} />
            <span>Back to Book</span>
          </button>
          <div className="h-4 w-[1px] bg-warm-gray/20" />
          <div>
            <h1 className="font-serif font-bold text-base text-white leading-tight flex items-center gap-2">
              <Sparkles size={16} className="text-dusty-rose" />
              AI Cover Generation Studio
            </h1>
            <p className="text-[11px] text-warm-gray/70 truncate max-w-md">
              {story?.title || 'Untitled Story'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {activeCover && (
            <div className="hidden sm:flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs px-3 py-1 rounded-full font-medium">
              <CheckCircle2 size={13} />
              <span>Active Cover Set</span>
            </div>
          )}
          <button
            onClick={() => navigate(`/book-editor/${storyId}`)}
            className="bg-white/10 hover:bg-white/15 text-white px-4 py-1.5 rounded-full text-xs font-medium transition-colors"
          >
            Edit Content
          </button>
        </div>
      </header>

      {/* ── Notification Toast ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-8 z-50 bg-emerald-600 text-white text-xs px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 font-medium border border-emerald-400/30"
          >
            <Check size={16} />
            <span>{successMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Studio Grid ────────────────────────────────────────────────── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">

        {/* LEFT & CENTER PANEL: Controls & Gallery (8 cols) */}
        <div className="lg:col-span-7 xl:col-span-8 p-6 md:p-8 overflow-y-auto space-y-8 border-r border-warm-gray/10">

          {/* 1. Style Selection */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                  <span>1. Choose Cover Aesthetic</span>
                </h2>
                <p className="text-xs text-warm-gray">Select from 7 curated artwork styles tailored for StoryNest biographies.</p>
              </div>
              <span className="text-[10px] font-mono bg-dusty-rose/20 text-dusty-rose px-2.5 py-1 rounded-full uppercase tracking-wider">
                {STYLES.length} Styles
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {STYLES.map((style) => {
                const isSelected = selectedStyle === style.id;
                return (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`relative text-left p-3.5 rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between h-32 group ${
                      isSelected
                        ? 'border-dusty-rose bg-gradient-to-br from-[#2a201c] to-[#1e1714] shadow-lg ring-1 ring-dusty-rose/40'
                        : 'border-warm-gray/10 bg-[#191614] hover:bg-[#221e1a] hover:border-warm-gray/25'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-2xl">{style.icon}</span>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-dusty-rose flex items-center justify-center text-white">
                          <Check size={12} strokeWidth={3} />
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className={`text-xs font-bold font-serif ${isSelected ? 'text-dusty-rose' : 'text-white'}`}>
                        {style.label}
                      </h3>
                      <p className="text-[10px] text-warm-gray/70 line-clamp-2 mt-1 leading-tight">
                        {style.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* 2. Provider & Prompt Parameters */}
          <section className="space-y-4 pt-4 border-t border-warm-gray/10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                  <span>2. AI Model & Fine Tuning</span>
                </h2>
                <p className="text-xs text-warm-gray">Select AI image engine & optional visual prompt details.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Provider Tabs */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-warm-gray uppercase tracking-wider block">
                  AI Image Provider
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PROVIDERS.map((prov) => {
                    const isSelected = selectedProvider === prov.id;
                    return (
                      <button
                        key={prov.id}
                        onClick={() => setSelectedProvider(prov.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-dusty-rose bg-dusty-rose/10 text-white font-semibold'
                            : 'border-warm-gray/10 bg-[#181513] text-warm-gray hover:text-white hover:border-warm-gray/20'
                        }`}
                      >
                        <p className="text-xs font-bold">{prov.label}</p>
                        <p className="text-[10px] opacity-70 mt-0.5">{prov.sub}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Prompt Tweak */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-warm-gray uppercase tracking-wider block">
                  Custom Prompt Additions (Optional)
                </label>
                <textarea
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  placeholder="e.g. Include a gentle golden lamp, warm autumn leaves, soft bokeh lighting…"
                  className="w-full h-[88px] bg-[#181513] border border-warm-gray/10 rounded-xl p-3 text-xs text-white placeholder-warm-gray/40 focus:outline-none focus:border-dusty-rose transition-colors resize-none"
                />
              </div>
            </div>

            {/* Action Bar: Generate / Regenerate */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-2 text-xs text-warm-gray">
                <Zap size={14} className="text-amber-400" />
                <span>Automatic SHA-256 caching reuses identical prompt variations.</span>
              </div>

              <div className="flex items-center gap-3">
                {covers.length > 0 && (
                  <button
                    onClick={() => handleGenerate(true)}
                    disabled={generating}
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white text-xs px-4 py-2.5 rounded-xl font-medium transition-all disabled:opacity-50"
                  >
                    <RefreshCw size={14} className={generating ? 'animate-spin' : ''} />
                    <span>Regenerate Fresh Variation</span>
                  </button>
                )}

                <button
                  onClick={() => handleGenerate(false)}
                  disabled={generating}
                  className="flex items-center gap-2.5 bg-gradient-to-r from-dusty-rose to-rose-600 hover:from-dusty-rose/95 hover:to-rose-500 text-white text-xs px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-rose-950/40 disabled:opacity-50"
                >
                  <Wand2 size={16} className={generating ? 'animate-spin' : ''} />
                  <span>{generating ? 'Crafting Cover…' : 'Generate Cover Concept'}</span>
                </button>
              </div>
            </div>
          </section>

          {/* 3. Cover History & Comparison */}
          <section className="space-y-4 pt-6 border-t border-warm-gray/10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                  <Layers size={18} className="text-dusty-rose" />
                  <span>Compare Generated Concepts</span>
                </h2>
                <p className="text-xs text-warm-gray">History of artwork concepts generated for this story.</p>
              </div>
              <span className="text-xs text-warm-gray font-mono">
                {covers.length} {covers.length === 1 ? 'Concept' : 'Concepts'}
              </span>
            </div>

            {covers.length === 0 ? (
              <div className="p-10 rounded-2xl border border-dashed border-warm-gray/15 bg-[#181513] text-center space-y-3">
                <ImageIcon size={36} className="text-warm-gray/30 mx-auto" />
                <h3 className="text-sm font-semibold text-white">No cover concepts generated yet</h3>
                <p className="text-xs text-warm-gray max-w-sm mx-auto">
                  Select a style above and click <strong>Generate Cover Concept</strong> to create your first cover.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {covers.map((c, idx) => {
                  const isActive = activeCover?.id === c.id || activeCover?._id === c._id;
                  const isPreviewing = previewCover?.id === c.id;

                  return (
                    <motion.div
                      key={c.id || idx}
                      whileHover={{ y: -3 }}
                      onMouseEnter={() => setPreviewCover(c)}
                      className={`relative rounded-2xl border overflow-hidden bg-[#181513] flex flex-col justify-between group transition-all ${
                        isActive
                          ? 'border-emerald-500 ring-2 ring-emerald-500/30'
                          : isPreviewing
                          ? 'border-dusty-rose ring-1 ring-dusty-rose/40'
                          : 'border-warm-gray/10 hover:border-warm-gray/25'
                      }`}
                    >
                      {/* Image Preview Container */}
                      <div className="relative aspect-[3/4] bg-black/40 overflow-hidden">
                        <img
                          src={c.imageUrl}
                          alt={c.style}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                        {/* Top Badges */}
                        <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-1">
                          <span className="text-[9px] uppercase tracking-wider font-bold bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full text-white">
                            {c.style}
                          </span>
                          {isActive && (
                            <span className="text-[9px] font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Check size={10} /> Active
                            </span>
                          )}
                        </div>

                        {/* Info trigger */}
                        <button
                          onClick={() => setPromptPopoverId(promptPopoverId === c.id ? null : c.id)}
                          className="absolute bottom-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-black text-white/80 hover:text-white transition-colors"
                          title="View Prompt"
                        >
                          <Info size={12} />
                        </button>
                      </div>

                      {/* Card Details & Actions */}
                      <div className="p-3 space-y-2">
                        <div className="flex items-center justify-between text-[10px] text-warm-gray">
                          <span className="uppercase font-mono font-semibold text-dusty-rose">{c.provider}</span>
                          <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                        </div>

                        {/* Set Active Button */}
                        <button
                          onClick={() => handleSelectCover(c.id)}
                          disabled={isActive || selecting === c.id}
                          className={`w-full py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                            isActive
                              ? 'bg-emerald-500/20 text-emerald-400 cursor-default border border-emerald-500/30'
                              : 'bg-white/10 hover:bg-white/20 text-white'
                          }`}
                        >
                          {selecting === c.id ? (
                            <RefreshCw size={12} className="animate-spin" />
                          ) : isActive ? (
                            <>
                              <Check size={12} />
                              <span>Active Cover</span>
                            </>
                          ) : (
                            <span>Set Active</span>
                          )}
                        </button>
                      </div>

                      {/* Prompt Popover */}
                      <AnimatePresence>
                        {promptPopoverId === c.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute inset-0 bg-[#181513]/95 backdrop-blur-sm p-4 text-xs text-warm-gray space-y-2 z-20 overflow-y-auto flex flex-col justify-between"
                          >
                            <div>
                              <p className="font-bold text-white mb-1">Generated Prompt:</p>
                              <p className="text-[11px] leading-relaxed italic">{c.prompt}</p>
                            </div>
                            <button
                              onClick={() => setPromptPopoverId(null)}
                              className="w-full py-1 bg-white/10 text-white rounded-lg text-[10px] font-semibold"
                            >
                              Close Details
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </section>

        </div>

        {/* RIGHT PANEL: Live 3D Realistic Book Mockup Preview (4 or 5 cols) */}
        <div className="lg:col-span-5 xl:col-span-4 bg-[#161311] p-6 md:p-8 flex flex-col items-center justify-center relative overflow-hidden">

          {/* Ambient Lighting Background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-dusty-rose/10 blur-[100px] rounded-full pointer-events-none" />

          {/* Section Header */}
          <div className="text-center mb-8 relative z-10">
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-dusty-rose font-bold block mb-1">
              Live Mockup Studio
            </span>
            <h2 className="font-serif text-xl font-bold text-white">Realistic Hardcover Preview</h2>
            <p className="text-xs text-warm-gray mt-1">Hover any concept to see real-time book styling.</p>
          </div>

          {/* 3D Realistic Book Component */}
          <div className="relative z-10 w-full max-w-[310px] perspective-[1200px] my-4">
            <motion.div
              key={previewCover?.id || 'default'}
              initial={{ rotateY: -18, scale: 0.95 }}
              animate={{ rotateY: -12, scale: 1 }}
              whileHover={{ rotateY: -4, scale: 1.02 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="relative aspect-[3/4.4] rounded-r-xl rounded-l-sm shadow-[25px_20px_40px_rgba(0,0,0,0.85)] border-r border-t border-b border-white/10 overflow-hidden transform-style-3d group cursor-pointer"
            >
              {/* Spine Effect (Left Side Depth) */}
              <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-30 pointer-events-none" />
              <div className="absolute left-6 top-0 bottom-0 w-[1px] bg-white/20 z-30 pointer-events-none" />

              {/* Cover Artwork Image */}
              {previewCover?.imageUrl ? (
                <img
                  src={previewCover.imageUrl}
                  alt="Book Cover Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className={`w-full h-full bg-gradient-to-br ${story?.coverGradient || 'from-dusty-rose to-amber-900'} flex flex-col items-center justify-center p-6 text-center`}>
                  <BookOpen size={48} className="text-white/20 mb-4" />
                  <p className="text-xs text-white/60 font-serif italic">Generate a cover concept to preview</p>
                </div>
              )}

              {/* Overlay Content Title & Author */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/30 p-7 flex flex-col justify-between z-20 pointer-events-none">
                <div className="text-center pt-2">
                  <span className="text-[9px] uppercase tracking-[0.25em] text-amber-200/90 font-bold block mb-2">
                    STORYNEST BIOGRAPHY
                  </span>
                </div>

                <div className="text-center pb-2">
                  <h3 className="font-serif text-2xl font-bold text-white leading-tight drop-shadow-md">
                    {story?.title || 'Untitled Story'}
                  </h3>
                  {story?.subtitle && (
                    <p className="font-serif italic text-xs text-warm-gray/90 mt-1 line-clamp-2">
                      {story.subtitle}
                    </p>
                  )}

                  <div className="w-8 h-[1px] bg-amber-200/40 mx-auto my-3" />
                  <span className="text-[10px] uppercase tracking-widest text-amber-100 font-semibold block">
                    Created by You
                  </span>
                </div>
              </div>

              {/* Gloss / Lighting Sheen Effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none z-30 opacity-60 group-hover:opacity-90 transition-opacity" />
            </motion.div>
          </div>

          {/* Mockup Footnote */}
          <div className="mt-8 text-center space-y-2 relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-xs text-warm-gray">
              <Eye size={13} className="text-dusty-rose" />
              <span>Previewing: <strong>{previewCover?.style || 'Default Style'}</strong></span>
            </div>
            <p className="text-[11px] text-warm-gray/50">
              High-resolution export supports PDF & ePub book jackets.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};

export default CoverStudio;
