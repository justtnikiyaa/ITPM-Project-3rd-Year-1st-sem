import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children }) {
    const { user } = useAuth();
    
    // If no user, redirect to login
    if (!user) return <Navigate to="/login" replace />;
    
    // If user exists but email is not verified, redirect to verify-email
    if (!user.isVerified) return <Navigate to="/verify-email" replace />;
    
    return children;
}

export default ProtectedRoute;
