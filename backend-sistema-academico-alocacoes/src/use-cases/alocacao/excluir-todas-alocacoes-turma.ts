import { AlocacoesRepository } from "../../repositories/alocacoes-repository";
import { PeriodosLetivosRepository } from "@/repositories/periodos-letivos-repository";

interface ExcluirTodasAlocacoesTurmaUseCaseRequest {
  id_turma: string;
}

export class ExcluirTodasAlocacoesTurmaUseCase {
  constructor(
    private alocacoesRepository: AlocacoesRepository,
    private periodosRepository: PeriodosLetivosRepository,
  ) {}

  async execute({ id_turma }: ExcluirTodasAlocacoesTurmaUseCaseRequest) {
    const periodoAtivo = await this.periodosRepository.findActive();
    if (!periodoAtivo) {
      throw new Error("Nenhum período letivo ativo encontrado");
    }

    await this.alocacoesRepository.deleteAllByTurmaId(id_turma, periodoAtivo.id);

    return {
      message: "Todas as alocações da turma foram excluídas com sucesso"
    };
  }
}
