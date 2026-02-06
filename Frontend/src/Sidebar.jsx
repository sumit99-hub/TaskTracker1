import { useEffect, useState } from 'react';
import { LayoutDashboard, Users, Briefcase, Mail, Contact, UserRound, ShieldCheck } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import logo from './assets/logo.png';

const Sidebar = () => {
  const [leadName, setLeadName] = useState('Sumit Kumar Sah');
  const [accessLevel, setAccessLevel] = useState('Admin');
  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20}/>, path: '/' },
    { name: 'Clients', icon: <Users size={20}/>, path: '/clients' },
    { name: 'Task manager', icon: <Briefcase size={20}/>, path: '/tasks' },
    { name: 'Inbox', icon: <Mail size={20}/>, path: '/inbox' },
    { name: 'Contacts', icon: <Contact size={20}/>, path: '/contacts' },
    { name: 'Profile', icon: <UserRound size={20} />, path: '/profile' },
  ];

  const navItems =
    accessLevel === 'Admin'
      ? [...menuItems, { name: 'Admin', icon: <ShieldCheck size={20} />, path: '/admin' }]
      : menuItems;

  useEffect(() => {
    const updateLeadName = () => {
      const stored = localStorage.getItem('profile');
      if (stored) {
        const parsed = JSON.parse(stored);
        setLeadName(parsed.name || 'Sumit Kumar Sah');
        setAccessLevel(parsed.accessLevel || 'Member');
      }
    };

    updateLeadName();
    window.addEventListener('profile:updated', updateLeadName);
    return () => window.removeEventListener('profile:updated', updateLeadName);
  }, []);

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-100 flex flex-col p-6 fixed left-0 top-0">
      <div className="flex items-center gap-3 mb-12">
        <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-300 flex items-center justify-center bg-white">
          <img src={logo} alt="Task Tracker logo" className="w-full h-full object-contain" />
        </div>
        <h1 className="font-bold text-sm leading-tight tracking-tighter uppercase">Task <br/> Tracker</h1>
      </div>

      <nav className="flex flex-col gap-4 flex-1">
        {navItems.map((item) => (
          <NavLink 
            key={item.name} 
            to={item.path}
            className={({ isActive }) => `flex items-center gap-4 px-2 py-2 transition-all ${isActive ? 'text-black font-bold border-l-4 border-black' : 'text-gray-500 hover:text-black'}`}
          >
            {item.icon}
            <span className="text-sm">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-8 p-4 rounded-2xl bg-gray-50 border border-gray-100">
        <p className="text-xs uppercase tracking-wide text-gray-400">Project Lead</p>
        <h3 className="font-semibold text-sm mt-2">{leadName}</h3>
        <p className="text-xs text-gray-500 mt-1">
          {accessLevel} access · Executive dashboard
        </p>
        <NavLink
          to="/profile"
          className="inline-flex items-center gap-2 text-xs font-semibold text-black mt-3"
        >
          Edit Profile →
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;
