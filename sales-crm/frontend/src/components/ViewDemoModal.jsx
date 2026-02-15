import React from 'react';
import './ViewDemoModal.css';

const ViewDemoModal = ({ client, onClose, onRebuild }) => {
  const handleCopyLink = () => {
    if (client.linkDemo) {
      navigator.clipboard.writeText(client.linkDemo);
      alert('Link copied to clipboard!');
    }
  };

  const handleOpenDemo = () => {
    if (client.linkDemo) {
      window.open(client.linkDemo, '_blank');
    }
  };

  const handleRebuildClick = () => {
    onRebuild(client);
    onClose();
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this demo? This will remove it from both CRM and Landing Page.')) {
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/clients/${client.id}/delete-demo`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to delete demo');
      }

      alert('Demo deleted successfully!');
      onClose();
      window.location.reload();
    } catch (error) {
      console.error('Error deleting demo:', error);
      alert('Failed to delete demo. Please try again.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="view-demo-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>✅ Demo Landing Page</h3>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        <div className="modal-body">
          <div className="demo-info">
            <div className="info-row">
              <label>Event:</label>
              <span>{client.eventOrganizer}</span>
            </div>
            {client.eventType && (
              <div className="info-row">
                <label>Type:</label>
                <span>{client.eventType}</span>
              </div>
            )}
          </div>

          <div className="demo-link-section">
            <label>📎 Demo Link:</label>
            <a
              href={client.linkDemo}
              target="_blank"
              rel="noopener noreferrer"
              className="demo-link"
            >
              {client.linkDemo}
            </a>
          </div>

          {(client.imgLogo || client.imgPoster) && (
            <div className="demo-preview">
              <label>Preview:</label>
              <div className="preview-images">
                {client.imgLogo && (
                  <div className="preview-item">
                    <small>Logo</small>
                    <img src={client.imgLogo} alt="Logo" />
                  </div>
                )}
                {client.imgPoster && (
                  <div className="preview-item">
                    <small>Poster</small>
                    <img src={client.imgPoster} alt="Poster" />
                  </div>
                )}
              </div>
            </div>
          )}

          {client.colorPalette && (
            <div className="color-palette-display">
              <label>Color Palette:</label>
              <div className="palette-colors">
                {(() => {
                  try {
                    const palette = JSON.parse(client.colorPalette);
                    return (
                      <>
                        <div
                          className="color-swatch"
                          style={{ background: palette.color1 }}
                          title={palette.color1}
                        />
                        <div
                          className="color-swatch"
                          style={{ background: palette.color2 }}
                          title={palette.color2}
                        />
                      </>
                    );
                  } catch (e) {
                    return null;
                  }
                })()}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={handleCopyLink} className="btn-copy">
            📋 Copy Link
          </button>
          <button onClick={handleOpenDemo} className="btn-open">
            🔗 Open Demo
          </button>
          <button onClick={handleRebuildClick} className="btn-rebuild">
            ✏️ Edit Demo
          </button>
          <button onClick={handleDelete} className="btn-delete">
            🗑️ Delete Demo
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewDemoModal;
