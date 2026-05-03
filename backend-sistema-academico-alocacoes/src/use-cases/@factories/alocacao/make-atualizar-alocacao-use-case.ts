import { PrismaAlocacoesRepository } from "@/repositories/prisma-repositories/prisma-alocacoes-repository";
import { PrismaDisciplinasRepository } from "@/repositories/prisma-repositories/prisma-disciplinas-repository";
import { PrismaTurmasRepository } from "@/repositories/prisma-repositories/prisma-turmas-repository";
import { PrismaCursoDisciplinaRepository } from "@/repositories/prisma-repositories/prisma-curso-disciplina-repository";
import { AtualizarAlocacaoUseCase } from "@/use-cases/alocacao/atualizar-alocacao";
import { PrismaPeriodosLetivosRepository } from "@/repositories/prisma-repositories/prisma-periodos-letivos-repository";

export function makeAtualizarAlocacaoUseCase() {
  const alocacoesRepository = new PrismaAlocacoesRepository();
  const disciplinasRepository = new PrismaDisciplinasRepository();
  const turmasRepository = new PrismaTurmasRepository();
  const cursoDisciplinaRepository = new PrismaCursoDisciplinaRepository();
  const periodosRepository = new PrismaPeriodosLetivosRepository();
  const atualizarAlocacaoUseCase = new AtualizarAlocacaoUseCase(
    alocacoesRepository,
    disciplinasRepository,
    turmasRepository,
    cursoDisciplinaRepository,
    periodosRepository,
  );

  return atualizarAlocacaoUseCase;
}
