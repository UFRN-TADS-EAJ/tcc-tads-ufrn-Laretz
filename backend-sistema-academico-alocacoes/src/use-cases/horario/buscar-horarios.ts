import { HorariosRepository } from "../../repositories/horarios-repository";

interface BuscarHorariosParams {
    regime?: "SUPERIOR" | "TECNICO" | undefined;
    dia_semana?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
}

export class BuscarHorariosUseCase {
    constructor(private horariosRepository: HorariosRepository) {}

    async execute(params: BuscarHorariosParams = {}) {
        const all = await this.horariosRepository.findMany(undefined, params.regime);
        const filtered = params.dia_semana ? all.filter(h => h.dia_semana === params.dia_semana) : all;
        return { horarios: filtered };
    }
}