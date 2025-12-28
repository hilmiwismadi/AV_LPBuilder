import { useCustomization } from '../../contexts/CustomizationContext';
import { eventData } from '../../data/eventData';
import { getIcon } from '../../utils/iconMapper';

const DocumentationSection = () => {
  const { layouts, currentTheme, customColors, sectionVisibility } = useCustomization();
  const layout = layouts.documentation;
  const { documentation } = eventData;

  // Don't render if section is hidden
  if (!sectionVisibility.documentation) {
    return null;
  }

  // Create custom gradient style from custom colors
  const customGradientStyle = {
    background: `linear-gradient(135deg, ${customColors.color1} 0%, ${customColors.color2} 100%)`,
  };

  // Layout 1: Gallery Grid (Original)
  if (layout === 'layout-1') {
    return (
      <section id="documentation" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="section-title">Dokumentasi Tahun Lalu</h2>
          <p className="section-subtitle">Momen-momen berharga dari event sebelumnya</p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
            {documentation.gallery.map((item) => (
              <div
                key={item.id}
                className={`relative overflow-hidden rounded-xl cursor-pointer group ${
                  item.large ? 'md:col-span-2 md:row-span-2' : ''
                }`}
              >
                <img
                  src={item.image}
                  alt={`Gallery ${item.id}`}
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white">
                  {item.type === 'video' ? (
                    <>
                      {getIcon('FaPlayCircle', 'text-5xl mb-2')}
                      <p className="font-semibold">{item.title}</p>
                    </>
                  ) : (
                    getIcon('FaSearchPlus', 'text-5xl')
                  )}
                </div>
              </div>
            ))}
          </div>

          <div>
            <h3 className="text-3xl font-bold text-center mb-8">Pemenang Tahun Lalu</h3>
            <div className="grid md:grid-cols-3 gap-8">
              {documentation.winners.map((winner) => (
                <div key={winner.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:-translate-y-2 transition-transform">
                  <img src={winner.image} alt={winner.team} className="w-full h-64 object-cover" />
                  <div className="p-6 text-center">
                    <h4 className="font-bold text-lg mb-2">{winner.team}</h4>
                    <p className="text-gray-600 mb-2">{winner.category}</p>
                    <p style={{ color: customColors.color1 }} className="font-semibold">{winner.project}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Layout 2: Masonry Style with Featured Winners
  if (layout === 'layout-2') {
    return (
      <section id="documentation" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="section-title">Dokumentasi Tahun Lalu</h2>
          <p className="section-subtitle">Momen-momen berharga dari event sebelumnya</p>

          {/* Masonry Gallery */}
          <div className="columns-1 md:columns-2 lg:columns-3 gap-4 mb-16">
            {documentation.gallery.map((item) => (
              <div
                key={item.id}
                className="break-inside-avoid mb-4 relative overflow-hidden rounded-xl cursor-pointer group"
              >
                <img
                  src={item.image}
                  alt={`Gallery ${item.id}`}
                  className="w-full display block group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white">
                  {item.type === 'video' ? (
                    <>
                      {getIcon('FaPlayCircle', 'text-4xl mb-2')}
                      <p className="font-semibold text-sm">{item.title}</p>
                    </>
                  ) : (
                    getIcon('FaSearchPlus', 'text-4xl')
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Winners in Horizontal Cards */}
          <div>
            <h3 className="text-3xl font-bold text-center mb-8">Pemenang Tahun Lalu</h3>
            <div className="max-w-4xl mx-auto space-y-6">
              {documentation.winners.map((winner) => (
                <div key={winner.id} className="bg-white rounded-xl shadow-lg flex flex-col md:flex-row items-center gap-6 p-6 hover:shadow-xl transition-shadow">
                  <img src={winner.image} alt={winner.team} className="w-32 h-32 rounded-full object-cover flex-shrink-0" />
                  <div className="flex-1 text-center md:text-left">
                    <h4 className="font-bold text-xl mb-2">{winner.team}</h4>
                    <p className="text-gray-600 mb-2">{winner.category}</p>
                    <p style={{ color: customColors.color1 }} className="font-semibold text-lg">{winner.project}</p>
                  </div>
                  <div style={customGradientStyle} className="text-white p-4 rounded-full">
                    {getIcon('FaTrophy', 'text-3xl')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Layout 3: Slideshow Style with Winner Spotlight
  return (
    <section id="documentation" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="section-title">Dokumentasi Tahun Lalu</h2>
        <p className="section-subtitle">Momen-momen berharga dari event sebelumnya</p>

        {/* Featured Gallery Slideshow */}
        <div className="max-w-5xl mx-auto mb-16">
          <div className="grid md:grid-cols-2 gap-6">
            {documentation.gallery.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="relative overflow-hidden rounded-2xl cursor-pointer group shadow-xl"
              >
                <img
                  src={item.image}
                  alt={`Gallery ${item.id}`}
                  className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end p-6">
                  {item.type === 'video' ? (
                    <div className="text-white">
                      {getIcon('FaPlayCircle', 'text-4xl mb-2')}
                      <p className="font-bold text-lg">{item.title}</p>
                    </div>
                  ) : (
                    <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      {getIcon('FaSearchPlus', 'text-3xl')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Additional Photos Strip */}
          <div className="flex gap-4 mt-6 overflow-x-auto">
            {documentation.gallery.slice(4).map((item) => (
              <div
                key={item.id}
                className="relative overflow-hidden rounded-xl cursor-pointer group flex-shrink-0 w-48 h-32"
              >
                <img
                  src={item.image}
                  alt={`Gallery ${item.id}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Winners Spotlight */}
        <div>
          <h3 className="text-3xl font-bold text-center mb-8">🏆 Champions Spotlight</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {documentation.winners.map((winner, idx) => (
              <div key={winner.id} className={`bg-gradient-to-br from-white to-gray-100 rounded-2xl shadow-xl p-8 text-center hover:scale-105 transition-transform ${idx === 0 ? 'md:scale-110 z-10' : ''}`}>
                <div className="relative inline-block mb-6">
                  <img src={winner.image} alt={winner.team} className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-lg" />
                  <div style={customGradientStyle} className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full flex items-center justify-center text-white text-xl shadow-lg">
                    {getIcon('FaTrophy')}
                  </div>
                </div>
                <h4 className="font-bold text-xl mb-2">{winner.team}</h4>
                <p className="text-gray-600 text-sm mb-3">{winner.category}</p>
                <div style={customGradientStyle} className="text-white px-4 py-2 rounded-full inline-block">
                  <p className="font-semibold text-sm">{winner.project}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DocumentationSection;
