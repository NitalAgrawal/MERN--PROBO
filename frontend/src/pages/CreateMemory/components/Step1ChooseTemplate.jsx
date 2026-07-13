import { motion } from 'framer-motion';
import { User, Heart, Users, Compass, PawPrint, Sparkles, Smile } from 'lucide-react';

const subjects = [
  { id: 'myself', title: 'Myself', description: 'A journey of self-discovery and personal growth.', icon: User },
  { id: 'love', title: 'Someone I Love', description: 'Celebrating a deep and meaningful connection.', icon: Heart },
  { id: 'family', title: 'My Family', description: 'Preserving our shared heritage and traditions.', icon: Users },
  { id: 'friend', title: 'My Friend', description: 'For the ones who have been there through it all.', icon: Smile },
  { id: 'pet', title: 'My Pet', description: 'A tribute to our loyal, furry companions.', icon: PawPrint },
  { id: 'journey', title: 'A Journey', description: 'Travels, adventures, and the places that changed us.', icon: Compass },
  { id: 'other', title: 'Something Else', description: 'An open canvas for any story you wish to tell.', icon: Sparkles },
];

const Step1ChooseTemplate = ({ onSelect }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-5xl mx-auto w-full"
    >
      <div className="text-center mb-12">
        <h2 className="text-4xl font-serif font-bold text-deep-brown mb-4">Every story starts with someone or something meaningful.</h2>
        <p className="text-warm-gray text-lg">Who or what are we preserving memories of today?</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-center">
        {subjects.map((subject) => {
          const Icon = subject.icon;
          return (
            <motion.div
              key={subject.id}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(subject.id)}
              className="bg-warm-ivory border border-warm-gray/10 rounded-2xl p-6 cursor-pointer shadow-sm hover:shadow-soft transition-all text-center flex flex-col items-center group"
            >
              <div className="w-16 h-16 bg-soft-beige rounded-full flex items-center justify-center mb-4 text-deep-brown group-hover:bg-dusty-rose group-hover:text-warm-ivory transition-colors">
                <Icon size={28} strokeWidth={1.5} />
              </div>
              <h3 className="font-serif text-xl font-bold text-deep-brown mb-2">{subject.title}</h3>
              <p className="text-sm text-warm-gray leading-relaxed">{subject.description}</p>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default Step1ChooseTemplate;
