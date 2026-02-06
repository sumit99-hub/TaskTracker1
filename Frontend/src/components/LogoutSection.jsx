import { motion } from 'framer-motion';
import { LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const LogoutSection = ({
  title = 'Sign out',
  description = 'End your session on this device.',
  contextLabel = 'Session',
  buttonLabel = 'Log out',
}) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('profile');
    window.dispatchEvent(new Event('profile:updated'));
    toast.success('You have been signed out.');
    navigate('/signin');
  };

  return (
    <motion.div
      className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm"
      whileHover={{ y: -4 }}
    >
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gray-100 flex items-center justify-center">
              <LogOut size={18} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">{contextLabel}</p>
              <h2 className="text-lg font-semibold">{title}</h2>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-3">{description}</p>
        </div>

        <motion.button
          className="px-5 py-3 rounded-full border border-gray-200 text-sm font-semibold hover:bg-gray-50"
          onClick={handleLogout}
          whileHover={{ scale: 1.03, y: -1 }}
          whileTap={{ scale: 0.97 }}
        >
          {buttonLabel}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default LogoutSection;
