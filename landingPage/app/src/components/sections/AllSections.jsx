import { useState, useEffect, useRef } from 'react';
import { useCustomization } from '../../contexts/CustomizationContext';
import { eventData } from '../../data/eventData';
import { getIcon } from '../../utils/iconMapper';

// Categories Section
export const CategoriesSection = () => {
  const { layouts, currentTheme, customColors, sectionVisibility, categoriesText, categoriesCards } = useCustomization();
  const layout = layouts.categories;
  const categories = categoriesCards;
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef(null);
  const autoSlideInterval = useRef(null);

  // Don't render if section is hidden
  if (!sectionVisibility.categories) {
    return null;
  }

  // Auto-slide functionality
  useEffect(() => {
    if (window.innerWidth < 768) { // Only on mobile
      autoSlideInterval.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % categories.length);
      }, 3000); // Auto-swipe every 3 seconds

      return () => {
        if (autoSlideInterval.current) {
          clearInterval(autoSlideInterval.current);
        }
      };
    }
  }, [categories.length]);

  // Scroll to current index
  useEffect(() => {
    if (carouselRef.current && window.innerWidth < 768) {
      const cardWidth = carouselRef.current.scrollWidth / categories.length;
      carouselRef.current.scrollTo({
        left: cardWidth * currentIndex,
        behavior: 'smooth'
      });
    }
  }, [currentIndex, categories.length]);

  // Navigation handlers
  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? categories.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % categories.length);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  // Create custom gradient style
  const customGradientStyle = {
    background: `linear-gradient(135deg, ${customColors.color1} 0%, ${customColors.color2} 100%)`,
  };

  const CategoryCard = ({ category, index }) => (
    <div className={`relative p-1 rounded-xl group overflow-visible transition-all duration-500 ${layout === 'layout-1' ? 'hover:-translate-y-3' : ''}`} data-aos="fade-up" data-aos-delay={(index || 0) * 100}>
      <div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={customGradientStyle}
      />
      <div className="relative bg-white p-8 rounded-xl shadow-lg">
        {/* Show image if available, otherwise show icon */}
        {category.image ? (
          <div className={`w-20 h-20 rounded-${layout === 'layout-3' ? '2xl' : 'full'} mx-auto mb-6 overflow-hidden`}>
            <img src={category.image} alt={category.title} className="w-full h-full object-cover" />
          </div>
        ) : (
          category.icon && category.icon !== 'None' && (
            <div style={customGradientStyle} className={`w-20 h-20 rounded-${layout === 'layout-3' ? '2xl' : 'full'} flex items-center justify-center text-white text-3xl mx-auto mb-6`}>
              {getIcon(category.icon)}
            </div>
          )
        )}
        <h3 className="text-xl font-bold mb-4 text-center">{category.title}</h3>
        <p className="text-gray-600 mb-6 text-center">{category.description}</p>
        {category.requirements && category.requirements.length > 0 && (
          <ul className="space-y-2 mb-6">
            {category.requirements.map((req, idx) => (
              <li key={idx} className="text-sm border-b border-gray-200 pb-2">
                <span className="font-semibold text-gray-800">{req.title}:</span>
                <span className="text-gray-600 ml-1">{req.description}</span>
              </li>
            ))}
          </ul>
        )}
        <a
          href={category.buttonUrl || '#'}
          target="_blank"
          rel="noopener noreferrer"
          style={{ borderColor: customColors.color1, color: customColors.color1 }}
          className="btn-outline w-full transition-colors block text-center"
          onMouseEnter={(e) => {
            e.currentTarget.style.background = customColors.color1;
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = customColors.color1;
          }}
        >
          Lihat Detail
        </a>
      </div>
    </div>
  );

  if (layout === 'layout-2') {
    return (
      <section id="categories" className="py-20 bg-white overflow-x-hidden">
        <div className="container mx-auto px-4" data-aos="fade-up">
          <h2 className="section-title">{categoriesText.sectionTitle}</h2>
          <p className="section-subtitle">Pilih kategori yang sesuai dengan keahlian Anda</p>
          <div className="max-w-4xl mx-auto space-y-6 overflow-x-hidden">
            {categories.map((cat, index) => (
              <div key={cat.id} className="bg-white p-6 rounded-xl shadow-lg flex items-center gap-6 hover:translate-x-3 transition-transform" data-aos="fade-up" data-aos-delay={(index || 0) * 100}>
                {/* Show image if available, otherwise show icon */}
                {cat.image ? (
                  <div className="w-24 h-24 rounded-2xl flex-shrink-0 overflow-hidden">
                    <img src={cat.image} alt={cat.title} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  cat.icon && cat.icon !== 'None' && (
                    <div style={customGradientStyle} className="w-24 h-24 rounded-2xl flex items-center justify-center text-white text-3xl flex-shrink-0">
                      {getIcon(cat.icon)}
                    </div>
                  )
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">{cat.title}</h3>
                  <p className="text-gray-600">{cat.description}</p>
                </div>
                <a href={cat.buttonUrl || '#'} target="_blank" rel="noopener noreferrer" style={{ borderColor: customColors.color1, color: customColors.color1 }} className="btn-outline px-6">Detail</a>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (layout === 'layout-3') {
    return (
      <section id="categories" className="py-20 bg-white relative overflow-x-hidden">
        {/* Animated Ornaments */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute top-10 left-10 w-64 h-64 rounded-full blur-3xl"
            style={{ background: `radial-gradient(circle, ${customColors.color1}40, transparent)`, animation: 'float-1 20s ease-in-out infinite' }}
          />
          <div
            className="absolute top-1/2 right-20 w-96 h-96 rounded-full blur-3xl"
            style={{ background: `radial-gradient(circle, ${customColors.color2}40, transparent)`, animation: 'float-2 25s ease-in-out infinite' }}
          />
          <div
            className="absolute bottom-20 left-1/3 w-80 h-80 rounded-full blur-3xl"
            style={{ background: `radial-gradient(circle, ${customColors.color1}40, transparent)`, animation: 'float-3 22s ease-in-out infinite' }}
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <h2 className="section-title">{categoriesText.sectionTitle}</h2>
          <p className="section-subtitle">Pilih kategori yang sesuai dengan keahlian Anda</p>

          {/* Desktop - Grid instead of horizontal scroll */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
            {categories.map((cat, index) => (
              <div key={cat.id}>
                <CategoryCard category={cat} index={index} />
              </div>
            ))}
          </div>

          {/* Mobile - Carousel with navigation */}
          <div className="md:hidden relative">
            <div
              ref={carouselRef}
              className="overflow-x-auto scrollbar-hide snap-x snap-mandatory"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <div className="flex gap-4 pb-4">
                {categories.map((cat, index) => (
                  <div key={cat.id} className="min-w-[85vw] snap-center">
                    <CategoryCard category={cat} index={index} />
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={goToPrevious}
                style={{ background: customColors.color1 }}
                className="w-12 h-12 rounded-full text-white flex items-center justify-center shadow-lg hover:opacity-80 transition-opacity"
              >
                {getIcon('FaChevronLeft')}
              </button>
              <button
                onClick={goToNext}
                style={{ background: customColors.color1 }}
                className="w-12 h-12 rounded-full text-white flex items-center justify-center shadow-lg hover:opacity-80 transition-opacity"
              >
                {getIcon('FaChevronRight')}
              </button>
            </div>

            {/* Pagination Dots */}
            <div className="flex justify-center gap-2 mt-4">
              {categories.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-2 rounded-full transition-all ${
                    currentIndex === index ? 'w-8' : 'w-2'
                  }`}
                  style={{
                    background: currentIndex === index ? customColors.color1 : '#D1D5DB'
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="categories" className="py-20 bg-white relative overflow-x-hidden">
      {/* Animated Ornaments */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-10 left-10 w-64 h-64 rounded-full blur-3xl"
          style={{ background: `radial-gradient(circle, ${customColors.color1}40, transparent)`, animation: 'float-1 20s ease-in-out infinite' }}
        />
        <div
          className="absolute top-1/2 right-20 w-96 h-96 rounded-full blur-3xl"
          style={{ background: `radial-gradient(circle, ${customColors.color2}40, transparent)`, animation: 'float-2 25s ease-in-out infinite' }}
        />
        <div
          className="absolute bottom-20 left-1/3 w-80 h-80 rounded-full blur-3xl"
          style={{ background: `radial-gradient(circle, ${customColors.color1}40, transparent)`, animation: 'float-3 22s ease-in-out infinite' }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <h2 className="section-title">Kategori Lomba</h2>
        <p className="section-subtitle">Pilih kategori yang sesuai dengan keahlian Anda</p>

        {/* Desktop view - Grid */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-h-[600px] overflow-y-auto overflow-x-hidden pr-2">
          {categories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>

        {/* Mobile view - Carousel */}
        <div className="md:hidden relative">
          <div
            ref={carouselRef}
            className="overflow-x-auto scrollbar-hide snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <div className="flex gap-4 pb-4">
              {categories.map((cat) => (
                <div key={cat.id} className="min-w-[85vw] snap-center">
                  <CategoryCard category={cat} />
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={goToPrevious}
              style={{ background: customColors.color1 }}
              className="w-12 h-12 rounded-full text-white flex items-center justify-center shadow-lg hover:opacity-80 transition-opacity"
            >
              {getIcon('FaChevronLeft')}
            </button>
            <button
              onClick={goToNext}
              style={{ background: customColors.color1 }}
              className="w-12 h-12 rounded-full text-white flex items-center justify-center shadow-lg hover:opacity-80 transition-opacity"
            >
              {getIcon('FaChevronRight')}
            </button>
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center gap-2 mt-4">
            {categories.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  currentIndex === index ? 'w-8' : 'w-2'
                }`}
                style={{
                  background: currentIndex === index ? customColors.color1 : '#D1D5DB'
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// Timeline Section
export const TimelineSection = () => {
  const { layouts, currentTheme, customColors, sectionVisibility, timelineText, timelineCards } = useCustomization();
  const layout = layouts.timeline;
  const timeline = timelineCards;

  // Don't render if section is hidden
  if (!sectionVisibility.timeline) {
    return null;
  }

  // Create custom gradient style
  const customGradientStyle = {
    background: `linear-gradient(135deg, ${customColors.color1} 0%, ${customColors.color2} 100%)`,
  };

  if (layout === 'layout-2') {
    const [activeDot, setActiveDot] = useState(0);
    const scrollContainerRef = useRef(null);

    const handleScroll = () => {
      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        const scrollLeft = container.scrollLeft;
        const cardWidth = container.offsetWidth * 0.85 + 16;
        const newIndex = Math.round(scrollLeft / cardWidth);
        setActiveDot(newIndex);
      }
    };

    const scrollToCard = (index) => {
      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        const cardWidth = container.offsetWidth * 0.85 + 16;
        container.scrollTo({
          left: cardWidth * index,
          behavior: 'smooth'
        });
      }
    };

    return (
      <section id="timeline" className="py-20 bg-gray-50" data-aos="fade-up">
        <div className="container mx-auto px-4">
          <h2 className="section-title">{timelineText.sectionTitle}</h2>
          <p className="section-subtitle">Jadwal lengkap pelaksanaan kompetisi</p>
          
          <div className="md:hidden">
            <div 
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory scrollbar-hide px-4 -mx-4"
            >
              {timeline.map((item, index) => (
                <div
                  key={item.id}
                  className="flex-shrink-0 w-[85vw] snap-center"
                  data-aos="fade-up"
                  data-aos-delay={(index || 0) * 100}
                >
                  <div className="relative p-1 rounded-xl group">
                    <div
                      className="absolute inset-0 rounded-xl opacity-20"
                      style={customGradientStyle}
                    />
                    <div className="relative bg-white p-6 rounded-xl shadow-lg">
                      <div className="flex items-center gap-4 mb-4">
                        {item.image ? (
                          <div className="w-16 h-16 rounded-full overflow-hidden shadow-lg border-2 border-white flex-shrink-0">
                            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          item.icon && item.icon !== 'None' && (
                            <div 
                              style={customGradientStyle} 
                              className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl shadow-lg border-2 border-white flex-shrink-0"
                            >
                              {getIcon(item.icon)}
                            </div>
                          )
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold mb-1 line-clamp-2">{item.title}</h3>
                          <p style={{ color: customColors.color1 }} className="text-sm font-semibold">{item.date}</p>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm line-clamp-3">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-2 mt-4">
              {timeline.map((_, index) => (
                <button
                  key={index}
                  onClick={() => scrollToCard(index)}
                  className="transition-all duration-300 rounded-full"
                  style={{
                    width: activeDot === index ? '24px' : '8px',
                    height: '8px',
                    backgroundColor: activeDot === index ? customColors.color1 : '#d1d5db',
                  }}
                  aria-label={`Go to timeline item ${index + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="hidden md:block max-w-3xl mx-auto relative pl-24 py-8">
            <div 
              style={{
                ...customGradientStyle,
                position: 'absolute',
                left: '2.5rem',
                top: '0',
                width: '4px',
                height: '100%',
                zIndex: 0
              }}
            ></div>
            
            {timeline.map((item, index) => (
              <div 
                key={item.id} 
                className="mb-16 relative timeline-item"
                style={{
                  opacity: 0,
                  transform: 'translateY(50px)',
                  animation: `fadeInUp 0.6s ease-out ${index * 0.15}s forwards`
                }}
              >
                <div 
                  className="timeline-icon"
                  style={{
                    position: 'absolute',
                    left: '-100px',
                    width: '80px',
                    height: '80px',
                    zIndex: 10
                  }}
                >
                  {item.image ? (
                    <div className="w-full h-full rounded-full overflow-hidden shadow-xl border-4 border-white">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    item.icon && item.icon !== 'None' && (
                      <div 
                        style={customGradientStyle} 
                        className="w-full h-full rounded-full flex items-center justify-center text-white text-2xl shadow-xl border-4 border-white"
                      >
                        {getIcon(item.icon)}
                      </div>
                    )
                  )}
                </div>

                <div className="relative p-1 rounded-xl group overflow-visible">
                  <div
                    className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300"
                    style={customGradientStyle}
                  />
                  <div className="relative bg-white p-6 rounded-xl shadow-lg group-hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-1">
                    <h3 className="text-xl font-bold mb-2 group-hover:scale-105 transition-transform">{item.title}</h3>
                    <p style={{ color: customColors.color1 }} className="font-semibold mb-3">{item.date}</p>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <style>{`
          @keyframes fadeInUp {
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes fadeIn {
            to {
              opacity: 1;
            }
          }
          
          .timeline-item:hover .timeline-icon {
            transform: scale(1.1) rotate(5deg);
            transition: transform 0.3s ease;
          }
          
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
      </section>
    );
  }
  if (layout === 'layout-3') {
    return (
      <section id="timeline" className="py-20 bg-gray-50" data-aos="fade-up">
        <div className="container mx-auto px-4">
          <h2 className="section-title">{timelineText.sectionTitle}</h2>
          <p className="section-subtitle">Jadwal lengkap pelaksanaan kompetisi</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[600px] overflow-y-auto pr-2">
            {timeline.map((item) => (
              <div key={item.id} className="relative p-1 rounded-xl group overflow-visible hover:-translate-y-2 transition-transform">
                <div
                  className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                  style={customGradientStyle}
                />
                <div className="relative bg-white p-8 rounded-xl shadow-lg">
                  {/* Show image if available, otherwise show icon */}
                  {item.image ? (
                    <div className="w-16 h-16 rounded-2xl overflow-hidden mb-6">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    item.icon && item.icon !== 'None' && (
                      <div style={customGradientStyle} className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl mb-6">
                        {getIcon(item.icon)}
                      </div>
                    )
                  )}
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p style={{ color: customColors.color1 }} className="font-semibold mb-4">{item.date}</p>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="timeline" className="py-20 bg-gray-50" data-aos="fade-up">
      <div className="container mx-auto px-4">
        <h2 className="section-title">Timeline Event</h2>
        <p className="section-subtitle">Jadwal lengkap pelaksanaan kompetisi</p>
        <div className="relative pt-12">
          <div style={customGradientStyle} className="absolute top-20 left-0 right-0 h-1 hidden lg:block"></div>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 max-h-[600px] overflow-y-auto pr-2">
            {timeline.map((item) => (
              <div key={item.id} className="text-center">
                {/* Show image if available, otherwise show icon */}
                {item.image ? (
                  <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-6 shadow-lg relative z-10">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  item.icon && item.icon !== 'None' && (
                    <div style={customGradientStyle} className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-6 shadow-lg relative z-10">
                      {getIcon(item.icon)}
                    </div>
                  )
                )}
                <h3 className="font-bold mb-2">{item.title}</h3>
                <p style={{ color: customColors.color1 }} className="text-sm font-semibold mb-2">{item.date}</p>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// Prizes Section - 3 DIFFERENT LAYOUTS
export const PrizesSection = () => {
  const { layouts, currentTheme, customColors, sectionVisibility, prizesText } = useCustomization();
  const layout = layouts.prizes;
  const { prizes } = eventData;

  // Don't render if section is hidden
  if (!sectionVisibility.prizes) {
    return null;
  }

  // Create custom gradient style from custom colors
  const customGradientStyle = {
    background: `linear-gradient(135deg, ${customColors.color1} 0%, ${customColors.color2} 100%)`,
  };

  // Layout 1: Centered Cards (Original)
  if (layout === 'layout-1') {
    return (
      <section id="prizes" className="py-20 bg-white" data-aos="zoom-in">
        <div className="container mx-auto px-4">
          <h2 className="section-title">{prizesText.sectionTitle}</h2>
          <p className="section-subtitle">Raih kesempatan memenangkan hadiah dan benefit menarik</p>
          <div style={customGradientStyle} className="text-white p-12 rounded-2xl text-center mb-12 shadow-xl">
            {getIcon('FaTrophy', 'text-5xl mx-auto mb-4')}
            <h3 className="text-2xl font-bold mb-2">Total Hadiah</h3>
            <p className="text-4xl lg:text-5xl font-bold mb-2">{prizesText.totalPrize}</p>
            <p className="opacity-90">{prizesText.prizeDescription}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {prizes.benefits.map((benefit) => (
              <div key={benefit.id} className="bg-white p-8 rounded-xl shadow-lg text-center hover:-translate-y-2 transition-transform border-2 border-gray-100">
                <div style={{ color: customColors.color1 }} className="text-4xl mb-4">{getIcon(benefit.icon)}</div>
                <h3 className="text-xl font-bold mb-4">{benefit.title}</h3>
                <p className="text-gray-600 whitespace-pre-line">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Layout 2: Split Layout with Sidebar
  if (layout === 'layout-2') {
    return (
      <section id="prizes" className="py-20 bg-white" data-aos="zoom-in">
        <div className="container mx-auto px-4">
          <h2 className="section-title">{prizesText.sectionTitle}</h2>
          <p className="section-subtitle">Raih kesempatan memenangkan hadiah dan benefit menarik</p>
          <div className="grid lg:grid-cols-[1fr_2fr] gap-8">
            {/* Left: Total Prize Card */}
            <div style={customGradientStyle} className="text-white p-10 rounded-2xl shadow-xl flex flex-col justify-center items-center text-center sticky top-24 h-fit">
              {getIcon('FaTrophy', 'text-6xl mb-6')}
              <h3 className="text-2xl font-bold mb-3">Total Hadiah</h3>
              <p className="text-5xl font-bold mb-3">{prizesText.totalPrize}</p>
              <p className="text-lg opacity-90">{prizesText.prizeDescription}</p>
            </div>

            {/* Right: Benefits List */}
            <div className="space-y-4">
              {prizes.benefits.map((benefit) => (
                <div key={benefit.id} className="bg-white p-6 rounded-xl shadow-lg flex items-start gap-6 hover:translate-x-2 transition-transform border-l-4" style={{ borderColor: customColors.color1 }}>
                  <div style={{ color: customColors.color1 }} className="text-4xl flex-shrink-0">
                    {getIcon(benefit.icon)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                    <p className="text-gray-600 whitespace-pre-line leading-relaxed">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Layout 3: Compact Icon Grid
  return (
    <section id="prizes" className="py-20 bg-white" data-aos="zoom-in">
      <div className="container mx-auto px-4">
        <h2 className="section-title">Hadiah & Benefit</h2>
        <p className="section-subtitle">Raih kesempatan memenangkan hadiah dan benefit menarik</p>
        <div style={customGradientStyle} className="text-white p-8 rounded-2xl text-center mb-10 shadow-xl max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-6">
            {getIcon('FaTrophy', 'text-4xl')}
            <div className="text-left">
              <h3 className="text-xl font-bold">Total Hadiah</h3>
              <p className="text-3xl font-bold">{prizesText.totalPrize}</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {prizes.benefits.map((benefit) => (
            <div key={benefit.id} className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl shadow-md hover:shadow-xl transition-all border border-gray-200">
              <div className="flex items-start gap-4">
                <div style={{ color: customColors.color1 }} className="text-3xl flex-shrink-0">
                  {getIcon(benefit.icon)}
                </div>
                <div>
                  <h3 className="font-bold mb-1 text-lg">{benefit.title}</h3>
                  <p className="text-gray-600 text-sm whitespace-pre-line">{benefit.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Jury Section - 3 DIFFERENT LAYOUTS
export const JurySection = () => {
  const { layouts, currentTheme, customColors, sectionVisibility, juryText } = useCustomization();
  const layout = layouts.jury;
  const { jury } = eventData;

  // Don't render if section is hidden
  if (!sectionVisibility.jury) {
    return null;
  }

  // Create custom gradient style from custom colors
  const customGradientStyle = {
    background: `linear-gradient(135deg, ${customColors.color1} 0%, ${customColors.color2} 100%)`,
  };

  // Layout 1: Grid with Photos on Top
  if (layout === 'layout-1') {
    return (
      <section id="jury" className="py-20 bg-gray-50" data-aos="fade-up">
        <div className="container mx-auto px-4">
          <h2 className="section-title">{juryText.sectionTitle}</h2>
          <p className="section-subtitle">Bertemu dengan para ahli dan profesional terkemuka</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {jury.map((person, index) => (
              <div key={person.id} className="bg-white rounded-xl overflow-hidden shadow-lg hover:-translate-y-3 transition-transform" data-aos="fade-up" data-aos-delay={(index || 0) * 100}>
                <div className="h-64 overflow-hidden">
                  <img src={person.image} alt={person.name} className="w-full h-full object-cover hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="p-6 text-center">
                  <h3 className="font-bold text-lg mb-2">{person.name}</h3>
                  <p className="text-gray-600 mb-4">{person.position}</p>
                  <div className="flex justify-center gap-3 pt-4 border-t">
                    <a href={person.social.linkedin} style={customGradientStyle} className="w-10 h-10 rounded-full flex items-center justify-center text-white hover:scale-125 transition-transform">
                      {getIcon('FaLinkedin')}
                    </a>
                    <a href={person.social.instagram} style={customGradientStyle} className="w-10 h-10 rounded-full flex items-center justify-center text-white hover:scale-125 transition-transform">
                      {getIcon('FaInstagram')}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Layout 2: Horizontal Cards (Side by Side)
  if (layout === 'layout-2') {
    return (
      <section id="jury" className="py-20 bg-gray-50" data-aos="fade-up">
        <div className="container mx-auto px-4">
          <h2 className="section-title">{juryText.sectionTitle}</h2>
          <p className="section-subtitle">Bertemu dengan para ahli dan profesional terkemuka</p>
          <div className="max-w-4xl mx-auto space-y-6">
            {jury.map((person, index) => (
              <div key={person.id} className="bg-white rounded-xl shadow-lg flex flex-col md:flex-row items-center gap-6 p-6 hover:shadow-xl transition-shadow" data-aos="fade-up" data-aos-delay={(index || 0) * 100}>
                <img src={person.image} alt={person.name} className="w-32 h-32 rounded-full object-cover flex-shrink-0 border-4 border-gray-200" />
                <div className="flex-1 text-center md:text-left">
                  <h3 className="font-bold text-xl mb-2">{person.name}</h3>
                  <p className="text-gray-600 mb-4">{person.position}</p>
                </div>
                <div className="flex gap-3">
                  <a href={person.social.linkedin} style={customGradientStyle} className="w-12 h-12 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform">
                    {getIcon('FaLinkedin', 'text-xl')}
                  </a>
                  <a href={person.social.instagram} style={customGradientStyle} className="w-12 h-12 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform">
                    {getIcon('FaInstagram', 'text-xl')}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Layout 3: Staggered with Circular Photos
  return (
    <section id="jury" className="py-20 bg-gray-50" data-aos="fade-up">
      <div className="container mx-auto px-4">
        <h2 className="section-title">Juri & Pembicara</h2>
        <p className="section-subtitle">Bertemu dengan para ahli dan profesional terkemuka</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {jury.map((person, idx) => (
            <div key={person.id} className={`bg-white p-8 rounded-xl shadow-lg text-center hover:scale-105 transition-transform ${idx % 2 === 1 ? 'mt-8' : ''}`}>
              <img src={person.image} alt={person.name} style={{ borderColor: customColors.color1 }} className="w-32 h-32 rounded-full mx-auto mb-6 object-cover border-4" />
              <h3 className="font-bold text-lg mb-2">{person.name}</h3>
              <p className="text-gray-600 mb-4 text-sm">{person.position}</p>
              <div className="flex justify-center gap-3">
                <a href={person.social.linkedin} style={customGradientStyle} className="w-10 h-10 rounded-full flex items-center justify-center text-white hover:rotate-[360deg] transition-transform duration-500">
                  {getIcon('FaLinkedin')}
                </a>
                <a href={person.social.instagram} style={customGradientStyle} className="w-10 h-10 rounded-full flex items-center justify-center text-white hover:rotate-[360deg] transition-transform duration-500">
                  {getIcon('FaInstagram')}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Instagram Section - 3 DIFFERENT LAYOUTS
export const InstagramSection = () => {
  const { layouts, customColors, sectionVisibility, images, instagramText } = useCustomization();
  const layout = layouts.instagram;
  const { instagram, about } = eventData;

  // Don't render if section is hidden
  if (!sectionVisibility.instagram) {
    return null;
  }

  // Use uploaded poster or default as fallback
  const posterSrc = images.poster || about.poster;

  // Use individual Instagram images or fallback to poster
  const instagramPosts = [
    images.instagram1 || posterSrc,
    images.instagram2 || posterSrc,
    images.instagram3 || posterSrc,
    images.instagram4 || posterSrc,
    images.instagram5 || posterSrc,
    images.instagram6 || posterSrc,
  ];

  // Use Instagram URL from Instagram Text
  const instagramUrl = instagramText.instagramUrl || instagram.url;

  // Create custom gradient style from custom colors
  const customGradientStyle = {
    background: `linear-gradient(135deg, ${customColors.color1} 0%, ${customColors.color2} 100%)`,
  };

  // Layout 1: 3x2 Grid with Decorative Circles
  if (layout === 'layout-1') {
    return (
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        {/* Decorative Background Circles */}
        <div style={{ background: `linear-gradient(135deg, ${customColors.color1}80 0%, ${customColors.color2}80 100%)` }} className="absolute top-32 -left-28 w-96 h-96 rounded-full blur-3xl opacity-30"></div>
        <div style={{ background: `linear-gradient(135deg, ${customColors.color2}80 0%, ${customColors.color1}80 100%)` }} className="absolute bottom-32 -right-36 w-[500px] h-[500px] rounded-full blur-3xl opacity-30"></div>

        <div className="container mx-auto px-4 relative z-10" data-aos="fade-up">
          <div className="max-w-6xl mx-auto">
            {/* Title and Tagline */}
            <div className="text-center mb-12">
              <div className="flex flex-col md:inline-flex md:flex-row items-center justify-center gap-2 md:gap-3 mb-4">
                {getIcon('FaInstagram', 'w-8 h-8 md:w-10 md:h-10', { color: customColors.color1 })}
                <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-gray-800">
                  Follow Us on Instagram
                </h2>
              </div>
              <p className="text-base md:text-xl text-gray-600 mb-6 px-4">
                {instagramText.tagline}
              </p>
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: customColors.color1 }}
                className="inline-flex items-center gap-2 hover:opacity-80 font-semibold text-base md:text-lg transition-opacity"
              >
                {instagramText.handle}
                {getIcon('FaExternalLinkAlt', 'w-4 h-4 md:w-5 md:h-5')}
              </a>
            </div>

            {/* Instagram Grid - 3x2 layout */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              {instagramPosts.map((post, index) => (
                <a
                  key={index}
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative aspect-[4/5] overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
                  data-aos="zoom-in"
                  data-aos-delay={(index || 0) * 100}
                >
                  <img
                    src={post}
                    alt={`Instagram post ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div style={customGradientStyle} className="absolute inset-0 opacity-0 group-hover:opacity-80 transition-opacity duration-300 flex items-center justify-center">
                    {getIcon('FaInstagram', 'w-12 h-12 text-white')}
                  </div>
                </a>
              ))}
            </div>

            {/* CTA Button */}
            <div className="text-center">
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={customGradientStyle}
                className="inline-flex items-center gap-3 px-8 py-4 text-white font-bold text-lg rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                {getIcon('FaInstagram', 'w-6 h-6')}
                View More on Instagram
                {getIcon('FaExternalLinkAlt', 'w-5 h-5')}
              </a>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Layout 2: Carousel Style
  if (layout === 'layout-2') {
    return (
      <section style={customGradientStyle} className="py-20 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-3 mb-4">
                {getIcon('FaInstagram', 'w-10 h-10 text-white')}
                <h2 className="text-4xl md:text-5xl font-bold">Follow Us on Instagram</h2>
              </div>
              <p className="text-xl opacity-90 mb-6">{instagram.tagline}</p>
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-white hover:underline font-semibold text-lg"
              >
                {instagramText.handle}
                {getIcon('FaExternalLinkAlt', 'w-5 h-5')}
              </a>
            </div>

            <div className="flex overflow-x-auto gap-4 pb-6 snap-x snap-mandatory mb-8 scrollbar-hide">
              {instagramPosts.map((post, index) => (
                <a
                  key={index}
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex-shrink-0 w-64 aspect-[4/5] overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 snap-start"
                >
                  <img
                    src={post}
                    alt={`Instagram post ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    {getIcon('FaInstagram', 'w-12 h-12 text-white')}
                  </div>
                </a>
              ))}
            </div>

            <div className="text-center">
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 bg-white text-gray-800 font-bold text-lg rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                {getIcon('FaInstagram', 'w-6 h-6')}
                View More on Instagram
                {getIcon('FaExternalLinkAlt', 'w-5 h-5')}
              </a>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Layout 3: Masonry Grid
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-4">
              {getIcon('FaInstagram', 'w-10 h-10', { color: customColors.color1 })}
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800">
                Follow Us on Instagram
              </h2>
            </div>
            <p className="text-xl text-gray-600 mb-6">{instagram.tagline}</p>
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: customColors.color1 }}
              className="inline-flex items-center gap-2 hover:opacity-80 font-semibold text-lg transition-opacity"
            >
              {instagramText.username || instagram.username || "@event"}
              {getIcon('FaExternalLinkAlt', 'w-5 h-5')}
            </a>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {instagramPosts.map((post, index) => (
              <a
                key={index}
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 ${
                  index === 0 || index === 5 ? 'md:col-span-2 md:row-span-2' : ''
                } ${index === 0 || index === 5 ? 'aspect-square' : 'aspect-[4/5]'}`}
              >
                <img
                  src={post}
                  alt={`Instagram post ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div style={customGradientStyle} className="absolute inset-0 opacity-0 group-hover:opacity-80 transition-opacity duration-300 flex items-center justify-center">
                  {getIcon('FaInstagram', 'w-12 h-12 text-white')}
                </div>
              </a>
            ))}
          </div>

          <div className="text-center">
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={customGradientStyle}
              className="inline-flex items-center gap-3 px-8 py-4 text-white font-bold text-lg rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              {getIcon('FaInstagram', 'w-6 h-6')}
              View More on Instagram
              {getIcon('FaExternalLinkAlt', 'w-5 h-5')}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

// Contact Section - 3 DIFFERENT LAYOUTS
export const ContactSection = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const { layouts, currentTheme, customColors, sectionVisibility, contactText, faqCards } = useCustomization();
  const layout = layouts.contact;
  const { contact } = eventData;

  // Don't render if section is hidden
  if (!sectionVisibility.contact) {
    return null;
  }

  // Create custom gradient style from custom colors
  const customGradientStyle = {
    background: `linear-gradient(135deg, ${customColors.color1} 0%, ${customColors.color2} 100%)`,
  };

  // Layout 1: Two Columns
  if (layout === 'layout-1') {
    return (
      <section id="contact" className="py-20 bg-white">
        <div className="container mx-auto px-4" data-aos="fade-up">
          <h2 className="section-title">{contactText.sectionTitle}</h2>
          <p className="section-subtitle">Hubungi kami untuk informasi lebih lanjut</p>
          <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-lg flex items-start gap-4 hover:-translate-y-2 transition-transform border-2 border-gray-100">
                <div style={{ color: customColors.color1 }} className="text-3xl">{getIcon('FaWhatsapp')}</div>
                <div>
                  <h3 className="font-bold text-lg mb-1">WhatsApp</h3>
                  <p className="text-gray-600 mb-3">{contactText.whatsapp}</p>
                  <a href={contactText.whatsappUrl || '#'} target="_blank" rel="noopener noreferrer" style={{ borderColor: customColors.color1, color: customColors.color1 }} className="btn-outline text-sm px-4 py-2 inline-block">
                    Chat Sekarang
                  </a>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg flex items-start gap-4 hover:-translate-y-2 transition-transform border-2 border-gray-100">
                <div style={{ color: customColors.color1 }} className="text-3xl">{getIcon('FaEnvelope')}</div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Email</h3>
                  <p className="text-gray-600 mb-3">{contactText.email}</p>
                  <a href={contactText.emailUrl || '#'} target="_blank" rel="noopener noreferrer" style={{ borderColor: customColors.color1, color: customColors.color1 }} className="btn-outline text-sm px-4 py-2 inline-block">
                    Kirim Email
                  </a>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg flex items-start gap-4 hover:-translate-y-2 transition-transform border-2 border-gray-100">
                <div style={{ color: customColors.color1 }} className="text-3xl">{getIcon('FaBook')}</div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Guidebook</h3>
                  <p className="text-gray-600 mb-3">Panduan lengkap kompetisi</p>
                  <a href={contactText.guidebookUrl || '#'} target="_blank" rel="noopener noreferrer" style={{ borderColor: customColors.color1, color: customColors.color1 }} className="btn-outline text-sm px-4 py-2 inline-block">
                    Download PDF
                  </a>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-6">FAQ - Frequently Asked Questions</h3>
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {faqCards.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(openFaq === item.id ? null : item.id)}
                      className="w-full p-5 flex justify-between items-center hover:bg-gray-50 transition-colors"
                    >
                      <h4 className="font-semibold text-left">{item.question}</h4>
                      <span style={{ color: customColors.color1 }} className={`transition-transform ${openFaq === item.id ? 'rotate-180' : ''}`}>▼</span>
                    </button>
                    <div className={`overflow-hidden transition-all ${openFaq === item.id ? 'max-h-48' : 'max-h-0'}`}>
                      <p className="p-5 pt-0 text-gray-600 leading-relaxed">{item.answer}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Layout 2: Cards Grid with FAQ Below
  if (layout === 'layout-2') {
    return (
      <section id="contact" className="py-20 bg-white">
        <div className="container mx-auto px-4" data-aos="fade-up">
          <h2 className="section-title">{contactText.sectionTitle}</h2>
          <p className="section-subtitle">Hubungi kami untuk informasi lebih lanjut</p>

          {/* Contact Cards Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-16 max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-xl shadow-lg text-center hover:-translate-y-3 transition-transform">
              <div style={{ color: customColors.color1 }} className="text-5xl mb-4">{getIcon('FaWhatsapp')}</div>
              <h3 className="font-bold text-lg mb-2">WhatsApp</h3>
              <p className="text-gray-600 text-sm mb-4">{contactText.whatsapp}</p>
              <a href={contactText.whatsappUrl || '#'} target="_blank" rel="noopener noreferrer" style={{ borderColor: customColors.color1, color: customColors.color1 }} className="btn-outline text-sm px-4 py-2 inline-block">
                Chat Sekarang
              </a>
            </div>

            <div className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-xl shadow-lg text-center hover:-translate-y-3 transition-transform">
              <div style={{ color: customColors.color1 }} className="text-5xl mb-4">{getIcon('FaEnvelope')}</div>
              <h3 className="font-bold text-lg mb-2">Email</h3>
              <p className="text-gray-600 text-sm mb-4">{contactText.email}</p>
              <a href={contactText.emailUrl || '#'} target="_blank" rel="noopener noreferrer" style={{ borderColor: customColors.color1, color: customColors.color1 }} className="btn-outline text-sm px-4 py-2 inline-block">
                Kirim Email
              </a>
            </div>

            <div className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-xl shadow-lg text-center hover:-translate-y-3 transition-transform">
              <div style={{ color: customColors.color1 }} className="text-5xl mb-4">{getIcon('FaBook')}</div>
              <h3 className="font-bold text-lg mb-2">Guidebook</h3>
              <p className="text-gray-600 text-sm mb-4">Panduan lengkap</p>
              <a href={contactText.guidebookUrl || '#'} target="_blank" rel="noopener noreferrer" style={{ borderColor: customColors.color1, color: customColors.color1 }} className="btn-outline text-sm px-4 py-2 inline-block">
                Download PDF
              </a>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="max-w-3xl mx-auto">
            <h3 className="text-3xl font-bold mb-8 text-center">FAQ - Frequently Asked Questions</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {faqCards.map((item) => (
                <div key={item.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                  <button
                    onClick={() => setOpenFaq(openFaq === item.id ? null : item.id)}
                    className="w-full p-6 flex justify-between items-center hover:bg-gray-50 transition-colors"
                  >
                    <h4 className="font-bold text-left text-lg">{item.question}</h4>
                    <span style={{ color: customColors.color1 }} className={`transition-transform text-2xl ${openFaq === item.id ? 'rotate-180' : ''}`}>▼</span>
                  </button>
                  <div className={`overflow-hidden transition-all ${openFaq === item.id ? 'max-h-48' : 'max-h-0'}`}>
                    <p className="px-6 pb-6 text-gray-600 leading-relaxed">{item.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Layout 3: Centered Single Column
  return (
    <section id="contact" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="section-title">Kontak & Bantuan</h2>
        <p className="section-subtitle">Hubungi kami untuk informasi lebih lanjut</p>

        <div className="max-w-2xl mx-auto">
          {/* Contact Methods */}
          <div className="space-y-4 mb-12">
            <div style={customGradientStyle} className="text-white p-6 rounded-xl shadow-xl flex items-center gap-6">
              {getIcon('FaWhatsapp', 'text-4xl flex-shrink-0')}
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">WhatsApp</h3>
                <p className="text-sm opacity-90">{contactText.whatsapp}</p>
              </div>
              <a href={contactText.whatsappUrl || '#'} target="_blank" rel="noopener noreferrer" className="bg-white text-gray-800 px-6 py-2 rounded-full font-semibold hover:scale-105 transition-transform">
                Chat
              </a>
            </div>

            <div className="bg-white border-2 border-gray-200 p-6 rounded-xl shadow-lg flex items-center gap-6 hover:border-gray-300 transition-colors">
              <div style={{ color: customColors.color1 }} className="text-4xl flex-shrink-0">{getIcon('FaEnvelope')}</div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">Email</h3>
                <p className="text-sm text-gray-600">{contactText.email}</p>
              </div>
              <a href={contactText.emailUrl || '#'} target="_blank" rel="noopener noreferrer" style={{ borderColor: customColors.color1, color: customColors.color1 }} className="btn-outline px-6 py-2 inline-block">
                Email
              </a>
            </div>

            <div className="bg-white border-2 border-gray-200 p-6 rounded-xl shadow-lg flex items-center gap-6 hover:border-gray-300 transition-colors">
              <div style={{ color: customColors.color1 }} className="text-4xl flex-shrink-0">{getIcon('FaBook')}</div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">Guidebook</h3>
                <p className="text-sm text-gray-600">Panduan lengkap kompetisi</p>
              </div>
              <a href={contactText.guidebookUrl || '#'} target="_blank" rel="noopener noreferrer" style={{ borderColor: customColors.color1, color: customColors.color1 }} className="btn-outline px-6 py-2 inline-block">
                Download
              </a>
            </div>
          </div>

          {/* FAQ */}
          <h3 className="text-2xl font-bold mb-6 text-center">Pertanyaan Umum</h3>
          <div className="space-y-3">
            {faqCards.map((item) => (
              <div key={item.id} className="bg-gray-50 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === item.id ? null : item.id)}
                  className="w-full p-5 flex justify-between items-center hover:bg-gray-100 transition-colors"
                >
                  <h4 className="font-semibold text-left">{item.question}</h4>
                  <span style={{ color: customColors.color1 }} className={`transition-transform ${openFaq === item.id ? 'rotate-180' : ''}`}>▼</span>
                </button>
                <div className={`overflow-hidden transition-all ${openFaq === item.id ? 'max-h-48' : 'max-h-0'}`}>
                  <p className="px-5 pb-5 text-gray-600 leading-relaxed bg-white">{item.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// Footer Section
export const FooterSection = () => {
  const { currentTheme, customColors, heroText, sectionVisibility } = useCustomization();
  const { footer } = eventData;

  // Don't render if section is hidden
  if (!sectionVisibility.footer) {
    return null;
  }

  // Section labels
  const sectionLabels = {
    hero: 'Home',
    about: 'About',
    categories: 'Categories',
    timeline: 'Timeline',
    prizes: 'Prizes & Benefits',
    jury: 'Jury & Speakers',
    documentation: 'Documentation',
    instagram: 'Instagram',
    sponsors: 'Sponsors',
    contact: 'Contact',
  };

  // Get visible sections
  const visibleSections = Object.entries(sectionVisibility)
    .filter(([_, isVisible]) => isVisible)
    .map(([section, _]) => section);

  // Create custom gradient style from custom colors
  const customGradientStyle = {
    background: `linear-gradient(135deg, ${customColors.color1} 0%, ${customColors.color2} 100%)`,
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div style={customGradientStyle} className="py-20 text-center">
        <h2 className="text-3xl lg:text-4xl font-bold mb-4">Siap Bergabung?</h2>
        <p className="text-lg lg:text-xl mb-8 opacity-90">Daftarkan diri Anda sekarang dan raih kesempatan menjadi juara!</p>
        <button className="btn-primary bg-white text-gray-800 hover:bg-gray-100 px-12 py-4 text-lg">
          Daftar Sekarang
        </button>
      </div>
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-[1.5fr_1fr] gap-12 mb-12">
          <div>
            <h3 className="text-2xl font-bold mb-4">{footer.title}</h3>
            <p className="text-gray-400 mb-6">{footer.description}</p>
            <div className="flex gap-4">
              {Object.entries(footer.social).map(([platform, url]) => {
                const iconName = `Fa${platform.charAt(0).toUpperCase() + platform.slice(1)}`;
                return (
                  <a
                    key={platform}
                    href={url}
                    className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:-translate-y-1 transition-all"
                    onMouseEnter={(e) => e.currentTarget.style.background = `linear-gradient(135deg, ${customColors.color1} 0%, ${customColors.color2} 100%)`}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                  >
                    {getIcon(iconName, 'text-xl')}
                  </a>
                );
              })}
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-xl">Information</h4>
            <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-3 text-gray-400">
              {visibleSections.map((section) => (
                <li key={section}>
                  <a
                    href={`#${section}`}
                    className="hover:text-white transition-colors inline-block"
                  >
                    {sectionLabels[section]}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-8 text-center">
          <p className="text-gray-400 mb-2">
            This website is built by <span className="font-semibold text-white">NovaGate</span> in collaboration with{' '}
            <span className="font-semibold text-white">{heroText.title}</span>
          </p>
          <p className="text-gray-500 text-sm mb-4">
            Powered by{' '}
            <span className="inline-flex items-center gap-2 font-semibold" style={{ color: '#3fbed5' }}>
              {getIcon('FaCode', 'text-lg')}
              ArachnoVa
            </span>
          </p>
          <div className="flex items-center justify-center gap-4">
            <a
              href="https://www.instagram.com/arachnova.id/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{ backgroundColor: '#3fbed5' }}
            >
              {getIcon('FaInstagram', 'text-white text-lg')}
            </a>
            <a
              href="https://www.arachnova.id/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{ backgroundColor: '#3fbed5' }}
            >
              {getIcon('FaGlobe', 'text-white text-lg')}
            </a>
            <a
              href="https://wa.me/6287785917029"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{ backgroundColor: '#3fbed5' }}
            >
              {getIcon('FaWhatsapp', 'text-white text-lg')}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
