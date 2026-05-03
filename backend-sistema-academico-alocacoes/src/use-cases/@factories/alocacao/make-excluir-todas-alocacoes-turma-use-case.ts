import { PrismaAlocacoesRepository } from "@/repositories/prisma-repositories/prisma-alocacoes-repository";
import { PrismaPeriodosLetivosRepository } from "@/repositories/prisma-repositories/prisma-periodos-letivos-repository";
import { ExcluirTodasAlocacoesTurmaUseCase } from "../../alocacao/excluir-todas-alocacoes-turma";

export function makeExcluirTodasAlocacoesTurmaUseCase() {
  const alocacoesRepository = new PrismaAlocacoesRepository();
  const periodosRepository = new PrismaPeriodosLetivosRepository();
  const excluirTodasAlocacoesTurmaUseCase = new ExcluirTodasAlocacoesTurmaUseCase(
    alocacoesRepository,
    periodosRepository,
  );

  return excluirTodasAlocacoesTurmaUseCase;
}
