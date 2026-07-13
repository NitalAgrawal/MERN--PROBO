import { motion } from 'framer-motion';
import { Sparkles, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StoryEmptyState = () => {
  const navigate = useNavigate();
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="flex flex-col items-center justify-center text-center py-20 px-4 w-full h-[60vh]"
    >
      {/* Decorative Icon or Placeholder */}
      <div className="w-24 h-24 bg-soft-beige rounded-full flex items-center justify-center mb-8 shadow-sm">
        <BookOpen className="text-warm-gray opacity-50" size={40} strokeWidth={1} />
      </div>

      <h2 className="text-3xl md:text-5xl font-serif font-bold text-deep-brown mb-6 max-w-2xl leading-tight">
        Every great story begins with a <span className="italic text-dusty-rose">single memory</span>.
      </h2>
      
      <p className="text-warm-gray text-lg md:text-xl max-w-xl mb-12 leading-relaxed">
        Capture your memories through text, voice, and photos. Let StoryNest transform them into a beautiful book.
      </p>

      <div className="flex flex-col items-center gap-6">
        <button 
          onClick={() => navigate('/create')}
          className="flex items-center gap-2 bg-deep-brown text-warm-ivory px-8 py-3.5 rounded-full hover:bg-deep-brown/90 transition-colors shadow-soft text-lg font-medium group"
        >
          <Sparkles size={20} className="text-warm-ivory group-hover:animate-pulse" />
          Create a Memory
        </button>
        
        <button className="text-warm-gray hover:text-deep-brown transition-colors text-sm border-b border-transparent hover:border-deep-brown pb-0.5">
          Explore Community Stories
        </button>
      </div>
    </motion.div>
  );
};

export default StoryEmptyState;
