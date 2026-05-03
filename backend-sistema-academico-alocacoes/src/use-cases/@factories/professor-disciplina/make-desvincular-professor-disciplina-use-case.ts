import { PrismaProfessorDisciplinaRepository } from '@/repositories/prisma-repositories/prisma-professor-disciplina-repository'
import { DesvincularProfessorDisciplinaUseCase } from '@/use-cases/professor-disciplina/desvincular-professor-disciplina'

export function makeDesvincularProfessorDisciplinaUseCase() {
  const professorDisciplinaRepository = new PrismaProfessorDisciplinaRepository()
  
  const useCase = new DesvincularProfessorDisciplinaUseCase(
    professorDisciplinaRepository,
  )

  return useCase
}
