-- CreateEnum
CREATE TYPE "public"."PeriodoStatus" AS ENUM ('ATIVO', 'ENCERRADO', 'FUTURO');

-- AlterTable
ALTER TABLE "public"."PeriodoLetivo" ADD COLUMN     "status" "public"."PeriodoStatus" NOT NULL DEFAULT 'ATIVO';
