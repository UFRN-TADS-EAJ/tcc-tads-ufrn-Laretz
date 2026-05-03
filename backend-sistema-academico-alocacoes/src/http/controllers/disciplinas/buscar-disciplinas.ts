import { FastifyReply, FastifyRequest } from "fastify";
import { makeBuscarDisciplinasUseCase } from '@/use-cases/@factories/disciplina/make-buscar-disciplinas-use-case';

export async function buscarDisciplinas(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const buscarDisciplinasUseCase = makeBuscarDisciplinasUseCase();

    const { disciplinas } = await buscarDisciplinasUseCase.execute();

    return reply.status(200).send({ disciplinas });
  } catch (error) {
    throw error;
  }
}
