import { useState, useEffect } from 'react';
import { chatAPI, templateAPI, whatsappAPI } from '../services/api';
import { format } from 'date-fns';

const ChatModal = ({ client, onClose }) => {
  const [chatHistory, setChatHistory] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (client) {
      loadChatHistory();
      loadTemplates();
    }
  }, [client]);

  const loadChatHistory = async () => {
    try {
      const response = await chatAPI.getHistory(client.id);
      setChatHistory(response.data);
    } catch (err) {
      console.error('Error loading chat history:', err);
    }
  };

  const loadTemplates = async () => {
    try {
      const response = await templateAPI.getAll();
      setTemplates(response.data);
    } catch (err) {
      console.error('Error loading templates:', err);
    }
  };

  const handleTemplateChange = async (e) => {
    const templateId = e.target.value;
    setSelectedTemplate(templateId);

    if (templateId) {
      try {
        // Get the template and process variables
        const template = templates.find((t) => t.id === templateId);
        if (template) {
          // Replace template variables with client data
          let processedMessage = template.message;

          // Map of template variables to client fields
          const variableMap = {
            event_organizer: client.eventOrganizer || '[event_organizer]',
            variant_fcc: 'salah satu panitia', // Default, can be customized
            link_demo: client.linkDemo || '[link_demo - belum diisi]',
          };

          Object.keys(variableMap).forEach((key) => {
            const regex = new RegExp(`\\[${key}\\]`, 'g');
            processedMessage = processedMessage.replace(regex, variableMap[key]);
          });

          setMessage(processedMessage);
        }
      } catch (err) {
        console.error('Error processing template:', err);
      }
    } else {
      setMessage('');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    setError('');

    try {
      await whatsappAPI.sendMessage(client.id, message);

      // Reload chat history
      await loadChatHistory();

      // Clear message and template selection
      setMessage('');
      setSelectedTemplate('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    return format(new Date(timestamp), 'dd/MM/yyyy HH:mm');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Chat with {client.eventOrganizer}</h2>
            <p style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>
              {client.phoneNumber}
            </p>
          </div>
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </div>

        {error && <div className="error">{error}</div>}

        {/* Chat History */}
        <div className="chat-history">
          {chatHistory.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#999' }}>
              No messages yet. Start a conversation!
            </p>
          ) : (
            chatHistory.map((chat) => (
              <div
                key={chat.id}
                className={`chat-message ${chat.isOutgoing ? 'outgoing' : 'incoming'}`}
              >
                <div>{chat.message}</div>
                <div className="chat-message-time">{formatTime(chat.timestamp)}</div>
              </div>
            ))
          )}
        </div>

        {/* Template Selection */}
        <div className="form-group">
          <label>Select Template</label>
          <select value={selectedTemplate} onChange={handleTemplateChange}>
            <option value="">-- Choose a template --</option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name} - {template.category}
              </option>
            ))}
          </select>
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage}>
          <div className="form-group">
            <label>Your Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows="4"
              placeholder="Type your message or select a template..."
            />
          </div>

          <div className="button-group">
            <button type="button" className="secondary" onClick={onClose}>
              Close
            </button>
            <button type="submit" className="primary" disabled={loading || !message.trim()}>
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatModal;
