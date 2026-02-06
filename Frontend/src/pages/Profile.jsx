import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Mail, Phone, MapPin, BriefcaseBusiness, Globe } from 'lucide-react';
import LogoutSection from '../components/LogoutSection';

const defaultProfile = {
  name: 'Sumit Kumar Sah',
  role: 'Project Lead',
  accessLevel: 'Admin',
  email: 'sumit@tasktracker.io',
  phone: '+1 415 555 2266',
  location: 'San Francisco, CA',
  company: 'Task Tracker',
  website: 'https://tasktracker.io',
  bio: 'Driving cross-functional delivery for product + engineering. Focused on clarity, velocity, and stakeholder alignment.',
};

const Profile = () => {
  const [profile, setProfile] = useState(defaultProfile);

  useEffect(() => {
    const stored = localStorage.getItem('profile');
    if (stored) {
      setProfile(JSON.parse(stored));
    }
  }, []);

  const handleChange = (field) => (event) => {
    setProfile((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSave = (event) => {
    event.preventDefault();
    localStorage.setItem('profile', JSON.stringify(profile));
    window.dispatchEvent(new Event('profile:updated'));
    toast.success('Profile updated');
  };

  return (
    <motion.div
      className="ml-64 p-10"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-gray-500 mt-2">Update your leadership profile and contact details.</p>
        </div>
        <motion.button
          className="px-5 py-3 bg-black text-white rounded-full font-semibold hover:bg-gray-900 transition"
          onClick={handleSave}
          whileHover={{ scale: 1.03, y: -1 }}
          whileTap={{ scale: 0.97 }}
        >
          Save Changes
        </motion.button>
      </div>

      <div className="grid grid-cols-[1.1fr_1.9fr] gap-8">
        <motion.div
          className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm"
          whileHover={{ y: -4 }}
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-black text-white flex items-center justify-center text-xl font-semibold">
              {profile.name
                .split(' ')
                .map((part) => part[0])
                .join('')
                .slice(0, 2)}
            </div>
            <div>
              <h2 className="text-xl font-semibold">{profile.name}</h2>
              <p className="text-sm text-gray-500">{profile.role}</p>
            </div>
          </div>

          <div className="mt-6 space-y-3 text-sm text-gray-600">
            <p className="flex items-center gap-2">
              <Mail size={16} /> {profile.email}
            </p>
            <p className="flex items-center gap-2">
              <Phone size={16} /> {profile.phone}
            </p>
            <p className="flex items-center gap-2">
              <MapPin size={16} /> {profile.location}
            </p>
            <p className="flex items-center gap-2">
              <BriefcaseBusiness size={16} /> {profile.company}
            </p>
            <p className="flex items-center gap-2">
              <Globe size={16} /> {profile.website}
            </p>
          </div>

          <div className="mt-6">
            <p className="text-xs uppercase tracking-wide text-gray-400">Leadership Summary</p>
            <p className="text-sm text-gray-600 mt-2">{profile.bio}</p>
          </div>
        </motion.div>

        <motion.form
          className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-6"
          onSubmit={handleSave}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-semibold">Full Name</label>
              <input
                className="mt-2 w-full border-b border-gray-300 pb-2 outline-none focus:border-black"
                value={profile.name}
                onChange={handleChange('name')}
              />
            </div>
            <div>
              <label className="text-sm font-semibold">Role</label>
              <input
                className="mt-2 w-full border-b border-gray-300 pb-2 outline-none focus:border-black"
                value={profile.role}
                onChange={handleChange('role')}
              />
            </div>
            <div>
              <label className="text-sm font-semibold">Access Level</label>
              <select
                className="mt-2 w-full border-b border-gray-300 pb-2 outline-none focus:border-black bg-transparent"
                value={profile.accessLevel || 'Member'}
                onChange={handleChange('accessLevel')}
              >
                <option value="Admin">Admin</option>
                <option value="Member">Member</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold">Email</label>
              <input
                className="mt-2 w-full border-b border-gray-300 pb-2 outline-none focus:border-black"
                value={profile.email}
                onChange={handleChange('email')}
              />
            </div>
            <div>
              <label className="text-sm font-semibold">Phone</label>
              <input
                className="mt-2 w-full border-b border-gray-300 pb-2 outline-none focus:border-black"
                value={profile.phone}
                onChange={handleChange('phone')}
              />
            </div>
            <div>
              <label className="text-sm font-semibold">Location</label>
              <input
                className="mt-2 w-full border-b border-gray-300 pb-2 outline-none focus:border-black"
                value={profile.location}
                onChange={handleChange('location')}
              />
            </div>
            <div>
              <label className="text-sm font-semibold">Company</label>
              <input
                className="mt-2 w-full border-b border-gray-300 pb-2 outline-none focus:border-black"
                value={profile.company}
                onChange={handleChange('company')}
              />
            </div>
            <div className="col-span-2">
              <label className="text-sm font-semibold">Website</label>
              <input
                className="mt-2 w-full border-b border-gray-300 pb-2 outline-none focus:border-black"
                value={profile.website}
                onChange={handleChange('website')}
              />
            </div>
            <div className="col-span-2">
              <label className="text-sm font-semibold">Bio</label>
              <textarea
                rows={4}
                className="mt-2 w-full border border-gray-200 rounded-2xl p-4 outline-none focus:border-black"
                value={profile.bio}
                onChange={handleChange('bio')}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <motion.button
              type="submit"
              className="px-6 py-3 bg-black text-white rounded-full font-semibold hover:bg-gray-900 transition"
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.97 }}
            >
              Update Profile
            </motion.button>
          </div>
        </motion.form>
      </div>

      <div className="mt-10">
        <LogoutSection
          title="Sign out"
          description="Log out of your account on this device."
          contextLabel="User"
          buttonLabel="Log out"
        />
      </div>
    </motion.div>
  );
};

export default Profile;
