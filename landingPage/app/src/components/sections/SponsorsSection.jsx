import { useCustomization } from '../../contexts/CustomizationContext';
import { eventData } from '../../data/eventData';

const SponsorsSection = () => {
  const { layouts, currentTheme, customColors, sectionVisibility } = useCustomization();
  const layout = layouts.sponsors;
  const { sponsors } = eventData;

  // Don't render if section is hidden
  if (!sectionVisibility.sponsors) {
    return null;
  }

  // Create custom gradient style from custom colors
  const customGradientStyle = {
    background: `linear-gradient(135deg, ${customColors.color1} 0%, ${customColors.color2} 100%)`,
  };

  // Layout 1: Traditional Tiered Grid (Original)
  if (layout === 'layout-1') {
    return (
      <section id="sponsors" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="section-title">Sponsor & Media Partner</h2>
          <p className="section-subtitle">Didukung oleh perusahaan dan media terkemuka</p>

          <div className="space-y-12">
            {/* Platinum Sponsors */}
            <div className="text-center">
              <h3 style={customGradientStyle} className="inline-block text-white px-10 py-3 rounded-full font-bold text-lg mb-10">
                Platinum Sponsor
              </h3>
              <div className="flex justify-center gap-12 flex-wrap">
                {sponsors.platinum.map((sponsor) => (
                  <div
                    key={sponsor.id}
                    className="bg-white p-12 rounded-xl shadow-lg hover:-translate-y-2 transition-transform"
                  >
                    <img src={sponsor.logo} alt={sponsor.name} className="max-w-full h-auto" />
                  </div>
                ))}
              </div>
            </div>

            {/* Gold Sponsors */}
            <div className="text-center">
              <h3 style={customGradientStyle} className="inline-block text-white px-10 py-3 rounded-full font-bold text-lg mb-10">
                Gold Sponsor
              </h3>
              <div className="flex justify-center gap-8 flex-wrap">
                {sponsors.gold.map((sponsor) => (
                  <div
                    key={sponsor.id}
                    className="bg-white p-8 rounded-xl shadow-lg hover:scale-105 transition-transform"
                  >
                    <img src={sponsor.logo} alt={sponsor.name} className="max-w-full h-auto" />
                  </div>
                ))}
              </div>
            </div>

            {/* Media Partners */}
            <div className="text-center">
              <h3 style={customGradientStyle} className="inline-block text-white px-10 py-3 rounded-full font-bold text-lg mb-10">
                Media Partner
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-4xl mx-auto">
                {sponsors.media.map((sponsor) => (
                  <div
                    key={sponsor.id}
                    className="bg-white p-6 rounded-xl shadow-lg hover:scale-105 transition-transform flex items-center justify-center"
                  >
                    <img src={sponsor.logo} alt={sponsor.name} className="max-w-full h-auto" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Layout 2: Horizontal Scroll Carousel Style
  if (layout === 'layout-2') {
    return (
      <section id="sponsors" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="section-title">Sponsor & Media Partner</h2>
          <p className="section-subtitle">Didukung oleh perusahaan dan media terkemuka</p>

          <div className="space-y-16">
            {/* Platinum Sponsors - Large Cards */}
            <div>
              <div className="flex items-center gap-4 mb-8 justify-center">
                <div style={customGradientStyle} className="h-1 w-20"></div>
                <h3 className="text-2xl font-bold">Platinum Sponsor</h3>
                <div style={customGradientStyle} className="h-1 w-20"></div>
              </div>
              <div className="flex gap-8 overflow-x-auto pb-4 px-4 scrollbar-hide">
                {sponsors.platinum.map((sponsor) => (
                  <div
                    key={sponsor.id}
                    style={customGradientStyle}
                    className="min-w-[300px] p-1 rounded-2xl shadow-xl flex-shrink-0"
                  >
                    <div className="bg-white p-10 rounded-xl h-full flex items-center justify-center">
                      <img src={sponsor.logo} alt={sponsor.name} className="max-w-full h-auto" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gold Sponsors - Medium Cards */}
            <div>
              <div className="flex items-center gap-4 mb-8 justify-center">
                <div style={customGradientStyle} className="h-1 w-20"></div>
                <h3 className="text-2xl font-bold">Gold Sponsor</h3>
                <div style={customGradientStyle} className="h-1 w-20"></div>
              </div>
              <div className="flex gap-6 overflow-x-auto pb-4 px-4 scrollbar-hide">
                {sponsors.gold.map((sponsor) => (
                  <div
                    key={sponsor.id}
                    className="min-w-[220px] bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow flex-shrink-0 flex items-center justify-center"
                  >
                    <img src={sponsor.logo} alt={sponsor.name} className="max-w-full h-auto" />
                  </div>
                ))}
              </div>
            </div>

            {/* Media Partners - Compact Strip */}
            <div>
              <div className="flex items-center gap-4 mb-8 justify-center">
                <div style={customGradientStyle} className="h-1 w-20"></div>
                <h3 className="text-2xl font-bold">Media Partner</h3>
                <div style={customGradientStyle} className="h-1 w-20"></div>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 px-4 scrollbar-hide">
                {sponsors.media.map((sponsor) => (
                  <div
                    key={sponsor.id}
                    className="min-w-[150px] bg-white p-5 rounded-lg shadow hover:shadow-md transition-shadow flex-shrink-0 flex items-center justify-center"
                  >
                    <img src={sponsor.logo} alt={sponsor.name} className="max-w-full h-auto" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Layout 3: Compact Badge/Circular Style
  return (
    <section id="sponsors" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="section-title">Sponsor & Media Partner</h2>
        <p className="section-subtitle">Didukung oleh perusahaan dan media terkemuka</p>

        {/* All Sponsors in One View */}
        <div className="max-w-6xl mx-auto">
          {/* Platinum - Large Circles */}
          <div className="mb-12">
            <div className="text-center mb-8">
              <span style={customGradientStyle} className="text-white px-8 py-2 rounded-full text-sm font-bold uppercase tracking-wider">
                Platinum
              </span>
            </div>
            <div className="flex justify-center gap-10 flex-wrap">
              {sponsors.platinum.map((sponsor) => (
                <div
                  key={sponsor.id}
                  className="relative group"
                >
                  <div style={customGradientStyle} className="w-40 h-40 rounded-full p-1 shadow-2xl hover:scale-110 transition-transform">
                    <div className="w-full h-full bg-white rounded-full flex items-center justify-center p-6">
                      <img src={sponsor.logo} alt={sponsor.name} className="max-w-full max-h-full" />
                    </div>
                  </div>
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-white px-4 py-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    <p className="text-xs font-semibold">{sponsor.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gold - Medium Circles */}
          <div className="mb-12">
            <div className="text-center mb-8">
              <span style={customGradientStyle} className="text-white px-8 py-2 rounded-full text-sm font-bold uppercase tracking-wider">
                Gold
              </span>
            </div>
            <div className="flex justify-center gap-8 flex-wrap">
              {sponsors.gold.map((sponsor) => (
                <div
                  key={sponsor.id}
                  className="relative group"
                >
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 p-1 shadow-xl hover:scale-110 transition-transform">
                    <div className="w-full h-full bg-white rounded-full flex items-center justify-center p-5">
                      <img src={sponsor.logo} alt={sponsor.name} className="max-w-full max-h-full" />
                    </div>
                  </div>
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    <p className="text-xs font-semibold">{sponsor.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Media Partners - Small Badges */}
          <div>
            <div className="text-center mb-8">
              <span style={customGradientStyle} className="text-white px-8 py-2 rounded-full text-sm font-bold uppercase tracking-wider">
                Media Partner
              </span>
            </div>
            <div className="flex justify-center gap-4 flex-wrap max-w-3xl mx-auto">
              {sponsors.media.map((sponsor) => (
                <div
                  key={sponsor.id}
                  className="relative group"
                >
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 p-1 shadow-lg hover:scale-110 transition-transform">
                    <div className="w-full h-full bg-white rounded-full flex items-center justify-center p-3">
                      <img src={sponsor.logo} alt={sponsor.name} className="max-w-full max-h-full" />
                    </div>
                  </div>
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    <p className="text-xs font-semibold">{sponsor.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SponsorsSection;
