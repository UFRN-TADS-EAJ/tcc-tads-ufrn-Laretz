import { TurmasRepository } from "../../repositories/turmas-repository";
import { RecursoNaoEncontradoError } from "../errors/recurso-nao-encontrado";

interface BuscarTurmaUseCaseRequest {
    id: string;
}

export class BuscarTurmaUseCase {
    constructor(private turmasRepository: TurmasRepository) {}

    async execute({ id }: BuscarTurmaUseCaseRequest) {
        const turma = await this.turmasRepository.findById(id);

        if (!turma) {
            throw new RecursoNaoEncontradoError();
        }

        return { turma };
    }
}