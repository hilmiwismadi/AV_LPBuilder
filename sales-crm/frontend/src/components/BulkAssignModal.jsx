import React, { useState, useEffect } from 'react';
import { adminAPI, clientAPI } from '../services/api';
import './BulkAssignModal.css';

const BulkAssignModal = ({ sessionSlug, postCount, onClose, onBulkAssigned }) => {
  const [csAccounts, setCsAccounts] = useState([]);
  const [selectedCsIds, setSelectedCsIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCsList, setLoadingCsList] = useState(false);
  const [error, setError] = useState('');
  const [previewDistribution, setPreviewDistribution] = useState([]);

  useEffect(() => {
    fetchCsAccounts();
  }, []);

  const fetchCsAccounts = async () => {
    setLoadingCsList(true);
    try {
      const response = await adminAPI.getSalesList();
      setCsAccounts(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch CS accounts:', error);
      setError('Failed to load CS accounts');
    } finally {
      setLoadingCsList(false);
    }
  };

  const handleToggleCs = (csId) => {
    setSelectedCsIds(prev => {
      if (prev.includes(csId)) {
        return prev.filter(id => id !== csId);
      } else {
        return [...prev, csId];
      }
    });
  };

  const updatePreview = () => {
    if (selectedCsIds.length === 0) {
      setPreviewDistribution([]);
      return;
    }

    const selectedCs = csAccounts.filter(cs => selectedCsIds.includes(cs.id));
    const distribution = selectedCs.map(cs => ({
      id: cs.id,
      name: cs.name,
      role: cs.role,
      count: Math.ceil(postCount / selectedCsIds.length),
      startIdx: selectedCs.indexOf(cs) * Math.ceil(postCount / selectedCsIds.length) + 1,
      endIdx: Math.min((selectedCs.indexOf(cs) + 1) * Math.ceil(postCount / selectedCsIds.length), postCount)
    }));

    setPreviewDistribution(distribution);
  };

  useEffect(() => {
    updatePreview();
  }, [selectedCsIds, csAccounts, postCount]);

  const handleBulkAssign = async () => {
    if (selectedCsIds.length === 0) {
      setError('Please select at least one CS team member');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await clientAPI.bulkAssign(sessionSlug, selectedCsIds);

      if (response.data.success) {
        const result = response.data.data;
        onBulkAssigned(result);
      } else {
        setError('Failed to bulk assign');
      }
    } catch (error) {
      setError(error.response?.data?.error || error.message || 'Failed to bulk assign');
    } finally {
      setLoading(false);
    }
  };

  if (loadingCsList) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Bulk Assign Events</h2>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
          <div className="modal-body">
            <p>Loading CS team members...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content bulk-assign-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Bulk Assign Events</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="bulk-assign-info">
            <p><strong>Total Events:</strong> {postCount}</p>
            <p className="info-text">Events will be distributed evenly (round-robin) among selected CS members.</p>
          </div>

          {error && (
            <div className="error-message">{error}</div>
          )}

          <div className="cs-selection">
            <h3>Select CS Team Members</h3>
            {csAccounts.length === 0 ? (
              <p className="empty-message">No CS team members available</p>
            ) : (
              <div className="cs-list">
                {csAccounts.map(cs => (
                  <label key={cs.id} className="cs-checkbox-label">
                    <input
                      type="checkbox"
                      checked={selectedCsIds.includes(cs.id)}
                      onChange={() => handleToggleCs(cs.id)}
                    />
                    <span className="cs-info">
                      <strong>{cs.name}</strong>
                      <span className="cs-role">({cs.role})</span>
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {selectedCsIds.length > 0 && (
            <div className="distribution-preview">
              <h3>Distribution Preview</h3>
              <div className="preview-grid">
                {previewDistribution.map(item => (
                  <div key={item.id} className="preview-item">
                    <div className="preview-name">{item.name}</div>
                    <div className="preview-count">{item.count} events</div>
                    <div className="preview-range">#{item.startIdx} - #{item.endIdx}</div>
                  </div>
                ))}
              </div>
            </div>
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
            className="btn-primary bulk-assign-btn"
            onClick={handleBulkAssign}
            disabled={loading || selectedCsIds.length === 0}
          >
            {loading ? 'Assigning...' : 'Assign to ' + selectedCsIds.length + ' CS' + (selectedCsIds.length !== 1 ? 's' : '')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkAssignModal;
