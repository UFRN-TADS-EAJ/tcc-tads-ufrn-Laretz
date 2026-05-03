-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('PROFESSOR', 'ADMIN', 'COORDENADOR');

-- CreateEnum
CREATE TYPE "public"."TipoDeSala" AS ENUM ('Lab', 'Sala');

-- CreateEnum
CREATE TYPE "public"."TurnoCurso" AS ENUM ('MATUTINO', 'VESPERTINO', 'NOTURNO', 'INTEGRAL');

-- CreateTable
CREATE TABLE "public"."Predio" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Predio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Curso" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "turno" "public"."TurnoCurso" NOT NULL,
    "duracao_semestres" INTEGER NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Curso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL DEFAULT 'PROFESSOR',
    "especializacao" TEXT,
    "carga_horaria_max" INTEGER,
    "preferencia" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Disciplina" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "carga_horaria" INTEGER NOT NULL DEFAULT 60,
    "carga_horaria_atual" INTEGER NOT NULL DEFAULT 0,
    "total_aulas" INTEGER NOT NULL DEFAULT 0,
    "aulas_ministradas" INTEGER NOT NULL DEFAULT 0,
    "tipo_de_sala" "public"."TipoDeSala" NOT NULL DEFAULT 'Sala',
    "data_inicio" TIMESTAMP(3),
    "data_fim_prevista" TIMESTAMP(3),
    "data_fim_real" TIMESTAMP(3),
    "periodo_letivo" TEXT,
    "horario_consolidado" TEXT,
    "codigo" TEXT,
    "id_curso" TEXT NOT NULL,
    "semestre" INTEGER NOT NULL DEFAULT 1,
    "obrigatoria" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Disciplina_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Turma" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "num_alunos" INTEGER NOT NULL,
    "periodo" INTEGER NOT NULL,
    "turno" TEXT NOT NULL,
    "id_curso" TEXT NOT NULL,
    "semestre" INTEGER NOT NULL DEFAULT 1,
    "ativa" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Turma_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Sala" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "numero" TEXT,
    "capacidade" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "computadores" INTEGER NOT NULL DEFAULT 0,
    "predioId" TEXT,
    "ativa" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Sala_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Horario" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "dia_semana" TEXT NOT NULL,
    "horarioInicio" TIME NOT NULL,
    "horarioFim" TIME NOT NULL,

    CONSTRAINT "Horario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Alocacao" (
    "id" TEXT NOT NULL,
    "id_user" TEXT NOT NULL,
    "id_disciplina" TEXT NOT NULL,
    "id_turma" TEXT NOT NULL,
    "id_sala" TEXT NOT NULL,
    "id_horario" TEXT NOT NULL,
    "is_modulo_principal" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Alocacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ModuloDisciplina" (
    "id" TEXT NOT NULL,
    "id_disciplina" TEXT NOT NULL,
    "id_alocacao_principal" TEXT NOT NULL,
    "id_sala" TEXT NOT NULL,
    "id_horario" TEXT NOT NULL,
    "data_inicio" TIMESTAMP(3) NOT NULL,
    "data_fim" TIMESTAMP(3) NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModuloDisciplina_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProfessorDisciplina" (
    "id" TEXT NOT NULL,
    "id_user" TEXT NOT NULL,
    "id_disciplina" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProfessorDisciplina_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserCurso" (
    "id" TEXT NOT NULL,
    "id_user" TEXT NOT NULL,
    "id_curso" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserCurso_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Predio_codigo_key" ON "public"."Predio"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Curso_codigo_key" ON "public"."Curso"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ProfessorDisciplina_id_user_id_disciplina_key" ON "public"."ProfessorDisciplina"("id_user", "id_disciplina");

-- CreateIndex
CREATE UNIQUE INDEX "UserCurso_id_user_id_curso_key" ON "public"."UserCurso"("id_user", "id_curso");

-- AddForeignKey
ALTER TABLE "public"."Disciplina" ADD CONSTRAINT "Disciplina_id_curso_fkey" FOREIGN KEY ("id_curso") REFERENCES "public"."Curso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Turma" ADD CONSTRAINT "Turma_id_curso_fkey" FOREIGN KEY ("id_curso") REFERENCES "public"."Curso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Sala" ADD CONSTRAINT "Sala_predioId_fkey" FOREIGN KEY ("predioId") REFERENCES "public"."Predio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Alocacao" ADD CONSTRAINT "Alocacao_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Alocacao" ADD CONSTRAINT "Alocacao_id_disciplina_fkey" FOREIGN KEY ("id_disciplina") REFERENCES "public"."Disciplina"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Alocacao" ADD CONSTRAINT "Alocacao_id_turma_fkey" FOREIGN KEY ("id_turma") REFERENCES "public"."Turma"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Alocacao" ADD CONSTRAINT "Alocacao_id_sala_fkey" FOREIGN KEY ("id_sala") REFERENCES "public"."Sala"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Alocacao" ADD CONSTRAINT "Alocacao_id_horario_fkey" FOREIGN KEY ("id_horario") REFERENCES "public"."Horario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ModuloDisciplina" ADD CONSTRAINT "ModuloDisciplina_id_disciplina_fkey" FOREIGN KEY ("id_disciplina") REFERENCES "public"."Disciplina"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ModuloDisciplina" ADD CONSTRAINT "ModuloDisciplina_id_sala_fkey" FOREIGN KEY ("id_sala") REFERENCES "public"."Sala"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ModuloDisciplina" ADD CONSTRAINT "ModuloDisciplina_id_horario_fkey" FOREIGN KEY ("id_horario") REFERENCES "public"."Horario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProfessorDisciplina" ADD CONSTRAINT "ProfessorDisciplina_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProfessorDisciplina" ADD CONSTRAINT "ProfessorDisciplina_id_disciplina_fkey" FOREIGN KEY ("id_disciplina") REFERENCES "public"."Disciplina"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserCurso" ADD CONSTRAINT "UserCurso_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserCurso" ADD CONSTRAINT "UserCurso_id_curso_fkey" FOREIGN KEY ("id_curso") REFERENCES "public"."Curso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
