import { FastifyRequest, FastifyReply } from "fastify";
import { makeBuscarAlocacoesTurnoManhaUseCase } from "@/use-cases/@factories/alocacao/make-buscar-alocacoes-turno-manha-use-case";
import { alocacoesQuerySchema } from "@/schemas";

export async function buscarAlocacoesTurnoManha(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { page } = alocacoesQuerySchema.parse(request.query);

  try {
    const buscarAlocacoesTurnoManhaUseCase =
      makeBuscarAlocacoesTurnoManhaUseCase();

    const { alocacoes } = await buscarAlocacoesTurnoManhaUseCase.execute({
      page,
    });

    return reply.status(200).send({
      alocacoes,
    });
  } catch (err) {
    throw err;
  }
}
