import { PrismaCursoDisciplinaRepository } from "@/repositories/prisma-repositories/prisma-curso-disciplina-repository";
import { PrismaCursosRepository } from "@/repositories/prisma-repositories/prisma-cursos-repository";
import { PrismaDisciplinasRepository } from "@/repositories/prisma-repositories/prisma-disciplinas-repository";
import { VincularDisciplinaCursoUseCase } from "@/use-cases/curso-disciplina/vincular-disciplina-curso";

export function makeVincularDisciplinaCursoUseCase() {
  const cursosRepository = new PrismaCursosRepository();
  const disciplinasRepository = new PrismaDisciplinasRepository();
  const cursoDisciplinaRepository = new PrismaCursoDisciplinaRepository();
  
  const useCase = new VincularDisciplinaCursoUseCase(
    cursosRepository,
    disciplinasRepository,
    cursoDisciplinaRepository
  );

  return useCase;
}
