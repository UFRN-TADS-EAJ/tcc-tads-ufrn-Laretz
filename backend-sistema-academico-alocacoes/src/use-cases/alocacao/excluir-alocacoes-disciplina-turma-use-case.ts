import { AlocacoesRepository } from "@/repositories/alocacoes-repository";
import { PeriodosLetivosRepository } from "@/repositories/periodos-letivos-repository";

interface ExcluirAlocacoesDisciplinaTurmaUseCaseRequest {
  id_turma: string;
  id_disciplina: string;
}

interface ExcluirAlocacoesDisciplinaTurmaUseCaseResponse {
  message: string;
}

export class ExcluirAlocacoesDisciplinaTurmaUseCase {
  constructor(
    private alocacoesRepository: AlocacoesRepository,
    private periodosRepository: PeriodosLetivosRepository,
  ) {}

  async execute({
    id_turma,
    id_disciplina,
  }: ExcluirAlocacoesDisciplinaTurmaUseCaseRequest): Promise<ExcluirAlocacoesDisciplinaTurmaUseCaseResponse> {
    const periodoAtivo = await this.periodosRepository.findActive();
    if (!periodoAtivo) {
      throw new Error("Nenhum período letivo ativo encontrado");
    }

    await this.alocacoesRepository.deleteAllByTurmaAndDisciplina(
      id_turma,
      id_disciplina,
      periodoAtivo.id,
    );

    return {
      message: "Alocações da disciplina na turma excluídas com sucesso.",
    };
  }
}
