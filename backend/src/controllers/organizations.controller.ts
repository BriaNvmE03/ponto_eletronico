import { Request, Response } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// GET /api/organizations
export const getOrganizations = async (req: Request, res: Response): Promise<void> => {
  try {
    const orgs = await prisma.organization.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(orgs);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar organizações' });
  }
};

// POST /api/organizations/tenant
// Substitui a antiga RPC do Supabase: cria a empresa e já cria o Admin dela
export const createTenant = async (req: Request, res: Response): Promise<void> => {
  const { orgName, adminEmail, adminPassword, adminFullName } = req.body;

  try {
    // Verifica se o usuário tem permissão (Garantido pelo Middleware + Verificação extra)
    if (req.user?.role !== 'SUPERADMIN') {
      res.status(403).json({ error: 'Apenas SuperAdmins podem criar tenants' });
      return;
    }

    const passwordHash = await bcrypt.hash(adminPassword, 10);

    // Usa transação para garantir que ou cria ambos (Empresa + Usuário) ou nenhum
    const result = await prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: { name: orgName }
      });

      const admin = await tx.user.create({
        data: {
          email: adminEmail,
          passwordHash,
          fullName: adminFullName,
          role: Role.ADMIN,
          organizationId: org.id
        }
      });

      return org;
    });

    res.status(201).json(result);
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Já existe um usuário com este email' });
      return;
    }
    res.status(500).json({ error: 'Erro ao criar tenant' });
  }
};

// DELETE /api/organizations/:id
export const deleteOrganization = async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id as string;

  try {
    if (req.user?.role !== 'SUPERADMIN') {
      res.status(403).json({ error: 'Apenas SuperAdmins podem excluir tenants' });
      return;
    }

    // Como não colocamos Cascade Delete no schema ainda, apagamos os usuários do tenant primeiro
    await prisma.$transaction([
      prisma.user.deleteMany({ where: { organizationId: id } }),
      prisma.organization.delete({ where: { id } })
    ]);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao excluir organização' });
  }
};

// PUT /api/organizations/:id
export const updateOrganization = async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const { name } = req.body;

  try {
    if (req.user?.role !== 'SUPERADMIN') {
      res.status(403).json({ error: 'Apenas SuperAdmins podem editar tenants' });
      return;
    }

    const org = await prisma.organization.update({
      where: { id },
      data: { name }
    });

    res.json(org);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar organização' });
  }
};
