import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Check, HelpCircle } from 'lucide-react';

const steps = [
  {
    tag: "Welcome",
    title: "Welcome to ShadowBarter 🕵️‍♂️",
    content: "The ultimate anonymous, secure college trading platform. Let's take a quick tour!"
  },
  {
    tag: "Identity",
    title: "Identity & Coins 🪙",
    content: "No real names here. You trade under an anonymous ID. You start with 50 coins—spend them to request items, and earn more by giving items away."
  },
  {
    tag: "Marketplace",
    title: "The Marketplace 🛒",
    content: "Browse items your peers are offering. The coin cost is automatically calculated based on the item's condition and category."
  },
  {
    tag: "Want-List",
    title: "Want-List & Bounties 🎯",
    content: "Can't find what you need? Post a request. Add a 'Bounty' to incentivize others, or use 'Flash' and 'Emergency' tags for urgent needs!"
  },
  {
    tag: "Lockers",
    title: "Simulated Lockers 📦",
    content: "When a match is made, you'll be assigned a secure locker and time slot. Drop off or pick up without ever meeting face-to-face."
  }
];

export default function OnboardingTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const hasSeen = localStorage.getItem('shadowbarter_tour_seen');
    if (!hasSeen) {
      setTimeout(() => setIsOpen(true), 1000);
    }

    const handleStartTour = () => {
      setCurrentStep(0);
      setIsOpen(true);
    };

    window.addEventListener('start-tour', handleStartTour);
    return () => window.removeEventListener('start-tour', handleStartTour);
  }, []);

  const handleClose = () => {
    localStorage.setItem('shadowbarter_tour_seen', 'true');
    setIsOpen(false);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) setCurrentStep(curr => curr + 1);
    else handleClose();
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(curr => curr - 1);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-primary/40 backdrop-blur-sm"
      />
      <motion.div 
        key={currentStep}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className="relative bg-white w-full max-w-md rounded-[32px] shadow-2xl p-8 border-4 border-primary/10"
      >
        <button onClick={handleClose} className="absolute top-4 right-4 p-2 text-text/40 hover:text-primary transition bg-background rounded-full">
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-wrap justify-center items-center gap-2 mb-8">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-2">
              <button
                onClick={() => setCurrentStep(i)}
                className={`text-[11px] uppercase tracking-widest font-black transition-all cursor-pointer ${
                  i === currentStep 
                    ? 'text-primary border-b-2 border-primary pb-1 scale-105' 
                    : i < currentStep
                      ? 'text-text/60 hover:text-primary'
                      : 'text-text/30 hover:text-text/50'
                }`}
              >
                {step.tag}
              </button>
              {i < steps.length - 1 && (
                <span className="text-text/20 font-black text-[10px]">&gt;</span>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mb-8 h-32 flex flex-col justify-center">
          <h3 className="text-2xl font-black text-primary mb-3">{steps[currentStep].title}</h3>
          <p className="text-text/70 font-medium leading-relaxed">{steps[currentStep].content}</p>
        </div>

        <div className="flex justify-between items-center mt-6">
          <div className="flex gap-2 w-full justify-between">
            <button 
              onClick={prevStep} 
              disabled={currentStep === 0}
              className="p-3 disabled:opacity-30 text-text/60 hover:text-primary transition bg-background rounded-xl"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={nextStep}
              className="px-6 py-3 bg-primary text-white font-black rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition flex items-center gap-2"
            >
              {currentStep === steps.length - 1 ? (
                <>Finish <Check className="w-5 h-5" /></>
              ) : (
                <>Next <ChevronRight className="w-5 h-5" /></>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
