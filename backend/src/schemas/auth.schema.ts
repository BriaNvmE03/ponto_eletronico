import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Formato de e-mail inválido'),
    password: z.string().min(1, 'Senha não pode estar vazia'),
  }),
});
