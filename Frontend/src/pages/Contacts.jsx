import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Mail, MapPin, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

const initialContacts = [
  {
    id: 'ct1',
    name: 'Meera Singh',
    role: 'Project Sponsor',
    company: 'Nimbus Finance',
    phone: '+1 415 222 9090',
    email: 'meera@nimbus.com',
    location: 'San Francisco, CA',
  },
  {
    id: 'ct2',
    name: 'Riya Das',
    role: 'Product Owner',
    company: 'Orion Health',
    phone: '+1 646 221 1223',
    email: 'riya@orionhealth.com',
    location: 'New York, NY',
  },
  {
    id: 'ct3',
    name: 'Dev Patel',
    role: 'Research Lead',
    company: 'Aperture Labs',
    phone: '+1 312 440 7788',
    email: 'dev@aperturelabs.com',
    location: 'Chicago, IL',
  },
  {
    id: 'ct4',
    name: 'Ava Martin',
    role: 'Operations',
    company: 'Nexa Retail',
    phone: '+1 512 640 1144',
    email: 'ava@nexaretail.com',
    location: 'Austin, TX',
  },
];

const Contacts = () => {
  const [contacts, setContacts] = useState(initialContacts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeContact, setActiveContact] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [viewContact, setViewContact] = useState(null);
  const [actionValues, setActionValues] = useState({
    subject: '',
    message: '',
    date: '',
    time: '',
  });
  const [formValues, setFormValues] = useState({
    name: '',
    role: '',
    company: '',
    phone: '',
    email: '',
    location: '',
  });

  const sortedContacts = useMemo(
    () => [...contacts].sort((a, b) => a.name.localeCompare(b.name)),
    [contacts]
  );

  const handleAddContact = (event) => {
    event.preventDefault();
    const trimmed = Object.fromEntries(
      Object.entries(formValues).map(([key, value]) => [key, value.trim()])
    );

    if (!trimmed.name || !trimmed.role || !trimmed.company || !trimmed.email) {
      toast.error('Please complete the required fields.');
      return;
    }

    const newContact = {
      id: `ct${Date.now()}`,
      ...trimmed,
      phone: trimmed.phone || 'Not provided',
      location: trimmed.location || 'Remote',
    };

    setContacts((prev) => [newContact, ...prev]);
    setIsModalOpen(false);
    setFormValues({
      name: '',
      role: '',
      company: '',
      phone: '',
      email: '',
      location: '',
    });
    toast.success('Contact added to your directory.');
  };

  const handleOpenAction = (contact, type) => {
    setActiveContact(contact);
    setActionType(type);
    setActionValues({
      subject: type === 'message' ? `Update for ${contact.name}` : '',
      message: '',
      date: '',
      time: '',
    });
  };

  const handleCloseAction = () => {
    setActiveContact(null);
    setActionType(null);
  };

  const handleOpenView = (contact) => {
    setViewContact(contact);
  };

  const handleCloseView = () => {
    setViewContact(null);
  };

  const handleSubmitAction = (event) => {
    event.preventDefault();
    if (!activeContact || !actionType) return;

    if (actionType === 'call') {
      if (!actionValues.date || !actionValues.time) {
        toast.error('Please select a date and time.');
        return;
      }
      toast.success(`Call scheduled with ${activeContact.name}`);
    } else {
      const trimmed = actionValues.message.trim();
      if (!trimmed) {
        toast.error('Please write a message.');
        return;
      }
      toast.success(`Message sent to ${activeContact.name}`);
    }

    handleCloseAction();
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
          <h1 className="text-3xl font-bold">Contacts</h1>
          <p className="text-gray-500 mt-2">Key stakeholder directory for leadership reviews.</p>
        </div>
        <motion.button
          className="px-5 py-3 bg-black text-white rounded-full font-semibold hover:bg-gray-900 transition"
          onClick={() => setIsModalOpen(true)}
          whileHover={{ scale: 1.03, y: -1 }}
          whileTap={{ scale: 0.97 }}
        >
          <span className="inline-flex items-center gap-2">
            <UserPlus size={16} /> Add Contact
          </span>
        </motion.button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {sortedContacts.map((contact, index) => (
          <motion.div
            key={contact.id}
            className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 * index }}
            whileHover={{ y: -4 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">{contact.name}</h2>
                <p className="text-sm text-gray-500">
                  {contact.role} · {contact.company}
                </p>
              </div>
              <button
                className="px-4 py-2 text-sm rounded-full border border-gray-200 hover:bg-gray-50"
                onClick={() => handleOpenView(contact)}
              >
                View
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-5 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Phone size={16} /> {contact.phone}
              </div>
              <div className="flex items-center gap-2">
                <Mail size={16} /> {contact.email}
              </div>
              <div className="flex items-center gap-2 col-span-2">
                <MapPin size={16} /> {contact.location}
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <motion.button
                className="flex-1 px-4 py-2 rounded-full bg-black text-white text-sm hover:bg-gray-900"
                onClick={() => handleOpenAction(contact, 'call')}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.96 }}
              >
                Schedule Call
              </motion.button>
              <motion.button
                className="flex-1 px-4 py-2 rounded-full border border-gray-200 text-sm hover:bg-gray-50"
                onClick={() => handleOpenAction(contact, 'message')}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.96 }}
              >
                Send Message
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {viewContact && (
          <motion.div
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseView}
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
                  <h2 className="text-xl font-semibold">{viewContact.name}</h2>
                  <p className="text-sm text-gray-500">
                    {viewContact.role} · {viewContact.company}
                  </p>
                </div>
                <button
                  className="text-sm text-gray-500 hover:text-gray-800"
                  onClick={handleCloseView}
                >
                  Close
                </button>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="rounded-2xl border border-gray-100 p-4">
                  <p className="text-xs text-gray-400">Phone</p>
                  <p className="mt-2 font-semibold text-gray-800">{viewContact.phone}</p>
                </div>
                <div className="rounded-2xl border border-gray-100 p-4">
                  <p className="text-xs text-gray-400">Email</p>
                  <p className="mt-2 font-semibold text-gray-800">{viewContact.email}</p>
                </div>
                <div className="rounded-2xl border border-gray-100 p-4 col-span-2">
                  <p className="text-xs text-gray-400">Location</p>
                  <p className="mt-2 font-semibold text-gray-800">{viewContact.location}</p>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  className="rounded-full border border-gray-200 px-4 py-2 text-sm"
                  onClick={handleCloseView}
                >
                  Close
                </button>
                <motion.button
                  className="rounded-full bg-black px-5 py-2 text-sm font-semibold text-white"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleOpenAction(viewContact, 'message')}
                >
                  Send Message
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
        {activeContact && actionType && (
          <motion.div
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseAction}
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
                  <h2 className="text-xl font-semibold">
                    {actionType === 'call' ? 'Schedule Call' : 'Send Message'}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {activeContact.name} · {activeContact.company}
                  </p>
                </div>
                <button
                  className="text-sm text-gray-500 hover:text-gray-800"
                  onClick={handleCloseAction}
                >
                  Close
                </button>
              </div>

              <form className="mt-5 space-y-4" onSubmit={handleSubmitAction}>
                {actionType === 'call' ? (
                  <div className="grid grid-cols-2 gap-4">
                    <label className="text-sm font-medium text-gray-600">
                      Date
                      <input
                        type="date"
                        className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm focus:border-black focus:outline-none"
                        value={actionValues.date}
                        onChange={(event) =>
                          setActionValues((prev) => ({ ...prev, date: event.target.value }))
                        }
                      />
                    </label>
                    <label className="text-sm font-medium text-gray-600">
                      Time
                      <input
                        type="time"
                        className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm focus:border-black focus:outline-none"
                        value={actionValues.time}
                        onChange={(event) =>
                          setActionValues((prev) => ({ ...prev, time: event.target.value }))
                        }
                      />
                    </label>
                  </div>
                ) : (
                  <>
                    <label className="text-sm font-medium text-gray-600">
                      Subject
                      <input
                        className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm focus:border-black focus:outline-none"
                        value={actionValues.subject}
                        onChange={(event) =>
                          setActionValues((prev) => ({ ...prev, subject: event.target.value }))
                        }
                      />
                    </label>
                    <label className="text-sm font-medium text-gray-600">
                      Message
                      <textarea
                        rows={4}
                        className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm focus:border-black focus:outline-none"
                        value={actionValues.message}
                        onChange={(event) =>
                          setActionValues((prev) => ({ ...prev, message: event.target.value }))
                        }
                        placeholder="Share the update or next steps..."
                      />
                    </label>
                  </>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    className="rounded-full border border-gray-200 px-4 py-2 text-sm"
                    onClick={handleCloseAction}
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="submit"
                    className="rounded-full bg-black px-5 py-2 text-sm font-semibold text-white"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    {actionType === 'call' ? 'Schedule' : 'Send'}
                  </motion.button>
                </div>
              </form>
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
                  <h2 className="text-xl font-semibold">Add Contact</h2>
                  <p className="text-sm text-gray-500">Capture key stakeholder details.</p>
                </div>
                <button
                  className="text-sm text-gray-500 hover:text-gray-800"
                  onClick={() => setIsModalOpen(false)}
                >
                  Close
                </button>
              </div>

              <form className="mt-5 space-y-4" onSubmit={handleAddContact}>
                <div className="grid grid-cols-2 gap-4">
                  <label className="text-sm font-medium text-gray-600">
                    Full Name *
                    <input
                      className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm focus:border-black focus:outline-none"
                      value={formValues.name}
                      onChange={(event) =>
                        setFormValues((prev) => ({ ...prev, name: event.target.value }))
                      }
                      placeholder="Jordan Lee"
                      required
                    />
                  </label>
                  <label className="text-sm font-medium text-gray-600">
                    Role *
                    <input
                      className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm focus:border-black focus:outline-none"
                      value={formValues.role}
                      onChange={(event) =>
                        setFormValues((prev) => ({ ...prev, role: event.target.value }))
                      }
                      placeholder="Product Sponsor"
                      required
                    />
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <label className="text-sm font-medium text-gray-600">
                    Company *
                    <input
                      className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm focus:border-black focus:outline-none"
                      value={formValues.company}
                      onChange={(event) =>
                        setFormValues((prev) => ({ ...prev, company: event.target.value }))
                      }
                      placeholder="Nimbus Finance"
                      required
                    />
                  </label>
                  <label className="text-sm font-medium text-gray-600">
                    Email *
                    <input
                      type="email"
                      className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm focus:border-black focus:outline-none"
                      value={formValues.email}
                      onChange={(event) =>
                        setFormValues((prev) => ({ ...prev, email: event.target.value }))
                      }
                      placeholder="jordan@company.com"
                      required
                    />
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <label className="text-sm font-medium text-gray-600">
                    Phone
                    <input
                      className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm focus:border-black focus:outline-none"
                      value={formValues.phone}
                      onChange={(event) =>
                        setFormValues((prev) => ({ ...prev, phone: event.target.value }))
                      }
                      placeholder="+1 415 555 0141"
                    />
                  </label>
                  <label className="text-sm font-medium text-gray-600">
                    Location
                    <input
                      className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm focus:border-black focus:outline-none"
                      value={formValues.location}
                      onChange={(event) =>
                        setFormValues((prev) => ({ ...prev, location: event.target.value }))
                      }
                      placeholder="San Francisco, CA"
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
                    Add Contact
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

export default Contacts;
