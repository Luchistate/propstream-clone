import { Router } from 'express';
import * as skipTraceController from '../controllers/skipTrace.controller.js';
import { authenticate } from '../middleware/auth.js';
import { skipTraceLimiter } from '../middleware/rateLimiter.js';

const router = Router();

function asyncHandler(fn: (req: any, res: any, next: any) => Promise<void>) {
  return (req: any, res: any, next: any) => fn(req, res, next).catch(next);
}

router.use(authenticate);

router.post('/single', skipTraceLimiter, asyncHandler(skipTraceController.traceSingle));
router.post('/bulk', skipTraceLimiter, asyncHandler(skipTraceController.traceBulk));
router.get('/results/:propertyId', asyncHandler(skipTraceController.getResult));
router.get('/credits', asyncHandler(skipTraceController.getCredits));

export default router;
