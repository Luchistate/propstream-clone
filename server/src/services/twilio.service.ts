import { env } from '../config/env.js';
import { query } from '../config/database.js';

// Twilio REST API wrapper — avoids needing the twilio npm package for basic operations
const TWILIO_BASE = 'https://api.twilio.com/2010-04-01';

async function twilioFetch(endpoint: string, method = 'GET', body?: Record<string, string>): Promise<any> {
  if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN) {
    console.warn('Twilio credentials not configured');
    return null;
  }

  const url = `${TWILIO_BASE}/Accounts/${env.TWILIO_ACCOUNT_SID}${endpoint}.json`;
  const auth = Buffer.from(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`).toString('base64');

  const options: RequestInit = {
    method,
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  };

  if (body) {
    options.body = new URLSearchParams(body).toString();
  }

  const response = await fetch(url, options);
  if (!response.ok) {
    const text = await response.text();
    console.error(`Twilio API error ${response.status}: ${text}`);
    return null;
  }

  return response.json();
}

/**
 * Initiates a call that first rings the user's personal cell,
 * then bridges to the lead's phone number.
 *
 * Flow:
 * 1. Twilio calls the user's personal cell
 * 2. When user picks up, Twilio uses TwiML to bridge to the lead
 */
export async function makeCall(
  userPhone: string,
  leadPhone: string,
  callbackUrl: string
): Promise<any> {
  return twilioFetch('/Calls', 'POST', {
    To: userPhone,           // Call the user's cell first
    From: env.TWILIO_PHONE_NUMBER,
    Url: `${callbackUrl}?leadPhone=${encodeURIComponent(leadPhone)}`,
    StatusCallback: `${callbackUrl}/status`,
    StatusCallbackMethod: 'POST',
    StatusCallbackEvent: 'initiated ringing answered completed',
    Record: 'true',
  });
}

export async function endCall(callSid: string): Promise<any> {
  return twilioFetch(`/Calls/${callSid}`, 'POST', {
    Status: 'completed',
  });
}

export async function sendSMS(to: string, body: string, from?: string): Promise<any> {
  return twilioFetch('/Messages', 'POST', {
    To: to,
    From: from || env.TWILIO_PHONE_NUMBER,
    Body: body,
  });
}

/**
 * Generate TwiML XML for bridging a call to the lead's phone
 */
export function generateBridgeTwiML(leadPhone: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Connecting you to the lead now.</Say>
  <Dial callerId="${env.TWILIO_PHONE_NUMBER}" record="record-from-answer">
    <Number>${leadPhone}</Number>
  </Dial>
</Response>`;
}

/**
 * Log a call to the database
 */
export async function logCall(data: {
  userId: number;
  propertyId?: number;
  listId?: number;
  phoneNumber: string;
  direction?: string;
  twilioCallSid?: string;
}): Promise<any> {
  const result = await query(
    `INSERT INTO call_logs (user_id, property_id, list_id, phone_number, direction, twilio_call_sid)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [data.userId, data.propertyId || null, data.listId || null, data.phoneNumber, data.direction || 'outbound', data.twilioCallSid || null]
  );
  return result.rows[0];
}

export async function updateCallLog(callLogId: number, data: {
  duration?: number;
  outcome?: string;
  notes?: string;
  recordingUrl?: string;
}): Promise<any> {
  const result = await query(
    `UPDATE call_logs SET
      duration_seconds = COALESCE($2, duration_seconds),
      outcome = COALESCE($3::call_outcome, outcome),
      notes = COALESCE($4, notes),
      recording_url = COALESCE($5, recording_url),
      ended_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [callLogId, data.duration || null, data.outcome || null, data.notes || null, data.recordingUrl || null]
  );
  return result.rows[0];
}

export async function logSMS(data: {
  userId: number;
  propertyId?: number;
  phoneNumber: string;
  direction: string;
  body: string;
  twilioSid?: string;
}): Promise<any> {
  const result = await query(
    `INSERT INTO sms_messages (user_id, property_id, phone_number, direction, body, twilio_message_sid)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [data.userId, data.propertyId || null, data.phoneNumber, data.direction, data.body, data.twilioSid || null]
  );
  return result.rows[0];
}
