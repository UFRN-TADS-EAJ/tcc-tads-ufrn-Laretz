import { PrismaUsersRepository } from "@/repositories/prisma-repositories/prisma-users-repository";
import { BuscarUsuariosUseCase } from "@/use-cases/users/buscar-usuarios";

export function makeBuscarUsuariosUseCase() {
    const usersRepository = new PrismaUsersRepository();
    const buscarUsuariosUseCase = new BuscarUsuariosUseCase(usersRepository);
    
    return buscarUsuariosUseCase;
}
