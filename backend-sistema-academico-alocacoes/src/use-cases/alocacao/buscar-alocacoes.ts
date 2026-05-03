import { AlocacoesRepository } from "../../repositories/alocacoes-repository";
import { PeriodosLetivosRepository } from "@/repositories/periodos-letivos-repository";

interface BuscarAlocacoesUseCaseRequest {
  page: number;
  id_turma?: string | undefined;
}

export class BuscarAlocacoesUseCase {
  constructor(
    private alocacoesRepository: AlocacoesRepository,
    private periodosRepository: PeriodosLetivosRepository,
  ) {}

  async execute({ page, id_turma }: BuscarAlocacoesUseCaseRequest) {
    const periodoAtivo = await this.periodosRepository.findActive();
    if (!periodoAtivo) {
      throw new Error("Nenhum período letivo ativo encontrado");
    }

    let alocacoes;

    if (id_turma) {
      // Se id_turma for fornecido, busca todas as alocações da turma sem paginação
      // para garantir que todas as disciplinas sejam exibidas no frontend
      alocacoes = await this.alocacoesRepository.findAllByTurmaId(
        id_turma,
        periodoAtivo.id,
      );
    } else {
      alocacoes = await this.alocacoesRepository.findMany(page, periodoAtivo.id);
    }

    return { alocacoes };
  }
}
