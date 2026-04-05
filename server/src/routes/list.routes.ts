import { Router } from 'express';
import * as listController from '../controllers/list.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

function asyncHandler(fn: (req: any, res: any, next: any) => Promise<void>) {
  return (req: any, res: any, next: any) => fn(req, res, next).catch(next);
}

router.use(authenticate);

router.get('/', asyncHandler(listController.getLists));
router.post('/', asyncHandler(listController.createList));
router.get('/:id', asyncHandler(listController.getList));
router.put('/:id', asyncHandler(listController.updateList));
router.delete('/:id', asyncHandler(listController.deleteList));
router.get('/:id/items', asyncHandler(listController.getItems));
router.post('/:id/items', asyncHandler(listController.addItems));
router.delete('/:id/items', asyncHandler(listController.removeItems));
router.patch('/:id/items/:itemId', asyncHandler(listController.updateItemStatus));
router.get('/:id/export', asyncHandler(listController.exportList));

export default router;
