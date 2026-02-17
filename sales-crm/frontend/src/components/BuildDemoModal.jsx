import React, { useState } from 'react';
import './BuildDemoModal.css';

// Event type presets from Configuration Page
const EVENT_TYPE_PRESETS = {
  competition: {
    name: 'Competition',
    description: 'Perfect for contests and challenges',
    icon: '🏆',
    sections: {
      hero: true,
      about: true,
      categories: true,
      timeline: true,
      prizes: true,
      jury: false,
      documentation: false,
      instagram: true,
      sponsors: false,
      contact: true,
    }
  },
  seminar: {
    name: 'Seminar',
    description: 'Ideal for talks and presentations',
    icon: '👥',
    sections: {
      hero: true,
      about: true,
      categories: true,
      timeline: false,
      prizes: true,
      jury: true,
      documentation: false,
      instagram: true,
      sponsors: false,
      contact: true,
    }
  },
  workshop: {
    name: 'Workshop',
    description: 'Great for hands-on training sessions',
    icon: '⚙️',
    sections: {
      hero: true,
      about: true,
      categories: true,
      timeline: false,
      prizes: true,
      jury: true,
      documentation: false,
      instagram: true,
      sponsors: false,
      contact: true,
    }
  }
};

// Color palette presets from Landing Page
const COLOR_PRESETS = [
  { id: 'theme1', name: 'Purple Gradient', color1: '#667eea', color2: '#764ba2' },
  { id: 'theme2', name: 'Pink Gradient', color1: '#f093fb', color2: '#f5576c' },
  { id: 'theme3', name: 'Blue Gradient', color1: '#4facfe', color2: '#00f2fe' },
  { id: 'theme4', name: 'Green Gradient', color1: '#43e97b', color2: '#38f9d7' },
  { id: 'theme5', name: 'Warm Sunset', color1: '#fa709a', color2: '#fee140' },
  { id: 'theme6', name: 'Ocean Deep', color1: '#30cfd0', color2: '#330867' },
];
// Test images (small 100x100 red square for testing)
const TEST_LOGO_IMAGE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAA50lEQVR42u3RAQ0AAAjDMO5fNCCDkC5z0HTVrisFCBABIkAEiAARIAJEgAgQASJABIgAESACRIAIEAEiQASIABEgAkSACBABIkAEiAARIAJEgAgQASJABIgAESACRIAIEAEiQASIABEgAkSACBABIkAEiAARIAJEgAgQASJABIgAESACRIAIEAEiQASIABEgAkSACBABIkAEiAARIAJEgAgQASJABIgAESACRIAIEAEiQASIABEgAkSACBABIkAEiAARIAJEgAgQASJABIgAESACRIAIEAEiQASIABEgAkSACJCPeQP5JwThzejt+QAAAABJRU5ErkJggg==";
const TEST_POSTER_IMAGE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAA50lEQVR42u3RAQ0AAAjDMO5fNCCDkC5z0HTVrisFCBABIkAEiAARIAJEgAgQASJABIgAESACRIAIEAEiQASIABEgAkSACBABIkAEiAARIAJEgAgQASJABIgAESACRIAIEAEiQASIABEgAkSACBABIkAEiAARIAJEgAgQASJABIgAESACRIAIEAEiQASIABEgAkSACBABIkAEiAARIAJEgAgQASJABIgAESACRIAIEAEiQASIABEgAkSACBABIkAEiAARIAJEgAgQASJABIgAESACRIAIEAEiQASIABEgAkSACJCPeQP5JwThzejt+QAAAABJRU5ErkJggg==";

