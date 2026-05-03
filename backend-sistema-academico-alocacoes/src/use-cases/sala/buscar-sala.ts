import { SalasRepository } from "../../repositories/salas-repository";
import { RecursoNaoEncontradoError } from "../errors/recurso-nao-encontrado";

interface BuscarSalaUseCaseRequest {
    id: string;
}

export class BuscarSalaUseCase {
    constructor(private salasRepository: SalasRepository) {}

    async execute({ id }: BuscarSalaUseCaseRequest) {
        const sala = await this.salasRepository.findById(id);

        if (!sala) {
            throw new RecursoNaoEncontradoError();
        }

        return { sala };
    }
}