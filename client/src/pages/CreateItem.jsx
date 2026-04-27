import { useState, useContext } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ArrowLeft, Box, Sparkles, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CreateItem() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [condition, setCondition] = useState('Good');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const potentialCoins = condition === 'New' ? 7 : condition === 'Good' ? 5 : 3;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await api.post('/items', { title, description, condition });
      alert('Your item is now live in the Shadows!');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'The Safety Filter rejected this listing.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <motion.button 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate('/dashboard')} 
        className="flex items-center gap-2 text-primary font-black mb-8 hover:translate-x-[-4px] transition-all"
      >
        <ArrowLeft className="w-5 h-5"/> Back to Dashboard
      </motion.button>
      
      <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
        <div className="md:col-span-3">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-10 rounded-[40px] shadow-sm border border-border"
          >
            <h2 className="text-4xl font-black text-primary mb-2">Shadow Listing</h2>
            <p className="opacity-50 font-bold text-sm mb-10">Contribute to the circular economy. Remain anonymous.</p>
            
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-error bg-error/10 p-5 rounded-2xl mb-8 flex items-start gap-4 border border-error/20"
              >
                <AlertCircle className="w-6 h-6 flex-shrink-0" />
                <p className="font-bold text-sm">{error}</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-text/40 ml-1">Item Identity</label>
                <input 
                  required type="text" maxLength={50}
                  className="w-full border-2 border-border/50 p-5 rounded-2xl bg-background/30 focus:outline-none focus:border-primary focus:bg-white transition-all text-lg font-bold"
                  value={title} onChange={(e) => setTitle(e.target.value)}
                  placeholder="What is the item?"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-text/40 ml-1">Item Story</label>
                <textarea 
                  required rows={5} maxLength={500}
                  className="w-full border-2 border-border/50 p-5 rounded-2xl bg-background/30 focus:outline-none focus:border-primary focus:bg-white transition-all resize-none text-md font-medium"
                  value={description} onChange={(e) => setDescription(e.target.value)}
                  placeholder="Condition details, original value, why you're swapping..."
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-text/40 ml-1">Current State</label>
                  <select 
                    className="w-full border-2 border-border/50 p-5 rounded-2xl bg-background/30 focus:outline-none focus:border-primary focus:bg-white transition-all font-bold appearance-none cursor-pointer"
                    value={condition} onChange={(e) => setCondition(e.target.value)}
                  >
                    <option value="New">Pristine (New)</option>
                    <option value="Good">Reliable (Good)</option>
                    <option value="Used">Experienced (Used)</option>
                  </select>
                </div>
                
                <div className="flex items-end">
                   <div className="w-full p-5 bg-secondary/20 rounded-2xl border-2 border-secondary/20 flex items-center justify-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      <span className="font-black text-primary">Potential: {potentialCoins} Coins</span>
                   </div>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-primary text-background font-black py-5 rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] transition active:scale-[0.98] text-xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:scale-100"
              >
                {isSubmitting ? 'Syncing with Shadows...' : 'Deploy to Marketplace'}
                <Box className="w-6 h-6" />
              </button>
            </form>
          </motion.div>
        </div>

        <div className="md:col-span-2 space-y-8">
          <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ delay: 0.2 }}
             className="bg-secondary p-8 rounded-[40px] text-primary"
          >
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-black mb-4">Neural Categorization</h3>
            <p className="font-bold text-sm opacity-80 leading-relaxed mb-6">
              Our safety layer uses AI to scan your title and description. It automatically categorizes your item and ensures no restricted content enters the barter ecosystem.
            </p>
            <div className="p-4 bg-white/20 rounded-2xl border border-white/20 inline-block text-xs font-black uppercase tracking-widest">
              Processing Active
            </div>
          </motion.div>

          <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ delay: 0.3 }}
             className="bg-white p-8 rounded-[40px] border border-border"
          >
            <h3 className="text-xl font-black text-primary mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" /> Safety Guidelines
            </h3>
            <ul className="space-y-4 text-sm font-bold text-text/60">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-background border border-border flex items-center justify-center flex-shrink-0 text-[10px]">1</span>
                No weapons or hazardous materials.
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-background border border-border flex items-center justify-center flex-shrink-0 text-[10px]">2</span>
                No illegal or controlled substances.
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-background border border-border flex items-center justify-center flex-shrink-0 text-[10px]">3</span>
                Be honest about the condition.
              </li>
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
