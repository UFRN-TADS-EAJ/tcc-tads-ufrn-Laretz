import { PrismaPeriodosLetivosRepository } from "@/repositories/prisma-repositories/prisma-periodos-letivos-repository";
import { AvancarPeriodoLetivoUseCase } from "@/use-cases/periodo-letivo/avancar-periodo-letivo";

export function makeAvancarPeriodoLetivoUseCase() {
  const periodosRepository = new PrismaPeriodosLetivosRepository();
  const useCase = new AvancarPeriodoLetivoUseCase(periodosRepository);
  return useCase;
}

