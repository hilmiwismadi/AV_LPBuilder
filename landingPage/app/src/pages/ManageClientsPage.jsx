import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Navigation from '../components/Navigation';
import api from '../utils/axios';

export default function ManageClientsPage() {
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await api.get('/users');
      setClients(response.data.users);
    } catch (error) {
      console.error('Failed to fetch clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingClient) {
        // Update existing client
        const updateData = {
          email: formData.email,
          name: formData.name,
        };

        // Only include password if it's been changed
        if (formData.password) {
          updateData.password = formData.password;
        }

        await api.put(`/users/${editingClient.id}`, updateData);
        setSuccess('Client updated successfully!');
      } else {
        // Create new client
        await api.post('/users', formData);
        setSuccess('Client created successfully!');
      }

      setFormData({ email: '', password: '', name: '' });
      setShowForm(false);
      setEditingClient(null);
      fetchClients();
    } catch (error) {
      setError(error.response?.data?.message || `Failed to ${editingClient ? 'update' : 'create'} client`);
    }
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setFormData({
      email: client.email,
      name: client.name,
      password: '' // Don't pre-fill password
    });
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const handleCancelEdit = () => {
    setEditingClient(null);
    setFormData({ email: '', password: '', name: '' });
    setShowForm(false);
    setError('');
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this client? All their configurations will be deleted.')) {
      return;
    }

    try {
      await api.delete(`/users/${id}`);
      setSuccess('Client deleted successfully!');
      fetchClients();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete client');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}

          <div className="mb-6">
            <button
              onClick={() => {
                if (showForm && !editingClient) {
                  setShowForm(false);
                } else {
                  setEditingClient(null);
                  setFormData({ email: '', password: '', name: '' });
                  setShowForm(!showForm);
                }
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              {showForm && !editingClient ? 'Cancel' : '+ Add New Client'}
            </button>
          </div>

          {showForm && (
            <div className="mb-6 bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium mb-4">
                {editingClient ? 'Edit Event Organizer' : 'Create Event Organizer Account'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Password {editingClient && <span className="text-gray-500 font-normal">(leave blank to keep current)</span>}
                  </label>
                  <input
                    type="password"
                    required={!editingClient}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder={editingClient ? 'Enter new password to change' : ''}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    {editingClient ? 'Update Client' : 'Create Client'}
                  </button>
                  {editingClient && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="flex-1 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}

          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium mb-4">Event Organizers</h2>
              {loading ? (
                <p>Loading...</p>
              ) : clients.length === 0 ? (
                <p className="text-gray-500">No clients yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Configurations</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {clients.map((client) => (
                        <tr key={client.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {client.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {client.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {client._count?.configurations || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(client.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => handleEdit(client)}
                              className="text-blue-600 hover:text-blue-900 mr-4"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(client.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
