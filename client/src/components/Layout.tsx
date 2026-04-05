import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  Search, Map, ListChecks, PhoneCall, MessageSquare,
  BarChart3, Settings, LogOut, Home
} from 'lucide-react';
import './Layout.css';

const navItems = [
  { to: '/', icon: Home, label: 'Dashboard' },
  { to: '/search', icon: Search, label: 'Property Search' },
  { to: '/map', icon: Map, label: 'Map View' },
  { to: '/lists', icon: ListChecks, label: 'Lead Lists' },
  { to: '/dialer', icon: PhoneCall, label: 'Dialer' },
  { to: '/sms', icon: MessageSquare, label: 'SMS' },
  { to: '/campaigns', icon: BarChart3, label: 'Campaigns' },
];

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1 className="logo">PropLead</h1>
          <span className="logo-sub">Lead Generation</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'nav-item-active' : ''}`
              }
            >
              <Icon size={20} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <NavLink to="/settings" className="nav-item">
            <Settings size={20} />
            <span>Settings</span>
          </NavLink>
          <button className="nav-item logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
          <div className="user-info">
            <div className="user-email">{user?.email}</div>
            <div className="user-tier">{user?.subscription_tier} plan</div>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
