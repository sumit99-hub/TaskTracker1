import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { ShieldCheck, Eye, SlidersHorizontal, FileText, Users } from 'lucide-react';
import { getSettings, saveSettings, SETTINGS_DEFAULTS } from '../lib/settings';
import { exportWeeklyReport } from '../lib/exportWeeklyReport';
import LogoutSection from '../components/LogoutSection';

const Admin = () => {
  const [settings, setSettings] = useState(SETTINGS_DEFAULTS);
  const [accessLevel, setAccessLevel] = useState('Admin');
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    setSettings(getSettings());
    const stored = localStorage.getItem('profile');
    if (stored) {
      const parsed = JSON.parse(stored);
      setAccessLevel(parsed.accessLevel || 'Member');
    }

    const storedComments = localStorage.getItem('admin:comments');
    if (storedComments) {
      setComments(JSON.parse(storedComments));
    }
  }, []);

  const updateSettings = (updates) => {
    const next = { ...settings, ...updates };
    setSettings(next);
    saveSettings(next);
  };

  const persistComments = (nextComments) => {
    setComments(nextComments);
    localStorage.setItem('admin:comments', JSON.stringify(nextComments));
  };

  const handleAddComment = (event) => {
    event.preventDefault();
    const trimmed = commentText.trim();
    if (!trimmed) {
      toast.error('Please enter a comment.');
      return;
    }

    const newComment = {
      id: `cm-${Date.now()}`,
      author: 'Admin',
      message: trimmed,
      time: new Date().toLocaleString(),
    };

    persistComments([newComment, ...comments]);
    setCommentText('');
    toast.success('Comment added.');
  };

  const handleAccessToggle = () => {
    const nextAccess = accessLevel === 'Admin' ? 'Member' : 'Admin';
    setAccessLevel(nextAccess);
    const storedProfile = localStorage.getItem('profile');
    const parsedProfile = storedProfile ? JSON.parse(storedProfile) : {};
    localStorage.setItem('profile', JSON.stringify({ ...parsedProfile, accessLevel: nextAccess }));
    window.dispatchEvent(new Event('profile:updated'));
    toast.success(`Access updated to ${nextAccess}`);
  };

  const handleVisibilityToggle = () => {
    const nextValue = !settings.weeklyReportVisible;
    updateSettings({ weeklyReportVisible: nextValue });
    toast.success(`Weekly report is now ${nextValue ? 'visible' : 'hidden'}`);
  };

  const handleExport = () => {
    const fileName = exportWeeklyReport({
      reportTitle: 'Admin Console - Weekly Report',
      visibilityScope: settings.visibilityScope,
      summaryCards: [
        { label: 'Visibility Scope', value: settings.visibilityScope, meta: 'Current access' },
        {
          label: 'Transparency',
          value: `${Math.round(settings.transparency * 100)}%`,
          meta: 'UI opacity setting',
        },
        { label: 'Members', value: '42 active', meta: 'Last updated today' },
      ],
    });
    toast.success(`Weekly report exported (${fileName})`);
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
          <h1 className="text-3xl font-bold">Admin Console</h1>
          <p className="text-gray-500 mt-2">Control visibility, transparency, and report access.</p>
        </div>
        <motion.button
          className="px-4 py-2 rounded-full bg-gray-100 text-sm"
          onClick={handleAccessToggle}
          whileHover={{ scale: 1.03, y: -1 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        >
          Access: {accessLevel}
        </motion.button>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-10">
        {[
          { label: 'Visibility Scope', value: settings.visibilityScope, icon: Eye },
          { label: 'Transparency', value: `${Math.round(settings.transparency * 100)}%`, icon: SlidersHorizontal },
          { label: 'Members', value: '42 active', icon: Users },
        ].map((card) => (
          <motion.div
            key={card.label}
            className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm"
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-11 h-11 rounded-2xl bg-gray-100 flex items-center justify-center">
              <card.icon size={18} />
            </div>
            <p className="text-gray-500 text-sm mt-4">{card.label}</p>
            <h3 className="text-xl font-bold mt-1">{card.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-[1.2fr_1.8fr] gap-6">
        <motion.div
          className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6"
          whileHover={{ y: -4 }}
        >
          <div className="flex items-center gap-3">
            <ShieldCheck />
            <h2 className="text-lg font-semibold">Visibility & Access</h2>
          </div>

          <div className="space-y-4">
            {['Admin only', 'Admin + Members', 'All Teams'].map((scope) => (
              <button
                key={scope}
                className={`w-full text-left px-4 py-3 rounded-2xl border transition ${
                  settings.visibilityScope === scope
                    ? 'border-black bg-black text-white'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => updateSettings({ visibilityScope: scope })}
              >
                {scope}
              </button>
            ))}
          </div>

          <div>
            <label className="text-sm font-semibold">Transparency Level</label>
            <input
              type="range"
              min="0.75"
              max="1"
              step="0.01"
              value={settings.transparency}
              onChange={(event) => updateSettings({ transparency: Number(event.target.value) })}
              className="w-full mt-3 accent-black"
            />
          </div>
        </motion.div>

        <motion.div
          className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm"
          whileHover={{ y: -4 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <FileText />
              <h2 className="text-lg font-semibold">Weekly Report</h2>
            </div>
            <motion.button
              className={`px-4 py-2 rounded-full text-sm ${
                settings.weeklyReportVisible ? 'bg-black text-white' : 'bg-gray-100'
              }`}
              onClick={handleVisibilityToggle}
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            >
              {settings.weeklyReportVisible ? 'Visible' : 'Hidden'}
            </motion.button>
          </div>

          <p className="text-sm text-gray-500">
            Toggle visibility of the report card on the leadership dashboard.
          </p>

          <div className="mt-6 flex gap-3">
            <button
              className="px-5 py-3 bg-black text-white rounded-full font-semibold hover:bg-gray-900"
              onClick={handleExport}
            >
              Export Weekly Report
            </button>
            <button
              className="px-5 py-3 rounded-full border border-gray-200 hover:bg-gray-50"
              onClick={() => toast.success('Report scheduled for Friday')}
            >
              Schedule Export
            </button>
          </div>
        </motion.div>
      </div>

      <motion.div
        className="mt-8 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm"
        whileHover={{ y: -4 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Admin Comments</h2>
            <p className="text-sm text-gray-500">Track internal notes and approvals.</p>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-gray-100">
            {comments.length} entries
          </span>
        </div>

        <form className="mt-4 flex gap-3" onSubmit={handleAddComment}>
          <input
            className="flex-1 rounded-2xl border border-gray-200 px-4 py-2 text-sm focus:border-black focus:outline-none"
            placeholder="Add a comment for the leadership team..."
            value={commentText}
            onChange={(event) => setCommentText(event.target.value)}
          />
          <motion.button
            type="submit"
            className="px-5 py-2 rounded-full bg-black text-white text-sm font-semibold"
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.96 }}
          >
            Post
          </motion.button>
        </form>

        <div className="mt-5 space-y-3">
          {comments.length === 0 ? (
            <p className="text-sm text-gray-500">No comments yet.</p>
          ) : (
            comments.map((comment) => (
              <motion.div
                key={comment.id}
                className="rounded-2xl border border-gray-100 p-4"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{comment.author}</span>
                  <span>{comment.time}</span>
                </div>
                <p className="text-sm text-gray-700 mt-2">{comment.message}</p>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>

      <div className="mt-8">
        <LogoutSection
          title="End Admin Session"
          description="Sign out of the admin console to protect visibility settings and reports."
          contextLabel="Admin"
          buttonLabel="Log out admin"
        />
      </div>
    </motion.div>
  );
};

export default Admin;
