import { FastifyReply, FastifyRequest } from "fastify";
import { makeListarTodasTurmasUseCase } from "@/use-cases/@factories/turma/make-listar-todas-turmas-use-case";

export async function listarTodasTurmas(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const listarTodasTurmasUseCase = makeListarTodasTurmasUseCase();

    const { turmas } = await listarTodasTurmasUseCase.execute();

    const turmasPayload = turmas.map((turma: any) => ({
      id: turma.id,
      nome: turma.nome,
      num_alunos: turma.num_alunos,
      semestre: turma.semestre,
      turno: turma.turno,
      id_curso: turma.id_curso ?? turma.curso?.id,
      ativa: turma.ativa,
      curso: turma.curso,
    }));

    return reply.status(200).send({ turmas: turmasPayload });
  } catch (error) {
    throw error;
  }
}
