import { Request, Response, NextFunction } from 'express';
import { PlanService } from '../services/plan.service';

const planService = new PlanService();

export const getPlans = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const plans = await planService.getPlans();
    res.json(plans);
  } catch (error) {
    next(error);
  }
};
