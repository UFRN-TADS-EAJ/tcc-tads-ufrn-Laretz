import { FastifyReply, FastifyRequest } from "fastify";
import { makeBuscarCursoUseCase } from "@/use-cases/@factories/curso/make-buscar-curso-use-case";
import { cursoParamsSchema } from "@/schemas/curso";

export async function buscarCurso(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = cursoParamsSchema.parse(request.params);

  try {
    const buscarCursoUseCase = makeBuscarCursoUseCase();

    const { curso } = await buscarCursoUseCase.execute({ id });

    return reply.status(200).send({ curso });
  } catch (error) {
    if (error instanceof Error && error.name === "RecursoNaoEncontradoError") {
      return reply.status(404).send({
        error: "Recurso não encontrado",
        message: error.message,
      });
    }

    throw error;
  }
}
