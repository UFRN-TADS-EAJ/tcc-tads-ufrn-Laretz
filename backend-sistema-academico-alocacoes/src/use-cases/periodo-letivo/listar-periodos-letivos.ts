import { PeriodoLetivo } from "@prisma/client";
import { PeriodosLetivosRepository } from "@/repositories/periodos-letivos-repository";

interface ListarPeriodosLetivosUseCaseResponse {
  periodos: PeriodoLetivo[];
}

export class ListarPeriodosLetivosUseCase {
  constructor(private periodosRepository: PeriodosLetivosRepository) {}

  async execute(options?: {
    order?: "asc" | "desc";
  }): Promise<ListarPeriodosLetivosUseCaseResponse> {
    const periodos = await this.periodosRepository.findMany(
      options?.order ? { order: options.order } : undefined,
    );
    return { periodos };
  }
}
