import { SalasRepository } from "../../repositories/salas-repository";
import { RecursoNaoEncontradoError } from "../errors/recurso-nao-encontrado";

interface ExcluirSalaUseCaseRequest {
    id: string;
}

export class ExcluirSalaUseCase {
    constructor(private salasRepository: SalasRepository) {}

    async execute({ id }: ExcluirSalaUseCaseRequest) {
        const salaExiste = await this.salasRepository.findById(id);

        if (!salaExiste) {
            throw new RecursoNaoEncontradoError();
        }

        await this.salasRepository.delete(id);
    }
}