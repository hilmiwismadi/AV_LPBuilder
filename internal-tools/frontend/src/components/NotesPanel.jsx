import { useState, useRef } from 'react';
import { cci } from '../services/api.js';

const CATEGORIES = ['tech_requirement', 'negotiation', 'legal', 'general'];
const CAT_LABELS = {
  tech_requirement: '\u{1F527} Tech',
  negotiation: '\u{1F4AC} Negotiation',
  legal: '\u2696\uFE0F Legal',
  general: '\u{1F4DD} General',
};
const CAT_CLASS = {
  tech_requirement: 'note-cat-tech',
  negotiation: 'note-cat-negotiation',
  legal: 'note-cat-legal',
  general: 'note-cat-general',
};

function timeAgo(dateStr) {
  const now = new Date();
  const d = new Date(dateStr);
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
  if (diff < 604800) return Math.floor(diff / 86400) + 'd ago';
  return d.toLocaleDateString();
}

function formatDeadline(dateStr) {
  const d = new Date(dateStr);
  const datePart = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const h = d.getHours(), m = d.getMinutes();
  if (h === 0 && m === 0) return datePart;
  return datePart + ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function toLocalDatetimeValue(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const da = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${y}-${mo}-${da}T${h}:${mi}`;
}

function isOverdue(dateStr) {
  return new Date(dateStr) < new Date();
}

export default function NotesPanel({ clientId, notes = [], onNotesChange }) {
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('general');
  const [showDeadline, setShowDeadline] = useState(false);
  const [newDueDate, setNewDueDate] = useState('');
  const [adding, setAdding] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [editData, setEditData] = useState({ content: '', category: '', dueDate: '' });
  const [savingEdit, setSavingEdit] = useState(false);

  const handleAdd = async () => {
    if (!newContent.trim()) return;
    setAdding(true);
    try {
      const data = { content: newContent, category: newCategory };
      if (showDeadline && newDueDate) {
        data.dueDate = new Date(newDueDate).toISOString();
      }
      await cci.addNote(clientId, data);
      setNewContent('');
      setNewDueDate('');
      setShowDeadline(false);
      onNotesChange();
    } finally {
      setAdding(false);
    }
  };

  const handleResolve = async (note) => {
    await cci.updateNote(clientId, note.id, { resolved: !note.resolved });
    onNotesChange();
  };

  const handlePin = async (note) => {
    await cci.updateNote(clientId, note.id, { pinned: !note.pinned });
    onNotesChange();
  };

  const handleDelete = async (noteId) => {
    if (!confirm('Delete this note?')) return;
    await cci.deleteNote(clientId, noteId);
    onNotesChange();
  };

  const startEdit = (note) => {
    setEditingNote(note.id);
    setEditData({
      content: note.content,
      category: note.category,
      dueDate: toLocalDatetimeValue(note.dueDate),
    });
  };

  const cancelEdit = () => {
    setEditingNote(null);
    setEditData({ content: '', category: '', dueDate: '' });
  };

  const saveEdit = async (noteId) => {
    setSavingEdit(true);
    try {
      const payload = {
        content: editData.content,
        category: editData.category,
        dueDate: editData.dueDate ? new Date(editData.dueDate).toISOString() : null,
      };
      await cci.updateNote(clientId, noteId, payload);
      setEditingNote(null);
      onNotesChange();
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div>
      {notes.length === 0 && (
        <div className="empty-state" style={{padding:'24px'}}>No notes yet</div>
      )}
      {notes.map(note => (
        <div key={note.id} className={"note-card " + (note.resolved ? 'resolved' : '') + (note.pinned ? ' pinned' : '')}>
          <div className="note-content">
            {editingNote === note.id ? (
              <div className="note-edit-form">
                <textarea
                  value={editData.content}
                  onChange={e => setEditData(d => ({ ...d, content: e.target.value }))}
                  rows={3}
                  style={{width:'100%',padding:'8px',background:'var(--bg-input)',border:'1px solid var(--color-primary)',borderRadius:'var(--radius-sm)',color:'var(--text-primary)',resize:'vertical',fontSize:'13px',fontFamily:'inherit'}}
                />
                <div style={{display:'flex',gap:'8px',alignItems:'center',marginTop:'8px',flexWrap:'wrap'}}>
                  <select
                    value={editData.category}
                    onChange={e => setEditData(d => ({ ...d, category: e.target.value }))}
                    style={{padding:'4px 8px',background:'var(--bg-input)',border:'1px solid var(--border-color)',borderRadius:'var(--radius-sm)',color:'var(--text-primary)',fontSize:'12px'}}
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{CAT_LABELS[c]}</option>)}
                  </select>
                  <input
                    type="datetime-local"
                    value={editData.dueDate}
                    onChange={e => setEditData(d => ({ ...d, dueDate: e.target.value }))}
                    style={{padding:'4px 8px',background:'var(--bg-input)',border:'1px solid var(--border-color)',borderRadius:'var(--radius-sm)',color:'var(--text-primary)',fontSize:'12px'}}
                  />
                  <div style={{display:'flex',gap:'4px',marginLeft:'auto'}}>
                    <button className="btn btn-primary btn-sm" onClick={() => saveEdit(note.id)} disabled={savingEdit}>
                      {savingEdit ? '...' : 'Save'}
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={cancelEdit}>Cancel</button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="note-text">{note.content}</div>
                <div className="note-meta">
                  <span className={"note-category " + CAT_CLASS[note.category]}>{CAT_LABELS[note.category] || note.category}</span>
                  {note.dueDate && (
                    <span className={"note-deadline" + (isOverdue(note.dueDate) ? ' overdue' : '')}>
                      {'\u{1F4C5}'} {formatDeadline(note.dueDate)}
                    </span>
                  )}
                  {note.author && note.author !== 'manual' && (
                    <span className="note-author">by {note.author}</span>
                  )}
                  <span className="note-date">{timeAgo(note.createdAt)}</span>
                </div>
              </>
            )}
          </div>
          <div className="note-actions">
            {editingNote !== note.id && (
              <button className="icon-btn" title="Edit" onClick={() => startEdit(note)}>
                {'\u270F\uFE0F'}
              </button>
            )}
            <button className="icon-btn" title={note.pinned ? 'Unpin' : 'Pin'} onClick={() => handlePin(note)}>
              {note.pinned ? '\u{1F4CD}' : '\u{1F4CC}'}
            </button>
            <button className="icon-btn" title={note.resolved ? 'Unresolve' : 'Resolve'} onClick={() => handleResolve(note)}>
              {note.resolved ? '\u21A9\uFE0F' : '\u2713'}
            </button>
            <button className="icon-btn" title="Delete" onClick={() => handleDelete(note.id)}>{'\u{1F5D1}\uFE0F'}</button>
          </div>
        </div>
      ))}
      <div className="add-note-form">
        <textarea
          value={newContent}
          onChange={e => setNewContent(e.target.value)}
          placeholder="Add a note..."
          rows={2}
          style={{padding:'8px',background:'var(--bg-input)',border:'1px solid var(--border-color)',borderRadius:'var(--radius-sm)',color:'var(--text-primary)',resize:'vertical'}}
        />
        <div className="add-note-row">
          <select value={newCategory} onChange={e => setNewCategory(e.target.value)}
            style={{padding:'6px 8px',background:'var(--bg-input)',border:'1px solid var(--border-color)',borderRadius:'var(--radius-sm)',color:'var(--text-primary)',flex:1}}>
            {CATEGORIES.map(c => <option key={c} value={c}>{CAT_LABELS[c]}</option>)}
          </select>
          <label style={{display:'flex',alignItems:'center',gap:'4px',fontSize:'12px',color:'var(--text-secondary)',cursor:'pointer',whiteSpace:'nowrap'}}>
            <input type="checkbox" checked={showDeadline} onChange={e => setShowDeadline(e.target.checked)} />
            Set deadline
          </label>
          <button className="btn btn-primary btn-sm" onClick={handleAdd} disabled={adding}>
            {adding ? '...' : 'Add Note'}
          </button>
        </div>
        {showDeadline && (
          <input
            type="datetime-local"
            value={newDueDate}
            onChange={e => setNewDueDate(e.target.value)}
            style={{padding:'6px 8px',background:'var(--bg-input)',border:'1px solid var(--border-color)',borderRadius:'var(--radius-sm)',color:'var(--text-primary)'}}
          />
        )}
      </div>
    </div>
  );
}
