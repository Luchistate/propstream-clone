import type { Request, Response } from 'express';
import * as twilioService from '../services/twilio.service.js';
import { query } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';

export async function makeCall(req: Request, res: Response): Promise<void> {
  const { user_phone, lead_phone, property_id, list_id } = req.body;
  if (!user_phone || !lead_phone) {
    throw new AppError(400, 'user_phone and lead_phone are required');
  }

  const callbackUrl = `${req.protocol}://${req.get('host')}/api/dialer/twiml`;

  const twilioResult = await twilioService.makeCall(user_phone, lead_phone, callbackUrl);

  // Log the call
  const callLog = await twilioService.logCall({
    userId: req.user!.user_id,
    propertyId: property_id,
    listId: list_id,
    phoneNumber: lead_phone,
    twilioCallSid: twilioResult?.sid,
  });

  res.json({
    success: true,
    data: {
      call_log_id: callLog.id,
      twilio_sid: twilioResult?.sid,
    },
  });
}

export async function endCall(req: Request, res: Response): Promise<void> {
  const { call_sid } = req.body;
  if (call_sid) {
    await twilioService.endCall(call_sid);
  }
  res.json({ success: true });
}

// TwiML endpoint — Twilio calls this to get instructions for bridging
export async function twiml(req: Request, res: Response): Promise<void> {
  const leadPhone = req.query.leadPhone as string;
  if (!leadPhone) {
    res.type('text/xml').send(`<?xml version="1.0" encoding="UTF-8"?><Response><Say>Error: no lead phone number.</Say></Response>`);
    return;
  }

  const xml = twilioService.generateBridgeTwiML(leadPhone);
  res.type('text/xml').send(xml);
}

// Twilio status callback
export async function statusCallback(req: Request, res: Response): Promise<void> {
  const { CallSid, CallStatus, CallDuration, RecordingUrl } = req.body;

  if (CallSid && (CallStatus === 'completed' || CallStatus === 'no-answer' || CallStatus === 'busy')) {
    const callLog = await query(
      'SELECT id FROM call_logs WHERE twilio_call_sid = $1',
      [CallSid]
    );

    if (callLog.rows[0]) {
      await twilioService.updateCallLog(callLog.rows[0].id, {
        duration: CallDuration ? parseInt(CallDuration) : undefined,
        recordingUrl: RecordingUrl,
      });
    }
  }

  res.sendStatus(200);
}

export async function updateCallOutcome(req: Request, res: Response): Promise<void> {
  const callLogId = parseInt(req.params.id);
  const { outcome, notes } = req.body;

  const result = await twilioService.updateCallLog(callLogId, { outcome, notes });
  if (!result) throw new AppError(404, 'Call log not found');

  res.json({ success: true, data: result });
}

export async function getCallLogs(req: Request, res: Response): Promise<void> {
  const page = parseInt(req.query.page as string) || 1;
  const limit = 50;
  const offset = (page - 1) * limit;

  const result = await query(
    `SELECT cl.*,
      p.address_line1, p.city, p.state, p.zip
     FROM call_logs cl
     LEFT JOIN properties p ON p.id = cl.property_id
     WHERE cl.user_id = $1
     ORDER BY cl.called_at DESC
     LIMIT $2 OFFSET $3`,
    [req.user!.user_id, limit, offset]
  );

  const countResult = await query(
    'SELECT COUNT(*) FROM call_logs WHERE user_id = $1',
    [req.user!.user_id]
  );

  res.json({
    success: true,
    data: {
      calls: result.rows,
      total: parseInt(countResult.rows[0].count, 10),
    },
  });
}

export async function sendSMS(req: Request, res: Response): Promise<void> {
  const { to, body, property_id } = req.body;
  if (!to || !body) throw new AppError(400, 'to and body are required');

  const twilioResult = await twilioService.sendSMS(to, body);

  await twilioService.logSMS({
    userId: req.user!.user_id,
    propertyId: property_id,
    phoneNumber: to,
    direction: 'outbound',
    body,
    twilioSid: twilioResult?.sid,
  });

  res.json({ success: true, data: { sid: twilioResult?.sid } });
}

export async function getSMSConversations(req: Request, res: Response): Promise<void> {
  const result = await query(
    `SELECT phone_number,
      MAX(sent_at) as last_message_at,
      COUNT(*) as message_count,
      MAX(CASE WHEN direction = 'inbound' THEN body END) as last_inbound,
      MAX(CASE WHEN direction = 'outbound' THEN body END) as last_outbound
     FROM sms_messages
     WHERE user_id = $1
     GROUP BY phone_number
     ORDER BY MAX(sent_at) DESC`,
    [req.user!.user_id]
  );

  res.json({ success: true, data: result.rows });
}

export async function getSMSThread(req: Request, res: Response): Promise<void> {
  const phone = req.params.phone;
  const result = await query(
    `SELECT * FROM sms_messages
     WHERE user_id = $1 AND phone_number = $2
     ORDER BY sent_at ASC`,
    [req.user!.user_id, phone]
  );

  res.json({ success: true, data: result.rows });
}

// Twilio webhook for incoming SMS
export async function incomingSMS(req: Request, res: Response): Promise<void> {
  const { From, Body, MessageSid } = req.body;

  // Find the user who owns this Twilio number and has messaged this phone before
  const existing = await query(
    `SELECT DISTINCT user_id FROM sms_messages WHERE phone_number = $1 LIMIT 1`,
    [From]
  );

  if (existing.rows[0]) {
    await twilioService.logSMS({
      userId: existing.rows[0].user_id,
      phoneNumber: From,
      direction: 'inbound',
      body: Body,
      twilioSid: MessageSid,
    });
  }

  res.type('text/xml').send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
}
