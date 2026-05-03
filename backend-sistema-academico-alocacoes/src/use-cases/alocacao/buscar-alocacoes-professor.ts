import { AlocacoesRepository } from "../../repositories/alocacoes-repository";
import { PeriodosLetivosRepository } from "@/repositories/periodos-letivos-repository";

interface BuscarAlocacoesProfessorUseCaseRequest {
  id_professor: string;
  page: number;
}

export class BuscarAlocacoesProfessorUseCase {
  constructor(
    private alocacoesRepository: AlocacoesRepository,
    private periodosRepository: PeriodosLetivosRepository,
  ) {}

  async execute({ id_professor, page }: BuscarAlocacoesProfessorUseCaseRequest) {
    const periodoAtivo = await this.periodosRepository.findActive();
    if (!periodoAtivo) {
      throw new Error("Nenhum período letivo ativo encontrado");
    }

    const alocacoes = await this.alocacoesRepository.findByUserId(
      id_professor,
      page,
      periodoAtivo.id,
    );

    return {
      alocacoes,
    };
  }
}
