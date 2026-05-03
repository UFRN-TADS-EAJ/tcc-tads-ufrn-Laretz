import { FastifyReply, FastifyRequest } from "fastify";
import { makeBuscarHorariosUseCase } from "@/use-cases/@factories/horario/make-buscar-horarios-use-case";
import { buscarHorariosQuerySchema } from "@/schemas/horarios";

export async function buscarHorarios(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const parsed = buscarHorariosQuerySchema.parse(request.query);
    const regime = parsed.regime;
    const dia_semana = parsed.dia_semana;
    const buscarHorariosUseCase = makeBuscarHorariosUseCase();

    const result = await buscarHorariosUseCase.execute({ regime, dia_semana });

    return reply.status(200).send({ horarios: result.horarios });
  } catch (error) {
    throw error;
  }
}
