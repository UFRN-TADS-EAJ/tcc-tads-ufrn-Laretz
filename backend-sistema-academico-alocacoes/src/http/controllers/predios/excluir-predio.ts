import { FastifyReply, FastifyRequest } from "fastify";
import { predioParamsSchema } from "@/schemas/predio";
import { makeExcluirPredioUseCase } from "@/use-cases/@factories/predio/make-excluir-predio-use-case";
import { PossuiDependenciasError } from "@/use-cases/errors/possui-dependencias";
import { RecursoNaoEncontradoError } from "@/use-cases/errors/recurso-nao-encontrado";

export async function excluirPredio(request: FastifyRequest, reply: FastifyReply) {
  const { id } = predioParamsSchema.parse(request.params);

  try {
    const excluirPredioUseCase = makeExcluirPredioUseCase();

    await excluirPredioUseCase.execute({ id });

    return reply.status(204).send();
  } catch (error) {
    if (error instanceof RecursoNaoEncontradoError) {
      return reply.status(404).send({ message: error.message });
    }

    if (error instanceof PossuiDependenciasError) {
      return reply.status(400).send({ message: error.message });
    }

    throw error;
  }
}
