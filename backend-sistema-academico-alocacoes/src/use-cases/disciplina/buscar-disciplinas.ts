import { DisciplinasRepository } from "../../repositories/disciplinas-repository";

interface BuscarDisciplinasUseCaseRequest {
  page?: number;
}

export class BuscarDisciplinasUseCase {
    constructor(private disciplinasRepository: DisciplinasRepository) {}

    async execute({ page = 1 }: BuscarDisciplinasUseCaseRequest = {}): Promise<{ disciplinas: Awaited<ReturnType<DisciplinasRepository['findMany']>> }> {
        const disciplinas = await this.disciplinasRepository.findMany(page);

        return { disciplinas };
    }
}