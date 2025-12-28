import { useState, useEffect } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import ClientTable from './components/ClientTable';
import ClientForm from './components/ClientForm';
import ChatModal from './components/ChatModal';
import ClientDetailModal from './components/ClientDetailModal';
import { clientAPI, whatsappAPI } from './services/api';

function App() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showClientForm, setShowClientForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [chatClient, setChatClient] = useState(null);
  const [detailClient, setDetailClient] = useState(null);
  const [whatsappStatus, setWhatsappStatus] = useState({ isReady: false });
  const [selectedStartup, setSelectedStartup] = useState('NOVAGATE');

  useEffect(() => {
    loadClients();
    loadWhatsAppStatus();

    // Poll WhatsApp status every 10 seconds
    const interval = setInterval(loadWhatsAppStatus, 10000);
    return () => clearInterval(interval);
  }, [selectedStartup]);

  const loadClients = async () => {
    try {
      setLoading(true);
      const response = await clientAPI.getAll(selectedStartup);
      setClients(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load clients. Make sure the backend is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadWhatsAppStatus = async () => {
    try {
      const response = await whatsappAPI.getStatus();
      setWhatsappStatus(response.data);
    } catch (err) {
      console.error('Failed to load WhatsApp status:', err);
    }
  };

  const handleAddClient = () => {
    setSelectedClient(null);
    setShowClientForm(true);
  };

  const handleEditClient = (client) => {
    setSelectedClient(client);
    setShowClientForm(true);
  };

  const handleSaveClient = async (clientData) => {
    try {
      const dataWithStartup = {
        ...clientData,
        startup: selectedStartup
      };

      if (selectedClient) {
        await clientAPI.update(selectedClient.id, dataWithStartup);
      } else {
        await clientAPI.create(dataWithStartup);
      }
      await loadClients();
      setShowClientForm(false);
      setSelectedClient(null);
    } catch (err) {
      alert('Failed to save client: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleSelectStartup = (startup) => {
    setSelectedStartup(startup);
  };

  const handleDeleteClient = async (id) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        await clientAPI.delete(id);
        await loadClients();
      } catch (err) {
        alert('Failed to delete client: ' + (err.response?.data?.error || err.message));
      }
    }
  };

  const handleOpenChat = (client) => {
    setChatClient(client);
  };

  const handleCloseChat = () => {
    setChatClient(null);
    loadClients(); // Refresh to update last contact
  };

  const handleViewDetail = (client) => {
    setDetailClient(client);
  };

  const handleCloseDetail = () => {
    setDetailClient(null);
  };

  const handleSaveDetail = async (clientData) => {
    try {
      await clientAPI.update(detailClient.id, clientData);
      await loadClients();
      // Don't close modal here - let the modal component handle it
      // Update the detailClient with new data so modal shows updated info
      const updatedClient = { ...detailClient, ...clientData };
      setDetailClient(updatedClient);
    } catch (err) {
      alert('Failed to update client: ' + (err.response?.data?.error || err.message));
      throw err; // Re-throw so modal knows save failed
    }
  };

  const getStartupName = () => {
    return selectedStartup === 'NOVAGATE' ? 'NovaGate' : 'NovaTix';
  };

  return (
    <div className="app-container">
      <Sidebar selectedStartup={selectedStartup} onSelectStartup={handleSelectStartup} />
      <div className="app">
        <div className="header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1>CRM Dashboard - {getStartupName()}</h1>
              <p>WhatsApp Client Management System</p>
            </div>
            <div className={`whatsapp-status ${whatsappStatus.isReady ? 'ready' : 'not-ready'}`}>
              <span className="status-indicator"></span>
              WhatsApp: {whatsappStatus.isReady ? 'Connected' : 'Disconnected'}
            </div>
          </div>
        </div>

        {error && <div className="error">{error}</div>}

        <div style={{ marginBottom: '20px' }}>
          <button className="primary add-button" onClick={handleAddClient}>
            + Add New Client
          </button>
        </div>

        {loading ? (
          <div className="loading">Loading clients...</div>
        ) : (
          <ClientTable
            clients={clients}
            onOpenChat={handleOpenChat}
            onEdit={handleEditClient}
            onDelete={handleDeleteClient}
            onViewDetail={handleViewDetail}
          />
        )}

        {showClientForm && (
          <ClientForm
            client={selectedClient}
            onSave={handleSaveClient}
            onCancel={() => {
              setShowClientForm(false);
              setSelectedClient(null);
            }}
          />
        )}

        {chatClient && <ChatModal client={chatClient} onClose={handleCloseChat} />}
        {detailClient && (
          <ClientDetailModal
            client={detailClient}
            onClose={handleCloseDetail}
            onSave={handleSaveDetail}
          />
        )}
      </div>
    </div>
  );
}

export default App;
