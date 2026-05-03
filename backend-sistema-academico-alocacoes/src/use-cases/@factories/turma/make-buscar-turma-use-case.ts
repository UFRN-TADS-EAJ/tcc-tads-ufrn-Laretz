import { PrismaTurmasRepository } from "@/repositories/prisma-repositories/prisma-turmas-repository";
import { BuscarTurmaUseCase } from "@/use-cases/turma/buscar-turma";

export function makeBuscarTurmaUseCase() {
    const turmasRepository = new PrismaTurmasRepository();
    const buscarTurmaUseCase = new BuscarTurmaUseCase(turmasRepository);
    
    return buscarTurmaUseCase;
}
