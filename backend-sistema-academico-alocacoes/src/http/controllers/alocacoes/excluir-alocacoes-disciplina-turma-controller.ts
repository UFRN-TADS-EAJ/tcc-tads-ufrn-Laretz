import { FastifyRequest, FastifyReply } from "fastify";
import { makeExcluirAlocacoesDisciplinaTurmaUseCase } from "@/use-cases/@factories/alocacao/make-excluir-alocacoes-disciplina-turma-use-case";
import { excluirAlocacoesDisciplinaTurmaParamsSchema } from "@/schemas/alocacao";

export async function excluirAlocacoesDisciplinaTurma(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { id_turma, id_disciplina } =
    excluirAlocacoesDisciplinaTurmaParamsSchema.parse(request.params);

  try {
    const excluirAlocacoesDisciplinaTurmaUseCase =
      makeExcluirAlocacoesDisciplinaTurmaUseCase();

    const { message } = await excluirAlocacoesDisciplinaTurmaUseCase.execute({
      id_turma,
      id_disciplina,
    });

    return reply.status(200).send({
      message,
    });
  } catch (err) {
    throw err;
  }
}
