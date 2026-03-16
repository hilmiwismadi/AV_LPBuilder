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

  const handleAssigneeChange = async (client) => {
    try {
      await clientAPI.update(client.id, { assignedBy: null });
      setClients(clients.map(c => c.id === client.id ? client : c));
      
      // Also update client in local state
      setSelectedClient(client);
      setShowForm(false);
      
      if (editingClient && editingClient.id === client.id) {
        setEditingClient(null);
      }
    } catch (error) {
      console.error('Failed to update client assignee:', error);
    }
  };

  const getOtwCategory = (client) => {
    const status = client.otwStatus || 'NOT_CHECKED';

    if (status === 'NOT_CHECKED') {
      return {
        category: 'Not Checked',
        subcategory: 'CS belum isi status'
      };
    }

    if (status === 'URGENT' || status === 'URGENT_BERJALAN' || status === 'BENTAR_LAGI_MULAI') {
      return {
        category: 'OTW chat (prospect)',
        subcategory: 'Urgent karena sudah berjalan'
      };
    }

    if (status === 'FEE_KECIL_ATAU_GRATIS') {
      return {
        category: 'OTW chat (prospect)',
        subcategory: 'Fee kecil atau gratis'
      };
    }

    if (status === 'GADA_NOMER_HP_KONTAK' || status === 'NOMER_HP_KONTAK') {
      return {
        category: 'Nanti aja',
        subcategory: 'Udah berjalan untuk event tahun ini'
      };
    }

    if (status === 'GA_RELEVAN') {
      return {
        category: 'Gausah',
        subcategory: 'Ga relevan (iklan, promosi...)'
      };
    }

    return {
      category: 'OTW chat (prospect)',
      subcategory: 'Urgent karena sudah berjalan'
    };
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
      filtered = filtered.filter((client) => getOtwCategory(client).category === otwFilter);
    }

    setFilteredClients(filtered);
  };

  const handleOpenModal = (setter) => () => {
    setter(true);
    setTimeout(() => {
      setter(false);
    }, 3000);
  };

  return (
    <div className=crm-page>
      <div className=page-header>
        <h1>Client Management</h1>
        <div className=header-actions>
          <button
            onClick={() => setShowForm(true)}
            className=btn-add
          >
            + Add New Client
          </button>
          <button
            onClick={() => setShowWhatsAppQR(true)}
            className=btn-whatsapp
          >
            📱 WhatsApp QR
          </button>
        </div>
      </div>

      {loading ? (
        <div className=loading-spinner>
          <div className=spinner></div>
          <p>Loading clients...</p>
        </div>
      ) : (
        <>
          {showForm && (
            <ClientForm
              onClose={() => setShowForm(false)}
              onSuccess={() => {
                setShowForm(false);
                fetchClients();
              }}
            />
          )}

          {showChat && (
            <ChatModal
              client={selectedClient}
              onClose={() => setShowChat(false)}
            />
          )}

          {showDetail && (
            <ClientDetailModal
              client={selectedClient}
              onClose={() => setShowDetail(false)}
            />
          )}

          {showWhatsAppQR && (
            <WhatsAppQRModal onClose={() => setShowWhatsAppQR(false)} />
          )}

          {showBuildDemo && (
            <BuildDemoModal
              client={selectedClient}
              onClose={() => setShowBuildDemo(false)}
            />
          )}

          {showViewDemo && (
            <ViewDemoModal
              client={selectedClient}
              onClose={() => setShowViewDemo(false)}
            />
          )}

          <ClientTable
            clients={filteredClients}
            onEdit={(client) => {
              setSelectedClient(client);
              setEditingClient(client);
              setShowForm(true);
            }}
            onDelete={handleDelete}
            onChat={(client) => setShowChat(true)}
            onBuild={(client) => setShowBuildDemo(true)}
            onClientUpdate={fetchClients}
            onOtwStatusChange={(client, newStatus) => {
              const updatedClient = { ...client, otwStatus: newStatus };
              setClients(clients.map(c => c.id === client.id ? updatedClient : c));
            }}
            onAssigneeChange={handleAssigneeChange}
          />
        </>
      )}
    </div>
  );
};

export default CRMPage;
