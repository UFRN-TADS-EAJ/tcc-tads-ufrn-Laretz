import { PrismaAlocacoesRepository } from "@/repositories/prisma-repositories/prisma-alocacoes-repository";
import { PrismaDisciplinasRepository } from "@/repositories/prisma-repositories/prisma-disciplinas-repository";
import { PrismaHorariosRepository } from "@/repositories/prisma-repositories/prisma-horarios-repository";
import { PrismaPeriodosLetivosRepository } from "@/repositories/prisma-repositories/prisma-periodos-letivos-repository";
import { PrismaProfessorDisciplinaRepository } from "@/repositories/prisma-repositories/prisma-professor-disciplina-repository";
import { PrismaUserCursoRepository } from "@/repositories/prisma-repositories/prisma-user-curso-repository";
import { PrismaUsersRepository } from "@/repositories/prisma-repositories/prisma-users-repository";
import { BuscarGradeHorariosProfessorBootstrapUseCase } from "@/use-cases/users/buscar-grade-horarios-professor-bootstrap";

export function makeBuscarGradeHorariosProfessorBootstrapUseCase() {
  const usersRepository = new PrismaUsersRepository();
  const periodosRepository = new PrismaPeriodosLetivosRepository();
  const alocacoesRepository = new PrismaAlocacoesRepository();
  const userCursoRepository = new PrismaUserCursoRepository();
  const professorDisciplinaRepository = new PrismaProfessorDisciplinaRepository();
  const disciplinasRepository = new PrismaDisciplinasRepository();
  const horariosRepository = new PrismaHorariosRepository();

  const useCase = new BuscarGradeHorariosProfessorBootstrapUseCase(
    usersRepository,
    periodosRepository,
    alocacoesRepository,
    userCursoRepository,
    professorDisciplinaRepository,
    disciplinasRepository,
    horariosRepository,
  );

  return useCase;
}

