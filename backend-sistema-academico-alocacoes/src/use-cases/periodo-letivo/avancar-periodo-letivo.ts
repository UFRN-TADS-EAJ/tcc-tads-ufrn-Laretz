import { PeriodoLetivo } from "@prisma/client";
import { PeriodosLetivosRepository } from "@/repositories/periodos-letivos-repository";

interface AvancarPeriodoLetivoUseCaseRequest {
  nome: string;
  data_inicio: Date;
  data_fim: Date;
}

interface AvancarPeriodoLetivoUseCaseResponse {
  periodo: PeriodoLetivo;
  encerrados: number;
}

export class AvancarPeriodoLetivoUseCase {
  constructor(private periodosRepository: PeriodosLetivosRepository) {}

  async execute({
    nome,
    data_inicio,
    data_fim,
  }: AvancarPeriodoLetivoUseCaseRequest): Promise<AvancarPeriodoLetivoUseCaseResponse> {
    const encerrados = await this.periodosRepository.closeActive();
    const periodo = await this.periodosRepository.create({
      nome,
      data_inicio,
      data_fim,
      ativo: true,
    });
    return { periodo, encerrados };
  }
}

