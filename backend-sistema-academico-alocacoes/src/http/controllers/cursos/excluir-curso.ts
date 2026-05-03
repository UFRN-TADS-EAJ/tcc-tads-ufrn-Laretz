import { FastifyReply, FastifyRequest } from "fastify";
import { makeExcluirCursoUseCase } from "@/use-cases/@factories/curso/make-excluir-curso-use-case";
import { cursoParamsSchema } from "@/schemas/curso";

export async function excluirCurso(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = cursoParamsSchema.parse(request.params);

  try {
    const excluirCursoUseCase = makeExcluirCursoUseCase();

    await excluirCursoUseCase.execute({ id });

    return reply.status(204).send();
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
