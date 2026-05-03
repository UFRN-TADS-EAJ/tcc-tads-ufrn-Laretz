import { PrismaSalasRepository } from "@/repositories/prisma-repositories/prisma-salas-repository";
import { AtualizarSalaUseCase } from "@/use-cases/sala/atualizar-sala";

export function makeAtualizarSalaUseCase() {
    const salasRepository = new PrismaSalasRepository();
    const atualizarSalaUseCase = new AtualizarSalaUseCase(salasRepository);
    
    return atualizarSalaUseCase;
}
