import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useCustomization } from '../contexts/CustomizationContext';
import LandingPage from './LandingPage';

const PreviewPage = () => {
  const { eventName } = useParams();
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { importSettings } = useCustomization();

  useEffect(() => {
    fetchAndLoadConfiguration();
  }, [eventName]);

  const fetchAndLoadConfiguration = async () => {
    try {
      setLoading(true);
      console.log('Fetching configurations from /api/configurations');

      // Fetch all configurations
      const response = await fetch('/api/configurations');
      console.log('Response status:', response.status);

      if (!response.ok) {
        throw new Error(`Failed to fetch configurations: ${response.status} ${response.statusText}`);
      }

      const configs = await response.json();
      console.log('Fetched configs:', configs);
      console.log('Looking for slug:', eventName);

      if (!Array.isArray(configs)) {
        throw new Error('Invalid response format from API');
      }

      // Find the configuration by converting name to slug format
      const foundConfig = configs.find((c) => {
        const slug = c.name.toLowerCase().replace(/\s+/g, '-');
        console.log(`Comparing slug "${slug}" with "${eventName.toLowerCase()}"`);
        return slug === eventName.toLowerCase();
      });

      if (!foundConfig) {
        console.error('Configuration not found. Available configs:', configs.map(c => ({
          name: c.name,
          slug: c.name.toLowerCase().replace(/\s+/g, '-')
        })));
        setError(`Configuration not found. Looking for: ${eventName}`);
        setLoading(false);
        return;
      }

      console.log('Found config:', foundConfig);
      setConfig(foundConfig);

      // Apply the configuration temporarily
      const settings = {
        theme: foundConfig.selectedTheme || 'theme1',
        layouts: foundConfig.layouts,
        customColors: foundConfig.customColors,
        images: foundConfig.images,
        sectionVisibility: foundConfig.sectionVisibility,
        heroText: foundConfig.heroText,
        aboutText: foundConfig.aboutText,
      };

      // Create a file-like object for import
      const blob = new Blob([JSON.stringify(settings)], { type: 'application/json' });
      const file = new File([blob], 'config.json', { type: 'application/json' });

      await importSettings(file);
      setLoading(false);
    } catch (err) {
      console.error('Error loading configuration:', err);
      setError(err.message || 'Failed to load configuration');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading configuration...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Configuration Not Found</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <a
            href="/saved"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Back to Saved Configurations
          </a>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Banner showing this is a preview */}
      <div className="bg-blue-600 text-white py-2 px-4 text-center text-sm font-medium">
        Preview Mode: {config?.name}
        <a
          href="/saved"
          className="ml-4 underline hover:text-blue-100"
        >
          Back to Saved Configurations
        </a>
      </div>
      <LandingPage />
    </div>
  );
};

export default PreviewPage;
