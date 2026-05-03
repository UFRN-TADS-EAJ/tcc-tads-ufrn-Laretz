import { FastifyReply, FastifyRequest } from "fastify";
import { makeBuscarCursosUseCase } from "@/use-cases/@factories/curso/make-buscar-cursos-use-case";

export async function buscarCursos(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const buscarCursosUseCase = makeBuscarCursosUseCase();

    const { cursos } = await buscarCursosUseCase.execute();

    return reply.status(200).send({ cursos });
  } catch (error) {
    throw error;
  }
}
