/*
  Warnings:

  - The `status` column on the `tenants` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "TenantStatus" AS ENUM ('ATIVO', 'PENDENTE', 'DESATIVADO', 'CANCELADO');

-- AlterTable
ALTER TABLE "tenants" DROP COLUMN "status",
ADD COLUMN     "status" "TenantStatus" NOT NULL DEFAULT 'ATIVO';
