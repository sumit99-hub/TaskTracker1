import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { TrendingUp, Users, Target, CalendarCheck } from 'lucide-react';
import SkeletonCard from '../components/SkeletonCard';
import TaskManager from './TaskManager';
import { api } from '../lib/api';
import { getSettings } from '../lib/settings';
import { exportWeeklyReport } from '../lib/exportWeeklyReport';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true); 
  const [settings, setSettings] = useState(getSettings());
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  useEffect(() => {
    const handleUpdate = () => setSettings(getSettings());
    window.addEventListener('settings:updated', handleUpdate);
    return () => window.removeEventListener('settings:updated', handleUpdate);
  }, []);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await api.get('/api/tasks');
        setTasks(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false); 
      }
    };
    fetchTasks();
  }, []);

  const statusCounts = {
    todo: tasks.filter((task) => task.status === 'To do').length,
    inProgress: tasks.filter((task) => task.status === 'In progress').length,
    closed: tasks.filter((task) => task.status === 'Closed').length,
  };

  const summaryCards = [
    { label: 'To Do', value: statusCounts.todo, meta: 'Open tasks' },
    { label: 'In Progress', value: statusCounts.inProgress, meta: 'Active work' },
    { label: 'Closed', value: statusCounts.closed, meta: 'Completed' },
    { label: 'Velocity', value: '92%', meta: 'Up 8% vs last sprint', icon: TrendingUp },
    { label: 'Active Squads', value: '6', meta: '42 contributors', icon: Users },
    { label: 'Milestones', value: '14/18', meta: 'Next review in 5 days', icon: Target },
    { label: 'Launch Window', value: 'Mar 22', meta: 'Freeze in 9 days', icon: CalendarCheck },
  ];

  const focusAreas = [
    { title: 'Client Launch Readiness', owner: 'Ops', progress: 88 },
    { title: 'Design System Rollout', owner: 'UX', progress: 74 },
    { title: 'Integration Testing', owner: 'Eng', progress: 62 },
    { title: 'Data Migration', owner: 'Data', progress: 55 },
  ];

  const handleExportWeeklyReport = () => {
    const fileName = exportWeeklyReport({
      reportTitle: 'Executive Overview',
      visibilityScope: settings.visibilityScope,
      summaryCards,
      focusAreas,
      tasks,
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
          <h1 className="text-3xl font-bold">Executive Overview</h1>
          <p className="text-gray-500 mt-2">
            Visibility: <span className="font-semibold">{settings.visibilityScope}</span>
          </p>
        </div>
        <motion.button
          className="px-5 py-3 bg-black text-white rounded-full font-semibold hover:bg-gray-900 transition"
          onClick={handleExportWeeklyReport}
          whileHover={{ scale: 1.03, y: -1 }}
          whileTap={{ scale: 0.97 }}
        >
          Export Weekly Report
        </motion.button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-10">
        {summaryCards.map((card, index) => (
          <motion.div
            key={card.label}
            className="bg-white/90 border border-gray-100 rounded-2xl p-5 shadow-sm backdrop-blur"
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * index }}
            style={{ opacity: settings.transparency }}
          >
            {card.icon && (
              <div className="w-11 h-11 rounded-2xl bg-gray-100 flex items-center justify-center">
                <card.icon size={18} />
              </div>
            )}
            <p className="text-gray-500 text-sm mt-4">{card.label}</p>
            <h3 className="text-2xl font-bold mt-1">{card.value}</h3>
            <p className="text-xs text-gray-400 mt-1">{card.meta}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-[1.1fr_1.9fr] gap-6 mb-10">
        <motion.div
          className="bg-white/90 border border-gray-100 rounded-3xl p-6 shadow-sm backdrop-blur"
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.99 }}
          style={{ opacity: settings.transparency }}
        >
          <p className="text-xs uppercase tracking-wide text-gray-400">Project Lead</p>
          <h2 className="text-xl font-semibold mt-2">Sumit Kumar Sah</h2>
          <p className="text-sm text-gray-500 mt-1">Driving Q1 delivery for multi-client program.</p>

          <div className="mt-5 space-y-3 text-sm text-gray-600">
            <div className="flex items-center justify-between">
              <span>Executive Readiness</span>
              <span className="font-semibold">A+</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Risk Coverage</span>
              <span className="font-semibold">92%</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Stakeholder Confidence</span>
              <span className="font-semibold">High</span>
            </div>
          </div>

          <motion.button
            className="mt-6 w-full rounded-full bg-black text-white py-3 text-sm font-semibold hover:bg-gray-900"
            onClick={() => setIsSummaryOpen(true)}
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          >
            View Leadership Summary
          </motion.button>
        </motion.div>

        <motion.div
          className="bg-white/90 border border-gray-100 rounded-3xl p-6 shadow-sm backdrop-blur"
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.99 }}
          style={{ opacity: settings.transparency }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Critical Focus Areas</h3>
              <p className="text-sm text-gray-500">Priority workstreams for this week.</p>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-gray-100">Week 6</span>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4">
            {focusAreas.map((focus) => (
              <div key={focus.title} className="border border-gray-100 rounded-2xl p-4">
                <p className="text-sm font-semibold">{focus.title}</p>
                <p className="text-xs text-gray-500 mt-1">Owner: {focus.owner}</p>
                <div className="w-full h-2 bg-gray-100 rounded-full mt-3">
                  <div
                    className="h-2 bg-black rounded-full"
                    style={{ width: `${focus.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {settings.weeklyReportVisible && (
        <motion.div
          className="bg-white/90 border border-gray-100 rounded-3xl p-6 shadow-sm backdrop-blur mb-10"
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.99 }}
          style={{ opacity: settings.transparency }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Weekly Report</h3>
              <p className="text-sm text-gray-500">Ready for leadership distribution.</p>
            </div>
            <motion.button
              className="px-5 py-3 bg-black text-white rounded-full font-semibold hover:bg-gray-900 transition"
              onClick={handleExportWeeklyReport}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.97 }}
            >
              Export Now
            </motion.button>
          </div>
        </motion.div>
      )}

      <h2 className="text-2xl font-bold mb-6">Your Tasks</h2>

      {loading ? (
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <TaskManager tasks={tasks} setTasks={setTasks} transparency={settings.transparency} />
      )}

      <AnimatePresence>
        {isSummaryOpen && (
          <motion.div
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSummaryOpen(false)}
          >
            <motion.div
              className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-xl"
              initial={{ y: 20, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 12, opacity: 0, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 240, damping: 20 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Leadership Summary</h2>
                  <p className="text-sm text-gray-500">Executive snapshot for this week.</p>
                </div>
                <button
                  className="text-sm text-gray-500 hover:text-gray-800"
                  onClick={() => setIsSummaryOpen(false)}
                >
                  Close
                </button>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-4">
                {summaryCards.slice(0, 3).map((card) => (
                  <div key={card.label} className="rounded-2xl border border-gray-100 p-4">
                    <p className="text-xs text-gray-500">{card.label}</p>
                    <p className="text-2xl font-semibold mt-2">{card.value}</p>
                    <p className="text-xs text-gray-400 mt-1">{card.meta}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                <div className="rounded-2xl border border-gray-100 p-4">
                  <p className="font-semibold">Executive Readiness</p>
                  <p className="text-gray-500 mt-2">A+ · On track for Q1 commitments.</p>
                </div>
                <div className="rounded-2xl border border-gray-100 p-4">
                  <p className="font-semibold">Stakeholder Confidence</p>
                  <p className="text-gray-500 mt-2">High · Alignment steady across teams.</p>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-sm font-semibold">Critical Focus Areas</p>
                <div className="mt-3 space-y-3">
                  {focusAreas.map((focus) => (
                    <div
                      key={focus.title}
                      className="flex items-center justify-between rounded-2xl border border-gray-100 px-4 py-3 text-sm"
                    >
                      <div>
                        <p className="font-semibold">{focus.title}</p>
                        <p className="text-xs text-gray-500">Owner: {focus.owner}</p>
                      </div>
                      <span className="text-xs text-gray-500">{focus.progress}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  className="rounded-full border border-gray-200 px-4 py-2 text-sm"
                  onClick={() => setIsSummaryOpen(false)}
                >
                  Close
                </button>
                <motion.button
                  className="rounded-full bg-black px-5 py-2 text-sm font-semibold text-white"
                  onClick={handleExportWeeklyReport}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                >
                  Export Summary
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Dashboard;
