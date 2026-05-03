import { PrismaReservasSalaRepository } from "@/repositories/prisma-repositories/prisma-reservas-sala-repository";
import { CancelarReservaUseCase } from "../../reservas-sala/cancelar-reserva";

export function makeCancelarReservaUseCase() {
  const reservasRepository = new PrismaReservasSalaRepository();
  const useCase = new CancelarReservaUseCase(reservasRepository);
  return useCase;
}
