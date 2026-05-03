import { FastifyReply, FastifyRequest } from "fastify";
import { criarHorarioSchema } from "@/schemas/horarios";
import { makeCriarHorarioUseCase } from "@/use-cases/@factories/horario/make-criar-horario-use-case";

export async function criarHorario(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { codigo, dia_semana, horario_inicio, horario_fim } = criarHorarioSchema.parse(request.body);

  try {
    const criarHorarioUseCase = makeCriarHorarioUseCase();

    const { horario } = await criarHorarioUseCase.execute({
      codigo,
      dia_semana,
      horario_inicio,
      horario_fim,
    });

    return reply.status(201).send({ horario });
  } catch (error) {
    throw error;
  }
}
