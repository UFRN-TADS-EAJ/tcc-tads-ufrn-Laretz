import { PrediosRepository } from "@/repositories/predios-repository";
import { PossuiDependenciasError } from "@/use-cases/errors/possui-dependencias";
import { RecursoNaoEncontradoError } from "@/use-cases/errors/recurso-nao-encontrado";

interface ExcluirPredioUseCaseRequest {
  id: string;
}

export class ExcluirPredioUseCase {
  constructor(private prediosRepository: PrediosRepository) {}

  async execute({ id }: ExcluirPredioUseCaseRequest) {
    const predioExistente = await this.prediosRepository.findByIdWithSalasBasico(id);

    if (!predioExistente) {
      throw new RecursoNaoEncontradoError();
    }

    if (predioExistente.salas.length > 0) {
      throw new PossuiDependenciasError("prédio");
    }

    await this.prediosRepository.delete(id);
  }
}
