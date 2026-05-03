import { FastifyRequest, FastifyReply } from "fastify";
import { RecursoNaoEncontradoError } from "../../../use-cases/errors/recurso-nao-encontrado";
import { makeAtualizarAlocacaoUseCase } from "@/use-cases/@factories/alocacao/make-atualizar-alocacao-use-case";
import { alocacaoParamsSchema, updateAlocacaoSchema } from "@/schemas";

export async function atualizarAlocacao(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = alocacaoParamsSchema.parse(request.params);
  const { id_user, id_curso_disciplina, id_turma, id_sala, id_horario } =
    updateAlocacaoSchema.parse(request.body);

  try {
    const atualizarAlocacaoUseCase = makeAtualizarAlocacaoUseCase();

    const { alocacao } = await atualizarAlocacaoUseCase.execute({
      id,
      id_user,
      id_curso_disciplina,
      id_turma,
      id_sala,
      id_horario,
    });

    return reply.status(200).send({ alocacao });
  } catch (error) {
    if (error instanceof RecursoNaoEncontradoError) {
      return reply.status(404).send({ message: error.message });
    }

    throw error;
  }
}
