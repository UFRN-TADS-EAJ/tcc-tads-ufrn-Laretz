import { ReservaSala } from "@prisma/client";
import { ReservasSalaRepository } from "@/repositories/reservas-sala-repository";
import { RecursoNaoEncontradoError } from "../errors/recurso-nao-encontrado";

interface CancelarReservaUseCaseRequest {
  id: string;
}

interface CancelarReservaUseCaseResponse {
  reserva: ReservaSala;
}

export class CancelarReservaUseCase {
  constructor(private reservasRepository: ReservasSalaRepository) {}

  async execute({
    id,
  }: CancelarReservaUseCaseRequest): Promise<CancelarReservaUseCaseResponse> {
    const reservaExistente = await this.reservasRepository.findById(id);

    if (!reservaExistente) {
      throw new RecursoNaoEncontradoError();
    }

    const reserva = await this.reservasRepository.updateStatus(id, "CANCELADA");

    return { reserva };
  }
}
