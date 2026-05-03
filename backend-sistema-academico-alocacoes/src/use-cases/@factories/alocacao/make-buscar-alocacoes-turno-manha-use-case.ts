import { PrismaAlocacoesRepository } from "@/repositories/prisma-repositories/prisma-alocacoes-repository";
import { PrismaPeriodosLetivosRepository } from "@/repositories/prisma-repositories/prisma-periodos-letivos-repository";
import { BuscarAlocacoesTurnoManhaUseCase } from "@/use-cases/alocacao/buscar-alocacoes-turno-manha";

export function makeBuscarAlocacoesTurnoManhaUseCase() {
  const alocacoesRepository = new PrismaAlocacoesRepository();
  const periodosRepository = new PrismaPeriodosLetivosRepository();
  const buscarAlocacoesTurnoManhaUseCase = new BuscarAlocacoesTurnoManhaUseCase(
    alocacoesRepository,
    periodosRepository,
  );

  return buscarAlocacoesTurnoManhaUseCase;
}
