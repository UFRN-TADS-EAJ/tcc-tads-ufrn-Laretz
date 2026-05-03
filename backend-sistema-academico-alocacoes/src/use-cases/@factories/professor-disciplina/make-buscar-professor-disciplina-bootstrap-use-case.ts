import { PrismaDisciplinasRepository } from "@/repositories/prisma-repositories/prisma-disciplinas-repository";
import { PrismaUsersRepository } from "@/repositories/prisma-repositories/prisma-users-repository";
import { BuscarProfessorDisciplinaBootstrapUseCase } from "@/use-cases/professor-disciplina/buscar-professor-disciplina-bootstrap";

export function makeBuscarProfessorDisciplinaBootstrapUseCase() {
  const usersRepository = new PrismaUsersRepository();
  const disciplinasRepository = new PrismaDisciplinasRepository();

  return new BuscarProfessorDisciplinaBootstrapUseCase(
    usersRepository,
    disciplinasRepository,
  );
}

