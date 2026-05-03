import { FastifyReply, FastifyRequest } from "fastify";
import { idHorarioParamsSchema } from "@/schemas/horarios";
import { RecursoNaoEncontradoError } from "../../../use-cases/errors/recurso-nao-encontrado";
import { makeExcluirHorarioUseCase } from "@/use-cases/@factories/horario/make-excluir-horario-use-case";

export async function excluirHorario(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { id } = idHorarioParamsSchema.parse(request.params);

  try {
    const excluirHorarioUseCase = makeExcluirHorarioUseCase();

    await excluirHorarioUseCase.execute({
      id,
    });

    return reply.status(204).send();
  } catch (error) {
    if (error instanceof RecursoNaoEncontradoError) {
      return reply.status(404).send({ message: error.message });
    }

    throw error;
  }
}
