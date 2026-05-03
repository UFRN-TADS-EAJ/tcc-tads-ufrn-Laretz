import { PrismaPeriodosLetivosRepository } from "@/repositories/prisma-repositories/prisma-periodos-letivos-repository";
import { AtivarPeriodoLetivoUseCase } from "@/use-cases/periodo-letivo/ativar-periodo-letivo";

export function makeAtivarPeriodoLetivoUseCase() {
  const periodosRepository = new PrismaPeriodosLetivosRepository();
  const useCase = new AtivarPeriodoLetivoUseCase(periodosRepository);
  return useCase;
}

