/*
  Warnings:

  - Made the column `id_curso_disciplina` on table `Alocacao` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."Alocacao" DROP CONSTRAINT "Alocacao_id_curso_disciplina_fkey";

-- AlterTable
ALTER TABLE "public"."Alocacao" ALTER COLUMN "id_curso_disciplina" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Alocacao" ADD CONSTRAINT "Alocacao_id_curso_disciplina_fkey" FOREIGN KEY ("id_curso_disciplina") REFERENCES "public"."CursoDisciplina"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
