import { FastifyReply, FastifyRequest } from "fastify";
import { idHorarioParamsSchema, atualizarHorarioSchema } from "@/schemas/horarios";
import { RecursoNaoEncontradoError } from "../../../use-cases/errors/recurso-nao-encontrado";
import { makeAtualizarHorarioUseCase } from "@/use-cases/@factories/horario/make-atualizar-horario-use-case";

export async function atualizarHorario(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { id } = idHorarioParamsSchema.parse(request.params);
  const { codigo, dia_semana, horario_inicio, horario_fim } = atualizarHorarioSchema.parse(request.body);

  try {
    const atualizarHorarioUseCase = makeAtualizarHorarioUseCase();

    const horario = await atualizarHorarioUseCase.execute({
      id,
      codigo,
      dia_semana,
      horario_inicio,
      horario_fim,
    });

    return reply.status(200).send({ horario });
  } catch (error) {
    if (error instanceof RecursoNaoEncontradoError) {
      return reply.status(404).send({ message: error.message });
    }

    throw error;
  }
}
