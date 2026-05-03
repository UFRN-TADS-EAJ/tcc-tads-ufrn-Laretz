import { DisciplinasRepository } from "../../repositories/disciplinas-repository";
import { RecursoNaoEncontradoError } from "../errors/recurso-nao-encontrado";

interface BuscarDisciplinaUseCaseRequest {
  id: string;
}

export class BuscarDisciplinaUseCase {
  constructor(private disciplinasRepository: DisciplinasRepository) {}

  async execute({ id }: BuscarDisciplinaUseCaseRequest) {
    const disciplina = await this.disciplinasRepository.findById(id);

    if (!disciplina) {
      throw new RecursoNaoEncontradoError();
    }

    return { disciplina };
  }
}
