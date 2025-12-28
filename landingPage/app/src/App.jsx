import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CustomizationProvider, useCustomization } from './contexts/CustomizationContext';
import { useEffect } from 'react';
import Navigation from './components/Navigation';
import LandingPage from './pages/LandingPage';
import ConfigurationPage from './pages/ConfigurationPage';
import SavedPage from './pages/SavedPage';
import PreviewPage from './pages/PreviewPage';

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
  return (
    <CustomizationProvider>
      <Router>
        <ColorVariablesApplier />
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Landing Page without Navigation */}
            <Route path="/" element={<LandingPage />} />

            {/* Pages with Navigation */}
            <Route
              path="/configuration"
              element={
                <>
                  <Navigation />
                  <ConfigurationPage />
                </>
              }
            />
            <Route
              path="/saved"
              element={
                <>
                  <Navigation />
                  <SavedPage />
                </>
              }
            />
            <Route
              path="/saved/:eventName"
              element={<PreviewPage />}
            />
          </Routes>
        </div>
      </Router>
    </CustomizationProvider>
  );
}

export default App;
