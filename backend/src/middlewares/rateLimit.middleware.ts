import rateLimit from 'express-rate-limit';

// Limite 1: Bloqueia por 1 minuto após 5 erros
export const loginRateLimiter1Min = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 5, // Limita a 5 requisições de erro na janela de 1 minuto
  skipSuccessfulRequests: true, // Só conta se o login falhar (status >= 400)
  message: {
    error: 'Muitas tentativas falhas de login. Por favor, aguarde 1 minuto para tentar novamente.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limite 2: Bloqueia por 15 minutos após 6 erros
export const loginRateLimiter15Min = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 6, // Limita a 6 requisições de erro na janela de 15 minutos
  skipSuccessfulRequests: true, // Só conta se o login falhar (status >= 400)
  message: {
    error: 'Múltiplas tentativas falhas de login. Por favor, aguarde 15 minutos para tentar novamente.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
