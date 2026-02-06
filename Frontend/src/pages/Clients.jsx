import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, ArrowUpRight, Star, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const initialClients = [
  {
    id: 'c1',
    name: 'Nexa Retail',
    industry: 'E-commerce',
    status: 'Active',
    tier: 'Platinum',
    lead: 'Sumit Kumar Sah',
    progress: 84,
  },
  {
    id: 'c2',
    name: 'Orion Health',
    industry: 'Healthcare',
    status: 'Active',
    tier: 'Gold',
    lead: 'Riya Das',
    progress: 72,
  },
  {
    id: 'c3',
    name: 'Aperture Labs',
    industry: 'Research',
    status: 'Onboarding',
    tier: 'Silver',
    lead: 'Dev Patel',
    progress: 46,
  },
  {
    id: 'c4',
    name: 'Nimbus Finance',
    industry: 'Fintech',
    status: 'Active',
    tier: 'Gold',
    lead: 'Meera Singh',
    progress: 63,
  },
];

const metrics = [
  { label: 'Total Clients', value: '24', change: '+4 this quarter' },
  { label: 'Active Projects', value: '12', change: '+2 new launches' },
  { label: 'Retention', value: '96%', change: 'Up 3%' },
  { label: 'Avg. SLA', value: '98.2%', change: 'Stable' },
];

