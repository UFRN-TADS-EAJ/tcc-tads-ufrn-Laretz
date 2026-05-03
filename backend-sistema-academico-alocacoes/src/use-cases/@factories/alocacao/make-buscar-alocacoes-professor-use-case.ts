import { PrismaAlocacoesRepository } from "@/repositories/prisma-repositories/prisma-alocacoes-repository";
import { PrismaPeriodosLetivosRepository } from "@/repositories/prisma-repositories/prisma-periodos-letivos-repository";
import { BuscarAlocacoesProfessorUseCase } from "@/use-cases/alocacao/buscar-alocacoes-professor";

export function makeBuscarAlocacoesProfessorUseCase() {
  const alocacoesRepository = new PrismaAlocacoesRepository();
  const periodosRepository = new PrismaPeriodosLetivosRepository();
  const buscarAlocacoesProfessorUseCase = new BuscarAlocacoesProfessorUseCase(
    alocacoesRepository,
    periodosRepository,
  );

  return buscarAlocacoesProfessorUseCase;
}
