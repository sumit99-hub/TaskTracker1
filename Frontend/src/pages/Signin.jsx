import React, { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../assets/logo.png';

const SignIn = () => {
  
  const [formData, setFormData] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  
  const handleLogin = async (e) => {
    e.preventDefault(); 
    
    if (!formData.username || !formData.password) {
      return toast.error("Please fill in all fields");
    }

    try {
      
      localStorage.setItem('token', 'demo-token');
      const storedProfile = localStorage.getItem('profile');
      const existingProfile = storedProfile ? JSON.parse(storedProfile) : {};
      localStorage.setItem(
        'profile',
        JSON.stringify({
          ...existingProfile,
          name: formData.username || existingProfile.name || 'Sumit Kumar Sah',
          role: 'Team Member',
          accessLevel: 'Member',
          email: existingProfile.email || 'member@tasktracker.io',
          phone: existingProfile.phone || '+1 415 555 2266',
          location: existingProfile.location || 'San Francisco, CA',
          company: existingProfile.company || 'Task Tracker',
          website: existingProfile.website || 'https://tasktracker.io',
          bio:
            existingProfile.bio ||
            'Driving cross-functional delivery for product + engineering. Focused on clarity, velocity, and stakeholder alignment.',
        })
      );
      window.dispatchEvent(new Event('profile:updated'));
      toast.success('Welcome back!');
      navigate('/'); 
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
      
      {}
      <div 
        className="absolute top-0 left-0 w-full h-full bg-[#E6B9B8]" 
        style={{ clipPath: 'polygon(0 0, 70% 0, 0 60%)' }}
      ></div>
      
      {}
      <div className="w-1/4 h-full z-10 flex flex-col p-12 bg-transparent">
        <div className="flex items-center gap-3 mb-20">
          <div className="w-10 h-10 border border-black rounded-full overflow-hidden flex items-center justify-center bg-white">
            <img src={logo} alt="Task Tracker logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="font-bold text-xs leading-tight tracking-tighter uppercase">Task <br/> Tracker</h1>
        </div>

        <nav className="flex flex-col gap-6">
          <Link to="/signin" className="font-bold text-black border-l-4 border-black pl-2">User Sign In</Link>
          <Link to="/signup" className="text-gray-500 hover:text-black transition-all pl-2">Sign Up</Link>
          <Link to="/admin/signin" className="text-gray-500 hover:text-black transition-all pl-2">Admin Sign In</Link>
          <Link to="/admin/signup" className="text-gray-500 hover:text-black transition-all pl-2">Admin Sign Up</Link>
        </nav>
      </div>

      {}
      <div className="flex-1 flex flex-col items-center justify-center z-10 bg-white shadow-[-20px_0px_50px_rgba(0,0,0,0.05)] rounded-l-[120px]">
        
        <form onSubmit={handleLogin} className="flex flex-col items-center">
          <h1 className="text-7xl font-black italic mb-16 tracking-tight">User Sign In</h1>
          
          <div className="w-80 space-y-10">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Username" 
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className="w-full border-b border-gray-400 pb-2 outline-none focus:border-black transition-colors" 
              />
            </div>

            <div className="relative">
              <input 
                type="password" 
                placeholder="Password" 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full border-b border-gray-400 pb-2 outline-none focus:border-black transition-colors" 
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-[#AED6F1] py-4 rounded-2xl font-bold text-lg shadow-md hover:shadow-lg hover:bg-[#99C7E6] transition-all transform active:scale-95 mt-4"
            >
              Sign In
            </button>
          </div>
        </form>

      </div>
    </motion.div>
  );
};

export default SignIn;
