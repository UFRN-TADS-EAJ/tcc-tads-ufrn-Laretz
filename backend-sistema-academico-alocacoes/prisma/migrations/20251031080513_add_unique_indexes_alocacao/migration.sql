/*
  Warnings:

  - A unique constraint covering the columns `[id_user,id_horario]` on the table `Alocacao` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id_sala,id_horario]` on the table `Alocacao` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id_turma,id_horario]` on the table `Alocacao` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Alocacao_id_user_id_horario_key" ON "public"."Alocacao"("id_user", "id_horario");

-- CreateIndex
CREATE UNIQUE INDEX "Alocacao_id_sala_id_horario_key" ON "public"."Alocacao"("id_sala", "id_horario");

-- CreateIndex
CREATE UNIQUE INDEX "Alocacao_id_turma_id_horario_key" ON "public"."Alocacao"("id_turma", "id_horario");
