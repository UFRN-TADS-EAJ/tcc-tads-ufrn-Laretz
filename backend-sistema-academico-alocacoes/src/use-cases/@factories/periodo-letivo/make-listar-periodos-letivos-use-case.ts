import { PrismaPeriodosLetivosRepository } from "@/repositories/prisma-repositories/prisma-periodos-letivos-repository";
import { ListarPeriodosLetivosUseCase } from "@/use-cases/periodo-letivo/listar-periodos-letivos";

export function makeListarPeriodosLetivosUseCase() {
  const periodosRepository = new PrismaPeriodosLetivosRepository();
  const useCase = new ListarPeriodosLetivosUseCase(periodosRepository);
  return useCase;
}

