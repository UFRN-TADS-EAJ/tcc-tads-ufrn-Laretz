import { CursosRepository } from "../../repositories/cursos-repository";
import { RecursoNaoEncontradoError } from "../errors/recurso-nao-encontrado";

interface ExcluirCursoUseCaseRequest {
    id: string;
}

export class ExcluirCursoUseCase {
    constructor(private cursosRepository: CursosRepository) {}

    async execute({ id }: ExcluirCursoUseCaseRequest) {
        const curso = await this.cursosRepository.findById(id);

        if (!curso) {
            throw new RecursoNaoEncontradoError();
        }

        await this.cursosRepository.delete(id);
    }
}