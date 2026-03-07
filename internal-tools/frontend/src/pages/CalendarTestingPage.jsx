import { useState, useEffect } from 'react';
import { deadlines as deadlinesApi } from '../services/api.js';
import { Link } from 'react-router-dom';
import '../styles/cci.css';

const TYPE_COLORS = {
  event: '#818cf8',
  task: '#f59e0b',
  followup: '#10b981',
  meeting: '#3b82f6',
  general: '#94a3b8',
};

const DEADLINE_TYPES = ['event', 'task', 'followup', 'meeting', 'general'];

function groupByDate(items) {
  const groups = {};
  for (const item of items) {
    const d = new Date(item.dueDate);
    const key = d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  }
  return groups;
}

function formatDateHeader(dateKey) {
  const [y, m, d] = dateKey.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const dayNum = date.getDate();
  const monthStr = date.toLocaleDateString('en-US', { month: 'short' });
  const yearStr = date.getFullYear() !== today.getFullYear() ? ' ' + date.getFullYear() : '';

  let label = dayNum + ' ' + monthStr + yearStr;
  if (date.getTime() === today.getTime()) label += ' (Today)';
  else if (date.getTime() === tomorrow.getTime()) label += ' (Tomorrow)';

  const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' });
  return { label, dayOfWeek };
}

