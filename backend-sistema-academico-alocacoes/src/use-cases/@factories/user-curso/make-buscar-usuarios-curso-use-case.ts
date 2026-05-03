import { PrismaUserCursoRepository } from "@/repositories/prisma-repositories/prisma-user-curso-repository";
import { PrismaCursosRepository } from "@/repositories/prisma-repositories/prisma-cursos-repository";
import { BuscarUsuariosCursoUseCase } from "@/use-cases/user-curso/buscar-usuarios-curso";

export function makeBuscarUsuariosCursoUseCase() {
  const userCursoRepository = new PrismaUserCursoRepository();
  const cursosRepository = new PrismaCursosRepository();
  
  const buscarUsuariosCursoUseCase = new BuscarUsuariosCursoUseCase(
    userCursoRepository,
    cursosRepository
  );

  return buscarUsuariosCursoUseCase;
}