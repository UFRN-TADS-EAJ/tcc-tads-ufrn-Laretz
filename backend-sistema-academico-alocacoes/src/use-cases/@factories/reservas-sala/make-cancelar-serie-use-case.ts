import { PrismaReservasSalaRepository } from "@/repositories/prisma-repositories/prisma-reservas-sala-repository";
import { CancelarSerieUseCase } from "../../reservas-sala/cancelar-serie";

export function makeCancelarSerieUseCase() {
  const reservasRepository = new PrismaReservasSalaRepository();
  const useCase = new CancelarSerieUseCase(reservasRepository);
  return useCase;
}
