import { PrismaUsersRepository } from "@/repositories/prisma-repositories/prisma-users-repository";
import { GetUserProfileUseCase } from "@/use-cases/users/get-user-profile";

export function makeGetUserProfileUseCase() {
    const userRepository = new PrismaUsersRepository();
    const getUserProfileUseCase = new GetUserProfileUseCase(userRepository);
    
    return getUserProfileUseCase;
}
