import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { cci } from '../services/api.js';
import NotesPanel from '../components/NotesPanel.jsx';
import '../styles/cci.css';

const DEAL_STAGES = ['Prospect', 'Negotiation', 'Closed Won', 'Closed Lost', 'On Hold'];
const RISK_LEVELS = ['Low', 'Medium', 'High'];
const LINK_TYPES = ['MOU', 'EVENT', 'PAYMENT', 'DRIVE', 'WA_GROUP', 'CUSTOM'];
const LINK_ICONS = { MOU: '\u{1F4C4}', EVENT: '\u{1F3AB}', PAYMENT: '\u{1F4B3}', DRIVE: '\u{1F4C1}', WA_GROUP: '\u{1F4AC}', CUSTOM: '\u{1F517}' };

export default function CCIDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [editing, setEditing] = useState({});
  const [saving, setSaving] = useState(false);
  const [showAddLink, setShowAddLink] = useState(false);
  const [newLink, setNewLink] = useState({ name: '', linkType: 'CUSTOM', url: '', description: '' });
  const [addingLink, setAddingLink] = useState(false);

  const load = async () => {
    const res = await cci.get(id);
    setClient(res.data);
  };

  useEffect(() => { load(); }, [id]);

  if (!client) return <div className="empty-state">Loading...</div>;

  const startEdit = (field) => setEditing(e => ({ ...e, [field]: client[field] ?? '' }));
  const cancelEdit = (field) => setEditing(e => { const n = {...e}; delete n[field]; return n; });

  const saveField = async (field) => {
    setSaving(true);
    try {
      const value = editing[field];
      await cci.update(id, { [field]: field === 'expectedVolume' ? (value ? parseInt(value) : null) : field === 'platformFee' ? parseFloat(value) : field === 'customDevRequired' ? value === 'true' : value || null });
      await load();
      cancelEdit(field);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this client?')) return;
    await cci.delete(id);
    navigate('/cci');
  };

  const handleAddLink = async () => {
    if (!newLink.name.trim() || !newLink.url.trim()) return;
    setAddingLink(true);
    try {
      await cci.addLink(id, newLink);
      setNewLink({ name: '', linkType: 'CUSTOM', url: '', description: '' });
      setShowAddLink(false);
      load();
    } finally {
      setAddingLink(false);
    }
  };

  const handleDeleteLink = async (linkId) => {
    if (!confirm('Delete this link?')) return;
    await cci.deleteLink(id, linkId);
    load();
  };

  const renderField = (field, label, type = 'text', options = null) => {
    const isEditing = field in editing;
    return (
      <div className="detail-field">
        <div className="detail-label">{label}</div>
        <div className="detail-value">
          {isEditing ? (
            <div style={{display:'flex',gap:'6px',alignItems:'center'}}>
              {options ? (
                <select value={editing[field]} onChange={e => setEditing(en => ({...en,[field]:e.target.value}))}>
                  <option value="">None</option>
                  {options.map(o => <option key={o}>{o}</option>)}
                </select>
              ) : type === 'checkbox' ? (
                <select value={String(editing[field])} onChange={e => setEditing(en => ({...en,[field]:e.target.value}))}>
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              ) : (
                <input type={type} value={editing[field]} onChange={e => setEditing(en => ({...en,[field]:e.target.value}))} />
              )}
              <button className="btn btn-primary btn-sm" onClick={() => saveField(field)} disabled={saving}>&#10003;</button>
              <button className="btn btn-ghost btn-sm" onClick={() => cancelEdit(field)}>&#10005;</button>
            </div>
          ) : (
            <span onClick={() => startEdit(field)} style={{cursor:'pointer',borderBottom:'1px dashed var(--border-color)',paddingBottom:'1px'}}>
              {type === 'checkbox' ? (client[field] ? 'Yes' : 'No') : client[field] || <span style={{color:'var(--text-muted)'}}>Click to edit</span>}
            </span>
          )}
        </div>
      </div>
    );
  };

  const tasks = client.tasks || [];
  const mous = client.mouDrafts || [];
  const notes = client.clientNotes || [];
  const links = client.links || [];

  return (
    <div>
      <div className="page-header">
        <div>
          <div style={{color:'var(--text-muted)',fontSize:'13px',marginBottom:'4px'}}>
            <Link to="/cci" style={{color:'var(--color-primary)'}}>CCI</Link> / {client.clientName}
          </div>
          <h1 className="page-title">{client.clientName}</h1>
        </div>
        <button className="btn btn-danger btn-sm" onClick={handleDelete}>Delete Client</button>
      </div>

      <div className="detail-grid">
        {renderField('clientName', 'Client Name')}
        {renderField('eventName', 'Event Name')}
        {renderField('eventType', 'Event Type')}
        {renderField('expectedVolume', 'Expected Volume', 'number')}
        {renderField('dealStage', 'Deal Stage', 'select', DEAL_STAGES)}
        {renderField('riskLevel', 'Risk Level', 'select', RISK_LEVELS)}
        {renderField('platformFee', 'Platform Fee (%)', 'number')}
        {renderField('timeline', 'Timeline')}
        {renderField('ticketCategories', 'Ticket Categories')}
        {renderField('negotiationStatus', 'Negotiation Status')}
        {renderField('customDevRequired', 'Custom Dev Required', 'checkbox')}
        {renderField('mouStatus', 'MoU Status')}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px',marginBottom:'20px'}}>
        <div className="section-card">
          <div className="linked-counts">
            <div className="linked-item">
              <span>&#9889; Tasks</span>
              <span className="badge">{tasks.length}</span>
              <Link to={`/techsprint?clientId=${id}`} style={{color:'var(--color-primary)',fontSize:'12px'}}>View &#8594;</Link>
            </div>
            <div className="linked-item">
              <span>&#128196; MoUs</span>
              <span className="badge">{mous.length}</span>
              <Link to={`/mou?clientId=${id}`} style={{color:'var(--color-primary)',fontSize:'12px'}}>View &#8594;</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Links Section */}
      <div className="section-card">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
          <h3 style={{margin:0}}>Links ({links.length})</h3>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAddLink(!showAddLink)}>
            {showAddLink ? 'Cancel' : '+ Add Link'}
          </button>
        </div>
        {showAddLink && (
          <div className="add-link-form">
            <div className="form-row">
              <div className="form-group">
                <label>Name</label>
                <input value={newLink.name} onChange={e => setNewLink(l => ({...l, name: e.target.value}))} placeholder="e.g. MoU Draft" />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select value={newLink.linkType} onChange={e => setNewLink(l => ({...l, linkType: e.target.value}))}>
                  {LINK_TYPES.map(t => <option key={t} value={t}>{LINK_ICONS[t]} {t}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>URL</label>
              <input value={newLink.url} onChange={e => setNewLink(l => ({...l, url: e.target.value}))} placeholder="https://..." />
            </div>
            <div className="form-group">
              <label>Description (optional)</label>
              <input value={newLink.description} onChange={e => setNewLink(l => ({...l, description: e.target.value}))} placeholder="Brief description" />
            </div>
            <button className="btn btn-primary btn-sm" onClick={handleAddLink} disabled={addingLink}>
              {addingLink ? '...' : 'Save Link'}
            </button>
          </div>
        )}
        {links.length === 0 && !showAddLink && (
          <div className="empty-state" style={{padding:'16px'}}>No links yet</div>
        )}
        {links.map(link => (
          <div key={link.id} className="link-row">
            <span className="link-icon">{LINK_ICONS[link.linkType] || '\u{1F517}'}</span>
            <div className="link-info">
              <a href={link.url} target="_blank" rel="noopener noreferrer" className="link-name">{link.name}</a>
              {link.description && <span className="link-desc">{link.description}</span>}
            </div>
            <span className="chip link-type-chip">{link.linkType}</span>
            <button className="icon-btn" title="Delete" onClick={() => handleDeleteLink(link.id)}>{'\u{1F5D1}\uFE0F'}</button>
          </div>
        ))}
      </div>

      <div className="section-card">
        <h3>Notes ({notes.length})</h3>
        <NotesPanel clientId={id} notes={notes} onNotesChange={load} />
      </div>
    </div>
  );
}
