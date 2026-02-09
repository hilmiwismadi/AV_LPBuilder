import React, { useState, useEffect, useRef } from 'react';
import { whatsappAPI, chatAPI } from '../services/api';
import { chatTemplates, getTemplateVariables } from '../data/chatTemplates';
import './ChatModal.css';

const ChatModal = ({ client, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false);
  const [whatsappStatus, setWhatsappStatus] = useState('unknown');
  const [error, setError] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [userScrolled, setUserScrolled] = useState(false);
  const [pendingMessageId, setPendingMessageId] = useState(null);
  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const refreshIntervalRef = useRef(null);

  useEffect(() => {
    fetchChatHistory();
    checkWhatsAppStatus();

    refreshIntervalRef.current = setInterval(() => {
      fetchChatHistory(true);
      checkWhatsAppStatus();
    }, 3000);

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [client]);

  useEffect(() => {
    if (!userScrolled && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, userScrolled]);

  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    setUserScrolled(!isAtBottom);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const checkWhatsAppStatus = async () => {
    try {
      const response = await whatsappAPI.getStatus();
      setWhatsappStatus(response.data.status);

      if (response.data.incomingMessages && response.data.incomingMessages.length > 0) {
        fetchChatHistory(true);
      }
    } catch (err) {
      console.error('Error checking WhatsApp status:', err);
    }
  };

  const fetchChatHistory = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const response = await chatAPI.getHistory(client.id);
      const serverMessages = response.data.messages || [];

      setMessages((prev) => {
        if (pendingMessageId) {
          const filteredServer = serverMessages.filter(m => m.id !== pendingMessageId);
          return [...prev.filter(m => m.id !== pendingMessageId), ...filteredServer];
        }
        return serverMessages;
      });
    } catch (error) {
      console.error('Failed to fetch chat history:', error);
      if (!silent) setError('Failed to load chat history');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleSend = async (sendViaWhatsApp = false) => {
    if (!newMessage.trim()) return;

    const messageToSend = newMessage;
    setNewMessage('');
    setSelectedTemplate('');
    setError(null);

    if (sendViaWhatsApp) {
      const tempId = 'pending-' + Date.now();
      setPendingMessageId(tempId);

      const optimisticMessage = {
        id: tempId,
        text: messageToSend,
        sender: 'user',
        timestamp: new Date(),
        isOutgoing: true,
        isOptimistic: true
      };

      setMessages((prev) => [...prev, optimisticMessage]);
      setUserScrolled(false);
      scrollToBottom();

      try {
        setLoading(true);
        setSendingWhatsApp(true);

        const response = await chatAPI.sendMessage(client.id, messageToSend, true, sendViaWhatsApp);

        setMessages((prev) => {
          const withoutOptimistic = prev.filter(m => m.id !== tempId);

          const duplicateExists = withoutOptimistic.some(m =>
            m.text === messageToSend &&
            Math.abs(new Date(m.timestamp) - new Date()) < 2000 &&
            !m.isOptimistic
          );

          if (duplicateExists) {
            return withoutOptimistic;
          }

          return [...withoutOptimistic, {
            id: response.data.id,
            text: response.data.message || messageToSend,
            sender: 'user',
            timestamp: new Date(response.data.timestamp),
            isOutgoing: true
          }];
        });

        setPendingMessageId(null);
        setUserScrolled(false);
        setTimeout(() => scrollToBottom(), 100);

      } catch (err) {
        console.error('Failed to send message:', err);
        setMessages((prev) => prev.filter(m => m.id !== tempId));
        setPendingMessageId(null);
        setNewMessage(messageToSend);

        if (err.response?.status === 503) {
          setError('WhatsApp not ready. Please connect WhatsApp first.');
        } else {
          setError('Failed to send message. Please try again.');
        }

        setTimeout(() => setError(null), 5000);
      } finally {
        setLoading(false);
        setSendingWhatsApp(false);
      }
    } else {
      try {
        setLoading(true);

        const response = await chatAPI.sendMessage(client.id, messageToSend, true, false);

        setMessages((prev) => {
          const duplicateExists = prev.some(m =>
            m.text === messageToSend &&
            Math.abs(new Date(m.timestamp) - new Date()) < 2000
          );

          if (duplicateExists) {
            return prev;
          }

          return [...prev, {
            id: response.data.id,
            text: response.data.message || messageToSend,
            sender: 'user',
            timestamp: new Date(response.data.timestamp),
            isOutgoing: true
          }];
        });

        setUserScrolled(false);
        setTimeout(() => scrollToBottom(), 100);

      } catch (err) {
        console.error('Failed to save message:', err);
        setNewMessage(messageToSend);
        setError('Failed to save message. Please try again.');
        setTimeout(() => setError(null), 5000);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(true);
    }
  };

  const handleTemplateSelect = (e) => {
    const templateId = e.target.value;
    setSelectedTemplate(templateId);

    if (!templateId || !client) {
      return;
    }

    const template = chatTemplates.find(t => t.id === templateId);
    if (!template) return;

    const variables = getTemplateVariables(client);

    let message = template.template;
    Object.keys(variables).forEach(key => {
      const placeholder = '{' + key + '}';
      const value = variables[key] || '';
      message = message.replace(new RegExp(placeholder, 'g'), value);
    });

    setNewMessage(message);
  };

  const isWhatsAppReady = whatsappStatus === 'ready';

  return (
    <div className='modal-overlay' onClick={onClose}>
      <div className='chat-modal-content' onClick={(e) => e.stopPropagation()}>
        <div className='chat-modal-header'>
          <div className='chat-header-info'>
            <h3>Chat with {client.eventOrganizer}</h3>
            <span className='phone-number'>{client.phoneNumber}</span>
            <span className={'whatsapp-status ' + (isWhatsAppReady ? 'ready' : 'not-ready')}>
              {isWhatsAppReady ? '🟢 WhatsApp Connected' : '🔴 WhatsApp Not Connected'}
            </span>
          </div>
          <button onClick={onClose} className='close-btn' aria-label='Close modal'>
            ×
          </button>
        </div>

        {error && (
          <div className='chat-error'>
            <span>{error}</span>
            <button onClick={() => setError(null)} className='error-dismiss'>×</button>
          </div>
        )}

        <div
          className='chat-messages'
          ref={messagesContainerRef}
          onScroll={handleScroll}
        >
          {messages.length === 0 ? (
            <div className='no-messages'>
              <p>No messages yet</p>
              <p className='hint'>Start the conversation by sending a message below</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={'message ' + (msg.sender === 'user' ? 'user-message' : 'client-message') + (msg.isOptimistic ? ' optimistic' : '')}
              >
                <div className='message-bubble'>{msg.text}</div>
                <div className='message-time'>
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                  {msg.isOptimistic && ' (sending...)'}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {userScrolled && (
          <div className='scroll-to-bottom' onClick={() => { setUserScrolled(false); scrollToBottom(); }}>
            ↓ New messages below
          </div>
        )}

        <div className='chat-input-area'>
          <div className='template-selector'>
            <label htmlFor='template-select'>📋 Quick Templates:</label>
            <select
              id='template-select'
              value={selectedTemplate}
              onChange={handleTemplateSelect}
              className='template-dropdown'
            >
              <option value=''>-- Select a template --</option>
              {chatTemplates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.category} - {template.name}
                </option>
              ))}
            </select>
          </div>

          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder='Type your message... (Press Enter to send via WhatsApp)'
            rows='3'
            className='message-input'
            disabled={loading}
          />

          <div className='chat-actions'>
            <button
              onClick={() => handleSend(false)}
              disabled={loading || !newMessage.trim()}
              className='save-only-btn'
              title='Save to chat history only'
            >
              {loading && sendingWhatsApp ? 'Saving...' : 'Save Only'}
            </button>

            <button
              onClick={() => handleSend(true)}
              disabled={loading || !newMessage.trim() || !isWhatsAppReady}
              className='send-whatsapp-btn'
              title='Send via WhatsApp'
            >
              {loading && sendingWhatsApp ? (
                'Sending...'
              ) : (
                <>
                  <span className='whatsapp-icon'>📱</span>
                  Send via WhatsApp
                </>
              )}
            </button>
          </div>

          {!isWhatsAppReady && (
            <div className='whatsapp-warning'>
              ⚠️ WhatsApp is not connected. Messages will be saved to chat history only.
              <br />
              Connect WhatsApp to send messages directly to clients.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatModal;
