import { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { ArrowLeft, Lock, Unlock, Mail, ShieldCheck, Star, Send, RefreshCcw } from 'lucide-react';
import { io } from 'socket.io-client';

export default function TransactionSimulation() {
  const { id } = useParams();
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState(null);
  const [chat, setChat] = useState([]);
  const [msg, setMsg] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [disputeReason, setDisputeReason] = useState('empty_locker');
  const [disputeDetails, setDisputeDetails] = useState('');
  const [dispute, setDispute] = useState(null);
  const socketRef = useRef();

  useEffect(() => {
    fetchTransaction();
    fetchChat();
    fetchDispute();

    socketRef.current = io('http://localhost:5000');
    socketRef.current.emit('joinRoom', id);
    socketRef.current.on('receiveMessage', (message) => {
      setChat(prev => [...prev, message]);
    });

    return () => socketRef.current.disconnect();
  }, [id]);

  const fetchTransaction = async () => {
    try {
      const res = await api.get('/transactions');
      const txn = res.data.find(t => t._id === id);
      setTransaction(txn);
    } catch (err) { console.error(err); }
  };

  const fetchChat = async () => {
    try {
      const res = await api.get(`/chats/${id}`);
      setChat(res.data.messages || []);
    } catch (err) { console.error(err); }
  };

  const fetchDispute = async () => {
    try {
      const res = await api.get(`/transactions/${id}/dispute`);
      setDispute(res.data);
    } catch {
      setDispute(null);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!msg.trim()) return;
    try {
      await api.post(`/chats/${id}`, { message: msg });
      socketRef.current.emit('sendMessage', { transactionId: id, senderId: { _id: user.id || user._id }, message: msg });
      setMsg('');
    } catch (err) { console.error(err); }
  };

  const handleDrop = async () => {
    try {
      await api.put(`/transactions/${id}`, { status: 'Ready' });
      fetchTransaction();
    } catch (err) { alert('Error dropping item'); }
  };

  const handlePickup = async () => {
    try {
      await api.put(`/transactions/${id}`, { status: 'Completed', otp: otpInput });
      fetchTransaction();
      // Update local context user coins
      const res = await api.get('/auth/me');
      setUser(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Error collecting item');
    }
  };

  const submitFeedback = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/transactions/${id}/feedback`, { rating: feedbackRating, comment: feedbackComment });
      setFeedbackSubmitted(true);
      alert('Thank you for your feedback!');
    } catch (err) {
      alert('Error submitting feedback');
    }
  };

  const submitDispute = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/transactions/${id}/dispute`, { reason: disputeReason, details: disputeDetails });
      setDispute(res.data);
      alert('Dispute raised. Support will review this transaction.');
      fetchTransaction();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not raise dispute');
    }
  };

  const resolveDispute = async (action) => {
    try {
      await api.post(`/transactions/${id}/dispute/resolve`, { action });
      fetchDispute();
      fetchTransaction();
      const me = await api.get('/auth/me');
      setUser(me.data);
      alert('Dispute resolution action completed.');
    } catch (err) {
      alert(err.response?.data?.message || 'Could not resolve dispute');
    }
  };

  if (!transaction) return <div className="p-8 text-center text-primary font-bold">Loading Simulation...</div>;

  const currentUserId = String(user?.id || user?._id || '');
  const giverId = String(transaction.giverId?._id || transaction.giverId || '');
  const isGiver = giverId === currentUserId;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 flex flex-col gap-6">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-primary font-bold hover:underline w-fit">
          <ArrowLeft className="w-5 h-5"/> Back to Dashboard
        </button>

        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-border">
          <div className="flex justify-between items-start mb-8">
            <h2 className="text-3xl font-black text-primary flex items-center gap-3">
              <Lock className="w-8 h-8 text-secondary"/> {isGiver ? 'Giver Portal' : 'Receiver Portal'}
            </h2>
            <div className={`px-4 py-2 rounded-full font-bold text-sm uppercase tracking-wider ${
              transaction.status === 'Completed' ? 'bg-primary text-white' : 
              transaction.status === 'Ready' ? 'bg-secondary text-primary' : 'bg-error/20 text-error'
            }`}>
              {transaction.status}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
               <div className="p-4 bg-background/50 rounded-2xl border border-border/40">
                 <span className="block text-xs font-bold uppercase tracking-widest text-text/50 mb-1">Assigned Locker</span>
                 <span className="text-2xl font-black text-primary">{transaction.lockerId}</span>
                <p className="text-xs mt-2 font-bold text-text/60">Escrow: {transaction.escrowStatus || 'None'}</p>
               </div>

               {isGiver ? (
                 <div className="space-y-4">
                   <h3 className="font-bold text-lg text-primary">Instructions</h3>
                   <p className="text-text/70">Place the item in <b>Locker {transaction.lockerId}</b>. Closing the door will trigger the "Dropped" status.</p>
                   {transaction.status === 'Pending' ? (
                     <button onClick={handleDrop} className="w-full bg-primary text-background font-bold py-4 rounded-2xl shadow-lg hover:shadow-primary/20 transition-all hover:scale-[1.02]">
                       Simulate Item Drop
                     </button>
                   ) : (
                     <div className="flex items-center gap-2 text-primary font-bold py-4 px-6 bg-primary/10 rounded-2xl border border-primary/20">
                       <ShieldCheck className="w-6 h-6"/>
                       Item Successfully Dropped
                     </div>
                   )}
                 </div>
               ) : (
                 <div className="space-y-4">
                   <h3 className="font-bold text-lg text-primary">Collection Details</h3>
                   <p className="text-text/70">Use the details below to unlock <b>Locker {transaction.lockerId}</b> once the item is ready.</p>
                   {transaction.status === 'Ready' && (
                     <div className="space-y-4 pt-2">
                       <input 
                        type="text" 
                        placeholder="Enter 6-digit OTP" 
                        maxLength={6} 
                        className="w-full text-center text-2xl font-black tracking-widest p-4 border-2 border-border rounded-2xl focus:border-secondary focus:outline-none transition" 
                        value={otpInput} 
                        onChange={e=>setOtpInput(e.target.value)} 
                       />
                       <button onClick={handlePickup} className="w-full bg-secondary text-primary font-bold py-4 rounded-2xl shadow-lg hover:shadow-secondary/20 transition-all hover:scale-[1.02]">
                         Unlock Locker
                       </button>
                     </div>
                   )}
                   {transaction.status === 'Completed' && (
                     <div className="flex items-center gap-2 text-primary font-bold py-4 px-6 bg-primary/10 rounded-2xl border border-primary/20">
                       <Unlock className="w-6 h-6"/>
                       Item Collected
                     </div>
                   )}
                   {transaction.status === 'Pending' && (
                     <div className="p-4 bg-error/10 text-error font-bold rounded-2xl border border-error/20 flex items-center gap-2">
                       <RefreshCcw className="w-5 h-5 animate-spin"/>
                       Waiting for Giver...
                     </div>
                   )}
                 </div>
               )}
            </div>

            {!isGiver && (
              <div className="flex flex-col items-center justify-center p-6 bg-white rounded-3xl border border-border">
                <img src={transaction.QRCode} alt="Locker QR" className="w-48 h-48 mb-6 p-2 bg-white border border-border rounded-2xl shadow-inner" />
                <div className="text-center">
                  <span className="text-xs font-bold text-text/50 uppercase tracking-widest">Digital Unlock Key</span>
                  <div className="text-3xl font-black tracking-[0.2em] text-primary">{transaction.OTP}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {transaction.status === 'Completed' && !feedbackSubmitted && (
          <div className="bg-community/10 p-8 rounded-[32px] border-2 border-community/20 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h3 className="text-2xl font-black text-community mb-2 flex items-center gap-2">
              <Star className="w-6 h-6 fill-community"/> Complete the Barter
            </h3>
            <p className="text-text/70 mb-6">How was your experience trading with this anonymous partner? Your rating helps maintain trust.</p>
            <form onSubmit={submitFeedback} className="space-y-6">
              <div className="flex gap-4">
                {[1,2,3,4,5].map(star => (
                   <button 
                    key={star} 
                    type="button" 
                    onClick={() => setFeedbackRating(star)} 
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${feedbackRating >= star ? 'bg-community text-white scale-110 shadow-lg' : 'bg-white text-community border border-community/20'}`}
                  >
                    <Star className={`w-6 h-6 ${feedbackRating >= star ? 'fill-current' : ''}`} />
                  </button>
                ))}
              </div>
              <textarea 
                placeholder="Optional: Add a public comment about the transaction quality..." 
                className="w-full p-4 rounded-2xl border-2 border-border bg-white/50 focus:border-community focus:outline-none transition min-h-[100px]"
                value={feedbackComment}
                onChange={e => setFeedbackComment(e.target.value)}
              />
              <button type="submit" className="px-8 py-3 bg-community text-white font-bold rounded-xl shadow-lg hover:bg-opacity-90 transition">
                Submit Feedback
              </button>
            </form>
          </div>
        )}

        {!isGiver && ['Ready', 'Completed', 'Disputed'].includes(transaction.status) && (
          <div className="bg-error/5 p-8 rounded-[32px] border border-error/20 shadow-sm">
            <h3 className="text-2xl font-black text-error mb-2">Locker Dispute System</h3>
            {dispute ? (
              <div className="space-y-3">
                <div className="text-sm font-bold text-error bg-white border border-error/30 rounded-2xl p-4">
                  Dispute Active: {dispute.reason.replace('_', ' ')} ({dispute.status})
                </div>
                {isGiver && dispute.status === 'Open' && (
                  <div className="flex gap-3">
                    <button onClick={() => resolveDispute('approve_refund')} className="px-4 py-2 rounded-xl bg-secondary text-primary font-black">Approve Refund</button>
                    <button onClick={() => resolveDispute('reject_release')} className="px-4 py-2 rounded-xl bg-primary text-white font-black">Reject & Release</button>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={submitDispute} className="space-y-4">
                <p className="text-text/70">Flag this transaction if the locker was empty or the item was defective during pickup.</p>
                <select value={disputeReason} onChange={(e) => setDisputeReason(e.target.value)} className="w-full p-3 border-2 border-border rounded-xl">
                  <option value="empty_locker">Locker was empty</option>
                  <option value="defective_item">Item was defective</option>
                  <option value="other">Other issue</option>
                </select>
                <textarea
                  rows={3}
                  value={disputeDetails}
                  onChange={(e) => setDisputeDetails(e.target.value)}
                  className="w-full p-3 border-2 border-border rounded-xl"
                  placeholder="Optional details for support review"
                />
                <button type="submit" className="px-6 py-3 bg-error text-white font-black rounded-xl">Raise Dispute</button>
              </form>
            )}
          </div>
        )}
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-border flex flex-col h-[75vh] sticky top-8">
        <div className="p-6 border-b border-border bg-primary text-background rounded-t-[32px] flex items-center justify-between">
           <div className="flex items-center gap-2">
             <Mail className="w-6 h-6"/>
             <h3 className="font-bold text-lg">Relay Chat</h3>
           </div>
           <div className="w-3 h-3 bg-secondary rounded-full animate-pulse" />
        </div>
        <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4">
          <p className="text-center text-[10px] uppercase font-black tracking-widest text-text/30 bg-background/50 py-2 rounded-full mb-2">Endpoint-to-Endpoint Anonymity Protected</p>
          {chat.map((c, i) => {
            const isMe = (c.senderId?._id || c.senderId) === currentUserId;
            return (
              <div key={i} className={`max-w-[85%] p-4 rounded-2xl text-sm ${isMe ? 'bg-secondary/20 ml-auto rounded-tr-none border-r-4 border-secondary' : 'bg-background border border-border mr-auto rounded-tl-none border-l-4 border-primary'}`}>
                <p className="leading-relaxed">{c.message}</p>
                <span className="text-[10px] opacity-40 mt-2 block text-right">{new Date(c.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
            );
          })}
        </div>
        <form onSubmit={handleSend} className="p-4 border-t border-border bg-background/20 flex gap-2">
          <input required type="text" placeholder="Type a message..." className="flex-1 px-5 py-3 border-2 border-border/50 rounded-2xl bg-white focus:outline-none focus:border-primary transition" value={msg} onChange={e=>setMsg(e.target.value)} />
          <button type="submit" className="bg-primary text-white w-12 h-12 rounded-2xl flex items-center justify-center hover:scale-105 transition shadow-lg">
            <Send className="w-5 h-5"/>
          </button>
        </form>
      </div>

    </div>
  );
}
