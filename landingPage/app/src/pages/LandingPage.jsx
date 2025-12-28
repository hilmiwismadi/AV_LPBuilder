import { useEffect } from 'react';
import { useCustomization } from '../contexts/CustomizationContext';
import ControlPanel from '../components/ControlPanel';
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

const LandingPage = () => {
  const { setIsPanelOpen } = useCustomization();

  useEffect(() => {
    // Keyboard shortcut Ctrl+K to toggle panel
    const handleKeyPress = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsPanelOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [setIsPanelOpen]);

  useEffect(() => {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (!href || href === '#') return;

        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          const offset = 80;
          const elementPosition = target.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - offset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth',
          });
        }
      });
    });
  }, []);

  return (
    <div className="min-h-screen">
      <ControlPanel />

      {/* All Sections */}
      <HeroSection />
      <AboutSection />
      <CategoriesSection />
      <TimelineSection />
      <PrizesSection />
      <JurySection />
      <DocumentationSection />
      <InstagramSection />
      <SponsorsSection />
      <ContactSection />
      <FooterSection />
    </div>
  );
};

export default LandingPage;
