import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeDesvincularDisciplinaCursoUseCase } from "@/use-cases/@factories/curso-disciplina/make-desvincular-disciplina-curso-use-case";
import { VinculoNaoEncontradoError } from "@/use-cases/errors/vinculo-nao-encontrado";

const paramsSchema = z.object({ id: z.string().uuid(), idDisciplina: z.string().uuid() });

export async function desvincularDisciplinaCurso(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id, idDisciplina } = paramsSchema.parse(request.params);

  try {
    const useCase = makeDesvincularDisciplinaCursoUseCase();
    await useCase.execute({
      id_curso: id,
      id_disciplina: idDisciplina,
    });

    return reply.status(204).send();
  } catch (error) {
    if (error instanceof VinculoNaoEncontradoError) {
      return reply.status(404).send({ message: error.message });
    }
    throw error;
  }
}
