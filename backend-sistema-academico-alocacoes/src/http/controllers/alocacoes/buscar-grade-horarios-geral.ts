import { FastifyRequest, FastifyReply } from "fastify";
import { makeBuscarGradeHorariosUseCase } from "@/use-cases/@factories/horario/make-buscar-grade-horarios-use-case";
import { gradeHorariosQuerySchema } from "@/schemas";

export async function buscarGradeHorarios(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id_turma, id_user, id_sala } = gradeHorariosQuerySchema.parse(
    request.query
  );

  try {
    const buscarGradeHorariosUseCase = makeBuscarGradeHorariosUseCase();

    const { gradeHorarios, grade } = await buscarGradeHorariosUseCase.execute({
      id_turma,
      id_user,
      id_sala: id_sala ?? undefined,
    });
    return reply.status(200).send({ gradeHorarios, grade });
  } catch (error) {
    throw error;
  }
}
