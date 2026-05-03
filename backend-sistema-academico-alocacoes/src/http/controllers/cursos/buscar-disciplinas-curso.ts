import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeBuscarDisciplinasCursoUseCase } from "@/use-cases/@factories/curso-disciplina/make-buscar-disciplinas-curso-use-case";

const paramsSchema = z.object({ id: z.string().uuid() });

export async function buscarDisciplinasCurso(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = paramsSchema.parse(request.params);

  const useCase = makeBuscarDisciplinasCursoUseCase();
  const { disciplinas } = await useCase.execute({ id_curso: id });

  return reply.status(200).send({ disciplinas });
}
