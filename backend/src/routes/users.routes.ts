import { Router } from 'express';
import { getUsers, updateUserStatus, updateUser, changePassword, deleteUser, createUser } from '../controllers/users.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createUserSchema, updateUserSchema, changePasswordSchema, updateUserStatusSchema, userIdParamSchema } from '../schemas/user.schema';

const router = Router();

// Todas as rotas de usuários exigem autenticação
router.use(authMiddleware);

router.get('/', getUsers);
router.post('/', validate(createUserSchema), createUser);
router.put('/:id', validate(updateUserSchema), updateUser);
router.patch('/:id/password', validate(changePasswordSchema), changePassword);
router.patch('/:id/status', validate(updateUserStatusSchema), updateUserStatus);
router.delete('/:id', validate(userIdParamSchema), deleteUser);

export default router;
