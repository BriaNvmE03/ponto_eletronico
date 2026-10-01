import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const basicPlan = await prisma.plan.findUnique({ where: { name: 'Basic' } });
  
  if (basicPlan) {
    const res = await prisma.tenant.updateMany({
      where: { planId: null },
      data: { planId: basicPlan.id }
    });
    console.log(`Atualizados \${res.count} tenants sem plano para o plano Basic.`);
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
