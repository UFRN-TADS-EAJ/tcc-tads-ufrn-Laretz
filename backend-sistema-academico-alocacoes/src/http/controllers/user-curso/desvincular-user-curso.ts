import { FastifyReply, FastifyRequest } from "fastify";
import { desvincularUserCursoSchema } from "@/schemas/user-curso";
import { makeDesvincularUserCursoUseCase } from "@/use-cases/@factories/user-curso/make-desvincular-user-curso-use-case";

export async function desvincularUserCurso(request: FastifyRequest, reply: FastifyReply) {
  const { id_user, id_curso } = desvincularUserCursoSchema.parse(request.body);

  try {
    const desvincularUserCursoUseCase = makeDesvincularUserCursoUseCase();

    await desvincularUserCursoUseCase.execute({
      id_user,
      id_curso,
    });

    return reply.status(200).send({
      message: "Usuário desvinculado do curso com sucesso",
    });
  } catch (error) {
    throw error;
  }
}