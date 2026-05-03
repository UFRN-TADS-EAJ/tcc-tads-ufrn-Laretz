import { ProfessorDisciplinaRepository } from "@/repositories/professor-disciplina-repository";
import type { SuccessResponse } from "@/schemas/professor-disciplina";
import { RecursoNaoEncontradoError } from "../errors/recurso-nao-encontrado";

interface DesvincularProfessorDisciplinaUseCaseRequest {
  id_user: string;
  id_disciplina: string;
}

export class DesvincularProfessorDisciplinaUseCase {
  constructor(
    private professorDisciplinaRepository: ProfessorDisciplinaRepository
  ) {}

  async execute({
    id_user,
    id_disciplina,
  }: DesvincularProfessorDisciplinaUseCaseRequest): Promise<SuccessResponse> {
    // Verificar se o vínculo existe e está ativo
    const vinculo =
      await this.professorDisciplinaRepository.findByUserAndDisciplina(
        id_user,
        id_disciplina
      );

    if (!vinculo || !vinculo.ativo) {
      throw new RecursoNaoEncontradoError();
    }

    // Desativar o vínculo (soft delete)
    await this.professorDisciplinaRepository.update(vinculo.id, {
      ativo: false,
    });

    return { success: true };
  }
}
