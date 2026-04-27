import { useContext, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateItem from './pages/CreateItem';
import TransactionSimulation from './pages/TransactionSimulation';
import Notifications from './pages/Notifications';
import OnboardingTour from './components/OnboardingTour';
import { AuthContext } from './context/AuthContext';

function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="p-12 text-center text-primary font-black">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function PublicOnlyRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="p-12 text-center text-primary font-black">Loading...</div>;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

function App() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const isTypingTarget = (target) => {
      if (!target) return false;
      const tagName = target.tagName?.toLowerCase();
      return tagName === 'input' || tagName === 'textarea' || tagName === 'select' || target.isContentEditable;
    };

    const onKeyDown = (event) => {
      if (!event.altKey || isTypingTarget(event.target)) return;

      const key = event.key.toLowerCase();
      if (key === 'h') {
        event.preventDefault();
        navigate('/');
      } else if (user && key === 'd') {
        event.preventDefault();
        navigate('/dashboard');
      } else if (user && key === 'c') {
        event.preventDefault();
        navigate('/create-item');
      } else if (user && key === 'n') {
        event.preventDefault();
        navigate('/notifications');
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [navigate, user]);

  return (
    <div className="font-sans text-text bg-background min-h-screen">
      <Navbar />
      <main className="pb-12">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
          <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/create-item" element={<ProtectedRoute><CreateItem /></ProtectedRoute>} />
          <Route path="/transaction/:id" element={<ProtectedRoute><TransactionSimulation /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <OnboardingTour />
    </div>
  );
}

export default App;
