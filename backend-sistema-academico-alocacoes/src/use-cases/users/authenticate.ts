import { compare } from "bcryptjs"
import {UsersRepository} from "../../repositories/users-repository"
import { CredenciaisInvalidas } from "../errors/credenciais-invalidas"
import { User } from "@prisma/client"

interface AuthenticateUseCaseRequest{
    email: string,
    senha: string,
    
}

interface AuthenticateUseCaseResponse{
    user: User
}

export class AuthenticateUseCase{
    constructor(private userRepository: UsersRepository ){}


    async execute({email, senha}: AuthenticateUseCaseRequest): Promise<AuthenticateUseCaseResponse>{

        const user = await this.userRepository.findByEmail(email)

        if(!user){
            throw new CredenciaisInvalidas()
        }

        const seSenhaConfere = await compare(senha, user.senha)

        if(!seSenhaConfere){
            throw new CredenciaisInvalidas()
        }

        return {
            user
        }
    }
}