import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { Navbar } from './components/layout/Navbar';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

// Lazy-loaded pages
const AuthPage = lazy(() => import('./pages/auth/index'));
const StudentAuthPage = lazy(() => import('./pages/auth/student'));
const AdminAuthPage = lazy(() => import('./pages/auth/admin'));
const ScannerPage = lazy(() => import('./pages/scanner'));
const CommandCenter = lazy(() => import('./pages/dashboards'));
const StudentDashboardPage = lazy(() => import('./pages/dashboards').then(module => ({ default: module.StudentDashboard })));

// Placeholder pages (to be fully built in later prompts)
const PlaceholderPage: React.FC<{ title: string; subtitle: string }> = ({
  title,
  subtitle,
}) => (
  <div className="min-h-[calc(100vh-56px)] flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-2xl font-bold text-white mb-2">{title}</h1>
      <p className="text-sm text-muted">{subtitle}</p>
    </div>
  </div>
);

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-surface-primary flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <p className="text-xs text-muted font-mono">Loading...</p>
      </div>
    </div>
  );
}

function StudentDashboardWrapper() {
  const { user } = useAuth();
  return <StudentDashboardPage userId={user?.id || ''} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Auth routes — no navbar */}
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/auth/student" element={<StudentAuthPage />} />
            <Route path="/auth/admin" element={<AdminAuthPage />} />

            {/* App routes — with navbar */}
            <Route
              path="/*"
              element={
                <div className="min-h-screen bg-surface-primary">
                  <Navbar />
                  <Suspense fallback={<LoadingFallback />}>
                    <Routes>
                      {/* Landing */}
                      <Route
                        path="/"
                        element={
                          <PlaceholderPage
                            title="AcroHive"
                            subtitle="Smart Campus Event Operating System"
                          />
                        }
                      />

                      {/* Events — auth guard (any role) */}
                      <Route
                        path="/events"
                        element={
                          <ProtectedRoute>
                            <PlaceholderPage
                              title="Events Directory"
                              subtitle="Browse and register for campus events"
                            />
                          </ProtectedRoute>
                        }
                      />

                      {/* My Tickets — student only */}
                      <Route
                        path="/tickets"
                        element={
                          <ProtectedRoute
                            requiredRole="student"
                            redirectTo="/auth/student"
                          >
                            <StudentDashboardWrapper />
                          </ProtectedRoute>
                        }
                      />

                      {/* Scanner — any logged-in user */}
                      <Route
                        path="/scanner"
                        element={
                          <ProtectedRoute redirectTo="/auth">
                            <ScannerPage />
                          </ProtectedRoute>
                        }
                      />

                      {/* AI Suite — any logged-in user */}
                      <Route
                        path="/ai"
                        element={
                          <ProtectedRoute>
                            <PlaceholderPage
                              title="AI Suite"
                              subtitle="AI-powered campus tools"
                            />
                          </ProtectedRoute>
                        }
                      />

                      {/* Command Center — admin only */}
                      <Route
                        path="/command"
                        element={
                          <ProtectedRoute
                            requiredRole="admin"
                            redirectTo="/auth/admin"
                          >
                            <CommandCenter />
                          </ProtectedRoute>
                        }
                      />

                      {/* Catch-all */}
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </Suspense>
                </div>
              }
            />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}
