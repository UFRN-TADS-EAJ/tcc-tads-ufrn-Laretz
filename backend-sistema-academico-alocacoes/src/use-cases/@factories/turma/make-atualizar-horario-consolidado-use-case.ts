import { PrismaDisciplinasRepository } from '@/repositories/prisma-repositories/prisma-disciplinas-repository';
import { PrismaAlocacoesRepository } from '@/repositories/prisma-repositories/prisma-alocacoes-repository';
import { PrismaPeriodosLetivosRepository } from "@/repositories/prisma-repositories/prisma-periodos-letivos-repository";
import { AtualizarHorarioConsolidadoUseCase } from '../../disciplina/atualizar-horario-consolidado';

export function makeAtualizarHorarioConsolidadoUseCase() {
  const disciplinasRepository = new PrismaDisciplinasRepository();
  const alocacoesRepository = new PrismaAlocacoesRepository();
  const periodosRepository = new PrismaPeriodosLetivosRepository();
  const atualizarHorarioConsolidadoUseCase = new AtualizarHorarioConsolidadoUseCase(
    disciplinasRepository,
    alocacoesRepository,
    periodosRepository,
  );

  return atualizarHorarioConsolidadoUseCase;
}
