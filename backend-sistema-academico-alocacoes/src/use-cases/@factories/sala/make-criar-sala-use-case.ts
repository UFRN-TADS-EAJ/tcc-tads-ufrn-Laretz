import { PrismaSalasRepository } from "@/repositories/prisma-repositories/prisma-salas-repository";
import { CriarSalaUseCase } from "@/use-cases/sala/criar-sala";

export function makeCriarSalaUseCase() {
    const salasRepository = new PrismaSalasRepository();
    const criarSalaUseCase = new CriarSalaUseCase(salasRepository);
    
    return criarSalaUseCase;
}
