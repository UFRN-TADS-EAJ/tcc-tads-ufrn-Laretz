import { PeriodoLetivo } from "@prisma/client";
import { PeriodosLetivosRepository } from "@/repositories/periodos-letivos-repository";
import { RecursoNaoEncontradoError } from "../errors/recurso-nao-encontrado";

interface AtivarPeriodoLetivoUseCaseRequest {
  id: string;
}

interface AtivarPeriodoLetivoUseCaseResponse {
  periodo: PeriodoLetivo;
}

export class AtivarPeriodoLetivoUseCase {
  constructor(private periodosRepository: PeriodosLetivosRepository) {}

  async execute({
    id,
  }: AtivarPeriodoLetivoUseCaseRequest): Promise<AtivarPeriodoLetivoUseCaseResponse> {
    const existente = await this.periodosRepository.findById(id);
    if (!existente) {
      throw new RecursoNaoEncontradoError();
    }

    const periodo = await this.periodosRepository.activateById(id);
    return { periodo };
  }
}
