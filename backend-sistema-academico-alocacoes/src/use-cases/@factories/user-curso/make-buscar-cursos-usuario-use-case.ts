import { PrismaUserCursoRepository } from "@/repositories/prisma-repositories/prisma-user-curso-repository";
import { PrismaUsersRepository } from "@/repositories/prisma-repositories/prisma-users-repository";
import { BuscarCursosUsuarioUseCase } from "@/use-cases/user-curso/buscar-cursos-usuario";

export function makeBuscarCursosUsuarioUseCase() {
  const userCursoRepository = new PrismaUserCursoRepository();
  const usersRepository = new PrismaUsersRepository();
  
  const buscarCursosUsuarioUseCase = new BuscarCursosUsuarioUseCase(
    userCursoRepository,
    usersRepository
  );

  return buscarCursosUsuarioUseCase;
}