import axios from 'axios';

// Cria a instância do axios apontando para a nova API Node.js
export const api = axios.create({
  // No Vercel, import.meta.env.DEV é false, então usaremos o path relativo '/api'.
  // No localhost, usamos a porta 3001 do backend.
  baseURL: import.meta.env.DEV ? 'http://localhost:3001/api' : '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Antes de qualquer requisição sair, ele injeta o Token JWT (se existir)
api.interceptors.request.use(
  (config) => {
    // Por enquanto, usaremos localStorage por simplicidade e adoção em SPA.
    // Em um sistema ultracrítico (bancário), migraríamos para cookies HttpOnly setados pelo backend.
    const token = localStorage.getItem('@ponto:token');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor: Verifica respostas do servidor globalmente (ex: Token expirado)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Se a API retornar 401 (Não Autorizado), limpamos os dados e mandamos para o Login
      localStorage.removeItem('@ponto:token');
      localStorage.removeItem('@ponto:user');
      
      // Opcional: Redirecionar para login de forma limpa
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
