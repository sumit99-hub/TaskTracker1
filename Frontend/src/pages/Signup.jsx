import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api, API_BASE_URL } from '../lib/api';
import logo from '../assets/logo.png';

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { firstName, email, password, confirmPassword } = formData;

    if (!firstName || !email || !password || !confirmPassword) {
      return toast.error('Please fill in all fields');
    }

    if (password !== confirmPassword) {
      return toast.error('Passwords do not match');
    }

    try {
      await api.post('/api/auth/signup', {
        firstName,
        email,
        password,
      });
      toast.success('Account created. Please sign in.');
      navigate('/signin');
    } catch (err) {
      if (!err.response) {
        return toast.error(`Backend not reachable at ${API_BASE_URL}`);
      }
      const message =
        err.response?.data?.errors?.[0]?.msg ||
        err.response?.data?.msg ||
        'Sign up failed. Try again.';
      toast.error(message);
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
        className="absolute top-0 left-0 w-full h-full bg-[#E6B9B8]"
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
          <Link to="/signin" className="text-gray-500 hover:text-black transition-all pl-2">
            Sign In
          </Link>
          <Link to="/admin/signin" className="text-gray-500 hover:text-black transition-all pl-2">
            Admin Sign In
          </Link>
          <Link to="/admin/signup" className="text-gray-500 hover:text-black transition-all pl-2">
            Admin Sign Up
          </Link>
          <Link to="/signup" className="font-bold text-black border-l-4 border-black pl-2">
            Sign Up
          </Link>
        </nav>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center z-10 bg-white shadow-[-20px_0px_50px_rgba(0,0,0,0.05)] rounded-l-[120px]">
        <form onSubmit={handleSubmit} className="flex flex-col items-center">
          <h1 className="text-7xl font-black italic mb-16 tracking-tight">Sign Up</h1>

          <div className="w-80 space-y-10">
            <div className="relative">
              <input
                type="text"
                placeholder="First name"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full border-b border-gray-400 pb-2 outline-none focus:border-black transition-colors"
              />
            </div>

            <div className="relative">
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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

            <div className="relative">
              <input
                type="password"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full border-b border-gray-400 pb-2 outline-none focus:border-black transition-colors"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#AED6F1] py-4 rounded-2xl font-bold text-lg shadow-md hover:shadow-lg hover:bg-[#99C7E6] transition-all transform active:scale-95 mt-4"
            >
              Create Account
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default SignUp;
