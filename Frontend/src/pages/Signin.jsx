import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';
import { api, API_BASE_URL } from '../lib/api';
import logo from '../assets/logo.png';

const SignIn = () => {
  const [formData, setFormData] = useState({ email: '', password: '', otp: '' });
  const [step, setStep] = useState('credentials');
  const [loading, setLoading] = useState(false);
  const [otpHint, setOtpHint] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      return toast.error('Please fill in all fields');
    }

    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/signin', {
        email: formData.email,
        password: formData.password,
        role: 'user',
      });
      setOtpHint(data?.devOtp ? `Demo OTP: ${data.devOtp}` : '');
      setStep('otp');
      toast.success('OTP sent to your email.');
    } catch (err) {
      if (!err.response) {
        return toast.error(`Backend not reachable at ${API_BASE_URL}`);
      }
      const message =
        err.response?.data?.errors?.[0]?.msg ||
        err.response?.data?.msg ||
        'Invalid credentials. Try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (!formData.otp) {
      return toast.error('Enter the OTP sent to your email');
    }

    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/verify-otp', {
        email: formData.email,
        role: 'user',
        purpose: 'login',
        code: formData.otp,
      });

      localStorage.setItem('token', data?.token || 'demo-token');
      const storedProfile = localStorage.getItem('profile');
      const existingProfile = storedProfile ? JSON.parse(storedProfile) : {};
      const displayName =
        data?.user?.firstName ||
        existingProfile.name ||
        formData.email.split('@')[0] ||
        'Team Member';

      localStorage.setItem(
        'profile',
        JSON.stringify({
          ...existingProfile,
          name: displayName,
          role: 'Team Member',
          accessLevel: 'Member',
          email: data?.user?.email || formData.email,
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
      if (!err.response) {
        return toast.error(`Backend not reachable at ${API_BASE_URL}`);
      }
      const message =
        err.response?.data?.errors?.[0]?.msg ||
        err.response?.data?.msg ||
        'OTP verification failed. Try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!formData.email || !formData.password) {
      return toast.error('Enter your email and password to resend OTP');
    }
    await handleLogin({ preventDefault: () => {} });
  };

  const fillDemo = () => {
    setFormData((prev) => ({
      ...prev,
      email: 'member@tasktracker.io',
      password: 'password123',
    }));
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
          <h1 className="font-bold text-xs leading-tight tracking-tighter uppercase">
            Task <br /> Tracker
          </h1>
        </div>

        <nav className="flex flex-col gap-6">
          <Link to="/signin" className="font-bold text-black border-l-4 border-black pl-2">
            User Sign In
          </Link>
          <Link to="/signup" className="text-gray-500 hover:text-black transition-all pl-2">
            Sign Up
          </Link>
          <Link to="/admin/signin" className="text-gray-500 hover:text-black transition-all pl-2">
            Admin Sign In
          </Link>
          <Link to="/admin/signup" className="text-gray-500 hover:text-black transition-all pl-2">
            Admin Sign Up
          </Link>
        </nav>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center z-10 bg-white shadow-[-20px_0px_50px_rgba(0,0,0,0.05)] rounded-l-[120px]">
        <form
          onSubmit={step === 'credentials' ? handleLogin : handleVerifyOtp}
          className="flex flex-col items-center"
        >
          <h1 className="text-7xl font-black italic mb-16 tracking-tight">
            {step === 'credentials' ? 'User Sign In' : 'Verify OTP'}
          </h1>

          <div className="w-96">
            <AnimatePresence mode="wait">
              {step === 'credentials' ? (
                <motion.div
                  key="credentials"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-10"
                >
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
                    <div className="flex justify-end mt-2">
                      <Link
                        to="/forgot-password"
                        className="text-xs text-gray-500 hover:text-black transition-colors"
                      >
                        Forgot password?
                      </Link>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-100 bg-[#F7F4F2] px-4 py-3 text-xs text-gray-600">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-gray-700">Demo account</p>
                        <p>Email: member@tasktracker.io</p>
                        <p>Password: password123</p>
                      </div>
                      <button
                        type="button"
                        onClick={fillDemo}
                        className="rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold hover:bg-gray-50"
                      >
                        Use demo
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#AED6F1] py-4 rounded-2xl font-bold text-lg shadow-md hover:shadow-lg hover:bg-[#99C7E6] transition-all transform active:scale-95 mt-4 disabled:opacity-60"
                    disabled={loading}
                  >
                    {loading ? 'Sending OTP...' : 'Send OTP'}
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="otp"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-8"
                >
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="6-digit OTP"
                      value={formData.otp}
                      onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                      className="w-full border-b border-gray-400 pb-2 outline-none focus:border-black transition-colors tracking-[0.2em]"
                    />
                  </div>
                  {otpHint ? <p className="text-xs text-gray-400 -mt-4">{otpHint}</p> : null}

                  <button
                    type="submit"
                    className="w-full bg-[#AED6F1] py-4 rounded-2xl font-bold text-lg shadow-md hover:shadow-lg hover:bg-[#99C7E6] transition-all transform active:scale-95 mt-4 disabled:opacity-60"
                    disabled={loading}
                  >
                    {loading ? 'Verifying...' : 'Verify & Sign In'}
                  </button>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="hover:text-black transition-colors"
                    >
                      Resend OTP
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep('credentials')}
                      className="hover:text-black transition-colors"
                    >
                      Use different email
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default SignIn;
