import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Eye, Save, CornerUpLeft, BookOpen } from 'lucide-react';
import { mockStories } from '../../data/stories';

const BookEditor = () => {
  const { storyId } = useParams();
  const navigate = useNavigate();

  // Find active story
  const story = mockStories.find(s => s.id === storyId) || mockStories[0];

  return (
    <div className="min-h-screen bg-warm-ivory text-deep-brown flex flex-col relative overflow-hidden">
      {/* Ambient background blur */}
      <div className="absolute w-[600px] h-[600px] rounded-full bg-dusty-rose/5 blur-3xl top-[-200px] left-[-200px] pointer-events-none" />
      <div className="absolute w-[500px] h-[500px] rounded-full bg-sage-green/5 blur-3xl bottom-[-200px] right-[-200px] pointer-events-none" />

      {/* Editor Header Bar */}
      <header className="h-16 border-b border-warm-gray/10 bg-white/70 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(`/book/${story.id}`)}
            className="flex items-center gap-2 text-sm text-warm-gray hover:text-deep-brown transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Preview</span>
          </button>
          <span className="text-warm-gray/40">|</span>
          <span className="text-xs font-semibold uppercase tracking-widest text-warm-gray">Book Editor Interface</span>
        </div>

        {/* Action icons (disabled placeholders) */}
        <div className="flex items-center gap-2 opacity-50 select-none">
          <button disabled className="p-2 rounded-full hover:bg-soft-beige/50 text-warm-gray flex items-center gap-1.5 text-xs font-medium cursor-not-allowed">
            <Save size={14} /> Save Draft
          </button>
          <button disabled className="bg-deep-brown text-warm-ivory px-4 py-1.5 rounded-full text-xs font-medium cursor-not-allowed flex items-center gap-1">
            <Sparkles size={12} /> Generate Edits
          </button>
        </div>
      </header>

      {/* Editor Layout Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full p-6 md:p-12 flex flex-col md:flex-row gap-8 relative z-10">
        
        {/* Left pane: mini info card */}
        <div className="w-full md:w-80 shrink-0 space-y-6">
          <div className="bg-white border border-warm-gray/10 rounded-2xl p-6 shadow-soft flex flex-col items-center text-center">
            {/* Book Cover gradient */}
            <div className={`w-32 aspect-[3/4] rounded-xl bg-gradient-to-br ${story.coverGradient} shadow-md flex flex-col items-center justify-end p-4 relative overflow-hidden mb-4 select-none`}>
              <div className="absolute left-0 top-0 bottom-0 w-2 bg-black/10 blur-[0.5px]" />
              <BookOpen size={24} className="text-deep-brown/25 mb-4" strokeWidth={1} />
            </div>
            
            <h2 className="font-serif text-lg font-bold text-deep-brown leading-tight">{story.title}</h2>
            <p className="text-xs text-warm-gray italic mt-1">{story.subtitle}</p>
            
            <div className="w-full border-t border-warm-gray/10 my-4 pt-4 text-left space-y-2.5">
              <div className="flex justify-between text-xs">
                <span className="text-warm-gray">Subject:</span>
                <span className="font-medium text-deep-brown">{story.subject}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-warm-gray">Relationship:</span>
                <span className="font-medium text-deep-brown">{story.relationship}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-warm-gray">Status:</span>
                <span className="text-dusty-rose font-semibold">{story.status}</span>
              </div>
            </div>
            
            <button 
              onClick={() => navigate(`/book/${story.id}`)}
              className="w-full bg-soft-beige hover:bg-soft-beige/85 text-deep-brown text-sm font-medium py-2 rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <Eye size={15} /> Preview Book
            </button>
          </div>
        </div>

        {/* Right pane: Interactive Coming Soon Interface */}
        <div className="flex-1 bg-white border border-warm-gray/10 rounded-2xl p-8 md:p-12 shadow-soft flex flex-col justify-center items-center text-center">
          <div className="w-16 h-16 bg-[#faf8f4] border border-warm-gray/10 rounded-full flex items-center justify-center mb-6 shadow-sm">
            <Sparkles size={28} className="text-dusty-rose" />
          </div>

          <h1 className="font-serif text-3xl font-bold text-deep-brown mb-4">
            AI Book Editor
          </h1>
          <p className="text-xs font-semibold uppercase tracking-widest text-dusty-rose mb-6">
            ✦ Coming in Phase 3 ✦
          </p>

          <p className="text-warm-gray text-base leading-relaxed max-w-lg mb-8">
            The Book Editor will enable you to customize chapters, rewrite paragraphs using tailored AI prompts, insert specific memories, and regenerate beautiful layout imagery.
          </p>

          {/* Grid of future tools */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md mb-8 text-left">
            {[
              { title: 'Chapter Customizer', desc: 'Add, delete, or rearrange chapters and text panels.' },
              { title: 'AI Refiner', desc: 'Change reading tone (e.g. nostalgic, humorous, poetic).' },
              { title: 'Memory Integration', desc: 'Inject new details or diary records into existing paragraphs.' },
              { title: 'Layout Templates', desc: 'Select alternative margins, drop cap variants, and spacing grids.' }
            ].map(({ title, desc }) => (
              <div key={title} className="p-4 rounded-xl border border-warm-gray/5 bg-[#faf8f4]/50 flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-dusty-rose mt-1.5 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-deep-brown">{title}</h4>
                  <p className="text-[10px] text-warm-gray mt-0.5 leading-normal">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm justify-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-deep-brown hover:bg-deep-brown/95 text-warm-ivory px-6 py-2.5 rounded-full text-sm font-medium transition-colors flex items-center justify-center gap-1.5 shadow-soft"
            >
              <CornerUpLeft size={15} /> Return to Stories
            </button>
          </div>
        </div>

      </main>

    </div>
  );
};

export default BookEditor;
