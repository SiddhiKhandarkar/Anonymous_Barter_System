import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Bell, CheckCircle, Clock, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Notifications() {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, readStatus: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return <div className="p-12 text-center text-primary font-black animate-pulse">Establishing Signal...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-12 bg-primary text-background p-8 rounded-[32px] shadow-xl"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
            <Bell className="w-6 h-6 text-secondary" />
          </div>
          <div>
            <h2 className="text-3xl font-black tracking-tight">Activity Relay</h2>
            <p className="opacity-60 font-bold text-sm">Real-time updates from the network.</p>
          </div>
        </div>
        <div className="text-sm font-black bg-white/10 px-4 py-2 rounded-full border border-white/20">
          {notifications.filter(n => !n.readStatus).length} Unread
        </div>
      </motion.div>

      <div className="space-y-4">
        <AnimatePresence>
          {notifications.map((notification, index) => (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              key={notification._id} 
              className={`group p-6 rounded-[28px] border-2 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ${
                notification.readStatus 
                  ? 'bg-white border-border/50 opacity-60' 
                  : 'bg-white border-primary/10 shadow-lg shadow-primary/5 hover:border-primary/30'
              }`}
            >
              <div className="flex gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                  notification.type === 'match' ? 'bg-secondary/10 text-primary' : 
                  notification.type === 'status' ? 'bg-primary/10 text-primary' : 'bg-community/10 text-community'
                }`}>
                  <Info className="w-6 h-6" />
                </div>
                <div>
                  <p className={`font-black text-lg ${notification.readStatus ? 'text-text/60' : 'text-primary'}`}>
                    {notification.message}
                  </p>
                  <div className="flex items-center gap-2 text-xs font-bold opacity-40 mt-1 uppercase tracking-widest">
                    <Clock className="w-3 h-3" />
                    {new Date(notification.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
              
              {!notification.readStatus && (
                <button 
                  onClick={() => handleMarkAsRead(notification._id)}
                  className="w-full md:w-auto px-6 py-3 bg-secondary text-primary font-black rounded-xl hover:scale-105 transition flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5"/>
                  Acknowledge
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        
        {notifications.length === 0 && (
          <div className="text-center py-24 bg-white rounded-[40px] border-2 border-dashed border-border flex flex-col items-center">
            <Bell className="w-16 h-16 text-primary/10 mb-4" />
            <p className="text-xl font-bold text-text/30 tracking-tight">All clear. No new signals.</p>
          </div>
        )}
      </div>
    </div>
  );
}
