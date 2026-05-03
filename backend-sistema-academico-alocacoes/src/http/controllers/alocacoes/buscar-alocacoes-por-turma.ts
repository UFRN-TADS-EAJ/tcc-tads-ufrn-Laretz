import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeBuscarAlocacoesPorTurmaUseCase } from "@/use-cases/@factories/alocacao/make-buscar-alocacoes-por-turma-use-case";

const paramsSchema = z.object({
  id_turma: z.string().uuid(),
});

export async function buscarAlocacoesPorTurma(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id_turma } = paramsSchema.parse(request.params);

  try {
    const buscarAlocacoesPorTurmaUseCase = makeBuscarAlocacoesPorTurmaUseCase();

    const { alocacoes } = await buscarAlocacoesPorTurmaUseCase.execute({
      id_turma,
    });

    return reply.status(200).send({ alocacoes });
  } catch (error) {
    throw error;
  }
}
