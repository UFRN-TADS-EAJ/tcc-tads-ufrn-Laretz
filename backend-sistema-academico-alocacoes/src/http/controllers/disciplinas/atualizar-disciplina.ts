import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { RecursoNaoEncontradoError } from "../../../use-cases/errors/recurso-nao-encontrado";
import { makeAtualizarDisciplinaUseCase } from '@/use-cases/@factories/disciplina/make-atualizar-disciplina-use-case';

export async function atualizarDisciplina(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const atualizarDisciplinaParamsSchema = z.object({
    id: z.string().uuid(),
  });

  const atualizarDisciplinaBodySchema = z.object({
    nome: z.string().optional(),
    carga_horaria: z.number().optional(),
    tipo_de_sala: z.enum(['Sala', 'Lab']).optional(),
    data_inicio: z.string().datetime().optional(),
    data_fim_prevista: z.string().datetime().optional(),
    data_fim_real: z.string().datetime().optional(),
  });

  const { id } = atualizarDisciplinaParamsSchema.parse(request.params);
  const { nome, carga_horaria, tipo_de_sala, data_inicio, data_fim_prevista, data_fim_real } = atualizarDisciplinaBodySchema.parse(
    request.body
  );

  try {
    const atualizarDisciplinaUseCase = makeAtualizarDisciplinaUseCase();

    const { disciplina } = await atualizarDisciplinaUseCase.execute({
      id,
      nome,
      carga_horaria,
      tipo_de_sala,
      data_inicio: data_inicio ? new Date(data_inicio) : undefined,
      data_fim_prevista: data_fim_prevista ? new Date(data_fim_prevista) : undefined,
      data_fim_real: data_fim_real ? new Date(data_fim_real) : undefined,
    });

    return reply.status(200).send({ disciplina });
  } catch (error) {
    if (error instanceof RecursoNaoEncontradoError) {
      return reply.status(404).send({ message: error.message });
    }

    throw error;
  }
}
