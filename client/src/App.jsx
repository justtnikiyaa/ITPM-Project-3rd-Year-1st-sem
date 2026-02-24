import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import BecomeASeller from './pages/BecomeASeller';
import BuyerRegister from './pages/BuyerRegister';
import Login from './pages/Login';
import SellerDashboard from './pages/SellerDashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/become-seller" element={<BecomeASeller />} />
          <Route path="/register" element={<BuyerRegister />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<SellerDashboard />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
