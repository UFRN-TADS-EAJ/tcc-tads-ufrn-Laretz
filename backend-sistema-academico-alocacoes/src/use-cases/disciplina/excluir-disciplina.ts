import { DisciplinasRepository } from "../../repositories/disciplinas-repository";
import { RecursoNaoEncontradoError } from "../errors/recurso-nao-encontrado";

interface ExcluirDisciplinaUseCaseRequest {
    id: string;
}

export class ExcluirDisciplinaUseCase {
    constructor(private disciplinasRepository: DisciplinasRepository) {}

    async execute({ id }: ExcluirDisciplinaUseCaseRequest) {
        const disciplinaExiste = await this.disciplinasRepository.findById(id);

        if (!disciplinaExiste) {
            throw new RecursoNaoEncontradoError();
        }

        await this.disciplinasRepository.delete(id);
    }
}