const Clients = () => {
  const [clients, setClients] = useState(initialClients);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMetric, setActiveMetric] = useState(null);
  const [reportMetric, setReportMetric] = useState(null);
  const [shareMetric, setShareMetric] = useState(null);
  const [shareLink, setShareLink] = useState('');
  const [formValues, setFormValues] = useState({
    name: '',
    industry: '',
    status: 'Active',
    tier: 'Gold',
    lead: '',
    progress: 65,
  });

  const clientMetrics = useMemo(() => {
    const baseTotalClients = 24;
    const addedClients = Math.max(clients.length - initialClients.length, 0);
    return metrics.map((metric) =>
      metric.label === 'Total Clients'
        ? { ...metric, value: String(baseTotalClients + addedClients) }
        : metric
    );
  }, [clients.length]);

  const handleClick = (clientName) => {
    toast.success(`Opening ${clientName} overview`);
  };

  const handleAddClient = (event) => {
    event.preventDefault();
    const trimmedName = formValues.name.trim();
    const trimmedIndustry = formValues.industry.trim();
    const trimmedLead = formValues.lead.trim();
    const progressValue = Number(formValues.progress);

    if (!trimmedName || !trimmedIndustry || !trimmedLead) {
      toast.error('Please complete all required fields.');
      return;
    }

    if (Number.isNaN(progressValue) || progressValue < 0 || progressValue > 100) {
      toast.error('Engagement must be between 0 and 100.');
      return;
    }

    const newClient = {
      id: `c${Date.now()}`,
      name: trimmedName,
      industry: trimmedIndustry,
      status: formValues.status,
      tier: formValues.tier,
      lead: trimmedLead,
      progress: progressValue,
    };

    setClients((prev) => [newClient, ...prev]);
    setIsModalOpen(false);
    setFormValues({
      name: '',
      industry: '',
      status: 'Active',
      tier: 'Gold',
      lead: '',
      progress: 65,
    });
    toast.success('Client added to the portfolio.');
  };

  const handleOpenMetric = (metric) => {
    setActiveMetric(metric);
  };

  const handleCloseMetric = () => {
    setActiveMetric(null);
  };

  const handleOpenReport = (metric) => {
    setReportMetric(metric);
  };

  const handleCloseReport = () => {
    setReportMetric(null);
  };

  const handleOpenShare = (metric) => {
    setShareMetric(metric);
  };

  const handleCloseShare = () => {
    setShareMetric(null);
  };

  const handleCopyShare = async () => {
    if (!shareMetric) return;
    const shareText = `${shareMetric.label} Report\nValue: ${shareMetric.value}\nChange: ${shareMetric.change}`;
    try {
      await navigator.clipboard.writeText(shareText);
      toast.success('Report summary copied');
    } catch (err) {
      toast.error('Copy failed. Please try again.');
    }
  };

  const handleGenerateLink = () => {
    if (!shareMetric) return;
    const slug = shareMetric.label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const link = `${window.location.origin}/reports/${slug}?value=${encodeURIComponent(
      shareMetric.value
    )}`;
    setShareLink(link);
    toast.success('Share link generated');
  };

  const handleCloseShareLink = () => {
    setShareLink('');
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
          <h1 className="text-3xl font-bold">Clients</h1>
          <p className="text-gray-500 mt-2">Live portfolio snapshot for the project leader.</p>
        </div>
        <motion.button
          className="px-5 py-3 bg-black text-white rounded-full font-semibold hover:bg-gray-900 transition relative overflow-hidden"
          onClick={() => setIsModalOpen(true)}
          whileHover={{ scale: 1.03, y: -1 }}
          whileTap={{ scale: 0.97 }}
          animate={{
            boxShadow: [
              '0 6px 14px rgba(0,0,0,0.12)',
              '0 10px 20px rgba(0,0,0,0.18)',
              '0 6px 14px rgba(0,0,0,0.12)',
            ],
          }}
          transition={{
            type: 'spring',
            stiffness: 320,
            damping: 20,
            boxShadow: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' },
          }}
        >
          Add New Client
        </motion.button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-10">
        {clientMetrics.map((metric) => (
          <motion.button
            key={metric.label}
            whileHover={{ y: -4, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="text-left bg-white border border-gray-100 rounded-2xl p-5 shadow-sm focus:outline-none"
            onClick={() => handleOpenMetric(metric)}
          >
            <p className="text-gray-500 text-sm">{metric.label}</p>
            <h3 className="text-2xl font-bold mt-2">{metric.value}</h3>
            <p className="text-xs text-gray-400 mt-1">{metric.change}</p>
          </motion.button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {clients.map((client, index) => (
          <motion.button
            key={client.id}
            onClick={() => handleClick(client.name)}
            className="text-left bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
            whileHover={{ scale: 1.01 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center">
                  <Building2 size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">{client.name}</h2>
                  <p className="text-sm text-gray-500">{client.industry}</p>
                </div>
              </div>
              <ArrowUpRight className="text-gray-400" />
            </div>

            <div className="flex items-center gap-3 mt-5 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <ShieldCheck size={16} /> {client.status}
              </span>
              <span className="flex items-center gap-1">
                <Star size={16} /> {client.tier}
              </span>
              <span>Lead: {client.lead}</span>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Engagement</span>
                <span>{client.progress}%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full mt-2">
                <div
                  className="h-2 bg-black rounded-full"
                  style={{ width: `${client.progress}%` }}
                ></div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {activeMetric && (
          <motion.div
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseMetric}
          >
            <motion.div
              className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl"
              initial={{ y: 20, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 12, opacity: 0, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 240, damping: 20 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{activeMetric.label}</h2>
                  <p className="text-sm text-gray-500">Snapshot details for this metric.</p>
                </div>
                <button
                  className="text-sm text-gray-500 hover:text-gray-800"
                  onClick={handleCloseMetric}
                >
                  Close
                </button>
              </div>

              <div className="mt-5 rounded-2xl border border-gray-100 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-400">Current Value</p>
                <p className="text-3xl font-semibold mt-2">{activeMetric.value}</p>
                <p className="text-sm text-gray-500 mt-1">{activeMetric.change}</p>
              </div>

              <div className="mt-5 space-y-3 text-sm text-gray-600">
                <div className="flex items-center justify-between">
                  <span>Portfolio Impact</span>
                  <span className="font-semibold">High</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Trend</span>
                  <span className="font-semibold">Stable</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Next Review</span>
                  <span className="font-semibold">Friday</span>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  className="rounded-full border border-gray-200 px-4 py-2 text-sm"
                  onClick={handleCloseMetric}
                >
                  Close
                </button>
                <motion.button
                  className="rounded-full bg-black px-5 py-2 text-sm font-semibold text-white"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    handleOpenReport(activeMetric);
                    handleCloseMetric();
                  }}
                >
                  Open Report
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
        {reportMetric && (
          <motion.div
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseReport}
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
                  <h2 className="text-xl font-semibold">{reportMetric.label} Report</h2>
                  <p className="text-sm text-gray-500">Expanded view for this metric.</p>
                </div>
                <button
                  className="text-sm text-gray-500 hover:text-gray-800"
                  onClick={handleCloseReport}
                >
                  Close
                </button>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-4">
                <div className="rounded-2xl border border-gray-100 p-4">
                  <p className="text-xs text-gray-500">Current Value</p>
                  <p className="text-2xl font-semibold mt-2">{reportMetric.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{reportMetric.change}</p>
                </div>
                <div className="rounded-2xl border border-gray-100 p-4">
                  <p className="text-xs text-gray-500">Trend</p>
                  <p className="text-2xl font-semibold mt-2">Stable</p>
                  <p className="text-xs text-gray-400 mt-1">Last 30 days</p>
                </div>
                <div className="rounded-2xl border border-gray-100 p-4">
                  <p className="text-xs text-gray-500">Next Review</p>
                  <p className="text-2xl font-semibold mt-2">Friday</p>
                  <p className="text-xs text-gray-400 mt-1">Weekly check-in</p>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-gray-100 p-4 text-sm text-gray-600">
                <p className="font-semibold text-gray-800">Highlights</p>
                <ul className="mt-2 space-y-2">
                  <li>Latest updates reflect this week’s portfolio check-in.</li>
                  <li>Leadership notes align with Q1 delivery objectives.</li>
                  <li>Flagged items are tracked in the client health review.</li>
                </ul>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  className="rounded-full border border-gray-200 px-4 py-2 text-sm"
                  onClick={handleCloseReport}
                >
                  Close
                </button>
                <motion.button
                  className="rounded-full bg-black px-5 py-2 text-sm font-semibold text-white"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleOpenShare(reportMetric)}
                >
                  Share Report
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
        {shareMetric && (
          <motion.div
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseShare}
          >
            <motion.div
              className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl"
              initial={{ y: 20, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 12, opacity: 0, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 240, damping: 20 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Share {shareMetric.label}</h2>
                  <p className="text-sm text-gray-500">Send this report summary to stakeholders.</p>
                </div>
                <button
                  className="text-sm text-gray-500 hover:text-gray-800"
                  onClick={handleCloseShare}
                >
                  Close
                </button>
              </div>

              <div className="mt-5 rounded-2xl border border-gray-100 p-4 text-sm text-gray-600">
                <p className="font-semibold text-gray-800">Summary</p>
                <p className="mt-2">
                  {shareMetric.label}: {shareMetric.value} ({shareMetric.change})
                </p>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <motion.button
                  className="rounded-full border border-gray-200 px-4 py-2 text-sm"
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleCopyShare}
                >
                  Copy Summary
                </motion.button>
                <motion.button
                  className="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white"
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    handleGenerateLink();
                    handleCloseShare();
                  }}
                >
                  Generate Link
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
        {shareLink && (
          <motion.div
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseShareLink}
          >
            <motion.div
              className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl"
              initial={{ y: 20, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 12, opacity: 0, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 240, damping: 20 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Share Link</h2>
                  <p className="text-sm text-gray-500">Use this link to share the report.</p>
                </div>
                <button
                  className="text-sm text-gray-500 hover:text-gray-800"
                  onClick={handleCloseShareLink}
                >
                  Close
                </button>
              </div>

              <div className="mt-4 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-xs text-gray-600 break-all">
                {shareLink}
              </div>

              <div className="mt-5 flex justify-end gap-3">
                <button
                  className="rounded-full border border-gray-200 px-4 py-2 text-sm"
                  onClick={handleCloseShareLink}
                >
                  Close
                </button>
                <motion.button
                  className="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white"
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(shareLink);
                      toast.success('Link copied');
                    } catch (err) {
                      toast.error('Copy failed. Please try again.');
                    }
                  }}
                >
                  Copy Link
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl"
              initial={{ y: 20, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 12, opacity: 0, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 240, damping: 20 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Add New Client</h2>
                  <p className="text-sm text-gray-500">Start onboarding with key details.</p>
                </div>
                <button
                  className="text-sm text-gray-500 hover:text-gray-800"
                  onClick={() => setIsModalOpen(false)}
                >
                  Close
                </button>
              </div>

              <form className="mt-5 space-y-4" onSubmit={handleAddClient}>
                <div className="grid grid-cols-2 gap-4">
                  <label className="text-sm font-medium text-gray-600">
                    Client Name *
                    <input
                      className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm focus:border-black focus:outline-none"
                      value={formValues.name}
                      onChange={(event) =>
                        setFormValues((prev) => ({ ...prev, name: event.target.value }))
                      }
                      placeholder="Atlas Media"
                      required
                    />
                  </label>
                  <label className="text-sm font-medium text-gray-600">
                    Industry *
                    <input
                      className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm focus:border-black focus:outline-none"
                      value={formValues.industry}
                      onChange={(event) =>
                        setFormValues((prev) => ({ ...prev, industry: event.target.value }))
                      }
                      placeholder="Publishing"
                      required
                    />
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <label className="text-sm font-medium text-gray-600">
                    Status
                    <select
                      className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm focus:border-black focus:outline-none"
                      value={formValues.status}
                      onChange={(event) =>
                        setFormValues((prev) => ({ ...prev, status: event.target.value }))
                      }
                    >
                      <option>Active</option>
                      <option>Onboarding</option>
                      <option>Paused</option>
                    </select>
                  </label>
                  <label className="text-sm font-medium text-gray-600">
                    Tier
                    <select
                      className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm focus:border-black focus:outline-none"
                      value={formValues.tier}
                      onChange={(event) =>
                        setFormValues((prev) => ({ ...prev, tier: event.target.value }))
                      }
                    >
                      <option>Platinum</option>
                      <option>Gold</option>
                      <option>Silver</option>
                    </select>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <label className="text-sm font-medium text-gray-600">
                    Client Lead *
                    <input
                      className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm focus:border-black focus:outline-none"
                      value={formValues.lead}
                      onChange={(event) =>
                        setFormValues((prev) => ({ ...prev, lead: event.target.value }))
                      }
                      placeholder="Jordan Lee"
                      required
                    />
                  </label>
                  <label className="text-sm font-medium text-gray-600">
                    Engagement %
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm focus:border-black focus:outline-none"
                      value={formValues.progress}
                      onChange={(event) =>
                        setFormValues((prev) => ({ ...prev, progress: event.target.value }))
                      }
                    />
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    className="rounded-full border border-gray-200 px-4 py-2 text-sm"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="submit"
                    className="rounded-full bg-black px-5 py-2 text-sm font-semibold text-white"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    Add Client
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Clients;
