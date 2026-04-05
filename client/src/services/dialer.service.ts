import api from './api';

export async function makeCall(data: { user_phone: string; lead_phone: string; property_id?: number; list_id?: number }) {
  const res = await api.post('/dialer/call', data);
  return res.data;
}

export async function endCall(callSid: string) {
  const res = await api.post('/dialer/end', { call_sid: callSid });
  return res.data;
}

export async function updateCallOutcome(callLogId: number, outcome: string, notes?: string) {
  const res = await api.patch(`/dialer/call-logs/${callLogId}`, { outcome, notes });
  return res.data;
}

export async function getCallLogs(page = 1) {
  const res = await api.get('/dialer/call-logs', { params: { page } });
  return res.data;
}

export async function sendSMS(to: string, body: string, propertyId?: number) {
  const res = await api.post('/dialer/sms/send', { to, body, property_id: propertyId });
  return res.data;
}

export async function getSMSConversations() {
  const res = await api.get('/dialer/sms/conversations');
  return res.data;
}

export async function getSMSThread(phone: string) {
  const res = await api.get(`/dialer/sms/thread/${encodeURIComponent(phone)}`);
  return res.data;
}
