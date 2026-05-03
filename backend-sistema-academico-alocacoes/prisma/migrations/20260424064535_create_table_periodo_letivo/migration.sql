/*
  Warnings:

  - A unique constraint covering the columns `[id_user,id_horario,periodoId]` on the table `Alocacao` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id_sala,id_horario,periodoId]` on the table `Alocacao` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id_turma,id_horario,periodoId]` on the table `Alocacao` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[salaId,horarioId,date,periodoId]` on the table `ReservaSala` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `periodoId` to the `Alocacao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `periodoId` to the `ReservaSala` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."Alocacao_id_sala_id_horario_key";

-- DropIndex
DROP INDEX "public"."Alocacao_id_turma_id_horario_key";

-- DropIndex
DROP INDEX "public"."Alocacao_id_user_id_horario_key";

-- DropIndex
DROP INDEX "public"."ReservaSala_salaId_horarioId_date_key";

-- AlterTable
ALTER TABLE "public"."Alocacao" ADD COLUMN     "periodoId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."ReservaSala" ADD COLUMN     "periodoId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "public"."PeriodoLetivo" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "data_inicio" TIMESTAMP(3) NOT NULL,
    "data_fim" TIMESTAMP(3) NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PeriodoLetivo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PeriodoLetivo_nome_key" ON "public"."PeriodoLetivo"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "Alocacao_id_user_id_horario_periodoId_key" ON "public"."Alocacao"("id_user", "id_horario", "periodoId");

-- CreateIndex
CREATE UNIQUE INDEX "Alocacao_id_sala_id_horario_periodoId_key" ON "public"."Alocacao"("id_sala", "id_horario", "periodoId");

-- CreateIndex
CREATE UNIQUE INDEX "Alocacao_id_turma_id_horario_periodoId_key" ON "public"."Alocacao"("id_turma", "id_horario", "periodoId");

-- CreateIndex
CREATE UNIQUE INDEX "ReservaSala_salaId_horarioId_date_periodoId_key" ON "public"."ReservaSala"("salaId", "horarioId", "date", "periodoId");

-- AddForeignKey
ALTER TABLE "public"."Alocacao" ADD CONSTRAINT "Alocacao_periodoId_fkey" FOREIGN KEY ("periodoId") REFERENCES "public"."PeriodoLetivo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReservaSala" ADD CONSTRAINT "ReservaSala_periodoId_fkey" FOREIGN KEY ("periodoId") REFERENCES "public"."PeriodoLetivo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
