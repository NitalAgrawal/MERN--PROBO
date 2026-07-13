import { motion } from 'framer-motion';
import { PenTool, Mic, Image as ImageIcon, Sparkles } from 'lucide-react';

const Step3AddMemories = ({ onStart }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-4xl mx-auto w-full"
    >
      <div className="text-center mb-12">
        <h2 className="text-4xl font-serif font-bold text-deep-brown mb-4">Pour your memories onto the page</h2>
        <p className="text-warm-gray text-lg max-w-2xl mx-auto">
          How would you like to start? You can mix and match writing, speaking, and photos to build your story.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {/* Write Option */}
        <motion.div
          whileHover={{ y: -4, scale: 1.02 }}
          className="bg-white border border-warm-gray/10 rounded-3xl p-8 cursor-pointer shadow-sm hover:shadow-soft transition-all text-center flex flex-col items-center group"
        >
          <div className="w-20 h-20 bg-warm-ivory rounded-full flex items-center justify-center text-deep-brown mb-6 group-hover:bg-deep-brown group-hover:text-warm-ivory transition-colors">
            <PenTool size={32} strokeWidth={1.5} />
          </div>
          <h3 className="font-serif text-2xl font-bold text-deep-brown mb-3">Write</h3>
          <p className="text-sm text-warm-gray leading-relaxed">
            Start with a blank page and let the words flow naturally.
          </p>
        </motion.div>

        {/* Record Voice Option */}
        <motion.div
          whileHover={{ y: -4, scale: 1.02 }}
          className="bg-white border border-warm-gray/10 rounded-3xl p-8 cursor-pointer shadow-sm hover:shadow-soft transition-all text-center flex flex-col items-center group"
        >
          <div className="w-20 h-20 bg-warm-ivory rounded-full flex items-center justify-center text-deep-brown mb-6 group-hover:bg-dusty-rose group-hover:text-warm-ivory transition-colors">
            <Mic size={32} strokeWidth={1.5} />
          </div>
          <h3 className="font-serif text-2xl font-bold text-deep-brown mb-3">Record</h3>
          <p className="text-sm text-warm-gray leading-relaxed">
            Speak your memories aloud. Our AI will transcribe and format them beautifully.
          </p>
        </motion.div>

        {/* Upload Photos Option */}
        <motion.div
          whileHover={{ y: -4, scale: 1.02 }}
          className="bg-white border border-warm-gray/10 rounded-3xl p-8 cursor-pointer shadow-sm hover:shadow-soft transition-all text-center flex flex-col items-center group"
        >
          <div className="w-20 h-20 bg-warm-ivory rounded-full flex items-center justify-center text-deep-brown mb-6 group-hover:bg-sage-green group-hover:text-warm-ivory transition-colors">
            <ImageIcon size={32} strokeWidth={1.5} />
          </div>
          <h3 className="font-serif text-2xl font-bold text-deep-brown mb-3">Photos</h3>
          <p className="text-sm text-warm-gray leading-relaxed">
            Upload a gallery and let the visuals guide your storytelling process.
          </p>
        </motion.div>
      </div>

      <div className="flex justify-center">
        <button 
          onClick={onStart}
          className="flex items-center gap-2 bg-deep-brown text-warm-ivory px-10 py-4 rounded-full hover:bg-deep-brown/90 transition-all shadow-soft text-lg font-medium group"
        >
          <Sparkles size={20} className="text-warm-ivory group-hover:animate-pulse" />
          Start Writing
        </button>
      </div>

    </motion.div>
  );
};

export default Step3AddMemories;
