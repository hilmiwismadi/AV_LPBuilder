import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useCustomization, themes, sections } from '../contexts/CustomizationContext';
import { getIcon } from '../utils/iconMapper';

const ControlPanel = () => {
  const {
    selectedTheme,
    currentTheme,
    layouts,
    isPanelOpen,
    setIsPanelOpen,
    changeTheme,
    changeLayout,
    resetCustomizations,
    exportSettings,
    importSettings,
  } = useCustomization();

  const fileInputRef = useRef(null);

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        await importSettings(file);
        alert('Settings imported successfully!');
      } catch (error) {
        alert('Error importing settings. Please make sure the file is valid.');
      }
    }
  };

  const sectionNames = {
    hero: 'Hero Section',
    about: 'About Section',
    categories: 'Event Categories',
    timeline: 'Timeline',
    prizes: 'Prizes & Benefits',
    jury: 'Jury & Speakers',
    documentation: 'Documentation',
    sponsors: 'Sponsors',
    contact: 'Contact',
  };

  return (
    <>
      {/* Mobile: Floating Action Button + Full Screen Modal */}
      <div className="md:hidden">
        {/* FAB Button */}
        {!isPanelOpen && (
          <button
            onClick={() => setIsPanelOpen(true)}
            className={`fixed bottom-6 right-6 z-50 ${currentTheme.gradient} text-white p-4 rounded-full shadow-2xl hover:shadow-xl transition-all active:scale-95 flex items-center justify-center`}
            aria-label="Open customization panel"
          >
            {getIcon('FaCog', 'text-2xl')}
          </button>
        )}

        {/* Full Screen Modal */}
        {isPanelOpen && (
          <div className="fixed inset-0 z-50 bg-white">
            {/* Header */}
            <div className={`${currentTheme.gradient} text-white p-4 flex items-center justify-between`}>
              <h3 className="text-lg font-bold">Customize Page</h3>
              <button
                onClick={() => setIsPanelOpen(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                aria-label="Close customization panel"
              >
                {getIcon('FaTimes', 'text-xl')}
              </button>
            </div>

            {/* Content */}
            <div className="p-4 overflow-y-auto h-[calc(100vh-64px)]">
              <div className="mb-6 sm:mb-8">
                <h4 className="text-xs sm:text-sm font-semibold text-gray-600 uppercase mb-2 sm:mb-3">Select Color Theme:</h4>
                <div className="space-y-2">
                  {themes.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => changeTheme(theme.id)}
                      className={`w-full flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border-2 transition-all ${
                        selectedTheme === theme.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 active:scale-95'
                      }`}
                    >
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 ${theme.gradient} rounded-lg flex-shrink-0`}></div>
                      <span className="font-medium text-xs sm:text-sm">{theme.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6 sm:mb-8">
                <h4 className="text-xs sm:text-sm font-semibold text-gray-600 uppercase mb-2 sm:mb-3">Section Layouts:</h4>
                <div className="space-y-2 sm:space-y-3">
                  {sections.map((section) => (
                    <div key={section}>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        {sectionNames[section]}:
                      </label>
                      <select
                        value={layouts[section]}
                        onChange={(e) => changeLayout(section, e.target.value)}
                        className="w-full px-2 sm:px-3 py-2 border-2 border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                      >
                        <option value="layout-1">Layout 1</option>
                        <option value="layout-2">Layout 2</option>
                        <option value="layout-3">Layout 3</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t-2 border-gray-200 pt-4 sm:pt-6">
                <h4 className="text-xs sm:text-sm font-semibold text-gray-600 uppercase mb-2 sm:mb-3">Advanced Configuration:</h4>
                <div className="space-y-2 mb-4">
                  <Link
                    to="/configuration"
                    className="w-full px-3 sm:px-4 py-2 bg-purple-500 text-white rounded-lg font-semibold text-xs sm:text-sm hover:bg-purple-600 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    {getIcon('FaCog')} Advanced Config
                  </Link>
                  <Link
                    to="/saved"
                    className="w-full px-3 sm:px-4 py-2 bg-indigo-500 text-white rounded-lg font-semibold text-xs sm:text-sm hover:bg-indigo-600 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    {getIcon('FaSave')} View Saved
                  </Link>
                </div>
                <h4 className="text-xs sm:text-sm font-semibold text-gray-600 uppercase mb-2 sm:mb-3">Utility Tools:</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to reset all customizations?')) {
                        resetCustomizations();
                      }
                    }}
                    className="w-full px-3 sm:px-4 py-2 bg-red-500 text-white rounded-lg font-semibold text-xs sm:text-sm hover:bg-red-600 active:scale-95 transition-all"
                  >
                    Reset All
                  </button>
                  <button
                    onClick={exportSettings}
                    className="w-full px-3 sm:px-4 py-2 bg-green-500 text-white rounded-lg font-semibold text-xs sm:text-sm hover:bg-green-600 active:scale-95 transition-all"
                  >
                    Export Settings
                  </button>
                  <button
                    onClick={handleImport}
                    className="w-full px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold text-xs sm:text-sm hover:bg-blue-600 active:scale-95 transition-all"
                  >
                    Import Settings
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/json"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
                <p className="mt-3 sm:mt-4 text-xs text-gray-500 text-center">
                  Tip: Press Ctrl+K to toggle
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Desktop: Sliding Sidebar */}
      <div className="hidden md:block">
        <div
          className={`fixed right-0 top-24 z-50 bg-white shadow-2xl rounded-l-xl max-w-[350px] transition-transform duration-300 ${
            isPanelOpen ? 'translate-x-0' : 'translate-x-[calc(100%-60px)]'
          }`}
        >
          <button
            onClick={() => setIsPanelOpen(!isPanelOpen)}
            className={`absolute -left-[60px] top-0 ${currentTheme.gradient} text-white p-4 rounded-l-xl shadow-lg hover:shadow-xl transition-shadow font-semibold flex items-center gap-2`}
          >
            {getIcon('FaCog', 'text-xl')}
            <span className="text-sm">Customize</span>
          </button>

          <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            <h3 className="text-xl font-bold mb-6">Customize Your Landing Page</h3>

            {/* Theme Selector */}
            <div className="mb-8">
              <h4 className="text-sm font-semibold text-gray-600 uppercase mb-3">Select Color Theme:</h4>
              <div className="space-y-2">
                {themes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => changeTheme(theme.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                      selectedTheme === theme.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-10 h-10 ${theme.gradient} rounded-lg flex-shrink-0`}></div>
                    <span className="font-medium text-sm">{theme.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Layout Selectors */}
            <div className="mb-8">
              <h4 className="text-sm font-semibold text-gray-600 uppercase mb-3">Section Layouts:</h4>
              <div className="space-y-3">
                {sections.map((section) => (
                  <div key={section}>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      {sectionNames[section]}:
                    </label>
                    <select
                      value={layouts[section]}
                      onChange={(e) => changeLayout(section, e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                    >
                      <option value="layout-1">Layout 1</option>
                      <option value="layout-2">Layout 2</option>
                      <option value="layout-3">Layout 3</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* Utility Buttons */}
            <div className="border-t-2 border-gray-200 pt-6">
              <h4 className="text-sm font-semibold text-gray-600 uppercase mb-3">Advanced Configuration:</h4>
              <div className="space-y-2 mb-4">
                <Link
                  to="/configuration"
                  className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg font-semibold text-sm hover:bg-purple-600 transition-colors flex items-center justify-center gap-2"
                >
                  {getIcon('FaCog')} Advanced Config
                </Link>
                <Link
                  to="/saved"
                  className="w-full px-4 py-2 bg-indigo-500 text-white rounded-lg font-semibold text-sm hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2"
                >
                  {getIcon('FaSave')} View Saved
                </Link>
              </div>
              <h4 className="text-sm font-semibold text-gray-600 uppercase mb-3">Utility Tools:</h4>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to reset all customizations?')) {
                      resetCustomizations();
                    }
                  }}
                  className="w-full px-4 py-2 bg-red-500 text-white rounded-lg font-semibold text-sm hover:bg-red-600 transition-colors"
                >
                  Reset All
                </button>
                <button
                  onClick={exportSettings}
                  className="w-full px-4 py-2 bg-green-500 text-white rounded-lg font-semibold text-sm hover:bg-green-600 transition-colors"
                >
                  Export Settings
                </button>
                <button
                  onClick={handleImport}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold text-sm hover:bg-blue-600 transition-colors"
                >
                  Import Settings
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/json"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
              <p className="mt-4 text-xs text-gray-500 text-center">
                Tip: Press Ctrl+K to toggle this panel
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ControlPanel;
