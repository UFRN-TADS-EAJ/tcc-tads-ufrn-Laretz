import { FastifyRequest, FastifyReply } from "fastify";
import { makeBuscarAlocacoesUseCase } from "@/use-cases/@factories/alocacao/make-buscar-alocacoes-use-case";
import { alocacoesQuerySchema } from "@/schemas";

export async function buscarAlocacoes(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { page, id_turma } = alocacoesQuerySchema.parse(request.query);

  try {
    const buscarAlocacoesUseCase = makeBuscarAlocacoesUseCase();

    const { alocacoes } = await buscarAlocacoesUseCase.execute({
      page,
      id_turma,
    });

    return reply.status(200).send({ alocacoes });
  } catch (error) {
    throw error;
  }
}
