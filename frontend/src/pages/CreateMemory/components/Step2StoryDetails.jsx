import { motion } from 'framer-motion';
import { ImagePlus, Lock, Globe, Users, ArrowRight } from 'lucide-react';

const Step2StoryDetails = ({ formData, setFormData, onNext }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-2xl mx-auto w-full"
    >
      <div className="text-center mb-10">
        <h2 className="text-4xl font-serif font-bold text-deep-brown mb-4">A few details</h2>
        <p className="text-warm-gray text-lg">Help us understand what makes this story special.</p>
      </div>

      <div className="space-y-8 bg-white p-8 rounded-3xl shadow-soft border border-warm-gray/10">
        
        {/* Text Inputs */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-deep-brown mb-1.5 ml-1">Who or what is this story about?</label>
            <input 
              type="text" 
              placeholder="e.g., My grandmother, A trip to Italy, My dog Max"
              value={formData.about}
              onChange={(e) => setFormData({ ...formData, about: e.target.value })}
              className="w-full bg-soft-beige/50 border-none rounded-xl px-5 py-4 text-deep-brown placeholder:text-warm-gray/60 focus:ring-2 focus:ring-dusty-rose outline-none transition-all font-serif text-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-deep-brown mb-1.5 ml-1">Relationship (Optional)</label>
            <input 
              type="text" 
              placeholder="e.g., Mother, Best Friend, Self"
              value={formData.relationship}
              onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
              className="w-full bg-soft-beige/50 border-none rounded-xl px-5 py-3.5 text-deep-brown placeholder:text-warm-gray/60 focus:ring-2 focus:ring-dusty-rose outline-none transition-all"
            />
          </div>

          <div className="pt-4 border-t border-warm-gray/10">
            <label className="block text-sm font-medium text-deep-brown mb-1.5 ml-1">Story Title (Optional)</label>
            <input 
              type="text" 
              placeholder="Leave blank and AI will suggest one later"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-soft-beige/50 border-none rounded-xl px-5 py-3.5 text-deep-brown placeholder:text-warm-gray/60 focus:ring-2 focus:ring-dusty-rose outline-none transition-all font-serif"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-deep-brown mb-1.5 ml-1">Story Subtitle (Optional)</label>
            <input 
              type="text" 
              placeholder="A brief description or date"
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              className="w-full bg-soft-beige/50 border-none rounded-xl px-5 py-3.5 text-deep-brown placeholder:text-warm-gray/60 focus:ring-2 focus:ring-dusty-rose outline-none transition-all"
            />
          </div>
        </div>

        {/* Cover Image Upload Placeholder */}
        <div className="pt-4">
          <label className="block text-sm font-medium text-deep-brown mb-3 ml-1">Cover Image (Optional)</label>
          <div className="flex flex-col items-center">
            <div className="w-full aspect-[21/9] bg-soft-beige rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-soft-beige/80 transition-colors border-2 border-dashed border-warm-gray/20 group">
              <div className="w-12 h-12 bg-warm-ivory rounded-full flex items-center justify-center text-deep-brown mb-3 group-hover:scale-110 transition-transform shadow-sm">
                <ImagePlus size={24} />
              </div>
              <span className="text-deep-brown font-medium">Upload Cover Photo</span>
              <span className="text-xs text-warm-gray mt-1">High quality, wide format works best</span>
            </div>
          </div>
        </div>

        {/* Privacy Selector */}
        <div className="pt-2">
          <label className="block text-sm font-medium text-deep-brown mb-3 ml-1">Privacy</label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'Private', icon: Lock, label: 'Private' },
              { id: 'Shared', icon: Users, label: 'Shared' },
              { id: 'Public', icon: Globe, label: 'Public' }
            ].map(privacy => {
              const isSelected = formData.privacy === privacy.id;
              const Icon = privacy.icon;
              return (
                <div 
                  key={privacy.id}
                  onClick={() => setFormData({ ...formData, privacy: privacy.id })}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl cursor-pointer transition-all border ${isSelected ? 'bg-dusty-rose text-warm-ivory border-dusty-rose shadow-sm' : 'bg-transparent text-deep-brown border-warm-gray/20 hover:border-dusty-rose/50'}`}
                >
                  <Icon size={20} className="mb-2" />
                  <span className="text-sm font-medium">{privacy.label}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Continue Button */}
        <div className="pt-6 flex justify-end">
          <button 
            onClick={onNext}
            disabled={!formData.about.trim()}
            className="flex items-center gap-2 bg-deep-brown text-warm-ivory px-8 py-3.5 rounded-full hover:bg-deep-brown/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed group shadow-soft"
          >
            Continue
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>
    </motion.div>
  );
};

export default Step2StoryDetails;
