import { PrismaSalasRepository } from "@/repositories/prisma-repositories/prisma-salas-repository";
import { BuscarSalasPorPredioUseCase } from "../../sala/buscar-salas-por-predio";

export function makeBuscarSalasPorPredioUseCase() {
    const salasRepository = new PrismaSalasRepository();
    const buscarSalasPorPredioUseCase = new BuscarSalasPorPredioUseCase(salasRepository);

    return buscarSalasPorPredioUseCase;
}