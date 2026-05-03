import { PrismaCursoDisciplinaRepository } from "@/repositories/prisma-repositories/prisma-curso-disciplina-repository";
import { PrismaDisciplinasRepository } from "@/repositories/prisma-repositories/prisma-disciplinas-repository";
import { BuscarDisciplinasCursoUseCase } from "@/use-cases/curso-disciplina/buscar-disciplinas-curso";

export function makeBuscarDisciplinasCursoUseCase() {
  const cursoDisciplinaRepository = new PrismaCursoDisciplinaRepository();
  const disciplinasRepository = new PrismaDisciplinasRepository();
  
  const useCase = new BuscarDisciplinasCursoUseCase(
    cursoDisciplinaRepository,
    disciplinasRepository
  );

  return useCase;
}
