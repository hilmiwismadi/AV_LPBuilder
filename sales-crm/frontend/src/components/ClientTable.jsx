import React, { useState } from 'react';
import './ClientTable.css';

const ClientTable = ({ clients, onEdit, onDelete, onChat, onBuild, onClientUpdate, onOtwStatusChange, onAssigneeChange }) => {
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

  // Generate a display ID for clients without phone numbers
  const getDisplayId = (client) => {
    // If client has scrapedPostId, use that to generate a readable ID
    if (client.scrapedPostId) {
      // Take last 8 characters of the UUID for a short readable ID
      const shortId = client.scrapedPostId.slice(-8).toUpperCase();
      return 'ID-' + shortId;
    }
    // Fallback: use last 8 chars of client ID
    return 'ID-' + client.id.slice(-8).toUpperCase();
  };

  // Format phone number or display ID
  const getPhoneDisplay = (client) => {
    // Show both phone (if available) AND unique ID for ALL clients
    const id = getDisplayId(client);
    if (client.phoneNumber) {
      return (
        <div className='phone-id-container'>
          <div className='phone-number'>
            {client.phoneNumber}
            {client.previousPhone && (
              <div className='previous-phone'>{client.previousPhone}</div>
            )}
          </div>
          <span className='display-id'>{id}</span>
        </div>
      );
    }
    // For clients without phone number, show only unique ID
    return <span className='display-id'>{id}</span>;
  };

  // Format assignee display
  const getAssigneeDisplay = (client) => {
    if (client.assignedBy) {
      const userStr = localStorage.getItem('user');
      const currentUser = userStr ? JSON.parse(userStr) : null;
      
      if (currentUser && currentUser.id === client.assignedBy) {
        return <span className='assignee-badge'>{currentUser.name}</span>;
      }
      
      if (client.picAdmin && client.picAdmin.name === client.assignedBy) {
        return <span className='assignee-badge'>{client.picAdmin.name}</span>;
      }
      
      if (client.pic && client.pic.substring(0, 8) === client.assignedBy) {
        return <span className='assignee-badge'>{client.pic.substring(0, 8)}...</span>;
      }
    }
    
    return <span className='assignee-badge unassigned'>Unassigned</span>;
  };

  return (
    <div className='client-table'>
      <table>
        <thead>
          <tr>
            <th className='col-id'>ID</th>
            <th className='col-organizer'>Event Organizer</th>
            <th className='col-assignee'>Assigned To</th>
            <th className='col-ig-link'>IG Link</th>
            <th className='col-contact'>Phone Number</th>
            <th className='col-otw-status'>OTW Status</th>
            <th className='col-pic'>PIC</th>
            <th className='col-last-contact'>Last Contact</th>
            <th className='col-actions'>Actions</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client, index) => (
            <tr key={client.id}>
              <td className='col-id'>{getDisplayId(client)}</td>
              <td className='col-organizer'>{client.eventOrganizer}</td>
              <td className='col-assignee'>{getAssigneeDisplay(client)}</td>
              <td className='col-ig-link'>
                {client.igLink ? (
                  <a href={client.igLink} target='_blank' rel='noopener noreferrer'>
                    {client.igLink}
                  </a>
                ) : (
                  <span>-</span>
                )}
              </td>
              <td className='col-contact'>{getPhoneDisplay(client)}</td>
              <td className='col-otw-status'>
                <div className={'status-badge status-' + getOtwCategory(client)}>
                  {getStatusLabel(client.otwStatus || 'NOT_CHECKED')}
                </div>
              </td>
              <td className='col-pic'>{getPicDisplay(client)}</td>
              <td className='col-last-contact'>{formatDate(client.lastContact)}</td>
              <td className='col-actions'>
                <div className='action-buttons'>
                  <button
                    onClick={() => onChat(client)}
                    className='btn-chat'
                    title='Chat'
                  >
                    💬
                  </button>
                  <button
                    onClick={() => onBuild(client)}
                    className='btn-build'
                    title={client.linkDemo ? 'Demo Created - Click to view' : 'Build Demo Landing Page'}
                  >
                    {client.linkDemo ? '✅' : '🏗️'}
                  </button>
                  <button
                    onClick={() => onAssigneeChange(client)}
                    className='btn-assign'
                    title='Assign Team Member'
                  >
                    👥
                  </button>
                  <button
                    onClick={() => onEdit(client)}
                    className='btn-edit'
                    title='Edit'
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => onDelete(client.id)}
                    className='btn-delete'
                    title='Delete'
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
