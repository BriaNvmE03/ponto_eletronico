import { Router } from 'express';
import authRoutes from './auth.routes';
import usersRoutes from './users.routes';
import organizationsRoutes from './organizations.routes';

const routes = Router();

// Define o prefixo das rotas
routes.use('/auth', authRoutes);
routes.use('/users', usersRoutes);
routes.use('/organizations', organizationsRoutes);

export default routes;
