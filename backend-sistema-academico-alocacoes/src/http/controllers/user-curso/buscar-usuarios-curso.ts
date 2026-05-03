import { FastifyReply, FastifyRequest } from "fastify";
import { userCursoCursoParamsSchema } from "@/schemas/user-curso";
import { makeBuscarUsuariosCursoUseCase } from "@/use-cases/@factories/user-curso/make-buscar-usuarios-curso-use-case";

export async function buscarUsuariosCurso(request: FastifyRequest, reply: FastifyReply) {
  const { id_curso } = userCursoCursoParamsSchema.parse(request.params);

  try {
    const buscarUsuariosCursoUseCase = makeBuscarUsuariosCursoUseCase();

    const { usuarios } = await buscarUsuariosCursoUseCase.execute({
      id_curso,
    });

    return reply.status(200).send({ usuarios });
  } catch (error) {
    throw error;
  }
}