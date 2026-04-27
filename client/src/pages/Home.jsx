import { useState, useContext, useEffect } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Shield, Sparkles, Send, Heart, Recycle, Users, ArrowRight, Box } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Home() {
  const { user } = useContext(AuthContext);
  const [recentItems, setRecentItems] = useState([]);

  useEffect(() => {
    const fetchRecentItems = async () => {
      try {
        const res = await api.get('/items');
        setRecentItems(res.data.slice(0, 3));
      } catch (err) {
        console.error("Failed to fetch items:", err);
      }
    };
    fetchRecentItems();
  }, []);

  const estimateEconomy = (item) => {
    const conditionBase = { New: 7, Good: 5, Used: 3 }[item?.condition] ?? 5;
    const categoryBonus = { Electronics: 2, Study: 1, Books: 1, Furniture: 1, Accessories: 0, Clothing: 0, Misc: 0 }[item?.category] ?? 0;
    const takerCost = Math.max(2, Math.min(10, conditionBase + categoryBonus));
    return takerCost;
  };

  return (
    <div className="min-h-screen bg-background text-text overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4 flex flex-col items-center justify-center text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-[500px] bg-gradient-to-b from-secondary/20 to-transparent rounded-[100%] -z-10 blur-3xl" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6">
            <Sparkles className="w-4 h-4" />
            <span>Redefining College Commerce</span>
          </div>
          
          <h1 className="text-4xl md:text-7xl font-black text-primary leading-tight mb-8">
            Trade Boldly. <br />
            <span className="text-secondary italic">Stay Invisible.</span>
          </h1>
          
          <div className="bg-white/50 backdrop-blur-md p-8 rounded-3xl border border-white/50 shadow-xl max-w-2xl mx-auto mb-12">
            <p className="text-xl md:text-2xl font-serif italic text-text/80 leading-relaxed">
              "If there is something better than sharing with others the best of what you have, it is sharing with others the best of who you are."
            </p>
          </div>

          {!user ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="group px-10 py-5 bg-primary text-background font-bold text-xl rounded-2xl shadow-xl hover:shadow-primary/20 hover:scale-105 transition-all inline-flex items-center gap-2">
                Start Swapping
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
              </Link>
              <Link to="/login" className="px-10 py-5 bg-white text-primary border-4 border-primary font-bold text-xl rounded-2xl shadow-xl hover:bg-primary/5 transition-all inline-flex items-center gap-2">
                Explore Items
              </Link>
            </div>
          ) : (
            <Link to="/dashboard" className="px-10 py-5 bg-secondary text-primary font-bold text-xl rounded-2xl shadow-xl hover:shadow-secondary/20 hover:scale-105 transition-all inline-flex items-center gap-2">
              Go to Dashboard
              <Send className="w-5 h-5" />
            </Link>
          )}
        </motion.div>
      </section>

      {/* Functional Info Cards */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div 
            whileHover={{ y: -5 }}
            className="group relative p-10 bg-white rounded-[40px] border border-border/50 shadow-xl flex flex-col justify-between overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-community/10 rounded-full blur-3xl z-0 translate-x-1/3 -translate-y-1/3" />
            <div className="z-10 relative">
              <div className="w-16 h-16 bg-community text-white rounded-3xl flex items-center justify-center mb-8 shadow-lg shadow-community/20 group-hover:scale-110 transition-transform duration-500">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-3xl font-black text-primary mb-4">Build Community</h3>
              <p className="text-text/70 text-lg mb-8 leading-relaxed">
                Foster a culture of giving and receiving within your college campus. Exchange items safely and build a sustainable local economy together.
              </p>
            </div>
            <Link to={user ? "/dashboard" : "/register"} className="z-10 relative self-start px-8 py-4 bg-community text-white font-black rounded-2xl shadow-xl shadow-community/20 hover:scale-105 transition-all active:scale-95 flex items-center gap-3">
              Join the Network <ArrowRight className="w-5 h-5"/>
            </Link>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -5 }}
            className="group relative p-10 bg-white rounded-[40px] border border-border/50 shadow-xl flex flex-col justify-between overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl z-0 translate-x-1/3 -translate-y-1/3" />
            <div className="z-10 relative">
              <div className="w-16 h-16 bg-primary text-background rounded-3xl flex items-center justify-center mb-8 shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-500">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-3xl font-black text-primary mb-4">Secure & Anonymous</h3>
              <p className="text-text/70 text-lg mb-8 leading-relaxed">
                Identity-free locker drops ensure your safety and privacy at every step. Barter boldly without ever revealing your personal information.
              </p>
            </div>
            <button onClick={() => alert('Security Guarantee: Active barters use anonymous IDs and scheduled locker drops. Your real identity is never exposed to your trading partner.')} className="z-10 relative self-start px-8 py-4 bg-primary text-background font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 transition-all active:scale-95 flex items-center gap-3">
              Security Guarantee <Shield className="w-5 h-5"/>
            </button>
          </motion.div>
        </div>
      </section>

      {/* Purpose Section */}
      <section className="py-20 bg-white/40 backdrop-blur-sm border-y border-border">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-primary mb-16">Why ShadowBarter?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-secondary/20 rounded-3xl flex items-center justify-center mb-6">
                <Recycle className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Circular Economy</h3>
              <p className="text-text/70 text-lg leading-relaxed">Reduce waste by putting dormant items back into use. Your old book is someone else's new insight.</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-community/20 rounded-3xl flex items-center justify-center mb-6">
                <Users className="w-10 h-10 text-community" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Mutual Growth</h3>
              <p className="text-text/70 text-lg leading-relaxed">Help peers while gaining what you need. A credit-based system ensures everyone contributes and benefits.</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-primary/20 rounded-3xl flex items-center justify-center mb-6">
                <Shield className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Privacy First</h3>
              <p className="text-text/70 text-lg leading-relaxed">No phone numbers, no real names. Just a community of ShadowSellers trading with trust.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Items Section */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-primary mb-4">Latest Additions</h2>
          <p className="text-lg text-text/60">Discover what your peers are sharing right now.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {recentItems.map(item => (
            <div key={item._id} className="bg-white rounded-[32px] shadow-sm border border-border overflow-hidden flex flex-col group hover:shadow-xl transition-all duration-500">
              <div className="h-48 bg-background/50 flex items-center justify-center p-8 relative overflow-hidden">
                <Box className="w-20 h-20 text-primary/10 group-hover:scale-125 transition-all duration-700" />
                <div className="absolute top-4 right-4 px-3 py-1 bg-white/80 backdrop-blur-md rounded-full text-[10px] font-black uppercase text-primary border border-primary/10">
                  {item.condition}
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-secondary mb-2">{item.category}</span>
                <h4 className="text-xl font-black text-primary mb-2">{item.title}</h4>
                <p className="text-sm text-text/60 line-clamp-2 mb-6">{item.description}</p>
                <div className="mt-auto pt-6 border-t border-border/40 flex justify-between items-center">
                   <div className="flex flex-col">
                     <span className="text-[10px] uppercase font-bold text-text/40">Cost</span>
                     <span className="font-black text-primary">{estimateEconomy(item)} Coins</span>
                   </div>
                   <Link 
                    to={user ? "/dashboard" : "/login"}
                    className="px-6 py-2 bg-secondary text-primary font-black rounded-xl hover:scale-105 transition active:scale-95 shadow-md shadow-secondary/20 border border-secondary/20"
                   >
                     {user ? "View" : "Login to Request"}
                   </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        {recentItems.length === 0 && (
          <div className="py-12 bg-white/50 rounded-3xl border border-dashed border-border text-center text-text/50 font-bold max-w-2xl mx-auto">
            No items available right now. Be the first to list!
          </div>
        )}
      </section>

      {/* Footer Quote */}
      <section className="py-24 px-4 text-center max-w-4xl mx-auto">
        <Heart className="w-12 h-12 text-community mx-auto mb-8 animate-pulse" />
        <p className="text-2xl font-serif italic text-primary/80 leading-snug">
          "Sharing is the simplest act of love that changes the world, one barter at a time."
        </p>
      </section>
    </div>
  );
}

