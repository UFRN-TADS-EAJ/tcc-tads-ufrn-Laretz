import { HorariosRepository } from "../../repositories/horarios-repository";
import { RecursoNaoEncontradoError } from "../errors/recurso-nao-encontrado";

interface BuscarHorarioUseCaseRequest {
    id: string;
}

export class BuscarHorarioUseCase {
    constructor(private horariosRepository: HorariosRepository) {}

    async execute({ id }: BuscarHorarioUseCaseRequest) {
        const horario = await this.horariosRepository.findById(id);

        if (!horario) {
            throw new RecursoNaoEncontradoError();
        }

        return { horario };
    }
}