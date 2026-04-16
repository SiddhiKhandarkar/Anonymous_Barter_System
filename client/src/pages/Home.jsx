import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Shield, Sparkles, Send, Heart, Recycle, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Home() {
  const { user } = useContext(AuthContext);

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
          
          <h1 className="text-5xl md:text-8xl font-black text-primary leading-tight mb-8">
            Trade Boldly. <br />
            <span className="text-secondary italic">Stay Invisible.</span>
          </h1>
          
          <div className="bg-white/50 backdrop-blur-md p-8 rounded-3xl border border-white/50 shadow-xl max-w-2xl mx-auto mb-12">
            <p className="text-2xl md:text-3xl font-serif italic text-text/80 leading-relaxed">
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

      {/* Visual Section */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div 
            whileHover={{ y: -10 }}
            className="group relative h-[400px] rounded-[40px] overflow-hidden shadow-2xl"
          >
            <img 
              src="/assets/hero_sharing.png" 
              alt="Community Sharing" 
              className="w-full h-full object-cover transition duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-10">
              <h3 className="text-3xl font-bold text-white mb-2">Build Community</h3>
              <p className="text-white/80 text-lg">Foster a culture of giving and receiving within your college campus.</p>
            </div>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -10 }}
            className="group relative h-[400px] rounded-[40px] overflow-hidden shadow-2xl"
          >
            <img 
              src="/assets/locker_image.png" 
              alt="Safe Exchange" 
              className="w-full h-full object-cover transition duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-10">
              <h3 className="text-3xl font-bold text-white mb-2">Secure & Anonymous</h3>
              <p className="text-white/80 text-lg">Identity-free locker drops ensure your safety and privacy at every step.</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Purpose Section */}
      <section className="py-20 bg-white/40 backdrop-blur-sm border-y border-border">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-primary mb-16">Why ShadowBarter?</h2>
          
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

      {/* Footer Quote */}
      <section className="py-24 px-4 text-center max-w-4xl mx-auto">
        <Heart className="w-12 h-12 text-community mx-auto mb-8 animate-pulse" />
        <p className="text-3xl font-serif italic text-primary/80 leading-snug">
          "Sharing is the simplest act of love that changes the world, one barter at a time."
        </p>
      </section>
    </div>
  );
}

