import { PrismaUsersRepository } from "@/repositories/prisma-repositories/prisma-users-repository";
import { AtualizarUsuarioUseCase } from "@/use-cases/users/atualizar-usuario";

export function makeAtualizarUsuarioUseCase() {
    const usersRepository = new PrismaUsersRepository();
    const atualizarUsuarioUseCase = new AtualizarUsuarioUseCase(usersRepository);
    
    return atualizarUsuarioUseCase;
}
