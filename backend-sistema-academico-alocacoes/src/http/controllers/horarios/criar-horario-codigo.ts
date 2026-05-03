import { FastifyReply, FastifyRequest } from "fastify";
import { criarHorarioCodigoSchema } from "@/schemas/horarios";
import { makeCriarHorarioCodigoUseCase } from "@/use-cases/@factories/horario/make-criar-horario-codigo-use-case";

export async function criarHorarioCodigo(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { codigo } = criarHorarioCodigoSchema.parse(request.body);

  try {
    const criarHorarioCodigoUseCase = makeCriarHorarioCodigoUseCase();

    const { horario } = await criarHorarioCodigoUseCase.execute({
      codigo,
    });

    return reply.status(201).send({ horario });
  } catch (error) {
    if (error instanceof Error) {
      return reply.status(400).send({ message: error.message });
    }
    throw error;
  }
}
