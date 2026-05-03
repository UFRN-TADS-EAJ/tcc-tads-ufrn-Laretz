import { PrismaDisciplinasRepository } from "@/repositories/prisma-repositories/prisma-disciplinas-repository";
import { PrismaAlocacoesRepository } from "@/repositories/prisma-repositories/prisma-alocacoes-repository";
import { AtualizarProgressoDisciplinasUseCase } from "@/use-cases/disciplina/atualizar-progresso-disciplinas";
import { PrismaPeriodosLetivosRepository } from "@/repositories/prisma-repositories/prisma-periodos-letivos-repository";

export function makeAtualizarProgressoDisciplinasUseCase() {
  const disciplinasRepository = new PrismaDisciplinasRepository();
  const alocacoesRepository = new PrismaAlocacoesRepository();
  const periodosRepository = new PrismaPeriodosLetivosRepository();
  const atualizarProgressoDisciplinasUseCase =
    new AtualizarProgressoDisciplinasUseCase(
      disciplinasRepository,
      alocacoesRepository,
      periodosRepository,
    );

  return atualizarProgressoDisciplinasUseCase;
}
