import { PrismaAlocacoesRepository } from "@/repositories/prisma-repositories/prisma-alocacoes-repository";
import { PrismaPeriodosLetivosRepository } from "@/repositories/prisma-repositories/prisma-periodos-letivos-repository";
import { BuscarAlocacoesPorTurmaUseCase } from "../../alocacao/buscar-alocacoes-por-turma";

export function makeBuscarAlocacoesPorTurmaUseCase() {
  const alocacoesRepository = new PrismaAlocacoesRepository();
  const periodosRepository = new PrismaPeriodosLetivosRepository();
  const useCase = new BuscarAlocacoesPorTurmaUseCase(
    alocacoesRepository,
    periodosRepository,
  );

  return useCase;
}
