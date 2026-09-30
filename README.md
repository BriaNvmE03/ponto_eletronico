# 🕒 Ponto Eletrônico (Sistema SaaS Multi-Tenant)

![Status](https://img.shields.io/badge/Status-Em%20Desenvolvimento-blue)
![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=nodedotjs)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Docker-336791?logo=postgresql)

Um sistema completo de controle de ponto eletrônico corporativo, projetado do zero com uma arquitetura moderna, robusta e escalável. O projeto funciona no modelo **Multi-Tenant** (múltiplas organizações/empresas isoladas) com forte gestão de níveis de acesso (SuperAdmin, Gestor, Funcionário).

---

## 🚀 Stack Tecnológica

O projeto foi dividido em um monorepo limpo, separando responsabilidades entre Front e Back:

### 🖥️ Frontend (Interface do Usuário)
- **Framework:** React.js com Vite (TypeScript)
- **Estilização:** Tailwind CSS + Componentes Base (`shadcn/ui`)
- **Comunicação:** Axios & React Query (Para cache e controle de requisições de ponta a ponta)
- **Roteamento:** React Router DOM

### ⚙️ Backend (API e Banco de Dados)
- **Core:** Node.js com Express (TypeScript)
- **Segurança:** JSON Web Tokens (JWT) & Bcrypt (Hash de Senhas)
- **Banco de Dados:** PostgreSQL orquestrado via Docker
- **ORM:** Prisma (Modelagem de dados e Migrations seguras)

---

## 📁 Arquitetura do Projeto

A arquitetura do backend segue o padrão **MSC para APIs** (Middlewares, Controllers e Routes) focado em organização e fácil manutenção.

```text
📦 ponto_eletronico/
├── 📂 frontend/           # Tudo relacionado ao painel visual (React)
├── 📂 backend/            # Toda a lógica de negócios e API (Node)
│   ├── 📂 prisma/         # Schema do banco de dados e arquivos de Seed
│   └── 📂 src/
│       ├── 📂 controllers/# Lógica que processa as regras de negócio
│       ├── 📂 middlewares/# Segurança (validação de Token JWT, permissões)
│       └── 📂 routes/     # Mapeamento de URLs (Portas de entrada da API)
├── 📄 docker-compose.yml  # Configuração rápida para subir a infraestrutura local
└── 📄 README.md           # Você está aqui!
```

---

## 🏁 Como Rodar Localmente (Getting Started)

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

## 🛡️ Notas de Segurança para Desenvolvedores
- **Arquivo `.env`**: Nunca envie chaves de produção para o repositório. Use o `.env.example` para documentar novas variáveis necessárias para a equipe.
- **Sementes de Banco (Seeds)**: 
  - A seed oficial (`seed.ts`) que cria o primeiro super-administrador do sistema real não é rastreada pelo Git por questões de segurança.
  - A seed de teste (`seed-test.ts`) simula um ambiente de desenvolvimento e está disponível para a comunidade.
