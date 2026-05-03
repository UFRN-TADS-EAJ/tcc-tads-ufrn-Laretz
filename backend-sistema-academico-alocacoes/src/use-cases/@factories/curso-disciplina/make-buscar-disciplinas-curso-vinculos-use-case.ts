import { PrismaCursoDisciplinaRepository } from "@/repositories/prisma-repositories/prisma-curso-disciplina-repository";
import { PrismaDisciplinasRepository } from "@/repositories/prisma-repositories/prisma-disciplinas-repository";
import { BuscarDisciplinasCursoVinculosUseCase } from "@/use-cases/curso-disciplina/buscar-disciplinas-curso-vinculos";

export function makeBuscarDisciplinasCursoVinculosUseCase() {
  const cursoDisciplinaRepository = new PrismaCursoDisciplinaRepository();
  const disciplinasRepository = new PrismaDisciplinasRepository();
  
  const useCase = new BuscarDisciplinasCursoVinculosUseCase(
    cursoDisciplinaRepository,
    disciplinasRepository
  );

  return useCase;
}
