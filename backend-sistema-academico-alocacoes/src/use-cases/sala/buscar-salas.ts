import { SalasRepository } from "../../repositories/salas-repository";

interface BuscarSalasUseCaseRequest {
    page: number;
}

export class BuscarSalasUseCase {
    constructor(private salasRepository: SalasRepository) {}

    async execute({ page }: BuscarSalasUseCaseRequest) {
        const salas = await this.salasRepository.findMany(page);

        if (!salas) {
            return { salas: [] };
        }

        return { salas };
    }
}