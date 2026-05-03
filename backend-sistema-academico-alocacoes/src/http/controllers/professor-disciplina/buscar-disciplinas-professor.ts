import { FastifyReply, FastifyRequest } from "fastify";
import { idUserParamsSchema } from "@/schemas/professor-disciplina";
import { makeBuscarDisciplinasProfessorUseCase } from "@/use-cases/@factories/professor-disciplina/make-buscar-disciplinas-professor-use-case";

export async function buscarDisciplinasProfessor(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { id_user } = idUserParamsSchema.parse(request.params);

  try {
    const buscarDisciplinasProfessorUseCase = makeBuscarDisciplinasProfessorUseCase();

    const { disciplinas } = await buscarDisciplinasProfessorUseCase.execute({
      id_user,
    });;

    return reply.status(200).send({
      disciplinas,
    });
  } catch (err) {
    throw err;
  }
}
