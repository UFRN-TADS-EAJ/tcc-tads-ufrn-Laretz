import { FastifyReply, FastifyRequest } from "fastify";
import { idDisciplinaParamsSchema } from "@/schemas/professor-disciplina";
import { makeBuscarProfessoresDisciplinaUseCase } from "@/use-cases/@factories/professor-disciplina/make-buscar-professores-disciplina-use-case";

export async function buscarProfessoresDisciplina(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { id_disciplina } = idDisciplinaParamsSchema.parse(request.params);

  try {
    const buscarProfessoresDisciplinaUseCase = makeBuscarProfessoresDisciplinaUseCase();

    const { professores } = await buscarProfessoresDisciplinaUseCase.execute({
      id_disciplina,
    });

    return reply.status(200).send({
      professores,
    })
  } catch (err) {
    throw err
  }
}
