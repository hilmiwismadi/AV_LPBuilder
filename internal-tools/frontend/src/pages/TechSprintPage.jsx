import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { techsprint, cci } from "../services/api.js";
import "../styles/techsprint.css";
import "../styles/cci.css";

const STATUSES = ["TODO", "IN_PROGRESS", "DONE", "BLOCKED"];
const STATUS_LABELS = { TODO: "To Do", IN_PROGRESS: "In Progress", DONE: "Done", BLOCKED: "Blocked" };
const STATUS_NEXT = { TODO: "IN_PROGRESS", IN_PROGRESS: "DONE", DONE: "TODO", BLOCKED: "TODO" };

function getWeekStr(date) {
  const d = new Date(date);
  d.setHours(0,0,0,0);
  d.setDate(d.getDate() + 4 - (d.getDay()||7));
  const yearStart = new Date(d.getFullYear(),0,1);
  const weekNo = Math.ceil((((d-yearStart)/86400000)+1)/7);
  return d.getFullYear() + "-W" + String(weekNo).padStart(2, "0");
}

function getWeekDays(weekStr) {
  const [year, week] = weekStr.split("-W").map(Number);
  const jan4 = new Date(year, 0, 4);
  const startW1 = new Date(jan4);
  startW1.setDate(jan4.getDate() - ((jan4.getDay()+6)%7));
  const start = new Date(startW1);
  start.setDate(start.getDate() + (week-1)*7);
  return Array.from({length:7}, (_,i) => { const d=new Date(start); d.setDate(d.getDate()+i); return d; });
}

