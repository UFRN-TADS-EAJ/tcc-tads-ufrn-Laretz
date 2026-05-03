import { ReservasSalaRepository } from "@/repositories/reservas-sala-repository";
import { RecursoNaoEncontradoError } from "../errors/recurso-nao-encontrado";

interface CancelarSerieUseCaseRequest {
  seriesId: string;
}

interface CancelarSerieUseCaseResponse {
  message: string;
  count: number;
}

export class CancelarSerieUseCase {
  constructor(private reservasRepository: ReservasSalaRepository) {}

  async execute({
    seriesId,
  }: CancelarSerieUseCaseRequest): Promise<CancelarSerieUseCaseResponse> {
    
    const count = await this.reservasRepository.updateSeriesStatus(seriesId, "CANCELADA");

    if (count === 0) {
      throw new RecursoNaoEncontradoError();
    }

    return {
      message: `Canceladas ${count} reservas da série ${seriesId}`,
      count,
    };
  }
}
