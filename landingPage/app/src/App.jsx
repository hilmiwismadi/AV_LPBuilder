import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CustomizationProvider, useCustomization } from './contexts/CustomizationContext';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { RoleBasedRoute } from './components/auth/RoleBasedRoute';
import { useEffect } from 'react';
import { isMainDomain } from './utils/subdomainDetector';
import Navigation from './components/Navigation';
import LandingPage from './pages/LandingPage';
import ConfigurationPage from './pages/ConfigurationPage';
import SavedPage from './pages/SavedPage';
import PreviewPage from './pages/PreviewPage';
import DefaultHomePage from './pages/DefaultHomePage';
import SubdomainLandingPage from './pages/SubdomainLandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ManageClientsPage from './pages/ManageClientsPage';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Component to apply custom colors to CSS variables
function ColorVariablesApplier() {
  const { customColors } = useCustomization();

  useEffect(() => {
    document.documentElement.style.setProperty('--custom-color-1', customColors.color1);
    document.documentElement.style.setProperty('--custom-color-2', customColors.color2);
  }, [customColors]);

  return null;
}

function App() {
  const isMain = isMainDomain();

  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 600,
      once: false,
      mirror: true,
      offset: 120,
      easing: 'ease-in-out',
      anchorPlacement: 'center-bottom',
      disable: false,
    });

    // Add custom style for fade out effect
    const style = document.createElement('style');
    style.textContent = `
      [data-aos] {
        transition-property: transform, opacity;
      }
      [data-aos][data-aos].aos-animate {
        opacity: 1;
      }
      [data-aos]:not(.aos-animate) {
        opacity: 0;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // If this is a subdomain, only show the subdomain landing page (no auth required)
  if (!isMain) {
    return (
      <CustomizationProvider>
        <ColorVariablesApplier />
        <ToastContainer />
        <SubdomainLandingPage />
      </CustomizationProvider>
    );
  }

  // Main domain routing (webbuild.arachnova.id)
  return (
    <AuthProvider>
      <CustomizationProvider>
        <Router>
          <ColorVariablesApplier />
          <ToastContainer />
          <div className="min-h-screen bg-gray-50">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<DefaultHomePage />} />
              <Route path="/login" element={<LoginPage />} />

              {/* Protected routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />

              {/* Configuration - Create New */}
              <Route
                path="/configuration"
                element={
                  <ProtectedRoute>
                    <Navigation />
                    <ConfigurationPage />
                  </ProtectedRoute>
                }
              />

              {/* Configuration - Edit Existing */}
              <Route
                path="/configuration/:eventId"
                element={
                  <ProtectedRoute>
                    <Navigation />
                    <ConfigurationPage />
                  </ProtectedRoute>
                }
              />

              {/* Live Preview for iframe */}
              <Route
                path="/preview"
                element={
                  <ProtectedRoute>
                    <LandingPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/saved"
                element={
                  <ProtectedRoute>
                    <Navigation />
                    <SavedPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/saved/:eventName"
                element={
                  <ProtectedRoute>
                    <PreviewPage />
                  </ProtectedRoute>
                }
              />

              {/* Superadmin only routes */}
              <Route
                path="/manage-clients"
                element={
                  <ProtectedRoute>
                    <RoleBasedRoute allowedRoles={['SUPERADMIN']}>
                      <ManageClientsPage />
                    </RoleBasedRoute>
                  </ProtectedRoute>
                }
              />

              {/* Legacy routes */}
              <Route path="/builder" element={<Navigate to="/configuration" replace />} />

              {/* Catch all - redirect to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </CustomizationProvider>
    </AuthProvider>
  );
}

export default App;
