import { PrismaAlocacoesRepository } from "@/repositories/prisma-repositories/prisma-alocacoes-repository";
import { PrismaHorariosRepository } from "@/repositories/prisma-repositories/prisma-horarios-repository";
import { PrismaPeriodosLetivosRepository } from "@/repositories/prisma-repositories/prisma-periodos-letivos-repository";
import { BuscarHorariosConflitosUseCase } from "@/use-cases/alocacao/buscar-horarios-conflitos";

export function makeBuscarHorariosConflitosUseCase() {
  const alocacoesRepository = new PrismaAlocacoesRepository();
  const horariosRepository = new PrismaHorariosRepository();
  const periodosRepository = new PrismaPeriodosLetivosRepository();

  return new BuscarHorariosConflitosUseCase(
    alocacoesRepository,
    horariosRepository,
    periodosRepository,
  );
}

