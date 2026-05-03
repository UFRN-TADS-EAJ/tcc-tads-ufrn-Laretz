import { PrismaReservasSalaRepository } from "@/repositories/prisma-repositories/prisma-reservas-sala-repository";
import { PrismaPeriodosLetivosRepository } from "@/repositories/prisma-repositories/prisma-periodos-letivos-repository";
import { BuscarReservasUseCase } from "../../reservas-sala/buscar-reservas";

export function makeBuscarReservasUseCase() {
  const reservasRepository = new PrismaReservasSalaRepository();
  const periodosRepository = new PrismaPeriodosLetivosRepository();
  const useCase = new BuscarReservasUseCase(
    reservasRepository,
    periodosRepository,
  );
  return useCase;
}
