import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { makeAtualizarHorarioConsolidadoUseCase } from '@/use-cases/@factories/turma/make-atualizar-horario-consolidado-use-case';
import { RecursoNaoEncontradoError } from '../../../use-cases/errors/recurso-nao-encontrado';

export async function atualizarHorarioConsolidado(request: FastifyRequest, reply: FastifyReply) {
  const atualizarHorarioConsolidadoParamsSchema = z.object({
    id: z.string().uuid(),
  });

  const { id } = atualizarHorarioConsolidadoParamsSchema.parse(request.params);

  try {
    const atualizarHorarioConsolidadoUseCase = makeAtualizarHorarioConsolidadoUseCase();

    const { disciplina } = await atualizarHorarioConsolidadoUseCase.execute({
      disciplinaId: id,
    });

    return reply.status(200).send({
      disciplina,
    });
  } catch (err) {
    if (err instanceof RecursoNaoEncontradoError) {
      return reply.status(404).send({ message: err.message });
    }

    throw err;
  }
}