import { FastifyReply, FastifyRequest } from "fastify";
import { idHorarioParamsSchema } from "@/schemas/horarios";
import { RecursoNaoEncontradoError } from "../../../use-cases/errors/recurso-nao-encontrado";
import { makeBuscarHorarioUseCase } from "@/use-cases/@factories/horario/make-buscar-horario-use-case";

export async function buscarHorario(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { id } = idHorarioParamsSchema.parse(request.params);

  try {
    const buscarHorarioUseCase = makeBuscarHorarioUseCase();

    const { horario } = await buscarHorarioUseCase.execute({
      id,
    });

    return reply.status(200).send({ horario });
  } catch (error) {
    if (error instanceof RecursoNaoEncontradoError) {
      return reply.status(404).send({ message: error.message });
    }

    throw error;
  }
}
