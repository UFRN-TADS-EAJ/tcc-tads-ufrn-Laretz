import { SalasRepository } from "../../repositories/salas-repository";

interface BuscarSalasPorPredioUseCaseRequest {
    predioId: string;
}

export class BuscarSalasPorPredioUseCase {
    constructor(private salasRepository: SalasRepository) {}

    async execute({ predioId }: BuscarSalasPorPredioUseCaseRequest) {
        const salas = await this.salasRepository.findByPredioId(predioId);

        return { salas };
    }
}