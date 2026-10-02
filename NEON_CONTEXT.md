# Contexto de Infraestrutura: Integração com Neon Serverless Postgres

Este documento serve como memória de contexto para futuras interações com IAs, registrando exatamente como o projeto `ponto_eletronico` foi integrado ao Neon e à Vercel.

## 1. O que foi feito (Setup do Neon)
- **Autenticação e Link:** O CLI do Neon foi instalado e a conta foi vinculada com sucesso. O projeto local foi "linkado" ao projeto do Neon usando o comando `neon link --project-id round-wave-33667850 --branch production`.
- **Configurações Locais Geradas:** O Neon criou uma pasta oculta `.neon` (para manter o link do projeto) e gerou um arquivo `.env.local` na raiz com as credenciais de produção (`DATABASE_URL`, `DATABASE_URL_UNPOOLED` e `NEON_BRANCH`).
- **Policy Config:** O arquivo `neon.ts` foi gerado na raiz com a política padrão, e aplicado via `neon deploy`.
- **Integração de IA:** O servidor MCP do Neon e as Neon Agent Skills (`neon skills -y`) foram instalados no projeto (visíveis em `.agents/`).

## 2. Decisões de Arquitetura (MUITO IMPORTANTE)

### Separação de Ambientes
- **Ambiente Local (Dev):** O ambiente de desenvolvimento **NÃO** usa o Neon. Ele continua utilizando o container Docker local (PostgreSQL 15, database: `ponto_eletronico`). O arquivo `backend/.env` deve sempre apontar para o `localhost:5432`.
- **Ambiente de Produção (Vercel):** O frontend e backend foram unificados via Vercel Services (configurado no `vercel.json`). A Vercel consome o banco do Neon através da variável `DATABASE_URL` cadastrada no painel da Vercel. O arquivo `api.ts` do frontend foi adaptado para rotear as chamadas para a Vercel de forma dinâmica.

### Política de Atualização do Banco (Migrations)
Ficou acordado que alterações na estrutura do banco de dados (schema) seguirão o fluxo rigoroso de migrations para não haver perda de dados:
1. Altera-se o `schema.prisma` localmente.
2. Roda-se `npx prisma migrate dev --name <nome_da_alteracao>` para conectar no Docker e gerar o arquivo `.sql` histórico.
3. Faz-se o commit da pasta `prisma/migrations` para o GitHub.
4. **No deploy**, a Vercel está orientada a rodar o Build Command: `npx prisma generate && npx prisma migrate deploy`. Este comando fará a Vercel ler a pasta de migrations do repositório e executar de forma cirúrgica e segura apenas as alterações pendentes no Neon.

### Connection Pooling
- O projeto usa Prisma versão `5.22.0`.
- Graças a isso, a regra antiga de precisar do `DATABASE_URL_UNPOOLED` para migrações não se aplica mais. O banco Neon usa Connection Pooling (reconhecido pelo sufixo `-pooler` na URL) para suportar o ambiente Serverless da Vercel sem esgotar as conexões do banco de dados. Pode-se usar a URL "pooled" tanto para queries comuns quanto para o deploy das migrations.

## 3. Instruções para Futura Limpeza (Teardown do Neon)
Caso decidamos remover completamente o Neon do projeto no futuro, a IA deverá seguir este roteiro de limpeza:
1. Apagar o arquivo `neon.ts`.
2. Apagar a pasta oculta `.neon/` na raiz do projeto.
3. Apagar o arquivo `.env.local` (ou limpar as chaves geradas pelo Neon dentro dele).
4. Remover a pasta `.agents/skills/neon/` e rodar a remoção do MCP do Neon dos arquivos de configuração da IA (`~/.gemini/config/mcp_config.json`, etc).
5. Excluir a variável `DATABASE_URL` do painel da Vercel para cortar a conexão do servidor de produção com o banco.
