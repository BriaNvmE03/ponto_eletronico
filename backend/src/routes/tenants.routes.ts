import { Router } from 'express';
import { getOrganizations, createTenant, updateTenant, deleteOrganization } from '../controllers/tenants.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createTenantSchema, updateTenantSchema, tenantIdParamSchema } from '../schemas/tenant.schema';

const router = Router();

router.use(authMiddleware);
router.use(roleMiddleware(['SUPERADMIN']));

router.get('/', getOrganizations);
router.post('/tenant', validate(createTenantSchema), createTenant);
router.put('/:id', validate(updateTenantSchema), updateTenant);
router.delete('/:id', validate(tenantIdParamSchema), deleteOrganization);

export default router;
