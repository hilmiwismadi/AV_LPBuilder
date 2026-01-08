import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useCustomization } from '../contexts/CustomizationContext';
import api from '../utils/axios';
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

      // Fetch configuration by slug using authenticated API
      const response = await api.get(`/configurations/by-slug/${eventName}`);
      const foundConfig = response.data;

      if (!foundConfig) {
        setError(`Configuration not found: ${eventName}`);
        setLoading(false);
        return;
      }

      setConfig(foundConfig);

      // Apply the configuration
      const settings = {
        theme: foundConfig.selectedTheme || 'theme1',
        layouts: foundConfig.layouts,
        customColors: foundConfig.customColors,
        images: foundConfig.images,
        sectionVisibility: foundConfig.sectionVisibility,
        heroText: foundConfig.heroText,
        aboutText: foundConfig.aboutText,
        categoriesText: foundConfig.categoriesText,
        categoriesCards: foundConfig.categoriesCards,
        timelineText: foundConfig.timelineText,
        timelineCards: foundConfig.timelineCards,
        prizesText: foundConfig.prizesText,
        juryText: foundConfig.juryText,
        documentationText: foundConfig.documentationText,
        instagramText: foundConfig.instagramText,
        sponsorsText: foundConfig.sponsorsText,
        contactText: foundConfig.contactText,
        faqCards: foundConfig.faqCards
      };

      // Create a file-like object for import
      const blob = new Blob([JSON.stringify(settings)], { type: 'application/json' });
      const file = new File([blob], 'config.json', { type: 'application/json' });

      await importSettings(file);
      setLoading(false);
    } catch (err) {
      console.error('Error loading configuration:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load configuration');
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

  const liveUrl = `https://${config.slug}.webbuild.arachnova.id`;

  return (
    <div>
      {/* Banner showing this is a preview */}
      <div className="bg-blue-600 text-white py-2 px-4 text-center text-sm font-medium flex items-center justify-center gap-4">
        <span>Preview Mode: {config?.name}</span>
        <a
          href="/saved"
          className="underline hover:text-blue-100"
        >
          Back to Saved
        </a>
        <a
          href={liveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white text-blue-600 px-3 py-1 rounded hover:bg-blue-50 font-medium"
        >
          View Live →
        </a>
      </div>
      <LandingPage />
    </div>
  );
};

export default PreviewPage;
