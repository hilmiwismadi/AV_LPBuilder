import { useState, useEffect } from 'react';
import { format } from 'date-fns';

const ClientDetailModal = ({ client, onClose, onSave }) => {
  const [formData, setFormData] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (client) {
      setFormData({
        ...client,
        nextEventDate: client.nextEventDate
          ? new Date(client.nextEventDate).toISOString().split('T')[0]
          : '',
        lastContact: client.lastContact
          ? new Date(client.lastContact).toISOString().split('T')[0]
          : '',
        dateEstimation: client.dateEstimation
          ? new Date(client.dateEstimation).toISOString().split('T')[0]
          : '',
      });
    }
  }, [client]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const dataToSubmit = {
        ...formData,
        nextEventDate: formData.nextEventDate ? new Date(formData.nextEventDate).toISOString() : null,
        lastContact: formData.lastContact ? new Date(formData.lastContact).toISOString() : null,
        dateEstimation: formData.dateEstimation ? new Date(formData.dateEstimation).toISOString() : null,
      };
      await onSave(dataToSubmit);
      setIsEditing(false);
      // Stay in view mode after save so user can see the updated data
      // User can click Close to close the modal
    } catch (error) {
      // If save fails, keep modal open in edit mode
      console.error('Failed to save:', error);
    }
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return format(new Date(date), 'dd/MM/yyyy');
  };

  const renderField = (name, label, type = 'text', options = null) => {
    const value = formData[name] !== undefined && formData[name] !== null ? formData[name] : '';

    if (!isEditing) {
      // Display mode
      if (type === 'checkbox') {
        return <span className="detail-value">{value ? 'Yes' : 'No'}</span>;
      } else if (type === 'date') {
        return <span className="detail-value">{value ? formatDate(value) : '-'}</span>;
      } else if (type === 'url' && value) {
        return (
          <a href={value} target="_blank" rel="noopener noreferrer" className="detail-value detail-link">
            {value}
          </a>
        );
      } else if (type === 'textarea') {
        return <p className="detail-value detail-text">{value || '-'}</p>;
      } else if (type === 'select') {
        return <span className="detail-value">{value?.replace('_', ' ') || '-'}</span>;
      }
      return <span className="detail-value">{value || '-'}</span>;
    }

    // Edit mode
    if (type === 'checkbox') {
      return (
        <input
          type="checkbox"
          name={name}
          checked={Boolean(value)}
          onChange={handleChange}
          className="detail-input-checkbox"
          onClick={(e) => e.stopPropagation()}
        />
      );
    } else if (type === 'textarea') {
      return (
        <textarea
          name={name}
          value={value}
          onChange={handleChange}
          className="detail-input"
          rows="4"
          onClick={(e) => e.stopPropagation()}
        />
      );
    } else if (type === 'select') {
      return (
        <select
          name={name}
          value={value}
          onChange={handleChange}
          className="detail-input"
          onClick={(e) => e.stopPropagation()}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      );
    } else {
      return (
        <input
          type={type}
          name={name}
          value={value}
          onChange={handleChange}
          className="detail-input"
          onClick={(e) => e.stopPropagation()}
        />
      );
    }
  };

  const handleEditClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleCancelEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditing(false);
    // Reset form data to original client data
    if (client) {
      setFormData({
        ...client,
        nextEventDate: client.nextEventDate
          ? new Date(client.nextEventDate).toISOString().split('T')[0]
          : '',
        lastContact: client.lastContact
          ? new Date(client.lastContact).toISOString().split('T')[0]
          : '',
        dateEstimation: client.dateEstimation
          ? new Date(client.dateEstimation).toISOString().split('T')[0]
          : '',
      });
    }
  };

  const handleCloseClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleCloseClick}>
      <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="modal-header">
            <h2>Client Details: {formData.eventOrganizer}</h2>
            <button type="button" className="close-button" onClick={handleCloseClick}>×</button>
          </div>

          <div className="modal-body">
            {/* Basic Information */}
            <div className="detail-section">
              <h3 className="detail-section-title">Basic Information</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <label className="detail-label">Event Organizer:</label>
                  {renderField('eventOrganizer', 'Event Organizer')}
                </div>
                <div className="detail-item">
                  <label className="detail-label">Event Type:</label>
                  {renderField('eventType', 'Event Type')}
                </div>
                <div className="detail-item">
                  <label className="detail-label">Location:</label>
                  {renderField('location', 'Location')}
                </div>
                <div className="detail-item">
                  <label className="detail-label">Phone Number:</label>
                  {renderField('phoneNumber', 'Phone Number')}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="detail-section">
              <h3 className="detail-section-title">Contact Information</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <label className="detail-label">CP 1st Hand:</label>
                  {renderField('cp1st', 'CP 1st Hand')}
                </div>
                <div className="detail-item">
                  <label className="detail-label">CP 2nd Hand:</label>
                  {renderField('cp2nd', 'CP 2nd Hand')}
                </div>
                <div className="detail-item">
                  <label className="detail-label">Instagram Link:</label>
                  {renderField('igLink', 'Instagram Link', 'url')}
                </div>
                <div className="detail-item">
                  <label className="detail-label">IG Event Link:</label>
                  {renderField('igeventLink', 'IG Event Link', 'url')}
                </div>
                <div className="detail-item">
                  <label className="detail-label">Done Contact?:</label>
                  {renderField('doneContact', 'Done Contact', 'checkbox')}
                </div>
              </div>
            </div>

            {/* Event Details */}
            <div className="detail-section">
              <h3 className="detail-section-title">Event Details</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <label className="detail-label">Last Event:</label>
                  {renderField('lastEvent', 'Last Event')}
                </div>
                <div className="detail-item">
                  <label className="detail-label">Next Event Date:</label>
                  {renderField('nextEventDate', 'Next Event Date', 'date')}
                </div>
                <div className="detail-item">
                  <label className="detail-label">Price Range:</label>
                  {renderField('priceRange', 'Price Range')}
                </div>
                <div className="detail-item">
                  <label className="detail-label">Last System Used:</label>
                  {renderField('lastSystem', 'Last System Used')}
                </div>
                <div className="detail-item">
                  <label className="detail-label">Demo Link:</label>
                  {renderField('linkDemo', 'Demo Link', 'url')}
                </div>
              </div>
            </div>

            {/* Status & Management */}
            <div className="detail-section">
              <h3 className="detail-section-title">Status & Management</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <label className="detail-label">Status:</label>
                  {renderField('status', 'Status', 'select', [
                    { value: 'TODO', label: 'To Do' },
                    { value: 'FOLLOW_UP', label: 'Follow Up' },
                    { value: 'NEXT_YEAR', label: 'Next Year' },
                    { value: 'GHOSTED_FOLLOW_UP', label: 'Ghosted Follow Up' }
                  ])}
                </div>
                <div className="detail-item">
                  <label className="detail-label">Statistically:</label>
                  {renderField('statistically', 'Statistically')}
                </div>
                <div className="detail-item">
                  <label className="detail-label">PIC:</label>
                  {renderField('pic', 'PIC')}
                </div>
                <div className="detail-item">
                  <label className="detail-label">Last Contact:</label>
                  {renderField('lastContact', 'Last Contact', 'date')}
                </div>
                <div className="detail-item">
                  <label className="detail-label">Date Estimation:</label>
                  {renderField('dateEstimation', 'Date Estimation', 'date')}
                </div>
              </div>
            </div>

            {/* Design & Assets */}
            <div className="detail-section">
              <h3 className="detail-section-title">Design & Assets</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <label className="detail-label">Color Palette:</label>
                  {renderField('colorPalette', 'Color Palette')}
                </div>
                <div className="detail-item">
                  <label className="detail-label">Logo Image:</label>
                  {renderField('imgLogo', 'Logo Image', 'url')}
                </div>
                <div className="detail-item">
                  <label className="detail-label">Poster Image:</label>
                  {renderField('imgPoster', 'Poster Image', 'url')}
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="detail-section">
              <h3 className="detail-section-title">Notes</h3>
              <div className="detail-item-full">
                <label className="detail-label">Notes:</label>
                {renderField('notes', 'Notes', 'textarea')}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            {isEditing ? (
              <>
                <button type="button" className="secondary" onClick={handleCancelEdit}>
                  Cancel Edit
                </button>
                <button type="submit" className="primary">
                  Save Changes
                </button>
              </>
            ) : (
              <>
                <button type="button" className="secondary" onClick={handleCloseClick}>
                  Close
                </button>
                <button type="button" className="primary" onClick={handleEditClick}>
                  Edit
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientDetailModal;
