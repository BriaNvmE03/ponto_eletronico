import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { AppError } from '../errors/AppError';

const prisma = new PrismaClient();

export class TenantService {
  async getTenants() {
    return prisma.tenant.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        users: {
          where: { role: 'ADMIN' },
          select: { fullName: true, email: true }
        },
        plan: true
      }
    });
  }

  async createTenant(currentUserRole: string | undefined, data: any) {
    if (currentUserRole !== 'SUPERADMIN') {
      throw new AppError('Apenas SuperAdmins podem criar tenants', 403);
    }

    const orgName = data.tenantName || data.orgName;
    
    if (data.adminEmail) {
      const existingUser = await prisma.user.findUnique({
        where: { email: data.adminEmail }
      });
      if (existingUser) {
        throw new AppError('O e-mail do administrador já está em uso.', 400);
      }
    }

    const passwordHash = await bcrypt.hash(data.adminPassword, 10);

    const result = await prisma.$transaction(async (tx) => {
      const org = await tx.tenant.create({
        data: { 
          name: orgName,
          planId: data.planId || undefined
        }
      });

      const admin = await tx.user.create({
        data: {
          email: data.adminEmail,
          passwordHash,
          fullName: data.adminFullName,
          role: Role.ADMIN,
          tenantId: org.id
        }
      });

      return org;
    });

    return result;
  }

  async updateTenant(currentUserRole: string | undefined, id: string, data: any) {
    if (currentUserRole !== 'SUPERADMIN') {
      throw new AppError('Apenas SuperAdmins podem editar tenants', 403);
    }

    return prisma.tenant.update({
      where: { id },
      data: {
        name: data.name,
        status: data.status,
        planId: data.planId || undefined
      }
    });
  }

  async deleteTenant(currentUserRole: string | undefined, id: string) {
    if (currentUserRole !== 'SUPERADMIN') {
      throw new AppError('Apenas SuperAdmins podem excluir tenants', 403);
    }

    await prisma.tenant.delete({
      where: { id }
    });

    return { message: 'Tenant excluído com sucesso' };
  }
}
