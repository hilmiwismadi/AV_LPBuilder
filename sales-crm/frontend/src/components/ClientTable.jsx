import React from 'react';
import './ClientTable.css';

const ClientTable = ({ clients, onEdit, onDelete, onChat }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'TODO':
        return '#6c757d';
      case 'FOLLOW_UP':
        return '#ffc107';
      case 'NEXT_YEAR':
        return '#17a2b8';
      case 'GHOSTED_FOLLOW_UP':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'TODO':
        return 'To Do';
      case 'FOLLOW_UP':
        return 'Follow Up';
      case 'NEXT_YEAR':
        return 'Next Year';
      case 'GHOSTED_FOLLOW_UP':
        return 'Ghosted';
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPicDisplay = (client) => {
    const userStr = localStorage.getItem('user');
    const currentUser = userStr ? JSON.parse(userStr) : null;

    // If picAdmin exists (from backend), use it
    if (client.picAdmin) {
      if (currentUser?.id === client.pic) {
        return 'You';
      }
      return client.picAdmin.email || client.picAdmin.name || '-';
    }

    // Fallback to old behavior if picAdmin not available
    if (client.pic) {
      if (currentUser?.id === client.pic) return 'You';
      return client.pic.substring(0, 8) + '...';
    }

    return '-';
  };

  if (clients.length === 0) {
    return (
      <div className="empty-state">
        <p>No clients found. Add your first client to get started!</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="client-table">
        <thead>
          <tr>
            <th>Event Organizer</th>
            <th>Phone Number</th>
            <th>PIC</th>
            <th>Status</th>
            <th>Last Contact</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr key={client.id}>
              <td>
                <div className="organizer-name">
                  <strong>{client.eventOrganizer}</strong>
                  {client.eventType && (
                    <small className="event-type">{client.eventType}</small>
                  )}
                </div>
              </td>
              <td>{client.phoneNumber}</td>
              <td>{getPicDisplay(client)}</td>
              <td>
                <span
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(client.status) }}
                >
                  {getStatusLabel(client.status)}
                </span>
              </td>
              <td>{formatDate(client.lastContact)}</td>
              <td>
                <div className="action-buttons">
                  <button
                    onClick={() => onChat(client)}
                    className="btn-chat"
                    title="Chat"
                  >
                    💬
                  </button>
                  <button
                    onClick={() => onEdit(client)}
                    className="btn-edit"
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => onDelete(client.id)}
                    className="btn-delete"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ClientTable;
