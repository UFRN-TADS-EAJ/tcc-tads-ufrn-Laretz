import { CursoDisciplinaRepository } from "@/repositories/curso-disciplina-repository";
import { DisciplinasRepository } from "@/repositories/disciplinas-repository";

interface BuscarDisciplinasCursoUseCaseRequest {
  id_curso: string;
}

export class BuscarDisciplinasCursoUseCase {
  constructor(
    private cursoDisciplinaRepository: CursoDisciplinaRepository,
    private disciplinasRepository: DisciplinasRepository,
  ) {}

  async execute({ id_curso }: BuscarDisciplinasCursoUseCaseRequest) {
    const links = await this.cursoDisciplinaRepository.findManyByCursoId(id_curso);
    const disciplinaIds = links.map((l) => l.id_disciplina);

    const disciplinas =
      disciplinaIds.length > 0
        ? await this.disciplinasRepository.findByIds(disciplinaIds)
        : [];

    disciplinas.sort((a, b) => (a.semestre ?? 0) - (b.semestre ?? 0));

    return { disciplinas };
  }
}
