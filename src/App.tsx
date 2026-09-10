import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import AppLayout from './components/layout/AppLayout';
import LoadingSpinner from './components/common/LoadingSpinner';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const IncidentsPage = lazy(() => import('./pages/IncidentsPage'));
const IncidentDetailPage = lazy(() => import('./pages/IncidentDetailPage'));
const AlertsPage = lazy(() => import('./pages/AlertsPage'));
const LogFeedPage = lazy(() => import('./pages/LogFeedPage'));
const RulesPage = lazy(() => import('./pages/RulesPage'));
const PlaybooksPage = lazy(() => import('./pages/PlaybooksPage'));
const AuditLogPage = lazy(() => import('./pages/AuditLogPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route element={<ProtectedRoute><DataProvider><AppLayout /></DataProvider></ProtectedRoute>}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/incidents" element={<IncidentsPage />} />
          <Route path="/incidents/:id" element={<IncidentDetailPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/logs" element={<LogFeedPage />} />
          <Route path="/rules" element={<RulesPage />} />
          <Route path="/playbooks" element={<PlaybooksPage />} />
          <Route path="/audit" element={<AuditLogPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}