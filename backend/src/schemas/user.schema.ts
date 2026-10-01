import { z } from 'zod';
import { Role } from '@prisma/client';

export const createUserSchema = z.object({
  body: z.object({
    fullName: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres'),
    email: z.string().email('E-mail inválido'),
    phone: z.string().optional(),
    password: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres'),
    isFirstLogin: z.boolean().optional(),
    role: z.nativeEnum(Role).optional(),
    tenantId: z.string().uuid('ID da empresa inválido').optional().nullable(),
    departmentId: z.string().uuid('ID do departamento inválido').optional().nullable(),
  }),
});

export const updateUserSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID de usuário inválido'),
  }),
  body: z.object({
    fullName: z.string().min(3).optional(),
    email: z.string().email().optional(),
    phone: z.string().optional().nullable(),
    role: z.nativeEnum(Role).optional(),
    tenantId: z.string().uuid().optional().nullable(),
    isActive: z.boolean().optional(),
  }),
});

export const changePasswordSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID de usuário inválido'),
  }),
  body: z.object({
    newPassword: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres'),
  }),
});

export const updateUserStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID de usuário inválido'),
  }),
  body: z.object({
    isActive: z.boolean(),
  }),
});

export const userIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID de usuário inválido'),
  }),
});
