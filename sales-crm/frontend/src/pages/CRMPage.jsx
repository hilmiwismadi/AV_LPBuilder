import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientAPI, whatsappAPI } from '../services/api';
import ClientTable from '../components/ClientTable';
import ClientForm from '../components/ClientForm';
import ChatModal from '../components/ChatModal';
import WhatsAppQRModal from '../components/WhatsAppQRModal';
import ClientDetailModal from '../components/ClientDetailModal';
import BuildDemoModal from '../components/BuildDemoModal';
import ViewDemoModal from '../components/ViewDemoModal';
import './CRMPage.css';

const CRMPage = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [otwFilter, setOtwFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showWhatsAppQR, setShowWhatsAppQR] = useState(false);
  const [showBuildDemo, setShowBuildDemo] = useState(false);
  const [showViewDemo, setShowViewDemo] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [editingClient, setEditingClient] = useState(null);
  const [whatsappStatus, setWhatsappStatus] = useState('unknown');
  const [loading, setLoading] = useState(true);

  // OTW Status categories for filter
  const otwCategories = ['all', 'Not Checked', 'OTW chat (prospect)', 'Nanti aja', 'Gausah'];

  useEffect(() => {
    fetchClients();
    checkWhatsAppStatus();

    const interval = setInterval(checkWhatsAppStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterClients();
  }, [clients, searchTerm, otwFilter]);

  const fetchClients = async () => {
    try {
      const response = await clientAPI.getAll();
      setClients(response.data);
    } catch (error) {
      console.error('Failed to fetch clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkWhatsAppStatus = async () => {
    try {
      const response = await whatsappAPI.getStatus();
      setWhatsappStatus(response.data.status);
    } catch (err) {
      console.error('Error checking WhatsApp status:', err);
    }
  };

  // Parse OTW status to category
  const getOtwCategory = (client) => {
    const status = client.otwStatus || 'NOT_CHECKED';

    // Handle Not Checked status first
    if (status === 'NOT_CHECKED') {
      return 'Not Checked';
    }

    if (status === 'URGENT' || status === 'URGENT_BERJALAN' || status === 'BENTAR_LAGI_MULAI'|| status.startsWith('ETC_OTW_')) {
    
    return 'OTW chat (prospect)';
    } else if (status === 'FEE_KECIL_ATAU_GRATIS' || status.startsWith('UDAH_BERJALAN') || status.startsWith('HP_DI_GAMBAR') || status.startsWith('ETC_NANTI_')) {
      return 'Nanti aja';
    } else if (status === 'GA_RELEVAN' || status === 'GADA_NOMER_HP' || status === 'NOMER_HP_KONTAK' || status.startsWith('ETC_GAUSAH_')) {
      return 'Gausah';
    }
    return 'OTW chat (prospect)';
  };

  const filterClients = () => {
    let filtered = clients;

    if (searchTerm) {
      filtered = filtered.filter(
        (client) =>
          client.eventOrganizer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.phoneNumber?.includes(searchTerm)
      );
    }

    if (otwFilter !== 'all') {
      filtered = filtered.filter((client) => getOtwCategory(client) === otwFilter);
    }

    // Prioritize clients with phone numbers at the top
    filtered.sort((a, b) => {
      // Both have phone: keep original order
      if (a.phoneNumber && b.phoneNumber) return 0;
      // A has phone, B doesn't: A first
      if (a.phoneNumber && !b.phoneNumber) return -1;
      // A doesn't have phone, B has: B first
      if (!a.phoneNumber && b.phoneNumber) return 1;
      // Neither has phone: keep original order
      return 0;
    });

    setFilteredClients(filtered);
  };

  const handleAddClient = () => {
    setEditingClient(null);
    setShowForm(true);
  };

  const handleEditClient = (client) => {
    setEditingClient(client);
    setShowDetail(true);
  };

  const handleDeleteClient = async (clientId) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        await clientAPI.delete(clientId);
        fetchClients();
      } catch (error) {
        console.error('Failed to delete client:', error);
        alert('Failed to delete client');
      }
    }
  };

  const handleChat = (client) => {
    setSelectedClient(client);
    setShowChat(true);
  };

  const handleBuild = (client) => {
    setSelectedClient(client);
    if (client.linkDemo) {
      // If demo already exists, show view modal
      setShowViewDemo(true);
    } else {
      // Otherwise, show build modal
      setShowBuildDemo(true);
    }
  };

  const handleClientUpdate = async (client, updateData) => {
    try {
      await clientAPI.update(client.id, updateData);
      // Refresh client list to show updated data
      fetchClients();
    } catch (error) {
      console.error('Failed to update client:', error);
      alert('Failed to update client');
    }
  };

  const handleOtwStatusChange = async (client, status) => {
    try {
      await clientAPI.update(client.id, { otwStatus: status });
      // Refresh client list to show updated data
      fetchClients();
    } catch (error) {
      console.error('Failed to update OTW status:', error);
      alert('Failed to update OTW status');
    }
  };

  const handleRebuild = (client) => {
    setSelectedClient(client);
    setShowBuildDemo(true);
  };

  const handleSaveClient = async (clientData) => {
    try {
      if (editingClient) {
        await clientAPI.update(editingClient.id, clientData);
      } else {
        await clientAPI.create(clientData);
      }
      fetchClients();
      setShowForm(false);
      setShowDetail(false);
      setEditingClient(null);
    } catch (error) {
      console.error('Failed to save client:', error);
      alert('Failed to save client: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleCloseChat = () => {
    setShowChat(false);
    setSelectedClient(null);
    fetchClients();
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    setEditingClient(null);
  };

  const handleBuildDemoSuccess = (link) => {
    console.log('Demo created successfully:', link);
    setShowBuildDemo(false);
    setSelectedClient(null);
    fetchClients(); // Refresh client list to show updated linkDemo
  };

  const handleWhatsAppAuthenticated = (clientInfo) => {
    console.log('WhatsApp authenticated:', clientInfo);
    setWhatsappStatus('ready');
  };

  if (loading) {
    return <div className="loading">Loading clients...</div>;
  }

  const isWhatsAppReady = whatsappStatus === 'ready';

  return (
    <div className="crm-page">
      <div className="page-header">
        <div className="header-left">
          <h1>Client Management</h1>
          <button
            onClick={() => setShowWhatsAppQR(true)}
            className={'whatsapp-status-btn ' + (isWhatsAppReady ? 'connected' : 'disconnected')}
          >
            {isWhatsAppReady ? '🟢 WhatsApp Connected' : '🔴 Connect WhatsApp'}
          </button>
        </div>
        <div className="header-actions">
          <button
            onClick={() => navigate('/crm/templates')}
            className="btn-secondary templates-btn"
          >
            📋 Manage Templates
          </button>
          <button onClick={handleAddClient} className="btn-primary add-btn">
            + Add New Client
          </button>
        </div>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Search by name or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={otwFilter}
          onChange={(e) => setOtwFilter(e.target.value)}
          className="status-filter"
        >
          {otwCategories.map(category => (
            <option key={category} value={category}>
              {category === 'all' ? 'All OTW Status' : category}
            </option>
          ))}
        </select>
      </div>

      <ClientTable
        clients={filteredClients}
        onEdit={handleEditClient}
        onDelete={handleDeleteClient}
        onChat={handleChat}
        onBuild={handleBuild}
        onClientUpdate={handleClientUpdate}
        onOtwStatusChange={handleOtwStatusChange}
      />

      {showForm && (
        <ClientForm
          client={editingClient}
          onSave={handleSaveClient}
          onCancel={() => {
            setShowForm(false);
            setEditingClient(null);
          }}
        />
      )}

      {showChat && selectedClient && (
        <ChatModal client={selectedClient} onClose={handleCloseChat} />
      )}

      {showDetail && editingClient && (
        <ClientDetailModal
          client={editingClient}
          onClose={handleCloseDetail}
          onSave={handleSaveClient}
        />
      )}

      {showWhatsAppQR && (
        <WhatsAppQRModal
          onClose={() => setShowWhatsAppQR(false)}
          onAuthenticated={handleWhatsAppAuthenticated}
        />
      )}

      {showBuildDemo && selectedClient && (
        <BuildDemoModal
          client={selectedClient}
          onClose={() => {
            setShowBuildDemo(false);
            setSelectedClient(null);
          }}
          onSuccess={handleBuildDemoSuccess}
        />
      )}

      {showViewDemo && selectedClient && (
        <ViewDemoModal
          client={selectedClient}
          onClose={() => {
            setShowViewDemo(false);
            setSelectedClient(null);
          }}
          onRebuild={handleRebuild}
        />
      )}
    </div>
  );
};

export default CRMPage;
