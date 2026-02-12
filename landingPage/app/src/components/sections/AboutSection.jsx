import { useState } from 'react';
import { useCustomization } from '../../contexts/CustomizationContext';
import { eventData } from '../../data/eventData';

const AboutSection = () => {
  const { layouts, currentTheme, images, sectionVisibility, customColors, aboutText } = useCustomization();
  const layout = layouts.about;
  const { about } = eventData;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Don't render if section is hidden
  if (!sectionVisibility.about) {
    return null;
  }

  const themeColor = `text-${currentTheme.primary}`;

  // Use uploaded poster if available, otherwise use default
  const posterSrc = images.poster || about.poster;

  // Create heading color from custom colors
  const headingStyle = {
    color: customColors.color1,
  };

  // Create gradient style for borders
  const gradientBorderStyle = {
    background: `linear-gradient(135deg, ${customColors.color1} 0%, ${customColors.color2} 100%)`,
  };

  // Collect active sub-sections (only those with both title and description)
  const subSections = [];
  if (aboutText.subTitle1 && aboutText.subDescription1) {
    subSections.push({ title: aboutText.subTitle1, content: aboutText.subDescription1 });
  }
  if (aboutText.subTitle2 && aboutText.subDescription2) {
    subSections.push({ title: aboutText.subTitle2, content: aboutText.subDescription2 });
  }
  if (aboutText.subTitle3 && aboutText.subDescription3) {
    subSections.push({ title: aboutText.subTitle3, content: aboutText.subDescription3 });
  }
  if (aboutText.subTitle4 && aboutText.subDescription4) {
    subSections.push({ title: aboutText.subTitle4, content: aboutText.subDescription4 });
  }

  // Modal component
  const PosterModal = () => (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/90 transition-opacity ${isModalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      onClick={() => {
        setIsModalOpen(false);
        setZoomLevel(1);
      }}
    >
      <button
        className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300 z-10"
        onClick={() => {
          setIsModalOpen(false);
          setZoomLevel(1);
        }}
      >
        ×
      </button>
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4 z-10">
        <button
          className="bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30"
          onClick={(e) => {
            e.stopPropagation();
            setZoomLevel(Math.max(0.5, zoomLevel - 0.25));
          }}
        >
          Zoom Out
        </button>
        <button
          className="bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30"
          onClick={(e) => {
            e.stopPropagation();
            setZoomLevel(1);
          }}
        >
          Reset
        </button>
        <button
          className="bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30"
          onClick={(e) => {
            e.stopPropagation();
            setZoomLevel(Math.min(3, zoomLevel + 0.25));
          }}
        >
          Zoom In
        </button>
      </div>
      <div className="overflow-auto max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
        <img
          src={posterSrc}
          alt="Event Poster"
          className="max-w-full h-auto transition-transform duration-300"
          style={{ transform: `scale(${zoomLevel})` }}
        />
      </div>
    </div>
  );

  // Layout 1: Side by Side
  if (layout === 'layout-1') {
    return (
      <>
        <PosterModal />
        <section id="about" className="py-12 sm:py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-[300px_1fr] lg:grid-cols-[400px_1fr] gap-8 md:gap-12 lg:gap-16 items-start">
              <div className="mx-auto md:mx-0 max-w-sm md:max-w-none relative p-1 rounded-2xl group cursor-pointer overflow-visible" onClick={() => setIsModalOpen(true)} data-aos="fade-up" data-aos-duration="800">
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                  style={gradientBorderStyle}
                />
                <img
                  src={posterSrc}
                  alt="Event Poster"
                  className="relative w-full rounded-2xl shadow-xl"
                />
              </div>
            <div data-aos="fade-up" data-aos-duration="800" data-aos-delay="200">
              <h2 className="section-title md:text-left">{aboutText.mainTitle}</h2>
              <div className="mb-6 md:mb-8">
                <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{aboutText.mainDescription}</p>
              </div>
              {subSections.map((sub, index) => (
                <div key={index} className={index < subSections.length - 1 ? 'mb-6 md:mb-8' : ''}>
                  <h3 className={`text-lg sm:text-xl font-bold mb-3 ${themeColor}`}>{sub.title}</h3>
                  <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{sub.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        </section>
      </>
    );
  }

  // Layout 2: Poster on Left, Boxes on Right with Gradient Border
  if (layout === 'layout-2') {
    return (
      <>
        <PosterModal />
        <section id="about" className="py-12 sm:py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="section-title" data-aos="fade-up">{aboutText.mainTitle}</h2>

            <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start">
              {/* Poster on Left - Sticky */}
              <div className="mx-auto md:mx-0 flex-shrink-0 w-full max-w-xs sm:max-w-sm md:max-w-none md:w-80 lg:w-96 md:sticky md:top-24 md:h-fit relative p-1 rounded-2xl group cursor-pointer overflow-visible" onClick={() => setIsModalOpen(true)} data-aos="fade-right" data-aos-duration="800">
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                  style={gradientBorderStyle}
                />
                <img
                  src={posterSrc}
                  alt="Event Poster"
                  className="relative w-full rounded-2xl shadow-xl"
                />
              </div>

            {/* Boxes on Right */}
            <div className={`flex-1 grid gap-4 sm:gap-6 grid-cols-1 ${subSections.length === 1 ? 'content-center' : ''}`}>
              {/* Main Description Box */}
              <div className="relative p-1 rounded-xl group" data-aos="fade-left" data-aos-duration="800">
                <div
                  className="absolute inset-0 rounded-xl opacity-75 group-hover:opacity-100 transition-opacity"
                  style={gradientBorderStyle}
                />
                <div className="relative bg-white p-6 sm:p-8 rounded-xl">
                  <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{aboutText.mainDescription}</p>
                </div>
              </div>

              {/* Sub-section Boxes */}
              {subSections.map((sub, index) => (
                <div key={index} className="relative p-1 rounded-xl group" data-aos="fade-left" data-aos-duration="800" data-aos-delay={100 * (index + 1)}>
                  <div
                    className="absolute inset-0 rounded-xl opacity-75 group-hover:opacity-100 transition-opacity"
                    style={gradientBorderStyle}
                  />
                  <div className="relative bg-white p-6 sm:p-8 rounded-xl">
                    <h3 className={`text-lg sm:text-xl font-bold mb-3 sm:mb-4 ${themeColor}`}>{sub.title}</h3>
                    <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{sub.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        </section>
      </>
    );
  }

  // Layout 3: Poster 30% width, Box 65% width, No Overlap
  return (
    <>
      <PosterModal />
      <section id="about" className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="section-title" data-aos="fade-up">{aboutText.mainTitle}</h2>

          <div className="flex flex-col md:flex-row md:items-start gap-8 md:gap-[5%]">
            {/* Poster - 30% of screen width - Sticky */}
            <div className="mx-auto md:mx-0 flex-shrink-0 w-full max-w-xs sm:max-w-sm md:w-[30%] md:sticky md:top-24 md:h-fit relative p-1 rounded-2xl group cursor-pointer overflow-visible" onClick={() => setIsModalOpen(true)} data-aos="fade-right" data-aos-duration="800">
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                style={gradientBorderStyle}
              />
              <img
                src={posterSrc}
                alt="Event Poster"
                className="relative w-full rounded-2xl shadow-2xl"
              />
            </div>

          {/* Content Box - 65% of screen width */}
          <div className="bg-white p-6 sm:p-8 lg:p-12 rounded-2xl shadow-xl md:w-[65%]" data-aos="fade-left" data-aos-duration="800" data-aos-delay="200">
            <div className={`${subSections.length > 0 ? 'mb-5 sm:mb-6' : ''}`}>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base mb-4 sm:mb-6">{aboutText.mainDescription}</p>
            </div>
            {subSections.map((sub, index) => (
              <div key={index} className={index < subSections.length - 1 ? 'mb-5 sm:mb-6' : ''}>
                <h3 className={`text-lg sm:text-xl font-bold mb-3 ${themeColor}`}>{sub.title}</h3>
                <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{sub.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      </section>
    </>
  );
};

export default AboutSection;