const BuildDemoModal = ({ client, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    eventName: client.eventOrganizer || '',
    eventType: 'competition',
    logoImage: null,
    posterImage: null,
    color1: '#667eea',
    color2: '#764ba2',
    selectedPreset: 'theme1',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingPoster, setUploadingPoster] = useState(false);

  // Image compression function - preserves PNG transparency
  const compressImage = (file, type) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          const isPNG = file.type === 'image/png';

          // Determine max dimension based on image type
          const maxDimension = type === 'logo' ? 800 : 1600;

          // Scale down if needed
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = (height / width) * maxDimension;
              width = maxDimension;
            } else {
              width = (width / height) * maxDimension;
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d', { alpha: true });
          if (isPNG) {
            ctx.clearRect(0, 0, width, height);
          }
          ctx.drawImage(img, 0, 0, width, height);

          let compressedDataUrl;
          const maxSize = 500 * 1024;

          if (isPNG) {
            // Use PNG format to preserve transparency
            compressedDataUrl = canvas.toDataURL('image/png');
            let scaleFactor = 1;
            while (compressedDataUrl.length > maxSize && scaleFactor > 0.5) {
              scaleFactor -= 0.1;
              const sw = Math.floor(canvas.width * scaleFactor);
              const sh = Math.floor(canvas.height * scaleFactor);
              const tmp = document.createElement('canvas');
              tmp.width = sw;
              tmp.height = sh;
              const tc = tmp.getContext('2d', { alpha: true });
              tc.clearRect(0, 0, sw, sh);
              tc.drawImage(canvas, 0, 0, sw, sh);
              compressedDataUrl = tmp.toDataURL('image/png');
            }
          } else {
            // Use JPEG with quality reduction for non-transparent images
            let quality = 0.9;
            compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
            while (compressedDataUrl.length > maxSize && quality > 0.3) {
              quality -= 0.1;
              compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
            }
          }

          resolve(compressedDataUrl);
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (type, file) => {
    if (!file) return;

    const setUploading = type === 'logo' ? setUploadingLogo : setUploadingPoster;
    setUploading(true);

    try {
      const compressed = await compressImage(file, type);
      setFormData(prev => ({
        ...prev,
        [type === 'logo' ? 'logoImage' : 'posterImage']: compressed
      }));
      setErrors(prev => ({ ...prev, [type]: '' }));
    } catch (error) {
      console.error('Error compressing image:', error);
      setErrors(prev => ({ ...prev, [type]: 'Failed to process image. Please try again.' }));
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (type) => (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(type, file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleColorPresetSelect = (preset) => {
    setFormData(prev => ({
      ...prev,
      color1: preset.color1,
      color2: preset.color2,
      selectedPreset: preset.id
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.eventName.trim()) {
      newErrors.eventName = 'Event name is required';
    }
    if (!formData.logoImage) {
      newErrors.logo = 'Logo image is required';
    }
    if (!formData.posterImage) {
      newErrors.poster = 'Poster image is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const eventPreset = EVENT_TYPE_PRESETS[formData.eventType];

      // Build the configuration data
      const configData = {
        eventName: formData.eventName,
        eventType: formData.eventType,
        eventDescription: eventPreset.description,
        logoImage: formData.logoImage,
        posterImage: formData.posterImage,
        color1: formData.color1,
        color2: formData.color2,
        sectionVisibility: eventPreset.sections,
      };

      // Call API (will implement in api.js)
      const response = await fetch(`/api/clients/${client.id}/build-demo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: 'include',
        body: JSON.stringify(configData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create demo');
      }

      const data = await response.json();
      setGeneratedLink(data.linkDemo);
      setShowSuccess(true);

      // Call success callback
      if (onSuccess) {
        onSuccess(data.linkDemo);
      }
    } catch (error) {
      console.error('Failed to create demo:', error);
      setErrors({ general: error.message || 'Failed to create demo. Please try again.' });
    } finally {
      setLoading(false);
    }
  };
  const handleAutoFill = () => {
    setFormData({
      eventName: client.eventOrganizer + " Test Demo",
      eventType: "competition",
      logoImage: TEST_LOGO_IMAGE,
      posterImage: TEST_POSTER_IMAGE,
      color1: "#667eea",
      color2: "#764ba2",
      selectedPreset: "theme1"
    });
    setErrors({});
  };


  const handleDeleteDemo = async () => {
    if (!confirm('Are you sure you want to delete this demo? This will remove it from both CRM and Landing Page.')) {
      return;
    }
    try {
      const response = await fetch(`/api/clients/${client.id}/delete-demo`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to delete demo');
      }
      alert('Demo deleted successfully!');
      if (onSuccess) {
        onSuccess(null);
      }
      onClose();
    } catch (error) {
      console.error('Failed to delete demo:', error);
      alert('Failed to delete demo. Please try again.');
    }
  };

  const handleEditDemo = () => {
    setShowSuccess(false);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    alert('Link copied to clipboard!');
  };



  if (showSuccess) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="build-demo-modal-content success-modal" onClick={(e) => e.stopPropagation()}>
          <div className="success-header">
            <h2>✅ Demo Created Successfully!</h2>
          </div>
          <div className="success-body">
            <p className="success-message">Your demo landing page is ready!</p>
            <div className="generated-link-box">
              <label>📎 Demo Link:</label>
              <div className="link-display">{generatedLink}</div>
            </div>
            <div className="success-actions">
              <button onClick={handleCopyLink} className="btn-copy">
                📋 Copy Link
              </button>
              <button
                onClick={() => window.open(generatedLink, '_blank')}
                className="btn-open"
              >
                🔗 Open in New Tab
              </button>
              <button onClick={handleEditDemo} className="btn-edit-demo">
                ✏️ Edit Demo
              </button>
              <button onClick={handleDeleteDemo} className="btn-delete-demo">
                🗑️ Delete Demo
              </button>
            </div>
          </div>
          <div className="success-footer">
            <button onClick={onClose} className="btn-close-success">
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="build-demo-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="build-demo-header">
          <div>
            <h2>🏗️ Build Demo Landing Page</h2>
            <p className="subtitle">Create a quick demo for your client</p>
            <button onClick={handleAutoFill} className="btn-autofill" title="Fill with test data">
              ⚡ Auto Fill
            </button>
          </div>
          <button onClick={onClose} className="close-btn" aria-label="Close modal">
            ×
          </button>
        </div>

        {errors.general && (
          <div className="error-banner">
            {errors.general}
          </div>
        )}

        <div className="build-demo-body">
          {/* Event Name */}
          <div className="form-group">
            <label htmlFor="eventName">Event Name *</label>
            <input
              type="text"
              id="eventName"
              value={formData.eventName}
              onChange={(e) => setFormData(prev => ({ ...prev, eventName: e.target.value }))}
              placeholder="e.g., Summer Music Festival 2025"
              className={errors.eventName ? 'error' : ''}
            />
            {errors.eventName && <span className="error-text">{errors.eventName}</span>}
          </div>

          {/* Event Type */}
          <div className="form-group">
            <label htmlFor="eventType">Event Type *</label>
            <select
              id="eventType"
              value={formData.eventType}
              onChange={(e) => setFormData(prev => ({ ...prev, eventType: e.target.value }))}
              className="event-type-select"
            >
              {Object.entries(EVENT_TYPE_PRESETS).map(([key, preset]) => (
                <option key={key} value={key}>
                  {preset.icon} {preset.name} - {preset.description}
                </option>
              ))}
            </select>
            <p className="form-hint">
              Sections enabled: {Object.entries(EVENT_TYPE_PRESETS[formData.eventType].sections)
                .filter(([_, visible]) => visible)
                .map(([section]) => section)
                .join(', ')}
            </p>
          </div>

          {/* Logo Upload */}
          <div className="form-group">
            <label>Logo Image *</label>
            <div
              className={`upload-zone ${errors.logo ? 'error' : ''}`}
              onDrop={handleDrop('logo')}
              onDragOver={handleDragOver}
              onClick={() => document.getElementById('logoInput').click()}
            >
              {uploadingLogo ? (
                <div className="uploading">📸 Compressing...</div>
              ) : formData.logoImage ? (
                <div className="preview">
                  <img src={formData.logoImage} alt="Logo preview" />
                  <p>✓ Logo uploaded</p>
                </div>
              ) : (
                <div className="upload-placeholder">
                  <span className="upload-icon">📸</span>
                  <p>Drag & Drop or Click to Upload</p>
                  <p className="upload-hint">Recommended: 800x800px</p>
                </div>
              )}
            </div>
            <input
              id="logoInput"
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload('logo', e.target.files[0])}
              style={{ display: 'none' }}
            />
            {errors.logo && <span className="error-text">{errors.logo}</span>}
          </div>

          {/* Poster Upload */}
          <div className="form-group">
            <label>Event Poster *</label>
            <div
              className={`upload-zone ${errors.poster ? 'error' : ''}`}
              onDrop={handleDrop('poster')}
              onDragOver={handleDragOver}
              onClick={() => document.getElementById('posterInput').click()}
            >
              {uploadingPoster ? (
                <div className="uploading">🖼️ Compressing...</div>
              ) : formData.posterImage ? (
                <div className="preview">
                  <img src={formData.posterImage} alt="Poster preview" />
                  <p>✓ Poster uploaded (will be used for Instagram section)</p>
                </div>
              ) : (
                <div className="upload-placeholder">
                  <span className="upload-icon">🖼️</span>
                  <p>Drag & Drop or Click to Upload</p>
                  <p className="upload-hint">Recommended: 1080x1920px</p>
                </div>
              )}
            </div>
            <input
              id="posterInput"
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload('poster', e.target.files[0])}
              style={{ display: 'none' }}
            />
            {errors.poster && <span className="error-text">{errors.poster}</span>}
          </div>

          {/* Color Palette */}
          <div className="form-group">
            <label>Color Palette *</label>
            <div className="color-presets">
              {COLOR_PRESETS.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => handleColorPresetSelect(preset)}
                  className={`color-preset-btn ${formData.selectedPreset === preset.id ? 'selected' : ''}`}
                  title={preset.name}
                >
                  <div
                    className="gradient-preview"
                    style={{
                      background: `linear-gradient(135deg, ${preset.color1}, ${preset.color2})`
                    }}
                  />
                  <span className="preset-name">{preset.name}</span>
                </button>
              ))}
            </div>
            <div className="custom-colors">
              <div className="color-picker-group">
                <label htmlFor="color1">Primary Color</label>
                <div className="color-input-wrapper">
                  <input
                    type="color"
                    id="color1"
                    value={formData.color1}
                    onChange={(e) => setFormData(prev => ({ ...prev, color1: e.target.value, selectedPreset: null }))}
                  />
                  <input
                    type="text"
                    value={formData.color1}
                    onChange={(e) => setFormData(prev => ({ ...prev, color1: e.target.value, selectedPreset: null }))}
                    className="color-hex-input"
                  />
                </div>
              </div>
              <div className="color-picker-group">
                <label htmlFor="color2">Secondary Color</label>
                <div className="color-input-wrapper">
                  <input
                    type="color"
                    id="color2"
                    value={formData.color2}
                    onChange={(e) => setFormData(prev => ({ ...prev, color2: e.target.value, selectedPreset: null }))}
                  />
                  <input
                    type="text"
                    value={formData.color2}
                    onChange={(e) => setFormData(prev => ({ ...prev, color2: e.target.value, selectedPreset: null }))}
                    className="color-hex-input"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="build-demo-footer">
          <button onClick={onClose} className="btn-cancel" disabled={loading}>
            Cancel
          </button>
          <button onClick={handleSubmit} className="btn-build" disabled={loading}>
            {loading ? '🔄 Building...' : '🚀 Build & Get Link'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuildDemoModal;
