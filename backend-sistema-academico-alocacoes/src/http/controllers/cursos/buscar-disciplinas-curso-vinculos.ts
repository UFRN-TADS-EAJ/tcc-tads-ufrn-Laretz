import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeBuscarDisciplinasCursoVinculosUseCase } from "@/use-cases/@factories/curso-disciplina/make-buscar-disciplinas-curso-vinculos-use-case";

const paramsSchema = z.object({ id: z.string().uuid() });

export async function buscarDisciplinasCursoVinculos(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = paramsSchema.parse(request.params);

  const useCase = makeBuscarDisciplinasCursoVinculosUseCase();
  const { vinculos } = await useCase.execute({ id_curso: id });

  return reply.status(200).send({ vinculos });
}
