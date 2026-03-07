import React, { useState } from 'react';
import { clientAPI } from '../services/api';
import './BulkUnassignModal.css';

const BulkUnassignModal = ({ sessionSlug, postCount, onClose, onBulkUnassigned }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleBulkUnassign = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await clientAPI.bulkUnassign(sessionSlug);

      if (response.data.success) {
        const result = response.data.data;
        onBulkUnassigned(result);
      } else {
        setError('Failed to bulk unassign');
      }
    } catch (error) {
      setError(error.response?.data?.error || error.message || 'Failed to bulk unassign');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content bulk-unassign-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Bulk Unassign Events</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="bulk-unassign-info">
            <p><strong>Total Events:</strong> {postCount}</p>
            <p className="warning-text">
              This will clear the assignee (PIC) from all clients in this session.
              The clients will remain in the system but will no longer be assigned to anyone.
            </p>
            <p className="info-text">Only events with phone numbers will be affected.</p>
          </div>

          {error && (
            <div className="error-message">{error}</div>
          )}
        </div>

        <div className="modal-footer">
          <button
            className="btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="btn-primary bulk-unassign-confirm-btn"
            onClick={handleBulkUnassign}
            disabled={loading}
          >
            {loading ? 'Unassigning...' : 'Unassign All'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkUnassignModal;
