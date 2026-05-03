import { User } from "@prisma/client";
import { UsersRepository } from "../../repositories/users-repository";
import { RecursoNaoEncontradoError } from "../errors/recurso-nao-encontrado";

interface BuscarUsuarioUseCaseRequest {
    id: string;
}

interface BuscarUsuarioUseCaseResponse {
    usuario: User;
}

export class BuscarUsuarioUseCase {
    constructor(private usersRepository: UsersRepository) {}

    async execute({ id }: BuscarUsuarioUseCaseRequest): Promise<BuscarUsuarioUseCaseResponse> {
        const usuario = await this.usersRepository.findById(id);

        if (!usuario) {
            throw new RecursoNaoEncontradoError();
        }

        return {
            usuario,
        };
    }
}