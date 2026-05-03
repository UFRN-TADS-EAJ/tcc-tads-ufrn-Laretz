import { PrismaProfessorDisciplinaRepository } from '@/repositories/prisma-repositories/prisma-professor-disciplina-repository'
import { PrismaUsersRepository } from '@/repositories/prisma-repositories/prisma-users-repository'
import { PrismaDisciplinasRepository } from '@/repositories/prisma-repositories/prisma-disciplinas-repository'
import { BuscarDisciplinasProfessorUseCase } from '@/use-cases/professor-disciplina/buscar-disciplinas-professor'

export function makeBuscarDisciplinasProfessorUseCase() {
  const professorDisciplinaRepository = new PrismaProfessorDisciplinaRepository()
  const usuarioRepository = new PrismaUsersRepository()
  const disciplinasRepository = new PrismaDisciplinasRepository()
  
  const useCase = new BuscarDisciplinasProfessorUseCase(
    professorDisciplinaRepository,
    disciplinasRepository,
    usuarioRepository,
  )

  return useCase
}
