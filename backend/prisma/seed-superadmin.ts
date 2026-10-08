import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'superadmin@admin.com';

  // ATENÇÃO: Preencha a senha aqui antes de rodar o comando!
  const password = '32254632Bx!';

  if (!password) {
    console.error('\n❌ ERRO: A senha oficial está vazia no arquivo de seed!');
    console.error('👉 Por favor, abra o arquivo backend/prisma/seed.ts e insira a senha desejada na variável "password".\n');
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  // Cria o superadmin oficial (sem estar atrelado a nenhum Tenant)
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
      fullName: 'Super Administrador Oficial',
      role: Role.SUPERADMIN,
      tenantId: null
    }
  });

  console.log('\n✅ SEED OFICIAL EXECUTADA COM SUCESSO!');
  console.log('----------------------------------------');
  console.log(`📧 Login: ${user.email}`);
  console.log(`🔑 Senha: [A senha que você inseriu no código]`);
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
