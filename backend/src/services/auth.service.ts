import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppError } from '../errors/AppError';

const prisma = new PrismaClient();

interface LoginDTO {
  email: string;
  password?: string;
}

export class AuthService {
  async login(data: LoginDTO) {
    if (!data.email || !data.password) {
      throw new AppError('E-mail e senha são obrigatórios', 400);
    }

    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: {
        tenant: { select: { id: true, name: true, plan: true } }
      }
    });

    if (!user) {
      throw new AppError('Credenciais inválidas', 401);
    }

    if (!user.isActive) {
      throw new AppError('Sua conta foi desativada. Entre em contato com o administrador.', 403);
    }

    const isValidPassword = await bcrypt.compare(data.password, user.passwordHash);

    if (!isValidPassword) {
      throw new AppError('Credenciais inválidas', 401);
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new AppError('Configuração de servidor inválida (JWT_SECRET)', 500);
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        role: user.role, 
        tenantId: user.tenantId 
      },
      secret,
      { expiresIn: '1d' }
    );

    return {
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isFirstLogin: user.isFirstLogin,
        tenant: user.tenant ? {
          id: user.tenant.id,
          name: user.tenant.name
        } : null
      }
    };
  }
}
