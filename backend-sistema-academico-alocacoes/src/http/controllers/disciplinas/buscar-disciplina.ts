import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { RecursoNaoEncontradoError } from "../../../use-cases/errors/recurso-nao-encontrado";
import { makeBuscarDisciplinaUseCase } from '@/use-cases/@factories/disciplina/make-buscar-disciplina-use-case';

export async function buscarDisciplina(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const buscarDisciplinaParamsSchema = z.object({
    id: z.string().uuid(),
  });

  const { id } = buscarDisciplinaParamsSchema.parse(request.params);

  try {
    const buscarDisciplinaUseCase = makeBuscarDisciplinaUseCase();

    const { disciplina } = await buscarDisciplinaUseCase.execute({ id });

    return reply.status(200).send({ disciplina });
  } catch (error) {
    if (error instanceof RecursoNaoEncontradoError) {
      return reply.status(404).send({ message: error.message });
    }

    throw error;
  }
}
