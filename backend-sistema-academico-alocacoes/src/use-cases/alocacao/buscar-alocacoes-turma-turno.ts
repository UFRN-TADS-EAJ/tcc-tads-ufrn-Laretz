import { AlocacoesRepository } from "../../repositories/alocacoes-repository";
import { PeriodosLetivosRepository } from "@/repositories/periodos-letivos-repository";

interface BuscarAlocacoesTurmaTurnoUseCaseRequest {
  id_turma: string;
  turno: string;
  page: number;
}

export class BuscarAlocacoesTurmaTurnoUseCase {
  constructor(
    private alocacoesRepository: AlocacoesRepository,
    private periodosRepository: PeriodosLetivosRepository,
  ) {}

  async execute({
    id_turma,
    turno,
    page,
  }: BuscarAlocacoesTurmaTurnoUseCaseRequest) {
    const periodoAtivo = await this.periodosRepository.findActive();
    if (!periodoAtivo) {
      throw new Error("Nenhum período letivo ativo encontrado");
    }

    const alocacoes = await this.alocacoesRepository.findByTurmaIdWithTurno(
      id_turma,
      turno,
      page,
      periodoAtivo.id,
    );

    return {
      alocacoes,
    };
  }
}
