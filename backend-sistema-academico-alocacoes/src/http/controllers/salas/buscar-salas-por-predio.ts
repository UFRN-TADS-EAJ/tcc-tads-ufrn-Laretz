import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { makeBuscarSalasPorPredioUseCase } from "@/use-cases/@factories/sala/make-buscar-salas-por-predio-use-case";

export async function buscarSalasPorPredio(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const buscarSalasPorPredioParamsSchema = z.object({
    predioId: z.string().uuid(),
  });

  const { predioId } = buscarSalasPorPredioParamsSchema.parse(request.params);

  try {
    const buscarSalasPorPredioUseCase = makeBuscarSalasPorPredioUseCase();

    const { salas } = await buscarSalasPorPredioUseCase.execute({
      predioId,
    });

    return reply.status(200).send({
      salas,
    });
  } catch (err) {
    throw err;
  }
}
