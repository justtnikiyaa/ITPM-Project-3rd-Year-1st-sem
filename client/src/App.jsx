import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { NotificationProvider } from './context/NotificationContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import BecomeASeller from './pages/BecomeASeller';
import BuyerRegister from './pages/BuyerRegister';
import RegisterChoice from './pages/RegisterChoice';
import Login from './pages/Login';
import VerifyEmail from './pages/VerifyEmail';
import SellerDashboard from './pages/SellerDashboard';
import ServiceDetails from './pages/ServiceDetails';
import ChatHub from './pages/ChatHub';
import UserProfilePage from './pages/UserProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import SellerPortfolioPage from './pages/SellerPortfolioPage';
import ProtectedRoute from './components/ProtectedRoute';
import Checkout from './pages/Checkout';
import PostJob from './pages/PostJob';
import JobsPage from './pages/JobsPage';

const GlobalProviders = ({ children }) => {
  const { user } = useAuth();
  return (
    <SocketProvider userId={user?._id}>
      <NotificationProvider>
        {children}
      </NotificationProvider>
    </SocketProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <GlobalProviders>
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
          <Route path="/chat" element={<ChatHub />} />
          <Route path="/profile/me" element={<ProtectedRoute><UserProfilePage /></ProtectedRoute>} />
          <Route path="/profile/edit" element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>} />
          <Route path="/portfolio/:sellerId" element={<SellerPortfolioPage />} />
          <Route path="/checkout/:id" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/jobs" element={<ProtectedRoute><JobsPage /></ProtectedRoute>} />
          <Route path="/jobs/create" element={<ProtectedRoute><PostJob /></ProtectedRoute>} />
        </Routes>
      </Router>
      </GlobalProviders>
    </AuthProvider>
  );
}

export default App;
