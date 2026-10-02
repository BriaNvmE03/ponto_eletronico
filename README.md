# 🏢 Ponto Eletrônico (Sistema SaaS Multi-Tenant)

![Status](https://img.shields.io/badge/Status-Em%20Desenvolvimento-blue)
![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=nodedotjs)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Docker-336791?logo=postgresql)

Um sistema completo de controle de ponto eletrônico corporativo, projetado do zero com uma arquitetura moderna, robusta e escalável. O projeto funciona no modelo **Multi-Tenant** (múltiplas organizações/empresas isoladas) com forte gestão de níveis de acesso (SuperAdmin, Gestor, Funcionário).

---

## 🚀 Stack Tecnológica

O projeto foi dividido em um **Monorepo** limpo, mantendo tudo centralizado mas separando fortemente as responsabilidades entre Front e Back:

### 🎨 Frontend (Interface do Usuário)
- **Framework:** React.js com Vite (TypeScript)
- **Estilização:** Tailwind CSS (v4) + Componentes acessíveis baseados em `shadcn/ui` e `lucide-react`
- **Validação:** Zod (Validação rígida de formulários, telefones, senhas)
- **Comunicação:** Axios & React Query (Para cache, otimização e controle de requisições)
- **Roteamento:** React Router DOM

### ⚙️ Backend (API e Banco de Dados)
- **Core:** Node.js com Express (TypeScript)
- **Segurança:** JSON Web Tokens (JWT) & Bcrypt (Hash de Senhas)
- **Validação Estrutural:** Zod + Middlewares genéricos (Validando payload e requests com schemas estritos)
- **Banco de Dados:** PostgreSQL orquestrado via Docker
- **ORM:** Prisma (Modelagem de dados e Migrations seguras)

---

## 📂 Arquitetura do Projeto

A arquitetura do backend segue os princípios de separação de responsabilidades (MSC - Model, Service, Controller), focando em organização, reuso e fácil manutenção.

```text
📦 ponto_eletronico/
 ┣ 📂 frontend/           # Aplicação Client-Side (React)
 ┣ 📂 backend/            # Lógica de Negócios e API (Node)
 ┃  ┣ 📂 prisma/          # Schema do banco de dados (PostgreSQL) e arquivos de Seed
 ┃  ┗ 📂 src/
 ┃    ┣ 📂 controllers/   # Recebe a request HTTP e responde ao cliente
 ┃    ┣ 📂 services/      # Coração do sistema: Regras de Negócio e acesso ao BD (Prisma)
 ┃    ┣ 📂 schemas/       # Schemas Zod (Definição de tipos e validações de rotas/body)
 ┃    ┣ 📂 middlewares/   # Interceptadores (Autenticação JWT, Validação Zod, Handler de Erros)
 ┃    ┣ 📂 errors/        # Tratamento global de exceções (ex: AppError)
 ┃    ┗ 📂 routes/        # Roteador central da API
 ┣ 📜 docker-compose.yml  # Configuração rápida para subir a infraestrutura local
 ┗ 📜 README.md           # Você está aqui!
```

---

## 🛠️ Como Rodar Localmente (Getting Started)

### 1. Pré-requisitos
- Ter o **Node.js** (v18+) instalado.
- Ter o **Docker** (Desktop ou Engine) instalado e rodando.

### 2. Subindo a Infraestrutura
Na raiz do projeto, suba o container do banco de dados:
```bash
docker compose up -d
```

### 3. Setup do Backend
Entre na pasta do backend, instale os pacotes e crie seu arquivo de ambiente:
```bash
cd backend
npm install
cp .env.example .env
```
*(⚠️ Importante: Abra o seu novo arquivo `.env` gerado e preencha a variável `JWT_SECRET` com uma string/senha complexa antes de seguir).*

Sincronize as tabelas do banco e popule os dados iniciais de teste:
```bash
npx prisma db push
npm run seed:test
```

Inicie o servidor backend (rodará em `http://localhost:3001`):
```bash
npm run dev
```

> **🔑 Conta de Teste Gerada Automaticamente:**
> - Email: `teste@teste.com`
> - Senha: `12345678`

### 4. Setup do Frontend
Abra um **novo terminal**, entre na pasta do frontend e inicie a interface:
```bash
cd frontend
npm install
npm run dev
```
Acesse o link local gerado pelo Vite no seu navegador e pronto!

---

## 🔒 Notas de Segurança para Desenvolvedores
- **Tratamento Global de Erros**: O projeto utiliza a classe `AppError` no backend em conjunto com o middleware `errorHandler`. Qualquer erro lançado nos `Services` cai perfeitamente mapeado com o respectivo `StatusCode` no frontend.
- **Validação Dupla**: Os formulários do sistema são validados tanto visualmente (no Frontend via Zod em tempo real) quanto criticamente (no Backend via Middlewares de Validação).
- **Arquivo `.env`**: Nunca envie chaves de produção para o repositório. Use o `.env.example` para documentar novas variáveis necessárias para a equipe.
- **Sementes de Banco (Seeds)**: 
  - A seed oficial (`seed.ts`) que cria o primeiro super-administrador do sistema real não é rastreada pelo Git por questões de segurança.
  - A seed de teste (`seed-test.ts`) simula um ambiente de desenvolvimento e está disponível para a comunidade.
- **CORS Seguro**: A comunica��o com a API � restrita para o dom�nio correto em produ��o atrav�s do FRONTEND_URL do .env.
