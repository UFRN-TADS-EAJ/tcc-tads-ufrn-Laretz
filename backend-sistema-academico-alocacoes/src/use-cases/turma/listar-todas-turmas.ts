import { TurmasRepository } from "@/repositories/turmas-repository";
import { Turma } from "@prisma/client";

interface ListarTodasTurmasUseCaseResponse {
  turmas: Turma[];
}

export class ListarTodasTurmasUseCase {
  constructor(private turmasRepository: TurmasRepository) {}

  async execute(): Promise<ListarTodasTurmasUseCaseResponse> {
    const turmas = await this.turmasRepository.findAll();

    return {
      turmas,
    };
  }
}
