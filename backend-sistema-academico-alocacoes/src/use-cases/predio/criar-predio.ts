import { PrediosRepository } from "@/repositories/predios-repository";
import { CodigoJaExisteError } from "@/use-cases/errors/codigo-ja-existe";

interface CriarPredioUseCaseRequest {
  codigo: string;
  nome: string;
  descricao?: string;
}

export class CriarPredioUseCase {
  constructor(private prediosRepository: PrediosRepository) {}

  async execute({ codigo, nome, descricao }: CriarPredioUseCaseRequest) {
    const predioExistente = await this.prediosRepository.findByCodigo(codigo);

    if (predioExistente) {
      throw new CodigoJaExisteError("prédio");
    }

    const predio = await this.prediosRepository.create({
      codigo,
      nome,
      descricao: descricao ?? null,
    });

    return { predio };
  }
}
