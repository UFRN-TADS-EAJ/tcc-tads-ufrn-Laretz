-- CreateTable
CREATE TABLE "public"."CursoDisciplina" (
    "id" TEXT NOT NULL,
    "id_curso" TEXT NOT NULL,
    "id_disciplina" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CursoDisciplina_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CursoDisciplina_id_curso_id_disciplina_key" ON "public"."CursoDisciplina"("id_curso", "id_disciplina");

-- AddForeignKey
ALTER TABLE "public"."CursoDisciplina" ADD CONSTRAINT "CursoDisciplina_id_curso_fkey" FOREIGN KEY ("id_curso") REFERENCES "public"."Curso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CursoDisciplina" ADD CONSTRAINT "CursoDisciplina_id_disciplina_fkey" FOREIGN KEY ("id_disciplina") REFERENCES "public"."Disciplina"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
