import { useState, useRef, useEffect } from 'react';
import { openclaw } from '../services/api.js';

const CONFIRMATION_LABELS = {
  update_client_field: 'Update Client Field',
  add_client_note: 'Add Client Note',
  create_task: 'Create Task',
  update_task: 'Update Task',
};

const CAT_ICONS = {
  tech_requirement: 'REQ',
  negotiation: 'NEG',
  legal: 'LGL',
  general: 'GEN',
};

function ConfirmationCard({ preview, toolName, onConfirm, onCancel }) {
  const label = CONFIRMATION_LABELS[toolName] || toolName;
  return (
    <div style={{
      background: 'rgba(99,102,241,0.08)',
      border: '1px solid rgba(99,102,241,0.3)',
      borderRadius: '8px',
      padding: '12px',
      marginTop: '8px'
    }}>
      <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#818cf8', marginBottom: '8px' }}>
        Action: {label}
      </div>
      {preview && Object.entries(preview).filter(([k]) => k !== 'action').map(([key, val]) => (
        <div key={key} style={{ display: 'flex', gap: '8px', marginBottom: '4px', fontSize: '12px' }}>
          <span style={{ color: '#94a3b8', minWidth: '80px' }}>{key}:</span>
          <span style={{ color: '#f1f5f9', wordBreak: 'break-word' }}>
            {key === 'category' ? (CAT_ICONS[val] || '') + ' ' + val : String(val ?? '-')}
          </span>
        </div>
      ))}
      <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
        <button onClick={onConfirm} style={{
          flex: 1, padding: '6px', background: '#10b981', color: 'white',
          border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', fontSize: '13px'
        }}>Confirm</button>
        <button onClick={onCancel} style={{
          flex: 1, padding: '6px', background: '#ef4444', color: 'white',
          border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', fontSize: '13px'
        }}>Cancel</button>
      </div>
    </div>
  );
}

function Message({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: '12px'
    }}>
      <div style={{
        maxWidth: '85%',
        background: isUser ? '#6366f1' : '#1e293b',
        color: '#f1f5f9',
        padding: '10px 13px',
        borderRadius: isUser ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
        fontSize: '13px',
        lineHeight: '1.5',
        border: isUser ? 'none' : '1px solid #334155',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word'
      }}>
        {msg.content}
        {msg.confirmation && (
          <ConfirmationCard
            preview={msg.confirmation.preview}
            toolName={msg.confirmation.toolName}
            onConfirm={msg.confirmation.onConfirm}
            onCancel={msg.confirmation.onCancel}
          />
        )}
        {msg.loading && <span style={{ opacity: 0.6 }}>...</span>}
      </div>
    </div>
  );
}


