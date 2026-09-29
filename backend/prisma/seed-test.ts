import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'teste@teste.com';
  const plainPassword = '12345678';
  
  const passwordHash = await bcrypt.hash(plainPassword, 10);
  
  // Cria a organização de teste
  const org = await prisma.organization.create({
    data: { name: 'Empresa de Teste' }
  });

  // Cria o usuário de teste
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      passwordHash,
      fullName: 'Administrador de Teste',
      role: Role.SUPERADMIN,
      organizationId: org.id
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
