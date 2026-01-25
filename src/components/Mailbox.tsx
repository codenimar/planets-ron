import React, { useState, useEffect } from 'react';
import { MessageAPI } from '../utils/api';

interface Message {
  id: string;
  from_member_id: string;
  to_member_id: string | null;
  subject: string;
  content: string;
  is_read: boolean;
  created_at: string;
  read_at: string | null;
  from_member?: {
    wallet_address: string;
  } | null;
}

const Mailbox: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [messagesRes, unreadRes] = await Promise.all([
        MessageAPI.getMessages(),
        MessageAPI.getUnreadCount(),
      ]);

      if (messagesRes.success) {
        setMessages(messagesRes.messages);
      }
      if (unreadRes.success) {
        setUnreadCount(unreadRes.count);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleMessageClick = async (message: Message) => {
    setSelectedMessage(message);
    
    if (!message.is_read) {
      try {
        await MessageAPI.markAsRead(message.id);
        await loadMessages(); // Reload to update counts
      } catch (err: any) {
        console.error('Failed to mark as read:', err);
      }
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!window.confirm('Are you sure you want to delete this message?')) {
      return;
    }

    try {
      await MessageAPI.deleteMessage(messageId);
      setSelectedMessage(null);
      await loadMessages();
    } catch (err: any) {
      setError(err.message || 'Failed to delete message');
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = diff / (1000 * 60 * 60);

    if (hours < 24) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (hours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  if (loading) {
    return (
      <div className="mailbox-section">
        <div className="loading">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="mailbox-section">
      <div className="mailbox-header">
        <h2>📬 Mailbox</h2>
        {unreadCount > 0 && (
          <span className="unread-badge">{unreadCount} unread</span>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {selectedMessage ? (
        <div className="message-detail">
          <button onClick={() => setSelectedMessage(null)} className="btn btn-secondary" style={{ marginBottom: '1rem' }}>
            ← Back to Inbox
          </button>
          <div className="message-full">
            <h3>{selectedMessage.subject}</h3>
            <div className="message-meta" style={{ marginTop: '0.5rem', marginBottom: '1rem', fontSize: '0.9rem', color: '#9ca3af' }}>
              <span>From: {selectedMessage.to_member_id === null ? 'Admin (Broadcast)' : (selectedMessage.from_member?.wallet_address || 'Admin')}</span>
              <br />
              <span>Date: {new Date(selectedMessage.created_at).toLocaleString()}</span>
            </div>
            <div className="message-body" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', color: '#e5e7eb' }}>
              {/* Content is displayed as plain text to prevent XSS */}
              {selectedMessage.content}
            </div>
            <div style={{ marginTop: '1.5rem' }}>
              <button 
                onClick={() => handleDeleteMessage(selectedMessage.id)} 
                className="btn btn-danger"
              >
                Delete Message
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="message-list">
          {messages.length === 0 ? (
            <div className="empty-state">
              <p>📭 No messages yet</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`message-item ${!message.is_read ? 'unread' : ''}`}
                onClick={() => handleMessageClick(message)}
              >
                <div className="message-header">
                  <div className="message-subject">{message.subject}</div>
                  <div className="message-time">{formatDate(message.created_at)}</div>
                </div>
                <div className="message-preview">{message.content}</div>
                <div className="message-from">
                  {message.to_member_id === null ? '📢 Broadcast Message' : `From: ${message.from_member?.wallet_address || 'Admin'}`}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Mailbox;
