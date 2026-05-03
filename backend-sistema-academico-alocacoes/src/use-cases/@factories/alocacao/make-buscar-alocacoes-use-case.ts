import { PrismaAlocacoesRepository } from "@/repositories/prisma-repositories/prisma-alocacoes-repository";
import { PrismaPeriodosLetivosRepository } from "@/repositories/prisma-repositories/prisma-periodos-letivos-repository";
import { BuscarAlocacoesUseCase } from "@/use-cases/alocacao/buscar-alocacoes";

export function makeBuscarAlocacoesUseCase() {
  const alocacoesRepository = new PrismaAlocacoesRepository();
  const periodosRepository = new PrismaPeriodosLetivosRepository();
  const buscarAlocacoesUseCase = new BuscarAlocacoesUseCase(
    alocacoesRepository,
    periodosRepository,
  );

  return buscarAlocacoesUseCase;
}
