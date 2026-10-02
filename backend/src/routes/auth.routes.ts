import { Router } from 'express';
import { login } from '../controllers/auth.controller';
import { validate } from '../middlewares/validate.middleware';
import { loginRateLimiter1Min, loginRateLimiter15Min } from '../middlewares/rateLimit.middleware';
import { loginSchema } from '../schemas/auth.schema';

const router = Router();

router.post('/login', loginRateLimiter1Min, loginRateLimiter15Min, validate(loginSchema), login);

export default router;
