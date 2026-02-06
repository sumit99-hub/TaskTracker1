import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../assets/logo.png';

const AdminSignin = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();

    if (!formData.username || !formData.password) {
      return toast.error('Please fill in all fields');
    }

    try {
      localStorage.setItem('token', 'demo-token');
      const storedProfile = localStorage.getItem('profile');
      const existingProfile = storedProfile ? JSON.parse(storedProfile) : {};
      localStorage.setItem(
        'profile',
        JSON.stringify({
          ...existingProfile,
          name: formData.username || existingProfile.name || 'Admin',
          role: 'Administrator',
          accessLevel: 'Admin',
          email: existingProfile.email || 'admin@tasktracker.io',
          phone: existingProfile.phone || '+1 415 555 2266',
          location: existingProfile.location || 'San Francisco, CA',
          company: existingProfile.company || 'Task Tracker',
          website: existingProfile.website || 'https://tasktracker.io',
          bio:
            existingProfile.bio ||
            'Oversees security, visibility, and weekly reporting for the organization.',
        })
      );
      window.dispatchEvent(new Event('profile:updated'));
      toast.success('Admin access granted.');
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Invalid credentials. Try again.');
    }
  };

  return (
    <motion.div
      className="relative w-full h-screen flex overflow-hidden bg-white"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div
        className="absolute top-0 left-0 w-full h-full bg-[#C9D9F2]"
        style={{ clipPath: 'polygon(0 0, 70% 0, 0 60%)' }}
      ></div>

      <div className="w-1/4 h-full z-10 flex flex-col p-12 bg-transparent">
        <div className="flex items-center gap-3 mb-20">
          <div className="w-10 h-10 border border-black rounded-full overflow-hidden flex items-center justify-center bg-white">
            <img src={logo} alt="Task Tracker logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="font-bold text-xs leading-tight tracking-tighter uppercase">Task <br /> Tracker</h1>
        </div>

        <nav className="flex flex-col gap-6">
          <Link to="/admin/signin" className="font-bold text-black border-l-4 border-black pl-2">
            Admin Sign In
          </Link>
          <Link to="/admin/signup" className="text-gray-500 hover:text-black transition-all pl-2">
            Admin Sign Up
          </Link>
          <Link to="/signin" className="text-gray-500 hover:text-black transition-all pl-2">
            User Sign In
          </Link>
          <Link to="/signup" className="text-gray-500 hover:text-black transition-all pl-2">
            Sign Up
          </Link>
        </nav>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center z-10 bg-white shadow-[-20px_0px_50px_rgba(0,0,0,0.05)] rounded-l-[120px]">
        <form onSubmit={handleLogin} className="flex flex-col items-center">
          <h1 className="text-6xl font-black italic mb-12 tracking-tight">Admin Sign In</h1>

          <div className="w-80 space-y-10">
            <div className="relative">
              <input
                type="text"
                placeholder="Admin username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full border-b border-gray-400 pb-2 outline-none focus:border-black transition-colors"
              />
            </div>

            <div className="relative">
              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full border-b border-gray-400 pb-2 outline-none focus:border-black transition-colors"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#BDD3F0] py-4 rounded-2xl font-bold text-lg shadow-md hover:shadow-lg hover:bg-[#A9C4E8] transition-all transform active:scale-95 mt-4"
            >
              Sign In as Admin
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default AdminSignin;
