import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './Sidebar';
import Dashboard from './pages/Dashboard';
import SignIn from './pages/Signin';
import AdminSignin from './pages/AdminSignin';
import AdminSignup from './pages/AdminSignup';
import AdminForgotPassword from './pages/AdminForgotPassword';
import SignUp from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Clients from './pages/Clients';
import Inbox from './pages/Inbox';
import Contacts from './pages/Contacts';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import UserSignout from './pages/UserSignout';
import AdminSignout from './pages/AdminSignout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

const AppLayout = () => (
  <>
    <Sidebar />
    <Outlet />
  </>
);

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/admin/signin" element={<AdminSignin />} />
        <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />
        <Route path="/admin/signup" element={<AdminSignup />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/tasks" element={<Dashboard />} />
          <Route path="/inbox" element={<Inbox />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/signout" element={<UserSignout />} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/signout"
            element={
              <AdminRoute>
                <AdminSignout />
              </AdminRoute>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
