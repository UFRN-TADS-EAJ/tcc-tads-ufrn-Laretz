import { PeriodoLetivo } from "@prisma/client";
import { PeriodosLetivosRepository } from "@/repositories/periodos-letivos-repository";

interface BuscarPeriodoLetivoAtivoUseCaseResponse {
  periodo: PeriodoLetivo;
}

export class BuscarPeriodoLetivoAtivoUseCase {
  constructor(private periodosRepository: PeriodosLetivosRepository) {}

  async execute(): Promise<BuscarPeriodoLetivoAtivoUseCaseResponse> {
    const periodo = await this.periodosRepository.findActive();
    if (!periodo) {
      throw new Error("Nenhum período letivo ativo encontrado");
    }
    return { periodo };
  }
}

