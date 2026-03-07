import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cci } from '../services/api.js';
import ClientForm from '../components/ClientForm.jsx';
import '../styles/cci.css';

const DEAL_STAGES = ['', 'Prospect', 'Negotiation', 'Closed Won', 'Closed Lost', 'On Hold'];
const RISK_LEVELS = ['', 'Low', 'Medium', 'High'];
const SORT_OPTIONS = [
  { value: '', label: 'Latest Updated' },
  { value: 'lastActivity', label: 'Latest Activity' },
  { value: 'urgency', label: 'Urgency (Risk)' },
];

function getDealChip(stage) {
  const map = { 'Prospect': 'chip-prospect', 'Negotiation': 'chip-negotiation', 'Closed Won': 'chip-closed-won', 'Closed Lost': 'chip-closed-lost', 'On Hold': 'chip-on-hold' };
  return map[stage] || '';
}
function getRiskChip(risk) {
  const map = { 'Low': 'chip-low', 'Medium': 'chip-medium', 'High': 'chip-high' };
  return map[risk] || '';
}

function getStaleness(lastActivity) {
  if (!lastActivity) return { label: '\u2014', cls: 'stale-cold' };
  const now = new Date();
  const d = new Date(lastActivity);
  const diffMs = now - d;
  const diffDays = Math.floor(diffMs / 86400000);
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffDays === 0) return { label: diffHours < 1 ? 'Just now' : diffHours + 'h ago', cls: 'stale-fresh' };
  if (diffDays <= 3) return { label: diffDays + 'd ago', cls: 'stale-recent' };
  if (diffDays <= 7) return { label: diffDays + 'd ago', cls: 'stale-warning' };
  if (diffDays <= 14) return { label: diffDays + 'd ago', cls: 'stale-stale' };
  return { label: diffDays + 'd ago', cls: 'stale-cold' };
}

export default function CCITestingPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({ dealStage: '', riskLevel: '', sortBy: '' });
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const params = { test: 'true' };
      if (filters.dealStage) params.dealStage = filters.dealStage;
      if (filters.riskLevel) params.riskLevel = filters.riskLevel;
      if (filters.sortBy) params.sortBy = filters.sortBy;
      const res = await cci.list(params);
      setClients(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filters]);

  const handleCreate = async (data) => {
    await cci.create({ ...data, isTest: true });
    setShowForm(false);
    load();
  };

  return (
    <div>
      <div className="page-header">
        <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
          <h1 className="page-title">CCI — Testing Environment</h1>
          <span className="chip" style={{background:'rgba(245,158,11,0.15)',color:'#f59e0b',fontSize:'11px',fontWeight:700,letterSpacing:'0.05em'}}>SANDBOX</span>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Add Test Client</button>
      </div>
      <div style={{background:'rgba(245,158,11,0.08)',border:'1px solid rgba(245,158,11,0.2)',borderRadius:'var(--radius-sm)',padding:'10px 16px',marginBottom:'16px',fontSize:'13px',color:'#fbbf24'}}>
        This is the testing sandbox. Clients here are dummy data for testing purposes. Real client data lives in <a href="/cci" style={{color:'#818cf8',fontWeight:600}}>CCI Production</a>.
      </div>
      <div className="filter-bar">
        <select value={filters.dealStage} onChange={e => setFilters(f => ({ ...f, dealStage: e.target.value }))}>
          {DEAL_STAGES.map(s => <option key={s} value={s}>{s || 'All Stages'}</option>)}
        </select>
        <select value={filters.riskLevel} onChange={e => setFilters(f => ({ ...f, riskLevel: e.target.value }))}>
          {RISK_LEVELS.map(r => <option key={r} value={r}>{r || 'All Risk Levels'}</option>)}
        </select>
        <select value={filters.sortBy} onChange={e => setFilters(f => ({ ...f, sortBy: e.target.value }))}>
          {SORT_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <span style={{color:'var(--text-muted)',fontSize:'13px'}}>{clients.length} test client{clients.length !== 1 ? 's' : ''}</span>
      </div>
      {loading ? (
        <div className="empty-state">Loading...</div>
      ) : clients.length === 0 ? (
        <div className="empty-state">No test clients. Add a test client to get started!</div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Client Name</th>
                  <th>Event</th>
                  <th>Deal Stage</th>
                  <th>Risk Level</th>
                  <th>Volume</th>
                  <th>Notes</th>
                  <th>Activity</th>
                </tr>
              </thead>
              <tbody>
                {clients.map(c => {
                  const stale = getStaleness(c.lastActivity);
                  return (
                    <tr key={c.id} onClick={() => navigate(`/cci/${c.id}`)}>
                      <td style={{fontWeight:600}}>{c.clientName}</td>
                      <td>{c.eventName || '\u2014'}</td>
                      <td>{c.dealStage ? <span className={"chip " + getDealChip(c.dealStage)}>{c.dealStage}</span> : '\u2014'}</td>
                      <td>{c.riskLevel ? <span className={"chip " + getRiskChip(c.riskLevel)}>{c.riskLevel}</span> : '\u2014'}</td>
                      <td>{c.expectedVolume?.toLocaleString() || '\u2014'}</td>
                      <td><span className="badge">{c.noteCount || 0}</span></td>
                      <td><span className={"chip " + stale.cls}>{stale.label}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="client-cards">
            {clients.map(c => {
              const stale = getStaleness(c.lastActivity);
              return (
                <div key={c.id} className="client-card" onClick={() => navigate(`/cci/${c.id}`)}>
                  <div className="client-card-header">
                    <span className="client-card-name">{c.clientName}</span>
                    <span className={"chip " + stale.cls}>{stale.label}</span>
                  </div>
                  <div className="client-card-row">
                    <span className="client-card-label">Event</span>
                    <span>{c.eventName || '\u2014'}</span>
                  </div>
                  <div className="client-card-row">
                    <span className="client-card-label">Volume</span>
                    <span>{c.expectedVolume?.toLocaleString() || '\u2014'}</span>
                  </div>
                  <div className="client-card-row">
                    <span className="client-card-label">Notes</span>
                    <span className="badge">{c.noteCount || 0}</span>
                  </div>
                  <div className="client-card-chips">
                    {c.dealStage && <span className={"chip " + getDealChip(c.dealStage)}>{c.dealStage}</span>}
                    {c.riskLevel && <span className={"chip " + getRiskChip(c.riskLevel)}>{c.riskLevel}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
      {showForm && <ClientForm onSubmit={handleCreate} onClose={() => setShowForm(false)} title="Add Test Client" />}
    </div>
  );
}
