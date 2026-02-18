import { useState } from 'react';

const DEAL_STAGES = ['Prospect', 'Negotiation', 'Closed Won', 'Closed Lost', 'On Hold'];
const RISK_LEVELS = ['Low', 'Medium', 'High'];

export default function ClientForm({ initial = {}, onSubmit, onClose, title = 'Add Client' }) {
  const [form, setForm] = useState({
    clientName: '',
    eventName: '',
    eventType: '',
    expectedVolume: '',
    ticketCategories: '',
    platformFee: 4.0,
    customDevRequired: false,
    negotiationStatus: '',
    dealStage: '',
    timeline: '',
    riskLevel: '',
    mouStatus: '',
    ...initial,
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { ...form };
    if (data.expectedVolume) data.expectedVolume = parseInt(data.expectedVolume);
    if (data.platformFee) data.platformFee = parseFloat(data.platformFee);
    onSubmit(data);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>{title}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Client Name *</label>
              <input required value={form.clientName} onChange={e => set('clientName', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Event Name</label>
              <input value={form.eventName} onChange={e => set('eventName', e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Event Type</label>
              <input value={form.eventType} onChange={e => set('eventType', e.target.value)} placeholder="e.g. Concert, Conference" />
            </div>
            <div className="form-group">
              <label>Expected Volume</label>
              <input type="number" value={form.expectedVolume} onChange={e => set('expectedVolume', e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Deal Stage</label>
              <select value={form.dealStage} onChange={e => set('dealStage', e.target.value)}>
                <option value="">Select...</option>
                {DEAL_STAGES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Risk Level</label>
              <select value={form.riskLevel} onChange={e => set('riskLevel', e.target.value)}>
                <option value="">Select...</option>
                {RISK_LEVELS.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Platform Fee (%)</label>
              <input type="number" step="0.1" value={form.platformFee} onChange={e => set('platformFee', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Timeline</label>
              <input value={form.timeline} onChange={e => set('timeline', e.target.value)} placeholder="e.g. Q1 2025" />
            </div>
          </div>
          <div className="form-group">
            <label>Ticket Categories</label>
            <input value={form.ticketCategories} onChange={e => set('ticketCategories', e.target.value)} placeholder="e.g. VIP, Regular, Early Bird" />
          </div>
          <div className="form-group">
            <label>
              <input type="checkbox" checked={form.customDevRequired} onChange={e => set('customDevRequired', e.target.checked)} style={{marginRight:'8px'}} />
              Custom Dev Required
            </label>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}
