import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'teste@teste.com';
  const plainPassword = '12345678';
  
  const passwordHash = await bcrypt.hash(plainPassword, 10);
  
  // Cria apenas o SuperAdmin global (não atrelado a nenhum Tenant)
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      role: Role.SUPERADMIN,
      tenantId: null
    },
    create: {
      email,
      passwordHash,
      fullName: 'Super Administrador de Teste',
      role: Role.SUPERADMIN,
      tenantId: null
    }
  });

  console.log('\n✅ SEED DE TESTE EXECUTADA COM SUCESSO!');
  console.log('----------------------------------------');
  console.log(`📧 Login: ${user.email}`);
  console.log(`🔑 Senha: ${plainPassword}`);
  console.log('----------------------------------------\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
