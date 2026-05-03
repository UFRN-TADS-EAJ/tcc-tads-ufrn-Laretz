import { UserCursoRepository } from "@/repositories/user-curso-repository";
import { RecursoNaoEncontradoError } from "../errors/recurso-nao-encontrado";

interface DesvincularUserCursoUseCaseRequest {
  id_user: string;
  id_curso: string;
}

interface DesvincularUserCursoUseCaseResponse {
  success: boolean;
}

export class DesvincularUserCursoUseCase {
  constructor(
    private userCursoRepository: UserCursoRepository
  ) {}

  async execute({
    id_user,
    id_curso,
  }: DesvincularUserCursoUseCaseRequest): Promise<DesvincularUserCursoUseCaseResponse> {
    // Verificar se o vínculo existe e está ativo
    const vinculo =
      await this.userCursoRepository.findByUserAndCurso(
        id_user,
        id_curso
      );

    if (!vinculo || !vinculo.ativo) {
      throw new RecursoNaoEncontradoError();
    }

    // Desativar o vínculo (soft delete)
    await this.userCursoRepository.update(vinculo.id, {
      ativo: false,
    });

    return { success: true };
  }
}