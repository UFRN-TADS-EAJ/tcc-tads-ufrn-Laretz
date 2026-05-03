import { FastifyRequest, FastifyReply } from "fastify";
import { makeExcluirTodasAlocacoesTurmaUseCase } from "@/use-cases/@factories/alocacao/make-excluir-todas-alocacoes-turma-use-case";
import { excluirAlocacoesTurmaParamsSchema } from "@/schemas";

export async function excluirTodasAlocacoesTurma(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { id_turma } = excluirAlocacoesTurmaParamsSchema.parse(request.params);

  try {
    const excluirTodasAlocacoesTurmaUseCase =
      makeExcluirTodasAlocacoesTurmaUseCase();

    const { message } = await excluirTodasAlocacoesTurmaUseCase.execute({
      id_turma,
    });

    return reply.status(200).send({
      message,
    });
  } catch (err) {
    throw err;
  }
}
