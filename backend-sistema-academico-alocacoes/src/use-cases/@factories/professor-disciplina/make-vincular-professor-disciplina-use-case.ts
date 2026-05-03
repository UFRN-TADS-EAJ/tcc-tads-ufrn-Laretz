import { PrismaProfessorDisciplinaRepository } from '@/repositories/prisma-repositories/prisma-professor-disciplina-repository'
import { PrismaUsersRepository } from '@/repositories/prisma-repositories/prisma-users-repository'
import { PrismaDisciplinasRepository } from '@/repositories/prisma-repositories/prisma-disciplinas-repository'
import { VincularProfessorDisciplinaUseCase } from '@/use-cases/professor-disciplina/vincular-professor-disciplina'

export function makeVincularProfessorDisciplinaUseCase() {
  const professorDisciplinaRepository = new PrismaProfessorDisciplinaRepository()
  const usuarioRepository = new PrismaUsersRepository()
  const disciplinasRepository = new PrismaDisciplinasRepository()
  
  const useCase = new VincularProfessorDisciplinaUseCase(
    professorDisciplinaRepository,
    usuarioRepository,
    disciplinasRepository,
  )

  return useCase
}
