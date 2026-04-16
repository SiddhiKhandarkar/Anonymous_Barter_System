import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Check, RefreshCcw, Box, ArrowRightCircle, Coins, Star, Handshake, LayoutDashboard, ShoppingBag, Package, X, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [myItems, setMyItems] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('marketplace'); 
  const [requestingItem, setRequestingItem] = useState(null);
  const [dropSlot, setDropSlot] = useState('10:00 AM - 12:00 PM');
  const [pickupSlot, setPickupSlot] = useState('02:00 PM - 04:00 PM');
  const navigate = useNavigate();

  const currentUserId = String(user?.id || user?._id || '');

  const slots = [
    '08:00 AM - 10:00 AM',
    '10:00 AM - 12:00 PM',
    '12:00 PM - 02:00 PM',
    '02:00 PM - 04:00 PM',
    '04:00 PM - 06:00 PM',
    '06:00 PM - 08:00 PM'
  ];

  useEffect(() => {
    fetchMarketplace();
    fetchMyItems();
    fetchTransactions();
  }, [user]);

  const fetchMarketplace = async () => {
    try {
      const res = await api.get('/items');
      setItems(res.data.filter(item => {
        const ownerId = item.ownerId?._id || item.ownerId;
        return ownerId !== currentUserId;
      }));
    } catch (err) { console.error(err); }
  };

  const fetchMyItems = async () => {
    try {
      if(!user) return;
      const res = await api.get('/items/my');
      setMyItems(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchTransactions = async () => {
    try {
      if(!user) return;
      const res = await api.get('/transactions');
      setTransactions(res.data);
    } catch (err) { console.error(err); }
  };

  const handleConfirmRequest = async () => {
    try {
      await api.post('/transactions', { 
        itemId: requestingItem._id,
        dropSlot,
        pickupSlot
      });
      alert(`Success! Locker assigned. Giver scheduled for ${dropSlot}.`);
      setRequestingItem(null);
      fetchTransactions();
      fetchMarketplace();
      setActiveTab('transactions');
    } catch (err) {
      alert(err.response?.data?.message || 'Error requesting item');
    }
  };

  if (!user) return <div className="p-12 text-center text-2xl font-black text-primary animate-pulse">Initializing Shadow Identity...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="md:col-span-2 bg-primary text-background p-8 rounded-[32px] shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] opacity-60 mb-2">Shadow Identity</h2>
          <h3 className="text-4xl font-black mb-4">{user.anonymousId}</h3>
          <div className="flex gap-4">
            <div className="px-4 py-2 bg-white/10 rounded-xl backdrop-blur-md border border-white/20 flex items-center gap-2">
              <Star className="w-4 h-4 text-secondary fill-secondary" />
              <span className="font-bold">{user.rating?.toFixed(1) || '5.0'}</span>
            </div>
            <div className="px-4 py-2 bg-white/10 rounded-xl backdrop-blur-md border border-white/20 flex items-center gap-2">
              <Handshake className="w-4 h-4 text-secondary" />
              <span className="font-bold">{user.totalTrades} Trades</span>
            </div>
          </div>
        </div>
        
        <div className="bg-secondary text-primary p-8 rounded-[32px] shadow-lg flex flex-col justify-between">
          <div className="flex justify-between items-start">
             <Coins className="w-8 h-8" />
             <span className="text-xs font-black uppercase tracking-widest opacity-60">Balance</span>
          </div>
          <div>
            <span className="text-5xl font-black">{user.coins}</span>
            <span className="text-xl font-bold ml-2">Coins</span>
          </div>
        </div>

        <Link to="/create-item" className="bg-white text-primary p-8 rounded-[32px] shadow-sm border-2 border-primary/10 hover:border-primary transition-all flex flex-col justify-center items-center group">
          <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition">
            <Plus className="w-8 h-8" />
          </div>
          <span className="font-black text-lg">List New Item</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex p-2 bg-white border border-border/50 rounded-2xl mb-8 w-fit mx-auto md:mx-0">
        {[
          { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag },
          { id: 'myItems', label: 'My Listings', icon: Package },
          { id: 'transactions', label: 'Active Barters', icon: RefreshCcw }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === tab.id ? 'bg-primary text-background shadow-lg' : 'text-text/60 hover:text-primary'}`}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        <motion.div
           key={activeTab}
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, y: -20 }}
           transition={{ duration: 0.3 }}
        >
          {activeTab === 'marketplace' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {items.map(item => (
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
                         <span className="font-black text-primary">5 Coins</span>
                       </div>
                       <button 
                        onClick={() => setRequestingItem(item)} 
                        className="px-6 py-2 bg-secondary text-primary font-black rounded-xl hover:scale-105 transition active:scale-95 shadow-md shadow-secondary/20"
                       >
                         Request
                       </button>
                    </div>
                  </div>
                </div>
              ))}
              {items.length === 0 && (
                <div className="col-span-full py-20 bg-white rounded-[40px] border-2 border-dashed border-border flex flex-col items-center justify-center text-center">
                  <ShoppingBag className="w-16 h-16 text-primary/20 mb-4" />
                  <p className="text-xl font-bold text-text/40">The marketplace is quiet today.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'myItems' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {myItems.map(item => (
                <div key={item._id} className="bg-white rounded-[32px] shadow-sm border border-border overflow-hidden relative group">
                  <div className={`absolute top-4 right-4 px-4 py-1.5 rounded-full text-xs font-black uppercase ${
                    item.status === 'Available' ? 'bg-secondary text-primary' : 
                    item.status === 'Reserved' ? 'bg-community text-white' : 'bg-primary text-white'
                  }`}>
                    {item.status}
                  </div>
                  <div className="p-8">
                    <span className="text-[10px] font-black uppercase tracking-widest text-text/30 mb-2 block">{item.category}</span>
                    <h4 className="text-2xl font-black text-primary mb-4">{item.title}</h4>
                    <p className="text-sm text-text/60 line-clamp-3 mb-6">{item.description}</p>
                    <div className="pt-6 border-t border-border/40 text-[10px] font-bold text-text/40 flex justify-between">
                      <span>Listed on: {new Date(item.createdAt).toLocaleDateString()}</span>
                      {item.status === 'Available' && <span className="text-secondary font-black">Earns 7 Coins</span>}
                    </div>
                  </div>
                </div>
              ))}
              {myItems.length === 0 && (
                <div className="col-span-full py-20 bg-white rounded-[40px] border-2 border-dashed border-border flex flex-col items-center justify-center text-center">
                  <Package className="w-16 h-16 text-primary/20 mb-4" />
                  <p className="text-xl font-bold text-text/40">You haven't listed anything yet.</p>
                  <Link to="/create-item" className="mt-6 text-primary font-black flex items-center gap-2 hover:underline">List your first item <Plus className="w-4 h-4"/></Link>
                </div>
              )}
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="flex flex-col gap-6">
              {transactions.map(txn => {
                const giverId = txn.giverId?._id || txn.giverId;
                const isGiver = giverId === currentUserId;
                return (
                  <motion.div 
                    whileHover={{ scale: 1.01 }}
                    key={txn._id} 
                    className="bg-white p-8 rounded-[32px] shadow-sm border border-border flex flex-col md:flex-row justify-between items-center gap-8 group"
                  >
                    <div className="flex items-center gap-6 w-full md:w-auto">
                      <div className={`w-20 h-20 rounded-3xl flex items-center justify-center ${txn.status === 'Completed' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'}`}>
                        {txn.status === 'Completed' ? <Check className="w-10 h-10" /> : <RefreshCcw className="w-10 h-10 animate-spin-slow" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                           <span className={`px-4 py-1 text-[10px] font-black uppercase rounded-full ${
                             txn.status === 'Pending' ? 'bg-error/10 text-error border border-error/20' : 
                             txn.status === 'Ready' ? 'bg-secondary/20 text-secondary border border-secondary/20' : 
                             'bg-primary/20 text-primary border border-primary/20'
                           }`}>
                             {txn.status}
                           </span>
                           <span className="text-xs font-bold text-text/40">Locker {txn.lockerId}</span>
                        </div>
                        <h4 className="text-2xl font-black text-primary">Item: {txn.itemId?.title || 'Relic from Shadow'}</h4>
                        <div className="flex flex-col sm:flex-row sm:gap-4 text-text/50 text-sm font-medium">
                          <span>Partner: <span className="text-primary font-bold">{isGiver ? txn.receiverId.anonymousId : txn.giverId.anonymousId}</span></span>
                          <span className="hidden sm:inline opacity-30">|</span>
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> {isGiver ? `Drop: ${txn.dropSlot}` : `Pickup: ${txn.pickupSlot}`}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 w-full md:w-auto">
                      <div className="hidden md:flex flex-col items-end mr-4">
                        <span className="text-[10px] uppercase font-bold text-text/40">Type</span>
                        <span className={`font-black uppercase text-sm ${isGiver ? 'text-community' : 'text-secondary'}`}>{isGiver ? 'Giving' : 'Taking'}</span>
                      </div>
                      <button 
                        onClick={() => navigate(`/transaction/${txn._id}`)} 
                        className="flex-1 md:flex-none px-8 py-4 bg-primary text-background font-black rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center gap-3 hover:scale-105 transition group-hover:bg-primary/90"
                      >
                        Enter Simulation
                        <ArrowRightCircle className="w-6 h-6" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
              {transactions.length === 0 && (
                <div className="py-20 bg-white rounded-[40px] border-2 border-dashed border-border flex flex-col items-center justify-center text-center">
                  <RefreshCcw className="w-16 h-16 text-primary/20 mb-4" />
                  <p className="text-xl font-bold text-text/40">No active barters currently.</p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Request Scheduling Modal */}
      <AnimatePresence>
        {requestingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setRequestingItem(null)}
              className="absolute inset-0 bg-primary/20 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden border border-white"
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-black text-primary mb-1">Schedule Barter</h3>
                    <p className="text-text/60">Finalize the logistics for <b>{requestingItem.title}</b></p>
                  </div>
                  <button onClick={() => setRequestingItem(null)} className="p-2 bg-background rounded-full hover:scale-110 transition">
                    <X className="w-6 h-6 text-primary" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-text/40 mb-3">Partner Drop-off Window</label>
                    <div className="grid grid-cols-2 gap-2">
                      {slots.map(slot => (
                        <button 
                          key={slot} 
                          onClick={() => setDropSlot(slot)}
                          className={`p-3 rounded-xl text-xs font-bold transition-all border ${dropSlot === slot ? 'bg-primary text-white border-primary shadow-lg scale-105' : 'bg-background text-text/70 border-border/50 hover:border-primary'}`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-text/40 mb-3">Your Pickup Window</label>
                    <div className="grid grid-cols-2 gap-2">
                      {slots.map(slot => (
                        <button 
                          key={slot} 
                          onClick={() => setPickupSlot(slot)}
                          className={`p-3 rounded-xl text-xs font-bold transition-all border ${pickupSlot === slot ? 'bg-secondary text-primary border-secondary shadow-lg scale-105' : 'bg-background text-text/70 border-border/50 hover:border-secondary'}`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-10 flex gap-4">
                  <button 
                    onClick={() => setRequestingItem(null)}
                    className="flex-1 py-4 font-bold text-text/60 hover:text-primary transition"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleConfirmRequest}
                    className="flex-[2] py-4 bg-primary text-background font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 transition active:scale-95"
                  >
                    Confirm Request (-5 Coins)
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
