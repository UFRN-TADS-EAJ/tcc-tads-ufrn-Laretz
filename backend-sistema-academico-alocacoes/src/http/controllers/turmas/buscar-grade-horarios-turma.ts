import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { makeBuscarGradeHorariosTurmaUseCase } from "@/use-cases/@factories/turma/make-buscar-grade-horarios-turma-use-case";

export async function buscarGradeHorariosTurma(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const buscarGradeHorariosTurmaParamsSchema = z.object({
    id: z.string().uuid(),
  });

  const { id } = buscarGradeHorariosTurmaParamsSchema.parse(request.params);
  const buscarGradeHorariosTurmaQuerySchema = z.object({
    periodoId: z.string().uuid().optional(),
  });
  const { periodoId } = buscarGradeHorariosTurmaQuerySchema.parse(request.query);

  try {
    const buscarGradeHorariosTurmaUseCase =
      makeBuscarGradeHorariosTurmaUseCase();

    const { turmaId, grade, resumo } =
      await buscarGradeHorariosTurmaUseCase.execute({
        turmaId: id,
        ...(periodoId ? { periodoId } : {}),
      });

    return reply.status(200).send({
      turmaId,
      grade,
      resumo,
    });
  } catch (err) {
    throw err;
  }
}
