import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem('token');
  if (token) {
    return children;
  }

  const redirectPath = location.pathname.startsWith('/admin') ? '/admin/signin' : '/signin';
  return <Navigate to={redirectPath} />;
};

export default ProtectedRoute;
