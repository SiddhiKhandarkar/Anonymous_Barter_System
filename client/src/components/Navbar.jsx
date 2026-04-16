import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Coins, LogOut, Package, User, Bell, ChevronDown } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  
  return (
    <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-border/50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-black flex items-center gap-2 group">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
            <Package className="w-6 h-6 text-secondary" />
          </div>
          <span className="text-primary tracking-tighter">ShadowBarter</span>
        </Link>
        <div className="flex items-center gap-8">
          {user ? (
            <>
              <div className="hidden md:flex items-center gap-2 font-black text-primary bg-secondary/10 px-4 py-2 rounded-full border border-secondary/20">
                <Coins className="w-5 h-5 text-secondary" />
                <span>{user.coins} <span className="text-[10px] uppercase opacity-60 ml-1">Credits</span></span>
              </div>
              
              <div className="flex items-center gap-6">
                <Link title="Notifications" to="/notifications" className="relative p-2 text-primary/60 hover:text-primary transition group">
                  <Bell className="w-6 h-6"/>
                  <span className="absolute top-2 right-2 w-2 h-2 bg-community rounded-full border-2 border-white" />
                </Link>
                
                <Link to="/dashboard" className="flex items-center gap-3 group">
                  <div className="flex flex-col items-end hidden sm:flex">
                    <span className="text-[10px] font-black uppercase tracking-widest text-text/40 leading-none">Identity</span>
                    <span className="text-sm font-black text-primary leading-tight">{user.anonymousId}</span>
                  </div>
                  <div className="w-10 h-10 bg-primary/5 rounded-full border-2 border-primary/20 flex items-center justify-center overflow-hidden group-hover:border-primary transition">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                </Link>

                <button 
                  onClick={logout} 
                  className="p-2 text-text/40 hover:text-error transition"
                  title="Logout"
                >
                  <LogOut className="w-6 h-6"/>
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="text-primary/60 hover:text-primary transition font-black text-sm uppercase tracking-widest">Login</Link>
              <Link to="/register" className="bg-primary text-background px-6 py-3 rounded-2xl shadow-xl shadow-primary/20 font-black hover:scale-105 transition-all active:scale-95">Link Node</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
