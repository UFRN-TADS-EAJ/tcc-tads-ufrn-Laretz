import { PrismaProfessorDisciplinaRepository } from '@/repositories/prisma-repositories/prisma-professor-disciplina-repository'
import { PrismaDisciplinasRepository } from '@/repositories/prisma-repositories/prisma-disciplinas-repository'
import { BuscarProfessoresDisciplinaUseCase } from '@/use-cases/professor-disciplina/buscar-professores-disciplina'

export function makeBuscarProfessoresDisciplinaUseCase() {
  const professorDisciplinaRepository = new PrismaProfessorDisciplinaRepository()
  const disciplinasRepository = new PrismaDisciplinasRepository()
  
  const useCase = new BuscarProfessoresDisciplinaUseCase(
    professorDisciplinaRepository,
    disciplinasRepository,
  )

  return useCase
}
