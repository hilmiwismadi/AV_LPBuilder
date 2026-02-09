import React, { useState, useEffect } from 'react';
import './ClientDetailModal.css';

const ClientDetailModal = ({ client, onSave, onCancel, onClose }) => {
  const [formData, setFormData] = useState({
    phoneNumber: '',
    eventOrganizer: '',
    status: 'TODO',
    notes: '',
    igLink: '',
    cp1st: '',
    cp2nd: '',
    location: '',
    eventType: '',
    priceRange: '',
  });

  const [errors, setErrors] = useState({});

  // Support both onCancel and onClose props
  const handleClose = onCancel || onClose;

  useEffect(() => {
    if (client) {
      setFormData({
        phoneNumber: client.phoneNumber || '',
        eventOrganizer: client.eventOrganizer || '',
        status: client.status || 'TODO',
        notes: client.notes || '',
        igLink: client.igLink || '',
        cp1st: client.cp1st || '',
        cp2nd: client.cp2nd || '',
        location: client.location || '',
        eventType: client.eventType || '',
        priceRange: client.priceRange || '',
      });
    }
  }, [client]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    }
    if (!formData.eventOrganizer.trim()) {
      newErrors.eventOrganizer = 'Event organizer name is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData);
    }
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Client Details</h2>
          <button onClick={handleClose} className="close-btn" aria-label="Close modal">×</button>
        </div>
        <form onSubmit={handleSubmit} className="client-detail-form">
          <div className="detail-section">
            <h3>Contact Information</h3>
            <div className="form-group">
              <label htmlFor="eventOrganizer">Event Organizer *</label>
              <input
                type="text"
                id="eventOrganizer"
                name="eventOrganizer"
                value={formData.eventOrganizer}
                onChange={handleChange}
                className={errors.eventOrganizer ? 'error' : ''}
              />
              {errors.eventOrganizer && <span className="error-text">{errors.eventOrganizer}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="phoneNumber">Phone Number *</label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className={errors.phoneNumber ? 'error' : ''}
              />
              {errors.phoneNumber && <span className="error-text">{errors.phoneNumber}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="igLink">Instagram Link</label>
              <input
                type="text"
                id="igLink"
                name="igLink"
                value={formData.igLink}
                onChange={handleChange}
                placeholder="https://instagram.com/..."
              />
            </div>
            <div className="form-group">
              <label htmlFor="cp1st">Contact Person 1</label>
              <input
                type="text"
                id="cp1st"
                name="cp1st"
                value={formData.cp1st}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="cp2nd">Contact Person 2</label>
              <input
                type="text"
                id="cp2nd"
                name="cp2nd"
                value={formData.cp2nd}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="location">Location</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="detail-section">
            <h3>Event Information</h3>
            <div className="form-group">
              <label htmlFor="eventType">Event Type</label>
              <input
                type="text"
                id="eventType"
                name="eventType"
                value={formData.eventType}
                onChange={handleChange}
                placeholder="e.g., Concert, Conference, Wedding"
              />
            </div>
            <div className="form-group">
              <label htmlFor="priceRange">Price Range</label>
              <input
                type="text"
                id="priceRange"
                name="priceRange"
                value={formData.priceRange}
                onChange={handleChange}
                placeholder="e.g., ,000 - 0,000"
              />
            </div>
          </div>
          <div className="detail-section">
            <h3>Status & Notes</h3>
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="TODO">To Do</option>
                <option value="FOLLOW_UP">Follow Up</option>
                <option value="NEXT_YEAR">Next Year</option>
                <option value="GHOSTED_FOLLOW_UP">Ghosted Follow Up</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                placeholder="Add any additional notes here..."
              />
            </div>
          </div>
          <div className="form-actions">
            <button type="button" onClick={handleClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="save-btn">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientDetailModal;
