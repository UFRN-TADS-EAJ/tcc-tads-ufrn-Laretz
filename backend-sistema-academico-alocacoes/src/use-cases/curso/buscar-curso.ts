import { CursosRepository } from "../../repositories/cursos-repository";
import { RecursoNaoEncontradoError } from "../errors/recurso-nao-encontrado";

interface BuscarCursoUseCaseRequest {
  id: string;
}

export class BuscarCursoUseCase {
  constructor(private cursosRepository: CursosRepository) {}

  async execute({ id }: BuscarCursoUseCaseRequest) {
    const curso = await this.cursosRepository.findById(id);

    if (!curso) {
      throw new RecursoNaoEncontradoError();
    }

    return { curso };
  }
}