import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.plan.upsert({
    where: { name: 'Basic' },
    update: {},
    create: {
      name: 'Basic',
      price: 60.00,
      maxUsers: 50,
      maxDepartments: 5
    }
  });

  await prisma.plan.upsert({
    where: { name: 'Plus' },
    update: {},
    create: {
      name: 'Plus',
      price: 100.00,
      maxUsers: 100,
      maxDepartments: 10
    }
  });

  console.log("Planos criados com sucesso!");
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
