import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import routes from './routes';
import { errorHandler } from './middlewares/errorHandler';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3001;

const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Vite default port fallback
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: \'50mb\' }));

// Rota de Health Check
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    console.error('Database connection failed:', error);
    res.status(500).json({ status: 'error', database: 'disconnected' });
  }
});

// Injetando as rotas mestre do sistema com o prefixo /api
app.use('/api', routes);

// Middleware de Erros Global (sempre deve ser o último middleware)
app.use(errorHandler);

// Apenas escuta a porta localmente se não for um ambiente serverless (como a Vercel)
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`🚀 Backend running on http://localhost:${port}`);
  });
}

// Exportar o app é necessário para o Serverless Function da Vercel
export default app;
