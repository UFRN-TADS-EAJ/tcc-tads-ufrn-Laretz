import { FastifyRequest, FastifyReply } from "fastify";
import { RecursoNaoEncontradoError } from "../../../use-cases/errors/recurso-nao-encontrado";
import { makeBuscarAlocacaoUseCase } from "@/use-cases/@factories/alocacao/make-buscar-alocacao-use-case";
import { alocacaoParamsSchema } from "@/schemas";

export async function buscarAlocacao(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = alocacaoParamsSchema.parse(request.params);

  try {
    const buscarAlocacaoUseCase = makeBuscarAlocacaoUseCase();

    const { alocacao } = await buscarAlocacaoUseCase.execute({
      id,
    });

    return reply.status(200).send({ alocacao });
  } catch (error) {
    if (error instanceof RecursoNaoEncontradoError) {
      return reply.status(404).send({ message: error.message });
    }

    throw error;
  }
}
