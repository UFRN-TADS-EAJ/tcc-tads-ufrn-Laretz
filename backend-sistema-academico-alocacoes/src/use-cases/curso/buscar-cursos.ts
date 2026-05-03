import { CursosRepository } from "../../repositories/cursos-repository";

export class BuscarCursosUseCase {
  constructor(private cursosRepository: CursosRepository) {}

  async execute() {
    const cursos = await this.cursosRepository.findMany();

    return { cursos };
  }
}