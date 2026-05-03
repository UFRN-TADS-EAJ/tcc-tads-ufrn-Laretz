import { PrismaUsersRepository } from "@/repositories/prisma-repositories/prisma-users-repository";
import { AuthenticateUseCase } from "@/use-cases/users/authenticate";
import { RegisterUseCase } from "@/use-cases/users/register";

export function makeAuthenticateUseCase() {
    const usersRepository = new PrismaUsersRepository();
    const authenticate = new AuthenticateUseCase(usersRepository);
    
    return authenticate;
}
