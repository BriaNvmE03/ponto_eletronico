import { Router } from 'express';
import authRoutes from './auth.routes';
import tenantsRoutes from './tenants.routes';
import plansRoutes from './plans.routes';
import usersRoutes from './users.routes';

const routes = Router();

// Define o prefixo das rotas
routes.use('/auth', authRoutes);
routes.use('/tenants', tenantsRoutes);
routes.use('/plans', plansRoutes);
routes.use('/users', usersRoutes);

export default routes;
