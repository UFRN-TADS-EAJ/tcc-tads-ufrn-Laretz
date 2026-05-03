import { PrismaUserCursoRepository } from "@/repositories/prisma-repositories/prisma-user-curso-repository";
import { PrismaUsersRepository } from "@/repositories/prisma-repositories/prisma-users-repository";
import { PrismaCursosRepository } from "@/repositories/prisma-repositories/prisma-cursos-repository";
import { VincularUserCursoUseCase } from "@/use-cases/user-curso/vincular-user-curso";

export function makeVincularUserCursoUseCase() {
  const userCursoRepository = new PrismaUserCursoRepository();
  const usersRepository = new PrismaUsersRepository();
  const cursosRepository = new PrismaCursosRepository();
  
  const vincularUserCursoUseCase = new VincularUserCursoUseCase(
    userCursoRepository,
    usersRepository,
    cursosRepository
  );

  return vincularUserCursoUseCase;
}