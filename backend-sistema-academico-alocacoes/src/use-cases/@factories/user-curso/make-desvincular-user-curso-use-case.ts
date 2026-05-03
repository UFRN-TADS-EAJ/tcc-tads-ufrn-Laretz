import { PrismaUserCursoRepository } from "@/repositories/prisma-repositories/prisma-user-curso-repository";
import { DesvincularUserCursoUseCase } from "@/use-cases/user-curso/desvincular-user-curso";

export function makeDesvincularUserCursoUseCase() {
  const userCursoRepository = new PrismaUserCursoRepository();
  
  const desvincularUserCursoUseCase = new DesvincularUserCursoUseCase(
    userCursoRepository
  );

  return desvincularUserCursoUseCase;
}