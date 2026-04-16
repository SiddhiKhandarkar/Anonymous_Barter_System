import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Shield, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Register() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const { register } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsRegistering(true);
    setError(null);
    try {
      await register(password);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || err.message || 'Registration failed');
      setIsRegistering(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-primary/10 to-transparent -z-10 blur-3xl" />
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-12 rounded-[50px] shadow-2xl border border-border w-full max-w-lg relative"
      >
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-primary/5 rounded-[30px] flex items-center justify-center">
            <Shield className="w-10 h-10 text-primary" />
          </div>
        </div>

        <h2 className="text-4xl font-black text-primary mb-3 text-center tracking-tight">Generate Identity</h2>
        <p className="text-center text-text/50 font-bold text-sm mb-10 px-6">
          No email. No phone. Just a password. We'll generate a unique Shadow ID for you.
        </p>

        {error && (
          <div className="text-error bg-error/10 p-4 rounded-2xl mb-6 text-sm font-bold border border-error/20 flex items-start gap-2">
            <Lock className="w-4 h-4 mt-0.5" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-text/40 ml-2">Master Password</label>
            <input 
              type="password" 
              required 
              disabled={isRegistering}
              className="w-full border-2 border-border/50 p-5 rounded-2xl bg-background/30 focus:outline-none focus:border-primary focus:bg-white transition-all text-xl font-bold"
              value={password} onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={isRegistering}
            className="w-full bg-primary text-background font-black py-5 rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] transition active:scale-[0.98] text-xl flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isRegistering ? 'Generating...' : 'Establish Connection'}
            <Sparkles className="w-6 h-6" />
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className="font-bold text-text/40 text-sm">
            Already have a Shadow ID? <Link to="/login" className="text-primary hover:underline">Link Session</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
