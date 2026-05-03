import { PrismaPeriodosLetivosRepository } from "@/repositories/prisma-repositories/prisma-periodos-letivos-repository";
import { BuscarPeriodoLetivoAtivoUseCase } from "@/use-cases/periodo-letivo/buscar-periodo-letivo-ativo";

export function makeBuscarPeriodoLetivoAtivoUseCase() {
  const periodosRepository = new PrismaPeriodosLetivosRepository();
  const useCase = new BuscarPeriodoLetivoAtivoUseCase(periodosRepository);
  return useCase;
}

