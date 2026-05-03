import { PrismaSalasRepository } from "@/repositories/prisma-repositories/prisma-salas-repository";
import { ExcluirSalaUseCase } from "@/use-cases/sala/excluir-sala";

export function makeExcluirSalaUseCase() {
    const salasRepository = new PrismaSalasRepository();
    const excluirSalaUseCase = new ExcluirSalaUseCase(salasRepository);
    
    return excluirSalaUseCase;
}
