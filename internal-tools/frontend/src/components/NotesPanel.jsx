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

export default function NotesPanel({ clientId, notes = [], onNotesChange }) {
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('general');
  const [adding, setAdding] = useState(false);

  const sorted = [...notes].sort((a, b) => {
    if (a.resolved === b.resolved) return new Date(b.createdAt) - new Date(a.createdAt);
    return a.resolved ? 1 : -1;
  });

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

  const handleDelete = async (noteId) => {
    if (!confirm('Delete this note?')) return;
    await cci.deleteNote(clientId, noteId);
    onNotesChange();
  };

  return (
    <div>
      {sorted.length === 0 && (
        <div className="empty-state" style={{padding:'24px'}}>No notes yet</div>
      )}
      {sorted.map(note => (
        <div key={note.id} className={"note-card " + (note.resolved ? 'resolved' : '')}>
          <div className="note-content">
            <div className="note-text">{note.content}</div>
            <div className="note-meta">
              <span className={"note-category " + CAT_CLASS[note.category]}>{CAT_LABELS[note.category] || note.category}</span>
              <span className="note-date">{new Date(note.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="note-actions">
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
