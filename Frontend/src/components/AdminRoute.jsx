import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/admin/signin" />;
  }

  let accessLevel = null;
  const storedProfile = localStorage.getItem('profile');
  if (storedProfile) {
    try {
      accessLevel = JSON.parse(storedProfile)?.accessLevel;
    } catch (error) {
      accessLevel = null;
    }
  }

  return accessLevel === 'Admin' ? children : <Navigate to="/" />;
};

export default AdminRoute;
