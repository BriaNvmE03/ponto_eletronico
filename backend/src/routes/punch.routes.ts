import { Router } from 'express';
import { registerPunch, getTodayPunches } from '../controllers/punch.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { registerPunchSchema } from '../schemas/punch.schema';

const router = Router();

// Todas as rotas de bater ponto exigem autenticação (usuário logado)
router.use(authMiddleware);

router.post('/', validate(registerPunchSchema), registerPunch);
router.get('/today', getTodayPunches);

export default router;
