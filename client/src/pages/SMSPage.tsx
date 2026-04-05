import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Send, ArrowLeft } from 'lucide-react';
import { getSMSConversations, getSMSThread, sendSMS } from '../services/dialer.service';
import './SMSPage.css';

export default function SMSPage() {
  const queryClient = useQueryClient();
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
  const [newPhone, setNewPhone] = useState('');
  const [message, setMessage] = useState('');

  const { data: convData } = useQuery({
    queryKey: ['sms-conversations'],
    queryFn: getSMSConversations,
  });

  const { data: threadData } = useQuery({
    queryKey: ['sms-thread', selectedPhone],
    queryFn: () => getSMSThread(selectedPhone!),
    enabled: !!selectedPhone,
    refetchInterval: 10000, // Poll for new messages
  });

  const sendMutation = useMutation({
    mutationFn: () => sendSMS(selectedPhone || newPhone, message),
    onSuccess: () => {
      setMessage('');
      if (!selectedPhone && newPhone) {
        setSelectedPhone(newPhone);
        setNewPhone('');
      }
      queryClient.invalidateQueries({ queryKey: ['sms-thread', selectedPhone || newPhone] });
      queryClient.invalidateQueries({ queryKey: ['sms-conversations'] });
    },
  });

  const conversations = convData?.data || [];
  const messages = threadData?.data || [];

  return (
    <div className="sms-page">
      <div className="sms-sidebar">
        <div className="sms-sidebar-header">
          <h3><MessageSquare size={16} /> SMS</h3>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => { setSelectedPhone(null); setNewPhone(''); }}
          >
            New
          </button>
        </div>

        <div className="conversation-list">
          {conversations.length === 0 ? (
            <p className="no-convos">No conversations yet</p>
          ) : (
            conversations.map((conv: any) => (
              <button
                key={conv.phone_number}
                className={`convo-item ${selectedPhone === conv.phone_number ? 'active' : ''}`}
                onClick={() => setSelectedPhone(conv.phone_number)}
              >
                <div className="convo-phone">{conv.phone_number}</div>
                <div className="convo-preview">
                  {conv.last_outbound || conv.last_inbound || 'No messages'}
                </div>
                <div className="convo-meta">
                  <span>{conv.message_count} msgs</span>
                  <span>{new Date(conv.last_message_at).toLocaleDateString()}</span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="sms-main">
        {!selectedPhone && !newPhone ? (
          <div className="sms-empty">
            <MessageSquare size={48} />
            <h3>Select a conversation or start a new one</h3>
            <div className="new-sms-input">
              <input
                type="tel"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="Enter phone number..."
              />
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setSelectedPhone(newPhone)}
                disabled={!newPhone}
              >
                Start
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="sms-thread-header">
              <button className="back-btn-sm" onClick={() => setSelectedPhone(null)}>
                <ArrowLeft size={16} />
              </button>
              <span>{selectedPhone || newPhone}</span>
            </div>

            <div className="sms-thread">
              {messages.map((msg: any) => (
                <div
                  key={msg.id}
                  className={`sms-bubble ${msg.direction === 'outbound' ? 'outbound' : 'inbound'}`}
                >
                  <div className="bubble-text">{msg.body}</div>
                  <div className="bubble-time">
                    {new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>

            <div className="sms-compose">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && message && sendMutation.mutate()}
              />
              <button
                className="send-btn"
                onClick={() => sendMutation.mutate()}
                disabled={!message || sendMutation.isPending}
              >
                <Send size={18} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
