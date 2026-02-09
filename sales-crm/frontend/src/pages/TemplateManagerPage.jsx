import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './TemplateManagerPage.css';

const TemplateManagerPage = () => {
  const [templates, setTemplates] = useState({});
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterEnabled, setFilterEnabled] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [availableVariables, setAvailableVariables] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    message: '',
    description: '',
    tags: [],
    enabled: true
  });

  useEffect(() => {
    fetchTemplates();
    fetchAvailableVariables();
  }, [filterCategory, filterEnabled, searchTerm]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterCategory !== 'all') params.append('category', filterCategory);
      if (filterEnabled !== 'all') params.append('enabled', filterEnabled);
      if (searchTerm) params.append('search', searchTerm);

      const response = await api.get(`/templates?${params}`);
      setTemplates(response.data.templates);
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableVariables = async () => {
    try {
      const response = await api.get('/templates/meta/variables');
      setAvailableVariables(response.data.variables);
    } catch (error) {
      console.error('Error fetching variables:', error);
    }
  };

  const handleOpenModal = (template = null) => {
    if (template) {
      setEditingTemplate(template);
      setFormData({
        name: template.name,
        category: template.category,
        message: template.message,
        description: template.description || '',
        tags: template.tags || [],
        enabled: template.enabled
      });
    } else {
      setEditingTemplate(null);
      setFormData({
        name: '',
        category: '',
        message: '',
        description: '',
        tags: [],
        enabled: true
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTemplate(null);
    setFormData({
      name: '',
      category: '',
      message: '',
      description: '',
      tags: [],
      enabled: true
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTemplate) {
        await api.put(`/templates/${editingTemplate.id}`, formData);
      } else {
        await api.post('/templates', formData);
      }
      handleCloseModal();
      fetchTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      alert(error.response?.data?.error || 'Failed to save template');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return;

    try {
      await api.delete(`/templates/${id}`);
      fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Failed to delete template');
    }
  };

  const handleToggle = async (id) => {
    try {
      await api.patch(`/templates/${id}/toggle`);
      fetchTemplates();
    } catch (error) {
      console.error('Error toggling template:', error);
    }
  };

  const handleDuplicate = async (id) => {
    try {
      await api.post(`/templates/${id}/duplicate`);
      fetchTemplates();
    } catch (error) {
      console.error('Error duplicating template:', error);
      alert('Failed to duplicate template');
    }
  };

  const handlePreview = (template) => {
    setPreviewData(template);
    setShowPreviewModal(true);
  };

  const getDetectedVariables = (message) => {
    const pattern = /\{([^}]+)\}/g;
    const matches = message?.match(pattern) || [];
    return [...new Set(matches.map(m => m.replace(/[{}]/g, '')))];
  };

  const totalTemplates = Object.values(templates).flat().length;
  const enabledCount = Object.values(templates).flat().filter(t => t.enabled).length;

  return (
    <div className="template-manager-page">
      <div className="template-header">
        <div className="template-title">
          <h1>📋 Chat Template Management</h1>
          <p>Manage your cold chat templates for faster communication</p>
        </div>
        <button className="btn-primary" onClick={() => handleOpenModal()}>
          + New Template
        </button>
      </div>

      {/* Stats */}
      <div className="template-stats">
        <div className="stat-card">
          <div className="stat-value">{totalTemplates}</div>
          <div className="stat-label">Total Templates</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{enabledCount}</div>
          <div className="stat-label">Active</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{categories.length}</div>
          <div className="stat-label">Categories</div>
        </div>
      </div>

      {/* Filters */}
      <div className="template-filters">
        <div className="filter-group">
          <input
            type="text"
            placeholder="🔍 Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-group">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <select
            value={filterEnabled}
            onChange={(e) => setFilterEnabled(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="true">Enabled</option>
            <option value="false">Disabled</option>
          </select>
        </div>
      </div>

      {/* Template List */}
      {loading ? (
        <div className="loading-state">Loading templates...</div>
      ) : Object.keys(templates).length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No templates found</h3>
          <p>Try adjusting your filters or create a new template</p>
          <button className="btn-primary" onClick={() => handleOpenModal()}>
            Create First Template
          </button>
        </div>
      ) : (
        <div className="template-list">
          {Object.entries(templates).map(([category, categoryTemplates]) => (
            <div key={category} className="template-category">
              <h3 className="category-title">{category}</h3>
              <div className="template-grid">
                {categoryTemplates.map(template => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onEdit={() => handleOpenModal(template)}
                    onDelete={() => handleDelete(template.id)}
                    onToggle={() => handleToggle(template.id)}
                    onDuplicate={() => handleDuplicate(template.id)}
                    onPreview={() => handlePreview(template)}
                    availableVariables={availableVariables}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <TemplateModal
          template={editingTemplate}
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          onClose={handleCloseModal}
          availableVariables={availableVariables}
          categories={categories}
        />
      )}

      {/* Preview Modal */}
      {showPreviewModal && previewData && (
        <PreviewModal
          template={previewData}
          onClose={() => setShowPreviewModal(false)}
          availableVariables={availableVariables}
        />
      )}
    </div>
  );
};

// Template Card Component
const TemplateCard = ({ template, onEdit, onDelete, onToggle, onDuplicate, onPreview, availableVariables }) => {
  const detectedVars = React.useMemo(() => {
    const pattern = /\{([^}]+)\}/g;
    const matches = template.message?.match(pattern) || [];
    return [...new Set(matches.map(m => m.replace(/[{}]/g, '')))];
  }, [template.message]);

  const getVariableLabel = (key) => {
    const found = availableVariables.find(v => v.key === key);
    return found ? found.label : key;
  };

  return (
    <div className={`template-card ${!template.enabled ? 'disabled' : ''}`}>
      <div className="card-header">
        <div className="card-title">
          <h4>{template.name}</h4>
          <span className={`status-badge ${template.enabled ? 'enabled' : 'disabled'}`}>
            {template.enabled ? '✓ Active' : '○ Disabled'}
          </span>
        </div>
        <div className="card-actions">
          <button onClick={onToggle} className="icon-btn" title={template.enabled ? 'Disable' : 'Enable'}>
            {template.enabled ? '🔒' : '🔓'}
          </button>
          <button onClick={onDuplicate} className="icon-btn" title="Duplicate">
            📋
          </button>
          <button onClick={onPreview} className="icon-btn" title="Preview">
            👁️
          </button>
          <button onClick={onEdit} className="icon-btn" title="Edit">
            ✏️
          </button>
          <button onClick={onDelete} className="icon-btn danger" title="Delete">
            🗑️
          </button>
        </div>
      </div>

      {template.description && (
        <p className="card-description">{template.description}</p>
      )}

      <div className="card-message">
        {template.message.length > 150
          ? template.message.substring(0, 150) + '...'
          : template.message}
      </div>

      {detectedVars.length > 0 && (
        <div className="card-variables">
          <span className="variables-label">Variables:</span>
          {detectedVars.map(v => (
            <span key={v} className="variable-tag">{`{${getVariableLabel(v)}}`}</span>
          ))}
        </div>
      )}

      <div className="card-footer">
        <div className="usage-info">
          <span>📊 Used {template.usageCount || 0} times</span>
        </div>
        {template.tags && template.tags.length > 0 && (
          <div className="card-tags">
            {template.tags.map(tag => (
              <span key={tag} className="tag">#{tag}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Template Modal Component
const TemplateModal = ({ template, formData, setFormData, onSubmit, onClose, availableVariables, categories }) => {
  const [previewMessage, setPreviewMessage] = useState('');

  const detectedVars = React.useMemo(() => {
    const pattern = /\{([^}]+)\}/g;
    const matches = formData.message?.match(pattern) || [];
    return [...new Set(matches.map(m => m.replace(/[{}]/g, '')))];
  }, [formData.message]);

  useEffect(() => {
    let preview = formData.message;
    detectedVars.forEach(v => {
      const placeholder = `{${v}}`;
      preview = preview.replace(new RegExp(placeholder, 'g'), `[${v}]`);
    });
    setPreviewMessage(preview);
  }, [formData.message, detectedVars]);

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(e.target.value.trim())) {
        setFormData({
          ...formData,
          tags: [...formData.tags, e.target.value.trim()]
        });
      }
      e.target.value = '';
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tagToRemove)
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content template-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{template ? '✏️ Edit Template' : '➕ New Template'}</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        <form onSubmit={onSubmit} className="template-form">
          <div className="form-row">
            <div className="form-group">
              <label>Template Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g., First Cold Chatting"
              />
            </div>
            <div className="form-group">
              <label>Category *</label>
              <input
                type="text"
                list="categories"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                required
                placeholder="e.g., Initial Contact"
              />
              <datalist id="categories">
                {categories.map(cat => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of when to use this template"
            />
          </div>

          <div className="form-group">
            <label>Message Template *</label>
            <textarea
              value={formData.message}
              onChange={e => setFormData({ ...formData, message: e.target.value })}
              required
              rows={6}
              placeholder="Enter your message with {variable} placeholders..."
            />
            <div className="form-help">
              Use {'{variable_name}'} for dynamic content. Detected: {detectedVars.map(v => (
                <span key={v} className="detected-variable">{'{'}{v}{'}'}</span>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Available Variables</label>
            <div className="variables-list">
              {availableVariables.map(v => (
                <div key={v.key} className="variable-item">
                  <code onClick={() => {
                    setFormData({
                      ...formData,
                      message: formData.message + `{${v.key}}`
                    });
                  }}>
                    {'{'}{v.key}{'}'}
                  </code>
                  <span>{v.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Tags</label>
            <div className="tags-input">
              {formData.tags.map(tag => (
                <span key={tag} className="tag">
                  #{tag}
                  <button type="button" onClick={() => handleRemoveTag(tag)}>×</button>
                </span>
              ))}
              <input
                type="text"
                placeholder="Press Enter to add tag..."
                onKeyDown={handleAddTag}
              />
            </div>
          </div>

          {previewMessage && (
            <div className="form-group">
              <label>Preview</label>
              <div className="preview-box">
                {previewMessage}
              </div>
            </div>
          )}

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={formData.enabled}
                onChange={e => setFormData({ ...formData, enabled: e.target.checked })}
              />
              Enable this template
            </label>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {template ? 'Update Template' : 'Create Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Preview Modal Component
const PreviewModal = ({ template, onClose, availableVariables }) => {
  const [sampleData, setSampleData] = useState({
    event_organizer: 'Tech Summit 2025',
    variant_fcc: 'salah satu panitia',
    last_event: 'Previous Event Name',
    link_demo: 'https://arachnova.id/demo',
    pic_name: 'John Doe',
    startup: 'NOVAGATE'
  });

  const [preview, setPreview] = useState('');

  useEffect(() => {
    let result = template.message;
    Object.keys(sampleData).forEach(key => {
      const placeholder = `{${key}}`;
      result = result.replace(new RegExp(placeholder, 'g'), sampleData[key]);
    });
    setPreview(result);
  }, [template.message, sampleData]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content preview-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>👁️ Template Preview: {template.name}</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        <div className="preview-content">
          <div className="preview-form">
            <h3>Sample Data</h3>
            {availableVariables.slice(0, 8).map(v => (
              <div key={v.key} className="preview-field">
                <label>{v.label} {'{' + v.key + '}'}</label>
                <input
                  type="text"
                  value={sampleData[v.key] || ''}
                  onChange={e => setSampleData({ ...sampleData, [v.key]: e.target.value })}
                  placeholder={v.description}
                />
              </div>
            ))}
          </div>

          <div className="preview-result">
            <h3>Preview</h3>
            <div className="preview-message">
              {preview}
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button onClick={onClose} className="btn-secondary">
            Close
          </button>
          <button className="btn-primary" onClick={() => {
            navigator.clipboard.writeText(preview);
            alert('Copied to clipboard!');
          }}>
            📋 Copy
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplateManagerPage;
