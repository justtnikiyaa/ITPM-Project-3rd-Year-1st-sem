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
          <Route path="/dashboard" element={<SellerDashboard />} />
          <Route path="/service/:id" element={<ServiceDetails />} />
          <Route path="/chat" element={<ChatHub />} />
        </Routes>
      </Router>
      </GlobalProviders>
    </AuthProvider>
  );
}

export default App;
