import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../errors/AppError';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Se for um erro do Zod (validação de schema)
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Validation Error',
      details: err.issues.map((e: any) => ({ path: e.path.join('.'), message: e.message }))
    });
    return;
  }

  // Se for um erro intencional do nosso sistema
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message
    });
    return;
  }

  // Erros inesperados
  console.error('🔥 ERRO INTERNO DETECTADO:', err);
  res.status(500).json({
    error: 'Internal Server Error'
  });
};
