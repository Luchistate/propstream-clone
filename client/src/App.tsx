import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { getMe } from './services/auth.service';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import SearchPage from './pages/SearchPage';
import PropertyDetailPage from './pages/PropertyDetailPage';
import ListsPage from './pages/ListsPage';
import ListDetailPage from './pages/ListDetailPage';
import DialerPage from './pages/DialerPage';
import SMSPage from './pages/SMSPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>{title}</h1>
      <p style={{ color: '#6b7280', marginTop: 8 }}>Coming soon in Phase 2+</p>
    </div>
  );
}

export default function App() {
  const { loadFromStorage, setAuth, isAuthenticated, token } = useAuthStore();

  useEffect(() => {
    loadFromStorage();
  }, []);

  // Load user data if we have a token but no user
  useEffect(() => {
    if (token && isAuthenticated) {
      getMe()
        .then((res) => setAuth(res.data, token))
        .catch(() => useAuthStore.getState().logout());
    }
  }, [token]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="map" element={<SearchPage />} />
        <Route path="lists" element={<ListsPage />} />
        <Route path="lists/:id" element={<ListDetailPage />} />
        <Route path="dialer" element={<DialerPage />} />
        <Route path="sms" element={<SMSPage />} />
        <Route path="campaigns" element={<PlaceholderPage title="Campaigns" />} />
        <Route path="settings" element={<PlaceholderPage title="Settings" />} />
        <Route path="property/:id" element={<PropertyDetailPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
