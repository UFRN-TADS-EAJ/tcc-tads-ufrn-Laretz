import { PrismaUsersRepository } from "@/repositories/prisma-repositories/prisma-users-repository";
import { RegisterUseCase } from "@/use-cases/users/register";

export function makeRegisterUseCase() {
    const usersRepository = new PrismaUsersRepository();
    const registerUseCase = new RegisterUseCase(usersRepository);
    
    return registerUseCase;
}
