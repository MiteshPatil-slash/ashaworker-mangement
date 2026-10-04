import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { DataProvider } from './context/DataContext';

// Layout Components
import AppNavbar from './components/layout/AppNavbar';
import AppSidebar from './components/layout/AppSidebar';
import NotificationsDrawer from './components/notifications/NotificationsDrawer';

// Auth Pages (Screens 1 & 2)
import LoginPage from './pages/auth/LoginPage';

// ASHA Worker Pages (Screens 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15)
import AshaDashboard from './pages/asha/dashboard/AshaDashboard';
import BeneficiaryListPage from './pages/asha/beneficiaries/BeneficiaryListPage';
import BeneficiaryProfilePage from './pages/asha/beneficiaries/BeneficiaryProfilePage';
import VisitsListPage from './pages/asha/visits/VisitsListPage';
import RecordVisitWizard from './pages/asha/visits/RecordVisitWizard';
import AlertsPage from './pages/asha/alerts/AlertsPage';
import NotificationCenter from './pages/asha/notifications/NotificationCenter';
import ReferralsPage from './pages/asha/referrals/ReferralsPage';
import HouseholdMapPage from './pages/asha/map/HouseholdMapPage';
import AshaReportsPage from './pages/asha/reports/AshaReportsPage';
import SettingsPage from './pages/settings/SettingsPage';

// Supervisor Pages (Screens 16, 17, 18)
import SupervisorDashboard from './pages/supervisor/SupervisorDashboard';
import AshaWorkersMonitor from './pages/supervisor/AshaWorkersMonitor';
import DocumentReviewPage from './pages/supervisor/DocumentReviewPage';
import HighRiskManagement from './pages/supervisor/HighRiskManagement';
import TasksManagement from './pages/supervisor/TasksManagement';

// Admin Pages (Screen 19)
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminVillagesPage from './pages/admin/AdminVillagesPage';

function AppLayout({ children }) {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Navbar matching reference design */}
      <AppNavbar onOpenNotifications={() => setIsNotificationsOpen(true)} />

      <div className="flex flex-1 overflow-hidden">
        {/* Navy Sidebar matching reference design */}
        <AppSidebar />

        {/* Content View */}
        <main className="flex-1 overflow-y-auto min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>

      {/* Notifications Drawer */}
      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </div>
  );
}

const HOME_BY_ROLE = { ASHA_WORKER: '/', SUPERVISOR: '/supervisor', ADMIN: '/admin' };

// Everyone must log in first. Also keeps each role inside its own section.
function ProtectedLayout({ children }) {
  const { isAuthenticated, currentRole } = useAuth();
  const { pathname } = useLocation();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const home = HOME_BY_ROLE[currentRole] || '/';
  const inAdmin = pathname.startsWith('/admin');
  const inSupervisor = pathname.startsWith('/supervisor');
  const allowed =
    currentRole === 'ADMIN' ? inAdmin || pathname === '/settings'
    : currentRole === 'SUPERVISOR' ? inSupervisor || pathname === '/settings'
    : !inAdmin && !inSupervisor;

  if (!allowed) return <Navigate to={home} replace />;
  return <AppLayout>{children}</AppLayout>;
}

function LoginRoute() {
  const { isAuthenticated, currentRole } = useAuth();
  if (isAuthenticated) return <Navigate to={HOME_BY_ROLE[currentRole] || '/'} replace />;
  return <LoginPage />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <DataProvider>
            <Routes>
              {/* Public Routes: Screens 1 & 2 */}
              <Route path="/login" element={<LoginRoute />} />

              {/* ASHA Worker Main Workflow */}
              <Route
                path="/"
                element={
                  <ProtectedLayout>
                    <AshaDashboard />
                  </ProtectedLayout>
                }
              />
              <Route
                path="/beneficiaries"
                element={
                  <ProtectedLayout>
                    <BeneficiaryListPage />
                  </ProtectedLayout>
                }
              />
              <Route
                path="/beneficiaries/:id"
                element={
                  <ProtectedLayout>
                    <BeneficiaryProfilePage />
                  </ProtectedLayout>
                }
              />
              <Route
                path="/visits"
                element={
                  <ProtectedLayout>
                    <VisitsListPage />
                  </ProtectedLayout>
                }
              />
              <Route
                path="/visits/record"
                element={
                  <ProtectedLayout>
                    <RecordVisitWizard />
                  </ProtectedLayout>
                }
              />
              <Route
                path="/alerts"
                element={
                  <ProtectedLayout>
                    <AlertsPage />
                  </ProtectedLayout>
                }
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedLayout>
                    <NotificationCenter />
                  </ProtectedLayout>
                }
              />
              <Route
                path="/referrals"
                element={
                  <ProtectedLayout>
                    <ReferralsPage />
                  </ProtectedLayout>
                }
              />
              <Route
                path="/map"
                element={
                  <ProtectedLayout>
                    <HouseholdMapPage />
                  </ProtectedLayout>
                }
              />
              <Route
                path="/reports"
                element={
                  <ProtectedLayout>
                    <AshaReportsPage />
                  </ProtectedLayout>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedLayout>
                    <SettingsPage />
                  </ProtectedLayout>
                }
              />

              {/* Supervisor Workflow */}
              <Route
                path="/supervisor"
                element={
                  <ProtectedLayout>
                    <SupervisorDashboard />
                  </ProtectedLayout>
                }
              />
              <Route
                path="/supervisor/workers"
                element={
                  <ProtectedLayout>
                    <AshaWorkersMonitor />
                  </ProtectedLayout>
                }
              />
              <Route
                path="/supervisor/documents"
                element={
                  <ProtectedLayout>
                    <DocumentReviewPage />
                  </ProtectedLayout>
                }
              />
              <Route
                path="/supervisor/high-risk"
                element={
                  <ProtectedLayout>
                    <HighRiskManagement />
                  </ProtectedLayout>
                }
              />
              <Route
                path="/supervisor/tasks"
                element={
                  <ProtectedLayout>
                    <TasksManagement />
                  </ProtectedLayout>
                }
              />
              <Route
                path="/supervisor/referrals"
                element={
                  <ProtectedLayout>
                    <ReferralsPage />
                  </ProtectedLayout>
                }
              />
              <Route
                path="/supervisor/reports"
                element={
                  <ProtectedLayout>
                    <AshaReportsPage />
                  </ProtectedLayout>
                }
              />

              {/* Admin Workflow */}
              <Route
                path="/admin"
                element={
                  <ProtectedLayout>
                    <AdminDashboard />
                  </ProtectedLayout>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedLayout>
                    <AdminUsersPage />
                  </ProtectedLayout>
                }
              />
              <Route
                path="/admin/villages"
                element={
                  <ProtectedLayout>
                    <AdminVillagesPage />
                  </ProtectedLayout>
                }
              />
              <Route
                path="/admin/reports"
                element={
                  <ProtectedLayout>
                    <AshaReportsPage />
                  </ProtectedLayout>
                }
              />

              {/* Fallback to Home */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </DataProvider>
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
