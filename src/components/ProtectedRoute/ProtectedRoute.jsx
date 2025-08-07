import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'; // ✅ check exact match
  return isLoggedIn ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
