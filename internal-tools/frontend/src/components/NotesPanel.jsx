import { useState } from 'react';
import { cci } from '../services/api.js';

const CATEGORIES = ['tech_requirement', 'negotiation', 'legal', 'general'];
const CAT_LABELS = {
  tech_requirement: '🔧 Tech',
  negotiation: '💬 Negotiation',
  legal: '⚖️ Legal',
  general: '📝 General',
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

export default function NotesPanel({ clientId, notes = [], onNotesChange }) {
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('general');
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    if (!newContent.trim()) return;
    setAdding(true);
    try {
      await cci.addNote(clientId, { content: newContent, category: newCategory });
      setNewContent('');
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

  return (
    <div>
      {notes.length === 0 && (
        <div className="empty-state" style={{padding:'24px'}}>No notes yet</div>
      )}
      {notes.map(note => (
        <div key={note.id} className={"note-card " + (note.resolved ? 'resolved' : '') + (note.pinned ? ' pinned' : '')}>
          <div className="note-content">
            <div className="note-text">{note.content}</div>
            <div className="note-meta">
              <span className={"note-category " + CAT_CLASS[note.category]}>{CAT_LABELS[note.category] || note.category}</span>
              {note.author && note.author !== 'manual' && (
                <span className="note-author">by {note.author}</span>
              )}
              <span className="note-date">{timeAgo(note.createdAt)}</span>
            </div>
          </div>
          <div className="note-actions">
            <button className="icon-btn" title={note.pinned ? 'Unpin' : 'Pin'} onClick={() => handlePin(note)}>
              {note.pinned ? '📍' : '📌'}
            </button>
            <button className="icon-btn" title={note.resolved ? 'Unresolve' : 'Resolve'} onClick={() => handleResolve(note)}>
              {note.resolved ? '↩️' : '✓'}
            </button>
            <button className="icon-btn" title="Delete" onClick={() => handleDelete(note.id)}>🗑️</button>
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
          <button className="btn btn-primary btn-sm" onClick={handleAdd} disabled={adding}>
            {adding ? '...' : 'Add Note'}
          </button>
        </div>
      </div>
    </div>
  );
}