function formatTime(dateStr) {
  const d = new Date(dateStr);
  const h = d.getHours(), m = d.getMinutes();
  if (h === 0 && m === 0) return null;
  return h.toString().padStart(2, '0') + ':' + m.toString().padStart(2, '0');
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

export default function CalendarTestingPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCompleted, setShowCompleted] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ title: '', type: '', dueDate: '' });
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const now = new Date();
      const from = new Date(now);
      from.setMonth(from.getMonth() - 1);
      const to = new Date(now);
      to.setMonth(to.getMonth() + 3);
      const res = await deadlinesApi.calendar({
        from: from.toISOString(),
        to: to.toISOString(),
        test: 'true',
      });
      setItems(res.data);
    } catch (err) {
      console.error('Failed to load deadlines:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (dl) => {
    try {
      await deadlinesApi.update(dl.id, { completed: !dl.completed });
      setItems(prev => prev.map(d => d.id === dl.id ? { ...d, completed: !d.completed } : d));
    } catch {}
  };

  const startEdit = (dl) => {
    setEditingId(dl.id);
    setEditData({
      title: dl.title,
      type: dl.type,
      dueDate: toLocalDatetimeValue(dl.dueDate),
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({ title: '', type: '', dueDate: '' });
  };

  const saveEdit = async (dlId) => {
    setSavingEdit(true);
    try {
      const payload = {
        title: editData.title,
        type: editData.type,
        dueDate: editData.dueDate ? new Date(editData.dueDate).toISOString() : undefined,
      };
      await deadlinesApi.update(dlId, payload);
      setItems(prev => prev.map(d => d.id === dlId ? { ...d, ...payload, dueDate: payload.dueDate || d.dueDate } : d));
      setEditingId(null);
    } catch (err) {
      console.error('Failed to update deadline:', err);
    } finally {
      setSavingEdit(false);
    }
  };

  const filtered = showCompleted ? items : items.filter(d => !d.completed);
  const grouped = groupByDate(filtered);
  const sortedDates = Object.keys(grouped).sort();

  const todayKey = new Date().getFullYear() + '-' +
    String(new Date().getMonth() + 1).padStart(2, '0') + '-' +
    String(new Date().getDate()).padStart(2, '0');

  if (loading) return <div className="empty-state">Loading deadlines...</div>;

  return (
    <div>
      <div className="page-header">
        <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
          <h1 className="page-title">Calendar</h1>
          <span className="chip" style={{background:'rgba(245,158,11,0.15)',color:'#f59e0b',fontSize:'11px',fontWeight:700,letterSpacing:'0.05em'}}>SANDBOX</span>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
          <input type="checkbox" checked={showCompleted} onChange={e => setShowCompleted(e.target.checked)} />
          Show completed
        </label>
      </div>
      <div style={{background:'rgba(245,158,11,0.08)',border:'1px solid rgba(245,158,11,0.2)',borderRadius:'var(--radius-sm)',padding:'10px 16px',marginBottom:'16px',fontSize:'13px',color:'#fbbf24'}}>
        Showing deadlines from test clients only. Real deadlines are in <a href="/calendar" style={{color:'#818cf8',fontWeight:600}}>Calendar Production</a>.
      </div>

      {sortedDates.length === 0 ? (
        <div className="section-card">
          <div className="empty-state" style={{ padding: '48px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>{'\u{1F4C5}'}</div>
            <h2 style={{ margin: '0 0 8px', fontSize: '20px', color: 'var(--text-primary)' }}>No test deadlines</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              Add notes with dates to test clients to see them here.
            </p>
          </div>
        </div>
      ) : (
        sortedDates.map(dateKey => {
          const { label, dayOfWeek } = formatDateHeader(dateKey);
          const isPast = dateKey < todayKey;
          const isToday = dateKey === todayKey;
          const deadlines = grouped[dateKey];

          return (
            <div key={dateKey} className="cal-date-group" style={{ marginBottom: '24px' }}>
              <div className="cal-date-header" style={{
                display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px',
                paddingBottom: '8px', borderBottom: '1px solid var(--border-color)'
              }}>
                <span style={{
                  fontSize: '20px', fontWeight: 700,
                  color: isToday ? '#818cf8' : isPast ? 'var(--text-muted)' : 'var(--text-primary)',
                }}>{label}</span>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{dayOfWeek}</span>
              </div>

              {deadlines.map(dl => {
                const time = formatTime(dl.dueDate);
                const overdue = !dl.completed && isOverdue(dl.dueDate);
                const clientName = dl.client?.clientName;
                const isEditing = editingId === dl.id;

                return (
                  <div key={dl.id} className="cal-item" style={{
                    display: 'flex', alignItems: 'flex-start', gap: '12px',
                    padding: '10px 16px', marginBottom: '4px',
                    background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    borderLeft: '3px solid ' + (TYPE_COLORS[dl.type] || '#94a3b8'),
                    opacity: dl.completed ? 0.5 : 1,
                  }}>
                    <input
                      type="checkbox" checked={dl.completed}
                      onChange={() => handleToggle(dl)}
                      style={{ marginTop: '3px', cursor: 'pointer', accentColor: 'var(--color-primary)' }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {isEditing ? (
                        <div className="cal-edit-form">
                          <input
                            type="text"
                            value={editData.title}
                            onChange={e => setEditData(d => ({ ...d, title: e.target.value }))}
                            style={{width:'100%',padding:'6px 8px',background:'var(--bg-input)',border:'1px solid var(--color-primary)',borderRadius:'var(--radius-sm)',color:'var(--text-primary)',fontSize:'13px',marginBottom:'8px'}}
                          />
                          <div style={{display:'flex',gap:'8px',alignItems:'center',flexWrap:'wrap'}}>
                            <select
                              value={editData.type}
                              onChange={e => setEditData(d => ({ ...d, type: e.target.value }))}
                              style={{padding:'4px 8px',background:'var(--bg-input)',border:'1px solid var(--border-color)',borderRadius:'var(--radius-sm)',color:'var(--text-primary)',fontSize:'12px'}}
                            >
                              {DEADLINE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                            <input
                              type="datetime-local"
                              value={editData.dueDate}
                              onChange={e => setEditData(d => ({ ...d, dueDate: e.target.value }))}
                              style={{padding:'4px 8px',background:'var(--bg-input)',border:'1px solid var(--border-color)',borderRadius:'var(--radius-sm)',color:'var(--text-primary)',fontSize:'12px'}}
                            />
                            <div style={{display:'flex',gap:'4px',marginLeft:'auto'}}>
                              <button className="btn btn-primary btn-sm" onClick={() => saveEdit(dl.id)} disabled={savingEdit}>
                                {savingEdit ? '...' : 'Save'}
                              </button>
                              <button className="btn btn-ghost btn-sm" onClick={cancelEdit}>Cancel</button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            {clientName && (
                              <Link to={`/cci/${dl.client.id}`} style={{
                                fontSize: '12px', fontWeight: 600, color: '#818cf8',
                                textDecoration: 'none', background: 'rgba(99,102,241,0.1)',
                                padding: '1px 8px', borderRadius: '10px',
                              }}>{clientName}</Link>
                            )}
                            <span className="deadline-type-chip" style={{
                              background: (TYPE_COLORS[dl.type] || '#94a3b8') + '22',
                              color: TYPE_COLORS[dl.type] || '#94a3b8',
                              fontSize: '10px', padding: '1px 8px', borderRadius: '10px',
                            }}>{dl.type}</span>
                          </div>
                          <div style={{
                            fontSize: '14px', marginTop: '4px',
                            color: dl.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                            textDecoration: dl.completed ? 'line-through' : 'none',
                          }}>{dl.title}</div>
                        </>
                      )}
                    </div>
                    {!isEditing && time && (
                      <span style={{
                        fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap',
                        color: overdue ? '#f87171' : 'var(--text-secondary)',
                      }}>{time}</span>
                    )}
                    {!isEditing && (
                      <button className="icon-btn" title="Edit" onClick={() => startEdit(dl)} style={{flexShrink:0}}>
                        {'\u270F\uFE0F'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })
      )}
    </div>
  );
}
