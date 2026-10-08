import { PrismaClient, RecordType } from '@prisma/client';
import { AppError } from '../errors/AppError';

const prisma = new PrismaClient();

export class PunchService {
  async registerPunch(userId: string, data: { locationLat?: number; locationLng?: number; photoUrl?: string; deviceInfo?: string }) {
    // Definimos "hoje" zerando as horas para agrupar as batidas no mesmo DailyRecord
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // 1. Busca ou cria o registro diário (DailyRecord)
    let dailyRecord = await prisma.dailyRecord.findFirst({
      where: {
        userId,
        date: today
      },
      include: {
        punches: {
          orderBy: { timestamp: 'asc' }
        }
      }
    });

    if (!dailyRecord) {
      dailyRecord = await prisma.dailyRecord.create({
        data: {
          userId,
          date: today,
          expectedMinutes: 480 // Ex: 8 horas padrão. O ideal é buscar do WorkSchedule depois.
        },
        include: {
          punches: true
        }
      });
    }

    const punchCount = dailyRecord.punches.length;
    let nextType: RecordType;

    // Lógica automática do tipo de batida
    if (punchCount === 0) nextType = 'ENTRY';
    else if (punchCount === 1) nextType = 'BREAK_START';
    else if (punchCount === 2) nextType = 'BREAK_END';
    else if (punchCount === 3) nextType = 'EXIT';
    else {
      throw new AppError('Você já completou as 4 batidas diárias. Solicite um ajuste ao gestor se necessário.', 400);
    }

    const newPunch = await prisma.punch.create({
      data: {
        userId,
        dailyRecordId: dailyRecord.id,
        type: nextType,
        locationLat: data.locationLat,
        locationLng: data.locationLng,
        photoUrl: data.photoUrl,
        deviceInfo: data.deviceInfo
      }
    });

    // Se a batida foi a de saída (última do dia), calculamos o tempo total e salvamos no banco
    if (nextType === 'EXIT') {
      const allPunches = [...dailyRecord.punches, newPunch];
      
      const entry = allPunches.find(p => p.type === 'ENTRY');
      const breakStart = allPunches.find(p => p.type === 'BREAK_START');
      const breakEnd = allPunches.find(p => p.type === 'BREAK_END');
      const exit = allPunches.find(p => p.type === 'EXIT');

      if (entry && breakStart && breakEnd && exit) {
        const period1 = breakStart.timestamp.getTime() - entry.timestamp.getTime();
        const period2 = exit.timestamp.getTime() - breakEnd.timestamp.getTime();
        
        const workedMinutes = Math.floor((period1 + period2) / 60000);
        const balanceMinutes = workedMinutes - dailyRecord.expectedMinutes;

        await prisma.dailyRecord.update({
          where: { id: dailyRecord.id },
          data: {
            workedMinutes,
            balanceMinutes
          }
        });
      }
    }

    return newPunch;
  }

  async getTodayPunches(userId: string) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const dailyRecord = await prisma.dailyRecord.findFirst({
      where: { userId, date: today },
      include: { punches: { orderBy: { timestamp: 'asc' } } }
    });
    
    return dailyRecord?.punches || [];
  }
}
