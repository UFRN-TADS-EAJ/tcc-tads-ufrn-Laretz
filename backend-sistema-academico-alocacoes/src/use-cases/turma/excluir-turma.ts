import { TurmasRepository } from "../../repositories/turmas-repository";
import { RecursoNaoEncontradoError } from "../errors/recurso-nao-encontrado";

interface ExcluirTurmaUseCaseRequest {
    id: string;
}

export class ExcluirTurmaUseCase {
    constructor(private turmasRepository: TurmasRepository) {}

    async execute({ id }: ExcluirTurmaUseCaseRequest) {
        const turmaExiste = await this.turmasRepository.findById(id);

        if (!turmaExiste) {
            throw new RecursoNaoEncontradoError();
        }

        await this.turmasRepository.delete(id);
    }
}