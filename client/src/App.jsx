import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateItem from './pages/CreateItem';
import TransactionSimulation from './pages/TransactionSimulation';
import Notifications from './pages/Notifications';

function App() {
  return (
    <div className="font-sans text-text bg-background min-h-screen">
      <Navbar />
      <main className="pb-12">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create-item" element={<CreateItem />} />
          <Route path="/transaction/:id" element={<TransactionSimulation />} />
          <Route path="/notifications" element={<Notifications />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
