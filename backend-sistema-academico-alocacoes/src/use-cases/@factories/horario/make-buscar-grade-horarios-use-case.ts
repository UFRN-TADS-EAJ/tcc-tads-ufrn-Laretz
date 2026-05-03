import { PrismaAlocacoesRepository } from "@/repositories/prisma-repositories/prisma-alocacoes-repository";
import { PrismaPeriodosLetivosRepository } from "@/repositories/prisma-repositories/prisma-periodos-letivos-repository";
import { BuscarGradeHorariosUseCase } from "@/use-cases/alocacao/buscar-grade-horarios";

export function makeBuscarGradeHorariosUseCase() {
    const alocacoesRepository = new PrismaAlocacoesRepository();
    const periodosRepository = new PrismaPeriodosLetivosRepository();
    const buscarGradeHorariosUseCase = new BuscarGradeHorariosUseCase(
      alocacoesRepository,
      periodosRepository,
    );
    
    return buscarGradeHorariosUseCase;
}
