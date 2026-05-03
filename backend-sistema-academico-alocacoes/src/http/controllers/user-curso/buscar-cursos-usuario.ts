import { FastifyReply, FastifyRequest } from "fastify";
import { userCursoUserParamsSchema } from "@/schemas/user-curso";
import { makeBuscarCursosUsuarioUseCase } from "@/use-cases/@factories/user-curso/make-buscar-cursos-usuario-use-case";

export async function buscarCursosUsuario(request: FastifyRequest, reply: FastifyReply) {
  const { id_user } = userCursoUserParamsSchema.parse(request.params);

  try {
    const buscarCursosUsuarioUseCase = makeBuscarCursosUsuarioUseCase();

    const { cursos } = await buscarCursosUsuarioUseCase.execute({
      id_user,
    });

    return reply.status(200).send({ cursos });
  } catch (error) {
    throw error;
  }
}