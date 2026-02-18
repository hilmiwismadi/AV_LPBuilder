import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cci } from '../services/api.js';
import ClientForm from '../components/ClientForm.jsx';
import '../styles/cci.css';

const DEAL_STAGES = ['', 'Prospect', 'Negotiation', 'Closed Won', 'Closed Lost', 'On Hold'];
const RISK_LEVELS = ['', 'Low', 'Medium', 'High'];

function getDealChip(stage) {
  const map = { 'Prospect': 'chip-prospect', 'Negotiation': 'chip-negotiation', 'Closed Won': 'chip-closed-won', 'Closed Lost': 'chip-closed-lost', 'On Hold': 'chip-on-hold' };
  return map[stage] || '';
}
function getRiskChip(risk) {
  const map = { 'Low': 'chip-low', 'Medium': 'chip-medium', 'High': 'chip-high' };
  return map[risk] || '';
}

export default function CCIPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({ dealStage: '', riskLevel: '' });
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.dealStage) params.dealStage = filters.dealStage;
      if (filters.riskLevel) params.riskLevel = filters.riskLevel;
      const res = await cci.list(params);
      setClients(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filters]);

  const handleCreate = async (data) => {
    await cci.create(data);
    setShowForm(false);
    load();
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">CCI — Client Context Integration</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Add Client</button>
      </div>
      <div className="filter-bar">
        <select value={filters.dealStage} onChange={e => setFilters(f => ({ ...f, dealStage: e.target.value }))}>
          {DEAL_STAGES.map(s => <option key={s} value={s}>{s || 'All Stages'}</option>)}
        </select>
        <select value={filters.riskLevel} onChange={e => setFilters(f => ({ ...f, riskLevel: e.target.value }))}>
          {RISK_LEVELS.map(r => <option key={r} value={r}>{r || 'All Risk Levels'}</option>)}
        </select>
        <span style={{color:'var(--text-muted)',fontSize:'13px'}}>{clients.length} client{clients.length !== 1 ? 's' : ''}</span>
      </div>
      {loading ? (
        <div className="empty-state">Loading...</div>
      ) : clients.length === 0 ? (
        <div className="empty-state">No clients found. Add your first client!</div>
      ) : (
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
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {clients.map(c => (
                <tr key={c.id} onClick={() => navigate(`/cci/${c.id}`)}>
                  <td style={{fontWeight:600}}>{c.clientName}</td>
                  <td>{c.eventName || '—'}</td>
                  <td>{c.dealStage ? <span className={"chip " + getDealChip(c.dealStage)}>{c.dealStage}</span> : '—'}</td>
                  <td>{c.riskLevel ? <span className={"chip " + getRiskChip(c.riskLevel)}>{c.riskLevel}</span> : '—'}</td>
                  <td>{c.expectedVolume?.toLocaleString() || '—'}</td>
                  <td><span className="badge">{Array.isArray(c.notes) ? c.notes.length : 0}</span></td>
                  <td style={{color:'var(--text-muted)'}}>{new Date(c.updatedAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showForm && <ClientForm onSubmit={handleCreate} onClose={() => setShowForm(false)} />}
    </div>
  );
}
