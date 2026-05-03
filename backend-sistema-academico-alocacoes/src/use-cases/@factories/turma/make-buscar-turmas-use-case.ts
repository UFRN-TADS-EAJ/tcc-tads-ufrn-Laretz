import { PrismaTurmasRepository } from "@/repositories/prisma-repositories/prisma-turmas-repository";
import { BuscarTurmasUseCase } from "@/use-cases/turma/buscar-turmas";

export function makeBuscarTurmasUseCase() {
    const turmasRepository = new PrismaTurmasRepository();
    const buscarTurmasUseCase = new BuscarTurmasUseCase(turmasRepository);
    
    return buscarTurmasUseCase;
}
