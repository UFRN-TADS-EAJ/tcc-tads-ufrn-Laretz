import { AlocacoesRepository } from "../../repositories/alocacoes-repository";
import { PeriodosLetivosRepository } from "@/repositories/periodos-letivos-repository";

interface BuscarAlocacoesTurnoManhaUseCaseRequest {
  page: number;
}

export class BuscarAlocacoesTurnoManhaUseCase {
  constructor(
    private alocacoesRepository: AlocacoesRepository,
    private periodosRepository: PeriodosLetivosRepository,
  ) {}

  async execute({ page }: BuscarAlocacoesTurnoManhaUseCaseRequest) {
    const periodoAtivo = await this.periodosRepository.findActive();
    if (!periodoAtivo) {
      throw new Error("Nenhum período letivo ativo encontrado");
    }

    const alocacoes = await this.alocacoesRepository.findByTurnoManha(
      page,
      periodoAtivo.id,
    );

    return {
      alocacoes,
    };
  }
}
