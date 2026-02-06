import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MailOpen, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const initialMessages = [
  {
    id: 'm1',
    subject: 'Sprint 12 Status Update',
    sender: 'Riya Das',
    time: '2 hours ago',
    status: 'Priority',
    preview: 'Scope locked. Awaiting leadership sign-off on release notes.',
  },
  {
    id: 'm2',
    subject: 'Stakeholder Demo Invite',
    sender: 'Meera Singh',
    time: 'Yesterday',
    status: 'Scheduled',
    preview: 'Demo set for Friday 3:00 PM. Please confirm the deck.',
  },
  {
    id: 'm3',
    subject: 'Client Feedback Summary',
    sender: 'Ava Martin',
    time: '2 days ago',
    status: 'Action Required',
    preview: 'Nexa wants a revised roadmap for Q3 integration.',
  },
  {
    id: 'm4',
    subject: 'Engineering Risks',
    sender: 'Dev Patel',
    time: '3 days ago',
    status: 'FYI',
    preview: 'Potential dependency delay flagged for compliance review.',
  },
];

const Inbox = () => {
  const [messages, setMessages] = useState(initialMessages);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draft, setDraft] = useState({
    subject: '',
    sender: 'You',
    status: 'Draft',
    preview: '',
  });

  const handleCompose = (event) => {
    event.preventDefault();
    const trimmedSubject = draft.subject.trim();
    const trimmedPreview = draft.preview.trim();

    if (!trimmedSubject || !trimmedPreview) {
      toast.error('Please add a subject and message.');
      return;
    }

    const newMessage = {
      id: `m${Date.now()}`,
      subject: trimmedSubject,
      sender: draft.sender.trim() || 'You',
      time: 'Just now',
      status: draft.status,
      preview: trimmedPreview,
    };

    setMessages((prev) => [newMessage, ...prev]);
    setIsModalOpen(false);
    setDraft({
      subject: '',
      sender: 'You',
      status: 'Draft',
      preview: '',
    });
    toast.success('Message queued for sending.');
  };

  const handleReply = (message) => {
    setDraft({
      subject: `Re: ${message.subject}`,
      sender: 'You',
      status: 'Draft',
      preview: `Hi ${message.sender},\n\n`,
    });
    setIsModalOpen(true);
  };

  const handleMarkDone = (messageId) => {
    setMessages((prev) =>
      prev.map((message) =>
        message.id === messageId
          ? { ...message, status: 'Done', time: 'Just now' }
          : message
      )
    );
    toast.success('Marked as done');
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
          <h1 className="text-3xl font-bold">Inbox</h1>
          <p className="text-gray-500 mt-2">Leadership comms and approvals in one place.</p>
        </div>
        <motion.button
          className="px-5 py-3 bg-black text-white rounded-full font-semibold hover:bg-gray-900 transition"
          onClick={() => setIsModalOpen(true)}
          whileHover={{ scale: 1.03, y: -1 }}
          whileTap={{ scale: 0.97 }}
        >
          New Message
        </motion.button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { label: 'Unread', value: '4', icon: MailOpen },
          { label: 'Pending', value: '2', icon: Clock },
          { label: 'Approved', value: '16', icon: CheckCircle2 },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            whileHover={{ y: -4 }}
            className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center">
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-gray-500 text-sm">{stat.label}</p>
              <h3 className="text-2xl font-bold">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="space-y-4">
        {messages.map((message, index) => (
          <motion.button
            key={message.id}
            className="w-full text-left bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 * index }}
            onClick={() => toast.success(`Opened "${message.subject}"`)}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">{message.subject}</h2>
                <p className="text-sm text-gray-500">
                  {message.sender} · {message.time}
                </p>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                {message.status}
              </span>
            </div>

            <p className="text-sm text-gray-600 mt-3">{message.preview}</p>

            <div className="mt-4 flex gap-3">
              <motion.button
                className="px-4 py-2 rounded-full bg-black text-white text-sm"
                onClick={(event) => {
                  event.stopPropagation();
                  handleReply(message);
                }}
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.96 }}
              >
                Reply
              </motion.button>
              <motion.button
                className={`px-4 py-2 rounded-full border text-sm ${
                  message.status === 'Done'
                    ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                    : 'border-gray-200'
                }`}
                onClick={(event) => {
                  event.stopPropagation();
                  handleMarkDone(message.id);
                }}
                whileHover={message.status === 'Done' ? {} : { scale: 1.03, y: -1 }}
                whileTap={message.status === 'Done' ? {} : { scale: 0.96 }}
                disabled={message.status === 'Done'}
              >
                {message.status === 'Done' ? 'Done' : 'Mark Done'}
              </motion.button>
              <span className="inline-flex items-center gap-2 text-xs text-gray-500 ml-auto">
                <Sparkles size={14} /> Auto-summary ready
              </span>
            </div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
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
                  <h2 className="text-xl font-semibold">New Message</h2>
                  <p className="text-sm text-gray-500">Draft leadership communication.</p>
                </div>
                <button
                  className="text-sm text-gray-500 hover:text-gray-800"
                  onClick={() => setIsModalOpen(false)}
                >
                  Close
                </button>
              </div>

              <form className="mt-5 space-y-4" onSubmit={handleCompose}>
                <label className="text-sm font-medium text-gray-600">
                  Subject *
                  <input
                    className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm focus:border-black focus:outline-none"
                    value={draft.subject}
                    onChange={(event) =>
                      setDraft((prev) => ({ ...prev, subject: event.target.value }))
                    }
                    placeholder="Sprint 13 Launch Approval"
                    required
                  />
                </label>

                <div className="grid grid-cols-2 gap-4">
                  <label className="text-sm font-medium text-gray-600">
                    Sender
                    <input
                      className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm focus:border-black focus:outline-none"
                      value={draft.sender}
                      onChange={(event) =>
                        setDraft((prev) => ({ ...prev, sender: event.target.value }))
                      }
                    />
                  </label>
                  <label className="text-sm font-medium text-gray-600">
                    Status
                    <select
                      className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm focus:border-black focus:outline-none"
                      value={draft.status}
                      onChange={(event) =>
                        setDraft((prev) => ({ ...prev, status: event.target.value }))
                      }
                    >
                      <option>Draft</option>
                      <option>Priority</option>
                      <option>Scheduled</option>
                      <option>FYI</option>
                    </select>
                  </label>
                </div>

                <label className="text-sm font-medium text-gray-600">
                  Message *
                  <textarea
                    rows={4}
                    className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm focus:border-black focus:outline-none"
                    value={draft.preview}
                    onChange={(event) =>
                      setDraft((prev) => ({ ...prev, preview: event.target.value }))
                    }
                    placeholder="Share the context and next steps..."
                    required
                  />
                </label>

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
                    Send Message
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

export default Inbox;
