import { PrismaUsersRepository } from "@/repositories/prisma-repositories/prisma-users-repository";
import { BuscarUsuarioUseCase } from "@/use-cases/users/buscar-usuario";

export function makeBuscarUsuarioUseCase() {
    const usersRepository = new PrismaUsersRepository();
    const buscarUsuarioUseCase = new BuscarUsuarioUseCase(usersRepository);
    
    return buscarUsuarioUseCase;
}
