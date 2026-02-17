import { useEffect, useState } from 'react';
import { useCustomization } from '../contexts/CustomizationContext';
import { getSubdomainSlug } from '../utils/subdomainDetector';
import HeroSection from '../components/sections/HeroSection';
import AboutSection from '../components/sections/AboutSection';
import {
  CategoriesSection,
  TimelineSection,
  PrizesSection,
  JurySection,
  InstagramSection,
  ContactSection,
  FooterSection,
} from '../components/sections/AllSections';
import DocumentationSection from '../components/sections/DocumentationSection';
import SponsorsSection from '../components/sections/SponsorsSection';
import { toast } from 'react-toastify';

const SubdomainLandingPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [configData, setConfigData] = useState(null);
  const [debugInfo, setDebugInfo] = useState({});
  const {
    setCustomColors,
    setImages,
    setLayouts,
    setSectionVisibility,
    setHeroText,
    setAboutText,
    setCategoriesText,
    setCategoriesCards,
    setTimelineText,
    setTimelineCards,
    setPrizesText,
    setJuryText,
    setDocumentationText,
    setInstagramText,
    setSponsorsText,
    setContactText,
    setFaqCards,
    sectionVisibility
  } = useCustomization();

  useEffect(() => {
    const fetchConfigurationBySubdomain = async () => {
      try {
        const slug = getSubdomainSlug();
        const hostname = window.location.hostname;

        // DEBUG: Capture debug information
        setDebugInfo({
          hostname,
          slug,
          fullUrl: window.location.href,
          timestamp: new Date().toISOString()
        });

        if (!slug) {
          // REDIRECT DISABLED FOR DEBUGGING
          // window.location.href = 'https://webbuild.arachnova.id';
          setError('No subdomain detected');
          setLoading(false);
          return;
        }

        // Fetch configuration by slug from backend
        const apiUrl = `https://webbuild.arachnova.id/api/configurations/public/${slug}`;
        setDebugInfo(prev => ({ ...prev, apiUrl }));

        const response = await fetch(apiUrl);

        setDebugInfo(prev => ({
          ...prev,
          responseStatus: response.status,
          responseOk: response.ok
        }));

        if (!response.ok) {
          if (response.status === 404) {
            // REDIRECT DISABLED FOR DEBUGGING
            // window.location.href = 'https://webbuild.arachnova.id';
            const errorText = await response.text();
            setDebugInfo(prev => ({ ...prev, errorResponse: errorText }));
            setError(`Configuration not found for slug: "${slug}"`);
            setLoading(false);
            return;
          }
          throw new Error(`HTTP ${response.status}: Failed to fetch configuration`);
        }

        const data = await response.json();
        setConfigData(data);

        setDebugInfo(prev => ({
          ...prev,
          configId: data.id,
          configName: data.name
        }));

        // Apply configuration to customization context
        setCustomColors(data.customColors);
        setImages(data.images || null);
        setLayouts(data.layouts);
        setSectionVisibility(data.sectionVisibility);

        // Set all text content
        if (data.heroText) setHeroText(data.heroText);
        if (data.aboutText) setAboutText(data.aboutText);
        if (data.categoriesText) setCategoriesText(data.categoriesText);
        if (data.categoriesCards) setCategoriesCards(data.categoriesCards);
        if (data.timelineText) setTimelineText(data.timelineText);
        if (data.timelineCards) setTimelineCards(data.timelineCards);
        if (data.prizesText) setPrizesText(data.prizesText);
        if (data.juryText) setJuryText(data.juryText);
        if (data.documentationText) setDocumentationText(data.documentationText);
        if (data.instagramText) setInstagramText(data.instagramText);
        if (data.sponsorsText) setSponsorsText(data.sponsorsText);
        if (data.contactText) setContactText(data.contactText);
        if (data.faqCards) setFaqCards(data.faqCards);

        // Set page title
        document.title = data.name || 'Event Landing Page';

        setLoading(false);
      } catch (err) {
        console.error('Error loading configuration:', err);
        setError(err.message);
        setDebugInfo(prev => ({ ...prev, errorMessage: err.message, errorStack: err.stack }));
        setLoading(false);

        // REDIRECT DISABLED FOR DEBUGGING
        // setTimeout(() => {
        //   window.location.href = 'https://webbuild.arachnova.id';
        // }, 3000);
      }
    };

    fetchConfigurationBySubdomain();
  }, [setCustomColors, setImages, setLayouts, setSectionVisibility, setHeroText, setAboutText, setCategoriesText, setCategoriesCards, setTimelineText, setTimelineCards, setPrizesText, setJuryText, setDocumentationText, setInstagramText, setSponsorsText, setContactText, setFaqCards]);

  // Smooth scroll for anchor links and handle empty links with toast
  useEffect(() => {
    const handleAnchorClick = (e) => {
      const target = e.target.closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      const isTargetBlank = target.getAttribute('target') === '_blank';

      // Handle links with # or empty href
      if (!href || href === '#' || href.trim() === '') {
        e.preventDefault();
        
        // Show toast notification for links that would open in new tab
        if (isTargetBlank || !href || href === '#') {
          toast.info('Content not Available Yet', {
            position: "top-center",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        }
        return;
      }

      // Handle smooth scroll for valid anchor links (starting with #)
      if (href.startsWith('#')) {
        e.preventDefault();
        const element = document.querySelector(href);
        if (element) {
          const offset = 80;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - offset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth',
          });
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);
    return () => document.removeEventListener('click', handleAnchorClick);
  }, []);

  // Update favicon dynamically based on event logo
  useEffect(() => {
    if (configData?.images?.logo) {
      // Get or create favicon link element
      let link = document.querySelector("link[rel*='icon']") || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'icon';
      link.href = configData.images.logo;
      
      // Remove existing favicon if any
      const existingFavicon = document.querySelector("link[rel*='icon']");
      if (existingFavicon) {
        document.head.removeChild(existingFavicon);
      }
      
      // Add the new favicon
      document.head.appendChild(link);
    }
  }, [configData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your event page...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-6xl mb-4 text-center">🐛</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">Configuration Not Found</h1>
          <p className="text-red-600 mb-6 text-center font-semibold">{error}</p>

          <div className="bg-gray-100 rounded-lg p-4 mb-4">
            <h2 className="font-bold text-lg mb-3">🔍 Debug Information:</h2>
            <div className="space-y-2 text-sm font-mono">
              <div><strong>Hostname:</strong> {debugInfo.hostname}</div>
              <div><strong>Detected Slug:</strong> {debugInfo.slug || 'null'}</div>
              <div><strong>Full URL:</strong> {debugInfo.fullUrl}</div>
              <div><strong>API URL:</strong> {debugInfo.apiUrl || 'N/A'}</div>
              <div><strong>Response Status:</strong> {debugInfo.responseStatus || 'N/A'}</div>
              {debugInfo.errorResponse && (
                <div><strong>Error Response:</strong> <pre className="mt-2 bg-white p-2 rounded text-xs overflow-auto">{debugInfo.errorResponse}</pre></div>
              )}
              {debugInfo.errorMessage && (
                <div><strong>Error Message:</strong> {debugInfo.errorMessage}</div>
              )}
              <div><strong>Timestamp:</strong> {debugInfo.timestamp}</div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-bold mb-2">📋 Available Configurations:</h3>
            <p className="text-sm mb-2">Try accessing one of these slugs:</p>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li><a href="https://tes.webbuild.arachnova.id" className="text-blue-600 hover:underline">tes.webbuild.arachnova.id</a></li>
              <li><a href="https://summer-music-festival-2025.webbuild.arachnova.id" className="text-blue-600 hover:underline">summer-music-festival-2025.webbuild.arachnova.id</a></li>
              <li><a href="https://tech-conference-2025.webbuild.arachnova.id" className="text-blue-600 hover:underline">tech-conference-2025.webbuild.arachnova.id</a></li>
              <li><a href="https://pioneers-2025.webbuild.arachnova.id" className="text-blue-600 hover:underline">pioneers-2025.webbuild.arachnova.id</a></li>
            </ul>
          </div>

          <div className="mt-6 text-center">
            <a href="https://webbuild.arachnova.id" className="text-blue-600 hover:underline">
              ← Back to main site
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="landing-page-container">
      {sectionVisibility.hero && <HeroSection />}
      {sectionVisibility.about && <AboutSection />}
      {sectionVisibility.categories && <CategoriesSection />}
      {sectionVisibility.timeline && <TimelineSection />}
      {sectionVisibility.prizes && <PrizesSection />}
      {sectionVisibility.jury && <JurySection />}
      {sectionVisibility.documentation && <DocumentationSection />}
      {sectionVisibility.instagram && <InstagramSection />}
      {sectionVisibility.sponsors && <SponsorsSection />}
      {sectionVisibility.contact && <ContactSection />}
      {sectionVisibility.footer && <FooterSection />}
    </div>
  );
};

export default SubdomainLandingPage;
