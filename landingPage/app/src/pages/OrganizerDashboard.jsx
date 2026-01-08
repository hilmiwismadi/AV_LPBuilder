import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCustomization } from '../contexts/CustomizationContext';
import Navigation from '../components/Navigation';
import api from '../utils/axios';

export default function OrganizerDashboard() {
  const { user } = useAuth();
  const { clearEditingConfig, resetToDefaults } = useCustomization();
  const navigate = useNavigate();
  const [configurations, setConfigurations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConfigurations();
  }, []);

  const fetchConfigurations = async () => {
    try {
      const response = await api.get('/configurations');
      setConfigurations(response.data);
    } catch (error) {
      console.error('Failed to fetch configurations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    clearEditingConfig();
    resetToDefaults();
    navigate('/configuration');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6 bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Your Configurations
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {configurations.length}
              </dd>
            </div>
          </div>

          <div className="mb-6">
            <button
              onClick={handleCreateNew}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              + Create New Landing Page
            </button>
          </div>

          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium mb-4">Your Landing Pages</h2>
              {loading ? (
                <p>Loading...</p>
              ) : configurations.length === 0 ? (
                <p className="text-gray-500">No landing pages yet. Create your first one!</p>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {configurations.map((config) => (
                    <div key={config.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <h3 className="font-medium text-lg mb-2">{config.name}</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Created {new Date(config.createdAt).toLocaleDateString()}
                      </p>
                      <div className="flex space-x-2">
                        <Link
                          to={`/configuration/${config.slug}`}
                          className="flex-1 text-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          Edit
                        </Link>
                        <a
                          href={`https://${config.slug}.webbuild.arachnova.id`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 text-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                        >
                          View Live
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
