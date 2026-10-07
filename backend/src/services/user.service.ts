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

interface CurrentUser {
  id: string;
  role: string;
  tenantId: string | null;
}

export class UserService {
  async getAllUsers(currentUser: CurrentUser | undefined) {
    if (!currentUser) throw new AppError('Usuário não autenticado', 401);

    if (currentUser.role === 'SUPERADMIN') {
      // SuperAdmin pode ver todo mundo, exceto outros SUPERADMINS (opcional)
      return prisma.user.findMany({
        where: { role: { not: 'SUPERADMIN' } },
        orderBy: { createdAt: 'desc' },
        include: {
          tenant: { select: { name: true } },
          department: { select: { name: true } }
        }
      });
    }

    if (currentUser.role === 'ADMIN' && currentUser.tenantId) {
      // Admin só pode ver os usuários do seu próprio tenant
      return prisma.user.findMany({
        where: { tenantId: currentUser.tenantId, role: { not: 'SUPERADMIN' } },
        orderBy: { createdAt: 'desc' },
        include: {
          department: { select: { name: true } }
        }
      });
    }

    throw new AppError('Acesso negado.', 403);
  }

  async createUser(currentUser: CurrentUser | undefined, data: CreateUserDTO) {
    if (!currentUser) throw new AppError('Usuário não autenticado', 401);

    if (currentUser.role === 'ADMIN') {
      // Garante que o ADMIN só crie usuários para a própria empresa
      data.tenantId = currentUser.tenantId;
      // ADMIN não pode criar superadmins
      if (data.role === 'SUPERADMIN') {
        throw new AppError('Acesso negado. Apenas SuperAdmins podem criar outros SuperAdmins.', 403);
      }
    } else if (currentUser.role !== 'SUPERADMIN') {
      throw new AppError('Acesso negado.', 403);
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

  async updateUserStatus(currentUser: CurrentUser | undefined, id: string, isActive: boolean) {
    if (!currentUser) throw new AppError('Usuário não autenticado', 401);

    const userToUpdate = await prisma.user.findUnique({ where: { id } });
    if (!userToUpdate) throw new AppError('Usuário não encontrado', 404);

    if (currentUser.role === 'ADMIN' && userToUpdate.tenantId !== currentUser.tenantId) {
      throw new AppError('Acesso negado. Este usuário não pertence à sua organização.', 403);
    }

    if (currentUser.role !== 'SUPERADMIN' && currentUser.role !== 'ADMIN') {
        throw new AppError('Acesso negado.', 403);
    }

    return prisma.user.update({
      where: { id },
      data: { isActive }
    });
  }

  async updateUser(currentUser: CurrentUser | undefined, id: string, data: {
    fullName?: string;
    email?: string;
    phone?: string;
    role?: Role;
    tenantId?: string | null;
    isActive?: boolean;
  }) {
    if (!currentUser) throw new AppError('Usuário não autenticado', 401);

    const userToUpdate = await prisma.user.findUnique({ where: { id } });
    if (!userToUpdate) throw new AppError('Usuário não encontrado', 404);

    if (currentUser.role === 'ADMIN') {
      if (userToUpdate.tenantId !== currentUser.tenantId) {
        throw new AppError('Acesso negado. Este usuário não pertence à sua organização.', 403);
      }
      // ADMIN não pode mudar o usuário para outro tenant nem transformá-lo em SUPERADMIN
      if (data.tenantId && data.tenantId !== currentUser.tenantId) {
        throw new AppError('Você não pode mover um usuário para outra organização.', 403);
      }
      if (data.role === 'SUPERADMIN') {
        throw new AppError('Você não pode promover um usuário a SuperAdmin.', 403);
      }
    } else if (currentUser.role !== 'SUPERADMIN') {
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

  async changePassword(currentUser: CurrentUser | undefined, id: string, newPassword: string) {
    if (!currentUser) throw new AppError('Usuário não autenticado', 401);

    const userToUpdate = await prisma.user.findUnique({ where: { id } });
    if (!userToUpdate) throw new AppError('Usuário não encontrado', 404);

    if (currentUser.role === 'ADMIN' && userToUpdate.tenantId !== currentUser.tenantId) {
      throw new AppError('Acesso negado. Este usuário não pertence à sua organização.', 403);
    }

    if (currentUser.role !== 'SUPERADMIN' && currentUser.role !== 'ADMIN') {
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

  async deleteUser(currentUser: CurrentUser | undefined, id: string) {
    if (!currentUser) throw new AppError('Usuário não autenticado', 401);

    const userToDelete = await prisma.user.findUnique({ where: { id } });
    if (!userToDelete) throw new AppError('Usuário não encontrado', 404);

    if (currentUser.role === 'ADMIN' && userToDelete.tenantId !== currentUser.tenantId) {
      throw new AppError('Acesso negado. Este usuário não pertence à sua organização.', 403);
    }

    if (currentUser.role !== 'SUPERADMIN' && currentUser.role !== 'ADMIN') {
      throw new AppError('Acesso negado.', 403);
    }

    await prisma.user.delete({
      where: { id }
    });

    return { message: 'Usuário deletado com sucesso' };
  }
}
