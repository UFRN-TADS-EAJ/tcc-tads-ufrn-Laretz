import { FastifyReply, FastifyRequest } from "fastify";
import { desvincularProfessorDisciplinaSchema } from "@/schemas/professor-disciplina";
import { makeDesvincularProfessorDisciplinaUseCase } from "@/use-cases/@factories/professor-disciplina/make-desvincular-professor-disciplina-use-case";

export async function desvincularProfessorDisciplina(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id_user, id_disciplina } = desvincularProfessorDisciplinaSchema.parse(
    request.body
  );

  try {
    const desvincularProfessorDisciplinaUseCase =
      makeDesvincularProfessorDisciplinaUseCase();

    const { success } = await desvincularProfessorDisciplinaUseCase.execute({
      id_user,
      id_disciplina,
    });

    return reply.status(200).send({ success });
  } catch (err) {
    throw err;
  }
}
