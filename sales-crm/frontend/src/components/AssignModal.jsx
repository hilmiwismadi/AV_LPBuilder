import React, { useState, useEffect } from 'react';
import { adminAPI, clientAPI } from '../services/api';
import './AssignModal.css';

const AssignModal = ({ postId, postTitle, onClose, onAssigned }) => {
  const [salesAccounts, setSalesAccounts] = useState([]);
  const [selectedPic, setSelectedPic] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get current user
    const userStr = localStorage.getItem('user');
    const currentUser = userStr ? JSON.parse(userStr) : null;
    setUser(currentUser);

    // Only fetch sales list if superadmin
    if (currentUser?.role === 'SUPERADMIN') {
      fetchSalesAccounts();
    }
  }, []);

  const fetchSalesAccounts = async () => {
    try {
      const response = await adminAPI.getSalesList();
      setSalesAccounts(response.data.data);
    } catch (error) {
      console.error('Failed to fetch sales accounts:', error);
    }
  };

  const handleAssign = async () => {
    setLoading(true);
    try {
      await clientAPI.assign(postId, selectedPic);
      onAssigned();
    } catch (error) {
      alert('Failed to assign: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const isSuperadmin = user?.role === 'SUPERADMIN';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Assign Client</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <p><strong>Event:</strong> {postTitle}</p>

          {isSuperadmin ? (
            <div className="form-group">
              <label>Assign to:</label>
              <select
                value={selectedPic}
                onChange={(e) => setSelectedPic(e.target.value)}
                required
              >
                <option value="">Select sales account...</option>
                {salesAccounts.map(account => (
                  <option key={account.id} value={account.id}>
                    {account.name} ({account.role})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <p>This will be assigned to you.</p>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button
            className="btn-primary"
            onClick={handleAssign}
            disabled={loading || (isSuperadmin && !selectedPic)}
          >
            {loading ? 'Assigning...' : 'Assign'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignModal;
