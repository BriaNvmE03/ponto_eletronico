import { z } from 'zod';

export const registerPunchSchema = z.object({
  body: z.object({
    locationLat: z.number().optional(),
    locationLng: z.number().optional(),
    photoUrl: z.string().url().optional(),
    deviceInfo: z.string().optional()
  })
});
