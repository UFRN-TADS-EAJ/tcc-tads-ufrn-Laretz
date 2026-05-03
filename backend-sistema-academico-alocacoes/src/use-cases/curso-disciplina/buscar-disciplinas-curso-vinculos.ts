import { CursoDisciplinaRepository } from "@/repositories/curso-disciplina-repository";
import { DisciplinasRepository } from "@/repositories/disciplinas-repository";

interface BuscarDisciplinasCursoVinculosUseCaseRequest {
  id_curso: string;
}

export class BuscarDisciplinasCursoVinculosUseCase {
  constructor(
    private cursoDisciplinaRepository: CursoDisciplinaRepository,
    private disciplinasRepository: DisciplinasRepository,
  ) {}

  async execute({ id_curso }: BuscarDisciplinasCursoVinculosUseCaseRequest) {
    const links = await this.cursoDisciplinaRepository.findManyByCursoId(id_curso);
    const disciplinaIds = links.map((l) => l.id_disciplina);
    const disciplinas =
      disciplinaIds.length > 0
        ? await this.disciplinasRepository.findByIds(disciplinaIds)
        : [];

    const disciplinaMap = new Map(disciplinas.map((d) => [d.id, d]));

    const vinculos = links
      .map((l) => ({
        id: l.id,
        id_curso: l.id_curso,
        id_disciplina: l.id_disciplina,
        disciplina: disciplinaMap.get(l.id_disciplina),
      }))
      .filter((v) => Boolean(v.disciplina))
      .sort(
        (a, b) => ((a.disciplina as any).semestre ?? 0) - ((b.disciplina as any).semestre ?? 0),
      );

    return { vinculos };
  }
}