export default function OpenClawChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, role: 'assistant', content: 'Hi! I am OpenClaw. Ask me about clients, tasks, or anything about Roetix operations. I can also update records - I will ask for your confirmation first.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const pendingConfirmRef = useRef(null);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  useEffect(() => {
    if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMsg = (msg) => setMessages(m => [...m, { id: Date.now() + Math.random(), ...msg }]);

  const handleConfirm = async () => {
    if (!pendingConfirmRef.current) return;
    const { toolName, toolArgs, toolUseId, assistantMessage, userMessage, conversationHistory } = pendingConfirmRef.current;
    pendingConfirmRef.current = null;
    setMessages(m => m.map(msg => msg.isConfirmation ? { ...msg, confirmation: null, content: msg.content + '\nConfirmed - executing...' } : msg));
    setLoading(true);
    try {
      const res = await openclaw.confirm({ toolName, toolArgs, toolUseId, assistantMessage, confirmed: true, conversationHistory, userMessage });
      setHistory(res.data.updatedHistory || []);
      addMsg({ role: 'assistant', content: res.data.reply });
    } catch (err) {
      addMsg({ role: 'assistant', content: 'Error: ' + (err.response?.data?.error || err.message) });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!pendingConfirmRef.current) return;
    const { toolName, toolArgs, toolUseId, assistantMessage, userMessage, conversationHistory } = pendingConfirmRef.current;
    pendingConfirmRef.current = null;
    setMessages(m => m.map(msg => msg.isConfirmation ? { ...msg, confirmation: null, content: msg.content + '\nCancelled.' } : msg));
    setLoading(true);
    try {
      const res = await openclaw.confirm({ toolName, toolArgs, toolUseId, assistantMessage, confirmed: false, conversationHistory, userMessage });
      addMsg({ role: 'assistant', content: res.data.reply });
    } catch (err) {
      addMsg({ role: 'assistant', content: 'Cancelled.' });
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    addMsg({ role: 'user', content: text });
    setLoading(true);
    try {
      const res = await openclaw.chat({ message: text, conversationHistory: history });
      const data = res.data;
      if (data.requiresConfirmation) {
        const msgId = Date.now();
        pendingConfirmRef.current = {
          toolName: data.toolName, toolArgs: data.toolArgs, toolUseId: data.toolUseId,
          assistantMessage: data.assistantMessage, userMessage: text, conversationHistory: history
        };
        setMessages(m => [...m, {
          id: msgId, role: 'assistant', content: data.reply, isConfirmation: true,
          confirmation: { toolName: data.toolName, preview: data.confirmationPreview, onConfirm: handleConfirm, onCancel: handleCancel }
        }]);
      } else {
        setHistory(data.updatedHistory || []);
        addMsg({ role: 'assistant', content: data.reply });
      }
    } catch (err) {
      addMsg({ role: 'assistant', content: 'Error: ' + (err.response?.data?.error || err.message) });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <>
      <button onClick={() => setOpen(o => !o)} style={{
        position: 'fixed', bottom: '24px', right: '24px', width: '52px', height: '52px',
        background: 'linear-gradient(135deg, #6366f1, #4f46e5)', border: 'none', borderRadius: '50%',
        color: 'white', fontSize: '14px', fontWeight: 700, cursor: 'pointer', zIndex: 1000,
        boxShadow: '0 4px 20px rgba(99,102,241,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center'
      }} title="OpenClaw AI">
        {open ? 'X' : 'AI'}
      </button>

      {open && (
        <div style={{
          position: 'fixed', bottom: '88px', right: '24px', width: '400px', height: '560px',
          background: '#0f172a', border: '1px solid #334155', borderRadius: '12px',
          display: 'flex', flexDirection: 'column', zIndex: 999,
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
        }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px', color: '#f1f5f9' }}>OpenClaw AI</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>AI Operations Assistant</div>
            </div>
            <button onClick={() => { setMessages([{ id: 1, role: 'assistant', content: 'Hi! I am OpenClaw. Ask me about clients, tasks, or anything about Roetix operations.' }]); setHistory([]); }}
              style={{ background: 'none', border: '1px solid #334155', borderRadius: '6px', color: '#94a3b8', padding: '4px 10px', cursor: 'pointer', fontSize: '12px' }}>
              New Chat
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
            {messages.map(msg => <Message key={msg.id} msg={msg} />)}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '12px' }}>
                <div style={{ background: '#1e293b', border: '1px solid #334155', padding: '10px 13px', borderRadius: '12px 12px 12px 2px', color: '#94a3b8', fontSize: '13px' }}>
                  Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div style={{ padding: '12px 16px', borderTop: '1px solid #334155' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown} placeholder="Ask about clients, tasks... (Enter to send)"
                disabled={loading} rows={2} style={{
                  flex: 1, padding: '8px 12px', background: '#1e293b', border: '1px solid #334155',
                  borderRadius: '8px', color: '#f1f5f9', resize: 'none', fontSize: '13px', fontFamily: 'inherit'
                }} />
              <button onClick={sendMessage} disabled={loading || !input.trim()} style={{
                padding: '8px 14px',
                background: input.trim() && !loading ? '#6366f1' : '#1e293b',
                color: input.trim() && !loading ? 'white' : '#64748b',
                border: '1px solid #334155', borderRadius: '8px',
                cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                fontSize: '16px'
              }}>Send</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
