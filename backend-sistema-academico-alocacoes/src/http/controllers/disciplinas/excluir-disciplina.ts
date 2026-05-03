import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { RecursoNaoEncontradoError } from "../../../use-cases/errors/recurso-nao-encontrado";
import { makeExcluirDisciplinaUseCase } from '@/use-cases/@factories/disciplina/make-excluir-disciplina-use-case';

export async function excluirDisciplina(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const excluirDisciplinaParamsSchema = z.object({
    id: z.string().uuid(),
  });

  const { id } = excluirDisciplinaParamsSchema.parse(request.params);

  try {
    const excluirDisciplinaUseCase = makeExcluirDisciplinaUseCase();

    await excluirDisciplinaUseCase.execute({ id });

    return reply.status(204).send();
  } catch (error) {
    if (error instanceof RecursoNaoEncontradoError) {
      return reply.status(404).send({ message: error.message });
    }

    throw error;
  }
}
