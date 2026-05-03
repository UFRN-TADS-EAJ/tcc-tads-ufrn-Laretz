-- AlterTable
ALTER TABLE "public"."Alocacao" ADD COLUMN     "id_curso_disciplina" TEXT;

-- AddForeignKey
ALTER TABLE "public"."Alocacao" ADD CONSTRAINT "Alocacao_id_curso_disciplina_fkey" FOREIGN KEY ("id_curso_disciplina") REFERENCES "public"."CursoDisciplina"("id") ON DELETE SET NULL ON UPDATE CASCADE;
