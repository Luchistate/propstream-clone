import { useAuthStore } from '../store/authStore';
import { Search, ListChecks, PhoneCall, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import './DashboardPage.css';

export default function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome back{user?.first_name ? `, ${user.first_name}` : ''}</h1>
        <p>Your real estate lead generation command center</p>
      </div>

      <div className="quick-actions">
        <Link to="/search" className="action-card">
          <Search size={32} />
          <h3>Property Search</h3>
          <p>Search 150M+ properties with 165+ filters</p>
        </Link>
        <Link to="/lists" className="action-card">
          <ListChecks size={32} />
          <h3>Lead Lists</h3>
          <p>Build and manage motivated seller lists</p>
        </Link>
        <Link to="/dialer" className="action-card">
          <PhoneCall size={32} />
          <h3>Dialer</h3>
          <p>Power dial leads from your cell phone</p>
        </Link>
        <Link to="/sms" className="action-card">
          <MessageSquare size={32} />
          <h3>SMS</h3>
          <p>Text leads and manage conversations</p>
        </Link>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-value">0</div>
          <div className="stat-label">Total Leads</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">0</div>
          <div className="stat-label">Skip Traced</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">0</div>
          <div className="stat-label">Calls Made</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">0</div>
          <div className="stat-label">SMS Sent</div>
        </div>
      </div>
    </div>
  );
}
