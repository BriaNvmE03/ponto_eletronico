import { Request, Response, NextFunction } from 'express';
import { PunchService } from '../services/punch.service';
import { storageService } from '../services/storage.service';

const punchService = new PunchService();

export const registerPunch = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { photoBase64, ...rest } = req.body;

    let photoUrl = undefined;
    if (photoBase64) {
      // Faz upload para o MinIO e obtém a URL pública
      photoUrl = await storageService.uploadBase64Photo(photoBase64, 'punches');
    }

    const data = { ...rest, photoUrl };

    const newPunch = await punchService.registerPunch(userId, data);
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
