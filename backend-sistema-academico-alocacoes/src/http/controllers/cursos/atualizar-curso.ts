import { FastifyReply, FastifyRequest } from "fastify";
import { makeAtualizarCursoUseCase } from "@/use-cases/@factories/curso/make-atualizar-curso-use-case";
import { atualizarCursoBodySchema, cursoParamsSchema } from "@/schemas/curso";

export async function atualizarCurso(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = cursoParamsSchema.parse(request.params);
  const { nome, turno } = atualizarCursoBodySchema.parse(request.body);

  try {
    const atualizarCursoUseCase = makeAtualizarCursoUseCase();

    const { curso } = await atualizarCursoUseCase.execute({
      id,
      nome,
      turno,
    });

    return reply.status(200).send({ curso, message: "Curso atualizado com sucesso" });
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
