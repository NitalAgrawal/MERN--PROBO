import { motion } from 'framer-motion';
import { MoreHorizontal, Lock, Globe, Users } from 'lucide-react';

const StoryCard = ({ story, onClick }) => {
  const {
    title,
    description,
    coverImage,
    lastEdited,
    progress,
    visibility,
    status
  } = story;

  const visibilityIcon = {
    Private: <Lock size={12} />,
    Shared: <Users size={12} />,
    Public: <Globe size={12} />
  };

  const statusColors = {
    Draft: 'bg-warm-gray/20 text-deep-brown',
    'In Progress': 'bg-sage-green/30 text-deep-brown',
    Completed: 'bg-warm-ivory text-deep-brown',
    Published: 'bg-dusty-rose text-warm-ivory'
  };

  return (
    <motion.div 
      className="group flex flex-col cursor-pointer"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      onClick={onClick}
    >
      {/* Cover Image Container */}
      <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden shadow-soft mb-4 bg-soft-beige">
        {coverImage ? (
          <img 
            src={coverImage} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className={`w-full h-full flex flex-col items-center justify-end p-6 text-center bg-gradient-to-br ${story.coverGradient || 'from-soft-beige to-warm-ivory'} transition-transform duration-500 group-hover:scale-105 relative`}>
            {/* Book spine decorative effect */}
            <div className="absolute left-0 top-0 bottom-0 w-3 bg-black/10 blur-[1px] rounded-l-2xl" />
            <div className="absolute left-3 top-0 bottom-0 w-[1px] bg-white/20" />
            
            <div className="mb-8 relative z-10 px-2">
              <span className="font-serif text-lg font-bold text-deep-brown tracking-tight leading-snug drop-shadow-sm block">{title}</span>
              {story.subtitle && <span className="text-[10px] text-deep-brown/65 mt-2 block italic line-clamp-2">{story.subtitle}</span>}
            </div>
            
            <span className="text-[10px] uppercase tracking-widest text-deep-brown/40 font-semibold mb-2 relative z-10">StoryNest</span>
          </div>
        )}

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[status] || statusColors.Draft}`}>
            {status}
          </span>
        </div>

        <div className="absolute top-3 right-3 bg-warm-ivory/80 backdrop-blur-sm p-1.5 rounded-full shadow-sm text-deep-brown opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreHorizontal size={18} />
        </div>
      </div>

      {/* Content */}
      <div className="px-1">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-serif text-lg font-bold text-deep-brown leading-tight line-clamp-1">{title}</h3>
          <div className="flex items-center gap-1 text-warm-gray text-xs bg-soft-beige px-2 py-0.5 rounded-full shrink-0">
            {visibilityIcon[visibility]}
            <span>{visibility}</span>
          </div>
        </div>
        
        <p className="text-sm text-warm-gray line-clamp-2 mb-3 leading-relaxed">
          {description}
        </p>

        {/* Progress Bar & Footer */}
        <div className="mt-auto">
          <div className="flex justify-between text-xs text-warm-gray mb-1.5 font-medium">
            <span>{progress}% Complete</span>
            <span>{lastEdited}</span>
          </div>
          <div className="w-full bg-soft-beige h-1.5 rounded-full overflow-hidden">
            <motion.div 
              className="bg-dusty-rose h-full rounded-full" 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StoryCard;
