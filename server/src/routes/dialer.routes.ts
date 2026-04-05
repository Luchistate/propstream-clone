import { Router } from 'express';
import * as dialerController from '../controllers/dialer.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

function asyncHandler(fn: (req: any, res: any, next: any) => Promise<void>) {
  return (req: any, res: any, next: any) => fn(req, res, next).catch(next);
}

// Twilio webhook endpoints (no auth — Twilio calls these)
router.get('/twiml', asyncHandler(dialerController.twiml));
router.post('/twiml', asyncHandler(dialerController.twiml));
router.post('/twiml/status', asyncHandler(dialerController.statusCallback));
router.post('/sms/webhook', asyncHandler(dialerController.incomingSMS));

// Authenticated endpoints
router.post('/call', authenticate, asyncHandler(dialerController.makeCall));
router.post('/end', authenticate, asyncHandler(dialerController.endCall));
router.get('/call-logs', authenticate, asyncHandler(dialerController.getCallLogs));
router.patch('/call-logs/:id', authenticate, asyncHandler(dialerController.updateCallOutcome));

// SMS
router.post('/sms/send', authenticate, asyncHandler(dialerController.sendSMS));
router.get('/sms/conversations', authenticate, asyncHandler(dialerController.getSMSConversations));
router.get('/sms/thread/:phone', authenticate, asyncHandler(dialerController.getSMSThread));

export default router;
