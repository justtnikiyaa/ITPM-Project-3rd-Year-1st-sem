import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import BecomeASeller from './pages/BecomeASeller';
import BuyerRegister from './pages/BuyerRegister';
import RegisterChoice from './pages/RegisterChoice';
import Login from './pages/Login';
import VerifyEmail from './pages/VerifyEmail';
import SellerDashboard from './pages/SellerDashboard';
import ServiceDetails from './pages/ServiceDetails';
import UserProfilePage from './pages/UserProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import SellerPortfolioPage from './pages/SellerPortfolioPage';
import ProtectedRoute from './components/ProtectedRoute';
import Checkout from './pages/Checkout';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<RegisterChoice />} />
          <Route path="/register/buyer" element={<BuyerRegister />} />
          <Route path="/become-seller" element={<BecomeASeller />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/dashboard" element={<ProtectedRoute><SellerDashboard /></ProtectedRoute>} />
          <Route path="/service/:id" element={<ServiceDetails />} />
          <Route path="/profile/me" element={<ProtectedRoute><UserProfilePage /></ProtectedRoute>} />
          <Route path="/profile/edit" element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>} />
          <Route path="/portfolio/:sellerId" element={<SellerPortfolioPage />} />
          <Route path="/checkout/:id" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;