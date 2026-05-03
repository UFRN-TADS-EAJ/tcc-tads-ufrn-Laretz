import { PrismaAlocacoesRepository } from "@/repositories/prisma-repositories/prisma-alocacoes-repository";
import { PrismaPeriodosLetivosRepository } from "@/repositories/prisma-repositories/prisma-periodos-letivos-repository";
import { BuscarAlocacoesTurmaTurnoUseCase } from "../../alocacao/buscar-alocacoes-turma-turno";

export function makeBuscarAlocacoesTurmaTurnoUseCase() {
  const alocacoesRepository = new PrismaAlocacoesRepository();
  const periodosRepository = new PrismaPeriodosLetivosRepository();
  const buscarAlocacoesTurmaTurnoUseCase = new BuscarAlocacoesTurmaTurnoUseCase(
    alocacoesRepository,
    periodosRepository,
  );

  return buscarAlocacoesTurmaTurnoUseCase;
}
