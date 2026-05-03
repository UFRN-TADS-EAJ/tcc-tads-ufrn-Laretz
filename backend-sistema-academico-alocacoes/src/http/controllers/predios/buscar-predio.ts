import { FastifyReply, FastifyRequest } from "fastify";
import { predioParamsSchema } from "@/schemas/predio";
import { makeBuscarPredioUseCase } from "@/use-cases/@factories/predio/make-buscar-predio-use-case";
import { RecursoNaoEncontradoError } from "@/use-cases/errors/recurso-nao-encontrado";

export async function buscarPredio(request: FastifyRequest, reply: FastifyReply) {
  const { id } = predioParamsSchema.parse(request.params);

  try {
    const buscarPredioUseCase = makeBuscarPredioUseCase();

    const { predio } = await buscarPredioUseCase.execute({
      id,
    });

    return reply.status(200).send({ predio });
  } catch (error) {
    if (error instanceof RecursoNaoEncontradoError) {
      return reply.status(404).send({ message: error.message });
    }

    throw error;
  }
}
