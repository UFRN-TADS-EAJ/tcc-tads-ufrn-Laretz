import { FastifyRequest, FastifyReply } from "fastify";
import { RecursoNaoEncontradoError } from "../../../use-cases/errors/recurso-nao-encontrado";
import { makeExcluirAlocacaoUseCase } from "@/use-cases/@factories/alocacao/make-excluir-alocacao-use-case";
import { alocacaoParamsSchema } from "@/schemas";

export async function excluirAlocacao(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = alocacaoParamsSchema.parse(request.params);

  try {
    const excluirAlocacaoUseCase = makeExcluirAlocacaoUseCase();

    await excluirAlocacaoUseCase.execute({
      id,
    });

    return reply.status(204).send();
  } catch (error) {
    if (error instanceof RecursoNaoEncontradoError) {
      return reply.status(404).send({ message: error.message });
    }

    throw error;
  }
}
