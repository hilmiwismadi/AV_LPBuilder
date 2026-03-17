import React, { useState, useRef } from 'react';
import './ClientTable.css';

const ClientTable = ({ clients, onEdit, onDelete, onChat, onBuild, onClientUpdate, onOtwStatusChange }) => {
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
  // Post-chat status colors and labels
  const getChatStatusColor = (status) => {
    switch (status) {
      case 'PUSH':
        return '#28a745'; // Green - high priority
      case 'FOLLOW_UP':
        return '#ffc107'; // Yellow - needs follow up
      case 'NEXT_YEAR':
        return '#17a2b8'; // Cyan - next year
      case 'CANCELLED':
        return '#dc3545'; // Red - cancelled
      case 'TODO':
      default:
        return '#6c757d'; // Gray - not started
    }
  };

  const getChatStatusLabel = (status) => {
    switch (status) {
      case 'PUSH':
        return 'Push';
      case 'FOLLOW_UP':
        return 'Follow Up';
      case 'NEXT_YEAR':
        return 'Next Year';
      case 'CANCELLED':
        return 'Cancelled';
      case 'TODO':
      default:
        return 'To Do';
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
        <div className="phone-id-container">
          <div className="phone-number">
            {client.phoneNumber}
            {client.previousPhone && (
              <div className="previous-phone">{client.previousPhone}</div>
            )}
          </div>
          <span className="display-id">{id}</span>
        </div>
      );
    }
    // For clients without phone number, show only the unique ID
    return <span className="display-id">{id}</span>;
  };

  // OTW Status categories and subcategories
  const otwCategories = {
    'Not Checked': {
      subcategories: ['CS belum isi status'],
      color: '#dc3545',
      backgroundColor: '#fee'
    },
    'OTW chat (prospect)': {
      subcategories: ['Urgent karena sudah berjalan', 'Bentar lagi mulai', 'Etc']
    },
    'Nanti aja': {
      subcategories: ['Fee kecil atau gratis', 'Udah berjalan untuk event tahun ini', 'HP di gambar/gforms bukan caption', 'Etc']
    },
    'Gausah': {
      subcategories: ['Ga relevan (iklan, promosi…)', 'Gada nomer HP/dikontak', 'Etc']
    }
  };

  // Parse current status to find category and subcategory
  const parseOtwStatus = (client) => {
    const status = client.otwStatus || 'NOT_CHECKED';

    // Handle Not Checked status first
    if (status === 'NOT_CHECKED') {
      return {
        category: 'Not Checked',
        subcategory: 'CS belum isi status'
      };
    }

    // Map status to category/subcategory
    let category = 'OTW chat (prospect)';
    let subcategory = 'Urgent karena sudah berjalan';

    if (status === 'URGENT' || status === 'URGENT_BERJALAN' || status === 'BENTAR_LAGI_MULAI') {
      category = 'OTW chat (prospect)';
      if (status === 'URGENT_BERJALAN') subcategory = 'Urgent karena sudah berjalan';
      else if (status === 'BENTAR_LAGI_MULAI') subcategory = 'Bentar lagi mulai';
      else subcategory = 'Urgent karena sudah berjalan';
    } else if (status === 'FEE_KECIL_ATAU_GRATIS') {
      category = 'Nanti aja';
      subcategory = 'Fee kecil atau gratis';
    } else if (status.startsWith('UDAH_BERJALAN')) {
      category = 'Nanti aja';
      subcategory = 'Udah berjalan untuk event tahun ini';
    } else if (status.startsWith('HP_DI_GAMBAR')) {
      category = 'Nanti aja';
      subcategory = 'HP di gambar/gforms bukan caption';
    } else if (status === 'GA_RELEVAN') {
      category = 'Gausah';
      subcategory = 'Ga relevan (iklan, promosi…)';
    } else if (status === 'GADA_NOMER_HP' || status === 'NOMER_HP_KONTAK') {
      category = 'Gausah';
      subcategory = 'Gada nomer HP/dikontak';
    } else if (status.startsWith('ETC_')) {
      // Extract category from status
      if (status.startsWith('ETC_OTW_')) category = 'OTW chat (prospect)';
      else if (status.startsWith('ETC_NANTI_')) category = 'Nanti aja';
      else if (status.startsWith('ETC_GAUSAH_')) category = 'Gausah';
      subcategory = 'Etc';
    } else if (status.startsWith('ETC_TEXT_')) {
      // Find which category based on stored value
      const categoryNum = status.replace('ETC_TEXT_', '').split('_')[0];
      if (categoryNum === '0') category = 'OTW chat (prospect)';
      else if (categoryNum === '1') category = 'Nanti aja';
      else if (categoryNum === '2') category = 'Gausah';
      subcategory = 'Etc';
    }

    return { category, subcategory };
  };

  // Generate status value for storage
  const generateStatusValue = (category, subcategory, customText) => {
    // Handle Not Checked category
    if (category === 'Not Checked') {
      return 'NOT_CHECKED';
    }

    if (subcategory === 'Etc' && customText) {
      // Store as ETC_TEXT_[categoryNum]_[timestamp]_[text]
      const categoryNum = category === 'OTW chat (prospect)' ? '0' :
                        category === 'Nanti aja' ? '1' : '2';
      return `ETC_TEXT_${categoryNum}_${Date.now()}_${customText}`;
    }

    // Map subcategory to status value
    if (category === 'OTW chat (prospect)') {
      if (subcategory === 'Urgent karena sudah berjalan') return 'URGENT_BERJALAN';
      if (subcategory === 'Bentar lagi mulai') return 'BENTAR_LAGI_MULAI';
      if (subcategory === 'Etc') return 'ETC_OTW_PROSPECT';
      return 'URGENT';
    }

    if (category === 'Nanti aja') {
      if (subcategory === 'Fee kecil atau gratis') return 'FEE_KECIL_ATAU_GRATIS';
      if (subcategory === 'Udah berjalan untuk event tahun ini') return 'UDAH_BERJALAN_TAHUN_INI';
      if (subcategory === 'HP di gambar/gforms bukan caption') return 'HP_DI_GAMBAR_GFORMS';
      if (subcategory === 'Etc') return 'ETC_NANTI_AJA';
    }

    if (category === 'Gausah') {
      if (subcategory === 'Ga relevan (iklan, promosi…)') return 'GA_RELEVAN';
      if (subcategory === 'Gada nomer HP/dikontak') return 'GADA_NOMER_HP';
      if (subcategory === 'Etc') return 'ETC_GAUSAH';
    }

    return 'OTW_PROSPECT';
  };

  // Handle OTW category change
  const handleCategoryChange = (client, newCategory) => {
    const defaultSubcategory = otwCategories[newCategory].subcategories[0];
    handleOtwStatusChange(client, newCategory, defaultSubcategory);
  };

  // Handle OTW subcategory change
  const handleSubcategoryChange = (client, category, newSubcategory) => {
    handleOtwStatusChange(client, category, newSubcategory);
  };

  // Handle custom "Etc" text input
  const handleEtcTextChange = (client, category, text) => {
    handleOtwStatusChange(client, category, 'Etc', text);
  };

  // Handle OTW status change
  const handleOtwStatusChange = (client, category, subcategory, customText = '') => {
    if (onOtwStatusChange) {
      const statusValue = generateStatusValue(category, subcategory, customText);
      onOtwStatusChange(client, statusValue);
    }
  };
  // Handle post-chat status change
  const handleChatStatusChange = (client, newStatus) => {
    if (onStatusChange) {
      onStatusChange(client, newStatus);
    }
  };

  // Editable Event Organizer component
  const EditableOrganizer = ({ client }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(client.eventOrganizer || '');
    const inputRef = useRef(null);

    const handleDoubleClick = () => {
      setIsEditing(true);
      setValue(client.eventOrganizer || '');
    };

    const handleSave = () => {
      if (value.trim() && value.trim() !== client.eventOrganizer) {
        if (onClientUpdate) {
          onClientUpdate(client, { eventOrganizer: value.trim() });
        }
      }
      setIsEditing(false);
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSave();
      } else if (e.key === 'Escape') {
        setIsEditing(false);
        setValue(client.eventOrganizer || '');
      }
    };

    const handleBlur = () => {
      handleSave();
    };

    React.useEffect(() => {
      if (isEditing && inputRef.current) {
        inputRef.current.focus();
      }
    }, [isEditing]);

    return (
      <div onDoubleClick={handleDoubleClick} className="editable-organizer">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            className="organizer-edit-input"
            autoFocus
          />
        ) : (
          <div className="organizer-name">
            <strong>{client.eventOrganizer}</strong>
            {client.eventType && (
              <small className="event-type">{client.eventType}</small>
            )}
          </div>
        )}
      </div>
    );
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
            <th className="col-organizer">Event Organizer</th>
            <th className="col-ig-link">IG Link</th>
            <th className="col-contact">Contact</th>
            <th className="col-otw-status">OTW Status</th>
            <th className="col-chat-status">Chat Status</th>
            <th className="col-pic">PIC</th>
            <th className="col-last-contact">Last Contact</th>
            <th className="col-actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => {
            const { category, subcategory } = parseOtwStatus(client);
            const currentChatStatus = client.status || TODO;
            const isEtc = subcategory === 'Etc';
            const isEtcWithText = client.otwStatus?.startsWith('ETC_TEXT_');

            return (
              <tr key={client.id}>
                <td className="col-organizer">
                  <EditableOrganizer client={client} />
                </td>
                <td className="col-ig-link">
                  {client.igLink ? (
                    <a
                      href={client.igLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ig-link"
                    >
                      📱 View Post
                    </a>
                  ) : '-'}
                </td>
                <td className="col-contact">{getPhoneDisplay(client)}</td>
                <td className="col-otw-status">
                  <div className="otw-dropdowns">
                    <select
                      className="otw-category-select"
                      value={category}
                      onChange={(e) => handleCategoryChange(client, e.target.value)}
                    >
                      {Object.keys(otwCategories).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <select
                      className="otw-subcategory-select"
                      value={subcategory}
                      onChange={(e) => handleSubcategoryChange(client, category, e.target.value)}
                    >
                      {otwCategories[category].subcategories.map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                    {isEtc && (
                      <input
                        type="text"
                        className="otw-etc-input"
                        placeholder="Specify reason..."
                        value={isEtcWithText ? client.otwStatus?.split('_').pop() : ''}
                        onChange={(e) => handleEtcTextChange(client, category, e.target.value)}
                      />
                    )}
                <td className="col-chat-status">
                  <select
                      className="chat-status-select"
                    value={currentChatStatus}
                    onChange={(e) => handleChatStatusChange(client, e.target.value)}
                    style={{
                      backgroundColor: getChatStatusColor(currentChatStatus),
                      color: '#fff',
                      fontWeight: 'bold'
                    }}
                  >
                    {['TODO', 'PUSH', 'FOLLOW_UP', 'NEXT_YEAR', 'CANCELLED'].map(status => (
                      <option key={status} value={status}>
                        {getChatStatusLabel(status)}
                      </option>
                    ))}
                  </select>
                </td>
                  </div>
                </td>
                <td className="col-pic">{getPicDisplay(client)}</td>
                <td className="col-last-contact">{formatDate(client.lastContact)}</td>
                <td className="col-actions">
                  <div className="action-buttons">
                    <button
                      onClick={() => onChat(client)}
                      className="btn-chat"
                      title="Chat"
                    >
                      💬
                    </button>
                    <button
                      onClick={() => onBuild(client)}
                      className="btn-build"
                      title={client.linkDemo ? "Demo Created - Click to view" : "Build Demo Landing Page"}
                    >
                      {client.linkDemo ? '✅' : '🏗️'}
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
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ClientTable;
