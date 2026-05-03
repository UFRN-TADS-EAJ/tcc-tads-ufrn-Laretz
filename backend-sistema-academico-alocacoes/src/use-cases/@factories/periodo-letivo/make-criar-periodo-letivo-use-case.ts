import { PrismaPeriodosLetivosRepository } from "@/repositories/prisma-repositories/prisma-periodos-letivos-repository";
import { CriarPeriodoLetivoUseCase } from "@/use-cases/periodo-letivo/criar-periodo-letivo";

export function makeCriarPeriodoLetivoUseCase() {
  const periodosRepository = new PrismaPeriodosLetivosRepository();
  const useCase = new CriarPeriodoLetivoUseCase(periodosRepository);
  return useCase;
}

