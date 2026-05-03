import { FastifyRequest, FastifyReply } from "fastify";
import { makeBuscarAlocacoesProfessorUseCase } from "@/use-cases/@factories/alocacao/make-buscar-alocacoes-professor-use-case";
import { alocacoesProfessorParamsSchema, alocacoesQuerySchema } from "@/schemas";

export async function buscarAlocacoesProfessor(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id_professor } = alocacoesProfessorParamsSchema.parse(
    request.params
  );
  const { page } = alocacoesQuerySchema.parse(request.query);

  try {
    const buscarAlocacoesProfessorUseCase =
      makeBuscarAlocacoesProfessorUseCase();

    const { alocacoes } = await buscarAlocacoesProfessorUseCase.execute({
      id_professor,
      page,
    });

    return reply.status(200).send({ alocacoes });
  } catch (error) {
    throw error;
  }
}
