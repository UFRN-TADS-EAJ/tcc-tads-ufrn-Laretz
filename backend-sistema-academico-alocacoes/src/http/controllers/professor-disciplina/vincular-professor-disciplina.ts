import { FastifyRequest, FastifyReply } from 'fastify'
import { makeVincularProfessorDisciplinaUseCase } from '@/use-cases/@factories/professor-disciplina/make-vincular-professor-disciplina-use-case'
import { vincularProfessorDisciplinaSchema } from '@/schemas/professor-disciplina'

export async function vincularProfessorDisciplina(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { id_user, id_disciplina } = vincularProfessorDisciplinaSchema.parse(
    request.body,
  )

  try {
    const vincularProfessorDisciplinaUseCase = makeVincularProfessorDisciplinaUseCase()

    const { professorDisciplina } = await vincularProfessorDisciplinaUseCase.execute({
      id_user,
      id_disciplina,
    })

    return reply.status(201).send(
      professorDisciplina,
    )
  } catch (err) {
    throw err
  }
}
