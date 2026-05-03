import { AlocacoesRepository } from "../../repositories/alocacoes-repository";
import { PeriodosLetivosRepository } from "@/repositories/periodos-letivos-repository";

interface BuscarAlocacoesPorTurmaUseCaseRequest {
  id_turma: string;
}

export class BuscarAlocacoesPorTurmaUseCase {
  constructor(
    private alocacoesRepository: AlocacoesRepository,
    private periodosRepository: PeriodosLetivosRepository,
  ) {}

  async execute({ id_turma }: BuscarAlocacoesPorTurmaUseCaseRequest) {
    const periodoAtivo = await this.periodosRepository.findActive();
    if (!periodoAtivo) {
      throw new Error("Nenhum período letivo ativo encontrado");
    }

    const alocacoes = await this.alocacoesRepository.findAllByTurmaId(
      id_turma,
      periodoAtivo.id,
    );

    return {
      alocacoes,
    };
  }
}
