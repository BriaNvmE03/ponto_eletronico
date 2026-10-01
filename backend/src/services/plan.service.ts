import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class PlanService {
  async getPlans() {
    return prisma.plan.findMany({
      orderBy: { price: 'asc' }
    });
  }
}
