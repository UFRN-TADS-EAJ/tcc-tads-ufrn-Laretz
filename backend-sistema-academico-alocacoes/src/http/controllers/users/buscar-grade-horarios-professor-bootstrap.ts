import { FastifyReply, FastifyRequest } from "fastify";
import { userParamsSchema } from "@/schemas/user";
import { makeBuscarGradeHorariosProfessorBootstrapUseCase } from "@/use-cases/@factories/usuario/make-buscar-grade-horarios-professor-bootstrap-use-case";

export async function buscarGradeHorariosProfessorBootstrap(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { id } = userParamsSchema.parse(request.params);

  const useCase = makeBuscarGradeHorariosProfessorBootstrapUseCase();
  const result = await useCase.execute({ id_user: id });

  return reply.status(200).send(result);
}
