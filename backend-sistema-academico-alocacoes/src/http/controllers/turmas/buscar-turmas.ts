import { FastifyReply, FastifyRequest } from "fastify";
import { turmaQuerySchema } from "@/schemas";
import { makeBuscarTurmasUseCase } from "@/use-cases/@factories/turma/make-buscar-turmas-use-case";

export async function buscarTurmas(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const {
    page,
    limit,
    search,
    sortBy = "nome",
    sortOrder,
    turno,
    semestre,
    ativa,
    id_curso,
  } = turmaQuerySchema.parse(request.query);

  try {
    const buscarTurmasUseCase = makeBuscarTurmasUseCase();

    const params = {
      page,
      limit,
      sortBy,
      sortOrder,
      semestre: semestre ?? 1,
      ativa: ativa ?? true,
      ...(search !== undefined && { search }),
      ...(turno !== undefined && { turno }),
      ...(id_curso !== undefined && { id_curso }),
    };

    const { turmas, pagination } = await buscarTurmasUseCase.execute(params);

    return reply.status(200).send({ turmas, pagination });
  } catch (error) {
    throw error;
  }
}
