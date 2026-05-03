import { PrismaSalasRepository } from "@/repositories/prisma-repositories/prisma-salas-repository";
import { BuscarSalasUseCase } from "@/use-cases/sala/buscar-salas";

export function makeBuscarSalasUseCase() {
    const salasRepository = new PrismaSalasRepository();
    const buscarSalasUseCase = new BuscarSalasUseCase(salasRepository);
    
    return buscarSalasUseCase;
}
