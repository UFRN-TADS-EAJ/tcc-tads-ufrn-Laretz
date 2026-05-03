import { PrediosRepository } from "@/repositories/predios-repository";
import { CodigoJaExisteError } from "@/use-cases/errors/codigo-ja-existe";
import { RecursoNaoEncontradoError } from "@/use-cases/errors/recurso-nao-encontrado";

interface AtualizarPredioUseCaseRequest {
  id: string;
  codigo?: string;
  nome?: string;
  descricao?: string;
}

export class AtualizarPredioUseCase {
  constructor(private prediosRepository: PrediosRepository) {}

  async execute({ id, codigo, nome, descricao }: AtualizarPredioUseCaseRequest) {
    const predioExistente = await this.prediosRepository.findByIdWithSalasBasico(id);

    if (!predioExistente) {
      throw new RecursoNaoEncontradoError();
    }

    if (codigo && codigo !== predioExistente.codigo) {
      const predioComMesmoCodigo = await this.prediosRepository.findByCodigo(codigo);
      if (predioComMesmoCodigo) {
        throw new CodigoJaExisteError("prédio");
      }
    }

    const predio = await this.prediosRepository.updateWithSalasResumo(id, {
      ...(codigo && { codigo }),
      ...(nome && { nome }),
      ...(descricao !== undefined && { descricao: descricao ?? null }),
    });

    return { predio };
  }
}
