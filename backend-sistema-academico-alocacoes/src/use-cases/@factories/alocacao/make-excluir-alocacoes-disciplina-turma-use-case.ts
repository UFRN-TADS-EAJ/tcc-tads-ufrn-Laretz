import { PrismaAlocacoesRepository } from "@/repositories/prisma-repositories/prisma-alocacoes-repository";
import { PrismaPeriodosLetivosRepository } from "@/repositories/prisma-repositories/prisma-periodos-letivos-repository";
import { ExcluirAlocacoesDisciplinaTurmaUseCase } from "../../alocacao/excluir-alocacoes-disciplina-turma-use-case";

export function makeExcluirAlocacoesDisciplinaTurmaUseCase() {
  const alocacoesRepository = new PrismaAlocacoesRepository();
  const periodosRepository = new PrismaPeriodosLetivosRepository();
  const useCase = new ExcluirAlocacoesDisciplinaTurmaUseCase(
    alocacoesRepository,
    periodosRepository,
  );

  return useCase;
}
