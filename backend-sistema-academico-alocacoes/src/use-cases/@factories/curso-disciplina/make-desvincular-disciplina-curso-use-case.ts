import { PrismaCursoDisciplinaRepository } from "@/repositories/prisma-repositories/prisma-curso-disciplina-repository";
import { DesvincularDisciplinaCursoUseCase } from "@/use-cases/curso-disciplina/desvincular-disciplina-curso";

export function makeDesvincularDisciplinaCursoUseCase() {
  const cursoDisciplinaRepository = new PrismaCursoDisciplinaRepository();
  const useCase = new DesvincularDisciplinaCursoUseCase(cursoDisciplinaRepository);

  return useCase;
}
