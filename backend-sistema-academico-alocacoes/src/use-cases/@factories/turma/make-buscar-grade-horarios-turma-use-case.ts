import { PrismaAlocacoesRepository } from "@/repositories/prisma-repositories/prisma-alocacoes-repository";
import { PrismaPeriodosLetivosRepository } from "@/repositories/prisma-repositories/prisma-periodos-letivos-repository";
import { BuscarGradeHorariosTurmaUseCase } from "@/use-cases/turma/buscar-grade-horarios-turma";

export function makeBuscarGradeHorariosTurmaUseCase() {
    const alocacoesRepository = new PrismaAlocacoesRepository();
    const periodosRepository = new PrismaPeriodosLetivosRepository();
    const buscarGradeHorariosTurmaUseCase = new BuscarGradeHorariosTurmaUseCase(
      alocacoesRepository,
      periodosRepository,
    );

    return buscarGradeHorariosTurmaUseCase;
}
