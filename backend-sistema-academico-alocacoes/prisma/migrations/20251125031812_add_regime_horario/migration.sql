-- CreateEnum
CREATE TYPE "public"."RegimeHorario" AS ENUM ('SUPERIOR', 'TECNICO');

-- AlterTable
ALTER TABLE "public"."Horario" ADD COLUMN     "regime" "public"."RegimeHorario" NOT NULL DEFAULT 'SUPERIOR';
