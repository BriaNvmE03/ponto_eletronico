import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extendendo o Request do Express para injetar o user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        organizationId: string | null;
      };
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ error: 'Token não fornecido' });
    return;
  }

  const [, token] = authHeader.split(' ');

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET não configurado");

    const decoded = jwt.verify(token, secret) as { id: string; role: string; organizationId: string | null };
    
    // Injetando os dados decodificados do token dentro do request
    req.user = decoded;
    
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido ou expirado' });
  }
};
