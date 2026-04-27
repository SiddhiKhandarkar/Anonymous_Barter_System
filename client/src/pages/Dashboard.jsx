import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Check, RefreshCcw, Box, ArrowRightCircle, Coins, Star, Handshake, ShoppingBag, Package, X, Calendar, Target, Megaphone, GitMerge } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [myItems, setMyItems] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [requests, setRequests] = useState([]);
  const [smartMatches, setSmartMatches] = useState({ twoWay: [], threeWay: [] });
  const [activeTab, setActiveTab] = useState('marketplace'); 
  const [requestingItem, setRequestingItem] = useState(null);
  const [fulfillingRequest, setFulfillingRequest] = useState(null);
  const [selectedFulfillItem, setSelectedFulfillItem] = useState('');
  const [dropSlot, setDropSlot] = useState('10:00 AM - 12:00 PM');
  const [pickupSlot, setPickupSlot] = useState('02:00 PM - 04:00 PM');
  const [requestForm, setRequestForm] = useState({
    title: '',
    description: '',
    category: 'Misc',
    preferredCondition: 'Good',
    bountyCoins: 3,
    isEmergency: false,
    isFlash: false
  });
  const [fulfillmentType, setFulfillmentType] = useState('bid');
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
    fetchRequests();
    fetchSmartMatches();
  }, [user]);

  useEffect(() => {
    const isTypingTarget = (target) => {
      if (!target) return false;
      const tagName = target.tagName?.toLowerCase();
      return tagName === 'input' || tagName === 'textarea' || tagName === 'select' || target.isContentEditable;
    };

    const tabByShortcut = {
      '1': 'marketplace',
      '2': 'myItems',
      '3': 'transactions',
      '4': 'requests',
      '5': 'matches'
    };

    const onKeyDown = (event) => {
      if (!event.altKey || isTypingTarget(event.target)) return;
      const tab = tabByShortcut[event.key];
      if (tab) {
        event.preventDefault();
        setActiveTab(tab);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const estimateEconomy = (item) => {
    const conditionBase = { New: 7, Good: 5, Used: 3 }[item?.condition] ?? 5;
    const categoryBonus = { Electronics: 2, Study: 1, Books: 1, Furniture: 1, Accessories: 0, Clothing: 0, Misc: 0 }[item?.category] ?? 0;
    const takerCost = Math.max(2, Math.min(10, conditionBase + categoryBonus));
    const giverReward = takerCost;
    return { takerCost, giverReward };
  };

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

  const fetchRequests = async () => {
    try {
      if (!user) return;
      const res = await api.get('/requests');
      setRequests(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchSmartMatches = async () => {
    try {
      if (!user) return;
      const res = await api.get('/matching/smart');
      setSmartMatches(res.data);
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

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    try {
      await api.post('/requests', requestForm);
      setRequestForm({
        title: '',
        description: '',
        category: 'Misc',
        preferredCondition: 'Good',
        bountyCoins: 3,
        isEmergency: false,
        isFlash: false
      });
      fetchRequests();
      alert('Want-list request posted with bounty!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create request');
    }
  };

  const handleFulfillRequest = async () => {
    if (!selectedFulfillItem || !fulfillingRequest) return;
    try {
      await api.post(`/requests/${fulfillingRequest._id}/fulfill`, {
        itemId: selectedFulfillItem,
        dropSlot,
        pickupSlot,
        fulfillmentType: fulfillingRequest.isEmergency ? fulfillmentType : 'bid'
      });
      setFulfillingRequest(null);
      setSelectedFulfillItem('');
      setFulfillmentType('bid');
      fetchRequests();
      fetchTransactions();
      fetchMarketplace();
      fetchMyItems();
      fetchSmartMatches();
      setActiveTab('transactions');
      alert('Request matched successfully! Locker created.');
    } catch (err) {
      alert(err.response?.data?.message || 'Could not fulfill request');
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
          <div className="mt-4 flex flex-wrap gap-2">
            {(user.badges || []).slice(0, 4).map((badge) => (
              <span key={badge} className="px-3 py-1 bg-white/10 border border-white/20 rounded-full text-xs font-black">
                {badge}
              </span>
            ))}
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

      <div className="mb-8 p-4 bg-white rounded-2xl border border-border/50">
        <p className="text-xs font-black uppercase tracking-widest text-text/40 mb-2">Feature Navigation</p>
        <div className="flex flex-wrap gap-2 text-xs font-bold">
          <span className="px-3 py-1 rounded-full bg-secondary/20 text-primary">Want-List: Post & Fulfill requests</span>
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary">Active Barters: Escrow + dispute status</span>
          <span className="px-3 py-1 rounded-full bg-community/20 text-community">Smart Matches: 2-way & 3-way suggestions</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-black">
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary">Alt+H Home</span>
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary">Alt+D Dashboard</span>
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary">Alt+C Create Item</span>
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary">Alt+N Notifications</span>
          <span className="px-3 py-1 rounded-full bg-secondary/20 text-primary">Alt+1..5 Switch Dashboard Tabs</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-2 bg-white border border-border/50 rounded-2xl mb-8 w-fit mx-auto md:mx-0">
        {[
          { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag },
          { id: 'myItems', label: 'My Listings', icon: Package },
          { id: 'transactions', label: 'Active Barters', icon: RefreshCcw },
          { id: 'requests', label: 'Want-List Board', icon: Target },
          { id: 'matches', label: 'Smart Matches', icon: GitMerge }
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
                         <span className="font-black text-primary">{estimateEconomy(item).takerCost} Coins</span>
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
                      {item.status === 'Available' && <span className="text-secondary font-black">Earns {estimateEconomy(item).giverReward} Coins</span>}
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
                             txn.status === 'Disputed' ? 'bg-error/20 text-error border border-error/20' :
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
                        <p className="text-xs font-bold text-text/50 mt-1">
                          Cost: {txn.coinsTransferred} | Reward: {txn.coinsAwarded + (txn.bountyCoins || 0)} {txn.requestId ? `| Includes bounty for "${txn.requestId.title}"` : ''}
                        </p>
                        <p className="text-xs font-bold text-text/50 mt-1">
                          Escrow: {txn.escrowStatus || 'None'} {txn.disputeStatus ? `| Dispute: ${txn.disputeStatus}` : ''}
                        </p>
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

          {activeTab === 'requests' && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <form onSubmit={handleCreateRequest} className="bg-white p-8 rounded-[32px] border border-border shadow-sm space-y-4">
                <h3 className="text-2xl font-black text-primary flex items-center gap-2"><Megaphone className="w-6 h-6" />Post a Want-List Request</h3>
                <input required value={requestForm.title} onChange={(e) => setRequestForm({ ...requestForm, title: e.target.value })} placeholder="What do you need?" className="w-full border-2 border-border/50 p-4 rounded-2xl" />
                <textarea required rows={4} value={requestForm.description} onChange={(e) => setRequestForm({ ...requestForm, description: e.target.value })} placeholder="Add details so others can match accurately." className="w-full border-2 border-border/50 p-4 rounded-2xl resize-none" />
                <div className="grid grid-cols-3 gap-3">
                  <select value={requestForm.category} onChange={(e) => setRequestForm({ ...requestForm, category: e.target.value })} className="border-2 border-border/50 p-3 rounded-xl">
                    <option value="Misc">Misc</option><option value="Books">Books</option><option value="Electronics">Electronics</option><option value="Study">Study</option>
                  </select>
                  <select value={requestForm.preferredCondition} onChange={(e) => setRequestForm({ ...requestForm, preferredCondition: e.target.value })} className="border-2 border-border/50 p-3 rounded-xl">
                    <option value="New">New</option><option value="Good">Good</option><option value="Used">Used</option>
                  </select>
                  <input type="number" min={1} max={30} value={requestForm.bountyCoins} onChange={(e) => setRequestForm({ ...requestForm, bountyCoins: Number(e.target.value) })} className="border-2 border-border/50 p-3 rounded-xl" />
                </div>
                <div className="flex flex-col gap-2 mt-2">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="emergencyToggle" checked={requestForm.isEmergency} onChange={(e) => setRequestForm({ ...requestForm, isEmergency: e.target.checked })} className="w-5 h-5 accent-error" />
                    <label htmlFor="emergencyToggle" className="font-bold text-error flex items-center gap-1">Mark as Emergency Request (High Priority)</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="flashToggle" checked={requestForm.isFlash} onChange={(e) => setRequestForm({ ...requestForm, isFlash: e.target.checked })} className="w-5 h-5 accent-secondary" />
                    <label htmlFor="flashToggle" className="font-bold text-primary flex items-center gap-1">Mark as Flash Request (Expires in 30 mins)</label>
                  </div>
                </div>
                <button className="w-full bg-primary text-white font-black py-4 rounded-2xl mt-4">Publish Request</button>
              </form>

              <div className="space-y-4">
                {requests.map((reqItem) => {
                  const mine = String(reqItem.userId?._id || reqItem.userId) === currentUserId;
                  const eligibleItems = myItems.filter((item) => item.status === 'Available');
                  return (
                    <div key={reqItem._id} className="bg-white p-6 rounded-[28px] border border-border shadow-sm">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          {reqItem.isEmergency && <span className="inline-block px-2 py-1 mb-2 mr-2 bg-error text-white font-black text-[10px] rounded uppercase tracking-wider animate-pulse">Emergency</span>}
                          {reqItem.isFlash && <span className="inline-block px-2 py-1 mb-2 bg-secondary text-primary font-black text-[10px] rounded uppercase tracking-wider shadow-sm">Flash</span>}
                          <p className="text-[10px] uppercase font-black text-text/40 tracking-wider">{reqItem.category} · prefers {reqItem.preferredCondition}</p>
                          <h4 className="text-xl font-black text-primary">{reqItem.title}</h4>
                          <p className="text-sm text-text/60 mt-2">{reqItem.description}</p>
                          <p className="text-xs mt-3 font-bold text-secondary">Bounty: +{reqItem.bountyCoins} coins</p>
                        </div>
                        {mine ? (
                          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-black text-xs">Your Request</span>
                        ) : (
                          <button
                            onClick={() => {
                              setFulfillingRequest(reqItem);
                              setSelectedFulfillItem(eligibleItems[0]?._id || '');
                            }}
                            disabled={!eligibleItems.length}
                            className="px-4 py-2 rounded-xl bg-secondary text-primary font-black disabled:opacity-50"
                          >
                            Fulfill
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
                {requests.length === 0 && <div className="bg-white p-10 rounded-[28px] border border-dashed text-center text-text/50 font-bold">No open requests yet.</div>}
              </div>
            </div>
          )}

          {activeTab === 'matches' && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-[28px] border border-border shadow-sm">
                <h3 className="text-2xl font-black text-primary mb-4">2-Way Smart Matches</h3>
                <div className="space-y-3">
                  {smartMatches.twoWay?.map((match, idx) => (
                    <div key={`${match.requestId}-${idx}`} className="p-4 border border-border/50 rounded-2xl">
                      <p className="font-black text-primary">{match.requestTitle}</p>
                      <p className="text-sm text-text/60">Suggested by {match.providerAnonymousId}: {match.suggestedItemTitle}</p>
                    </div>
                  ))}
                  {!smartMatches.twoWay?.length && <p className="text-sm font-bold text-text/50">No 2-way matches yet. Add more requests/listings.</p>}
                </div>
              </div>
              <div className="bg-white p-6 rounded-[28px] border border-border shadow-sm">
                <h3 className="text-2xl font-black text-primary mb-4">3-Way Cycle Opportunities</h3>
                <div className="space-y-3">
                  {smartMatches.threeWay?.map((cycle, idx) => (
                    <div key={idx} className="p-4 border border-border/50 rounded-2xl">
                      <p className="font-black text-primary mb-2">Cycle #{idx + 1}</p>
                      <div className="space-y-1 text-sm text-text/70">
                        {cycle.cycle.map((step, i) => <p key={i}>{step.role} gives <b>{step.givesCategory}</b></p>)}
                      </div>
                    </div>
                  ))}
                  {!smartMatches.threeWay?.length && <p className="text-sm font-bold text-text/50">No 3-way cycles detected yet.</p>}
                </div>
              </div>
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

      <AnimatePresence>
        {fulfillingRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setFulfillingRequest(null)} className="absolute inset-0 bg-primary/20 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden border border-white p-8">
              <h3 className="text-2xl font-black text-primary mb-2">Fulfill Request</h3>
              {fulfillingRequest.isEmergency ? (
                <>
                  <p className="text-sm text-error font-bold mb-4">This is an EMERGENCY request.</p>
                  <p className="text-sm text-text/60 mb-4">Choose how you want to fulfill this request:</p>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <button onClick={() => setFulfillmentType('bid')} className={`p-4 rounded-2xl border-2 font-black transition-all ${fulfillmentType === 'bid' ? 'border-primary bg-primary/10 text-primary scale-105' : 'border-border/50 text-text/50 hover:border-primary/50'}`}>
                      Bid (Barter)<br/><span className="text-xs font-normal opacity-70">Earn reward + {fulfillingRequest.bountyCoins} bounty</span>
                    </button>
                    <button onClick={() => setFulfillmentType('donation')} className={`p-4 rounded-2xl border-2 font-black transition-all ${fulfillmentType === 'donation' ? 'border-community bg-community/10 text-community scale-105' : 'border-border/50 text-text/50 hover:border-community/50'}`}>
                      Normal Donation<br/><span className="text-xs font-normal opacity-70">Give for free (0 coins)</span>
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-sm text-text/60 mb-6">Choose one of your available items for <b>{fulfillingRequest.title}</b>. You will earn normal reward + bounty.</p>
              )}
              <select value={selectedFulfillItem} onChange={(e) => setSelectedFulfillItem(e.target.value)} className="w-full border-2 border-border/50 p-4 rounded-2xl mb-4">
                {myItems.filter((item) => item.status === 'Available').map((item) => (
                  <option key={item._id} value={item._id}>{item.title} ({item.condition})</option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-2 mb-6">
                {slots.map(slot => (
                  <button key={slot} onClick={() => setDropSlot(slot)} className={`p-2 rounded-xl text-xs font-bold border ${dropSlot === slot ? 'bg-primary text-white border-primary' : 'bg-background text-text/70 border-border/50'}`}>{slot}</button>
                ))}
              </div>
              <div className="flex gap-4">
                <button onClick={() => setFulfillingRequest(null)} className="flex-1 py-3 font-bold text-text/60">Cancel</button>
                <button onClick={handleFulfillRequest} className="flex-[2] py-3 bg-primary text-white font-black rounded-2xl">Confirm Fulfillment</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
