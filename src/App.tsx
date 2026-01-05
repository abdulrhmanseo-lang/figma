import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LandingPage } from './pages/LandingPage';
import { FeaturesPage } from './pages/FeaturesPage';
import { PricingPage } from './pages/PricingPage';
import { UnitsPage } from './pages/UnitsPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';
import { Dashboard } from './pages/Dashboard';
import { Properties } from './pages/Properties';
import { Units } from './pages/Units';
import { Tenants } from './pages/Tenants';
import { Contracts } from './pages/Contracts';
import { Payments } from './pages/Payments';
import { Maintenance } from './pages/Maintenance';
import { Reports } from './pages/Reports';
import { ProfilePage } from './pages/ProfilePage';
import { Billing } from './pages/Billing';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { Employees } from './pages/Employees';
import { Tasks } from './pages/Tasks';
import { Sales } from './pages/Sales';
import { Settings } from './components/Settings';
import { EmployeeLoginPage } from './pages/EmployeeLoginPage';
import { EmployeeDashboard } from './pages/EmployeeDashboard';
import { EmployeeLayout } from './components/layout/EmployeeLayout';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Toaster } from 'sonner';

function App() {
  return (
    <div dir="rtl" className="font-cairo">
      <AuthProvider>
        <DataProvider>
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
          <Toaster position="top-center" richColors />
        </DataProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
