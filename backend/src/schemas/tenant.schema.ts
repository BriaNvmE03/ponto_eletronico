import { TenantStatus } from '@prisma/client';
import { z } from 'zod';

export const createTenantSchema = z.object({
  body: z.object({
    tenantName: z.string().min(2, 'O nome da empresa deve ter no mínimo 2 caracteres').optional(),
    orgName: z.string().min(2, 'O nome da empresa deve ter no mínimo 2 caracteres').optional(),
    planId: z.string().uuid('ID de plano inválido').optional(),
    adminFullName: z.string().min(3, 'O nome do administrador é obrigatório'),
    adminEmail: z.string().email('E-mail inválido'),
    adminPassword: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
  }).refine((data) => data.tenantName || data.orgName, {
    message: "O nome da empresa (tenantName) é obrigatório",
    path: ["tenantName"]
  })
});

export const updateTenantSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID de tenant inválido'),
  }),
  body: z.object({
    name: z.string().min(2, 'O nome da empresa deve ter no mínimo 2 caracteres'),
    status: z.nativeEnum(TenantStatus).optional(),
    planId: z.string().uuid('ID de plano inválido').optional(),
  }),
});

export const tenantIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID de tenant inválido'),
  }),
});
