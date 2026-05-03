import { CursoDisciplinaRepository } from "@/repositories/curso-disciplina-repository";
import { CursosRepository } from "@/repositories/cursos-repository";
import { DisciplinasRepository } from "@/repositories/disciplinas-repository";
import { CursoNaoEncontradoError } from "@/use-cases/errors/curso-nao-encontrado";
import { DisciplinaNaoEncontradaError } from "@/use-cases/errors/disciplina-nao-encontrada";
import { VinculoJaExisteError } from "@/use-cases/errors/vinculo-ja-existe";

interface VincularDisciplinaCursoUseCaseRequest {
  id_curso: string;
  id_disciplina: string;
}

export class VincularDisciplinaCursoUseCase {
  constructor(
    private cursosRepository: CursosRepository,
    private disciplinasRepository: DisciplinasRepository,
    private cursoDisciplinaRepository: CursoDisciplinaRepository,
  ) {}

  async execute({ id_curso, id_disciplina }: VincularDisciplinaCursoUseCaseRequest) {
    const [curso, disciplina] = await Promise.all([
      this.cursosRepository.findById(id_curso),
      this.disciplinasRepository.findById(id_disciplina),
    ]);

    if (!curso) throw new CursoNaoEncontradoError();
    if (!disciplina) throw new DisciplinaNaoEncontradaError();

    const existente = await this.cursoDisciplinaRepository.findFirstByCursoAndDisciplina(
      id_curso,
      id_disciplina,
    );

    if (existente) throw new VinculoJaExisteError();

    const vinculo = await this.cursoDisciplinaRepository.create({
      id_curso,
      id_disciplina,
    });

    return { vinculo };
  }
}
