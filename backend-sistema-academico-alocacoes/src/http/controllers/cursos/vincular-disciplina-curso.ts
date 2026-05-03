import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeVincularDisciplinaCursoUseCase } from "@/use-cases/@factories/curso-disciplina/make-vincular-disciplina-curso-use-case";
import { CursoNaoEncontradoError } from "@/use-cases/errors/curso-nao-encontrado";
import { DisciplinaNaoEncontradaError } from "@/use-cases/errors/disciplina-nao-encontrada";
import { VinculoJaExisteError } from "@/use-cases/errors/vinculo-ja-existe";

const paramsSchema = z.object({ id: z.string().uuid() });
const bodySchema = z.object({ idDisciplina: z.string().uuid() });

export async function vincularDisciplinaCurso(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = paramsSchema.parse(request.params);
  const { idDisciplina } = bodySchema.parse(request.body);

  try {
    const useCase = makeVincularDisciplinaCursoUseCase();
    const { vinculo } = await useCase.execute({
      id_curso: id,
      id_disciplina: idDisciplina,
    });

    return reply.status(201).send({ message: "Disciplina vinculada ao curso", vinculo });
  } catch (error) {
    if (error instanceof CursoNaoEncontradoError) {
      return reply.status(404).send({ message: error.message });
    }
    if (error instanceof DisciplinaNaoEncontradaError) {
      return reply.status(404).send({ message: error.message });
    }
    if (error instanceof VinculoJaExisteError) {
      return reply.status(409).send({ message: error.message });
    }
    throw error;
  }
}
