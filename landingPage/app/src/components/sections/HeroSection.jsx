import { useCustomization } from '../../contexts/CustomizationContext';
import { eventData } from '../../data/eventData';
import { getIcon } from '../../utils/iconMapper';

const HeroSection = () => {
  const { layouts, currentTheme, customColors, images, sectionVisibility, heroText } = useCustomization();
  const layout = layouts.hero;
  const { hero } = eventData;

  // Don't render if section is hidden
  if (!sectionVisibility.hero) {
    return null;
  }

  // Scroll to next section
  const scrollToNextSection = () => {
    const heroSection = document.querySelector('#hero');
    if (heroSection) {
      const nextSection = heroSection.nextElementSibling;
      if (nextSection) {
        nextSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Create custom gradient style from custom colors or hero background
  const heroBackgroundSrc = images.heroBackground;

  const customGradientStyle = heroBackgroundSrc
    ? {
        backgroundImage: `url(${heroBackgroundSrc})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }
    : {
        background: `linear-gradient(135deg, ${customColors.color1} 0%, ${customColors.color2} 100%)`,
      };

  // Use uploaded logo if available, otherwise use default
  const logoSrc = images.logo || hero.logo;

  // Layout 1: Centered
  if (layout === 'layout-1') {
    return (
      <section id="hero" style={customGradientStyle} className="min-h-screen flex items-center justify-center text-white relative overflow-hidden px-4">
        <div className="container mx-auto text-center z-10 py-20" data-aos="fade-zoom-in" data-aos-duration="1000">
          <div className="mb-6">
            <img
              src={logoSrc}
              alt="Event Logo"
              className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full mx-auto border-4 border-white/30 shadow-xl object-cover"
            />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-shadow px-4">{heroText.title}</h1>
          <p className="text-lg sm:text-xl md:text-2xl mb-8 opacity-90 px-4 max-w-3xl mx-auto">{heroText.tagline}</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 md:gap-10 mb-10 text-base sm:text-lg px-4">
            <p className="flex items-center justify-center gap-2">
              {getIcon('FaCalendar')} <span>{heroText.date}</span>
            </p>
            <a
              href={heroText.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 hover:underline cursor-pointer"
            >
              {getIcon('FaInstagram')} <span>{heroText.instagram}</span>
            </a>
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-4 px-4 mb-12">
            <a href={heroText.ctaPrimaryUrl} target="_blank" rel="noopener noreferrer" className="btn-primary bg-white text-gray-800 hover:bg-gray-100 w-full sm:w-auto text-center">
              {heroText.ctaPrimary}
            </a>
            <a href={heroText.ctaSecondaryUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary hover:bg-white hover:text-gray-800 w-full sm:w-auto text-center">
              {heroText.ctaSecondary}
            </a>
          </div>
          
        </div>
        <div className="absolute inset-0 opacity-10 hidden sm:block">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
      </section>
    );
  }

  // Layout 2: Split Screen
  if (layout === 'layout-2') {
    // Use uploaded poster if available
    const posterSrc = images.poster || hero.logo;

    return (
      <section id="hero" style={customGradientStyle} className="min-h-screen grid md:grid-cols-2 text-white relative">
        <div className="flex flex-col justify-center p-6 sm:p-8 md:p-12 lg:p-16 order-1" data-aos="fade-right" data-aos-duration="1000">
          <img src={logoSrc} alt="Event Logo" className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-xl mb-6 shadow-xl object-cover" />
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4">{heroText.title}</h1>
          <p className="text-base sm:text-lg md:text-xl mb-6 opacity-90">{heroText.tagline}</p>
          <div className="flex flex-col gap-3 sm:gap-4 mb-8 text-sm sm:text-base">
            <p className="flex items-center gap-2">
              {getIcon('FaCalendar')} <span>{heroText.date}</span>
            </p>
            <a
              href={heroText.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:underline cursor-pointer"
            >
              {getIcon('FaInstagram')} <span>{heroText.instagram}</span>
            </a>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <a href={heroText.ctaPrimaryUrl} target="_blank" rel="noopener noreferrer" className="btn-primary bg-white text-gray-800 hover:bg-gray-100 w-full sm:w-auto text-center">
              {heroText.ctaPrimary}
            </a>
            <a href={heroText.ctaSecondaryUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary hover:bg-white hover:text-gray-800 w-full sm:w-auto text-center">
              {heroText.ctaSecondary}
            </a>
          </div>
          
        </div>
        <div className="flex items-center justify-center p-6 sm:p-8 order-2 min-h-[300px] md:min-h-0" data-aos="fade-left" data-aos-duration="1000">
          {images.poster ? (
            <img
              src={posterSrc}
              alt="Event Poster"
              className="w-auto h-auto max-h-[600px] max-w-full rounded-2xl sm:rounded-3xl shadow-2xl object-contain"
            />
          ) : (
            <div className="w-64 h-96 bg-white/20 rounded-2xl sm:rounded-3xl shadow-2xl flex items-center justify-center border-2 border-white/30 border-dashed">
              <p className="text-white/60 text-center px-4">Poster Placeholder</p>
            </div>
          )}
        </div>
      </section>
    );
  }

  // Layout 3: Asymmetric
  // Layout 3: Asymmetric
  const photoSrc = images.photo;

  return (
    <section id="hero" style={customGradientStyle} className="min-h-screen flex items-center text-white relative overflow-hidden">
      {/* Mobile: Stacked layout with photo in middle */}
      <div className="flex flex-col md:hidden w-full p-6">
        {/* Top div: Logo, Title, Tagline */}
        <div className="flex flex-col items-center text-center z-10 mb-4" data-aos="fade-up" data-aos-duration="800">
          <img src={logoSrc} alt="Event Logo" className="w-20 h-20 rounded-2xl mb-4 shadow-xl object-cover" />
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 leading-tight">{heroText.title}</h1>
          <p className="text-base sm:text-lg">{heroText.tagline}</p>
        </div>

        {/* Middle: Event Photo */}
        {photoSrc ? (
          <div className="flex justify-center items-center my-4 z-10" data-aos="zoom-in" data-aos-duration="1000" data-aos-delay="200">
            <img
              src={photoSrc}
              alt="Event Photo"
              className="w-48 h-48 sm:w-64 sm:h-64 rounded-2xl shadow-2xl object-cover"
            />
          </div>
        ) : (
          <div className="flex justify-center items-center my-4 z-10">
            <div className="w-48 h-48 sm:w-64 sm:h-64 bg-white/10 rounded-2xl shadow-2xl border-2 border-white/30 border-dashed flex items-center justify-center">
              <p className="text-white/60 text-center px-4 text-sm">Photo Placeholder</p>
            </div>
          </div>
        )}
        
        {/* Bottom div: Date, Instagram, CTA */}
        <div className="flex flex-col items-center text-center z-10">
          <div className="flex flex-col gap-2 mb-6 text-sm sm:text-base">
            <p className="flex items-center gap-2">
              {getIcon('FaCalendar')} <span>{heroText.date}</span>
            </p>
            <a
              href={heroText.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:underline cursor-pointer"
            >
              {getIcon('FaInstagram')} <span>{heroText.instagram}</span>
            </a>
          </div>
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <a href={heroText.ctaPrimaryUrl} target="_blank" rel="noopener noreferrer" className="btn-primary bg-white text-gray-800 hover:bg-gray-100 text-center py-2 px-4 rounded-lg">
              {heroText.ctaPrimary}
            </a>
            <a href={heroText.ctaSecondaryUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary hover:bg-white hover:text-gray-800 text-center py-2 px-4 rounded-lg border border-white/30">
              {heroText.ctaSecondary}
            </a>
          </div>
        </div>
      </div>

      {/* Desktop: Original asymmetric layout */}
      <div className="hidden md:flex items-center relative overflow-hidden p-8 md:p-12 lg:p-16 w-full">
        <div className="max-w-2xl z-10" data-aos="fade-right" data-aos-duration="1000">
          <img src={logoSrc} alt="Event Logo" className="w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 rounded-2xl mb-6 shadow-xl object-cover" />
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">{heroText.title}</h1>
          <p className="text-base sm:text-lg md:text-xl mb-6">{heroText.tagline}</p>
          <div className="flex flex-col gap-3 mb-8 text-sm sm:text-base">
            <p className="flex items-center gap-2">
              {getIcon('FaCalendar')} <span>{heroText.date}</span>
            </p>
            <a
              href={heroText.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:underline cursor-pointer"
            >
              {getIcon('FaInstagram')} <span>{heroText.instagram}</span>
            </a>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <a href={heroText.ctaPrimaryUrl} target="_blank" rel="noopener noreferrer" className="btn-primary bg-white text-gray-800 hover:bg-gray-100 w-full sm:w-auto text-center">
              {heroText.ctaPrimary}
            </a>
            <a href={heroText.ctaSecondaryUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary hover:bg-white hover:text-gray-800 w-full sm:w-auto text-center">
              {heroText.ctaSecondary}
            </a>
          </div>
        </div>
        {photoSrc ? (
          <div className="absolute right-16 md:right-20 lg:right-24 top-1/2 -translate-y-1/2 w-[40vw] h-[40vw] max-h-[600px]" data-aos="fade-left" data-aos-duration="1000" data-aos-delay="200">
            <img
              src={photoSrc}
              alt="Event Photo"
              className="w-full h-full rounded-[3rem] shadow-2xl object-cover"
            />
          </div>
        ) : (
          <div className="absolute right-16 md:right-20 lg:right-24 top-1/2 -translate-y-1/2 w-[40vw] h-[40vw] max-h-[600px] flex items-center justify-center" data-aos="fade-left" data-aos-duration="1000" data-aos-delay="200">
            <div className="w-full h-full bg-white/10 rounded-[3rem] shadow-2xl border-2 border-white/30 border-dashed flex items-center justify-center">
              <p className="text-white/60 text-center px-4 text-lg">Photo Placeholder</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroSection;
