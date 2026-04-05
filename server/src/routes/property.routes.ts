import { Router } from 'express';
import * as propertyController from '../controllers/property.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

function asyncHandler(fn: (req: any, res: any, next: any) => Promise<void>) {
  return (req: any, res: any, next: any) => fn(req, res, next).catch(next);
}

router.get('/search', authenticate, asyncHandler(propertyController.search));
router.get('/geojson', authenticate, asyncHandler(propertyController.searchGeoJSON));
router.get('/:id', authenticate, asyncHandler(propertyController.getDetail));

export default router;
