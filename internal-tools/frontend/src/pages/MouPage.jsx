import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { mou, cci } from "../services/api.js";
import "../styles/mou.css";
import "../styles/cci.css";

const MOU_STATUSES = ["DRAFT", "UNDER_REVIEW", "SENT", "SIGNED"];
const STATUS_LABELS = { DRAFT: "Draft", UNDER_REVIEW: "Under Review", SENT: "Sent", SIGNED: "Signed" };
const STATUS_CLASS = { DRAFT: "chip-draft", UNDER_REVIEW: "chip-under-review", SENT: "chip-sent", SIGNED: "chip-signed" };

function mouTemplate(clientName, eventName) {
  return "MEMORANDUM OF UNDERSTANDING\n\nBetween: Roetix (PT Teknologi Tiket Rakyat)\nAnd: " + clientName + "\n\nDate: " + new Date().toLocaleDateString("id-ID", {year:"numeric",month:"long",day:"numeric"}) + "\n\n1. PURPOSE\nThis MoU establishes the framework for collaboration between Roetix and " + clientName + " regarding the event ticketing services for " + (eventName || "[Event Name]") + ".\n\n2. SCOPE OF SERVICES\nRoetix agrees to provide:\n- Online ticketing platform and infrastructure\n- Payment gateway integration\n- Customer support during ticket sales period\n- Real-time sales dashboard and reporting\n\n3. FINANCIAL TERMS\nPlatform fee: [X]% of total ticket sales\nPayment terms: [Terms to be agreed]\n\n4. TIMELINE\n[Specify key dates and milestones]\n\n5. CONFIDENTIALITY\nBoth parties agree to maintain confidentiality of all shared information.\n\n6. SIGNATURES\nRoetix Representative: ___________________\n" + clientName + " Representative: ___________________";
}

function CreateMouModal({ onSubmit, onClose, clients }) {
  const [clientId, setClientId] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleClientChange = (id) => {
    setClientId(id);
    const client = clients.find(c => c.id === id);
    if (client) {
      setTitle("MoU - " + client.clientName + " - " + (client.eventName || "Event"));
      setContent(mouTemplate(client.clientName, client.eventName));
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{width:"600px"}} onClick={e=>e.stopPropagation()}>
        <h2>Create MoU Draft</h2>
        <div className="form-group">
          <label>Client *</label>
          <select value={clientId} onChange={e=>handleClientChange(e.target.value)} required>
            <option value="">Select client...</option>
            {clients.map(c=><option key={c.id} value={c.id}>{c.clientName}{c.eventName ? " - " + c.eventName : ""}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Title</label>
          <input value={title} onChange={e=>setTitle(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Content</label>
          <textarea className="mou-content-area" value={content} onChange={e=>setContent(e.target.value)} rows={12} />
        </div>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={!clientId||!title} onClick={()=>onSubmit({clientId,title,content})}>Create Draft</button>
        </div>
      </div>
    </div>
  );
}

function MouDetailView({ mouId, onBack }) {
  const [draft, setDraft] = useState(null);
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    mou.get(mouId).then(r => { setDraft(r.data); setContent(r.data.content); });
  }, [mouId]);

  if (!draft) return <div className="empty-state">Loading...</div>;

  const save = async () => {
    setSaving(true);
    try { await mou.update(mouId, { content }); } finally { setSaving(false); }
  };

  const setStatus = async (status) => {
    await mou.update(mouId, { status });
    mou.get(mouId).then(r => setDraft(r.data));
  };

  const handleDelete = async () => {
    if (!confirm("Delete this MoU?")) return;
    await mou.delete(mouId);
    onBack();
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div style={{color:"var(--text-muted)",fontSize:"13px",marginBottom:"4px",cursor:"pointer"}} onClick={onBack}>Back to MoU List</div>
          <h1 className="page-title">{draft.title}</h1>
          <div style={{marginTop:"4px"}}>
            <span className="chip" style={{marginRight:"8px"}}>{draft.client?.clientName}</span>
            <span className={"chip " + STATUS_CLASS[draft.status]}>{STATUS_LABELS[draft.status]}</span>
          </div>
        </div>
        <button className="btn btn-danger btn-sm" onClick={handleDelete}>Delete</button>
      </div>
      <div className="mou-editor">
        <textarea className="mou-content-area" value={content} onChange={e=>setContent(e.target.value)} />
        <div style={{display:"flex",justifyContent:"flex-end",marginTop:"12px",gap:"8px"}}>
          <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? "Saving..." : "Save Content"}</button>
        </div>
      </div>
      <div className="section-card">
        <h3>Update Status</h3>
        <div className="status-actions">
          {MOU_STATUSES.filter(s=>s!==draft.status).map(s=>(
            <button key={s} className="btn btn-ghost" onClick={()=>setStatus(s)}>{"-> " + STATUS_LABELS[s]}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function MouPage() {
  const [searchParams] = useSearchParams();
  const [mous, setMous] = useState([]);
  const [clients, setClients] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState(null);
  const clientId = searchParams.get("clientId");

  const load = async () => {
    const params = {};
    if (clientId) params.clientId = clientId;
    const res = await mou.list(params);
    setMous(res.data);
  };

  useEffect(() => {
    load();
    cci.list().then(r => setClients(r.data));
  }, [clientId]);

  const handleCreate = async (data) => {
    const res = await mou.create(data);
    setShowCreate(false);
    setSelected(res.data.id);
    load();
  };

  if (selected) {
    return <MouDetailView mouId={selected} onBack={() => { setSelected(null); load(); }} />;
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">MoU Maker</h1>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ New MoU Draft</button>
      </div>
      {mous.length === 0 ? (
        <div className="empty-state">No MoU drafts yet. Create your first one!</div>
      ) : (
        <div className="mou-list">
          {mous.map(m => (
            <div key={m.id} className="mou-item" onClick={() => setSelected(m.id)}>
              <div>
                <div className="mou-title">{m.title}</div>
                <div className="mou-client">{m.client?.clientName} Updated {new Date(m.updatedAt).toLocaleDateString()}</div>
              </div>
              <div className="mou-status">
                <span className={"chip " + STATUS_CLASS[m.status]}>{STATUS_LABELS[m.status]}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      {showCreate && <CreateMouModal onSubmit={handleCreate} onClose={() => setShowCreate(false)} clients={clients} />}
    </div>
  );
}
