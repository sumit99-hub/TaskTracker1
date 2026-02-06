import { motion } from 'framer-motion';
import { UserRound } from 'lucide-react';
import LogoutSection from '../components/LogoutSection';

const UserSignout = () => {
  return (
    <motion.div
      className="ml-64 p-10"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center">
          <UserRound size={20} />
        </div>
        <div>
          <h1 className="text-3xl font-bold">User Sign Out</h1>
          <p className="text-gray-500 mt-1">Close your session and return to the sign-in screen.</p>
        </div>
      </div>

      <LogoutSection
        title="End User Session"
        description="Signing out will clear this device session and protect your workspace."
        contextLabel="User"
        buttonLabel="Sign out"
      />
    </motion.div>
  );
};

export default UserSignout;
