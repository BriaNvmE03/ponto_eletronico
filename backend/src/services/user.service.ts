import { PrismaClient, User, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { AppError } from '../errors/AppError';

const prisma = new PrismaClient();

interface CreateUserDTO {
  email: string;
  password?: string;
  passwordHash?: string;
  fullName: string;
  phone?: string;
  role?: Role;
  tenantId?: string | null;
  departmentId?: string | null;
  isActive?: boolean;
  isFirstLogin?: boolean;
}

export class UserService {
  async getAllUsers(currentUserRole?: string) {
    if (currentUserRole !== 'SUPERADMIN') {
      throw new AppError('Acesso negado. Apenas SuperAdmins podem ver todos os usuários.', 403);
    }

    return prisma.user.findMany({
      where: { role: { not: 'SUPERADMIN' } },
      orderBy: { createdAt: 'desc' },
      include: {
        tenant: { select: { name: true } },
        department: { select: { name: true } }
      }
    });
  }

  async createUser(currentUserRole: string | undefined, data: CreateUserDTO) {
    if (currentUserRole !== 'SUPERADMIN') {
      throw new AppError('Acesso negado. Apenas SuperAdmins podem criar usuários livremente.', 403);
    }

    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      throw new AppError('E-mail já está em uso.', 400);
    }

    let finalPasswordHash = data.passwordHash;
    if (data.password) {
      finalPasswordHash = await bcrypt.hash(data.password, 10);
    }

    if (!finalPasswordHash) {
      throw new AppError('Senha é obrigatória.', 400);
    }

    const newUser = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash: finalPasswordHash,
        fullName: data.fullName,
        phone: data.phone,
        role: data.role || 'EMPLOYEE',
        tenantId: data.tenantId || null,
        departmentId: data.departmentId || null,
        isFirstLogin: data.isFirstLogin ?? true,
        isActive: data.isActive ?? true
      }
    });

    return newUser;
  }

  async updateUserStatus(currentUserRole: string | undefined, id: string, isActive: boolean) {
    if (currentUserRole !== 'SUPERADMIN') {
      throw new AppError('Acesso negado.', 403);
    }

    return prisma.user.update({
      where: { id },
      data: { isActive }
    });
  }

  async updateUser(currentUserRole: string | undefined, id: string, data: {
    fullName?: string;
    email?: string;
    phone?: string;
    role?: Role;
    tenantId?: string | null;
    isActive?: boolean;
  }) {
    if (currentUserRole !== 'SUPERADMIN') {
      throw new AppError('Acesso negado.', 403);
    }

    if (data.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email }
      });
      if (existingUser && existingUser.id !== id) {
        throw new AppError('Este e-mail já está em uso.', 400);
      }
    }

    return prisma.user.update({
      where: { id },
      data: {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        role: data.role,
        tenantId: data.tenantId,
        isActive: data.isActive,
      },
      include: {
        tenant: { select: { id: true, name: true } }
      }
    });
  }

  async changePassword(currentUserRole: string | undefined, id: string, newPassword: string) {
    if (currentUserRole !== 'SUPERADMIN') {
      throw new AppError('Acesso negado.', 403);
    }

    if (newPassword.length < 8) {
      throw new AppError('A senha deve ter no mínimo 8 caracteres.', 400);
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    return prisma.user.update({
      where: { id },
      data: { passwordHash, isFirstLogin: true }
    });
  }

  async deleteUser(currentUserRole: string | undefined, id: string) {
    if (currentUserRole !== 'SUPERADMIN') {
      throw new AppError('Acesso negado.', 403);
    }

    await prisma.user.delete({
      where: { id }
    });

    return { message: 'Usuário deletado com sucesso' };
  }
}
