import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { LanguageProvider } from './context/LanguageContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LoadingScreen } from './components/ui/LoadingScreen';
import { TrialTimer } from './components/TrialTimer';
import { Toaster } from 'sonner';
import { Omnibox } from './components/Omnibox';

// Lazy load pages for better performance
const LandingPage = lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })));
const FeaturesPage = lazy(() => import('./pages/FeaturesPage').then(m => ({ default: m.FeaturesPage })));
const PricingPage = lazy(() => import('./pages/PricingPage').then(m => ({ default: m.PricingPage })));
const UnitsPage = lazy(() => import('./pages/UnitsPage').then(m => ({ default: m.UnitsPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then(m => ({ default: m.ContactPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then(m => ({ default: m.RegisterPage })));
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage').then(m => ({ default: m.VerifyEmailPage })));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));

// Dashboard pages
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Properties = lazy(() => import('./pages/Properties').then(m => ({ default: m.Properties })));
const Units = lazy(() => import('./pages/Units').then(m => ({ default: m.Units })));
const Tenants = lazy(() => import('./pages/Tenants').then(m => ({ default: m.Tenants })));
const Contracts = lazy(() => import('./pages/Contracts').then(m => ({ default: m.Contracts })));
const Payments = lazy(() => import('./pages/Payments').then(m => ({ default: m.Payments })));
const Maintenance = lazy(() => import('./pages/Maintenance').then(m => ({ default: m.Maintenance })));
const Reports = lazy(() => import('./pages/Reports').then(m => ({ default: m.Reports })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const Employees = lazy(() => import('./pages/Employees').then(m => ({ default: m.Employees })));
const Tasks = lazy(() => import('./pages/Tasks').then(m => ({ default: m.Tasks })));
const Sales = lazy(() => import('./pages/Sales').then(m => ({ default: m.Sales })));
const Settings = lazy(() => import('./components/Settings').then(m => ({ default: m.Settings })));

// Employee pages
const EmployeeLoginPage = lazy(() => import('./pages/EmployeeLoginPage').then(m => ({ default: m.EmployeeLoginPage })));
const EmployeeDashboard = lazy(() => import('./pages/EmployeeDashboard').then(m => ({ default: m.EmployeeDashboard })));
const EmployeeLayout = lazy(() => import('./components/layout/EmployeeLayout').then(m => ({ default: m.EmployeeLayout })));
const DashboardLayout = lazy(() => import('./components/layout/DashboardLayout').then(m => ({ default: m.DashboardLayout })));

// Preload critical routes after initial load for faster navigation
const preloadCriticalRoutes = () => {
  // Preload authentication pages
  import('./pages/LoginPage');
  import('./pages/RegisterPage');
  import('./pages/PricingPage');
  // Preload dashboard after a short delay
  setTimeout(() => {
    import('./pages/Dashboard');
    import('./components/layout/DashboardLayout');
  }, 1000);
};

function App() {
  // Preload critical routes after initial render
  useEffect(() => {
    preloadCriticalRoutes();
  }, []);

  return (
    <div dir="rtl" className="font-cairo">
      <AuthProvider>
        <LanguageProvider>
          <DataProvider>
            <Suspense fallback={<LoadingScreen />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/features" element={<FeaturesPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/units" element={<UnitsPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />

                {/* Legacy Dashboard Route - Redirect to /app */}
                <Route path="/dashboard" element={<Navigate to="/app" replace />} />

                {/* Protected App Routes */}
                <Route path="/app" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Dashboard />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/app/properties" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Properties />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/app/units" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Units />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/app/tenants" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Tenants />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/app/contracts" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Contracts />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/app/payments" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Payments />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/app/maintenance" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Maintenance />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/app/reports" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Reports />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/app/settings" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Settings />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <ProfilePage />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/app/employees" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Employees />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/app/tasks" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Tasks />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/app/sales" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Sales />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />

                {/* Employee Portal Routes */}
                <Route path="/employee/login" element={<EmployeeLoginPage />} />
                <Route path="/employee/dashboard" element={<EmployeeLayout><EmployeeDashboard /></EmployeeLayout>} />
                <Route path="/employee/properties" element={<EmployeeLayout><Properties /></EmployeeLayout>} />
                <Route path="/employee/units" element={<EmployeeLayout><Units /></EmployeeLayout>} />
                <Route path="/employee/tenants" element={<EmployeeLayout><Tenants /></EmployeeLayout>} />
                <Route path="/employee/contracts" element={<EmployeeLayout><Contracts /></EmployeeLayout>} />
                <Route path="/employee/payments" element={<EmployeeLayout><Payments /></EmployeeLayout>} />
                <Route path="/employee/maintenance" element={<EmployeeLayout><Maintenance /></EmployeeLayout>} />
                <Route path="/employee/reports" element={<EmployeeLayout><Reports /></EmployeeLayout>} />
                <Route path="/employee/tasks" element={<EmployeeLayout><Tasks /></EmployeeLayout>} />
              </Routes>
            </Suspense>
            <Toaster position="top-center" richColors />
            <TrialTimer />
            <Omnibox />
          </DataProvider>
        </LanguageProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
