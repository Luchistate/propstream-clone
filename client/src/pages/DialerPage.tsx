import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Phone, PhoneOff, Clock, User, Home, FileText } from 'lucide-react';
import { makeCall, endCall, updateCallOutcome, getCallLogs } from '../services/dialer.service';
import './DialerPage.css';

const OUTCOMES = ['no_answer', 'voicemail', 'callback', 'not_interested', 'wrong_number', 'qualified', 'do_not_call'];

export default function DialerPage() {
  const queryClient = useQueryClient();
  const [userPhone, setUserPhone] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [callActive, setCallActive] = useState(false);
  const [callLogId, setCallLogId] = useState<number | null>(null);
  const [callSid, setCallSid] = useState<string>('');
  const [callSeconds, setCallSeconds] = useState(0);
  const [outcome, setOutcome] = useState('');
  const [notes, setNotes] = useState('');
  const [showOutcome, setShowOutcome] = useState(false);

  const { data: logsData } = useQuery({
    queryKey: ['call-logs'],
    queryFn: () => getCallLogs(),
  });

  const callMutation = useMutation({
    mutationFn: () => makeCall({ user_phone: userPhone, lead_phone: leadPhone }),
    onSuccess: (data) => {
      setCallActive(true);
      setCallLogId(data.data.call_log_id);
      setCallSid(data.data.twilio_sid || '');
      // Start timer
      const start = Date.now();
      const timer = setInterval(() => {
        setCallSeconds(Math.floor((Date.now() - start) / 1000));
      }, 1000);
      (window as any).__callTimer = timer;
    },
  });

  const endMutation = useMutation({
    mutationFn: () => endCall(callSid),
    onSuccess: () => {
      setCallActive(false);
      clearInterval((window as any).__callTimer);
      setShowOutcome(true);
    },
  });

  const outcomeMutation = useMutation({
    mutationFn: () => updateCallOutcome(callLogId!, outcome, notes),
    onSuccess: () => {
      setShowOutcome(false);
      setOutcome('');
      setNotes('');
      setCallSeconds(0);
      setLeadPhone('');
      queryClient.invalidateQueries({ queryKey: ['call-logs'] });
    },
  });

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const calls = logsData?.data?.calls || [];

  return (
    <div className="dialer-page">
      <div className="dialer-main">
        <div className="dialer-card card">
          <h2><Phone size={20} /> Power Dialer</h2>
          <p className="dialer-desc">Call leads directly to your personal cell phone via Twilio</p>

          <div className="dialer-inputs">
            <div className="form-group">
              <label>Your Cell Phone</label>
              <input
                type="tel"
                value={userPhone}
                onChange={(e) => setUserPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
                disabled={callActive}
              />
            </div>
            <div className="form-group">
              <label>Lead Phone Number</label>
              <input
                type="tel"
                value={leadPhone}
                onChange={(e) => setLeadPhone(e.target.value)}
                placeholder="+1 (555) 987-6543"
                disabled={callActive}
              />
            </div>
          </div>

          {callActive && (
            <div className="call-active">
              <div className="call-timer">
                <Clock size={16} />
                <span>{formatTime(callSeconds)}</span>
              </div>
              <div className="call-status">Connected to {leadPhone}</div>
            </div>
          )}

          <div className="dialer-actions">
            {!callActive ? (
              <button
                className="btn btn-success call-btn"
                onClick={() => callMutation.mutate()}
                disabled={!userPhone || !leadPhone || callMutation.isPending}
              >
                <Phone size={18} />
                {callMutation.isPending ? 'Dialing...' : 'Call'}
              </button>
            ) : (
              <button
                className="btn btn-danger call-btn"
                onClick={() => endMutation.mutate()}
              >
                <PhoneOff size={18} /> End Call
              </button>
            )}
          </div>

          {showOutcome && (
            <div className="outcome-form">
              <h3>Call Outcome</h3>
              <div className="form-group">
                <label>Result</label>
                <select value={outcome} onChange={(e) => setOutcome(e.target.value)}>
                  <option value="">Select outcome...</option>
                  {OUTCOMES.map(o => (
                    <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Call notes..."
                  rows={3}
                />
              </div>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => outcomeMutation.mutate()}
                disabled={!outcome}
              >
                Save & Continue
              </button>
            </div>
          )}

          <div className="dialer-how">
            <h4>How it works</h4>
            <ol>
              <li>Enter your personal cell phone number</li>
              <li>Enter the lead's phone number (from skip tracing)</li>
              <li>Click "Call" — your cell phone will ring first</li>
              <li>Pick up, and you'll be connected to the lead</li>
              <li>After the call, log the outcome</li>
            </ol>
          </div>
        </div>
      </div>

      <div className="call-history">
        <h3><FileText size={16} /> Recent Calls</h3>
        {calls.length === 0 ? (
          <p className="no-calls">No calls yet. Start dialing!</p>
        ) : (
          <div className="call-list">
            {calls.map((call: any) => (
              <div key={call.id} className="call-item">
                <div className="call-item-main">
                  <Phone size={14} />
                  <span className="call-phone">{call.phone_number}</span>
                  {call.address_line1 && (
                    <span className="call-address">{call.address_line1}</span>
                  )}
                </div>
                <div className="call-item-meta">
                  {call.outcome && (
                    <span className={`badge badge-${call.outcome}`}>
                      {call.outcome.replace(/_/g, ' ')}
                    </span>
                  )}
                  <span className="call-duration">
                    {call.duration_seconds ? formatTime(call.duration_seconds) : '-'}
                  </span>
                  <span className="call-date">
                    {new Date(call.called_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
