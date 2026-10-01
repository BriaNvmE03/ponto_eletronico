import { Router } from 'express';
import { getPlans } from '../controllers/plans.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);
router.get('/', getPlans);

export default router;
