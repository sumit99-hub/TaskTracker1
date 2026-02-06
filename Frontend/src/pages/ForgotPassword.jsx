import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api, API_BASE_URL } from '../lib/api';
import logo from '../assets/logo.png';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('request');
  const [loading, setLoading] = useState(false);
  const [otpHint, setOtpHint] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    password: '',
    confirmPassword: '',
  });

  const handleRequest = async (event) => {
    event.preventDefault();
    if (!formData.email) {
      return toast.error('Enter your email to receive an OTP');
    }

    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/forgot-password', {
        email: formData.email,
        role: 'user',
      });
      setOtpHint(data?.devOtp ? `Demo OTP: ${data.devOtp}` : '');
      setStep('reset');
      toast.success('OTP sent to your email.');
    } catch (err) {
      if (!err.response) {
        return toast.error(`Backend not reachable at ${API_BASE_URL}`);
      }
      const message =
        err.response?.data?.errors?.[0]?.msg ||
        err.response?.data?.msg ||
        'Unable to send OTP. Try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (event) => {
    event.preventDefault();

    if (!formData.otp || !formData.password || !formData.confirmPassword) {
      return toast.error('Please fill in all fields');
    }

    if (formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match');
    }

    setLoading(true);
    try {
      await api.post('/api/auth/reset-password', {
        email: formData.email,
        role: 'user',
        code: formData.otp,
        newPassword: formData.password,
      });
      toast.success('Password updated. Please sign in.');
      navigate('/signin');
    } catch (err) {
      if (!err.response) {
        return toast.error(`Backend not reachable at ${API_BASE_URL}`);
      }
      const message =
        err.response?.data?.errors?.[0]?.msg ||
        err.response?.data?.msg ||
        'Password reset failed. Try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setFormData((prev) => ({
      ...prev,
      email: 'member@tasktracker.io',
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
          <Link to="/signin" className="text-gray-500 hover:text-black transition-all pl-2">
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
          onSubmit={step === 'request' ? handleRequest : handleReset}
          className="flex flex-col items-center"
        >
          <h1 className="text-6xl font-black italic mb-12 tracking-tight">
            {step === 'request' ? 'Reset Password' : 'Confirm Reset'}
          </h1>

          <div className="w-96">
            <AnimatePresence mode="wait">
              {step === 'request' ? (
                <motion.div
                  key="request"
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

                  <div className="rounded-2xl border border-gray-100 bg-[#F7F4F2] px-4 py-3 text-xs text-gray-600">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-gray-700">Demo account</p>
                        <p>Email: member@tasktracker.io</p>
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
                  <Link
                    to="/signin"
                    className="text-xs text-gray-500 hover:text-black transition-colors text-center"
                  >
                    Back to sign in
                  </Link>
                </motion.div>
              ) : (
                <motion.div
                  key="reset"
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

                  <div className="relative">
                    <input
                      type="password"
                      placeholder="New password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full border-b border-gray-400 pb-2 outline-none focus:border-black transition-colors"
                    />
                  </div>

                  <div className="relative">
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full border-b border-gray-400 pb-2 outline-none focus:border-black transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#AED6F1] py-4 rounded-2xl font-bold text-lg shadow-md hover:shadow-lg hover:bg-[#99C7E6] transition-all transform active:scale-95 mt-4 disabled:opacity-60"
                    disabled={loading}
                  >
                    {loading ? 'Updating...' : 'Update Password'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep('request')}
                    className="text-xs text-gray-500 hover:text-black transition-colors"
                  >
                    Use a different email
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default ForgotPassword;
