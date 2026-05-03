import { PrismaSalasRepository } from "@/repositories/prisma-repositories/prisma-salas-repository";
import { BuscarSalaUseCase } from "@/use-cases/sala/buscar-sala";

export function makeBuscarSalaUseCase() {
    const salasRepository = new PrismaSalasRepository();
    const buscarSalaUseCase = new BuscarSalaUseCase(salasRepository);
    
    return buscarSalaUseCase;
}
