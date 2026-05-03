import { PrediosRepository } from "@/repositories/predios-repository";
import { RecursoNaoEncontradoError } from "@/use-cases/errors/recurso-nao-encontrado";

interface BuscarPredioUseCaseRequest {
  id: string;
}

export class BuscarPredioUseCase {
  constructor(private prediosRepository: PrediosRepository) {}

  async execute({ id }: BuscarPredioUseCaseRequest) {
    const predio = await this.prediosRepository.findByIdWithSalasBasico(id);

    if (!predio) {
      throw new RecursoNaoEncontradoError();
    }

    return { predio };
  }
}
