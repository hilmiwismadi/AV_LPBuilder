import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaEye, FaDownload, FaEdit, FaUserCog } from 'react-icons/fa';
import { useCustomization } from '../contexts/CustomizationContext';
import { useAuth } from '../hooks/useAuth';
import api from '../utils/axios';

const SavedPage = () => {
  const [savedConfigs, setSavedConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [eventOrganizers, setEventOrganizers] = useState([]);
  const [selectedOwnerId, setSelectedOwnerId] = useState('');
  const navigate = useNavigate();
  const { setEditingConfig } = useCustomization();
  const { isSuperadmin } = useAuth();

  useEffect(() => {
    fetchConfigurations();
    if (isSuperadmin) {
      fetchEventOrganizers();
    }
  }, [isSuperadmin]);

  const fetchConfigurations = async () => {
    try {
      const response = await api.get('/configurations');
      setSavedConfigs(response.data);
    } catch (error) {
      console.error('Error fetching configurations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEventOrganizers = async () => {
    try {
      const response = await api.get('/users');
      setEventOrganizers(response.data.users || []);
    } catch (error) {
      console.error('Error fetching event organizers:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this configuration?')) {
      return;
    }

    try {
      await api.delete(`/configurations/${id}`);
      setSavedConfigs(savedConfigs.filter((config) => config.id !== id));
    } catch (error) {
      console.error('Error deleting configuration:', error);
      alert('Error deleting configuration');
    }
  };

  const handleEdit = (config) => {
    // Set editing state and navigate to edit route
    setEditingConfig(config.id, config.name);
    navigate(`/configuration/${config.slug}`);
  };

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

  const handlePreview = (config) => {
    window.open(`/saved/${config.slug}`, '_blank');
  };

  const handleOwnerClick = (ownerId) => {
    if (isSuperadmin && ownerId) {
      navigate('/manage-clients', { state: { highlightUserId: ownerId } });
    }
  };

  const openAssignModal = (config) => {
    setSelectedConfig(config);
    setSelectedOwnerId(config.owner?.id || '');
    setAssignModalOpen(true);
  };

  const closeAssignModal = () => {
    setAssignModalOpen(false);
    setSelectedConfig(null);
    setSelectedOwnerId('');
  };

  const handleAssignOwner = async () => {
    if (!selectedOwnerId) {
      alert('Please select an event organizer');
      return;
    }

    try {
      await api.put(`/configurations/${selectedConfig.id}`, {
        ownerId: selectedOwnerId
      });

      // Refresh configurations
      await fetchConfigurations();
      closeAssignModal();
      alert('Owner assigned successfully!');
    } catch (error) {
      console.error('Error assigning owner:', error);
      alert(error.response?.data?.error || 'Failed to assign owner');
    }
  };


  const handleToggleProd = async (config) => {
    const newType = config.configType === 'PROD' ? 'NEUTRAL' : 'PROD';
    const label = newType === 'PROD' ? 'Mark as Prod?' : 'Remove Prod status?';
    if (!confirm(label)) return;
    try {
      await api.put(`/configurations/${config.id}`, { configType: newType });
      setSavedConfigs(savedConfigs.map(c =>
        c.id === config.id ? { ...c, configType: newType } : c
      ));
    } catch (error) {
      console.error('Error updating config type:', error);
      alert('Failed to update status');
    }
  };

  const getTypeBadge = (configType) => {
    switch (configType) {
      case 'DEMO':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-orange-100 text-orange-700 border border-orange-200">
            Demo
          </span>
        );
      case 'PROD':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
            Prod
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-500 border border-gray-200">
            —
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Saved Configurations</h1>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-orange-400"></span> Demo
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-green-400"></span> Prod
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-gray-300"></span> Neutral
            </span>
            <span className="ml-2">Total: <span className="font-semibold">{savedConfigs.length}</span> configurations</span>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
                    {isSuperadmin && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner (EO)</th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Colors</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sections</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
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
                          {getTypeBadge(config.configType)}
                          {isSuperadmin && config.configType !== 'DEMO' && (
                            <button
                              onClick={() => handleToggleProd(config)}
                              className={config.configType === 'PROD' ? 'text-xs text-red-500 hover:text-red-700 underline' : 'text-xs text-green-600 hover:text-green-800 underline'}
                              title={config.configType === 'PROD' ? 'Remove Prod status' : 'Set as Prod'}
                            >
                              {config.configType === 'PROD' ? 'Unset' : 'Set Prod'}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 font-mono">{config.slug}</div>
                      </td>
                      {isSuperadmin && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          {config.owner ? (
                            <div>
                              <div
                                className="text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer"
                                onClick={() => handleOwnerClick(config.owner.id)}
                                title="Click to manage this user"
                              >
                                {config.owner.name}
                              </div>
                              <div className="text-xs text-gray-500">{config.owner.email}</div>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-400 italic">Unassigned</div>
                          )}
                        </td>
                      )}
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
                            onClick={() => handleEdit(config)}
                            className="text-green-600 hover:text-green-900 p-2 rounded hover:bg-green-50"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          {isSuperadmin && (
                            <button
                              onClick={() => openAssignModal(config)}
                              className="text-purple-600 hover:text-purple-900 p-2 rounded hover:bg-purple-50"
                              title="Assign Owner"
                            >
                              <FaUserCog />
                            </button>
                          )}
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

      {/* Assign Owner Modal */}
      {assignModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Assign Event Organizer</h2>
            <p className="text-sm text-gray-600 mb-4">
              Configuration: <span className="font-medium">{selectedConfig?.name}</span>
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Event Organizer
              </label>
              <select
                value={selectedOwnerId}
                onChange={(e) => setSelectedOwnerId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">-- Select Owner --</option>
                {eventOrganizers.map((eo) => (
                  <option key={eo.id} value={eo.id}>
                    {eo.name} ({eo.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={closeAssignModal}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignOwner}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Assign Owner
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedPage;
