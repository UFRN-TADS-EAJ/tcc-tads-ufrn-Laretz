import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeBuscarGradeHorariosSalaUseCase } from "@/use-cases/@factories/sala/make-buscar-grade-horarios-sala-use-case";

export async function buscarGradeHorariosSala(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const buscarGradeHorariosSalaParamsSchema = z.object({
    id: z.string().uuid(),
  });

  const { id } = buscarGradeHorariosSalaParamsSchema.parse(request.params);
  const buscarGradeHorariosSalaQuerySchema = z.object({
    periodoId: z.string().uuid().optional(),
  });
  const { periodoId } = buscarGradeHorariosSalaQuerySchema.parse(request.query);

  try {
    const buscarGradeHorariosSalaUseCase = makeBuscarGradeHorariosSalaUseCase();

    const { salaId, grade, resumo } =
      await buscarGradeHorariosSalaUseCase.execute({
        salaId: id,
        ...(periodoId ? { periodoId } : {}),
      });

    return reply.status(200).send({ salaId, grade, resumo });
  } catch (error) {
    throw error;
  }
}
