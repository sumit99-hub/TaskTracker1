import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import LogoutSection from '../components/LogoutSection';

const AdminSignout = () => {
  return (
    <motion.div
      className="ml-64 p-10"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center">
          <ShieldCheck size={20} />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Admin Sign Out</h1>
          <p className="text-gray-500 mt-1">
            Sign out of the admin console to lock visibility and reporting controls.
          </p>
        </div>
      </div>

      <LogoutSection
        title="End Admin Session"
        description="Signing out will remove admin credentials from this device."
        contextLabel="Admin"
        buttonLabel="Sign out admin"
      />
    </motion.div>
  );
};

export default AdminSignout;
