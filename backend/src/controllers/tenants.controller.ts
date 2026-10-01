import { Request, Response, NextFunction } from 'express';
import { TenantService } from '../services/tenant.service';

const tenantService = new TenantService();

export const getOrganizations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const orgs = await tenantService.getTenants();
    res.json(orgs);
  } catch (error) {
    next(error);
  }
};

export const createTenant = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const org = await tenantService.createTenant(req.user?.role as string, req.body);
    res.status(201).json(org);
  } catch (error) {
    next(error);
  }
};

export const updateTenant = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const org = await tenantService.updateTenant(req.user?.role as string, id, req.body);
    res.json(org);
  } catch (error) {
    next(error);
  }
};

export const deleteOrganization = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const result = await tenantService.deleteTenant(req.user?.role as string, id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
