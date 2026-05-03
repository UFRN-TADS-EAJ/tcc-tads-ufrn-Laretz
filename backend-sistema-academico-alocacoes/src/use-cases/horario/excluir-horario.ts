import { HorariosRepository } from "../../repositories/horarios-repository";
import { RecursoNaoEncontradoError } from "../errors/recurso-nao-encontrado";

interface ExcluirHorarioUseCaseRequest {
    id: string;
}

export class ExcluirHorarioUseCase {
    constructor(private horariosRepository: HorariosRepository) {}

    async execute({ id }: ExcluirHorarioUseCaseRequest) {
        const horarioExiste = await this.horariosRepository.findById(id);

        if (!horarioExiste) {
            throw new RecursoNaoEncontradoError();
        }

        await this.horariosRepository.delete(id);
    }
}