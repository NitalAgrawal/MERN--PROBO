import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, X } from 'lucide-react';

import Step1ChooseTemplate from './components/Step1ChooseTemplate';
import Step2StoryDetails from './components/Step2StoryDetails';
import Step3AddMemories from './components/Step3AddMemories';

const CreateMemory = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    templateId: null,
    about: '',
    relationship: '',
    title: '',
    subtitle: '',
    coverImage: null,
    privacy: 'Private'
  });

  const handleTemplateSelect = (templateId) => {
    setFormData(prev => ({ ...prev, templateId }));
    setStep(2);
  };

  const handleStartWriting = () => {
    // In the future, this will connect to the backend and redirect to the editor
    navigate('/workspace');
  };

  return (
    <div className="min-h-screen bg-warm-ivory flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="px-8 py-6 flex justify-between items-center z-10">
        <button 
          onClick={() => step > 1 ? setStep(step - 1) : navigate('/dashboard')}
          className="flex items-center gap-2 text-warm-gray hover:text-deep-brown transition-colors group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">{step > 1 ? 'Back' : 'Cancel'}</span>
        </button>

        <div className="flex gap-2">
          {[1, 2, 3].map(i => (
            <div 
              key={i} 
              className={`w-12 h-1.5 rounded-full transition-colors duration-500 ${step >= i ? 'bg-deep-brown' : 'bg-warm-gray/20'}`} 
            />
          ))}
        </div>

        <button 
          onClick={() => navigate('/dashboard')}
          className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-warm-gray hover:text-deep-brown hover:bg-soft-beige transition-colors shadow-sm"
        >
          <X size={20} />
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-center items-center px-4 py-8 overflow-y-auto">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <Step1ChooseTemplate 
              key="step1" 
              onSelect={handleTemplateSelect} 
            />
          )}
          {step === 2 && (
            <Step2StoryDetails 
              key="step2" 
              formData={formData} 
              setFormData={setFormData}
              onNext={() => setStep(3)} 
            />
          )}
          {step === 3 && (
            <Step3AddMemories 
              key="step3" 
              onStart={handleStartWriting} 
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default CreateMemory;