function TaskModal({ onSubmit, onClose, clients }) {
  const [form, setForm] = useState({ title:"", description:"", assignedTo:"", deadline:"", clientId:"", parentId:"", status:"TODO" });
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <h2>Add Task</h2>
        <form onSubmit={e=>{e.preventDefault();onSubmit(form);}}>
          <div className="form-group"><label>Title *</label><input required value={form.title} onChange={e=>set("title",e.target.value)} /></div>
          <div className="form-group"><label>Description</label><textarea rows={3} value={form.description} onChange={e=>set("description",e.target.value)} style={{width:"100%",padding:"8px",background:"var(--bg-input)",border:"1px solid var(--border-color)",borderRadius:"var(--radius-sm)",color:"var(--text-primary)"}} /></div>
          <div className="form-row">
            <div className="form-group"><label>Assigned To</label><input value={form.assignedTo} onChange={e=>set("assignedTo",e.target.value)} /></div>
            <div className="form-group"><label>Deadline</label><input type="date" value={form.deadline} onChange={e=>set("deadline",e.target.value)} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Client</label>
              <select value={form.clientId} onChange={e=>set("clientId",e.target.value)}>
                <option value="">No client</option>
                {clients.map(c=><option key={c.id} value={c.id}>{c.clientName}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Status</label>
              <select value={form.status} onChange={e=>set("status",e.target.value)}>
                {STATUSES.map(s=><option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Create Task</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function BoardTab({ tasks, onRefresh }) {
  const [expanded, setExpanded] = useState(null);
  const byStatus = STATUSES.reduce((acc,s) => ({...acc,[s]:tasks.filter(t=>t.status===s)}), {});
  const cycleStatus = async (task) => {
    await techsprint.updateTask(task.id, { status: STATUS_NEXT[task.status] });
    onRefresh();
  };
  return (
    <div className="board-columns">
      {STATUSES.map(status => (
        <div key={status} className={"board-column col-" + status}>
          <div className="column-header">
            <span>{STATUS_LABELS[status]}</span>
            <span className="badge">{byStatus[status].length}</span>
          </div>
          {byStatus[status].map(task => (
            <div key={task.id} className="task-card" onClick={() => setExpanded(expanded===task.id?null:task.id)}>
              <h4>{task.title}</h4>
              <div className="task-card-meta">
                {task.assignedTo && <span className="assignee-chip">{task.assignedTo}</span>}
                {task.deadline && <span className={"deadline-chip" + (new Date(task.deadline)<new Date()&&task.status!=="DONE"?" overdue":"")}>{new Date(task.deadline).toLocaleDateString()}</span>}
                {task.client && <span className="client-badge">{task.client.clientName}</span>}
              </div>
              {expanded===task.id && (
                <div className="task-expanded" onClick={e=>e.stopPropagation()}>
                  {task.description && <p style={{color:"var(--text-secondary)",fontSize:"12px",marginBottom:"8px"}}>{task.description}</p>}
                  <button className="status-cycle-btn" onClick={()=>cycleStatus(task)}>{"-> " + STATUS_LABELS[STATUS_NEXT[task.status]]}</button>
                  {task.subtasks?.length > 0 && (
                    <div className="subtask-list">
                      <div style={{fontSize:"11px",color:"var(--text-muted)",marginBottom:"4px"}}>Subtasks</div>
                      {task.subtasks.map(s=><div key={s.id} className="subtask-item">{"- " + s.title} <span style={{color:"var(--text-muted)"}}>({s.status})</span></div>)}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function CalendarTab() {
  const [week, setWeek] = useState(getWeekStr(new Date()));
  const [tasks, setTasks] = useState([]);
  const days = getWeekDays(week);
  const today = new Date();
  useEffect(() => { techsprint.calendar(week).then(r => setTasks(r.data)); }, [week]);
  const prevWeek = () => { const d = getWeekDays(week)[0]; d.setDate(d.getDate()-7); setWeek(getWeekStr(d)); };
  const nextWeek = () => { const d = getWeekDays(week)[0]; d.setDate(d.getDate()+7); setWeek(getWeekStr(d)); };
  const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return (
    <div>
      <div className="week-nav">
        <button onClick={prevWeek}>Prev</button><span>{week}</span><button onClick={nextWeek}>Next</button>
      </div>
      <div className="calendar-grid">
        {days.map((day, i) => {
          const dayTasks = tasks.filter(t => t.deadline && new Date(t.deadline).toDateString() === day.toDateString());
          const isToday = day.toDateString() === today.toDateString();
          return (
            <div key={i} className={"calendar-day" + (isToday ? " today" : "")}>
              <div className="calendar-day-header">{DAY_NAMES[i]}</div>
              <div className="calendar-day-date">{day.getDate()}</div>
              {dayTasks.map(t => (<div key={t.id} className="calendar-task">{t.title}</div>))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WorkloadTab() {
  const [workload, setWorkload] = useState({});
  useEffect(() => { techsprint.workload().then(r => setWorkload(r.data)); }, []);
  return (
    <div className="workload-grid">
      {Object.entries(workload).map(([person, counts]) => (
        <div key={person} className="workload-card">
          <div className="workload-name">{person}</div>
          <div className="workload-stats">
            {STATUSES.map(s => (
              <div key={s} className="workload-stat">
                <span>{STATUS_LABELS[s]}</span>
                <span style={{fontWeight:600}}>{counts[s] || 0}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
      {Object.keys(workload).length === 0 && <div className="empty-state">No task data yet</div>}
    </div>
  );
}

export default function TechSprintPage() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("board");
  const [tasks, setTasks] = useState([]);
  const [clients, setClients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const clientId = searchParams.get("clientId");
  const loadTasks = async () => {
    const params = {};
    if (clientId) params.clientId = clientId;
    const res = await techsprint.listTasks(params);
    setTasks(res.data);
  };
  useEffect(() => { loadTasks(); cci.list().then(r => setClients(r.data)); }, [clientId]);
  const handleCreate = async (data) => {
    const payload = { ...data };
    if (payload.deadline) payload.deadline = new Date(payload.deadline).toISOString();
    if (!payload.deadline) delete payload.deadline;
    if (!payload.clientId) delete payload.clientId;
    if (!payload.parentId) delete payload.parentId;
    await techsprint.createTask(payload);
    setShowForm(false);
    loadTasks();
  };
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{"TechSprint " + (clientId ? "(Filtered by client)" : "")}</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Add Task</button>
      </div>
      <div className="tabs">
        {["board","calendar","workload"].map(tab => (
          <button key={tab} className={"tab-btn" + (activeTab===tab ? " active" : "")} onClick={() => setActiveTab(tab)}>
            {tab.charAt(0).toUpperCase()+tab.slice(1)}
          </button>
        ))}
      </div>
      {activeTab === "board" && <BoardTab tasks={tasks} onRefresh={loadTasks} />}
      {activeTab === "calendar" && <CalendarTab />}
      {activeTab === "workload" && <WorkloadTab />}
      {showForm && <TaskModal onSubmit={handleCreate} onClose={() => setShowForm(false)} clients={clients} />}
    </div>
  );
}
