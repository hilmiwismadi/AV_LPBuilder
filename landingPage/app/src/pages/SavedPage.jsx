import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaEye, FaDownload, FaEdit } from 'react-icons/fa';
import { useCustomization } from '../contexts/CustomizationContext';

const SavedPage = () => {
  const [savedConfigs, setSavedConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { importSettings, setEditingConfig } = useCustomization();

  // Fetch saved configurations
  useEffect(() => {
    fetchConfigurations();
  }, []);

  const fetchConfigurations = async () => {
    try {
      const response = await fetch('/api/configurations');
      if (response.ok) {
        const data = await response.json();
        setSavedConfigs(data);
      }
    } catch (error) {
      console.error('Error fetching configurations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Delete configuration
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this configuration?')) {
      return;
    }

    try {
      const response = await fetch(`/api/configurations/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSavedConfigs(savedConfigs.filter((config) => config.id !== id));
      } else {
        alert('Failed to delete configuration');
      }
    } catch (error) {
      console.error('Error deleting configuration:', error);
      alert('Error deleting configuration');
    }
  };

  // Load configuration for editing
  const handleLoad = async (config) => {
    try {
      // Create a settings object from the config
      const settings = {
        theme: config.selectedTheme || 'theme1',
        layouts: config.layouts,
        customColors: config.customColors,
        images: config.images,
        sectionVisibility: config.sectionVisibility,
        heroText: config.heroText,
        aboutText: config.aboutText,
      };

      // Create a file-like object for import
      const blob = new Blob([JSON.stringify(settings)], { type: 'application/json' });
      const file = new File([blob], 'config.json', { type: 'application/json' });

      await importSettings(file);

      // Set the editing config ID and name
      setEditingConfig(config.id, config.name);

      // Navigate to configuration page for editing
      navigate('/configuration');
    } catch (error) {
      console.error('Error loading configuration:', error);
      alert('Error loading configuration');
    }
  };

  // Download configuration as JSON
  const handleDownload = (config) => {
    const settings = {
      theme: config.selectedTheme || 'theme1',
      layouts: config.layouts,
      customColors: config.customColors,
      images: config.images,
      sectionVisibility: config.sectionVisibility,
      heroText: config.heroText,
      aboutText: config.aboutText,
    };

    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${config.name.replace(/\s+/g, '-')}.json`;
    link.click();

    URL.revokeObjectURL(url);
  };

  // Helper function to convert config name to URL slug
  const createSlug = (name) => {
    return name.toLowerCase().replace(/\s+/g, '-');
  };

  // Show preview - open in new tab
  const handlePreview = (config) => {
    const slug = createSlug(config.name);
    window.open(`/saved/${slug}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Saved Configurations</h1>
          <div className="text-sm text-gray-600">
            Total: <span className="font-semibold">{savedConfigs.length}</span> configurations
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : savedConfigs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg">No saved configurations yet.</p>
            <p className="text-gray-400 mt-2">Create your first configuration from the Configuration page.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Colors
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sections
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {savedConfigs.map((config) => (
                    <tr key={config.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{config.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-16 h-8 rounded border border-gray-300"
                            style={{
                              background: `linear-gradient(135deg, ${config.customColors?.color1 || '#667eea'} 0%, ${
                                config.customColors?.color2 || '#764ba2'
                              } 100%)`,
                            }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {config.sectionVisibility
                            ? Object.values(config.sectionVisibility).filter(Boolean).length
                            : 9}{' '}
                          / 9 active
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(config.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handlePreview(config)}
                            className="text-blue-600 hover:text-blue-900 p-2 rounded hover:bg-blue-50"
                            title="Preview"
                          >
                            <FaEye />
                          </button>
                          <button
                            onClick={() => handleLoad(config)}
                            className="text-green-600 hover:text-green-900 p-2 rounded hover:bg-green-50"
                            title="Load"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDownload(config)}
                            className="text-indigo-600 hover:text-indigo-900 p-2 rounded hover:bg-indigo-50"
                            title="Download"
                          >
                            <FaDownload />
                          </button>
                          <button
                            onClick={() => handleDelete(config.id)}
                            className="text-red-600 hover:text-red-900 p-2 rounded hover:bg-red-50"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedPage;
