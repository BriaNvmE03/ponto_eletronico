import { Router } from 'express';
import { getOrganizations, createTenant, deleteOrganization, updateOrganization } from '../controllers/organizations.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Todas as rotas de organizações exigem que o usuário esteja logado
router.use(authMiddleware);

router.get('/', getOrganizations);
router.post('/tenant', createTenant);
router.put('/:id', updateOrganization);
router.delete('/:id', deleteOrganization);

export default router;
