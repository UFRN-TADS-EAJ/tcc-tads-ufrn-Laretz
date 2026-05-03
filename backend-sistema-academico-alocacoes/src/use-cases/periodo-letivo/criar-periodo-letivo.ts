import { PeriodoLetivo } from "@prisma/client";
import { PeriodosLetivosRepository } from "@/repositories/periodos-letivos-repository";

interface CriarPeriodoLetivoUseCaseRequest {
  nome: string;
  data_inicio: Date;
  data_fim: Date;
  ativo?: boolean;
}

interface CriarPeriodoLetivoUseCaseResponse {
  periodo: PeriodoLetivo;
}

export class CriarPeriodoLetivoUseCase {
  constructor(private periodosRepository: PeriodosLetivosRepository) {}

  async execute({
    nome,
    data_inicio,
    data_fim,
    ativo,
  }: CriarPeriodoLetivoUseCaseRequest): Promise<CriarPeriodoLetivoUseCaseResponse> {
    const periodo = await this.periodosRepository.create({
      nome,
      data_inicio,
      data_fim,
      ativo: ativo ?? true,
    });
    return { periodo };
  }
}

