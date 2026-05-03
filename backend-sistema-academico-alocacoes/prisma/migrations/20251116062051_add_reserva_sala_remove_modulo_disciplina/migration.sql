/*
  Warnings:

  - You are about to drop the `ModuloDisciplina` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."ReservaStatus" AS ENUM ('ATIVA', 'CANCELADA');

-- DropForeignKey
ALTER TABLE "public"."ModuloDisciplina" DROP CONSTRAINT "ModuloDisciplina_id_disciplina_fkey";

-- DropForeignKey
ALTER TABLE "public"."ModuloDisciplina" DROP CONSTRAINT "ModuloDisciplina_id_horario_fkey";

-- DropForeignKey
ALTER TABLE "public"."ModuloDisciplina" DROP CONSTRAINT "ModuloDisciplina_id_sala_fkey";

-- DropTable
DROP TABLE "public"."ModuloDisciplina";

-- CreateTable
CREATE TABLE "public"."ReservaSala" (
    "id" TEXT NOT NULL,
    "salaId" TEXT NOT NULL,
    "horarioId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "criado_por" TEXT NOT NULL,
    "status" "public"."ReservaStatus" NOT NULL DEFAULT 'ATIVA',
    "recurrenceRule" TEXT,
    "recurrenceEnd" TIMESTAMP(3),
    "seriesId" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReservaSala_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReservaSala_salaId_horarioId_date_key" ON "public"."ReservaSala"("salaId", "horarioId", "date");

-- AddForeignKey
ALTER TABLE "public"."ReservaSala" ADD CONSTRAINT "ReservaSala_salaId_fkey" FOREIGN KEY ("salaId") REFERENCES "public"."Sala"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReservaSala" ADD CONSTRAINT "ReservaSala_horarioId_fkey" FOREIGN KEY ("horarioId") REFERENCES "public"."Horario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReservaSala" ADD CONSTRAINT "ReservaSala_criado_por_fkey" FOREIGN KEY ("criado_por") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
