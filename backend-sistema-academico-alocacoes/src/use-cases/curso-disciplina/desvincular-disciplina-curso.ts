import { CursoDisciplinaRepository } from "@/repositories/curso-disciplina-repository";
import { VinculoNaoEncontradoError } from "@/use-cases/errors/vinculo-nao-encontrado";

interface DesvincularDisciplinaCursoUseCaseRequest {
  id_curso: string;
  id_disciplina: string;
}

export class DesvincularDisciplinaCursoUseCase {
  constructor(private cursoDisciplinaRepository: CursoDisciplinaRepository) {}

  async execute({ id_curso, id_disciplina }: DesvincularDisciplinaCursoUseCaseRequest) {
    const vinculo = await this.cursoDisciplinaRepository.findFirstByCursoAndDisciplina(
      id_curso,
      id_disciplina,
    );

    if (!vinculo) {
      throw new VinculoNaoEncontradoError();
    }

    await this.cursoDisciplinaRepository.deleteById(vinculo.id);
  }
}
