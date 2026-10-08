import { Request, Response, NextFunction } from 'express';
import { PunchService } from '../services/punch.service';

const punchService = new PunchService();

export const registerPunch = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id; // Pego do authMiddleware
    const newPunch = await punchService.registerPunch(userId, req.body);
    res.status(201).json(newPunch);
  } catch (error) {
    next(error);
  }
};

export const getTodayPunches = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const punches = await punchService.getTodayPunches(userId);
    res.json(punches);
  } catch (error) {
    next(error);
  }
};
