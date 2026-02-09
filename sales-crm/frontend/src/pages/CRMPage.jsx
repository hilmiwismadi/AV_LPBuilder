import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientAPI, whatsappAPI } from '../services/api';
import ClientTable from '../components/ClientTable';
import ClientForm from '../components/ClientForm';
import ChatModal from '../components/ChatModal';
import WhatsAppQRModal from '../components/WhatsAppQRModal';
import ClientDetailModal from '../components/ClientDetailModal';
import './CRMPage.css';

const CRMPage = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showWhatsAppQR, setShowWhatsAppQR] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [editingClient, setEditingClient] = useState(null);
  const [whatsappStatus, setWhatsappStatus] = useState('unknown');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClients();
    checkWhatsAppStatus();

    const interval = setInterval(checkWhatsAppStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterClients();
  }, [clients, searchTerm, statusFilter]);

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

  const filterClients = () => {
    let filtered = clients;

    if (searchTerm) {
      filtered = filtered.filter(
        (client) =>
          client.eventOrganizer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.phoneNumber?.includes(searchTerm)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((client) => client.status === statusFilter);
    }

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
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="status-filter"
        >
          <option value="all">All Status</option>
          <option value="TODO">To Do</option>
          <option value="FOLLOW_UP">Follow Up</option>
          <option value="NEXT_YEAR">Next Year</option>
          <option value="GHOSTED_FOLLOW_UP">Ghosted</option>
        </select>
      </div>

      <ClientTable
        clients={filteredClients}
        onEdit={handleEditClient}
        onDelete={handleDeleteClient}
        onChat={handleChat}
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
    </div>
  );
};

export default CRMPage;
