import { PrismaUsersRepository } from "@/repositories/prisma-repositories/prisma-users-repository";
import { ExcluirUsuarioUseCase } from "@/use-cases/users/excluir-usuario";

export function makeExcluirUsuarioUseCase() {
    const usersRepository = new PrismaUsersRepository();
    const excluirUsuarioUseCase = new ExcluirUsuarioUseCase(usersRepository);
    
    return excluirUsuarioUseCase;
}
