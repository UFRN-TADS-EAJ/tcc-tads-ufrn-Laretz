import { FastifyReply, FastifyRequest } from "fastify";
import { vincularUserCursoSchema } from "@/schemas/user-curso";
import { makeVincularUserCursoUseCase } from "@/use-cases/@factories/user-curso/make-vincular-user-curso-use-case";

export async function vincularUserCurso(request: FastifyRequest, reply: FastifyReply) {
  const { id_user, id_curso } = vincularUserCursoSchema.parse(request.body);

  try {
    const vincularUserCursoUseCase = makeVincularUserCursoUseCase();

    const { userCurso } = await vincularUserCursoUseCase.execute({
      id_user,
      id_curso,
    });

    return reply.status(201).send(userCurso);
  } catch (error) {
    throw error;
  }
}