import { compare } from "bcryptjs"
import {UsersRepository} from "../../repositories/users-repository"
import { CredenciaisInvalidas } from "../errors/credenciais-invalidas"
import { User } from "@prisma/client"
import { RecursoNaoEncontradoError } from "../errors/recurso-nao-encontrado"

interface GetUserProfileUseCaseRequest{
  userId: string,
}

interface GetUserProfilineUseCaseResponse{
    user: User
}

export class GetUserProfileUseCase{
    constructor(private userRepository: UsersRepository ){}


    async execute({userId}: GetUserProfileUseCaseRequest): Promise<GetUserProfilineUseCaseResponse>{

        const user = await this.userRepository.findById(userId)


        if(!user){
            throw new RecursoNaoEncontradoError()
        }

        return {
            user
        }
    }
}