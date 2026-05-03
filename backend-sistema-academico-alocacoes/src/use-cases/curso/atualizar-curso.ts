import { CursosRepository } from "../../repositories/cursos-repository";
import { RecursoNaoEncontradoError } from "../errors/recurso-nao-encontrado";

interface AtualizarCursoUseCaseRequest {
  id: string;
  nome: string | undefined;
  turno: "MATUTINO" | "VESPERTINO" | "NOTURNO" | "INTEGRAL" | undefined;
}

export class AtualizarCursoUseCase {
  constructor(private cursosRepository: CursosRepository) {}

  async execute({ id, nome, turno }: AtualizarCursoUseCaseRequest) {
    const cursoExiste = await this.cursosRepository.findById(id);

    if (!cursoExiste) {
      throw new RecursoNaoEncontradoError();
    }

    const updateData: Partial<{
      nome: string;
      turno: "MATUTINO" | "VESPERTINO" | "NOTURNO" | "INTEGRAL";
    }> = {};
    if (nome !== undefined) updateData.nome = nome;
    if (turno !== undefined) updateData.turno = turno;
    const curso = await this.cursosRepository.update(id, updateData);

    return { curso };
  }
}
