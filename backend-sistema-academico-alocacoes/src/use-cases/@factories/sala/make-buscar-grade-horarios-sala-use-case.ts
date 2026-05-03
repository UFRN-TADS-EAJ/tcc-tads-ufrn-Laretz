import { PrismaAlocacoesRepository } from "@/repositories/prisma-repositories/prisma-alocacoes-repository";
import { PrismaPeriodosLetivosRepository } from "@/repositories/prisma-repositories/prisma-periodos-letivos-repository";
import { BuscarGradeHorariosSalaUseCase } from "@/use-cases/sala/buscar-grade-horarios-sala";

export function makeBuscarGradeHorariosSalaUseCase() {
    const alocacoesRepository = new PrismaAlocacoesRepository();
    const periodosRepository = new PrismaPeriodosLetivosRepository();
    const buscarGradeHorariosSalaUseCase = new BuscarGradeHorariosSalaUseCase(
      alocacoesRepository,
      periodosRepository,
    );

    return buscarGradeHorariosSalaUseCase;
}
